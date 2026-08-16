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

## Scroll-reset and release check: 16 August 2026

The course navigation now centralises screen changes through a scroll-reset helper. From the objectives screen, the reading pane was scrolled to the bottom of the long Course at a glance table before activating **Continue to Lesson 1**. Lesson 01 then opened with its banner and first reading paragraph at the top of the viewport, confirming that the prior reading position was not retained.

The handoff release build completed successfully with `NODE_OPTIONS=--max-old-space-size=1536 npm run build`. Nuxt compiled the client and server bundles, generated the Vercel prebuilt output, and finished with `Build complete!`.

At `375 × 812`, the settled mobile course cover retained the two-row masthead, visible hamburger control, black Entertrainer mark, readable course title, white pill-shaped Start course action, 95-minute duration, and long-form introduction without horizontal clipping.

## Comprehensive Rise block validation: 16 August 2026

The rebuilt course compiled successfully with `NODE_OPTIONS=--max-old-space-size=1536 npm run build`. Nuxt completed the client and server bundles, PWA output, and Vercel prebuilt functions with `Build complete!`.

In the browser, the history lesson displayed the new full-width banner, learner-paced four-frame image carousel, editorial history visual, interactive timeline, and chronological ordering activity in one readable sequence. Activating the carousel’s next control moved from **Questions** to **Rules**, updated its frame count, and left the timeline and other lesson controls stable.

The Prediction engine lesson displayed the new audio-readout control, plain-language code snippet, qualitative line chart, existing cumulative prediction simulation, and a fill-in-the-blank question-bank prompt. Entering **token** and selecting **Check answer** returned the expected immediate explanation without changing the prediction-lab choices or the surrounding lesson flow.

The modern-AI and responsible-use lessons rendered the new visual-first family grid, model grid and card stack, quote-on-image treatment, capability boundary route, quote carousel, qualitative chart treatments, resource attachment, external-source embed link, and existing scenario without a client error. The browser console contained only Nuxt’s pre-existing Suspense informational notice.

At `375 × 812`, the course retained its responsive header, hamburger navigation, blue cover, Start course control, readable body copy, and no horizontal clipping. The new mobile rules collapse comparison, process, grid, chart, resource, and recall blocks into readable single-column or two-column arrangements as appropriate.

## Rise-fidelity rebuild validation: 16 August 2026

After a clean Nuxt development-server restart, the course loaded with the revised image-led cover rather than the former blue gradient card. The cover now places the title over a contrast overlay on the existing editorial course image, uses one restrained white action, and keeps the explanatory reading canvas separate from the cover.

The Prediction engine screen confirmed the revised hierarchy: a shallow pale-blue lesson header, immediate readable paragraphs, a quiet left-rule learning-objective note, and no card framing around ordinary explanation. The previous page-wide repeated shadow and high-radius surface pattern is no longer visible in the primary reading flow.

The Learning patterns process was tested through its third step. It now presents a compact, learner-paced control rail (`Examples`, `Pattern`, `New request`), one focused content panel, visible `3 of 3` progress, and deliberately simple Previous/Next controls. This replaces the former all-at-once process-card row and behaves as a genuine sequential interaction.

The settled `375 × 812` mobile capture confirmed that the full-width cover image keeps the title and action readable over the dark overlay; the masthead, compact course-menu trigger, reading column, and source content remain within the viewport without horizontal clipping. The browser console contained only Nuxt’s existing Suspense informational notice and no client-side error from the revised shell or process interaction.

## History-banner contrast correction: 16 August 2026

The user correctly identified that the light-blue history banner inherited the older white-on-blue text rule and was unreadable on mobile. The banner now explicitly applies dark ink to its heading and muted dark text to its supporting paragraph while retaining the pale-blue background. In the live course, computed values were `rgb(237, 244, 251)` for the background, `rgb(27, 31, 38)` for the heading, and `rgb(93, 102, 115)` for the supporting text. A direct browser inspection of the affected Lesson 1 block confirmed that the complete message is visibly readable.
