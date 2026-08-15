import type { Module } from './types'

export const M07: Module = {
  id: 'm07', n: '07', accent: 'var(--yellow)',
  title: 'The deep learning decade',
  intro: 'Between 2012 and 2020, machines went from unreliable at recognising a cat to superhuman at tasks people had used as the definition of intelligence. This module covers what actually happened in that decade, the moment a machine made a move no human would have made, and the finding that reorganised the entire industry.',
  objectives: [
    'Explain what changed in 2012 and why it counts as a turning point.',
    'Describe the succession of domains that fell: vision, speech, translation, games.',
    'Explain what Move 37 demonstrated and what it did not.',
    'State what scaling laws claim, and what remains uncertain about them.'
  ],
  lessons: [
    {
      id: 'm07l1', title: '2012, and what it actually proved', minutes: 8, completion: 'check',
      summary: 'The ImageNet result, and the correct reading of it.',
      blocks: [
        { type: 'text', lead: true, body: [
          'ImageNet was an annual competition: classify photographs into a thousand categories. Progress had been incremental for years, with error rates in the mid-twenties per cent and each new entry improving on the last by a fraction of a point.',
          'In 2012 an entry from Geoffrey Hinton\'s group at Toronto — a deep convolutional network trained on GPUs, since known as AlexNet — did not improve on the state of the art by a fraction of a point. It cut the error rate by roughly a third in one step.',
          'Within about two years, essentially every serious entrant was using deep neural networks. Computer vision, as a research field, changed method almost completely inside a single competition cycle. It is one of the fastest paradigm shifts in the history of any engineering discipline, and it is the event the current era dates from.'
        ] },
        { type: 'video', videoId: 'v-imagenet' },
        { type: 'text', body: [
          'What that result proved is narrower than what it is usually taken to prove, and getting this right matters for reading current claims.',
          'It proved that a known family of methods, given enough labelled data and enough arithmetic, could exceed hand-engineered approaches on a well-defined perception task. It did not prove that the machine saw, understood, or knew what a dog is. Later work showed the same networks could be fooled by imperceptible pixel changes into confidently misclassifying an image — which tells you the internal representation, while genuinely useful, is not the one a person has.',
          'Both things are true at once. The capability is real and commercially transformative. The inference from "beats humans on this benchmark" to "perceives like a human" is unsupported. Holding both is the intellectual skill this course is trying to build.'
        ] },
        { type: 'check', questions: [
          { id: 'q0701', kind: 'mcq', difficulty: 'moderate', objective: 'Explain major stages',
            stem: 'What made the 2012 ImageNet result a turning point?',
            options: [
              'A large, sudden improvement that caused the field to switch method within about two years',
              'It was the first time a computer classified an image',
              'It proved neural networks perceive images as humans do',
              'It was the first use of GPUs in computing'
            ], answer: [0],
            rationale: 'The size and suddenness of the jump is what did it. Incremental gains do not cause a field to abandon its methods; a one-third error reduction in a single year does.',
            distractors: {
              1: 'Image classification was decades old; the question was always how well.',
              2: 'Adversarial examples later showed the representations differ substantially from human perception.',
              3: 'GPUs were widely used for graphics and increasingly for scientific computing before 2012.'
            } }
        ] }
      ]
    },
    {
      id: 'm07l2', title: 'The dominoes', minutes: 10, completion: 'read',
      summary: 'Vision, speech, translation — the same method, one domain after another.',
      blocks: [
        { type: 'text', body: [
          'What followed 2012 has a striking uniformity to it. Field after field discovered that a decade of carefully hand-engineered features could be beaten by a large network trained on enough examples. In speech recognition, in machine translation, in recommendation, in medical imaging, the story repeats with the nouns changed.',
          'Machine translation is the cleanest example, because it had been the field\'s longest-running embarrassment — the 1966 report that helped cause the first winter was about exactly this. Statistical methods improved it through the 2000s. Neural methods from around 2014 improved it again, sharply, and by 2016 major services had switched. The problem that helped kill AI funding in 1966 was, fifty years later, a solved-enough product feature.'
        ] },
        { type: 'timeline', items: [
          { year: '2012', label: 'Vision', body: 'AlexNet wins ImageNet. Deep convolutional networks take over computer vision within two years.' },
          { year: '2012–2015', label: 'Speech', body: 'Deep networks cut word error rates substantially across the major speech recognition systems. Voice assistants become viable products rather than demos.' },
          { year: '2014–2016', label: 'Translation', body: 'Neural machine translation displaces phrase-based statistical methods; major services switch.' },
          { year: '2015–2017', label: 'Games', body: 'Systems learn Atari games from pixels alone; AlphaGo beats a world champion at Go; AlphaZero learns chess, shogi and Go from self-play with no human games at all.' },
          { year: '2017', label: 'Transformers', body: 'The architecture appears, initially for translation. Everything in module 8 follows from it.' },
          { year: '2020–2022', label: 'Generation', body: 'Large language models and diffusion image models move from research to consumer products, and the public conversation changes completely.' }
        ] },
        { type: 'match', prompt: 'Pair each field with what actually changed in it — not just "it got better".', pairs: [
          { left: 'Vision', right: 'Deep convolutional networks took over the field within about two years of AlexNet', why: 'The ImageNet result from the previous lesson, spreading.' },
          { left: 'Speech', right: 'Word error rates fell sharply; voice assistants went from demo to viable product', why: 'The same recipe — big network, big data, big compute — one domain over.' },
          { left: 'Translation', right: 'Neural methods displaced statistical ones; major services had switched by 2016', why: 'The domino that mattered most: the exact problem that helped cause the first winter in 1966.' },
          { left: 'Games', right: 'Systems learned Atari from raw pixels, then a self-play system beat a world Go champion', why: 'Module 7\'s next lesson, Move 37, is entirely about this one.' }
        ] },
        { type: 'takeaway', body: 'The decade\'s lesson is not that any single system was clever. It is that one recipe — big network, big data, big compute — kept working in domain after domain, including several where domain experts were confident it would not.' }
      ]
    },
    {
      id: 'm07l3', title: 'Move 37', minutes: 9, completion: 'activity',
      summary: 'The clearest example of a machine doing something its builders could not have specified.',
      blocks: [
        { type: 'text', body: [
          'Go had been the standing counterexample. Chess fell in 1997, but Go has a vastly larger branching factor and no good way to evaluate a position numerically, and expert opinion through the 2000s held that a machine champion was decades away.',
          'In March 2016, AlphaGo played Lee Sedol, one of the strongest players of his generation, over five games. It won four.',
          'The moment people still talk about is the thirty-seventh move of game two. AlphaGo played on the fifth line in a way that violated centuries of accumulated opening theory. Commentators assumed a malfunction. Lee Sedol left the room. The move turned out to be excellent, and its influence decided the game roughly fifty moves later.'
        ] },
        { type: 'video', videoId: 'v-alphago' },
        { type: 'text', body: [
          'It is worth being precise about what this does and does not show, because it is one of the most over-read events in the field.',
          'What it shows: a system trained partly by playing against itself can find strategies outside the human corpus, and those strategies can be correct. The knowledge was not put in by its designers — they could not have put it in, because they did not have it. That is a genuine and important thing to have demonstrated.',
          'What it does not show: general intelligence, understanding, or creativity in the sense a person means it. AlphaGo could not play chess, explain its move, or do anything at all outside a 19-by-19 board. Its successor AlphaZero generalised across several board games from self-play alone, which is a meaningful extension, and still lives entirely inside the class of perfect-information games with clear rules and an unambiguous win condition — the friendliest possible environment for this method, and one almost nothing in real life resembles.'
        ] },
        { type: 'scenario',
          setup: 'A colleague says: "AlphaGo invented a move no human had thought of in 2,500 years. That proves AI is already creative."',
          question: 'What is the most accurate response?',
          choices: [
            { text: '"It found a strategy outside the human corpus in a game with fixed rules and a clear win condition. Whether that generalises to open problems is exactly what is unproven."', verdict: 'best',
              feedback: 'Precise on both halves. It grants the real result — search plus self-play genuinely found something people had not — and identifies the load-bearing assumption in the extrapolation, which is that open-ended domains behave like Go.' },
            { text: '"It was just search. There is nothing creative about brute force."', verdict: 'poor',
              feedback: 'Under-reads it. AlphaGo was not brute force — the search space is far too large — and the strategy really was outside the human corpus. Dismissing the result is as much an error as over-reading it.' },
            { text: '"Yes, and it will be doing that in science within a few years."', verdict: 'poor',
              feedback: 'This is stage 2 of the cycle from module 4: extrapolating from a bounded domain to an unbounded one. It might happen. It is not evidenced by this.' },
            { text: '"Only because it played millions of games against itself, which people cannot do."', verdict: 'workable',
              feedback: 'True and relevant — the self-play requirement is exactly why this transfers poorly to domains where you cannot simulate. But it slightly concedes the "creativity" framing rather than examining it.' }
          ] },
        { type: 'reflect', minWords: 30,
          prompt: 'Go has fixed rules, complete information, and an unambiguous winner. Name one problem in your own work with none of those three properties. What would "self-play" even mean there?',
          hint: 'If you cannot say what winning looks like, you cannot generate the reward signal this method depends on. That is not a temporary engineering gap.' }
      ]
    },
    {
      id: 'm07l4', title: 'Scaling laws', minutes: 8, completion: 'check',
      summary: 'The empirical finding that reorganised an industry — and its open questions.',
      blocks: [
        { type: 'text', body: [
          'Around 2020, researchers published a finding that changed how the field allocates money. Across a wide range of model sizes, dataset sizes and compute budgets, performance improved in a smooth, predictable way as those inputs increased. Not step changes; a regular curve you could extrapolate.',
          'The practical consequence was enormous. If capability is a predictable function of scale, then improving a model becomes an engineering and capital problem rather than a research one. You do not need a new idea. You need more chips, more data, and the money for both. Almost every large investment in AI since is downstream of this observation.'
        ] },
        { type: 'evidence', confidence: 'high',
          claim: 'Model performance has been observed to improve smoothly and predictably with increases in model size, data and compute across several orders of magnitude.',
          basis: 'Multiple independent research groups have published consistent scaling-law results, and the finding is reflected in published training-compute trends. This is one of the better-evidenced empirical claims in modern machine learning.', sourceId: 's-ai-index' },
        { type: 'evidence', confidence: 'low',
          claim: 'Continued scaling will keep producing comparable capability gains.',
          basis: 'Genuinely uncertain and actively disputed. Scaling laws are empirical curves fitted over a historical range; they carry no guarantee outside it. Data availability, energy, cost and diminishing returns are all live constraints, and informed researchers disagree publicly about how close the limits are. Treat any confident claim in either direction — "it will keep scaling" or "it has hit a wall" — as a position, not a finding.' },
        { type: 'text', body: [
          'Two more things about scaling that are worth carrying out of this module.',
          'First, some capabilities appear to arrive abruptly as scale increases — a model cannot do a task at all, and then at some size it can. Whether these are genuine phase changes or artefacts of how the tasks are scored is an open research question, and the answer matters a great deal for forecasting. Be careful with anyone who is certain.',
          'Second, scaling is not free of consequence. Training runs at the frontier consume very large amounts of energy and capital, which concentrates the ability to build such systems in a small number of organisations. That concentration is a political fact as much as a technical one, and module 10 comes back to it.'
        ] },
        { type: 'check', questions: [
          { id: 'q0702', kind: 'mcq', difficulty: 'moderate', objective: 'Evaluate AI claims',
            stem: 'What is the correct status of "scaling will continue to deliver comparable gains"?',
            options: [
              'A contested extrapolation from an empirical curve, not an established law',
              'A proven law of machine learning',
              'A claim already disproved',
              'A marketing invention with no evidence behind it'
            ], answer: [0],
            rationale: 'The observed relationship is well evidenced within the range measured. Its continuation beyond that range is an extrapolation, and competent researchers disagree about it in public. Both the confident optimists and the confident sceptics are overstating what is known.',
            distractors: {
              1: 'Empirical regularities are not laws; they hold over the range in which they were observed.',
              2: 'It has not been disproved either — that is the point of the disagreement.',
              3: 'The underlying research is real and independently replicated.'
            } },
          { id: 'q0703', kind: 'tf', difficulty: 'moderate', objective: 'Explain major stages',
            stem: 'True or false: scaling laws suggested that improving models could be pursued through more compute and data rather than requiring new algorithmic ideas.',
            options: ['True', 'False'], answer: [0],
            rationale: 'That inference is precisely why the finding was so consequential commercially — it turned a research problem into a capital-allocation problem, and the industry restructured around it.' }
        ] },
        { type: 'practice', title: 'Claim log, entry three',
          steps: [
            'Reopen your claim log.',
            'Find a current claim about AI capability improving — a roadmap, a forecast, an announcement of what next year\'s model will do.',
            'Identify which part rests on a measured result and which part rests on the scaling extrapolation.',
            'Write down what evidence, if it appeared in the next twelve months, would change your mind in each direction.',
            'That last step is the one people skip. Do it anyway.'
          ],
          output: 'A third log entry with a falsifiable expectation attached. You will use all three entries in the capstone.' }
      ]
    }
  ],
  extension: {
    title: 'The measured version',
    body: 'Stanford HAI\'s AI Index is the place to check any quantitative claim in this module — training compute, benchmark trends, cost curves and adoption, with methodology stated. It is long; the report summary is enough.',
    resourceIds: ['r-ai-index', 'r-alexnet']
  }
}
