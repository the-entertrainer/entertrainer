/**
 * Learning Atlas course content — factual claims are paired with a source key
 * documented in docs/ai-course-research.md. This is intentionally concise,
 * learner-facing microcopy rather than a hidden lecture transcript.
 */

export type Confidence = 'Verified public evidence' | 'Informed analysis' | 'Speculative scenario' | 'No reliable public evidence'

export interface AiModule {
  id: string
  number: string
  short: string
  title: string
  duration: string
  blurb: string
  objective: string
  takeaway: string
  exploreTitle: string
  exploreText: string
  sourceLabel: string
  sourceUrl: string
  confidence: Confidence
  visual?: 'history' | 'agents'
  video?: { title: string; url: string; instruction: string }
}

export const AI_MODULES: AiModule[] = [
  {
    id: 'bearing', number: '01', short: 'AI in simple words', title: 'What does AI really mean?', duration: '30 min',
    blurb: 'AI is software that can find patterns, make suggestions, or create content. You may already use it in maps, online shopping, payment checks, phone keyboards, and chatbots.',
    objective: 'Describe AI in simple words and recognise one AI feature you use in daily life.',
    takeaway: 'Before trusting an AI result, ask: What job is it doing? What information is it using? How can I check the answer?',
    exploreTitle: 'A useful way to think about AI',
    exploreText: 'AI is not one single machine or one “super brain”. It is a group of tools made for different jobs. A map app predicts traffic. A photo app recognises faces. A chatbot predicts useful next words.',
    sourceLabel: 'Turing, 1950', sourceUrl: 'https://academic.oup.com/mind/article/LIX/236/433/986238', confidence: 'Verified public evidence'
  },
  {
    id: 'rules', number: '02', short: 'Rules and examples', title: 'Two ways AI can work', duration: '35 min',
    blurb: 'Some AI follows rules written by people. Other AI learns patterns from many examples. Both methods are useful, but they solve problems in different ways.',
    objective: 'Tell the difference between an AI system that follows rules and one that learns from examples.',
    takeaway: 'An AI tool is useful only when it fits the task it has been made for.',
    exploreTitle: 'Why do we need both?',
    exploreText: 'A rule can be clear and easy to audit, but it may miss unusual cases. Learning from examples can spot patterns that are hard to write as rules, but it depends on good examples and careful testing.',
    sourceLabel: 'Dartmouth proposal, 1955', sourceUrl: 'https://www-formal.stanford.edu/jmc/history/dartmouth/dartmouth.html', confidence: 'Verified public evidence',
    visual: 'history',
    video: { title: 'But what is a neural network?', url: 'https://www.youtube.com/watch?v=aircAruvnKk', instruction: 'Notice that the “neurons” are a mathematical analogy: the system adjusts weights to improve a task, not human-like understanding.' }
  },
  {
    id: 'data', number: '03', short: 'Learning from examples', title: 'How AI learns from data', duration: '35 min',
    blurb: 'Many AI systems learn by looking at examples. The examples may have labels, hidden patterns, or a clear reward for doing a task well.',
    objective: 'Explain the difference between training an AI system and using it after training.',
    takeaway: 'Good examples and clear checks matter as much as clever software.',
    exploreTitle: 'Training and using are different steps',
    exploreText: 'Training is like practice: the system changes based on examples and feedback. Using the trained system is called inference: you give it a fresh input and it gives you an output.',
    sourceLabel: 'CRFM, 2021', sourceUrl: 'https://crfm.stanford.edu/report.html', confidence: 'Verified public evidence'
  },
  {
    id: 'attention', number: '04', short: 'How chat AI works', title: 'Why modern AI feels different', duration: '40 min',
    blurb: 'Modern language AI is built to look at the words around a question and decide what might matter most. This helps it produce more useful responses across many topics.',
    objective: 'Explain, in simple language, why a modern AI tool can respond to different kinds of questions.',
    takeaway: 'A wider range of skills does not mean the tool is always right.',
    exploreTitle: 'What is “attention” here?',
    exploreText: 'It is a maths method that helps a model give more weight to useful parts of the input. It is not the same as a person paying attention or understanding the world like a person does.',
    sourceLabel: 'Vaswani et al., 2017', sourceUrl: 'https://arxiv.org/abs/1706.03762', confidence: 'Verified public evidence',
    video: { title: 'Transformers, the tech behind LLMs', url: 'https://www.youtube.com/watch?v=wjZofJX0v4M', instruction: 'Watch the opening ten minutes, then describe “predict the next token” without calling it a database lookup.' }
  },
  {
    id: 'generation', number: '05', short: 'Making new content', title: 'What generative AI can help with', duration: '40 min',
    blurb: 'Generative AI can draft text, create images, help with code, translate, and summarise. It can save time on a first draft, but it can also make mistakes that sound convincing.',
    objective: 'Choose a sensible human check for a common use of generative AI.',
    takeaway: 'Clear writing is not proof. Check important facts with reliable sources or an expert.',
    exploreTitle: 'Where is it useful?',
    exploreText: 'Use it to start, explore, organise, or simplify. Do not treat it as the final authority for medical, legal, financial, policy, or other high-impact information.',
    sourceLabel: 'NIST AI 600-1, 2024', sourceUrl: 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence', confidence: 'Verified public evidence'
  },
  {
    id: 'agents', number: '06', short: 'AI that can take steps', title: 'From answers to action', duration: '40 min',
    blurb: 'Some AI systems can do more than answer a question. With clear instructions and approved tools, they can search, organise information, or complete steps in a workflow.',
    objective: 'Name the parts that make an AI assistant safer when it takes actions.',
    takeaway: 'Start with small, clear tasks. Keep people in charge of important decisions and actions.',
    exploreTitle: 'Assistant or agent?',
    exploreText: 'A simple assistant gives an answer. An agent can choose steps and use tools to complete a task. In both cases, people should set the goal, the limits, and the review points.',
    sourceLabel: 'Anthropic, 2024', sourceUrl: 'https://www.anthropic.com/engineering/building-effective-agents', confidence: 'Informed analysis',
    visual: 'agents'
  },
  {
    id: 'embodied', number: '07', short: 'AI in the real world', title: 'AI beyond a screen', duration: '35 min',
    blurb: 'Robots, vehicles, health tools, and science systems work in the real world. They must deal with changing places, imperfect sensors, safety rules, and the cost of getting something wrong.',
    objective: 'Explain why a helpful chatbot is not automatically ready to control a real-world machine.',
    takeaway: 'In the physical world, safety checks and human responsibility matter even more.',
    exploreTitle: 'Why is the real world harder?',
    exploreText: 'A wrong sentence can be corrected. A wrong turn by a machine can hurt people or damage property. That is why testing, safety limits, and human oversight are essential.',
    sourceLabel: 'CRFM, 2021', sourceUrl: 'https://crfm.stanford.edu/report.html', confidence: 'Verified public evidence'
  },
  {
    id: 'frontier', number: '08', short: 'Facts, claims, and rumours', title: 'How to check a big AI claim', duration: '35 min',
    blurb: 'AI news can be exciting, confusing, or exaggerated. A useful habit is to separate what has been publicly shown, what has been reported, and what is only a guess or a rumour.',
    objective: 'Use a simple evidence label when you read or hear a strong claim about AI.',
    takeaway: '“I cannot find reliable public evidence” is a fair and useful answer.',
    exploreTitle: 'A simple evidence ladder',
    exploreText: 'Start with official documents, research papers, and independent testing. Treat marketing, leaked screenshots, and social-media posts as starting points for questions—not proof.',
    sourceLabel: 'UK AISI, 2025', sourceUrl: 'https://www.aisi.gov.uk/frontier-ai-trends-report', confidence: 'Verified public evidence'
  },
  {
    id: 'responsible', number: '09', short: 'Use AI responsibly', title: 'Use AI with care', duration: '35 min',
    blurb: 'AI can make mistakes, repeat unfair patterns, expose private information, or be misused. Responsible use means thinking about these risks before they become a problem.',
    objective: 'Match a common AI risk with one practical way to reduce it.',
    takeaway: 'Set clear boundaries, protect personal information, and keep a person accountable for the final decision.',
    exploreTitle: 'A quick safety check',
    exploreText: 'Do not paste confidential information into a public AI tool. Check important outputs. Ask who could be affected if the answer is wrong or unfair.',
    sourceLabel: 'NIST AI 600-1, 2024', sourceUrl: 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence', confidence: 'Verified public evidence'
  },
  {
    id: 'next', number: '10', short: 'Your next step', title: 'Choose one sensible next step', duration: '25 min',
    blurb: 'The future of AI is not fixed. It will be shaped by technology, business choices, public rules, and everyday decisions made by people and organisations.',
    objective: 'Choose one small, useful, and responsible way to try AI in your own work or learning.',
    takeaway: 'Stay curious. Ask clear questions. Check important results. Change your mind when better evidence appears.',
    exploreTitle: 'Keep it practical',
    exploreText: 'Start with a low-risk task, such as creating a rough outline or turning notes into a first draft. Decide what you will check yourself before you share or use the result.',
    sourceLabel: 'Course evidence register', sourceUrl: '/docs/ai-course-research.md', confidence: 'Informed analysis'
  }
]

export const AI_GLOSSARY = [
  ['Algorithm', 'A repeatable method for carrying out a task or solving a problem.'],
  ['Dataset', 'A collection of examples used to train, test, or analyse a system.'],
  ['Inference', 'Using a trained model to produce an output for a new input.'],
  ['Transformer', 'A neural-network architecture that uses attention to relate pieces of a sequence.'],
  ['Token', 'A chunk of input or output text that a language model processes.'],
  ['Foundation model', 'A broad model trained at scale that can be adapted to many downstream tasks.'],
  ['Multimodal model', 'A model that can work with more than one kind of information, such as text and images.'],
  ['Agent', 'A system that uses a model plus tools, instructions, and an action loop to pursue a task.'],
  ['Hallucination', 'A confident-looking output that is incorrect, unsupported, or invented.'],
  ['Alignment', 'The effort to make an AI system act consistently with intended goals, constraints, and values.']
]
