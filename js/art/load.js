// Packed-sprite loader (33.4.1): turns `assets/itch/sprites.json` manifest entries into
// per-frame canvases the existing build*() contracts can hand to the engine unchanged.
// Why this shape: gameplay code only ever consumes {w,h,shadowR,frames[]} (D-F2), so the
// swap stays inside art modules; this file supplies frames, never behaviour.
// Node-safety (rule 3): nothing runs at import — fetch/Image/canvas are used only when a
// browser caller invokes these; tools/check.mjs can still import the module clean.

import { makeCanvas } from './base.js';

// Fetch + parse the sprite manifest. Path is served by tools/serve.mjs (application/json).
export async function loadManifest(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`sprite manifest ${path}: HTTP ${res.status}`);
  return res.json();
}

// Pack folder names contain spaces — encode per path segment so fetch can resolve them.
function encodeSrc(src) {
  return src.split('/').map(encodeURIComponent).join('/');
}

// Every image src a manifest references, deduped (many entries share one sheet).
function manifestSrcs(manifest) {
  const sprites = manifest.sprites || {};
  const srcs = new Set();
  for (const entry of Object.values(sprites)) {
    for (const strip of Object.values(entry.strips || {})) srcs.add(strip.src);
  }
  return srcs;
}

// Decode every image a manifest references into url→HTMLImageElement. Fails fast with
// the missing src named.
export async function preloadImages(manifest) {
  const srcs = manifestSrcs(manifest);
  const images = new Map();
  await Promise.all([...srcs].map(async (src) => {
    const img = new Image();
    img.decoding = 'sync';
    img.src = encodeSrc(src);
    await new Promise((ok, bad) => { img.onload = ok; img.onerror = () => bad(new Error('image failed: ' + src)); });
    images.set(src, img);
  }));
  return images;
}

// Cut one frame strip of a sheet into canvases. strip = {src, from, count} +
// frame = {w,h} (entry-level) + optional sx/sy/scale. Nearest-neighbour: pixel art
// is scaled by integer factors only (matches the DPR-once rule in Style docs).
export function sliceStrip(images, entry, stripName) {
  const strip = entry.strips[stripName];
  if (!strip) throw new Error('missing strip: ' + stripName);
  const img = images.get(strip.src);
  if (!img) throw new Error('not preloaded: ' + strip.src);
  const { w: fw, h: fh } = entry.frame;
  const scale = strip.scale || 1;
  const out = [];
  for (let i = 0; i < strip.count; i++) {
    const c = makeCanvas(fw * scale, fh * scale);
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(img, (strip.sx || 0) + ((strip.from || 0) + i) * fw, strip.sy || 0, fw, fh, 0, 0, fw * scale, fh * scale);
    out.push(c);
  }
  return out;
}

// Sync loader for the manifest (text GET — legal for sync XHR). Why sync: the engine
// builds its defs inside `new Game(...)` in a single tick (core/game.js) and D-F2
// freezes call sites, so manifest resolution happens without an await boundary; the
// IMAGES themselves then load asynchronously (see loadPack — measured: synchronous
// image DECODE is impossible from a document script, so art modules hand out real
// canvases immediately and repaint them in place once pixels exist).
// Node: no XMLHttpRequest at all → loadManifestSync returns null, which the art
// modules treat as "packed art unavailable in this environment" (test-art validates the
// manifest from disk instead).
export function loadManifestSync(path) {
  if (typeof XMLHttpRequest !== 'function') return null;
  const x = new XMLHttpRequest();
  x.open('GET', path, false);
  x.send();
  if (x.status !== 200) throw new Error(`sprite manifest ${path}: HTTP ${x.status}`);
  return JSON.parse(x.responseText);
}

// Per-pixel hex→hex remap for recolours: ghost seat tints (D62), elite tell, and the
// per-level palette guest pass. Only exact source colours change; alpha untouched.
// map keys/values are '#rrggbb'.
export function paletteSwap(srcCanvas, map) {
  const c = makeCanvas(srcCanvas.width, srcCanvas.height);
  const g = c.getContext('2d');
  g.drawImage(srcCanvas, 0, 0);
  if (!Object.keys(map).length) return c;
  const d = g.getImageData(0, 0, c.width, c.height);
  const px = d.data;
  const hex2 = (n) => n.toString(16).padStart(2, '0');
  for (let i = 0; i < px.length; i += 4) {
    if (!px[i + 3]) continue;
    const to = map[('#' + hex2(px[i]) + hex2(px[i + 1]) + hex2(px[i + 2])).toLowerCase()];
    if (to) {
      px[i] = parseInt(to.slice(1, 3), 16);
      px[i + 1] = parseInt(to.slice(3, 5), 16);
      px[i + 2] = parseInt(to.slice(5, 7), 16);
    }
  }
  g.putImageData(d, 0, 0);
  return c;
}

// ── shared tint + pack plumbing (33.4.3) ────────────────────────────────────────
// Luminance-ladder recolour: sample the frame's opaque palette, map each colour by
// its luma onto a target colour's ladder — near-white → highlight, body → the target,
// near-black outlines kept dark. Moved here from heroes.js (33.4.2 ghost path) so the
// elite gold skin (characters.js) and the pack-coat variants reuse one mechanism.
export const lumaOf = (hex) => { const [r, gg, b] = rgbOf(hex); return (0.299 * r + 0.587 * gg + 0.114 * b) / 255; };
function rgbOf(hex) { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function hexOf([r, gg, b]) { return '#' + [r, gg, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join(''); }
function shade(hex, t) { const a = rgbOf(hex), tgt = t < 0 ? 0 : 255, k = Math.abs(t); return hexOf(a.map((v) => v + (tgt - v) * k)); }

export function lumaTintMap(frame, color) {
  const d = frame.getContext('2d').getImageData(0, 0, frame.width, frame.height);
  const map = {};
  for (let i = 0; i < d.data.length; i += 4) {
    if (!d.data[i + 3]) continue;
    const hex = '#' + [d.data[i], d.data[i + 1], d.data[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
    if (map[hex]) continue;
    const L = lumaOf(hex);
    map[hex] = L < 0.16 ? '#101018' : shade(color, L >= 0.85 ? ((L - 0.85) / 0.15) * 0.4 : ((L - 0.85) / 0.65) * 0.5);
  }
  return map;
}

// One shared, cached load of the whole manifest (heroes.js + characters.js consume the
// same images). Measured 2026-10-26 (headless Chrome, the two failures this replaced):
// sync XHR rejects responseType (InvalidAccessError), and a document script can NEVER
// observe an image decode synchronously (data-URL Images stay complete=false until the
// event loop turns). So images load through ordinary async <img> requests; ready flips
// when they all settle. Art modules hand out real canvases immediately — correct
// footprints, briefly blank — and repaint those SAME canvases via onArtReady, so the
// engine's {w,h,shadowR,frames[]} contract never sees a swap of objects.
// Node test stubs have no XHR/Image → null ("packed art unavailable": blank sheets with
// the exact footprints; test-art validates the data from disk).
let pack; // undefined = unresolved · null = unavailable
export function loadPack() {
  if (pack !== undefined) return pack;
  if (typeof XMLHttpRequest !== 'function' || typeof Image !== 'function') { pack = null; return pack; }
  const manifest = loadManifestSync('assets/itch/sprites.json');
  const p = { manifest, images: new Map(), ready: false, waiters: [] };
  const srcs = [...manifestSrcs(manifest)];
  let settled = 0, failed = null;
  const settle = () => {
    if (settled < srcs.length || p.ready) return;
    if (failed) console.error('sprite failed: ' + failed + ' (that art stays blank — test-art holds the on-disk truth)');
    p.ready = true;
    for (const w of p.waiters.splice(0)) w();
  };
  for (const src of srcs) {
    const img = new Image();
    img.decoding = 'sync';
    p.images.set(src, img);
    img.addEventListener('load', () => { settled++; settle(); });
    img.addEventListener('error', () => { failed = failed || src; settled++; settle(); });
    img.src = encodeSrc(src);
  }
  if (!srcs.length) settle();
  pack = p;
  return p;
}

// Run fn once packed pixels exist (immediately if already settled). Repaints mutate
// the canvases handed out earlier — never replace them: the engine holds references
// (enemies.js setDefs bakes flash copies from the live frame pixels).
export function onArtReady(pk, fn) { if (pk.ready) fn(); else pk.waiters.push(fn); }
