# AI Video Evidence and Card-Stack QA

## Direct course-flow checks

The compact AI course was opened on its existing Astrobee context screen and advanced through the learner-facing Continue action. The new **Watch Astrobee** screen replaced the previous card in place. It displayed the 1:32 IEEE Spectrum embed with NASA footage, the learner viewing prompt, external YouTube link, source label, reflection question, caveat, and a clearly labelled continuation to the input-detective screen.

The page focus moved to the short-video screen heading, and the route wrapper reported the `ai-screen-stack--forward` state. The top-bar Previous action returned to the Astrobee context screen, restored focus to its heading, and set the mirrored `ai-screen-stack--backward` state.

The Code.org **Watch a pattern become a prediction** screen was also opened directly. The 2:55 video embedded successfully, showed its source and duration, included the planned viewing prompt and post-video reflection, and retained a clear continuation to the next-token screen.

## Accessibility contract verified in implementation

The screen transition keeps one accessible current screen in the DOM. The transition layer uses visual stack treatment only; it does not introduce a duplicate focusable card. The current screen heading remains the focus target after navigation. `prefers-reduced-motion: reduce` removes both forward and backward transition durations while retaining the course navigation and focus handoff.

## Mobile, console, and build validation

At a true 375px viewport, the compact player kept its course-only top chrome, full-width continuation control, and focused screen card within the viewport with no horizontal overflow. The browser console showed only Nuxt’s existing Suspense information note after the video integration; no client-side error was reported. The Nuxt/Vercel production build completed successfully. The existing chunk-size advisory remains unchanged.
