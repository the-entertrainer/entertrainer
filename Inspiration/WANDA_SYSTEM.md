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
| Nav links (Likes/Awards/Contact) | hidden, revealed on hover/plus | ~~always visible~~ — **corrected in §13**: a real recording shows no nav text anywhere on the mobile home; `.touch .Nav_links_item{opacity:1}` governs the *open index overlay*, not the header at rest |
| Plus button | inside `.Nav`, hover-revealed with it | a **separate** element outside `.Nav`, always present — `.touch .Nav>.PlusButton{display:none}` hides only the desktop one |
| Directors index container padding | `0 125px 0 160px` | `.touch .Directors_container{padding:55px 0 10px 138px !important}` |
| Directors grid on touch | — | fixed-height, internally scrolling: `height:calc(100vh - 255px);overflow:auto` — the *page* doesn't scroll, the list does |

On touch there is no hover, so `onItemMouseEnter: ENV.isTouch || show()`
never fires — true, but **this table is still incomplete about what that
means for the thumbnail deck itself.** The obvious read is "no hover, so the
thumbnails just don't show" — that's what an earlier version of this file
claimed, from a static mirror with the reveal forced by hand. A real phone
recording (§12) shows the opposite: on touch the deck shows *every* thumbnail
at once, unconditionally, scrolling — the hover-gated single-preview
behaviour is a *desktop-only* affordance, not the thing that degrades when
touch removes hover. Read §12 before treating "mobile" and "plain text list"
as synonyms anywhere in this file.

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

This repo's home has gone through three shapes, each one a response to what
the previous one got wrong when checked against real evidence:

1. **A monospace name-index**, modelled on §10's forced-reveal render of the
   desktop directors list. Correct as far as it went, but §10 was reading a
   *desktop* interaction model and generalising it to the whole site.
2. **A flat wall of full-bleed panels**, one per destination, five layout
   variants so neighbours wouldn't repeat — an explicit design brief for
   *this* site, not a claim about wanda.net's own look. Its titles were sized
   against no measurement at all (up to `190px` on one variant) and read as a
   poster wall next to what §10 had actually found on the source's index.
   Pulled back once, then replaced entirely once §12 landed — item 3.
3. **The scattered, overlapping cascade in `ScatterDeck.vue`** (§12), once a
   real phone recording showed that neither of the first two was how
   wanda.net's *mobile* home works at all. This is the current shape.

None of this means "guess, then get corrected" was fine to repeat three
times — it means each guess should have been checked against a real render
before being treated as final, and wasn't, twice. §10 and §12 are both here
as a record of what checking actually turned up, not as a tour of mistakes
for their own sake.

The chrome — header, logo, nav, plus button, index overlay, column
breakpoints — was corrected to the real measured values in §3a rather than
adjusted by feel, and that correction survived all three shapes of the home
above it unchanged.

`/my-work` and `/tools` still run the old stacked-and-scrolling
`HeroTitle`/`GenerativeGrid` pair rather than the fixed-viewport mechanic
found in §7 — not because it's wrong to fix, but because nothing in the site
links to either route any more (the flat wall replaced them as the
navigation), so it wasn't the highest-value use of the time this pass had.

## 12. §10 was wrong about the mobile home. Here's what a real phone showed.

§10 forced the reveal on a static local mirror and read the result as ground
truth: a plain monospace name list, no thumbnails, because
`onItemMouseEnter: ENV.isTouch || show()` looked like it meant "the
hover-preview system is simply absent on touch." That's true as a statement
about the *hover handler*. It is not true about what a phone actually shows,
which a real screen recording of wanda.net on a real phone (not a static
mirror, not a forced CSS reveal — an actual browser session) settled directly.

The mobile home is `.Directors_thumbnails` shown **unconditionally**, not
hover-gated content this repo previously assumed was invisible without a
mouse. Every thumbnail is on screen at once, autoplaying, arranged in a
vertically-scrolling cascade: each one offset left or right of the one
before it, overlapping its tail by a modest margin, later cards drawn over
earlier ones. The whole thing scrolls as one continuous surface — there is
no separate "index" to scroll past to reach it, because on mobile the
thumbnail deck *is* the index. No director names are visible anywhere in a
7.6-second recording of continuous scrolling.

The lesson generalises past this one component: **a static mirror with the
reveal forced on shows what CSS makes visible, not what the site actually
does.** Where those two facts conflict — as they did here — the mirror is
the one that's wrong, because it has no access to whatever runtime logic
(here, `ENV.isTouch` presumably driving an unconditional `show()` on mount
rather than the hover-gated one desktop uses) decides what's shown by
default. Prefer a real device/browser recording over a mirror's forced state
whenever the two are available and disagree.

### What this repo's home actually is

`components/wanda/ScatterDeck.vue` is the read of this recording — not a
literal port, an adaptation, for two reasons stated in the component's own
header comment:

1. **No autoplaying video.** The source's cascade works as pure decoration
   because dozens of anonymous reels *are* the content — you don't need to
   know whose work you're looking at to enjoy watching it move. Eight static
   project screenshots aren't that; a visitor needs to know "About" from
   "EasyMCQ" or the deck is just texture. Each card carries a small
   monospace caption (index number + label) anchored to its own **top-left**
   corner.

   That anchor point isn't arbitrary — it came out of a real bug. The first
   version anchored captions to each card's *bottom*-left, which is exactly
   the region the next card's overlap slides up into. "Instructional
   Design"'s caption was silently buried under the SEWA card in the very
   first render. A card's negative `margin-top` only ever pulls *its own* top
   edge up into the *previous* card's bottom — nothing pulls the reverse
   direction — so a card's top is the one region of it a later card can never
   paint over. Caption placement follows from that, not from taste.

2. **A genuine scroll-linked parallax**, not a measured one. Nothing in the
   recording proves the source runs differential per-panel scroll speed
   rather than uniform scroll plus autoplaying video creating the illusion of
   it — there's no way to tell those apart by eye. It's implemented anyway
   because "parallax" was the word used to ask for this look, and uniform
   scroll wouldn't earn it. Each card gets a small `translateY` offset,
   proportional to its distance from the viewport's vertical centre, sign and
   magnitude varying per index, clamped to ±48px so it never disturbs the
   overlap geometry the cascade depends on. Verified directly: measuring
   on-screen position before and after a 300px scroll shows a −283 to −351px
   delta across different cards rather than a uniform −300px, confirming the
   drift is real and not just reported motion.

## 13. §12's first build, checked against the same recording again — two things it got wrong

Re-checking `ScatterDeck.vue` against the same phone recording, frame by
frame with a measurement grid rather than by eye, found two concrete
mistakes — both worth recording because both came from the same failure
mode: generalising a real, correctly-read fact into a rule broader than the
evidence supported.

**Nav links were visible on the mobile home at rest. The recording never
shows nav text at all, in 7.6 seconds of continuous scrolling.** §3a found
`.touch .Nav_links_item{opacity:1}` in the source's real CSS and read it as
"nav is unconditionally visible on touch" — true as a statement about that
rule, false as a claim about the home route's default state. The rule almost
certainly governs the nav *once the index overlay is open*, not the header
at rest; nothing checked that distinction against a render before it shipped.
Fixed by deleting the mobile override entirely and letting nav follow the
same hidden-until-summoned behaviour `Surface.vue` already gives desktop —
it simply never receives a hover to trigger it on touch, which turns out to
be correct. `About` is already one of the eight cards in the deck and
`Contact` lives in the page footer, so removing the header nav's mobile
visibility doesn't remove a real path to either.

**The cascade's overlap was roughly 2-3× deeper than the reference's.**
`margin-top: -19vh/-14vh/-9vh` had no basis in a measurement — vh is a
viewport-height fraction, and a card's rendered height is a function of its
*width*, so tying overlap to vh means the ratio between "how much overlap"
and "how tall the card actually is" is different at every viewport and
was never checked at any of them. Pixel-measuring five consecutive cards
directly off the recording (a 480px-wide extracted frame, gridded every
50px) gives overlap-to-previous-card-height ratios of 13%, 21%, 20%, 26% —
consistently in a 13-26% band, not the 40-60%+ a `-19vh` margin produces on
a typical viewport. Fixed by switching to `margin-top: -9%` — a vertical
percentage margin resolves against the *containing block's width* per the
CSS box model, which is what's actually wanted here, since it makes the
overlap scale with card width (and therefore card height, being a fixed
aspect-ratio multiple of it) automatically, at every breakpoint, with one
declaration instead of three guessed ones.

The same measurement pass also found card widths varying between roughly
63% and 75% across those five cards, not one fixed value — `ScatterDeck.vue`
already had per-card width variety from `seed()` (74/78/82%), but a mobile
override forced every card to a flat 84% regardless, which was quietly
throwing that variety away right where the cascade needed it most to read as
loose. Deleted the override; the seeded widths now carry through unchanged

## 14. The scatter deck was the wrong structure, not just imprecise. Reverted.

§12 and §13 assumed the phone recording showed the mobile home's rest state,
because a static capture of the same page — three separate ones by this
point — couldn't get `.Directors` past `opacity:0` no matter how the reveal
was forced. That was read as the static capture being the thing that
couldn't be trusted, and the recording as the fallback ground truth. Told
directly that the intended target was the text index rather than the
recording's scattered deck, revisiting the evidence with that told: a static
capture stuck at `opacity:0` is evidence the JS-driven reveal isn't firing in
that environment, not evidence about which content is *supposed* to be
there once it does. The recording may well have been the plain index's own
entrance transition — thumbnails easing into a cascade before settling into
the list §1–§11 already describes — misread as the page's permanent state
because the clip ended before it would have settled. That's a plausible
account of everything actually seen; it isn't a claim the recording somehow
becomes false evidence in hindsight, only that "here is 7.6 seconds of a
page" was never enough by itself to prove "and this is all it ever shows."

`ScatterDeck.vue` is deleted. The home route now renders `IndexPanel.vue`
directly — the same component every other route already uses for the
plus-button overlay, given a second `variant="inline"` mode: no fixed
positioning, no backdrop, `open` forced true, living in the page flow instead
of over it. One component, two contexts, rather than two components
maintaining the same list-plus-floating-thumbnail behaviour in parallel.

One adaptation from the literal sample remains, already true of the index
overlay and now load-bearing for the home route too: hovering a name reveals
a static project image where the source reveals autoplaying video — this
site has no video CDN and no fleet of reels to draw one from. The name
itself needed no adapting; it was never hidden on either site. Eight
identifiable destinations read as a plain list either way, which is
`IndexPanel.vue`'s whole design already, not something added for this.
at every breakpoint.
