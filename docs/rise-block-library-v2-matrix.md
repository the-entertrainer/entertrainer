# Comprehensive Rise 360 Block Matrix

## Reference inventory

The supplied library contains **60 named block samples** across text, statements, quotes, lists, images, galleries, multimedia, interaction, knowledge-check, chart, and divider categories. The course will reproduce the relevant interaction pattern and visual hierarchy in its own code and Entertrainer styling; it will not copy Articulate assets or branding.

| Category | Supplied block types | Course implementation decision |
|---|---|---|
| Text | Paragraph, heading, subheading, two column, table | Use for concise lead-ins, paired contrasts, and the existing course-at-a-glance table. |
| Statements, notes, quotes, lists | Four statement styles, note, six quote treatments, numbered, checkbox, and bulleted lists | Use as short emphasis, evidence, reflection, and safeguards treatments. |
| Images and gallery | Centred, full-width, image-and-text, text-on-image, banner, carousel, two/three/four-column grids | Use the generated editorial illustrations in all supplied image arrangements and add learner-paced gallery/grid variations where they explain or compare an AI concept. |
| Multimedia | Audio, video, embed, attachment, code snippet | Retain the transformer video; add concise guided audio, embed/resource, attachment, and code-format examples only where an existing course source or learner task supports them. |
| Interactive | Accordion, tabs, labelled graphic, process, scenario, sorting, timeline, flashcard grid/stack, button/stack, Storyline | Implement these as native accessible course controls; use a custom playable prediction lab as the Storyline-equivalent interaction. |
| Knowledge checks | Multiple choice, multiple response, fill in the blank, matching, question bank | Distribute these as low-stakes retrieval moments after instruction while retaining the final six-question knowledge check. |
| Charts and dividers | Bar, line, pie; continue, divider, numbered divider, spacer | Use qualitative charts only where they communicate a comparison; use dividers and continuation consistently to pace the lesson sequence. |

## Initial visual findings

The **image-and-text** sample uses a modest visual block beside a short, narrow caption area. It is suitable for a single conceptual bridge, not a dense explanation. The **carousel** sample uses one image at a time with left/right controls and dot indicators; its job is sequential visual comparison and it should not be used as a decorative image wall.

The implementation will keep these constraints. Learners will see a clear image, a concise supporting interpretation, and a small number of learner-paced gallery controls instead of an automatic or overloaded slideshow.

## Process and timeline findings

The **process** sample presents one focused step card at a time, with a visible step label, arrow controls, and dot progress. The course will use that pattern for causal explanations such as learning from examples and the repeated predictions that create a language-model response. The existing prediction replay already follows this approach and will be aligned visually with the reference.

The **timeline** sample is a vertical chronological sequence with one labelled event card per point in the story. The AI-history lesson will keep its learner-selectable milestone activity while adding a reference-matched vertical timeline treatment for scanning the overall chronology.

## Course implementation map

| Rise block type | Course location | Instructional role |
|---|---|---|
| Paragraph; paragraph with heading; paragraph with subheading; heading; subheading | Every lesson lead-in and the supporting-detail disclosure | Keeps the essential narrative readable, with formal hierarchy rather than large uninterrupted text walls. |
| Two column; table | Lesson 03 rules versus learned patterns; objectives screen; model-comparison screen | Places a small, named contrast or structured comparison side by side. |
| Statement A, B, C, D; note | Lesson bridges, prediction warning, model limitation, final judgement, learning objective | Signals a single conclusion, caution, or learner instruction without pretending it is additional prose. |
| Quote A, B, C, D; quote on image; quote carousel | History lesson, model-evaluation lesson, final summary | Presents selected course takeaways in six distinct evidence/reflection treatments, with text-on-image limited to an original course illustration. |
| Numbered, checkbox, and bulleted list | Task canvas; safeguards scenario; objectives and responsible-use routine | Gives a clear sequence, an active condition check, or a compact scan list. |
| Image centred; full width; image-and-text; text-on-image; banner | Lessons 01–07 and cover transition | Uses course-owned editorial imagery in every documented Rise arrangement: reading aid, scene setting, paired interpretation, brief overlay, and section banner. |
| Carousel; two-, three-, and four-column grid | AI history movements; task inputs; AI family comparison; model-capability gallery | Supports learner-paced visual comparison instead of stacked explanatory paragraphs. |
| Audio; video; embed; attachment; code snippet | Prediction narration; transformer video; source preview; downloadable pre-use checklist; prompt-pattern example | Adds short multimodal reinforcement and usable reference material; media will retain a text equivalent or download alternative. |
| Accordion; tabs; labelled graphic; process | Supporting detail; learning-method comparison; AI-family map; training and prediction sequences | Reveals secondary detail, compares one dimension at a time, labels a visual system, and segments causal steps. |
| Scenario; sorting activity; timeline; flashcard grid; flashcard stack | Responsible-use decision; workflow classification; AI history; task-definition recall; model-capability recall | Gives each interactive type one clear application or retrieval role after its explanation. |
| Button; button stack; Storyline-equivalent prediction lab | Continue transitions; scenario choices; next-token simulation | Makes navigation, constrained choice, and the custom multi-step playable explanation visibly distinct. |
| Multiple choice; multiple response; fill in the blank; matching; draw from question bank | Final quiz; safeguard check; prediction recall; model matching; random low-stakes recap | Adds focused retrieval with immediate feedback while retaining the main course assessment. |
| Bar, line, and pie chart | Pattern strength, AI-history movement, and AI-family input grouping | Uses qualitative, explicitly labelled visual comparisons rather than invented quantitative data. |
| Continue; divider; numbered divider; spacer | Every lesson transition, content break, step sequence, and visual pacing gap | Maintains the underlying Rise lesson rhythm and protects visual grouping. |

## Implementation constraints

The course will not simulate a block merely by naming it. Each mapped pattern will have its own visible treatment and, where Rise supports a learner action, an equivalent keyboard-operable interaction and feedback state. The only exceptions are external media capabilities that cannot be reliably embedded by a third-party provider; these will retain an explicit external-link or downloadable fallback.

## Official reference consulted

Articulate describes Rise interactive blocks as lean-forward interactions including labelled graphics, flashcards, tabs, buttons, and related patterns. The supplied reference images and metadata remain the detailed visual specification. [1]

## References

[1]: https://community.articulate.com/kb/rise-360-essentials/overview-of-interactive-blocks-in-rise-360/1211050 "Overview of Interactive Blocks in Rise 360 — Articulate E-Learning Heroes"
