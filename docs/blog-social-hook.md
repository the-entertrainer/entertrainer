# Elevate social hooks (`socialHook`)

Every Elevate blog ships **two** short blurbs:

| Field | Where it appears | Job |
|---|---|---|
| `dek` | On-page standfirst under the title | Curiosity gap for readers already on the essay |
| `socialHook` | `og:description` / Twitter card / LinkedIn paste preview | **Social interruption** — pull a scroller mid-feed |

`socialHook` is **not** a copy of `dek` or the SEO title.

## Research rules (encode these)

LinkedIn / Open Graph:

- Ideal length **~100–150 characters** (safe truncate ~160). Front-load the hook in the first ~100.
- Benefit / curiosity / specificity beats summary. Micro-tension or concrete oddity > vague “learn about X”.
- Title (~50–60 chars) + description must each stand alone (mobile often hides description).
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

- Required on `BlogPost` and on composed publishes
- Must not equal `dek`
- Length 80–180 (target 100–150)
- Check: `npm run check:social-hooks`
- Skill: `.claude/skills/blog-social-hook/SKILL.md`
