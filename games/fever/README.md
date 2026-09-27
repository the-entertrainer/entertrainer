# Fever Dream

A locally bundled Three.js kitchen defence game at `/engage/fever`. The old `/engage/squash` route redirects to it.

- Hold a brown roach to squash it. Green roaches require a turret.
- Turrets cost 6 coins, overcharge costs 5, and a three-hit shield costs 8.
- Placement can be cancelled without spending coins. A maximum of three turrets can defend the banana.
- Green roaches attack turrets and the two power sockets. Losing both sockets disables turrets.
- Waves escalate every 30 seconds. This is endless survival; banana integrity reaching zero ends the run.
- Pause, tab hiding and loss of focus stop simulation. Best score stays in local storage.

`game.js` owns the scene, fixed-step simulation and touch controls. `volumetric.js` implements depth-clipped world-space single scattering with shadow-map occlusion and three quality settings. This is an actual ray march, not a transparent cone or CSS glow. It is a real-time approximation, not path tracing.

Four Kenney Food Kit CC0 models and their shared colour texture are in `public/fever/models`, with the original licence and credits. The roaches and turret rigs are original animated procedural geometry.

Build with `npm run build:fever`; the normal production build runs this automatically. The generated bundle is committed so static deployments can serve the game without runtime CDN requests. Run `CHROMIUM_EXECUTABLE=/path/to/chromium node scripts/fever-smoke.mjs` for model, shader, control, pause, reward and viewport checks. Netagiri has a separate `scripts/netagiri-smoke.mjs` suite, using `NETAGIRI_BASE_URL` for its running Nuxt server.

Verified in headless Chromium with software WebGL at phone, landscape and desktop sizes. Physical iOS/Android hardware performance and browser-specific behaviour still require device testing.
