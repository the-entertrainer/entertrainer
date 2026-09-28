# Fever Dream

A locally bundled Three.js kitchen defence game at `/engage/fever`. The old `/engage/squash` route redirects to it.

- Tap twice, swipe across, or hold a brown roach to squash it. Green roaches require a turret.
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

The opening is a skippable blended drop → orbit → impact → pullback. Shot numbers and manifesto copy stay out of the HUD. Gameplay camera eases into close-ups on swipe/green/combo kills, then eases home. Picks always use the home camera. Gameplay does not advance during the intro. Pause/visibility/blur stop the timeline; reduced-motion users get a short transition without camera cuts. The banana is now original tapered geometry with deterministic peel colour and bump textures. Roach shells and the kitchen have generated surface detail. Three Kenney kitchen props remain CC0; the original food-kit banana is retained on disk but no longer loaded.

Acid yellow and magenta accents intentionally follow the specific Fever Dream brief rather than the site's flat editorial art guide. Bounded pools provide red splatter, green ichor and ballistic particles with floor bounce. Haptics use feature detection; browsers without vibration support still get visual feedback. Simulation remains fixed-step; this is not a general-purpose rigid-body or ragdoll system. These original procedural assets are not photogrammetry, and this build should not be described as AAA or indistinguishable from cinematic footage.

The game document suppresses selection, callouts, drag and context menus, captures the active pointer, and cancels holds on lost capture or interruption. Controls use 44px minimum targets, safe-area insets and a fullscreen button with a fallback message. The site iframe grants fullscreen. Quality modes cap pixel ratio at 1 / 1.4 / 2; static kitchen meshes are batched by material and effects are pooled. Film grain is deliberately subtle. Physical iPhone Safari / Android Chrome long-press behaviour, thermal performance and frame budgets remain a device QA requirement.

The smoke suite additionally checks intro completion/pause/skip/reduced motion, splatter, context-menu cancellation and selection CSS. Screenshots are written to `/tmp/fever-title.png`, `/tmp/fever-intro.png`, `/tmp/fever-play.png` and `/tmp/fever-verified.png`.

## Sound, gesture combat and fever rendering

- Two taps or one crossing swipe crush a brown roach. Holding still also works. Segment-based hit detection prevents fast swipes from skipping targets; one swipe can hit each target once. Green armoured roaches still require turrets.
- Damaging tap/swipe hits within 1.1 seconds chain up to 8×. Chains of two or more trigger a 0.72-second emphasis window at 0.32 simulation speed, a small camera move, a combo label, and music filtering. The simulation, damage, deaths and particles slow together. The camera does not move to a new angle while a pointer is held.
- Original roach geometry now has a segmented abdomen, split elytra, pronotum, head, fine antennae, spined articulated legs and rear cerci. Damage opens the wing covers, reveals wet tissue, and adds shell fissures; pooled models reset on respawn. These are procedural models, not scanned assets or skeletal ragdolls.
- Room materials and splatter receive time-varying vertex deformation. Shadow depth materials receive the same deformation. Floor movement is deliberately small to preserve touch targeting. Material colours drift; impact intensity drives stronger fringe and colour effects. Room geometry has subdivisions for bending.
- PBR environment reflections supplement directional shadows, animated light intensity and existing depth-clipped volumetric scattering. A quarter-resolution, separable bright-pass bloom feeds the composite with chromatic fringe, gentle UV distortion and film grain. Low graphics mode skips bloom. No high-frequency strobe is used.
- The FX panel contains independent Music, SFX, Dream and quality controls. All main toolbar targets remain at least 44px and fit above the HUD at 320px width. Dream OFF disables camera emphasis, time dilation and morph/fringe motion; system reduced-motion also disables them. Static bloom and lighting remain.
- “Clocktower” by symphony is the independently licensed CC0 soundtrack. Recorded burnt-toast and cucumber crunches by cogitollc replace synthesized impact beeps. The soundtrack streams locally after the first play gesture, without decoding the full track into memory. Four short PCM WAVs are decoded once, layered with bounded voices, pitch variation and stereo panning. Pause/blur/hidden-tab stops audio. Music and SFX can be muted independently. Exact source URLs, CC0 declarations, modifications and hashes are in `public/fever/audio/CREDITS.md` and `manifest.json`; player-facing credits are linked from the menu.
- The supplied YouTube reference was identified as “The Spire” by The Watchers, but no redistribution permission was located. It is not shipped. No exact musical similarity to “Clocktower” is claimed.

Verification: `node scripts/fever-combat-test.mjs` covers swipe segment geometry and combo expiry. `scripts/fever-smoke.mjs` additionally exercises actual touch taps/swipes, damage/combos/slow motion, decoded recordings, music start/mute/pause, independent SFX, Dream OFF, reduced motion and 44px toolbar geometry. The test browser uses software WebGL, so it does not establish physical-phone FPS, thermal behaviour or Safari audio policy compliance.
