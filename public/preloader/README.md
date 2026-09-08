# Preloader assets

## hand-point.png / hand-open.png / hand-closed.png

- **Source:** [Spooky Cursors Pack Vol. 1](https://opengameart.org/content/spooky-cursors-pack) by [Tisroc](https://tisroc.itch.io/spooky-cursors-pack) — `witch_hand` set (`default` / `hover` / `click`)
- **License:** [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) (public domain dedication) — see `LICENSE-hand-CC0.txt`
- **Credit:** Tisroc (optional per license)
- **Notes:** Nearest-neighbor upscaled 64×64 → 192×192. `components/ed/Preloader.vue` cross-fades these three stills for a one-shot click: **point (default) → open (hover) → closed (click) → open → fade**, timed with the approach/press CSS motion. No “Tap” label. Visually distinct from the previous Kenney Outline/Double white silhouette.

## hand-click.webp / hand-click.gif

- Same Tisroc `witch_hand` frames, sequenced **point → open → closed → open → point**, kept as optional animated fallbacks. The live entry cue prefers the three PNGs above so frame order and timing stay coherent.
