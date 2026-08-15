import type { Module } from './types'

export const M02: Module = {
  id: 'm02', n: '02', accent: 'var(--blue)',
  title: 'Before there was a field',
  intro: 'The idea of a thinking machine is older than the computer. This module covers twenty important years. In this time, a question in philosophy turned into a plan for engineering. You will read about Turing\'s 1936 machine, his 1950 test, and the summer of 1956. In that summer, ten people gave this field its name. In the same document, they also made a promise they could not keep.',
  objectives: [
    'Explain what a universal machine is, and why it matters that one machine can act like any other machine.',
    'State the imitation game the way Turing described it, and give one serious objection to it.',
    'Describe what happened at the 1956 Dartmouth workshop, and what it claimed.',
    'Identify the exact hopeful claim in the founding proposal that turned out to be wrong.'
  ],
  lessons: [
    {
      id: 'm02l1', title: 'A machine that can be any machine', minutes: 10, completion: 'read',
      summary: 'Turing\'s 1936 idea, and why software can exist at all.',
      blocks: [
        { type: 'text', lead: true, body: [
          'In 1936, there were no computers yet. Alan Turing described one anyway, on paper. He was not trying to build a real machine. He was answering a question in mathematical logic. The question was: what can be worked out by following a fixed set of rules, and what cannot?',
          'His imaginary device was very simple, almost too simple to take seriously. It had an endless paper tape. It had a head that could read and write one symbol at a time. It had a small table of rules that said what to do next. Then Turing proved something big. This one simple machine, if given a description of any other such machine on its tape, could copy that other machine\'s behaviour exactly. This single proof is the reason everything that came after exists.',
          'This is called the universal machine. It is why software exists. Your phone is not really a phone-shaped device built for calculating. It is one general machine. It reads a description of a camera, then a description of a map, then a description of a chat assistant, and it behaves like each one in turn. Every idea in this course about what machines can do rests on this fact. The hardware is not the limit. The description you give it is the limit.'
        ] },
        { type: 'hotspot', diagram: 'tape-machine', caption: 'The 1936 machine, all its parts',
          points: [
            { x: 26, y: 49.8, label: 'The tape', body: 'The tape is endless. It is divided into cells. Each cell holds one symbol, or is left blank. This tape is the machine\'s only memory. Everything the machine knows, or is working out, lives here — not inside the machine itself.' },
            { x: 50, y: 37.8, label: 'The head', body: 'The head sits over one cell at a time. It can read the symbol in that cell, write a new symbol, and move one cell left or one cell right. That is everything the machine can physically do. None of it is specific to numbers, language, or any other subject.' },
            { x: 50, y: 78.7, label: 'The rule table', body: 'The rule table is a small, fixed list. It says: given the current state and the symbol under the head, do this action, then move to that state. This table is the program. If you change the table, the same machine does something completely different. This is the whole proof.' }
          ] },
        { type: 'timeline', items: [
          { year: '1936', label: 'On Computable Numbers', body: 'Turing describes the universal machine. He also proves that some clear, well-formed questions can never be answered by such a machine. Both parts matter. The same paper shows what the machine can do, and what it can never do.' },
          { year: '1943', label: 'McCulloch and Pitts', body: 'A mathematical model treats a neuron like a simple logic gate. This is the first serious idea that thinking might be a kind of computation, done by networks of simple units. It is the seed of everything you will learn in module 6.' },
          { year: '1945–1949', label: 'Stored-program computers', body: 'The universal machine becomes a real, physical thing: ENIAC, EDSAC, the Manchester Baby. Turing\'s tape becomes memory. His rule table becomes a program that you can change without rewiring the machine.' },
          { year: '1948', label: 'Shannon\'s information theory', body: 'Information now has its own mathematics and its own unit of measurement. Without this, there would be no precise way to talk about compression, communication channels, or — much later — what a model has actually learned.' },
          { year: '1950', label: 'Computing Machinery and Intelligence', body: 'Turing asks whether machines can think. He decides this question is too vague to answer directly. So he proposes replacing it with a test instead.' }
        ] },
        { type: 'takeaway', body: 'One machine can produce any behaviour, if it is given the right description. Every later claim in this field follows from this — that a network can recognise faces, that a model can write text. Each of these is a claim about finding the right description. It is not a claim about building a different kind of machine.' }
      ]
    },
    {
      id: 'm02l2', title: 'The imitation game', minutes: 10, completion: 'check',
      summary: 'What Turing really proposed, and what he was trying to avoid.',
      blocks: [
        { type: 'text', body: [
          'Turing opens his 1950 paper with the question "Can machines think?" Then he immediately drops it. He says the words "machine" and "think" carry too much baggage to settle by argument. So instead, he replaces the question with a game.',
          'In the game, a judge exchanges written messages with two hidden participants. One is human, one is a machine. The judge tries to work out which is which. If the judge cannot guess better than random chance, the machine has passed. This next point is subtle, and people often miss it. Turing is not saying that passing the game proves the machine thinks. He is saying we should stop asking a question we cannot settle, and start measuring something we actually can.'
        ] },
        { type: 'video', videoId: 'v-turing' },
        { type: 'accordion', title: 'Turing\'s nine objections — and they are still the same nine objections today', items: [
          { q: 'The theological objection', a: 'This objection says thinking needs a soul, and God gives souls to humans, not machines. Turing takes this seriously enough to answer it — which tells you something about the year 1950. His reply is that this objection actually limits what God can do, not what machines can do.' },
          { q: 'The "heads in the sand" objection', a: 'This objection says: the results would be too terrible, so let\'s just hope it\'s impossible. Turing points out, dryly, that hoping is not an argument. Even so, this attitude is still very common today.' },
          { q: 'The mathematical objection', a: 'Gödel, and Turing himself, proved that there are things no machine can work out. This is true. But no one has ever shown that humans are free from similar limits. This objection assumes we are, without proof.' },
          { q: 'The argument from consciousness', a: 'This objection says a machine can only be called a thinker if it feels itself thinking. Turing\'s reply is the sharpest line in the whole paper. By that standard, the only way to know that anyone thinks is to actually be them. We give other people the benefit of the doubt. This objection is really about who deserves that same benefit of the doubt.' },
          { q: 'Arguments from various disabilities', a: 'This objection lists things a machine will supposedly never do: enjoy strawberries, make mistakes, fall in love, think about itself. Turing points out that these claims are usually based on small, early machines. It is a broad conclusion drawn from just one decade of examples.' },
          { q: 'Lady Lovelace\'s objection', a: 'This objection says a machine can only do what we tell it to do. It cannot originate anything new. This is the longest-lasting objection, and the most interesting one today. Modern systems are trained, not directly instructed step by step, and their outputs often surprise the very people who built them. Whether that counts as "originating something new" is exactly the argument people are still having.' },
          { q: 'Continuity in the nervous system', a: 'This objection says brains work in a smooth, continuous way, while digital machines work in separate, discrete steps. Turing answers that a discrete machine can imitate a continuous one closely enough that a judge could not tell the difference.' },
          { q: 'The informality of behaviour', a: 'This objection says human behaviour cannot be written down as a fixed set of rules, so a rule-following machine can never copy it. This objection has aged in an interesting way. Modern systems do not simply follow fixed rules in the way this objection meant. That may be exactly why they have gone further than earlier machines.' },
          { q: 'Extra-sensory perception', a: 'Turing spends real space in the paper discussing telepathy. This is a useful reminder. Even a brilliant paper is still a product of its own time. Reading the original source means reading the parts that did not hold up too, not just the parts that did.' }
        ] },
        { type: 'evidence', confidence: 'high', sourceId: 's-turing',
          claim: 'Turing proposed the imitation game in a 1950 paper. He clearly refused to define the word "thinking".',
          basis: 'Primary source: "Computing Machinery and Intelligence", published in the journal Mind, volume LIX, issue 236, in 1950. The paper is free to read, and this argument is in section 1.' },
        { type: 'text', body: [
          'Here is one more thing worth knowing, because it comes up all the time. Turing\'s test checks whether you can tell a machine apart from a human in conversation. Modern systems happen to be extremely good at conversation specifically. Some systems have been reported as passing versions of this test, under various conditions. But the conditions are doing almost all of the work: how long the judge gets, how expert the judge is, what the machine is allowed to say about itself. When you read a headline that says "AI passes the Turing test", treat it as a claim about the rules of that one test. Ask to see those rules.'
        ] },
        { type: 'check', questions: [
          { id: 'q0201', kind: 'mcq', difficulty: 'moderate', objective: 'Explain major stages',
            stem: 'Why did Turing replace the question "Can machines think?" with the imitation game?',
            options: [
              'Because he judged the original question too unclear to settle, and wanted a question he could actually test',
              'Because he had proved that machines cannot think',
              'Because he wanted to show machines are conscious',
              'Because conversation is the hardest thing a machine can do'
            ], answer: [0],
            rationale: 'This is a change in method. Turing swaps a question that cannot be answered for one that can be tested. He says clearly that passing the test does not settle the deep philosophical question. It just gives us something we can actually measure.',
            distractors: {
              1: 'He proved no such thing. In the paper, he actually argues that the opposite is plausible.',
              2: 'Turing carefully avoids claiming this. When he answers the consciousness objection, he points out that we cannot verify thinking in other people either.',
              3: 'He chose conversation because it can cover any subject, not because he thought it was the hardest task.'
            } },
          { id: 'q0202', kind: 'mcq', difficulty: 'hard', objective: 'Evaluate AI claims',
            stem: 'A headline reads: "AI system passes the Turing test." Which follow-up question tells you the most?',
            options: [
              'How long were the conversations, and who were the judges?',
              'Which company built it?',
              'How many parameters does the model have?',
              'Was it trained on the internet?'
            ], answer: [0],
            rationale: 'How long the test lasted, and how expert the judges were, matter more than anything else. A five-minute chat with an inexperienced judge is a very different test from an hour with someone who knows what to look for. Both of these have been reported in the news as "the Turing test".',
            distractors: {
              1: 'This is useful for judging the source\'s motives, but it does not tell you what was actually measured.',
              2: 'This has nothing to do with whether the conversation test itself was done carefully.',
              3: 'The answer is almost certainly yes, for any current system, and it says nothing about how the test was run.'
            } }
        ] },
        { type: 'resource', title: 'Read the original paper — it is easier to read than you expect', resourceIds: ['r-turing-paper', 'r-turing-sep'] }
      ]
    },
    {
      id: 'm02l3', title: 'Ten people, one summer, 1956', minutes: 8, completion: 'check',
      summary: 'The workshop that named the field, and set expectations too high.',
      blocks: [
        { type: 'text', body: [
          'In 1955, four researchers wrote a funding proposal for a summer workshop at Dartmouth College. Their names were John McCarthy, Marvin Minsky, Nathaniel Rochester, and Claude Shannon. The proposal needed a name for the work they were describing. McCarthy chose the term "artificial intelligence". He chose it partly to separate this work from the field of cybernetics, and from Norbert Wiener\'s influence over it. The name stuck, and it has been causing arguments ever since.',
          'The workshop ran through the summer of 1956. It did not produce any technical breakthrough. What it did produce was a community. The people in that room, and their students after them, ran this field for the next thirty years.'
        ] },
        { type: 'video', videoId: 'v-dartmouth' },
        { type: 'quote',
          text: 'We propose that a 2 month, 10 man study of artificial intelligence be carried out… The study is to proceed on the basis of the conjecture that every aspect of learning or any other feature of intelligence can in principle be so precisely described that a machine can be made to simulate it.',
          attribution: 'McCarthy, Minsky, Rochester and Shannon, the 1955 Dartmouth proposal',
          source: 'Reprinted in AI Magazine by AAAI. See the resource link below.' },
        { type: 'text', body: [
          'Read that again. Two months. Ten people. Every aspect of intelligence.',
          'It is easy to laugh at this now, and the laugh teaches us something. These were not foolish people. Shannon had invented information theory. McCarthy would go on to invent the Lisp programming language and time-sharing computing. The mistake was not stupidity. It was a specific mistake, and it repeats often. They could see clearly how to describe the problem, and they mistook that for knowing how to solve it. Describing intelligence precisely enough to program it turned out to be the whole difficulty — not just the first easy step.',
          'You will see this same mistake happen three more times today: in 1958, in 1985, and — some would argue — right now, in the present.'
        ] },
        { type: 'evidence', confidence: 'high', sourceId: 's-dartmouth',
          claim: 'The term "artificial intelligence" was first used in the 1955 proposal for the 1956 Dartmouth workshop.',
          basis: 'Primary source: the proposal itself, reprinted by AAAI. Nobody disputes that this is where the name came from. McCarthy\'s reasons for choosing this exact name are known mainly from what he remembered and said later.' },
        { type: 'check', questions: [
          { id: 'q0203', kind: 'mcq', difficulty: 'easy', objective: 'Explain major stages',
            stem: 'What did the 1956 Dartmouth workshop mainly produce?',
            options: [
              'The name of the field and the community that led it for decades',
              'The first working artificial intelligence',
              'The Turing test',
              'The first neural network'
            ], answer: [0],
            rationale: 'No technical breakthrough came out of that summer. Its importance is about people and institutions. It named the field, and it brought together the people who would go on to define it.',
            distractors: {
              1: 'Nothing like this was built that summer. The proposal\'s two-month time estimate is now a standing joke in the field.',
              2: 'That was Turing, in 1950, six years earlier.',
              3: 'McCulloch and Pitts modelled a neuron in 1943; Rosenblatt built the perceptron in 1958.'
            } }
        ] },
        { type: 'resource', resourceIds: ['r-dartmouth', 'r-chm-timeline'] }
      ]
    },
    {
      id: 'm02l4', title: 'What they got right', minutes: 7, completion: 'activity',
      summary: 'Telling the founders\' good guesses apart from their bad ones.',
      blocks: [
        { type: 'text', body: [
          'It would not be fair to only make fun of the founders. Several of their guesses turned out to be correct. One of them was correct in a way that took sixty years to pay off.'
        ] },
        { type: 'compare', caption: 'The 1955 proposal, checked against what actually happened',
          columns: ['What they proposed', 'How it turned out'],
          rows: [
            ['Machines can be made to use language', 'Right, and right in a big way — but it happened through statistical learning from huge amounts of text, not through the symbolic methods they had in mind.'],
            ['Machines can form abstractions and concepts', 'Partly right. Modern networks clearly form internal representations. Whether these count as real "concepts" is still an open research question, not a settled one.'],
            ['Machines can improve themselves', 'Right in a narrow sense. Systems improve through training, and they increasingly help build the next systems. Not right in the bigger, self-improving-forever sense that this phrase is often taken to mean.'],
            ['Neuron nets are one avenue worth studying', 'Right, and the most underrated line in the whole document. It sat mostly untouched for thirty years before it became the centre of the entire field.'],
            ['Two months should make significant progress', 'Wrong by roughly three hundred times. This error is itself the lesson to remember.'],
            ['Randomness and creativity can be engineered in', 'Right, in an interesting way. The "temperature" setting in a modern language model is close to what they were pointing at.']
          ] },
        { type: 'sort',
          prompt: 'Sort each statement by what kind of claim it is. You will do this same kind of sorting on modern claims in module 10. Practising on claims from 1955 is a safer place to start.',
          buckets: ['A description of a goal', 'A testable prediction', 'An estimate of effort'],
          items: [
            { text: '"Every aspect of intelligence can in principle be precisely described."', bucket: 0, why: 'This states a goal and an assumption behind it. The phrase "in principle" makes it almost impossible to test. That is exactly what lets it survive any amount of failure.' },
            { text: '"A machine will be able to use language."', bucket: 1, why: 'This can be tested, and it eventually was. It came true — just not by the route they expected.' },
            { text: '"Two months and ten people will make significant progress."', bucket: 2, why: 'This is an estimate of effort. Effort estimates are the claims that fail most often and most reliably in this field. They are also the claims people check the least.' },
            { text: '"Neuron nets are worth studying."', bucket: 1, why: 'This is a research bet. It could be checked by actually doing the work — and it was, sixty years later.' },
            { text: '"Machines will improve themselves."', bucket: 1, why: 'This can be tested, but it is slippery. It can mean something modest and true, or something dramatic and unproven. The sentence itself does not tell you which one is meant.' }
          ] },
        { type: 'reflect', minWords: 30,
          prompt: 'The founders made one mistake: they treated "we can describe this problem clearly" as if it meant "we can solve this problem soon". Have you seen this same mistake in your own work? Think of a plan that felt clear, and was therefore assumed to be quick.',
          hint: 'This does not have to be about technology. This pattern shows up everywhere, which is why it is worth naming.' }
      ]
    }
  ],
  extension: {
    title: 'Primary sources are easier to read than their reputation suggests',
    body: 'Both the 1950 Turing paper and the 1955 Dartmouth proposal are short. They are plainly written, and free to read. Reading two pages of the actual proposal will do more for your judgement about modern AI announcements than any amount of commentary written about it.',
    resourceIds: ['r-turing-paper', 'r-dartmouth']
  }
}
