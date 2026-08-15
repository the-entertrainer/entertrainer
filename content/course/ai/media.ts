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
    purpose: 'Explains the four related words clearly before you learn anything else.',
    watchFor: 'Write down the four terms as circles inside circles. You will use this picture in every later module.',
    access: 'This video uses a whiteboard and spoken narration. The picture carries most of the meaning, so watching matters more than just reading the transcript.',
    backup: 'v-ai-duke', checked: CHECKED
  },
  {
    id: 'v-ai-duke', yt: 'c0m6yaGlZh4', length: '1:40',
    title: 'What is Artificial Intelligence? | Quick Learner',
    channel: 'Duke University',
    purpose: 'A ninety-second definition from a university. Use it as a second opinion on the first video.',
    watchFor: 'Notice where this definition is different from the first video. Neither one is wrong — this field simply does not have one single definition.',
    access: 'Short video with spoken narration. You do not need to watch closely to follow it.',
    checked: CHECKED
  },
  {
    id: 'v-turing', yt: '3wLqsRLvV-c', length: '4:43',
    title: 'The Turing test: Can a computer pass for a human? - Alex Gendler',
    channel: 'TED-Ed',
    purpose: 'Explains the imitation game the way Turing actually described it, and the common objections to it.',
    watchFor: 'Turing did not ask "can machines think". Notice what question he asked instead, and why he thought it was a better question.',
    access: 'Animated video with narration. Captions are available. Watching helps, but is not essential.',
    backup: 'v-dartmouth', checked: CHECKED
  },
  {
    id: 'v-dartmouth', yt: '3FX2wmJ1fAQ', length: '1:33',
    title: 'Early AI: The 1956 Dartmouth Conference',
    channel: 'Computer History Museum',
    purpose: 'The event where the field began, told by the museum that keeps the archive.',
    watchFor: 'Listen for the claim in the original proposal: that ten people, working for two months, could make major progress. Notice how confident that sounds.',
    access: 'Old archive footage with narration. Short enough to watch twice.',
    checked: CHECKED
  },
  {
    id: 'v-symbolic', yt: 'WHCo4m2VOws', length: '13:22',
    title: 'Symbolic AI: Crash Course AI #10',
    channel: 'CrashCourse',
    purpose: 'Explains what the first thirty years of AI actually built, and treats that work with respect.',
    watchFor: 'Watch for two things that older, rule-based systems still do better than a neural network. These things exist, and this module explains why they still matter.',
    access: 'Fast-paced video with on-screen graphics. Captions are available. Watching helps but is not essential.',
    checked: CHECKED
  },
  {
    id: 'v-lighthill', yt: '03p2CADwGF8', length: '1:23:12', start: 0,
    title: 'The Lighthill debate on Artificial Intelligence: "The general purpose robot is a mirage"',
    channel: 'Pierre-Yves Oudeyer',
    purpose: 'A real recording: the 1973 BBC debate that helped end AI funding in Britain, in the speakers’ own words.',
    watchFor: 'Optional and long. Watch only the first ten minutes. Listen for one specific criticism, called "combinatorial explosion", rather than the general doubt in the room.',
    access: 'Old broadcast recording. The sound quality is dated, and only automatic captions are available. Treat it as a historical record, not a clear explanation.',
    checked: CHECKED
  },
  {
    id: 'v-lisp-bust', yt: 'sV7C6Ezl35A', length: '45:21', start: 0,
    title: 'A Cult AI Computer’s Boom and Bust',
    channel: 'Asianometry',
    purpose: 'Tells the story of how the expert-systems business collapsed, through the companies that made Lisp machines and then failed.',
    watchFor: 'Optional extra video. Watch for why the crash happened: these companies’ special hardware stopped being special once ordinary computers caught up.',
    access: 'Narrated video with diagrams and old images. It is long, so treat it as extra, optional viewing.',
    checked: CHECKED
  },
  {
    id: 'v-supervised', yt: 'W01tIRP_Rqs', length: '7:08',
    title: 'Supervised vs. Unsupervised Learning',
    channel: 'IBM Technology',
    purpose: 'Explains the two main ways machines learn, and makes the idea of "labelled data" concrete.',
    watchFor: 'Watch for what a "label" actually is, and who has to create one. Making labels is where most of the cost of machine learning comes from.',
    access: 'Whiteboard-style video. The diagram carries much of the meaning, so watching matters.',
    checked: CHECKED
  },
  {
    id: 'v-rlhf', yt: 'T_X4XFwKX8k', length: '11:29',
    title: 'Reinforcement Learning from Human Feedback (RLHF) Explained',
    channel: 'IBM Technology',
    purpose: 'Explains how a raw language model becomes a helpful assistant — a step most explanations leave out.',
    watchFor: 'Watch for where human judgement enters the process, and what that means for whose preferences the model ends up reflecting.',
    access: 'Whiteboard-style video with a diagram. Watching helps but is not essential.',
    checked: CHECKED
  },
  {
    id: 'v-nn1', yt: 'aircAruvnKk', length: '18:40',
    title: 'But what is a neural network? | Deep learning chapter 1',
    channel: '3Blue1Brown',
    purpose: 'The best free video explanation of what a neural network is, with visuals.',
    watchFor: 'Watch for what a "weight" and a "bias" look like as pictures, not just words. Once you understand these two, the rest of the course gets easier.',
    access: 'Very visual video with clear narration and captions. The animation is part of the explanation, so listening alone is not enough — you need to watch.',
    backup: 'v-first-nns', checked: CHECKED
  },
  {
    id: 'v-backprop', yt: 'Ilg3gGewQ5U', length: '12:47',
    title: 'Backpropagation, intuitively | Deep Learning Chapter 3',
    channel: '3Blue1Brown',
    purpose: 'Explains the learning algorithm itself, using intuition rather than mathematics.',
    watchFor: 'Watch for the idea that every training example "votes" on how each weight should change.',
    access: 'Very visual video with captions. A later chapter in this series covers the same idea using mathematics, if you want more detail.',
    checked: CHECKED
  },
  {
    id: 'v-first-nns', yt: 'e5dVSygXbAE', length: '18:52',
    title: 'The First Neural Networks',
    channel: 'Asianometry',
    purpose: 'Tells the history of the perceptron, the earliest neural network — including 1958 news coverage that promised far more than the machine could do.',
    watchFor: 'Watch for the gap between what the perceptron actually did and what newspapers said it did. You will see this same gap three more times today.',
    access: 'Narrated video with old images. You do not need to watch closely to follow it.',
    checked: CHECKED
  },
  {
    id: 'v-imagenet', yt: 'gC_PoPye_CQ', length: '3:52',
    title: 'The ImageNet Moment with Geoff Hinton | Best Bits',
    channel: 'The Robot Brains Podcast',
    purpose: 'One of the people who was there describes, in under four minutes, the moment the field changed.',
    watchFor: 'Watch for what actually changed in 2012. It was not one new idea — it was three older ideas coming together at once.',
    access: 'Interview clip. It is mostly spoken, so you can listen without watching.',
    checked: CHECKED
  },
  {
    id: 'v-alphago', yt: 'WXuK6gekU1Y', length: '1:30:28', start: 3060,
    title: 'AlphaGo - The Movie | Full award-winning documentary',
    channel: 'Google DeepMind',
    purpose: 'Shows "Move 37" and how people reacted to it — the clearest footage of a machine doing something its own builders did not expect.',
    watchFor: 'Optional and full length. The part around the 51-minute mark covers game two and Move 37. Watch the commentators’ reactions, not just the board.',
    access: 'Documentary with subtitles. It was released free by the lab that built the system, so remember it tells the story from their point of view.',
    checked: CHECKED
  },
  {
    id: 'v-transformers', yt: 'wjZofJX0v4M', length: '27:14',
    title: 'Transformers, the tech behind LLMs | Deep Learning Chapter 5',
    channel: '3Blue1Brown',
    purpose: 'Explains the design behind every current large AI model, using drawings instead of just words.',
    watchFor: 'Watch for what a "token" is, what an "embedding" is, and why "meaning" ends up being a direction in space.',
    access: 'Very visual video with captions. It is long for a short lesson, so plan a separate block of time for it.',
    backup: 'v-transformers-yc', checked: CHECKED
  },
  {
    id: 'v-attention', yt: 'eMlx5fFNoYc', length: '26:10',
    title: 'Attention in transformers, step-by-step | Deep Learning Chapter 6',
    channel: '3Blue1Brown',
    purpose: 'Explains "attention" on its own, for anyone who wants the real mechanism, not just a simple comparison.',
    watchFor: 'Optional extra video. Watch for how a word’s meaning changes based on the words around it.',
    access: 'Very visual video with captions. This is the most technical video in the course.',
    checked: CHECKED
  },
  {
    id: 'v-transformers-yc', yt: 'JZLZQVmfGn8', length: '9:19',
    title: 'Transformers Explained: The Discovery That Changed AI Forever',
    channel: 'Y Combinator',
    purpose: 'A shorter, nine-minute version of the same story, if you do not have time for the longer video today.',
    watchFor: 'Watch for the problem transformers solved that older networks could not: reading a whole sequence at once, instead of one step at a time.',
    access: 'Presenter talking to camera with graphics. Watching helps but is not essential.',
    checked: CHECKED
  },
  {
    id: 'v-gpt-build', yt: 'kCc8FmEb1nY', length: '1:56:20',
    title: "Let's build GPT: from scratch, in code, spelled out.",
    channel: 'Andrej Karpathy',
    purpose: 'For anyone who wants to see a small language model built line by line, instead of just taking the explanation on trust.',
    watchFor: 'Optional and genuinely advanced. You need to know the Python programming language. Nothing later in this course depends on watching it.',
    access: 'Screen recording of live coding, with captions available. You need to be able to read code on screen.',
    checked: CHECKED
  },
  {
    id: 'v-diffusion', yt: 'x2GRE-RzmD8', length: '12:05',
    title: 'Diffusion Models for AI Image Generation',
    channel: 'IBM Technology',
    purpose: 'Explains how AI image generation works. This is a genuinely different process from text generation.',
    watchFor: 'Watch for the key trick: train the model to remove noise from a picture, then start it from pure noise and let it "clean up" its way to a new picture.',
    access: 'Whiteboard-style video. Watching matters, since the diagram carries much of the meaning.',
    backup: 'v-text2image', checked: CHECKED
  },
  {
    id: 'v-text2image', yt: '9YrYDqhJdPw', length: '5:49',
    title: 'Text-to-image generation explained',
    channel: 'Google Research',
    purpose: 'Explains the same process in under six minutes, from a research lab that works on this directly.',
    watchFor: 'Watch for how the written prompt actually guides the image-cleaning process. Remember this is a research group describing its own work.',
    access: 'Narrated animation; captions available.',
    checked: CHECKED
  },
  {
    id: 'v-images-deep', yt: 'iv-5mZ_9CPY', length: '37:20',
    title: 'But how do AI images and videos actually work? | Guest video by Welch Labs',
    channel: '3Blue1Brown',
    purpose: 'Explains the full process, for learners who want more than the shorter twelve-minute video gave them.',
    watchFor: 'Optional extra video. Watch for how the noise schedule affects image quality.',
    access: 'Very visual video with captions. It is long.',
    checked: CHECKED
  },
  {
    id: 'v-rag', yt: 'T-D1OfcDW1M', length: '6:36',
    title: 'What is Retrieval-Augmented Generation (RAG)?',
    channel: 'IBM Technology',
    purpose: 'Explains the standard fix for a common problem: the model does not know your documents, so it makes things up about them.',
    watchFor: 'Watch for which problem this method (called RAG) actually fixes, and which it does not. It reduces made-up answers, but it does not remove them completely.',
    access: 'Whiteboard-style video. Watching matters, since the diagram carries much of the meaning.',
    checked: CHECKED
  },
  {
    id: 'v-alphafold', yt: '7q8Uw3rmXyE', length: '5:15',
    title: 'What Is AlphaFold? | NEJM',
    channel: 'NEJM Group',
    purpose: 'The clearest example of AI producing real scientific value, explained by a medical journal instead of the lab that built the tool.',
    watchFor: 'Watch for what problem was actually solved, and what was not solved. Predicting a protein’s shape is not the same as discovering a new drug.',
    access: 'Narrated animation; captions available.',
    backup: 'v-alphafold-long', checked: CHECKED
  },
  {
    id: 'v-alphafold-long', yt: 'P_fHJIYENdI', length: '24:52',
    title: 'AlphaFold - The Most Useful Thing AI Has Ever Done',
    channel: 'Veritasium',
    purpose: 'A longer version of the story, including the history of the protein-folding problem.',
    watchFor: 'Optional extra video. Notice that the title is a claim, not a proven fact — the video argues for it rather than simply assuming it is true.',
    access: 'Well-produced documentary style, with captions.',
    checked: CHECKED
  },
  {
    id: 'v-robots', yt: 'UQZooauU-FQ', length: '24:02', start: 0,
    title: 'Humanoid Robots and the Gap Between Hype and Reality | Bloomberg Primer',
    channel: 'Bloomberg Originals',
    purpose: 'Looks at robotics critically, instead of just showing demos — the exact kind of questioning this course wants you to learn.',
    watchFor: 'Optional. Each time a demo appears, ask yourself: what was edited out, how many attempts did it take, and was a human secretly controlling the robot?',
    access: 'TV-style journalism with captions. Watching helps but is not essential.',
    checked: CHECKED
  },
  {
    id: 'v-hallucinate', yt: 'cfqtFvWOfg0', length: '9:38',
    title: 'Why Large Language Models Hallucinate',
    channel: 'IBM Technology',
    purpose: 'Explains why models make things up as a natural result of how they work, not as a mistake someone forgot to fix.',
    watchFor: 'Watch for why "just stop it from doing that" is harder than it sounds.',
    access: 'Whiteboard-style video. Watching matters, since the diagram carries much of the meaning.',
    backup: 'v-hallucinate-2', checked: CHECKED
  },
  {
    id: 'v-hallucinate-2', yt: '005JLRt3gXI', length: '5:14',
    title: 'Why do AI models hallucinate?',
    channel: 'Claude',
    purpose: 'A shorter explanation, published by a leading AI lab about its own systems.',
    watchFor: 'Remember this is not a neutral source: it is a lab explaining a weakness in its own product. Still useful to watch.',
    access: 'Narrated with graphics; captions available.',
    checked: CHECKED
  },
  {
    id: 'v-ai-safety', yt: 'IB1OvoCNnWY', length: '6:03',
    title: 'AI Safety - Computerphile',
    channel: 'Computerphile',
    purpose: 'A six-minute video on why it is hard to clearly tell a system exactly what you want.',
    watchFor: 'Watch for the difference between a system that fails, and a system that succeeds — but at the wrong goal.',
    access: 'Interview to camera, with captions available. You do not need to watch closely to follow it.',
    backup: 'v-stop-button', checked: CHECKED
  },
  {
    id: 'v-stop-button', yt: '3TYT1QfdfsM', length: '20:00',
    title: 'AI "Stop Button" Problem - Computerphile',
    channel: 'Computerphile',
    purpose: 'A clear thought experiment showing why "just turn it off" is not really a solution.',
    watchFor: 'Optional extra video. Follow the argument through a series of proposed fixes, each one breaking in a new way.',
    access: 'Interview to camera with paper diagrams; captions available.',
    checked: CHECKED
  },
  {
    id: 'v-bias', yt: 'gV0_raKR2UQ', length: '11:20',
    title: 'Algorithmic Bias and Fairness: Crash Course AI #18',
    channel: 'CrashCourse',
    purpose: 'Explains where bias enters a system — five different places, and the algorithm is only one of them.',
    watchFor: 'Watch for all five sources. Most arguments about "biased AI" are actually about different sources, without people realising it.',
    access: 'Fast-paced video with graphics and captions.',
    backup: 'v-bias-ibm', checked: CHECKED
  },
  {
    id: 'v-bias-ibm', yt: 'og67qeTZPYs', length: '8:38',
    title: 'Algorithmic Bias in AI: What It Is and How to Fix It',
    channel: 'IBM Technology',
    purpose: 'Covers the same topic, but focuses on fixing the problem rather than just identifying it.',
    watchFor: 'Watch for which fixes are technical and which are about how an organisation works. Most fixes are organisational.',
    access: 'Whiteboard format; visually dependent.',
    checked: CHECKED
  }
]

export const RESOURCES: Resource[] = [
  { id: 'r-turing-paper', title: 'Computing Machinery and Intelligence (Turing, 1950)', url: 'https://courses.cs.umbc.edu/471/papers/turing.pdf',
    kind: 'paper', minutes: 45, level: 'intermediate', optional: false, access: 'open', checked: CHECKED,
    purpose: 'The original paper. Read section 1 and section 6 — Turing answers nine objections, and people still raise the same nine today.' },
  { id: 'r-turing-sep', title: 'The Turing Test — Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/turing-test/',
    kind: 'reference', minutes: 30, level: 'intermediate', optional: true, access: 'open', checked: CHECKED,
    purpose: 'A careful look at what the test actually proves and does not prove, including the strongest objections to it.' },
  { id: 'r-ai-sep', title: 'Artificial Intelligence — Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/artificial-intelligence/',
    kind: 'reference', minutes: 40, level: 'advanced', optional: true, access: 'open', checked: CHECKED,
    purpose: 'The problem of defining AI, taken seriously by people whose job is writing careful definitions.' },
  { id: 'r-dartmouth', title: 'A Proposal for the Dartmouth Summer Research Project on AI (1955)', url: 'https://ojs.aaai.org/aimagazine/index.php/aimagazine/article/view/1904',
    kind: 'archive', minutes: 15, level: 'beginner', optional: false, access: 'open', checked: CHECKED,
    purpose: 'The document that started the field, republished by AAAI. Only two pages. Notice how confident it sounds — that confidence is the lesson.' },
  { id: 'r-chm-timeline', title: 'AI and Robotics timeline — Computer History Museum', url: 'https://www.computerhistory.org/timeline/ai-robotics/',
    kind: 'archive', minutes: 20, level: 'beginner', optional: false, access: 'open', checked: CHECKED,
    purpose: 'A timeline built by a museum archive, not a blog. Use it to check any date this course gives you.' },
  { id: 'r-lighthill', title: 'The Lighthill Report: Artificial Intelligence: A General Survey (1973)', url: 'https://www.chilton-computing.org.uk/inf/literature/reports/lighthill_report/contents.htm',
    kind: 'archive', minutes: 35, level: 'intermediate', optional: true, access: 'open', checked: CHECKED,
    purpose: 'The report that helped end AI funding in Britain. Read the summary and conclusions to see what a strong, well-argued negative review looks like.' },
  { id: 'r-perceptron-play', title: 'TensorFlow Playground', url: 'https://playground.tensorflow.org/',
    kind: 'interactive', minutes: 15, level: 'beginner', optional: false, access: 'open', checked: CHECKED,
    purpose: 'Train a neural network in your browser using sliders. The fastest way to actually feel what "learning" means here.' },
  { id: 'r-teachable', title: 'Teachable Machine', url: 'https://teachablemachine.withgoogle.com/',
    kind: 'tool', minutes: 20, level: 'beginner', optional: false, access: 'open', checked: CHECKED,
    purpose: 'Train an image classifier using your webcam in ten minutes, with no coding. Then try to make it fail — that is the real exercise.' },
  { id: 'r-quickdraw', title: 'Quick, Draw!', url: 'https://quickdraw.withgoogle.com/',
    kind: 'interactive', minutes: 10, level: 'beginner', optional: true, access: 'open', checked: CHECKED,
    purpose: 'A drawing-recognition model you can play against. The training data behind it is public too, so you can see what a dataset actually looks like.' },
  { id: 'r-ml-glossary', title: 'Machine Learning Glossary — Google for Developers', url: 'https://developers.google.com/machine-learning/glossary',
    kind: 'reference', minutes: 10, level: 'beginner', optional: false, access: 'open', checked: CHECKED,
    purpose: 'Keep this open in another tab. Every term in this course is defined here too, usually in more technical detail.' },
  { id: 'r-attention-paper', title: 'Attention Is All You Need (Vaswani et al., 2017)', url: 'https://arxiv.org/abs/1706.03762',
    kind: 'paper', minutes: 60, level: 'advanced', optional: true, access: 'open', checked: CHECKED,
    purpose: 'The paper that introduced the transformer. Even if you read nothing else, look at the abstract and figure 1 — that diagram shaped modern AI.' },
  { id: 'r-illustrated-transformer', title: 'The Illustrated Transformer — Jay Alammar', url: 'https://jalammar.github.io/illustrated-transformer/',
    kind: 'article', minutes: 35, level: 'intermediate', optional: false, access: 'open', checked: CHECKED,
    purpose: 'The paper above, redrawn in plain language with pictures. The best bridge between "I watched a video" and "I read the actual paper".' },
  { id: 'r-transformer-explainer', title: 'Transformer Explainer — Georgia Tech (Polo Club)', url: 'https://poloclub.github.io/transformer-explainer/',
    kind: 'interactive', minutes: 20, level: 'intermediate', optional: false, access: 'open', checked: CHECKED,
    purpose: 'A live, small language model running right in your browser, with every internal step drawn out. Type a sentence and watch the prediction form step by step.' },
  { id: 'r-alexnet', title: 'ImageNet Classification with Deep Convolutional Neural Networks (2012)', url: 'https://papers.nips.cc/paper_files/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html',
    kind: 'paper', minutes: 50, level: 'advanced', optional: true, access: 'open', checked: CHECKED,
    purpose: 'The AlexNet paper — the result that brought neural networks back into the spotlight. Read the abstract and section 6.' },
  { id: 'r-foundation-models', title: 'On the Opportunities and Risks of Foundation Models (2021)', url: 'https://arxiv.org/abs/2108.07258',
    kind: 'paper', minutes: 45, level: 'advanced', optional: true, access: 'open', checked: CHECKED,
    purpose: 'Where the term "foundation model" comes from, and why building many products on one shared model is risky. Read the introduction.' },
  { id: 'r-ai-index', title: 'AI Index Report — Stanford HAI', url: 'https://aiindex.stanford.edu/report/',
    kind: 'reference', minutes: 40, level: 'intermediate', optional: false, access: 'open', checked: CHECKED,
    purpose: 'Yearly, measured data on capability, cost, adoption and incidents. When you need a real number instead of a gut feeling, start here.' },
  { id: 'r-nist-rmf', title: 'AI Risk Management Framework — NIST', url: 'https://www.nist.gov/itl/ai-risk-management-framework',
    kind: 'policy', minutes: 30, level: 'intermediate', optional: false, access: 'open', checked: CHECKED,
    purpose: 'A government standards body\'s practical way of thinking about AI risk. Written to be used, not just discussed.' },
  { id: 'r-eu-ai-act', title: 'The EU AI Act', url: 'https://artificialintelligenceact.eu/',
    kind: 'policy', minutes: 30, level: 'intermediate', optional: true, access: 'open', checked: CHECKED,
    purpose: 'The first broad law regulating AI. Skim the risk tiers — they are a useful way to sort any AI system you come across.' },
  { id: 'r-oecd', title: 'OECD AI Principles', url: 'https://oecd.ai/en/ai-principles',
    kind: 'policy', minutes: 15, level: 'beginner', optional: true, access: 'open', checked: CHECKED,
    purpose: 'The most widely accepted international statement of what "responsible AI" is meant to mean.' },
  { id: 'r-model-cards', title: 'Model Cards', url: 'https://modelcards.withgoogle.com/about',
    kind: 'reference', minutes: 15, level: 'beginner', optional: false, access: 'open', checked: CHECKED,
    purpose: 'The kind of documentation you should ask for before trusting any model. If a vendor cannot give you one, that itself tells you something.' },
  { id: 'r-model-spec', title: 'OpenAI Model Spec', url: 'https://model-spec.openai.com/',
    kind: 'reference', minutes: 30, level: 'intermediate', optional: true, access: 'open', checked: CHECKED,
    purpose: 'A published statement of how one company wants its models to behave. Read it as a design goal, not a guarantee of what actually happens.' },
  { id: 'r-anthropic-research', title: 'Anthropic Research', url: 'https://www.anthropic.com/research',
    kind: 'reference', minutes: 20, level: 'advanced', optional: true, access: 'open', checked: CHECKED,
    purpose: 'Published research from a leading AI lab on understanding and safety. It is a real source, and it also comes from a company with a stake in the outcome — both are true at once.' },
  { id: 'r-transformer-circuits', title: 'Transformer Circuits Thread', url: 'https://transformer-circuits.pub/',
    kind: 'paper', minutes: 60, level: 'advanced', optional: true, access: 'open', checked: CHECKED,
    purpose: 'Research trying to work out what is actually happening inside a trained model. It is hard reading, and it is the honest answer to "does anyone really know how this works".' },
  { id: 'r-alphafold-db', title: 'AlphaFold Protein Structure Database — EMBL-EBI', url: 'https://alphafold.ebi.ac.uk/',
    kind: 'tool', minutes: 15, level: 'beginner', optional: false, access: 'open', checked: CHECKED,
    purpose: 'The real, usable output: predicted protein structures, free and searchable. Look up a protein and read its confidence colouring.' },
  { id: 'r-elements', title: 'Elements of AI — University of Helsinki', url: 'https://www.elementsofai.com/',
    kind: 'course', minutes: 30, level: 'beginner', optional: true, access: 'account', checked: CHECKED,
    purpose: 'A free university course that covers this same ground more slowly. A natural next step after today.' },
  { id: 'r-hf-learn', title: 'Hugging Face Learn', url: 'https://huggingface.co/learn',
    kind: 'course', minutes: 30, level: 'intermediate', optional: true, access: 'open', checked: CHECKED,
    purpose: 'Free hands-on courses, useful if you want to start building instead of just evaluating.' },
  { id: 'r-distill', title: 'Distill', url: 'https://distill.pub/',
    kind: 'article', minutes: 40, level: 'advanced', optional: true, access: 'open', checked: CHECKED,
    purpose: 'An archive of interactive machine-learning explanations. It has stopped publishing new work, but it is still some of the clearest writing on this topic anywhere.' },
  { id: 'r-mit-tr', title: 'MIT Technology Review — Artificial Intelligence', url: 'https://www.technologyreview.com/',
    kind: 'article', minutes: 20, level: 'beginner', optional: true, access: 'paywalled', checked: CHECKED,
    purpose: 'Reporting that is more careful than most about telling announcements apart from actual results. Part of the site is paywalled.' },
  { id: 'r-ieee', title: 'IEEE Spectrum', url: 'https://spectrum.ieee.org/',
    kind: 'article', minutes: 20, level: 'intermediate', optional: true, access: 'open', checked: CHECKED,
    purpose: 'Engineering-focused coverage, useful for robotics and hardware claims — an area where general news coverage is usually weakest.' }
]

/**
 * The source register. Everything the course asserts that a reader might
 * reasonably want to check, with what supports it and how strongly.
 */
export const SOURCES: Source[] = [
  { id: 's-turing', title: 'Computing Machinery and Intelligence', publisher: 'Mind, Vol. LIX, No. 236', kind: 'primary', published: 'October 1950',
    url: 'https://courses.cs.umbc.edu/471/papers/turing.pdf', checked: CHECKED, confidence: 'high',
    supports: 'In 1950, Turing proposed the imitation game and replaced the question "can machines think" with a test he could actually run.' },
  { id: 's-dartmouth', title: 'A Proposal for the Dartmouth Summer Research Project on Artificial Intelligence', publisher: 'AI Magazine (AAAI), reprint of the 1955 proposal', kind: 'primary', published: '1955 (reprinted 2006)',
    url: 'https://ojs.aaai.org/aimagazine/index.php/aimagazine/article/view/1904', checked: CHECKED, confidence: 'high',
    supports: 'The term "artificial intelligence" was coined in the 1955 proposal that led to the 1956 Dartmouth workshop.' },
  { id: 's-lighthill', title: 'Artificial Intelligence: A General Survey (the Lighthill Report)', publisher: 'UK Science Research Council', kind: 'primary', published: '1973',
    url: 'https://www.chilton-computing.org.uk/inf/literature/reports/lighthill_report/contents.htm', checked: CHECKED, confidence: 'high',
    supports: 'In 1973, a UK government-commissioned report criticised AI research for not scaling past small toy problems. Funding cuts followed.' },
  { id: 's-alexnet', title: 'ImageNet Classification with Deep Convolutional Neural Networks', publisher: 'NeurIPS (NIPS 2012)', kind: 'primary', published: '2012',
    url: 'https://papers.nips.cc/paper_files/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html', checked: CHECKED, confidence: 'high',
    supports: 'In 2012, a deep neural network trained on GPUs won the ImageNet competition by a wide margin. This restarted mainstream interest in neural networks.' },
  { id: 's-transformer', title: 'Attention Is All You Need', publisher: 'NeurIPS / arXiv:1706.03762', kind: 'primary', published: '2017',
    url: 'https://arxiv.org/abs/1706.03762', checked: CHECKED, confidence: 'high',
    supports: 'The transformer architecture, introduced in 2017, is the design behind today\'s large language models.' },
  { id: 's-foundation', title: 'On the Opportunities and Risks of Foundation Models', publisher: 'Stanford CRFM / arXiv:2108.07258', kind: 'primary', published: '2021',
    url: 'https://arxiv.org/abs/2108.07258', checked: CHECKED, confidence: 'high',
    supports: 'This paper names the term "foundation model" and argues that many products built on one shared model inherit that model\'s flaws.' },
  { id: 's-ai-index', title: 'AI Index Report', publisher: 'Stanford Institute for Human-Centered AI', kind: 'secondary',
    url: 'https://aiindex.stanford.edu/report/', checked: CHECKED, confidence: 'high',
    supports: 'Measured trends in capability, training cost, adoption and reported incidents. Use it for any claim involving a number.' },
  { id: 's-nist', title: 'AI Risk Management Framework (AI RMF 1.0)', publisher: 'US National Institute of Standards and Technology', kind: 'primary',
    url: 'https://www.nist.gov/itl/ai-risk-management-framework', checked: CHECKED, confidence: 'high',
    supports: 'A published, government-standards way of sorting AI risk categories and governance practice.' },
  { id: 's-eu-act', title: 'EU Artificial Intelligence Act', publisher: 'European Union (summary portal)', kind: 'primary',
    url: 'https://artificialintelligenceact.eu/', checked: CHECKED, confidence: 'high',
    supports: 'The EU has passed a law that regulates AI systems by risk level.' },
  { id: 's-alphafold', title: 'AlphaFold Protein Structure Database', publisher: 'EMBL-EBI and Google DeepMind', kind: 'primary',
    url: 'https://alphafold.ebi.ac.uk/', checked: CHECKED, confidence: 'high',
    supports: 'Predicted protein structures, at large scale, are published openly and used regularly by biologists.' },
  { id: 's-chm', title: 'AI and Robotics timeline', publisher: 'Computer History Museum', kind: 'reference',
    url: 'https://www.computerhistory.org/timeline/ai-robotics/', checked: CHECKED, confidence: 'high',
    supports: 'Dates and sequence of events used in the history modules of this course.' },
  { id: 's-circuits', title: 'Transformer Circuits Thread', publisher: 'Anthropic', kind: 'primary',
    url: 'https://transformer-circuits.pub/', checked: CHECKED, confidence: 'medium',
    supports: 'Research trying to explain what is happening inside a trained model. It is real research, published by a lab that also has a business interest in the topic.' },
  { id: 's-model-spec', title: 'Model Spec', publisher: 'OpenAI', kind: 'primary',
    url: 'https://model-spec.openai.com/', checked: CHECKED, confidence: 'medium',
    supports: 'A company\'s stated intentions for how its models should behave. This shows what they intend, not proof of what actually happens.' }
]

export const videoById = (id: string) => VIDEOS.find(v => v.id === id)
export const resourceById = (id: string) => RESOURCES.find(r => r.id === id)
export const sourceById = (id: string) => SOURCES.find(s => s.id === id)
