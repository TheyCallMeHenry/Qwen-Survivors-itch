# Full-swap gap-pack research (round 4) — 2026-10-26 (main agent; D-F3 free-only, D-F5 review-before-download)

Trigger: user clarification — "practically ALL game art → itch.io assets" (amends PLAN-FORK; every procedural leftover is now a tracked gap, never a silent keep). All sources accessed 2026-10-26. Method: Brave site: + itch tag-page HTML extraction (itch's own search engine does not fire on these terms — proven via positive control), then itch_asset (price + license_note + cover) on every candidate.

## Gap inventory (from A3 audit + PLAN-FORK §1)

m02 creatures: tanuki, hō-ōi, shikome, miko, oni (kitsune ✓ F46). m03 creatures: crab, goldfish, merfolk (×2), stingray, eel, orca. Shark/Great-White boss (deferral void). m02 props: torii/pagoda/lantern. Weather particles: snow/petals/bubbles. Residual procedural sheets: projectiles/glow sprites, decor, menu backdrops, minimap.

## Free, verified (recommend import)

1. **Sakura Shrine Village FREE DEMO (bubbabba)** — https://bubbabba.itch.io/sakura-shrine-village (gid 5054773) — the only upload IS the free demo: spring 16×16 tileset + 20 props + 4 animations; license stated on page: "personal and commercial… edit or recolour… credit appreciated not required." Cover viewed: shrine/stone-lanterns/torii/banners visible in-scene — strong m02 props candidate, and its tileset may supersede serenevillage as the m02 base (same 16 px top-down dialect, animated koi pond/paddies in the full pack).
2. **Ocean Creatures (Michael Jay)** — https://michael-jay-rov.itch.io/ocean-creatures (gid 3462486) — FREE, **CC BY 4.0** (credit required). One spritesheet, 32–64 px top-down-ish: orca ✓, ray ✓, lionfish/goldfish-ish ✓, anglerfish, blue fish. Covers several m03 keys; style is a soft guest dialect.
3. **Free Underwater Enemies (Free Game Assets)** — https://free-game-assets.itch.io/free-underwater-enemies-pixel-art-character-pack (gid 2063583) — FREE, license NOT stated (same handling as rrfreelance per user: use anyway, user contacts author). 6 side-view enemies incl. merfolk/crab-like + PSDs; needs flips/re-tint.
4. Small free singles from the free/tag-underwater page (verify license at import): FREE 2D Sideview Crab Monster (engvee), 2D Pixel Art Jellyfish Sprites (elthen), 32x32 ANIMATED SHARK Sprite (sergeant-slash — possible Great-White base), Atlantis TileSets (comic-and-sons — m03 tileset alternative).

## Free-listed but blocked

- **not-a-kappa-games: Kappa / Mud-Man (Dorotabo)** — free-tag hits, single creatures (no upload detail checked) — possible oni stand-in? no — kappa ≠ oni. Not a fit.
- nanasha Nashas Samurai Tales free yokai hunters / willyee Sengoku pixel pack — characters/scenes, not a bestiary fit (not opened; weak relevance).

## Best-fit but PAID (D-F3 excludes — override needs explicit user waiver; flagged, not adopted)

- **Cobalt Rook Works** (exact-dialect 16-bit top-down japanese, licenses commercial-OK credit-appreciated): Rice Village Props $4 (37 props incl. torii/stone-lantern/jizō/ema/water-wheel + 5 Wang tilesets — the ideal m02 prop pass), Yokai Wanderers II $3 (tanuki brewer, **kitsune miko** = fox shrine maiden, monk, ghost-child; 8-dir walk+idle), plus "Yokai Bestiary Vol.1" 15 SNES yokai enemies (tengu/bakeneko/yuki-onna…; price unrecorded, appeared under tag pages) and Thatch & Tile buildings. Whole m02 (props+enemies+village) could be one coherent paid trio ≈$7–15 total.
- kyukei-dot Shrine Pack $5 (32×32), bubbabba full Sakura $15, falvey hanami/shogun micro-tilesets (price unconfirmed), megentarou dark-yokai pack (price unconfirmed).

## Decisions presented to user (2026-10-26)

- Import bubble list = items 1–3 (+singles at A7 import time) — recommended.
- m02 yokai enemies: no free verified bestiary exists → options: (a) keep those 5 procedural as a REPORTED gap for now, (b) D-F3 waiver for the Cobalt trio, (c) own-draw. Recommendation: (a) now, revisit (b) when the user next considers the animal-pack purchase anyway.
- Shark/Great-White: free animated shark singles exist — verify+import at A7 unless user re-confirms deferral.

## Round 5 (budget capped $5 total by user) — the gap is closable at $0

Method: same (tag-page HTML + itch_asset on every candidate, prices verified via API 2026-10-26).

- **Sengoku Pixel Pack (willYEE)** — https://willyee.itch.io/sengoku-pixel-pack — **FREE, CC0** (no credit, commercial, edit freely; “No generative AI” NOT claimed — pack is described as AI-assisted tooling? page states CC0; no AI disclosure line seen → treat as unstated). 4,500+ sprites for a SIDE-SCROLLING feudal-Japan action game: 17 yokai + 5 bosses (Great Tengu, Shuten-dōji, Orochi, Tamamo-no-Mae, Kiyohime), 15 town buildings, 92 bg props incl. torii/shrines/Fuji, ambient loops (falling sakura, maple, SNOW, rain, fireflies), animated lanterns/banners/waterfall, 120 weapon icons, 36 attack FX. CAVEAT: side-view camera dialect — import-time visual fit assessment required (D-F5 second pass at use).
- **Yokai Hunters (Nasha’s Samurai Tales, free pack)** — https://nanasha.itch.io/nashas-samurai-tales-free-yokai-hunters — **FREE**, commercial OK, edit/recolour freely, no resale/AI-train. **TOP-DOWN 32×32**, 279 sprites: nue, baku, raiju, tsuchigumo, mokumokuren, kasha, wanyudo, keukegen, giant catfish/centipede, fox fires + hunters’ camp + 45 seamless night-forest tiles. Hand-made series (author's other packs state “No generative AI” pattern; this page: none stated → note). Strongest m02-creature + m02 night-atmosphere fit found.
- **Dorotabō Mud Man (The Game Smith)** — https://not-a-kappa-games.itch.io/mud-man-dorotabo — **FREE**, free+commercial, hand-animated 4-dir walk/run/attack/hit + 13 colorways + matching projectile FX sheets, 32 px footprint. Fully licensable animated yokai — zero caveats.
- **Quirky Kappa (same author)** — https://not-a-kappa-games.itch.io/kappa — free tier = 4-dir walk, FREE-GAMES-ONLY license (our game is free → compliant; note it).
- **Amabie (RAPIDPUNCHES)** — https://rapidpunches.itch.io/amabie — free, CC BY 4.0, animated yokai single.
- **Megentarou dark-yokai pack** — $2.99 (right-facing stills only) — NOT needed given the above; its 5-enemy free sample exists if wanted.
- Cobalt Rook trio re-priced (record): Bestiary $5 / Village Folk $4 / Wanderers II $3 / Rice Props $4 / Thatch&Tile $5 / Backdrops $3 — over the $5 budget individually → not purchased; the free round-5 packs replace their roles.

**Revised recommendation: spend $0.** Import list = Sengoku (CC0) + Yokai Hunters + Dorotabō + Amabie (+ prior: Sakura demo, Ocean Creatures, Underwater Enemies). Design consequence to decide: m02 enemy NAMES vs new art (D103 name-match law) — reskin-as-is mismatches names; renaming to match the art (nue/baku/raiju/tsuchigumo/wanyudo…) is a visible content change.
