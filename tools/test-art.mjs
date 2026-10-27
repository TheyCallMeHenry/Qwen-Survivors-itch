#!/usr/bin/env node
// 33.4.1/33.4.2/33.4.3 art gate: validate assets/itch/sprites.json against the files on
// disk — entry shape, src existence, PNG IHDR geometry (a strip's frames must physically
// fit the sheet) — plus per-slot hero asserts (33.4.2) and per-slot ENEMY asserts
// (33.4.3): engine footprint shape + packed frame count (or strip+bob derivation) + the
// right-facing contract declaration per enemy key, the elite recolour marker against the
// palette block, and the wolfpack companion block. 33.4.4 adds BOSS asserts (footprint
// mirrors the engine's procedural tables, no elite marker, guest-dialect downscale ≤2×,
// render.flip for left-facing sources) and level-SKIN asserts (footprint identical to
// the base slot + the same elite marker). Canvas itself is NOT exercised
// (browser-side); this test proves the data pipeline can never ask the renderer for a
// bad rect, and that the manifest footprints equal the engine's required ones.
import { readFileSync, existsSync } from 'node:fs';
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
const SKIN = {
  'm02.wolf': { sheet: [46, 32, 11], frames: 4 },
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
  if (!!e.render?.flip) fail(`skin.${slot}: unexpected render.flip`);
  if (e.recolour !== 'elite') fail(`skin.${slot}: elite skin path marker missing (recolour "elite")`);
  const [x, y, tw, th] = e.render?.trim || [];
  if (![x, y, tw, th].every(Number.isInteger) || x < 0 || y < 0 || tw < 1 || th < 1 || x + tw > e.frame.w || y + th > e.frame.h) {
    fail(`skin.${slot}: trim rect ${JSON.stringify(e.render?.trim)} outside ${e.frame.w}x${e.frame.h} source frame`);
  }
  skinChecked++;
  console.log(`ok   skin.${slot}  footprint ${want.sheet.join('/')} · ${want.frames} frame(s) · facing right · elite tint`);
}
console.log(fails === 0 ? `\ntest-art: PASS (${checked} manifest entries validated, ${heroChecked} hero slots, ${enemyChecked} enemy slots, ${bossChecked} boss slots, ${skinChecked} skin slots)` : `\ntest-art: ${fails} FAILURE(S)`);
process.exit(fails === 0 ? 0 : 1);
