# Rise 360 Block Library Study

## Scope and method

This reference study inventories the supplied Rise 360 block images and maps each visual pattern to an instructional role in **From No AI to Know AI**. The goal is not to reproduce every block. The goal is to use a small, defensible set of patterns that reduces unnecessary visual search, segments complex material, and creates retrieval practice only after an explanation.

## Observed visual system

The supplied library uses spacious white canvases, a narrow content column, restrained dividers, and a small number of attention signals. Interaction chrome is quieter than the learning content. The visual hierarchy is created through placement, typographic contrast, and one locally meaningful accent rather than repeated cards or decorative colours.

## Initial inventory findings

| Block family | Observed pattern | Appropriate learning role | Course decision |
| --- | --- | --- | --- |
| Text blocks | Paragraphs, heading-plus-paragraph, subheading-plus-paragraph, two-column comparison, and a compact table use a generous, low-chrome reading surface. | Explain one connected idea; compare a tightly related pair; show a compact factual contrast. | Retain the existing reading-first rhythm. Add two-column comparisons only where learners need to contrast two mechanisms, not as general layout decoration. |
| Statement blocks | Four text-emphasis treatments and a compact note use contrast and isolation to signal a single claim, caution, or transition. | Signal an essential proposition, misconception correction, or instruction that learners should keep active. | Use a restrained statement block after the history misconception and a note block before high-stakes responsible-use guidance. Do not use statements as substitute paragraphs. |

The text and statement references confirm that **segmentation should be semantic, not decorative**. Each heading or emphasis block must help learners identify the role of the next information rather than interrupt the narrative.

| Block family | Observed pattern | Appropriate learning role | Course decision |
| --- | --- | --- | --- |
| Quote blocks | Plain, portrait-supported, image-overlay, and carousel variants are all centred on a short attributed perspective. | Add a credible voice or a learner perspective when the source itself materially advances the point. | Avoid simulated learner quotes or unverified testimonials. Use a short, attributed historical quotation only when a primary source directly supports it. |
| List blocks | Numbered, checkbox, and bulleted lists use a single repeated marker and generous vertical rhythm. | Present fixed-order procedures, a learner self-check, or a small set of parallel conditions. | Use the numbered style for the responsible-use routine; reserve checkbox affordances for learner-controlled review rather than presenting every list as a task. |

The quote family is deliberately **not** a generic engagement device. The list family is most useful when it allows learners to preserve a small decision sequence in working memory; it should not duplicate prose already read.

| Block family | Observed pattern | Appropriate learning role | Course decision |
| --- | --- | --- | --- |
| Image blocks | Centred, full-width, text-and-image, text-overlay, and banner variants give a visual one clear spatial role. | Establish context, anchor a difficult concept, or support a closely related explanation. | Keep the history timeline and model-landscape visuals. Add only image-and-text treatment for a labelled worked example where the image itself carries meaning. Avoid text-over-image unless contrast and reading order are guaranteed. |
| Gallery blocks | Carousel and two-, three-, and four-column grids show multiple images with very limited framing. | Compare a small, mutually relevant set of visual examples or invite deliberate inspection. | Use one compact three-state visual comparison for rules, learning, and next-token prediction; avoid carousels and broad galleries because they add navigation and visual-search load without improving the core argument. |

The image and gallery references reinforce a useful rule: **a visual belongs only when learners can use it to answer the question raised in the adjacent text**. The course will favour one integrated comparison over a decorative collection of AI imagery.

| Block family | Observed pattern | Appropriate learning role | Course decision |
| --- | --- | --- | --- |
| Multimedia blocks | Audio, video, embedded content, attachment, and code references occupy a contained media frame rather than breaking the reading canvas. | Show a demonstrable process, provide optional supporting material, or add a tightly framed viewing task. | Retain the existing transformer video because it has a viewing question. Do not add audio, attachments, embeds, or code snippets unless the adjacent lesson gives learners a concrete reason to use them. |
| Chart blocks | Bar, line, and pie charts use simple axes, limited series, and a single title. | Communicate real quantitative comparison, trend, or composition. | Do not add charts to this course without a sourced numerical claim. Prediction mechanics are qualitative here; a labelled process or probability comparison is clearer and avoids invented data. |

These references make a useful boundary explicit: **media is not an interaction, and a chart is not a diagram**. Each needs a specific learner question and an evidential basis.

| Block family | Observed pattern | Appropriate learning role | Course decision |
| --- | --- | --- | --- |
| Divider blocks | Continue controls, quiet rules, numbered separators, and spacer treatments define a transition without competing with the content. | Establish a chapter boundary, ask learners to pause before a practice task, or progress to the next stage. | Preserve the existing clear continuation links. Add numbered progress only inside an activity with a genuine sequence, such as the prediction lab. Avoid extra spacers and separators as decoration. |
| Interactive blocks | The library includes accordion, tabs, labelled graphic, process, scenario, sorting, timeline, flashcards, buttons, question types, matching, and question-bank patterns. Most use one simple action per screen. | Support inspection, comparison, decision practice, sequencing, or retrieval after learners have enough explanation. | Analyse each pattern separately before choosing the limited set that can reduce, rather than increase, learning effort in the AI course. |

The overview shows a consistent interaction rule: **one learner action should answer one learning question**. A long sequence of unrelated taps would increase extraneous load, so every proposed course interaction must first name the misconception or decision it resolves.

### Interactive patterns: controlled disclosure and comparison

| Block | Learner action | What the reference communicates | Appropriate course use | Guardrail |
| --- | --- | --- | --- | --- |
| Accordion | Open one concise disclosure row. | A small, clearly labelled expansion with a plus indicator; the undisclosed items do not compete with the current reading line. | Optional definitions after the main explanation, such as token, parameter, model, and inference in the prediction lesson. | Do not hide prerequisite concepts or long paragraphs; learners should be able to complete the lesson without opening every row. |
| Tabs | Switch between a small set of named, parallel views. | One content canvas with mutually exclusive labels and a single visual/text pairing. | Compare rules, learning from examples, and language-model prediction in the “Learning patterns” lesson. | Use no more than three tabs, label the comparison dimension plainly, and repeat no core prose across the panels. |

| Block | Learner action | What the reference communicates | Appropriate course use | Guardrail |
| --- | --- | --- | --- | --- |
| Labelled graphic | Select a hotspot on one visual. | An image with sparse, high-contrast plus markers; the intended order can be guided by surrounding text. | A single “what changes the next-token estimate?” graphic: prompt detail, prior generated token, and instruction. | Use three hotspots at most. Each hotspot must name a visible feature and give one sentence of explanation; avoid decorative or self-evident points. |
| Process | Move through a named sequence with previous/next controls and a small step indicator. | A single card advances through a process rather than showing all complexity at once. | A three-step “model response” process in the prediction lesson: read context, estimate a continuation, add it and repeat. | Use it to segment an explanation, not to make learners hunt for hidden information. The first view must orient the learner to the full sequence. |

| Block | Learner action | What the reference communicates | Appropriate course use | Guardrail |
| --- | --- | --- | --- | --- |
| Scenario | Read a short contextual prompt, choose one option, and receive consequence-based feedback. | A realistic person-and-context setup followed by a small decision set. | A “safe to try, pause and check, or do not delegate” decision scenario in the final responsible-use lesson. | Keep the context familiar to an Indian general audience, make only one judgement at a time, and explain why the choice changes risk. |
| Sorting activity | Place an item in the correct named group. | Cards and targets make a category boundary visible. | A compact “input, output, or evaluation” sort in the modern AI landscape lesson. | Use a tap-first accessible alternative as well as pointer dragging; limit to four cards and two or three categories so the task rehearses a concept rather than motor coordination. |

| Block | Learner action | What the reference communicates | Appropriate course use | Guardrail |
| --- | --- | --- | --- | --- |
| Timeline | Move through a vertically ordered sequence of milestone cards. | Time is made visible through a central line, limited dates, and a bounded explanation per event. | Replace the current compact history strip with a four-milestone interactive timeline: 1950, 1956, learning from data, and transformers/modern models. | Keep four milestones only; the purpose is to correct the ChatGPT-origin misconception, not survey the whole discipline. |
| Flashcard grid | Reveal the reverse side of several equal cards. | A small bank of parallel, self-paced prompts that can be revisited in any order. | A three-card retrieval check after “What AI is”: task, information, and check. | Use as a short recall pause after an explanation; include a clear prompt on the front and a concise answer on the reverse. Do not use it to hide core vocabulary. |

| Block | Learner action | What the reference communicates | Appropriate course use | Guardrail |
| --- | --- | --- | --- | --- |
| Flashcard stack | Reveal and advance through one card at a time with an explicit position indicator. | Ordered retrieval with a small, controlled working set. | Not selected for the current course; the history and prediction sequence already provide guided progression. | Prefer the grid when learners need to choose a term to review; avoid adding another sequential card flow to a course with a persistent lesson navigation system. |
| Button and button stack | Choose one clearly named destination or branch. | A sparse decision list in which each option has one predictable result. | Use within the responsible-use scenario only if learners need to select one of three next actions. | Do not use for generic navigation, since the course already has a sidebar, footer, and contextual continuation control. |

| Block | Learner action | What the reference communicates | Appropriate course use | Guardrail |
| --- | --- | --- | --- | --- |
| Storyline | Launch a custom interactive package from a neutral placeholder. | The standard course shell can host a bespoke experience when a normal block is insufficient. | The existing prediction lab is the course’s custom playable explanation; it remains in the reading canvas rather than becoming a disconnected mini-app. | Do not add a separate game engine or external package. A custom interaction is justified only when its mechanism cannot be explained as clearly through a standard block. |
| Multiple choice | Commit to one answer among visibly exclusive options. | Quiet radio controls establish a direct retrieval decision without decorative distraction. | Retain for the end-of-course knowledge check and use a single concept-check after the sort activity if learner feedback reveals a persistent misconception. | Every option must be plausible, feedback must explain the decision rule, and the assessment must follow—not precede—the relevant explanation. |

| Block | Learner action | What the reference communicates | Appropriate course use | Guardrail |
| --- | --- | --- | --- | --- |
| Multiple response | Select all conditions that apply. | Parallel checkbox controls signal that more than one answer can be correct. | A final responsible-use check: choose all safeguards needed before sharing a generated workplace draft. | Use only where multiple conditions are genuinely required; state “Select all that apply” and give feedback for each missing or unsafe choice. |
| Fill in the blank | Produce a short missing term. | The learner must retrieve a compact, exact word or phrase. | A one-blank prompt after the prediction process: “A language model estimates the next ___.” | Use a short answer with forgiving checking; avoid it for nuanced ideas, spelling-sensitive terms, or learner-generated explanations. |

| Block | Learner action | What the reference communicates | Appropriate course use | Guardrail |
| --- | --- | --- | --- | --- |
| Matching | Pair each item in one column with one related item in another. | A small visual mapping task makes a distinction explicit. | Pair AI family with an appropriate output: vision → image label, language → draft, prediction → estimated value. | Use three pairs only and provide a button/tap alternative to line-drawing. The learner must already know each term before matching. |
| Draw from question bank | Receive a variable question from a larger pool. | A stack graphic signals randomisation and assessment variation. | Not selected for this short fixed narrative course. | Keep the knowledge check deliberately aligned with the seven lesson objectives rather than adding variation that makes feedback and progress harder to compare. |

## Source verification note

The supplied archive contains the complete visual reference set and metadata grouping the blocks into text, statement, quote, list, image, gallery, multimedia, interactive, chart, and divider families. An attempt to load Articulate’s official lesson-and-block reference in the browser returned no accessible page body in this environment. The implementation study therefore treats the supplied assets and their metadata as the primary reference for visual structure, while using published learning-science evidence to decide whether a pattern should be included in the course.

## Learning-science design constraints

The instructional design follows four practical constraints: remove nonessential material (**coherence**), use a visible signal for the idea currently being learned (**signalling**), let learners progress through manageable meaning-based units (**segmenting**), and place explanatory words next to the visual or choice they explain (**contiguity**). These principles are used here as constraints on the block selection, not as a reason to add more media. [1]

| Course rule | Block implication |
| --- | --- |
| Explain before asking learners to act. | Place a process, sort, scenario, or retrieval card after a sustained explanation and worked example. |
| Show one meaningful choice at a time. | Use a single prompt and compact choices in games; never combine definitions, navigation, and assessment in the same interaction. |
| Keep the explanation beside the object of attention. | Place prediction feedback directly below the selected continuation and label visuals at the point where learners use them. |
| Make optional detail visibly optional. | Use accordions only for glossary or enrichment detail, never for prerequisites. |
| Make a pause productive. | Use a flashcard, one-blank recall, or matching task to retrieve an already taught distinction rather than to reveal new information. |

The cognitive-load evidence reinforces that introductory learners need small, logically sequenced units, information presented together at the point of use, worked examples, guided practice, and frequent checks for developing misconceptions. It also cautions against unstructured discovery tasks for novices. [2] This supports a course in which a “game” is a **guided conceptual rehearsal**, not an open-ended puzzle or a visual reward layer.

| Evidence-informed rule | Consequence for the course games |
| --- | --- |
| Begin with a worked example. | The AI-type sort will first show one fully explained example before asking learners to classify any item. |
| Constrain the task. | Each game will use three or four choices, one decision rule, and immediate explanatory feedback. |
| Check misconceptions while they are still correctable. | The history timeline, prediction lab, and final scenario will each surface one common misunderstanding and correct it in context. |
| Reduce task-management effort. | Activities will use taps and labelled buttons, not required drag paths, timers, scores, leaderboards, or complex game mechanics. |
| Reconnect the game to the main story. | Every activity concludes with a short statement of how its decision relates to the next lesson. |

### References

[1]: https://www.digitallearninginstitute.com/blog/mayers-principles-multimedia-learning "Mayer's 12 Principles of Multimedia Learning"
[2]: https://www.edresearch.edu.au/summaries-explainers/explainers/managing-cognitive-load-optimises-learning "Managing cognitive load optimises learning — Australian Education Research Organisation"

## Selected course integrations

The implementation will add **five** focused patterns rather than attempt to place every available block into the course. This is the appropriate response to the block study: fewer, purposeful interactions reduce extraneous task switching while asking learners to invest useful effort in the conceptual distinctions that matter.

| Lesson | Rise-inspired pattern | Learner question | Learning mechanism | Why it belongs here |
| --- | --- | --- | --- | --- |
| 01 — Before ChatGPT | Four-event interactive timeline | “Which ideas came before a public chatbot?” | Guided chronological inspection | It corrects the origin misconception before the learner meets modern models. |
| 02 — What AI is | Three-card flashcard grid | “Can I identify task, information, and check in a familiar system?” | Retrieval after explanation | It turns the practical definition into three small, recoverable prompts. |
| 03 — Learning patterns | Three-panel comparison tabs | “How do written rules, learned patterns, and next-token prediction differ?” | Contrastive worked example | It keeps the comparison in one place, reducing search across separate lessons. |
| 04 — Prediction engine | Existing custom prediction lab, strengthened as a process | “How does a sentence grow one context-sensitive estimate at a time?” | Visible cumulative consequence | The mechanism is abstract; a constrained, learner-paced simulation makes it observable. |
| 05 — Modern AI types | Tap-first sort game with worked first item | “Is this item an input, an output, or an evaluation step?” | Guided categorisation | It consolidates the task/data/output distinction before model names are introduced. |
| 06 — Models in the world | Three-pair matching game | “Which model family best fits this documented capability?” | Retrieval plus comparison | It shifts attention from brand-name hype to input, output, and evaluation. |
| 07 — Know AI | Decision scenario plus multiple-response safeguard check | “What is a safe next action, and which checks still matter?” | Consequence-based transfer | It applies the full course story to a bounded, familiar work task. |

The course will retain its long-form explanation, worked example, source, bridge, and continuation sequence. New blocks appear **after** a relevant explanation; no lesson gains more than one compact game or comparison block. The original knowledge check remains the final cumulative retrieval activity.

## Critical implementation review

The implementation deliberately does **not** reproduce every block as a course feature. That would add interaction cost without strengthening the learning sequence. Instead, it uses one history timeline, one small flashcard recall pause, one three-way comparison, the existing cumulative prediction simulation, two guided categorisation games, and one nested responsible-use scenario. The selected components match the course questions; the remaining Rise patterns remain available as documented design options rather than being inserted without purpose.

| Review lens | Check | Result |
| --- | --- | --- |
| Narrative coherence | Does each activity follow the concept it rehearses and lead into the next lesson? | Yes. The sequence runs from history, definition, learning methods, prediction, AI workflows, model capability, and responsible judgement. |
| Extraneous load | Are learners required to manage timers, scoring, drag paths, or unrelated navigation? | No. The new games use labelled taps, one decision at a time, immediate feedback, and no competitive or time-based mechanics. |
| Germane effort | Does the activity ask learners to retrieve, compare, classify, or apply a concept already explained? | Yes. The activities channel useful effort into the schema being built rather than trying to eliminate productive effort. |
| Accessibility | Can the primary interaction be completed with ordinary buttons and visible state? | Yes. The interactions use buttons, visible selected states, role-labelled tabs where applicable, and do not require dragging. |
| Rise-style restraint | Do the blocks preserve the existing reading canvas rather than turning the course into a game screen? | Yes. They use the existing white reading surface, single blue accent, narrow content column, simple borders, and calm feedback treatment. |

The only environmental validation limitation is that the repository lacks a root TypeScript configuration expected by the current `nuxi typecheck` command, while an ad-hoc `vue-tsc` installation conflicts with the workspace TypeScript export layout. The Nuxt production build nevertheless completed client and server compilation and generated the Vercel static output; only the final Nitro process was terminated by the sandbox’s memory pressure. Browser checks verified the rendered interactions and reported no client-side runtime errors.
