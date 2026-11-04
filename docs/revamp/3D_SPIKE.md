# Satya Space — 3D spike

Prototype route: `/lab/world`. This is a lab spike, not the world shell. It does not mount on `/`, does not edit `pages/index.vue`, and does not add `/learn`, `/work`, or `/archive` pages. Those belong to the shell PR (`feat/world-shell`).

The design spec on `design/revamp-spec` (PR #75) was read and not committed here. Where that spec and the spike brief disagreed, the notes below say which one the prototype followed.

## Stack

**Chosen:** three.js `0.163` (already installed), wrapped in Vue composables, with a small custom post chain. GSAP tweens the camera between anchors. No new dependencies.

**Not chosen:** TresJS, ogl, pmndrs `postprocessing`, three.js `EffectComposer`.

| | TresJS + cientos / post-processing | Raw three.js composables | ogl |
|---|---|---|---|
| SSR | Needs a client-only canvas. Current `@tresjs/post-processing` peers `three >= 0.169`. We are on `0.163`. | Dynamic `import()` inside `onMounted`, behind `ClientOnly`. The server never evaluates three. | Same client-only rule as three. |
| Bundle | Core plus Vue reactivity, cientos, and a three upgrade. | Measured below. Named imports. The library is a separate async chunk, not in the entry. | Smaller runtime, but a second engine next to Backdrop3d, Stack, and AstroClock. |
| Mobile | Same GPU cost as three, plus a reactivity layer that is easy to bind per frame. | DPR caps, tier budgets, and a paused loop are explicit. | Lean, but we would still own post, loaders, and GSAP by hand. |
| Shaders | Custom materials fight the template. | `ShaderMaterial` is the path the beacon and the grade pass use. | Shader-first, and a smaller ecosystem. |
| Upkeep | Tracks Vue and three together. | One engine, the one the spec names. | Another engineer is removing `ogl` from this repo. Do not depend on it. |
| GSAP | Template refs, then `.value`. | GSAP tweens a plain rig. The render loop reads it. ScrollTrigger can scrub that same object later. | Same idea, more glue. |

Post-processing, same constraint (three `0.163`):

| | pmndrs `postprocessing` | `EffectComposer` + UnrealBloomPass | Custom passes |
|---|---|---|---|
| Fit | `6.39` needs `three >= 0.168`. `6.37.8` still allows `0.163`, so it is a pin, not a current release. | Ships inside three. The bloom pass is a mip chain and does not tree-shake well. | Four fullscreen draws: bright extract, two blurs at quarter resolution, composite. |
| Mobile | Strong, and heavy if it is always on. | Known to be the expensive option. | Tier 3 only. Chromatic aberration stays at or under `0.002` and is zero except at the middle of a zone tween. |
| Choice | Adopt after a three bump, and only on Tier 3. | Skip. | **Used in the spike.** |

ogl stays in this comparison because it was on the table. It is not imported.

## What `/lab/world` does

Client-only page. `pages/lab/world.vue` async-loads `WorldStage`. `WorldStage` calls `import('~/composables/world/mountWorld')` only when the tier is 1, 2, or 3. Tier 0 never evaluates that module.

The scene is the Nexus: an octahedron, a five-bar beacon (custom fresnel / noise shader), a thin ring, three zone markers at 120° (Elevate forward, Empower starboard, Engage port), and docks for Learn, Work, Dialogue, About (`story`), and Archive. Stars are one `Points` draw. Tier 2+ uses `MeshStandardMaterial` (roughness 0.92, metalness 0.04) plus fog. Tier 1 is unlit and has no fog, no gyro, and no camera drift. The beacon on Tier 1 only breathes opacity.

Routes and labels are `WORLD_ANCHORS` / `WORLD_ZONE_LINKS` in `composables/world/worldRoutes.ts`. That file does not import three. Order: Nexus, Elevate, Empower, Engage, Learn, Work, Dialogue, About, Archive. About’s id is `story`, route `/about`. Every path is bare. Dialogue is `/dialogue`, not `/dialogue/`. The spec on PR #75 still writes `/dialogue/`; the Lead’s later rule is the bare path, and the spike follows the Lead. The live site still 308s `/dialogue` to `/dialogue/`. This spike does not change `routeRules`.

`/?at=<id>` and `enterReading(id)` are the shell’s job. The lab proves the handoff with an in-page sheet (Back to the scene) and a continue link that uses the anchor route. `/learn`, `/work`, and `/archive` 404 until the shell PR adds them. That is intentional.

### Tiers

Detection matches spec §10.3, in order: reduced motion, no WebGL, Save-Data, software GL → Tier 0. Then `deviceMemory <= 4` or `hardwareConcurrency <= 4` → Tier 1. Otherwise Tier 2. Tier 3 only if that result is Tier 2, the machine looks like a flagship desktop (fine pointer, short side ≥ 900, 8+ cores, memory ≥ 8 or unknown), and the visitor turns on Quality: High. `?tier=0|1|2|3` overrides detection and skips the FPS probe.

| | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Picture | `WorldFallbackPoster` | WebGL | WebGL | WebGL |
| DPR cap | — | 1 | 1.5 | 1.5 (spec states 1.5 for Tier 2 and does not set a higher Tier 3 cap) |
| Post | no | no | no | bloom, grain ~3.5%, vignette, CA ≤ 0.002 on the travel apex |
| Materials | — | unlit | standard + fog | standard + fog |
| Triangle cap | — | 20k | 80k | 80k |
| Stars | 0 | 48 | 160 | 280 |
| Gyro | no | no | after the prompt | after the prompt |
| Travel | none | 700ms | 1100ms | 1300ms |

The spike brief says post-processing runs only on Tier 3. Spec §10.1 also gives Tier 2 grain and vignette. The prototype follows the brief. Tier 2 has fog and emissive materials, not a second pass.

Measured on the Nexus frame (`renderer.info`, objects outside the frustum are not counted):

| Tier | Draw calls | Triangles | Points |
|---|---|---|---|
| 1 | 21 | 790 | 48 |
| 2 | 25 | 2,710 | 160 |
| 3 | 25 | 4,278 | 280 |

Caps are 80 calls, 20k triangles on Tier 1, 80k on Tier 2–3. There are no image textures. The spec does not give texture byte sizes; the spike does not invent a budget it cannot meet with a number.

FPS probe: 5 warmup frames, then 45. Average under 28 drops one tier and probes again, down to the poster. A query override does not probe.

`prefers-reduced-motion` and `html[data-reduce-motion]` of `on` or `1` select Tier 0 and update live. With `?tier=` set, the tier stays so a test can still force a picture, and auto motion, gyro, and shader time stop.

Gyro copy is the spec line: “Use motion to look around?” with Not now and Enable. Enable calls `DeviceOrientationEvent.requestPermission` inside the click when that function exists. Tier 1 never asks.

### Context loss

On `webglcontextlost` the engine stops the loop, drops geometries, materials, any maps on those materials, the render targets, and the renderer, and removes the context listeners. The page then shows `WorldFallbackPoster`, keeps the anchor you were on, and moves focus to that zone’s link. It does not try to restore the GL context. Copy: “The 3D view did not start. Every zone is in the list below.”

The loop also pauses when the tab is hidden, the stage is off screen, or the reading sheet is open. Resize uses a `ResizeObserver` cache. The frame function does not read layout.

## Shell contract (for `feat/world-shell`, not this PR)

1. `WORLD_ANCHORS` routes: nexus `/`, elevate `/elevate`, empower `/empower`, engage `/engage`, learn `/learn`, work `/work`, dialogue `/dialogue`, story `/about`, archive `/archive`. No trailing slashes. Never link to `/my-work`.
2. `enterReading(id)` plays the exit, then `navigateTo(route)`. Reading pages are the frontend engineer’s.
3. Return path is `/?at=<id>`. Unknown ids fall back to `/`. On the poster, `at` focuses the matching zone link.
4. `composables/world/world-page-meta.d.ts` adds `world?: { anchor: WorldAnchorId }` to `PageMeta`.
5. Mount at `/` with one `<ClientOnly>` `<WorldShell>` block and `WorldFallbackPoster` as the fallback slot. Only that block in `pages/index.vue`. In `nuxt.config.ts`, only build/vite chunk settings. Do not touch `routeRules`, `vercel.json`, `content/navigation.json`, or the masthead.
6. `WORLD_ZONE_LINKS` (`{ id, label, route }`) is the one list for the poster and for `RmError`, in the order above. Import it from `composables/world/worldRoutes.ts`.

## Bundle

Production `nuxt build`, client files in `.vercel/output/static/_nuxt`, gzip via `zlib.gzipSync` on the raw bytes. Baseline is `main` before this branch. Entry identity is the chunk that contains the preloader boot script. three identity is `WebGLRenderer`.

| Chunk | Baseline gzip | This branch gzip |
|---|---|---|
| Entry | 117,695 (`-8p0wQ1B.js`) | 117,915 (`kUTJGD6C.js`) |
| three runtime (not in the entry) | 127,424 (`Ciht68m6.js`) | 128,587 (`oGQMYxLQ.js`) |
| `/lab/world` route record | — | 500 (`D2rjDfgU.js`) |
| World UI (poster, sheet, tier store) | — | 9,212 (`qa_3-clb.js`) |
| World engine, shaders, GSAP | — | 33,401 (`P_YivIYb.js`) |

The entry does not contain `WebGLRenderer`, `Satya Space`, or GSAP. Its only reference to the lab route is `import("./D2rjDfgU.js")` inside the `/lab/world` route record. three appears in the entry’s filename map because Stack and Backdrop3d already use that shared chunk; the source is not in the entry.

`mountWorld` is a dynamic `import()` after the tier check. Tier 0 does not call it. Loading the engine preloads the three chunk at that moment, not at app boot.

A first visit that actually starts WebGL downloads about **171.7 KB gzip** that the entry does not include: 500 + 9,212 + 33,401 + 128,587. That is under the spec’s 180 KB incremental budget, and almost all of it is three. The world-only files are about **43 KB gzip**. The three chunk grew **1.2 KB gzip** because this scene uses a few more classes than Backdrop3d. `Backdrop3d.vue` still does `import * as THREE from 'three'`, which keeps that shared chunk from tree-shaking. This spike does not edit that file.

GSAP was not in the client build before. It now lives in the engine chunk.

## Frame rate

**Measured** in headless Chrome (`/usr/bin/google-chrome`), SwiftShader (`--use-angle=swiftshader`), `requestAnimationFrame` deltas after 8 warmup frames. Tiers were forced with `?tier=` so the probe would not collapse the run. 16.7 ms is the 60 Hz cap. Faster than 60 cannot show up.

| Run | Avg ms | Median ms | Avg fps |
|---|---|---|---|
| Tier 0, 1280×800 | 16.66 | 16.7 | 60 |
| Tier 1, 1280×800 | 16.67 | 16.7 | 60 |
| Tier 2, 1280×800 | 16.67 | 16.7 | 60 |
| Tier 3, 1280×800 | 29.8 | 33.3 | 33.5 |
| Tier 1, CPU ×4 | 16.66 | 16.7 | 60 |
| Tier 2, CPU ×4 | 16.67 | 16.7 | 60 |
| Tier 3, CPU ×4 | 35.7 | 33.4 | 28 |

Tier 1 and Tier 2 still hit the cap under 4× CPU throttle, so the CPU is not the limiter for this scene on this machine. Tier 3 misses the cap. The extra cost is the bloom chain. Treat **~30 fps on Tier 3** as a measured SwiftShader number, not a phone number. A real GPU will not match SwiftShader in either direction: the bloom may be cheaper, and a 1.5× DPR phone may be more expensive.

Also measured: with `deviceScaleFactor: 3`, Tier 1 applies DPR 1 (canvas width 390 on a 390 CSS layout) and Tier 2 and 3 apply DPR 1.5 (canvas width 585).

**Not measured:** a physical phone, Safari, thermal throttling, a discrete GPU, or Tier 3 at DPR 1.5 on anything but SwiftShader. The 4× CPU throttle did not emulate a mobile GPU.

Devices still to test:

- iPhone 13 or 15, Safari. Gyro permission, backgrounding (context loss), and `hardwareConcurrency` (often 4, which the spec maps to Tier 1).
- iPhone SE or another small phone.
- Pixel 7 and a 4 GB Android with Mali or Adreno, including Save-Data.
- MacBook Air, and a Windows laptop on Intel integrated graphics.
- One discrete-GPU desktop with Quality: High, to see if Tier 3 holds 60.

## Risks

- **Tier 3 bloom is the frame-rate risk.** It is the only tier that missed 60 here. Keep it off phones. The spec already says Tier 3 is a desktop opt-in. Do not add `EffectComposer` bloom on top.
- **`hardwareConcurrency <= 4` forces Tier 1.** Many current phones report 4 cores and will never see Tier 2 fog or standard materials, even when the GPU could hold 60. The “default modern phone is Tier 2” line and the core-count rule disagree. Revisit before the shell ships, or flagship phones will look like the lite scene.
- **The 180 KB budget is almost entirely three.** Further geometry will not move that number. Tree-shaking Backdrop3d’s namespace import will. A three upgrade to take current `postprocessing` will.
- **Workbox precaches every JS file.** The lab chunks will be downloaded for every install until the shell excludes them or the world is the actual entry experience and the budget is accepted.
- **Shadow maps.** Spec Tier 2 allows a simple shadow or baked AO. Real-time shadows are the usual way to miss 60 on a phone. The spike uses contact discs.
- **Portrait framing.** A vertical field of view hides the side zones. The spike pulls the camera back when the aspect is under 0.85. The shell should art-direct that, not inherit the factor blindly.
- **Spec §10.5 focuses the poster heading.** The Lead’s context-loss rule focuses the current zone link instead. The spike does the Lead’s rule after a lost context. First paint of Tier 0 does not move focus.
- **Syne** is still an open question in the spec. The lab uses the faces already on the site.
- **No image textures.** When the shell adds them, cap them in the tier table. The spec does not yet.

## Recommendations for the shell

1. Import `WORLD_ZONE_LINKS` from `composables/world/worldRoutes.ts` in `RmError` and the poster. Do not copy the list.
2. Keep one three chunk. Fix the namespace import in `Backdrop3d.vue` when that file is free to edit.
3. Leave post on Tier 3. Revisit Tier 2 grain only after a phone capture shows spare frame time.
4. Gate Tier 3 behind the Quality control even on fast desktops. The probe should still be allowed to drop it.
5. Add `enterReading` and `/?at=` in the shell PR, not as more lab UI.
6. Exclude the world chunks from the precache until `/` is the world, then measure the install again.
