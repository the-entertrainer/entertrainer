# Fever Dream

A locally bundled Three.js kitchen defence game at `/engage/fever`. The old `/engage/squash` route redirects to it.

- Hold a brown roach to squash it. Green roaches require a turret.
- Turrets cost 6 coins, overcharge costs 5, and a three-hit shield costs 8.
- Placement can be cancelled without spending coins. A maximum of three turrets can defend the banana.
- Green roaches attack turrets and the two power sockets. Losing both sockets disables turrets.
- Waves escalate every 30 seconds. This is endless survival; banana integrity reaching zero ends the run.
- Pause, tab hiding and loss of focus stop simulation. Best score stays in local storage.

`game.js` owns the scene, fixed-step simulation and touch controls. `volumetric.js` implements depth-clipped world-space single scattering with shadow-map occlusion and three quality settings. This is an actual ray march, not a transparent cone or CSS glow. It is a real-time approximation, not path tracing.

Four Kenney Food Kit CC0 source models and their shared colour texture are in `public/fever/models`, with the original licence and credits. The roaches and turret rigs are original animated procedural geometry.

Build with `npm run build:fever`; the normal production build runs this automatically. The generated bundle is committed so static deployments can serve the game without runtime CDN requests. Run `CHROMIUM_EXECUTABLE=/path/to/chromium node scripts/fever-smoke.mjs` for model, shader, control, pause, reward and viewport checks. Netagiri has a separate `scripts/netagiri-smoke.mjs` suite, using `NETAGIRI_BASE_URL` for its running Nuxt server.

Verified in headless Chromium with software WebGL at phone, landscape and desktop sizes. Physical iOS/Android hardware performance and browser-specific behaviour still require device testing.

## Cinematic / mobile pass

The opening is a skippable four-shot Three.js timeline: drop, slow orbit, impact with damped bounce, and pullback into the arena. Gameplay does not advance during the intro. Pause/visibility/blur stop the timeline; reduced-motion users get a short transition without camera cuts. The banana is now original tapered geometry with deterministic peel colour and bump textures. Roach shells and the kitchen have generated surface detail. Three Kenney kitchen props remain CC0; the original food-kit banana is retained on disk but no longer loaded.

Acid yellow and magenta accents intentionally follow the specific Fever Dream brief rather than the site's flat editorial art guide. Bounded pools provide red splatter, green ichor and ballistic particles with floor bounce. Haptics use feature detection; browsers without vibration support still get visual feedback. Simulation remains fixed-step; this is not a general-purpose rigid-body or ragdoll system. These original procedural assets are not photogrammetry, and this build should not be described as AAA or indistinguishable from cinematic footage.

The game document suppresses selection, callouts, drag and context menus, captures the active pointer, and cancels holds on lost capture or interruption. Controls use 44px minimum targets, safe-area insets and a fullscreen button with a fallback message. The site iframe grants fullscreen. Quality modes cap pixel ratio at 1 / 1.4 / 2; static kitchen meshes are batched by material and effects are pooled. Film grain is deliberately subtle. Physical iPhone Safari / Android Chrome long-press behaviour, thermal performance and frame budgets remain a device QA requirement.

The smoke suite additionally checks intro completion/pause/skip/reduced motion, splatter, context-menu cancellation and selection CSS. Screenshots are written to `/tmp/fever-title.png`, `/tmp/fever-intro.png`, `/tmp/fever-play.png` and `/tmp/fever-verified.png`.
