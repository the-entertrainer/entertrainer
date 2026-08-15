import type { Module } from './types'

export const M03: Module = {
  id: 'm03', n: '03', accent: 'var(--orange)',
  title: 'Rules, search and expert systems',
  intro: 'For roughly thirty years, AI meant something quite different from what it means now: intelligence as symbol manipulation, built by hand, out of logic. It is tempting to treat this era as a wrong turn. It was not. It produced ideas still running inside things you used this morning, and it failed for a reason worth understanding precisely.',
  objectives: [
    'Explain the symbolic hypothesis: intelligence as the manipulation of symbols by rules.',
    'Describe how search works and why combinatorial explosion limits it.',
    'Explain what an expert system was and what the knowledge bottleneck is.',
    'Identify where symbolic methods still outperform learned ones today.'
  ],
  lessons: [
    {
      id: 'm03l1', title: 'Intelligence as symbol manipulation', minutes: 8, completion: 'read',
      summary: 'The founding hypothesis of the first thirty years.',
      blocks: [
        { type: 'text', lead: true, body: [
          'The bet the early field made was clean and, at the time, extremely reasonable. Thinking looks like reasoning. Reasoning looks like logic. Logic is the manipulation of symbols according to rules. Computers are very good at manipulating symbols according to rules. Therefore: write down enough of the right symbols and rules, and you get thought.',
          'This is sometimes called the physical symbol system hypothesis, and it is not silly. It explains a great deal about how humans do mathematics, plan routes, play chess and argue. It also produced real systems that worked — the first program to prove theorems from Principia Mathematica ran in 1956, and it found a proof shorter than the one in the book.',
          'What went wrong is more interesting than "it was the wrong idea". The approach worked beautifully on problems that could be stated exactly, and fell apart on everything else — recognising a cat, understanding a sentence, walking across a room. It turned out that the things adults find hard are easy to formalise, and the things a two-year-old does effortlessly are nearly impossible to. That observation is old enough to have a name: Moravec\'s paradox.'
        ] },
        { type: 'video', videoId: 'v-symbolic' },
        { type: 'takeaway', body: 'Symbolic AI is not "old AI". It is the branch of AI that works with explicit representations you can read, and it remains the right tool whenever a problem can be stated exactly and the answer must be justified.' }
      ]
    },
    {
      id: 'm03l2', title: 'Search: the first great idea', minutes: 9, completion: 'check',
      summary: 'How to be intelligent by trying things, and why that stops working.',
      blocks: [
        { type: 'text', body: [
          'If a problem can be described as states and moves, you can be intelligent about it by exploring. From where you are, list every legal move, imagine the resulting positions, and repeat. Somewhere in that tree is the answer.',
          'This is search, and it is the single most productive idea of the symbolic era. Route planning, puzzle solving, theorem proving, game playing, logistics scheduling — all search, all still search today. Your map application is doing it right now.'
        ] },
        { type: 'labeled', caption: 'The anatomy of a search problem',
          parts: [
            { label: 'State', body: 'A complete description of the situation. In chess, the position of every piece. In route finding, where you are now.' },
            { label: 'Moves', body: 'The legal transitions out of a state. Chess: every legal move. Routing: every road out of this junction.' },
            { label: 'Goal test', body: 'How you recognise you are done. Checkmate. Arrival. A proved theorem.' },
            { label: 'Cost', body: 'What each move is worth. Distance, time, number of steps. Without cost you can find an answer but not a good one.' },
            { label: 'Heuristic', body: 'A cheap guess at how far the goal is from here. This is where the intelligence lives: a good heuristic prunes almost all of the tree without ever looking at it.' }
          ] },
        { type: 'text', body: [
          'And here is the wall the whole era ran into. Suppose each position has about thirty legal moves — roughly true for chess. Looking one move ahead means 30 positions. Two moves, 900. Four moves, 810,000. Ten moves, about 590 trillion. The tree does not grow; it explodes.',
          'This is combinatorial explosion, and no amount of faster hardware fixes it, because the problem grows exponentially and hardware improves linearly. Every serious search system is therefore a system for *not* searching: better heuristics, pruning, and a willingness to accept a good answer rather than the best one. When Deep Blue beat Kasparov in 1997, it was not because it looked at every possibility. It was because it looked at astonishingly few of the ones that mattered.'
        ] },
        { type: 'evidence', confidence: 'high', sourceId: 's-lighthill',
          claim: 'Combinatorial explosion was identified as a fundamental obstacle to scaling early AI, not merely an engineering inconvenience.',
          basis: 'The 1973 Lighthill Report makes this its central technical criticism: methods that worked on small problems could not be expected to scale to real ones. The report is available in full and the argument is in its summary.' },
        { type: 'check', questions: [
          { id: 'q0301', kind: 'mcq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
            stem: 'Why does faster hardware not solve combinatorial explosion?',
            options: [
              'The search space grows exponentially with depth while hardware improves at a much slower rate',
              'Search algorithms cannot be parallelised',
              'Memory is the bottleneck, not processing',
              'Because heuristics stop working on faster machines'
            ], answer: [0],
            rationale: 'Two more moves of lookahead multiplies the work by roughly a thousand. A decade of hardware progress buys you perhaps two more moves. The mismatch is structural, which is why the answer was always better pruning rather than more compute.',
            distractors: {
              1: 'Search parallelises reasonably well; that is not the issue.',
              2: 'Memory is a real constraint, but the exponential growth is the fundamental one.',
              3: 'Heuristics are indifferent to machine speed.'
            } }
        ] },
        { type: 'practice', title: 'Feel the explosion',
          steps: [
            'Take a game you know — noughts and crosses, draughts, chess, or a route between two places you drive often.',
            'Count roughly how many choices you have at each step.',
            'Raise that number to the power of five. That is the size of the tree five steps out.',
            'Now ask yourself honestly: when you play or drive, how many of those do you actually consider?',
            'Write down what you use instead. That thing is your heuristic, and building it is the hard part of AI.'
          ],
          output: 'A number that surprises you, and a sentence naming the shortcut you use instead of searching.' }
      ]
    },
    {
      id: 'm03l3', title: 'Expert systems and the knowledge bottleneck', minutes: 8, completion: 'check',
      summary: 'AI\'s first commercial success, and the reason it did not last.',
      blocks: [
        { type: 'text', body: [
          'By the mid-1970s a pragmatic idea took hold: stop trying to build general intelligence and build narrow expertise instead. Interview a specialist, write down their reasoning as a few hundred IF–THEN rules, and let a program apply those rules to new cases.',
          'These were expert systems, and they worked. MYCIN diagnosed blood infections at roughly the level of the specialists it was built from. XCON configured computer orders for Digital Equipment Corporation and was widely reported to save the company millions a year. For the first time, AI had a business case, and money poured in.',
          'Then the ceiling arrived, and it had three parts.'
        ] },
        { type: 'accordion', title: 'Why expert systems stalled', items: [
          { q: 'The knowledge bottleneck', a: 'Every rule had to be extracted from a human being by interview, then written, tested and maintained by hand. This is slow, expensive and does not scale. Worse, experts routinely cannot say what they know — a radiologist can spot a tumour and cannot fully articulate the rule they used. What cannot be said cannot be encoded.' },
          { q: 'Brittleness at the edges', a: 'Inside its rules the system was excellent. One step outside them it did not degrade gracefully; it failed confidently and absurdly, because it had no notion of the boundary of its own competence. A human expert says "this is outside my area". A rule base has no way to know that.' },
          { q: 'The maintenance trap', a: 'A few hundred rules is manageable. A few thousand interact in ways nobody can hold in their head. Adding a rule to fix one case would silently break three others, and the cost of change grew faster than the value of the system.' }
        ] },
        { type: 'timeline', items: [
          { year: '1965–1980', label: 'DENDRAL and MYCIN', body: 'Stanford builds systems for chemical analysis and for diagnosing blood infections. MYCIN performs comparably to specialists in evaluation, and is never deployed clinically — partly for reasons of liability and workflow rather than accuracy.' },
          { year: '1980', label: 'XCON goes into production', body: 'Digital Equipment Corporation deploys a rule-based system to configure customer orders. It becomes the standard commercial success story of the era.' },
          { year: '1980–1987', label: 'The boom', body: 'An expert-systems industry forms, including specialised Lisp hardware. Corporate and government money follows.' },
          { year: '1987–1993', label: 'The bust', body: 'Ordinary workstations catch up with specialised Lisp machines, maintenance costs mount, and the market collapses. See module 4.' }
        ] },
        { type: 'check', questions: [
          { id: 'q0302', kind: 'mcq', difficulty: 'moderate', objective: 'Explain major stages',
            stem: 'What is the "knowledge bottleneck" in expert systems?',
            options: [
              'Expert knowledge has to be extracted by hand and much of it cannot be articulated at all',
              'Computers of the era lacked memory to store the rules',
              'There were not enough experts willing to participate',
              'The rules ran too slowly to be useful'
            ], answer: [0],
            rationale: 'The constraint was the transfer of knowledge from human to machine — expensive when possible, impossible when the expertise is tacit. This is precisely the constraint machine learning removed by learning from examples instead of explanations.',
            distractors: {
              1: 'Rule bases are small; memory was not the limit.',
              2: 'Access to experts was a cost, not the fundamental barrier.',
              3: 'Execution was fast. Authoring was slow.'
            } },
          { id: 'q0303', kind: 'tf', difficulty: 'moderate', objective: 'Evaluate AI claims',
            stem: 'True or false: an expert system that performs well inside its domain can be trusted to fail gracefully just outside it.',
            options: ['True', 'False'], answer: [1],
            rationale: 'The opposite. A rule base has no representation of its own boundary, so it applies its rules confidently to cases they were never meant for. This same property — confident failure with no signal — is the main safety problem with today\'s language models, arrived at by an entirely different route.' }
        ] }
      ]
    },
    {
      id: 'm03l4', title: 'Why symbolic methods still matter', minutes: 7, completion: 'check',
      summary: 'What rules do better than learning, and where the two are being recombined.',
      blocks: [
        { type: 'text', body: [
          'It would be a mistake to leave this module thinking symbolic AI lost. It is running in the software you use daily, and in the places where it belongs it is not merely adequate but strictly better than a learned model.'
        ] },
        { type: 'tabs', items: [
          { label: 'When you must justify', body: 'A rule-based system can print its reasoning: this rule fired, then this one. In lending, benefits, clinical protocols and safety cases, an auditable chain of reasoning is often a legal requirement, not a preference. A neural network cannot produce one, and post-hoc explanations of network behaviour are approximations rather than accounts.' },
          { label: 'When the rule is the truth', body: 'Tax thresholds, chess legality, dosing limits, VAT. These are not patterns to be inferred from data — they are stipulated facts. Learning them statistically means getting them approximately right, which for this class of problem means wrong.' },
          { label: 'When you have no data', body: 'Machine learning needs examples. A brand-new process, a rare failure mode, a regulation that comes into force next month — no examples exist. Rules can be written on day one from a specification.' },
          { label: 'When guarantees matter', body: 'Formal methods can prove a program never enters a bad state. No comparable proof exists for a large neural network. Aviation, rail signalling and medical devices still lean heavily on approaches you can verify.' },
          { label: 'Hybrids', body: 'The pragmatic answer in production is usually both: a learned model handles perception and language, and a symbolic layer handles the rules, arithmetic and constraints. When a language model calls a calculator or queries a database instead of guessing, that is a symbolic system doing the part it does better. Module 9 covers this properly.' }
        ] },
        { type: 'evidence', confidence: 'medium',
          claim: 'Current production AI systems commonly combine learned components with symbolic ones rather than using either alone.',
          basis: 'Well supported by vendor documentation on tool use, function calling and retrieval, and by the architecture of widely deployed assistants. Labelled medium rather than high because "commonly" is a claim about industry practice, which is not systematically measured and changes quickly.' },
        { type: 'check', questions: [
          { id: 'q0304', kind: 'mrq', difficulty: 'hard', objective: 'Distinguish AI approaches',
            stem: 'For which of these would a rule-based approach be the better choice today? Select all that apply.',
            options: [
              'Calculating statutory sick pay from a published formula',
              'Deciding whether a photograph contains a bicycle',
              'Checking that a proposed shift roster satisfies union constraints',
              'Summarising a customer complaint'
            ], answer: [0, 2],
            rationale: 'Both correct answers are cases where the rule is stipulated and exactness matters. The other two are perception and language tasks with no crisp rule to write — precisely the space learned models opened up.',
            distractors: {
              1: 'No one can write the rules for "looks like a bicycle". This is the class of problem symbolic AI could never crack.',
              3: 'Summarisation has no correct rule-based formulation; it needs a model of language.'
            } }
        ] },
        { type: 'reflect', minWords: 25,
          prompt: 'Think of one process in your own work that people keep suggesting should be "done with AI". Is the underlying rule stipulated or inferred? What would change about your answer if it were the other one?',
          hint: 'Stipulated means someone wrote it down and it is authoritative. Inferred means we recognise it when we see it but cannot state it.' }
      ]
    }
  ],
  extension: {
    title: 'The era in one long read',
    body: 'The Computer History Museum timeline covers this period with dated primary artifacts, and is the fastest way to check any claim made in this module against an archive rather than a summary.',
    resourceIds: ['r-chm-timeline']
  }
}
