import type { Module } from './types'

export const M01: Module = {
  id: 'm01', n: '01', accent: 'var(--blue)',
  title: 'What we are actually talking about',
  intro: 'Before any history, one hour on the word itself. "AI" is used for six different things, and most bad arguments about it are two people using two of the six. By the end of this module you will be able to hear which one someone means — and say which one you mean.',
  objectives: [
    'Define artificial intelligence in a way that survives contact with a sceptic.',
    'Place machine learning, deep learning and generative AI correctly inside each other.',
    'Explain why the boundary of "AI" keeps moving, and what that does to claims about it.',
    'Apply a five-question test to any AI claim you meet for the rest of the day.'
  ],
  lessons: [
    {
      id: 'm01l1', title: 'The word that means six things', minutes: 8, completion: 'check',
      summary: 'Why there is no single agreed definition, and what to do about it.',
      blocks: [
        { type: 'text', lead: true, body: [
          'There is no settled definition of artificial intelligence. That is not a gap in your knowledge — it is a genuine feature of the field, and it has been true since the name was invented in 1955.',
          'The founding proposal defined the work as making a machine "behave in ways that would be called intelligent if a human were so behaving". Notice what that sentence does: it defines the machine by reference to us, and it defines intelligence by reference to observers. Both halves have been argued about ever since.'
        ] },
        { type: 'tabs', items: [
          { label: 'As a goal', body: 'AI is the ambition of building machines that do things which, in humans, we would call thinking. This is the sense the 1955 proposal used. It is a research programme, not a product, and by this definition nothing has "achieved AI" — you either make progress or you do not.' },
          { label: 'As a field', body: 'AI is an academic discipline with conferences, journals and departments. In this sense "AI" includes search algorithms, logic, planning, robotics, machine learning and much else. A university AI course covers material that has nothing to do with what a chatbot does.' },
          { label: 'As a technique', body: 'In industry, "AI" usually means a specific family of statistical methods — mostly neural networks trained on large datasets. When a vendor says "our product uses AI", this is almost always what they mean, and it is a much narrower claim than it sounds.' },
          { label: 'As a product', body: 'A chat assistant, an image generator, a recommendation feed. Most people\'s daily contact with "AI" is with a product, and products bundle several techniques plus a great deal of ordinary software. The interface is not the intelligence.' },
          { label: 'As a marketing word', body: 'A label applied to software to raise its price or its funding. This use has no technical content at all, and it is common enough that "is there any machine learning in this at all?" is a reasonable first question.' },
          { label: 'As a story', body: 'The cultural idea of AI — HAL, Skynet, a mind in a box. This one shapes public expectation more than any of the others, and it is the one furthest from what current systems are.' }
        ] },
        { type: 'takeaway', title: 'The working definition for today', body: 'Artificial intelligence is the effort to get computers to perform tasks that normally require human judgement, perception or language — and, in current practice, the family of statistical methods that has turned out to work best at it. Both halves of that sentence matter. Drop the first and you cannot explain the history. Drop the second and you cannot explain the present.' },
        { type: 'video', videoId: 'v-ai-landscape' },
        { type: 'check', title: 'Check yourself', questions: [
          { id: 'q0101', kind: 'mcq', difficulty: 'easy', objective: 'Define AI',
            stem: 'A software company describes its scheduling tool as "AI-powered". What is the most useful first question?',
            options: [
              'Which machine learning technique does it use, and on what data was it trained?',
              'Is the AI conscious?',
              'Does it pass the Turing test?',
              'How many parameters does it have?'
            ], answer: [0],
            rationale: '"AI-powered" is a marketing category, not a technical one. Asking which technique and which data converts a slogan into a claim that can be checked — and quite often the honest answer is "a set of rules we wrote by hand", which is fine, but is not machine learning.',
            distractors: {
              1: 'Consciousness is not a property any current system is claimed to have, and no vendor answer to this would be checkable.',
              2: 'The Turing test is not a product-evaluation tool, and passing a conversational test says nothing about scheduling quality.',
              3: 'Parameter count is a real number but a poor proxy for usefulness, and most business software has no parameters at all.'
            } },
          { id: 'q0102', kind: 'tf', difficulty: 'easy', objective: 'Define AI',
            stem: 'True or false: there is an agreed technical definition of "artificial intelligence" that researchers use consistently.',
            options: ['True', 'False'], answer: [1],
            rationale: 'There is not, and there never has been. Definitions vary between the goal, the field, the technique and the product. This is why precision about which sense you mean is worth more than a dictionary.' }
        ] }
      ]
    },
    {
      id: 'm01l2', title: 'Four circles, not one', minutes: 9, completion: 'check',
      summary: 'How AI, machine learning, deep learning and generative AI actually nest.',
      blocks: [
        { type: 'text', body: [
          'The four terms you will hear most are not synonyms and they are not siblings. They sit inside one another. Getting this picture right removes about half the confusion in the subject.'
        ] },
        { type: 'labeled', caption: 'The nesting, from outside in',
          parts: [
            { label: 'Artificial intelligence', body: 'The whole field. Includes approaches that involve no learning at all — a chess engine doing pure search, a planner solving a logistics problem, a rule-based medical adviser. All AI, none of it machine learning.' },
            { label: 'Machine learning', body: 'A subset: systems that improve at a task by being shown data rather than by being given rules. Includes many methods that are not neural networks at all — decision trees, support vector machines, linear regression.' },
            { label: 'Deep learning', body: 'A subset of machine learning using neural networks with many layers. This is the part that took off after 2012, and almost everything you have heard about since is here.' },
            { label: 'Generative AI', body: 'A subset of deep learning: models whose output is new content — text, images, audio, video — rather than a label or a number. ChatGPT and image generators live here. It is the smallest circle, and it is the one most people mean by "AI".' }
          ] },
        { type: 'match', prompt: 'Pair each term with what actually distinguishes it — not a restatement, the thing above does not say.', pairs: [
          { left: 'Artificial intelligence', right: 'The whole field — includes approaches with no learning at all', why: 'A chess engine doing pure search is AI, and it never learns from data.' },
          { left: 'Machine learning', right: 'Improves by being shown data, rather than by being given rules', why: 'Decision trees and linear regression are machine learning with no neural network involved.' },
          { left: 'Deep learning', right: 'Machine learning using neural networks with many layers', why: 'The subset that took off after 2012 — module 7 is entirely about what happened next.' },
          { left: 'Generative AI', right: 'Output is new content — text, images, audio, video — not a label or a number', why: 'The smallest circle, and the one most people actually mean when they say "AI".' }
        ] },
        { type: 'evidence', confidence: 'high', claim: 'Generative AI is a subset of deep learning, which is a subset of machine learning, which is a subset of artificial intelligence.',
          basis: 'This nesting is the standard framing used in textbooks, in industry documentation and in Google\'s public ML glossary. It is definitional rather than empirical, so it is not in dispute.', sourceId: 's-chm' },
        { type: 'flashcards', title: 'Say it before you see it', cards: [
          { front: 'A spam filter trained on a million labelled emails', back: 'Machine learning. Probably not deep learning — classical methods still do this well and cheaply.' },
          { front: 'A chess engine searching millions of positions', back: 'AI, but not machine learning. It is search and evaluation, with rules written by people.' },
          { front: 'A model that writes a poem from a prompt', back: 'Generative AI — therefore also deep learning, machine learning and AI. All four circles at once.' },
          { front: 'A thermostat that turns on below 18°C', back: 'None of them. It is a rule. Not everything automated is AI, and calling it AI is how the word loses meaning.' },
          { front: 'A model that predicts protein structure', back: 'Deep learning, not generative in the everyday sense — its output is a structure, not content for a human to read.' }
        ] },
        { type: 'check', questions: [
          { id: 'q0103', kind: 'mrq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
            stem: 'Which of these are true of the AI / ML / deep learning / generative AI relationship? Select all that apply.',
            options: [
              'Every generative AI system is also a machine learning system.',
              'Every AI system is a machine learning system.',
              'Deep learning is one approach to machine learning, not the only one.',
              'A system can be AI without learning from data.'
            ], answer: [0, 2, 3],
            rationale: 'The circles nest inward, so anything in an inner circle is in every outer one — but not the reverse. Plenty of AI involves no learning at all, and plenty of machine learning uses no neural networks.',
            distractors: { 1: 'This is the reverse of the nesting. Search, logic and planning are all AI and none of them learn from data.' } },
          { id: 'q0104', kind: 'fitb', difficulty: 'easy', objective: 'Distinguish AI approaches',
            stem: 'Fill in the blank: the subset of machine learning that uses neural networks with many layers is called ___.',
            options: [], answer: [], blankAnswers: ['deep learning'],
            rationale: 'Deep learning is the third circle in from the outside — machine learning, narrowed to networks with many layers. It is the part of the nesting that took off after 2012.' }
        ] }
      ]
    },
    {
      id: 'm01l3', title: 'Why the goalposts keep moving', minutes: 6, completion: 'read',
      summary: 'The AI effect, and what it does to every claim about progress.',
      blocks: [
        { type: 'text', body: [
          'There is a recurring pattern in this field, old enough to have a name: as soon as a problem is solved, it stops counting as intelligence.',
          'Playing chess at grandmaster level was, for decades, the standard example of machine intelligence. A machine did it in 1997, and within a few years chess was reclassified as "just search". Reading handwriting, recognising faces, translating between languages, holding a conversation — each was once the frontier, and each became, on arrival, "just pattern matching".',
          'This is sometimes called the AI effect, and it cuts both ways. It makes the field look like it never succeeds, because every success is renamed. It also protects us from a real error — the assumption that because a machine did one impressive thing, it must have the general capability we would infer if a person had done it.'
        ] },
        { type: 'quote', text: 'As soon as it works, no one calls it AI any more.',
          attribution: 'A remark attributed to John McCarthy, who coined the term "artificial intelligence" in 1955',
          source: 'Widely quoted; the exact wording varies between retellings, so treat the phrasing as paraphrase rather than transcript.' },
        { type: 'text', body: [
          'The practical consequence for you: when you read that a system "achieved human-level performance" at something, the sentence is doing two jobs at once. It is reporting a measurement on a specific task, and it is inviting you to infer a general capability. The first is usually true. The second usually is not, and the whole rest of this course is training for telling them apart.'
        ] },
        { type: 'reflect', minWords: 25,
          prompt: 'Think of one thing computers do routinely today that would have seemed like science fiction to you ten years ago. Do you think of it as "AI" now? Why or why not?',
          hint: 'There is no right answer here. The point is to catch yourself doing the reclassification in real time.' }
      ]
    },
    {
      id: 'm01l4', title: 'The five questions', minutes: 9, completion: 'activity',
      summary: 'The evaluation habit you will use for the rest of the course.',
      blocks: [
        { type: 'text', lead: true, body: [
          'This is the most practically useful thing in the course, and it arrives in the first hour on purpose. Everything after this is material to practise it on.',
          'Whenever you meet a claim about an AI system — in a press release, a news story, a demo, a sales call — five questions will tell you most of what you need to know.'
        ] },
        { type: 'accordion', title: 'The five questions, and why each one earns its place', items: [
          { q: '1. What exactly was measured?', a: 'Not "it is good at medicine" but "it scored X on this specific test set". A capability claim without a measurement is an advertisement. And when you have the measurement, ask what it leaves out — a model that passes a medical exam has been tested on questions with known answers, which is not the hard part of medicine.' },
          { q: '2. Compared to what?', a: 'Better than the previous version? Better than an average human? Better than an expert with time and references? "Human-level" is meaningless without saying which human, doing the task under what conditions. Many headline comparisons put a model against a rushed, unaided person.' },
          { q: '3. Who is telling me, and what do they gain?', a: 'A lab publishing its own benchmark result is a primary source with an interest. That does not make it wrong — labs publish real results — but it means the framing, the choice of comparison and the omissions are all theirs. Independent replication is the thing to look for, and it usually lags months behind the announcement.' },
          { q: '4. Is this a demo or a deployment?', a: 'A demo is a best case, filmed once, with the failures cut. A deployment is what happens on a Tuesday with real users and messy inputs. The gap between the two is the single largest source of disappointment in this field, and it is largest of all in robotics.' },
          { q: '5. What would failure look like, and would I see it?', a: 'Ask what the system does when it is wrong. Does it say "I don\'t know", or does it produce a confident, well-formatted, incorrect answer? For most current language systems the answer is the second one, which makes the failure mode invisible to a non-expert — and that is a property of the system, not of the user.' }
        ] },
        { type: 'scenario',
          setup: 'A vendor demos a tool to your team. In the demo, it reads a 40-page policy document and answers questions about it correctly, live, in seconds. The room is impressed. Your director asks what you think.',
          question: 'What is the most useful thing to say next?',
          choices: [
            { text: '"Can we run it on our own document, one we choose, right now?"', verdict: 'best',
              feedback: 'Correct, and it costs nothing. A demo document has usually been tested against; an unseen document from your own domain converts a demo into a small experiment. Watch particularly for confident answers to questions the document does not actually address.' },
            { text: '"What model is it built on?"', verdict: 'workable',
              feedback: 'A fair question and worth knowing, but it does not tell you whether the tool works for your task. Strong underlying models are wrapped in weak products all the time.' },
            { text: '"This is impressive — let\'s pilot it."', verdict: 'poor',
              feedback: 'You have seen a best case presented by an interested party. That is evidence of something, but not of fitness for your work. A pilot is the right eventual step, after an unseen-input test that costs five minutes.' },
            { text: '"Language models hallucinate, so I don\'t trust it."', verdict: 'poor',
              feedback: 'True as a general fact, and useless as an evaluation. Every system in this category has that property; the question is whether this one\'s error rate and failure mode are acceptable for this task. Blanket scepticism is as unhelpful as blanket enthusiasm.' }
          ] },
        { type: 'practice', title: 'Set up your claim log',
          steps: [
            'Open a note, a document, or a page in a notebook. Title it "AI claims — evidence log".',
            'Make five headings from the five questions above.',
            'Find one AI claim in the wild right now — a headline, a product page, a LinkedIn post, an advert.',
            'Answer as many of the five questions as the source allows. Where you cannot answer, write "not stated".',
            'Count the "not stated" entries. That count is your first, crude, and surprisingly reliable quality signal.'
          ],
          output: 'One completed claim log entry. You will add to it twice more today — in module 7 and in module 10 — and it becomes the raw material for your capstone.' },
        { type: 'resource', title: 'Keep these open all day', resourceIds: ['r-ml-glossary', 'r-ai-index'] }
      ]
    }
  ],
  extension: {
    title: 'If you want the definitional argument properly',
    body: 'Philosophers have been fighting about what would count as machine intelligence for as long as engineers have been building it, and the arguments are better than you might expect. The Stanford Encyclopedia entries are the serious version of this module.',
    resourceIds: ['r-ai-sep', 'r-turing-sep']
  }
}
