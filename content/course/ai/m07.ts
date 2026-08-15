import type { Module } from './types'

export const M07: Module = {
  id: 'm07', n: '07', accent: 'var(--blue)',
  title: 'The deep learning decade',
  intro: 'Between 2012 and 2020, machines changed fast. At the start, a machine often could not tell a photo of a cat from a photo of something else. By the end, machines beat humans at tasks people once used to define intelligence itself. This module explains what really happened in that decade. You will read about a move in a board game that no human would ever have played, and about a finding that changed how the whole AI industry spends its money.',
  objectives: [
    'Explain what changed in 2012, and why people call it a turning point.',
    'List the areas where machines overtook older methods, one after another: vision, speech, translation, and games.',
    'Explain what "Move 37" showed us, and what it did not show.',
    'State what "scaling laws" claim, and explain what is still unsure about them.'
  ],
  lessons: [
    {
      id: 'm07l1', title: '2012, and what it actually proved', minutes: 8, completion: 'check',
      summary: 'The ImageNet result, and how to understand it correctly.',
      blocks: [
        { type: 'text', lead: true, body: [
          'ImageNet was a yearly competition. The task was simple: look at a photo and sort it into one of a thousand categories. For years, progress was slow. Error rates stayed around the mid-twenties percent, and each new entry only improved a little on the one before it.',
          'In 2012, a team led by Geoffrey Hinton at the University of Toronto entered the competition. Their entry was a deep convolutional network trained using GPUs — graphics chips built for fast, parallel maths. It later became known as AlexNet. AlexNet did not improve on the best result by a small amount. It cut the error rate by about a third, in a single step.',
          'Within about two years, almost every serious competitor was using deep neural networks. Computer vision, as a research field, changed its main method almost completely, in about the time it takes to run one competition. Few fields in engineering have ever changed method this fast. This is the event that the current era of AI is usually dated from.'
        ] },
        { type: 'video', videoId: 'v-imagenet' },
        { type: 'text', body: [
          'What this result actually proved is narrower than what people usually say it proved. Getting this right matters, because it helps you read today\'s AI claims correctly.',
          'It proved that a known family of methods — neural networks — could beat hand-built methods on a clearly defined task, if given enough labelled examples and enough computing power. It did not prove that the machine actually saw, or understood, or knew what a dog is. Later research showed that the same kind of network could be fooled. Changing a few pixels in a photo, in a way a person would not even notice, could make the network confidently name the wrong object. This tells us that the network\'s internal picture of the world, while genuinely useful, is not the same as a person\'s.',
          'Both things are true at the same time. The ability is real, and it has changed entire industries. But the jump from "it beats humans on this test" to "it sees the way a human sees" is not supported by evidence. Holding both ideas at once — the result is real, and the bigger claim is not proven — is exactly the skill this course wants you to build.'
        ] },
        { type: 'check', questions: [
          { id: 'q0701', kind: 'mcq', difficulty: 'moderate', objective: 'Explain major stages',
            stem: 'What made the 2012 ImageNet result such an important turning point?',
            options: [
              'A big, sudden improvement that made the whole field switch to a new method within about two years',
              'It was the first time a computer had ever sorted a photo into a category',
              'It proved that neural networks see images the same way people do',
              'It was the first time GPUs were used in computing'
            ], answer: [0],
            rationale: 'The size and suddenness of the jump made the difference. Small, steady gains do not make a whole field drop its old methods. A one-third drop in errors, in a single year, does.',
            distractors: {
              1: 'Sorting images by computer was already decades old by 2012. The real question was always how well it could be done, not whether it could be done at all.',
              2: 'Later tests showed that these networks can be tricked in ways a human never would be. This shows their internal picture of an image is quite different from human perception.',
              3: 'GPUs were already widely used for graphics, and increasingly for scientific computing, well before 2012.'
            } }
        ] }
      ]
    },
    {
      id: 'm07l2', title: 'The dominoes', minutes: 10, completion: 'read',
      summary: 'Vision, speech, translation: the same method worked, again and again, in one field after another.',
      blocks: [
        { type: 'text', body: [
          'What happened after 2012 looked remarkably similar across many fields. One field after another found the same thing: a large neural network, trained on enough examples, could beat methods that experts had spent ten years carefully hand-building. This happened in speech recognition, in machine translation, in recommendation systems, and in medical imaging. The story repeats itself. Only the subject changes each time.',
          'Machine translation is the clearest example. For a long time, it was the field\'s biggest embarrassment. The 1966 report that helped trigger the first AI winter was about exactly this problem — machine translation was not working. Statistical methods made it better through the 2000s. Then, from around 2014, neural methods improved it again, sharply. By 2016, major services had switched over to neural translation. The very problem that helped kill AI funding in 1966 had become, fifty years later, a normal product feature that worked well enough.'
        ] },
        { type: 'timeline', items: [
          { year: '2012', label: 'Vision', body: 'AlexNet wins the ImageNet competition. Within two years, deep convolutional networks take over the whole field of computer vision.' },
          { year: '2012–2015', label: 'Speech', body: 'Deep networks sharply cut the error rate of the major speech recognition systems. Voice assistants stop being just demos and become products people can actually use.' },
          { year: '2014–2016', label: 'Translation', body: 'Neural machine translation replaces the older statistical, phrase-based methods. Major translation services switch over.' },
          { year: '2015–2017', label: 'Games', body: 'Systems learn to play Atari video games using only the raw screen pixels. AlphaGo beats a world champion at the game of Go. AlphaZero then learns chess, shogi and Go purely by playing against itself, without studying a single human game.' },
          { year: '2017', label: 'Transformers', body: 'The transformer, a new kind of network design, appears — first built for translation. Everything you learn in module 8 grows out of this one idea.' },
          { year: '2020–2022', label: 'Generation', body: 'Large language models and image-generating "diffusion" models move out of research labs and into everyday consumer products. The public conversation about AI changes completely.' }
        ] },
        { type: 'match', prompt: 'Match each field to what actually changed in it. "It got better" is not a real answer — say what changed.', pairs: [
          { left: 'Vision', right: 'Deep convolutional networks took over the whole field within about two years of AlexNet', why: 'This is the ImageNet result from the last lesson, spreading out to the rest of the field.' },
          { left: 'Speech', right: 'Error rates fell sharply; voice assistants went from demo to a product people could actually use', why: 'The same recipe as before — a big network, a lot of data, a lot of computing power — just applied to a new field.' },
          { left: 'Translation', right: 'Neural methods replaced statistical ones; major services had switched by 2016', why: 'This is the domino that mattered most. It is the exact same problem that helped cause the first AI winter, back in 1966.' },
          { left: 'Games', right: 'Systems learned Atari from raw pixels, then a self-play system beat a world Go champion', why: 'The next lesson in this module, "Move 37", is entirely about this one.' }
        ] },
        { type: 'takeaway', body: 'The real lesson of this decade is not that any one system was especially clever. It is that a single recipe — a big network, a lot of data, a lot of computing power — kept working, again and again, in field after field. This included several fields where the experts in that field were confident it would not work.' }
      ]
    },
    {
      id: 'm07l3', title: 'Move 37', minutes: 9, completion: 'activity',
      summary: 'The clearest example of a machine doing something its own builders could never have written down as a rule.',
      blocks: [
        { type: 'text', body: [
          'The game of Go had long been the one big counter-example. Chess fell to a machine in 1997. But Go has far more possible moves at each turn than chess, and there was no good way to score a Go position with a number. Through the 2000s, most experts believed a machine Go champion was still decades away.',
          'In March 2016, a system called AlphaGo played Lee Sedol, one of the strongest Go players of his generation, in a match of five games. AlphaGo won four of them.',
          'The moment people still talk about is the thirty-seventh move of game two, now known as "Move 37". AlphaGo played a move on the fifth line of the board that broke centuries of accumulated Go theory about good openings. Commentators thought the system had made an error. Lee Sedol even left the room. The move turned out to be excellent. Its effect on the game was not clear until roughly fifty moves later, when it helped decide the outcome.'
        ] },
        { type: 'video', videoId: 'v-alphago' },
        { type: 'text', body: [
          'It is worth being exact about what Move 37 does and does not show. Few events in this field have been read into more than this one.',
          'What it shows: a system trained partly by playing against itself can find strategies that no human has ever tried, and those strategies can actually be correct. The system\'s designers did not put this knowledge in themselves — they could not have, because they did not have it either. That is a real and important thing for this event to have shown.',
          'What it does not show: general intelligence, understanding, or creativity in the way a person means those words. AlphaGo could not play chess. It could not explain its own move. It could not do anything at all outside a 19-by-19 Go board. Its successor, AlphaZero, learned several board games at once purely from playing against itself, which is a real step forward. But it still stays entirely inside one kind of problem: games where both players can see everything, the rules are fixed, and there is one clear way to win. This is the friendliest possible setting for this method, and almost nothing in real life looks like it.'
        ] },
        { type: 'scenario',
          setup: 'A colleague says to you: "AlphaGo invented a move that no human had thought of in 2,500 years of playing Go. That proves AI is already creative."',
          question: 'What is the most accurate response?',
          choices: [
            { text: '"It found a strategy no human had used, in a game with fixed rules and one clear way to win. Whether this works the same way in open-ended problems is exactly what has not been shown."', verdict: 'best',
              feedback: 'This answer gets both halves right. It accepts the real result — search combined with self-play genuinely found something people had never tried. And it points out the key assumption behind the bigger claim: that open-ended real-world problems behave the same way Go does. That assumption is exactly what is not proven.' },
            { text: '"It was just search. There is nothing creative about brute force."', verdict: 'poor',
              feedback: 'This undersells the result. AlphaGo was not simple brute force — the number of possible Go positions is far too large for that — and the strategy really was something no human had used before. Dismissing the result is just as much a mistake as reading too much into it.' },
            { text: '"Yes, and it will be doing that in science within a few years."', verdict: 'poor',
              feedback: 'This is stage two of the cycle you learned in module 4: taking a result from a narrow, bounded task and stretching it to cover an open-ended one. It might happen one day. But this event does not give evidence that it will.' },
            { text: '"Only because it played millions of games against itself, which people cannot do."', verdict: 'workable',
              feedback: 'True, and relevant. Needing millions of self-played games is exactly why this method does not transfer well to areas where you cannot simulate the task. But this answer half-accepts the word "creativity" instead of questioning whether it is even the right word to use.' }
          ] },
        { type: 'reflect', minWords: 30,
          prompt: 'Go has fixed rules, full information, and one clear winner. Think of a problem in your own work that has none of these three things. What would "playing against itself" even mean for that problem?',
          hint: 'If you cannot say what "winning" looks like, you cannot create the reward signal that this method needs. That is not a small, temporary engineering problem. It is a basic limit of the method.' }
      ]
    },
    {
      id: 'm07l4', title: 'Scaling laws', minutes: 8, completion: 'check',
      summary: 'The finding, based on evidence, that reorganised an entire industry — and the questions still open about it.',
      blocks: [
        { type: 'text', body: [
          'Around 2020, researchers published a finding that changed how money gets spent in this field. They looked at a wide range of model sizes, dataset sizes, and amounts of computing power. As these three things increased, performance improved smoothly and in a way you could predict. It was not a series of sudden jumps. It was a steady curve you could draw forward.',
          'The practical result of this was huge. If a model\'s ability is a predictable result of its scale, then making a model better becomes an engineering and money problem, not a research problem. You do not need a clever new idea. You need more computer chips, more data, and enough money to pay for both. Almost every large investment in AI since then follows from this one observation.'
        ] },
        { type: 'evidence', confidence: 'high',
          claim: 'Researchers have observed that model performance improves smoothly and predictably as model size, data, and computing power increase, across a very wide range of scales.',
          basis: 'Several independent research groups have published matching results about these "scaling laws". The pattern also shows up in published data on training-compute trends. This is one of the best-evidenced claims, backed by real data, in modern machine learning.', sourceId: 's-ai-index' },
        { type: 'evidence', confidence: 'low',
          claim: 'If we keep scaling up, we will keep getting similar gains in capability.',
          basis: 'This is genuinely uncertain, and researchers actively disagree about it. Scaling laws are curves drawn from past data. They come with no guarantee that they will keep holding outside the range where they were measured. Running out of data, the cost of energy, money, and the chance of shrinking returns are all real limits right now. Well-informed researchers disagree in public about how close we are to hitting them. Treat any confident claim in either direction — "scaling will just keep working" or "scaling has already hit a wall" — as an opinion, not a settled finding.' },
        { type: 'text', body: [
          'Two more points about scaling are worth remembering from this module.',
          'First, some abilities seem to appear suddenly as scale increases. A model cannot do a task at all — and then, at some size, it suddenly can. Whether this is a real, sudden change, or just an effect of how the tasks are scored, is still an open research question. The answer matters a lot for predicting what future models will do. Be careful of anyone who claims to be certain about this.',
          'Second, scaling is not free of consequences. Training the largest, most advanced models uses huge amounts of energy and money. This means only a small number of organisations can afford to build these systems. That concentration of power is as much a political fact as a technical one. Module 10 returns to this point.'
        ] },
        { type: 'check', questions: [
          { id: 'q0702', kind: 'mcq', difficulty: 'moderate', objective: 'Evaluate AI claims',
            stem: 'What is the correct way to describe the claim "scaling will continue to deliver similar gains"?',
            options: [
              'A disputed guess, stretched forward from a curve based on past data — not a proven law',
              'A proven law of machine learning',
              'A claim that has already been disproved',
              'A marketing claim with no real evidence behind it'
            ], answer: [0],
            rationale: 'The relationship we have observed is well supported by evidence, within the range that has actually been measured. Whether it continues beyond that range is a guess, stretched forward from the data. Skilled researchers disagree about this in public. Both the confident optimists and the confident doubters are claiming to know more than anyone actually knows.',
            distractors: {
              1: 'A pattern seen in data is not the same as a proven law. It only holds for certain within the range where it was actually measured.',
              2: 'It has not been disproved either. That is exactly why researchers disagree about it.',
              3: 'The underlying research is real, and other independent teams have reproduced it.'
            } },
          { id: 'q0703', kind: 'tf', difficulty: 'moderate', objective: 'Explain major stages',
            stem: 'True or false: scaling laws suggested that models could be improved mainly by adding more computing power and data, rather than by finding new algorithmic ideas.',
            options: ['True', 'False'], answer: [0],
            rationale: 'This conclusion is exactly why the finding mattered so much commercially. It turned a research problem into a question of where to spend capital, and the whole industry reorganised itself around that idea.' }
        ] },
        { type: 'practice', title: 'Claim log, entry three',
          steps: [
            'Reopen your claim log.',
            'Find a current claim about AI capability getting better — a roadmap, a forecast, or an announcement about what next year\'s model will be able to do.',
            'Work out which part of the claim rests on an actual measured result, and which part rests on a guess stretched forward from scaling.',
            'Write down what evidence, if it appeared in the next twelve months, would change your mind — in either direction.',
            'That last step is the one people skip. Do it anyway.'
          ],
          output: 'A third log entry, with a testable expectation attached to it. You will use all three entries later, in the capstone project.' }
      ]
    }
  ],
  extension: {
    title: 'The evidence-based version',
    body: 'Stanford HAI\'s AI Index is the place to check any number used in this module — training compute, benchmark trends, cost curves, and adoption rates. It states its methods clearly. The full report is long. Reading just the summary is enough.',
    resourceIds: ['r-ai-index', 'r-alexnet']
  }
}
