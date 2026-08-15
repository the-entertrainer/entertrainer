import type { Module } from './types'

export const M08: Module = {
  id: 'm08', n: '08', accent: 'var(--blue)',
  title: 'Transformers and language models',
  intro: 'One architecture, published in 2017 for machine translation, now underlies essentially every system you have heard of. This module explains what a transformer does, what a language model actually is, and — the part most explanations skip — the training stages that turn a next-word predictor into something that answers your question.',
  objectives: [
    'Explain the problem transformers solved that earlier sequence models could not.',
    'Define token, embedding and attention in plain language.',
    'Describe the three training stages that produce a modern assistant.',
    'State precisely what a language model is doing when it answers you.'
  ],
  lessons: [
    {
      id: 'm08l1', title: 'The problem with reading one word at a time', minutes: 7, completion: 'read',
      summary: 'Why the 2017 architecture mattered, in one idea.',
      blocks: [
        { type: 'text', lead: true, body: [
          'Before 2017, the standard way to handle a sentence was to read it word by word, carrying a running summary forward. These were recurrent networks, and they had two problems that no amount of engineering fixed.',
          'They forgot. By the end of a long paragraph, information from the beginning had been overwritten many times by the running summary. And they could not be parallelised: word fifty could not be processed until word forty-nine was done, so training could not be spread across many processors at once. In a field where scale had become the main lever, that second problem was fatal.',
          'The transformer\'s move was to stop reading sequentially. Take the whole sequence at once, and for every word, compute directly how much every other word matters to it. No running summary, no forgetting over distance, and — critically — all of it parallelisable, because the comparisons are independent.',
          'That is the whole reason this architecture won. Not that attention was a better model of language, though it may be. That it could be trained on very large amounts of hardware at once, exactly when the field had discovered that scale was the lever.'
        ] },
        { type: 'video', videoId: 'v-transformers-yc' },
        { type: 'evidence', confidence: 'high', sourceId: 's-transformer',
          claim: 'The transformer architecture was introduced in 2017 and underlies current large language models.',
          basis: 'Primary source: "Attention Is All You Need", Vaswani et al., 2017. The architecture\'s adoption is documented in the model cards and technical reports of every major model family since.' }
      ]
    },
    {
      id: 'm08l2', title: 'Tokens, embeddings, attention', minutes: 12, completion: 'check',
      summary: 'The three words you need to read anything technical about modern AI.',
      blocks: [
        { type: 'video', videoId: 'v-transformers' },
        { type: 'hotspot', diagram: 'token-pipeline', caption: 'The three concepts, in order — plus what comes before and after them',
          points: [
            { x: 32, y: 49.8, label: 'Token', body: 'Text is chopped into pieces before anything else happens. Not quite words: common words are one token, rarer ones split into fragments, and punctuation and spaces count. "Understanding" might be "under" + "standing". This is why models are sometimes strangely bad at counting letters in a word — they do not see letters, they see tokens. It is also the unit you are billed in.' },
            { x: 48.75, y: 49.8, label: 'Embedding', body: 'Each token becomes a list of numbers — a point in a space with hundreds or thousands of dimensions. Positions in that space are learned during training such that tokens used in similar ways end up near each other. This is what people mean when they say a model "represents meaning": meaning is a location, and similarity is distance.' },
            { x: 68, y: 40, label: 'Attention', body: 'For each token, the model computes how much every other token should influence it, and updates its representation accordingly. In "the bank was steep and muddy", the word "bank" is pulled towards its geographic sense by "steep" and "muddy". Context is not looked up in a rule; it is computed as a weighted blend.' },
            { x: 68, y: 53.3, label: 'Layers', body: 'That attention-and-update step is repeated dozens of times — the stack drawn here. Early layers handle local grammar; later ones handle longer-range structure. What each layer does is discovered in training, not designed, which is why interpretability is hard.' },
            { x: 86, y: 49.8, label: 'Prediction', body: 'At the end, the model outputs a probability for every possible next token. One is chosen, appended to the input, and the whole process runs again for the next token. That loop is all that is happening when text appears on your screen a word at a time.' }
          ] },
        { type: 'flashcards', title: 'The vocabulary, in your own words', cards: [
          { front: 'Token', back: 'A chunk of text — roughly a word or word-fragment. The unit the model actually processes and the unit you are charged for.' },
          { front: 'Embedding', back: 'A token represented as coordinates in a high-dimensional space, positioned so that similar usage means nearby location.' },
          { front: 'Attention', back: 'The mechanism by which each token\'s representation is updated based on how relevant every other token is to it.' },
          { front: 'Parameter', back: 'One of the adjustable numbers set during training. "70 billion parameters" counts these.' },
          { front: 'Context window', back: 'How many tokens the model can attend to at once. Everything outside it does not exist as far as the model is concerned.' },
          { front: 'Inference', back: 'Running a trained model to get an output, as opposed to training it. The cheap part per use, and the expensive part at scale.' }
        ] },
        { type: 'resource', title: 'Watch it happen on your own sentence', resourceIds: ['r-transformer-explainer', 'r-illustrated-transformer'] },
        { type: 'check', questions: [
          { id: 'q0801', kind: 'mcq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
            stem: 'Why can language models struggle to count the letters in a word?',
            options: [
              'They process tokens, not individual characters, so letters are not directly visible to them',
              'They are not trained on spelling',
              'Counting is mathematically hard',
              'Their context windows are too small'
            ], answer: [0],
            rationale: 'Tokenisation is upstream of everything. A word arriving as one or two tokens gives the model no direct access to its letters, so letter-level tasks are done by inference rather than by looking.',
            distractors: {
              1: 'Spelling appears constantly in training text.',
              2: 'Counting to ten is not hard; seeing the letters is the problem.',
              3: 'Irrelevant — a single short word fits any context window.'
            } },
          { id: 'q0802', kind: 'mcq', difficulty: 'hard', objective: 'Distinguish AI approaches',
            stem: 'What does "attention" compute?',
            options: [
              'How much each token in the sequence should influence each other token',
              'Which parts of the input the user considers important',
              'How long the model should spend on a request',
              'Which training examples were most useful'
            ], answer: [0],
            rationale: 'It is a weighting between positions in the sequence, computed from the content itself. The everyday sense of "paying attention" is a loose metaphor for it and misleads more than it helps.',
            distractors: {
              1: 'The user is not consulted; the weights are computed from the text.',
              2: 'Nothing to do with time budgets.',
              3: 'That would be a different technique entirely — attention operates at inference over the current input.'
            } },
          { id: 'q0806', kind: 'fitb', difficulty: 'moderate', objective: 'Define token, embedding and attention',
            stem: 'Fill in the blank: the mechanism by which each token\'s representation is updated based on how relevant every other token is to it is called ___.',
            options: [], answer: [], blankAnswers: ['attention'],
            rationale: 'Attention. It is what pulls "bank" towards its geographic sense in "the bank was steep and muddy" — computed as a weighted blend, not looked up in a rule.' }
        ] }
      ]
    },
    {
      id: 'm08l3', title: 'Three stages of training', minutes: 9, completion: 'check',
      summary: 'How a next-word predictor becomes an assistant.',
      blocks: [
        { type: 'text', body: [
          'A common misunderstanding is that a language model is trained to be helpful. It is not, at least not initially. It is trained to predict text, and helpfulness is added afterwards by a separate process. Knowing the three stages explains a surprising amount of observed behaviour.'
        ] },
        { type: 'process', caption: 'The three stages, in order', steps: [
          { label: 'Pretraining', body: 'Predict the next token, across an enormous quantity of text. This is where essentially all the knowledge and language ability comes from, and it accounts for the overwhelming majority of the compute cost. The output of this stage is a model that continues text plausibly and has no concept of answering a question — offered "What is the capital of France?" it might reasonably continue with more exam questions.' },
          { label: 'Instruction tuning', body: 'Further training on examples of instructions paired with good responses. This teaches the format of assistance: that a question should be answered rather than continued. Far cheaper than pretraining, and it changes behaviour rather than knowledge.' },
          { label: 'Preference tuning', body: 'Humans compare pairs of responses and say which is better. A reward model is fitted to those preferences, and the language model is tuned to score well against it. Commonly called RLHF. This is where tone, refusal behaviour, hedging and much of what people call a model\'s "personality" are set.' }
        ] },
        { type: 'video', videoId: 'v-rlhf' },
        { type: 'text', body: [
          'Two consequences worth carrying with you.',
          'The model\'s knowledge is fixed at pretraining. It has a cut-off, after which it knows nothing unless you tell it or it is given a search tool. Ask about last week and, unless it can look, it will either say it cannot know or — worse — produce something plausible.',
          'The model\'s manner is a design decision made by a company. Politeness, hedging, what it declines to discuss, how confident it sounds: those come from stage 3, from choices about whose preferences to collect and how. When a model sounds confident, that is a trained style, not a signal of reliability. Those two things are entirely uncorrelated, and mistaking one for the other is probably the single most common error users make.'
        ] },
        { type: 'evidence', confidence: 'medium', sourceId: 's-model-spec',
          claim: 'A model\'s tone, refusals and hedging behaviour are shaped by deliberate preference-tuning choices made by the developer.',
          basis: 'Labs publish specifications of intended behaviour — OpenAI\'s Model Spec is one — which document these as design choices. Rated medium because published intent is evidence of what was aimed at, not proof of what the training actually produced.' },
        { type: 'check', questions: [
          { id: 'q0803', kind: 'mcq', difficulty: 'moderate', objective: 'Evaluate AI claims',
            stem: 'A model answers your question in a confident, well-organised tone. What does that tell you about accuracy?',
            options: [
              'Nothing. Tone is set by preference tuning and is independent of whether the content is right',
              'It is probably accurate, since models hedge when unsure',
              'It is probably inaccurate, since confidence indicates hallucination',
              'It depends on the length of the answer'
            ], answer: [0],
            rationale: 'Confidence is a trained style. A well-tuned model may hedge more often when uncertain, but that correlation is weak and cannot be relied on for any individual answer. Treating fluency as evidence is the central user-side failure mode.',
            distractors: {
              1: 'Hedging behaviour is inconsistent and easily overridden by phrasing.',
              2: 'Equally wrong in the other direction — plenty of confident answers are correct.',
              3: 'Length has no reliable relationship to accuracy either.'
            } },
          { id: 'q0804', kind: 'mrq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
            stem: 'Which are true of pretraining? Select all that apply.',
            options: [
              'It is where most of the model\'s knowledge comes from',
              'It accounts for most of the compute cost',
              'It teaches the model to follow instructions',
              'It has a cut-off date after which the model knows nothing new'
            ], answer: [0, 1, 3],
            rationale: 'Pretraining supplies knowledge and language ability at great expense, and freezes at a date. Instruction-following is added afterwards in a much cheaper stage.',
            distractors: { 2: 'That is stage 2. A purely pretrained model does not reliably answer questions at all.' } }
        ] }
      ]
    },
    {
      id: 'm08l4', title: 'What a language model is, precisely', minutes: 8, completion: 'check',
      summary: 'The claim that is defensible, and the two that are not.',
      blocks: [
        { type: 'text', lead: true, body: [
          'Here is a statement that is accurate and that you can defend in any room: a large language model is a system that, given a sequence of tokens, produces a probability distribution over the next token, having been fitted to an enormous quantity of human-written text and then tuned on human preferences.',
          'Everything contentious is in what you add to that sentence.'
        ] },
        { type: 'tabs', items: [
          { label: 'The deflationary read', body: '"It is just autocomplete." Accurate about the mechanism, and it undersells the result. Predicting the next token well across the whole range of human writing requires representing an enormous amount of structure — syntax, facts, styles, chains of inference. "Just" is doing a lot of work in that sentence, and the people who use it are often the ones most surprised by what these systems can do.' },
          { label: 'The inflationary read', body: '"It understands." Not supported by anything we can currently measure. Models produce text that would indicate understanding if a person produced it, which is exactly the inference module 1 warned about. They also fail in ways no understanding person would — confidently inventing citations, contradicting themselves within a paragraph, failing at trivial variations of problems they just solved.' },
          { label: 'The honest read', body: 'These systems have learned representations that support a great deal of useful behaviour, and we do not have a settled account of what those representations are. Interpretability research is actively trying to find out and has made real, partial progress. "We do not fully know" is not a dodge here — it is the accurate state of the field, and it is stated plainly in the labs\' own research.' },
          { label: 'What follows practically', body: 'Use them where the output is checkable and the cost of an error is bounded. Drafting, summarising, transforming, brainstorming, explaining — all cases where you can see whether it worked. Be much more careful where you cannot check: facts you do not know, citations you will not follow, calculations you will not redo.' }
        ] },
        { type: 'evidence', confidence: 'medium', sourceId: 's-circuits',
          claim: 'Researchers have identified interpretable internal structures in language models, but no complete account of how they produce their outputs exists.',
          basis: 'Interpretability work — Anthropic\'s Transformer Circuits thread among others — has found identifiable features and circuits inside models. That the account is partial is stated by the researchers themselves. Rated medium because this is a fast-moving area and much of it is published by labs with a commercial interest.' },
        { type: 'check', questions: [
          { id: 'q0805', kind: 'mcq', difficulty: 'hard', objective: 'Evaluate AI claims',
            stem: 'Which statement about large language models is best supported by current evidence?',
            options: [
              'They have learned representations supporting substantial useful behaviour, and those representations are only partly understood',
              'They understand language in the way a human does',
              'They are simple lookup tables that retrieve memorised text',
              'They reason symbolically over an internal knowledge base'
            ], answer: [0],
            rationale: 'This is the position that fits both the successes and the failures, and it matches what interpretability researchers actually say about their own findings. The other three all overclaim in one direction or the other.',
            distractors: {
              1: 'Unmeasurable, and contradicted by failure modes no understanding person would show.',
              2: 'They generalise to inputs never seen, which retrieval cannot explain.',
              3: 'There is no symbolic knowledge base; representations are learned and distributed.'
            } }
        ] },
        { type: 'reflect', minWords: 30,
          prompt: 'Think of one task you would trust a language model with and one you would not. What distinguishes them — is it the difficulty of the task, or your ability to check the answer?',
          hint: 'For most people the honest answer is checkability, not difficulty. That is a more useful boundary than "hard versus easy".'
        }
      ]
    }
  ],
  extension: {
    title: 'Build one',
    body: 'Andrej Karpathy builds a small GPT from an empty file in about two hours, explaining every line. It requires Python and some patience, and nothing else in this course depends on it — but if you want to stop taking any of this on trust, this is the way.',
    resourceIds: ['r-attention-paper', 'r-illustrated-transformer']
  }
}
