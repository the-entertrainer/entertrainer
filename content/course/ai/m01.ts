import type { Module } from './types'

export const M01: Module = {
  id: 'm01', n: '01', accent: 'var(--blue)',
  title: 'What we are actually talking about',
  intro: 'People use the term "AI" to mean six different things. Most arguments about AI happen because two people are using two different meanings. In this module, you will learn the six meanings. Then you will be able to say which one you mean, and hear which one someone else means.',
  objectives: [
    'Define artificial intelligence in a way you can defend.',
    'Explain how machine learning, deep learning and generative AI fit inside each other.',
    'Explain why the meaning of "AI" keeps changing, and why that matters.',
    'Use a five-question test on any AI claim you hear.'
  ],
  lessons: [
    {
      id: 'm01l1', title: 'The word that means six things', minutes: 8, completion: 'check',
      summary: 'Why there is no single agreed definition, and what to do about it.',
      blocks: [
        { type: 'text', lead: true, body: [
          'There is no single agreed definition of artificial intelligence. This has been true since the term was invented in 1955. It is not something you are missing. It is how the field actually is.',
          'The people who invented the term defined AI as making a machine "behave in ways that would be called intelligent if a human were so behaving". Look closely at that sentence. It defines the machine by comparing it to us. It defines intelligence by what an observer would call it. Both parts have been argued about ever since.'
        ] },
        { type: 'tabs', items: [
          { label: 'As a goal', body: 'AI is the goal of building machines that do things we would call thinking if a human did them. This is the 1955 meaning. It describes a research goal, not a product. By this meaning, nothing has "achieved AI" yet. There is only more or less progress.' },
          { label: 'As a field', body: 'AI is a school subject. It has conferences, journals and university departments. It includes search algorithms, logic, planning, robotics, machine learning, and more. A university AI course covers many things that have nothing to do with chatbots.' },
          { label: 'As a technique', body: 'In business, "AI" usually means one family of methods: neural networks trained on large amounts of data. When a company says "our product uses AI", this is almost always what they mean. It is a smaller claim than it sounds.' },
          { label: 'As a product', body: 'A chat assistant. An image generator. A recommendation feed. Most people meet "AI" as a product. A product usually combines several techniques with a lot of ordinary software. The interface you see is not the intelligence.' },
          { label: 'As a marketing word', body: 'A label put on software to make it sound more valuable. This use has no technical meaning at all. It is common enough that "does this actually use machine learning?" is always a fair first question.' },
          { label: 'As a story', body: 'The idea of AI from films and books — HAL, Skynet, a mind in a machine. This meaning shapes what people expect more than any other meaning. It is also the furthest from what real systems actually do.' }
        ] },
        { type: 'takeaway', title: 'The working definition for today', body: 'Artificial intelligence is the effort to make computers do tasks that normally need human judgement, perception or language. In current practice, it also means the specific family of statistical methods that works best at this. You need both parts of that sentence. The first part explains the history. The second part explains what exists today.' },
        { type: 'video', videoId: 'v-ai-landscape' },
        { type: 'check', title: 'Check yourself', questions: [
          { id: 'q0101', kind: 'mcq', difficulty: 'easy', objective: 'Define AI',
            stem: 'A software company calls its scheduling tool "AI-powered". What is the most useful question to ask first?',
            options: [
              'Which machine learning technique does it use, and what data was it trained on?',
              'Is the AI conscious?',
              'Does it pass the Turing test?',
              'How many parameters does it have?'
            ], answer: [0],
            rationale: '"AI-powered" is a marketing term, not a technical one. Asking about the technique and the data turns a slogan into a claim you can check. Often the honest answer is "a set of rules we wrote by hand". That is fine, but it is not machine learning.',
            distractors: {
              1: 'No current system is claimed to be conscious. A vendor could not give you a checkable answer to this.',
              2: 'The Turing test does not evaluate products. Passing a conversation test says nothing about scheduling.',
              3: 'Parameter count is a real number, but it is a poor measure of usefulness. Most business software has no parameters at all.'
            } },
          { id: 'q0102', kind: 'tf', difficulty: 'easy', objective: 'Define AI',
            stem: 'True or false: researchers agree on one technical definition of "artificial intelligence".',
            options: ['True', 'False'], answer: [1],
            rationale: 'False. There is no agreed definition, and there never has been. The word is used for a goal, a field, a technique and a product. Knowing which one you mean matters more than any dictionary definition.' }
        ] }
      ]
    },
    {
      id: 'm01l2', title: 'Four circles, not one', minutes: 9, completion: 'check',
      summary: 'How AI, machine learning, deep learning and generative AI actually nest.',
      blocks: [
        { type: 'text', body: [
          'You will hear four terms most often: AI, machine learning, deep learning, and generative AI. They are not the same thing, and they are not separate things either. Each one sits inside the last. Learning this one picture removes about half the confusion in the subject.'
        ] },
        { type: 'labeled', caption: 'The nesting, from outside in',
          parts: [
            { label: 'Artificial intelligence', body: 'The whole field. This includes methods with no learning at all — a chess engine using pure search, a planner solving a logistics problem, a rule-based medical adviser. All of these are AI. None of them are machine learning.' },
            { label: 'Machine learning', body: 'One part of AI. These are systems that get better at a task by being shown data, instead of being given rules. This includes many methods that are not neural networks — decision trees, support vector machines, linear regression.' },
            { label: 'Deep learning', body: 'One part of machine learning. It uses neural networks with many layers. This is the part that took off after 2012. Almost everything you have heard about recently is deep learning.' },
            { label: 'Generative AI', body: 'One part of deep learning. These models produce new content — text, images, audio, video — instead of a label or a number. ChatGPT and image generators are generative AI. It is the smallest circle. It is also the one most people mean when they say "AI".' }
          ] },
        { type: 'match', prompt: 'Match each term to what actually makes it different. Do not just repeat the words above.', pairs: [
          { left: 'Artificial intelligence', right: 'The whole field — includes methods with no learning at all', why: 'A chess engine using pure search is AI. It never learns from data.' },
          { left: 'Machine learning', right: 'Gets better from data, instead of from rules', why: 'Decision trees and linear regression are machine learning with no neural network at all.' },
          { left: 'Deep learning', right: 'Machine learning that uses neural networks with many layers', why: 'This is the part that took off after 2012. Module 7 covers what happened next.' },
          { left: 'Generative AI', right: 'Produces new content — text, images, audio, video — not a label or a number', why: 'The smallest circle. It is what most people actually mean by "AI".' }
        ] },
        { type: 'evidence', confidence: 'high', claim: 'Generative AI is part of deep learning. Deep learning is part of machine learning. Machine learning is part of artificial intelligence.',
          basis: 'This is the standard way the relationship is described in textbooks, industry documentation and Google\'s public machine learning glossary. It is a definition, not a measurement, so it is not disputed.', sourceId: 's-chm' },
        { type: 'flashcards', title: 'Say it before you see it', cards: [
          { front: 'A spam filter trained on a million labelled emails', back: 'Machine learning. Probably not deep learning — older, simpler methods still do this well and cheaply.' },
          { front: 'A chess engine searching millions of positions', back: 'AI, but not machine learning. It searches and evaluates using rules written by people.' },
          { front: 'A model that writes a poem from a prompt', back: 'Generative AI. This means it is also deep learning, machine learning, and AI — all four at once.' },
          { front: 'A thermostat that turns on below 18°C', back: 'None of the four. It is a simple rule. Not everything automated is AI. Calling it AI makes the word meaningless.' },
          { front: 'A model that predicts protein structure', back: 'Deep learning, but not generative in the everyday sense. Its output is a structure, not something a person reads.' }
        ] },
        { type: 'check', questions: [
          { id: 'q0103', kind: 'mrq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
            stem: 'Which statements about AI, machine learning, deep learning and generative AI are true? Select all that apply.',
            options: [
              'Every generative AI system is also a machine learning system.',
              'Every AI system is a machine learning system.',
              'Deep learning is one approach to machine learning, not the only one.',
              'A system can be AI without learning from data.'
            ], answer: [0, 2, 3],
            rationale: 'The circles nest inward. Anything in an inner circle is also in every outer circle. The reverse is not true. Plenty of AI has no learning at all, and plenty of machine learning does not use neural networks.',
            distractors: { 1: 'This states the nesting backwards. Search, logic and planning are all AI, and none of them learn from data.' } },
          { id: 'q0104', kind: 'fitb', difficulty: 'easy', objective: 'Distinguish AI approaches',
            stem: 'Fill in the blank: the part of machine learning that uses neural networks with many layers is called ___.',
            options: [], answer: [], blankAnswers: ['deep learning'],
            rationale: 'Deep learning. It is the third circle from the outside — machine learning, narrowed to networks with many layers. This is the part that took off after 2012.' }
        ] }
      ]
    },
    {
      id: 'm01l3', title: 'Why the goalposts keep moving', minutes: 6, completion: 'read',
      summary: 'The AI effect, and what it does to every claim about progress.',
      blocks: [
        { type: 'text', body: [
          'This field has a repeating pattern. As soon as a problem is solved, people stop calling it intelligence.',
          'For decades, playing chess at grandmaster level was the standard example of machine intelligence. A machine did it in 1997. Within a few years, people called chess "just search". The same thing happened with reading handwriting, recognising faces, translating languages, and holding a conversation. Each one was once the hardest problem in AI. Each one became "just pattern matching" once a machine could do it.',
          'This is called the AI effect. It works two ways. It makes the field look like it never succeeds, because every success gets renamed. It also protects us from a real mistake: assuming that because a machine did one impressive thing, it has the same general ability a person would have if they did that thing.'
        ] },
        { type: 'quote', text: 'As soon as it works, no one calls it AI any more.',
          attribution: 'A remark attributed to John McCarthy, who coined the term "artificial intelligence" in 1955',
          source: 'Widely quoted. The exact wording changes between retellings, so treat this as a paraphrase, not an exact quote.' },
        { type: 'text', body: [
          'Here is why this matters to you. When you read that a system "achieved human-level performance" at something, that sentence is doing two jobs. First, it reports a measurement on one specific task. Second, it invites you to assume a general ability. The measurement is usually true. The general ability usually is not. The rest of this course trains you to tell the two apart.'
        ] },
        { type: 'reflect', minWords: 25,
          prompt: 'Name one thing computers now do every day that would have seemed like science fiction ten years ago. Do you think of it as "AI"? Why or why not?',
          hint: 'There is no right answer. The goal is to notice yourself doing the renaming, while you do it.' }
      ]
    },
    {
      id: 'm01l4', title: 'The five questions', minutes: 9, completion: 'activity',
      summary: 'The evaluation habit you will use for the rest of the course.',
      blocks: [
        { type: 'text', lead: true, body: [
          'This is the most useful thing in the whole course. It comes in the first hour on purpose. Everything after this gives you more practice using it.',
          'When you meet a claim about an AI system — in a press release, a news story, a demo, a sales call — five questions will tell you most of what you need to know.'
        ] },
        { type: 'accordion', title: 'The five questions, and why each one matters', items: [
          { q: '1. What exactly was measured?', a: 'Not "it is good at medicine" — look for "it scored X on this specific test". A capability claim with no measurement is an advertisement. Once you have the measurement, ask what it leaves out. A model that passes a medical exam was tested on questions with known answers. That is not the hard part of medicine.' },
          { q: '2. Compared to what?', a: 'Better than the last version? Better than an average person? Better than an expert with time to think? "Human-level" means nothing unless you know which human, doing what task, under what conditions. Many headline comparisons use a rushed person with no help.' },
          { q: '3. Who is telling me, and what do they gain?', a: 'A company publishing its own test result has an interest in the outcome. This does not make the result false — companies do publish real results. But it means they chose the framing, the comparison, and what to leave out. Look for someone independent repeating the test. That usually takes months after the announcement.' },
          { q: '4. Is this a demo or a real deployment?', a: 'A demo shows the best case, filmed once, with mistakes removed. A deployment is what happens on an ordinary day with real users and messy input. The gap between the two causes more disappointment than anything else in this field, especially in robotics.' },
          { q: '5. What does failure look like, and would I notice it?', a: 'Ask what the system does when it gets something wrong. Does it say "I don\'t know"? Or does it give a confident, well-formatted, wrong answer? For most language systems today, it is the second one. This means the failure is invisible to someone who does not already know the answer — and that is a property of the system, not a mistake by the user.' }
        ] },
        { type: 'scenario',
          setup: 'A vendor demos a tool to your team. It reads a 40-page policy document and answers questions about it correctly, live, in seconds. The room is impressed. Your director asks what you think.',
          question: 'What is the most useful thing to say next?',
          choices: [
            { text: '"Can we run it on our own document, one we choose, right now?"', verdict: 'best',
              feedback: 'This is correct, and it costs nothing. The demo document was likely tested in advance. A new document from your own work turns a demo into a real test. Watch especially for confident answers to questions the document does not actually cover.' },
            { text: '"What model is it built on?"', verdict: 'workable',
              feedback: 'A fair question, and worth knowing. But it does not tell you if the tool works for your task. A strong model can still sit inside a weak product.' },
            { text: '"This is impressive — let\'s pilot it."', verdict: 'poor',
              feedback: 'You have seen a best case, shown by someone who wants to sell it to you. That is some evidence, but not proof it fits your work. Run a five-minute test on your own material first, then pilot it.' },
            { text: '"Language models hallucinate, so I don\'t trust it."', verdict: 'poor',
              feedback: 'This is true in general, and useless as an evaluation. Every system in this category can do this. The real question is whether this tool\'s error rate is acceptable for this specific task. Refusing to look is as unhelpful as blind trust.' }
          ] },
        { type: 'practice', title: 'Set up your claim log',
          steps: [
            'Open a note, a document, or a page in a notebook. Title it "AI claims — evidence log".',
            'Write the five questions above as five headings.',
            'Find one AI claim right now — a headline, a product page, a social media post, an advert.',
            'Answer as many of the five questions as you can from the source. Where you cannot answer, write "not stated".',
            'Count how many times you wrote "not stated". That count is your first quality signal, and it is a good one.'
          ],
          output: 'One completed claim log entry. You will add two more today, in module 7 and module 10. Together they become the material for your capstone.' },
        { type: 'resource', title: 'Keep these open all day', resourceIds: ['r-ml-glossary', 'r-ai-index'] }
      ]
    }
  ],
  extension: {
    title: 'If you want the definitional argument in full',
    body: 'Philosophers have argued about what would count as machine intelligence for as long as engineers have tried to build it. The arguments are better than you might expect. The Stanford Encyclopedia entries are the serious version of this module.',
    resourceIds: ['r-ai-sep', 'r-turing-sep']
  }
}
