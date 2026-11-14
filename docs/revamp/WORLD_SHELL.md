# Satya Space world shell

Production Nexus at `/`. The lab spike stays in its own draft PR. This branch was rebased onto `main` after PR #76 merged as `28061bc`. Do not import `ogl`.

The design spec on `main` (`docs/revamp/DESIGN_SPEC.md`, PR #75) is the source of truth. Two contract notes:

- About’s id is `story`, label “About”, route `/about`. Section 4.1 uses `story`. An earlier proposal used the id `about`.
- Dialogue’s route is `/dialogue` with no trailing slash. Merged spec §4.4 and §9.9 say the same. Older spec drafts said `/dialogue/`; that slash is gone from `main`.

`/?at=<id>` is not in the spec. The spec is silent on the return URL, so the agreed proposal is what shipped: `worldReturnPath(id)` returns `/?at=<id>`, and unknown ids return `/`.

## What shipped

`WorldShell` on `/` draws the Nexus, the Elevate / Empower / Engage zones, and the Learn, Work, Dialogue, About, and Archive docks. GSAP flies the camera. Pointer drag, mouse parallax, and the spec’s gyro prompt (“Use motion to look around?” / Not now / Enable) are in the shell. Sound is not started.

`travelTo(id)` only moves the camera. `enterReading(id)` plays that flight (a cut when reduced motion is on or the tier is 0), then `navigateTo`s the anchor route and moves focus to the destination `h1`. `/?at=<id>` restores the camera on that anchor and focuses its control.

Tiers 0–3 use the spec’s detection order, the DPR caps (1 on Tier 1, 1.5 on Tier 2 and 3), and `?tier=0|1|2|3`. The FPS probe drops one tier per window. Tier 3 drops to Tier 2 when the average is under 50 fps. Any tier under 28 fps drops one step. After every automatic drop, the probe re-arms while the tier is still above the poster, so a sustained 20 fps run goes 3 → 2 → 1 → 0. A pinned `?tier=` does not drop and does not re-arm. `scripts/world-context-loss.mjs` checks that chain. Tier 0 is `WorldFallbackPoster` (section 10.5), including reduced motion. Post-processing runs on Tier 3 only. `WORLD_ZONE_LINKS` is spec §4.4’s ZoneLinks list, also used by `error.vue`. The spec’s example path is `content/zone-links.ts`; the export lives in `composables/world/worldRoutes.ts`.

Context loss follows §10.5. The first `webglcontextlost` is `preventDefault`ed and the loop stops. If `webglcontextrestored` fires and one frame renders, the same zone resumes and the live region says “The 3D view is back.” A timeout, a failed rebuild, or a second loss in the same view disposes geometries, materials, textures, render targets, and the renderer (no `forceContextLoss` once the context is already dead), removes the canvas, and shows the poster with “The 3D view stopped. Every zone is in the list below.” Focus moves to that anchor’s poster link when a zone control had focus, otherwise to the motto heading. `scripts/world-context-loss.mjs` checks this with `WEBGL_lose_context`, plus the ZoneLinks order and the Tier 3 probe math. The loop also pauses when the tab is hidden or the shell is off screen.

The canvas is `role="img"` with a visually hidden name. A live region announces arrivals. The zone list is real buttons (or links, on the poster). Arrow keys move through that list. `M` opens the map and the map’s title takes focus. `M`, Escape, and Close close it and return focus to the Map button. After an automatic drop off Tier 3, the Quality button and its accessible name say “Quality: Standard”.

A tier change disposes the old renderer, then mounts the next tier on a new canvas element. A lost WebGL context stays lost on its canvas, so the next renderer never reuses that element. `scripts/world-context-loss.mjs` covers a probe drop from Tier 2 to Tier 1 and the Quality: High toggle from Tier 2 to Tier 3. Both must finish on a live frame with no console errors. The script exits non-zero when a case fails, the browser is missing, or an exception is thrown. It does not skip. The script imports `chromium` from `@playwright/test` (a devDependency). That package stays out of the Vercel function (`nitro.externals` still lists `playwright-core`).

## Files outside `components/world/` and `composables/world/`

| File | Change |
|---|---|
| `pages/index.vue` | Mounts `WorldShell` on the client and `WorldFallbackPoster` as the server fallback. The wrapper reserves `calc(100dvh - var(--nav-h))` so the footer does not move on hydration. The existing `useSeoMeta` lines are unchanged. |
| `error.vue` | The link list is `WORLD_ZONE_LINKS` instead of `NAV`. Rows are at least 44px tall. Nothing else on the page changed. |
| `package.json` | `npm run check` also runs `lint:copy`. |
| `scripts/lint-world-copy.mjs` | Flags click, hover, tap, drag, swipe, press, and scroll in `components/world`, `error.vue`, and `pages/index.vue`. Line numbers are source lines. |
| `scripts/world-context-loss.mjs` | Context-loss, map focus, probe remount, Quality: High remount, and the `/dialogue` link. Non-zero exit on any failure. |
| `docs/revamp/WORLD_SHELL.md` | This report. |
| `nuxt.config.ts` | Adds `playwright-core` to `nitro.externals` so the dev-only browser driver stays out of the Vercel function. In dev, a public directory no longer 301s to add a slash, so `/dialogue` reaches the page and `/dialogue/` still 301s once. |
| `assets/css/main.css` | `.t-mono` is 12px. |
| `components/ed/Footer.vue` | Fine print is 12px. |
| `components/ed/Masthead.vue` | The word-of-the-day control’s accessible name and sheet label say WOD, matching the visible tiles. |

## Lighthouse mobile (`/?tier=0`, `nuxt dev`, 390×844)

Same machine, same flags, before and after the reserved shell height.

| | Performance | CLS |
|---|---|---|
| Before | 21 | 0.701 |
| After | 50 | 0 |

The absolute Performance score is this dev server (QA’s earlier run was 35). The layout shift the audit named on `footer.ft` is gone.

`nuxt.config.ts` only adds `playwright-core` to the Nitro externals and stops the dev static handler from adding a slash to a public directory. The home route is already a dynamic import, and `mountWorld` is a second dynamic import that runs only when the tier is above 0.

## Bundle

`nuxt build` on this branch. Gzip is `zlib.gzipSync` of the file in `.vercel/output/static/_nuxt`. “Main” is the client entry measured on `main` before this work (117,695 bytes). This branch’s entry is smaller because it includes PR #76’s removal of konva, not because the world was added to the entry.

| Chunk | Gzip |
|---|---|
| Entry `BWiJhIuE.js` | 117,303 |
| Main entry, earlier measurement | 117,695 |
| three runtime `oGQMYxLQ.js` (not in the entry) | 127,413 |
| Home page `Clc7Z-cG.js` | 1,429 |
| World UI `Bz3qDWYi.js` | 8,689 |
| Engine, shaders, GSAP `DeInf9bu.js` | 33,224 |

The entry does not contain `WebGLRenderer`, the motto, or GSAP. The home chunk dynamically imports the UI chunk. The UI chunk calls `import("./DeInf9bu.js")` only after the tier check. The engine chunk imports three.

A visit that starts WebGL therefore downloads about **170.8 KB gzip** beyond the entry (1,429 + 8,689 + 33,224 + 127,413). The world-only files are about **43.3 KB gzip**. The rest is three, which Stack and Backdrop3d already share. Under the 180 KB incremental budget, with the same caveat as the spike: the library is the budget.

## Frame time

Measured in `nuxt dev` with headless Chrome and SwiftShader. `?tier=` forced the tier so the probe would not change it. 16.7 ms is the 60 Hz cap. The Vercel build preset does not emit a local Node server, so these frames are the dev bundle, not the minified production bundle.

| Run | Avg ms | Median ms | Avg fps | Calls | Triangles |
|---|---|---|---|---|---|
| Desktop Tier 0, 1280×800 | 16.67 | 16.7 | 60 | 0 | 0 |
| Desktop Tier 1 | 16.67 | 16.7 | 60 | 21 | 790 |
| Desktop Tier 2 | 16.67 | 16.7 | 60 | 25 | 2,710 |
| Desktop Tier 3 | 26.98 | — | 37.1 | 25 | 4,278 |
| 390×844, CPU ×4, Tier 0 | 16.67 | 16.7 | 60 | 0 | 0 |
| 390×844, CPU ×4, Tier 1 | 16.67 | 16.7 | 60 | 25 | 826 |
| 390×844, CPU ×4, Tier 2 | 16.67 | 16.7 | 60 | 29 | 2,754 |
| 390×844, CPU ×4, Tier 3 | 16.67 | 16.7 | 60 | 29 | 4,322 |

Tier 2 on the same SwiftShader desktop run is 16.67 ms. Tier 3, which adds only the post chain, is 26.98 ms (about 37 fps). The miss is the post chain, not the rasterizer. `tierAfterProbe` drops an unpinned Tier 3 to Tier 2 when the probe average is under 50 fps (frame time over 20 ms). The spec’s 28 fps floor still drops any tier one step. `?tier=3` stays pinned so QA can still look at the post chain. The smaller phone viewport kept Tier 3 on the 60 Hz cap in this software rasterizer. That is not a phone GPU result. CPU ×4 did not move Tier 0–2 off the cap.

Also measured earlier on this same DPR code: at `devicePixelRatio` 3, Tier 1 stays at 1 and Tier 2 and 3 cap at 1.5.

Not measured: a physical phone, Safari, thermal throttling, or a discrete GPU. Devices still to test:

- iPhone 13 or 15, Safari (gyro permission, background context loss, `hardwareConcurrency` often 4 so the spec selects Tier 1)
- iPhone SE
- Pixel 7 and a 4 GB Android with Mali or Adreno, including Save-Data
- MacBook Air and a Windows laptop on Intel graphics
- One discrete-GPU desktop with Quality: High

## Risks

- `hardwareConcurrency <= 4` forces Tier 1. Many phones will never see Tier 2.
- Unpinned Tier 3 drops to Tier 2 when the probe is under 50 fps, then the probe runs again. A real GPU that holds 60 stays on Tier 3. Keep bloom off phones.
- The 180 KB budget is the three chunk. `Backdrop3d.vue` still namespace-imports three, which blocks tree-shaking. That file is outside this ownership.
- `/learn`, `/work`, and `/archive` 404 until the frontend PR adds them. The handoff navigates there on purpose.
- The shell links to `/dialogue`. `nuxt.config.ts` on this branch still 308s that path to `/dialogue/`. The spec now says the slash should 301 the other way. This PR does not edit route rules.
- Workbox precaches every JS file, including the world engine, for every install.
- No image textures yet. The spec does not set a texture byte cap.
- Rebased onto `main` at `28061bc` (PR #76). The PR base is `main`.
