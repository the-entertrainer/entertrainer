# Motion-Graphics Preloader QA

## Skill application

The project now includes the LottieFiles `motion-design` skill under `.agents/skills/motion-design`. The preloader follows its loading-state and choreography guidance: the paper card is the primary hero, pencil/highlight/note card are staggered secondary motion, and background dots provide a non-looping ambient layer. The scene uses premium paper-material timing and directional easing rather than linear movement.

## Visibility lifecycle

Nuxt removes the static SPA template when Vue mounts. To prevent that handoff from making the preloader imperceptible, a mounted `EdPreloader` overlay now starts immediately in the application shell, remains visible for 1.42 seconds, then fades out over 360ms. The static pre-boot template and mounted component both show the paper-card hero from their literal first frame, avoiding an empty white start on slower or mobile startup paths.

## Validation

Desktop browser review confirmed the overlay is visible after app mounting and then hands off cleanly to the homepage. A true 375px first-frame capture showed the paper card, highlighter, note, pencil, and wordmark fully contained and visibly staged rather than a blank white viewport. Reduced-motion users receive the completed composition with a 140ms hold and a 100ms fade. The Nuxt/Vercel production build completed successfully; the existing chunk-size advisory remains unchanged.
