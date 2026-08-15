import type { Video, Resource, Source } from './types'

/**
 * The verified media register.
 *
 * Every video and link in the course is declared here once and referenced by
 * id from the lessons, so the course cannot contain a link that has not been
 * through this file.
 *
 * ── What "verified" means here, precisely ────────────────────────────────
 * On 15 August 2026 every video id below was resolved against YouTube's own
 * search and oEmbed endpoints. The `title`, `channel` and `length` fields are
 * the values YouTube returned — they are not written from memory and not
 * paraphrased. Every URL in RESOURCES was requested and returned HTTP 200.
 *
 * What could NOT be verified from this environment, and is therefore absent:
 * exact publication dates and caption tracks. YouTube blocks the endpoint that
 * carries them. Rather than print a plausible-looking date, the field does not
 * exist. If this course is ever maintained with a YouTube Data API key, dates
 * and caption status can be filled in programmatically — the model has room
 * for them.
 *
 * Durations change only when a creator re-uploads, and titles change rarely,
 * but both do happen: `checked` is the date to re-run the verification from.
 */

const CHECKED = '2026-08-15'

export const VIDEOS: Video[] = [
  {
    id: 'v-ai-landscape', yt: 'qYNweeDHiyU', length: '10:01',
    title: 'AI, Machine Learning, Deep Learning and Generative AI Explained',
    channel: 'IBM Technology',
    purpose: 'Sets the four nested words straight before anything else is built on them.',
    watchFor: 'Write down the four terms as circles inside circles. You will need that picture in every later module.',
    access: 'Whiteboard-and-narration. The diagram carries most of the meaning, so it is visually dependent; the transcript alone loses some of it.',
    backup: 'v-ai-duke', checked: CHECKED
  },
  {
    id: 'v-ai-duke', yt: 'c0m6yaGlZh4', length: '1:40',
    title: 'What is Artificial Intelligence? | Quick Learner',
    channel: 'Duke University',
    purpose: 'A ninety-second university definition, useful as a second opinion on the first one.',
    watchFor: 'Note where this definition differs from IBM’s. Neither is wrong — the field genuinely does not have one definition.',
    access: 'Short, narrated, low visual dependence.',
    checked: CHECKED
  },
  {
    id: 'v-turing', yt: '3wLqsRLvV-c', length: '4:43',
    title: 'The Turing test: Can a computer pass for a human? - Alex Gendler',
    channel: 'TED-Ed',
    purpose: 'The imitation game as Turing actually framed it, and the standard objections to it.',
    watchFor: 'Turing’s question is not "can machines think". Catch what he replaced it with, and why he thought the swap was an improvement.',
    access: 'Animated with narration; captions available on TED-Ed as standard. Moderate visual dependence.',
    backup: 'v-dartmouth', checked: CHECKED
  },
  {
    id: 'v-dartmouth', yt: '3FX2wmJ1fAQ', length: '1:33',
    title: 'Early AI: The 1956 Dartmouth Conference',
    channel: 'Computer History Museum',
    purpose: 'The founding event, from the museum that holds the archive.',
    watchFor: 'The claim in the original proposal — that a two-month, ten-person study could make significant progress. Hold onto how confident that sounds.',
    access: 'Archive footage with narration. Short enough to rewatch.',
    checked: CHECKED
  },
  {
    id: 'v-symbolic', yt: 'WHCo4m2VOws', length: '13:22',
    title: 'Symbolic AI: Crash Course AI #10',
    channel: 'CrashCourse',
    purpose: 'What the first thirty years of AI actually built, explained without condescension toward it.',
    watchFor: 'Two things symbolic systems are genuinely better at than a neural network. They exist, and this module argues they still matter.',
    access: 'Fast-paced with on-screen graphics; CrashCourse captions its catalogue. Moderate visual dependence.',
    checked: CHECKED
  },
  {
    id: 'v-lighthill', yt: '03p2CADwGF8', length: '1:23:12', start: 0,
    title: 'The Lighthill debate on Artificial Intelligence: "The general purpose robot is a mirage"',
    channel: 'Pierre-Yves Oudeyer',
    purpose: 'A primary-source artifact: the 1973 BBC debate that helped end British AI funding, in the participants’ own voices.',
    watchFor: 'Optional and long. Watch the first ten minutes only. Listen for the specific criticism — combinatorial explosion — rather than the general scepticism.',
    access: 'Archival broadcast; audio quality is of its period. Auto-captions only. Treat as an artifact, not an explainer.',
    checked: CHECKED
  },
  {
    id: 'v-lisp-bust', yt: 'sV7C6Ezl35A', length: '45:21', start: 0,
    title: 'A Cult AI Computer’s Boom and Bust',
    channel: 'Asianometry',
    purpose: 'The commercial collapse of the expert-systems era, told through the Lisp machine companies that died with it.',
    watchFor: 'Optional extension. The mechanism of the crash: the hardware advantage evaporated when ordinary workstations caught up.',
    access: 'Narrated with diagrams and archival images. Long — treat as extension viewing.',
    checked: CHECKED
  },
  {
    id: 'v-supervised', yt: 'W01tIRP_Rqs', length: '7:08',
    title: 'Supervised vs. Unsupervised Learning',
    channel: 'IBM Technology',
    purpose: 'The two core learning setups, with the labelling difference made concrete.',
    watchFor: 'What a "label" actually is, and who has to make one. That answer is where most of the cost of machine learning lives.',
    access: 'Whiteboard format, visually dependent on the diagram.',
    checked: CHECKED
  },
  {
    id: 'v-rlhf', yt: 'T_X4XFwKX8k', length: '11:29',
    title: 'Reinforcement Learning from Human Feedback (RLHF) Explained',
    channel: 'IBM Technology',
    purpose: 'How a raw language model becomes an assistant — the step most explanations skip.',
    watchFor: 'Where the human judgement enters, and what that implies about whose preferences a model ends up reflecting.',
    access: 'Whiteboard format with diagram; moderate visual dependence.',
    checked: CHECKED
  },
  {
    id: 'v-nn1', yt: 'aircAruvnKk', length: '18:40',
    title: 'But what is a neural network? | Deep learning chapter 1',
    channel: '3Blue1Brown',
    purpose: 'The best visual account of what a neural network is that exists for free.',
    watchFor: 'A "weight" and a "bias" as pictures rather than words. If you get those two, the rest of the course is downhill.',
    access: 'Heavily visual, precisely narrated, captioned. The animation is the explanation — audio alone is not sufficient.',
    backup: 'v-first-nns', checked: CHECKED
  },
  {
    id: 'v-backprop', yt: 'Ilg3gGewQ5U', length: '12:47',
    title: 'Backpropagation, intuitively | Deep Learning Chapter 3',
    channel: '3Blue1Brown',
    purpose: 'The learning algorithm itself, at the level of intuition rather than calculus.',
    watchFor: 'The idea that every training example "votes" on how each weight should move.',
    access: 'Heavily visual and captioned. Chapter 4 covers the same ground with the calculus if you want it.',
    checked: CHECKED
  },
  {
    id: 'v-first-nns', yt: 'e5dVSygXbAE', length: '18:52',
    title: 'The First Neural Networks',
    channel: 'Asianometry',
    purpose: 'The perceptron era as history — including the 1958 press coverage that promised far more than the machine delivered.',
    watchFor: 'The gap between what the perceptron did and what newspapers said it did. That gap is a pattern you will see three more times today.',
    access: 'Narrated with archival images; low reliance on live animation.',
    checked: CHECKED
  },
  {
    id: 'v-imagenet', yt: 'gC_PoPye_CQ', length: '3:52',
    title: 'The ImageNet Moment with Geoff Hinton | Best Bits',
    channel: 'The Robot Brains Podcast',
    purpose: 'One of the people who did it describing the moment the field turned, in under four minutes.',
    watchFor: 'What actually changed in 2012. It was not a new idea — it was three old ones arriving together.',
    access: 'Interview clip; audio-led, so it works without watching.',
    checked: CHECKED
  },
  {
    id: 'v-alphago', yt: 'WXuK6gekU1Y', length: '1:30:28', start: 3060,
    title: 'AlphaGo - The Movie | Full award-winning documentary',
    channel: 'Google DeepMind',
    purpose: 'Move 37 and the human reaction to it — the clearest footage of a machine doing something its builders could not have specified.',
    watchFor: 'Optional and feature-length. The segment around the 51-minute mark covers game two and Move 37. Watch the commentators, not the board.',
    access: 'Documentary with subtitles; released free by the lab that built the system, so read it as an interested party’s account.',
    checked: CHECKED
  },
  {
    id: 'v-transformers', yt: 'wjZofJX0v4M', length: '27:14',
    title: 'Transformers, the tech behind LLMs | Deep Learning Chapter 5',
    channel: '3Blue1Brown',
    purpose: 'The architecture behind every current large model, drawn rather than described.',
    watchFor: 'What a token is, what an embedding is, and why "meaning" ends up being a direction in space.',
    access: 'Heavily visual and captioned. Long for a micro-lesson — budget it as its own sitting.',
    backup: 'v-transformers-yc', checked: CHECKED
  },
  {
    id: 'v-attention', yt: 'eMlx5fFNoYc', length: '26:10',
    title: 'Attention in transformers, step-by-step | Deep Learning Chapter 6',
    channel: '3Blue1Brown',
    purpose: 'Attention on its own, for anyone who wants the mechanism and not just the metaphor.',
    watchFor: 'Extension viewing. How a word’s meaning is updated by the words around it.',
    access: 'Heavily visual and captioned; the most technical video in the course.',
    checked: CHECKED
  },
  {
    id: 'v-transformers-yc', yt: 'JZLZQVmfGn8', length: '9:19',
    title: 'Transformers Explained: The Discovery That Changed AI Forever',
    channel: 'Y Combinator',
    purpose: 'A nine-minute version of the same story, if twenty-seven minutes is not available today.',
    watchFor: 'The problem transformers solved that recurrent networks could not: reading a sequence all at once instead of one step at a time.',
    access: 'Talking-head with graphics; moderate visual dependence.',
    checked: CHECKED
  },
  {
    id: 'v-gpt-build', yt: 'kCc8FmEb1nY', length: '1:56:20',
    title: "Let's build GPT: from scratch, in code, spelled out.",
    channel: 'Andrej Karpathy',
    purpose: 'For anyone who wants to stop taking it on trust and watch a small language model get built line by line.',
    watchFor: 'Extension only, and genuinely advanced. Requires Python. Nothing later in this course depends on it.',
    access: 'Screen-recorded live coding; captions available. Requires reading code on screen.',
    checked: CHECKED
  },
  {
    id: 'v-diffusion', yt: 'x2GRE-RzmD8', length: '12:05',
    title: 'Diffusion Models for AI Image Generation',
    channel: 'IBM Technology',
    purpose: 'How image generation works, which is a genuinely different mechanism from text generation.',
    watchFor: 'The training trick: teach a model to remove noise, then start it from pure noise and let it "remove" its way to a picture.',
    access: 'Whiteboard format; visually dependent.',
    backup: 'v-text2image', checked: CHECKED
  },
  {
    id: 'v-text2image', yt: '9YrYDqhJdPw', length: '5:49',
    title: 'Text-to-image generation explained',
    channel: 'Google Research',
    purpose: 'The same mechanism in under six minutes, from a lab that publishes on it.',
    watchFor: 'How the text prompt actually steers the denoising. Note that this is a research group explaining its own work.',
    access: 'Narrated animation; captions available.',
    checked: CHECKED
  },
  {
    id: 'v-images-deep', yt: 'iv-5mZ_9CPY', length: '37:20',
    title: 'But how do AI images and videos actually work? | Guest video by Welch Labs',
    channel: '3Blue1Brown',
    purpose: 'The full mechanism, for learners who found the twelve-minute version unsatisfying.',
    watchFor: 'Extension only. The relationship between the noise schedule and image quality.',
    access: 'Heavily visual, captioned, long.',
    checked: CHECKED
  },
  {
    id: 'v-rag', yt: 'T-D1OfcDW1M', length: '6:36',
    title: 'What is Retrieval-Augmented Generation (RAG)?',
    channel: 'IBM Technology',
    purpose: 'The standard fix for "the model does not know about your documents, and makes things up about them".',
    watchFor: 'Which failure RAG fixes and which it does not. It reduces invention; it does not eliminate it.',
    access: 'Whiteboard format; visually dependent.',
    checked: CHECKED
  },
  {
    id: 'v-alphafold', yt: '7q8Uw3rmXyE', length: '5:15',
    title: 'What Is AlphaFold? | NEJM',
    channel: 'NEJM Group',
    purpose: 'The clearest case of AI producing scientific value, explained by a medical journal rather than by the lab that built it.',
    watchFor: 'What problem was actually solved, and what it did not solve. Structure prediction is not drug discovery.',
    access: 'Narrated animation; captions available.',
    backup: 'v-alphafold-long', checked: CHECKED
  },
  {
    id: 'v-alphafold-long', yt: 'P_fHJIYENdI', length: '24:52',
    title: 'AlphaFold - The Most Useful Thing AI Has Ever Done',
    channel: 'Veritasium',
    purpose: 'The long version, with the history of the protein-folding problem attached.',
    watchFor: 'Extension viewing. Note the title is a claim, not a finding — the video argues for it rather than assuming it.',
    access: 'Heavily produced documentary style; captioned.',
    checked: CHECKED
  },
  {
    id: 'v-robots', yt: 'UQZooauU-FQ', length: '24:02', start: 0,
    title: 'Humanoid Robots and the Gap Between Hype and Reality | Bloomberg Primer',
    channel: 'Bloomberg Originals',
    purpose: 'Robotics assessed against demos rather than through them — the exact scepticism this course is trying to teach.',
    watchFor: 'Optional. Every time a demo is shown, ask what was cut, how many takes there were, and whether the robot was teleoperated.',
    access: 'Broadcast journalism with captions; moderate visual dependence.',
    checked: CHECKED
  },
  {
    id: 'v-hallucinate', yt: 'cfqtFvWOfg0', length: '9:38',
    title: 'Why Large Language Models Hallucinate',
    channel: 'IBM Technology',
    purpose: 'Invention as a predictable consequence of the mechanism, not as a bug someone forgot to fix.',
    watchFor: 'Why "just make it not do that" is harder than it sounds.',
    access: 'Whiteboard format; visually dependent.',
    backup: 'v-hallucinate-2', checked: CHECKED
  },
  {
    id: 'v-hallucinate-2', yt: '005JLRt3gXI', length: '5:14',
    title: 'Why do AI models hallucinate?',
    channel: 'Claude',
    purpose: 'A shorter account, published by a frontier lab about its own systems.',
    watchFor: 'Read it as an interested party: a lab explaining a limitation of its own product. Useful, and not neutral.',
    access: 'Narrated with graphics; captions available.',
    checked: CHECKED
  },
  {
    id: 'v-ai-safety', yt: 'IB1OvoCNnWY', length: '6:03',
    title: 'AI Safety - Computerphile',
    channel: 'Computerphile',
    purpose: 'Six minutes on why specifying what you want is the hard part.',
    watchFor: 'The difference between a system that fails and a system that succeeds at the wrong thing.',
    access: 'Interview to camera; captions available; low visual dependence.',
    backup: 'v-stop-button', checked: CHECKED
  },
  {
    id: 'v-stop-button', yt: '3TYT1QfdfsM', length: '20:00',
    title: 'AI "Stop Button" Problem - Computerphile',
    channel: 'Computerphile',
    purpose: 'A concrete thought experiment about why "just turn it off" is not a plan.',
    watchFor: 'Extension. Follow the argument as a series of fixes, each of which breaks in a new way.',
    access: 'Interview to camera with paper diagrams; captions available.',
    checked: CHECKED
  },
  {
    id: 'v-bias', yt: 'gV0_raKR2UQ', length: '11:20',
    title: 'Algorithmic Bias and Fairness: Crash Course AI #18',
    channel: 'CrashCourse',
    purpose: 'Where bias enters a system — five distinct places, only one of which is the algorithm.',
    watchFor: 'The five sources. Most arguments about "biased AI" are arguing about different ones without noticing.',
    access: 'Fast-paced with graphics; captioned.',
    backup: 'v-bias-ibm', checked: CHECKED
  },
  {
    id: 'v-bias-ibm', yt: 'og67qeTZPYs', length: '8:38',
    title: 'Algorithmic Bias in AI: What It Is and How to Fix It',
    channel: 'IBM Technology',
    purpose: 'The same territory framed around mitigation rather than diagnosis.',
    watchFor: 'Which mitigations are technical and which are organisational. Most are organisational.',
    access: 'Whiteboard format; visually dependent.',
    checked: CHECKED
  }
]

export const RESOURCES: Resource[] = [
  { id: 'r-turing-paper', title: 'Computing Machinery and Intelligence (Turing, 1950)', url: 'https://courses.cs.umbc.edu/471/papers/turing.pdf',
    kind: 'paper', minutes: 45, level: 'intermediate', optional: false, access: 'open', checked: CHECKED,
    purpose: 'The original paper. Read section 1 and section 6 — Turing answers nine objections, and they are still the nine objections.' },
  { id: 'r-turing-sep', title: 'The Turing Test — Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/turing-test/',
    kind: 'reference', minutes: 30, level: 'intermediate', optional: true, access: 'open', checked: CHECKED,
    purpose: 'A careful account of what the test does and does not establish, including the strongest objections to it.' },
  { id: 'r-ai-sep', title: 'Artificial Intelligence — Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/artificial-intelligence/',
    kind: 'reference', minutes: 40, level: 'advanced', optional: true, access: 'open', checked: CHECKED,
    purpose: 'The definitional problem taken seriously, by people whose job is definitions.' },
  { id: 'r-dartmouth', title: 'A Proposal for the Dartmouth Summer Research Project on AI (1955)', url: 'https://ojs.aaai.org/aimagazine/index.php/aimagazine/article/view/1904',
    kind: 'archive', minutes: 15, level: 'beginner', optional: false, access: 'open', checked: CHECKED,
    purpose: 'The founding document, republished by AAAI. Two pages. The confidence of it is the lesson.' },
  { id: 'r-chm-timeline', title: 'AI and Robotics timeline — Computer History Museum', url: 'https://www.computerhistory.org/timeline/ai-robotics/',
    kind: 'archive', minutes: 20, level: 'beginner', optional: false, access: 'open', checked: CHECKED,
    purpose: 'A curated timeline from a museum archive rather than a blog. Use it to check any date this course gives you.' },
  { id: 'r-lighthill', title: 'The Lighthill Report: Artificial Intelligence: A General Survey (1973)', url: 'https://www.chilton-computing.org.uk/inf/literature/reports/lighthill_report/contents.htm',
    kind: 'archive', minutes: 35, level: 'intermediate', optional: true, access: 'open', checked: CHECKED,
    purpose: 'The report that helped end British AI funding. Read the summary and conclusions to see what a well-argued negative assessment looks like.' },
  { id: 'r-perceptron-play', title: 'TensorFlow Playground', url: 'https://playground.tensorflow.org/',
    kind: 'interactive', minutes: 15, level: 'beginner', optional: false, access: 'open', checked: CHECKED,
    purpose: 'Train a neural network in your browser with sliders. The fastest way to feel what "learning" means here.' },
  { id: 'r-teachable', title: 'Teachable Machine', url: 'https://teachablemachine.withgoogle.com/',
    kind: 'tool', minutes: 20, level: 'beginner', optional: false, access: 'open', checked: CHECKED,
    purpose: 'Train an image classifier with your webcam in ten minutes, no code. Then try to break it — that is the exercise.' },
  { id: 'r-quickdraw', title: 'Quick, Draw!', url: 'https://quickdraw.withgoogle.com/',
    kind: 'interactive', minutes: 10, level: 'beginner', optional: true, access: 'open', checked: CHECKED,
    purpose: 'A recognition model you can play against, with the training data published. Useful for seeing what a dataset is.' },
  { id: 'r-ml-glossary', title: 'Machine Learning Glossary — Google for Developers', url: 'https://developers.google.com/machine-learning/glossary',
    kind: 'reference', minutes: 10, level: 'beginner', optional: false, access: 'open', checked: CHECKED,
    purpose: 'The reference to keep open. Every term in this course is defined there too, usually more precisely.' },
  { id: 'r-attention-paper', title: 'Attention Is All You Need (Vaswani et al., 2017)', url: 'https://arxiv.org/abs/1706.03762',
    kind: 'paper', minutes: 60, level: 'advanced', optional: true, access: 'open', checked: CHECKED,
    purpose: 'The transformer paper. Read the abstract and figure 1 even if you read nothing else — that diagram is the shape of modern AI.' },
  { id: 'r-illustrated-transformer', title: 'The Illustrated Transformer — Jay Alammar', url: 'https://jalammar.github.io/illustrated-transformer/',
    kind: 'article', minutes: 35, level: 'intermediate', optional: false, access: 'open', checked: CHECKED,
    purpose: 'The paper above, redrawn for people. The single most useful bridge between "I watched a video" and "I read the paper".' },
  { id: 'r-transformer-explainer', title: 'Transformer Explainer — Georgia Tech (Polo Club)', url: 'https://poloclub.github.io/transformer-explainer/',
    kind: 'interactive', minutes: 20, level: 'intermediate', optional: false, access: 'open', checked: CHECKED,
    purpose: 'A live GPT-2 running in your browser with every internal step visualised. Type a sentence and watch the prediction form.' },
  { id: 'r-alexnet', title: 'ImageNet Classification with Deep Convolutional Neural Networks (2012)', url: 'https://papers.nips.cc/paper_files/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html',
    kind: 'paper', minutes: 50, level: 'advanced', optional: true, access: 'open', checked: CHECKED,
    purpose: 'The AlexNet paper — the result that restarted the field. Read the abstract and section 6.' },
  { id: 'r-foundation-models', title: 'On the Opportunities and Risks of Foundation Models (2021)', url: 'https://arxiv.org/abs/2108.07258',
    kind: 'paper', minutes: 45, level: 'advanced', optional: true, access: 'open', checked: CHECKED,
    purpose: 'Where the term "foundation model" comes from, and the argument about what building on one implies. Read the introduction.' },
  { id: 'r-ai-index', title: 'AI Index Report — Stanford HAI', url: 'https://aiindex.stanford.edu/report/',
    kind: 'reference', minutes: 40, level: 'intermediate', optional: false, access: 'open', checked: CHECKED,
    purpose: 'Annual measured data on capability, cost, adoption and incidents. When you need a number instead of a vibe, start here.' },
  { id: 'r-nist-rmf', title: 'AI Risk Management Framework — NIST', url: 'https://www.nist.gov/itl/ai-risk-management-framework',
    kind: 'policy', minutes: 30, level: 'intermediate', optional: false, access: 'open', checked: CHECKED,
    purpose: 'A government standards body’s structure for thinking about AI risk. Practical, not philosophical.' },
  { id: 'r-eu-ai-act', title: 'The EU AI Act', url: 'https://artificialintelligenceact.eu/',
    kind: 'policy', minutes: 30, level: 'intermediate', optional: true, access: 'open', checked: CHECKED,
    purpose: 'The first comprehensive AI regulation. Skim the risk tiers — they are a useful way to classify any system you meet.' },
  { id: 'r-oecd', title: 'OECD AI Principles', url: 'https://oecd.ai/en/ai-principles',
    kind: 'policy', minutes: 15, level: 'beginner', optional: true, access: 'open', checked: CHECKED,
    purpose: 'The most widely adopted international statement of what responsible AI is supposed to mean.' },
  { id: 'r-model-cards', title: 'Model Cards', url: 'https://modelcards.withgoogle.com/about',
    kind: 'reference', minutes: 15, level: 'beginner', optional: false, access: 'open', checked: CHECKED,
    purpose: 'The documentation format you should ask for before trusting any model. If a vendor cannot produce one, that is information.' },
  { id: 'r-model-spec', title: 'OpenAI Model Spec', url: 'https://model-spec.openai.com/',
    kind: 'reference', minutes: 30, level: 'intermediate', optional: true, access: 'open', checked: CHECKED,
    purpose: 'A published statement of how one lab intends its models to behave. Read it as a design document, not a guarantee.' },
  { id: 'r-anthropic-research', title: 'Anthropic Research', url: 'https://www.anthropic.com/research',
    kind: 'reference', minutes: 20, level: 'advanced', optional: true, access: 'open', checked: CHECKED,
    purpose: 'Frontier-lab publications on interpretability and safety. Primary source, and an interested party — both are true.' },
  { id: 'r-transformer-circuits', title: 'Transformer Circuits Thread', url: 'https://transformer-circuits.pub/',
    kind: 'paper', minutes: 60, level: 'advanced', optional: true, access: 'open', checked: CHECKED,
    purpose: 'Interpretability research: attempts to work out what is actually happening inside a model. Hard, and the honest answer to "does anyone know how it works".' },
  { id: 'r-alphafold-db', title: 'AlphaFold Protein Structure Database — EMBL-EBI', url: 'https://alphafold.ebi.ac.uk/',
    kind: 'tool', minutes: 15, level: 'beginner', optional: false, access: 'open', checked: CHECKED,
    purpose: 'The actual output: predicted structures, free, searchable. Look up a protein and read the confidence colouring.' },
  { id: 'r-elements', title: 'Elements of AI — University of Helsinki', url: 'https://www.elementsofai.com/',
    kind: 'course', minutes: 30, level: 'beginner', optional: true, access: 'account', checked: CHECKED,
    purpose: 'A free university course covering this ground more slowly. The obvious next step after today.' },
  { id: 'r-hf-learn', title: 'Hugging Face Learn', url: 'https://huggingface.co/learn',
    kind: 'course', minutes: 30, level: 'intermediate', optional: true, access: 'open', checked: CHECKED,
    purpose: 'Free hands-on courses if you decide you want to build rather than evaluate.' },
  { id: 'r-distill', title: 'Distill', url: 'https://distill.pub/',
    kind: 'article', minutes: 40, level: 'advanced', optional: true, access: 'open', checked: CHECKED,
    purpose: 'An archive of interactive machine-learning explanations. No longer publishing; still the high-water mark for explaining this material.' },
  { id: 'r-mit-tr', title: 'MIT Technology Review — Artificial Intelligence', url: 'https://www.technologyreview.com/',
    kind: 'article', minutes: 20, level: 'beginner', optional: true, access: 'paywalled', checked: CHECKED,
    purpose: 'Reporting that distinguishes announcements from results more reliably than most. Partial paywall.' },
  { id: 'r-ieee', title: 'IEEE Spectrum', url: 'https://spectrum.ieee.org/',
    kind: 'article', minutes: 20, level: 'intermediate', optional: true, access: 'open', checked: CHECKED,
    purpose: 'Engineering-press coverage, useful for robotics and hardware claims where consumer press is weakest.' }
]

/**
 * The source register. Everything the course asserts that a reader might
 * reasonably want to check, with what supports it and how strongly.
 */
export const SOURCES: Source[] = [
  { id: 's-turing', title: 'Computing Machinery and Intelligence', publisher: 'Mind, Vol. LIX, No. 236', kind: 'primary', published: 'October 1950',
    url: 'https://courses.cs.umbc.edu/471/papers/turing.pdf', checked: CHECKED, confidence: 'high',
    supports: 'Turing proposed the imitation game in 1950 and replaced "can machines think" with an operational test.' },
  { id: 's-dartmouth', title: 'A Proposal for the Dartmouth Summer Research Project on Artificial Intelligence', publisher: 'AI Magazine (AAAI), reprint of the 1955 proposal', kind: 'primary', published: '1955 (reprinted 2006)',
    url: 'https://ojs.aaai.org/aimagazine/index.php/aimagazine/article/view/1904', checked: CHECKED, confidence: 'high',
    supports: 'The term "artificial intelligence" was coined in the 1955 proposal for the 1956 Dartmouth workshop.' },
  { id: 's-lighthill', title: 'Artificial Intelligence: A General Survey (the Lighthill Report)', publisher: 'UK Science Research Council', kind: 'primary', published: '1973',
    url: 'https://www.chilton-computing.org.uk/inf/literature/reports/lighthill_report/contents.htm', checked: CHECKED, confidence: 'high',
    supports: 'A 1973 UK government-commissioned report criticised AI research for failing to scale beyond toy problems, and was followed by funding cuts.' },
  { id: 's-alexnet', title: 'ImageNet Classification with Deep Convolutional Neural Networks', publisher: 'NeurIPS (NIPS 2012)', kind: 'primary', published: '2012',
    url: 'https://papers.nips.cc/paper_files/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html', checked: CHECKED, confidence: 'high',
    supports: 'A deep convolutional network trained on GPUs won the 2012 ImageNet competition by a large margin, restarting mainstream interest in neural networks.' },
  { id: 's-transformer', title: 'Attention Is All You Need', publisher: 'NeurIPS / arXiv:1706.03762', kind: 'primary', published: '2017',
    url: 'https://arxiv.org/abs/1706.03762', checked: CHECKED, confidence: 'high',
    supports: 'The transformer architecture, introduced in 2017, underpins current large language models.' },
  { id: 's-foundation', title: 'On the Opportunities and Risks of Foundation Models', publisher: 'Stanford CRFM / arXiv:2108.07258', kind: 'primary', published: '2021',
    url: 'https://arxiv.org/abs/2108.07258', checked: CHECKED, confidence: 'high',
    supports: 'The term "foundation model" and the argument that many downstream systems inherit one upstream model’s properties.' },
  { id: 's-ai-index', title: 'AI Index Report', publisher: 'Stanford Institute for Human-Centered AI', kind: 'secondary',
    url: 'https://aiindex.stanford.edu/report/', checked: CHECKED, confidence: 'high',
    supports: 'Measured trends in capability, training cost, adoption and reported incidents. Use for any quantitative claim.' },
  { id: 's-nist', title: 'AI Risk Management Framework (AI RMF 1.0)', publisher: 'US National Institute of Standards and Technology', kind: 'primary',
    url: 'https://www.nist.gov/itl/ai-risk-management-framework', checked: CHECKED, confidence: 'high',
    supports: 'A published, government-standards framing of AI risk categories and governance practice.' },
  { id: 's-eu-act', title: 'EU Artificial Intelligence Act', publisher: 'European Union (summary portal)', kind: 'primary',
    url: 'https://artificialintelligenceact.eu/', checked: CHECKED, confidence: 'high',
    supports: 'The EU has adopted a risk-tiered regulatory framework for AI systems.' },
  { id: 's-alphafold', title: 'AlphaFold Protein Structure Database', publisher: 'EMBL-EBI and Google DeepMind', kind: 'primary',
    url: 'https://alphafold.ebi.ac.uk/', checked: CHECKED, confidence: 'high',
    supports: 'Predicted protein structures at scale are published openly and are in routine use by biologists.' },
  { id: 's-chm', title: 'AI and Robotics timeline', publisher: 'Computer History Museum', kind: 'reference',
    url: 'https://www.computerhistory.org/timeline/ai-robotics/', checked: CHECKED, confidence: 'high',
    supports: 'Dates and sequence for the historical modules.' },
  { id: 's-circuits', title: 'Transformer Circuits Thread', publisher: 'Anthropic', kind: 'primary',
    url: 'https://transformer-circuits.pub/', checked: CHECKED, confidence: 'medium',
    supports: 'Interpretability findings about model internals. Primary research, published by a lab with a commercial interest in the subject.' },
  { id: 's-model-spec', title: 'Model Spec', publisher: 'OpenAI', kind: 'primary',
    url: 'https://model-spec.openai.com/', checked: CHECKED, confidence: 'medium',
    supports: 'A lab’s stated intentions for model behaviour. Evidence of intent, not of behaviour.' }
]

export const videoById = (id: string) => VIDEOS.find(v => v.id === id)
export const resourceById = (id: string) => RESOURCES.find(r => r.id === id)
export const sourceById = (id: string) => SOURCES.find(s => s.id === id)
