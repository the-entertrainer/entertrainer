# Shared Course Progression QA

## Initial learner-path check

The instructional-design module initially exposes only its course hero and a light-blue locked preview for the objectives. The first continuation reveals the objectives block, updates progress to 9%, and keeps all later lesson-path controls disabled. Completing the objectives reveals Lesson 1; selecting the first knowledge-check response gives immediate feedback, and its continuation reveals the definition block. The progress path, blue active border, green completion border, current-block label, and locked-next-block card all render in the intended instructional hierarchy.

The AI course initially exposes its cover and a locked content path. Starting the course opens the objectives screen. Completing its existing objective continuation opens Lesson 1 only; Lesson 1 initially displays **Block 1 of 3** and the locked preview. Completing that block reveals the evidence-and-example block, while the practice-and-connection block remains locked. The in-course state is therefore sequential at both the lesson and block levels.

The first AI lesson’s three labels were verified and corrected to remain stable as more content becomes visible: **Core idea**, **Evidence and example**, and **Practice and connection**. Its existing history timeline and ordering activity remain functional in the final block. The browser console reports no client-side errors; it contains only Nuxt’s standard development Suspense notice.

True 375-pixel captures confirm that both course covers retain their existing mobile reading hierarchy. The instructional-design course preserves its real-image cover, short module label, large introductory title, and calm starting canvas. The AI course preserves its image-led Rise-style cover, direct course title, start control, and readable summary. Neither initial mobile view has horizontal clipping or reduced-contrast progression chrome.

## Persistence and navigation checks

After a local server restart, the instructional-design module restored the learner at Block 4, with its progress value and later lesson-path controls preserved. The AI course restored the learner at Lesson 1, Block 3. Its stored state records `highestUnlocked: 1` and the completed stages for the first lesson; Objectives and Lesson 1 remain enabled, while all subsequent lessons, the knowledge check, the bonus activity, and the summary are disabled. This confirms that a learner can review completed work but cannot bypass an unavailable lesson.

Both course systems use native buttons for continuation and disabled states, retain textual lock explanations in the reading order, show visible progress values, and include reduced-motion overrides for their small unlock reveal. The shared production build completed successfully.
