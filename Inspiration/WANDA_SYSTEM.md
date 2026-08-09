# The Wanda+ system, as measured

Everything below was extracted from a full mirror of `https://wanda.net`
(Nuxt 2 SSR, GSAP 3 + ScrollTrigger, no Lenis, no Three.js in the critical path).
Values are the site's own — read off its stylesheets, its bundles, and the
computed styles of a locally-served copy rendered at 1600×1000.

This file documents the *system*. It is not a licence to reproduce Wanda+'s
brand: their wordmark, their roster of real directors, and their reels are
theirs. What we take is the grammar — the geometry, the type roles, the timing.

## 1. Canvas

| Token | Value |
| --- | --- |
| Page background | `#080808` |
| Foreground | `#ffffff` |
| Secondary surfaces | `#0a0a0a`, `#121212` |
| Muted text | `#b5b5b5`, `#737373`, `#4e4e4e` |
| Resting opacity for any link | `0.6` → `1` on hover |

There is no accent colour. None. The entire site is white-on-near-black, and
every bit of hierarchy is carried by opacity, size, and typeface. That
restraint is the design.

## 2. Type

Three roles, three faces:

| Role | Wanda+ | Ours (already self-hosted) |
| --- | --- | --- |
| UI / chrome / body | Söhne light | **Inter** |
| Indexes, names, labels | Söhne mono light / extralight | **IBM Plex Mono** |
| Display / project titles | Trash regular | **Space Grotesk** |

Sizes are absolute pixels, not a modular scale:

- Chrome (breadcrumb, nav, close button): `18px / 21px` desktop, `16px / 18.75px` below 1024
- Index names and filters: `18px / 21px` mono, `16px` below 1024
- Thumbnail label, secondary line: `26px / 28px` mono extralight (`20px / 23.5px` small)
- Thumbnail label, title line: `27.15px / 22px` display (`21px / 19px` small)

`letter-spacing` is `normal` essentially everywhere. Two exceptions exist in the
whole stylesheet (`-.1em`, `.01em`). Do not add tracking.

## 3. Geometry

- Header: `position: fixed`, `75px` tall, `z-index` above everything but the index panel
- Logo: fixed at `left: 40px, top: 26px`, height `19px`
- Breadcrumb starts at `x = 160px` — that 160 is the site's left gutter
- Content container padding: `0 125px 0 160px`
- Index grid: `grid-template-columns: repeat(4, 1fr)`, `grid-gap: 0 160px`, `margin-top: 30px`
  - 3 columns below 1450, 1 column on touch
  - each column is a flex column, `margin-bottom: 10px` per row
- Close button: fixed, `right: 30px, top: 16px`, `padding: 10px`
- Breakpoints: `560`, `812`, `1024`, `1450`

The column gap equals the left gutter equals `160px`. That single repeated
number is what makes the index read as engineered rather than arranged.

## 4. The plus button

An 18px circle, `border: 1px solid currentColor`, `border-radius: 50%`, with two
1px bars centred inside it (`8px` wide, `8px` tall). Open state rotates the
vertical bar `-90deg` over `.2s cubic-bezier(.215,.61,.355,1)` so the plus
becomes a minus. That is the entire menu affordance.

## 5. Nav reveal

`.Nav_links_item` rests at `opacity: 0; visibility: hidden`. When `.Nav` gains
`.active` / `.open`, the three items fade in on a **reverse** stagger — the
*first* child is delayed longest:

```
:nth-child(3) → 0ms
:nth-child(2) → 50ms
:first-child  → 100ms
```

Duration `.25s`, ease `cubic-bezier(.39,.575,.565,1)` (sine-out) entering,
`cubic-bezier(.445,.05,.55,.95)` (sine-in-out) leaving.

## 6. Hover thumbnails on the index

Hovering a name in the index floats a video into the empty space around it.

- `.MenuThumbnail` is `position: absolute; width: 35vw; opacity: 0`
- A `::before` overlay sits at `background: #000; opacity: .3` above the media
- Position is randomised within the viewport minus the header and gutters,
  and explicitly biased **away from** the hovered item's own bounding box, so
  the thumbnail never lands on the word you are pointing at
- Show: `autoAlpha → 1` over `.2s sine`, plus `scale 1.05 → 1` over `.6s expo`
- Hide: `autoAlpha → 0` over `.3s sine.inOut`, video reset after `300ms`
- z-index flips `200` while shown, `100` while hidden

## 7. The generative grid (detail pages)

A horizontal scroller of absolutely-positioned thumbnails at varying sizes.

- `.GenerativeGridItem { position: absolute; pointer-events: none }`, its
  inner container re-enables pointer events
- Media rests at `opacity: .75`, goes to `1` on hover over `.4s ease-out`
- The label is centred (`left:50% top:50% translate(-50%,-50%)`), hidden at
  rest, and fades in over `.2s ease-out` with `visibility` snapping to visible
  at `0s` (and out at `.2s` — so it disappears only after the fade completes)
- Cursor over a playable thumbnail is a custom play-glyph SVG
- Hovered item gets `z-index: 3`

## 8. Motion vocabulary

The whole site runs on a small set of constants. Durations:
`.2 .3 .4 .6 .7 .9`. Eases: `sine`, `sine.inOut`, `expo`, `power2`, `power3`.
Staggers: `{each: .04}`, `.07`, `.15`.

CSS-side, the recurring pair is:

```css
--ease-out:    cubic-bezier(.39, .575, .565, 1);   /* sine-out   */
--ease-in-out: cubic-bezier(.445, .05, .55, .95);  /* sine-inOut */
--ease-quint:  cubic-bezier(.215, .61, .355, 1);   /* quad-out   */
```

Nothing bounces. Nothing overshoots except the `1.05 → 1` thumbnail settle.

## 9. What we deliberately did not copy

The wordmark, the roster, the reels, the Vimeo IDs, the FR/NL language
switcher, the likes system, and the cookie banner. Those are Wanda+'s business,
not a design system.
