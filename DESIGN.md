# Entertrainer · Brand guide

Relaunched Nov 2026 at the owner's request ("Entertrainer is my brand. Treat it like one.").
This replaces the older "do not replace it" note: the roots are kept (name, the Three Es,
sacred yellow, cream paper, Fraunces, the preloader), the dial is turned up.

## The idea
**Entertain + Train.** "Entertrainer is not a typo. It's a manifesto. If it doesn't hold
attention, it can't transfer knowledge." (Naveen, first About page, June 2026.)

Positioning: Naveen Jose, instructional designer from hospitality, makes learning people
actually remember. The site is his studio: **Elevate** (read), **Empower** (make: apps for
people who train people), **Engage** (play: games about how we learn).

## The protagonist: the sun
One sacred-yellow disc carries the whole identity. It rises in the home hero
(`components/brand/Sun.vue`, a small WebGL shader with a CSS fallback), becomes the page
curtain (`.dp-wipe` in `assets/css/brand.css`, opens from where you clicked), follows the
pointer as the cursor (`components/brand/SunCursor.vue`), holds every app and game mark,
frames the portrait on About, and sets behind the horizon in the footer.

## Wordmark and marks
- Wordmark: lowercase `entertrainer` in Fraunces, live text, never capitalised.
  The Seed-of-Life "e" mark (`EdWordmark`) stays in the masthead and preloader.
- Footer and social cards set the word edge to edge as a sign-off.
- Favicon: ink tile, sun disc, ink "e" stroke (`public/favicon.svg`).
- Family marks (`components/brand/Mark.vue`, SVG copies in `public/brand/`): one sun,
  one ink glyph, 48 grid, 3px round strokes. Apps wear sun-on-paper, games ink discs on sun.

## Palette (rationed)
| Token | Hex | Use |
|---|---|---|
| `--br-paper` | #F7F1E4 | Default field |
| `--br-ink` | #12110F | Type, rules, dark stages (Empower panel, app outputs, footer) |
| `--br-sun` | #FFD43B | The sun, one action per screen, success |
| `--br-sun-deep` | #8A6500 | Yellow-family text on paper (AA) |
| `--br-dusk` | #1A1916 | Manifesto stage |
| `--br-ember` | #E8542A | Errors, misses, "over time" only |

Never yellow text on paper. Never more than one yellow surface per viewport except the
Engage stage.

## Type
- Display: Fraunces, opsz 144, SOFT 30, WONK 1, tracking -0.045em, leading .84.
  Scale: `--br-mega` (17vw), `--br-giant` (11vw), `--br-big` (6vw).
- Interface: Archivo. Reading: Source Serif 4 (essays, About prose).
- Meta: IBM Plex Mono 11px, uppercase, +0.12em (`.br-meta`).
- Contrast of scale is the point: poster-size words, tiny mono labels, little in between.

## Motion signature: "Sunrise"
- Things rise from under a horizon line (`.br-mask`), easing `ink`, 0.9–1.1s.
- Scroll is a timeline on desktop: hero words part as the sun climbs; manifesto lights
  word by word; the Three Es run sideways (pinned); footer sun sets.
- Page change: the sun curtain (640ms), the route waits 280ms under it.
- Respect `Motion: Off/Calm` and OS reduced motion: no scrub, no curtain, no cursor.
- Late GSAP never replays text already on screen (`m.late`).

## Imagery
Real photographs of Naveen's work, warm and slightly desaturated; the illustrated portrait
inside a sun. Essay art stays as drawn. No stock, no gradients-as-decoration, no emoji.

## Voice
Short. Plain. A bit playful, never cute. Second person. Verbs you can see.
- Do: "Paste an instruction. See where people will trip."
- Don't: "Unlock seamless, AI-powered clarity for your learning journey."
Every app and game has: a one-word name, a one-line promise, three steps, a meta chip.

## The family
| | Name | Promise | Route |
|---|---|---|---|
| App | Aim | Write a learning objective you can actually measure | /empower/aim |
| App | Plain | Paste an instruction. See where people will trip | /empower/plain |
| App | Cue | Plan a training session minute by minute | /empower/cue |
| Game | Ladder | Put each verb on the right rung of Bloom's ladder | /engage/ladder |
| Game | Pairs | A memory game where the cards are ideas | /engage/pairs |
| Game | Steps | Shuffled steps. Put them back in order | /engage/steps |

All run in the browser with no account; anything saved stays in localStorage. Shared shell:
`components/brand/AppShell.vue`; data: `content/family.ts`.

Retired from listings (still at their URLs, `X-Robots-Tag: noindex`): EasyMCQ, Draftly,
Cadence, StoryGen, Compose, Stack, The Mind Reader, AstroClock (Whatto was already unlisted).

## Social and PWA
Social cards render on demand at `/api/social-card/<key>.png` in the brand layout
(paper, Fraunces title, sun). PWA shortcuts point to the family. The PNG app icons
(`pwa-192/512.png`, `apple-touch-icon.png`) are still the earlier ring mark and should be
re-exported from `public/favicon.svg` with a binary-capable push.
