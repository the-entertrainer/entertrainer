# Comfortable Course Pacing and Graceful Motion QA

## Chunking and controls

The AI course was reduced from 31 to 24 screens by pairing each core explanation with its most useful visual or evidence. Activities, short videos, simulations, and final checks remain separate where a learner needs an uninterrupted decision or reflection. The instructional-design course was reduced from 17 to 13 screens by pairing the request with the definition, ADDIE map with the explorer, alignment with its objective check, and artefacts with the artefact decision.

Both players now show plain **Back** and **Continue** controls in their compact top bars. Forward controls no longer name a destination or contain an arrow glyph. When an activity must be completed, a separate learner-facing status explains the requirement; the control itself remains **Continue**.

## Visual and motion review

The 375px mobile captures showed the ID player’s welcome screen and the AI player’s welcome screen with clear full-width Continue controls, top-bar Back/Continue controls, no horizontal overflow, and compact screen counts of 13 and 24 respectively. The merged ADDIE screen was also checked directly: the explanation, visual workbench, and active stage output fit within a purposeful single learning screen, with only 24px of content below the desktop viewport.

Global timing is now 120ms for press feedback, 220ms for small interface changes, 420ms for routine transitions, and 700ms for rare arrivals. Course screen content now enters over 560–700ms and direction-aware AI card travel uses 520ms. Reduced-motion rules continue to remove non-essential movement while preserving screen navigation and focus behaviour. The browser console contained only Nuxt’s existing Suspense information message; the production build completed successfully.
