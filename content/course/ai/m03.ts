import type { Module } from './types'

export const M03: Module = {
  id: 'm03', n: '03', accent: 'var(--blue)',
  title: 'Rules, search and expert systems',
  intro: 'For roughly thirty years, "AI" meant something quite different from what it means today. It meant intelligence built by hand, out of logic, using symbols and rules. It is tempting to treat this era as a wrong turn. It was not. This era produced ideas that are still running inside things you used this morning. And it failed for a reason that is worth understanding clearly.',
  objectives: [
    'Explain the symbolic hypothesis: the idea that intelligence is just the manipulation of symbols using rules.',
    'Describe how search works, and why combinatorial explosion limits what it can do.',
    'Explain what an expert system was, and what the knowledge bottleneck means.',
    'Identify where symbolic methods still work better than learned ones today.'
  ],
  lessons: [
    {
      id: 'm03l1', title: 'Intelligence as symbol manipulation', minutes: 8, completion: 'read',
      summary: 'The founding idea of the first thirty years.',
      blocks: [
        { type: 'text', lead: true, body: [
          'Early AI researchers made a simple bet. At the time, it seemed very reasonable. Thinking looks like reasoning. Reasoning looks like logic. Logic means moving symbols around by following rules. Computers are very good at moving symbols around by following rules. So the idea was: write down enough of the right symbols and rules, and you get thought.',
          'This idea is called the physical symbol system hypothesis. It is not a silly idea. It explains a lot about how humans do mathematics, plan routes, play chess, and argue. It also led to real systems that worked. In 1956, the first program built to prove theorems from the book Principia Mathematica ran successfully. It even found a proof shorter than the one in the book.',
          'What went wrong is more interesting than just saying "it was the wrong idea". This approach worked very well on problems you could state exactly. It fell apart on everything else — recognising a cat, understanding a sentence, walking across a room. It turned out that the things adults find hard are often easy to write down as exact rules. And the things a two-year-old does without effort are nearly impossible to write down as rules. This idea is old enough to have its own name: Moravec\'s paradox.'
        ] },
        { type: 'video', videoId: 'v-symbolic' },
        { type: 'takeaway', body: 'Symbolic AI is not just "old AI". It is the branch of AI that works with clear, readable representations — things a person can look at and understand. It is still the right tool whenever a problem can be stated exactly, and whenever you need to explain why the answer is correct.' }
      ]
    },
    {
      id: 'm03l2', title: 'Search: the first great idea', minutes: 10, completion: 'check',
      summary: 'How to be intelligent by trying things out, and why this stops working eventually.',
      blocks: [
        { type: 'text', body: [
          'If you can describe a problem as a set of states and moves, you can be intelligent about it just by exploring. From where you are, list every move you are allowed to make. Imagine what each move leads to. Then repeat. Somewhere in that tree of possibilities is the answer.',
          'This method is called search. It is the single most useful idea from the symbolic era. Route planning, puzzle solving, proving theorems, playing games, and scheduling deliveries — all of these use search. They still use search today. Your map app is doing this right now, while you read this.'
        ] },
        { type: 'labeled', caption: 'The anatomy of a search problem',
          parts: [
            { label: 'State', body: 'A full description of the situation right now. In chess, this means the position of every piece. In route finding, this means where you are right now.' },
            { label: 'Moves', body: 'The allowed ways to move from one state to the next. In chess, this means every legal move. In routing, this means every road leading out of this junction.' },
            { label: 'Goal test', body: 'The way you recognise that you have finished. Checkmate. Arriving at your destination. A theorem you have proved.' },
            { label: 'Cost', body: 'What each move costs you. Distance, time, or number of steps. Without a cost, you can find an answer, but not necessarily a good one.' },
            { label: 'Heuristic', body: 'A quick, cheap guess at how far the goal is from where you are. This is where the real intelligence lives. A good heuristic lets you skip almost the whole tree of possibilities, without ever looking at most of it.' }
          ] },
        { type: 'text', body: [
          'And here is the wall that the whole era ran into. Suppose each position has about thirty legal moves. This is roughly true for chess. Looking one move ahead means 30 positions to check. Two moves ahead means 900. Four moves ahead means 810,000. Ten moves ahead means about 590 trillion. The tree does not just grow. It explodes.',
          'This problem is called combinatorial explosion. No amount of faster hardware can fix it. The problem grows exponentially, but hardware only gets better at a steady, linear rate. So every serious search system is really a system for *not* searching everything: it uses better heuristics, it skips branches it does not need to check, and it accepts a good answer instead of insisting on the best one. When Deep Blue beat the chess champion Garry Kasparov in 1997, it did not win by checking every possibility. It won because it checked a surprisingly small number of the moves that actually mattered.'
        ] },
        { type: 'chart', kind: 'line', scale: 'log',
          caption: 'How many positions to check, by how many moves you look ahead (30 legal moves per position)',
          note: 'This is plotted on a log scale on purpose. On a normal scale, the first three points would sit invisibly at the bottom, right next to the last one. That difference in size is the whole point.',
          data: [
            { label: '1 move', value: 30 },
            { label: '2 moves', value: 900 },
            { label: '4 moves', value: 810000 },
            { label: '10 moves', value: 590490000000000 }
          ] },
        { type: 'evidence', confidence: 'high', sourceId: 's-lighthill',
          claim: 'Combinatorial explosion was identified as a fundamental barrier to scaling up early AI. It was not just an engineering inconvenience.',
          basis: 'The 1973 Lighthill Report makes this its main technical criticism. It argues that methods which worked on small problems could not be expected to work on real, large ones. The full report is available, and this argument is in its summary.' },
        { type: 'check', questions: [
          { id: 'q0301', kind: 'mcq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
            stem: 'Why does faster hardware not solve combinatorial explosion?',
            options: [
              'The search space grows exponentially as you look further ahead, but hardware only improves at a much slower, steady rate',
              'Search algorithms cannot be split across multiple processors',
              'Memory is the real limit, not processing power',
              'Heuristics stop working on faster machines'
            ], answer: [0],
            rationale: 'Looking two more moves ahead multiplies the amount of work by roughly a thousand times. A decade of hardware progress might only buy you two more moves of lookahead. This mismatch is built into the structure of the problem. That is why the real answer was always better pruning, not more computing power.',
            distractors: {
              1: 'Search can actually be split across processors reasonably well. That is not the real problem.',
              2: 'Memory is a real limit too, but the exponential growth in possibilities is the deeper problem.',
              3: 'Heuristics work the same no matter how fast the machine is.'
            } }
        ] },
        { type: 'practice', title: 'Feel the explosion',
          steps: [
            'Pick a game you know well — noughts and crosses (tic-tac-toe), draughts (checkers), chess, or a route you often drive between two places.',
            'Roughly count how many choices you have at each step.',
            'Raise that number to the power of five. That gives you the size of the tree, five steps ahead.',
            'Now ask yourself honestly: when you actually play or drive, how many of those choices do you really consider?',
            'Write down what you use instead of checking every choice. That thing is your heuristic. Building good heuristics is the hard part of AI.'
          ],
          output: 'A number that surprises you, and one sentence naming the shortcut you use instead of searching everything.' }
      ]
    },
    {
      id: 'm03l3', title: 'Expert systems and the knowledge bottleneck', minutes: 8, completion: 'check',
      summary: 'AI\'s first commercial success, and why it did not last.',
      blocks: [
        { type: 'text', body: [
          'By the mid-1970s, a practical idea took hold. Stop trying to build general intelligence. Build narrow expertise instead. Interview a specialist. Write down their reasoning as a few hundred IF-THEN rules. Then let a program apply those rules to new cases.',
          'These programs were called expert systems, and they worked. MYCIN diagnosed blood infections at roughly the same level as the specialists it learned from. XCON configured computer orders for a company called Digital Equipment Corporation. It was widely reported to save the company millions of dollars a year. For the first time, AI had a real business case, and money poured in.',
          'Then the field hit a ceiling. It had three parts.'
        ] },
        { type: 'accordion', title: 'Why expert systems stalled', items: [
          { q: 'The knowledge bottleneck', a: 'Every rule had to be pulled out of a human expert through interviews, then written down, tested, and kept up to date by hand. This is slow, expensive, and it does not scale up well. It gets worse: experts often cannot explain what they know. A radiologist can spot a tumour on a scan, but cannot fully explain the rule they used to spot it. If it cannot be said out loud, it cannot be written down as a rule.' },
          { q: 'Brittleness at the edges', a: 'Inside its set of rules, the system worked excellently. But one step outside those rules, it did not fail gently — it failed confidently and absurdly. It had no sense of the edge of its own knowledge. A human expert can say, "this is outside my area." A set of rules has no way of knowing that.' },
          { q: 'The maintenance trap', a: 'A few hundred rules is manageable. A few thousand rules interact in ways no person can keep track of in their head. Adding one rule to fix one case could quietly break three other cases. The cost of making changes grew faster than the value the system provided.' }
        ] },
        { type: 'timeline', items: [
          { year: '1965–1980', label: 'DENDRAL and MYCIN', body: 'Stanford University builds systems for chemical analysis and for diagnosing blood infections. In testing, MYCIN performs about as well as human specialists. But it is never used in real hospitals. This is partly because of legal liability and workflow reasons, not because it was inaccurate.' },
          { year: '1980', label: 'XCON goes into production', body: 'Digital Equipment Corporation starts using a rule-based system to configure customer orders. It becomes the standard example of commercial success from this era.' },
          { year: '1980–1987', label: 'The boom', body: 'A whole expert-systems industry forms, including computers built specially to run the Lisp programming language. Money from companies and governments follows.' },
          { year: '1987–1993', label: 'The bust', body: 'Ordinary computers catch up with the specialised Lisp machines. Maintenance costs keep rising. The market collapses. See module 4 for what happens next.' }
        ] },
        { type: 'check', questions: [
          { id: 'q0302', kind: 'mcq', difficulty: 'moderate', objective: 'Explain major stages',
            stem: 'What is the "knowledge bottleneck" in expert systems?',
            options: [
              'Expert knowledge has to be pulled out by hand through interviews, and much of it cannot be put into words at all',
              'Computers of that time did not have enough memory to store the rules',
              'Not enough experts were willing to take part',
              'The rules ran too slowly to be useful'
            ], answer: [0],
            rationale: 'The real constraint was moving knowledge from a human mind into a machine. This was expensive when it was possible at all, and impossible when the expertise was tacit — meaning the expert could not explain it in words. This is exactly the constraint that machine learning later removed, by learning from examples instead of from explanations.',
            distractors: {
              1: 'Rule sets are small in size. Memory was not the limit.',
              2: 'Getting access to experts cost money, but it was not the fundamental barrier.',
              3: 'Running the rules was fast. Writing the rules was slow.'
            } },
          { id: 'q0303', kind: 'tf', difficulty: 'moderate', objective: 'Evaluate AI claims',
            stem: 'True or false: an expert system that performs well inside its area of knowledge can be trusted to fail gracefully just outside that area.',
            options: ['True', 'False'], answer: [1],
            rationale: 'The opposite is true. A set of rules has no idea where its own boundary is. So it applies its rules confidently, even to cases they were never meant for. This same problem — failing confidently, with no warning sign — is also the main safety problem with today\'s language models. They arrived at the same problem by a completely different route.' }
        ] }
      ]
    },
    {
      id: 'm03l4', title: 'Why symbolic methods still matter', minutes: 7, completion: 'check',
      summary: 'What rules do better than learning, and where the two are now being combined.',
      blocks: [
        { type: 'text', body: [
          'It would be a mistake to leave this module thinking that symbolic AI lost. It is running inside software you use every day. And in the places where it belongs, it is not just good enough — it is clearly better than a learned model.'
        ] },
        { type: 'tabs', items: [
          { label: 'When you must justify', body: 'A rule-based system can print out its own reasoning: this rule fired, then this one fired next. In lending decisions, government benefits, medical protocols, and safety cases, a clear, checkable chain of reasoning is often a legal requirement, not just a nice-to-have. A neural network cannot produce this. Explanations given after the fact for a neural network\'s behaviour are only rough approximations, not a true account of what happened.' },
          { label: 'When the rule is the truth', body: 'Tax thresholds, the legal moves in chess, medicine dosing limits, sales tax rates. These are not patterns you can learn from data. They are facts that someone has officially declared. Learning them statistically means getting them approximately right — and for this kind of problem, approximately right means wrong.' },
          { label: 'When you have no data', body: 'Machine learning needs examples to learn from. A brand-new process, a rare kind of failure, a regulation that starts next month — for these, no examples exist yet. Rules, on the other hand, can be written on day one, straight from a specification document.' },
          { label: 'When guarantees matter', body: 'Formal methods can mathematically prove that a program will never enter a dangerous state. No similar proof exists for a large neural network. Aviation, railway signalling, and medical devices still rely heavily on methods that can be verified this way.' },
          { label: 'Hybrids', body: 'In real systems, the practical answer is usually both together. A learned model handles perception and language. A symbolic layer handles the rules, the arithmetic, and the constraints. When a language model uses a calculator or looks something up in a database instead of guessing, that is a symbolic system doing the part it is better at. Module 9 covers this in more detail.' }
        ] },
        { type: 'evidence', confidence: 'medium',
          claim: 'Today\'s real-world AI systems commonly combine learned components with symbolic ones, rather than using only one or the other.',
          basis: 'This is well supported by vendor documentation on tool use, function calling, and retrieval, and by the design of widely used AI assistants. It is labelled medium confidence rather than high, because the word "commonly" is a claim about industry practice. Industry practice is not measured in a systematic way, and it changes quickly.' },
        { type: 'check', questions: [
          { id: 'q0304', kind: 'mrq', difficulty: 'hard', objective: 'Distinguish AI approaches',
            stem: 'For which of these would a rule-based approach be the better choice today? Select all that apply.',
            options: [
              'Calculating legally required sick pay using a published formula',
              'Deciding whether a photograph contains a bicycle',
              'Checking that a proposed work shift schedule follows union rules',
              'Summarising a customer complaint'
            ], answer: [0, 2],
            rationale: 'Both correct answers are cases where the rule is officially fixed and being exact matters. The other two are perception and language tasks. There is no crisp rule you could write for them — this is exactly the space where learned models became useful.',
            distractors: {
              1: 'No one can write exact rules for "looks like a bicycle". This is the kind of problem symbolic AI could never solve.',
              3: 'Summarising text has no correct rule-based method. It needs a model that understands language.'
            } }
        ] },
        { type: 'reflect', minWords: 25,
          prompt: 'Think of one process in your own work that people keep suggesting should be "done with AI". Is the underlying rule officially fixed, or is it something we just recognise when we see it? What would change about your answer if it were the other type?',
          hint: 'Officially fixed means someone wrote it down, and it is the authoritative answer. Recognised means we know it when we see it, but cannot fully state it as a rule.' }
      ]
    }
  ],
  extension: {
    title: 'The era in one long read',
    body: 'The Computer History Museum timeline covers this period using dated, original historical material. It is the fastest way to check any claim in this module against a real archive, instead of just a summary.',
    resourceIds: ['r-chm-timeline']
  }
}
