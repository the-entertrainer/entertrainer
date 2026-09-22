# Elevate social hooks (`socialTitle` + `socialHook`)

Every Elevate blog ships **three** short blurbs:

| Field | Where it appears | Job |
|---|---|---|
| `dek` | On-page standfirst under the title | Curiosity gap for readers already on the essay |
| `socialTitle` | `og:title` / Twitter title / LinkedIn paste title | **Social interruption title** — must carry the pull alone |
| `socialHook` | `og:description` / Twitter card / LinkedIn paste description | Social interruption body — pull a scroller mid-feed |

`socialHook` is **not** a copy of `dek` or the SEO title. `socialTitle` is **not** a copy of the on-page H1 when that H1 is a thin brand word (e.g. `Tajjalan`).

## Research rules (encode these)

LinkedIn / Open Graph:

- **LinkedIn mobile composer/feed often omits `og:description`** and shows only title + image + domain. A one-word title fails the product goal. Write `socialTitle` as if the description will never appear.
- `socialTitle` ideal length **~40–60 characters** (hard check 20–70). Front-load curiosity.
- `socialHook` ideal length **~100–150 characters** (safe truncate ~160). Front-load the hook in the first ~100.
- Benefit / curiosity / specificity beats summary. Micro-tension or concrete oddity > vague “learn about X”.
- Title + description must each stand alone.
- Server-rendered OG tags. LinkedIn caches aggressively — after deploy, refresh with [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/).

Psychology levers (light touch, never clickbait spam):

- Curiosity gap with a *true* unfinished thought
- Concrete scene or contradiction
- Specificity (numbers, named glitch, named tool) over abstraction
- Cost/stake (“why this matters now”) without scolding
- Open loop the essay actually pays off (no bait-and-switch)

## Voice / bans

Naveen WhatsApp mind. Run `internet-hook-prose` + `say-it-like-naveen` + `human-voice-gate`.

Hard bans: slogan stacks (“Three X. One Y.”), AI triplets, tech-bro wisdom, physics-apology hedges, preacher/spiritual tone. Hooks must be **true to the essay**.

## Fail closed

- `socialHook` and `socialTitle` required on every published `BlogPost` in `content/blogs.ts`
- `socialHook` must not equal `dek`; length 80–180 (target 100–150)
- `socialTitle` length 20–70 (target 40–60); must not equal a thin one-word `title`
- Composed posts: `socialHook` required to publish; `socialTitle` optional (falls back to `title`) but validated 20–70 when set
- Wire SEO: `socialTitle` → `title` / `ogTitle` / `twitterTitle`; `socialHook` → descriptions; keep visible H1 on `title`
- Check: `npm run check:social-hooks`
- Skill: `.claude/skills/blog-social-hook/SKILL.md`
