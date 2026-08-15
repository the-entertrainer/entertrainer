import type { Module } from './types'

export const M05: Module = {
  id: 'm05', n: '05', accent: 'var(--green)',
  title: 'Learning from data',
  intro: 'The idea that broke the deadlock: stop writing the rules, and let the machine find them in examples. This module covers what machine learning actually does, the three setups you will meet, and the two ways it lies to you — overfitting and a misleading benchmark.',
  objectives: [
    'Explain the shift from writing rules to fitting functions.',
    'Distinguish supervised, unsupervised and reinforcement learning by what each one needs.',
    'Describe what a dataset is and why labelling is the expensive part.',
    'Explain overfitting and why strong benchmark scores can mislead.'
  ],
  lessons: [
    {
      id: 'm05l1', title: 'Stop writing rules', minutes: 8, completion: 'read',
      summary: 'The single change of framing that made modern AI possible.',
      blocks: [
        { type: 'text', lead: true, body: [
          'Here is the whole idea, and it is worth stating plainly because everything after it is detail.',
          'Old approach: a human works out the rule and writes it down. To detect spam, you write "if it contains the word FREE and comes from an unknown sender, it is probably spam". You maintain that list forever, and spammers adapt faster than you do.',
          'New approach: a human collects examples, labels them, and lets an algorithm find a rule that fits. You show the system a million emails already marked spam or not-spam, and it works out for itself which combinations of features predict the label — including combinations no person would have thought to write down.',
          'The knowledge bottleneck from module 3 dissolves, because you no longer need the expert to explain their reasoning. You only need them to make judgements you can record. A radiologist who cannot say how they spot a tumour can still label ten thousand scans, and that turns out to be enough.'
        ] },
        { type: 'compare', caption: 'The two approaches, side by side',
          columns: ['', 'Rules', 'Learning'],
          rows: [
            ['What a human supplies', 'The reasoning, written out', 'Examples with the right answers'],
            ['Where the difficulty sits', 'Articulating tacit knowledge', 'Collecting and labelling enough data'],
            ['Behaviour at the edges', 'Confident and wrong', 'Confident and wrong (differently)'],
            ['Can you read why?', 'Yes, rule by rule', 'Not really, and this is a genuine cost'],
            ['Handles novelty', 'Only cases anticipated in the rules', 'Cases similar to the training data'],
            ['Cost of improvement', 'Write more rules; interactions grow', 'Collect more data; costs are more predictable']
          ] },
        { type: 'video', videoId: 'v-supervised' },
        { type: 'takeaway', body: 'Machine learning did not make the knowledge problem go away. It moved it — from "can the expert explain it?" to "can we get enough labelled examples?". That second question has an answer you can budget for, which is why the field moved.' }
      ]
    },
    {
      id: 'm05l2', title: 'Three ways to learn', minutes: 9, completion: 'check',
      summary: 'Supervised, unsupervised and reinforcement learning, by what each one needs from you.',
      blocks: [
        { type: 'tabs', items: [
          { label: 'Supervised', body: 'You supply examples *with* the right answer attached: photos labelled "cat" or "dog", emails labelled spam, loan applications labelled repaid or defaulted. The system learns a mapping from input to label. This is the workhorse — the large majority of deployed machine learning in the world is supervised, and its cost is dominated by producing the labels.' },
          { label: 'Unsupervised', body: 'You supply examples with no answers, and ask the system to find structure: which customers resemble each other, which transactions are unlike all the others, what the natural groupings are. Nobody has to label anything, which is cheap, but you also have no ground truth — the clusters it finds may or may not correspond to anything you care about. Judging the output is the hard part.' },
          { label: 'Reinforcement', body: 'No examples at all. The system acts, receives a reward or penalty, and adjusts. This is how game-playing systems learn, and how a robot learns to walk. It needs an environment it can try things in millions of times, which is why it works brilliantly in simulation and games and much less easily in the physical world, where a failed attempt breaks something real.' },
          { label: 'Self-supervised', body: 'The one that made large language models possible, and the reason they exist. Take unlabelled text, hide part of it, and ask the model to predict what was hidden. The "label" is the hidden part, so it is generated for free from the raw data. This is what let training scale to the whole readable internet — nobody had to label any of it.' }
        ] },
        { type: 'flashcards', title: 'Which setup is this?', cards: [
          { front: 'Predicting tomorrow\'s electricity demand from ten years of records', back: 'Supervised. The past readings are the labels — history has already told you the right answer.' },
          { front: 'Grouping 50,000 support tickets into themes nobody defined', back: 'Unsupervised. No labels exist, and judging whether the themes are useful is a human job.' },
          { front: 'A program learning to play a game by playing itself millions of times', back: 'Reinforcement. The score is the reward signal; no examples of good play are needed.' },
          { front: 'Training a model to predict the next word across a trillion words of text', back: 'Self-supervised. The next word is the label, and it is already there in the text.' },
          { front: 'Flagging the 0.1% of transactions unlike all the others', back: 'Usually unsupervised anomaly detection — often because you have very few labelled examples of the fraud you have not seen yet.' }
        ] },
        { type: 'video', videoId: 'v-rlhf' },
        { type: 'check', questions: [
          { id: 'q0501', kind: 'mcq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
            stem: 'Why was self-supervised learning so consequential for language models?',
            options: [
              'It produces labels from the raw data itself, so training can scale to enormous unlabelled text',
              'It removes the need for large amounts of computing power',
              'It guarantees the model will not make mistakes',
              'It makes models smaller'
            ], answer: [0],
            rationale: 'Labelling is the bottleneck in supervised learning. Predicting hidden parts of text generates the supervision signal for free, which is what allowed training on quantities of text no labelling operation could ever have annotated.',
            distractors: {
              1: 'It increased compute demand enormously — the scale is the whole point.',
              2: 'It has no such effect; see module 10 on hallucination.',
              3: 'Models got dramatically larger, not smaller.'
            } },
          { id: 'q0502', kind: 'mrq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
            stem: 'Which are true of reinforcement learning? Select all that apply.',
            options: [
              'It learns from reward signals rather than labelled examples',
              'It generally needs an environment where many attempts are cheap',
              'It is the most common form of machine learning in commercial deployment',
              'It has been central to game-playing systems'
            ], answer: [0, 1, 3],
            rationale: 'Reinforcement learning is powerful where trial and error is cheap and repeatable — games and simulations. Commercially, supervised learning dominates by a wide margin.',
            distractors: { 2: 'Supervised learning is by far the most deployed. Reinforcement learning is prominent in research and in a few high-profile systems.' } },
          { id: 'q0505', kind: 'fitb', difficulty: 'moderate', objective: 'Distinguish AI approaches',
            stem: 'Fill in the blank: hiding part of unlabelled text and training a model to predict what was hidden is called ___-supervised learning.',
            options: [], answer: [], blankAnswers: ['self', 'self-supervised', 'self supervised'],
            rationale: 'Self-supervised. The hidden part is the label, generated for free from raw text — which is what let training scale to enormous unlabelled datasets and is the reason large language models exist at all.' }
        ] }
      ]
    },
    {
      id: 'm05l3', title: 'What a dataset actually is', minutes: 8, completion: 'activity',
      summary: 'The unglamorous centre of the whole enterprise.',
      blocks: [
        { type: 'text', body: [
          'A dataset is not a natural object. Somebody decided what to collect, from where, over what period, and how to describe it. Every one of those decisions is inherited by the model, and none of them is visible in the output.',
          'Consider a model to predict which job applicants to interview, trained on a decade of a company\'s hiring decisions. The dataset does not contain "who would have been good at the job". It contains "who this company chose to interview". If the company\'s past choices were skewed, the dataset encodes the skew as ground truth, and the model reproduces it — efficiently, at scale, and with a veneer of objectivity that the original human decisions never had.',
          'This is why "the algorithm is neutral, it just learns from the data" is not a defence. The data is the argument.'
        ] },
        { type: 'evidence', confidence: 'high',
          claim: 'Models trained on historical decisions reproduce the patterns in those decisions, including undesirable ones.',
          basis: 'This follows from the mechanism — a supervised model is fit to the labels it was given — and is documented across the fairness literature and in NIST\'s AI Risk Management Framework, which treats data provenance as a first-order risk control.', sourceId: 's-nist' },
        { type: 'practice', title: 'Train something and break it',
          steps: [
            'Open Teachable Machine (linked below). No account, no code, nothing to install.',
            'Create an image project with two classes — anything to hand. A pen versus a mug. Your hand open versus closed.',
            'Give it about 30 examples of each from your webcam, then train. This takes under a minute.',
            'Test it. It will probably work well, and that feeling of success is the thing to distrust.',
            'Now break it deliberately: change the lighting, move to a different background, hold the object at an unusual angle, or try an object it has never seen.',
            'Write down what it does when it is wrong. Specifically: does it say it is unsure, or does it confidently pick a class?'
          ],
          output: 'A one-line note on how your model failed, and whether the failure was visible from the output alone. Keep it — module 10 comes back to exactly this.' },
        { type: 'resource', resourceIds: ['r-teachable', 'r-quickdraw'] },
        { type: 'reflect', minWords: 25,
          prompt: 'Your model was trained on 30 images from your room. What was in every single one of those images that you did not intend to teach it?',
          hint: 'Your lighting. Your background. The angle you naturally hold things at. The model cannot tell which of those you meant.' }
      ]
    },
    {
      id: 'm05l4', title: 'Overfitting, and the benchmark problem', minutes: 10, completion: 'check',
      summary: 'The two ways a model looks better than it is.',
      blocks: [
        { type: 'text', body: [
          'A student who memorises last year\'s exam paper will score brilliantly on last year\'s exam and badly on this year\'s. That is overfitting: fitting the training examples so closely that you capture their noise and accidents rather than the underlying pattern.',
          'The standard defence is to hold data back. Train on one portion, test on a portion the model has never seen, and report the second number. Any model evaluated only on its training data is reporting a number that means nothing at all — and this is common enough in vendor material that "was this measured on held-out data?" is a fair and frequently unwelcome question.'
        ] },
        { type: 'labeled', caption: 'Three numbers, three meanings',
          parts: [
            { label: 'Training accuracy', body: 'How well it does on what it was taught. Always the highest number, and the least informative. On its own it tells you the model has memory, not that it has learned.' },
            { label: 'Validation accuracy', body: 'Performance on held-out data used while tuning. Honest at first, but the more decisions you make by looking at it, the more you have quietly fitted to it too.' },
            { label: 'Test accuracy', body: 'Performance on data touched exactly once, at the end. The only one worth reporting — and the number most often absent from a slide.' }
          ] },
        { type: 'chart', kind: 'line', unit: '%',
          caption: 'Validation accuracy as a model gets more complex — an illustrative pattern, not measured data',
          note: 'The shape is the point, not the numbers. Accuracy on held-out data rises as the model gets more expressive, peaks, then falls as it starts fitting noise in the training set instead of the underlying pattern. Training accuracy alone would keep climbing past that peak — which is exactly why it is the least informative of the three numbers above.',
          data: [
            { label: 'Too simple', value: 58 },
            { label: '', value: 72 },
            { label: 'Good fit', value: 89 },
            { label: '', value: 83 },
            { label: 'Overfit', value: 68 }
          ] },
        { type: 'text', body: [
          'The same problem occurs at the scale of the whole field, and this is the version that matters when you read the news. A benchmark is a shared test set that everyone reports against. Over time, the field collectively overfits to it: architectures, training choices and data get selected for benchmark performance, and the benchmark stops measuring general capability and starts measuring benchmark capability.',
          'It gets worse for large language models. They are trained on enormous scrapes of the internet, and benchmarks are published on the internet. When a model scores well on a test, one live possibility is that the test — or something very close to it — was in the training data. This is called contamination, it is genuinely difficult to rule out, and it is the reason a headline exam score deserves less weight than it usually receives.'
        ] },
        { type: 'evidence', confidence: 'medium',
          claim: 'Benchmark contamination — test material appearing in training data — is a known and unresolved difficulty in evaluating large language models.',
          basis: 'Widely acknowledged in model documentation and evaluation literature, with labs reporting decontamination efforts of varying rigour. Rated medium because the extent of contamination in any specific released model is generally not independently verifiable.', sourceId: 's-ai-index' },
        { type: 'scenario',
          setup: 'A vendor tells you their model "scores in the top 10% on a professional certification exam in your industry".',
          question: 'What is the strongest response?',
          choices: [
            { text: '"Can it do that on this year\'s paper, which was published after the model was trained?"', verdict: 'best',
              feedback: 'This is the contamination question, asked in a way that is concrete and answerable. A model that holds up on material published after its training cut-off has demonstrated something real. One that does not may simply be recalling.' },
            { text: '"Exams are not real work, so the number is meaningless."', verdict: 'workable',
              feedback: 'Fair, and true — exams test recall and structured reasoning under conditions unlike the job. But it is a general objection that lets the specific claim off the hook. The contamination question is sharper because it can be tested.' },
            { text: '"Impressive — that is expert level."', verdict: 'poor',
              feedback: 'Exam performance and professional competence are different things, and the exam may have been in the training data. Two large assumptions in four words.' },
            { text: '"What was the exact test set size?"', verdict: 'workable',
              feedback: 'A reasonable methodological question, but sample size is rarely the weak point in this kind of claim. Contamination and the exam-versus-job gap are the bigger holes.' }
          ] },
        { type: 'check', questions: [
          { id: 'q0503', kind: 'mcq', difficulty: 'moderate', objective: 'Evaluate AI claims',
            stem: 'A model reports 99% accuracy. What single piece of information most changes how much that is worth?',
            options: [
              'Whether it was measured on data the model had never seen',
              'How many parameters the model has',
              'How long it took to train',
              'Which company built it'
            ], answer: [0],
            rationale: '99% on training data is close to meaningless — a big enough model can memorise. 99% on genuinely held-out data from the right distribution is a real result. Everything else is secondary to that distinction.',
            distractors: {
              1: 'Size does not tell you whether the evaluation was sound.',
              2: 'Training time is a cost, not a measure of quality.',
              3: 'Relevant to weighing the source\'s interest, but it does not tell you what was measured.'
            } },
          { id: 'q0504', kind: 'tf', difficulty: 'easy', objective: 'Evaluate AI claims',
            stem: 'True or false: a model that performs extremely well on a public benchmark is guaranteed to perform well on your own similar task.',
            options: ['True', 'False'], answer: [1],
            rationale: 'Benchmark performance predicts benchmark performance. Your data has a different distribution, your users behave differently, and the benchmark may have been in the training set. The only reliable evidence is an evaluation on your own held-out data.' }
        ] }
      ]
    }
  ],
  extension: {
    title: 'Twenty minutes with the sliders',
    body: 'TensorFlow Playground lets you train a small network in the browser and watch it overfit in real time — add layers to a simple problem and see the decision boundary get wiggly and worse. It is the fastest way to turn "overfitting" from a word into a picture.',
    resourceIds: ['r-perceptron-play']
  }
}
