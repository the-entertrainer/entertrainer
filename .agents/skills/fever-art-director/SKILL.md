---
name: fever-art-director
description: Standing art director for Fever Dream. Critique and fix HUD padding, menus, cutscenes, textures, VFX slop, camera cuts, and cheap SFX until the kitchen reads as a directed game, not a bolted-on prototype.
---

# Fever Art Director

Run this skill whenever Fever Dream UI, combat feel, camera, audio, or materials change.

## House rules

- Kitchen art direction stays acid yellow / magenta over a grimy night interior. Do not flatten it to the site editorial guide.
- Menus are title, optional score line, Play / Resume / Again / Exit. No joke paragraphs, credits walls, or shot-number title cards in the pause/title stack.
- Credits live under FX.
- Pointers always raycast from the gameplay camera. A cutscene camera must never steal hits.
- Do not cut, punch, or orbit the camera while a finger is down or a turret is being placed.
- Pools never steal a live bullet, spark, slash, or corpse.
- Toolbar targets stay at least 44px. Safe-area insets stay on chrome, shop, and skip.
- No raw debug strings in the HUD (`SWIPE / FEVER`, `3× SWIPE`).
- Generated combat audio is allowed. Sine-beep blades and uncropped 1s crunches are not.

## Critique order

1. Interaction correctness (picks, pause, restart leftovers).
2. Camera grammar (ease in / hold / ease out, no teleports).
3. Combat readability (trail, tracers, muzzle, impact).
4. Sound (swipe whoosh vs hit crunch, gun vs ricochet).
5. Padding and type (HUD rows, letterbox, modal chrome).
6. Material cheapness (flat tiles, missing grout, unlit FX).
7. Slop copy.

## Fail the build if

- Undeclared identifiers in camera / battle code.
- Cinema shot labels like `01 / THE DROP` in the player HUD.
- Combo label printing internal attack enums only.
- Overlay cards with `.intro-copy` visible.
- Icon buttons under 44px at 360px width.
