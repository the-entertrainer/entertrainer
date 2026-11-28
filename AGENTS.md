# Entertrainer — Elevate explain posts

**Two writing skills only, in this order:**

1. [Naveen curiosity science blog](.agents/skills/naveen-curiosity-science-blog/SKILL.md) — research, structure, titles, and fact-checking. Research the topic before drafting. Do not write from memory.
2. [Say it like Naveen](.agents/skills/say-it-like-naveen/SKILL.md) — the voice, after the facts are stable.

Do not use Humanize Elevate, the Tajjalan heading recipe, or any other writing pack for a new Elevate post. Those are retired for new prose. Sacred geometry still applies when the user asks for that subject. Art direction below still applies to pictures.

## Sacred geometry

When the user asks to explain, draw, or design from sacred geometry, the Flower of Life, or *The Sacred Geometry Movie*, use [Sacred geometry](.agents/skills/sacred-geometry/SKILL.md). The two Naveen skills still own the prose.

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
