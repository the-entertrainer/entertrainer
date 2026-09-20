# Vilakku

Mobile WebGL folk-horror at `/engage/vilakku`.

Kerala tharavadu, 1994. First-person from Unni’s room. Night 1 is a fixed-camera
sleep-paralysis sequence (empty shed → figure at the shed → figure on the bars).
Nights 2–5 are exploration beats in the house: dump the kashayam, read the
scratched 1958 photograph and Rohini chart, find the palm-leaf pact, watch the
courtyard from under the floor, then walk to the wood shed on Amavasi.

The figure is a starved, joint-snapping vessel. It is not drawn as a sexual body.

## Stack

- Three.js, custom GLSL threshold / VHS / hatch composite
- Procedural Web Audio (rain, thunder, heartbeat, snaps)
- Dual-touch: left floating stick, right look, lamp / crouch / interact

## Files

- `vilakku/engine.ts` — loop, nights, lighting
- `vilakku/world.ts` — tharavadu geometry
- `pages/engage/vilakku.vue` — Nuxt mount (layoutless, client-only)
