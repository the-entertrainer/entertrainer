import type { Module } from './types'

export const M06: Module = {
  id: 'm06', n: '06', accent: 'var(--blue)',
  title: 'Neural networks',
  intro: 'The idea that now dominates the field was invented in 1958, dismissed in 1969, revived in 1986, and ignored again until 2012. This module is the one where the machinery gets explained: what a neural network is, how it learns, and why an idea that good took fifty years to work.',
  objectives: [
    'Describe the perceptron and the first hype cycle it produced.',
    'Explain what a neural network is in terms of weights, layers and activation.',
    'Explain in outline how backpropagation trains a network.',
    'Give three reasons the approach failed for decades and then suddenly worked.'
  ],
  lessons: [
    {
      id: 'm06l1', title: 'The perceptron, and 1958', minutes: 8, completion: 'read',
      summary: 'The first learning machine, and the press release that set the pattern.',
      blocks: [
        { type: 'text', lead: true, body: [
          'In 1958 Frank Rosenblatt, a psychologist at Cornell, built the perceptron: a machine that adjusted its own connection strengths in response to feedback until it could sort inputs into two categories. It was implemented in hardware, with motor-driven potentiometers physically turning to store the weights. You could watch it learn.',
          'This was a genuinely important result. It was the first machine that improved at a task by being shown examples rather than by being reprogrammed — the whole of module 5, in 1958.',
          'It was also the occasion of one of the most consequential pieces of over-claiming in the history of the field. Contemporary press coverage described a machine that would soon walk, talk, see, write, reproduce itself and be conscious of its existence. The actual device could learn to separate categories that were linearly separable — that is, could be divided by a straight line.'
        ] },
        { type: 'video', videoId: 'v-first-nns' },
        { type: 'text', body: [
          'In 1969 Marvin Minsky and Seymour Papert published a careful mathematical analysis showing that a single-layer perceptron could not learn certain simple functions — the standard example being exclusive-or, which is not linearly separable. The analysis was correct. What happened next is the historically contested part: the standard account holds that this book substantially cooled funding and interest in neural networks for over a decade. Several historians argue the effect has been overstated and that other factors mattered as much. Both readings agree that the field turned away.',
          'What everybody now knows, and almost nobody knew then: stacking layers fixes it. A network with a hidden layer between input and output can represent functions a single layer cannot. The obstacle was never the idea. It was that nobody had a practical way to train the deeper version.'
        ] },
        { type: 'evidence', confidence: 'medium',
          claim: 'The 1969 book Perceptrons contributed to a long decline in neural network research funding and attention.',
          basis: 'The book\'s content and its mathematical results are not in dispute. The size of its causal effect on funding is contested among historians of the field — some argue it is the standard story precisely because it is a tidy one. Labelled medium for that reason.' },
        { type: 'takeaway', body: 'A correct criticism of the current version of an idea is not a refutation of the idea. Minsky and Papert were right about one-layer perceptrons and wrong as a verdict on connectionism — and the difference was invisible for fifteen years.' }
      ]
    },
    {
      id: 'm06l2', title: 'What a neural network is', minutes: 10, completion: 'check',
      summary: 'Weights, layers and activations, without the mysticism.',
      blocks: [
        { type: 'text', body: [
          'Ignore the brain metaphor for a moment. It is where the name came from and it does more harm than good — these systems are not models of biological neurons in any serious sense.',
          'A neural network is a function with a very large number of adjustable numbers in it. You feed numbers in at one end, they get multiplied and added and squashed on the way through, and numbers come out the other end. "Training" means adjusting the adjustable numbers until the outputs are the ones you wanted.'
        ] },
        { type: 'video', videoId: 'v-nn1' },
        { type: 'hotspot', diagram: 'neural-net', caption: 'The parts, and what each one does',
          points: [
            { x: 15, y: 49.8, label: 'Input layer', body: 'The data as numbers. An image becomes one number per pixel; a word becomes a list of numbers. Everything must become numbers, and how you choose to do that matters more than beginners expect.' },
            { x: 32.5, y: 17.8, label: 'Weight', body: 'One number saying how strongly one unit influences the next. These are the adjustable numbers, and there are billions of them in a large model. When you hear "a model has 70 billion parameters", these are mostly what is being counted.' },
            { x: 50, y: 37.8, label: 'Activation function', body: 'A squashing step applied after the weighted sum, marked here on one node. Without it, stacking layers would be pointless: a chain of linear operations is just one linear operation. This is the piece that makes depth mean anything.' },
            { x: 50, y: 93.3, label: 'Bias', body: 'A number added regardless of the input — it shifts how easily a unit activates. Small idea, necessary one.' },
            { x: 50, y: 62.2, label: 'Hidden layers', body: '"Deep" learning simply means having several of these between input and output. Each layer builds on the representation the last one produced.' },
            { x: 85, y: 49.8, label: 'Output layer', body: 'The answer: a class, a number, a probability distribution over possible next words.' }
          ] },
        { type: 'text', body: [
          'The property that makes this worth doing is that the intermediate layers learn useful intermediate descriptions without anyone specifying them. In a vision network trained only on labelled photographs, early layers reliably end up detecting edges, later ones textures and parts, later still whole objects. Nobody wrote "look for edges first". It emerges because it is a useful way to organise the problem.',
          'This is the direct answer to the knowledge bottleneck of module 3. The features that a human expert could never articulate are discovered by the network, from examples. And it is also the direct cause of the interpretability problem in module 10: the features are discovered, so nobody knows in advance what they are.'
        ] },
        { type: 'check', questions: [
          { id: 'q0601', kind: 'mcq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
            stem: 'What does the activation function contribute?',
            options: [
              'Non-linearity, without which stacking layers would add no expressive power',
              'It speeds up training',
              'It stores the network\'s memory',
              'It converts the output into words'
            ], answer: [0],
            rationale: 'A stack of linear operations collapses into a single linear operation. The non-linear squashing step is what makes a deep network able to represent things a shallow one cannot.',
            distractors: {
              1: 'Some choices train faster than others, but that is a side effect, not the purpose.',
              2: 'Weights hold what has been learned.',
              3: 'That is decoding, and it happens outside the network.'
            } },
          { id: 'q0602', kind: 'tf', difficulty: 'easy', objective: 'Distinguish AI approaches',
            stem: 'True or false: someone specifies in advance which features each layer of a network should detect.',
            options: ['True', 'False'], answer: [1],
            rationale: 'The features are learned, not designed. That is the source of the method\'s power and of its opacity — the same fact explains both.' },
          { id: 'q0605', kind: 'fitb', difficulty: 'moderate', objective: 'Explain in outline how backpropagation trains a network',
            stem: 'Fill in the blank: the efficient method for working out how every individual weight should change, computed backwards from the output, is called ___.',
            options: [], answer: [], blankAnswers: ['backpropagation'],
            rationale: 'Backpropagation. Without it you would have to test every weight separately; with it, the cost of computing every adjustment is roughly the same as running the network forwards once — the next lesson is entirely about this.' }
        ] }
      ]
    },
    {
      id: 'm06l3', title: 'How it learns', minutes: 12, completion: 'activity',
      summary: 'Backpropagation and gradient descent — try it, then watch it happen.',
      blocks: [
        { type: 'text', lead: true, body: [
          'You have a network with a billion adjustable numbers, currently set at random, producing nonsense. How do you find the settings that produce sense? Not by trying combinations — there are more of those than atoms in the universe.',
          'Instead: show it one example, measure how wrong the answer is, then nudge every number a small step in the direction that makes it less wrong. Repeat a few billion times. That is gradient descent — and before the video explains it properly, try the version below with your own eyes.'
        ] },
        { type: 'descent' },
        { type: 'video', videoId: 'v-backprop' },
        { type: 'text', body: [
          'Backpropagation is the efficient trick behind that "nudge every number" step: working backwards from the output, it computes what every single weight should have done differently, in roughly the time it takes to run the network forwards once. Without it, training a billion weights one at a time would be impossible.',
          'What you just watched on the hill is the whole of it, at any scale. No reasoning, no representation of "why" — only a slope, felt locally, one step at a time.'
        ] },
        { type: 'practice', title: 'Go further, with real controls',
          steps: [
            'Open TensorFlow Playground (linked below).',
            'Choose the spiral dataset — the hardest one, at the bottom left.',
            'Press play with the default settings. Watch it fail to separate the spirals.',
            'Add a hidden layer, then another. Add neurons. Press play again after each change.',
            'Now do the opposite: give it far more layers and neurons than it needs, and watch the boundary become a knotted mess that fits the training dots perfectly. That is overfitting from module 5, live.',
            'Note the smallest network that solves the spiral cleanly.'
          ],
          output: 'A note of the smallest architecture that worked, and a sentence on what happened when you overbuilt it.' },
        { type: 'resource', resourceIds: ['r-perceptron-play'] }
      ]
    },
    {
      id: 'm06l4', title: 'Why it took fifty years', minutes: 7, completion: 'check',
      summary: 'Three things had to arrive, and only one of them was an idea.',
      blocks: [
        { type: 'text', body: [
          'Backpropagation was described in usable form in 1986 — arguably earlier, depending on who you credit. The mathematics was available. And yet the approach did not take over until 2012. Understanding why is the best inoculation against the assumption that progress in this field is driven mainly by ideas.'
        ] },
        { type: 'compare', caption: 'What was missing, and when it arrived',
          columns: ['Ingredient', 'The problem in 1986', 'What changed'],
          rows: [
            ['Data', 'Datasets held thousands of examples. Networks need millions and overfit badly on less.', 'The internet, and then ImageNet: 14 million hand-labelled images, assembled from 2007.'],
            ['Compute', 'Training a useful network would have taken months on the hardware available.', 'GPUs. Built for rendering games, they happen to do exactly the matrix arithmetic training needs, thousands of operations at a time.'],
            ['Technique', 'Deep networks trained badly — gradients vanished, training destabilised.', 'A pile of unglamorous fixes through the 2000s: better activation functions, better initialisation, regularisation, normalisation.'],
            ['Belief', 'The field had moved on. Neural network papers were hard to publish.', 'A small number of groups kept working anyway, and were vindicated in 2012.']
          ] },
        { type: 'evidence', confidence: 'high', sourceId: 's-alexnet',
          claim: 'The 2012 ImageNet result combined deep convolutional networks with GPU training and a large labelled dataset, and won by a wide margin over previous approaches.',
          basis: 'Primary source: the AlexNet paper published at NeurIPS 2012, which documents the architecture, the GPU implementation and the competition results.' },
        { type: 'quote',
          text: 'Nothing in the 2012 result required an idea from after 1990. What it required was a hundred times the data and a thousand times the arithmetic.',
          attribution: 'A summary of the standard account of the deep learning revival',
          source: 'A characterisation rather than a quotation — the point is well supported by the AlexNet paper\'s own description of its contributions.' },
        { type: 'check', questions: [
          { id: 'q0603', kind: 'mrq', difficulty: 'moderate', objective: 'Explain major stages',
            stem: 'Which factors explain why neural networks succeeded in 2012 rather than 1986? Select all that apply.',
            options: [
              'Vastly larger labelled datasets became available',
              'GPUs made the required arithmetic affordable',
              'A fundamentally new learning algorithm was discovered',
              'Accumulated engineering improvements made deep networks trainable'
            ], answer: [0, 1, 3],
            rationale: 'Data, hardware and a decade of practical fixes. The core algorithm — gradient descent with backpropagation — was substantially the same one available in the eighties.',
            distractors: { 2: 'This is the tempting answer and it is wrong. The absence of a new core algorithm is what makes the story instructive.' } },
          { id: 'q0604', kind: 'mcq', difficulty: 'hard', objective: 'Evaluate AI claims',
            stem: 'What does the 1986-to-2012 gap suggest about forecasting AI progress?',
            options: [
              'Capability can be blocked by resources rather than ideas, so timelines depend on inputs as much as insight',
              'Progress is always slower than predicted',
              'Progress is always faster than predicted',
              'Old ideas are usually wrong'
            ], answer: [0],
            rationale: 'The idea was ready twenty-five years before the capability. Forecasts that track only research ideas miss the resource curve entirely — and forecasts that track only the resource curve miss the plateaus.',
            distractors: {
              1: 'Sometimes. The 2012–2020 period ran considerably faster than most expectations.',
              2: 'Also sometimes. The 1970s and 1980s ran far slower.',
              3: 'The opposite lesson: a dormant idea was correct all along.'
            } }
        ] }
      ]
    }
  ],
  extension: {
    title: 'The full visual series',
    body: '3Blue1Brown\'s deep learning chapters are the best free explanation of this material that exists. Chapter 2 covers gradient descent and chapter 4 gives the calculus behind backpropagation if you want the mechanism rather than the metaphor.',
    resourceIds: ['r-perceptron-play', 'r-ml-glossary']
  }
}
