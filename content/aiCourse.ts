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
    blurb: 'AI helps software recognise patterns, make predictions, or create content.',
    objective: 'Recognise an AI tool and the task it supports.',
    takeaway: 'Ask: What task? What data? What check?',
    exploreTitle: 'A useful way to think about AI',
    exploreText: 'AI is a set of tools for different tasks. A map predicts traffic; a chatbot predicts useful next words.',
    sourceLabel: 'Turing, 1950', sourceUrl: 'https://academic.oup.com/mind/article/LIX/236/433/986238', confidence: 'Verified public evidence'
  },
  {
    id: 'rules', number: '02', short: 'Rules and examples', title: 'Two ways AI can work', duration: '35 min',
    blurb: 'Some AI follows written rules. Other AI learns from examples.',
    objective: 'Distinguish rules from learned patterns.',
    takeaway: 'Match the method to the task.',
    exploreTitle: 'Why do we need both?',
    exploreText: 'Rules are easy to inspect. Learning can spot harder patterns, but it needs good examples and testing.',
    sourceLabel: 'Dartmouth proposal, 1955', sourceUrl: 'https://www-formal.stanford.edu/jmc/history/dartmouth/dartmouth.html', confidence: 'Verified public evidence',
    visual: 'history',
    video: { title: 'But what is a neural network?', url: 'https://www.youtube.com/watch?v=aircAruvnKk', instruction: 'Notice that the “neurons” are a mathematical analogy: the system adjusts weights to improve a task, not human-like understanding.' }
  },
  {
    id: 'data', number: '03', short: 'Learning from examples', title: 'How AI learns from data', duration: '35 min',
    blurb: 'AI learns from examples before it responds to new work.',
    objective: 'Distinguish training from use.',
    takeaway: 'Good examples produce better results.',
    exploreTitle: 'Training and using are different steps',
    exploreText: 'Training is practice with examples. Inference is using the trained system on a new input.',
    sourceLabel: 'CRFM, 2021', sourceUrl: 'https://crfm.stanford.edu/report.html', confidence: 'Verified public evidence'
  },
  {
    id: 'attention', number: '04', short: 'How chat AI works', title: 'Why modern AI feels different', duration: '40 min',
    blurb: 'Modern AI weighs the useful parts of your input to form a response.',
    objective: 'Explain why chat AI can work across many topics.',
    takeaway: 'Useful does not always mean correct.',
    exploreTitle: 'What is “attention” here?',
    exploreText: 'Attention is a maths method that gives more weight to useful parts of an input. It is not human understanding.',
    sourceLabel: 'Vaswani et al., 2017', sourceUrl: 'https://arxiv.org/abs/1706.03762', confidence: 'Verified public evidence',
    video: { title: 'Transformers, the tech behind LLMs', url: 'https://www.youtube.com/watch?v=wjZofJX0v4M', instruction: 'Watch the opening ten minutes, then describe “predict the next token” without calling it a database lookup.' }
  },
  {
    id: 'generation', number: '05', short: 'Making new content', title: 'What generative AI can help with', duration: '40 min',
    blurb: 'Generative AI can draft, summarise, translate, and create images.',
    objective: 'Choose an appropriate human check.',
    takeaway: 'Fluent output is not proof.',
    exploreTitle: 'Where is it useful?',
    exploreText: 'Use it to start, organise, or simplify. Check high-impact information with a reliable source or expert.',
    sourceLabel: 'NIST AI 600-1, 2024', sourceUrl: 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence', confidence: 'Verified public evidence'
  },
  {
    id: 'agents', number: '06', short: 'AI that can take steps', title: 'From answers to action', duration: '40 min',
    blurb: 'With approved tools, some AI systems can complete steps in a workflow.',
    objective: 'Name the controls that make an AI agent safer.',
    takeaway: 'Start small. Keep people accountable.',
    exploreTitle: 'Assistant or agent?',
    exploreText: 'An assistant gives an answer. An agent can take steps using tools. People set the limits and review points.',
    sourceLabel: 'Anthropic, 2024', sourceUrl: 'https://www.anthropic.com/engineering/building-effective-agents', confidence: 'Informed analysis',
    visual: 'agents'
  },
  {
    id: 'embodied', number: '07', short: 'AI in the real world', title: 'AI beyond a screen', duration: '35 min',
    blurb: 'Real-world AI must work safely around people, places, and changing conditions.',
    objective: 'Explain why real-world AI needs stronger checks.',
    takeaway: 'Safety matters more when consequences are real.',
    exploreTitle: 'Why is the real world harder?',
    exploreText: 'A wrong answer can be corrected. A wrong machine action can cause harm. Test, limit, and supervise.',
    sourceLabel: 'CRFM, 2021', sourceUrl: 'https://crfm.stanford.edu/report.html', confidence: 'Verified public evidence'
  },
  {
    id: 'frontier', number: '08', short: 'Facts, claims, and rumours', title: 'How to check a big AI claim', duration: '35 min',
    blurb: 'Separate public evidence, reported claims, and speculation.',
    objective: 'Apply a simple evidence label to an AI claim.',
    takeaway: 'No reliable evidence is a useful conclusion.',
    exploreTitle: 'A simple evidence ladder',
    exploreText: 'Start with official documents, research, and independent testing. Treat marketing and posts as questions, not proof.',
    sourceLabel: 'UK AISI, 2025', sourceUrl: 'https://www.aisi.gov.uk/frontier-ai-trends-report', confidence: 'Verified public evidence'
  },
  {
    id: 'responsible', number: '09', short: 'Use AI responsibly', title: 'Use AI with care', duration: '35 min',
    blurb: 'AI can be wrong, unfair, or unsafe with private information.',
    objective: 'Match a risk with a practical control.',
    takeaway: 'Protect data. Check outputs. Keep accountability.',
    exploreTitle: 'A quick safety check',
    exploreText: 'Do not paste confidential information into a public tool. Check important outputs and consider who may be affected.',
    sourceLabel: 'NIST AI 600-1, 2024', sourceUrl: 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence', confidence: 'Verified public evidence'
  },
  {
    id: 'next', number: '10', short: 'Your next step', title: 'Choose one sensible next step', duration: '25 min',
    blurb: 'AI’s future will be shaped by technology, policy, and everyday choices.',
    objective: 'Choose one responsible use for AI in your work or learning.',
    takeaway: 'Start small, check results, and learn.',
    exploreTitle: 'Keep it practical',
    exploreText: 'Start with a low-risk task. Decide what you will check before you share the result.',
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
