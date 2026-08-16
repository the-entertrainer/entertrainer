# Rise 360 Fidelity Study

## Research basis

The immediate course reference stalled behind an empty client-side loader in this environment, so this study combines the supplied Rise block screenshots with current official Articulate documentation. It does **not** infer behaviour from generic e-learning styles.

Articulate describes Rise as a modular system of media, text, and interactive blocks that automatically adapts to device and orientation. The current theme controls specify cover image and overlay, sidebar/compact/overlay navigation, button style, lesson header layout, one unifying theme colour and tint, font pairings, and optional non-text block entrance animation. [1] [2]

> Rise’s default is not a gallery of custom cards. It is a restrained course shell where a small number of theme decisions establish consistent cover, header, navigation, accent, and block rhythm.

## What makes Rise feel modern

| Dimension | Rise behaviour to reproduce | Current course issue to correct |
|---|---|---|
| Course shell | One theme colour with a lighter tint; calm white reading surface; one cover image with contrast overlay; compact and predictable navigation. | Too many bespoke blue panels, shadows, gradients, and card variants compete with the lesson content. |
| Typography | Deliberate header/body pairing, clear hierarchy, generous line-height, and minimal display styling. | Headings, eyebrow labels, caps, and block titles appear too frequently and make the page feel component-demo-like. |
| Block rhythm | Full-width, white or quietly tinted blocks separated by vertical breathing room; background variation only when it supports grouping. | Nearly every block currently gains a shadow, rounded card, or decorative treatment, producing visual noise. |
| Images | Image, caption, and overlay treatments preserve legibility; imagery carries a single instructional job. | Generated visuals and abstract shapes sometimes compete with the explanation instead of supporting it. |
| Motion | Non-text blocks enter smoothly on scroll; motion is optional, discreet, and never a parallel visual spectacle. [1] | Current reveals are too generic and the many bespoke interactions imply animation without sharing a single physical language. |
| Process and carousel | One media-rich step at a time; visible slide controls; a beginning and end; clean control focus. [3] | The current process is displayed as an all-at-once static card row, which is not the Rise process interaction. |
| Responsiveness | Same authored content reflows, rather than merely shrinking the desktop design. [2] | Current mobile rules compress multiple desktop card patterns but do not consistently simplify the visual sequence. |
| Accessibility | Native keyboard controls, visible focus, image purpose in alt text, captions/transcripts for video, contrast checks, and motion respect. [3] [4] | Some custom blocks need a single focus model, less duplicated labelling, and a reduction in decorative, non-semantic icons. |

## Non-negotiable rebuild rules

The fidelity rebuild will remove the component-showcase appearance. A lesson will default to a reading canvas with plain headings, paragraphs, an occasional full-width media block, and **one** interaction or comparison at the moment it teaches something. A block earns a surface treatment only when it needs to be perceived as an interactive control.

The new course system will use a single blue theme colour and one pale tint, low or no ambient shadow, modest corner rounding, quiet dividers, and one consistent navigation treatment. Process, carousel, flashcard, and timeline blocks will be rebuilt as learner-paced native interactions rather than static grids masquerading as those interactions.

All non-text entrance motion will share one short opacity-and-translate transition, will not animate text paragraphs, and will turn off under `prefers-reduced-motion`. Keyboard order will follow the usable controls first for carousel-like interactions, in line with Articulate’s documented process-block behaviour. [3]

## Current course audit

The current course has the right content and many functional interactions, but it looks custom-built rather than Rise-authored. The issue is not the use of visuals; it is that too many visuals are framed as separate products.

| Current treatment | Why it reads as dated or non-native | Fidelity rebuild action |
|---|---|---|
| Every non-text section appears as a high-radius card with a shadow. | Rise relies more on whitespace, quiet surfaces, and block-level background variation than repeated floating cards. | Remove the default shadow and apply a low-contrast surface only to controls that need containment. |
| Gradient cover, gradient context panel, heavily styled banner, card grids, chart boxes, and decorative abstract icon tiles coexist. | Each block has a separate visual dialect; the learner cannot perceive one coherent theme. | Restrict the course to one cover treatment, one pale accent tint, white media blocks, and simple control states. |
| Headers use very heavy black type, an underline bar, large blue banners, eyebrow labels, and title treatments on nearly every block. | Repeated display treatment creates density rather than hierarchy. | Keep the lesson header as the singular display moment; use regular headings and sentence-case labels inside the reading flow. |
| Process is currently rendered as three visible cards. | The official pattern is a learner-paced media carousel with introduction, controls, sequential steps, and a completion state. | Rebuild it as an actual one-step-at-a-time carousel with consistent controls and focus order. |
| Carousel, quote carousel, flashcard stack, timeline, and process each invent their own control styling. | The variety reads as separate widgets, not one authoring system. | Introduce one shared “Rise control rail”: slim previous/next buttons, small count, dot indicator, and clear disabled state. |
| Dense diagrams use arrows, pills, grids, and text simultaneously. | They ask the learner to decode a graphic system rather than see a single concept. | Replace each with one plainly labelled visual relationship or a media block; preserve detailed explanation in surrounding prose or accordions. |
| Scroll reveal targets every reading item. | Rise animates non-text blocks; paragraph-by-paragraph motion looks like a presentation template. | Limit reveal animation to media and interactive blocks, with a short vertical movement and no custom easing spectacle. |
| Multiple interactions appear in a single lesson without a visibly calm transition. | Even valid activities can feel like an interface demo when their surfaces and labels demand attention. | Use quiet dividers and plain instructional lead-ins; keep only the learning activity that advances the lesson’s primary idea on the default path. |

## Fidelity specification

| System area | Rebuild specification |
|---|---|
| Theme tokens | One Entertrainer blue `#2F6FB3`, a pale blue tint, white canvas, quiet cool-grey rule, dark neutral text, and one muted body colour. Remove gradients other than the cover-image overlay. |
| Typography | Use **Nunito Sans** with 700 for lesson title, 700 for H2, 600 for controls, and 400–600 for body. Delete all 900-weight “poster” headings and almost all uppercase labels. |
| Geometry | Default blocks have no corner radius. Interactive/media blocks use a restrained 2–4px radius and 1px border. Shadows are removed except for the navigation drawer. |
| Cover and header | Retain the image-led cover but use an image with a dark transparent overlay, title aligned to the lower-left, and one white Start button. Lesson headers become a shallow pale-blue strip with lesson count and simple title rather than a large display card. |
| Content width | Maintain a 720–760px readable column. Use full-width media within that column and 56–72px vertical separation between conceptual sections. |
| Surface hierarchy | Default explanatory content stays on the white canvas. Notes use a pale tint and a left rule. Interactions use a thin border and a single, clearly delimited surface. |
| Controls | Use one common control row for process, carousel, flashcard stack, and quote carousel: small text buttons, muted disabled state, current step count, and simple dots. Selected choices receive a 2px accent border, not a fill-plus-shadow-plus-transform combination. |
| Process and timeline | Rebuild both as one active panel with a compact labelled control rail. Do not show all steps as cards. Use direct jump controls where a learner benefits from selecting a step. |
| Motion | Use a 180–220ms opacity and `translateY(8px)` entrance only for media and interactive surfaces. Text appears immediately. Drawer uses a 220ms transform. Controls use a 120ms background/border transition. Honour reduced motion. |
| Responsive behaviour | On narrow screens, preserve the same reading order, simplify grids to one column, move control rails below their active panel, and retain fixed tap targets of at least 40px. Do not reduce font size below readable body scale. |

## References

[1]: https://www.articulatesupport.com/article/Rise-360-Personalize-the-Theme "Rise 360: Modifying Appearance and Navigation — Articulate Support"

[2]: https://www.articulatesupport.com/article/Rise-Courses-Use-Responsive-Design "Rise 360 Courses Use Responsive Design — Articulate Support"

[3]: https://www.articulatesupport.com/article/Rise-How-to-Use-Process-Blocks "Using Process Blocks — Articulate Support"

[4]: https://www.articulatesupport.com/article/Rise-360-Choosing-Accessible-Components-to-Create-Online-Learning "Rise 360: Choosing Accessible Components to Create Online Learning — Articulate Support"
