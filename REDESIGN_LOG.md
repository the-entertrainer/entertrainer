# Dawn Press redesign log

Working log for the full-site redesign ("Dawn Press": the site as a hand-printed
broadsheet at sunrise). Kept so the work can resume after any interruption.

- Branch: `redesign/dawn-press` (from main @ e9ae464, 28 Nov 2026)
- Owner instruction (28 Nov 2026): build on the branch, then merge to main and
  push directly once every check passes. No PR. No force-push.
- Screenshots and Lighthouse JSON live outside the repo (binary, large):
  `/workspace/dawn-press-shots/{baseline,after}` on the build box.

## Phase checklist

- [x] 0. Baseline: `npm run check` PASS, `npm run build` PASS, route smoke,
      Lighthouse (5 key routes + EasyMCQ + Stack), first-load JS.
- [x] 1. Foundations: cream paper, motion tokens, `useMotion` + `plugins/motion.client.ts`,
      Settings Motion (Full/Calm/Off) + Sound, route ink-pull, grain, focus ring,
      Index palette (Ctrl/Cmd+K or /), masthead search, `npm run smoke:routes`.
- [x] 2. Home: broadsheet front page, Flower of Life construction, SplitText quote,
      sun that follows the route rows, live previews, "In this issue" strip,
      preloader -> home Flip hand-off.
- [x] 3. Hubs and reading: Elevate sunrise + MUST filters with Flip, Empower workbench with
      live tool demos, Engage orrery, About route line + ink thread, Colophon live specimen
      (axis sliders, measured contrast, motion curves), Lessons front, crafted 404/500 page,
      essays with front-page headlines, line-set entrance, developing figures, ink progress line.
- [x] 4. Empower apps: EasyMCQ two-pane proof sheet (difficulty, optional rationale, lock/edit/
      rewrite unlocked, history of 20, CSV/GIFT/Aiken export, Ctrl+Enter, chip overflow fixed,
      gradient removed; API fields optional and back-compatible). Draftly word diff, tone segment,
      subject alternatives (optional API field), history, text-only body rendering. Cadence .ics
      export, print stylesheet, paper calendar palette.
- [~] 5. Engage apps: Mind Reader "How did that work?" with the forced squares outlined.
      Stack best score, DPR clamp 2 and Whatto "not financial advice" were already in place.
- [~] 6. Studios and courses: /my-work/strong and construction-zone hydration mismatches fixed.
- [ ] 7. Polish and hardening: cut (see below). Kept: motion skips on-screen entrances when GSAP
      arrives after first paint, so nothing visible replays and LCP is not pushed back.
- [x] 8. Verification (light mode, 390 + 1440), merge to main.

## Baseline numbers (main @ e9ae464, local node-server build, Lighthouse 12 mobile)

| Route | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| / | 75 | 95 | 96 | 100 | 5.0 s | 0 | 30 ms |
| /elevate | 63 | 100 | 100 | 100 | 21.5 s | 0 | 100 ms |
| essay (you-are-absolutely-right) | 67 | 100 | 100 | 100 | 6.9 s | 0 | 60 ms |
| /empower | 72 | 100 | 100 | 100 | 5.1 s | 0 | 20 ms |
| /engage | 70 | 100 | 96 | 100 | 5.4 s | 0 | 30 ms |
| /tools/easymcq | 66 | 100 | 96 | 100 | 6.0 s | 0 | 130 ms |

Local numbers have no CDN or compression, so they are lower than production.
They are for before/after comparison on the same machine only.

First-load JS (gzip, measured in Chromium): / 148 KB, /elevate 165 KB, essay 152 KB,
/empower 156 KB, /engage 284 KB, /about 148 KB, EasyMCQ 151 KB.
Largest client chunk: 940 KB raw / 270 KB gzip.

Route smoke at baseline: 378/423 visits pass. Failures: hydration mismatch on `/`
(and `/downloads` which redirects there) whenever the preloader was already seen
this session, hydration mismatch on `/downloads/templates` and `/my-work/strong`,
and `/dialogue/` (a 308 loop that exists only on the local node-server preset;
production serves 200).

## Decisions and assumptions

- Paper is cream `#F7F1E4` (the documented DESIGN.md value), not white. The
  greys that sit on it were re-measured: `--gray-500` darkened to `#69696F`
  (4.7:1 on cream), `--line-strong` to `#8C8373` (3.3:1, for UI boundaries).
- View Transitions API not used: `app.vue` already passes an explicit page
  transition to `<NuxtPage>`, and Nuxt's experimental view transitions conflict
  with that. The "ink pull" is CSS (lift + fade + one yellow band), < 600 ms.
- GSAP loads only through `useMotion()`, only on the client, only when a page
  asks. Every helper uses `gsap.from`, so content is visible in CSS without JS.
- Preloader is unchanged. The hand-off reads the ident's ring and wordmark
  rects at `complete` and Flips the home Flower of Life and the masthead mark
  from them.
- The home hydration mismatch came from `showPreloader` reading
  sessionStorage during setup (server and client disagreed). It now starts from
  the path on both sides, and an inline head script adds `html.pl-skip` before
  paint so returning visitors never see the gate flash.
- Settings > Motion: Full / Calm / Off. Off sets `data-reduce-motion="on"`
  (same attribute every existing reduced-motion rule reads). Calm sets
  `data-motion="calm"`. The OS preference still wins. The preloader keeps
  reading the OS only, as before.
- Settings > Sound: off by default; synthesised paper/press sounds
  (`utils/pressSound.ts`) on taps and toggles only.

## Cut or deferred

Cut on 28 Nov 2026 at the owner's request (usage budget), not for technical reasons:

- Stack: daily seed, extra juice/particles, pause-on-hidden UI (rAF already stops in hidden tabs).
- Mind Reader mandala reveal.
- AstroClock onboarding and restyle.
- Whatto loading/error state restyle.
- Dialogue landing restyle (own brand, own smoke test; left untouched).
- Compose visual pass (publishing untouched, as required).
- StoryGen palette/minimap/presentation mode.
- Courses shared player chrome.
- Cadence drag+keyboard reschedule upgrade and stamp-build animation (click-to-move already exists).
- Draftly tone slider beyond the three-way segment.
- Phase 7 polish: full axe/keyboard audit, Lighthouse tuning to the 90 target, DESIGN.md/AGENTS.md
  updates (cobalt -> yellow), dark/reduced-mode sweep at 768.

Known: first-load JS adds GSAP as idle `prefetch` chunks (~70 KB gz) that execute only on pages
that animate; Lighthouse perf on this box was below 90 before and after.
