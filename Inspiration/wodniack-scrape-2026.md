# wodniack.dev — Firecrawl Scrape & Structural Analysis

**Scraped:** 2026-07-27
**Target:** `https://wodniack.dev/`
**Method:** Firecrawl API v2 (`FIRECRAWL_API_KEY` from environment)
**Endpoints used:** `/v2/map`, `/v2/scrape` (markdown + html + links + rawHtml), `/v2/crawl`
**Result:** HTTP 200 on every call. No fallback or alternative scraping method was used.

---

## 0. Scrape Provenance

| Call | Endpoint | Params | Result |
|---|---|---|---|
| 1 | `POST /v2/scrape` | `formats:[markdown]` | 200 — key validated |
| 2 | `POST /v2/map` | `limit:200` | 200 — **1 URL returned** |
| 3 | `POST /v2/scrape` | `formats:[markdown,html,links]`, `waitFor:6000` | 200 — 7,265 chars md / 179,791 chars html / 20 links |
| 4 | `POST /v2/crawl` | `limit:30`, `waitFor:4000` | 200 — job `019f9d0a-547b-7304-af8c-1f6e0eff06c5`, **status `completed`, total 1, completed 1** |
| 5 | `POST /v2/scrape` | `formats:[rawHtml]` | 200 — 182,877 chars, recovered `<link rel=stylesheet>` + font preloads |
| 6 | `POST /v2/scrape` | `/_astro/index.MJ9FiCyD.css` | 200 — 72,702 chars of production CSS |

**Key finding:** wodniack.dev is a **single-page site**. Both `/v2/map` and a full `/v2/crawl` return exactly one URL. All navigation is in-page anchors (`#about`, `#work`, `#contact`). There are no sub-pages, no case-study detail pages, no blog.

> Note on the CSS: Firecrawl's `html` format strips `<style>`/`<link>`. The `rawHtml` format preserves them, which surfaced the single stylesheet URL. That stylesheet was then scraped **through Firecrawl** as its own document to recover the real design tokens below.

---

## 1. Site Identity & Meta

```
title            AW - Creative Developer Freelance - France
og:site_name     AW - Creative Developer Freelance - France
description      Creative Developer with 15+ years and 140+ projects, specializing in
                 animation-driven, high-impact websites. Partnering with designers to
                 craft memorable UX.
og:type          website
og:locale        en_GB
og:image         /images/aw-creative-developer.png  (1200×675)
twitter:card     summary_large_image
theme-color      #160000
apple-mobile-web-app-title  AW Dev
generator        Astro v4.15.9
```

Stack: **Astro 4.15.9**, scoped-CSS components (`astro-<hash>` class suffixes), scroll-driven CSS custom properties, WebGL canvas in the hero and work sections.

---

## 2. Structural Map

The DOM confirms a precise, small section list. Scoped class hashes in brackets.

```
<header class="site-head">              [astro-5qrshpxv]   ← fixed-height chrome bar
  ├── .sb-logo                          (6rem square, right border)
  ├── .sb-console                       (live "loading" teletype readout)
  ├── <nav class="sb-menu">             About · Work · Contact
  ├── .sb-socials                       CodePen · LinkedIn
  ├── .sb-contrast                      "Change contrast" toggle
  └── <aside class="sb-availability">   "Coding globally from France.
                                         Available for freelance work → Hire me"
                                         + QR code → mailto
│
├─ SECTION: HERO                        [.s-hero / astro-7dteeuzc]
│    min-height: calc(100svh - header)
│    WebGL wave canvas (.s__waves) filling the section
│    Giant type: "Creative ★ Developer"  (letter-spaced, star SVG inline)
│    Binary rain strips (1 0 0 0 0 0 1 1 1 …) above and below
│    .s__border — 40rem black slab pinned at top:100%, slides up on scroll
│
├─ SECTION: ABOUT                       [#about / .s-about / astro-am7g2yfn]
│    --width: 39.25rem;  padding: 15rem 0;  overflow hidden
│    parallax via --offset-y (scroll-linked, e.g. -285.41px)
│    ├── Lead paragraph (large, Editorial New Ultralight)
│    ├── Body paragraph with inline links (Waaark, incredibles.dev)
│    ├── AWARDS list  ← dense mono list, counts in parens
│    └── Floating scattered image gallery (16 images, absolute-positioned,
│        parallax-drifting: generative art, old portfolios, desk setups,
│        Game Boy 1997, FWA 2012, Legos)
│
├─ SECTION: WORK                        [#work / .s-work / astro-doefkd43]
│    --height: 1700lvh  ← 17 viewports of scroll
│    background: var(--color-primary)  ← the red section
│    --scroll-progress: 0→1 driven by scroll
│    .s__mask-outer  position: sticky; top:0; height:100lvh
│    .s__mask        SVG clip mask, scales with progress
│    .s__inner       position: fixed, translate3d(0, progress * -15%, 0)
│    .s__canvas      WebGL, translate3d(0, progress * -5%, 0)
│    34 project entries, each labelled  "Name  #<4-char-hash>-<index>/34"
│    Closing type: W→O→R→K rendered as stretched repeated glyph columns
│
├─ SECTION: MY WAY                      [.s-my-way / astro-fiibiggq]
│    --padding: 40rem;  --smiley-size: 5.625rem
│    --distortion (e.g. 3437.27) + --scroll-progress drive a two-layer
│    "catcher" text effect:
│      .s__catcher__text--normal      translate3d(0, p*amp - 100% - offset, 0)
│      .s__catcher__text--distorted   translate3d(0, p*amp - offset, 0)
│    Copy: "Coding / my way / since / 1987"  (rendered twice, normal + distorted)
│
├─ SECTION: CTA                         [.s-cta / astro-25kxajgh]
│    padding: 55rem 0 0   ← enormous top padding, the breath before the close
│    "GO" button
│    Per-character animated wordmark: "LLLLeeeet't't't'ssss RRRRoooocccckkkk"
│      → each char has --move-delay and --toggle-delay
│      → keyframes s-cta-char-up-down (2s inf) + s-cta-char-toggle (2s linear inf)
│    Floating star: s-cta-star-float 10s inf cubic-bezier(.455,.03,.515,.955)
│    mailto: hello@wodniack.dev
│
└─ <footer class="site-foot">           [astro-75cegwoc]
     centered, padding 1.5rem, top border, 3rem logo mark
```

**Order:** `Header → Hero → About(+Awards+Gallery) → Work → My Way → CTA → Footer`

---

## 3. Design Tokens (extracted from production CSS)

### 3.1 Colour

```css
:root {
  --color-primary:   #f40c3f;  /* hot red — the Work section's full background */
  --color-secondary: #160000;  /* near-black with a red bias, NOT neutral #000 */
  --color-shadow:    #540000;  /* deep oxblood, used for depth/shadow */
  --color-white:     #fff0eb;  /* warm off-white, pink-tinted, NOT #fff */
}
```

The whole palette is **four colours**. Every surface, border, and text colour derives from them. The warmth is deliberate: nothing on this site is a neutral grey. Black leans red (`#160000`), white leans peach (`#fff0eb`).

A "Change contrast" control exists in the header — a user-facing accessibility affordance, not a light/dark theme switch.

### 3.2 Typography

```css
--font-family-fraktion:  "Fraktion Mono", monospace;   /* PP Fraktion Mono */
--font-family-editorial: "Editorial New", serif;       /* PP Editorial New */
--font-family-bigger:    "Bigger Display", sans-serif; /* Bigger Display */
--font-family-base:      var(--font-family-editorial);

--font-size-base:    16px;
--font-weight-base:  400;
--font-height-base:  1.48;
--font-spacing-base: -0.025em;
```

Loaded weights (all `.woff2`, `font-display: swap`, `text-rendering: optimizeLegibility`):

| Family | Weight | File |
|---|---|---|
| Bigger Display | 700 | `Bigger-Display.woff2` |
| Editorial New | 400 | `PPEditorialNew-Regular.woff2` |
| Editorial New | 200 | `PPEditorialNew-Ultralight.woff2` |
| Fraktion Mono | 400 | `PPFraktionMono-Regular.woff2` |
| Fraktion Mono | 700 | `PPFraktionMono-Bold.woff2` |

**Three-font system with strict role separation — this is the single most important thing to copy:**

- **Fraktion Mono** — all chrome, labels, metadata, nav, indices, counters. Always small (8–14px), always uppercase, often letter-spaced. This is the "machine voice."
- **Editorial New** — all prose and lead copy. Almost always at **weight 200 (Ultralight)** at large sizes. This is the "human voice."
- **Bigger Display** — display only. Enormous, tight leading (0.8–1.0). This is the "shout."

**Actual type scale, verbatim from the CSS (`font:` shorthand):**

```
/* Bigger Display — display */
700 min(15vw, 18.5rem)/0.8       ← hero headline
700 min(18.75rem, 25lvh)/1        ← work closer
700 6.5625rem/0.82                ← section display
700 3.75rem/6.85rem               ← smaller display
700 calc(var(--padding) * 1.2)/1  ← fluid display
700 calc(var(--size) * .3743)/1   ← fluid display

/* Editorial New — prose, note the weight-200 dominance */
200 2.25rem/1.13                  ← section lead
200 2rem/1.5                      ← large body
200 1.25rem/1.3                   ← body
200 1.25rem/48px                  ← body on baseline grid

/* Fraktion Mono — chrome */
700 14px/1     700 12px/24px     700 11px/1
400 14px/1     400 12px/1        400 8px/1.4     400 8px/16px
```

Discrete `font-size` values also present: `14vw`, `8.625rem`, `6.5rem`, `5.5rem`, `5rem`, `4rem`, `3.75rem`, `3.5rem`, `1.75rem`, `1.5rem`, `1.25rem`, `1.15rem`, `1.1rem`, `13px`, plus fluid `calc(31vw - .75rem)` / `calc(31vw - 1rem)`.

**Rhythm observation:** the jump from 8px mono chrome to `min(15vw, 18.5rem)` display is roughly a **40× ratio**. There is almost nothing in the middle. That extreme contrast — tiny machine text against enormous display type, with slim serif prose as the only midtone — is what produces the "premium editorial" feel. A conventional 1.25 modular scale would destroy it.

### 3.3 Spacing

Sections are separated by **absurd** vertical padding, which is the other half of the premium feel:

```css
.s-about  { padding: 15rem 0; }         /* 240px */
.s-cta    { padding: 55rem 0 0; }       /* 880px top padding */
.s-my-way { --padding: 40rem; }         /* 640px */
.s-work   { --height: 1700lvh; }        /* 17 viewport heights */
```

Responsive step-downs are explicit, not fluid:
- `.s-about` padding `15rem → 7.5rem`; `--width` `39.25rem → 32rem → 70vw → 80vw`
- `.s-cta` padding-top `55rem → 48rem → 41.25rem → 34.375rem`
- `.s-my-way` `--padding` `40rem → 35rem → 30rem → 25rem`

Chrome is compact by contrast: header `6rem` tall (→`4rem` mobile), logo `6rem` square with a `1px solid var(--color-secondary)` right border, `1.5rem` padding (→`1rem`).

**Breakpoints:**
```css
@media (max-width: 987px)
@media (max-width: 767px) and (orientation: landscape), (max-width: 576px)
```

### 3.4 Borders

Hairlines everywhere — `1px solid var(--color-secondary)` on the header bottom, logo right edge, menu left edge, footer top. The layout reads like a **technical drawing / control panel**: boxes butted against each other, divided by single-pixel rules. No rounded corners, no shadows, no cards-with-elevation.

---

## 4. Animation Language

### 4.1 Easing vocabulary (frequency-ranked, verbatim)

| Curve | Uses | Character |
|---|---|---|
| `cubic-bezier(.86,0,.07,1)` | 9 | **Signature.** Extreme ease-in-out. Slow, snap, slow. |
| `cubic-bezier(1,0,0,1)` | 7 | Absolute step-like ease-in-out. Near-instant middle. |
| `cubic-bezier(.23,1,.32,1)` | 7 | easeOutQuint — long luxurious settle. |
| `cubic-bezier(.55,.055,.675,.19)` | 6 | easeInCubic — accelerate away. |
| `cubic-bezier(.215,.61,.355,1)` | 5 | easeOutCubic — standard UI response. |
| `cubic-bezier(.19,1,.22,1)` | 2 | easeOutExpo. |
| `.755,.05,.855,.06` / `.645,.045,.355,1` / `.455,.03,.515,.955` | 1 each | easeInQuint / easeInOutCubic / easeInOutSine |

There is **no `ease`, no `linear`** on transitions (linear appears only on the infinite CTA toggle). Every motion is heavily shaped. `.86,0,.07,1` is the house curve.

### 4.2 Durations

Two clusters, and almost nothing between:
- **Micro / UI:** `.07s`, `.1s`, `.2s`, `.3s`, `.4s`, `.5s`, `.6s` — snappy, near-instant.
- **Macro / cinematic:** `.8s`, `1s`, `1.2s`, `1.5s`, `1.8s` — often with delays (`.2s`, `.6s`).

Verbatim examples:
```css
transition: scale .3s cubic-bezier(1,0,0,1);
transition: scale 1.8s cubic-bezier(.23,1,.32,1) .6s;
transition: translate 1s cubic-bezier(.23,1,.32,1), scale 1.5s cubic-bezier(.86,0,.07,1);
transition: clip-path .8s cubic-bezier(.86,0,.07,1);
transition: scale .2s cubic-bezier(.215,.61,.355,1), opacity .07s linear;
transition: width .1s cubic-bezier(.215,.61,.355,1), background-color .1s cubic-bezier(.215,.61,.355,1);
```

Note: transitions target `scale`, `translate`, `rotate` as **independent CSS properties**, not composite `transform`. Modern, and cheaper to compose.

### 4.3 Keyframes

```
site-head-caret        blinking terminal caret in the header console
blink-in               .3s cubic-bezier(1,0,0,1) forwards — hard reveal
s-hero-move-to-left    ┐
s-hero-move-to-right   │ 1s cubic-bezier(.86,0,.07,1) forwards
s-hero-move-to-top     │ four-direction hero entrance
s-hero-move-to-bottom  ┘
rotate                 10s linear infinite
vanish                 .75s steps(29,end) both  ← 29-step sprite/flipbook, not a fade
s-cta-char-up-down     2s infinite, per-char --move-delay
s-cta-char-toggle      2s linear infinite, per-char --toggle-delay
s-cta-star-float       10s infinite cubic-bezier(.455,.03,.515,.955)
```

`vanish` using `steps(29, end)` is characteristic: the site prefers **stepped, digital, glitchy** reveals over smooth fades.

### 4.4 Scroll mechanics — the core technique

Scroll position is written to CSS custom properties by JS, and **CSS does all the work**. No per-frame JS style writes.

```css
/* --scroll-progress: 0→1, set on the section element */
.s-work .s__inner       { transform: translate3d(0, calc(var(--scroll-progress) * -15%), 0); }
.s-work .s__canvas      { transform: translate3d(0, calc(var(--scroll-progress) * -5%), 0); }
.s-work .s__mask__path-inner { transform: translate3d(0, calc(var(--scroll-progress) * 48px), 0); }

/* my-way two-layer distortion catcher */
.s__catcher__text--normal    { top: 0;    transform: translate3d(0, calc(var(--scroll-progress) * var(--amplitude) - 100% - var(--offset)), 0); }
.s__catcher__text--distorted { bottom: 0; transform: translate3d(0, calc(var(--scroll-progress) * var(--amplitude) - var(--offset)), 0); }

/* about parallax */
.s-about { --offset-y: -285.4px; }
```

All animated layers carry `will-change: transform` (or `scale, transform`).

**Pattern to replicate:**
1. `IntersectionObserver` sets `data-intersect` + `.is-in-view` on sections → triggers entrance animations.
2. A scroll handler writes `--scroll-progress` (0→1) and `--offset-y` to the section element.
3. Long sections (`--height: 1700lvh`) contain a `position: sticky` viewport-height stage; scrolling through the tall parent drives progress while the stage stays pinned.
4. Different children multiply progress by different coefficients (`-15%`, `-5%`, `48px`) → parallax depth from one variable.

### 4.5 Ambient / decorative devices

- **Binary rain strips** — rows of `1 0 0 0 0 0 1 1 …` as horizontal rules between sections. Texture masquerading as data.
- **Teletype console** in the header — "Loading… / nothing to see yet / Calibrating designer dreams" with a blinking caret. The site talks to you while it boots.
- **Project index hashes** — every work item is `#3vva-0000/34`, `#dbq8-0001/34`. Fake-precise catalogue numbers with a running count. Costs nothing, adds enormous perceived rigour.
- **Stretched glyph columns** — `WWWW…OOOO…RRRR…KKKK…` as a full-width band.
- **Per-character animated wordmarks** — `LLLLeeeet't't't'ssss RRRRoooocccckkkk`, each char independently delayed.
- **Inline star SVG** set into the headline as a word (`Creative ★ Developer`).
- **QR code** linking to `mailto:` in the availability aside.

---

## 5. Content Inventory (verbatim)

### 5.1 Header
- Logo → `/`
- Console: `Loading… / nothing to see yet / Calibrating designer dreams`
- Nav: `About` `Work` `Contact`
- Socials: `Follow me on CodePen` · `Follow me on LinkedIn`
- Control: `Change contrast`
- Availability: `Coding globally from France.` `Available for freelance work → Hire me` (`mailto:hello@wodniack.dev`) + QR code

### 5.2 Hero
`Creative` ★ `Developer` — letter-spaced, star SVG between the words.

### 5.3 About
> I collaborate with agencies and designers to craft memorable user experiences, bringing their vision to life with a nice touch of animation.

> I started with Dreamweaver, played with Flash and ActionScript, did back-end dev from scratch, worked with all kinds of CMS, focused on creative dev, worked on 140+ projects, led a team of 10 designers and developers, founded Waaark and incredibles.dev, won a few awards, and keep on learning.

**Note the structure of that second paragraph:** it is one sentence, ten comma-separated clauses, chronological, ending on "and keep on learning." It's a career told as a single breath. This is a highly reusable device.

### 5.4 Awards
```
awwwards    (SOTD x 16) (Honors x 1)
fwa         (SOTD x 4)  (MOTD x 2)
cssda       (WOTD x 18) (WOTM x 1)
2025 Webby Awards Winner — Best Home Page
Comm Arts Mag Interactive Annual Competition Winner 2017
Net Mag SOTM Summer 2016
GSAP SOTM October 2024
GSAP SOTM November 2024
CSSDA Best Front-End Developer 2016
CSSDA Best Front-End Developer 2015
```

### 5.5 Work — 34 entries
Format: `Name  #<hash>-<zero-padded index>/34`

Generous Branding ×3 · Hunter Farmer · Nod Coding Bootcamp ×5 · Rudl und Schwarm ×2 · 24/7 Artists ×4 · Duten ×5 · Vanguart ×4 · Pantoufle Hôtel ×3 · CodePen ×2 · QBIT Capital ×2 · Tissot · Deside Recrutement · Honor Society Films

**Note:** clients repeat. It's a *shot list*, not a project list — multiple frames per client, sequenced for visual rhythm rather than deduplicated for tidiness.

### 5.6 About gallery captions
Generative art poster concept ×3 · `My first FOTD on FWA ♥ (2012)` · `Young me discovering the beauty of ~~Grand Canyon~~ Tetris (1997)` · `Me abusing of remote work (2005)` · `Roaaaar!` · `Early age (2006) desk setup` · `2016 desk setup` · `2020 desk setup` · `Waaark Creative Robots` · `2011 portfolio` · `2014 portfolio` · `2017 portfolio (never released)` · `2021 portfolio` · `Legos ♥`

The strikethrough joke, the `♥`, the `(never released)` — the personality lives entirely in the captions, not in the prose.

### 5.7 My Way
`Coding` / `my way` / `since` / `1987` — rendered twice (normal + distorted layer).

### 5.8 CTA
`GO` · `Let's Rock` (per-char animated) · `hello@wodniack.dev`

### 5.9 Footer
Logo mark → `Antoine Wodniack` → `/`

---

## 6. What Actually Makes It Feel Premium

Ranked by impact-per-effort, for adaptation:

1. **Extreme type contrast.** 8px mono chrome vs `min(15vw, 18.5rem)` display, with nothing in between. Slim serif at weight 200 as the only midtone.
2. **Absurd whitespace.** `15rem` section padding, `55rem` before the CTA. Confidence is expressed as emptiness.
3. **Strict three-font role separation.** Mono = machine. Serif = human. Display = shout. Never mixed.
4. **Four colours, warm-biased.** No neutral grey anywhere. `#160000` not `#000`, `#fff0eb` not `#fff`.
5. **Hairline grid.** 1px rules divide the chrome into butted boxes. Technical-drawing register.
6. **One house easing curve** (`.86,0,.07,1`) applied relentlessly.
7. **Scroll-progress as a CSS variable**, with different coefficients per layer. One number, whole-section parallax.
8. **Fake-precise metadata.** `#3vva-0000/34`. Catalogue numbers, running counts, binary strips. Rigour theatre.
9. **Sticky-stage long sections.** `1700lvh` parent + `100lvh` sticky child.
10. **Personality confined to captions and micro-copy.** The body prose is straight and professional; the jokes live in image captions and the console readout.

---

## 7. What NOT to Copy

- **The awards list.** Naveen has no awwwards/FWA/CSSDA record. Inventing one is out of the question. The *structural slot* — a dense mono-set credibility block — gets reused with real material.
- **Fonts.** PP Editorial New, PP Fraktion Mono, and Bigger Display are commercial licences. Free substitutes with the same role separation are required.
- **34 shot-list entries.** Entertrainer has 2 case studies and 4 tools. The grid must be honest about its density.
- **"Since 1987" / "140+ projects" / "team of 10".** All specific to Antoine.
- **The exact red `#f40c3f`.** Adopting the palette wholesale makes it a clone rather than an adaptation.

---

## Appendix A — Raw Firecrawl Markdown Output

Verbatim `data.markdown` from call 3 (`waitFor: 6000`, `onlyMainContent: false`).

```markdown
[Antoine Wodniack](https://wodniack.dev/)

Loading…
nothing to see yet
Calibrating designer dreams

- [About](https://wodniack.dev/#about)
- [Work](https://wodniack.dev/#work)
- [Contact](https://wodniack.dev/#contact)

- [Follow me on CodePen](https://codepen.io/wodniack)
- [Follow me on LinkedIn](https://www.linkedin.com/in/wodniack/)

Change contrast

Coding globally from France.Available for freelance work → [Hire me](mailto:hello@wodniack.dev)

[![QR Code](https://wodniack.dev/images/qr-code.svg)](mailto:hello@wodniack.dev "Contact me!")

1  0  0  0  0  0  1  1  1  0  1  1  1  0  1  1  1  0  1  0  0  1  1  0  1  1  1  1  1  1  0  1  0  0  1  1  1  0  1  1  1  0  1  1  0  0  1  0  1  1  0  1  0  1  1  1  1  1  0  1  1  1  1  1  1  0  0  1  0  0  1  1  0  1  1  1  0  1  1  0  1  0  0  1  1  1  0  0  0  0  1  1  1  0  0  0  1  1  1  1  0  1  0  1  1

# C    r    e    a    t    i    v    e   ![](https://wodniack.dev/images/asset-star.svg)   D    e    v    e    l    o    p    e    r

1  0  0  0  1  0  0  1  1  0  1  1  1  1  1  0  1  0  1  0  0  1  1  0  1  0  0  0  1  1  0  1  0  0  1  1  1  0  1  1  1  0  1  1  0  0  1  1  1  1  1  1  0  0  1  1  1  0  1  1  0  0  1  1  1  0  1  1  1  1  1  1  1  0  1  0  1  1  1  1  0  0  1  0  1  0  1  0  1  1  1  1  1  0  0  0  0  1  1  1  1  1  0  0  1

## About

I collaborate with agencies and designers to craft memorable user experiences, bringing their vision to life with a nice touch of animation.

I started with Dreamweaver, played with Flash and ActionScript, did
back-end dev from scratch, worked with all kinds of CMS, focused on
creative dev, worked on 140+ projects, led a team of 10 designers and
developers, founded [Waaark](https://waaark.com/) and [incredibles.dev](https://incredibles.dev/), won a few awards, and keep on learning.

## Awards

- awwwards(SOTD x 16)(Honors x 1)
- fwa(SOTD x 4)(MOTD x 2)
- cssda(WOTD x 18)(WOTM x 1)
- 2025 Webby Awards Winner

Best Home Page
- Comm Arts Mag Interactive Annual Competition Winner 2017
- Net Mag SOTM Summer 2016
- GSAP SOTM October 2024
- GSAP SOTM November 2024
- CSSDA Best Front-End

Developer 2016
- CSSDA Best Front-End

Developer 2015

1  0  0  0  1  0  0  1  1  0  1  1  1  1  1  0  1  0  1  0  0  1  1  0  1  0  0  0  1  1  0  1  0  0  1  1  1  0  1  1  1  0  1  1  0  0  1  1  1  1  1  1  0  0  1  1  1  0  1  1  0  0  1  1  1  0  1  1  1  1  1  1  1  0  1  0  1  1  1  1  0  0  1  0  1  0  1  0  1  1  1  1  1  0  0  0  0  1  1  1  1  1  0  0  1

## WORK

[Generous Branding \\
\\
#3vva-0000/34](https://generousbranding.com/)

[Hunter Farmer \\
\\
#dbq8-0001/34](https://wodniack.dev/#)

[Generous Branding \\
\\
#ny2d-0002/34](https://generousbranding.com/)

[Nod Coding Bootcamp \\
\\
#87va-0003/34](https://nodcoding.com/)

[Rudl und Schwarm \\
\\
#t44q-0004/34](https://www.rudlundschwarm.at/)

[24/7 Artists \\
\\
#3g5d-0005/34](https://247artists.com/)

[Nod Coding Bootcamp \\
\\
#wksl-0006/34](https://nodcoding.com/)

[Duten \\
\\
#0qh5-0007/34](https://duten.com/)

[Vanguart \\
\\
#y15t-0008/34](https://vanguart.com/)

[Generous Branding \\
\\
#a24d-0009/34](https://generousbranding.com/)

[Nod Coding Bootcamp \\
\\
#1j4c-0010/34](https://nodcoding.com/)

[Pantoufle Hôtel \\
\\
#m2my-0011/34](https://www.pantoufle-hotels.fr/en/)

[Vanguart \\
\\
#d6fu-0012/34](https://vanguart.com/)

[24/7 Artists \\
\\
#oqga-0013/34](https://247artists.com/)

[Rudl und Schwarm \\
\\
#sxvc-0014/34](https://www.rudlundschwarm.at/)

[Vanguart \\
\\
#wfll-0015/34](https://vanguart.com/)

[CodePen \\
\\
#5w0n-0016/34](https://codepen.io/wodniack)

[Duten \\
\\
#emwy-0017/34](https://duten.com/)

[24/7 Artists \\
\\
#cul2-0018/34](https://247artists.com/)

[Duten \\
\\
#0ngv-0019/34](https://duten.com/)

[Vanguart \\
\\
#kqon-0020/34](https://vanguart.com/)

[24/7 Artists \\
\\
#frnh-0021/34](https://247artists.com/)

[QBIT Capital \\
\\
#z0bj-0022/34](https://qbitcapital.xyz/)

[Tissot \\
\\
#s8nw-0023/34](https://wodniack.dev/#)

[Duten \\
\\
#yhcw-0024/34](https://duten.com/)

[Pantoufle Hôtel \\
\\
#ppxm-0025/34](https://www.pantoufle-hotels.fr/en/)

[Pantoufle Hôtel \\
\\
#ffo8-0026/34](https://www.pantoufle-hotels.fr/en/)

[Deside Recrutement \\
\\
#mxe3-0027/34](https://www.desiderecrutement.com/en/)

[QBIT Capital \\
\\
#suav-0028/34](https://qbitcapital.xyz/)

[Nod Coding Bootcamp \\
\\
#7vol-0029/34](https://nodcoding.com/)

[Honor Society Films \\
\\
#i1er-0030/34](https://honorsociety.tv/)

[Nod Coding Bootcamp \\
\\
#kive-0031/34](https://nodcoding.com/)

[Duten \\
\\
#t7cu-0032/34](https://duten.com/)

[CodePen \\
\\
#508u-0033/34](https://codepen.io/wodniack)

WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK

1  0  0  0  1  0  0  1  1  0  1  1  1  1  1  0  1  0  1  0  0  1  1  0  1  0  0  0  1  1  0  1  0  0  1  1  1  0  1  1  1  0  1  1  0  0  1  1  1  1  1  1  0  0  1  1  1  0  1  1  0  0  1  1  1  0  1  1  1  1  1  1  1  0  1  0  1  1  1  1  0  0  1  0  1  0  1  0  1  1  1  1  1  0  0  0  0  1  1  1  1  1  0  0  1

![Generative art poster concept](https://wodniack.dev/_astro/art-1987.DuGYX_YQ_Zedl3o.webp)Generative art poster concept

![Generative art poster concept](https://wodniack.dev/_astro/art-dtyw.BwdKK6hB_Z19TwfB.webp)Generative art poster concept

![Generative art poster concept](https://wodniack.dev/_astro/art-lines.BXTmZZe3_Z1DHEgE.webp)Generative art poster concept

![My first FOTD on FWA  ♥ (2012)](https://wodniack.dev/_astro/first-fwa.LsgJSoFn_1VhWNL.webp)My first FOTD on FWA ♥ (2012)

![Young me discovering the beauty of <s>Grand Canyon</s> Tetris (1997)](https://wodniack.dev/_astro/gameboy.BbEYkrsC_RRGJe.webp)Young me discovering the beauty of ~~Grand Canyon~~ Tetris (1997)

![Me abusing of remote work (2005)](https://wodniack.dev/_astro/remote-2005.B2CSTJrO_1R04cN.webp)Me abusing of remote work (2005)

![Roaaaar!](https://wodniack.dev/_astro/roar.BvXyAVaL_1PKGBj.webp)Roaaaar!

![Early age (2006) desk setup ](https://wodniack.dev/_astro/setup-2006.Op2RjVqP_ZjqlNh.webp)Early age (2006) desk setup

![2016 desk setup](https://wodniack.dev/_astro/setup-2016.DZszJSwz_10aiku.webp)2016 desk setup

![2020 desk setup](https://wodniack.dev/_astro/setup-2020.DjuS52Ke_1lqvvK.webp)2020 desk setup

![Waaark Creative Robots](https://wodniack.dev/_astro/waaark.C5QpwSMH_Rq3S9.webp)Waaark Creative Robots

![2011 portfolio](https://wodniack.dev/_astro/portfolio-2011.DpFoQfUQ_ZXEwJ9.webp)2011 portfolio

![2014 portfolio](https://wodniack.dev/_astro/portfolio-2014.ClRt5L9z_Xz3cl.webp)2014 portfolio

![2017 portfolio (never released)](https://wodniack.dev/_astro/portfolio-2017.N-r3CKDK_iyXU7.webp)2017 portfolio (never released)

![2021 portfolio](https://wodniack.dev/_astro/portfolio-2021.D5EtPDWp_Z1AfsSn.webp)2021 portfolio

![Legos ♥](https://wodniack.dev/_astro/legos.Bdikeciy_Z1pUyVv.webp)Legos ♥

Coding

my way

since

1987

Coding

my way

since

1987

GO

LLLLeeeet't't't'ssss

RRRRoooocccckkkk

[hello@wodniack.dev](mailto:hello@wodniack.dev)

[Antoine Wodniack](https://wodniack.dev/)
```

---

## Appendix B — Links Extracted

```
https://wodniack.dev/
https://wodniack.dev/#about
https://wodniack.dev/#work
https://wodniack.dev/#contact
https://codepen.io/wodniack
https://www.linkedin.com/in/wodniack/
mailto:hello@wodniack.dev
https://waaark.com/
https://incredibles.dev/
https://generousbranding.com/
https://wodniack.dev/#
https://nodcoding.com/
https://www.rudlundschwarm.at/
https://247artists.com/
https://duten.com/
https://vanguart.com/
https://www.pantoufle-hotels.fr/en/
https://qbitcapital.xyz/
https://www.desiderecrutement.com/en/
https://honorsociety.tv/
```

---

## Appendix C — Recovered Asset URLs

**Fonts (preloaded):**
```
/fonts/PPEditorialNew-Regular.woff2
/fonts/PPEditorialNew-Ultralight.woff2
/fonts/PPFraktionMono-Regular.woff2
/fonts/PPFraktionMono-Bold.woff2
/fonts/Bigger-Display.woff2
```

**Stylesheet:** `/_astro/index.MJ9FiCyD.css` (72,702 chars)

**Images:** `/images/qr-code.svg`, `/images/asset-star.svg`, `/images/aw-creative-developer.png`, plus 16 `/_astro/*.webp` gallery images (art-1987, art-dtyw, art-lines, first-fwa, gameboy, remote-2005, roar, setup-2006, setup-2016, setup-2020, waaark, portfolio-2011, portfolio-2014, portfolio-2017, portfolio-2021, legos).
