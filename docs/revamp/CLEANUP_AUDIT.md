# Cleanup audit

Audit only. Nothing in the app was deleted, moved, or reconfigured. Measurements are from this checkout on 4 Nov 2026: Node v22.23.4, npm 10.9.9, `npm ci`, `npm run check`, `npm run build` (Nitro preset `vercel`), then a dev server on `http://127.0.0.1:3456`.

The ~315 MB figure matches the git pack, not the source tree. The tracked working tree is 71.5 MB (857 files). `.git/objects/pack` is a single 309 MB pack. A full checkout including `.git` is about 383 MB. `node_modules` is gitignored (858 MB after `npm ci`) and is not part of that number. `.nuxt`, `.output`, and `dist` are gitignored. No `node_modules`, `.nuxt`, or `.output` blob has ever been committed on `main`.

---

## 1. Top-level folders and files

Verdicts are about the current tree and whether build, runtime, scripts, or CI read the path. “Safe to remove” means the site build does not import it. It is still a product decision when the folder is reference material someone might want.

| Path | What it is | Referenced by build / runtime / CI? | Verdict |
| --- | --- | --- | --- |
| `Inspiration/` (5.3 MB) | Scraped technical dump of pacomepertant.com (Awwwards): minified bundles (`scripts/u9FHZ-Hh.js` is 2.8 MB and vendors Three, GSAP, and Lenis), CSS, ogg sounds, and replication notes. | Not imported by Nuxt, Vite, or CI. The only pointer is `.claude/commands/replicate-portfolio.md`. | Safe to remove from the app repo. It is third-party extracted source, not this site. |
| `astroclock/` (968 KB) | React island for `/engage/astroclock`. Aliased as `@astroclock` in `nuxt.config.ts`. JSX is compiled with esbuild, not `@vitejs/plugin-react`. | Live. `pages/engage/astroclock.vue` mounts it. `astronomy-engine`, `react`, `react-dom`, `lucide-react`, and `three` are imported here. | Keep. This is a shipped Engage app, not clutter. |
| `squash/` (1.9 MB) | Art pack and `MECHANICS.md` for a tap game that was never wired to a page. Sprite sheets overlap `public/squash/` (15 shared filenames). | No Vue/TS import. `/engage/squash` 301s to `/engage`. `app.vue` still special-cases that path, which the redirect never reaches. | Safe to remove with `public/squash/` and `utils/squash/game.ts` (also unimported). |
| `docs/` (804 KB) | Project docs: backlog, licenses, Whatto model notes, course QA writeups. | Not bundled. `CONTRIBUTING.md` and `AGENTS.md` point at `docs/BACKLOG.md`. Scripts mention `docs/blog-social-hook.md` and `docs/whatto/MODEL.md` in comments only. CI does not read the folder. | Keep the folder. Many files are historical QA notes and can be archived later. They are not why the repo is large. |
| `.agents/` (144 KB) | Agent skills. `AGENTS.md` and `README.md` point at `.agents/skills/humanize-elevate/SKILL.md`. `skills-lock.json` tracks the motion-design skill. | Not part of the site build. | Keep while agents use it. |
| `.claude/` (140 KB) | Second copy of some of those skills, plus `imagegen` and `commands/replicate-portfolio.md`. | Not part of the site build. | Optional. Duplicates `.agents` for humanize-elevate and sacred-geometry. Small. |
| `_d.mjs`, `_v.mjs` | One-off Playwright screenshot scripts. Hard-coded paths under `/tmp/claude-0/...` and `/opt/pw-browsers/chromium`. | Not in `package.json` scripts or CI. | Safe to remove. |
| `PATCHES-nuxt.config.md` | Drop-in notes for Dialogue (konva, dexie, jspdf, jszip, file-saver, PWA, routes). | Not read by the build. Dialogue already lives in the tree and loads those libraries from CDNs, not from this note. | Safe to archive or delete. Stale relative to the code. |
| `POLISH_PLAN.md` | Finished GUI-polish checklist. Still names `rage-mail` and `distractor-gen` as if they were current pages. | Not read by the build. | Safe to archive. The rage-mail name is historical (see Empower section). |
| `ideas.md` | Unused homepage art-direction note. | Not read by the build. | Safe to archive. |
| `todo.md` | Pointer to `docs/BACKLOG.md`. | Not read by the build. 86 historical versions add about 3 MB inside git. | Safe to keep as a pointer, or fold into `CONTRIBUTING.md` and delete. |
| `README-DIALOGUE.md` | Dialogue setup notes. | Not read by the build. `README.md` does not link it. | Keep next to Dialogue until that app is documented in `README.md`. |
| `netlify.toml` | Preview-deploy config. Comment says production stays on Vercel. `publish = "dist"`. | CI does not use it. `nuxt.config.ts` switches Nitro to the Netlify preset when `NETLIFY=true`. | Not a forgotten file. See section 6. Remove only if Netlify previews are retired. |
| `vercel.json` | Production redirects, `/elevate.xml` rewrite, Whatto `X-Robots-Tag`. | Used by Vercel. Duplicates most `routeRules` in `nuxt.config.ts`. | Keep. |
| `skills-lock.json` | Lock for the motion-design agent skill. | Not part of the site build. | Keep with `.agents`. |
| `app/`, `assets/`, `components/`, `composables/`, `content/`, `layouts/`, `pages/`, `public/`, `server/`, `stores/`, `types/`, `utils/`, `scripts/`, `.github/` | The Nuxt app, static files, and CI. | Yes. | Keep. `public/` is 62 MB and is the bulky part of the working tree. |

`public/tesseract/` (19 MB) is not stray. `utils/parseSource.ts` points `tesseract.js` at `/tesseract/worker.min.js`, the wasm core, and `langPath: '/tesseract'` (that directory load is why `eng.traineddata.gz` has no filename hit in a search). It is only used when StoryGen reads an image. StoryGen is not an Empower tool. See section 8.

---

## 2. Dependencies

`dependencies` are installed for production and were traced into the Vercel function when a server route imports them. `devDependencies` are installed by `npm ci` and by Vercel’s build. There is no `eslint` config and no `typecheck` script, so nothing in CI proves a dependency is unused except “no import”.

Install sizes are the on-disk size of that package folder after `npm ci`. Client sizes are from the production client build. A package that is never imported costs install size and, for server externals, deploy size. It does not land in the client bundle.

### Unused by the app (no import, or comment only)

| Package | Where it sits | Evidence | Install size | Becomes unused for the client? |
| --- | --- | --- | --- | --- |
| `ogl` | dependencies | No `from 'ogl'` / `import('ogl')` anywhere. `three` is the WebGL library that is actually imported (`components/work/Backdrop3d.vue`, `composables/stack/useStackEngine.ts`, AstroClock `MetalClock3D.tsx` and `SkyClock3D.tsx`). | 0.8 MB | Already absent from the bundle. Install-only duplicate of Three. |
| `gsap` | dependencies | No app import. The string appears inside `Inspiration/scripts/u9FHZ-Hh.js`, which vendors its own GSAP. | 6.4 MB | Already absent. |
| `matter-js` + `@types/matter-js` | dependencies + devDependencies | Only listed in `package.json`. | 1.1 MB + types | Already absent. |
| `rough-notation` | dependencies | Only `package.json`. | 0.1 MB | Already absent. |
| `split-type` | dependencies | Only `package.json`. | 0.3 MB | Already absent. |
| `html2canvas` | dependencies | Named once, in a comment in `utils/liquidGlass.ts`. | 4.6 MB | Already absent. |
| `dexie`, `konva`, `vue-konva`, `jspdf`, `jszip` | dependencies | Dialogue does not import them. `public/dialogue/index.html` loads Konva, Dexie, jsPDF, JSZip, and FileSaver from unpkg/cdnjs. Vue pages repeat the Dexie CDN load. | dexie 3.2, konva 1.9, vue-konva 0.2, jspdf 29, jszip 2.1 MB (about 36 MB) | Already absent from the Nuxt bundle. Removing the npm copies does not remove the CDN scripts. |

`file-saver` is a real StoryGen import (`utils/storyExportDocx.ts`, `storyExportXlsx.ts`, `storyExportDiagram.ts`) and a CDN script for Dialogue. Keep it for StoryGen.

### Present, but only for routes that fail or are backups

| Package | Evidence | Install / deploy |
| --- | --- | --- |
| `playwright-core` | `server/api/_calendar-screenshot-pw.post.ts`, plus `_d.mjs` and `_v.mjs`. Nitro does **not** ignore the `_` prefix: `.vercel/output/config.json` registers `POST /api/_calendar-screenshot-pw`. A POST with `{}` returned **500** (`event.req.text is not a function`). | 13 MB install. 6.3 MB copied into the Vercel function. |
| `@sparticuz/chromium` | Same Playwright route. `nuxt.config.ts` marks it external, so the binary is shipped beside the function. | 67 MB install (`bin/chromium.br` alone is 62 MB). 67 MB of the 95 MB function. |
| `pdf-lib` | Only `server/api/_calendar-screenshot-satori.post.ts`. That POST also **500**s with the same `event.req.text` error. | 25 MB install, 1.3 MB in the function. |

`satori` and `@resvg/resvg-js` are live: `server/api/social-card/[key].png.ts` uses both. Keep them. The social-card file also documents that `@nuxt/devtools` (a devDependency, 7.7 MB) hoists `h3@2` over Nitro’s `h3@1` and breaks `h3` auto-imports. Devtools are `enabled: false` in config and still get installed.

### Used, and easy to misread as duplicates

| Package | Who imports it | Misplacement? | Size note |
| --- | --- | --- | --- |
| `react`, `react-dom`, `@types/react`, `@types/react-dom` | AstroClock `.tsx` only. `pages/engage/astroclock.vue` imports the `react-dom/client` type. `nuxt.config.ts` sets `jsxImportSource: 'react'` for `astroclock/`. | Correctly in `dependencies` (the island ships to the client). Not a second app framework. | `react-dom` client chunk about 209 KB minified. |
| `lucide-react` | Five AstroClock components, a handful of icons. | Same as React. | **Install is 45 MB** because the package contains every icon. The built chunk that includes Lucide + `astronomy-engine` is 598 KB. Tree-shaking works. The install cost does not. Build warns that `"use client"` in `lucide-react` was ignored. |
| `three` + `@types/three` | Stack, the work backdrop, AstroClock clocks. | Used. `ogl` is the unused twin. | Largest Three-marked client chunk 491 KB. |
| `astronomy-engine` | `astroclock/lib/astro/math.ts`, `planets.ts`, and `scripts/astroclock-audit/verify.ts`. | Used. | Inside the 598 KB AstroClock chunk. |
| `pdfjs-dist` | Dynamic import in `utils/parseSource.ts` (StoryGen). | Used, client-side. | Package folder 36 MB. Client emits `pdf.worker.min.*.mjs` at **1,275 KB**, plus a 520 KB pdf.js chunk. |
| `tesseract.js` | Dynamic import in `utils/parseSource.ts`. Runtime assets are the committed `public/tesseract/` (19 MB), not the npm package (1.7 MB). | Used by StoryGen image OCR only. | Dominates `public/`. |
| `docx`, `mammoth`, `exceljs`, `file-saver` | StoryGen export/import (`utils/storyExportDocx.ts`, `storyExportXlsx.ts`, `parseSource.ts`). | Used. Heavy, and correctly dynamic-imported. | exceljs chunk 918 KB. A combined docx/mammoth chunk is 395 KB. |
| `pptxgenjs` | Dynamic import in `pages/tools/cadence.vue`. Also traced into the server function (`pptxgen.es.mjs`, 517 KB) via the training-calendar API routes. | Used by Cadence, not by Empower. | Client chunk 269 KB. |
| `page-flip` | `components/ed/BookReader.vue` (SEWA). | Used. | 9.1 MB install. |
| `pinia`, `@pinia/nuxt` | Stores and `nuxt.config.ts` modules. | Used. `@pinia/nuxt` belongs in the modules list; both are fine as runtime deps. | Small. |
| `@tailwindcss/vite`, `tailwindcss` | Tailwind is **not** the site CSS. `assets/css/main.css` is hand-written. Tailwind is imported only from `astroclock/styles/astroclock.css` (`@import "tailwindcss/theme"` and `utilities`, `@source` limited to the island). | DevDependencies are the right place. | 0.7 MB. |
| `@vite-pwa/nuxt` | Module in `nuxt.config.ts`. | Listed as a devDependency. Nuxt modules often need to be present at build time; the service worker is build output, not a runtime npm import. Fine where it is. | 0.3 MB. |
| `nuxt`, `@nuxt/devtools` | Framework. | `nuxt` is a devDependency, which is normal. | nuxt folder 51 MB, mostly because it pulls Vite and Vue into that tree’s accounting. |

`npm ci` reported **44 vulnerabilities** (3 low, 17 moderate, 18 high, 6 critical) and deprecation warnings for `glob`, `inflight`, `rimraf@2`, and `uuid@8`. Those come from the current lockfile. This audit did not change it.

### What the client actually emitted

Production client build, largest chunks:

| Chunk | Minified | gzip | Fingerprint in the file |
| --- | --- | --- | --- |
| `pdf.worker.min.*.mjs` | 1,275 KB | (worker, gzip not printed) | StoryGen PDF parsing |
| `CC51Mtaw.js` | 918 KB | 271 KB | exceljs |
| `B97wAEvo.js` | 598 KB | 117 KB | astronomy-engine, lucide-react |
| `CB007KIu.js` | 520 KB | 161 KB | pdf.js |
| `Ciht68m6.js` | 491 KB | 127 KB | three (`WebGLRenderer`) |
| `BBHgm5Db.js` | 467 KB | 143 KB | tesseract client |
| `BS2EkbFF.js` | 395 KB | 102 KB | mammoth |
| `-8p0wQ1B.js` | 325 KB | 118 KB | (hashed shared chunk, no library marker) |
| `ylSa2w9m.js` | 269 KB | 96 KB | pptxgenjs |
| `DPS1ixCZ.js` | 209 KB | 67 KB | react-dom |

Vite warned that some chunks exceed 500 KB. Named CSS for the heavy pages: StoryGen 47 KB, AstroClock 49 KB, Whatto 27 KB, Strong 26 KB, AI Atlas 20 KB. EasyMCQ’s CSS is 3.9 KB and Draftly’s is 7.0 KB. Empower is not the bundle problem.

---

## 3. Why the checkout is ~315 MB

### Working tree (what a fresh file listing shows)

Tracked files: **71.5 MB**. `public/` is **62 MB**. Largest current files:

| Size | Path | Still needed? |
| --- | --- | --- |
| 12.2 MB | `public/tesseract/eng.traineddata.gz` | Only for StoryGen OCR |
| 3.7 MB | `public/tesseract/tesseract-core-lstm.wasm.js` | Same |
| 2.7 MB | `public/tesseract/tesseract-core-lstm.wasm` | Same |
| 2.8 MB | `Inspiration/scripts/u9FHZ-Hh.js` | No |
| 2.1 MB | `public/web-apps.png` | Only `content/navigation.json` and the hidden lab nav |
| 2.0 + 1.9 MB | `public/backdrop-light-portrait.png`, `backdrop-light-landscape.png` | No reference in source, JSON, or CSS (the CSS hits are `backdrop-filter`) |
| 1.9 + 1.8 MB | `public/backdrop-dark-portrait.png`, `backdrop-dark-landscape.png` | Same, no reference |
| 1.9 MB | `public/my-work.png` | Lab nav + `navigation.json` only |
| 1.8 MB | `public/squash/` | Unreferenced by the app. `squash/atlas.json` names some sheets |
| 1.7 MB | `public/downloads.png` | Mentioned in `docs/visual_asset_brief.md` only |
| 1.4 MB each | `public/work-02.png`, `work-03.png` | No reference |
| 1.4 MB each | `public/templates.png`, `resources.png`, `frameworks.png` | `navigation.json` downloads entries. The downloads slug page does not render `img` |

`public/blog/` is 13 MB and is mostly real Elevate figures. A filename search found a few blog JPEGs with no caller (for example `feeling-of-knowing/zipper.jpg`, `dinner.jpg`, `life-midpoint/hourglass.jpg`). Do not delete those on a search hit alone: a later pass should open the article and confirm the figure is unused.

### Git history (what makes the pack 309 MB)

`git rev-list --objects main` → **5,035 blobs, 302 MB uncompressed**. All refs (other remote branches are in this clone) → 5,345 blobs, 392 MB uncompressed. The pack file on disk is **309 MB**. Binaries barely compress, so the pack size and the blob size stay close.

Deleted paths still reachable from `main`: **144 MB** across 1,898 blob versions. Largest deleted prefixes:

| Historical weight | Path | In the current tree? |
| --- | --- | --- |
| 38.8 MB | `public/about/` old files, mostly `public/about/gifs/*.gif` | Current `public/about/` is 2.2 MB of photos. The gifs are gone from the tree and still in history. |
| 33.0 MB | `public/netagiri/` | Deleted in `6f8c42f` (29 Sep 2026) with Fever. |
| 12.7 MB | old `public/blog/` versions | Current blog is separate. |
| 11.3 MB | `public/the-net.png` (four versions) | Gone from the tree. |
| 9.9 MB | `public/fever/` including `clocktower.mp3` (5.1 MB) | Gone. Route 301s to `/engage`. |
| 9.5 MB | `public/gifs/` | Gone. |
| 4.2 MB | `public/graduation.gif` | Gone. |
| 1.7 MB | `public/hangyourfriend.png` | Gone. |

Files that are still tracked also carry old versions: `package-lock.json` history is 22 MB across 38 blobs (text, so it compresses in the pack), and the big PNGs (`easymcq.png`, `training-cal-gen.png`, `better-emails.png`, `web-apps.png`, `storygen.png`) each have several megabytes of previous versions. Current `easymcq.png` is only 37 KB. The old 2 MB renders are what the history still stores.

`promo-kit/StoryGen-LinkedIn-Launch-Kit.zip` (74 MB) plus two demo mp4s are **not on `main`**. They are reachable from `remotes/origin/video/storygen-linkedin-demo` (and the zip’s commits). They inflate a full `git clone` / GitHub repo size. They do not inflate a blob walk of `main` alone. This clone’s pack includes them because the remote-tracking branches were fetched.

There is no Git LFS (no `.gitattributes`). Nothing in history is `node_modules` or a Nuxt build directory.

### What a history cleanup would involve

This needs an explicit sign-off. Do not rewrite `main` as part of a cleanup PR.

1. Agree the paths that can be dropped from every commit: at least `public/netagiri`, `public/fever`, `public/gifs`, `public/about/gifs`, `public/the-net.png`, `public/graduation.gif`, `public/hangyourfriend.png`, and old versions of the multi-megabyte PNGs if the current file is the one to keep.
2. Decide the non-`main` branches. Deleting `video/storygen-linkedin-demo` (and any other branch that only exists to hold `promo-kit`) removes the 74 MB zip from GitHub’s repo size without rewriting `main`.
3. Rewrite with `git filter-repo` (or BFG) on a mirror, then `git gc`. Every clone, open PR, and local branch has to be reset. Tags and deploy SHAs change. Vercel’s git link follows the new history only after a force-push.
4. Protect the remote during the push (`--force-with-lease` on `main`, coordinate with anyone mid-branch).
5. Afterwards, add a size guard (for example a CI check that fails when a new blob over a few MB is not in an allow-list) so OCR models and promo zips do not land in git again. LFS is an alternative for the 19 MB tesseract model if StoryGen OCR stays.

Expected effect if the deleted-path set above is purged from `main` and the promo branch is removed: on the order of **150 MB+** off the pack, before counting delta savings. The working tree would not shrink until the current large files (`public/tesseract`, unused backdrops, `Inspiration/`) are deleted in a normal commit. That part does not need a history rewrite.

---

## 4. Routes, tools, and what responds

Dev server: `nuxi dev --port 3456`. Status codes are without following redirects. Titles were checked on the pages called out as doubtful.

### Public navigation (these work)

| URL | Status | What it is |
| --- | --- | --- |
| `/` | 200 | Home. Elevate, Empower, Engage, About. |
| `/elevate` | 200 | Essay index. |
| `/elevate/<nine published slugs>` | 200 | Hand-built essays. Sampled `tajjalan` and `one-equals-two-lets-break-maths`. |
| `/elevate/are-72-432-and-25920-clues-or-just-numbers-we-learned-to-notice` | 200 | Composed post from `content/composed-posts.json` via `pages/elevate/[slug].vue`. |
| `/elevate/does-not-exist` | 404 | Expected. |
| `/empower` | 200 | Lists EasyMCQ and Draftly only. |
| `/engage/` | 200 | Stack, The Mind Reader, AstroClock. |
| `/engage` | **301 → `/engage/`** | `public/engage/` exists (two unused webps). The static directory forces a trailing slash before the Vue route. Same pattern for `/about` → `/about/` because `public/about/` holds real photos. Both slashed URLs render the right page. |
| `/engage/stack`, `/engage/read-my-mind`, `/engage/astroclock` | 200 | Live games. `layout: false`. |
| `/engage/whatto` | 200 | Live, unlisted, `noindex`. Not linked from the Engage index. |
| `/about/` | 200 | Biography. |
| `/instructional-design` | 200 | Short lesson. |
| `/lessons` | 200 | Links to the lesson and to AI Atlas. Not in the masthead. |
| `/courses/ai-atlas` | 200 | Long course. |
| `/my-work/sewa-chronicles`, `/my-work/strong` | 200 | Case study and module. |
| `/colophon` | 200 | Linked from the footer. |
| `/tools/easymcq`, `/tools/better-emails` | 200 | Empower tools. Titles match. |
| `/tools/storygen`, `/tools/cadence` | 200 | Real tools. **Not** on the Empower index. They are in `public/sitemap.xml`. |
| `/dialogue/`, `/dialogue/new`, `/dialogue/library`, `/dialogue/settings`, `/dialogue/c/demo` | 200 | Dialogue shell. |
| `/api/ping` | 200 | `{"ok":true}`. |

### Redirects that are doing their job

Configured in both `nuxt.config.ts` `routeRules` and `vercel.json` (kept in sync for the ones listed there).

| URL | Status | Lands on |
| --- | --- | --- |
| `/tools` | 301 | `/empower`. `pages/tools/index.vue` never renders. |
| `/blogs`, `/blogs/tajjalan` | 301 | `/elevate`, `/elevate/tajjalan` |
| `/my-work` | 302 | `/about#sewa-chronicles` (in-page `navigateTo`, not `routeRules`) |
| `/downloads` | 302 | `/` |
| `/dialogue` | 301 | `/dialogue/` |
| `/engage/squash`, `/engage/fever`, `/engage/netagiri` | 301 | `/engage` |

The same 301-to-`/engage` treatment exists for pictune, velocity, vilakku, vybe, gateway, third-eye, solfeggio, and brainwave. Six Elevate slugs also 301 back to the index (listed in `vercel.json` and `routeRules`).

### Dead, placeholder, or easy to misread

| URL | Status | Note |
| --- | --- | --- |
| `/downloads/templates` (also `frameworks`, `resources`) | 200 | `pages/downloads/[slug].vue` renders `UiConstructionZone` inside `UiContentShell`. The index redirects home, so the only way in is the raw URL. Title falls back to the site default. |
| `/about/nope` | 404 | `pages/about/[slug].vue` looks up `navigation.json` `about`, which is `[]`. The page is dead for every slug. |
| `/my-work/nope` | 404 | `pages/my-work/[slug].vue` is the same pattern. `sewa-chronicles` and `strong` have their own pages, so the dynamic route never serves them. SEWA’s “All projects” link points at `/my-work`, which immediately redirects away. There is no project index. |
| `/tools/nope` | 404 | `pages/tools/[slug].vue` only matches ids in `navigation.json` `tools` (easymcq, better-emails), and those have dedicated pages, so this file never wins. |
| `/lab`, `/lab/g01` … `/lab/g15` | 200 | `noindex` homepage sketches. `/lab/g99` is 404. Not in the public nav. `app.vue` drops the masthead on `/lab/*`. |
| `/glass-lab` | 200 | `noindex` shader playground. `robots.txt` disallows it. |
| `/compose` | 200 | `noindex` authoring UI. Needs `GROQ_API_KEY` / `GEMINI_API_KEY` and a GitHub token to publish. |

### Dev warnings, not failed routes

- Hitting Dialogue logs: `Your project has layouts but the <NuxtLayout /> component has not been used`. `pages/dialogue/index.vue` (and new, library, settings, `c/[id]`) set `layout: 'dialogue'`, but `app.vue` renders `<NuxtPage>` with no `<NuxtLayout>`. The layout file `layouts/dialogue.vue` does not wrap those pages. The routes still return 200.
- `POST /api/_calendar-screenshot-pw` and `POST /api/_calendar-screenshot-satori` return **500** (`event.req.text is not a function`). They are registered. They are not backup files Nuxt skipped.
- `POST /api/youniverse` with `{}` returns **200** and a fallback paragraph. No page calls it. Orphan API, not an Empower tool.
- `POST /api/distractor` and `POST /api/better-emails` with `{}` return **400** with a clear validation message. The handlers run. A real Groq call was not made (no key in this environment).
- `GET /api/test-error` and `GET /api/test-groq` return **404** on purpose.

No page in the table above returned 500.

---

## 5. Build health

| Step | Result |
| --- | --- |
| `npm ci` | Pass. 1,163 packages, 12 s. `nuxt prepare` ran from `prepare`. 44 audit vulnerabilities (see section 2). Deprecation warnings only. |
| `npm run check` | Pass, under 1 s. Paper-signal, human-not-model gate, social hooks (9 posts), Dialogue smoke. |
| `npm run build` | **Pass. Wall time 40 s.** Client built in 15.7 s, server in 8.4 s, then Nitro. |
| Lint | No ESLint config, no `lint` script. |
| Typecheck | No `typecheck` script, no `vue-tsc` dependency, `typescript.typeCheck` is not set. CI does not typecheck. The build still compiles `.vue` and `.ts`. |

Nuxt **3.17.7**, Nitro **2.13.4**, Vite **6.4.3**, Vue **3.5.39**. Preset printed as `vercel` because `NETLIFY` was unset.

Warnings during the client build:

- `lucide-react` `"use client"` directives ignored (two files).
- Chunks larger than 500 KB (the pdf worker, exceljs, and the pdf.js chunk).

Output (this is build output, not git):

| Artifact | Size |
| --- | --- |
| `.vercel/output` | 163 MB |
| `.vercel/output/static` | 69 MB (public files + built assets) |
| `.vercel/output/functions` | 95 MB |
| of which `@sparticuz/chromium` | 67 MB |
| of which `playwright-core` | 6.3 MB |
| PWA precache | 338 files, 33,236 KB |

There is no `.output/` directory. The Vercel preset writes `.vercel/output` instead. `netlify.toml` expects `dist/`, which this build does not produce. A Netlify build only works when `NETLIFY=true` flips the Nitro preset (section 6).

`npm run dev` on this machine booted (`Local: http://127.0.0.1:3456/`) and served the routes in section 4.

---

## 6. Config duplication and conflicts

**Nuxt patches.** `nuxt.config.ts` is the config that ships. `PATCHES-nuxt.config.md` is an old Dialogue checklist and disagrees with the code: it says to add `assets/css/dialogue.css` to `css` and to register `components/dialogue` with `pathPrefix: false`. The live config does neither. Dialogue CSS is pulled by the layout and by `public/dialogue/index.html`.

**Netlify vs Vercel.** Production is Vercel (`vercel.json`, default Nitro preset `vercel`). `netlify.toml` is an intentional preview overlay: build `npm run build`, publish `dist`, Node 22. `nitro.preset` is `process.env.NETLIFY ? 'netlify' : 'vercel'` because a hardcoded Vercel preset writes `.vercel/output` and fails Netlify’s `dist/` publish. The two files are not fighting on Vercel. They do mean two hosts, two preset outputs, and two copies of the redirect list to maintain. Vercel redirects and `routeRules` repeat the same map (tools, blogs, games, removed Engage apps, six Elevate slugs). One extra rule exists only in Nuxt: `/elevate/the-sacred-frequencies-are-not-a-scale` → the current sacred-frequency essay. It is missing from `vercel.json`.

**Tailwind v4.** Installed and applied only inside the AstroClock island (`astroclock/styles/astroclock.css` plus the `@tailwindcss/vite` plugin). The publication CSS is `assets/css/main.css` with `html { font-size: 1px }` so `1rem` means one pixel. Removing Tailwind would break AstroClock and nothing else.

**PWA.** `@vite-pwa/nuxt` in `nuxt.config.ts`: `registerType: 'autoUpdate'`, `skipWaiting`, `clientsClaim`, precache of js/css/html/svg/png/woff2, `maximumFileSizeToCacheInBytes` 4 MB, navigate fallback `/`, API routes `NetworkOnly`. Shortcuts: EasyMCQ, Draftly, Dialogue, AstroClock. Dialogue also has its own `public/dialogue/manifest.webmanifest`. `devOptions.enabled` is false. The generate step reported a 33 MB precache, which is large for a first install and is mostly static assets under 4 MB, not the 12 MB tesseract model (that file is over the cap).

**JSX.** One esbuild JSX transform for `astroclock/`, and Vue JSX is excluded there. The comment in `nuxt.config.ts` explains why `@vitejs/plugin-react` is not used (Vite major mismatch). That comment matches the code.

**Env.** `.env.example` documents Groq, Gemini, Gamma, and the compose GitHub token. EasyMCQ and Draftly read `process.env.GROQ_API_KEY` directly and do not use `runtimeConfig`. Compose, Dialogue, StoryGen, and Cadence also use that variable. See section 8.

---

## 7. Cleanup plan

Sizes are working-tree or install/deploy sizes. History savings need the rewrite in section 3 and are listed separately.

### (a) Safe removals, low risk

Do these in ordinary commits. Run `npm run check` and `npm run build` after each group. None of them are imported by a live route.

1. Scratch and stale notes: `_d.mjs`, `_v.mjs`, `PATCHES-nuxt.config.md`, `POLISH_PLAN.md`, `ideas.md`. A few KB.
2. `Inspiration/` (5.3 MB) and the `.claude` command that points at it, if agents no longer need that reference.
3. Squash leftovers: `squash/` (1.9 MB), `public/squash/` (1.9 MB), `utils/squash/game.ts`, and the `/engage/squash` branch in `app.vue`. Keep the 301 in `nuxt.config.ts` and `vercel.json` so old links still resolve.
4. Unreferenced public images, after deleting the `navigation.json` / lab-nav fields that name them: the four `backdrop-*.png` files (7.4 MB), `downloads.png` (1.7 MB), `work-02.png`, `work-03.png` (2.7 MB). `public/engage/*.webp` (23 KB) are unreferenced and are why `/engage` 301s to `/engage/`. Removing that directory drops the extra slash. Confirm no external post links to the slash form if that matters.
5. npm packages with no importer: `ogl`, `gsap`, `matter-js`, `@types/matter-js`, `rough-notation`, `split-type`, `html2canvas`. About **13 MB** off `npm ci`. No client-bundle change.
6. Dialogue CDN duplicates, only if a quick Dialogue export smoke (`npm run smoke:dialogue`) still passes and a manual comic export is checked: `dexie`, `konva`, `vue-konva`, `jspdf`, `jszip`. About **36 MB** off `npm ci`. The browser keeps loading the CDN copies. `file-saver` stays for StoryGen.

Suggested order: notes, then Inspiration, then Squash, then images, then unused npm packages. Image and Squash deletions shrink the next commit. They do not shrink history until section 3.

Rough working-tree savings from (a): **about 20 MB** (Inspiration, Squash, backdrops, stray PNGs). Install savings from the unused packages: **about 50 MB**, almost all of it `jspdf` plus GSAP and html2canvas.

### (b) Needs sign-off

| Change | Why it is not safe yet | Savings |
| --- | --- | --- |
| History rewrite + delete the promo-kit branch | Rewrites every SHA. Section 3. | ~150 MB off the pack, plus the 74 MB zip if that branch goes |
| Delete `server/api/_calendar-screenshot-pw.post.ts`, `_calendar-screenshot-satori.post.ts`, `playwright-core`, `@sparticuz/chromium`, and `pdf-lib` | The routes are broken (500) but they are the only reason the function ships a browser. Someone may still want calendar screenshots. | **~73 MB** of the 95 MB Vercel function, ~80 MB off `npm ci` |
| Remove `@nuxt/devtools` or pin `h3` | Devtools are off, and the social-card route exists specifically to dodge the hoisted `h3@2`. Confirm OG images after. | 7.7 MB install, and a class of 500s |
| Replace `lucide-react` with a few SVGs inside AstroClock | Behavior-neutral only if the same icons are redrawn. | ~45 MB install. Client bundle barely moves |
| Move or drop `public/tesseract` and `tesseract.js` | StoryGen image OCR stops working. | 19 MB in git, 1.7 MB install |
| Drop `pdfjs-dist`, `docx`, `mammoth`, `exceljs` | StoryGen import/export. | Tens of MB install, ~3 MB of client chunks |
| Drop `pptxgenjs` and the training-calendar API routes | Cadence export. | 2.5 MB install + a 269 KB chunk |
| Drop React, `three`, `astronomy-engine` | Removes AstroClock and the Stack/backdrop WebGL. | The React island and the Three chunks |
| Delete `netlify.toml` and the `NETLIFY` preset branch | Only if preview deploys are not on Netlify anymore. | No size. One less host to keep in sync |
| Add the missing sacred-frequency redirect to `vercel.json` | One-line fix, but it changes a public URL. | None |
| Archive `docs/` QA notes | Useful history, zero runtime cost. | Under 1 MB |
| Empower tool removal | Separate inventory and order in section 8. Does **not** unlock the heavy libraries. | ~133 KB of icons and card art |

Do the sign-off items after (a), and do the history rewrite last, on its own, with a backup clone.

---

## 8. Empower tools removal inventory

The owner is replacing every current Empower tool. On the site today, Empower is exactly two tools.

| Tool | Route | In the Empower index? | In the sitemap? |
| --- | --- | --- | --- |
| EasyMCQ (distractor generator) | `/tools/easymcq` | Yes | Yes |
| Draftly (email polisher) | `/tools/better-emails` | Yes | Yes |

`/empower` builds that list from `content/editorial.ts` category `tools`. Those two items are the whole category. `pages/tools/index.vue` describes the same pair, and `/tools` 301s to `/empower`, so that file never renders.

**Rage Mail is not a third tool.** It was the previous email app. Commit `b5fa4de` (23 Jun 2026), “Replace Rage Mail with Better Emails utility”, deleted `pages/tools/rage-mail.vue` and `server/api/rage-mail.post.ts`. Neither file is in the tree. No route, env var, component, or asset still uses that name. `POLISH_PLAN.md` still says `rage-mail` in an old padding note. Draftly is the successor. There is nothing left to delete except that stale sentence, and the blobs in git history (only relevant if section 3 happens).

**Not Empower, do not remove in this pass**

| Tool | Route | Why it looks related |
| --- | --- | --- |
| StoryGen | `/tools/storygen` | Lives under `/tools`, has a sitemap URL, and has its own MCQ API (`/api/storyforge-mcq`, `/api/storyforge`). It is not on `/empower`. It owns `docx`, `exceljs`, `mammoth`, `pdfjs-dist`, `tesseract.js`, and `file-saver`. |
| Cadence | `/tools/cadence` | Same. Old URL `/tools/training-cal-gen` 301s here. It owns `pptxgenjs` and `/api/training-cal-gen`. |
| `/api/youniverse` | no page | Orphan Groq route. Not email, not MCQ. |

Removing Empower does not make those libraries unused.

### EasyMCQ

| Kind | Files |
| --- | --- |
| Page | `pages/tools/easymcq.vue` (260 lines). Dev server: 200, title “EasyMCQ — Distractor Generator”. |
| Components | `components/tools/mcq/BrandMark.vue`, used only by that page (`<ToolsMcqBrandMark>`). |
| Composables / stores | None. Local `ref`s only. |
| Server | `server/api/distractor.post.ts`. `POST /api/distractor` with an empty body returns 400 “Question and answer are required.” No middleware directory exists. |
| Assets | `public/easymcq.png` (37 KB), `public/easymcq-icon.svg`, `public/easymcq-icon-192.png`, `public/easymcq-icon-512.png`, `public/icons/easymcq-icon.svg`. |
| Env | Reads `process.env.GROQ_API_KEY` inside the route. No `runtimeConfig` key of its own. **Do not delete the env var** (Compose, Dialogue, StoryGen, Cadence, and `/api/youniverse` also read it). |
| Config | `nuxt.config.ts` PWA shortcut “EasyMCQ — Distractor Generator” → `/tools/easymcq`. `content/editorial.ts` item `easymcq`. `content/navigation.json` `tools[]` entry. `content/social-previews.ts` key `/tools/easymcq`. `public/sitemap.xml` URL. `pages/empower/index.vue` `ICON_BY_ID.easymcq`. `components/ed/Card.vue` has a decorative id map entry `'easymcq': 'evidence'` (no other reader). |
| Generators (not CI) | `scripts/build-tool-icons.mjs`, `scripts/build-thumbnails.mjs`. |
| Tests | None. `npm run check` does not call this API. |
| Libraries | No npm import. The page is Vue plus `UiToolShell` and the shared `.glass-btn` / `.glass-chip` rules in `assets/css/main.css`. The API is `fetch` to `https://api.groq.com/openai/v1/chat/completions`. |

### Draftly

| Kind | Files |
| --- | --- |
| Page | `pages/tools/better-emails.vue` (708 lines). Dev server: 200, title “Draftly — Email Polisher”. |
| Components | `components/tools/email/BrandMark.vue`, used only by that page (`<ToolsEmailBrandMark>`). |
| Composables / stores | None. |
| Server | `server/api/better-emails.post.ts`. Empty POST returns 400 “Email draft is required.” `server/api/newsletter-subscribe.post.ts` mentions this file in a comment about the H3 body workaround. Comment only. |
| Assets | `public/better-emails.png` (34 KB), `public/draftly-icon.svg`, `public/draftly-icon-192.png`, `public/draftly-icon-512.png`, `public/icons/draftly-icon.svg`. |
| Env | Same shared `GROQ_API_KEY`. No Draftly-specific secret. |
| Config | PWA shortcut “Draftly — Email Polisher” → `/tools/better-emails`. Editorial item `better-emails`. `navigation.json` tools entry. `social-previews.ts` key `/tools/better-emails` (`key: 'draftly'`). Sitemap URL. `pages/empower/index.vue` `ICON_BY_ID['better-emails']`. `Card.vue` id `'better-emails': 'tool'`. |
| Generators | Same two scripts as EasyMCQ. |
| Tests | None. |
| Libraries | No npm import. Same shell and glass classes. Same Groq HTTP API. |

Copy that names the tools and is not runtime: `docs/no-miss-page-outlines.md`, `docs/wcag-22-audit.md`, `docs/boilerplate-depth-audit.md`, `docs/visual_asset_brief.md`, `docs/asset_licenses.md`, `docs/boilerplate-scaffolding-audit.json`, `POLISH_PLAN.md`. Updating those is optional and does not affect the build.

### Libraries that become unused once Empower is gone

**None.** Both tools are Vue SFCs plus a Groq `fetch`. They do not import `ogl`, `three`, React, pdf, docx, excel, pptx, tesseract, playwright, or chromium.

Client weight that disappears with the pages: EasyMCQ CSS 3.9 KB, Draftly CSS 7.0 KB, and the small JS for those two SFCs. Working tree: **about 133 KB** of png/svg icons and card art.

`GROQ_API_KEY` stays. So do `runtimeConfig.groqApiKey` and `GROQ_MODEL`.

### Shared with the rest of the site — keep

| Piece | Also used by | If removed now |
| --- | --- | --- |
| `components/ui/ToolShell.vue` | Cadence (`pages/tools/cadence.vue`) and the unused `pages/tools/[slug].vue` | Cadence loses its frame. Build fails on the missing component only if the template still references it. |
| `.glass-btn`, `.glass-chip` in `assets/css/main.css` | Cadence, StoryGen, `pages/glass-lab.vue` | Visual regression, not a failed build. |
| `GROQ_API_KEY` | Compose, Dialogue story API, StoryGen (`/api/storyforge`, `/api/storyforge-mcq`), Cadence (`/api/training-cal-gen`, `/api/training-cal-gen-table`), `/api/youniverse` | Those features 422/503 without a key. |
| `/empower` page, masthead link, sitemap entry, `social-previews` `/empower` | The section is staying; the tools inside it are not | Keep the route. It will render an empty list until new tools exist. |
| `pages/tools/storygen.vue`, `pages/tools/cadence.vue`, their components under `components/tools/story/` and `components/tools/cal/`, and their API routes | Not Empower | Out of scope. |
| `server/api/storyforge-mcq.post.ts` | StoryGen’s own quiz helper | Not EasyMCQ. |

`pages/tools/[slug].vue` and the `toolsNav` getter are only the construction-zone fallback. After the two `navigation.json` entries are gone, no URL hits `[slug]`. It can go in the same commit. It is not required by StoryGen or Cadence.

`pages/tools/index.vue` is already unreachable. Delete it in the same commit or leave it. Leaving it does not break the build. Its copy would be wrong the moment Empower changes.

### Removal order that keeps the build green

One commit is enough. The order inside it matters only if you stop halfway and run CI.

1. Edit data and config so nothing points at the old URLs: remove the two `ITEMS` in `content/editorial.ts`, the `tools` array entries in `content/navigation.json`, the two records in `content/social-previews.ts`, the two `<url>` lines in `public/sitemap.xml`, the two PWA shortcuts in `nuxt.config.ts`, and `ICON_BY_ID` in `pages/empower/index.vue`. Drop the two keys in `components/ed/Card.vue`. `/empower` then renders an empty list and still builds. Do not add a redirect unless old public links should land somewhere. There is no redirect today, so removing the pages makes `/tools/easymcq` and `/tools/better-emails` 404. Add 301s to `/empower` in `routeRules` and `vercel.json` if bookmarks should survive.
2. Delete `pages/tools/easymcq.vue`, `pages/tools/better-emails.vue`, `components/tools/mcq/`, `components/tools/email/`, `server/api/distractor.post.ts`, `server/api/better-emails.post.ts`. Optionally delete `pages/tools/[slug].vue` and `pages/tools/index.vue` in the same step. Fix the comment in `server/api/newsletter-subscribe.post.ts` so it does not name a deleted file.
3. Delete the png/svg assets listed above. Update `scripts/build-tool-icons.mjs` and `scripts/build-thumbnails.mjs` so a later manual run does not recreate them. Those scripts are not in CI. Skipping them does not fail `npm run build`.
4. Leave `ToolShell`, `main.css` glass classes, Cadence, StoryGen, and `GROQ_API_KEY` in place.
5. `npm run check` then `npm run build`. Check does not import these pages. The build fails only if a remaining template still names `ToolsMcqBrandMark`, `ToolsEmailBrandMark`, or a deleted path.

Do not combine this with dropping `pptxgenjs`, `pdfjs-dist`, `docx`, `exceljs`, `tesseract.js`, or the Chromium packages. Those belong to Cadence, StoryGen, and the broken screenshot routes.
