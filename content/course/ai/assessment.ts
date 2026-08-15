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
    stem: 'Which sentence best describes how AI and machine learning are related?',
    options: [
      'Machine learning is one part of AI. Much of AI does not involve learning at all',
      'They are two words for the same thing',
      'AI is one part of machine learning',
      'They are unrelated fields'
    ], answer: [0],
    rationale: 'The circles sit inside each other: generative AI is inside deep learning, deep learning is inside machine learning, and machine learning is inside AI. Search, logic and planning are all AI, but none of them learn from data.' },
  { id: 'd2', kind: 'tf', difficulty: 'easy', objective: 'Explain major stages',
    stem: 'True or false: neural networks are a new idea, invented in the last fifteen years.',
    options: ['True', 'False'], answer: [1],
    rationale: 'The perceptron was invented in 1958. Backpropagation, the method used to train networks, was described in a usable form in 1986. What is new is the data and the computing power, not the idea itself. Module 6 explains why it took so long.' },
  { id: 'd3', kind: 'mcq', difficulty: 'moderate', objective: 'Evaluate AI claims',
    stem: 'A model scores 95% on a public test. What should you check next, and why does it matter most?',
    options: [
      'Whether the test questions could have been part of its training data',
      'How many parameters it has',
      'Which company built it',
      'How fast it runs'
    ], answer: [0],
    rationale: 'This problem is called contamination: test questions ending up in the training data. It is a real and still unsolved problem for models trained on huge amounts of internet text. It is the first thing that can make a big headline score meaningless.' },
  { id: 'd4', kind: 'mcq', difficulty: 'moderate', objective: 'Evaluate AI claims',
    stem: 'Why do language models sometimes give confident, well-written answers that are false?',
    options: [
      'They are trained to produce text that sounds likely, and they have no separate way of checking what is true',
      'Their training data is mostly wrong',
      'They are deliberately designed to mislead',
      'It only happens when the prompt is badly written'
    ], answer: [0],
    rationale: 'A made-up citation can still be an excellent guess at what word comes next. It has everything the training process rewards. The only thing missing is that the citation is real — and nothing in training checks for that.' },
  { id: 'd5', kind: 'tf', difficulty: 'moderate', objective: 'Evaluate AI claims',
    stem: 'True or false: an impressive demonstration video is reasonable evidence that a system works reliably.',
    options: ['True', 'False'], answer: [1],
    rationale: 'A demo shows one attempt, made under conditions someone chose. Reliability means how often something works, and a single video cannot show a rate. This gap is biggest in robotics, and people talk about it the least there.' },
  { id: 'd6', kind: 'mcq', difficulty: 'hard', objective: 'Evaluate AI claims',
    stem: 'Someone claims a leading AI lab has a private model that is far more capable than anything it has released. How should you treat that claim?',
    options: [
      'As unverified: labs do keep private, unreleased models, but nobody outside the lab knows how much better they are',
      'As true — labs always hold back their best work',
      'As false — companies release their best models to win market share',
      'As unanswerable, so not worth thinking about'
    ], answer: [0],
    rationale: 'Labs openly admit they test models internally before release, so some gap does exist. But nobody outside the lab knows how big it is, and there is no way to check the claim from outside. That is a reason to hold the claim loosely, not to believe it or dismiss it. Module 10 gives you a five-tier framework for exactly this kind of claim.' }
]

export const FINAL: Question[] = [
  { id: 'f1', kind: 'mcq', difficulty: 'easy', objective: 'Explain major stages',
    stem: 'What was the main contribution of the 1956 Dartmouth workshop?',
    options: ['It gave the field its name and brought together the community that led it', 'The first working AI system', 'The Turing test', 'The first neural network'],
    answer: [0],
    rationale: 'No technical breakthrough came out of that summer. What mattered was that it named the field and brought people together. Its organizers guessed the whole problem could be solved in two months — a famous first lesson in how hard it is to estimate this kind of work.' },

  { id: 'f2', kind: 'mcq', difficulty: 'moderate', objective: 'Explain major stages',
    stem: 'Why did Turing replace "Can machines think?" with the imitation game?',
    options: [
      'The original question was too vague to ever settle, so he wanted a question he could actually test',
      'He had proved machines cannot think',
      'He believed conversation was the hardest possible task',
      'He wanted to demonstrate machine consciousness'
    ], answer: [0],
    rationale: 'This was a swap of method: replace a question nobody could answer with one you could actually test. Turing said clearly that passing the test does not settle the deeper question of whether machines really think.' },

  { id: 'f3', kind: 'mcq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
    stem: 'What was the basic limit on the search-based methods used in early AI?',
    options: [
      'The number of possibilities grows explosively the deeper you search, so faster hardware can never keep up',
      'Computers could not store the rules',
      'The algorithms were mathematically incorrect',
      'There was not enough training data'
    ], answer: [0],
    rationale: 'This is called combinatorial explosion. Looking two more moves ahead multiplies the work by roughly a thousand times. Ten years of faster hardware only buys you about two more moves of lookahead. The mismatch is built into the problem, not a temporary limit.' },

  { id: 'f4', kind: 'mcq', difficulty: 'moderate', objective: 'Explain major stages',
    stem: 'What was the "knowledge bottleneck" that limited expert systems?',
    options: [
      'Expert knowledge had to be pulled out by hand, and much of what experts know cannot be put into words at all',
      'Rules executed too slowly',
      'There was insufficient memory to store rule bases',
      'Experts refused to cooperate'
    ], answer: [0],
    rationale: 'A radiologist can spot a tumour but cannot fully explain how they knew. What cannot be put into words cannot be written into rules. Machine learning removed this problem by learning from examples instead of from rules.' },

  { id: 'f5', kind: 'mrq', difficulty: 'moderate', objective: 'Explain major stages',
    stem: 'Which of these helped neural networks succeed in 2012, when they had not succeeded in 1986? Select all that apply.',
    options: [
      'Much larger sets of labelled data',
      'GPUs making the huge amount of math affordable',
      'A completely new learning algorithm',
      'Ten years of engineering fixes that made deep networks possible to train'
    ], answer: [0, 1, 3],
    rationale: 'Data, hardware, and years of small practical improvements. The core algorithm was mostly the same one available in the 1980s. That is what makes this story worth telling.',
    distractors: { 2: 'The fact that there was no new core algorithm is the whole point. Progress was blocked by lack of data and computing power, not by lack of ideas.' } },

  { id: 'f6', kind: 'mcq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
    stem: 'Why was self-supervised learning so important for language models?',
    options: [
      'It creates its own training labels from the raw data, so it can train on huge amounts of text with no human labelling needed',
      'It removes the need for large compute',
      'It eliminates errors',
      'It allows much smaller models'
    ], answer: [0],
    rationale: 'Labelling data by hand was the bottleneck. Predicting hidden text creates training signal for free. This is what allowed training on amounts of text no human labelling team could ever have handled.' },

  { id: 'f7', kind: 'mcq', difficulty: 'hard', objective: 'Distinguish AI approaches',
    stem: 'What does the attention mechanism compute?',
    options: [
      'How much each word (token) in a sequence should influence every other word',
      'Which parts of the input the user marked as important',
      'How much compute to allocate to a request',
      'Which training examples were most influential'
    ], answer: [0],
    rationale: 'It is a weighting between positions, worked out from the content itself. This is why the word "bank" is correctly understood in "the bank was steep and muddy," even though no rule was written to say so.' },

  { id: 'f8', kind: 'mrq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
    stem: 'Which are true of pretraining? Select all that apply.',
    options: [
      'It supplies most of the model\'s knowledge',
      'It uses up most of the computing cost',
      'It teaches instruction-following',
      'It has a cut-off date'
    ], answer: [0, 1, 3],
    rationale: 'Knowledge, cost, and a knowledge cut-off date all come from this first stage. Instruction-following is added later, in a much cheaper second stage.',
    distractors: { 3: 'Instruction tuning happens in a second stage. A model that has only been pretrained may just continue your question with more text instead of answering it.' } },

  { id: 'f9', kind: 'mcq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
    stem: 'How does a diffusion model produce an image?',
    options: [
      'By starting from random noise and removing a little noise at a time, guided by a prompt',
      'By retrieving and blending similar training images',
      'By predicting pixels left to right',
      'By searching a database for the best match'
    ], answer: [0],
    rationale: 'This is called denoising, done step by step from a random starting point. Nothing is copied from a database. That is why the same prompt gives a different image each time — the starting noise is different each time.' },

  { id: 'f10', kind: 'mcq', difficulty: 'hard', objective: 'Evaluate AI claims',
    stem: 'Someone proposes an AI agent that writes and sends replies to customer emails on its own. What is the most important design question to ask?',
    options: [
      'Which of its actions cannot be undone, and does a human check those before they happen?',
      'Which model does it use?',
      'How fast can it process a message?',
      'How many emails can it handle per day?'
    ], answer: [0],
    rationale: 'Whether an action can be undone matters most. Writing a draft can be undone; sending an email cannot. Requiring a human check only at the step that cannot be undone keeps almost all the time saved, with almost none of the risk.' },

  { id: 'f11', kind: 'mcq', difficulty: 'moderate', objective: 'Evaluate AI claims',
    stem: 'A model answers in a confident, well-organised tone. What does that indicate about accuracy?',
    options: [
      'Nothing reliable. Tone is shaped by training on human preferences, and it has little to do with whether the answer is correct',
      'It is likely accurate, since models hedge when uncertain',
      'It is likely inaccurate, since confidence signals fabrication',
      'It depends on the length of the response'
    ], answer: [0],
    rationale: 'A confident tone is a trained style of talking, not a sign of accuracy. Treating smooth, confident writing as proof of correctness is the most common mistake users make with these systems.' },

  { id: 'f12', kind: 'mrq', difficulty: 'hard', objective: 'Evaluate AI claims',
    stem: 'A hiring model is trained on past interview decisions. It ends up favouring candidates who look like people hired before. Which statements are accurate? Select all that apply.',
    options: [
      'It is repeating the pattern that was already in its training data',
      'The problem is in the data and how the task was set up, not only in the algorithm',
      'Removing a field like gender or ethnicity reliably fixes the problem',
      'This outcome could be predicted from how the model works'
    ], answer: [0, 1, 3],
    rationale: 'A supervised model learns to match its training labels. If the labels contain past bias, the model learns that bias too. This could be predicted in advance, which makes it a design failure, not an accident.',
    distractors: { 2: 'Other details — postcode, school, name — can carry the same signal as the field you removed. This is a well-known trap, and it is well documented.' } },

  { id: 'f13', kind: 'mcq', difficulty: 'hard', objective: 'Evaluate AI claims',
    stem: 'How should you treat the claim that scaling up models will keep delivering similar gains in capability?',
    options: [
      'A disputed guess that goes beyond the range where the pattern was actually measured',
      'An established law of machine learning',
      'A claim already disproved',
      'Marketing with no research behind it'
    ], answer: [0],
    rationale: 'The pattern is well supported within the range where it has been measured. Whether it continues beyond that range is a guess, and serious researchers disagree about it in public. Being confident in either direction claims more certainty than actually exists.' },

  { id: 'f14', kind: 'mcq', difficulty: 'hard', objective: 'Evaluate AI claims',
    stem: 'As a piece of evidence, what most sets the protein-structure result apart from a humanoid robot demo?',
    options: [
      'It was checked by independent judges against an objective measure, and the results are public so anyone can check them',
      'It used more compute',
      'It came from a better-known laboratory',
      'It addressed an easier problem'
    ], answer: [0],
    rationale: 'Outside checking, plus results anyone can inspect, is what turns a claim into an established result. A demo video might be showing something real, but it is not the kind of evidence that proves a system is reliable.' },

  { id: 'f15', kind: 'mcq', difficulty: 'hard', objective: 'Evaluate AI claims',
    stem: 'An anonymous online post claims a lab has an unreleased model far ahead of anything public. Which evidence tier does this belong to, and what should you do about it?',
    options: [
      'Rumour: nobody can be held responsible for it, and it cannot be checked from outside. Hold it loosely, and act on stronger evidence instead',
      'Verified evidence, because insiders know more than the public',
      'Speculation, so it can be dismissed entirely',
      'Credible reporting, because such claims usually turn out to be true'
    ], answer: [0],
    rationale: 'A claim nobody stands behind cannot be checked or corrected. There are two matching mistakes here: believing it because it sounds exciting, and dismissing it just because it cannot be checked. The right move is to name its evidence tier and make your decision using stronger evidence.',
    distractors: {
      1: 'Being anonymous removes the exact thing that would make a claim credible: someone standing behind it.',
      2: 'Dismissing it outright is just as unjustified as believing it. No evidence means no evidence, in either direction.',
      3: 'Nobody actually knows how often these claims turn out true. Saying they "usually" do is itself a claim with no evidence behind it.'
    } }
]

export interface RubricRow { criterion: string; strong: string; adequate: string; weak: string }

export const CAPSTONE = {
  title: 'Your AI position paper',
  brief: 'One page. This is not a general essay about AI. It is a position you can defend, about one claim that matters to your own work. Write it so that someone who disagrees with you can see exactly where the disagreement is.',
  parts: [
    { n: '1', title: 'How we got here', ask: 'In no more than 150 words, explain how AI reached where it is today, to someone who has not taken this course. You must mention at least one thing that failed, and explain why.' },
    { n: '2', title: 'One claim, evaluated', ask: 'Take a real AI claim that matters to your work. Apply the five questions from module 1, and give it a tier from module 10. State what evidence would change your judgement, in each direction.' },
    { n: '3', title: 'One responsible use', ask: 'Name one place where you would actually use AI in your work. Explain what makes it a good fit: can the output be checked, would a failure be visible, can the action be undone? Name the safeguard you would put in place.' },
    { n: '4', title: 'One thing you would not do', ask: 'Name a use of AI you have decided against, and give a reason a colleague could actually argue with. "It might be biased" is not a good enough reason. Say exactly where the bias would come in, and who would be affected by it.' }
  ],
  rubric: [
    { criterion: 'Historical accuracy',
      strong: 'The account is correct. It names a real failure and explains how and why it happened, not just that it happened.',
      adequate: 'The order of events is mostly correct, but the explanation of how or why is thin or partly missing.',
      weak: 'The timeline has errors, or the history is told as if progress never had setbacks.' },
    { criterion: 'Evidence handling',
      strong: 'Clearly separates what was actually measured from what is being guessed. Gives a tier and explains why. Names evidence that would prove the claim wrong.',
      adequate: 'Tells fact apart from guesswork, but does not say what evidence would change their mind.',
      weak: 'Treats a vendor\'s claims, demos, or forecasts as if they were already proven fact.' },
    { criterion: 'Judgement about use',
      strong: 'Clearly tests the use against whether it can be checked, whether a failure would be visible, and whether the action can be undone. The safeguard is specific and could actually be put in place.',
      adequate: 'A reasonable use case, with a safeguard that is only general.',
      weak: 'Either enthusiasm or refusal, with no clear test behind it.' },
    { criterion: 'Honesty about limits',
      strong: 'States plainly what they do not know, and where their judgement could turn out to be wrong.',
      adequate: 'Some acknowledgment of doubt, but not done consistently.',
      weak: 'No uncertainty admitted, in either direction.' },
    { criterion: 'Clarity',
      strong: 'A colleague could act on this directly. Technical terms are explained where they are used.',
      adequate: 'Understandable, but takes some effort to follow.',
      weak: 'Jargon is used for show, or the writing is so vague it commits to nothing.' }
  ] as RubricRow[],
  completion: 'You assess your own capstone against the rubric. There is no submission and no grade. This course is not a certification body, and pretending otherwise would be its own small act of dishonesty. What you have at the end is one page you are willing to defend. That is the only thing that was ever worth having.'
}
