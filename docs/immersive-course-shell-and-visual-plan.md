# Immersive Course Shell and Visual Plan

## Shared player contract

Both learning routes will be rendered in a `course-only` application mode. The standard Entertrainer masthead and footer will not mount. A course player has a single top bar containing a return control, the course name, progress, and a compact contents control. The active learning screen fills the available viewport beneath that bar, with its own direct task controls. There is no global footer in the learning session.

The desktop player uses a full-height stage with a comfortable maximum reading measure. Mobile uses the same chrome at a safe top offset, one visible primary action, and enough bottom padding for device affordances. Back navigation remains available but does not create a visually separate footer. All movement is limited to opacity and transform, and it becomes immediate under reduced-motion preferences.

## Asset coverage plan

Every generated image is text-free and has a distinct instructional purpose. Each appears at most once in a learning route. Real photographs and licensed historical evidence remain where documentary truth matters; original art is used for invisible concepts such as prediction context, design decisions, and evaluation loops.

| Route | Asset | Screen or lesson placement | Visual job |
|---|---|---|---|
| AI | Early-computing bench | History evidence | Humanise the field’s longer history. |
| AI | Context-window desk | Prediction explanation | Show information that remains available while the next token is estimated. |
| AI | Signal board | Input/output activity | Make the data-to-decision path concrete. |
| AI | Multimodal field kit | Modern AI lesson | Make different data forms distinct before naming model capabilities. |
| AI | Evaluation worktable | Evaluation lesson | Give representative tests and review a physical visual anchor. |
| AI | Responsible-use checkpoint | Responsible-use lesson | Signpost permission, privacy, human review, and escalation. |
| Instructional design | Learner route objects | Objectives | Link task, learner, practice, and evidence. |
| Instructional design | Performance-gap field | Cause check | Help learners see why a request is not automatically a course. |
| Instructional design | ADDIE workbench | Planning map | Translate ADDIE from labels into work artefacts. |
| Instructional design | Task-trail card | Route Builder | Give the mini-game one clear practical setting. |
| Instructional design | Storyboard evidence loop | Alignment and close | Connect objective, practice, evidence, and revision. |

## Acceptance criteria

The public footer must be absent on both learning URLs. Each course must retain an operational top bar and active-screen navigation. Each listed visual must be published to the durable course CDN before it is referenced. Each visual needs descriptive alternative text and a caption which identifies the learner-facing takeaway. Screens must remain compact, visual assets must not be repeated, and the course must build successfully for the Vercel target.
