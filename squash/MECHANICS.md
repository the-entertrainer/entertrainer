# Squash

A portrait tap game in the same family as Stack. One word. One move. Your thumb is the whole tool. There is no swatter.

## Names

Stack works because the title is the verb. These do the same job:

| Name | Why it fits |
|---|---|
| **Squash** | The tap. Recommended. The pack is built under this name. |
| Scuttle | How they cross the wall. |
| Swarm | The screen filling up. |
| Burst | The payoff frame. |
| Creep | The slow dread before the glow shows up. |
| Flick | The thumb, if the tap should feel lighter. |

Squash is the one to ship. The others are alternates, not subtitles.

## The one rule

Brown bugs die when the thumb lands on them. The glowing one ends the run if the thumb lands on it. Nothing else ends the run. A bug that walks off the wall is a missed point, not a death. A tap on empty tile is a ripple, not a penalty.

That is the whole game, the way Stack is only “drop the slab.”

## What you are looking at

Night. A service wall. The tiles are the ones in this pack, light or dark, same grout either way. Ordinary cockroaches cross it because the wall is warm. A few are wrong: they came up a cracked drain and they glow. They are not worth more points. They are the mistake.

You are not holding anything. The finger is the hit.

## Screen

Portrait. The wall fills the screen. The camera does not scroll. Bugs enter from the edges and leave through the edges. The score sits on the Stack slab (yellow bar, ink body). Pause, sound, and the best-run star are the buttons in `ui_light.png` / `ui_dark.png`. Light and dark are the same layout. Only the tile and the chrome swap. The bugs do not recolor. You learn one silhouette.

## Bugs

Three bodies, one skeleton. Headings are that skeleton turned. Frame 0 of a burst is the same pixels as crawl frame 0 facing east.

- **Roach.** The normal target. Eight crawl frames, eight headings.
- **Nymph.** The same bug at 0.62 scale, same pivot, same frame count. Use it in the first wave so the wall is busy before it is fast. Same tap rules. Smaller hitbox, scaled with the sprite.
- **Radioactive.** Same skeleton, neon rim, magenta eyes, two horns, a glow that breathes across the eight frames. It is not a recolor of a different drawing. Touch plays `radio_flare`, not the burst. The flare does not squash it. You did not kill it.

Crawl sheets are 8 columns by 8 rows.

- Column = frame `0..7`. Play at 16 fps.
- Row = heading. Row 0 faces east. Each row below turns 45° clockwise: east, south-east, south, south-west, west, north-west, north, north-east.
- Pivot is the center of the 192×192 cell, pixel `(96, 96)`. Rotate around that point if you interpolate between headings. Do not rotate the burst or the flare.

## The tap

A tap is a circle about 44 px across on a 390-wide phone, placed at the finger. It is not a rectangle the size of the sprite.

Hitboxes are ellipses around the pivot, in the sprite’s own pixels, before the game scales the sprite:

| Zone | rx | ry | Result |
|---|---|---|---|
| Clean | 16 | 12 | 2 points before the combo |
| Body | 36 | 24 | 1 point before the combo |
| Radio | 42 | 30 | Run over |

Antennae and the outer glow are not the hit. Legs are not the hit. The body is the hit. The radioactive ellipse is a little larger than the brown one on purpose: “I barely touched the glow” still counts, because the glow is the warning.

On a brown hit, freeze the bug for two draw frames, then play `roach_burst` or `nymph_burst` at 22 fps on that same pivot. Do not rotate the burst. Frames 1 and 2 squash the pose. Frames 3 to 7 move those same pixels apart over a yellow stain. That stain is the Stack yellow.

On an empty tap, play `tap_ripple` at 18 fps (4 frames) in that same yellow. The wall should answer every touch.

## Score

- Clean tap: 2. Body tap: 1. Nymphs score the same. They are not bonus objects.
- Combo: another kill within 0.7 s multiplies the next tap, from ×1 up to ×8. The window refreshes on each kill.
- A normal bug that leaves the screen resets the combo. A tap on tile does not.
- At ×8, Fever for 4 seconds. Crawl speed drops to 0.72 of current. Points double. The radioactive bug does not slow down, and it is still lethal. Fever is the one place the run feels generous.
- Best score is a number on the device, the way Stack keeps a best. No account.

Speed starts so a bug takes about two seconds to cross the long side of the phone. Every 8 kills, speed rises 8%. Radioactive bugs move at 1.25× the current normal speed, so they read as the thing you do not casually land on.

## Spawning, so it stays fair

- The first 8 seconds are brown only. Nymphs first, then full roaches.
- After that, at most one radioactive bug on screen until the score passes 40. Then at most two.
- Never more than one radioactive for every five bugs alive.
- Do not spawn one inside 80 px of the last tap for 0.4 s.
- Heading snaps to the eight sheet rows. The path is a straight line. If two bugs would overlap on entry, hold the newer one for 0.2 s.
- Cap the living set around 9. Past that, the thumb is guessing, and the radioactive tell stops being readable.

A run is one sitting, about a minute if you are sharp, shorter if you touch the glow. There is no world map and no second weapon.

## Light and dark

Same as Stack.

| | Light | Dark |
|---|---|---|
| Paper | `#FBF8EF` | `#121214` |
| Ink | `#161618` | `#EDE6D6` |
| Yellow | `#FFD43B` | `#E8C547` |

Tiles: `wall_light_plain.png`, `wall_light_crack.png`, `wall_light_stain.png`, and the dark pair. Each tile is 128×128. The grout is the right 4 px and the bottom 4 px, so a grid of tiles meets on one grout line. Scatter the crack and stain tiles. Do not animate the wall.

UI sheets are 180×180 cells, 4 columns. The atlas names the rects: `pause`, `play`, `retry`, `sound`, `score`, `best`, `mark`, `danger`, `combo`, `tap`, `over`. Numbers are not baked into the sheets. Set them in Fraunces, the Stack face, ink on the score slab and ink on the yellow best slab.

## Files

- `sheets/` — what the game loads.
- `frames/` — the east-facing crawl, the burst, and the flare, one PNG per frame, so a frame can be checked without slicing.
- `preview/contact.png` — the east cycles in a row.
- `preview/headings.png` — one pose, eight headings.
- `preview/wall_*_seam.png` — a tile repeated 3×3.
- `atlas.json` — cell size, pivot, hitboxes, sheet layout.
- `build_sprites.py` — rebuilds every frame from the same skeleton. Do not redraw a frame by hand. A hand-drawn frame will not sit on this pivot.

## What this pack refuses

No swatter. No blood. No second enemy that is also lethal. No sheet where frame 3 is a different animal. The radioactive bug is the only neon on the screen. Everything else stays cream, ink, and yellow.
