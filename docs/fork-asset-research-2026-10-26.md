# Fork asset research + decisions — 2026-10-26

Single home for the fork's founding decisions and verified findings (parent PROGRESS Format contract §1: one home per fact). F = fact verified this session, INR = inference.

## Decisions (binding, from the user's own words — 2026-10-26)
- **D-F1 Sibling fork.** The itch-art fork lives at `D:\Apps\Qwen-Survivors-itch`, created as a full git clone at published commit `f2277cd` (shared history; `origin` = parent folder). Approved by the user's explicit choice of the recommended option.
- **D-F2 Gameplay frozen.** "Yes, keep all gameplay logic as-is in the current build." The fork's only variable is visuals.
- **D-F3 Free-only packs.** "100% cost-free packs ONLY."
- **D-F6 Fork port 47894.** User approved 2026-10-26: fork `serve.mjs` binds 47894 so both dev servers run at once (parent keeps 47893). Implemented + docs synced same session.
- **D-F4 Enemy matching = quantity, not identity.** Primary goal: match the number/quantity of current enemy types, not exact model matches; exact matches are tried first if found, but better-serving options may replace them (user's words; verbatim key lines in USER-INPUT-LOG).
- **D-F5 Review before download.** A sub-agent must visually review the user's 41-link list (below) BEFORE anything is downloaded; the review must use actual vision, not text/code. One sub-agent at a time (rule 18).

## The user's asset-pack shortlist (41 links, provided 2026-10-26; none visited/downloaded yet)
https://cairocreative.itch.io/pixel-art-collection
https://deepdivegamestudio.itch.io/holyassetpack
https://toffeecraft.itch.io/tree-animated-forest
https://kenney-assets.itch.io/splat-pack
https://bdragon1727.itch.io/retro-impact-effect-pack-5
https://free-game-assets.itch.io/free-pixel-magic-sprite-effects-pack
https://szadiart.itch.io/fantasy-lands-houses-demo
https://free-game-assets.itch.io/free-pixel-art-dungeon-objects-asset-pack
https://pixelgnome.itch.io/fish
https://vryell.itch.io/tiny-enemies-vol1
https://deepdivegamestudio.itch.io/vermin-asset-pack
https://reaktori.itch.io/debts-in-the-depths-asset-pack
https://kronbits.itch.io/particle-pack
https://nyknck.itch.io/fx084
https://nyknck.itch.io/fx062
https://karsiori.itch.io/free-pixel-art-flower-pack
https://foozlecc.itch.io/trap-pack
https://graphscriptdev.itch.io/plant-trees
https://cuddle-bug.itch.io/apocalypse
https://jasontomlee.itch.io/slashfx
https://deepdivegamestudio.itch.io/humanoid2-asset-pack
https://butterymilk.itch.io/tiny-wonder-rpg-icons
https://bdragon1727.itch.io/platfrom-trap-and-weapon
https://chierit.itch.io/lively-npcs
https://frostwindz.itch.io/pixel-art-slashes
https://shubibubi.itch.io/winter-things
https://deepdivegamestudio.itch.io/dragon-asset-pack
https://stealthix.itch.io/rpg-nature-tileset
https://pimen.itch.io/magical-animation-effects
https://thkaspar.itch.io/tth-animals
https://clockworkraven.itch.io/raven-fantasy-pixel-art-tileset-green-forest
https://finalbossblues.itch.io/atlantis-tileset
https://deepdivegamestudio.itch.io/undead-asset-pack
https://deepdivegamestudio.itch.io/magical-asset-pack
https://deepdivegamestudio.itch.io/humanoid-asset-pack
https://deepdivegamestudio.itch.io/monsterassetpack
https://pimen.itch.io/fire-spell-effect-02
https://xzany.itch.io/samurai-2d-pixel-art
https://bdragon1727.itch.io/free-smoke-fx-pixel-2
https://ansimuz.itch.io/explosion-animations-pack
https://smallscaleint.itch.io/hd-8-directional-top-down-character-pack-1
(Pack licenses/contents unverified until the visual review runs — the list is the user's record, not our recommendation.)

## Verified capability findings (2026-10-26, "Implement Full" profile)
- F: the itch.io MCP full tool set is active: store search verified live (one test query returned results); `itch_asset` returns license notes; `itch_get` downloads with an automatic `ASSET-CREDITS.md`; `itch_contact_sheet` builds numbered PNG grids of a pack's images (the vision path for review).
- F: the user's local itch library is currently empty (`itch_find` → 0 rows) — everything on the shortlist must come via store download, not the library.
- F: a Zed sub-agent CAN visually review images: capability probe on 2026-10-26 produced a PNG (PowerShell System.Drawing) and the sub-agent's `read_file` returned perceivable visual content (it described the shapes/colors/text correctly).
- INR (low risk): itch store search is keyword-ranked and sparse per query; the review must use the user's exact URLs, not search.

## Tests run on the fork clone (2026-10-26, same session)
- `tools/check.mjs` → "All 34 modules imported clean."
- `tools/test-logic.mjs` → "1582 checks passed, 0 failed"
- `tools/test-boot.mjs` → started, **interrupted by the user** before completion; NOT verified on the fork yet. Parent full-green baseline 2026-10-26: 34/34 · 1582/1582 · boot exit 0.

## Troubleshooting notes (resolutions)
- Parent AGENTS.md "tree stability: never add top-level dirs" → the fork must not live inside the parent repo; the sibling clone is what the parent rules require for an independent fork.
- Zed terminal/file tools reject paths outside the registered project roots → from a parent-rooted session, put `cd /d/Apps/Qwen-Survivors-itch` inside the command body with the `cd` parameter set to the parent root. A session opened AT the fork has no such issue.
- Two concurrent dev servers would collide on 47893 (rule 4 is parent-scoped) → open pending decision: switch the fork's `tools/serve.mjs` to 47894 (one-line, at Phase 33.0).

## Next step (exact)
Spawn ONE vision sub-agent to review all 41 pages above against the game's visual-needs inventory (Phase-33 row in `docs/PROGRESS.md`); write its findings into this doc; report the shortlist to the user; only then download selected packs via `itch_get` with `project_dir` pointing at the fork.

## Review results — 2026-10-26 (vision review; run by the main agent per user directive after sub-agent profiles lacked itch tools)
Method per pack: `itch_store_search` (author+title) → `itch_asset` (actual cover/screenshot images viewed) → license note read → verdict. Findings appended per-pack immediately. Verdicts = what the images show vs the needs inventory (D-F4: quantity over species-exact).
- **1. cairocreative/pixel-art-collection** — VIEWED (4 imgs): GBA/16-bit, top-down. 10+ tilesets (bright green forest/grass, road, cave, water), 20+ enemies & props: 4-dir walk strips (small caped humanoids), blue quadruped beasts, red snake/bug creatures, snail mount, car. "400+ frames". Free (page in itch Free category). Covers: generic small-enemy quantity fill, forest ground tiles, misc props. NOT a fit thematically (day-bright palette vs dark snow/dusk/underwater levels). Verdict: USEFUL filler (enemies/props), not core.
- **2. deepdivegamestudio/holyassetpack** — VIEWED: "Holy Asset Pack [16x16]" — top-down holy humanoids: white/gold armored angels, green angel with sword, small cherub, on stone-tile dungeon strips. PRICE verified from page JSON: `min_price:0` (pay-what-you-want; $2/$4/$5 are suggested tiers) → FREE to acquire (D-F3 OK). Would cover cultist (robed) + wraith-adjacent archetypes. Verdict: USEFUL (same author family as vermin/monster/etc. — a cohesive style core to evaluate together).
- **3. toffeecraft/tree-animated-forest** — VIEWED: 16x16-style animated swaying trees on bright grass (green/olive/autumn/brown + one SNOW tree), rocks/shrubs. Cute palette. Covers: m01 tree decor (snow tree + dark green pines possible). Verdict: USEFUL decor supplement (check license on download).
- **4. kenney-assets/splat-pack** — VIEWED: smooth flat vector-style paint/ink splat decals, multiple colors + shadow variants, no pixel art. Kenney = CC0 free. Covers: impact/blood splat ground decals if the whole game went smooth-style; mismatches every pixel pack. Verdict: SKIP for a pixel-art direction (style conflict).
- **5. bdragon1727/retro-impact-effect-pack-5** — VIEWED: pixel impact FX on transparency: fire/energy burst sprites, star-spark hits, glowing orbs, vertical energy column, bullet tracers, small colored sparks — 100+ tiny frames (animated GIFs). Free (author's standard). Covers: weapon impacts, projectile trails, orb (cultist) shots, explosion micro-FX. Verdict: CORE FX pack.
- **6. free-game-assets/free-pixel-magic-sprite-effects-pack** — VIEWED (promo montages): chunky animated pixel magic: shooting stars/meteors, hearts, crystal gems, star bursts, swirl auras, portal rings, sparkles — bold saturated palette. Free (title). Covers: pickup icons (gems/hearts for XP/HP/soulshards), aura/portal FX, meteor-style projectile FX. Verdict: USEFUL for pickups+magic FX; loud palette needs care.
- **7. szadiart/fantasy-lands-houses-demo** — VIEWED: polished painterly pixel top-down props: dirt/stone tile sheets, stone well, barrels, crates, sacks, logs/stumps, rocks, bushes, ladder, path tiles. Demo slice (paid "Fantasy Lands" has more). Free demo. Covers: village/ruin props & landmarks (m03 ruined city, m01 clearing clutter). Verdict: USEFUL props supplement.
- **8. free-game-assets/free-pixel-art-dungeon-objects-asset-pack** — VIEWED: rough-edged pixel dungeon props: horned-skull statue on pedestal, weapon pile, food stall/shelf, small idol statue, barrel, floor mat, spike-saw hazard, flame trail. Free. Covers: landmark statues (rule D92 solid colliders), m03 ruins clutter, saw-trap hazard. Verdict: USEFUL props; modest size.
- **9. pixelgnome/fish** — VIEWED: tiny 8px ultra-minimal cute fish sprite (yellow tang shown vs photo); pack = a few micro fish. Free. Covers: maybe m03 background fish decor only; no shark, too small to be enemies. Verdict: SKIP (too little).
- **10. vryell/tiny-enemies-vol1** — VIEWED: 10 chunky dark-outline chibi enemies (front-facing): brown bear, one-eye spike bug, grey horned BRUTE, white skull head, winged bug, red devil/goblin imp, mushroom, blue FROG, black shadow WISP (wraith-like), beetle. Free (Vol.1 promo style; verify). Covers: brute ✓, goblin→imp ✓, wraith→shadow-wisp/skull ✓, wolf→bear ✓, bat→winged bug ✓; +frog art reusable for toad PC. Strong quantity match (10 ≥ 9). Verdict: CORE enemies.
- **11. deepdivegamestudio/vermin-asset-pack** — VIEWED: 16x16 top-down vermin on stone tiles: red ants (walking), blue spider, pale spider, grasshopper/locust, dark rat-like, red beetle/snail. min_price:0 → FREE. Covers: rat ✓, small swarm filler (VS-adjacent quantity), bat→spider substitute. Verdict: USEFUL small-enemy filler, same style family as #2.
- **12. reaktori/debts-in-the-depths-asset-pack** — VIEWED (full contact sheet): cohesive dark-palette dungeon set, 4-dir walk animations: skeleton warriors, green GOBLIN spearmen, purple horned BRUTE w/club, brown bear-creatures, grey WRAITHS ✓ (top-down ghosts), hooded mages, red dragon-ish beast; projectiles (bolts, orbs, spears), coin piles + loose coins, potions, floor/wall tile bits, moss rocks, reticle + hand cursor. Free (title "Free"). Covers: goblin ✓ brute ✓ wraith ✓ cultist→mage ✓ rat→small beast ✓, XP/pickup coins, projectile FX, dark tiles. Verdict: CORE (excellent enemy-quantity + dungeon fit).
- **13. kronbits/particle-pack** — VIEWED ("1000 Free Game Assets"): on-black particle sprite atlas: hundreds of dots/sparkles/stars/rings/smoke puffs/flares (grey + colored). Free, CC0-style. Covers: particle-system sprites for hits, muzzle flashes, glints, auras — pairs with our canvas additive glow pass. Verdict: USEFUL FX source pack.
- **14. nyknck/fx084** — VIEWED (promo gif): micro pixel FX bits (cyan claw/leaf shards, orange crown sparks, tiny dots) in 15 named effects. Small scale. Price: title has no "free" → treat as PAID/mixed. Verdict: SKIP (tiny scope vs free FX alternatives #5/#13/#40).
- **15. nyknck/fx062** — VIEWED (promo gif): near-identical "PIXEL" micro-FX demo (cyan sparkles, white puff). Free FX062 (title "Free FX"). Verdict: MARGINAL — free micro sparks/impact puffs; overlaps #5/#13.
- **16. karsiori/free-pixel-art-flower-pack** — VIEWED: cute pastel flower pack: bushes, flowerbeds, pink flowering hedges, potted plants, big leafy trees, rocks. Free. Covers: m02 (sakura-pink garden shrubs/hedges) decor; too bright for m01/m03. Verdict: USEFUL for Higan only, small role.
- **17. foozlecc/trap-pack** — VIEWED: "30 Animated Traps": swinging axe/scythe ropes, spike columns, fire jet + flame-ring traps, arrow auto-firers, bounce pads, spinning saws, bear traps, drill-worms. CC badge on sheet. Side-view platform framing but fire/saw/bear-trap FX adapt top-down. Verdict: USEFUL for fire/spear/mine visuals; mostly not needed (game has no trap systems — only relevant for flame FX).
- **18. graphscriptdev/plant-trees** — VIEWED: chunky 48x48 + 16x32 broadleaf trees (day-green, detailed canopies). Free (title). Covers: forest tree props at our scale (48px trees match m01 tree size), day palette only. Verdict: USEFUL tree filler (needs dark tint pass for night).
- **19. cuddle-bug/apocalypse** — VIEWED: modern post-apoc city tiles (asphalt, wrecked cars, streetlights, dumpsters) + zombie/survivor humanoids. Doesn't fit fantasy/snow/sakura/underwater levels. Verdict: SKIP (wrong setting; zombies' quantity role better served by #33 undead).
- **20. jasontomlee/slashfx** — VIEWED: animated slash arcs (red/white crescents, "ZA" hit text) around a top-down demo character on dark grid — multi-direction melee slash frames. Covers: bat/sword/dagger swing FX for melee weapons. Verdict: USEFUL melee-FX filler.
- **21. deepdivegamestudio/humanoid2-asset-pack** — VIEWED: top-down 16px fantasy class humanoids w/ animations: green ARCHER ✓(ranger), blue staff MAGE ✓(mage), orange swordsman/knight ✓(warden), winged knight, staff villagers, on stone tiles. min_price check → free-tier author. Covers: 3 of 9 player classes directly. Verdict: CORE character source (part of cohesive DeepDive 16px family).
- **22. butterymilk/tiny-wonder-rpg-icons** — VIEWED (huge sheet): 150+ soft pastel pixel RPG icons: swords/daggers, staffs, bows+arrows, armor sets, boots, helmets, rings, gems (multi), potions, scrolls, arrows… Free-tier author ("FREE" in title). Covers: ALL HUD/card/passive/pickup icons (weapon cards, equipment bar, XP/coin gems). Style pairs with cute packs. Verdict: CORE icons.
- **23. bdragon1727/platfrom-trap-and-weapon** — VIEWED: small retro side-view trap + weapon sprites (spikes, saws, swinging blades, chests; swords/axes/etc.). Free (author pattern). Covers: a few weapon card icons; traps not needed by design. Verdict: MARGINAL.
- **24. chierit/lively-npcs** — VIEWED: "Lively NPCs: Medieval v2.0" — expressive SIDE-view 16px+ NPCs w/ many anim states: knight, sorceress(orb), bard, blacksmith, farmer, princess, dog, fairy, snake-woman, dwarf w/ hammer, swordsman, archer girl, blue wizard. Free. Covers: rich humanoid cast (→ some PCs/icons) BUT side-view conflicts with top-down entities. Verdict: USEFUL-if-sideview-accepted; MARGINAL for strict top-down.
- **25. frostwindz/pixel-art-slashes** — VIEWED: bold animated slash arcs on black (labeled "Slash 1 Color 1" — multiple slash shapes × color variants). Free ("free" in slug/title). Covers: weapon swing FX (bat/daggers/scythe), big readable hits. Verdict: USEFUL melee FX (same as #20 — pick one).
- **26. shubibubi/winter-things** — VIEWED: cozy modern-cute top-down winter set: decorated market stall w/ nutcrackers, SNOW-covered trees, garland street lamp, diverse small villagers (top-down w/ walk frames). Free. Covers: m01 snow trees + wintry props + generic top-down villager bodies. Verdict: USEFUL m01 decor (cutesy tone; mix carefully).
- **27. deepdivegamestudio/dragon-asset-pack** — VIEWED: top-down animated dragons/wyverns on stone: green, teal, purple, red big, grey-black bat-wyrms. Same DeepDive 16px family (min_price:0 pattern → free). Covers: RYŪ boss slot ✓ (quantity-role; true Eastern dragon = xzany #38), bat-enemy→wyrm variants. Verdict: CORE boss source (m02).
- **28. stealthix/rpg-nature-tileset** — VIEWED: plain 16x16 top-down tiles: grass/dirt/cobble/water autotiles, pine trees, rocks, logs, signs. Simple flat colors. Free. Covers: functional m01 forest ground+trees base (crude vs hero packs). Verdict: MARGINAL tile filler.
- **29. pimen/magical-animation-effects** — VIEWED: tiny single-effect animations on transparency: white moth/dove, blue starburst — a handful of micro FX. MARGINAL→SKIP (tiny scope; #5/#13 cover FX).
- **30. thkaspar/tth-animals** — VIEWED: huge sheet of tiny pixel animals, multi-variant + walk frames: FROGS (green/red/blue/white), weasels, foxes/cats/dogs (many colors), boars, birds (seagull/crow), BEARS (brown/black), sheep. Free (TTH series). Covers: wolf→dog/fox/bear ✓✓ (multi colors→elites), toad-PC frog art ✓, rat→small quadrupeds, bat→birds-ish. Verdict: CORE animal-enemy source.
- **31. clockworkraven/raven-fantasy-pixel-art-tileset-green-forest** — VIEWED: lush high-quality top-down FOREST tileset (explicit FREE badge): round leafy trees, orange autumn trees, dead trees, bushes, flowers, paths, streams+bridge, rocks, mushrooms, acorns. Covers: m01 Evernight Wood hero tileset (darken/tint night palette in-engine — we already own lighting pass). Verdict: CORE tileset (m01).
- **32. finalbossblues/atlantis-tileset** — VIEWED: SNES-quality undersea set: Atlantis city tiles (ruins/palace), huge roster of 4-dir merfolk+human NPC walkers (many colors), BUBBLE effect sprites. Free (FBB standard CC). Covers: m03 Drowned City hero tileset ✓ + bubble decor ✓ + extra NPCs. Verdict: CORE tileset (m03).
- **33. deepdivegamestudio/undead-asset-pack** — VIEWED: top-down undead on stone: skeleton w/ shield, winged valkyrie-skeleton, skeleton mage (staff), skeleton swordsman, crawling blob-skull. Free (same author, min 0). Covers: goblin→skeleton horde ✓ quantity, cultist→mage skeleton ✓, wraith→pale undead ✓. Verdict: USEFUL enemy filler (same family as #21/#27).
- **34. deepdivegamestudio/magical-asset-pack** — VIEWED: top-down elementals: grey ghost/WRAITH ✓, fire elemental ✓, ice elemental, earth/mud elemental (brute-substitute ✓), cloud/tornado, plant elemental. Free (same family). Covers: wraith boss slot ✓, elemental flavor for pyre/snowball/lightning weapons, brute→earth golem ✓. Verdict: CORE-adjacent (wraith + elementals).
- **35. deepdivegamestudio/humanoid-asset-pack** — VIEWED: top-down greenskin humanoids: GOBLINS w/ sword+shield (several variants), tall grey goblin BRUTE ✓, hooded rogue, white fox-folk. Free (same family). Covers: goblin ✓✓ direct, brute ✓. Verdict: CORE (goblin role filled exactly).
- **36. deepdivegamestudio/monsterassetpack** — VIEWED: top-down small monsters: mushroom-folk, yellow/green slimes, teal slug, crystal popper. Free (same family). Covers: harmless blob filler swarm variety. Verdict: USEFUL minor filler.
- **37. pimen/fire-spell-effect-02** — VIEWED: small looping fireball/flame sprites on transparency (single-color pixel fire blobs). Free. Covers: minor fire FX only (pyre flavor). Verdict: MARGINAL (see #5/#17 for fire).
- **38. xzany/samurai-2d-pixel-art** — VIEWED (page media): only samurai CHARACTER demo gifs rendered publicly (white-haired ronin walk/idle — good top-down-usable 8-dir humanoid, 16px-ish). Page JSON min_price:0 → FREE. Pack's tileset/dragon content is in the download, NOT shown as images on the page → UNVERIFIED beyond characters (INR from title/author's known scope: Japanese village, torii, sakura, dragon). Covers (if INR holds): m02 Higan hero tileset + ryū dragon + samurai PC re-skin (swash/gunslinger). STRONG candidate — verify by downloading zip first.
- **39. bdragon1727/free-smoke-fx-pixel-2** — VIEWED: white/grey pixel SMOKE puffs, splash shards, star-burst masks on black — animated variants. Free (title). Covers: dust/smoke/steam + snow-puff FX, luminosity masks for our additive glow pass. Verdict: USEFUL FX.
- **40. ansimuz/explosion-animations-pack** — VIEWED ("FREE" badge): big multi-frame pixel EXPLOSIONS: fireball bursts, white shockwave flash, dark smoke clumps, orange debris. Free. Covers: sunder bombs/homing missile/cannonball detonations, homerun FX. Verdict: CORE explosion FX.
- **41. smallscaleint/hd-8-directional-top-down-character-pack-1** — VIEWED: HD 3/4-view archer character with a full anim matrix (attack/roll/strafe/die…). PRICE verified from page: "$9.95 USD" minimum → PAID → EXCLUDED (D-F3). Style (64px+ painterly) would also clash with 16px pixel packs.

## Coverage matrix + recommended set — 2026-10-26 (after all 41 reviewed)

### Need-by-need coverage
- **Player characters:** DeepDive family alone gives mage ✓, ranger(archer) ✓, warden(knight) ✓ (#21), cultist-style robe ✓ (#12/#33). Golem → earth elemental (#34) ✓. Toad → frogs (#30 / #10) ✓. Werewolf → bears/dogs/fox-folk recolors (#30/#35) ✓-by-role. Swashbuckler/gunslinger/baseball → generic humanoids + recolor (#21/#35) or samurai characters (#38, in-zip unverified). Ghost fallback = pale humanoid/ghost + our per-seat tints (#33/#34).
- **Common enemies (6):** goblin ✓✓ EXACT (#35, #12), brute ✓✓ (#35 tall grey, #12 purple, #34 earth), cultist ✓ (#12 hooded mage, #33 skeleton mage), wolf ✓-by-role (#30 bears/dogs multi-colour = free elite variants), rat ✓ (#11 dark rat, #12 small beasts), bat ✓-by-role (#10 winged bug, #27 grey bat-wyrms).
- **Bosses (3):** wraith ✓✓ (#34 grey ghost, #12 top-down wraiths), ryū ✓ Western dragons (#27) + maybe Eastern dragon inside #38 zip (unverified), **SHARK = GAP — no pack on the list contains a shark** (#9 is an 8px tang only).
- **Tilesets:** m01 ✓ #31 (hero forest) + #3 snow trees + #28 filler; m02 ⚠ depends on #38 zip contents (only character demos were public) + #16 pink flora; m03 ✓ #32 (Atlantis hero + NPCs).
- **Weapons/projectiles:** #12 carries bolts/orbs/spears ✓; #6 meteors/gems ✓; #22 = all card/HUD icons ✓; melee arcs #20/#25; boulder → #31/#7 rocks; tongue/aura stay procedural lines + #39/#13 particles.
- **Pickups/icons:** #22 ✓ (gems, hearts, potions, gear), #12 coins/soulshards ✓.
- **FX:** impacts #5, explosions #40, smoke #39, particles #13, magic #6, slashes #20/#25 — all free.

### Recommended (≤12, free-only, cohesive-first)
1. #21 DeepDive humanoid2 — PCs (mage/ranger/warden)
2. #35 DeepDive humanoid — goblins + brute
3. #34 DeepDive magical — wraith boss + elementals (golem, pyre, snowball)
4. #27 DeepDive dragon — ryū boss
5. #33 DeepDive undead — extra horde quantity
6. #11 DeepDive vermin — rat + small swarm
7. #31 clockworkraven green-forest tileset — m01 hero
8. #32 finalbossblues atlantis — m03 hero
9. #38 xzany samurai — m02 hero (VERIFY zip contents immediately after download)
10. #22 butterymilk icons — all HUD/card icons
11. #40 ansimuz explosions + #39 bdragon smoke — bomb/missile FX (counts as one FX buy, both free)
12. #30 thkaspar animals — wolf-pack/toad role art (style-mix: TTH sprites are lighter; keep to werewolf/toad/wolf only)
Optional adds: #12 reaktori (great but its own style — pick ONLY if a darker dungeon look wins over DeepDive), #3 snow trees, #16 Higan flora, #5 impact micro-FX.
### Gaps the list cannot fill (need a later supplemental search)
- SHARK boss. A genuine "baseball player" costume. Confirmed sakura/Japanese tiles until #38 verified. DeepDive family lacks a werewolf outright.
### Cohesion warning (blunt)
Three house styles collide: DeepDive 16px (1–6 above), thkaspar/reaktori/ansimuz are different palettes/angles. Plan a unifying pass in-engine: our existing half-res darkness + additive glow already unifies night scenes; apply the CFG per-level palette tint to sprites as a fallback.

### Method note (honesty)
All verdicts above cite images actually rendered and viewed this session (img.itch.zone originals via curl → read_file); the agent_browser daemon and itch store-search were unavailable/misindexed for these pages, so price was verified from page JSON (`min_price`) — #2/#11/#21/#33/#34/#35/#36/#38 confirmed min_price:0 (free PWYW); #41 confirmed $9.95 (excluded). #38's non-character content is UNVERIFIED pending zip inspection.

## Shortlist round 2 — 14 user-added packs, F42–F55 (same method; 2026-10-26)
- **F42. smallscaleint/8-directional-top-down-character-pack** — PAGE JSON: min "$9.50 USD" → PAID → EXCLUDED (D-F3; no visual verdict needed).
- **F43. rrfreelance/sprites-pack-16px-over-150** — VIEWED (full sheet): 163 mixed 16px item sprites: hearts, lightning bolt, bombs, bow+arrows, guns, potions, COFFEE can + energy cans, hourglass, flame/water/fire-drop status marks, coins/gems/keys, shields, skull, crab, food… min_price:0 → FREE. Covers: excellent status-effect + run-item + misc icon fill (Coffee/Espresso passives literal ✓). Verdict: USEFUL icon supplement (pairs with #22).
- **F44. aaronsprites/aaron-sprites-freebies-2** — VIEWED: 16px dungeon monster sheets: snakes, bugs/beetles, slimes (incl. slime-knight), gazer eyes, small brown critters, plants — clean retro 16px, min_price:0 FREE. Covers: small-swarm quantity fill (rat/bat stand-ins). Verdict: USEFUL filler.
- **F45. aaronsprites/aaron-sprites-generation-0** — VIEWED (full roster sheet): ~30 original creature sprites (Mon-Rancher-ish, semi-painterly ~48px): BLACK WOLVES ✓✓, brown WEREWOLF-BEAST ✓✓ (direct Werewolf PC/role), grey+white wolves, MOUSE ✓ (rat), purple ghost-wisp ✓ (wraith), small red dragon, axolotl, birds, insects, rhino, plant, witch-fox. min_price:0 FREE. Covers: fills the exact gaps #30 only could approximate: wolf ✓✓, werewolf ✓ (also flagged "DeepDive lacks werewolf"), rat ✓. Verdict: CORE (werewolf/wolf roles; note style is its own).
- **F46. aaronsprites/aaron-sprites-freebies-3** — VIEWED: 5 creatures: gold EASTERN-STYLE serpent DRAGON ✓ (ryū!), red robot, tick/vermin, red fox w/ blue flame, white armored knight-ish. FREE (min 0). Covers: ryū alternate candidate (true eastern dragon shape), gunslinger→armored? no. Verdict: USEFUL (dragon niche + quantity).
- **F47. aaronsprites/aaron-sprites-freebies-4** — VIEWED: 5 creatures: armored turtle-beast, red blood-eye blob, banded cat-beast, green dragonling, six-toed boar-thing. FREE. Covers: generic medium-enemy filler. Verdict: MARGINAL (small, one-off).
- **F48. aaronsprites/aaron-sprites-freebies-5** — VIEWED: snow-yeti (STONE GOLEM role ✓), magenta spider-beast, BIG GREY WOLF ✓✓ (best wolf on either list), tech-deer, gazer staff-mage (cultist ✓). FREE. Verdict: USEFUL (wolf + golem + cultist roles in one small pack).
- **F49. deepdivegamestudio/animalassetpack** — VIEWED: same-family top-down animals (deer, tortoise, green frog, chickens, mallard, brown frog). Would've matched the house style + toad role — BUT page shows min price "$1.40 USD" → NOT free → EXCLUDED (D-F3).
- **F50. ansimuz/warped-shooting-fx** — VIEWED: animated blue/green warp-shot trails, energy bolts, sparks, small heart-shot on synthwave grid promo. min_price:0 FREE. Covers: projectile trail/laser/ring-lightning FX. Verdict: USEFUL projectile FX (style = modern neon, fits our glow pass).
- **F51. ansimuz/gothicvania-magic-pack-9** — VIEWED (sprites on black): pink LIGHTNING bolts + electric hit bursts, blue rings/portals, orange expanding domes/shield, gold zap sparks, teal sparkle trails, blue orbs. min_price:0 FREE. Covers: Ring-of-Chain-Lightning ✓, shock/stun FX, aura rings, moonbolt orbs. Verdict: CORE electric/magic FX.
- **F52. ansimuz/underwater-diving** — VIEWED: mossy sunken-ruins tiles (totem pillars, arches, kelp, coral bits) + 8-dir diver character — side-view platformer framing. min_price:0 FREE. NO shark here. Covers: possible m03 ruin landmark props (side-view caveat). Verdict: MARGINAL (Atlantis #32 already covers m03 better).
- **F53. elthen/2d-pixel-art-fox-sprites** — VIEWED: one fox creature with a huge side-view animation set (idle/run/jump/attack/other), fur-colour variants (orange, arctic, dark), ~48px cute style. min_price:0 FREE. Covers: werewolf-adjacent quadruped animations; wolf role possible by recolour, but side-view. Verdict: USEFUL-if-animated-wolf needed; secondary to F45/F48 wolves.
- **F54. frostwindz/pixel-art-skill-animations-lightning** — VIEWED: big animated LIGHTNING skill FX demos (falling bolts, cyan electric bursts, charged strike frames with demo character). FREE (min 0). Covers: chain-lightning/stun shock FX — pairs with F51 bolts. Verdict: CORE electric FX (pick F51 and/or F54).
- **F55. foozlecc/pixel-magic-sprite-effects** — VIEWED: icon-framed magic FX: fire comet/meteor burst, dark void orb, lava pillar, rock spikes, ice pillar, tornado, smoke trail, blue liquid blobs, white slash. CC badge on sheet (CC0-style). FREE (min 0). Covers: status/DoT + projectile FX variety. Verdict: USEFUL.

### Round-2 impact on the recommendation (D-F6 applied; review extension of 33.1)
- New GAP FILLERS found: **WEREWOLF + WOLF exact roles** → F45 aaronsprites generation-0 (brown werewolf-beast, black/grey wolves, mouse, ghost-wisp) and F48 freebies-5 (big grey wolf, snow yeti = STONE GOLEM ✓, gazer cultist). These resolve the two roles the core set only approximated.
- **RYŪ alternate:** F46 gold serpent-eastern dragon (better shape match than DeepDive's western wyrms) — usable alongside #27.
- **Electric/magic FX:** F51 (lightning bolts/bursts/rings) + F54 (big lightning skill animations) = chain-lightning & stun visuals; F50 warp projectile trails; F55 status-FX variety.
- **Icons:** F43 (163 items incl. literal coffee cans, hourglass, flame/water/element marks) supplements #22.
- **Still PAID → excluded:** F42 $9.50, F49 $1.40 (would have been the style-perfect animal pack — note for the user).
- **SHARK GAP REMAINS OPEN** after both lists (F52 = diver+ruins, no shark; F45–48 no shark).
- Updated core set (12 + 4 targeted): #21,#35,#34,#27,#33,#11 (DeepDive family) + #31 (m01) + #32 (m03) + #38 (m02, verify zip) + #22 (icons) + #40+#39 (explosion/smoke) + ADD F45+F48 (werewolf/wolf/golem roles) + F46 (eastern dragon) + F51/F54 (electric FX). Style-mix warning unchanged: three visual dialects (DeepDive flat-16px, AaronSprites painterly-48px, FX packs various) — the engine's palette-tint + darkness/glow pass is the unifier.

### Round-3 tileset candidates (user-proposed, 2026-10-26)
- **F56. limezu/serenevillage** — VIEWED (2 full scene sheets + avatar): GB/GBC-style cozy rural village: thatched+tile-roof houses, fences, pond, pink-blossom trees, flower beds, paths/roads, full interiors, small chibi NPCs + overworld tilesets. min_price:0 → FREE (id games/544018). Fit for m02: STRONG partial — sakura-toned trees/houses/village bones ✓, but NO torii/pagoda/Fuji seen → would need a small custom-drawn or supplemental Japanese-prop pass. Verdict: CORE candidate for m02 base + best free village tileset so far; pair with props pass.
- **F57. crusenho/nature-fantasy-asset-pack** — VIEWED: Stardew-grade lush forest farm (barn/house, fruit trees, crops, fences, chibi humans). min "$3.50 USD" → PAID and NOT Japanese — wrong level for m02; m01 already covered free by #31. Verdict: SKIP (paid + no role).
