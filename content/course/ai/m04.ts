import type { Module } from './types'

export const M04: Module = {
  id: 'm04', n: '04', accent: 'var(--muted)',
  title: 'The winters',
  intro: 'Twice, this field collapsed. Funding stopped, companies died, and researchers removed the words "artificial intelligence" from their grant applications to get them funded. This is the shortest module of the day and, if you take one thing from it into your working life, probably the most useful.',
  objectives: [
    'Describe what caused the first AI winter and what the Lighthill Report actually argued.',
    'Describe the commercial collapse of the expert-systems industry in the late 1980s.',
    'Identify the repeating pattern: demo, extrapolation, funding, plateau, collapse.',
    'Apply that pattern as a diagnostic to a current claim.'
  ],
  lessons: [
    {
      id: 'm04l1', title: 'The first winter', minutes: 8, completion: 'read',
      summary: '1966 to 1980: promises meet combinatorics.',
      blocks: [
        { type: 'text', lead: true, body: [
          'The first collapse followed a decade of genuine progress and considerably more than a decade of confident forecasting. Two documents did most of the damage, and both were, on the evidence available, correct.',
          'In 1966 a US advisory committee reported on machine translation. Ten years of funding had produced systems that were slower, less accurate and more expensive than human translators. The report was blunt about it, and American machine-translation funding largely stopped for two decades.',
          'In 1973 the UK Science Research Council asked the mathematician James Lighthill to survey AI research. His report found that the field\'s methods worked on carefully chosen small problems and showed no sign of scaling to real ones — the combinatorial explosion from the last module, stated as a policy finding. Almost all British AI funding was withdrawn.'
        ] },
        { type: 'evidence', confidence: 'high', sourceId: 's-lighthill',
          claim: 'The 1973 Lighthill Report criticised AI for failing to scale beyond toy problems, and was followed by substantial cuts to UK AI funding.',
          basis: 'Primary source: the report itself, available in full online. The causal link to the funding cuts is the standard historical account and is well attested, though as with any policy history the counterfactual cannot be tested.' },
        { type: 'text', body: [
          'What makes this era instructive is not that the optimists were fools. It is the specific shape of their error. Programs had solved problems in small, tidy domains — a table-top world of coloured blocks, a puzzle with nine tiles. Researchers reasoned that scaling to the real world was a matter of degree: more rules, more memory, more time.',
          'It was not a matter of degree. The real world is not a bigger blocks world; it is a different kind of thing, with no clean state description and no enumerable move list. Nobody had a way to notice that from inside the blocks world, and the demos looked wonderful.'
        ] },
        { type: 'video', videoId: 'v-lighthill' },
        { type: 'takeaway', title: 'The transferable lesson', body: 'A demo in a constrained environment tells you the method works in that environment. It tells you nothing about whether the environment can be relaxed. Ask what was held fixed — and notice how rarely that question is answered in a launch announcement.' }
      ]
    },
    {
      id: 'm04l2', title: 'The second winter', minutes: 7, completion: 'check',
      summary: '1987 to 1993: the commercial bust.',
      blocks: [
        { type: 'text', body: [
          'The second collapse was commercial rather than intellectual, and it was faster.',
          'The expert-systems boom of the early 1980s had produced an industry, including companies selling specialised hardware built to run Lisp. That hardware was genuinely faster at the job — until ordinary workstations from Sun and Apollo, and then commodity desktop machines, became fast enough to run the same software. The specialised market did not shrink; it evaporated, reportedly within a couple of years.',
          'At the same time the maintenance problem from module 3 arrived on schedule. Companies that had installed rule-based systems found the cost of keeping them current rising faster than the value they returned. Japan\'s ambitious Fifth Generation Computer Systems project, launched in 1982 with substantial state funding and a decade-long horizon, ended without producing the general capabilities it had targeted.',
          'By the early 1990s the phrase "artificial intelligence" had become a liability in a funding proposal. Researchers wrote "machine learning", "informatics", "knowledge-based systems", "pattern recognition" — anything but the name. The work continued under other labels, which is worth knowing: a winter is a collapse in confidence and money, not necessarily in progress.'
        ] },
        { type: 'video', videoId: 'v-lisp-bust' },
        { type: 'compare', caption: 'Two winters, one shape',
          columns: ['', 'First winter', 'Second winter'],
          rows: [
            ['Roughly', '1974–1980', '1987–1993'],
            ['What was oversold', 'General problem solving and machine translation', 'Rule-based expert systems and specialised AI hardware'],
            ['What broke it', 'Combinatorial explosion; methods that would not scale', 'Commodity hardware caught up; maintenance costs outran value'],
            ['Trigger', 'Government reviews withdrawing funding', 'A market collapsing on its own'],
            ['What survived', 'Search, planning and logic, absorbed into ordinary computer science', 'Rule engines, absorbed into ordinary enterprise software']
          ] },
        { type: 'check', questions: [
          { id: 'q0401', kind: 'mcq', difficulty: 'moderate', objective: 'Explain major stages',
            stem: 'What most directly destroyed the specialised AI hardware market in the late 1980s?',
            options: [
              'General-purpose workstations became fast enough to run the same software',
              'Expert systems were shown to be inaccurate',
              'Neural networks replaced them',
              'Governments banned the technology'
            ], answer: [0],
            rationale: 'It was a commodity-hardware story, not an AI story. The specialised machines\' entire value was speed at one task, and that advantage disappeared. Note how little this has to do with whether the AI worked.',
            distractors: {
              1: 'Accuracy inside their domains was reasonable. The problems were maintenance cost and brittleness at the edges.',
              2: 'Neural networks were themselves in the doldrums; their revival came much later.',
              3: 'No such ban occurred.'
            } }
        ] }
      ]
    },
    {
      id: 'm04l3', title: 'The pattern, and how to use it', minutes: 10, completion: 'activity',
      summary: 'A five-stage cycle you can apply to a claim made this week.',
      blocks: [
        { type: 'text', lead: true, body: [
          'Strip the two winters down and the same five stages appear. They also appear in the perceptron boom of 1958, which you will meet in module 6, and — this is the uncomfortable part — they are visible in aspects of the present.',
          'Naming the stages is not cynicism. Real capability was created in every one of these cycles, and it persisted after each collapse. The purpose of the pattern is to let you hold two things at once: this is genuinely useful, *and* the timeline being sold to me is probably wrong.'
        ] },
        { type: 'process', caption: 'The five-stage cycle', steps: [
          { label: 'A real result', body: 'Something genuinely works, usually in a constrained setting. This part is not fake, and dismissing it is the sceptic\'s version of the same error.' },
          { label: 'Extrapolation', body: 'The result is projected forward on the assumption that the remaining difficulty is proportional to the difficulty already overcome. It almost never is: the last 10% of a capability routinely costs more than the first 90%.' },
          { label: 'Money', body: 'Funding arrives, priced against the extrapolation rather than the result. Timelines are set by investment horizons rather than by research.' },
          { label: 'The plateau', body: 'Progress continues, but along a different curve than the one that was sold. The gap between the promise and the product becomes visible to people outside the field.' },
          { label: 'Correction', body: 'Money leaves, quickly. The underlying capability does not vanish — it gets absorbed into ordinary software and stops being called AI. See the AI effect from module 1.' }
        ] },
        { type: 'sort',
          prompt: 'Here are five statements a technology might attract. Sort each by which stage of the cycle it belongs to. The skill is separating the reported result from the projection attached to it.',
          buckets: ['A real result', 'An extrapolation', 'A correction signal'],
          items: [
            { text: '"The system scored 92% on the benchmark, up from 71% last year."', bucket: 0, why: 'A measurement with a comparison. Whether the benchmark matters is a separate question, but this is a result, not a forecast.' },
            { text: '"At this rate, the task will be fully automated within two years."', bucket: 1, why: 'A projection from a trend, assuming the remaining work resembles the completed work. This is stage 2, and it is where almost all the error enters.' },
            { text: '"Three companies in the sector have quietly stopped publishing progress updates."', bucket: 2, why: 'Silence after a period of loud announcements is one of the earliest and most reliable correction signals.' },
            { text: '"Deployment took nine months longer than planned and required two extra engineers."', bucket: 2, why: 'The plateau showing up as schedule and cost. It usually appears in delivery reports long before it appears in the press.' },
            { text: '"A pilot with 40 users reduced handling time by 18%."', bucket: 0, why: 'A result, and a well-specified one. Note the sample size — small, honest, and far more informative than a claim with no number at all.' }
          ] },
        { type: 'practice', title: 'Claim log, entry two',
          steps: [
            'Reopen the claim log you started in module 1.',
            'Add a new entry for any AI claim you have seen in the last month — ideally one you found persuasive.',
            'Separate it into two columns: the reported result, and the projection attached to it.',
            'For the projection, write down what would have to be true for it to hold. Be specific: what problem must be solved, by when, at what cost?',
            'Note your own confidence in that projection, and say why.'
          ],
          output: 'A second log entry in which the result and the extrapolation are physically separated on the page. That separation is the whole skill.' },
        { type: 'reflect', minWords: 30,
          prompt: 'Both winters were preceded by people making honest forecasts that turned out badly wrong. What would have had to happen for them to catch their own error earlier?',
          hint: 'Think about what evidence would have counted against them, and whether anyone was collecting it.' }
      ]
    }
  ],
  extension: {
    title: 'Read a good negative assessment',
    body: 'The Lighthill Report is worth twenty minutes because it is a well-argued case against a technology at its peak of enthusiasm, written by someone competent and not hostile. Reading one changes how you read the confident ones.',
    resourceIds: ['r-lighthill']
  }
}
