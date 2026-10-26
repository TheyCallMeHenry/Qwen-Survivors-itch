# Fork asset research + decisions — 2026-10-26

Single home for the fork's founding decisions and verified findings (parent PROGRESS Format contract §1: one home per fact). F = fact verified this session, INR = inference.

## Decisions (binding, from the user's own words — 2026-10-26)
- **D-F1 Sibling fork.** The itch-art fork lives at `D:\Apps\Qwen-Survivors-itch`, created as a full git clone at published commit `f2277cd` (shared history; `origin` = parent folder). Approved by the user's explicit choice of the recommended option.
- **D-F2 Gameplay frozen.** "Yes, keep all gameplay logic as-is in the current build." The fork's only variable is visuals.
- **D-F3 Free-only packs.** "100% cost-free packs ONLY."
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
