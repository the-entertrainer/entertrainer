# Entertrainer — writing

**One writing skill only:** `naveen-writing` (id `naveen-wisdom-voice`).

Load it before any draft — chat, Elevate essays, About, UI copy, captions, social hooks.

- Agent workflow: use skill `naveen-wisdom-voice`
- Repo mirror: `.claude/skills/naveen-wisdom-voice/SKILL.md`

Retired (do not use for voice): `say-it-like-naveen`, `naveen-curiosity-science-blog`, `blog-social-hook`, `human-not-model`. Their folders remain only as redirects.

## Voice

Match the gold sample (phone-in-dark / rope conversational paragraphs). Plain words. Complete sentences. Concrete scenes.

Never textbook “Your X…”. Never abstract sketch/map metaphors. Never choppy Blah.Blah.Blah. Never cliché AI infographics.

## Social title + hook (required)

Every published Elevate post needs `socialTitle` (~40–60 chars) and `socialHook` (~100–150 chars) in `content/blogs.ts`. LinkedIn mobile often hides the description — **`socialTitle` must carry the pull alone**. `socialHook` must **not** copy `dek`. On-page H1 stays `title`. Fail closed via `npm run check:social-hooks`. After deploy, refresh LinkedIn with Post Inspector.

Rules for hooks live inside `naveen-wisdom-voice` / `naveen-writing` — not in a separate social-hook skill.

## Do not publish

- Pop-neuro title templates (“Why Your Brain Is Hardwired…”, “the terrifying truth”).
- Invented or mismatched citations.
- Unearned topic detours the hook does not require.
- Generic explainers with no ordinary scene and no useful landing.
- Model-default register (*delve, tapestry, underscore, intricate, pivotal, realm, landscape*, metronomic paragraph length).

Compose drafts stay unpublished until they match house Elevate essays **and** the naveen-writing gate.
