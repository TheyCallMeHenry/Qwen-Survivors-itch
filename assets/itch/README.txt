NASHA'S SAMURAI TALES: FREE YOKAI HUNTERS
=========================================

Hi, and welcome to the hills on a yokai night! This pack is free.

Inside you'll find the hunters who go out after dark in old Japan and
the strange things they track: 234 objects and 45 seamless tiles -
279 sprites in total.

Archers, ronin, spear women, scouts, falconers and old trackers, lantern
bearers, a night patrolman, a boatman, a puppeteer and frightened
villagers; nue, baku, raiju, tsuchigumo, mokumokuren, kasha, wanyudo,
keukegen, a giant catfish, a giant centipede, fox fires and many more
yokai; willows, dead pines and twisted trees, a tree stand, a hunter's
cage and a scarecrow; a hunters' camp with traps, nets, a smoking rack,
a yokai cage cart and a hollow log with eyes inside; and a hundred small
things - weapons and traps, lanterns, camp food, yokai trophies like a
nue tail tuft and a raiju claw, and the hunters' travel gear.

Nothing in the pack carries letters, kanji or numbers, so it fits a
game in any language.


WHERE THINGS ARE
----------------

sprites/        One PNG per object, sorted into folders:
                  yokai_hunters_and_night_folk
                                            36
                  yokai                     34  eerie creatures and
                                               spirits of the old tales
                  tall_trees_and_hunting_landmarks
                                            29
                  hunters_camp_and_wild_places
                                            36  traps, nets,
                                               fires, mossy rocks
                  weapons_traps_and_hunting_tools
                                            37
                  camp_food                 10
                  yokai_trophies_and_night_finds
                                            21  claws, feathers,
                                               fox fires, ghost mushrooms
                  travel_gear_and_clothing  31
                Transparent background, trimmed tight.

spritesheets/   Each folder on a single sheet with equal-sized cells, handy
                if your engine likes to slice a sheet. The .json next to
                each sheet tells you which cell is which object.

tiles/          Seamless 32x32 tiles. Repeat them as far as you like.

  floors/       6 grounds: a dark forest floor, a pine needle trail,
                night hill grass, marsh reed mud, mossy rock ground and a
                misty black stream.

  walls/        3 walls: a rough log fence, a thorny bramble wall and
                a dark rock cliff.

  transitions/  36 transition tiles for soft, wavy edges between the grass
                and the trail, the grass and the stream, the forest floor
                and the mossy rocks.
                Each set has 12 pieces, named after where the second
                ground sits in the tile:
                  _n _s _e _w       edges (e.g. _n: second ground on top)
                  _nw _ne _sw _se   outer corners
                  _inw _ine _isw _ise
                                    inner corners

manifest.json   A list of every object with its category and size, in case
                you want to load things by name in code.


A FEW TIPS
----------

The sprites are small on purpose, so you can scale them to suit your
game. Scale by whole numbers - 2x, 3x, 4x - and turn off smoothing so
the pixels stay crisp:

  Godot       set the texture Filter to Off (or Nearest)
  Unity       Filter Mode: Point, Compression: None
  GameMaker   untick "Interpolate colours between pixels"

Campfires, torches, lanterns and fox fires are drawn flat with no glow
baked in - add a soft light around them in your engine for night scenes.
The pack shares the style and scale of Nasha's Samurai Tales: Yokai
Night and fits a 32x32 tile grid.


USING THE PACK
--------------

You're welcome to use these sprites in your free and commercial games and
projects, and to edit, recolour and mix them however you like. A credit
is always lovely, but not required.

Please don't resell or share the sprites themselves (as they are or
modified), and don't use them to train AI models. The full terms are in
LICENSE.txt.


Happy hunting!
- Nasha
