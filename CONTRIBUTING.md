# Contributing to Entertrainer

## Requirements

- **Node.js** 22.x (matches [CI](.github/workflows/ci.yml); `engines` in `package.json` allows 20.19+).
- **npm** with lockfile installs only: `npm ci` (do not commit ad-hoc lockfile churn).

## Local development

```bash
npm ci
NUXT_TELEMETRY_DISABLED=1 npm run dev -- --host 0.0.0.0 --port 3000
```

`NUXT_TELEMETRY_DISABLED=1` avoids Nuxt’s interactive telemetry prompt, which blocks non-interactive and Cloud Agent boots.

Optional secrets: [`.env.example`](.env.example). Never commit `.env`.

After dependency or Nuxt upgrades, or if the dev server reports missing `.nuxt` paths:

```bash
npx nuxt prepare
```

If `npm run build` ran while `nuxt dev` was active, restart the dev server after `nuxt prepare`.

## Checks before opening a PR

```bash
npm run check
NUXT_TELEMETRY_DISABLED=1 npm run build
```

`npm run check` runs:

- `check:paper-signal` — Paper Signal / no-emoji visual policy
- `check:voice` — human-not-model gate on configured copy
- `check:social-hooks` — route social preview hooks
- `smoke:dialogue` — Dialogue slice/export smoke (writes to `artifacts/`, gitignored)

CI runs the same checks plus a production build on every push to `main` and on pull requests.

## Project layout (high level)

| Area | Location |
| --- | --- |
| Routes | `pages/` |
| Shared UI | `components/ed/` |
| Editorial data | `content/` |
| Server APIs | `server/api/` |
| Static assets | `public/` |

## Elevate posts

Follow [`AGENTS.md`](AGENTS.md) and the Humanize Elevate skill. Tajjalan page shape, grade 6–8, no invented studies.

## Backlog

Active items: [`docs/BACKLOG.md`](docs/BACKLOG.md). Historical agent checklist: [`docs/archive/agent-todo-history.md`](docs/archive/agent-todo-history.md).
