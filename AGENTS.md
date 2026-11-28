# Entertrainer — Elevate explain posts

**Writing order for every Elevate post:**

1. [Naveen curiosity science blog](.agents/skills/naveen-curiosity-science-blog/SKILL.md) for the question, the sources, and the limits. Do not invent studies.
2. [Plain writing](.agents/skills/plain-writing/SKILL.md) for the sentences. Use everyday words. Define a technical term once. No idioms, no jargon left unexplained, no slogans, no stacked metaphors.
3. [Say it like Naveen](.agents/skills/say-it-like-naveen/SKILL.md) only for a caption or a note the user asks to sound like a personal message. It does not override plain writing on the essays.

Humanize Elevate is retired for new prose.

## Sacred geometry

When the user asks to explain, draw, or design from sacred geometry, the Flower of Life, or *The Sacred Geometry Movie*, use [Sacred geometry](.agents/skills/sacred-geometry/SKILL.md). Plain writing still owns the sentences.

## Art direction (sitewide)

Every illustration, mid-figure, Engage game visual, and editorial hero follows the **cover look** — same print as `public/blog/tajjalan/hero.jpg`, `breath.jpg`, `four-parts.jpg`.

- Cream `#F7F1E4` · ink `#0B0B0C` · one cobalt `#2F5BD8`
- Black hatching / stipple for form; cobalt only for the conceptual accent
- Flat editorial, negative space, one clear metaphor
- Ban: anime, glossy 3D, neon candy, multi-accent rainbows

## Repository maintenance

- **Develop:** `npm ci` then `NUXT_TELEMETRY_DISABLED=1 npm run dev` — see [`CONTRIBUTING.md`](CONTRIBUTING.md).
- **Before merge:** `npm run check` and `npm run build` (CI runs both on every PR).
- **Backlog:** [`docs/BACKLOG.md`](docs/BACKLOG.md) (active); [`docs/archive/agent-todo-history.md`](docs/archive/agent-todo-history.md) (archived checklist).
