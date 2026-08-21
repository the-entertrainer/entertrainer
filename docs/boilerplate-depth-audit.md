# Scaffolding-Level Boilerplate Audit

## Rule applied

Visible text was retained only when it supplies content, a destination, an action, feedback, a state, a source, a date, a legal fact, or an accessibility cue. Text that merely described the page’s composition, praised the work, restated a nearby heading, named a generic format, or padded a transition was removed or made direct.

## Review levels

| Level | Scope | Decision rule | Result |
|---|---|---|---|
| Site shell | Loader, masthead, footer, privacy, theme and skip controls | Keep only brand, destination, legal, accessibility, and state text | Loader support copy removed; footer and link headings made direct. |
| Page structure | Hero captions, section kickers, eyebrow labels, ordinals and closing statements | Remove when the heading, card title, or action already carries the meaning | Homepage layout narration, route ordinals, redundant section labels, and case-study slogan removed. |
| Reusable data | Categories, cards, stamps, descriptions and navigation registry | Remove format labels and rewrite indirect descriptions | Projects and experiment labels made direct; redundant interactive-course stamp removed. |
| Tools and states | Loading, empty, examples, tour, AI, copy, configuration and error language | Keep only operational wording that explains the current task or result | EasyMCQ, Draftly, Glass Lab, and StoryGen labels shortened and made task-specific. |
| Courses | Eyebrows, game prompts, feedback, media captions, progress and sources | Preserve instructional meaning, evidence, and learner state; remove filler only | Direct labels retained where they guide learning; redundant closing narration and generic labels removed in the prior audit pass. |
| Experiments and archive pages | Experimental naming, long style descriptions and presentation numbering | Keep destination names and short factual context only | Experiment index reduced to a title, count, and destination names. |

## Evidence and traceability

The complete independent candidate-level audit is preserved in `docs/boilerplate-scaffolding-audit.json`. The earlier sentence-level inventory and its retain/remove/rewrite decisions are preserved in `docs/plain-language-copy-inventory.md`. These records should be updated whenever a new shared component, course screen, tool state, or data registry is added.

## Remaining editorial practice

Future text should be challenged in this order: does it identify a task, enable an action, explain a result, document a source, or meet an accessibility obligation? If not, remove it. Do not add captions merely to make an image feel explained, and do not use a label where a clear heading or control already communicates the same information.
