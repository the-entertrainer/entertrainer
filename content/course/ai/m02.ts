import type { Module } from './types'

export const M02: Module = {
  id: 'm02', n: '02', accent: 'var(--violet)',
  title: 'Before there was a field',
  intro: 'The idea of a thinking machine is older than the computer. This module covers the twenty years in which a philosophical question turned into an engineering programme — Turing\'s 1936 machine, his 1950 test, and the summer in 1956 when ten people gave the field its name and, in the same document, made a promise nobody could keep.',
  objectives: [
    'Explain what a universal machine is and why it matters that one machine can be any machine.',
    'State the imitation game as Turing framed it, and one serious objection to it.',
    'Describe what happened at the 1956 Dartmouth workshop and what it claimed.',
    'Identify the specific optimism in the founding proposal that turned out to be wrong.'
  ],
  lessons: [
    {
      id: 'm02l1', title: 'A machine that can be any machine', minutes: 8, completion: 'read',
      summary: 'Turing 1936, and the reason software exists at all.',
      blocks: [
        { type: 'text', lead: true, body: [
          'In 1936, before there were computers, Alan Turing described one on paper. He was not trying to invent a machine; he was answering a question in mathematical logic about what can and cannot be computed by following rules.',
          'His imaginary device was almost insultingly simple: an endless paper tape, a head that reads and writes one symbol at a time, and a small table of rules saying what to do next. What he then proved is the reason everything since exists. A single machine of this kind, given a description of any other such machine on its tape, can behave exactly like it.',
          'That is the universal machine, and it is why we have software. Your phone is not a phone-shaped device with calculating parts; it is one general machine reading a description of a camera, then a description of a map, then a description of a chat assistant. Every argument in this course about what machines can do rests on this: the hardware is not the limit. The description is.'
        ] },
        { type: 'timeline', items: [
          { year: '1936', label: 'On Computable Numbers', body: 'Turing describes the universal machine and proves there are well-posed questions no such machine can answer. Both halves matter: it establishes generality and it establishes limits, in the same paper.' },
          { year: '1943', label: 'McCulloch and Pitts', body: 'A mathematical model of a neuron as a logic gate. The first serious suggestion that thinking might be computation performed by networks of simple units — the seed of everything in module 6.' },
          { year: '1945–1949', label: 'Stored-program computers', body: 'The universal machine becomes physical: ENIAC, EDSAC, the Manchester Baby. Turing\'s tape becomes memory, and his rule table becomes a program you can change without rewiring the machine.' },
          { year: '1948', label: 'Shannon\'s information theory', body: 'Information gets a mathematics and a unit. Without it there is no way to talk precisely about compression, channels, or — much later — what a model has actually learned.' },
          { year: '1950', label: 'Computing Machinery and Intelligence', body: 'Turing asks whether machines can think, decides the question is too vague to answer, and proposes replacing it with a test.' }
        ] },
        { type: 'takeaway', body: 'One machine, any behaviour, given the right description. Every later claim in this field — that a network can recognise faces, that a model can write — is a claim about finding the right description, not about building a different kind of machine.' }
      ]
    },
    {
      id: 'm02l2', title: 'The imitation game', minutes: 10, completion: 'check',
      summary: 'What Turing actually proposed, and what it was designed to avoid.',
      blocks: [
        { type: 'text', body: [
          'Turing opens the 1950 paper by proposing to consider the question "Can machines think?" — and then immediately abandons it. The words "machine" and "think", he says, are too loaded to settle by argument. So he replaces the question with a game.',
          'A judge exchanges written messages with two hidden participants, one human and one machine, and tries to work out which is which. If the judge does no better than chance, the machine has passed. The move here is subtle and often missed: Turing is not claiming that passing means the machine thinks. He is proposing that we stop asking a question we cannot settle and start measuring something we can.'
        ] },
        { type: 'video', videoId: 'v-turing' },
        { type: 'accordion', title: 'Turing\'s nine objections — and they are still the nine objections', items: [
          { q: 'The theological objection', a: 'Thinking requires a soul, which God gives to humans and not machines. Turing takes it seriously enough to answer it, which tells you about 1950. He replies that this constrains God rather than machines.' },
          { q: 'The "heads in the sand" objection', a: 'The consequences would be too dreadful, so let us hope it is impossible. Turing notes drily that this is not an argument. It is, however, still an extremely common posture.' },
          { q: 'The mathematical objection', a: 'Gödel and Turing himself proved there are things no machine can determine. True — but humans have never been shown to be free of comparable limits, and the objection assumes we are.' },
          { q: 'The argument from consciousness', a: 'A machine can only be said to think if it feels itself thinking. Turing\'s reply is the sharpest line in the paper: by that standard, the only way to know anyone thinks is to be them. We extend the courtesy to other people; the objection is really about who gets the courtesy.' },
          { q: 'Arguments from various disabilities', a: '"A machine will never enjoy strawberries, make mistakes, fall in love, be the subject of its own thought." Turing points out that these are usually generalisations from small, early machines — an inductive argument from a sample of one decade.' },
          { q: 'Lady Lovelace\'s objection', a: 'A machine can only do what we tell it; it originates nothing. This is the most durable objection and the most interesting one for today, because modern systems are trained rather than instructed, and their outputs routinely surprise the people who built them. Whether that counts as origination is exactly the live argument.' },
          { q: 'Continuity in the nervous system', a: 'Brains are analogue; digital machines are discrete. Turing answers that a discrete machine can approximate a continuous one closely enough that a judge could not tell.' },
          { q: 'The informality of behaviour', a: 'Human conduct cannot be captured by rules, so no rule-following machine can reproduce it. This objection aged interestingly: modern systems are not rule-following in the sense meant here, which is arguably why they got further.' },
          { q: 'Extra-sensory perception', a: 'Turing devotes real space to telepathy. It is a useful reminder that a brilliant paper is still a document of its moment, and that reading primary sources includes reading the parts that did not survive.' }
        ] },
        { type: 'evidence', confidence: 'high', sourceId: 's-turing',
          claim: 'Turing proposed the imitation game in a 1950 paper, and explicitly declined to define "thinking".',
          basis: 'Primary source: "Computing Machinery and Intelligence", Mind LIX(236), 1950. The paper is freely available and the argument is in section 1.' },
        { type: 'text', body: [
          'One more thing worth knowing, because it comes up constantly. Turing\'s test is a test of indistinguishability in conversation, and modern systems are extremely good at conversation specifically. Systems have been reported as passing versions of the test under various conditions — but the conditions do almost all of the work: how long the judge gets, how expert they are, what the machine is allowed to claim about itself. Treat any "AI passes the Turing test" headline as a claim about a protocol, and ask to see the protocol.'
        ] },
        { type: 'check', questions: [
          { id: 'q0201', kind: 'mcq', difficulty: 'moderate', objective: 'Explain major stages',
            stem: 'Why did Turing replace "Can machines think?" with the imitation game?',
            options: [
              'Because he judged the original question too ill-defined to settle, and wanted one that could be tested',
              'Because he had proved that machines cannot think',
              'Because he wanted to show machines are conscious',
              'Because conversation is the hardest thing a machine can do'
            ], answer: [0],
            rationale: 'The substitution is a methodological move: swap an unanswerable question for an operational one. Turing is explicit that passing the test does not settle the metaphysics — it just gives us something to measure.',
            distractors: {
              1: 'He proved no such thing; he spent the paper arguing the opposite was plausible.',
              2: 'Turing carefully avoids claiming this, and answers the consciousness objection by pointing out we cannot verify it in each other either.',
              3: 'He chose conversation because it can range over any subject, not because he thought it hardest.'
            } },
          { id: 'q0202', kind: 'mcq', difficulty: 'hard', objective: 'Evaluate AI claims',
            stem: 'A headline reads: "AI system passes the Turing test". Which follow-up question does the most work?',
            options: [
              'How long were the conversations, and who were the judges?',
              'Which company built it?',
              'How many parameters does the model have?',
              'Was it trained on the internet?'
            ], answer: [0],
            rationale: 'Duration and judge expertise dominate the result. A five-minute exchange with a non-expert judge is a very different test from an hour with someone who knows the failure modes — and both have been reported as "the Turing test".',
            distractors: {
              1: 'Useful for weighing the source\'s interest, but it does not tell you what was measured.',
              2: 'Unrelated to whether a conversational protocol was rigorous.',
              3: 'Almost certainly yes, for any current system, and it does not bear on the protocol.'
            } }
        ] },
        { type: 'resource', title: 'Read the original — it is more readable than you expect', resourceIds: ['r-turing-paper', 'r-turing-sep'] }
      ]
    },
    {
      id: 'm02l3', title: 'Ten people, one summer, 1956', minutes: 8, completion: 'check',
      summary: 'The workshop that named the field and set its expectations.',
      blocks: [
        { type: 'text', body: [
          'In 1955, four researchers — John McCarthy, Marvin Minsky, Nathaniel Rochester and Claude Shannon — wrote a funding proposal for a summer workshop at Dartmouth College. The proposal needed a name for what they were doing. McCarthy chose "artificial intelligence", partly to distinguish the work from cybernetics and from Norbert Wiener\'s influence over it. The name stuck, and it has been causing arguments ever since.',
          'The workshop ran through the summer of 1956. It produced no breakthrough. What it produced was a community: the people in that room, and their students, ran the field for the next thirty years.'
        ] },
        { type: 'video', videoId: 'v-dartmouth' },
        { type: 'quote',
          text: 'We propose that a 2 month, 10 man study of artificial intelligence be carried out… The study is to proceed on the basis of the conjecture that every aspect of learning or any other feature of intelligence can in principle be so precisely described that a machine can be made to simulate it.',
          attribution: 'McCarthy, Minsky, Rochester and Shannon, the 1955 Dartmouth proposal',
          source: 'Reprinted in AI Magazine by AAAI — see the resource below.' },
        { type: 'text', body: [
          'Read that twice. Two months. Ten people. Every aspect of intelligence.',
          'It is easy to laugh, and the laugh is instructive. These were not naive people — Shannon had invented information theory, McCarthy would invent Lisp and time-sharing. The error was not stupidity. It was a specific and repeatable mistake: they could see clearly how to state the problem, and they mistook that for seeing how to solve it. Being able to describe intelligence precisely enough to program it turned out to be the entire difficulty, not the preliminary step.',
          'You will watch this same mistake happen three more times today, in 1958, in 1985, and — arguably — in the present.'
        ] },
        { type: 'evidence', confidence: 'high', sourceId: 's-dartmouth',
          claim: 'The term "artificial intelligence" was coined in the 1955 proposal for the 1956 Dartmouth workshop.',
          basis: 'Primary source: the proposal itself, reprinted by AAAI. The naming is not disputed, though McCarthy\'s reasons for choosing it are known mainly from his later recollections.' },
        { type: 'check', questions: [
          { id: 'q0203', kind: 'mcq', difficulty: 'easy', objective: 'Explain major stages',
            stem: 'What did the 1956 Dartmouth workshop principally produce?',
            options: [
              'The name of the field and the community that led it for decades',
              'The first working artificial intelligence',
              'The Turing test',
              'The first neural network'
            ], answer: [0],
            rationale: 'No technical breakthrough came out of that summer. Its importance is institutional: it named the field and assembled the people who would define it.',
            distractors: {
              1: 'Nothing of the kind was built that summer, and the proposal\'s two-month estimate is the standing joke of the field.',
              2: 'That was Turing, in 1950, six years earlier.',
              3: 'McCulloch and Pitts modelled a neuron in 1943; Rosenblatt built the perceptron in 1958.'
            } }
        ] },
        { type: 'resource', resourceIds: ['r-dartmouth', 'r-chm-timeline'] }
      ]
    },
    {
      id: 'm02l4', title: 'What they got right', minutes: 7, completion: 'activity',
      summary: 'Separating the founders\' good bets from their bad ones.',
      blocks: [
        { type: 'text', body: [
          'It would be a poor lesson that only made fun of the founders. Several of their bets were correct, and one of them was correct in a way that took sixty years to pay off.'
        ] },
        { type: 'compare', caption: 'The 1955 proposal, scored with hindsight',
          columns: ['What they proposed', 'How it turned out'],
          rows: [
            ['Machines can be made to use language', 'Right, and spectacularly so — but by statistical learning from enormous text, not by the symbolic methods they had in mind.'],
            ['Machines can form abstractions and concepts', 'Partly right. Modern networks demonstrably form internal representations; whether those are "concepts" is an active research question, not a settled one.'],
            ['Machines can improve themselves', 'Right in a narrow sense: systems improve through training, and increasingly help build their successors. Not right in the recursive sense that phrase is often used to imply.'],
            ['Neuron nets are one avenue worth studying', 'Right, and the most under-weighted line in the document. It sat mostly dormant for thirty years before becoming the whole field.'],
            ['Two months should make significant progress', 'Wrong by roughly a factor of three hundred, and the error is the lesson.'],
            ['Randomness and creativity can be engineered in', 'Interestingly right. Sampling temperature in a modern language model is close to what they were gesturing at.']
          ] },
        { type: 'sort',
          prompt: 'Sort each statement by what kind of claim it is. This is the same sorting you will do on modern claims in module 10 — practising it on 1955 is safer.',
          buckets: ['A description of a goal', 'A testable prediction', 'An estimate of effort'],
          items: [
            { text: '"Every aspect of intelligence can in principle be precisely described."', bucket: 0, why: 'It states an ambition and a working assumption. "In principle" makes it close to untestable, which is what lets it survive any amount of failure.' },
            { text: '"A machine will be able to use language."', bucket: 1, why: 'Testable, and eventually tested. It came true — just not by the route they assumed.' },
            { text: '"Two months and ten people will make significant progress."', bucket: 2, why: 'An effort estimate. Effort estimates are the claims that fail most reliably in this field, and they are the ones least often examined.' },
            { text: '"Neuron nets are worth studying."', bucket: 1, why: 'A research bet that could be checked by making it, and was — sixty years later.' },
            { text: '"Machines will improve themselves."', bucket: 1, why: 'Testable but slippery: it means something modest and true, and something dramatic and unevidenced, and the sentence does not distinguish them.' }
          ] },
        { type: 'reflect', minWords: 30,
          prompt: 'The founders mistook "we can state this problem clearly" for "we can solve this problem soon". Where have you seen that same substitution in your own work — a plan that was clear, therefore assumed to be quick?',
          hint: 'It does not have to be about technology. The pattern is general, which is why it is worth naming.' }
      ]
    }
  ],
  extension: {
    title: 'Primary sources are more readable than their reputation',
    body: 'Both the 1950 Turing paper and the 1955 Dartmouth proposal are short, plainly written, and available free. Reading two pages of the actual proposal does more for your judgement about modern AI announcements than any amount of commentary about it.',
    resourceIds: ['r-turing-paper', 'r-dartmouth']
  }
}
