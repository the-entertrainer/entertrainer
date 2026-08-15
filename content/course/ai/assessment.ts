import type { Question } from './types'

/**
 * The assessment package.
 *
 * Three instruments with three different jobs:
 *
 *  DIAGNOSTIC   Before the course. Not scored against the learner — its purpose
 *               is to surface what they already believe so the modules have
 *               something to correct. Answers are shown immediately.
 *  FINAL        After the course. Fifteen questions weighted toward judgement
 *               and comparison rather than recall, because recall is the part
 *               that decays by Friday and judgement is the part that does not.
 *  CAPSTONE     A produced artifact rather than a score. The only part of the
 *               day that requires the learner to commit to a position.
 */

export const DIAGNOSTIC: Question[] = [
  { id: 'd1', kind: 'mcq', difficulty: 'easy', objective: 'Define AI',
    stem: 'Which of these is the most accurate description of the relationship between AI and machine learning?',
    options: [
      'Machine learning is one part of AI; plenty of AI involves no learning at all',
      'They are two words for the same thing',
      'AI is one part of machine learning',
      'They are unrelated fields'
    ], answer: [0],
    rationale: 'The circles nest: generative AI inside deep learning inside machine learning inside AI. Search, logic and planning are all AI and none of them learn from data.' },
  { id: 'd2', kind: 'tf', difficulty: 'easy', objective: 'Explain major stages',
    stem: 'True or false: neural networks are a recent invention, developed in the last fifteen years.',
    options: ['True', 'False'], answer: [1],
    rationale: 'The perceptron dates from 1958 and backpropagation was described in usable form in 1986. What arrived recently was the data and the hardware, not the idea. Module 6 covers why the gap was so long.' },
  { id: 'd3', kind: 'mcq', difficulty: 'moderate', objective: 'Evaluate AI claims',
    stem: 'A model scores 95% on a public benchmark. What is the most important thing to establish next?',
    options: [
      'Whether the test material could have been in its training data',
      'How many parameters it has',
      'Which company built it',
      'How fast it runs'
    ], answer: [0],
    rationale: 'Contamination — benchmark material appearing in training data — is a live and largely unresolved problem for models trained on internet-scale text. It is the first thing that can make a headline score meaningless.' },
  { id: 'd4', kind: 'mcq', difficulty: 'moderate', objective: 'Evaluate AI claims',
    stem: 'Why do language models produce confident, well-formed statements that are false?',
    options: [
      'They are optimised to produce plausible text and have no separate representation of truth',
      'Their training data is mostly wrong',
      'They are deliberately designed to mislead',
      'It only happens when the prompt is badly written'
    ], answer: [0],
    rationale: 'A fabricated citation is an excellent next-token prediction. Everything the objective rewards is present; the only missing property is that the thing exists, and nothing in training measured that.' },
  { id: 'd5', kind: 'tf', difficulty: 'moderate', objective: 'Evaluate AI claims',
    stem: 'True or false: an impressive demonstration video is reasonable evidence that a system works reliably.',
    options: ['True', 'False'], answer: [1],
    rationale: 'A demo reports one attempt under chosen conditions. Reliability is a rate, and a video cannot report a rate. This gap is widest in robotics, where it is also least often acknowledged.' },
  { id: 'd6', kind: 'mcq', difficulty: 'hard', objective: 'Evaluate AI claims',
    stem: 'Someone claims a frontier lab has a private model far more capable than anything released. How should you hold that claim?',
    options: [
      'As unverified: internal models certainly exist, but the size of the gap is not publicly established',
      'As true — labs always hold back their best work',
      'As false — companies release their best models to win market share',
      'As unanswerable, so not worth thinking about'
    ], answer: [0],
    rationale: 'Internal pre-release testing is publicly acknowledged, so some gap exists. Its size is not established, and the claim is unfalsifiable from outside — which is a reason to hold it loosely rather than to believe or dismiss it. Module 10 gives you the five-tier framework for exactly this.' }
]

export const FINAL: Question[] = [
  { id: 'f1', kind: 'mcq', difficulty: 'easy', objective: 'Explain major stages',
    stem: 'What did the 1956 Dartmouth workshop principally contribute?',
    options: ['The name of the field and the community that led it', 'The first working AI system', 'The Turing test', 'The first neural network'],
    answer: [0],
    rationale: 'No technical breakthrough came out of that summer. Its significance is institutional — and its two-month estimate for solving intelligence is the founding lesson in effort estimation.' },

  { id: 'f2', kind: 'mcq', difficulty: 'moderate', objective: 'Explain major stages',
    stem: 'Why did Turing replace "Can machines think?" with the imitation game?',
    options: [
      'The original question was too ill-defined to settle; he wanted one that could be tested',
      'He had proved machines cannot think',
      'He believed conversation was the hardest possible task',
      'He wanted to demonstrate machine consciousness'
    ], answer: [0],
    rationale: 'A methodological substitution: swap an unanswerable question for an operational one. Turing is explicit that passing does not settle the metaphysics.' },

  { id: 'f3', kind: 'mcq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
    stem: 'What fundamentally limited the search-based methods of early AI?',
    options: [
      'The search space grows exponentially with depth, so hardware improvements cannot keep pace',
      'Computers could not store the rules',
      'The algorithms were mathematically incorrect',
      'There was not enough training data'
    ], answer: [0],
    rationale: 'Combinatorial explosion. Two more moves of lookahead multiplies the work roughly a thousandfold; a decade of hardware progress buys about two moves. The mismatch is structural.' },

  { id: 'f4', kind: 'mcq', difficulty: 'moderate', objective: 'Explain major stages',
    stem: 'What was the "knowledge bottleneck" that limited expert systems?',
    options: [
      'Expert knowledge had to be extracted by hand, and much of it could not be articulated at all',
      'Rules executed too slowly',
      'There was insufficient memory to store rule bases',
      'Experts refused to cooperate'
    ], answer: [0],
    rationale: 'A radiologist can spot a tumour and cannot fully say how. What cannot be said cannot be encoded — which is precisely the constraint machine learning removed by learning from examples instead.' },

  { id: 'f5', kind: 'mrq', difficulty: 'moderate', objective: 'Explain major stages',
    stem: 'Which contributed to neural networks succeeding in 2012 rather than 1986? Select all that apply.',
    options: [
      'Far larger labelled datasets',
      'GPUs making the arithmetic affordable',
      'A fundamentally new learning algorithm',
      'A decade of engineering fixes that made deep networks trainable'
    ], answer: [0, 1, 3],
    rationale: 'Data, hardware and accumulated practical improvements. The core algorithm was substantially the one available in the eighties, which is what makes the story worth telling.',
    distractors: { 2: 'The absence of a new core algorithm is the whole point — capability was blocked by resources, not by ideas.' } },

  { id: 'f6', kind: 'mcq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
    stem: 'Why was self-supervised learning decisive for language models?',
    options: [
      'It creates training labels from the raw data itself, so training can scale to unlabelled text',
      'It removes the need for large compute',
      'It eliminates errors',
      'It allows much smaller models'
    ], answer: [0],
    rationale: 'Labelling was the bottleneck. Predicting hidden text generates supervision for free, which is what allowed training on quantities no annotation operation could have handled.' },

  { id: 'f7', kind: 'mcq', difficulty: 'hard', objective: 'Distinguish AI approaches',
    stem: 'What does the attention mechanism compute?',
    options: [
      'How much each token in a sequence should influence every other token',
      'Which parts of the input the user marked as important',
      'How much compute to allocate to a request',
      'Which training examples were most influential'
    ], answer: [0],
    rationale: 'A content-derived weighting between positions. It is why "bank" resolves correctly in "the bank was steep and muddy" without any rule saying so.' },

  { id: 'f8', kind: 'mrq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
    stem: 'Which are true of pretraining? Select all that apply.',
    options: [
      'It supplies most of the model\'s knowledge',
      'It accounts for most of the compute cost',
      'It teaches instruction-following',
      'It has a cut-off date'
    ], answer: [0, 1, 3],
    rationale: 'Knowledge, cost and a knowledge cut-off all come from stage one. Instruction-following is added later and far more cheaply.',
    distractors: { 3: 'Instruction tuning is stage two. A purely pretrained model may continue your question rather than answer it.' } },

  { id: 'f9', kind: 'mcq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
    stem: 'How does a diffusion model produce an image?',
    options: [
      'By starting from random noise and repeatedly removing noise, steered by a prompt',
      'By retrieving and blending similar training images',
      'By predicting pixels left to right',
      'By searching a database for the best match'
    ], answer: [0],
    rationale: 'Iterative denoising from a random start. Nothing is retrieved, which is why the same prompt yields a different image each time — the starting noise differs.' },

  { id: 'f10', kind: 'mcq', difficulty: 'hard', objective: 'Evaluate AI claims',
    stem: 'An agent is proposed that drafts and sends replies to customer emails. What is the most important design question?',
    options: [
      'Which of its actions are irreversible, and does a human confirm those?',
      'Which model does it use?',
      'How fast can it process a message?',
      'How many emails can it handle per day?'
    ], answer: [0],
    rationale: 'Reversibility dominates. Drafting is recoverable; sending is not. Requiring a human at the irreversible step keeps almost all the time saving and almost none of the risk.' },

  { id: 'f11', kind: 'mcq', difficulty: 'moderate', objective: 'Evaluate AI claims',
    stem: 'A model answers in a confident, well-organised tone. What does that indicate about accuracy?',
    options: [
      'Nothing reliable — tone is set by preference tuning and is largely independent of correctness',
      'It is likely accurate, since models hedge when uncertain',
      'It is likely inaccurate, since confidence signals fabrication',
      'It depends on the length of the response'
    ], answer: [0],
    rationale: 'Confidence is a trained conversational style. Treating fluency as evidence is the most common user-side error with these systems.' },

  { id: 'f12', kind: 'mrq', difficulty: 'hard', objective: 'Evaluate AI claims',
    stem: 'A hiring model trained on past interview decisions favours candidates like previous hires. Which statements are accurate? Select all that apply.',
    options: [
      'It is reproducing the pattern in its training labels',
      'The problem lies in the data and framing, not only the algorithm',
      'Removing the demographic field reliably fixes it',
      'This outcome is predictable from the mechanism'
    ], answer: [0, 1, 3],
    rationale: 'A supervised model fits its labels. If the labels encode past preference, so does the model — and that is foreseeable, which makes it a design failure rather than an accident.',
    distractors: { 2: 'Correlated features — postcode, school, name — carry the signal. This is the standard trap and it is well documented.' } },

  { id: 'f13', kind: 'mcq', difficulty: 'hard', objective: 'Evaluate AI claims',
    stem: 'What is the correct status of the claim "scaling will keep delivering comparable capability gains"?',
    options: [
      'A contested extrapolation beyond the range where the relationship was measured',
      'An established law of machine learning',
      'A claim already disproved',
      'Marketing with no research behind it'
    ], answer: [0],
    rationale: 'The observed relationship is well evidenced within its measured range. Its continuation is an extrapolation, and competent researchers disagree publicly about it. Confidence in either direction overstates what is known.' },

  { id: 'f14', kind: 'mcq', difficulty: 'hard', objective: 'Evaluate AI claims',
    stem: 'What most distinguishes the protein-structure result from a humanoid robot demonstration, considered as evidence?',
    options: [
      'Independent blind assessment against an objective measure, with public output anyone can check',
      'It used more compute',
      'It came from a better-known laboratory',
      'It addressed an easier problem'
    ], answer: [0],
    rationale: 'External evaluation plus inspectable output is what converts a claim into a result. Demo footage may be showing something real; it is simply not the kind of evidence that establishes reliability.' },

  { id: 'f15', kind: 'mcq', difficulty: 'hard', objective: 'Evaluate AI claims',
    stem: 'An anonymous online post claims a lab has an unreleased model far beyond anything public. Which tier does this belong to, and what follows?',
    options: [
      'Rumour: unattributable and unfalsifiable from outside, so hold it loosely and act on tier 1 and 2 evidence instead',
      'Verified evidence, because insiders know more than the public',
      'Speculation, so it can be dismissed entirely',
      'Credible reporting, because such claims usually turn out to be true'
    ], answer: [0],
    rationale: 'Unattributable claims cannot be checked or corrected. Note the two symmetrical errors: believing it because it is exciting, and dismissing it because it is unverifiable. The correct move is to state its tier and decide on better evidence.',
    distractors: {
      1: 'Anonymity removes exactly the accountability that would make it credible.',
      2: 'Dismissal is as unjustified as belief — no evidence means no evidence in either direction.',
      3: 'This has no established base rate, and asserting one is itself an unevidenced claim.'
    } }
]

export interface RubricRow { criterion: string; strong: string; adequate: string; weak: string }

export const CAPSTONE = {
  title: 'Your AI position paper',
  brief: 'One page. Not an essay about AI in general — a defensible position on one claim that matters to your actual work, written so that someone who disagrees with you can see exactly where they disagree.',
  parts: [
    { n: '1', title: 'How we got here', ask: 'In no more than 150 words, explain how AI arrived at its current state to someone who has not taken this course. You must mention at least one thing that failed and why.' },
    { n: '2', title: 'One claim, evaluated', ask: 'Take a real AI claim relevant to your work. Apply the five questions from module 1 and assign it a tier from module 10. State what evidence would change your assessment in each direction.' },
    { n: '3', title: 'One responsible use', ask: 'Identify one place you would actually use AI in your work. Say what makes it appropriate: is the output checkable, is the failure visible, is the action reversible? Name the safeguard you would put in place.' },
    { n: '4', title: 'One thing you would not do', ask: 'Identify a use you have decided against, and say why in a sentence a colleague could argue with. "It might be biased" is not enough; say where the bias would enter and who would bear it.' }
  ],
  rubric: [
    { criterion: 'Historical accuracy',
      strong: 'The account is correct, names a real failure, and explains the mechanism of it rather than just the fact.',
      adequate: 'Broadly correct sequence, mechanism thin or partly missing.',
      weak: 'Timeline errors, or history presented as uninterrupted progress.' },
    { criterion: 'Evidence handling',
      strong: 'Separates result from extrapolation explicitly; assigns a tier and justifies it; names disconfirming evidence.',
      adequate: 'Distinguishes fact from projection but does not say what would change their mind.',
      weak: 'Treats vendor claims, demos or forecasts as established fact.' },
    { criterion: 'Judgement about use',
      strong: 'Applies checkability, visibility of failure and reversibility as explicit tests; safeguard is specific and implementable.',
      adequate: 'Reasonable use case with a general safeguard.',
      weak: 'Enthusiasm or refusal without a stated test.' },
    { criterion: 'Honesty about limits',
      strong: 'States plainly what they do not know and where their assessment could be wrong.',
      adequate: 'Some hedging, not systematic.',
      weak: 'No acknowledged uncertainty in either direction.' },
    { criterion: 'Clarity',
      strong: 'A colleague could act on this. Technical terms are defined where used.',
      adequate: 'Understandable with effort.',
      weak: 'Jargon used as decoration, or so vague it commits to nothing.' }
  ] as RubricRow[],
  completion: 'The capstone is self-assessed against the rubric. There is no submission and no grade — this course is not a certification body, and pretending otherwise would be its own small dishonesty. What you have at the end is a page you would be willing to defend, which is the only thing that was ever worth having.'
}
