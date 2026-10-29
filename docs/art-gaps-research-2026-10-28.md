# Art-coverage gap audit + pack recommendations — 2026-10-28

User granted (2026-10-28): permission to seek/identify gaps and recommend candidates — **recommendations only; downloads await per-item approval (D-F5), free-first (D-F3/D-F8), $5 hard cap.** User also accepts theme/category-adjacent alternatives for review.

## A. Verified gap inventory (this session)

Pinned lists read live: `tools/test-art.mjs` L412 `ICON_DRAWN` (13) · L501 `WORLD_KEPT` (3). Record rows 33.3b/33.4.2/34.3. A filename sweep (`find assets/itch -iname …`) over EVERY imported pack proves what does and doesn't exist locally:

1. **13 kept-drawn card icons** — fangs, tongue, magnet, dash, skates, phoenix, flamingArrows, heartPiercer, stormVolley, heartMagnet, napalmMissile, staticPelt, homerKing. All 2,192 imported Raven cells already scanned (A5b) — absent by evidence.
2. **3 kept-drawn world sprites** — baseball, boomerang, missile (C1 viewed; no stitched-ball/boomerang/rocket cell in any import).
3. **No Soulshard world-pickup sprite** (row 33.4.6) — but `fx/jp_soul_drain_frames/` (Sengoku, 12 frames) EXISTS locally and was never wired.
4. **Werewolf hero = single static 192px frame + bob** (33.4.2 QA flag). No animated wolf/werewolf local (sweep: only `raiju_thunder_beast…blue_wolf` and `hide_drying_frame_with_a_wolf_pelt` from nanasha).
5. **m02 Japanese shrine props (torii/pagoda/lantern) + sakura tileset round 3** (33.3b) — sweep: zero torii/shrine files imported; own-drawn props stand.
6. **ryū boss art identity** (34.3 OPEN) — fixable WITHOUT any new download: dragon sources already on disk — (a) DeepDive **Dragon Asset Pack** (45 sprites WITH idle animations, 16px native; ASSET-CREDITS L17–22), (b) the F46 gold eastern-dragon sheet reviewed in round 2 (33.4.4 packed ryū←F46; exact file path re-verified during the probe; 34.3 says the manifest was later moved to aaron_fb3_002 = red MECH). A re-skin decision, not a purchase.
7. **Non-art gate before any public build:** license-unstated imported packs: rrfreelance, xzany samurai, atlantis (finalbossblues), magic9 (ansimuz), free-underwater-enemies — verify or replace (33.3 findings).

## B. Candidates per gap (all viewed? NO — price/license per page TEXT; visual review = approval-time step, D-F5)

### G6 ryū identity — cost $0, no download
- Option 1: DeepDive **Dragon Asset Pack** (local, idle-animated, 16px native) — motion for the boss.
- Option 2: F46 gold eastern-dragon sheet (local, static, matches A3-era notes).
- Recommend: probe Option 1 visually; fallback Option 2. Parent-side task, no approval needed beyond the visual call 34.3 already asks for.

### G3 Soulshard pickup — cost $0, no download
- Local: `jp_soul_drain_00` (or any of 12 frames) as the shard sprite, or paletteSwap of the packed gem.
- Recommend: `jp_soul_drain` — distinct identity, zero cost.

### G5 baseball projectile — free candidates
- hamu — "Pixel Sports Ball Assets - Free" — https://hamuko27.itch.io/pixel-sports-ball-assets (explicit baseball in description) [accessed 2026-10-28 via Brave]
- BeeMaxStudio — "Sport Balls Pixel-art Pack" — https://beemaxstudio.itch.io/sport-balls-pixel-pack ("free … personal and commercial") [same]
- Pixel person — "Balls" — https://pixel-person.itch.io/balls (name-your-own-price = $0 possible; baseball listed) [same]
- Recommend: hamuko27 first (title-verified free + named baseball), BeeMax backup. Adjacent: Rad Potato kit below also carries balls.

### G6b rocket/missile — free-first
- bdragon1727 — "Pixel Rocket" (surfaced on itch tag page) — author pattern already in the repo (smoke pack = "commercial → contribute any value"). [accessed 2026-10-28]
- Rad Potato — "PIXEL PERFECT: PROJECTILE KIT" — https://rad-potato.itch.io/pixel-perfect-projectile-kit ("hundreds of sprites: bullets, rockets, spells, beams" — could also serve future bullet needs; price UNVERIFIED). [same]
- Recommend: bdragon first (free, precedent, one small cell); Rad Potato only if more projectile variety is ever wanted.

### G7 boomerang — only ONE find, PAID
- Erick1310 — "+10 Pixel Art Boomerangs Pack with Unity Scripts" — https://erick1310.itch.io/10-pixel-art-boomerangs-pack-unity-scripts — **$2.99**, 16x16. [accessed 2026-10-28]
- Recommend: SKIP — paid breaks free-first for a 24.9-pinned cosmetic; own-drawn stays.

### G4 m02 torii/shrine props + sakura/Japanese tileset (round 3)
- **mmorwynn** (itch.io user) — Japanese-inspired EAST packs: "30 shrine pieces, 3 designs each: torii, pagodas, halls, fox statues, lanterns"; tag-page snippet advertises a FREE cross-pack sampler ("sprites from all 4 Japanese-inspired EAST packs … at one scale"). Isometric-leaning style — scale/fit needs a real look. https://mmorwynn.itch.io/ [accessed 2026-10-28]
- **finalbossblues — "Japan RPG Tileset Pack (Time Fantasy: Japan)"** — https://finalbossblues.itch.io/time-fantasy-japan — "Bamboo forest, dragon statues, torii gates, lanterns, bonsai, koi pond…"; SAME author as imported m03 Atlantis (style continuity). Price UNVERIFIED (his tilesets are usually paid — likely exceeds the $5 cap; needs explicit user override). [same]
- **glowcompany — "Tokyo Matsuri — Free Mini Pack"** — https://glowcompany.itch.io/tokyo-matsuri-mini — "Free for commercial and personal work. No credit required. Do not resell"; stalls/yukata/goldfish-scoop items (adjacent theme; goldfish-scoop could also serve m03). [same]
- LOCAL-ONLY alternative (zero cost, zero download): nanasha **hunters_camp_and_wild_places** — 37 props already on disk (lantern stand, straw yokai dummy, yokai cage, banners, tents…) → pack them as m01/m02 camp decor; own-drawn torii stays for the gate itself.
- Recommend: (1) local nanasha camp-props pass first — free, licensed ✔, no search risk; (2) mmorwynn sampler review for real torii/pagoda cells; (3) finalbossblues only with an explicit paid-cap override.

### G3 werewolf hero animation — new material would be required
- **sanctumpixel** — "Werewolf Pixel Art Character" — https://sanctumpixel.itch.io/werewolf-pixel-art-character + "Wolf - Top Down Pixel Art Characters" — https://sanctumpixel.itch.io/wolf-top-down-pixel-art-characters — top-down, matches our frame conventions; prices UNVERIFIED. [accessed 2026-10-28]
- **Free Game Assets (Craftpix)** — "Free Werewolf Sprite Sheets Pixel Art" — https://free-game-assets.itch.io/free-werewolf-sprite-sheets-pixel-art — free per page; Craftpix house style (chunkier, bigger sprites) — style-fit risk; their standard CC-BY attribution applies. [same]
- Adjacent LOCAL alternative: nanasha **raiju** ("thunder beast like a blue wolf with crackling fur") — could be an ELITE wolf skin instead of touching the hero.
- Recommend: keep the static hero for now (it works; QA-flag only); if animation is wanted, review sanctumpixel first (top-down fit), and consider raiju-as-elite regardless (free, local).

### G8 13 composite icons
- New only candidate: merchant-shade — "Free 16x16 Assorted RPG Icons" — https://merchant-shade.itch.io/16x16-mixed-rpg-icons — free (store search hit) but 16px → poor on 32px plates. [accessed 2026-10-28]
- Recommend: KEEP the drawn composites (documented in-system; A5b already exhausted the good packs). Revisit per-icon only if phone playtest flags a specific card.

## C. Search-method caveats
- itch_store_search API returned empty for multi-word queries (proved firing with a positive control) — Brave discovery was the working channel; page TEXT was read, candidate PNGs were NOT yet viewed → visual review at approval time per D-F5.
- Prices marked UNVERIFIED where the page snippet didn't state them; itch MCP `itch_asset` (id needed) or page view at approval resolves each.
