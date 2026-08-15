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
  sourceLabel: string
  sourceUrl: string
  confidence: Confidence
  visual?: 'history' | 'agents'
  video?: { title: string; url: string; instruction: string }
}

export const AI_MODULES: AiModule[] = [
  {
    id: 'bearing', number: '01', short: 'Set your bearing', title: 'What AI is—and is not', duration: '32 min',
    blurb: 'Artificial intelligence is a family of techniques for tasks associated with perception, prediction, language, decision-making, or control. It is not one thing, and it is not a synonym for a human mind.',
    objective: 'Separate a useful working definition of AI from claims about consciousness or magic.',
    takeaway: 'Ask: what task, what data, what model, and what evidence?',
    sourceLabel: 'Turing, 1950', sourceUrl: 'https://academic.oup.com/mind/article/LIX/236/433/986238', confidence: 'Verified public evidence'
  },
  {
    id: 'rules', number: '02', short: 'From rules to learning', title: 'Two roads into AI', duration: '42 min',
    blurb: 'Symbolic AI represents knowledge with rules, search, and explicit structures. Machine learning finds statistical patterns from examples. Most practical systems combine ideas from both traditions.',
    objective: 'Compare an explicit rule system with a trained pattern-recognition system.',
    takeaway: 'A model is not “smart” in the abstract; it is useful or unreliable for a particular task.',
    sourceLabel: 'Dartmouth proposal, 1955', sourceUrl: 'https://www-formal.stanford.edu/jmc/history/dartmouth/dartmouth.html', confidence: 'Verified public evidence',
    visual: 'history',
    video: { title: 'But what is a neural network?', url: 'https://www.youtube.com/watch?v=aircAruvnKk', instruction: 'Notice that the “neurons” are a mathematical analogy: the system adjusts weights to improve a task, not human-like understanding.' }
  },
  {
    id: 'data', number: '03', short: 'The data turn', title: 'Learning from examples', duration: '38 min',
    blurb: 'Supervised learning links examples to labels; unsupervised methods look for structure; reinforcement learning improves toward a defined reward. Training changes model parameters; inference applies what was learned to a new input.',
    objective: 'Identify the learning signal a system uses and distinguish training from inference.',
    takeaway: 'Data quality, task definition, and evaluation often matter as much as the algorithm.',
    sourceLabel: 'CRFM, 2021', sourceUrl: 'https://crfm.stanford.edu/report.html', confidence: 'Verified public evidence'
  },
  {
    id: 'attention', number: '04', short: 'Attention changes the map', title: 'Transformers and foundation models', duration: '48 min',
    blurb: 'The Transformer architecture made it practical to model relationships across a sequence with attention mechanisms. Foundation models are trained on broad data at scale and adapted to many later tasks.',
    objective: 'Explain—in plain language—why attention changed the modern AI landscape.',
    takeaway: 'Scale can create broad utility, but it does not automatically create truth, judgment, or accountability.',
    sourceLabel: 'Vaswani et al., 2017', sourceUrl: 'https://arxiv.org/abs/1706.03762', confidence: 'Verified public evidence',
    video: { title: 'Transformers, the tech behind LLMs', url: 'https://www.youtube.com/watch?v=wjZofJX0v4M', instruction: 'Watch the opening ten minutes, then describe “predict the next token” without calling it a database lookup.' }
  },
  {
    id: 'generation', number: '05', short: 'Generation, grounded', title: 'What generative systems can do', duration: '44 min',
    blurb: 'Today’s model families can generate and transform language, images, audio, code, and combinations of modalities. Outputs may be fluent or compelling without being accurate, current, or appropriately sourced.',
    objective: 'Match a common generative-AI capability with an appropriate human verification step.',
    takeaway: 'Fluency is not evidence. Ground important work in trustworthy sources and domain review.',
    sourceLabel: 'NIST AI 600-1, 2024', sourceUrl: 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence', confidence: 'Verified public evidence'
  },
  {
    id: 'agents', number: '06', short: 'Agents and tools', title: 'From answers to action', duration: '46 min',
    blurb: 'An agentic system typically adds tools, instructions, guardrails, retrieval, and a workflow around a model. A predefined workflow is not the same as a system that dynamically selects actions.',
    objective: 'Describe how a model, tools, instructions, and human oversight work together in an agentic system.',
    takeaway: 'Start with the simplest reliable workflow. Add autonomy only where its benefits can be evaluated and controlled.',
    sourceLabel: 'Anthropic, 2024', sourceUrl: 'https://www.anthropic.com/engineering/building-effective-agents', confidence: 'Informed analysis',
    visual: 'agents'
  },
  {
    id: 'embodied', number: '07', short: 'Beyond the screen', title: 'AI in the physical world', duration: '36 min',
    blurb: 'Robotics, autonomous systems, and scientific applications must cope with changing physical environments, imperfect sensors, safety constraints, scarce data, and the cost of real-world failure.',
    objective: 'Explain why impressive language performance does not directly translate into safe physical-world performance.',
    takeaway: 'Embodied intelligence depends on both models and the environments, tools, people, and safeguards around them.',
    sourceLabel: 'CRFM, 2021', sourceUrl: 'https://crfm.stanford.edu/report.html', confidence: 'Verified public evidence'
  },
  {
    id: 'frontier', number: '08', short: 'Evidence, not rumours', title: 'How to read frontier claims', duration: '40 min',
    blurb: 'Publicly released systems, published evaluations, private prototypes, rumors, restricted government systems, and imagined future systems belong in different evidence categories. Do not collapse them into a single story.',
    objective: 'Classify an AI claim by what the public evidence can—and cannot—support.',
    takeaway: '“No reliable public evidence” is a useful conclusion, not a failure of imagination.',
    sourceLabel: 'UK AISI, 2025', sourceUrl: 'https://www.aisi.gov.uk/frontier-ai-trends-report', confidence: 'Verified public evidence'
  },
  {
    id: 'responsible', number: '09', short: 'Responsible use', title: 'Capabilities need controls', duration: '46 min',
    blurb: 'Hallucination, bias, privacy, copyright, labor impact, misinformation, cybersecurity, and unequal access are not side notes. They shape whether an AI application is fit for a real context.',
    objective: 'Pair a likely risk with a practical control, review practice, or escalation path.',
    takeaway: 'Responsible use is a design practice: set boundaries, test realistic failure modes, and keep people accountable.',
    sourceLabel: 'NIST AI 600-1, 2024', sourceUrl: 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence', confidence: 'Verified public evidence'
  },
  {
    id: 'next', number: '10', short: 'Your next responsible step', title: 'Turn learning into practice', duration: '28 min',
    blurb: 'The future of AI is not a single forecast. It is a collection of technical possibilities, commercial choices, public policy questions, and human decisions that will develop unevenly.',
    objective: 'Make one evidence-led choice about where and how you will use AI next.',
    takeaway: 'Stay curious, stay specific, and revise your view when better evidence arrives.',
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
