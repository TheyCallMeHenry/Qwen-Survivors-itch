// Characters: per-level enemy skins. All face RIGHT — flip at draw time with flipX().
// Feet/base sit near the bottom of each canvas; shadowR is the runtime soft-shadow
// radius. Hit-flash copies are made at use via flashCopy.
// m01 = Evernight Wood · m02 = Higan re-skins (13.3) · m03 = Drowned City re-skins (13.5).
// 33.4.3: the default (m01) set sources packed itch sprites from assets/itch/sprites.json
// via art/load.js — every sheet was viewed before wiring (rule 6): rat ← vermin
// "Infected Mouse", bat ← vermin "Swooping Bat", goblin ← humanoid "goblin fighter",
// brute ← magical "ice golem" (the m01 snow theme), cultist ← undead "Grave Revenant",
// wolf ← Aaron freebies-5 #003. DEFECT B1 correction (2026-10-26): fb5_003's source
// faces LEFT — the earlier "pure right profile" note here was wrong and test-art's
// declaration-only facing check could not catch it. The entry now declares render.flip
// like the ryū; test-art measures the source pixels for profile silhouettes. ELITE: each packed def also carries eliteFrames — the same frames
// through the shared lumaTintMap gold ladder (manifest palette.eliteColor); the engine's
// gold-diamond tell is untouched (enemies.js, D105) and simply never picks the skins up
// until a future engine go. 33.4.4: the m01 WRAITH boss is packed from the Aaron gen-0
// ghost-wisp (#002 — front-facing, flip-invariant like the manifest contract allows) and
// the RYŪ boss from the F46 gold eastern dragon (fb3_002 — its source faces LEFT, so the
// entry declares render.flip and bakeInto mirrors it into the right-facing contract);
// m02's kitsune (wolf slot) comes from the same F46 pack's flame-fox (fb3_004). All
// three use the same downscale ≤2× / static+bob paths as the hero/enemy precedent. The
// Great White stays procedural (user deferral, 2026-10-26) and so do the remaining
// m02/m03 re-skins (oni, miko, sea creatures…): no imported source fits them — listed
// as coverage gaps, no improvised substitutes.

import { makeCanvas, roundRectPath, poly, formShade } from './base.js';
import { sliceStrip, paletteSwap, lumaTintMap, lumaOf, loadPack, onArtReady } from './load.js';
import { TAU } from '../utils/math.js';

function canvasOf(w, h, draw) {
  const c = makeCanvas(w, h);
  draw(c.getContext('2d'));
  return c;
}

// Playable-character sheet builders (mage/warden/ranger/swash/ghost) retired here in
// Phase 27 — they now live in art/heroes.js, redesigned from scratch. This module is
// enemy skins only (buildCharacters).

// ── packed-sprite enemy defs (33.4.3) ───────────────────────────────────────────
// Footprint/frame-count mirrors of the manifest `sheet`/`frames` blocks (rule 7 =
// sprites.json is the tuning source; this table is the Node-stub fallback so boot can
// still construct defs — pixels are unobservable there; test-art pins both sides, so
// the copies cannot drift unnoticed).
const NODE_FALLBACK_ENEMY = {
  rat: [30, 26, 8, 1], bat: [34, 28, 8, 2], goblin: [30, 38, 9, 3],
  wolf: [46, 32, 11, 4], brute: [64, 60, 14, 2], cultist: [32, 46, 9, 2],
};

// Paint a packed entry into PRE-EXISTING canvases (the deferred model in load.js:
// defs are handed out with the exact footprint before image decode settles, then
// repainted in place). Each frame = its own canvas, art bottom-centred (enemies.js
// blits at (-w/2,-h) and flips for left, so source frames must face RIGHT — the
// manifest facing fields are viewed promises test-art enforces). entry.frames >
// strip frames = cycle the strip and bake integer-px bob offsets (the heroes 33.4.2
// derivation; clock stays in the engine). tinter(frame)→map optionally recolours the
// sliced art BEFORE scaling (exact-palette swap on source pixels; elite/pack paths).
function bakeInto(out, art, entry, cfg, tinter) {
  const [tx, ty, tw, th] = cfg.render.trim || [0, 0, entry.frame.w, entry.frame.h];
  const s = cfg.render.artH / th;
  const dw = Math.round(tw * s), dh = Math.round(th * s);
  const px = Math.round((cfg.sheet.w - dw) / 2), py = cfg.sheet.h - dh;
  const bob = cfg.bob || [];
  // render.flip: source faces LEFT (the F46 dragon) — mirror the baked rect about the
  // sheet's centre so the RIGHT-facing contract still holds (art is bottom-centred,
  // so centred mirroring preserves placement).
  const flip = !!cfg.render.flip;
  for (let i = 0; i < out.length; i++) {
    let f = art[i % art.length];
    if (tinter) f = paletteSwap(f, tinter(f));
    const g = out[i].getContext('2d');
    g.clearRect(0, 0, out[i].width, out[i].height);
    g.imageSmoothingEnabled = false;
    g.save();
    if (flip) { g.translate(out[i].width, 0); g.scale(-1, 1); }
    g.drawImage(f, tx, ty, tw, th, px, py + (bob[i] || 0), dw, dh);
    g.restore();
  }
}

// One enemy/level-skin def from the manifest (slot = full sprites.json key, e.g.
// "enemy.wolf" or "skin.m02.wolf"), painted in place once the art decodes (briefly blank
// before that; a run only starts after the player clicks Start, and setDefs re-bakes
// flash copies from the live pixels then). Elite skin (D105 rolls every NON-boss): if the
// entry declares recolour "elite", eliteFrames = base frames gold-tinted via the shared
// lumaTintMap ladder; frames itself stays the normal skin. Boss entries omit the marker
// — bosses never roll elite.
function packedEnemy(pk, slot) {
  const entry = pk.manifest.sprites[slot];
  const mk = () => makeCanvas(entry.sheet.w, entry.sheet.h);
  const def = { w: entry.sheet.w, h: entry.sheet.h, shadowR: entry.sheet.shadowR, frames: Array.from({ length: entry.frames }, mk) };
  const gold = entry.recolour === 'elite' ? (pk.manifest.palette || {}).eliteColor : null;
  if (gold) def.eliteFrames = Array.from({ length: entry.frames }, mk);
  onArtReady(pk, () => {
    const art = sliceStrip(pk.images, entry, 'frames');
    bakeInto(def.frames, art, entry, entry, null);
    if (gold) bakeInto(def.eliteFrames, art, entry, entry, (f) => lumaTintMap(f, gold));
  });
  return def;
}

// Node-stub def: exact footprint + blank frames (boot asserts slots/counts only).
const blankEnemy = ([w, h, shadowR, n]) => {
  const mk = () => makeCanvas(w, h);
  return { w, h, shadowR, frames: Array.from({ length: n }, mk) };
};

// --- Map 02 "Higan" skins (13.3) — same canvas footprints as the m01 slots ---

function tanukiFrame() {
  return canvasOf(30, 26, (g) => {
    g.strokeStyle = '#5a4a3c';
    g.lineWidth = 3;
    g.lineCap = 'round';
    g.beginPath(); g.moveTo(4, 16); g.quadraticCurveTo(-1, 14, 1, 9); g.stroke();
    g.fillStyle = '#6e5a48';
    g.beginPath(); g.ellipse(13, 16, 9, 6.5, 0, 0, TAU); g.fill();
    formShade(g, 4, 9.5, 18, 13); // 24.5 tanuki body
    g.fillStyle = '#cbb9a4';
    g.beginPath(); g.ellipse(14, 19, 5.5, 2.6, 0, 0, TAU); g.fill();
    g.fillStyle = '#776450';
    g.beginPath(); g.arc(22, 13, 5.8, 0, TAU); g.fill();
    g.fillStyle = '#5f4d3e';
    g.beginPath(); g.arc(19, 7.5, 1.8, 0, TAU); g.fill();
    g.beginPath(); g.arc(25, 7.5, 1.8, 0, TAU); g.fill();
    g.fillStyle = '#3d3128';
    g.beginPath(); g.ellipse(23, 12.5, 4, 2.6, 0, 0, TAU); g.fill();
    g.fillStyle = '#ff5a5a';
    g.beginPath(); g.arc(24.5, 12, 1, 0, TAU); g.fill();
    g.beginPath(); g.arc(27, 15, 0.9, 0, TAU); g.fill();
    g.fillStyle = '#4a3d30';
    g.beginPath(); g.ellipse(9, 21, 2.4, 1.4, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(17, 21, 2.4, 1.4, 0, 0, TAU); g.fill();
  });
}

function hooiFrame(up) {
  return canvasOf(34, 28, (g) => {
    const cy = up ? 12 : 15;
    g.fillStyle = 'rgba(120,220,170,0.22)';
    g.beginPath(); g.ellipse(15, cy + 6, 6, 4, 0, 0, TAU); g.fill();
    const fl = g.createRadialGradient(17, cy, 1, 17, cy, 10);
    fl.addColorStop(0, 'rgba(230,255,240,0.95)');
    fl.addColorStop(0.45, 'rgba(120,235,190,0.7)');
    fl.addColorStop(1, 'rgba(80,200,170,0)');
    g.fillStyle = fl;
    g.beginPath(); g.ellipse(17, cy, 8, 9, 0, 0, TAU); g.fill();
    g.fillStyle = '#9fe8c8';
    g.beginPath(); g.arc(17, cy, 5, 0, TAU); g.fill();
    g.fillStyle = '#141f1a';
    g.beginPath(); g.arc(19.5, cy - 0.5, 2.8, 0, 0, TAU); g.fill();
    g.fillStyle = '#eafff4';
    g.beginPath(); g.arc(20.5, cy - 1, 0.9, 0, TAU); g.fill();
    g.beginPath(); g.arc(22, cy, 0.7, 0, TAU); g.fill();
  });
}

function shikomeFrame(legL, legR) {
  return canvasOf(30, 38, (g) => {
    g.fillStyle = '#3c3a4a';
    g.fillRect(11 + legL, 30, 4, 8);
    g.fillRect(16 + legR, 30, 4, 8);
    roundRectPath(g, 8, 16, 15, 16, 4);
    g.fillStyle = '#5d5a72';
    g.fill();
    formShade(g, 8, 16, 15, 16); // 24.5 shikome torso
    g.strokeStyle = '#8a8298';
    g.lineWidth = 2.5;
    g.lineCap = 'round';
    g.beginPath(); g.moveTo(24, 20); g.lineTo(28, 8); g.stroke();
    g.fillStyle = '#6a6478';
    g.beginPath(); g.arc(28, 7, 3.4, 0, 0, TAU); g.fill();
    g.fillStyle = '#6e6a86';
    g.beginPath(); g.arc(16, 10, 7, 0, 0, TAU); g.fill();
    g.fillStyle = '#d8d2e2';
    poly(g, [[11, 6], [7, 1], [13, 4]]);
    g.fill();
    poly(g, [[21, 6], [25, 1], [19, 4]]);
    g.fill();
    g.fillStyle = '#ff8a4a';
    g.beginPath(); g.arc(18.5, 9, 1.2, 0, 0, TAU); g.fill();
    g.beginPath(); g.arc(22, 9.5, 1.1, 0, 0, TAU); g.fill();
    g.fillStyle = '#e8e2f0';
    poly(g, [[19, 13], [20, 16], [21.5, 13]]);
    g.fill();
  });
}

function kitsuneFrame(l1, l2) {
  return canvasOf(46, 32, (g) => {
    g.strokeStyle = '#d88a4a';
    g.lineWidth = 4;
    g.lineCap = 'round';
    g.beginPath(); g.moveTo(8, 15); g.quadraticCurveTo(0, 11, 1, 6); g.stroke();
    g.strokeStyle = '#f0e8e0';
    g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(1, 7); g.lineTo(1.5, 5); g.stroke();
    g.strokeStyle = '#c87a3e';
    g.lineWidth = 4;
    g.beginPath(); g.moveTo(10, 18); g.quadraticCurveTo(3, 15, 2, 10); g.stroke();
    g.fillStyle = '#d88a4a';
    g.fillRect(12 + l1, 22, 3.5, 10);
    g.fillRect(20 + l2, 22, 3.5, 10);
    g.fillRect(28 + l2, 22, 3.5, 10);
    g.fillRect(34 + l1, 22, 3.5, 10);
    g.fillStyle = '#e09a58';
    g.beginPath(); g.ellipse(23, 17, 14, 7, 0, 0, TAU); g.fill();
    formShade(g, 9, 10, 28, 14); // 24.5 kitsune body
    g.fillStyle = '#f0e8e0';
    g.beginPath(); g.ellipse(21, 20, 11, 4, 0, 0, TAU); g.fill();
    g.fillStyle = '#e09a58';
    g.beginPath(); g.arc(37, 12, 6, 0, 0, TAU); g.fill();
    poly(g, [[39, 10], [45, 13], [39, 16]]);
    g.fill();
    poly(g, [[33, 7], [31, 1], [37, 4]]);
    g.fill();
    poly(g, [[29, 7], [25, 1], [32, 5]]);
    g.fill();
    g.fillStyle = '#ff6a4a';
    g.beginPath(); g.arc(38.5, 10.5, 1, 0, 0, TAU); g.fill();
  });
}

function oniFrame(frame) {
  return canvasOf(64, 60, (g) => {
    g.save();
    g.translate(0, frame ? -1.5 : 0);
    g.fillStyle = '#5a2a2e';
    g.fillRect(22, 46, 9, 14);
    g.fillRect(36, 46, 9, 14);
    roundRectPath(g, 17, 18, 32, 30, 8);
    g.fillStyle = '#a83c3c';
    g.fill();
    formShade(g, 17, 18, 32, 30); // 24.5 oni torso
    // loincloth belt
    g.fillStyle = '#7a5a3a';
    g.fillRect(19, 40, 28, 5);
    // arms
    roundRectPath(g, 8, 20 + (frame ? -3 : 0), 10, 22, 4);
    g.fillStyle = '#963232';
    g.fill();
    roundRectPath(g, 48, 20 + (frame ? -3 : 0), 10, 22, 4);
    g.fill();
    // head
    g.fillStyle = '#b04444';
    g.beginPath(); g.arc(33, 11, 8, 0, 0, TAU); g.fill();
    // horns
    g.fillStyle = '#efe6d8';
    poly(g, [[26, 6], [22, 0], [30, 3]]);
    g.fill();
    poly(g, [[40, 6], [44, 0], [36, 3]]);
    g.fill();
    g.fillStyle = '#2a0f10';
    g.beginPath(); g.arc(31, 10, 1.3, 0, 0, TAU); g.fill();
    g.beginPath(); g.arc(36, 10, 1.3, 0, 0, TAU); g.fill();
    // fangs
    g.fillStyle = '#f2ead8';
    poly(g, [[30, 15], [31.5, 18], [33, 15]]);
    g.fill();
    poly(g, [[35, 15], [36.5, 18], [38, 15]]);
    g.fill();
    // glowing core
    const core = g.createRadialGradient(33, 33, 1, 33, 33, 10);
    core.addColorStop(0, frame ? 'rgba(255,220,130,0.95)' : 'rgba(255,200,100,0.8)');
    core.addColorStop(0.4, 'rgba(255,170,60,0.35)');
    core.addColorStop(1, 'rgba(255,150,50,0)');
    g.fillStyle = core;
    g.beginPath(); g.arc(33, 33, 10, 0, 0, TAU); g.fill();
    g.fillStyle = '#ffe9c0';
    g.beginPath(); g.arc(33, 33, 2.5, 0, 0, TAU); g.fill();
    g.restore();
  });
}

function mikoFrame(frame) {
  return canvasOf(32, 46, (g) => {
    g.save();
    g.translate(0, frame ? -1.5 : 0);
    poly(g, [[9, 46], [12, 14], [21, 14], [25, 46]]);
    g.fillStyle = '#e8e2d8';
    g.fill();
    formShade(g, 9, 14, 16, 32); // 24.5 miko robe
    poly(g, [[9, 46], [12, 14], [17, 14], [15, 46]]);
    g.fillStyle = '#b8434a';
    g.fill();
    g.fillStyle = '#3a2a2c';
    g.beginPath(); g.arc(17, 11, 6.5, 0, 0, TAU); g.fill();
    g.beginPath(); g.rect(13, 11, 8, 26); g.fill();
    g.fillStyle = '#08060e';
    g.beginPath(); g.arc(19, 12, 4, 0, 0, TAU); g.fill();
    g.fillStyle = '#d8c8e8';
    g.beginPath(); g.arc(18, 12.5, 1, 0, 0, TAU); g.fill();
    const orbY = 24 + (frame ? -2 : 0);
    // ofuda talisman orb: white paper strip, red seal, kanji-like mark
    const glow = g.createRadialGradient(27, orbY, 0.5, 27, orbY, 8);
    glow.addColorStop(0, 'rgba(255,236,200,0.8)');
    glow.addColorStop(1, 'rgba(255,236,200,0)');
    g.fillStyle = glow;
    g.beginPath(); g.arc(27, orbY, 8, 0, 0, TAU); g.fill();
    g.fillStyle = '#f5f0e6';
    g.fillRect(25, orbY - 4, 4, 8);
    g.fillStyle = '#c03038';
    g.fillRect(25.5, orbY - 3, 3, 2.4);
    g.fillStyle = '#2a2438';
    g.fillRect(26.5, orbY + 1, 1, 2.4);
    g.restore();
  });
}

function ryuFrame(frame) {
  return canvasOf(96, 112, (g) => {
    g.save();
    g.translate(0, frame ? 2 : 0);
    // serpentine body: two overlapping sine curves, tail → head (facing RIGHT)
    g.lineCap = 'round';
    g.lineJoin = 'round';
    const seg = (w, col, dy, a, b) => {
      g.strokeStyle = col;
      g.lineWidth = w;
      g.beginPath();
      g.moveTo(2, 74);
      g.bezierCurveTo(20, 74 - a + dy, 34, 60 + b + dy, 50, 44 + dy);
      g.bezierCurveTo(64, 30 + dy, 74, 26 + b * 0.5 + dy, 84, 22 + dy);
      g.stroke();
    };
    seg(26, '#122a3e', frame ? 2 : 0, 10, 0);
    seg(26, '#1d4463', frame ? 0 : -2, 16, -6);
    // scale highlights
    g.fillStyle = 'rgba(160,220,255,0.5)';
    for (let i = 0; i < 6; i++) {
      g.beginPath(); g.arc(14 + i * 12, 66 - i * 6 + (frame ? 1 : 0), 2.2, 0, 0, TAU); g.fill();
    }
    // head
    g.fillStyle = '#265a80';
    g.beginPath(); g.ellipse(88, 22, 9, 6.5, -0.35, 0, TAU); g.fill();
    formShade(g, 79, 15.5, 18, 13); // 24.5 ryū head
    poly(g, [[96, 20], [102, 24], [95, 26]]);
    g.fill();
    // whiskers
    g.strokeStyle = '#dcecf8';
    g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(96, 21); g.quadraticCurveTo(104, 16, 108, 18); g.stroke();
    g.beginPath(); g.moveTo(96, 25); g.quadraticCurveTo(104, 26, 107, 30); g.stroke();
    // antlers
    g.strokeStyle = '#e8dcc0';
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(84, 17); g.lineTo(80, 8); g.moveTo(82, 12); g.lineTo(77, 10); g.stroke();
    g.beginPath(); g.moveTo(90, 16); g.lineTo(92, 7); g.moveTo(91, 11); g.lineTo(96, 9); g.stroke();
    // eye
    g.fillStyle = '#ffd24a';
    g.beginPath(); g.arc(91, 21, 1.6, 0, 0, TAU); g.fill();
    // belly plates
    g.fillStyle = 'rgba(220,240,250,0.35)';
    for (let i = 0; i < 5; i++) {
      g.beginPath(); g.ellipse(28 + i * 13, 72 - i * 8 + (frame ? 1 : 0), 4, 2.4, -0.4, 0, TAU); g.fill();
    }
    g.restore();
  });
}

// --- Map 03 "The Drowned City" skins (13.5) — same canvas footprints as the m01 slots ---

function crabFrame() {
  return canvasOf(30, 26, (g) => {
    g.strokeStyle = '#a04832';
    g.lineWidth = 1.5;
    g.lineCap = 'round';
    for (const [x0, x1] of [[8, 2], [13, 5], [18, 9], [22, 16], [25, 23]]) {
      g.beginPath(); g.moveTo(x0, 19); g.quadraticCurveTo((x0 + x1) / 2, 22, x1, 24); g.stroke();
    }
    g.fillStyle = '#c86a3c';
    g.beginPath(); g.ellipse(15, 14, 9.5, 7, 0, 0, TAU); g.fill();
    formShade(g, 5.5, 7, 19, 14); // 24.5 crab shell
    g.fillStyle = '#b3543a';
    g.beginPath(); g.ellipse(15, 12, 8, 4, 0, 0, TAU); g.fill();
    // claws (forward = right)
    g.fillStyle = '#d87848';
    g.beginPath(); g.arc(24, 8, 3.4, 0, 0, TAU); g.fill();
    g.beginPath(); g.arc(28, 12, 3.4, 0, 0, TAU); g.fill();
    g.fillStyle = '#3a1f14';
    g.beginPath(); g.arc(25, 7, 1.2, 0, 0, TAU); g.fill();
    g.beginPath(); g.arc(29, 11, 1.2, 0, 0, TAU); g.fill();
    // stalked eyes
    g.strokeStyle = '#8a4a30';
    g.lineWidth = 1;
    g.beginPath(); g.moveTo(12, 10); g.lineTo(11.5, 6); g.stroke();
    g.beginPath(); g.moveTo(17, 10); g.lineTo(17.5, 5.5); g.stroke();
    g.fillStyle = '#2a1a12';
    g.beginPath(); g.arc(11.5, 5.5, 1.3, 0, 0, TAU); g.fill();
    g.beginPath(); g.arc(17.5, 5, 1.3, 0, 0, TAU); g.fill();
  });
}

function goldfishFrame(up) {
  return canvasOf(34, 28, (g) => {
    const fy = up ? -2 : 2;
    g.fillStyle = '#d87a42';
    poly(g, [[9, 14 + fy * 0.5], [2, 6 + fy], [5, 14], [2, 22 - fy]]);
    g.fill();
    g.fillStyle = '#e8935a';
    g.beginPath(); g.ellipse(20, 14, 10, 6.5, 0, 0, TAU); g.fill();
    formShade(g, 10, 7.5, 20, 13); // 24.5 goldfish body
    g.fillStyle = '#f2b076';
    g.beginPath(); g.ellipse(21, 16.5, 8, 3.5, 0, 0, TAU); g.fill();
    g.fillStyle = '#d87a42';
    poly(g, [[16, 8.5 + fy * 0.5], [19, 3 + fy], [22, 8.5 + fy * 0.5]]);
    g.fill();
    g.fillStyle = '#2a1a12';
    g.beginPath(); g.arc(27, 12.5, 1.3, 0, 0, TAU); g.fill();
  });
}

function mermanFrame(legL, legR) {
  return canvasOf(30, 38, (g) => {
    const sway = (legL + legR) * 0.5;
    // fish tail (sways with the goblin leg cycle)
    g.fillStyle = '#4a7a6e';
    poly(g, [[11 + sway, 30], [8 + sway, 38], [15 + sway, 33], [21 + sway, 38], [18 + sway, 30]]);
    g.fill();
    roundRectPath(g, 8, 16, 15, 16, 4);
    g.fillStyle = '#7aa894';
    g.fill();
    formShade(g, 8, 16, 15, 16); // 24.5 merman torso
    g.strokeStyle = '#9a6a3a';
    g.lineWidth = 3;
    g.lineCap = 'round';
    g.beginPath(); g.moveTo(24, 20); g.lineTo(27, 8); g.stroke();
    // coral club tip
    g.strokeStyle = '#c86a3c';
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(27, 8); g.lineTo(26, 4); g.moveTo(27, 8); g.lineTo(29, 5); g.stroke();
    g.fillStyle = '#6a9a8a';
    g.beginPath(); g.arc(16, 10, 7, 0, 0, TAU); g.fill();
    g.fillStyle = '#ffd24a';
    g.beginPath(); g.arc(18.5, 9, 1.2, 0, 0, TAU); g.fill();
    g.beginPath(); g.arc(22, 9.5, 1.1, 0, 0, TAU); g.fill();
  });
}

function mermaidFrame(legL, legR) {
  return canvasOf(30, 38, (g) => {
    const sway = (legL + legR) * 0.5;
    g.fillStyle = '#3a6a80';
    poly(g, [[11 + sway, 30], [7 + sway, 38], [15 + sway, 32], [22 + sway, 38], [18 + sway, 30]]);
    g.fill();
    roundRectPath(g, 8, 16, 15, 16, 4);
    g.fillStyle = '#8ab0a0';
    g.fill();
    formShade(g, 8, 16, 15, 16); // 24.5 mermaid torso
    // shell top + flowing hair
    g.fillStyle = '#d87a8a';
    poly(g, [[9, 18], [22, 18], [15.5, 23]]);
    g.fill();
    g.fillStyle = '#4a8a9a';
    poly(g, [[9, 4], [4, 12], [9, 16]]);
    g.fill();
    poly(g, [[23, 4], [28, 12], [22, 16]]);
    g.fill();
    g.fillStyle = '#7aa894';
    g.beginPath(); g.arc(16, 10, 7, 0, 0, TAU); g.fill();
    g.fillStyle = '#ffd24a';
    g.beginPath(); g.arc(18.5, 9, 1.2, 0, 0, TAU); g.fill();
    g.beginPath(); g.arc(22, 9.5, 1.1, 0, 0, TAU); g.fill();
  });
}

function stingrayFrame(l1, l2) {
  return canvasOf(46, 32, (g) => {
    g.save();
    g.translate(0, (l1 - l2) * 0.15); // swim undulation on the wolf leg cycle
    // whip tail
    g.strokeStyle = '#3a6a80';
    g.lineWidth = 2;
    g.lineCap = 'round';
    g.beginPath(); g.moveTo(8, 18); g.quadraticCurveTo(2, 14, 1, 22); g.stroke();
    // pectoral disc + pointed snout
    g.fillStyle = '#4a7a90';
    poly(g, [[8, 16], [20, 9], [40, 12], [45, 16], [40, 20], [20, 24]]);
    g.fill();
    formShade(g, 8, 9, 37, 15); // 24.5 stingray disc
    g.fillStyle = '#5a8aa0';
    g.beginPath(); g.ellipse(22, 16.5, 11, 5, 0, 0, TAU); g.fill();
    // eyes + mouth slits behind the snout
    g.fillStyle = '#1a2a34';
    g.beginPath(); g.arc(38, 14, 1.1, 0, 0, TAU); g.fill();
    g.strokeStyle = '#2a4a5a';
    g.lineWidth = 1;
    for (const mx of [33, 35.5]) {
      g.beginPath(); g.moveTo(mx, 19.5); g.lineTo(mx + 2.5, 20); g.stroke();
    }
    g.restore();
  });
}

function orcaFrame(frame) {
  return canvasOf(64, 60, (g) => {
    g.save();
    g.translate(0, frame ? -1.5 : 0);
    const dy = frame ? 0.5 : 0;
    // tail fluke
    g.fillStyle = '#232c36';
    poly(g, [[16, 30 + dy], [5, 18 + dy], [11, 30 + dy], [5, 42 + dy]]);
    g.fill();
    // body
    g.fillStyle = '#2c3844';
    g.beginPath(); g.ellipse(34, 30 + dy, 22, 14, 0, 0, TAU); g.fill();
    formShade(g, 12, 16 + dy, 44, 28); // 24.5 orca body
    // head + snout
    g.fillStyle = '#324050';
    g.beginPath(); g.ellipse(50, 32 + dy, 10, 9, 0, 0, TAU); g.fill();
    poly(g, [[56, 28 + dy], [62, 33 + dy], [56, 37 + dy]]);
    g.fill();
    // white belly + eye patch
    g.fillStyle = '#e8f2f5';
    g.beginPath(); g.ellipse(34, 37 + dy, 17, 7, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(50, 40 + dy, 8, 5, 0, 0, TAU); g.fill();
    g.fillStyle = '#e8f2f5';
    g.beginPath(); g.ellipse(52, 26 + dy, 3, 2, -0.3, 0, TAU); g.fill();
    // dorsal fin
    g.fillStyle = '#2c3844';
    poly(g, [[28, 18 + dy], [36, 8 + dy], [42, 18 + dy]]);
    g.fill();
    // eye + jaw
    g.fillStyle = '#10181f';
    g.beginPath(); g.arc(53.5, 28.5 + dy, 1.2, 0, 0, TAU); g.fill();
    g.strokeStyle = '#1c2630';
    g.lineWidth = 1.5;
    g.lineCap = 'round';
    g.beginPath(); g.moveTo(50, 38 + dy); g.quadraticCurveTo(56, 40 + dy, 61, 37 + dy); g.stroke();
    g.fillStyle = '#e8f2f5';
    for (const tx of [52, 55, 58]) poly(g, [[tx, 38 + dy], [tx + 1.5, 40.5 + dy], [tx + 3, 38.5 + dy]]), g.fill();
    g.restore();
  });
}

function eelFrame(frame) {
  return canvasOf(32, 46, (g) => {
    g.save();
    g.translate(0, frame ? -1.5 : 0);
    const bow = frame ? 4 : 0; // body bows between frames
    // serpentine body, head near the top (facing right)
    g.strokeStyle = '#4a7a8a';
    g.lineWidth = 6;
    g.lineCap = 'round';
    g.beginPath(); g.moveTo(15, 45); g.bezierCurveTo(9 + bow, 32, 23 - bow, 22, 17, 10); g.stroke();
    g.strokeStyle = '#6a9aaa';
    g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(15, 44); g.bezierCurveTo(10 + bow, 32, 22 - bow, 22, 17, 11); g.stroke();
    // head + eye
    g.fillStyle = '#5a8a9a';
    g.beginPath(); g.arc(18, 9, 4.5, 0, 0, TAU); g.fill();
    formShade(g, 13.5, 4.5, 9, 9); // 24.5 eel head
    g.fillStyle = '#ffd24a';
    g.beginPath(); g.arc(20.5, 8.5, 1, 0, 0, TAU); g.fill();
    // jagged lightning zap where the cultist orb sits
    const oz = frame ? 1 : -1;
    const glow = g.createRadialGradient(27, 24, 0.5, 27, 24, 8);
    glow.addColorStop(0, 'rgba(140,220,255,0.7)');
    glow.addColorStop(1, 'rgba(140,220,255,0)');
    g.fillStyle = glow;
    g.beginPath(); g.arc(27, 24, 8, 0, 0, TAU); g.fill();
    g.strokeStyle = '#bfe8ff';
    g.lineWidth = 1.8;
    g.lineJoin = 'miter';
    g.beginPath(); g.moveTo(25, 15); g.lineTo(29, 21 + oz); g.lineTo(25.5, 22 + oz); g.lineTo(30, 28 + oz * 0.5); g.lineTo(26, 31); g.stroke();
    g.restore();
  });
}

function sharkFrame(frame) {
  return canvasOf(96, 112, (g) => {
    g.save();
    g.translate(0, frame ? 2 : 0);
    const dy = frame ? 0.5 : 0;
    // tail fluke
    g.fillStyle = '#3a4a58';
    poly(g, [[20, 64 + dy], [8, 44 + dy], [15, 62 + dy], [8, 82 + dy]]);
    g.fill();
    // torpedo body (facing RIGHT)
    g.fillStyle = '#4a5a66';
    g.beginPath(); g.ellipse(54, 62 + dy, 34, 20, 0, 0, TAU); g.fill();
    formShade(g, 20, 42 + dy, 68, 40); // 24.5 shark body
    g.fillStyle = '#51606e';
    g.beginPath(); g.ellipse(78, 58 + dy, 12, 12, 0, 0, TAU); g.fill();
    poly(g, [[84, 50 + dy], [94, 58 + dy], [84, 66 + dy]]);
    g.fill();
    // belly (FLASHES bright on the frame-1 windup pose)
    g.fillStyle = frame ? '#ffffff' : '#d8e8ec';
    g.beginPath(); g.ellipse(54, 73 + dy, 29, 9, 0, 0, TAU); g.fill();
    if (frame) {
      const bf = g.createRadialGradient(54, 74 + dy, 2, 54, 74 + dy, 22);
      bf.addColorStop(0, 'rgba(230,250,255,0.9)');
      bf.addColorStop(1, 'rgba(230,250,255,0)');
      g.fillStyle = bf;
      g.beginPath(); g.ellipse(54, 73 + dy, 24, 11, 0, 0, TAU); g.fill();
    }
    // dorsal fin + pectoral
    g.fillStyle = '#3a4a58';
    poly(g, [[40, 45 + dy], [52, 28 + dy], [64, 44 + dy]]);
    g.fill();
    poly(g, [[60, 62 + dy], [70, 74 + dy], [64, 66 + dy]]);
    g.fill();
    // eye + jaw + teeth
    g.fillStyle = '#1a242c';
    g.beginPath(); g.arc(82, 55 + dy, 1.6, 0, 0, TAU); g.fill();
    g.strokeStyle = '#38464f';
    g.lineWidth = 1.5;
    g.lineCap = 'round';
    g.beginPath(); g.moveTo(88, 66 + dy); g.quadraticCurveTo(82, 70 + dy, 74, 69 + dy); g.stroke();
    g.fillStyle = '#e8f2f5';
    for (const tx of [76, 80, 84, 87.5]) poly(g, [[tx, 67.5 + dy], [tx + 1.3, 70 + dy], [tx + 2.6, 67.5 + dy]]), g.fill();
    // gill slits
    g.strokeStyle = '#38464f';
    g.lineWidth = 1.2;
    for (const gx of [68, 71.5, 75]) {
      g.beginPath(); g.moveTo(gx, 54 + dy); g.lineTo(gx, 64 + dy); g.stroke();
    }
    g.restore();
  });
}

function wraithFrame(frame) {
  return canvasOf(92, 112, (g) => {
    g.save();
    g.translate(0, frame ? 3 : 0);
    // tattered cloak
    poly(g, [[46, 6], [22, 34], [18, 78], [28, 88], [34, 80], [40, 92], [46, 84], [52, 94], [58, 82], [64, 90], [74, 80], [70, 34]]);
    g.fillStyle = '#1c1830';
    g.fill();
    formShade(g, 18, 6, 56, 88); // 24.5 wraith cloak
    g.fillStyle = 'rgba(60,52,96,0.8)';
    poly(g, [[24, 40], [8, 52], [14, 62], [26, 54]]);
    g.fill();
    poly(g, [[68, 40], [84, 52], [78, 62], [66, 54]]);
    g.fill();
    // hood + face
    g.fillStyle = '#241f3a';
    g.beginPath(); g.arc(46, 20, 14, 0, TAU); g.fill();
    g.fillStyle = '#05040a';
    g.beginPath(); g.ellipse(46, 22, 9, 7.5, 0, 0, TAU); g.fill();
    // glowing eyes
    const eg = g.createRadialGradient(46, 21, 1, 46, 21, 14);
    eg.addColorStop(0, `rgba(140,230,255,${frame ? 0.95 : 0.75})`);
    eg.addColorStop(1, 'rgba(140,230,255,0)');
    g.fillStyle = eg;
    g.beginPath(); g.arc(46, 21, 14, 0, TAU); g.fill();
    g.fillStyle = '#d2f4ff';
    g.beginPath(); g.ellipse(41.5, 21, 2.2, 1.4, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(50.5, 21, 2.2, 1.4, 0, 0, TAU); g.fill();
    g.restore();
  });
}

// Enemy skins only (Phase 27): playable sheets live in art/heroes.js. The `player` key
// is retired — nothing reads it (players draw from buildRoster()[charKey]).
// 33.4.3/33.4.4: the six common slots + both packed bosses + the m02 kitsune skin are
// packed (see above); the Great White and the remaining m02/m03 re-skin slots stay
// procedural — same keys, footprints and frame counts either way.
export function buildCharacters(levelKey) {
  const pk = loadPack();
  const enemy = (k) => (pk ? packedEnemy(pk, 'enemy.' + k) : blankEnemy(NODE_FALLBACK_ENEMY[k]));
  const out = {
    rat: enemy('rat'),
    bat: enemy('bat'),
    goblin: enemy('goblin'),
    wolf: enemy('wolf'),
    brute: enemy('brute'),
    cultist: enemy('cultist'),
    // 33.4.4: bosses packed in the browser (manifest entries); the drawn builders remain
    // as the Node-stub fallback so boot still constructs real art there. Shark stays
    // procedural entirely (user deferral).
    wraith: pk ? packedEnemy(pk, 'enemy.wraith') : { w: 92, h: 112, shadowR: 20, frames: [wraithFrame(0), wraithFrame(1)] },
    ryu: pk ? packedEnemy(pk, 'enemy.ryu') : { w: 96, h: 112, shadowR: 20, frames: [ryuFrame(0), ryuFrame(1)] },
    shark: { w: 96, h: 112, shadowR: 20, frames: [sharkFrame(0), sharkFrame(1)] },
  };
  if (levelKey === 'm02') {
    // Higan slot re-skins (A1) + Ryū boss (A5) — same footprints, mechanics unchanged
    out.rat = { w: 30, h: 26, shadowR: 8, frames: [tanukiFrame()] };
    out.bat = { w: 34, h: 28, shadowR: 8, frames: [hooiFrame(true), hooiFrame(false)] };
    out.goblin = { w: 30, h: 38, shadowR: 9, frames: [[3, 0], [0, 0], [-3, 0]].map(([l, r]) => shikomeFrame(l, r)) };
    // 33.4.4: the kitsune (wolf slot) packs from the F46 flame-fox (same pack as Ryū —
    // shared guest dialect); the drawn kitsune stays as the Node-stub fallback only.
    if (pk) out.wolf = packedEnemy(pk, 'skin.m02.wolf');
    else out.wolf = { w: 46, h: 32, shadowR: 11, frames: [[5, 0], [0, 5], [0, 0], [-5, 0]].map(([l, r]) => kitsuneFrame(l, r)) };
    out.brute = { w: 64, h: 60, shadowR: 14, frames: [oniFrame(0), oniFrame(1)] };
    out.cultist = { w: 32, h: 46, shadowR: 9, frames: [mikoFrame(0), mikoFrame(1)] };
    out.wraith = out.ryu; // boss key swap — the m02 boss IS Ryū
  }
  if (levelKey === 'm03') {
    // Drowned City slot re-skins (A1/A2) + Great White boss — same footprints, mechanics unchanged
    out.rat = { w: 30, h: 26, shadowR: 8, frames: [crabFrame()] };
    out.bat = { w: 34, h: 28, shadowR: 8, frames: [goldfishFrame(true), goldfishFrame(false)] };
    out.goblin = {
      w: 30, h: 38, shadowR: 9,
      frames: [mermanFrame(3, 0), mermaidFrame(0, 0), mermanFrame(-3, 0)], // merman + mermaid skins
    };
    out.wolf = {
      w: 46, h: 32, shadowR: 11,
      frames: [[5, 0], [0, 5], [0, 0], [-5, 0]].map(([l, r]) => stingrayFrame(l, r)),
    };
    out.brute = { w: 64, h: 60, shadowR: 14, frames: [orcaFrame(0), orcaFrame(1)] };
    out.cultist = { w: 32, h: 46, shadowR: 9, frames: [eelFrame(0), eelFrame(1)] };
    out.wraith = out.shark; // boss key swap — the m03 boss IS the Great White
  }
  return out;
}

// Playable-character roster art: RETIRED here in Phase 27 — buildRoster/buildGhost now
// live only in art/heroes.js (from-scratch sheets). Callers import from there.

// ── 29.9 Wolfpack companion art (NOT the enemy wolf skin) — 33.4.3 packed ─────────
// User law (29.9): the bonded pack must never read as enemy wolves. After the swap the
// pack shares the enemy wolf's SOURCE sheet (task ruling d: three coat variants via
// paletteSwap), so identity rides on the bigger 54×38 footprint vs the enemy's 46×32
// and the three distinct coats below; the pack draw path (combat.js) only ever consumes
// buildPackWolves(), never the enemy def, and each wolf's coat is its index identity:
// light brown / dark grey / dark brown (unchanged). The grey coat (#4a505a) vs the
// packed wolf's slate-blue body is the closest pair — flagged for the user's served-URL
// visual QA pass (A5 raised the same flag when both were procedural).
// Baked art (drawImage only) → boot radial stays 0 even if built in an instrumented frame.
export const PACK_PALS = [
  { body: '#b08256', dark: '#7c5a36', light: '#c9a06e', belly: '#e6d2ac' }, // light brown (1st)
  { body: '#4a505a', dark: '#2c3138', light: '#5d646f', belly: '#8b929c' }, // dark grey (2nd)
  { body: '#5b3d24', dark: '#38230f', light: '#77522f', belly: '#9a7448' }, // dark brown (3rd)
];
// Pack-coat recolour: split the wolf sheet's palette by luminance onto the four
// PACK_PALS tiers (deep shadow → dark, mid tones → body, lit planes → light, pale
// chest/eye flecks → belly). No hardcoded source hexes: every opaque colour maps by its
// luma, alpha untouched — same mechanism style as the ghost/elite ladder, four-way target.
function packTintMap(frame, pal) {
  const d = frame.getContext('2d').getImageData(0, 0, frame.width, frame.height);
  const map = {};
  for (let i = 0; i < d.data.length; i += 4) {
    if (!d.data[i + 3]) continue;
    const hex = '#' + [d.data[i], d.data[i + 1], d.data[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
    if (map[hex]) continue;
    const L = lumaOf(hex);
    map[hex] = L < 0.22 ? pal.dark : L < 0.5 ? pal.body : L < 0.78 ? pal.light : pal.belly;
  }
  return map;
}

// Pack sheet for combat's companion draws: frames indexed by wolf order
// (0 = light brown leader, 1 = dark grey, 2 = dark brown), 4-frame cycle from the
// entry.pack geometry (bob offsets baked — combat owns the clock, this module only
// bakes art).
export function buildPackWolves() {
  const pk = loadPack();
  if (!pk) {
    const mk = () => makeCanvas(54, 38);
    return { w: 54, h: 38, shadowR: 13, frames: PACK_PALS.map(() => [mk(), mk(), mk(), mk()]) };
  }
  const entry = pk.manifest.sprites['enemy.wolf'];
  const mk = () => makeCanvas(entry.pack.sheet.w, entry.pack.sheet.h);
  const sheet = { w: entry.pack.sheet.w, h: entry.pack.sheet.h, shadowR: entry.pack.sheet.shadowR, frames: PACK_PALS.map(() => Array.from({ length: entry.pack.frames }, mk)) };
  onArtReady(pk, () => {
    const art = sliceStrip(pk.images, entry, 'frames');
    PACK_PALS.forEach((pal, i) => bakeInto(sheet.frames[i], art, entry, entry.pack, (f) => packTintMap(f, pal)));
  });
  return sheet;
}

