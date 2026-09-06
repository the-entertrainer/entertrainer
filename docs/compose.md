# Elevate composer (`/compose`)

Gate keyword: `iamguru` (session unlock). Drafts and publishes update `content/composed-posts.json` — locally via the filesystem in `nuxt dev`, and in production by committing to GitHub so Vercel redeploys.

## WYSIWYG editor

Default mode is **Canvas** — a live article surface that mirrors Elevate reading rhythm:

- Large hero at the top (`EdEditorialImage`, ~16:8.5) with **Regenerate hero**
- Inline title / dek fields styled like the published article
- Sticky margin note + prose blocks
- **Figures show full inline images**; click a figure to edit caption/alt/src in place (Paste URL / Remove image)
- Dual mode: **Canvas** (default) ↔ **Fields** (classic meta grid + block cards). Choice persists in `localStorage` as `et-compose-mode`

Mobile-first: single column under ~760px; hero goes edge-to-edge.

Keep the iamguru gate, AI generate panel, and publish to `POST /api/compose/posts`.

## AI draft (one-click)

After unlock, use the **AI draft** panel: pick a provider, enter a topic (optional notes), and click **Generate draft**.

- Route: `POST /api/compose/generate` with `{ topic, notes?, provider?: 'groq' | 'gemini', imageSource?, heroOnly? }`
- Providers:
  - **Groq** (default when `GROQ_API_KEY` is set): model **`groq/compound`** (override via `GROQ_MODEL`)
  - **Gemini**: model **`gemini-3.5-flash-lite`** (override via `GEMINI_MODEL`)
- If `provider` is omitted, the API picks Groq when its key is present, otherwise Gemini
- UI choice is persisted in `localStorage` as `et-compose-provider`
- Skills: condensed `naveen-curiosity-science-blog` + `say-it-like-naveen` in `server/prompts/`
- Returns `{ post, provider, model, heroBrief?, imageWarning? }` into the composer for polish — does **not** auto-publish
- If the model refuses or returns empty JSON, the API retries once with a scientific / cognitive-psychology reframe

### Hero pipeline (conceptual, not decorative)

Heroes are **always** procedural Elevate covers from `server/utils/elevate-hero.ts` — cream `#F7F1E4` / ink `#0B0B0C` / cobalt `#2F5BD8`, flat editorial, **one clear metaphor** matching `public/blog/*/hero.jpg` DNA (e.g. head → tangled roads vs one cobalt path).

1. LLM draft JSON includes optional `heroBrief`: `{ metaphor, motif, focal, cobaltRole }`
2. Server resolves brief (LLM → heuristic from title/dek/topic → default tangled-paths)
3. Motif renderer builds structured SVG (silhouettes, Bézier “roads”, orbits, scales, ripples…) — **not** random fBm sludge
4. Rasterize PNG via `@resvg/resvg-js` when available (else SVG `data:`)
5. Always set `post.hero` + `heroAlt`; figures stay Commons / Gemini / Gamma

Motif families: `tangled-paths` · `ripples` · `orbits` · `dual-minds` · `balance` · `shatter` · `grid-anomaly` · `flow-thread`

**Regenerate hero only:** `POST /api/compose/generate` with `{ heroOnly: true, topic|title, dek?, slug?, seed?, heroBrief? }` → `{ hero, heroAlt, heroBrief, motif, heroOnly: true }` (no full draft LLM, no figure enrichment).

### Figure images

Figure enrichment runs after text (non-blocking) from the **Images** control (hero slot skipped — procedural owns the cover):

- **Commons** (default): Wikimedia Commons / Openverse CC0–PD (or clearly credited CC)
- **Gemini**: Elevate-style figures via `GEMINI_API_KEY` + `GEMINI_IMAGE_MODEL` (default `gemini-2.5-flash-image`)
- **Gamma**: figures via `GAMMA_API_KEY` (`POST https://public-api.gamma.app/v1.0/images`, poll for `image.url`)

Pass `imageSource?: 'commons' | 'gemini' | 'gamma'` on generate; UI stores choice in `localStorage` as `et-compose-image-source`.

If Gemini/Gamma fails or the key is missing, falls back to Commons and returns `imageWarning`. Gamma/Gemini images are budgeted on Vercel (~20–25s after text); slow gens may fall back to Commons.

Editor: hero + figure blocks show `<EdEditorialImage>` previews. `localStorage` strips `data:image/` for quota; `sessionStorage` keeps them for in-tab refresh until Publish commits to `/blog/<slug>/…`.

### Mage Space — not integrated

**Mage Space has no public API** (invite-only beta; automation / scraping is forbidden). Do **not** scrape Mage or attempt unofficial clients.

- To enable later: request API beta from **mage@mage.space**
- Composer UI shows a disabled row: “Mage Space · contact for API beta”
- Keep Gemini / Gamma / Commons for figures; heroes remain procedural Elevate covers

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
| `GEMINI_API_KEY` | for Gemini text + Gemini images | — |
| `GEMINI_MODEL` | optional | `gemini-3.5-flash-lite` |
| `GEMINI_IMAGE_MODEL` | optional (image source = Gemini) | `gemini-2.5-flash-image` |
| `GAMMA_API_KEY` | for Gamma images (`X-API-KEY`) | — |

- Local: `.env` (gitignored; see `.env.example`)
- Production: Vercel project → Settings → Environment Variables → add the keys above → redeploy

Never commit `.env` or expose keys to the client (`runtimeConfig.groqApiKey` / `groqModel` / `geminiApiKey` / `geminiModel` are server-only).


## Persistence (GitHub → Vercel)

On Vercel the serverless filesystem is ephemeral, so writes to `content/composed-posts.json` alone disappear. When `COMPOSE_GITHUB_TOKEN` (or `GITHUB_TOKEN`) is set, Save draft / Publish / Delete:

1. For the post being saved, download any absolute `http(s)` (or `data:image/…`) hero/figure URLs into `public/blog/<slug>/` (`hero.<ext>`, `figure-01.<ext>`, …), rewrite paths to `/blog/<slug>/…`, keep captions/credits. Skip srcs already under `/blog/<slug>/`. Prefer png/jpeg/webp/svg for heroes; reject files over ~8MB. Failed downloads leave that src as-is and continue.
2. GET the latest `content/composed-posts.json` from GitHub
3. Upsert or remove the post
4. Commit **JSON + image files** on `main` via the Git Data API (blobs → tree → commit → ref). If image blobs fail, still attempt a JSON-only Contents API commit.
5. Vercel redeploys — `/elevate/<slug>` and the Elevate listing pick up the post and local images

Without a token:

- **Local `nuxt dev`**: filesystem write only (previous behavior)
- **Production publish**: API returns **503** asking for `COMPOSE_GITHUB_TOKEN` / `GITHUB_TOKEN`

| Variable | Required | Default |
|---|---|---|
| `COMPOSE_GITHUB_TOKEN` | for prod publish (preferred) | — |
| `GITHUB_TOKEN` | fallback if compose token unset | — |
| `COMPOSE_GITHUB_REPO` | optional | `the-entertrainer/entertrainer` |
| `COMPOSE_GITHUB_BRANCH` | optional | `main` |

Token needs **Contents: Read and write** on that repo (fine-grained or classic PAT). Set it in Vercel → Settings → Environment Variables (server-only; never `NUXT_PUBLIC_*`). **Vercel must have a valid `COMPOSE_GITHUB_TOKEN`** (or `GITHUB_TOKEN`) or Publish cannot commit to `main` and will not trigger a redeploy. After adding the token, reopen `/compose`, restore the draft from browser storage if needed, and Publish again.

### Publish readiness check

- Route: `GET /api/compose/status`
- Returns `{ githubConfigured: boolean, githubOk?: boolean, repo, branch }` (optional `detail` when not ok). **Never returns the token.**
- The composer surfaces this as “GitHub publish: ready / not configured / token invalid” before you Publish.
- On production, missing or invalid token → clear **503** from Save/Publish.

### Commit fallback

Multi-file Git Data API commits (JSON + images) can be flaky. If that path fails, Publish always falls back to a **JSON-only Contents API** commit so `content/composed-posts.json` still lands on `main` (images may remain remote until a later successful image commit).

View live may 404 for ~1 minute until the redeploy finishes.

Also never expose `composeGithubToken` / `githubToken` / `gammaApiKey` / `geminiApiKey` to the client.
