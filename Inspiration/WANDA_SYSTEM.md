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
  - **Column count is 4 → 3 → 1. There is no 2-column tier at any width** —
    verified by walking the compiled CSS with its `@media` nesting intact
    rather than flattening rules out of context (which is how a false
    2-column step got invented in an earlier pass of this file). `repeat(4,1fr)`
    above 1450px, `repeat(3,1fr)` from 1450 down to 1024px, `1fr` at 1024px
    and below, all the way to the smallest phone.
  - each column is a flex column, `margin-bottom: 10px` per row
- Close button: fixed, `right: 30px, top: 16px`, `padding: 10px`
- Breakpoints: `560`, `812`, `1024`, `1450`

The column gap equals the left gutter equals `160px`. That single repeated
number is what makes the index read as engineered rather than arranged.

### 3a. Mobile chrome is not the desktop chrome scaled down

A device-emulated render at 390×844 with touch enabled (§10) turns up a
**different** header, not a shrunk one:

| | Desktop | Touch (≤812px) |
| --- | --- | --- |
| Header height | `75px` | **`40px`** |
| Header background | transparent (floats over content) | **solid `#080808`** |
| Logo height | `19px` | **`22px` — bigger, not smaller** |
| Logo position | `left:40, top:26` | `left:15, top:9` |
| Breadcrumb | visible | `display:none` (no `.mobile`-variant items exist on the pages checked, so the net effect is simply hidden) |
| Nav links (Likes/Awards/Contact) | hidden, revealed on hover/plus | **always visible**, stacked vertically, `opacity:1` unconditionally |
| Plus button | inside `.Nav`, hover-revealed with it | a **separate** element outside `.Nav`, always present — `.touch .Nav>.PlusButton{display:none}` hides only the desktop one |
| Directors index container padding | `0 125px 0 160px` | `.touch .Directors_container{padding:55px 0 10px 138px !important}` |
| Directors grid on touch | — | fixed-height, internally scrolling: `height:calc(100vh - 255px);overflow:auto` — the *page* doesn't scroll, the list does |

The load-bearing fact under all of this: on touch there is no hover, so
`onItemMouseEnter: ENV.isTouch || show()` never fires. **The hover-thumbnail
system doesn't degrade gracefully on mobile — it's simply absent.** Mobile is
a plain, quiet, monospace list. Nothing else.

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

**The page this grid lives on does not scroll.** `.Director { height:100%;
overflow:hidden; position:relative; width:100% }` — the whole route is a
fixed 100vh/100vw canvas, verified directly from the route's own CSS chunk
(`7d1facc.css`, undiscovered in the first pass because Nuxt code-splits CSS
per route and only the shared/global chunks were pulled that time). The name
is pinned, not stacked above the grid: `.Director>.HeroTitle{font-family:
"Trash light"; left:40px; position:fixed; top:50%; width:calc(100% - 80px)}`
— vertically centred on the left edge, `white-space:nowrap`, sized by a
hidden `.HeroTitle_placeholder` measurement element rather than a fixed
clamp. The `HorizontalGenerativeGrid` fills the same viewport behind/around
it and is what actually scrolls, driven by wheel delta. Below 812px the title
drops the centring and anchors to the bottom-left instead:
`.Director>.HeroTitle{bottom:40px;left:15px;top:auto}`.

`components/wanda/HeroTitle.vue` and `GenerativeGrid.vue` in this repo predate
this finding and use a conventional stacked, page-scrolling layout instead —
they were never rebuilt to the fixed-viewport mechanic because the two routes
that use them (`/my-work`, `/tools`) are no longer linked from anywhere in the
site (§11). Worth doing if either page comes back into the nav.

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

## 10. How this was actually verified

wanda.net was unreachable through this session's egress proxy on the second
pass — not specific to the site: Chromium reset the connection on *every*
HTTPS host tried, including `example.com`, while `curl` through the identical
proxy succeeded every time. That's a proxy/browser interaction problem, not
something to route around by disabling TLS verification, so the fix was to
rebuild the local mirror properly instead: fetch every CSS/JS chunk a route
actually references (not just the ones the homepage happens to load — this is
what surfaced the missing `7d1facc.css` in §7), including the real
Söhne/Söhne-mono/Trash `.woff2` files, and serve it locally where Chromium
*can* connect.

That still wasn't enough on its own. The reveal animations that bring the
index and the detail-page content to visible opacity depend on Nuxt/Vuex
state that a static mirror can't fully reconstruct, so every panel rendered
at its rest state: `opacity:0`. The fix was to force the reveal directly —
`page.addStyleTag` overriding `opacity/visibility:1 !important` on the
relevant classes after load — which sacrifices the *animation* but exposes
the real *content*: real type, real spacing, real hierarchy, at both 390×844
(with `isMobile`/`hasTouch` set so the site's own `ontouchstart` detection
takes the real touch code path) and 1600×1000.

What that turned up, stated plainly because it corrected real mistakes in the
first pass of this rebuild: **the index has no large display type on it at
all.** No hero headline, no giant wordmark filling the viewport — just the
small fixed logo and a page of small monospace names, with faint video
texture doing the only decorative work. Giant type is a *detail-page* device
(§7), not a homepage one. A rebuild that puts 96–200px headlines across its
landing page is not reproducing this system; it's doing something else while
borrowing its palette.

## 11. Departures from a literal reproduction, and why

This repo's home is a flat wall of full-bleed panels — one per destination,
laid out in five different arrangements so neighbours never repeat — rather
than wanda.net's monospace name-index. That structure was an explicit design
brief for *this* site, not a claim about what wanda.net's homepage looks
like, and it stands on its own regardless of what §10 found.

What §10 did change: the panel titles were originally sized against no
measurement at all (`clamp(40px,5.5vw,96px)` on every panel, up to `190px` on
the `type` variant) and read as a poster wall next to the source's quiet
index. They're pulled back — `clamp(32px,3.6vw,64px)` baseline, `100px` and
`120px` ceilings on the two variants that go bigger — enough to keep the
titles reading as the panel's largest element without dominating the
description under them the way the old scale did. The chrome (header, logo,
nav, plus button, index overlay, column breakpoints) was corrected to the
real measured values in §3a rather than adjusted by feel.

`/my-work` and `/tools` still run the old stacked-and-scrolling
`HeroTitle`/`GenerativeGrid` pair rather than the fixed-viewport mechanic
found in §7 — not because it's wrong to fix, but because nothing in the site
links to either route any more (the flat wall replaced them as the
navigation), so it wasn't the highest-value use of the time this pass had.
