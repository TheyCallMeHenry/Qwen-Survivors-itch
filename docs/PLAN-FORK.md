# PLAN-FORK.md — itch.io art swap plan (fork-only; 2026-10-26)

Fork law: D-F2 gameplay frozen — only `js/art/*` builders and their call-site frame data change. Audio (`js/audio`) stays procedural (parent law). All art lives under `assets/itch/` with `ASSET-CREDITS.md` (written by the itch MCP; never hand-edit that file — re-import updates it). Packs + verdicts: `docs/fork-asset-research-2026-10-26.md`.

**FULL-SWAP GOAL (user clarification 2026-10-26): practically ALL game art → itch.io assets.** Characters, enemies (ALL levels incl. m02/m03 skins + oni/tanuki/kitsune/merfolk/…), bosses, environments/tiles, props, items/icons, weapons' projectile visuals, FX, and weather particles. Anything still procedural is a tracked gap, not a design choice. “KEEP procedural” rows below (snow/petal/bubble, shark) are superseded where a fitting free pack exists (D-F3 free-only, D-F5 review-before-download; round-3 searches = new sub-phase 33.4.8). Only true exceptions remain: audio (parent law) and anything with no acceptable free source after searching — each must be reported as an open gap, never silently kept.

## 0. Current art contract (what the swap must preserve)
- `art/characters.js buildCharacters(levelKey)` → `{ key: {w,h,shadowR,frames[]} }`, frames face RIGHT, drawn bottom-center, flipped at draw time (enemies.js). Wolfpack companion: `buildPackWolves()`.
- `art/heroes.js buildRoster()/buildGhost()` → per-char `{w,h,shadowR,idle[2],run[4]}` sheets (player.js `def`; HUD accents from CFG).
- `art/items.js buildItems()/buildIcons()/gemHeartFor()/…Fx sprites` (combat.js, main.js, hud.js `drawIconScaled`).
- `art/terrain.js buildTerrain/mountainSprite/lakeSprite/koiPondSprite/buildVignette`; `art/sky.js buildSky` (world.js drawBackground).
- `art/base.js` = compositing helpers (shadow/glow/flash/flip/mask) — KEEP; used everywhere.
- Node-safety (rule 3): builders only run when a browser injects canvas/Image; check/boot tests keep passing because top level stays side-effect-free.

## 1. Pack → slot map (19 imported + candidates)
| Slot | Source pack(s) | Notes |
| --- | --- | --- |
| PCs: mage/ranger/warden | DeepDive humanoid2 (elf enchanter, archer-teen, knight variants) | 16px, idle-animated; expand to 4-dir by flip |
| PC: swash/gunslinger | DeepDive humanoid (rogue-ish) or samurai char (F-samurai) | samurai zip = character only — usable as Wild-West/Swash re-skin |
| PC: werewolf | aaronsprites generation-0 (werewolf-beast) | scale to ~28px |
| PC: stone golem | aaronsprites freebies-5 (snow-yeti) or DeepDive earth elemental | elemental = style-safe pick |
| PC: giant toad | DeepDive-adjacent: use #10 tiny-enemies frog OR buy F49 animal pack (user testing first) | toad slot = weakest currently |
| PC: baseball player | humanoid2 youth + custom-drawn bat-glove tint (or F43 props overlay) | costume = open, minor |
| ghost fallback | DeepDive undead pale + our per-seat tints (CFG.ghostColors) | tint pipeline exists |
| enemies: goblin/brute/cultist | DeepDive humanoid + magical (elementals) + undead | quantity per D-F4 |
| enemies: rat/bat | DeepDive vermin + tiny-enemies | |
| enemies: wolf | aaronsprites gen-0/freebies-5 wolves (best); fallback #10 bear | |
| bosses: wraith / ryū | DeepDive magical ghost / dragons + F46 eastern dragon | ryū shape = F46 preferred |
| boss: shark | DEFERRED (user 2026-10-26) — keep procedural shark until round-3 find | |
| m01 tileset | raven green forest (16/32/48 sheets included) | CFG palette night-tint applies |
| m02 tileset | limezu serenevillage (FREE, verified) + small custom Japanese-prop pass (torii/pagoda) | user proposed; approved-pending |
| m03 tileset | finalbossblues atlantis (RPG Maker sheets) + char_bubbles | |
| pickups/icons | rrfreelance 163 (license ⚠ verify before shipping) + reaktori-free… no: use F43 + our drawn fallback | butterymilk free = preview-only, unusable |
| FX | ansimuz explosion (CC0) + magic9, bdragon smoke, frostwindz lightning, foozle magic (CC0), aaron… | additive glow pass unchanged |
| snow/petal/bubble foreground | KEEP procedural (particles.js) | matches levels; sprites optional |

## 2. Pipeline design (new code, minimal)
- `js/art/load.js`: image preload queue (browser-only), `sheetFrames(url, frameRects)` → offscreen canvases via base.makeCanvas; `tintSprite(src, pal)` for elites/ghosts (reuse PACK_PALS concept, driven from CFG).
- `js/art/sprites.json` (data, not JS): per-slot `{src, rects[], fps, dir}` — tuning stays in data/CFG (rule 5). Node tests never load it.
- Swap = each `build*()` keeps its exact return contract, sourcing frames from load.js instead of path-drawing. Call sites (enemies/player/combat/hud/world/minimap) stay untouched → gameplay invariants safe.
- Sizes: native 16px art rendered ×1 at our 11–30px radii; AaronSprites (~48px, painterly) downscaled ≤2×, used only where no 16px equivalent exists (wolf/werewolf/dragon/electric).

## 3. Style unification
Primary dialect = DeepDive 16px (flat, top-down, own shadow-blob). Engine-side levers already exist: level `palette` + half-res darkness + additive glow unify brightness/time-of-day; `PACK_PALS`-style tinting covers elites (gold-diamond tell stays). AaronSprites/serenevillage/atlantis are deliberate guest dialects per level — one tileset per level means they never sit side by side with DeepDive tiles, only with sprites: acceptable per user's quantity-over-identity law.

## 4. Phases (each ends with all three gates green + a served-URL screenshot pass by the user)
- 33.4.1 load.js + sprites.json + smoke test (one hero drawn from PNG) — infra only.
- 33.4.2 heroes: 9 roster sheets + ghost tint.
- 33.4.3 enemies per level + elite tint path + wolfpack companion.
- 33.4.4 bosses (wraith, ryū=F46/gen-0, shark stays procedural for now).
- 33.4.5 tilemaps: m01 raven → m03 atlantis → m02 serenevillage (+ torii prop pass).
- 33.4.6 items/icons/pickups (F43 set; keep drawn fallbacks where license pending).
- 33.4.7 FX: impacts/explosions/lightning/smoke; then full visual QA desktop+mobile.
- 33.4.8 (new, 2026-10-26 full-swap goal) m02/m03 completeness: round-3 free-pack searches for the 12 level-skin creatures (tanuki/hō-ōi/shikome/kitsune reskin/miko/oni + crab/goldfish/merfolk/stingray/eel/orca) + shark/Great-White reskin (supersedes “stays procedural” unless the user re-confirms the deferral) + weather-particle sprite sources (snow/petals/bubbles) + any missed procedural art (projectile/glow sheets, decor, menu backdrops m02/m03, minimap). Every remaining gap gets a row here — silent keeps are defects (rule 15).
Order rationale: heroes/enemies first = biggest visible payoff while tilesets (riskiest) stay isolated behind world.js.

## 5. Open items (tracked here so the next session sees them)
- Icons: F43 page license unstated → verify author site before shipping build; butterymilk premium paid option exists (~price unrecorded).
- m02 Japanese props (torii/pagoda/lantern): tiny custom-drawn set in our engine OR round-3 search — decide at 33.4.5.
- SHARK boss (user: deferred), baseball-player costume (minor), F49 animal pack purchase (user testing DeepDive family first — toad slot then upgrades).
- Commit/push: only on explicit user ask (rule 7) — current tree has uncommitted: serve.mjs port, docs, assets/itch/, ASSET-CREDITS.md.
