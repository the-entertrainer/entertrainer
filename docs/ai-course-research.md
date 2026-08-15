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
