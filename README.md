# Entertrainer

Naveen Jose’s publication site: **Elevate** (essays), **Empower** (tools), **Engage** (games), and immersive learning routes. Built with [Nuxt 3](https://nuxt.com/), deployed on Vercel.

## Quick start

```bash
npm ci
NUXT_TELEMETRY_DISABLED=1 npm run dev
```

Open `http://localhost:3000`. Health check: `GET /api/ping` → `{"ok":true}`.

Copy [`.env.example`](.env.example) to `.env` only when testing compose, newsletter, or other API-backed flows.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Production build (same as CI) |
| `npm run check` | Policy scripts + Dialogue smoke test |
| `npm run smoke:dialogue` | Node-only Dialogue export smoke test |

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the full maintenance workflow.

## Agent / editorial guidance

Elevate explain posts: [`AGENTS.md`](AGENTS.md) and [Humanize Elevate](.agents/skills/humanize-elevate/SKILL.md).
