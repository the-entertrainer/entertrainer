# From No AI to Know AI — Validation Notes

## Browser check: 15 August 2026

The local Nuxt route at `/courses/ai-atlas` loaded successfully. The opening screen showed the revised **From No AI to Know AI** title, 95-minute duration, seven lesson names, knowledge check, and summary. The objectives screen loaded correctly after starting the course and displayed the intended reading-first guidance and three revised learning objectives.

The current browser run will continue with the prediction lesson, generated visuals, knowledge check, and course summary.

## Prediction lesson check

Lesson 04 loaded with its reading sequence before the interaction: introduction, learning objective, two explanatory sections, a prediction diagram, worked example, and a viewing question. The three-step prediction lab appeared after that content. Its first prompt offered a clearly selectable response and a submit control; the selected state was visible before submission.

Submitting the first response produced a context-specific explanation and a clear continuation control. Moving to step two changed the sentence to the museum-and-flooding context and reset the choice and submit state as intended.

## Media check

Lesson 01 loaded its historical editorial timeline from the stable CDN URL. Browser inspection confirmed a completed image load at 2560 × 1440 source dimensions, rendered at 780 × 438.75 within the reading canvas. The image uses a deliberately quiet off-white background, so the lesson caption remains useful for orienting the learner to its purpose.

Lesson 06 loaded the modern-model illustration successfully from its stable CDN URL. Browser inspection confirmed a completed 2560 × 1440 source image, rendered at 780 × 439 within the reading canvas, immediately after the capability-and-evaluation example it supports.

## Assessment check

The knowledge check opened as a six-question sequence and began with the revised AI-history misconception item. Its prompt, three selectable answers, and submit state were visible; choosing the correct historical statement visibly selected the expected radio control.

Submitting the answer displayed the expected historical explanation and exposed the next-question control. The final summary loaded with the revised origin-to-judgement narrative, three practical takeaways, and the three-field responsible-use plan.

Filling all three plan fields enabled the completion control. Submitting the local plan displayed the course-completed confirmation and restart control, confirming that the final completion gate works.

## Final simulation refinement check

The local validation progress record was cleared after the completion test. A clean reload returned correctly to the unstarted course overview, ready to validate the refined cumulative prediction sequence without retaining test activity.

The refined prediction lab now presents a single service-update sentence. Its first prompt, “Heavy rain has flooded the …”, offered the context-appropriate continuation “tracks” and introduced the explicit instruction that each predicted token will become part of the next context.

Submitting “tracks” displayed both explanatory feedback and a visible generated-text readout. Advancing to step two then carried that token into the prompt: “Heavy rain has flooded the tracks, so the next train will be …”, confirming the intended cumulative consequence.
