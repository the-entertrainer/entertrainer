import type { Module } from './types'

export const M06: Module = {
  id: 'm06', n: '06', accent: 'var(--blue)',
  title: 'Neural networks',
  intro: 'The idea that now leads the whole field was invented in 1958. People gave up on it in 1969. It came back in 1986. Then it was mostly ignored again until 2012. In this module, you will learn what a neural network actually is, how it learns, and why such a good idea took fifty years to start working.',
  objectives: [
    'Describe the perceptron and the wave of hype it caused.',
    'Explain what a neural network is, using the words weights, layers and activation.',
    'Explain, in simple terms, how backpropagation trains a network.',
    'Give three reasons this approach failed for decades, then suddenly worked.'
  ],
  lessons: [
    {
      id: 'm06l1', title: 'The perceptron, and 1958', minutes: 8, completion: 'read',
      summary: 'The first learning machine, and the press coverage that set a pattern.',
      blocks: [
        { type: 'text', lead: true, body: [
          'In 1958, Frank Rosenblatt built a machine called the perceptron. He was a psychologist at Cornell University. The machine changed its own internal settings based on feedback, until it could sort things into two groups. It was built from real hardware. Small motors turned dials called potentiometers to store its settings. You could actually watch it learn, in front of you.',
          'This was a real breakthrough. It was the first machine that got better at a task by being shown examples, instead of being reprogrammed by a person. That is the whole idea covered in module 5 — and it happened back in 1958.',
          'It also led to one of the biggest cases of over-claiming in the history of the field. News reports at the time said this machine would soon walk, talk, see, write, make copies of itself, and even become conscious. In reality, the device could only learn to separate two groups when a straight line could divide them. This is called "linearly separable".'
        ] },
        { type: 'video', videoId: 'v-first-nns' },
        { type: 'text', body: [
          'In 1969, Marvin Minsky and Seymour Papert published a careful mathematical study. It showed that a single-layer perceptron could not learn certain simple tasks. The standard example is called "exclusive-or", and it cannot be solved with a straight line. Their maths was correct. What happened after that is debated by historians. The common story says this book cut funding and interest in neural networks for more than ten years. Some historians think this effect is exaggerated, and that other things mattered just as much. But everyone agrees on one thing: the field turned away from neural networks after this.',
          'Here is what almost everyone knows now, but almost no one knew then: adding more layers fixes the problem. A network with a hidden layer, sitting between the input and the output, can do things a single layer cannot. The idea itself was never the problem. The real problem was that nobody yet had a practical way to train a network with extra layers.'
        ] },
        { type: 'evidence', confidence: 'medium',
          claim: 'The 1969 book Perceptrons played a part in a long decline in funding and attention for neural network research.',
          basis: 'Nobody disputes the book\'s content or its maths. What is debated is exactly how much it affected funding. Some historians of the field think this is the standard story simply because it is a neat, simple one. That is why this claim is labelled medium confidence.' },
        { type: 'takeaway', body: 'A fair criticism of one version of an idea does not prove the whole idea is wrong. Minsky and Papert were right about single-layer perceptrons. But their work was wrongly treated as the final verdict on neural networks in general. Nobody spotted this difference for fifteen years.' }
      ]
    },
    {
      id: 'm06l2', title: 'What a neural network is', minutes: 10, completion: 'check',
      summary: 'Weights, layers and activation, explained plainly.',
      blocks: [
        { type: 'text', body: [
          'For a moment, forget the comparison to the human brain. That comparison is where the name "neural network" comes from, but it causes more confusion than it solves. These systems are not real models of brain cells. The comparison should not be taken seriously.',
          'A neural network is really just a function with a huge number of adjustable numbers inside it. You put numbers in at one end. Those numbers get multiplied, added together, and squeezed through a shaping step, again and again, as they pass through. Numbers come out at the other end. "Training" means adjusting all those numbers inside, until the network gives you the answers you want.'
        ] },
        { type: 'video', videoId: 'v-nn1' },
        { type: 'hotspot', diagram: 'neural-net', caption: 'The parts of a neural network, and what each one does',
          points: [
            { x: 15, y: 49.8, label: 'Input layer', body: 'This is where the data enters, as numbers. A picture becomes one number for each pixel. A word becomes a list of numbers. Everything has to be turned into numbers first. How you do this matters more than most beginners expect.' },
            { x: 32.5, y: 17.8, label: 'Weight', body: 'One number that says how strongly one unit affects the next one. Weights are the adjustable numbers inside the network. A large model can have billions of them. When you hear that "a model has 70 billion parameters", these weights are mostly what is being counted.' },
            { x: 50, y: 37.8, label: 'Activation function', body: 'A shaping step applied after the numbers are added together, shown here on one node. Without this step, adding more layers would be pointless. A chain of simple, straight-line steps adds up to just one straight-line step. This is the piece that makes having many layers actually useful.' },
            { x: 50, y: 93.3, label: 'Bias', body: 'A number that gets added no matter what the input is. It shifts how easily a unit switches on. It is a small idea, but a needed one.' },
            { x: 50, y: 62.2, label: 'Hidden layers', body: 'The word "deep" in deep learning simply means having several of these layers between the input and the output. Each layer builds on what the layer before it produced.' },
            { x: 85, y: 49.8, label: 'Output layer', body: 'This is the answer the network gives. It could be a category, a number, or a list of chances for what the next word might be.' }
          ] },
        { type: 'text', body: [
          'Here is what makes this approach so useful: the middle layers learn helpful in-between descriptions on their own. Nobody tells them what to look for. In a vision network trained only on labelled photos, the early layers reliably end up detecting edges. Later layers detect textures and parts. Layers after that detect whole objects. Nobody wrote code saying "look for edges first". This pattern appears on its own, because it is a useful way to break the problem down.',
          'This directly solves the knowledge bottleneck problem from module 3. Features that a human expert could never put into words are discovered by the network itself, just from examples. But this also directly causes the interpretability problem covered in module 10. Because the features are discovered rather than designed, nobody knows in advance exactly what they are.'
        ] },
        { type: 'check', questions: [
          { id: 'q0601', kind: 'mcq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
            stem: 'What does the activation function actually add?',
            options: [
              'A non-straight-line step, without which adding more layers would add no extra power',
              'It speeds up training',
              'It stores the network\'s memory',
              'It converts the output into words'
            ], answer: [0],
            rationale: 'A stack of straight-line steps just collapses into one straight-line step. The non-straight-line shaping step is what lets a deep network do things a shallow one cannot.',
            distractors: {
              1: 'Some choices do train faster than others, but that is a side effect, not the main purpose.',
              2: 'Weights hold what has been learned.',
              3: 'Turning output into words is called decoding, and it happens outside the network.'
            } },
          { id: 'q0602', kind: 'tf', difficulty: 'easy', objective: 'Distinguish AI approaches',
            stem: 'True or false: someone specifies in advance which features each layer of a network should detect.',
            options: ['True', 'False'], answer: [1],
            rationale: 'The features are learned, not designed by a person. This single fact explains both the power of the method and why it is hard to understand from the outside.' },
          { id: 'q0605', kind: 'fitb', difficulty: 'moderate', objective: 'Explain in outline how backpropagation trains a network',
            stem: 'Fill in the blank: there is an efficient method for working out how every single weight should change. It works backwards from the output, and it is called ___.',
            options: [], answer: [], blankAnswers: ['backpropagation'],
            rationale: 'Backpropagation. Without it, you would have to test every single weight one at a time. With it, working out every adjustment costs roughly the same as running the network forward just once — the next lesson explains this in full.' }
        ] }
      ]
    },
    {
      id: 'm06l3', title: 'How it learns', minutes: 12, completion: 'activity',
      summary: 'Backpropagation and gradient descent — try it, then watch it happen.',
      blocks: [
        { type: 'text', lead: true, body: [
          'Imagine a network with a billion adjustable numbers. Right now they are set randomly, so the network produces nonsense. How do you find settings that actually make sense? Not by trying every combination. There are more possible combinations than atoms in the universe.',
          'Instead, here is what actually happens. Show the network one example. Measure how wrong its answer is. Then nudge every single number a small step in the direction that makes the answer less wrong. Repeat this a few billion times. This process is called gradient descent. Before the video explains it properly, try the version below yourself.'
        ] },
        { type: 'descent' },
        { type: 'video', videoId: 'v-backprop' },
        { type: 'text', body: [
          'Backpropagation is the clever trick behind that "nudge every number" step. Working backwards from the output, it works out what every single weight should have done differently. It does this in roughly the same time it takes to run the network forward just once. Without backpropagation, training a billion weights one by one would be impossible.',
          'What you just watched happening on the hill is the whole idea, at any size. There is no reasoning involved, and no sense of "why". There is only a slope, sensed one small step at a time.'
        ] },
        { type: 'practice', title: 'Go further, using real controls',
          steps: [
            'Open TensorFlow Playground (linked below).',
            'Choose the spiral dataset — the hardest one, at the bottom left.',
            'Press play with the default settings. Watch it fail to separate the spirals.',
            'Add a hidden layer, then another. Add neurons. Press play again after each change.',
            'Now try the opposite. Give the network far more layers and neurons than it needs. Watch the dividing line turn into a tangled mess that fits the training dots perfectly. This is overfitting, from module 5, happening live in front of you.',
            'Write down the smallest network that solves the spiral cleanly.'
          ],
          output: 'A note of the smallest network design that worked, plus a sentence on what happened when you made it too big.' },
        { type: 'resource', resourceIds: ['r-perceptron-play'] }
      ]
    },
    {
      id: 'm06l4', title: 'Why it took fifty years', minutes: 7, completion: 'check',
      summary: 'Three things had to arrive, and only one of them was an idea.',
      blocks: [
        { type: 'text', body: [
          'Backpropagation was described in a usable form in 1986, or maybe even earlier, depending on who you credit. The maths existed. But the approach did not take over the field until 2012. Understanding why is the best way to protect yourself from assuming that progress in this field is mainly driven by ideas.'
        ] },
        { type: 'compare', caption: 'What was missing, and when it finally arrived',
          columns: ['Ingredient', 'The problem in 1986', 'What changed'],
          rows: [
            ['Data', 'Datasets only had thousands of examples. Networks need millions, and they overfit badly with fewer than that.', 'The internet arrived, then ImageNet: 14 million hand-labelled images, put together starting in 2007.'],
            ['Compute', 'Training a useful network would have taken months on the hardware available at the time.', 'GPUs arrived. They were built for rendering video games, but they happen to do exactly the kind of maths that training needs, thousands of calculations at once.'],
            ['Technique', 'Deep networks trained badly. The training signal faded away as it moved backwards, and training became unstable.', 'A collection of unglamorous fixes arrived through the 2000s: better activation functions, better ways to set starting values, and better ways to keep training stable.'],
            ['Belief', 'Most of the field had moved on. Papers about neural networks were hard to get published.', 'A small number of research groups kept working on it anyway. They were proven right in 2012.']
          ] },
        { type: 'evidence', confidence: 'high', sourceId: 's-alexnet',
          claim: 'In 2012, a result on the ImageNet competition combined deep convolutional networks, GPU training, and a large labelled dataset. It beat every previous approach by a wide margin.',
          basis: 'The original source is the AlexNet paper, published at the NeurIPS conference in 2012. It documents the network design, the GPU implementation, and the competition results.' },
        { type: 'quote',
          text: 'Nothing in the 2012 result required an idea from after 1990. What it required was a hundred times the data and a thousand times the arithmetic.',
          attribution: 'A summary of the standard account of the deep learning revival',
          source: 'This is a description, not an exact quotation. The point is well supported by the AlexNet paper\'s own description of what it contributed.' },
        { type: 'check', questions: [
          { id: 'q0603', kind: 'mrq', difficulty: 'moderate', objective: 'Explain major stages',
            stem: 'Which factors explain why neural networks succeeded in 2012 rather than 1986? Select all that apply.',
            options: [
              'Much larger labelled datasets became available',
              'GPUs made the required arithmetic affordable',
              'A completely new learning algorithm was discovered',
              'A build-up of small engineering improvements made deep networks trainable'
            ], answer: [0, 1, 3],
            rationale: 'Data, hardware, and a decade of practical fixes. The core algorithm, gradient descent with backpropagation, was basically the same one that was available in the 1980s.',
            distractors: { 2: 'This is the tempting answer, and it is wrong. The fact that there was no new core algorithm is exactly what makes this story worth learning from.' } },
          { id: 'q0604', kind: 'mcq', difficulty: 'hard', objective: 'Evaluate AI claims',
            stem: 'What does the 1986-to-2012 gap suggest about forecasting AI progress?',
            options: [
              'Progress can be blocked by a lack of resources rather than a lack of ideas, so timelines depend on inputs as much as on insight',
              'Progress is always slower than predicted',
              'Progress is always faster than predicted',
              'Old ideas are usually wrong'
            ], answer: [0],
            rationale: 'The idea was ready twenty-five years before the actual capability arrived. Forecasts that only track research ideas completely miss the resource side of the story — and forecasts that only track resources miss the periods where progress stalls.',
            distractors: {
              1: 'Sometimes true. The 2012 to 2020 period moved much faster than most people expected.',
              2: 'Also sometimes true. The 1970s and 1980s moved far slower than expected.',
              3: 'This is the opposite lesson: a dormant idea turned out to be correct all along.'
            } }
        ] }
      ]
    }
  ],
  extension: {
    title: 'The full visual series',
    body: '3Blue1Brown\'s deep learning video chapters are the best free explanation of this material that exists. Chapter 2 covers gradient descent. Chapter 4 gives the maths behind backpropagation, if you want the actual mechanism rather than just a comparison.',
    resourceIds: ['r-perceptron-play', 'r-ml-glossary']
  }
}
