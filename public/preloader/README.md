# Preloader assets

## hand-point.png / hand-open.png / hand-closed.png

- **Source:** [Kenney Cursor Pack](https://kenney.nl/assets/cursor-pack) (Outline / Double size: `hand_point`, `hand_open`, `hand_closed`)
- **License:** [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) (public domain dedication)
- **Credit:** Kenney.nl / www.kenney.nl (optional per license)
- **Notes:** Nearest-neighbor upscaled to 192×192. `components/ed/Preloader.vue` cross-fades these three stills in order for a one-shot click: **point → open → closed → open → point**, timed with the approach/press CSS motion. No “Tap” label.

## hand-click.webp / hand-click.gif

- Same Kenney frames, sequenced **point → open → closed → open → point** (one-shot loop count), kept as optional animated fallbacks. The live entry cue prefers the three PNGs above so frame order and timing stay coherent.
