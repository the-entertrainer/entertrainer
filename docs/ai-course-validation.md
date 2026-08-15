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

## Rise-inspired block expansion check

The updated course loaded from a clean `v9` progress state. Lesson 01 presented the new four-event timeline after its history prose, worked example, and supporting visual. Its four labelled milestone controls and the opening 1950 panel rendered successfully within the existing Rise-style reading canvas.

Lesson 02 presented the compact three-card retrieval pause after the practical definition and travel-time example. Selecting the **Task** card revealed the intended explanation in place while the remaining cards stayed compact, preserving the learner’s focus on one concept at a time.

Lesson 03 rendered the three-panel rules-versus-patterns-versus-next-token comparison after the worked example. Selecting **Learned patterns** replaced only the focused panel explanation and example, while the comparison labels and conclusion remained stable.

Lesson 05 rendered the three-step sorting game after its workflow example. The initial item, a damaged-parcel photograph, offered the expected input/output/evaluation categories; selecting **Input** activated the intended choice state before submission.

Submitting **Input** provided the expected explanation and a clearly labelled next-item control. Lesson 06 then rendered its first model-matching prompt after the capability explanation and model-landscape visual, with three compact documented-model choices.

Lesson 07 rendered the responsible-use scenario after the four-question routine and worked example. Selecting and submitting the approved-tool and personal-information option produced the intended contextual feedback, then revealed a four-option “select all safeguards” retrieval check. This preserves a single nested decision sequence rather than placing a second unrelated interaction in the lesson.

The first two safeguard selections each showed the expected visible check state. The interaction is tap-first rather than drag-dependent and leaves the incorrect confidence-as-proof statement visibly available for comparison.

Selecting the third required safeguard and submitting the set returned the intended completion message: safe inputs, evidence checks, and named accountability work together, while confident wording is not proof. The final scenario sequence therefore completed without a navigation or state error.

The model-matching game was also re-opened after the scenario check. Selecting **Gemini** activated the intended choice state for the public multimodal-capability description, confirming that selection logic is independent across the lesson blocks.

Submitting the Gemini match produced the expected capability explanation and next-capability control. The browser console showed no client-side runtime error after the expanded interaction sequence; it reported only Nuxt’s existing Suspense informational notice.
