// Playable character sheets (11.6 roster; Phase 27 from-scratch procedural art;
// 33.4.2 = packed itch sprites per PLAN-FORK §1 — D-F2: frames only, no behaviour).
//
// All ten sheets source frames from assets/itch/sprites.json via art/load.js
// (all sheets viewed before wiring; pack→slot choices per PLAN-FORK §1):
//   mage     DeepDive Humanoid II "Elf Enchanter"        ranger   "Elf Sharpshooter"
//   warden   Humanoid II "Adventurous Adolescent"        swash    Humanoid "halfling rogue"
//   baseball Humanoid II "Boisterous Youth" + drawn bat/helmet props (no uniform art exists)
//   werewolf Aaron Sprites generation-0 #010 (static battler → trim + bob, no run art)
//   golem    DeepDive Magical "earth elemental"          gunslinger Humanoid "halfling slinger"
//   ghost    DeepDive Undead "Unraveling Crawler" + CFG.ghostColors paletteSwap ladder (D62)
//   toad     vryell "Tiny Enemies Vol.1" Toad_16x16.png, green+amber band (row 5:
//            idle cols 0–3, walk cols 4–7; pack ships no shadows — our shadowR path stands)
// DeepDive basics ship 4-frame idle rows: idle[2] = frames 0–1, run[4] = all four with a
// ±1px alternating vertical bob baked in at composite time (BOB below; no gameplay change).
//
// CONTRACT (asserted in tools/test-boot.mjs + per-slot in tools/test-art.mjs): footprints
// + shadowR byte-stable, `idle[2]` + `run[4]` of distinct canvases. Packed art faces the
// viewer with feet on the canvas bottom (player.js draws at (-w/2,-h) and flips for left);
// no path-drawing builders remain (all deleted per 33.4.2 close-out).

import { makeCanvas, roundRectPath } from './base.js';
import { sliceStrip, paletteSwap, lumaTintMap, loadPack, onArtReady } from './load.js';
import { TAU } from '../utils/math.js';

// build-time gradient builders (never per frame — perf guardrail)
const lg = (g, x0, y0, x1, y1, stops) => {
  const gr = g.createLinearGradient(x0, y0, x1, y1);
  for (const [t, col] of stops) gr.addColorStop(t, col);
  return gr;
};
const dot = (g, x, y, r, fill) => { g.fillStyle = fill; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); };
const ell = (g, x, y, rx, ry, rot, fill) => { g.fillStyle = fill; g.beginPath(); g.ellipse(x, y, rx, ry, rot || 0, 0, TAU); g.fill(); };

// ── packed-sprite sheets (33.4.2) ───────────────────────────────────────────────
// Sources + geometry live in assets/itch/sprites.json (rule 7); this section only
// slices, scales (nearest-neighbour), tints (lumaTintMap — the ghost/elite ladder lives
// in load.js so both art modules share it), and composites into the legacy footprints.
const BOB = [-1, 1, -1, 1]; // the ±1px alternating run bob baked into frames (task spec)
// Node test stubs have no XHR/Image, so the packed path never runs there; a blank sheet
// with the exact footprint satisfies boot (counts/footprints only — test-art checks the
// real art). Footprints mirror the manifest `sheet` blocks; test-art pins both to the
// engine table, so the copies cannot drift unnoticed.
const NODE_FALLBACK_SHEET = {
  mage: [56, 64, 12], warden: [58, 66, 13], ranger: [52, 60, 11], swash: [54, 62, 12],
  baseball: [56, 64, 12], werewolf: [54, 62, 11], golem: [62, 68, 14], gunslinger: [54, 64, 11],
  toad: [58, 60, 13], ghost: [56, 64, 12],
};

// The youth pack has no uniform or bat, so the Slugger's two identity props stay drawn:
// bat on the back shoulder + #f06543 helmet/visor (same shapes as the Phase-27 original,
// re-anchored from the frame's head metrics — `render.head` [cx, top] in source-cell px).
function sluggerOverlay(g, cx, topY) {
  g.fillStyle = lg(g, cx - 11, topY - 5, cx + 11, topY + 8, [[0, '#f06543'], [1, '#b03f24']]);
  g.beginPath();
  g.moveTo(cx - 11, topY + 7); g.quadraticCurveTo(cx - 10.6, topY - 5.4, cx, topY - 5.8);
  g.quadraticCurveTo(cx + 10.6, topY - 5.4, cx + 11, topY + 6);
  g.quadraticCurveTo(cx + 3, topY + 3.4, cx - 11, topY + 7);
  g.closePath(); g.fill();
  g.fillStyle = '#b03f24'; ell(g, cx + 10, topY + 7.6, 2.6, 3.6, 0.2, '#b03f24'); // ear flap
  g.fillStyle = lg(g, cx + 5, topY + 1.6, cx + 16, topY + 4.4, [[0, '#b03f24'], [1, '#8f2f18']]); // visor peak
  g.beginPath(); g.moveTo(cx + 5, topY + 1.8); g.quadraticCurveTo(cx + 14.4, topY + 0.6, cx + 15.8, topY + 3.8);
  g.quadraticCurveTo(cx + 10, topY + 4.6, cx + 5, topY + 3.8); g.closePath(); g.fill();
  g.save();
  g.translate(cx - 8, topY + 25);
  g.rotate(-1.02);
  g.fillStyle = lg(g, 0, 0, 0, -30, [[0, '#6d4a2b'], [0.5, '#c08a52'], [1, '#e6bd90']]);
  roundRectPath(g, -2.4, -34, 4.8, 34, 2.2); g.fill();
  roundRectPath(g, -3.6, -34, 7.2, 10, 3.2); g.fill(); // barrel swell
  g.fillStyle = '#3d2a18'; roundRectPath(g, -1.8, -6, 3.6, 7, 1.4); g.fill(); // grip
  dot(g, 0, 1.6, 2.4, '#3d2a18'); // knob
  g.restore();
}

// Build one packed sheet with the exact legacy contract {w,h,shadowR,idle[2],run[4]}.
// The canvases are returned immediately (correct footprints; blank until decode settles
// — measured impossible to decode synchronously in a document script) and painted
// IN PLACE by onArtReady: idle/run frames stay feet-anchored (art bottom = sheet
// bottom = the player's feet line), never swapped as objects (player.js holds refs).
function packedSheet(pk, key, ghostColor) {
  const entry = pk.manifest.sprites['hero.' + key];
  const { w, h, shadowR } = entry.sheet;
  const mk = () => makeCanvas(w, h);
  const sheet = { w, h, shadowR, idle: [mk(), mk()], run: [mk(), mk(), mk(), mk()] };
  onArtReady(pk, () => {
    let art = sliceStrip(pk.images, entry, 'idle');
    if (entry.recolour === 'seat') {
      const map = lumaTintMap(art[0], ghostColor || '#ff4b4b');
      art = art.map((f) => paletteSwap(f, map));
    }
    const [tx, ty, tw, th] = entry.render.trim || [0, 0, entry.frame.w, entry.frame.h];
    const s = entry.render.artH / th;
    const dw = Math.round(tw * s), dh = Math.round(th * s);
    const px = Math.round((w - dw) / 2), py = h - dh;
    const paste = (c, f, dy) => {
      const g = c.getContext('2d');
      g.clearRect(0, 0, w, h);
      g.imageSmoothingEnabled = false;
      g.drawImage(f, tx, ty, tw, th, px, py + dy, dw, dh);
      if (entry.render.head) sluggerOverlay(g, px + entry.render.head[0] * s, py + entry.render.head[1] * s);
    };
    const idleIdx = art.length >= 2 ? [0, 1] : [0, 0]; // static battlers: two distinct canvases, no bob
    // toad's pack ships a real walk row (cols 4–7): a `walk` strip feeds run[4]; other
    // slots (4-frame idle only) keep deriving run from the same frames + BOB.
    const runArt = entry.strips.walk ? sliceStrip(pk.images, entry, 'walk') : art;
    idleIdx.forEach((i, j) => paste(sheet.idle[j], art[i], 0));
    [0, 1, 2, 3].forEach((i, j) => paste(sheet.run[j], runArt[i % runArt.length], BOB[j]));
  });
  return sheet;
}

// Node-stub sheet: correct footprint, no art (pixels are unobservable in the stub env).
const blankSheet = ([w, h, shadowR]) => {
  const mk = () => makeCanvas(w, h);
  return { w, h, shadowR, idle: [mk(), mk()], run: [mk(), mk(), mk(), mk()] };
}

// D62 (11.6.4): per-seat ghost sheet without rebuilding the full roster.
export function buildGhost(color) {
  const gc = color || '#ff4b4b';
  const pk = loadPack();
  return pk ? packedSheet(pk, 'ghost', gc) : blankSheet(NODE_FALLBACK_SHEET.ghost);
}

export function buildRoster(ghostColor) {
  const pk = loadPack();
  const packed = (k) => (pk ? packedSheet(pk, k) : blankSheet(NODE_FALLBACK_SHEET[k]));
  return {
    mage: packed('mage'),
    warden: packed('warden'),
    ranger: packed('ranger'),
    swash: packed('swash'),
    baseball: packed('baseball'),
    werewolf: packed('werewolf'),
    golem: packed('golem'),
    toad: packed('toad'),
    gunslinger: packed('gunslinger'),
    ghost: buildGhost(ghostColor),
  };
}
