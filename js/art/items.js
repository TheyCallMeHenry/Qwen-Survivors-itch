// Pickups, projectiles and card icons — pre-rendered sprites.

import { makeCanvas, glowSprite, shadowSprite, poly, roundRectPath, formShade } from './base.js';
import { loadPack, onArtReady, sliceStrip, paletteSwap, lumaTintMap } from './load.js';
import { CFG } from '../config.js';
import { TAU } from '../utils/math.js';

// Per-level pickup tints (13.10, A5): m01 = original, M02 gold-pink, M03 cyan.
// 22.3: the m03 heart moved from teal (≈ gem cyan at a glance) to warm coral —
// cool gems vs warm hearts is the strongest in-run discrimination, and coral
// keeps the underwater identity. Exported for the test-logic contrast invariant.
export const GEM_PAL = {
  m01: { glow: '94,234,212', stops: ['#25f2cf', '#0fb89b', '#0a6f60'], edge: 'rgba(6,60,50,0.6)' },
  m02: { glow: '255,196,128', stops: ['#ffd98a', '#ff9e7d', '#c94f6d'], edge: 'rgba(120,40,60,0.6)' },
  m03: { glow: '80,220,255', stops: ['#6fd8ff', '#1f9fd8', '#0d5f96'], edge: 'rgba(8,60,90,0.6)' },
};
export const HEART_PAL = {
  m01: { top: '#ff7d90', low: '#d42a4c', edge: 'rgba(90,10,30,0.65)' },
  m02: { top: '#ffb3a0', low: '#e0446e', edge: 'rgba(120,20,50,0.65)' },
  m03: { top: '#ff9d7e', low: '#e2503c', edge: 'rgba(110,30,25,0.65)' }, // 22.3 coral
};

// Per-level gem/heart pair (13.10): m01 default; unknown level falls back to m01.
export function gemHeartFor(levelKey) {
  return {
    gem: gemSprite(GEM_PAL[levelKey] || GEM_PAL.m01),
    heart: heartSprite(HEART_PAL[levelKey] || HEART_PAL.m01),
  };
}

// World XP gem (24×26 — the exact boot-asserted footprint). 33.4.6: packed from
// pickup.gem (rrfreelance blue-diamond cell) with the per-level identity tint (13.10,
// D-F2: colors unchanged — GEM_PAL stops[1] drives the shared luma ladder) + the same
// glow underlay. The procedural draw below stays as the Node/failed-image fallback
// (test-boot boots headless), painted over in place when the pack art decodes.
function gemSprite(pal = GEM_PAL.m01) {
  const c = makeCanvas(24, 26);
  const g = c.getContext('2d');
  const paintPacked = () => {
    const pk = loadPack();
    if (!pk) return;
    const paint = () => {
      const gg = c.getContext('2d');
      gg.clearRect(0, 0, 24, 26);
      gg.drawImage(glowSprite(11, pal.glow, 0.35), 0, -1);
      paintArt(gg, packCellArt(pk, 'pickup.gem', pal.stops[1]), 22, 24, 12, 13);
    };
    if (pk.ready) paint(); else onArtReady(pk, paint);
  };
  g.drawImage(glowSprite(11, pal.glow, 0.35), 0, -1);
  const grad = g.createLinearGradient(0, 2, 0, 24);
  grad.addColorStop(0, pal.stops[0]);
  grad.addColorStop(0.5, pal.stops[1]);
  grad.addColorStop(1, pal.stops[2]);
  g.fillStyle = grad;
  poly(g, [[12, 1], [21, 12], [12, 24], [3, 12]]);
  g.fill();
  // top facet
  g.fillStyle = 'rgba(230,255,250,0.5)';
  poly(g, [[12, 1], [3, 12], [12, 12]]);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.85)';
  g.fillRect(8, 6, 2, 2);
  g.strokeStyle = pal.edge;
  g.lineWidth = 1;
  poly(g, [[12, 1], [21, 12], [12, 24], [3, 12]]);
  g.stroke();
  paintPacked();
  return c;
}

// World heal heart (22×20 — the exact boot-asserted footprint). 33.4.6: packed from
// pickup.heart (rrfreelance red-heart cell); per-level tint = HEART_PAL.top ladder
// (22.3 cool-gems/warm-hearts discrimination kept). Procedural draw = Node fallback.
function heartSprite(pal = HEART_PAL.m01) {
  const c = makeCanvas(22, 20);
  const g = c.getContext('2d');
  const paintPacked = () => {
    const pk = loadPack();
    if (!pk) return;
    const paint = () => {
      const gg = c.getContext('2d');
      gg.clearRect(0, 0, 22, 20);
      paintArt(gg, packCellArt(pk, 'pickup.heart', pal.top), 22, 20, 11, 10);
    };
    if (pk.ready) paint(); else onArtReady(pk, paint);
  };
  const path = () => {
    g.beginPath();
    g.moveTo(11, 18.5);
    g.bezierCurveTo(1.5, 10.5, 0.5, 4.5, 5.5, 3.5);
    g.bezierCurveTo(9, 2.8, 11, 5.5, 11, 7);
    g.bezierCurveTo(11, 5.5, 13, 2.8, 16.5, 3.5);
    g.bezierCurveTo(21.5, 4.5, 20.5, 10.5, 11, 18.5);
    g.closePath();
  };
  const grad = g.createLinearGradient(0, 2, 0, 19);
  grad.addColorStop(0, pal.top);
  grad.addColorStop(1, pal.low);
  path();
  g.fillStyle = grad;
  g.fill();
  g.strokeStyle = pal.edge;
  g.lineWidth = 1;
  g.stroke();
  g.fillStyle = 'rgba(255,220,228,0.85)';
  g.beginPath(); g.ellipse(6.5, 6.5, 2.6, 1.8, -0.6, 0, TAU); g.fill();
  paintPacked();
  return c;
}

function boltSprite() {
  const c = makeCanvas(28, 12);
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(2, 0, 26, 0);
  grad.addColorStop(0, 'rgba(94,234,212,0)');
  grad.addColorStop(0.55, 'rgba(94,234,212,0.85)');
  grad.addColorStop(1, '#eafffb');
  g.strokeStyle = grad;
  g.lineWidth = 3.4;
  g.lineCap = 'round';
  g.beginPath(); g.moveTo(4, 6); g.lineTo(22, 6); g.stroke();
  g.strokeStyle = '#f2fffd';
  g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(8, 6); g.lineTo(22, 6); g.stroke();
  const head = glowSprite(7, '150,255,240', 0.9);
  g.drawImage(head, 22 - 7, 6 - 7);
  return c;
}

function orbSprite() {
  const c = makeCanvas(18, 18);
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(9, 9, 0, 9, 9, 9);
  grad.addColorStop(0, '#f3e8ff');
  grad.addColorStop(0.35, '#b07af0');
  grad.addColorStop(0.8, 'rgba(139,92,246,0.35)');
  grad.addColorStop(1, 'rgba(139,92,246,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 18, 18);
  return c;
}

function boomerangSprite() {
  const c = makeCanvas(40, 40);
  const g = c.getContext('2d');
  g.drawImage(glowSprite(18, '150,180,255', 0.30), 0, 0);
  g.strokeStyle = '#b9c6e8';
  g.lineWidth = 5;
  g.lineCap = 'round';
  g.beginPath();
  g.arc(20, 21, 13, Math.PI * 0.72, Math.PI * 2.28);
  g.stroke();
  g.strokeStyle = 'rgba(232,240,255,0.8)';
  g.lineWidth = 1.6;
  g.beginPath();
  g.arc(20, 21, 14.6, Math.PI * 0.78, Math.PI * 2.22);
  g.stroke();
  // spikes
  g.fillStyle = '#8fa2cc';
  for (const a of [Math.PI * 0.9, Math.PI * 1.6, Math.PI * 2.4]) {
    const x = 20 + Math.cos(a) * 13, y = 21 + Math.sin(a) * 13;
    g.beginPath();
    g.moveTo(x, y - 3.4); g.lineTo(x + 4.4, y); g.lineTo(x, y + 3.4);
    g.closePath(); g.fill();
    formShade(g, x - 1, y - 3.4, 5.4, 6.8, { shade: 0.26 }); // 24.9 metal spike lit top-left
  }
  return c;
}

function bladeSprite() {
  const c = makeCanvas(30, 30);
  const g = c.getContext('2d');
  g.drawImage(glowSprite(14, '94,234,212', 0.32), 0, 0);
  g.beginPath();
  g.arc(15, 15, 12, -1.15, 1.15);
  g.arc(15, 15, 6.5, 1.35, -1.35, true);
  g.closePath();
  const grad = g.createLinearGradient(4, 4, 26, 26);
  grad.addColorStop(0, '#e8f4ff');
  grad.addColorStop(1, '#7fa8d8');
  g.fillStyle = grad;
  g.fill();
  // 24.9 single top-left key light over the blade (path still current) so metal reads
  // lit from the same direction as every character/enemy body.
  formShade(g, 3, 3, 24, 24, { shade: 0.28 });
  g.strokeStyle = 'rgba(94,234,212,0.8)';
  g.lineWidth = 1.4;
  g.stroke();
  // A6: packed blade ← Sengoku thrown shuriken (world.blade; the engine already spins
  // blades at draw — the shuriken spin reads identically). Teal glow underlay re-painted.
  packOver(c, 'world.blade', 30, 30, 15, 15, (g2) => g2.drawImage(glowSprite(14, '94,234,212', 0.32), 0, 0));
  return c;
}

function bulletSprite() {
  // Twin Fangs tracer — small warm round (distinct from the cyan Moonbolt)
  const c = makeCanvas(20, 10);
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 5, 18, 5);
  grad.addColorStop(0, 'rgba(255,214,120,0)');
  grad.addColorStop(0.55, 'rgba(255,214,120,0.85)');
  grad.addColorStop(1, '#fff7e6');
  g.strokeStyle = grad;
  g.lineWidth = 3.2;
  g.lineCap = 'round';
  g.beginPath(); g.moveTo(2, 5); g.lineTo(16, 5); g.stroke();
  g.strokeStyle = '#fffdf5';
  g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(6, 5); g.lineTo(16, 5); g.stroke();
  const head = glowSprite(6, '255,220,150', 0.85);
  g.drawImage(head, 16 - 6, 5 - 6);
  return c;
}

function arrowSprite() {
  // 12.2: Bow & Arrow arrow — straight shaft, pointed tip, rear fletching
  const c = makeCanvas(30, 12);
  const g = c.getContext('2d');
  g.strokeStyle = '#c9b08a';
  g.lineWidth = 2.4;
  g.lineCap = 'round';
  g.beginPath(); g.moveTo(4, 6); g.lineTo(22, 6); g.stroke();
  g.fillStyle = '#e8eefc';
  g.beginPath(); g.moveTo(29, 6); g.lineTo(21, 2.6); g.lineTo(21, 9.4); g.closePath(); g.fill();
  g.strokeStyle = '#e8b45a';
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(4, 6); g.lineTo(7, 3.2);
  g.moveTo(6.5, 6); g.lineTo(9.5, 3.2);
  g.moveTo(4, 6); g.lineTo(7, 8.8);
  g.moveTo(6.5, 6); g.lineTo(9.5, 8.8);
  g.stroke();
  return c;
}

function bombSprite() {
  // Cartoon bomb: round black sphere, curved fuse wire out of the top, spark
  const c = makeCanvas(30, 34);
  const g = c.getContext('2d');
  g.strokeStyle = '#c9a35c';
  g.lineWidth = 2.4;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(15, 9);
  g.quadraticCurveTo(17, 3, 23, 2.5);
  g.stroke();
  const sp = glowSprite(5, '255,180,80', 0.9);
  g.drawImage(sp, 23 - 5, 2 - 5);
  g.fillStyle = '#ffd75e';
  g.beginPath(); g.arc(23, 2, 2.2, 0, TAU); g.fill();
  const grad = g.createRadialGradient(12, 15, 2, 15, 18, 12);
  grad.addColorStop(0, '#5a6478');
  grad.addColorStop(0.4, '#2c3140');
  grad.addColorStop(1, '#12141c');
  g.fillStyle = grad;
  g.beginPath(); g.arc(15, 18, 11, 0, TAU); g.fill();
  g.fillStyle = '#39404f';
  g.beginPath(); g.arc(15, 12, 4, 0, TAU); g.fill();
  g.fillStyle = 'rgba(232,240,255,0.5)';
  g.beginPath(); g.ellipse(11, 14, 2.6, 1.7, -0.6, 0, TAU); g.fill();
  // A6: Sunder bomb ← Sengoku horoku cannonball-and-fuse cell (no tint — the source IS
  // the black round bomb + rope fuse this builder was approximating). Arc/shadow draw
  // path in combat unchanged; 30×34 footprint kept.
  packOver(c, 'world.bomb', 30, 34, 15, 17);
  return c;
}

function snowballSprite() {
  // 12.3: packed snow ball — bright core, bumpy frost rim, cold speckles
  const c = makeCanvas(22, 22);
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(9, 9, 1, 11, 11, 10);
  grad.addColorStop(0, '#f4fbff');
  grad.addColorStop(0.6, '#cfe8fa');
  grad.addColorStop(1, '#8fb8d8');
  g.fillStyle = grad;
  g.beginPath(); g.arc(11, 11, 9, 0, TAU); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.85)';
  for (const [x, y, r] of [[6, 8, 2.2], [14, 6, 1.8], [16, 13, 2.0], [9, 15, 1.7]]) {
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  g.strokeStyle = 'rgba(140,190,225,0.6)';
  g.lineWidth = 1;
  g.beginPath(); g.arc(11, 11, 9, 0, TAU); g.stroke();
  return c;
}

// B3 (2026-10-26): shared baseball painter — white leather + the classic two-seam look
// (parenthesis arcs near each edge + short red stitch ticks). Both ball sprites use it;
// they differ only in the halo, so there is no near-twin duplicate (rule 16).
function drawStitchedBall(g, cx, cy, r) {
  const grad = g.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.15, cx, cy, r);
  grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.65, '#f4f0e6'); grad.addColorStop(1, '#c9c2b4');
  g.fillStyle = grad;
  g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(70,50,40,0.3)'; g.lineWidth = 1; g.stroke();
  for (const s of [1, -1]) {
    const scx = cx + s * r * 1.9, R = r * 1.5, mid = s > 0 ? Math.PI : 0;
    g.strokeStyle = '#c8352e'; g.lineWidth = Math.max(1, r * 0.14);
    g.beginPath(); g.arc(scx, cy, R, mid - 0.62, mid + 0.62); g.stroke();
    g.lineWidth = Math.max(0.8, r * 0.09);
    for (let i = -2; i <= 2; i++) {
      const a = mid + i * 0.24;
      g.beginPath();
      g.moveTo(scx + Math.cos(a) * R * 0.86, cy + Math.sin(a) * R * 0.86);
      g.lineTo(scx + Math.cos(a) * R * 1.16, cy + Math.sin(a) * R * 1.16);
      g.stroke();
    }
  }
}

function baseballSprite() {
  // B3: the Baseball Bat's line drive — stitched white ball. combat.draw spins it along
  // the flight, so the seams visibly rotate like a real baseball.
  const c = makeCanvas(16, 16);
  const g = c.getContext('2d');
  drawStitchedBall(g, 8, 8, 6.5);
  return c;
}

function baseballHomerunSprite() {
  // B3 HOMERUN ball (24.2 variant seam, v='homer'): the same ball under a hard rainbow
  // halo — the mid-flight tell that pairs with the fading rainbow trail dots (game.js
  // onFx 'balltrail' → particles).
  const c = makeCanvas(24, 24);
  const g = c.getContext('2d');
  const hues = ['#ff5a5a', '#ffaa46', '#f0dc5a', '#6ee182', '#5aaaff', '#a078f5'];
  g.lineWidth = 2.4;
  hues.forEach((col, i) => {
    g.strokeStyle = col;
    const a0 = (i * TAU) / hues.length;
    g.beginPath(); g.arc(12, 12, 10.6, a0 + 0.05, a0 + TAU / hues.length - 0.05); g.stroke();
  });
  drawStitchedBall(g, 12, 12, 7.5);
  return c;
}

function frostBurstSprite() {
  // 12.3: snowball impact — cold white/cyan flash, drawn additively and scaled to the
  // damage radius at runtime (same ≥1.0× ramp as the bomb flash, 23.2 rule)
  const c = makeCanvas(64, 64);
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 2, 32, 32, 31);
  grad.addColorStop(0, 'rgba(245,252,255,0.95)');
  grad.addColorStop(0.45, 'rgba(170,225,250,0.65)');
  grad.addColorStop(0.8, 'rgba(110,180,230,0.28)');
  grad.addColorStop(1, 'rgba(90,160,220,0)');
  g.fillStyle = grad;
  g.beginPath(); g.arc(32, 32, 31, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(235,248,255,0.7)';
  g.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + 0.4;
    g.beginPath();
    g.moveTo(32 + Math.cos(a) * 10, 32 + Math.sin(a) * 10);
    g.lineTo(32 + Math.cos(a) * 26, 32 + Math.sin(a) * 26);
    g.stroke();
  }
  // A6: snowball/avalanche impact ← magic9 Dark-Bolt splat re-toned cold (fx.frostBurst,
  // manifest ladder #bfe9f7). Additive + damage-radius scaling draw unchanged.
  packOver(c, 'fx.frostBurst', 64, 64, 32, 32);
  return c;
}

function sparkSprite() {
  // 12.4: lightning strike point — additive cyan-white star burst
  const c = makeCanvas(20, 20);
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(10, 10, 1, 10, 10, 9);
  grad.addColorStop(0, 'rgba(245,250,255,0.95)');
  grad.addColorStop(0.4, 'rgba(180,215,255,0.6)');
  grad.addColorStop(1, 'rgba(140,190,255,0)');
  g.fillStyle = grad;
  g.beginPath(); g.arc(10, 10, 9, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(235,245,255,0.9)';
  g.lineWidth = 1.4;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + 0.35;
    g.beginPath();
    g.moveTo(10 + Math.cos(a) * 2, 10 + Math.sin(a) * 2);
    g.lineTo(10 + Math.cos(a) * 9, 10 + Math.sin(a) * 9);
    g.stroke();
  }
  // A6: Chain-Lightning strike point ← magic9 spark star (electric-blue ladder).
  packOver(c, 'fx.spark', 20, 20, 10, 10);
  return c;
}

function flameSprite() {
  // Soft radial flame blob — drawn additively ('lighter') at runtime
  const c = makeCanvas(24, 24);
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(12, 14, 1, 12, 12, 11);
  grad.addColorStop(0, 'rgba(255,246,200,0.95)');
  grad.addColorStop(0.4, 'rgba(255,170,60,0.75)');
  grad.addColorStop(0.75, 'rgba(255,90,30,0.35)');
  grad.addColorStop(1, 'rgba(255,60,20,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 24, 24);
  // A6: Pyre flame stream ← magic9 Fire-bomb dome frame (hot, additive; the runtime
  // grow-then-fade ramp in combat.draw is untouched).
  packOver(c, 'fx.flame', 24, 24, 12, 12);
  return c;
}

function explosionSprite() {
  // Bomb AOE flash — white core → orange → transparent, scaled at runtime
  const c = makeCanvas(128, 128);
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 2, 64, 64, 62);
  grad.addColorStop(0, 'rgba(255,255,255,0.95)');
  grad.addColorStop(0.25, 'rgba(255,214,120,0.85)');
  grad.addColorStop(0.55, 'rgba(255,120,50,0.5)');
  grad.addColorStop(0.8, 'rgba(255,80,40,0.18)');
  grad.addColorStop(1, 'rgba(255,60,30,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  // A6: sunder-class AOE flash ← ansimuz CC0 explosion-1-c peak frame (hot palette kept;
  // additive + radius-scaled draw path unchanged, 23.2 ≥1.0× ramp untouched).
  packOver(c, 'fx.explosion', 128, 128, 64, 64);
  return c;
}

// Phase 21 (D96) projectile sprites — 31.4: the Homing Missile projectile (`missile`;
// 31.15 renamed the old `shell` sprite key with the weapon; rotates, faces +x), boulder
// (rotates, centered), web knot (no rotation).
function missileSprite() {
  // 31.4 Homing Missile projectile (re-bakes the 29.12 shell): ogive warhead with a
  // red nose, copper band, swept tail fins, a lit exhaust nozzle, and the SAME baked
  // fading tracer tail as the bolt/bullet/arrow — the eye follows the missile all the
  // way to its impact or its 10 s detonation (29.12's read-in-flight lesson unchanged).
  const c = makeCanvas(36, 14);
  const g = c.getContext('2d');
  // tracer tail: transparent at the back, amber heat where the body starts
  const tr = g.createLinearGradient(1, 7, 20, 7);
  tr.addColorStop(0, 'rgba(255,170,70,0)');
  tr.addColorStop(0.55, 'rgba(255,170,70,0.3)');
  tr.addColorStop(1, 'rgba(255,214,130,0.75)');
  g.strokeStyle = tr; g.lineWidth = 5.5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(2, 7); g.lineTo(19, 7); g.stroke();
  // exhaust flame at the nozzle (aft = −x): small hot plume
  const ex = g.createLinearGradient(13.5, 7, 19.5, 7);
  ex.addColorStop(0, 'rgba(255,120,30,0)'); ex.addColorStop(1, 'rgba(255,232,150,0.9)');
  g.fillStyle = ex;
  poly(g, [[13.5, 7], [19.5, 4.4], [19.5, 9.6]]);
  // swept tail fins above/below the aft end (missile cue, vs the shell's straight fins)
  g.fillStyle = '#8f3226';
  poly(g, [[19.5, 3.4], [15.5, 0.5], [20.5, 6]]);
  poly(g, [[19.5, 10.6], [15.5, 13.5], [20.5, 8]]);
  g.fill();
  // body: steel tube with an ogive warhead, nose toward +x (rotation anchor is the centre)
  const st = g.createLinearGradient(0, 2, 0, 12);
  st.addColorStop(0, '#cfd8e3'); st.addColorStop(0.45, '#8794a2'); st.addColorStop(1, '#3a434e');
  g.fillStyle = st;
  g.beginPath();
  g.moveTo(19.5, 3.4);
  g.lineTo(27, 3.4);
  g.quadraticCurveTo(35.5, 7, 27, 10.6);
  g.lineTo(19.5, 10.6);
  g.closePath();
  g.fill();
  // warhead: red nose cap over the ogive
  g.fillStyle = '#c0492f';
  g.beginPath();
  g.moveTo(29, 3.5); g.lineTo(27, 3.4);
  g.quadraticCurveTo(35.5, 7, 27, 10.6); g.lineTo(29, 10.5);
  g.quadraticCurveTo(33.5, 7, 29, 3.5);
  g.closePath();
  g.fill();
  // copper band at the warhead base + specular along the top deck
  g.fillStyle = '#c8863f'; g.fillRect(24.6, 3.5, 2.8, 7);
  g.strokeStyle = 'rgba(235,244,255,0.7)'; g.lineWidth = 1.2; g.lineCap = 'round';
  g.beginPath(); g.moveTo(21, 4.4); g.quadraticCurveTo(27, 4.1, 30.5, 5.4); g.stroke();
  g.strokeStyle = 'rgba(10,14,20,0.85)'; g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(19.5, 3.4);
  g.lineTo(27, 3.4);
  g.quadraticCurveTo(35.5, 7, 27, 10.6);
  g.lineTo(19.5, 10.6);
  g.closePath();
  g.stroke();
  return c;
}

// 29.12 (tag kept 31.4): the Homing Missile terminal blast — a HARD-EDGED eight-spike
// shock star over a gunmetal smoke ring, vs the Sunder bomb's soft round fireball.
// Shape (spikes + ring vs smooth orb) and palette (steel-white core over ember)
// differ; combat.draw gives it a snap-out-then-slam timing rhythm. Build-time only;
// consumed by combat's
// lazy fx cache (game.js does not wire it — the visual hookup lives in combat.js).
export function missileBlastSprite() {
  const c = makeCanvas(128, 128);
  const g = c.getContext('2d');
  // smoke ring: desaturated gunmetal (the missile blast's identity — no bomb ever has this)
  g.strokeStyle = 'rgba(146,158,174,0.42)'; g.lineWidth = 11;
  g.beginPath(); g.arc(64, 64, 54, 0, TAU); g.stroke();
  g.strokeStyle = 'rgba(58,68,82,0.4)'; g.lineWidth = 4;
  g.beginPath(); g.arc(64, 64, 47, 0, TAU); g.stroke();
  // shock star: 8 straight hard spikes, steel-white core → ember tips
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 58);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.3, 'rgba(226,238,252,0.95)');
  grad.addColorStop(0.62, 'rgba(255,158,72,0.8)');
  grad.addColorStop(1, 'rgba(196,74,32,0.12)');
  g.fillStyle = grad;
  g.beginPath();
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * TAU + 0.1;
    const rr = k % 2 ? 22 : 58;
    const x = 64 + Math.cos(a) * rr, y = 64 + Math.sin(a) * rr;
    k ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.closePath();
  g.fill();
  // steel hub
  g.fillStyle = 'rgba(255,255,255,0.9)';
  g.beginPath(); g.arc(64, 64, 9, 0, TAU); g.fill();
  // A6: the X-shock star becomes ansimuz explosion-1-g re-toned steel-white (the 29.12
  // hard-edged-vs-round identity vs the bomb fireball is carried by the different SHAPE);
  // the gunmetal smoke RINGS are the blast's other identity half → kept procedural under
  // the packed star (an `under` re-paint, not a packable cell).
  packOver(c, 'fx.blastStar', 96, 96, 64, 64, (g2) => {
    g2.strokeStyle = 'rgba(146,158,174,0.42)'; g2.lineWidth = 11;
    g2.beginPath(); g2.arc(64, 64, 54, 0, TAU); g2.stroke();
    g2.strokeStyle = 'rgba(58,68,82,0.4)'; g2.lineWidth = 4;
    g2.beginPath(); g2.arc(64, 64, 47, 0, TAU); g2.stroke();
  });
  return c;
}

// 29.10: Mirror Shield reflect-hit moment — a bright mirror ring + specular cross +
// a pair of outward chevrons reading "orb bounced back". Baked once; combat.draw
// blits it additively, scaling up and fading out at the reflect point.
export function reflectFlashSprite() {
  const c = makeCanvas(48, 48);
  const g = c.getContext('2d');
  const halo = g.createRadialGradient(24, 24, 1, 24, 24, 20);
  halo.addColorStop(0, 'rgba(230,246,255,0.85)');
  halo.addColorStop(0.5, 'rgba(150,205,255,0.35)');
  halo.addColorStop(1, 'rgba(120,180,255,0)');
  g.fillStyle = halo;
  g.beginPath(); g.arc(24, 24, 20, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(220,242,255,0.9)'; g.lineWidth = 2;
  g.beginPath(); g.arc(24, 24, 15, 0, TAU); g.stroke();
  // specular glint cross
  g.lineWidth = 1.4;
  g.beginPath();
  g.moveTo(24, 7); g.lineTo(24, 41);
  g.moveTo(7, 24); g.lineTo(41, 24);
  g.stroke();
  // outward bounce chevrons at opposite corners
  g.lineWidth = 2.2; g.lineCap = 'round';
  poly(g, [[7, 14], [13, 8], [19, 14]], false); g.stroke();
  poly(g, [[29, 34], [35, 40], [41, 34]], false); g.stroke();
  // A6: Mirror Shield reflect flash ← Sengoku ward-barrier rings (mirror-pale #dff2ff
  // ladder = the 29.10 pip identity). Additive blit + expand-fade draw unchanged.
  packOver(c, 'fx.reflectRing', 48, 48, 24, 24);
  return c;
}

// 30.2: Continuous-Laser scorch spark — the ONLY feedback a D21 sear gets (the foe never
// flashes by design). A small hot fleck burst: white-amber core, five unequal rays, and
// three flung micro-sparks, tinted toward the beam's pink identity so it reads as the
// laser's own contact point. Baked once; combat.draw blits it additively, popping small
// and flaring out over CFG.combat.scorchLife.
export function scorchSparkSprite() {
  const c = makeCanvas(24, 24);
  const g = c.getContext('2d');
  const core = g.createRadialGradient(12, 12, 0.5, 12, 12, 6);
  core.addColorStop(0, 'rgba(255,250,240,0.95)');
  core.addColorStop(0.45, 'rgba(255,176,120,0.55)');
  core.addColorStop(1, 'rgba(255,120,150,0)');
  g.fillStyle = core;
  g.beginPath(); g.arc(12, 12, 6, 0, TAU); g.fill();
  // rays: unequal lengths + slightly unequal angles = a fleck, not a symmetric star
  g.lineCap = 'round';
  const rays = [[0.35, 9.5], [1.42, 6.5], [2.4, 8.5], [3.6, 5.5], [4.7, 7.5], [5.6, 4.5]];
  for (const [a, len] of rays) {
    g.strokeStyle = len > 7 ? 'rgba(255,222,170,0.9)' : 'rgba(255,140,160,0.8)';
    g.lineWidth = len > 7 ? 1.6 : 1.1;
    g.beginPath();
    g.moveTo(12 + Math.cos(a) * 2, 12 + Math.sin(a) * 2);
    g.lineTo(12 + Math.cos(a) * len, 12 + Math.sin(a) * len);
    g.stroke();
  }
  // flung micro-sparks (the bits that read as motion)
  g.fillStyle = 'rgba(255,236,200,0.9)';
  g.beginPath(); g.arc(19.5, 8.5, 1.1, 0, TAU); g.fill();
  g.beginPath(); g.arc(6.5, 16.5, 0.9, 0, TAU); g.fill();
  g.beginPath(); g.arc(15.5, 19.5, 0.8, 0, TAU); g.fill();
  return c;
}
function boulderSprite() {
  const c = makeCanvas(68, 68);
  const g = c.getContext('2d');
  g.drawImage(glowSprite(22, '90,100,115', 0.18), 12, 12);
  const rg = g.createRadialGradient(28, 24, 6, 34, 34, 30);
  rg.addColorStop(0, '#c2cad4'); rg.addColorStop(0.55, '#7e8a99'); rg.addColorStop(1, '#3f4956');
  g.fillStyle = rg;
  poly(g, [[34, 6], [52, 12], [62, 30], [56, 52], [36, 62], [16, 50], [12, 26], [22, 12]]);
  g.fill();
  g.strokeStyle = 'rgba(16,20,26,0.8)'; g.lineWidth = 2.4; g.stroke();
  g.strokeStyle = 'rgba(28,34,42,0.75)'; g.lineWidth = 2; // facet cracks
  g.beginPath(); g.moveTo(26, 18); g.lineTo(36, 32); g.lineTo(28, 46); g.stroke();
  g.beginPath(); g.moveTo(36, 32); g.lineTo(52, 38); g.stroke();
  g.fillStyle = 'rgba(235,242,250,0.35)'; // top-left highlight facet
  poly(g, [[34, 6], [52, 12], [44, 22], [28, 16]]);
  g.fill();
  return c;
}
function webSprite() {
  const c = makeCanvas(18, 18);
  const g = c.getContext('2d');
  g.strokeStyle = 'rgba(235,242,250,0.9)'; g.lineWidth = 1.3; g.lineCap = 'round';
  const cx = 9, cy = 9;
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * TAU + 0.4;
    g.beginPath();
    g.moveTo(cx, cy);
    g.lineTo(cx + Math.cos(a) * 7, cy + Math.sin(a) * 7);
    g.stroke();
  }
  g.lineWidth = 1;
  g.beginPath(); g.arc(cx, cy, 4, 0, TAU); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.95)';
  g.beginPath(); g.arc(cx, cy, 1.8, 0, TAU); g.fill();
  return c;
}
function burnSprite() {
  // Small enemy-status flame (flicker is done at draw time)
  const c = makeCanvas(16, 16);
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(8, 10, 0.5, 8, 8, 7);
  grad.addColorStop(0, 'rgba(255,240,180,0.95)');
  grad.addColorStop(0.5, 'rgba(255,150,50,0.7)');
  grad.addColorStop(1, 'rgba(255,80,30,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 16, 16);
  return c;
}

function blightSprite() {
  // Green wisp for the blight status
  const c = makeCanvas(16, 16);
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(8, 8, 0.5, 8, 8, 7);
  grad.addColorStop(0, 'rgba(210,255,170,0.9)');
  grad.addColorStop(0.5, 'rgba(120,220,90,0.55)');
  grad.addColorStop(1, 'rgba(60,160,60,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 16, 16);
  return c;
}

// --- 24.3 synergy projectile variants (Phase 24 visual overhaul) -----------------
// One distinct sprite per synergy-bearing projectile, built once at load and looked
// up by the record's `v` tag (combat.draw). Same footprint as the base sprite so the
// runtime draw geometry stays identical; only palette + a shape accent change. The
// BASE sprites above are untouched → no-synergy path is byte-identical (rule: solo
// invariance). Palette per synergy matches its card identity (config.js SYNERGY_EFFECT).

// Shared tracer recolor for bolt/bullet-shaped variants (linear trail + hot head).
function tracerSprite(w, h, rgbTrail, rgbHead, glowRgb, accent) {
  const c = makeCanvas(w, h);
  const g = c.getContext('2d');
  const midY = h / 2;
  const grad = g.createLinearGradient(2, 0, w - 2, 0);
  grad.addColorStop(0, `rgba(${rgbTrail},0)`);
  grad.addColorStop(0.55, `rgba(${rgbTrail},0.9)`);
  grad.addColorStop(1, rgbHead);
  g.strokeStyle = grad;
  g.lineWidth = 3.4;
  g.lineCap = 'round';
  g.beginPath(); g.moveTo(4, midY); g.lineTo(w - 6, midY); g.stroke();
  // hot core line
  g.strokeStyle = accent;
  g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(8, midY); g.lineTo(w - 6, midY); g.stroke();
  const head = glowSprite(7, glowRgb, 0.9);
  g.drawImage(head, (w - 6) - 7, midY - 7);
  return c;
}

// Blight Moonbolt: violet poison trail + dripping venom glob at the head.
function boltBlightSprite() {
  const c = tracerSprite(28, 12, '168,90,255', '#f3e0ff', '190,120,255', 'rgba(243,224,255,0.9)');
  const g = c.getContext('2d');
  // venom drip below the head
  g.fillStyle = 'rgba(150,70,220,0.85)';
  g.beginPath(); g.arc(20, 9.5, 1.8, 0, TAU); g.fill();
  return c;
}

// Inferno bullet: deep ember-orange tracer with a flame flicker behind the head.
function bulletInfernoSprite() {
  const c = tracerSprite(20, 10, '255,110,40', '#fff0d0', '255,120,40', 'rgba(255,240,208,0.9)');
  const g = c.getContext('2d');
  // small flame lick above the trail
  g.fillStyle = 'rgba(255,150,60,0.7)';
  g.beginPath();
  g.moveTo(9, 5); g.quadraticCurveTo(6, 1.5, 4, 4); g.quadraticCurveTo(6, 5, 9, 5);
  g.fill();
  return c;
}

// Storm Volley bullet: electric blue-white tracer with a zigzag spark across the head.
function bulletStormSprite() {
  const c = tracerSprite(20, 10, '120,190,255', '#eaf6ff', '150,200,255', 'rgba(234,246,255,0.95)');
  const g = c.getContext('2d');
  // lightning zigzag over the head
  g.strokeStyle = 'rgba(210,235,255,0.95)';
  g.lineWidth = 1.4;
  g.beginPath();
  g.moveTo(11, 1.5); g.lineTo(14, 4); g.lineTo(12, 5); g.lineTo(16, 8.5);
  g.stroke();
  return c;
}

// Flaming Arrows: base arrow silhouette wrapped in a flame gradient + fire tip.
function arrowFlamingSprite() {
  const c = makeCanvas(30, 12);
  const g = c.getContext('2d');
  // shaft wrapped in fire
  const grad = g.createLinearGradient(4, 6, 24, 6);
  grad.addColorStop(0, '#7a2b0a');
  grad.addColorStop(0.6, '#ff7a1a');
  grad.addColorStop(1, '#ffd873');
  g.strokeStyle = grad;
  g.lineWidth = 2.8;
  g.lineCap = 'round';
  g.beginPath(); g.moveTo(4, 6); g.lineTo(22, 6); g.stroke();
  // burning head
  g.fillStyle = '#fff0c8';
  g.beginPath(); g.moveTo(29, 6); g.lineTo(21, 2.6); g.lineTo(21, 9.4); g.closePath(); g.fill();
  // flame licks trailing off the shaft
  g.fillStyle = 'rgba(255,140,40,0.6)';
  for (const [x, y] of [[8, 3], [13, 9], [17, 3]]) {
    g.beginPath();
    g.moveTo(x, y); g.quadraticCurveTo(x - 2, y + (y < 6 ? -3 : 3), x - 4, y);
    g.quadraticCurveTo(x - 2, y, x, y);
    g.fill();
  }
  return c;
}

// Heart-Piercer arrow: cold steel/cyan shaft with a longer crystalline head.
function arrowPiercerSprite() {
  const c = makeCanvas(30, 12);
  const g = c.getContext('2d');
  g.strokeStyle = '#9fd8e6';
  g.lineWidth = 2.4;
  g.lineCap = 'round';
  g.beginPath(); g.moveTo(4, 6); g.lineTo(22, 6); g.stroke();
  // elongated crystal head (pierces further)
  const grad = g.createLinearGradient(20, 6, 30, 6);
  grad.addColorStop(0, '#bff2ff');
  grad.addColorStop(1, '#ffffff');
  g.fillStyle = grad;
  g.beginPath(); g.moveTo(30, 6); g.lineTo(20, 3.4); g.lineTo(20, 8.6); g.closePath(); g.fill();
  // cold fletching
  g.strokeStyle = '#7fd0e0';
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(4, 6); g.lineTo(7, 3.2);
  g.moveTo(6.5, 6); g.lineTo(9.5, 3.2);
  g.moveTo(4, 6); g.lineTo(7, 8.8);
  g.moveTo(6.5, 6); g.lineTo(9.5, 8.8);
  g.stroke();
  return c;
}

// Napalm bomb: dark crimson casing + burning dripping fuse (fire replaces the spark).
function bombNapalmSprite() {
  const c = makeCanvas(30, 34);
  const g = c.getContext('2d');
  // burning fuse
  g.strokeStyle = '#8a3a1c';
  g.lineWidth = 2.4;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(15, 9);
  g.quadraticCurveTo(17, 3, 23, 2.5);
  g.stroke();
  // flame at the fuse tip (instead of the yellow spark)
  const fl = glowSprite(6, '255,110,40', 0.95);
  g.drawImage(fl, 23 - 6, 2 - 6);
  g.fillStyle = '#ffd873';
  g.beginPath(); g.arc(23, 2, 2.2, 0, TAU); g.fill();
  // crimson casing (form-shaded from the top-left key)
  const grad = g.createRadialGradient(12, 15, 2, 15, 18, 12);
  grad.addColorStop(0, '#a8462e');
  grad.addColorStop(0.45, '#5c1c14');
  grad.addColorStop(1, '#200a08');
  g.fillStyle = grad;
  g.beginPath(); g.arc(15, 18, 11, 0, TAU); g.fill();
  // drip of burning gel
  g.fillStyle = 'rgba(255,140,50,0.7)';
  g.beginPath(); g.arc(20, 24, 2.2, 0, TAU); g.fill();
  // top-left rim highlight (light convention)
  g.fillStyle = 'rgba(255,190,150,0.5)';
  g.beginPath(); g.ellipse(11, 14, 2.6, 1.7, -0.6, 0, TAU); g.fill();
  // A6: napalm variant = the SAME world.bomb cell under its crimson card identity
  // (#a8462e = this builder's casing palette; manifest tint IS the slot, blueFlame law).
  packOver(c, 'world.bomb.napalm', 30, 34, 15, 17);
  return c;
}

// Blue-Flame snowball: cold blue core with a hotter cyan-white rim and frozen speckles.
function snowballBlueSprite() {
  const c = makeCanvas(22, 22);
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(9, 9, 1, 11, 11, 10);
  grad.addColorStop(0, '#eafcff');
  grad.addColorStop(0.55, '#5fd0ff');
  grad.addColorStop(1, '#1a6fd8');
  g.fillStyle = grad;
  g.beginPath(); g.arc(11, 11, 9, 0, TAU); g.fill();
  // icy shard speckles
  g.fillStyle = 'rgba(240,252,255,0.9)';
  for (const [x, y, r] of [[6, 8, 2.2], [14, 6, 1.8], [16, 13, 2.0], [9, 15, 1.7]]) {
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  // cold rim glow
  g.strokeStyle = 'rgba(140,220,255,0.8)';
  g.lineWidth = 1.2;
  g.beginPath(); g.arc(11, 11, 9, 0, TAU); g.stroke();
  return c;
}

// 19.1 HUD equipment chip: blit a buildIcons() icon into a target canvas backing store
// at `css` CSS-px with device-pixel-ratio baked once (crisp on HiDPI, no per-frame work).
export function drawIconScaled(target, icon, css, dpr) {
  const px = Math.max(1, Math.round(css * dpr));
  target.width = px; target.height = px;
  const g = target.getContext('2d');
  g.clearRect(0, 0, px, px);
  g.imageSmoothingEnabled = true;
  g.drawImage(icon, 0, 0, icon.width, icon.height, 0, 0, px, px);
}

// Card icons (72x72) for level-up UI.
// 28.1 ground-up redesign: every silhouette redrawn from scratch — bolder motifs,
// stronger silhouettes, layer-by-layer shading. Category plates unchanged
// (weapon = teal · passive = amber · synergy = violet) so the card DOM still codes.
const PLATE = {
  weapon: { bgA: '#0f2a30', bgB: '#07161d', line: 'rgba(94,234,212,0.55)', hi: 'rgba(94,234,212,0.16)' },
  passive: { bgA: '#2c2114', bgB: '#1a1207', line: 'rgba(245,198,107,0.55)', hi: 'rgba(245,198,107,0.14)' },
  synergy: { bgA: '#251633', bgB: '#150b21', line: 'rgba(190,140,255,0.6)', hi: 'rgba(190,140,255,0.16)' },
  // 18.x: level-up screen actions (Phase 18) — soul-blue plates
  action: { bgA: '#14202c', bgB: '#0a121c', line: 'rgba(140,190,255,0.55)', hi: 'rgba(140,190,255,0.14)' },
};
// ── 33.4.6 packed icon/pickup art (A5) ─────────────────────────────────────────
// Shared machinery for drawing ONE manifest cell (icon.* / pickup.* slot) onto a
// canvas: slice the single-cell strip → optional entry.tint recolour via the shared
// luma ladder → trim the cell's padding to its opaque content box → nearest-neighbour
// fit into a box on the target canvas. Why trim+fit at paint time instead of declared
// rects: pack cells ship with per-icon padding; measuring the content keeps every
// motif the same visual size without hand-authored trims per cell (the frame geometry
// itself is gated on-disk by tools/test-art.mjs). Callers gate: in Node loadPack() is
// null and no paint runs (drawn fallback / plate stays), and packCellArt throws only on
// a manifest slot that does not exist — a wiring bug, which test-art proves cannot ship.
function packCellArt(pk, slot, tintHex) {
  const entry = pk.manifest.sprites[slot];
  if (!entry) throw new Error('missing manifest slot: ' + slot);
  const [f] = sliceStrip(pk.images, entry, 'art');
  return tintHex ? paletteSwap(f, lumaTintMap(f, tintHex)) : f;
}

// Same cell, tint read from the manifest entry (data-side element recolour, rule 5 —
// world/FX slots declare their ladder hex in sprites.json; test-art pins the hexes).
function packSlot(pk, slot) {
  return packCellArt(pk, slot, pk.manifest.sprites[slot].tint);
}

// 33.4.7 (A6) shared packed-repaint for world/FX sprites. Same deferred model as the
// gem/heart bakes (33.4.6): the procedural draw above is the Node/failed-image fallback
// (headless boot builds real pixels at the exact footprint), and the pack's single cell
// repaints THAT SAME canvas in place once pixels decode — the engine never sees a new
// object, and footprint, fit geometry and draw-call count never change (D-F2 perf law).
// `under` optionally re-paints non-image layers (e.g. glow/ring underlays) under the
// packed art. FX canvases are consumed by 'lighter' blits: pack cells are transparent-
// background, so the additive glow pass semantics are identical to the procedural ones.
function packOver(c, slot, fitW, fitH, cx, cy, under) {
  const pk = loadPack();
  if (!pk) return;
  const paint = () => {
    const g = c.getContext('2d');
    g.clearRect(0, 0, c.width, c.height);
    if (under) under(g);
    paintArt(g, packSlot(pk, slot), fitW, fitH, cx, cy);
  };
  if (pk.ready) paint(); else onArtReady(pk, paint);
}

// Opaque-pixel bbox of a sliced cell: [x, y, w, h]; null when fully transparent.
function contentBox(f) {
  const d = f.getContext('2d').getImageData(0, 0, f.width, f.height).data;
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
  for (let y = 0; y < f.height; y++) for (let x = 0; x < f.width; x++)
    if (d[(y * f.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return x1 < 0 ? null : [x0, y0, x1 - x0 + 1, y1 - y0 + 1];
}

// Paint the trimmed art centred in a fitW×fitH zone centred at (cx, cy) on g.
function paintArt(g, f, fitW, fitH, cx, cy) {
  const box = contentBox(f);
  if (!box) return;
  const [x, y, w, h] = box;
  const s = Math.min(fitW / w, fitH / h);
  const dw = Math.max(1, Math.round(w * s)), dh = Math.max(1, Math.round(h * s));
  g.imageSmoothingEnabled = false;
  g.drawImage(f, x, y, w, h, Math.round(cx - dw / 2), Math.round(cy - dh / 2), dw, dh);
}

export function buildIcons() {
  const icons = {};
  const pk = loadPack(); // null in Node: packed icon slots keep plate-only canvases (boot asserts footprints only); test-art pins the manifest
  // Category plate + soft glow behind the silhouette (build-time only).
  const paintPlate = (g, kind) => {
    const p = PLATE[kind] || PLATE.weapon;
    roundRectPath(g, 4, 4, 64, 64, 15);
    const bg = g.createLinearGradient(0, 4, 0, 68);
    bg.addColorStop(0, p.bgA); bg.addColorStop(1, p.bgB);
    g.fillStyle = bg; g.fill();
    g.strokeStyle = p.line; g.lineWidth = 2; g.stroke();
    // top-left inner highlight + soft center glow under the silhouette
    const hl = g.createLinearGradient(8, 8, 40, 40);
    hl.addColorStop(0, p.hi); hl.addColorStop(1, 'rgba(255,255,255,0)');
    roundRectPath(g, 6, 6, 60, 60, 13);
    g.fillStyle = hl; g.fill();
    g.drawImage(glowSprite(26, kind === 'synergy' ? '190,140,255' : kind === 'passive' ? '245,198,107' : '120,150,220', 0.14), 10, 10);
  };
  const make = (kind, fn) => {
    const c = makeCanvas(72, 72);
    const g = c.getContext('2d');
    paintPlate(g, kind);
    if (fn) fn(g);
    return c;
  };
  // 33.4.6: pack-sourced silhouette. The cell art is painted over the plate at
  // art-ready (deferred model in load.js) — before that, or when the image failed,
  // the canvas keeps its plate. fit zone: 52×52 centred (plate border stays visible).
  const packDraw = (kind, slot) => (g) => {
    if (!pk) return;
    const paint = () => {
      const gg = g.canvas.getContext('2d');
      gg.clearRect(0, 0, 72, 72);
      paintPlate(gg, kind);
      paintArt(gg, packCellArt(pk, slot), 52, 52, 36, 36);
    };
    if (pk.ready) paint(); else onArtReady(pk, paint);
  };

  // ---- shared drawing helpers (build-time only) --------------------------
  const seg = (g, pts) => { g.beginPath(); for (let i = 0; i < pts.length; i++) i ? g.lineTo(pts[i][0], pts[i][1]) : g.moveTo(pts[i][0], pts[i][1]); g.stroke(); };
  const dot = (g, x, y, r, fill) => { g.fillStyle = fill; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); };
  // four-point glint: axis ticks centered on (x,y)
  const glint = (g, x, y, r, color, w = 1.4) => {
    g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round';
    g.beginPath();
    g.moveTo(x - r, y); g.lineTo(x + r, y);
    g.moveTo(x, y - r); g.lineTo(x, y + r);
    g.stroke();
  };
  // classic zigzag lightning polygon from (x,top) down `drop` px
  const boltShape = (g, x, top, drop, w = 1) => {
    const pts = [[0.5, 0], [0.08, 0.44], [0.38, 0.44], [0.22, 1], [0.92, 0.4], [0.56, 0.4], [0.98, 0]];
    g.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const px = x - w / 2 + pts[i][0] * w, py = top + pts[i][1] * drop;
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.closePath();
  };
  // teardrop flame with tip at (x,y), bulb centered below, `h` tall, leaning `lean` rad
  const flameShape = (g, x, y, h, lean = 0) => {
    const cx = x + Math.sin(lean) * h * 0.28;
    const cy = y + h * 0.62;
    const r = h * 0.34;
    g.beginPath();
    g.moveTo(x, y);
    g.bezierCurveTo(x + r * 0.9 + Math.sin(lean) * r, y + h * 0.3, cx + r, cy - r * 0.2, cx, cy + r);
    g.bezierCurveTo(cx - r, cy - r * 0.2, x - r * 0.9 + Math.sin(lean) * r, y + h * 0.3, x, y);
    g.closePath();
  };

  // ================= WEAPONS ==============================================
  icons.wand = make('weapon', packDraw('weapon', 'icon.wand'));

  icons.garlic = make('weapon', packDraw('weapon', 'icon.garlic'));

  icons.axe = make('weapon', packDraw('weapon', 'icon.axe'));

  icons.blades = make('weapon', packDraw('weapon', 'icon.blades'));

  icons.fangs = make('weapon', (g) => {
    // Twin revolvers crossed in an X: muzzles high-out, wooden grips crossed low-center.
    // Dark outline per gun keeps the two silhouettes legible against each other at 72px.
    const OL = 'rgba(9,13,24,0.9)';
    const revolver = (x, y, rot, dim) => {
      g.save(); g.translate(x, y); g.rotate(rot);
      const metal = g.createLinearGradient(0, -9, 0, 14);
      if (dim) { metal.addColorStop(0, '#96a6cc'); metal.addColorStop(0.55, '#6a7cab'); metal.addColorStop(1, '#414f70'); }
      else { metal.addColorStop(0, '#d6e2f8'); metal.addColorStop(0.55, '#93a9d9'); metal.addColorStop(1, '#5a6b93'); }
      g.lineJoin = 'round';
      // grip first (wood, hangs down-back), outlined so it reads as its own part
      g.fillStyle = dim ? '#5c3d24' : '#7c542f';
      g.beginPath();
      g.moveTo(-5, -2); g.lineTo(3, -2); g.lineTo(-1, 17); g.lineTo(-9, 15);
      g.closePath(); g.fill();
      g.strokeStyle = OL; g.lineWidth = 2; g.stroke();
      // trigger guard
      g.strokeStyle = metal; g.lineWidth = 2.6;
      g.beginPath(); g.arc(0, 5.5, 4.6, -0.35, Math.PI * 0.72); g.stroke();
      // frame + barrel pointing +x, with front sight nub
      g.fillStyle = metal;
      g.beginPath();
      g.moveTo(-6, -8); g.lineTo(25, -6.5); g.lineTo(25, 1.5); g.lineTo(-6, 2.5);
      g.closePath(); g.fill(); g.strokeStyle = OL; g.lineWidth = 2; g.stroke();
      g.fillStyle = metal; g.fillRect(20, -9.5, 2.2, 3); // sight
      // cylinder in front of the frame, keyed with a dark center + flute
      g.fillStyle = metal;
      g.beginPath(); g.arc(-0.5, -3.2, 6.2, 0, TAU); g.fill();
      g.strokeStyle = OL; g.lineWidth = 2; g.stroke();
      dot(g, -0.5, -3.2, 2.3, 'rgba(22,29,50,0.85)');
      g.strokeStyle = 'rgba(30,40,66,0.5)'; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(-3.5, -7.5); g.lineTo(-3.5, 1); g.stroke(); // cylinder flute
      // muzzle bore
      dot(g, 24.5, -2.5, 1.7, '#141c30');
      // hammer nub at the back-top
      g.fillStyle = metal;
      poly(g, [[-6, -8], [-8.5, -11.5], [-4, -10.5]]); g.fill();
      g.restore();
    };
    // back gun (dimmer, muzzle up-left) then front gun (bright, muzzle up-right)
    revolver(31, 45, Math.PI + 0.8, true);
    revolver(42, 45, -0.8, false);
    glint(g, 13, 22, 2.8, 'rgba(255,236,170,0.9)');
    glint(g, 60, 22, 2.4, 'rgba(255,236,170,0.7)');
  });

  icons.bombs = make('weapon', packDraw('weapon', 'icon.bombs'));

  icons.pyre = make('weapon', packDraw('weapon', 'icon.pyre'));

  icons.snowball = make('weapon', packDraw('weapon', 'icon.snowball'));

  icons.ringLightning = make('weapon', packDraw('weapon', 'icon.ringLightning'));

  icons.bow = make('weapon', packDraw('weapon', 'icon.bow'));

  // ================= PASSIVES =============================================
  icons.boots = make('passive', packDraw('passive', 'icon.boots'));

  icons.heart = make('passive', packDraw('passive', 'icon.heart'));

  icons.sword = make('passive', packDraw('passive', 'icon.sword'));

  icons.magnet = make('passive', (g) => {
    // Horseshoe magnet tilted right: red body, silver poles, field lines + pulled iron filings
    for (const [r, a] of [[26, 0.5], [31, 0.28]]) {
      g.strokeStyle = `rgba(245,198,107,${a})`; g.lineWidth = r > 28 ? 1.5 : 2;
      g.beginPath(); g.arc(36, 34, r, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    }
    g.save(); g.translate(36, 38); g.rotate(-0.35);
    const body = g.createLinearGradient(-16, -18, 16, 14);
    body.addColorStop(0, '#ff8a76'); body.addColorStop(0.5, '#dd4c4c'); body.addColorStop(1, '#9c2b34');
    g.strokeStyle = body; g.lineWidth = 11; g.lineCap = 'butt';
    g.beginPath(); g.arc(0, -4, 15, Math.PI, 0); g.stroke();
    seg(g, [[-15, -4], [-15, 12]]); seg(g, [[15, -4], [15, 12]]);
    // rim light on the arch back
    g.strokeStyle = 'rgba(255,200,180,0.5)'; g.lineWidth = 2;
    g.beginPath(); g.arc(0, -4, 19.5, Math.PI * 1.15, Math.PI * 1.6); g.stroke();
    // pole caps (silver) with bevels
    const cap = g.createLinearGradient(0, 8, 0, 15);
    cap.addColorStop(0, '#f2f5ff'); cap.addColorStop(1, '#a9b4cf');
    g.fillStyle = cap;
    roundRectPath(g, -20.5, 8, 11, 7, 1.5); g.fill();
    roundRectPath(g, 9.5, 8, 11, 7, 1.5); g.fill();
    g.restore();
    // iron filings pulled toward the poles
    for (const [x, y] of [[30, 62], [38, 65], [45, 60], [25, 57]]) {
        dot(g, x, y, 1.5, 'rgba(180,196,230,0.85)');
    }
  });

  icons.sigil = make('passive', packDraw('passive', 'icon.sigil'));

  icons.gem = make('passive', packDraw('passive', 'icon.gem'));

  icons.dash = make('passive', (g) => {
    // Phantom Step: two ghost afterimages dissolving into motion streaks behind a runner
    // silhouette leaning at full sprint
    g.strokeStyle = 'rgba(94,234,212,0.45)'; g.lineWidth = 2.6; g.lineCap = 'round';
    for (const [y, x0, len] of [[27, 6, 16], [36, 4, 22], [45, 8, 18]]) seg(g, [[x0, y], [x0 + len, y]]);
    // dissolving afterimage ghosts
    for (const [x, r, a] of [[20, 3.2, 0.28], [28, 4, 0.45]]) {
      g.strokeStyle = `rgba(94,234,212,${a + 0.2})`; g.lineWidth = 1.6;
      g.beginPath(); g.arc(x, 37, r + 4, Math.PI * 0.6, Math.PI * 1.4); g.stroke();
      dot(g, x, 33, r * 0.5, `rgba(94,234,212,${a})`);
    }
    // runner silhouette: forward-leaning torso, head, driving legs
    const runner = '#5eead4';
    dot(g, 48, 27, 4.6, runner);
    g.strokeStyle = runner; g.lineWidth = 6; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(46, 33); g.lineTo(50, 41); g.stroke(); // torso lean
    g.beginPath(); g.moveTo(50, 41); g.lineTo(42, 48); g.lineTo(47, 56); g.stroke(); // back leg trailing
    g.beginPath(); g.moveTo(50, 41); g.lineTo(58, 46); g.lineTo(55, 55); g.stroke(); // front leg driving
    g.lineWidth = 4.5;
    g.beginPath(); g.moveTo(47, 35); g.lineTo(40, 39); g.stroke(); // arm pumping back
    g.beginPath(); g.moveTo(47, 35); g.lineTo(56, 37); g.stroke(); // arm forward
    // spark head + speed chevrons trailing the figure
    const head = g.createRadialGradient(52, 28, 1, 54, 30, 8);
    head.addColorStop(0, '#ffffff'); head.addColorStop(0.5, '#9cf2e2'); head.addColorStop(1, 'rgba(94,234,212,0)');
    g.fillStyle = head; g.beginPath(); g.arc(54, 30, 8, 0, TAU); g.fill();
  });

  // ================= SYNERGIES ============================================
  icons.blight = make('synergy', packDraw('synergy', 'icon.blight'));

  icons.tempest = make('synergy', packDraw('synergy', 'icon.tempest'));

  icons.inferno = make('synergy', packDraw('synergy', 'icon.inferno'));

  icons.napalm = make('synergy', packDraw('synergy', 'icon.napalm'));

  icons.phoenix = make('synergy', (g) => {
    // Phoenix Heart: flame-plumed heart rising, split flame wings sweeping up from behind it
    g.strokeStyle = 'rgba(255,140,59,0.45)'; g.lineWidth = 2;
    g.beginPath(); g.arc(36, 38, 27, 0, TAU); g.stroke();
    // flame wings: layered feathers sweeping up-outward
    for (const flip of [1, -1]) {
      g.save(); g.translate(36, 34); g.scale(flip, 1);
      const wing = g.createLinearGradient(10, -28, 30, 0);
      wing.addColorStop(0, '#ffcf6a'); wing.addColorStop(1, 'rgba(255,110,40,0.7)');
      g.fillStyle = wing;
      for (const [base, len] of [[8, 30], [15, 26], [22, 21]]) {
        g.beginPath();
        g.moveTo(base, 2);
        g.quadraticCurveTo(base + len * 0.35, -len * 0.55, base + len * 0.85, -len);
        g.quadraticCurveTo(base + len * 0.7, -len * 0.25, base + 6, 3);
        g.closePath(); g.fill();
      }
      g.restore();
    }
    const hp2 = () => {
      g.beginPath();
      g.moveTo(36, 60);
      g.bezierCurveTo(14, 44.5, 13.5, 27, 22, 24.5);
      g.bezierCurveTo(27.5, 23, 36, 27.5, 36, 31);
      g.bezierCurveTo(36, 27.5, 44.5, 23, 50, 24.5);
      g.bezierCurveTo(58.5, 27, 58, 44.5, 36, 60);
      g.closePath();
    };
    hp2();
    const hg = g.createLinearGradient(15, 24, 15, 62);
    hg.addColorStop(0, '#ffd76a'); hg.addColorStop(0.5, '#ff7a3a'); hg.addColorStop(1, '#c92e2e');
    g.fillStyle = hg; g.fill();
    formShade(g, 15, 24, 42, 38, { shade: 0.2, rim: 'rgba(255,220,160,0.45)' });
    hp2(); g.strokeStyle = 'rgba(140,30,20,0.55)'; g.lineWidth = 1.5; g.stroke();
    // flame crest licking off the top of the heart + rising embers
    flameShape(g, 36, 17, 15, 0); g.fillStyle = 'rgba(255,210,110,0.9)'; g.fill();
    flameShape(g, 36, 22, 8, 0); g.fillStyle = '#fff2c4'; g.fill();
    for (const [x, y, r] of [[15, 17, 1.7], [57, 19, 1.4], [12, 33, 1.2], [60, 31, 1.1]]) {
      dot(g, x, y, r, 'rgba(255,200,110,0.9)');
    }
  });

  icons.flamingArrows = make('synergy', (g) => {
    // Flaming Arrows: triple fletched shafts fanned up-right, steel heads, flames sheathing the flight
    const arrow = (x0, y0, rot, dim) => {
      g.save(); g.translate(x0, y0); g.rotate(rot);
      const shaftG = g.createLinearGradient(0, 0, 34, 0);
      shaftG.addColorStop(0, dim ? '#5c4123' : '#8f6a3c'); shaftG.addColorStop(1, dim ? '#8a6a44' : '#d9c08e');
      g.strokeStyle = shaftG; g.lineWidth = 3.2; g.lineCap = 'round';
      seg(g, [[0, 0], [34, 0]]);
      // nock + two feather vanes swept back
      g.fillStyle = dim ? 'rgba(200,160,90,0.7)' : '#e8b45a';
      for (const s of [1, -1]) {
        g.beginPath(); g.moveTo(3, 0);
        g.quadraticCurveTo(-4, 2 * s, -7, 6 * s); g.lineTo(1, 1.5 * s);
        g.closePath(); g.fill();
      }
      // steel broadhead
      const hs = g.createLinearGradient(34, -5, 46, 4);
      hs.addColorStop(0, dim ? '#b9c8e0' : '#f2f8ff'); hs.addColorStop(1, dim ? '#7689b5' : '#9fb4d8');
      g.fillStyle = hs;
      poly(g, [[34, -4.5], [46, 0], [34, 4.5]]); g.fill();
      g.strokeStyle = 'rgba(120,90,50,0.8)'; g.lineWidth = 1;
      seg(g, [[34, -4.5], [40, 0], [34, 4.5]]); // barbed shoulder line
      g.restore();
    };
    // fanned trio: distinct angles so three shafts read at 72px
    arrow(10, 56, -Math.PI / 4 + 0.2, true);
    arrow(20, 62, -Math.PI / 4 - 0.16, true);
    arrow(16, 54, -Math.PI / 4, false);  // front hero shaft
    // flames hugging the hero shaft's flight and licking its head
    for (const [x, y, h] of [[40, 38, 13], [32, 46, 9]]) { flameShape(g, x, y, h, -0.7); g.fillStyle = 'rgba(255,140,50,0.8)'; g.fill(); }
    flameShape(g, 53, 14, 14, -0.3); g.fillStyle = '#ffc85e'; g.fill();
    flameShape(g, 53, 20, 7, -0.3); g.fillStyle = '#fff2c4'; g.fill();
    dot(g, 46, 11, 1.4, 'rgba(255,210,120,0.9)'); dot(g, 62, 27, 1.3, 'rgba(255,210,120,0.8)');
  });

  icons.heartPiercer = make('synergy', (g) => {
    // Heart-Piercer: thorned rose-heart skewered by a crystal lance, entry spark + exit shards
    const hp3 = () => {
      g.beginPath();
      g.moveTo(36, 55);
      g.bezierCurveTo(12, 40, 11.5, 22, 21, 19.5);
      g.bezierCurveTo(27.5, 18, 36, 22.5, 36, 26);
      g.bezierCurveTo(36, 22.5, 44.5, 18, 51, 19.5);
      g.bezierCurveTo(60.5, 22, 60, 40, 36, 55);
      g.closePath();
    };
    hp3();
    const hg = g.createLinearGradient(16, 16, 16, 54);
    hg.addColorStop(0, '#ff9a8a'); hg.addColorStop(0.55, '#d43548'); hg.addColorStop(1, '#7e1b2a');
    g.fillStyle = hg; g.fill();
    formShade(g, 16, 16, 40, 38, { shade: 0.22, rim: 'rgba(255,190,200,0.4)' });
    hp3(); g.strokeStyle = 'rgba(90,12,30,0.6)'; g.lineWidth = 1.5; g.stroke();
    // thorns at the lobes
    g.fillStyle = '#5e7a4a';
    poly(g, [[17, 22], [12, 17], [21, 18]]); g.fill();
    poly(g, [[53, 40], [59, 46], [50, 42]]); g.fill();
    // crystal lance across the heart: faceted shaft + diamond tip + exit shards
    const shaft = g.createLinearGradient(12, 56, 60, 18);
    shaft.addColorStop(0, '#9fc8ff'); shaft.addColorStop(0.5, '#eafffb'); shaft.addColorStop(1, '#cfe6ff');
    poly(g, [[13, 57], [55, 21], [58, 24.5], [16, 60]]);
    g.fillStyle = shaft; g.fill();
    poly(g, [[55, 21], [62, 14], [58, 24.5]]); g.fillStyle = '#eafffb'; g.fill(); // arrowhead tip
    g.strokeStyle = 'rgba(120,170,230,0.8)'; g.lineWidth = 1;
    seg(g, [[14.5, 58.5], [56.5, 22.8]]); // facet ridge
    g.strokeStyle = 'rgba(120,170,230,0.8)'; g.lineWidth = 1;
    dot(g, 22, 49, 2.6, 'rgba(255,255,255,0.9)'); // entry gleam where it entered the heart
    for (const [x, y] of [[63, 12], [60, 28], [50, 14]]) dot(g, x, y, 1.3, 'rgba(220,240,255,0.9)'); // exit shards
    // beat pulse ring behind the heart
    g.strokeStyle = 'rgba(255,120,140,0.3)'; g.lineWidth = 1.8;
    g.beginPath(); g.arc(36, 37, 29, 0, TAU); g.stroke();
  });

  icons.blueFlame = make('synergy', packDraw('synergy', 'icon.blueFlame'));

  icons.stormVolley = make('synergy', (g) => {
    // Storm Volley: storm cloud dispensing a volley of bullets that are lightning bolts
    const cloud = g.createLinearGradient(8, 40, 32, 60);
    cloud.addColorStop(0, '#8f9bbd'); cloud.addColorStop(1, '#4d5878');
    for (const [x, y, r] of [[16, 48, 7.5], [26, 45, 9], [36, 50, 6.5]]) { g.fillStyle = cloud; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    roundRectPath(g, 9, 48, 29, 8.5, 4.2); g.fillStyle = cloud; g.fill();
    g.strokeStyle = 'rgba(255,233,168,0.45)'; g.lineWidth = 2; // flash underlight
    g.beginPath(); g.moveTo(12, 55); g.lineTo(35, 55); g.stroke();
    // volley of bolt-rounds fanning down-right, with casing bases at the muzzle
    const volley = (x, y, rot) => {
      g.save(); g.translate(x, y); g.rotate(rot);
      boltShape(g, -4.5, -13, 26, 9); // bolt body
      const bg = g.createLinearGradient(0, -13, 0, 13);
      bg.addColorStop(0, '#fffbe8'); bg.addColorStop(0.55, '#ffe06a'); bg.addColorStop(1, '#8fb8ff');
      g.fillStyle = bg; g.fill();
      g.strokeStyle = 'rgba(255,247,230,0.7)'; g.lineWidth = 0.9; g.stroke();
      const brass = g.createLinearGradient(-4, 13, 4, 13); // cartridge base where the bolt loads
      brass.addColorStop(0, '#ffe9a8'); brass.addColorStop(1, '#b78a3c');
      g.fillStyle = brass; roundRectPath(g, -4.5, 11, 9, 4.5, 1.2); g.fill();
      g.restore();
    };
    volley(40, 34, 0.7); volley(50, 42, 0.85); volley(57, 24, 0.9);
    dot(g, 34, 20, 1.6, 'rgba(255,233,168,0.9)'); dot(g, 60, 40, 1.3, 'rgba(200,220,255,0.7)');
  });

  icons.heartMagnet = make('synergy', (g) => {
    // Heart Compass: lodestone bottom-right pulling a stream of hearts along an orbit arc
    g.strokeStyle = 'rgba(190,140,255,0.6)'; g.lineWidth = 2;
    g.beginPath(); g.arc(34, 38, 23, 0, TAU); g.stroke();
    // pull-field dashes pointing inward along the arc
    g.strokeStyle = 'rgba(190,140,255,0.35)'; g.lineWidth = 1.6;
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI * 0.85 + i * 0.42;
      seg(g, [[34 + Math.cos(a) * 29, 38 + Math.sin(a) * 29], [34 + Math.cos(a) * 33, 38 + Math.sin(a) * 33]]);
    }
    // lodestone horseshoe at the bottom-right, poles pointing up-left toward the hearts
    g.save(); g.translate(51, 50); g.rotate(-Math.PI * 0.25);
    const body = g.createLinearGradient(-10, -10, 8, 9);
    body.addColorStop(0, '#d6baff'); body.addColorStop(0.55, '#8a5fd6'); body.addColorStop(1, '#4b2d80');
    g.strokeStyle = body; g.lineWidth = 7.5; g.lineCap = 'butt';
    g.beginPath(); g.arc(0, -2, 9.5, Math.PI, 0); g.stroke();
    seg(g, [[-9.5, -2], [-9.5, 6]]); seg(g, [[9.5, -2], [9.5, 6]]);
    const cap = g.createLinearGradient(0, 4, 0, 10);
    cap.addColorStop(0, '#f2f5ff'); cap.addColorStop(1, '#a9b4cf');
    g.fillStyle = cap;
    roundRectPath(g, -13, 5, 7, 5.5, 1.2); g.fill();
    roundRectPath(g, 6, 5, 7, 5.5, 1.2); g.fill();
    g.restore();
    // heart stream: hero heart riding the orbit, two smaller ones shrinking behind
    const hearts = [[24, 31, 14, 1], [44, 24, 9, 0.8], [56, 17, 6, 0.55]];
    const miniHeart = (cx, cy, s) => {
      g.beginPath();
      g.moveTo(cx, cy + s);
      g.bezierCurveTo(cx - s * 1.9, cy + s * 0.12, cx - s * 1.5, cy - s * 1.4, cx - s * 0.45, cy - s * 1.12);
      g.bezierCurveTo(cx - s * 0.15, cy - s * 1.02, cx, cy - s * 0.62, cx, cy - s * 0.38);
      g.bezierCurveTo(cx, cy - s * 0.62, cx + s * 0.15, cy - s * 1.02, cx + s * 0.45, cy - s * 1.12);
      g.bezierCurveTo(cx + s * 1.5, cy - s * 1.4, cx + s * 1.9, cy + s * 0.12, cx, cy + s);
      g.closePath();
    };
    for (const [hx0, hy0, s, a] of hearts) {
      const hg = g.createLinearGradient(hx0, hy0 - s, hx0, hy0 + s);
      hg.addColorStop(0, `rgba(255,154,168,${a})`); hg.addColorStop(1, `rgba(201,46,74,${a})`);
      miniHeart(hx0, hy0, s); g.fillStyle = hg; g.fill();
      if (s > 10) { // hero heart gets gloss + rim
        formShade(g, hx0 - s * 1.9, hy0 - s * 1.4, s * 3.8, s * 2.4, { shade: 0.2, rim: 'rgba(255,190,205,0.4)' });
        g.fillStyle = 'rgba(255,235,240,0.75)';
        g.beginPath(); g.ellipse(hx0 - s * 0.5, hy0 - s * 0.55, s * 0.28, s * 0.17, -0.55, 0, TAU); g.fill();
      }
    }
    glint(g, 36, 42, 2.6, 'rgba(255,170,190,0.85)'); // heart dust at the field center
  });

  // ================= ACTIONS (Phase 18, D84) =================================
  icons.skip = make('action', packDraw('action', 'icon.skip'));

  icons.reroll = make('action', packDraw('action', 'icon.reroll'));

  icons.banish = make('action', packDraw('action', 'icon.banish'));

  // ================= PHASE 21 — WEAPONS (9) ==============================
  icons.missile = make('weapon', packDraw('weapon', 'icon.missile'));

  icons.laser = make('weapon', packDraw('weapon', 'icon.laser'));

  icons.wolfpack = make('weapon', packDraw('weapon', 'icon.wolfpack'));

  icons.boulder = make('weapon', packDraw('weapon', 'icon.boulder'));

  icons.webs = make('weapon', packDraw('weapon', 'icon.webs'));

  icons.gatling = make('weapon', packDraw('weapon', 'icon.gatling'));

  icons.bat = make('weapon', packDraw('weapon', 'icon.bat'));

  icons.tongue = make('weapon', (g) => {
    // Frog head low-left, long snaking tongue to a lashed sticky tip
    g.fillStyle = '#5f9e4e';
    poly(g, [[12, 44], [20, 34], [34, 34], [40, 44], [36, 56], [16, 56]]); g.fill();
    dot(g, 22, 38, 4.4, '#7ed957'); dot(g, 32, 38, 4.4, '#7ed957'); // eyes
    dot(g, 22, 38, 1.8, '#1c2a16'); dot(g, 32, 38, 1.8, '#1c2a16');
    g.strokeStyle = '#d95f76'; g.lineWidth = 3.2; g.lineCap = 'round'; // tongue curve
    g.beginPath();
    g.moveTo(34, 46);
    g.bezierCurveTo(44, 52, 46, 30, 56, 18);
    g.stroke();
    dot(g, 56, 18, 4.4, '#ff8095'); // sticky tip
    dot(g, 56, 18, 2, 'rgba(255,225,230,0.9)');
    // impact flecks
    dot(g, 62, 12, 1.4, 'rgba(255,190,200,0.8)');
    dot(g, 50, 10, 1.4, 'rgba(255,190,200,0.8)');
  });

  icons.cannonball = make('weapon', packDraw('weapon', 'icon.cannonball'));

  // ================= PHASE 21 — RUN ITEMS (passive plate) ================
  icons.shield = make('passive', packDraw('passive', 'icon.shield'));

  icons.skates = make('passive', (g) => {
    // Boot + steel blade with ice sparkle trail
    const bg = g.createLinearGradient(24, 16, 44, 46);
    bg.addColorStop(0, '#f2e9d8'); bg.addColorStop(1, '#b9a98e');
    g.fillStyle = bg; // boot
    poly(g, [[26, 18], [42, 18], [42, 38], [54, 42], [54, 50], [26, 50]]);
    g.fill();
    g.strokeStyle = 'rgba(60,50,34,0.6)'; g.lineWidth = 1.4; g.stroke();
    g.strokeStyle = '#8a7a5e'; g.lineWidth = 1.2; // lace lines
    for (const y of [24, 30, 36]) seg(g, [[28, y], [40, y]]);
    g.fillStyle = '#d8dee6'; // blade holder + blade
    g.fillRect(24, 52, 34, 3);
    g.fillStyle = '#93a2b3';
    g.beginPath();
    g.moveTo(22, 58); g.lineTo(58, 58); g.lineTo(58, 55); g.lineTo(24, 55);
    g.closePath(); g.fill();
    // ice sparkles behind the glide
    g.save();
    g.globalCompositeOperation = 'lighter';
    glint(g, 14, 40, 3, 'rgba(160,220,255,0.85)');
    dot(g, 10, 50, 1.8, 'rgba(200,235,255,0.8)');
    dot(g, 16, 58, 1.6, 'rgba(200,235,255,0.7)');
    g.restore();
  });

  icons.coffee = make('passive', packDraw('passive', 'icon.coffee'));

  // ================= PHASE 21 — SYNERGIES (5) ============================
  icons.napalmMissile = make('synergy', (g) => {
    // Cannon shell wreathed in holy flame
    flameShape(g, 38, 8, 26, 0.05);
    g.fillStyle = 'rgba(255,150,70,0.55)'; g.fill();
    flameShape(g, 38, 16, 16, -0.05);
    g.fillStyle = 'rgba(255,220,140,0.75)'; g.fill();
    const st = g.createLinearGradient(24, 58, 52, 34);
    st.addColorStop(0, '#252b33'); st.addColorStop(1, '#6d7a86');
    g.save();
    g.translate(40, 44); g.rotate(-0.7);
    g.fillStyle = st; g.beginPath(); g.ellipse(0, 0, 15, 8, 0, 0, TAU); g.fill();
    g.fillStyle = '#c8863f'; g.fillRect(-4, -8, 4, 16);
    g.restore();
    dot(g, 50, 30, 2.6, 'rgba(255,235,170,0.9)'); // ember flecks
    dot(g, 28, 32, 1.8, 'rgba(255,200,120,0.8)');
  });

  icons.staticPelt = make('synergy', (g) => {
    // Wolf-head silhouette (mirrored) with a static bolt crackling across it
    g.fillStyle = '#7c8798';
    poly(g, [[48, 18], [42, 30], [28, 26], [16, 34], [20, 44], [14, 50], [26, 52], [32, 60], [46, 56], [56, 40], [54, 26]]);
    g.fill();
    g.fillStyle = '#5a6472';
    poly(g, [[54, 26], [48, 18], [42, 30], [50, 34]]); g.fill();
    dot(g, 36, 36, 2.6, '#ffb648');
    g.save();
    g.globalCompositeOperation = 'lighter';
    boltShape(g, 30, 14, 44, 14);
    g.fillStyle = 'rgba(255,236,140,0.95)'; g.fill();
    glint(g, 52, 16, 3, 'rgba(255,240,160,0.85)');
    glint(g, 18, 58, 2.4, 'rgba(255,240,160,0.8)');
    g.restore();
  });

  icons.homerKing = make('synergy', (g) => {
    // Home plate + crossed bat + a shooting star arc
    g.fillStyle = 'rgba(240,244,250,0.92)';
    poly(g, [[28, 42], [48, 42], [48, 52], [38, 60], [28, 52]]);
    g.fill();
    g.strokeStyle = 'rgba(30,20,40,0.55)'; g.lineWidth = 1.4; g.stroke();
    const wd = g.createLinearGradient(16, 52, 46, 14);
    wd.addColorStop(0, '#7a5230'); wd.addColorStop(1, '#e0b285');
    g.strokeStyle = wd; g.lineWidth = 6.5; g.lineCap = 'round';
    seg(g, [[18, 50], [40, 18]]);
    g.lineWidth = 9;
    seg(g, [[40, 18], [46, 10]]);
    g.save();
    g.globalCompositeOperation = 'lighter';
    g.strokeStyle = 'rgba(255,220,140,0.85)'; g.lineWidth = 2;
    g.beginPath(); g.arc(38, 40, 26, -2.3, -0.9); g.stroke(); // ball arc
    glint(g, 58, 24, 4.5, 'rgba(255,235,170,0.95)', 1.8);
    dot(g, 52, 12, 1.8, 'rgba(255,235,170,0.8)');
    g.restore();
  });

  icons.gutFeast = make('synergy', packDraw('synergy', 'icon.gutFeast'));

  icons.avalanche = make('synergy', packDraw('synergy', 'icon.avalanche'));

  return icons;
}

export function buildItems() {
  // gem/heart are per-level (gemHeartFor, 13.10) — not built here.
  return {
    bolt: boltSprite(),
    orb: orbSprite(),
    boomerang: boomerangSprite(),
    blade: bladeSprite(),
    bullet: bulletSprite(),
    arrow: arrowSprite(),
    snowball: snowballSprite(),
    baseball: baseballSprite(),                    // B3 Baseball Bat (ranged redesign)
    baseballVar: { homer: baseballHomerunSprite() },
    frostBurst: frostBurstSprite(),
    spark: sparkSprite(),
    bomb: bombSprite(),
    flame: flameSprite(),
    explosion: explosionSprite(),
    // Phase 21 (D96) projectile sprites — 31.4: the Homing Missile projectile (31.15:
    // id `missile`; combat reads items.missile — game.js wires it to combat.missileImg)
    missile: missileSprite(),
    boulder: boulderSprite(),
    web: webSprite(),
    burn: burnSprite(),
    blight: blightSprite(),
    shadowPickup: shadowSprite(7, 3, 0.30),
    // 24.3 synergy variant maps (keyed by the projectile record's `v` tag). game.constructor
    // assigns each to combat.<type>Var; combat.draw picks map[v] || baseImg.
    boltVar: { blight: boltBlightSprite() },
    bulletVar: { inferno: bulletInfernoSprite(), storm: bulletStormSprite() },
    arrowVar: { flaming: arrowFlamingSprite(), piercer: arrowPiercerSprite() },
    bombVar: { napalm: bombNapalmSprite() },
    snowballVar: { blue: snowballBlueSprite() },
  };
}

// ── 33.4.8 weather-flake art (user-ordered FULL SWAP, PLAN-FORK goal) ──────────────
// One packed flake sprite per level foreground kind; entities/particles.js Snow.draw
// blits these (emitter logic untouched). D-F5 viewings on record: m01 = the X-shaped
// snowflake cell cut from the willYEE Sengoku snow ambient loop; m02 = a sakura petal
// clump from the Sengoku sakura loop (that loop art is greyscale per the pack README,
// so the entry declares tint "petal" and we recolour to CFG.perf.petalColor through the
// shared luma ladder); m03 = a single bubble ring from the atlantis char_bubbles sheet.
// Node: no pack → null → Snow keeps its procedural paths (boot unaffected). Canvases are
// handed out at cell size immediately and painted in place when pixels decode (load.js
// deferred model). Returns { snow, petal, bubble } canvases.
export function buildWeatherFrames() {
  const pk = loadPack();
  if (!pk) return null;
  const cut = (slot, tint) => {
    const entry = pk.manifest.sprites[slot];
    const c = makeCanvas(entry.frame.w, entry.frame.h);
    onArtReady(pk, () => {
      const [f] = sliceStrip(pk.images, entry, 'frames');
      const src = tint ? paletteSwap(f, lumaTintMap(f, tint)) : f;
      const g = c.getContext('2d');
      g.clearRect(0, 0, c.width, c.height);
      g.drawImage(src, 0, 0);
    });
    return c;
  };
  return { snow: cut('fx.snow'), petal: cut('fx.petal', CFG.perf.petalColor), bubble: cut('fx.bubble') };
}
