import type { Module } from './types'

export const M04: Module = {
  id: 'm04', n: '04', accent: 'var(--blue)',
  title: 'The winters',
  intro: 'Twice, this field almost died. Money stopped. Companies closed down. Researchers even took the words "artificial intelligence" out of their funding requests, just to get the money approved. This is the shortest module today. But if you only remember one module from this whole course, make it this one.',
  objectives: [
    'Explain what caused the first AI winter, and what the Lighthill Report actually said.',
    'Explain how the expert-systems business collapsed in the late 1980s.',
    'Spot the repeating pattern: a demo, a guess about the future, money, a plateau, then a collapse.',
    'Use that pattern to check a claim you hear today.'
  ],
  lessons: [
    {
      id: 'm04l1', title: 'The first winter', minutes: 8, completion: 'read',
      summary: '1966 to 1980: big promises run into a wall of too many possibilities.',
      blocks: [
        { type: 'text', lead: true, body: [
          'The first collapse came after ten years of real progress, and more than ten years of confident promises about the future. Two reports did most of the damage. Looking at the evidence available, both reports were right.',
          'In 1966, a US advisory committee wrote a report on machine translation. Ten years of funding had produced systems that were slower, less accurate, and more expensive than human translators. The report said this plainly. After it, funding for machine translation in the US almost stopped, for twenty years.',
          'In 1973, the UK Science Research Council asked the mathematician James Lighthill to review AI research. His report found that AI methods worked on small, carefully chosen problems. They showed no sign of working on real, large problems. This is the combinatorial explosion from the last module, now stated as an official government finding. Almost all British AI funding was taken away after the report.'
        ] },
        { type: 'evidence', confidence: 'high', sourceId: 's-lighthill',
          claim: 'The 1973 Lighthill Report criticised AI for not working beyond small, toy problems. Large cuts to UK AI funding followed it.',
          basis: 'The main source is the report itself, which you can read in full online. Historians agree that the report led to the funding cuts. As with any history of policy, we cannot re-run events to prove this for certain.' },
        { type: 'text', body: [
          'This period teaches us something important. The people who were too hopeful were not fools. What matters is the exact shape of their mistake. Their programs had solved problems in small, tidy worlds — a tabletop with coloured blocks, a puzzle with nine tiles. The researchers thought that scaling up to the real world was just a matter of adding more: more rules, more memory, more time.',
          'It was not just a matter of adding more. The real world is not simply a bigger blocks world. It is a different kind of problem. It has no clean, tidy description of its current state, and no complete list of possible moves. From inside the blocks world, nobody could see this coming. And the demos looked wonderful.'
        ] },
        { type: 'video', videoId: 'v-lighthill' },
        { type: 'takeaway', title: 'The lesson you can reuse', body: 'A demo in a limited, controlled setting tells you the method works in that setting. It tells you nothing about whether it will still work once you remove the limits. Ask what was kept fixed for the demo — and notice how rarely a launch announcement actually answers that question.' }
      ]
    },
    {
      id: 'm04l2', title: 'The second winter', minutes: 7, completion: 'check',
      summary: '1987 to 1993: the business crash.',
      blocks: [
        { type: 'text', body: [
          'The second collapse was about business, not about ideas. And it happened faster.',
          'The expert-systems boom of the early 1980s had built a whole industry. This included companies that sold special computers, built just to run a programming language called Lisp. That special hardware really was faster at the job — for a while. Then ordinary workstation computers from Sun and Apollo, and later normal desktop computers, became fast enough to run the same software. The market for special AI hardware did not just shrink. It disappeared, reportedly within a couple of years.',
          'At the same time, the maintenance problem from module 3 showed up, right on schedule. Companies that had installed rule-based systems found that the cost of keeping the rules up to date grew faster than the value the systems gave back. Japan had launched an ambitious project called the Fifth Generation Computer Systems project in 1982, with large government funding and a ten-year plan. It ended without reaching the broad, general abilities it had aimed for.',
          'By the early 1990s, the words "artificial intelligence" hurt your chances in a funding proposal. Researchers wrote "machine learning", "informatics", "knowledge-based systems", "pattern recognition" — almost anything except the actual name. The work carried on, just under other names. This is worth remembering: a winter is a collapse in confidence and money. It is not always a collapse in progress.'
        ] },
        { type: 'video', videoId: 'v-lisp-bust' },
        { type: 'compare', caption: 'Two winters, the same shape',
          columns: ['', 'First winter', 'Second winter'],
          rows: [
            ['Roughly', '1974–1980', '1987–1993'],
            ['What was oversold', 'General problem solving and machine translation', 'Rule-based expert systems and special AI hardware'],
            ['What broke it', 'Too many possibilities to search through — methods that could not scale up', 'Ordinary computers caught up in speed; upkeep costs grew faster than the value returned'],
            ['Trigger', 'Government reviews took away the funding', 'A market that collapsed on its own'],
            ['What survived', 'Search, planning and logic — absorbed into ordinary computer science', 'Rule engines — absorbed into ordinary business software']
          ] },
        { type: 'check', questions: [
          { id: 'q0401', kind: 'mcq', difficulty: 'moderate', objective: 'Explain major stages',
            stem: 'What most directly destroyed the market for special AI hardware in the late 1980s?',
            options: [
              'Ordinary workstation computers became fast enough to run the same software',
              'Expert systems were shown to give wrong answers',
              'Neural networks took their place',
              'Governments banned the technology'
            ], answer: [0],
            rationale: 'This is a story about ordinary computer hardware catching up, not a story about AI itself. The whole value of the special machines was that they were fast at one job. Once that speed advantage disappeared, so did the market. Notice how little this has to do with whether the AI actually worked.',
            distractors: {
              1: 'Inside their narrow area, the systems were reasonably accurate. The real problems were the cost of upkeep, and how easily they broke down at the edges of what they knew.',
              2: 'Neural networks were struggling too, at this point. Their comeback came much later.',
              3: 'No such ban ever happened.'
            } }
        ] }
      ]
    },
    {
      id: 'm04l3', title: 'The pattern, and how to use it', minutes: 10, completion: 'activity',
      summary: 'A five-stage cycle you can use to check a claim you hear this week.',
      blocks: [
        { type: 'text', lead: true, body: [
          'Look closely at both winters, and the same five stages appear each time. You will see them again in the perceptron boom of 1958, in module 6. And here is the uncomfortable part: you can see pieces of this same pattern happening right now.',
          'Naming these stages is not about being cynical. Every one of these cycles created real, lasting ability, and that ability survived the collapse that followed it. The point of the pattern is to let you believe two things at once: this technology is genuinely useful, *and* the timeline someone is selling me is probably wrong.'
        ] },
        { type: 'process', caption: 'The five-stage cycle', steps: [
          { label: 'A real result', body: 'Something really does work, usually in a limited, controlled setting. This part is not fake. Dismissing it is just the doubter\'s version of the same mistake.' },
          { label: 'Extrapolation', body: 'People guess how things will go in the future, by assuming that what is left to solve is as easy as what has already been solved. This is almost never true. The last 10% of an ability usually costs more than the first 90%.' },
          { label: 'Money', body: 'Funding arrives. It is priced against the guess about the future, not against the actual result. The timeline gets set by how long investors are willing to wait, not by how research actually works.' },
          { label: 'The plateau', body: 'Progress carries on, but it follows a different, slower path than the one people were promised. The gap between the promise and the real product becomes visible, even to people outside the field.' },
          { label: 'Correction', body: 'Money leaves, and it leaves fast. The underlying ability does not disappear — it gets absorbed into ordinary software, and people stop calling it AI. This is the AI effect from module 1.' }
        ] },
        { type: 'sort',
          prompt: 'Here are five statements you might hear about a technology. Sort each one by which stage of the cycle it belongs to. The skill is separating the actual reported result from the guess about the future attached to it.',
          buckets: ['A real result', 'An extrapolation', 'A correction signal'],
          items: [
            { text: '"The system scored 92% on the benchmark, up from 71% last year."', bucket: 0, why: 'A measurement, compared with an earlier one. Whether the test itself is a good one is a separate question. But this is a result, not a guess about the future.' },
            { text: '"At this rate, the task will be fully automated within two years."', bucket: 1, why: 'A guess about the future, based on a trend. It assumes the work still to do is like the work already done. This is stage 2, and it is where almost all the mistakes come from.' },
            { text: '"Three companies in the sector have quietly stopped publishing progress updates."', bucket: 2, why: 'Going quiet, after a period of loud announcements, is one of the earliest and most reliable warning signs of a correction.' },
            { text: '"Deployment took nine months longer than planned and required two extra engineers."', bucket: 2, why: 'This is the plateau showing up as delay and cost. It usually appears in internal delivery reports long before it appears in the news.' },
            { text: '"A pilot with 40 users reduced handling time by 18%."', bucket: 0, why: 'A result, and a clearly specified one. Notice the sample size — small, honestly stated, and far more useful than a claim with no numbers at all.' }
          ] },
        { type: 'practice', title: 'Claim log, entry two',
          steps: [
            'Reopen the claim log you started in module 1.',
            'Add a new entry for an AI claim you have seen in the last month. Pick one that you found convincing, if you can.',
            'Split it into two columns: the reported result, and the guess about the future attached to it.',
            'For the guess about the future, write down what would have to be true for it to come out right. Be specific: which problem must be solved, by when, and at what cost?',
            'Write down how confident you are in that guess, and say why.'
          ],
          output: 'A second log entry where the result and the guess about the future are physically separated on the page. That separation is the whole skill.' },
        { type: 'reflect', minWords: 30,
          prompt: 'Before both winters, people made honest forecasts that turned out badly wrong. What would have had to happen for them to catch their own mistake earlier?',
          hint: 'Think about what evidence would have proved them wrong, and whether anyone was actually collecting it.' }
      ]
    }
  ],
  extension: {
    title: 'Read a well-argued negative report',
    body: 'The Lighthill Report is worth twenty minutes of your time. It is a well-argued case against a technology, written right at the peak of everyone\'s excitement about it, by someone capable and fair, not hostile. Reading one changes how you read all the confident, hopeful reports that come after.',
    resourceIds: ['r-lighthill']
  }
}
