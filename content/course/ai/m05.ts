import type { Module } from './types'

export const M05: Module = {
  id: 'm05', n: '05', accent: 'var(--blue)',
  title: 'Learning from data',
  intro: 'Here is the idea that broke years of deadlock: stop writing rules by hand. Instead, let the machine find its own rules by looking at examples. This module explains what machine learning really does. You will learn the three main setups you will meet, and the two ways a model can look better than it really is — overfitting, and a misleading benchmark score.',
  objectives: [
    'Explain the shift from writing rules by hand to fitting a function to data.',
    'Tell apart supervised, unsupervised and reinforcement learning by what each one needs from you.',
    'Describe what a dataset is, and explain why labelling data is the expensive part.',
    'Explain overfitting, and explain why a high benchmark score can be misleading.'
  ],
  lessons: [
    {
      id: 'm05l1', title: 'Stop writing rules', minutes: 8, completion: 'read',
      summary: 'The one change in thinking that made modern AI possible.',
      blocks: [
        { type: 'text', lead: true, body: [
          'Here is the whole idea in one sentence. Everything after this is just detail.',
          'Old approach: a person works out the rule and writes it down by hand. To catch spam email, you might write a rule like "if it contains the word FREE and comes from an unknown sender, it is probably spam." You then have to keep updating that list of rules forever. Spammers change their tricks faster than you can update the rules.',
          'New approach: a person collects examples, labels them, and lets an algorithm find its own rule that fits the examples. You show the system a million emails, each one already marked as spam or not-spam. The system then works out for itself which combinations of features predict the label. It can find combinations that no person would ever have thought to write down as a rule.',
          'This removes the knowledge bottleneck you saw in module 3. You no longer need an expert to explain how they reach their judgement. You only need them to make judgements that you can record. A radiologist who cannot explain how they spot a tumour on a scan can still label ten thousand scans as "tumour" or "no tumour." It turns out that is enough for the system to learn from.'
        ] },
        { type: 'compare', caption: 'The two approaches, side by side',
          columns: ['', 'Rules', 'Learning'],
          rows: [
            ['What a person provides', 'Their reasoning, written down as rules', 'Examples with the correct answers attached'],
            ['Where the hard part is', 'Putting the expert\'s know-how into words', 'Collecting and labelling enough data'],
            ['What happens with unusual cases', 'Confident, and wrong', 'Confident, and wrong, but in a different way'],
            ['Can you see why it made a decision?', 'Yes, rule by rule', 'Usually not, and that is a real cost'],
            ['Handles new situations', 'Only cases the rule-writer thought of', 'Situations similar to the training examples'],
            ['Cost of getting better', 'Write more rules; they start interacting in messy ways', 'Collect more data; the cost is easier to predict']
          ] },
        { type: 'video', videoId: 'v-supervised' },
        { type: 'takeaway', body: 'Machine learning did not make the knowledge problem disappear. It changed the question. Instead of asking "can the expert explain their reasoning?", we now ask "can we collect enough labelled examples?" That second question has an answer you can plan and budget for. That is why the field moved in this direction.' }
      ]
    },
    {
      id: 'm05l2', title: 'Three ways to learn', minutes: 9, completion: 'check',
      summary: 'Supervised, unsupervised and reinforcement learning, and what each one needs from you.',
      blocks: [
        { type: 'tabs', items: [
          { label: 'Supervised', body: 'You give the system examples that already have the correct answer attached: photos labelled "cat" or "dog", emails labelled "spam" or "not spam", loan applications labelled "repaid" or "defaulted." The system learns to match each input to its label. This is the most common type of machine learning by far. Most of the cost comes from producing the labels.' },
          { label: 'Unsupervised', body: 'You give the system examples with no answers attached, and ask it to find patterns on its own: which customers are similar to each other, which transactions look unlike all the rest, what natural groups exist in the data. Nobody has to label anything, so this is cheap. But there is a cost: you have no correct answer to check against. The groups it finds may or may not be useful to you. Judging whether the output is any good is the hard part.' },
          { label: 'Reinforcement', body: 'No examples at all. The system takes an action, gets a reward or a penalty, and adjusts its behaviour based on that. This is how game-playing systems learn, and how a robot learns to walk. It needs an environment where it can try things millions of times. That is why it works brilliantly in simulations and games, and much less easily in the real world, where a failed attempt can break something real.' },
          { label: 'Self-supervised', body: 'This is the method that made large language models possible. It is the reason they exist at all. Take text with no labels, hide part of it, and ask the model to predict the hidden part. The hidden part becomes the "label", so it is created for free straight from the raw text. This is what let training scale up to almost the whole readable internet. Nobody had to label any of it by hand.' }
        ] },
        { type: 'flashcards', title: 'Which setup is this?', cards: [
          { front: 'Predicting tomorrow\'s electricity demand from ten years of records', back: 'Supervised. The past readings are the labels. History has already given you the correct answer.' },
          { front: 'Grouping 50,000 support tickets into themes nobody defined', back: 'Unsupervised. No labels exist. Deciding whether the themes it finds are actually useful is a job for a person.' },
          { front: 'A program learning to play a game by playing itself millions of times', back: 'Reinforcement. The score is the reward signal. No examples of good play are needed.' },
          { front: 'Training a model to predict the next word across a trillion words of text', back: 'Self-supervised. The next word is the label, and it is already sitting right there in the text.' },
          { front: 'Flagging the 0.1% of transactions unlike all the others', back: 'Usually unsupervised anomaly detection — often because you have very few labelled examples of the kind of fraud you have not seen before.' }
        ] },
        { type: 'video', videoId: 'v-rlhf' },
        { type: 'check', questions: [
          { id: 'q0501', kind: 'mcq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
            stem: 'Why was self-supervised learning so important for language models?',
            options: [
              'It creates labels from the raw data itself, so training can scale up to huge amounts of unlabelled text',
              'It removes the need for large amounts of computing power',
              'It guarantees the model will not make mistakes',
              'It makes models smaller'
            ], answer: [0],
            rationale: 'Labelling is the bottleneck in supervised learning. Predicting the hidden parts of text creates the training signal for free. This is what allowed training on amounts of text that no human labelling effort could ever have labelled by hand.',
            distractors: {
              1: 'It increased the amount of computing power needed by a huge amount. The scale is the whole point.',
              2: 'It has no such effect. See module 10, on hallucination.',
              3: 'Models got much larger, not smaller.'
            } },
          { id: 'q0502', kind: 'mrq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
            stem: 'Which are true of reinforcement learning? Select all that apply.',
            options: [
              'It learns from reward signals, not from labelled examples',
              'It usually needs an environment where trying many times is cheap',
              'It is the most common form of machine learning used in real products',
              'It has been central to systems that play games'
            ], answer: [0, 1, 3],
            rationale: 'Reinforcement learning works well where trying things over and over is cheap and easy to repeat, such as games and simulations. In real-world business use, supervised learning is used far more.',
            distractors: { 2: 'Supervised learning is used far more than any other type. Reinforcement learning is important in research, and in a few famous systems, but it is not the most common type overall.' } },
          { id: 'q0505', kind: 'fitb', difficulty: 'moderate', objective: 'Distinguish AI approaches',
            stem: 'Fill in the blank: hiding part of unlabelled text, and training a model to predict what was hidden, is called ___-supervised learning.',
            options: [], answer: [], blankAnswers: ['self', 'self-supervised', 'self supervised'],
            rationale: 'Self-supervised. The hidden part becomes the label, created for free from raw text. This is what let training scale up to huge unlabelled datasets, and it is the reason large language models exist at all.' }
        ] }
      ]
    },
    {
      id: 'm05l3', title: 'What a dataset actually is', minutes: 8, completion: 'activity',
      summary: 'The plain, unglamorous thing at the centre of it all.',
      blocks: [
        { type: 'text', body: [
          'A dataset does not just appear in nature. A person decided what to collect, where to collect it from, over what period of time, and how to describe it. The model inherits every one of those decisions. None of them is visible when you look at the model\'s output.',
          'Think about a model built to predict which job applicants to interview, trained on ten years of a company\'s past hiring decisions. The dataset does not contain "who would actually have been good at the job." It only contains "who this company chose to interview in the past." If the company\'s past choices were biased, the dataset records that bias as if it were simply correct. The model then repeats the same bias — efficiently, at large scale, and looking more objective than the original human decisions ever did.',
          'This is why "the algorithm is neutral, it just learns from the data" is not a good defence. The data itself carries the bias.'
        ] },
        { type: 'evidence', confidence: 'high',
          claim: 'Models trained on past decisions repeat the patterns in those decisions, including the bad ones.',
          basis: 'This follows directly from how the method works: a supervised model is fitted to match the labels it was given. It is documented widely in research on fairness in AI, and in NIST\'s AI Risk Management Framework, which treats where your data comes from as a major risk to manage.', sourceId: 's-nist' },
        { type: 'practice', title: 'Train something and break it',
          steps: [
            'Open Teachable Machine using the link below. You do not need an account, and there is no code to write or software to install.',
            'Create an image project with two categories, using whatever objects are near you. For example, a pen versus a mug, or your hand open versus your hand closed.',
            'Show your webcam about 30 examples of each category, then train the model. This takes less than a minute.',
            'Test it. It will probably work well. Be suspicious of that feeling of success.',
            'Now try to make it fail on purpose: change the lighting, move to a different background, hold the object at an odd angle, or try an object it has never seen before.',
            'Write down what happens when it gets something wrong. Does it say it is unsure? Or does it confidently pick a category anyway?'
          ],
          output: 'A one-line note about how your model failed, and whether you could tell it had failed just by looking at the output. Keep this note. Module 10 comes back to exactly this point.' },
        { type: 'resource', resourceIds: ['r-teachable', 'r-quickdraw'] },
        { type: 'reflect', minWords: 25,
          prompt: 'Your model was trained on 30 images taken in your room. What was present in every single one of those images that you did not mean to teach it?',
          hint: 'Your lighting. Your background. The angle you naturally hold objects at. The model cannot tell which of these you actually meant to teach it.' }
      ]
    },
    {
      id: 'm05l4', title: 'Overfitting, and the benchmark problem', minutes: 10, completion: 'check',
      summary: 'The two ways a model looks better than it is.',
      blocks: [
        { type: 'text', body: [
          'A student who memorises last year\'s exam paper will do brilliantly on last year\'s exam, and badly on this year\'s. That is overfitting: fitting the training examples so closely that you learn their random noise and quirks, instead of the real underlying pattern.',
          'The standard way to guard against this is to hold some data back. You train the model on one part of the data, then test it on a separate part it has never seen, and report that second score. A model that is only evaluated on its own training data is reporting a number that means nothing at all. This happens often enough in vendor material that "was this measured on data the model never saw during training?" is a fair question to ask, even if it is not always a welcome one.'
        ] },
        { type: 'labeled', caption: 'Three numbers, three meanings',
          parts: [
            { label: 'Training accuracy', body: 'How well the model does on the exact examples it was taught. This is always the highest number, and the least useful one. On its own, it only tells you the model can remember, not that it has actually learned anything general.' },
            { label: 'Validation accuracy', body: 'Performance on separate data used while you are tuning the model. This is honest at first. But the more decisions you make by looking at this number, the more you have quietly started fitting to it as well.' },
            { label: 'Test accuracy', body: 'Performance on data that is used exactly once, right at the end. This is the only number really worth reporting, and it is the one most often missing from a presentation slide.' }
          ] },
        { type: 'chart', kind: 'line', unit: '%',
          caption: 'Validation accuracy as a model becomes more complex — an example pattern, not measured data',
          note: 'The shape of this curve is the point, not the exact numbers. Accuracy on data the model has never seen goes up as the model becomes more powerful. It reaches a peak, then falls again as the model starts fitting random noise in the training data instead of the real pattern. Training accuracy on its own would just keep climbing past that peak. That is exactly why it is the least useful of the three numbers described above.',
          data: [
            { label: 'Too simple', value: 58 },
            { label: '', value: 72 },
            { label: 'Good fit', value: 89 },
            { label: '', value: 83 },
            { label: 'Overfit', value: 68 }
          ] },
        { type: 'text', body: [
          'The same problem happens at the level of the whole field, and this is the version that matters when you are reading the news. A benchmark is a shared test that everyone reports their results against. Over time, the whole field starts to overfit to that benchmark. Model designs, training choices and data all get selected because they score well on the benchmark. The benchmark then stops measuring general ability, and starts measuring only the ability to do well on that one benchmark.',
          'The problem is worse for large language models. They are trained on huge amounts of text collected from the internet, and benchmarks are also published on the internet. So when a model scores well on a test, there is a real possibility that the test itself, or something very close to it, was already inside the training data. This is called contamination. It is genuinely hard to rule out. It is also why a headline exam score deserves less trust than it usually gets.'
        ] },
        { type: 'evidence', confidence: 'medium',
          claim: 'Benchmark contamination — test material showing up inside training data — is a known problem in evaluating large language models, and it is not yet solved.',
          basis: 'This is widely accepted in model documentation and in research on evaluation, and AI labs report their own efforts to remove contamination, with varying levels of care. It is rated medium confidence because how much contamination exists in any specific released model usually cannot be independently checked.', sourceId: 's-ai-index' },
        { type: 'scenario',
          setup: 'A vendor tells you their model "scores in the top 10 percent on a professional certification exam in your industry."',
          question: 'What is the strongest response?',
          choices: [
            { text: '"Can it do that on this year\'s exam paper, the one published after the model finished training?"', verdict: 'best',
              feedback: 'This is the contamination question, asked in a clear and answerable way. A model that still performs well on material published after its training cut-off date has shown something real. A model that does not may simply be recalling answers it already saw.' },
            { text: '"Exams are not real work, so the number is meaningless."', verdict: 'workable',
              feedback: 'This is fair, and true. Exams test memory and structured reasoning, under conditions that are not like the real job. But this is a general objection, and it lets the specific claim go unchallenged. The contamination question is sharper, because you can actually go and test it.' },
            { text: '"Impressive — that is expert level."', verdict: 'poor',
              feedback: 'Doing well on an exam and being competent at the actual job are two different things. And the exam itself may have been part of the training data. That is two big assumptions packed into four words.' },
            { text: '"What was the exact test set size?"', verdict: 'workable',
              feedback: 'A reasonable question about method, but the sample size is rarely the weakest point in a claim like this. Contamination, and the gap between an exam and the real job, are the bigger problems.' }
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
            rationale: '99 percent on training data is close to meaningless, because a large enough model can simply memorise the answers. 99 percent on data the model genuinely never saw before, and that matches real conditions, is a real result. Everything else matters much less than this one distinction.',
            distractors: {
              1: 'Size does not tell you whether the evaluation was sound.',
              2: 'Training time is a cost, not a measure of quality.',
              3: 'This is relevant for judging whether the source has an interest in the result, but it does not tell you what was actually measured.'
            } },
          { id: 'q0504', kind: 'tf', difficulty: 'easy', objective: 'Evaluate AI claims',
            stem: 'True or false: a model that performs extremely well on a public benchmark is guaranteed to perform well on your own similar task.',
            options: ['True', 'False'], answer: [1],
            rationale: 'Benchmark performance mainly predicts more benchmark performance. Your own data is different, your users behave differently, and the benchmark itself may have been part of the training data. The only evidence you can really trust is a test on your own data that the model has never seen.' }
        ] }
      ]
    }
  ],
  extension: {
    title: 'Twenty minutes with the sliders',
    body: 'TensorFlow Playground lets you train a small neural network right in your browser, and watch it overfit as it happens. Add more layers to a simple problem, and watch the decision boundary become wiggly and worse. It is the fastest way to turn "overfitting" from just a word into something you can actually see.',
    resourceIds: ['r-perceptron-play']
  }
}
