import type { Module } from './types'

export const M08: Module = {
  id: 'm08', n: '08', accent: 'var(--blue)',
  title: 'Transformers and language models',
  intro: 'In 2017, researchers published one new design for handling language. It was built for machine translation. Today, that same design sits inside almost every AI system you have heard of. This module explains three things. First, what a transformer actually does. Second, what a language model really is. Third — the part most explanations skip — the training steps that turn a simple next-word guesser into something that can answer your questions.',
  objectives: [
    'Explain the problem transformers solved, which older models could not solve.',
    'Define token, embedding and attention in plain words.',
    'Describe the three training stages that turn a model into a modern assistant.',
    'State exactly what a language model is doing when it answers you.'
  ],
  lessons: [
    {
      id: 'm08l1', title: 'The problem with reading one word at a time', minutes: 7, completion: 'read',
      summary: 'Why the 2017 design mattered, in one idea.',
      blocks: [
        { type: 'text', lead: true, body: [
          'Before 2017, computers usually read a sentence one word at a time. As they read, they carried a running summary forward, updating it word by word. These were called recurrent networks. They had two problems that engineers could not fix, no matter how hard they tried.',
          'First, they forgot things. By the end of a long paragraph, the running summary had been overwritten so many times that information from the start was gone. Second, they could not be parallelised. This means word fifty could not be processed until word forty-nine was finished. So the work could not be split across many processors at the same time. By 2017, scale — using huge amounts of computing power — had become the main way to make AI better. This second problem was fatal for that reason.',
          'The transformer solved this by not reading word by word at all. Instead, it looks at the whole sentence at once. For every word, it works out directly how much every other word matters to it. There is no running summary, so there is no forgetting over distance. And — this is the important part — all of this can be done in parallel, because each comparison between two words does not depend on the others.',
          'This is the real reason the transformer design won. It may or may not be a better model of how language works — that is a separate question. What mattered was that it could be trained on huge amounts of computing hardware at the same time. This arrived exactly when researchers discovered that scale was the key to better AI.'
        ] },
        { type: 'video', videoId: 'v-transformers-yc' },
        { type: 'evidence', confidence: 'high', sourceId: 's-transformer',
          claim: 'The transformer design was introduced in 2017. It underlies today\'s large language models.',
          basis: 'The original source is the paper "Attention Is All You Need" by Vaswani and other authors, published in 2017. Every major AI model family since then has documented its use of this design, in their model cards and technical reports.' }
      ]
    },
    {
      id: 'm08l2', title: 'Tokens, embeddings, attention', minutes: 12, completion: 'check',
      summary: 'The three words you need, to read anything technical about modern AI.',
      blocks: [
        { type: 'video', videoId: 'v-transformers' },
        { type: 'hotspot', diagram: 'token-pipeline', caption: 'The three ideas, in order — plus what comes before and after them',
          points: [
            { x: 32, y: 49.8, label: 'Token', body: 'Before anything else happens, text is cut into small pieces called tokens. These are not quite the same as words. Common words become one token each. Rarer words are split into smaller pieces. Punctuation marks and spaces count too. For example, "understanding" might become "under" plus "standing". This is why models can be strangely bad at counting the letters in a word — they do not see letters. They see tokens instead. Tokens are also the unit you pay for when you use these systems.' },
            { x: 48.75, y: 49.8, label: 'Embedding', body: 'Each token is turned into a list of numbers. Think of this list as a point in a space with hundreds or even thousands of dimensions. During training, the model learns where to place each token in this space. Tokens that are used in similar ways end up placed close together. This is what people mean when they say a model "represents meaning". Meaning becomes a location in this space, and how similar two things are becomes a matter of distance.' },
            { x: 68, y: 40, label: 'Attention', body: 'For each token, the model works out how much every other token should affect it, and then updates its representation based on that. For example, in the sentence "the bank was steep and muddy", the word "bank" is pulled towards its riverbank meaning by the words "steep" and "muddy". The model does not look up context using a fixed rule. It computes context as a weighted mix of everything around it.' },
            { x: 68, y: 53.3, label: 'Layers', body: 'This attention-and-update step is repeated many times, often dozens — shown here as a stack of layers. The early layers mostly handle local grammar. The later layers handle bigger, longer-range patterns. Nobody designs what each layer does by hand. Each layer\'s job is discovered during training. This is why it is hard for researchers to explain exactly what is happening inside.' },
            { x: 86, y: 49.8, label: 'Prediction', body: 'At the end, the model gives a probability to every possible next token. One token is chosen and added to the input. Then the whole process runs again, to pick the following token. This loop — pick one token, add it, repeat — is all that is happening when you watch text appear on your screen, word by word.' }
          ] },
        { type: 'flashcards', title: 'The key words, in your own words', cards: [
          { front: 'Token', back: 'A small piece of text — roughly a word, or part of a word. This is the unit the model actually works with, and the unit you pay for.' },
          { front: 'Embedding', back: 'A token turned into coordinates in a space with many dimensions. Tokens used in similar ways are placed near each other.' },
          { front: 'Attention', back: 'The process that updates each token based on how relevant every other token is to it.' },
          { front: 'Parameter', back: 'One of the numbers inside a model that gets adjusted during training. When you hear "70 billion parameters", this is what is being counted.' },
          { front: 'Context window', back: 'The number of tokens the model can look at, at one time. Anything outside this window does not exist, as far as the model is concerned.' },
          { front: 'Inference', back: 'Using an already-trained model to produce an output, rather than training it. Each single use is cheap, but it becomes expensive when done at a huge scale.' }
        ] },
        { type: 'resource', title: 'Watch it happen with your own sentence', resourceIds: ['r-transformer-explainer', 'r-illustrated-transformer'] },
        { type: 'check', questions: [
          { id: 'q0801', kind: 'mcq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
            stem: 'Why can language models struggle to count the letters in a word?',
            options: [
              'They work with tokens, not individual letters, so letters are not directly visible to them',
              'They are not trained on spelling',
              'Counting is mathematically hard',
              'Their context windows are too small'
            ], answer: [0],
            rationale: 'Tokenisation happens before anything else. When a word arrives as one or two tokens, the model has no direct access to its letters. So letter-level tasks like counting have to be guessed, not read directly.',
            distractors: {
              1: 'Spelling appears all the time in the text the model was trained on.',
              2: 'Counting to ten is not hard for a computer. Seeing the individual letters is the real problem.',
              3: 'This is not the reason — a single short word easily fits inside any context window.'
            } },
          { id: 'q0802', kind: 'mcq', difficulty: 'hard', objective: 'Distinguish AI approaches',
            stem: 'What does "attention" compute?',
            options: [
              'How much each token in the sequence should affect every other token',
              'Which parts of the input the user considers important',
              'How long the model should spend on a request',
              'Which training examples were most useful'
            ], answer: [0],
            rationale: 'Attention is a set of weights between positions in the sequence, worked out from the content itself. The everyday meaning of "paying attention" is only a loose comparison. It misleads more than it helps.',
            distractors: {
              1: 'The user is never asked. The weights come from the text itself.',
              2: 'This has nothing to do with how long the model spends on a task.',
              3: 'That describes a different technique entirely. Attention works on the current input, while the model is producing an answer.'
            } },
          { id: 'q0806', kind: 'fitb', difficulty: 'moderate', objective: 'Define token, embedding and attention',
            stem: 'Fill in the blank: the process that updates each token based on how relevant every other token is to it is called ___.',
            options: [], answer: [], blankAnswers: ['attention'],
            rationale: 'Attention. It is what pulls "bank" towards its riverbank meaning in "the bank was steep and muddy". It is computed as a weighted mix, not looked up using a fixed rule.' }
        ] }
      ]
    },
    {
      id: 'm08l3', title: 'Three stages of training', minutes: 9, completion: 'check',
      summary: 'How a next-word guesser becomes an assistant.',
      blocks: [
        { type: 'text', body: [
          'Many people wrongly believe a language model is trained to be helpful. At first, it is not. It is trained only to predict text. Helpfulness is added later, in a separate process. Once you know the three training stages, a lot of the model\'s behaviour starts to make sense.'
        ] },
        { type: 'process', caption: 'The three stages, in order', steps: [
          { label: 'Pretraining', body: 'The model learns to predict the next token, using a huge amount of text. Almost all of its knowledge and language ability comes from this stage. It also uses up most of the computing cost. At the end of this stage, the model can continue text in a believable way. But it has no idea what "answering a question" means. If you gave it "What is the capital of France?", it might just continue with more exam-style questions.' },
          { label: 'Instruction tuning', body: 'The model is trained further, this time on examples that pair an instruction with a good response. This teaches it the format of being helpful — that a question should be answered, not just continued as more text. This stage is much cheaper than pretraining. It changes how the model behaves, not what it knows.' },
          { label: 'Preference tuning', body: 'People compare pairs of responses and say which one is better. A separate "reward model" is built to match these human preferences. The language model is then adjusted to score well on that reward model. This process is commonly called RLHF. This is the stage where tone, refusals, hedging, and most of what people call a model\'s "personality" get set.' }
        ] },
        { type: 'video', videoId: 'v-rlhf' },
        { type: 'text', body: [
          'Two things follow from this that are worth remembering.',
          'First, the model\'s knowledge is fixed at the pretraining stage. It has a cut-off date. After that date, it knows nothing new, unless you tell it directly or give it a search tool. If you ask about something from last week, and it cannot search, it will either say it does not know, or — worse — it will produce an answer that sounds believable but may be wrong.',
          'Second, the model\'s manner of speaking is a design choice made by a company. How polite it is, how much it hedges, what topics it refuses to discuss, how confident it sounds — all of this comes from stage three, from decisions about whose preferences were collected and how. When a model sounds confident, that is a trained style. It is not a sign that the answer is reliable. These two things — confidence and correctness — are not connected to each other. Mistaking one for the other is probably the single most common mistake users make.'
        ] },
        { type: 'evidence', confidence: 'medium', sourceId: 's-model-spec',
          claim: 'A model\'s tone, its refusals, and how much it hedges are all shaped by deliberate choices the developer makes during preference tuning.',
          basis: 'AI labs publish documents describing the behaviour they intend their models to have. OpenAI\'s Model Spec is one example. These documents describe such choices directly. This is rated medium confidence because a published intention shows what the developer aimed for. It does not prove that the training actually achieved it.' },
        { type: 'check', questions: [
          { id: 'q0803', kind: 'mcq', difficulty: 'moderate', objective: 'Evaluate AI claims',
            stem: 'A model answers your question in a confident, well-organised tone. What does that tell you about accuracy?',
            options: [
              'Nothing. Tone comes from preference tuning, and has nothing to do with whether the content is correct',
              'It is probably accurate, since models hedge when unsure',
              'It is probably inaccurate, since confidence indicates hallucination',
              'It depends on the length of the answer'
            ], answer: [0],
            rationale: 'Confidence is a trained style, not a fact about accuracy. A well-tuned model might hedge more often when it is unsure, but this pattern is weak and unreliable for any single answer. Treating smooth, fluent writing as proof of correctness is the most common mistake users make.',
            distractors: {
              1: 'Hedging is inconsistent, and can easily be changed just by how you phrase your question.',
              2: 'This is wrong in the opposite direction — many confident answers are also correct.',
              3: 'The length of an answer has no reliable link to its accuracy either.'
            } },
          { id: 'q0804', kind: 'mrq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
            stem: 'Which are true of pretraining? Select all that apply.',
            options: [
              'It is where most of the model\'s knowledge comes from',
              'It accounts for most of the compute cost',
              'It teaches the model to follow instructions',
              'It has a cut-off date after which the model knows nothing new'
            ], answer: [0, 1, 3],
            rationale: 'Pretraining gives the model most of its knowledge and language ability, at a very high computing cost, and it freezes at a fixed date. The ability to follow instructions is added afterwards, in a much cheaper stage.',
            distractors: { 2: 'That happens in stage two. A model that has only gone through pretraining does not reliably answer questions at all.' } }
        ] }
      ]
    },
    {
      id: 'm08l4', title: 'What a language model is, precisely', minutes: 8, completion: 'check',
      summary: 'The claim you can defend, and the two you cannot.',
      blocks: [
        { type: 'text', lead: true, body: [
          'Here is a statement that is accurate, and that you can defend anywhere: a large language model is a system that takes in a sequence of tokens, and produces a probability for every possible next token. It reaches this ability by being trained on a huge amount of human-written text, and then further tuned using human preferences.',
          'Any disagreement comes from what people add on top of that sentence.'
        ] },
        { type: 'tabs', items: [
          { label: 'The "it\'s just autocomplete" view', body: '"It is just autocomplete." This is accurate about the mechanism, but it undersells the result. To predict the next token well, across the whole range of human writing, the model has to represent an enormous amount of structure — grammar, facts, writing styles, chains of reasoning. The word "just" is doing a lot of work in that sentence. The people who say it are often the most surprised by what these systems can actually do.' },
          { label: 'The "it understands" view', body: '"It understands." Nothing we can currently measure supports this claim. Models produce text that would suggest understanding, if a person had written it. This is exactly the trap module 1 warned you about. Models also fail in ways no person who truly understood would fail — confidently making up citations, contradicting themselves within one paragraph, and failing at small variations of a problem they had just solved correctly.' },
          { label: 'The honest view', body: 'These systems have learned internal representations that support a lot of useful behaviour. Nobody yet has a complete, agreed explanation of what those representations actually are. A field called interpretability research is trying to find out, and has made real progress, though only partial progress so far. Saying "we do not fully know" is not avoiding the question. It is the honest, accurate state of the field today, and the labs say so themselves in their own research.' },
          { label: 'What this means for you in practice', body: 'Use these systems where you can check the output, and where a mistake would not cost much. Drafting text, summarising, transforming text from one form to another, brainstorming, explaining a concept — in all of these cases, you can see for yourself whether it worked. Be much more careful in cases you cannot check: facts you do not already know, citations you will not go and verify, or calculations you will not redo yourself.' }
        ] },
        { type: 'evidence', confidence: 'medium', sourceId: 's-circuits',
          claim: 'Researchers have found internal structures inside language models that can be understood to some degree. But no complete explanation exists yet for how these models produce their outputs.',
          basis: 'Interpretability research, including Anthropic\'s Transformer Circuits work, has found identifiable features and circuits inside models. The researchers themselves say this explanation is only partial. This is rated medium confidence because this is a fast-moving area, and much of the research is published by labs that also have a commercial interest in the outcome.' },
        { type: 'check', questions: [
          { id: 'q0805', kind: 'mcq', difficulty: 'hard', objective: 'Evaluate AI claims',
            stem: 'Which statement about large language models is best supported by current evidence?',
            options: [
              'They have learned internal representations that support a lot of useful behaviour, and these representations are only partly understood',
              'They understand language in the way a human does',
              'They are simple lookup tables that retrieve memorised text',
              'They reason symbolically over an internal knowledge base'
            ], answer: [0],
            rationale: 'This is the view that fits both the successes and the failures, and it matches what interpretability researchers actually say about their own findings. The other three options all claim too much, in one direction or the other.',
            distractors: {
              1: 'This cannot currently be measured, and it is contradicted by failures that no person who truly understood would show.',
              2: 'These models work correctly on inputs they have never seen before. A simple lookup table could not do that.',
              3: 'There is no symbolic knowledge base inside the model. Its representations are learned, and spread across the network, not stored as separate facts.'
            } }
        ] },
        { type: 'reflect', minWords: 30,
          prompt: 'Think of one task you would trust a language model with, and one you would not. What is the real difference between them? Is it how difficult the task is, or whether you are able to check the answer?',
          hint: 'For most people, the honest answer is checkability, not difficulty. That is a more useful way to draw the line than "hard versus easy".'
        }
      ]
    }
  ],
  extension: {
    title: 'Build one',
    body: 'Andrej Karpathy builds a small GPT model from an empty file, in about two hours, explaining every line as he goes. You will need to know some Python, and have some patience. Nothing else in this course depends on watching this. But if you want to stop taking any of this on trust, and see it built with your own eyes, this is the way to do it.',
    resourceIds: ['r-attention-paper', 'r-illustrated-transformer']
  }
}
