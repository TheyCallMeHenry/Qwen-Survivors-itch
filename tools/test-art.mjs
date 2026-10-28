#!/usr/bin/env node
// 33.4.1/33.4.2/33.4.3 art gate: validate assets/itch/sprites.json against the files on
// disk — entry shape, src existence, PNG IHDR geometry (a strip's frames must physically
// fit the sheet) — plus per-slot hero asserts (33.4.2) and per-slot ENEMY asserts
// (33.4.3): engine footprint shape + packed frame count (or strip+bob derivation) + the
// right-facing contract declaration per enemy key, PLUS a source-PIXEL facing
// measurement for quadruped profile silhouettes (added after phone-playtest DEFECT B1:
// the declaration check alone passed a left-facing wolf — see the probe section; 33.4.8:
// the probe measures the rect the bake actually uses — strip origin + trim — so sheet-row
// sources like the Dorotabō walk row are probeable too), the
// elite recolour marker against the
// palette block, and the wolfpack companion block. 33.4.4 adds BOSS asserts (footprint
// mirrors the engine's procedural tables, no elite marker, guest-dialect downscale ≤2×,
// render.flip for left-facing sources) and level-SKIN asserts (footprint identical to
// the base slot + the same elite marker). 33.4.8 extends both tables to the m03 sea set
// + the packed shark boss, adds weather-flake (fx.*) asserts, and widens the facing
// probes to the two m03 sources that measure cleanly. Canvas itself is NOT exercised
// (browser-side); this test proves the data pipeline can never ask the renderer for a
// bad rect, and that the manifest footprints equal the engine's required ones.
import { readFileSync, existsSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let fails = 0;
const fail = (msg) => { fails++; console.error('FAIL ' + msg); };

// Minimal PNG reader: IHDR width/height are the first two big-endian u32 after the header.
function pngSize(file) {
  const buf = readFileSync(file);
  if (buf.slice(0, 8).toString('hex') !== '89504e470d0a1a0a') return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

const mfPath = join(root, 'assets/itch/sprites.json');
const mf = JSON.parse(readFileSync(mfPath, 'utf8'));
if (mf['$schema'] !== 'qsurv.sprites.v0') fail('unknown schema: ' + mf['$schema']);

const sprites = mf.sprites || {};
let checked = 0;
for (const [slot, entry] of Object.entries(sprites)) {
  checked++;
  const fw = entry.frame?.w, fh = entry.frame?.h;
  if (!Number.isInteger(fw) || !Number.isInteger(fh) || fw < 1 || fh < 1) { fail(slot + ': bad frame size'); continue; }
  const strips = entry.strips || {};
  if (!Object.keys(strips).length) { fail(slot + ': no strips'); continue; }
  for (const [name, s] of Object.entries(strips)) {
    if (!Number.isInteger(s.count) || s.count < 1) { fail(`${slot}.${name}: bad count`); continue; }
    const file = join(root, s.src);
    if (!existsSync(file)) { fail(`${slot}.${name}: missing file ${s.src}`); continue; }
    const size = pngSize(file);
    if (!size) { fail(`${slot}.${name}: not a PNG: ${s.src}`); continue; }
    const need = (s.sx || 0) + ((s.from || 0) + s.count) * fw;
    if (need > size.w || (s.sy || 0) + fh > size.h) {
      fail(`${slot}.${name}: strip needs ${need}x${(s.sy || 0) + fh}, sheet is ${size.w}x${size.h}`);
      continue;
    }
    console.log(`ok   ${slot}.${name}  ${s.count}x${fw}x${fh} from ${s.src} [${size.w}x${size.h}]`);
  }
}
// 33.4.2 per-slot hero asserts: footprint shape (same table test-boot 26.3 enforces at
// build time) + packed idle frame count + render sanity. Heroes without an entry fail.
const HERO = {
  mage: { sheet: [56, 64, 12], frames: 4 },
  warden: { sheet: [58, 66, 13], frames: 4 },
  ranger: { sheet: [52, 60, 11], frames: 4 },
  swash: { sheet: [54, 62, 12], frames: 4 },
  baseball: { sheet: [56, 64, 12], frames: 4 },
  werewolf: { sheet: [54, 62, 11], frames: 1 }, // static battler — run bob is derived in heroes.js
  golem: { sheet: [62, 68, 14], frames: 4 },
  gunslinger: { sheet: [54, 64, 11], frames: 4 },
  toad: { sheet: [58, 60, 13], frames: 4, walk: 4 }, // vryell pack ships real walk frames (cols 4–7)
  ghost: { sheet: [56, 64, 12], frames: 4, recolour: 'seat' },
};
let heroChecked = 0;
for (const [slot, want] of Object.entries(HERO)) {
  const e = sprites['hero.' + slot];
  if (!e) { fail('hero.' + slot + ': missing manifest entry'); continue; }
  const s = e.sheet || {};
  if (s.w !== want.sheet[0] || s.h !== want.sheet[1] || s.shadowR !== want.sheet[2]) {
    fail(`hero.${slot}: footprint must be ${want.sheet.join('x')}, got ${JSON.stringify(e.sheet)}`); continue;
  }
  if (!e.strips?.idle || e.strips.idle.count !== want.frames) fail(`hero.${slot}: idle strip must carry ${want.frames} frames, got ${e.strips?.idle?.count}`);
  if (want.walk && e.strips?.walk?.count !== want.walk) fail(`hero.${slot}: walk strip must carry ${want.walk} frames, got ${e.strips?.walk?.count}`);
  if (!Number.isFinite(e.render?.artH) || e.render.artH < 8 || e.render.artH > 64) fail(`hero.${slot}: render.artH missing/bogus`);
  if (want.recolour && e.recolour !== want.recolour) fail(`hero.${slot}: recolour must be "${want.recolour}"`);
  if (e.render?.trim) {
    const [x, y, tw, th] = e.render.trim;
    if (![x, y, tw, th].every(Number.isInteger) || x < 0 || y < 0 || tw < 1 || th < 1 || x + tw > e.frame.w || y + th > e.frame.h) {
      fail(`hero.${slot}: trim rect ${JSON.stringify(e.render.trim)} outside ${e.frame.w}x${e.frame.h} source frame`);
    }
  }
  heroChecked++;
  console.log(`ok   hero.${slot}  footprint ${want.sheet.join('/')} · ${want.frames} source frame(s)`);
}
// 33.4.3 per-slot enemy asserts: footprint shape + engine frame count (from the strip,
// or strip+bob derivation when the source is static), the RIGHT-FACING contract (every
// source sheet was viewed before wiring; symmetric front-facing art is flip-invariant
// and still declares 'right'), the elite marker + palette hex, and the pack block.
const ENEMY = {
  rat: { sheet: [30, 26, 8], frames: 1 },
  bat: { sheet: [34, 28, 8], frames: 2 },
  goblin: { sheet: [30, 38, 9], frames: 3 },
  wolf: { sheet: [46, 32, 11], frames: 4 }, // static sheet → bob-derived cycle
  brute: { sheet: [64, 60, 14], frames: 2 },
  cultist: { sheet: [32, 46, 9], frames: 2 },
  // 33.4.8 Higan-only renamed types: same footprint + frame counts as the slots they
  // replace (levels.js m02 weights only) — the swap is art-only (D-F2).
  baku: { sheet: [30, 26, 8], frames: 1 },        // static Nasha still (baked with flip)
  kitsunebi: { sheet: [34, 28, 8], frames: 2 },   // static still + bob cycle
  nue: { sheet: [30, 38, 9], frames: 3 },         // static still + bob cycle (baked with flip)
  dorotabo: { sheet: [64, 60, 14], frames: 2 },   // real walk row from the sheet (east-facing)
  amabie: { sheet: [32, 46, 9], frames: 2 },      // static 16px still + bob cycle
};
const ELITE_HEX = /^#[0-9a-f]{6}$/;
let enemyChecked = 0;
const eliteColor = (mf.palette || {}).eliteColor;
if (!ELITE_HEX.test(eliteColor || '')) fail('palette.eliteColor: missing or not a #rrggbb hex');
for (const [slot, want] of Object.entries(ENEMY)) {
  const e = sprites['enemy.' + slot];
  if (!e) { fail('enemy.' + slot + ': missing manifest entry'); continue; }
  const s = e.sheet || {};
  if (s.w !== want.sheet[0] || s.h !== want.sheet[1] || s.shadowR !== want.sheet[2]) {
    fail(`enemy.${slot}: footprint must be ${want.sheet.join('x')}, got ${JSON.stringify(e.sheet)}`); continue;
  }
  if (e.frames !== want.frames) fail(`enemy.${slot}: engine frames must be ${want.frames}, got ${e.frames}`);
  const st = e.strips?.frames;
  if (!st || !Number.isInteger(st.count) || st.count < 1) { fail(`enemy.${slot}: frames strip missing/empty`); continue; }
  if (st.count > want.frames) fail(`enemy.${slot}: strip ships ${st.count} frames but engine contract is ${want.frames}`);
  if (st.count < want.frames && !(Array.isArray(e.bob) && e.bob.length === want.frames && e.bob.every((v) => Number.isInteger(v) && Math.abs(v) <= 2))) {
    fail(`enemy.${slot}: static strip needs a bob[] of ${want.frames} integer ±2 offsets`);
  }
  if (e.facing !== 'right') fail(`enemy.${slot}: must declare facing "right" (engine flips for left)`);
  if (e.recolour !== 'elite') fail(`enemy.${slot}: elite skin path marker missing (recolour "elite")`);
  if (e.render?.trim) {
    const [x, y, tw, th] = e.render.trim;
    if (![x, y, tw, th].every(Number.isInteger) || x < 0 || y < 0 || tw < 1 || th < 1 || x + tw > e.frame.w || y + th > e.frame.h) {
      fail(`enemy.${slot}: trim rect ${JSON.stringify(e.render.trim)} outside ${e.frame.w}x${e.frame.h} source frame`);
    }
  }
  if (slot === 'wolf') {
    const p = e.pack || {};
    if (p.sheet?.w !== 54 || p.sheet?.h !== 38 || p.sheet?.shadowR !== 13) fail('enemy.wolf.pack: pack footprint must be 54x38/r13');
    if (p.frames !== 4 || !Array.isArray(p.bob) || p.bob.length !== 4) fail('enemy.wolf.pack: 4 bob-baked frames required');
    if (!Number.isFinite(p.render?.artH) || p.render.artH < 8 || p.render.artH > 64) fail('enemy.wolf.pack: render.artH missing/bogus');
  }
  enemyChecked++;
  console.log(`ok   enemy.${slot}  footprint ${want.sheet.join('/')} · ${want.frames} frame(s) · facing right · elite tint`);
}
// 33.4.4 per-slot BOSS asserts: footprints = the exact engine tables (test-boot asserts
// these), 2-frame contract, no elite marker (D105 = non-boss only), facing right —
// a left-facing source must carry render.flip so bakeInto mirrors it into the contract,
// and every guest-dialect source keeps downscale ≤2× (PLAN-FORK §2: content height of
// the trim rect ≤ 2 × render.artH; measured bboxes are baked into the trims).
const BOSS = {
  wraith: { sheet: [92, 112, 20], frames: 2 },
  ryu: { sheet: [96, 112, 20], frames: 2, flip: true },
  // 33.4.8 m03 Great White: Ocean Creatures big-shark cell (eye/fin LEFT-facing — the
  // dorsal fin sits in the probe's top band, so the head-cue measurement is invalid for
  // sharks; the declared flip stands, same class as the ryū row above).
  shark: { sheet: [96, 112, 20], frames: 2, flip: true },
};
let bossChecked = 0;
for (const [slot, want] of Object.entries(BOSS)) {
  const e = sprites['enemy.' + slot];
  if (!e) { fail('enemy.' + slot + ': missing manifest entry'); continue; }
  const s = e.sheet || {};
  if (s.w !== want.sheet[0] || s.h !== want.sheet[1] || s.shadowR !== want.sheet[2]) {
    fail(`enemy.${slot}: boss footprint must be ${want.sheet.join('x')}, got ${JSON.stringify(e.sheet)}`); continue;
  }
  if (e.frames !== want.frames) fail(`enemy.${slot}: engine frames must be ${want.frames}, got ${e.frames}`);
  if (!Array.isArray(e.bob) || e.bob.length !== want.frames || !e.bob.every((v) => Number.isInteger(v) && Math.abs(v) <= 2)) {
    fail(`enemy.${slot}: static boss strip needs a bob[] of ${want.frames} integer ±2 offsets`);
  }
  const st = e.strips?.frames;
  if (!st || st.count !== 1) fail(`enemy.${slot}: boss strip must be 1 static frame (bob cycle), got ${st?.count}`);
  if (e.facing !== 'right') fail(`enemy.${slot}: must declare facing "right" (engine flips for left)`);
  if (!!e.render?.flip !== !!want.flip) fail(`enemy.${slot}: render.flip must be ${!!want.flip} (source facing)`);
  if (e.recolour) fail(`enemy.${slot}: bosses never roll elite — no recolour marker allowed`);
  const [x, y, tw, th] = e.render?.trim || [];
  if (![x, y, tw, th].every(Number.isInteger) || x < 0 || y < 0 || tw < 1 || th < 1 || x + tw > e.frame.w || y + th > e.frame.h) {
    fail(`enemy.${slot}: trim rect ${JSON.stringify(e.render?.trim)} outside ${e.frame.w}x${e.frame.h} source frame`);
  } else if (e.render.artH * 2 < th) {
    fail(`enemy.${slot}: guest-dialect downscale exceeds 2× (content ${th}px → artH ${e.render.artH}px)`);
  }
  bossChecked++;
  console.log(`ok   enemy.${slot}  footprint ${want.sheet.join('/')} · ${want.frames} frame(s) · facing right${want.flip ? ' (baked from left-facing source)' : ''} · no elite skin`);
}
// 33.4.4 level-SKIN asserts: a per-level re-skin slot must keep its base slot's exact
// footprint/frame contract (level-skin swaps are frame-data only, D-F2) + the same
// elite ladder marker, so packed levels cannot drift from the common tables.
// 33.4.8 Drowned City set: same rule per slot — footprints/frames identical to the m01
// base tables; sources (D-F5 viewings in js/art/characters.js): Ocean Creatures grid
// cells + the Underwater Enemies #2 drowned-triton walk row.
const SKIN = {
  'm02.wolf': { sheet: [46, 32, 11], frames: 4 },
  'm03.rat': { sheet: [30, 26, 8], frames: 1 },      // red crab (front-facing → no flip)
  'm03.bat': { sheet: [34, 28, 8], frames: 2 },      // clownfish (right-facing, bob cycle)
  'm03.goblin': { sheet: [30, 38, 9], frames: 3 },   // drowned triton: real walk row (left-facing → flip)
  'm03.wolf': { sheet: [46, 32, 11], frames: 4 },    // manta ray (measured left → flip + bob)
  'm03.brute': { sheet: [64, 60, 14], frames: 2 },   // dolphin (eye LEFT, like the shark → flip)
  'm03.cultist': { sheet: [32, 46, 9], frames: 2 },  // seahorse (snout left → flip, bob)
};
let skinChecked = 0;
for (const [slot, want] of Object.entries(SKIN)) {
  const e = sprites['skin.' + slot];
  if (!e) { fail('skin.' + slot + ': missing manifest entry'); continue; }
  const s = e.sheet || {};
  if (s.w !== want.sheet[0] || s.h !== want.sheet[1] || s.shadowR !== want.sheet[2]) {
    fail(`skin.${slot}: footprint must equal the base slot's ${want.sheet.join('x')}, got ${JSON.stringify(e.sheet)}`); continue;
  }
  if (e.frames !== want.frames) fail(`skin.${slot}: engine frames must be ${want.frames}, got ${e.frames}`);
  if (!Array.isArray(e.bob) || e.bob.length !== want.frames || !e.bob.every((v) => Number.isInteger(v) && Math.abs(v) <= 2)) {
    fail(`skin.${slot}: static strip needs a bob[] of ${want.frames} integer ±2 offsets`);
  }
  const st = e.strips?.frames;
  if (!st || st.count < 1 || st.count > want.frames) fail(`skin.${slot}: frames strip count must be 1..${want.frames}, got ${st?.count}`);
  if (e.facing !== 'right') fail(`skin.${slot}: must declare facing "right" (engine flips for left)`);
  // render.flip correctness for this slot is MEASURED from source pixels in the facing
  // probe section below (DEFECT B1: a declaration-only check passed a left-facing wolf).
  if (e.recolour !== 'elite') fail(`skin.${slot}: elite skin path marker missing (recolour "elite")`);
  const [x, y, tw, th] = e.render?.trim || [];
  if (![x, y, tw, th].every(Number.isInteger) || x < 0 || y < 0 || tw < 1 || th < 1 || x + tw > e.frame.w || y + th > e.frame.h) {
    fail(`skin.${slot}: trim rect ${JSON.stringify(e.render?.trim)} outside ${e.frame.w}x${e.frame.h} source frame`);
  }
  skinChecked++;
  console.log(`ok   skin.${slot}  footprint ${want.sheet.join('/')} · ${want.frames} frame(s) · facing right · elite tint`);
}
// ── source-PIXEL facing probes (DEFECT B1 strengthening, 2026-10-26) ──────────────
// Why the old assert passed a left-facing sheet: it only compared the declared
// `facing` string to "right" — a declaration, never a measurement (the manifest note
// "every source was viewed before wiring" was itself wrong for wolf fb5_003). For a
// quadruped PROFILE silhouette the source facing IS measurable: the head/ears are the
// TOP of the silhouette, so the opaque mass in the top 15% band of the silhouette bbox
// centroids toward the facing side. Rule for every slot listed here: the measured
// verdict must equal (render.flip ? left : right) — i.e. the bake flag matches the
// actual source orientation. The mirrored re-measurement must invert the verdict and
// negate `rel` (the probe demonstrably fires both ways, never "not-inverted"=pass).
// Non-profile art (3/4-view wraith, the ryū mech source) has no such cue and stays on
// the declaration + flip-table asserts in its own section — honest limitation, stated.
function decodeRGBA8(file) {
  const buf = readFileSync(file);
  let pos = 8, w = 0, h = 0, idat = [];
  let bd = 0, ct = 0, il = 0, plte = null, trns = null;
  while (pos + 8 <= buf.length) {
    const len = buf.readUInt32BE(pos), type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IHDR') { w = buf.readUInt32BE(pos + 8); h = buf.readUInt32BE(pos + 12); bd = buf[pos + 16]; ct = buf[pos + 17]; il = buf[pos + 20]; }
    else if (type === 'PLTE') plte = buf.subarray(pos + 8, pos + 8 + len);
    else if (type === 'tRNS') trns = buf.subarray(pos + 8, pos + 8 + len);
    else if (type === 'IDAT') idat.push(buf.subarray(pos + 8, pos + 8 + len));
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  // 33.4.8: palette-colour (ct 3) sheets are also measurable once expanded to RGBA —
  // the Underwater Enemies walk rows are palette PNGs (the skin.m03.goblin probe).
  if (bd !== 8 || il !== 0 || (ct !== 6 && ct !== 3)) return null; // RGBA8 / palette8, non-interlaced
  const raw = inflateSync(Buffer.concat(idat));
  const bpp = ct === 6 ? 4 : 1, px = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    const base = y * (w * bpp + 1), f = raw[base], line = raw.subarray(base + 1, base + 1 + w * bpp);
    for (let x = 0; x < w * bpp; x++) {
      const a = line[x], left = x >= bpp ? px[y * w * bpp + x - bpp] : 0, up = y ? px[(y - 1) * w * bpp + x] : 0, ul = y && x >= bpp ? px[(y - 1) * w * bpp + x - bpp] : 0;
      let v;
      if (f === 0) v = a; else if (f === 1) v = a + left; else if (f === 2) v = a + up;
      else if (f === 3) v = a + ((left + up) >> 1);
      else { const p = left + up - ul, pa = Math.abs(p - left), pb = Math.abs(p - up), pc = Math.abs(p - ul); v = a + (pa <= pb && pa <= pc ? left : pb <= pc ? up : ul); }
      px[y * w * bpp + x] = v & 255;
    }
  }
  if (ct === 3) {
    const out = new Uint8Array(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      const idx = px[i];
      out[i * 4] = plte[idx * 3]; out[i * 4 + 1] = plte[idx * 3 + 1]; out[i * 4 + 2] = plte[idx * 3 + 2];
      out[i * 4 + 3] = trns && idx < trns.length ? trns[idx] : 255;
    }
    return { w, h, px: out };
  }
  return { w, h, px };
}
function measureFacing(img, mirror = false, region = null) {
  const { w, h, px } = img;
  // 33.4.8: measure the rect the bake actually crops (strip origin + render.trim), not
  // the whole file — without a region the old whole-image behaviour is unchanged.
  const [rx0, ry0, rw, rh] = region || [0, 0, w, h];
  const rx1 = rx0 + rw - 1, ry1 = ry0 + rh - 1;
  let x0 = Infinity, x1 = -1, y0 = Infinity, y1 = -1;
  for (let y = ry0; y <= ry1; y++) for (let x = rx0; x <= rx1; x++) if (px[(y * w + x) * 4 + 3] > 32) {
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  if (x1 < 0) return { rel: 0, verdict: 'empty' };
  const bx0 = mirror ? rx0 + rx1 - x1 : x0, bx1 = mirror ? rx0 + rx1 - x0 : x1;
  const cw = x1 - x0 + 1, band = Math.max(1, Math.round((y1 - y0 + 1) * 0.15));
  let m = 0, sx = 0;
  for (let y = y0; y < y0 + band; y++) for (let x = x0; x <= x1; x++) if (px[(y * w + x) * 4 + 3] > 32) {
    m++; sx += mirror ? rx0 + rx1 - x : x;
  }
  const rel = (sx / m - (bx0 + bx1) / 2) / cw;
  return { rel, verdict: Math.abs(rel) < 0.06 ? 'invariant' : rel < 0 ? 'left' : 'right' };
}
// Slots whose baked rect IS a measurable profile silhouette (head = top-band mass).
// baku/nue/ryū-class art is excluded on purpose: its top band is mane/tail, so the cue
// is invalid there — those keep the D-F5 visual review + declaration (same class as the
// ryū row above). A slot may only be listed if its measured verdict equals its truth.
// 33.4.8: the triton (head/hood above the body, stable −0.14 per frame) and the manta
// (cephalic fins = head cue) measure cleanly; the crab is a symmetric front view and the
// shark/dolphin/seahorse top bands are fin/crown — cue invalid, declarations stand.
const PROFILE_SLOTS = ['enemy.wolf', 'skin.m02.wolf', 'enemy.dorotabo', 'skin.m03.goblin', 'skin.m03.wolf'];
let faceChecked = 0;
for (const slot of PROFILE_SLOTS) {
  const e = sprites[slot];
  if (!e) continue; // already failed in its own section
  const img = decodeRGBA8(join(root, e.strips.frames.src));
  if (!img) { fail(`${slot}: facing probe needs an RGBA8 non-interlaced PNG: ${e.strips.frames.src}`); continue; }
  const st = e.strips.frames, [tx, ty, tw, th] = e.render?.trim || [0, 0, e.frame.w, e.frame.h];
  const region = [(st.sx || 0) + (st.from || 0) * e.frame.w + tx, (st.sy || 0) + ty, tw, th];
  const direct = measureFacing(img, false, region), mirrored = measureFacing(img, true, region);
  const flips = (a, b) => (a === 'left' && b === 'right') || (a === 'right' && b === 'left');
  if (!flips(direct.verdict, mirrored.verdict) || Math.abs(direct.rel + mirrored.rel) > 1e-9) {
    fail(`${slot}: facing probe inconclusive (measured ${direct.verdict} rel=${direct.rel.toFixed(3)}, mirror ${mirrored.verdict}) — cannot certify orientation`);
    continue;
  }
  const declared = e.render?.flip ? 'left' : 'right';
  if (direct.verdict !== declared) {
    fail(`${slot}: source measures ${direct.verdict}-facing but declares render.flip=${!!e.render?.flip} → bake would violate the RIGHT-facing contract`);
    continue;
  }
  if (slot === 'enemy.wolf' && e.pack && !e.pack.render?.flip) fail('enemy.wolf.pack: shares the left-facing source strip — pack.render.flip must be true');
  faceChecked++;
  console.log(`ok   ${slot}  source measured ${direct.verdict}-facing → ${e.render?.flip ? 'render.flip bake (contract OK)' : 'no flip (contract OK)'}`);
}
// 33.4.5 tileset asserts: every ground entry must describe the mosaic world.js can blit —
// recipe tile = 256 (CFG.world.tile, tiles are drawn at natural size) and pitch = 16 (the
// packs' native cell pitch) — with base + every scatter reference resolving to an existing
// strip + index (strip-vs-sheet geometry is proven by the generic loop above), and a
// prefill colour for the pre-art-ready frames. Prop entries need a place block; their bake
// targets (the exact decor-contract canvases terrain.js bakes into) are pinned here so a
// future rect change can't silently mis-anchor Y-sort.
const GROUND = ['terrain.ground.m01', 'terrain.ground.m02', 'terrain.ground.m03'];
let terrainChecked = 0;
for (const slot of GROUND) {
  const e = sprites[slot];
  if (!e) { fail(slot + ': missing ground manifest entry'); continue; }
  const rec = e.recipe;
  if (!rec || rec.tile !== 256 || rec.pitch !== 16) { fail(slot + ': recipe must be tile=256 pitch=16'); continue; }
  if (!Number.isInteger(rec.seed) || !Array.isArray(rec.base) || !Array.isArray(rec.scatter) || !rec.scatter.length) { fail(slot + ': recipe incomplete'); continue; }
  if (!/^#[0-9a-f]{6}$/i.test(e.prefill || '')) fail(slot + ': prefill colour missing/malformed');
  const refs = [[rec.base[0], rec.base[1]], ...rec.scatter.map((s) => [s[0], s[1]])];
  let bad = false;
  for (const [sn, i] of refs) {
    const st = e.strips?.[sn];
    if (!st || !Number.isInteger(i) || i < 0 || i >= st.count) { fail(`${slot}: recipe references ${sn}[${i}] outside its strip`); bad = true; }
  }
  for (const s of Object.values(e.strips)) if (s.scale) fail(`${slot}: ground strips must stay native-scale`);
  if (!bad) { terrainChecked++; console.log(`ok   ${slot}  mosaic recipe ${rec.tile}/${rec.pitch}, ${refs.length} floor cells`); }
}
// slot → [bake canvas w,h]; must equal world/levels.js put() dims for that decor key.
const TERRAIN_PROPS = {
  'terrain.pine.m01': [64, 88],
  'terrain.dead.m01': [44, 92],
  'terrain.boulder.m01': [48, 36],
  'terrain.hut.m01': [120, 96],
};
for (const [slot, canvas] of Object.entries(TERRAIN_PROPS)) {
  const e = sprites[slot];
  if (!e) { fail(slot + ': missing prop manifest entry'); continue; }
  if (!e.place?.strip || !e.strips?.[e.place.strip]) { fail(slot + ': place.strip missing'); continue; }
  if (e.place.scale !== undefined && !Number.isInteger(e.place.scale)) fail(`${slot}: place.scale must be an integer`);
  terrainChecked++;
  console.log(`ok   ${slot}  prop cell ${e.frame.w}x${e.frame.h} → bake ${canvas.join('x')}${e.place.scale > 1 ? ' ×' + e.place.scale : ''}`);
}
// 33.4.8 weather-flake asserts: one cell per level foreground kind (emitter logic is
// engine-side; these rows only carry the flake art). Each must exist, slice EXACTLY one
// native-size frame from its declared source, and the greyscale sakura cell must declare
// the "petal" tint marker (art/items.js buildWeatherFrames recolours it to
// CFG.perf.petalColor via the shared luma ladder — an un-tinted grey petal is a defect).
const WEATHER = {
  'fx.snow': 'assets/itch/fx/jp_amb_snow_frames/jp_amb_snow_00.png',
  'fx.petal': 'assets/itch/fx/jp_amb_sakura_frames/jp_amb_sakura_00.png',
  'fx.bubble': 'assets/itch/atlantis-tileset/RPGMAKER-100/char_bubbles.png',
};
let weatherChecked = 0;
for (const [slot, src] of Object.entries(WEATHER)) {
  const e = sprites[slot];
  if (!e) { fail(`${slot}: missing weather-flake manifest entry`); continue; }
  const st = e.strips?.frames;
  if (!st || st.count !== 1 || st.src !== src) fail(`${slot}: must slice 1 frame from ${src} (got ${st?.count}× ${st?.src})`);
  if (slot === 'fx.petal' && e.tint !== 'petal') fail('fx.petal: greyscale source must declare tint "petal"');
  weatherChecked++;
  console.log(`ok   ${slot}  single flake cell from ${src}${slot === 'fx.petal' ? ' · petal tint declared' : ''}`);
}
// 33.4.6 icon/pickup asserts (A5 + second pass A5b): every buildIcons() key is EITHER a
// manifest-sourced slot (icon.* — exactly ONE square 16-64px cell from a viewed pack:
// rrfreelance PropsInPixels single-file cells, willYEE Sengoku 32x32 icon cells (CC0),
// or clockworkraven Free Raven Fantasy Icons 32x32 fb*.png cells — all 2192 were
// scanned from indexed contact sheets; every wired cell was VIEWED, D-F5) or an
// explicit KEPT-DRAWN slot. The two lists must cover the 47-key engine icon inventory
// exactly once, and js/art/items.js must agree: packed keys registered through
// packDraw('icon.<key>'), kept keys drawn (no packDraw) — a silent drift between the
// manifest wiring and this list is a defect (rule 15). icon.blueFlame must declare the
// tint hex (it reuses the inferno flame cell recoloured — the tint IS the slot).
// pickup.gem / pickup.heart must pin the exact boot-asserted bake canvases
// (24x26 / 22x20 — test-boot 13.10 asserts width 24/22; per-level tints ride
// GEM_PAL/HEART_PAL, kept as the config-side tint source by test-logic's 22.3 invariants).
const PACK_DIRS = ['assets/itch/sprites-pack-16px-over-150/', 'assets/itch/icons/', 'assets/itch/Free - Raven Fantasy Icons/Separated Files/32x32/'];
const ICON_PACKED = ['wand', 'axe', 'blades', 'bombs', 'pyre', 'snowball', 'ringLightning', 'bow', 'boulder', 'webs', 'gatling', 'cannonball', 'boots', 'heart', 'sword', 'gem', 'shield', 'coffee', 'blight', 'tempest', 'inferno', 'napalm', 'blueFlame', 'gutFeast', 'avalanche', 'skip', 'banish', 'garlic', 'missile', 'laser', 'wolfpack', 'bat', 'sigil', 'reroll'];
const ICON_DRAWN = ['fangs', 'tongue', 'magnet', 'dash', 'skates', 'phoenix', 'flamingArrows', 'heartPiercer', 'stormVolley', 'heartMagnet', 'napalmMissile', 'staticPelt', 'homerKing'];
const isrc = readFileSync(join(root, 'js/art/items.js'), 'utf8');
let iconChecked = 0;
if (new Set([...ICON_PACKED, ...ICON_DRAWN]).size !== ICON_PACKED.length + ICON_DRAWN.length) fail('icon coverage: packed/kept lists overlap');
for (const key of ICON_PACKED) {
  const e = sprites['icon.' + key];
  if (!e) { fail('icon.' + key + ': missing manifest entry (packed key without art)'); continue; }
  const st = e.strips?.art;
  if (!st || st.count !== 1 || !PACK_DIRS.some((d) => (st.src || '').startsWith(d))) { fail(`icon.${key}: must slice ONE cell from a viewed pack dir`); continue; }
  const fw = e.frame?.w, fh = e.frame?.h;
  if (fw !== fh || fw < 16 || fh > 64) { fail(`icon.${key}: frame must be a square 16..64 cell, got ${fw}x${fh}`); continue; }
  if (!new RegExp(`icons\\.${key} = make\\('\\w+', packDraw\\('\\w+', 'icon\\.${key}'\\)\\)`).test(isrc)) { fail(`icon.${key}: items.js must register through packDraw('icon.${key}')`); continue; }
  iconChecked++;
}
for (const key of ICON_DRAWN) {
  if (sprites['icon.' + key]) { fail(`icon.${key}: manifest entry exists but the slot is declared kept-drawn`); continue; }
  if (!new RegExp(`icons\\.${key} = make\\('\\w+', \\(g\\) => \\{`).test(isrc)) { fail(`icon.${key}: items.js must keep a drawn body for a kept slot`); continue; }
}
const eBf = sprites['icon.blueFlame'];
if (eBf && !/^#[0-9a-f]{6}$/i.test(eBf.tint || '')) fail('icon.blueFlame: tint hex required (reuses the inferno flame cell)');
if (eBf && sprites['icon.inferno'] && eBf.strips?.art?.src !== sprites['icon.inferno'].strips?.art?.src) fail('icon.blueFlame: must reuse the icon.inferno source cell (tinted)');
if (!isrc.includes("packDraw('")) fail('items.js: packDraw wiring missing');
// pickup bake contracts (sizes = the boot asserts; tints config-side)
const PICKUP = { 'pickup.gem': [24, 26], 'pickup.heart': [22, 20] };
let pickupChecked = 0;
for (const [slot, [bw, bh]] of Object.entries(PICKUP)) {
  const e = sprites[slot];
  if (!e) { fail(slot + ': missing pickup manifest entry'); continue; }
  const b = e.render?.bake;
  if (!Array.isArray(b) || b[0] !== bw || b[1] !== bh) { fail(`${slot}: render.bake must be [${bw},${bh}] (boot-asserted)`); continue; }
  if (!e.strips?.art || e.strips.art.count !== 1 || !PACK_DIRS.some((d) => (e.strips.art.src || '').startsWith(d))) { fail(`${slot}: must slice one pack cell`); continue; }
  pickupChecked++;
  console.log(`ok   ${slot}  pack cell → bake ${bw}x${bh} (boot footprint)`);
}
// 33.4.7 (A6) WORLD/FX + backdrop asserts: every packed world projectile/FX slot and
// every m02 backdrop cell slices exactly ONE frame from a VIEWED FX/background pack,
// declares render.bake = the exact pre-rendered engine canvas footprint (draw-call and
// geometry invariants — D-F2), and is wired through packOver('slot') in items.js /
// packM02Ridges cells in sky.js. Tinted slots declare their ladder hex IN THE MANIFEST
// (blueFlame law). KEPT-PROCEDURAL slots (no clean source in any imported pack — rule 15
// documented gaps) must have NO manifest entry and keep their path-drawn builder body.
const WORLD_SRC_DIRS = ['assets/itch/gothicvania-magic-pack-9/', 'assets/itch/explosion-animations-pack/', 'assets/itch/fx/'];
const WORLD = {
  'world.bomb': [30, 34], 'world.bomb.napalm': [30, 34], 'world.blade': [30, 30],
  'fx.explosion': [128, 128], 'fx.blastStar': [128, 128], 'fx.frostBurst': [64, 64],
  'fx.spark': [20, 20], 'fx.flame': [24, 24], 'fx.reflectRing': [48, 48],
};
let worldChecked = 0;
for (const [slot, [bw, bh]] of Object.entries(WORLD)) {
  const e = sprites[slot];
  if (!e) { fail(`${slot}: missing world-art manifest entry`); continue; }
  const st = e.strips?.art;
  if (!st || st.count !== 1 || !WORLD_SRC_DIRS.some((d) => (st.src || '').startsWith(d))) { fail(`${slot}: must slice ONE cell from a viewed FX pack`); continue; }
  const b = e.render?.bake;
  if (!Array.isArray(b) || b[0] !== bw || b[1] !== bh) { fail(`${slot}: render.bake must be [${bw},${bh}] (engine footprint)`); continue; }
  if (!isrc.includes(`packOver(c, '${slot}'`)) { fail(`items.js: ${slot} is not wired through packOver`); continue; }
  worldChecked++;
  console.log(`ok   ${slot}  FX-pack cell → bake ${bw}x${bh}${e.tint ? ' · tint ' + e.tint : ''}`);
}
// world.bomb.napalm = the world.bomb cell re-toned (the tint IS the variant slot).
const eNap = sprites['world.bomb.napalm'];
if (eNap && sprites['world.bomb'] && eNap.strips?.art?.src !== sprites['world.bomb'].strips?.art?.src) fail('world.bomb.napalm: must reuse the world.bomb source cell');
if (eNap && eNap.tint !== '#a8462e') fail(`world.bomb.napalm: tint must be #a8462e (the card casing identity), got ${eNap?.tint}`);
// Kept-procedural world sprites (every item.js builder NOT packed this phase — the
// honest gap list; any drift either way fails): no manifest entry, real draw body.
const WORLD_KEPT = { bolt: 'boltSprite', bullet: 'bulletSprite', arrow: 'arrowSprite', snowball: 'snowballSprite', baseball: 'baseballSprite', boomerang: 'boomerangSprite', missile: 'missileSprite', web: 'webSprite', boulder: 'boulderSprite', burn: 'burnSprite', blight: 'blightSprite', orb: 'orbSprite', scorch: 'scorchSparkSprite' };
for (const [key, fn] of Object.entries(WORLD_KEPT)) {
  if (sprites['world.' + key] || sprites['fx.' + key]) { fail(`world.${key}: manifest entry exists but the slot is declared kept-procedural`); continue; }
  if (!new RegExp(`function ${fn}\\(\\) \\{`).test(isrc)) { fail(`items.js: kept-procedural builder ${fn} missing`); continue; }
  if (isrc.includes(`packOver(c, 'world.${key}'`) || isrc.includes(`packOver(c, 'fx.${key}'`)) { fail(`items.js: ${fn} is wired to a pack slot but declared kept-procedural`); continue; }
}
const skySrc = readFileSync(join(root, 'js/art/sky.js'), 'utf8');
const BG = ['bg.m02.far1', 'bg.m02.far2', 'bg.m02.torii', 'bg.m02.castle', 'bg.m02.buddha'];
let bgChecked = 0;
for (const slot of BG) {
  const e = sprites[slot];
  if (!e) { fail(`${slot}: missing m02-backdrop manifest entry`); continue; }
  const st = e.strips?.art;
  if (!st || st.count !== 1 || !(st.src || '').startsWith('assets/itch/backgrounds/')) { fail(`${slot}: must slice one scene from assets/itch/backgrounds/`); continue; }
  if (!skySrc.includes(`cell('${slot}')`)) { fail(`sky.js: ${slot} is not wired in packM02Ridges`); continue; }
  bgChecked++;
  console.log(`ok   ${slot}  backdrop scene cell wired in sky.js`);
}
if (!skySrc.includes('packM02Ridges')) fail('sky.js: packM02Ridges (m02 packed parallax) missing — m02 backdrops would silently stay procedural');
console.log(fails === 0 ? `\ntest-art: PASS (${checked} manifest entries validated, ${heroChecked} hero slots, ${enemyChecked} enemy slots, ${bossChecked} boss slots, ${skinChecked} skin slots, ${weatherChecked} weather slots, ${terrainChecked} terrain slots, ${faceChecked} pixel facing probes, ${iconChecked}/${ICON_PACKED.length} packed icons + ${ICON_DRAWN.length} kept-drawn verified, ${pickupChecked} pickup bakes, ${worldChecked} world/FX bakes + ${Object.keys(WORLD_KEPT).length} kept-procedural verified, ${bgChecked} m02 backdrop cells)` : `\ntest-art: ${fails} FAILURE(S)`);
process.exit(fails === 0 ? 0 : 1);
