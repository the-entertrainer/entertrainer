# Artificial Intelligence: From Its Origins to the Frontier

**Research current as of:** 15 August 2026.  
**Implementation stance:** learner-facing claims use verified public evidence where available. Product claims, unverified reports, restricted systems, and classified capabilities are not presented as established fact.

## Product translation

The source brief asks for a complete, Rise-inspired learning journey rather than a long report. The web implementation will therefore use a dedicated, self-contained course player at `/courses/ai-atlas` with local progress, a navigable course map, short content screens, formative checks, source tags, and a capstone reflection. It will open with a title/introduction screen and an objectives screen using the prescribed wording structure.

| Course need | Website behavior |
|---|---|
| Clear completion journey | A ten-module route records completed steps in local storage, shows percentage and estimated time, and unlocks later content after the current screen is visited. |
| Rise-style microlearning | Each module contains a concise explanation, a visual or embedded-resource moment, a practical prompt, a knowledge check, and a clear continuation control. |
| Evidence-based AI literacy | Claim cards pair a confidence label with an evidence level: verified public evidence, informed analysis, or speculative scenario. |
| Responsible frontier discussion | The frontier lesson explicitly distinguishes released models, public evaluations, claims reported by developers or institutions, and unknowable/classified systems. |
| Inclusive independent learning | All interactions are keyboard reachable; videos have linked alternatives; color is never the only status signal; and the player remains usable on a narrow screen. |

## Course map

| Module | Focus | Learner output | Core evidence |
|---|---|---|---|
| 01. Set your bearing | What AI is and is not | A personal baseline | Turing; Dartmouth |
| 02. From rules to learning | Symbolic AI, expert systems, and neural networks | A method comparison | Dartmouth proposal; 3Blue1Brown explainer |
| 03. The data turn | Statistical machine learning and deep learning | A training/inference distinction | Foundation Models report |
| 04. Attention changes the map | Transformers and foundation models | A plain-language attention explanation | Vaswani et al.; CRFM |
| 05. Generation, grounded | LLMs and multimodal generation | A capability/limitation classification | CRFM; NIST |
| 06. Agents and tools | Retrieval, tools, memory, and workflows | A safe workflow sketch | OpenAI; Anthropic |
| 07. Beyond the screen | Robotics, science, and physical-world limits | A claim-risk note | CRFM; AISI |
| 08. Evidence, not rumours | Public, reported, speculative, and unknowable claims | A claim confidence label | AISI; source hierarchy |
| 09. Responsible use | Hallucination, bias, privacy, IP, misuse, and evaluation | A risk-control pairing | NIST AI 600-1 |
| 10. Your next responsible step | Synthesis and capstone | A personal AI action card | Course evidence register |

## Evidence register

| ID | Source | Type | Published | Claims used in course | Confidence |
|---|---|---:|---|---|---|
| `turing-1950` | [Turing, *Computing Machinery and Intelligence*](https://academic.oup.com/mind/article/LIX/236/433/986238) | Primary scholarly article | 1 Oct 1950 | Turing replaced the vague question “Can machines think?” with the imitation game framing. | High |
| `dartmouth-1955` | [McCarthy et al., Dartmouth proposal](https://www-formal.stanford.edu/jmc/history/dartmouth/dartmouth.html) | Primary archival proposal | 31 Aug 1955 | The proposal used “artificial intelligence” and framed research goals including language, abstraction, problem solving, and self-improvement. | High |
| `vaswani-2017` | [Vaswani et al., *Attention Is All You Need*](https://arxiv.org/abs/1706.03762) | Primary research paper | 12 Jun 2017 | The original Transformer paper proposed an attention-only sequence architecture and showed results in machine translation. | High |
| `crfm-2021` | [Stanford CRFM, *On the Opportunities and Risks of Foundation Models*](https://crfm.stanford.edu/report.html) | Research report | Aug 2021 | Foundation models are trained on broad data at scale and adapted to downstream tasks; their benefits and defects can propagate downstream. | High |
| `nist-2024` | [NIST AI 600-1, Generative AI Profile](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence) | Government standard / guidance | 26 Jul 2024 | Generative-AI risks require lifecycle-oriented risk management; the document is a companion profile to the AI RMF. | High |
| `openai-agents` | [OpenAI, *A practical guide to building agents*](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/) | Official technical guidance | Accessed 15 Aug 2026 | In this design vocabulary, an agent uses an LLM to manage workflow decisions plus tools constrained by instructions and guardrails. | Medium |
| `anthropic-agents` | [Anthropic, *Building effective agents*](https://www.anthropic.com/engineering/building-effective-agents) | Official technical guidance | 19 Dec 2024 | Workflows follow predefined code paths; agents dynamically direct process and tool use. Simpler systems are often preferable. | Medium |
| `aisi-2025` | [UK AISI, *Frontier AI Trends Report*](https://www.aisi.gov.uk/frontier-ai-trends-report) | Public government evaluation report | 2025 | Public testing identifies rapidly changing frontier capabilities and persistent safeguard vulnerabilities; the report is not a forecast or a complete description of all systems. | High for its stated evaluation findings; not generalizable to every model |

## Curated media placement

| Lesson | Video | Channel | Viewing instruction | Backup / alternative |
|---|---|---|---|---|
| 02. From rules to learning | [1. Introduction and Scope](https://www.youtube.com/watch?v=TjZBTDzGeGg) | MIT OpenCourseWare | Use the opening segment as a guided primer on the field’s questions; the course links the full MIT course for learners who want more. | [MIT 6.034 lecture collection](https://ocw.mit.edu/courses/6-034-artificial-intelligence-fall-2010/video_galleries/lecture-videos/) |
| 02. From rules to learning | [But what is a neural network? \| Deep learning chapter 1](https://www.youtube.com/watch?v=aircAruvnKk) | 3Blue1Brown | Watch for the distinction between a biological metaphor and a trainable mathematical model. | [Backpropagation, intuitively](https://www.youtube.com/watch?v=Ilg3gGewQ5U) |
| 04. Attention changes the map | [Transformers, the tech behind LLMs \| Deep Learning Chapter 5](https://www.youtube.com/watch?v=wjZofJX0v4M) | 3Blue1Brown | Watch the first ten minutes; write down what “predict the next token” does and does not mean. | [LLM Transformer Model Visually Explained](https://poloclub.github.io/transformer-explainer/) |

All course links were accessed on 15 August 2026. The YouTube selection is openly available from established education providers; the interface provides linked reading alternatives so learning does not depend on video playback or captions.

## Claim boundary used throughout

> **Verified public evidence** means an accessible primary source, an official model document, or a credible public evaluation supports the statement. **Informed analysis** means a qualified interpretation or secondary account. **Speculative scenario** means a possibility, not an established fact. Restricted, private, rumored, or classified systems are described only as unknown unless reliable public evidence says otherwise.

## Visual asset system

The experience uses four purpose-made editorial artworks: an opening expedition map, an archival AI-history timeline, an agent-and-tools field-note scene, and a navigational route mark. Each asset uses the course’s warm-paper, Atlas Ink, mineral-emerald, and ember palette; artwork is reserved for landmark moments so visual language supports learning rather than decorating every block.

The working preview was visually checked on the title, objectives, and history-module screens. The route mark, hero map, and history artwork render in the intended asymmetric editorial layout, and the timeline is placed at the relevant instructional point rather than repeated as a generic backdrop.

The agents module and resource library were also checked in the working preview. The agents artwork appears only in the tools-and-workflows lesson, while the source drawer exposes the concise glossary and the course evidence register without forcing a learner to leave their place in the pathway.

The formative check in the data module was tested with its correct response and returned the intended explanatory feedback. The capstone’s three required reflection fields were completed in the preview; submission changed the course status to **Completed** and showed the final completion message and restart control.

## Rise-style reference translation

The supplied block references favour a calm, compact learning canvas with clearly labelled content blocks, visible but restrained borders, and one focused learner decision at a time. The revision will translate those patterns into a short module sequence: a clear introduction, an optional “Explore this idea” accordion, plain-language comparison tabs, simple click-to-reveal flashcards, a video or visual learning moment, and a short “Check your understanding” question with direct feedback.

For essential terms, the course will use short flashcard reveals rather than a dense glossary panel. For applied judgement, the frontier section will use a scenario prompt with one decision and immediate instructional feedback, not a free-form technical exercise.

## Revision verification

The revised title and objectives screens were checked in the working preview. The learner sees plain-language copy, a clear course menu, an explicit progress indicator, and a single next action. The course continues to use the required objectives wording while simplifying the supporting instruction and visual hierarchy.

Lesson 1 was also checked in the working preview. The key-idea block introduces AI through familiar daily examples, and the “Explore this idea” accordion opens and closes correctly with optional plain-language detail. The short knowledge check is introduced with a direct learner instruction rather than a technical diagnostic label.

The first quick check returned plain-language corrective feedback after the learner chose the evidence-led option. The data lesson was opened using the persisted course state and displayed a three-card “Tap to reveal” vocabulary block alongside a straightforward training question, matching the requested professional e-learning interaction style.

The first flashcard was opened successfully: the learner sees the short, non-technical meaning of “Training” in the same card, while the other terms remain hidden until selected.

The frontier lesson’s scenario block was tested with its evidence-led choice. The course selected the response and returned clear guidance: look for an official source, a research paper, or independent testing before sharing a major claim.

The revised action-plan screen was checked in the working preview. It asks the learner to name a low-risk task, identify what they will check, and state the human review step. All three plain-language fields accepted representative learner input and enabled the course completion action.

## Concise-content verification

The condensed action-plan screen was checked in the working preview. Its heading, supporting line, three form prompts, completion control, and completion message now each make one direct point, while preserving the practical learner action and required review step.

Lesson 1 was also checked after the concise-content pass. The learner now sees one short definition, one key idea, one optional expansion, one focused check, an evidence link, and a three-question takeaway. The layout remains instructional while removing repeated explanation.

Selecting the evidence-led response returned concise feedback that states the required action without repeating the lesson. The course browser console showed no client-side errors during this final interaction check.

## Design-director audit and redesign goals

The current course is structurally sound but visually underpowered. Its warm-paper and muted-teal palette produces a low-energy experience, while most learning blocks share the same white-card treatment and thin border. The large serif headings create hierarchy, but there is too little visual contrast between explanation, practice, evidence, and completion states. The left navigation is functional yet dense, and the generated illustration appears only at a few points rather than contributing to a sustained visual learning rhythm.

The concise-content revision improved scanability, but it also revealed a new gap: several lessons move from a definition directly to a check without an immediately visible practical application. The redesign will retain concise copy but give every lesson a stronger visual signal, a single applied prompt, a recognisable activity state, and a more distinctive lesson identity.

The new direction is **Bright Learning Studio**. It will use a clean white canvas, deep ink-blue navigation, electric-blue progress, coral scenario states, aqua evidence cues, and warm-yellow achievement markers. Rather than repeating neutral cards, the course will use colour-coded instructional bands, visual lesson stamps, differentiated block materials, clearer learner-state feedback, and more deliberate page compositions. The intention is to achieve the lively clarity of a professional course authoring experience without copying the inaccessible Articulate reference or abandoning Entertrainer’s identity.

The redesigned title and objectives screens were checked in the working preview. The new deep-blue rail, bright course canvas, visual hero composition, colour-coded objective cards, and working-principle bar create clearer hierarchy and a recognisable course identity. The title screen shows the intended learning path at a glance, while the objectives screen introduces three distinct learning outcomes before the learner enters the first lesson.

The first lesson was also checked. Its directive **Observe** prompt asks the learner to name a task before moving into the concept, records that the exploration was opened, and reveals a brief explanation only when requested. This establishes a more active, varied rhythm than the prior repeated card sequence while preserving the evidence note and judgement check.

The frontier lesson was checked as a contrasting activity type. Its coral scenario panel, evidence-led prompt, and direct answer feedback are visually and structurally distinct from the first lesson’s blue concept-and-exploration pattern. Selecting the evidence-led option returned the intended short feedback without client-side interruption.

The redesigned course completed a production build successfully. The title, objectives, directive lesson prompt, optional expansion, scenario response, and navigation states were visually reviewed, and the client console remained free of runtime errors during the interaction checks.

Submitting the action plan changed the learner state to **Course completed** and displayed an instructional completion message with a restart control. The course therefore retains its completion loop while using the revised, professional e-learning language.

## External course benchmark

The supplied Articulate review link was opened for visual benchmarking. Its initial loading state did not yet expose learner-facing text or controls, so no design or writing conclusion has been drawn from the reference until its course content becomes visible.

## Approved Rise-style implementation mapping

The approved redesign replaces the current Bright Learning Studio shell rather than incrementally softening it. The dark permanent rail, dotted canvas, multi-colour block treatments, decorative orbit graphics, and large all-caps labels will be removed. The course will use a light neutral canvas, restrained accent use, compact sans-serif typography, an optional contents drawer, and quiet linear navigation.

The current `lessonPrompts` banner will be refactored into neutral learner instructions. Labels such as “YOUR FIRST MOVE”, “CORE CONCEPT”, “YOUR PATH”, and “Ready for the next idea?” will be replaced by simple equivalents such as “Consider this example”, “Key point”, “Course progress”, and “Continue to the next lesson”. Accordions, tabs, flashcards, process steps, scenarios, knowledge checks, evidence links, and completion controls will retain their existing behaviour but be rebuilt as white or very light-grey, low-chrome Rise-style blocks with clear task directions.

The revised frontier lesson and compact contents drawer were checked in the working preview. The lesson now uses a neutral page canvas, one restrained accent colour, simple bordered content blocks, plain learner directions, and a small source line. The previous permanent dark rail has been replaced by an optional outline drawer, which preserves navigation without reducing the lesson canvas.

The data lesson was checked as a second standardised interaction type. The vocabulary activity appears as a simple three-card grid with a concise instruction, and selecting a card reveals its plain-language definition without changing the course’s neutral visual system. The knowledge check remains immediately below the activity and follows the same low-chrome block treatment.

The training knowledge check was answered correctly and returned compact corrective feedback within the same content block. The action-plan screen was also checked: three completed fields enabled the course-completion control, displayed the restrained completion state, and preserved the restart control. The v4 storage state also accepted the prior v3 learner progress before writing the updated state.

## Screenshot-grounded Rise 360 reference specification

The supplied mobile screenshots are now the primary visual specification. They show a 2× scaled mobile layout with a narrow white course canvas, thick black rounded headings, large reading text, a single strong blue accent, and clear separation between authoring-shell navigation and learner content. The requested learner experience should reproduce the course content area rather than imitate browser or authoring-review chrome.

The opening screen combines a full-width photographic image, a large white title over the lower part of the image, and a wide white pill-shaped **Start course** control. The following course-information area uses a large brand wordmark, a bold duration line, a short explanatory paragraph, and a vertical menu whose rows use left-aligned activity icons with unfilled or completed status circles at the right.

Lesson reading screens use very large black headings, a generous white reading column, substantial paragraph spacing, a light-blue full-width lesson header with a small menu button and a lesson-count label, and a plain back arrow at the right. Objectives use a large heading, an instructional lead line, and oversized bullet points rather than bordered cards. The live Articulate review URL was opened in the browser; it continued to show a loading state in this environment, so the screenshots govern the implementation wherever the live review cannot render.

The rebuilt course-start screen and objectives screen were visually reviewed in the native preview. The start screen follows the reference composition with a full-width hero image, white title overlay, pill-shaped start control, large course label, duration, short course summary, and a vertical activity list with completion circles. The objectives screen now follows the reference’s text-first pattern: plain top controls, a very large black heading, bold lead line, oversized bullets, and no card-grid treatment.

The first AI lesson and course-outline drawer were also checked in the preview. The lesson now opens with the reference-style light-blue panel, left menu control, lesson count, large black lesson title, and black underline, followed by a wide white reading column with generous paragraph spacing. The outline drawer uses the screenshot’s vertical rows: a simple left activity icon, text label, and a blue completed or empty circular marker at the right.

The data lesson confirmed that course interactions remain inside the reference-matched reading layout. The flashcard activity appears below the reading content as a restrained row of bordered white cards; selecting **Training** reveals its definition with a subtle blue-tinted state. The knowledge check follows as a plain text question with simple horizontal answer rows, matching the reference’s preference for content-led interaction rather than decorative panels.

The correct training response returned compact green feedback directly below its selected answer row. The summary and action-plan screen was also checked. It follows the same large black heading, plain explanatory copy, simple labels, generous white inputs, and single blue completion control used across the rebuilt course.

The action-plan inputs accepted representative learner responses and enabled the blue completion control. Submitting the plan changed the control label to **Course completed**, displayed a plain completion note, and retained the restart action. This confirms that the screenshot-matched layout preserves the course’s functional completion loop.

The reference-matched course was visually checked across the course start, objectives, lesson reading screen, course outline, flashcard reveal, knowledge-check feedback, and completion screen. The browser console showed no client-side errors. The Nuxt client and server bundles completed successfully; the final memory-intensive Nitro deployment bundle was terminated by the sandbox after those stages, so interactive development-mode validation was used for the final learner-flow pass.

## Screenshot-difference correction

The latest side-by-side comparison identifies four remaining deviations in the course-start composition. First, the illustrative asset is currently presented as a separate media block rather than a full-bleed course image with the title placed inside the image. Second, the current screen retains metadata chips and a coloured rectangular start button rather than a single white pill-shaped action on the image. Third, the course overview below the image is too modular; the reference uses a plain white reading area with a very large black wordmark, duration line, long-form description, and a vertically spaced activity list. Finally, residual pale green/tinted panels, square borders, and decorative containers should be removed in favour of the reference’s mostly white, text-led, low-chrome treatment.

The correction will use the screenshot sequence as the strict layout source. Entertrainer branding and AI course content will replace the PayPal brand and POS content, while the information architecture and visual composition will follow the reference directly.

## Live Rise 360 reference capture

The review course successfully rendered in the browser after its delayed initial load. On desktop, it uses a two-column Review 360 shell: a narrow course canvas at the left and a wide review/comments panel at the right. The course canvas begins with a compact blue mark/header, a thin course title bar, a secondary feedback/action bar, and a thin blue progress line. The course itself opens with a full-bleed photographic hero, large white left-aligned title overlay, and a white rounded **START COURSE** control placed inside the image. The introductory reading area below is white and uncarded, with a very large black wordmark, a duration line, long-form body copy, and a vertical outline made of plain rows, a small left activity glyph, and empty completion circles at the right.

After minimising the Review 360 comments panel, the course canvas showed the relevant desktop structure clearly. The reference has a persistent narrow course-navigation column at the left, containing a compact image header, course title, completion indicator, and vertically spaced activity rows with a left glyph and right empty or completed circle. The reading pane occupies the remaining width as a white canvas with a thin vertical divider. It uses large black rounded headings, generous line spacing, inline blue links, an embedded video framed with a very light grey border, and subdued light-grey information sections. The review, feedback, sign-in, comment, annotation, and all right-side Review 360 elements are explicitly excluded from the Entertrainer implementation.

The Rise 360 course iframe was opened directly, producing the standalone course canvas without any review interface. The overview has a single fixed-width content column. Its photographic hero spans the full course width and is approximately 380 pixels high in the desktop capture. A left-aligned white course title sits on the hero at roughly mid-height, with a compact white rounded **START COURSE** control below it. The white overview area begins immediately below, with a large black wordmark, a small bold duration label, concise body copy, and a narrow vertically stacked lesson list. Every list row has a small three-line glyph at the left, a plain black label, and a 12 to 14 pixel pale-grey status circle at the right. There are no cards, chips, tinted panels, or decorative background treatments in this sequence.

The complete first standalone lesson was captured from top to bottom. It begins with a light-blue rectangular lesson header that contains a small menu control, a compact “Lesson 1 of 6” label, a large black title, and a short black underline. The reading sequence below is uncarded: two introductory paragraphs, an H2 objectives heading, a bold lead line, conventional bullet points, then a large H2 explanatory heading and paragraph groups. The longer lesson uses restrained content blocks only when needed: a pale-grey disclaimer strip with a small information icon, full-width images, an embedded video with a one-pixel light-grey frame, simple accordion headings, conventional data tables, and standard lists. The page ends with a disabled low-contrast “complete content above before moving on” control. No green colour, surface cards, chip metadata, or coloured interaction panel appears in the reference sequence.

The second and third standalone lessons confirm that the same lesson-header and white reading canvas are used consistently across the course. The workflow lesson presents a grey H2, short supporting text, plain bold step labels, and full-width instructional screenshots. The troubleshooting lesson uses sentence-style subheadings, bold conditional labels, short explanatory paragraphs, conventional numbered instructions, and sparse supporting images. Neither lesson introduces decorative cards, badges, secondary accent colours, or coloured assessment containers; the only recurring accent outside the header is the blue link colour.

The FAQ lesson uses the same blue header and white canvas. Its flashcard is a single large white square with a light-grey border and subtle corner decoration, with circular previous and next controls below and a small count label centered between them. Resource links remain conventional blue inline links. The quiz entry is visually minimal: a large white panel with a small lesson label, a black **Quiz** heading, a short bright-blue underline, plain numbered instructions, one passing-score sentence, and a blue text-link **START QUIZ** action. It does not use a filled assessment card or coloured response panel.

The final summary uses the same light-blue lesson header and white reading canvas, with a **Wrap-Up** H2, a bold completion lead line, conventional objective bullets, one supporting image, and an exit action at the bottom. The active quiz question confirms the assessment pattern: a large white panel with a small “Question” label, bright-blue numeric progress, bold black question, one short instruction, full-width white answer rows with pale-grey one-pixel borders and radio circles, plus one centered blue pill-shaped **SUBMIT** control. Correctness is not indicated until the learner submits an answer.

## Course-canvas correction specification

The standalone course canvas, not the Review 360 interface, is the implementation source. On desktop, the AI course will use a persistent left navigation column and a white right reading pane separated by a one-pixel light-grey divider. On mobile, the left column will collapse behind the header menu so the lesson fills the viewport. No review, comment, feedback, sign-in, annotation, or side-panel functionality will be included.

The overview will use a full-width 16:9 hero image, dark transparent overlay, large white left-aligned title, and one white pill-shaped **START COURSE** control inside the image. Immediately below it will be a plain white overview with a large black Entertrainer wordmark, bold duration line, two short body paragraphs, and a vertical lesson list. The list will use unfilled or blue-filled circular status markers only. It will not use metadata chips, button cards, tinted surfaces, or a separate coloured start button.

Every lesson will use the same light-blue rectangular header: compact lesson counter, large black title, and short black underline. The body will remain a white text canvas with wide margins, large rounded black headings, normal paragraph groups, traditional bullet and numbered lists, sparse full-width media, and blue inline links. Blocks are allowed only where the reference uses a functional block: pale-grey information strip, white flip card with a one-pixel grey border, white accordion rows, white quiz answers with radio circles, and a simple blue pill-shaped submit action. Green, teal, multi-accent palettes, gradients, patterned canvases, chip rows, tinted answer containers, heavy shadows, and non-functional square cards are prohibited.

The corrected AI overview and objectives screens were checked in the standalone local canvas. The desktop view now follows the captured standalone reference: a narrow left outline with a hero thumbnail and unfilled or blue-filled completion circles; a white right canvas; a full-width darkened image start screen with white title overlay and white pill-shaped start action; then a plain white course overview. The objectives screen uses a light-blue rectangular header, compact counter, black underline, large black heading, oversized conventional bullets, and a white reading pane. No green surface, chip row, patterned canvas, decorative card grid, or review-only element remains in these screens.

The rebuilt data lesson was checked against the reference flashcard and quiz patterns. It uses a light-blue header, white reading surface, pale-grey information strip, white one-pixel bordered flip cards, and a large white assessment panel with blue numeric progress, radio-style answer rows, and one centered blue submit control. Selecting an answer does not show feedback; feedback appears only after **SUBMIT**, matching the captured reference assessment sequence.

The course canvas typography has been updated from Nunito to Poppins at semi-bold and bold weights, with a single deeper blue (`#2F6FB3`) for interactive and progress states. The lesson header retains a related light-blue tint, preserving the reference structure without reintroducing green or multiple accent colours.

The rewritten course overview and objectives screens were checked in the native preview. The overview now uses the reference-matched image-overlay start sequence and a plain white summary with a vertical activity list. The objectives screen introduces the six-lesson sequence explicitly and presents the learning outcomes, course organisation, and reading-first rule before the learner enters the first lesson. The presentation is text-led and uses the recovered Rise-style light-blue header, white reading canvas, and single-blue accent.

Lessons 1 and 2 were reviewed in sequence. Lesson 1 establishes the task-centred definition of AI through explanatory prose, a four-stage task diagram, and a worked prediction example before introducing its bridge to learning from examples. Lesson 2 then explains rules, training, inference, datasets, and generalisation through connected paragraphs and a worked support-request example. Its single classification activity appears only after those explanations, making the learner apply the distinction rather than encounter an unexplained interaction.

Lesson 3 was checked after the learning-from-examples activity. It explains tokens, context-sensitive prediction, attention, and the difference between fluency and evidence before presenting a simple continuation task. The embedded transformer video is preceded by a viewing question that directs attention to the exact distinction learners should observe. The context-prediction activity follows the narrative and worked example rather than competing with them.

The evaluation lesson was reviewed as a later-course application lesson. It explains the source hierarchy and the need to record uncertainty, then uses a policy-checking worked example before asking the learner to select the first step in evaluating a high-impact claim. The scenario therefore applies an explicit routine already established by the reading rather than introducing a disconnected interaction.

The final responsible-use lesson was reviewed as the synthesis point for the course. It connects task definition, controlled information, output checks, and human accountability through explanatory prose and a low-risk worked example. Its bridge directs the learner to the mixed knowledge check and then to the action plan, completing the intended sequence from foundation to application.

The knowledge check was tested after the six-lesson sequence. It opens with a brief explanation of the retrieval purpose, then uses one question at a time with neutral radio-style answer rows and a submit action. Selecting an answer does not reveal correctness; submitting it provides concise feedback that explicitly reconnects the correct answer to the task-centred evaluation routine taught in Lesson 1.

## Content-led instructional audit

The current AI course has a clear visual shell but a weak learning architecture. It presents ten topics at equal weight, moves from two short paragraphs directly to an interaction, and treats flashcards, tabs, accordions, and questions as recurring visual objects rather than as instructional responses to a specific learner need. As a result, a learner can move through the course without understanding how one concept explains the next.

| Current structural problem | Learner impact | Required correction |
|---|---|---|
| Ten topics appear as a flat list | The learner cannot see the conceptual journey from foundations to responsible use. | Group content into a small number of progressive lessons with explicit section purposes. |
| Explanatory paragraphs are too brief | Concepts such as training, attention, generation, agents, and evaluation are introduced without enough context. | Use sustained reading passages, concrete examples, and explicit bridges before asking the learner to act. |
| Interactions are repeated regardless of need | Flashcards, tabs, and checks interrupt the explanation rather than reinforce it. | Retain only an illustrative comparison, one worked example, one knowledge check, and one final application task. |
| Responsible use arrives at the end as a separate topic | Risk, evidence, and accountability do not influence earlier understanding. | Introduce evaluation habits during the generative-AI lesson and apply them again in the final responsible-use lesson. |
| The action plan is disconnected from the lesson sequence | The final task feels like a form, not a synthesis. | Base the final task on the same workflow, evidence, and review practices built through the preceding lessons. |

## Revised course architecture

The corrected course will use six content-led lessons, followed by a short knowledge check and a summary. Each lesson will begin with a short framing statement, then provide two to four connected explanatory paragraphs, at least one concrete example, and a direct bridge into the following lesson. This follows the reading-first pattern of the captured Rise reference while giving the AI content a purposeful progression.

| Sequence | Lesson purpose | Required content | Practice placement |
|---|---|---|---|
| 1. Introduction to AI | Establish what AI is, what it is not, and why task definition matters. | Historical framing, everyday examples, task–data–check model. | None; this lesson establishes shared language. |
| 2. From rules to learning | Explain the change from written instructions to learning from examples. | Rules, data, training, inference, one worked classifier example. | One comparison activity after the explanation. |
| 3. Modern generative AI | Explain, in plain language, attention, tokens, generation, strengths, and limitations. | Connected model explanation and a drafting example. | One short retrieval check after all concepts are explained. |
| 4. AI in workflows | Show how tools and agents extend a model into a workflow while preserving human control. | Assistant versus agent, tools, approvals, and physical-world caution. | One worked workflow example; no separate interaction. |
| 5. Evaluating AI output | Teach learners to assess correctness, evidence, uncertainty, and public claims. | Source hierarchy, unsupported output, and claim-checking process. | One applied evidence scenario. |
| 6. Responsible use and next steps | Synthesize privacy, fairness, accountability, and practical adoption. | Risk-control routine and a low-risk use case. | Final action plan informed by the previous five lessons. |

The course will then conclude with a five-question knowledge check drawn from the preceding lessons and a summary that restates the objectives, reinforces the risk-control routine, and offers one clear next action.

## Interactive-explainer teaching patterns

The supplied interactive explainer begins with a familiar everyday activity, identifies a question that is hard for computers, and invites the learner to attempt a small version of the problem before presenting the explanation. The opening interaction has one constrained goal, a visible move counter, an explicit start state, and a simple control instruction. It therefore creates a concrete experience that the later explanation can name and analyse, rather than asking the learner to interact with a concept they have not yet encountered.

For the AI course, this approach will be used only where it makes an abstract mechanism visible. The data-learning lesson will include a small guided classification exercise: learners sort a few labelled examples, observe that a model can only learn patterns represented in those examples, and then read the explanation of training, generalisation, and error. The modern-AI lesson will include a short token-choice activity after its reading section, allowing learners to observe how the surrounding context changes the most likely next word. Neither interaction will replace the lesson narrative; each will be introduced by a concrete question and followed by an explicit explanation that connects the learner’s result to the formal idea.

The full explainer reinforces a six-stage teaching pattern that is directly useful for the AI course: first, give the learner a familiar task; second, make the outcome visible; third, name the underlying formal problem; fourth, compare the learner’s approach with an alternative; fifth, replay one critical decision with commentary; and sixth, increase complexity while explaining the reusable strategy. The interaction is not presented as a decorative break. It creates the evidence for the surrounding narrative, and the narrative interprets that evidence through concepts such as optimality, heuristics, decomposition, and compression.

The AI course will adapt this pattern without reproducing the explainer’s styling or interaction mechanics. The data lesson will ask learners to classify a few examples, show the resulting pattern and one counterexample, then explain training data, generalisation, and error. The modern-model lesson will ask learners to select a plausible next token in two short contexts, show how the answer changes, then explain context-sensitive prediction and the limits of that analogy. These are the only two concept simulations proposed; all other lessons will remain reading-led, with worked examples and retrieval checks placed after instruction.

## Instructional-design rules adopted for this course

The revised module will use a reading-first sequence: orient the learner, introduce essential terms, explain the mechanism through connected prose, provide a worked example, invite a small application, give feedback, and bridge to the next concept. The course will sequence content by increasing conceptual complexity—from task and data, to learning from examples, to generation and workflows, to evaluation and responsible use—rather than presenting a flat topic list. This is consistent with instructional-sequencing guidance that recommends ordering content by complexity, chronology, or procedure and dividing it into manageable sections. [1]

Every explanatory page will contain no more than one central concept and will use headings and paragraphs to signal the conceptual move. Visuals will be kept only when they represent, organise, or explain the idea being taught. Decorative material, unrelated animation, and repeated interaction blocks will be excluded. This follows the coherence and signaling guidance in multimedia-learning research, which emphasises reducing distractions and using cues sparingly to direct attention. [2]

Videos will not duplicate the on-screen prose. A video will appear only when motion or visual explanation adds value, and it will be preceded by a concise viewing question and followed by a short application prompt. Images and diagrams will sit next to the sentence or step they explain, so the learner does not need to search for a disconnected legend. [2]

Interactive components will be used as retrieval or application after the relevant explanation, never as a substitute for explanation. The course will include one comparison activity in Lesson 2, two concept simulations in Lessons 2 and 3, one evidence scenario in Lesson 5, and a short mixed knowledge check after the six lessons. This approach uses retrieval practice where it can help learners recall and apply prior material instead of clustering multiple unrelated interactions on every page. [3]

### References

[1]: https://guides.uflib.ufl.edu/instructional-video-best-practices/content-sequencing "University of Florida Libraries — Content Sequencing"
[2]: https://cms.cel.uwaterloo.ca/honeycomb/useful.aspx "University of Waterloo — Creating Useful Online Learning Experiences"
[3]: https://id.uwex.edu/blog/retrieval-practice-in-online-courses/ "UW Extended Campus — Retrieval Practice in Online Courses"

## New curriculum source register: AI origins and modern era

The new course must directly correct the idea that AI began with ChatGPT. The historical narrative will open with Turing’s 1950 paper as an early milestone in public discussion of machine intelligence and use the 1955 Dartmouth proposal, which led to the 1956 Dartmouth Summer Research Project, to establish the field’s named research programme. It will then explain that modern generative AI rests on decades of work in statistics, symbolic AI, neural networks, learning from examples, larger datasets, computing infrastructure, and the transformer architecture introduced in 2017. [4] [5] [6]

### References

[4]: https://academic.oup.com/mind/article/LIX/236/433/986238 "Turing, A. M. (1950). Computing Machinery and Intelligence"
[5]: https://home.dartmouth.edu/about/artificial-intelligence-ai-coined-dartmouth "Dartmouth College — Artificial Intelligence Coined at Dartmouth"
[6]: https://arxiv.org/abs/1706.03762 "Vaswani et al. (2017). Attention Is All You Need"

Modern AI examples will be introduced as systems with different inputs, outputs, and intended uses rather than as competing brands. GPT-4 is documented as a transformer-based multimodal model that accepts image and text inputs and produces text outputs; its technical report explicitly describes next-token prediction as its pre-training objective. Gemini’s technical report describes a family of models for image, audio, video, and text understanding across different deployment sizes. Claude’s public description documents text analysis, coding, structured output, vision capabilities, and the importance of safety evaluation, while also acknowledging that accuracy, bias, and risk management remain ongoing concerns. [7] [8] [9]

In the course, these examples will support a practical distinction between language models, multimodal models, computer-vision systems, recommendation and prediction systems, and tool-using workflows. They will not be presented as evidence that a model is universally reliable or independently authoritative.

Browser checks confirmed the course-history sources directly. Dartmouth describes the 1956 Summer Research Project on Artificial Intelligence as a foundational event and preserves McCarthy’s proposition that aspects of learning or intelligence might be described precisely enough for a machine to simulate them. Turing’s 1950 paper record establishes that the machine-intelligence debate predates the modern AI era by decades. The original transformer paper was submitted in June 2017 and proposes an architecture based solely on attention mechanisms, providing an accurate bridge from long-running AI research to the architecture associated with many present-day language models. [4] [5] [6]

### References

[7]: https://arxiv.org/abs/2303.08774 "OpenAI et al. (2024). GPT-4 Technical Report"
[8]: https://arxiv.org/abs/2312.11805 "Google Gemini Team et al. (2025). Gemini: A Family of Highly Capable Multimodal Models"
[9]: https://www.anthropic.com/news/claude-3-family "Anthropic (2024). Introducing the Next Generation of Claude"
