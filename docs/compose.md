# Elevate composer (`/compose`)

Gate keyword: `iamguru` (session unlock). Drafts and publishes write `content/composed-posts.json`.

## AI draft (one-click)

After unlock, use the **AI draft** panel: enter a topic (optional notes) and click **Generate draft**.

- Route: `POST /api/compose/generate` with `{ topic, notes? }`
- Default model: **`groq/compound`** (optional override via `GROQ_MODEL`)
- Skills: condensed `naveen-curiosity-science-blog` + `say-it-like-naveen` in `server/prompts/`
- Returns a draft `ComposedPost` into the composer for polish — does **not** auto-publish
- Figure blocks are enriched afterward with CC0/PD (or clearly credited CC) images from Wikimedia Commons / Openverse when available (non-blocking)
- If the model refuses or returns empty JSON, the API retries once with a scientific / cognitive-psychology reframe

### Free-tier notes (from live Groq probes)

| Model | Role |
|---|---|
| `groq/compound` | **Default.** Full structured JSON blog (~14 blocks) in ~10s. Typical headers: ~250 requests, ~70k tokens. |
| `groq/compound-mini` | Often refuses deception/harm-framed topics — do not use as default. |
| `openai/gpt-oss-20b`, `openai/gpt-oss-120b`, `qwen/qwen3.6-27b` | Work but TPM ~8000 — too small for reliable one-shot long articles; optional fallback / outline only. |
| `llama-3.3-70b-versatile` | Not listed as a direct model on the probed free-tier key. |
| `qwen/qwen3.8-27b`, `allam-2-7b` | Blocked at project level. |

Prompt framing matters: prefer “science of deception / cognitive psychology / why perfect lying is a myth” over “teach me to lie”.

### Env

Requires server-only `GROQ_API_KEY` (and optional `GROQ_MODEL`):

- Local: `.env` (gitignored; see `.env.example`)
- Production: Vercel project → Settings → Environment Variables → add `GROQ_API_KEY` (and optionally `GROQ_MODEL=groq/compound`) → redeploy

Never commit `.env` or expose the key to the client (`runtimeConfig.groqApiKey` / `groqModel` are server-only).
