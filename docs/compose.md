# Elevate composer (`/compose`)

Gate keyword: `iamguru` (session unlock). Drafts and publishes update `content/composed-posts.json` — locally via the filesystem in `nuxt dev`, and in production by committing to GitHub so Vercel redeploys.

## AI draft (one-click)

After unlock, use the **AI draft** panel: pick a provider, enter a topic (optional notes), and click **Generate draft**.

- Route: `POST /api/compose/generate` with `{ topic, notes?, provider?: 'groq' | 'gemini' }`
- Providers:
  - **Groq** (default when `GROQ_API_KEY` is set): model **`groq/compound`** (override via `GROQ_MODEL`)
  - **Gemini**: model **`gemini-3.5-flash-lite`** (override via `GEMINI_MODEL`)
- If `provider` is omitted, the API picks Groq when its key is present, otherwise Gemini
- UI choice is persisted in `localStorage` as `et-compose-provider`
- Skills: condensed `naveen-curiosity-science-blog` + `say-it-like-naveen` in `server/prompts/`
- Returns `{ post, provider, model }` into the composer for polish — does **not** auto-publish
- Figure blocks are enriched afterward with CC0/PD (or clearly credited CC) images from Wikimedia Commons / Openverse when available (non-blocking)
- If the model refuses or returns empty JSON, the API retries once with a scientific / cognitive-psychology reframe

### Free-tier notes — Groq (from live probes)

| Model | Role |
|---|---|
| `groq/compound` | **Default.** Full structured JSON blog (~14 blocks) in ~10s. Typical headers: ~250 requests, ~70k tokens. |
| `groq/compound-mini` | Often refuses deception/harm-framed topics — do not use as default. |
| `openai/gpt-oss-20b`, `openai/gpt-oss-120b`, `qwen/qwen3.6-27b` | Work but TPM ~8000 — too small for reliable one-shot long articles; optional fallback / outline only. |
| `llama-3.3-70b-versatile` | Not listed as a direct model on the probed free-tier key. |
| `qwen/qwen3.8-27b`, `allam-2-7b` | Blocked at project level. |

### Free-tier notes — Gemini (from live probes)

| Model | Role |
|---|---|
| `gemini-3.5-flash-lite` | **Default.** Reliable JSON, ~6s for an 8–9 block draft, low token overhead. Uses `responseMimeType: application/json`, `maxOutputTokens` ~8192. |
| `gemini-flash-lite-latest` | Works (alias-ish). |
| `gemini-3.6-flash` | Can produce good JSON drafts but sometimes 503 high demand and uses thinking tokens — optional override via `GEMINI_MODEL`, not default. |
| `gemini-1.5-flash`, `gemini-2.0-flash`, `gemini-2.5-flash` | 404 for the probed free-tier key. |
| `gemma-4-31b-it` | Too slow / noisy for default. |

Call shape: `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` with header `x-goog-api-key`.

Prompt framing matters: prefer “science of deception / cognitive psychology / why perfect lying is a myth” over “teach me to lie”.

### Env

Requires at least one server-only key:

| Variable | Required | Default |
|---|---|---|
| `GROQ_API_KEY` | for Groq | — |
| `GROQ_MODEL` | optional | `groq/compound` |
| `GEMINI_API_KEY` | for Gemini | — |
| `GEMINI_MODEL` | optional | `gemini-3.5-flash-lite` |

- Local: `.env` (gitignored; see `.env.example`)
- Production: Vercel project → Settings → Environment Variables → add the keys above → redeploy

Never commit `.env` or expose keys to the client (`runtimeConfig.groqApiKey` / `groqModel` / `geminiApiKey` / `geminiModel` are server-only).


## Persistence (GitHub → Vercel)

On Vercel the serverless filesystem is ephemeral, so writes to `content/composed-posts.json` alone disappear. When `COMPOSE_GITHUB_TOKEN` (or `GITHUB_TOKEN`) is set, Save draft / Publish / Delete:

1. GET the latest `content/composed-posts.json` from GitHub (Contents API)
2. Upsert or remove the post
3. PUT the file back with the previous SHA (commit on `main`)
4. Vercel redeploys from that commit — `/elevate/<slug>` and the Elevate listing pick up the post

Without a token:

- **Local `nuxt dev`**: filesystem write only (previous behavior)
- **Production publish**: API returns **503** asking for `COMPOSE_GITHUB_TOKEN` / `GITHUB_TOKEN`

| Variable | Required | Default |
|---|---|---|
| `COMPOSE_GITHUB_TOKEN` | for prod publish (preferred) | — |
| `GITHUB_TOKEN` | fallback if compose token unset | — |
| `COMPOSE_GITHUB_REPO` | optional | `the-entertrainer/entertrainer` |
| `COMPOSE_GITHUB_BRANCH` | optional | `main` |

Token needs **Contents: Read and write** on that repo (fine-grained or classic PAT). Set it in Vercel → Settings → Environment Variables (server-only; never `NUXT_PUBLIC_*`). After adding the token, reopen `/compose`, restore the draft from browser `localStorage` if needed, and Publish again.

View live may 404 for ~1 minute until the redeploy finishes.

Also never expose `composeGithubToken` / `githubToken` to the client.
