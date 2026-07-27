# wodniack.dev → Entertrainer — Section-by-Section Map

Companion to `wodniack-scrape-2026.md`. Every wodniack section is matched to the
closest existing Entertrainer material, with gaps and keeps marked explicitly.

**Rule applied throughout:** borrow the *structural slot* and the *visual rhythm*,
never the content. Nothing in the right-hand column is invented — every item is
already in this repo.

---

## 1. Section Mapping

| # | wodniack.dev | What it does | Entertrainer equivalent | Source in repo | Status |
|---|---|---|---|---|---|
| 0 | `header.site-head` — logo · teletype console · nav · socials · availability aside + QR | Chrome bar, hairline-divided boxes | **Site head** — logo · console · About/Work/Apps/Contact · availability | new `HomeSiteHead.vue`; existing `components/ui/Menu.vue` stays for interior pages | **ADAPT** |
| 1 | `.s-hero` — "Creative ★ Developer", WebGL waves, binary strips | The shout | **"Instructional ★ Designer"** — same two-word display split, star between | new `HomeHero.vue`; title from `pages/index.vue` h1 | **ADAPT** |
| 2 | `.s-about` — lead + one-breath career sentence + parallax gallery | The human voice | **About** — lead + one-breath career sentence built from the five real chapters | `pages/about/index.vue` `CHAPTERS[]` (hospitality → Club Mahindra → Marriott → tools → Concentrix) | **ADAPT** |
| 3 | Awards block (awwwards / FWA / CSSDA / Webby) | Dense mono credibility slab | **Credentials block** — certification, roles, real employers, what's shipped | `pages/about/index.vue` chapter `place` fields + `content/navigation.json` | **REPLACE CONTENT, KEEP FORM** |
| 4 | About gallery — 16 captioned parallax images | Personality via captions | **Gallery** — the real `/about/*.webp` photos + card artwork | `public/about/` (5 images), `public/*.png` (card art) | **ADAPT — fewer images, honest density** |
| 5 | `.s-work` — `1700lvh`, accent flood, sticky stage, 34 shot-list entries | The centrepiece | **Work** — accent flood, sticky stage, catalogue-numbered index | `content/navigation.json → my-work[]` (SEWA Chronicles, Strong) | **ADAPT — 2 entries, not 34** |
| 6 | *(no equivalent)* | — | **Web Apps** — the toolkit. Entertrainer's biggest differentiator and wodniack has nothing like it | `content/navigation.json → tools[]` (StoryGen, Cadence, EasyMCQ, Draftly) | **OURS — NEW SLOT** |
| 7 | `.s-my-way` — "Coding / my way / since / 1987", two-layer distortion catcher | The manifesto beat | **"Designing / learning / that / sticks"** — same two-layer catcher | new `HomeMyWay.vue` | **ADAPT** |
| 8 | `.s-cta` — `55rem` top padding, per-char "Let's Rock", floating star, mailto | The close | **CTA** — per-char animated line + real contact | existing contact/status surfaces (`components/ui/NaveenStatus.vue`) | **ADAPT** |
| 9 | `footer.site-foot` | Centred mark, hairline top | **Footer** + links to Lab / Downloads / Instructional Design | `content/navigation.json → downloads[]`, `pages/lab/`, `pages/instructional-design/` | **ADAPT + EXTEND** |

**Resulting order:**
`Head → Hero → About(+Credentials+Gallery) → Work → Web Apps → My Way → CTA → Footer`

That is wodniack's spine with exactly one section inserted (Web Apps), because
the toolkit is the thing Entertrainer has that a creative-dev portfolio doesn't.

---

## 2. Design-Token Translation

| Token | wodniack | Entertrainer decision | Why |
|---|---|---|---|
| Accent | `#f40c3f` hot red | `#C6F135` electric lime | Already Naveen's own (`utils/homeThemes.ts` h01 "Electric Cream" `pop`). Copying the red makes it a clone. |
| Ink | `#160000` red-biased black | `#14112E` navy-biased near-black | Same *move* (never neutral), Entertrainer's own hue — the card artwork is cream + navy. |
| Paper | `#fff0eb` peach-tinted white | `#F6EFE3` warm cream | Same move (warm, never `#fff`), matches existing `h01.bg`. |
| Counterpoint | `#540000` oxblood | `#4A6CF7` blue | `h01.alt`. Fills the "fourth colour" role. |
| Display face | Bigger Display 700 | **Archivo** 900, `wdth` 100–125 | Already loaded. Variable width axis covers the ultra-bold-condensed range. |
| Prose face | Editorial New 200/400 | **Instrument Serif** 400 | New. Closest free high-contrast display serif; carries the "human voice" role. |
| Mono face | Fraktion Mono 400/700 | **JetBrains Mono** 400/700 | New. Replaces the `ui-monospace` system stack, which reads as "unset" rather than authored. |
| Base | 16px / 1.48 / -0.025em | unchanged | Adopt verbatim — good numbers. |
| House easing | `cubic-bezier(.86,0,.07,1)` | adopt verbatim as `--w-ease` | The single highest-impact borrow. |

### Type scale — the critical borrow

wodniack's scale has a **~40× ratio** between 8px mono chrome and
`min(15vw, 18.5rem)` display, with almost nothing in between. Entertrainer's
current `--text-*` ramp is a conventional 8-rung ladder — comfortable, and
exactly why the current site reads as competent rather than art-directed.

New `--w-*` rungs sit **alongside** the existing ones (nothing removed, so every
interior page and tool keeps its current type):

```
--w-display : clamp(56px, 15vw, 296px)   /* the shout, line-height 0.82 */
--w-catcher : clamp(48px, 12vw, 200px)   /* my-way two-layer text */
--w-lead    : clamp(24px, 3.4vw, 36px)   /* Instrument Serif, the human voice */
--w-body    : clamp(17px, 1.4vw, 20px)   /* Instrument Serif prose */
--w-chrome  : 12px                       /* JetBrains Mono, uppercase, tracked */
--w-micro   : 9px                        /* the 8px binary/console register */
```

### Spacing

wodniack: `15rem` section padding, `55rem` before the CTA, `40rem` my-way,
`1700lvh` work. Adopted at ~70% scale (Entertrainer has more sections to get
through, and 880px of dead air before a CTA is a lot to ask of a portfolio with
four tools to sell):

```
--w-gap-section : clamp(120px, 15vh, 240px)
--w-gap-breath  : clamp(240px, 34vh, 560px)   /* the pre-CTA silence */
--w-work-height : 420lvh                       /* sticky work stage */
```

---

## 3. Gaps — What Has To Be Built

| Gap | Resolution |
|---|---|
| No hairline chrome bar on home | New `HomeSiteHead.vue` — logo box, console, nav, availability, all `1px solid` divided |
| No teletype console | New — cycles real status lines. `components/ui/NaveenStatus.vue` already holds availability state |
| No binary rain strips | New `HomeRule.vue` — deterministic pseudo-random bit rows, `aria-hidden` |
| No accent-flood sticky work stage | New `HomeWork.vue` using existing `composables/useScrollProgress.ts` (already writes `--p`/`--pc` — **the exact wodniack technique, already in the repo**) |
| No two-layer distortion catcher | New `HomeMyWay.vue` — normal + distorted layers driven by `--p` |
| No per-char animated wordmark | New `HomeCta.vue` — per-char `--move-delay` / `--toggle-delay` |
| No catalogue numbering | New — `#<hash>-<nn>/<total>` generated from item ids |
| Mono is the system stack | Add JetBrains Mono |
| No editorial serif | Add Instrument Serif |

**Already in the repo, reused as-is:**
- `composables/useScrollProgress.ts` — writes `--p` (0→1) and `--pc` (−1→1) per element, rAF-driven. This is precisely wodniack's `--scroll-progress` mechanic and needs no changes.
- `composables/useReveal.ts` — `@vueuse/motion` presets, reduced-motion safe. Covers the `.is-in-view` entrance role.
- `@studio-freight/lenis` — smooth scroll, already a dependency.
- `components/ui/Grain.vue`, `Card3D.vue`, `Menu.vue`, `Loader.vue`.

---

## 4. What Stays Uniquely Ours

Non-negotiable — these are why the site exists, and wodniack has no analogue:

1. **The web apps** — StoryGen (infinite-canvas storyboarding, Word/Excel/PPT export), Cadence, EasyMCQ, Draftly. Four working products, not case studies. Gets its own top-level section.
2. **The SEWA Chronicles** — the Club Mahindra service-culture comic. The origin story *and* a portfolio piece.
3. **Strong** — the interactive password-entropy explainer, with its own `experience/` and `stores/strong.ts`.
4. **The Lab** — 15 WebGL experiments (`pages/lab/g01`–`g15`) + `glass-lab`. No wodniack equivalent at all.
5. **Downloads** — templates, frameworks, resources.
6. **Instructional Design** — the frameworks/practice page.
7. **The whole 3D system** — `experience/` (Three.js), `SpiralView`, `Card3D`, `SpatialDeck`, glass shaders. Untouched.
8. **Naveen's voice** — playful, direct, "Instructional Design but Fun". wodniack is dry and technical; that register is *not* being adopted.

**Preservation guarantee:** every route in `pages/` keeps working. Only
`pages/index.vue` is rewritten. `components/home/Tower.vue` and `Gallery.vue`
stay in the repo (the WebGL card stack remains available), they are simply no
longer what `/` renders.

---

## 5. Copy Rewrites (Phase 3)

Rules: keep the voice, invent nothing. Every claim below traces to
`pages/about/index.vue`, `content/navigation.json`, or existing page copy.

### Hero
- Display: **`Instructional ★ Designer`** (wodniack's two-word + inline-star construction)
- Console lines: `Booting the workbench…` / `Nothing is on fire` / `Designing learning that sticks`

### About — lead
> I work with teams who need training people will actually finish — and I build the tools that make it, when the tools don't exist yet.

### About — the one-breath sentence
Wodniack's device: one sentence, chronological clauses, ending on a forward-looking note. Applied to Naveen's real history:

> I studied hotel management in Chennai, started on the hotel floor, moved into L&D at Club Mahindra, drew a comic about guest service that changed my mind about everything, ran certification programs at Courtyard by Marriott, got certified as an instructional designer, started building the tools I couldn't find, shipped four of them, and now turn operational detail into e-learning for teams around the world at Concentrix — and I still learn something new every single build.

### Credentials block (replaces Awards — real material only)
```
Certified Instructional Design Specialist
Concentrix          Training-as-a-Service · present
Courtyard by Marriott   L&D Specialist · certification programs
Club Mahindra          L&D · The SEWA Chronicles
Hotel management, Chennai   where the noticing started
Built & shipped        4 web apps · 15 WebGL experiments
Articulate Storyline · Nuxt · Three.js · far too much CSS
```

### Section intros
- **Work** — `Proof it wasn't all talk.` *(verbatim from `navigation.json`)*
- **Web Apps** — `I kept needing tools that didn't exist. So they exist now.`
- **My Way** — `Designing / learning / that / sticks`
- **CTA** — `Let's Build` (per-char animated) + `Say hello`

### Project / tool descriptions
Kept from `navigation.json`, lightly tightened:

| Item | Copy |
|---|---|
| The SEWA Chronicles | A service-culture comic for Club Mahindra — true guest stories that teach hospitality values in panels, not policy documents. |
| Strong | The real math of password strength: entropy in bits, why length beats symbols, and why the same password is instant or eternal depending on who's guessing. |
| StoryGen | Storyboards on an infinite canvas. Cards, flows, and a Word export your SME will actually open. |
| Cadence | A list of topics in. A ready-to-present monthly training calendar out. |
| EasyMCQ | Give it a question and the right answer. It writes the wrong ones — the plausible kind. |
| Draftly | Messy draft in, email you'd be happy to send out. |

---

## 6. Technique Notes (AW-2025-Portfolio reference)

Read for approach only; no code taken. The three patterns worth adapting, all
implemented natively in Nuxt/Vue here:

1. **Scroll progress as a CSS variable, not per-frame JS styling.** Write one
   number to the section element; every child derives its own motion via
   `calc()` with a different coefficient. Already how `useScrollProgress.ts`
   works — no new dependency.
2. **Sticky stage inside a tall parent.** Parent gets `height: 420lvh`, child
   gets `position: sticky; top: 0; height: 100lvh`. Scrolling the parent drives
   progress while the stage stays pinned.
3. **One easing curve everywhere.** `cubic-bezier(.86,0,.07,1)` on essentially
   every transition is what makes the motion read as authored rather than
   assembled.

Deliberately *not* adapted: Astro's island architecture (we're staying on Nuxt 3
— the tools are stateful Vue apps and a rewrite would buy nothing), and the
commercial font stack.
