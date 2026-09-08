# Preloader assets

## hand-point.png / hand-open.png / hand-closed.png

- **Source:** [Kenney Cursor Pack](https://kenney.nl/assets/cursor-pack) (Outline / Double size: `hand_point`, `hand_open`, `hand_closed`)
- **License:** [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) (public domain dedication)
- **Credit:** Kenney.nl / www.kenney.nl (optional per license)
- **Notes:** Nearest-neighbor upscaled to 192×192. `components/ed/Preloader.vue` cross-fades these three stills for a one-shot click cue: **point (approach/hover) → open (reach logo) → closed held ~500ms → fade out**. No spooky/witch cursors. No “Tap” label. Live cue uses the PNGs only (not the GIF/WebP loop).

## hand-click.webp / hand-click.gif

- Same Kenney Outline frames, sequenced for reference / optional fallbacks. The live entry cue prefers the three PNGs above so frame order and the half-second closed hold stay coherent.
