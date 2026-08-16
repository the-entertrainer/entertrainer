# Instructional Blueprint: Artificial Intelligence From Its Origins to the Frontier

## Audit of the current course against the new scope

The current six-lesson course is a substantial improvement over the earlier interaction-first version: it has explanatory reading, worked examples, bridges, source notes, one classification task, one context task, one evidence scenario, a retrieval quiz, and a final application plan. However, it does not yet meet the new **From No AI to Know AI** scope.

The title and opening still frame AI as a general introduction rather than a deliberate journey from historical misconception to modern understanding. The history is limited to brief references to Turing and Dartmouth, rather than a learner-friendly account of the decades of research that preceded ChatGPT. The course also introduces modern generative AI before giving learners a clear map of the wider AI landscape: prediction systems, computer vision, language models, multimodal models, recommender systems, and tool-using workflows. As a result, learners meet a powerful language model before understanding what makes it one kind of AI among several.

The current context-prediction activity is correctly placed after explanation but is too small to teach the prediction mechanism deeply. It demonstrates one answer choice rather than letting the learner observe probabilities, revise a prediction, see how context changes a distribution, and connect that process to a response assembled token by token. The revised course needs one central simulation with these stages, plus visual timeline and model-map elements that support the text rather than interrupt it.

The revised curriculum will preserve the current reading-led discipline while moving to a seven-lesson narrative: **1. The myth and the timeline; 2. What AI is and is not; 3. From rules to learning; 4. Prediction as the engine; 5. The modern AI landscape; 6. Models in the world; 7. Using the capability with judgement.** A single central prediction simulation will appear in Lesson 4 only after the learner has encountered training examples, pattern recognition, tokens, and context. Short retrieval questions will then test the whole narrative near the end, followed by a summary that returns to the course’s opening misconception.

## Design premise

This course is designed as a **reading-led learning experience**, not a collection of interactive content blocks. Each lesson uses connected prose to explain one conceptual move. Diagrams, images, videos, and learner actions appear only when they make that move easier to understand, remember, or apply.

The course follows a stable lesson rhythm. It begins by stating why the idea matters, introduces the essential terms, explains the mechanism with a concrete example, then asks the learner to apply or retrieve the idea only after the explanation is complete. Each lesson closes by connecting its conclusion to the question addressed by the following lesson.

| Instructional element | Permitted purpose | Placement rule |
|---|---|---|
| Explanatory prose | Establish concepts, cause-and-effect, limits, and transitions | The dominant element of each lesson; use two to four connected paragraphs before practice. |
| Diagram or image | Show an object, process, relationship, or example that prose alone would make harder to understand | Place next to the sentence or stage it explains. Do not use as decoration. |
| Video | Add motion, a dynamic process, or an alternative explanation | Precede with one viewing question and follow with a short application or reflection. |
| Playable explanation | Let a learner observe a mechanism or compare outcomes | Use only in Lessons 2 and 3, after the core mechanism has been introduced. |
| Knowledge check | Require recall or transfer of material that has already been explained | Use at the end of a concept group, with feedback that explains why. |
| Final action plan | Synthesize a realistic low-risk application and its safeguards | Use after the knowledge check and summary, not as an isolated form. |

## Course sequence

### Course overview and objectives

The opening frame introduces the course as a practical foundation for people who use, assess, or work alongside AI. The objectives explain that learners will identify the role of data and examples, explain why generative systems can be useful without being reliable, and apply an evidence-and-accountability routine to a practical use case. The overview names the sequence: **understand the task, understand the learning process, understand the output, then evaluate the use**.

### Lesson 1 — What AI is for

**Purpose.** Establish a task-centred definition of AI before introducing technical language. The lesson begins with a brief historical context: the field has long asked whether machines can perform parts of reasoning, language, perception, and problem solving. It then moves to a practical definition: an AI system uses methods and data to perform a defined task such as recognising a pattern, making a prediction, or generating a candidate response.

The core example compares a map that predicts travel time, a fraud system that flags an unusual transaction, and a writing tool that produces a draft. Learners are shown that these systems do not share one general ability; they have different tasks, inputs, outputs, and failure modes. The lesson ends with a three-part reading prompt: identify the task, identify what information is used, and identify how the output will be checked.

**Bridge.** Once a task is clear, the next question is how a system obtains the pattern it uses to perform that task.

### Lesson 2 — From rules to learning from examples

**Purpose.** Explain the shift from written rules to learning from examples, then distinguish training from inference. The lesson first explains that a rule-based system follows instructions written in advance. It contrasts this with a system that is shown labelled examples and learns a pattern that may help with a new example. It uses one worked example: classifying support requests as billing, delivery, or product-help requests.

The learner first reads a walkthrough that shows how labels create the target pattern, why varied examples matter, and how missing or biased examples can create a predictable gap. Only then does the course present a short classification exercise. The learner sorts four support messages, sees one ambiguous example, and reads how the ambiguity exposes the limits of a small training set. The lesson introduces the words **training**, **inference**, **dataset**, and **generalisation** in context rather than as disconnected vocabulary cards.

**Bridge.** Learning from examples explains much of modern AI. The next lesson explains why some recent models can respond across so many different tasks.

### Lesson 3 — How generative AI produces a response

**Purpose.** Explain context-sensitive prediction in plain language while avoiding the claim that a model “understands” in the human sense. The lesson introduces tokens as pieces of text, describes a transformer as a model that can weigh useful relationships across a sequence, and explains that a language model generates an answer one likely token at a time.

The worked example compares the unfinished phrase “Please bring an umbrella because the forecast says…” with “Please bring a ladder because the forecast says…”. The learner sees that the surrounding context changes the sensible continuation. A short playable explanation asks the learner to select the most likely next token in two contexts and then makes the connection explicit: the system is using patterns in context, not checking a database for a single true sentence. The lesson finishes by separating fluency from accuracy and connecting this limitation to the evaluation skills developed later.

**Bridge.** A generated response can be useful, but it becomes more consequential when it is connected to tools and a workflow.

### Lesson 4 — From answers to workflows

**Purpose.** Explain the difference between an assistant that returns text and an agentic workflow that can use tools, retrieve information, or take approved steps. The lesson uses a worked workflow: a customer-support assistant receives a question, retrieves an approved policy, prepares a draft reply, and sends it to a human reviewer. The explanation shows where instructions, tool permissions, source retrieval, and review points constrain the workflow.

A simple process diagram is used because it represents the relationships between stages more efficiently than prose alone. The lesson then explains why a system that acts in the physical world or changes a record needs stronger testing and monitoring than a system that only proposes text.

**Bridge.** The more a system influences a decision or action, the more important it becomes to evaluate its output and its evidence.

### Lesson 5 — Checking AI output and claims

**Purpose.** Teach an explicit evaluation routine. The lesson distinguishes a helpful draft from verified information and explains that a fluent response can still be incomplete, outdated, or unsupported. It introduces a short source hierarchy: first-party documents and primary research, then credible independent evaluation, then secondary reporting, with social posts and marketing claims treated as prompts for investigation rather than proof.

The worked example evaluates an AI-generated statement about a company policy. The course shows how to identify a checkable claim, locate the policy source, compare the wording, and record uncertainty when evidence is unavailable. A single applied scenario asks the learner to decide what should be checked before a high-impact claim is shared. Feedback reconnects the decision to the evaluation routine rather than merely marking the choice right or wrong.

**Bridge.** Evidence checking protects against errors in an output. Responsible use also requires attention to data, people, and accountability before a prompt is entered.

### Lesson 6 — Responsible use and next steps

**Purpose.** Synthesize privacy, fairness, oversight, and practical adoption. The lesson explains that a responsible AI use case is not just a useful task; it is a task where the input can be shared safely, the output can be checked, the consequences are understood, and a person remains accountable for the final decision.

The lesson uses two contrasted examples: drafting a meeting outline from non-sensitive notes and making an eligibility decision about a person. The first is a plausible low-risk starting point; the second requires stronger controls, evidence, and human oversight. The lesson closes with a concise routine: choose a bounded task, protect information, check the output, and identify who owns the final decision.

### Knowledge check, synthesis, and action plan

The knowledge check uses five questions, each tied to a preceding lesson. Two questions require retrieval of foundational terms, two require short application of the evaluation routine, and one asks the learner to choose a responsible starting point. The final summary revisits the course objectives, names the three habits that make the content actionable, and asks the learner to create a short plan for one low-risk use case, the evidence they will check, and the human review point.

## Editorial rules for the implementation

The course copy must use direct sentences, concrete examples, and plain definitions. Paragraphs should average two to four sentences. A heading should represent a conceptual shift, not decorate the page. Each lesson must contain an explicit bridge to the next lesson. The only on-screen interactions are the Lesson 2 classification exercise, the Lesson 3 token-choice exercise, the Lesson 5 evidence scenario, the final five-question knowledge check, and the action plan.

## Research basis

This blueprint applies sequencing guidance—easy-to-complex, chronological, or procedural organisation—and chunks explanation into manageable sections. [1] It applies coherence, signaling, segmenting, spatial contiguity, and pre-training principles to prevent decorative or disconnected media from increasing cognitive load. [2] It places retrieval practice after explanation and uses a final mixed check to require recall across lessons. [3]

### References

[1]: https://guides.uflib.ufl.edu/instructional-video-best-practices/content-sequencing "University of Florida Libraries — Content Sequencing"
[2]: https://cms.cel.uwaterloo.ca/honeycomb/useful.aspx "University of Waterloo — Creating Useful Online Learning Experiences"
[3]: https://id.uwex.edu/blog/retrieval-practice-in-online-courses/ "UW Extended Campus — Retrieval Practice in Online Courses"
