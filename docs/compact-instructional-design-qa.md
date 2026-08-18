# Compact Instructional-Design Player — QA Notes

## Initial screen-flow review

The course now opens on **Screen 1 of 17**, showing only the welcome visual and introduction. Continuing moves to an independent objectives screen, then to a distinct case-and-decision screen. The former definition content appears on its own screen with its own visual and continuation control. Previously read content is not mounted underneath the learner’s current screen.

## Gating and activity review

The Lesson 1 case screen withheld its continuation action until the learner selected an answer. After the learner chose the analysis-first answer, concise feedback appeared and the next standalone definition screen became available. The Route Builder was opened directly at **Screen 9 of 17**; it contains only the three-turn activity and its screen controls, not the earlier ADDIE explanation. Its first correct decision produced immediate feedback while keeping the screen-level next action unavailable until the complete route is finished.

## 375px mobile review

A true 375px capture showed the welcome as a single compact screen: stable course chrome, a visible 1-of-17 screen indicator, one hero image, concise title and introduction, and sticky Back/Continue controls. The image, text, and controls stayed inside the mobile canvas without horizontal overflow. The continuation control remains visible at the bottom of the viewport instead of requiring a learner to scroll through the entire course to find the next action.

## Persistence and build validation

The learner’s current standalone Route Builder screen and furthest unlocked screen were confirmed in the compact player’s local saved state. The Nuxt production build for the Vercel target completed successfully after the screen-player rewrite.
