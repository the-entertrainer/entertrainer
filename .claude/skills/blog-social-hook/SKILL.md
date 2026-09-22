---
name: blog-social-hook
description: >-
  Required for every new or revised Entertrainer Elevate blog. Crafts
  LinkedIn/Open Graph socialHook copy (separate from on-page dek). Use before
  shipping content/blogs.ts or publishing a composed post.
---

# Elevate socialHook (hardcoded norm)

Every blog link pasted on socials — especially LinkedIn — must reveal a **hook**: a captivating paragraph/sentence that pulls readers. This is `socialHook`, not `dek`.

## Field split (fail closed)

| Field | Use |
|---|---|
| `dek` | On-page standfirst only |
| `socialHook` | LinkedIn / `og:description` / Twitter card description only |

Rules:

1. `socialHook` is **required** on every published `BlogPost` in `content/blogs.ts`.
2. `socialHook` **must not** equal `dek` (or a trivial paraphrase that LinkedIn would treat as the same skim).
3. Length **~100–150 characters** (hard check 80–180). Front-load the hook in the first ~100.
4. Wire SEO via `socialHook` in `pages/elevate/*.vue` `useSeoMeta` (`description` / `ogDescription` / `twitterDescription`) and in `content/social-previews.ts` article `description`. Keep on-page UI on `dek`.
5. Composed posts: same field; publish must refuse empty/`=== dek` hooks.
6. After deploy, clear LinkedIn cache with **Post Inspector** (`https://www.linkedin.com/post-inspector/`).

Run: `npm run check:social-hooks`.

## Research to encode (LinkedIn / OG)

- `og:description` is for **social interruption**, not a copy of SEO meta / on-page dek.
- Ideal ~100–150 chars; safe truncate ~160.
- Benefit / curiosity / specificity beats summary. Micro-tension or concrete oddity > “learn about X”.
- Title (~50–60) + description must each stand alone (mobile often hides description).
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

1. Draft essay + on-page `dek`.
2. Write `socialHook` last — after the spine is true.
3. Count characters; front-load; ensure ≠ `dek`.
4. Grep SEO paths: no `*.dek` in `ogDescription` / twitter description for article pages.
5. `npm run check:social-hooks`.
6. After production deploy: LinkedIn Post Inspector on the public URL.

## Pass bar

A stranger mid-scroll stops because something concrete and unfinished got under their skin — and the essay pays it off.
