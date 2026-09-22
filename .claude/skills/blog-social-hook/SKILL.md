---
name: blog-social-hook
description: >-
  Required for every new or revised Entertrainer Elevate blog. Crafts
  LinkedIn/Open Graph socialTitle + socialHook copy (separate from on-page
  title/dek). Use before shipping content/blogs.ts or publishing a composed post.
---

# Elevate socialTitle + socialHook (hardcoded norm)

Every blog link pasted on socials — especially LinkedIn — must reveal a **hook**. LinkedIn mobile often shows **only the title** (no description line). So `socialTitle` must carry the pull alone, and `socialHook` still fills `og:description` where platforms show it.

## Field split (fail closed)

| Field | Use |
|---|---|
| `title` | On-page H1 only |
| `dek` | On-page standfirst only |
| `socialTitle` | LinkedIn / `og:title` / Twitter title only |
| `socialHook` | LinkedIn / `og:description` / Twitter card description only |

Rules:

1. `socialTitle` and `socialHook` are **required** on every published `BlogPost` in `content/blogs.ts`.
2. `socialHook` **must not** equal `dek`. Length **~100–150 characters** (hard check 80–180). Front-load the hook in the first ~100.
3. `socialTitle` length **~40–60 characters** (hard check 20–70). Front-load curiosity. For branded one-word titles (e.g. Tajjalan), `socialTitle` **must differ** and carry the essay hook.
4. Wire SEO via `socialTitle` in `pages/elevate/*.vue` `useSeoMeta` (`title` / `ogTitle` / `twitterTitle`) and in `content/social-previews.ts` article `title`. Wire `socialHook` into descriptions. Keep on-page H1 / UI on `title` / `dek`.
5. Composed posts: `socialHook` required; `socialTitle` optional (fallback to `title`) — still prefer writing one before publish.
6. After deploy, clear LinkedIn cache with **Post Inspector** (`https://www.linkedin.com/post-inspector/`).

Run: `npm run check:social-hooks`.

## Research to encode (LinkedIn / OG)

- Mobile LinkedIn composer/feed **often omits `og:description`** — title-only preview is common.
- `og:description` is for **social interruption**, not a copy of SEO meta / on-page dek.
- Title (~40–60) + description (~100–150) must each stand alone.
- Server-rendered OG tags; LinkedIn caches — always note Post Inspector.

## Psychology levers (light, true)

- Curiosity gap with a *true* unfinished thought
- Concrete scene or contradiction
- Specificity (numbers, named glitch, named tool) over abstraction
- Cost/stake without scolding
- Open loop the essay actually pays off — no bait-and-switch

## Voice / bans (HARD)

Load `internet-hook-prose` + `say-it-like-naveen` + `human-voice-gate` / `human-not-model`.

Fail on: slogan stacks (“Three X. One Y.”), AI triplets, tech-bro wisdom, physics-apology hedges, preacher/spiritual tone. Read enough of the essay (or dek + title + lead) so you do **not invent claims**.

## Workflow for a new blog

1. Draft essay + on-page `title` + `dek`.
2. Write `socialTitle` and `socialHook` last — after the spine is true. Assume description is hidden.
3. Count characters; front-load; ensure hook ≠ `dek`; thin titles get a different `socialTitle`.
4. Grep SEO paths: no `*.dek` in `ogDescription`; no bare thin `*.title` in `ogTitle`.
5. `npm run check:social-hooks`.
6. After production deploy: LinkedIn Post Inspector on the public URL.

## Pass bar

A stranger mid-scroll stops because the **title alone** is concrete and unfinished — and the essay pays it off.
