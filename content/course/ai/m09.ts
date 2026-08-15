import type { Module } from './types'

export const M09: Module = {
  id: 'm09', n: '09', accent: 'var(--blue)',
  title: 'Generative, multimodal, agentic, embodied',
  intro: 'This module covers four ways that AI systems go beyond plain text, and each one can fail in its own way. Image generators use a method that is completely different from text generation. Agents can take actions, not just write text, and that changes how risky a mistake can be. Robots have a physical body, and the real world does not forgive mistakes the way a screen does. But in one area — predicting the shape of proteins — the results really are as good as people say.',
  objectives: [
    'Explain how diffusion models create images, and why this is different from how text models write.',
    'Describe what "multimodal" means, and what it does not promise.',
    'Explain what agents, tool use and retrieval are, and what each one fixes and does not fix.',
    'Judge a claim about robots or science AI by looking at real evidence, not just demo footage.'
  ],
  lessons: [
    {
      id: 'm09l1', title: 'Images: a completely different method', minutes: 10, completion: 'check',
      summary: 'What diffusion is, and why it is not just "ChatGPT for pictures".',
      blocks: [
        { type: 'hotspot', diagram: 'four-modes', caption: 'Four extensions of the same core idea — an overview of this module',
          points: [
            { x: 50, y: 17.8, label: 'Generative', body: 'Making new content — images, text, or audio — instead of just a label or a number. This lesson explains how image models do this, and why their method is genuinely different from how language models write text.' },
            { x: 83.8, y: 49.8, label: 'Multimodal', body: 'One model that can handle several kinds of input, all placed in the same shared space inside the model. An image is turned into tokens, just like text is, and the model pays attention across all of them without caring whether they came from a picture or from words. See lesson 2.' },
            { x: 50, y: 82.2, label: 'Agentic', body: 'The model is connected into a loop so it can act — it can call tools, read the result, and decide what to do next. This does not make the model smarter. It makes its mistakes matter more, because now it can actually do things. See lesson 3.' },
            { x: 16.3, y: 49.8, label: 'Embodied', body: 'The model is given a body and placed in the real, physical world. Here, a failed attempt can break something real, not just cost you a retry. The most surprising exception in this lesson is not about robots at all. See lesson 4.' }
          ] },
        { type: 'text', lead: true, body: [
          'Many people assume image generators work like language models — guessing the next small piece of a picture, the way a language model guesses the next word. They do not work that way, and the difference explains most of the odd behaviour you see in image generators.',
          'The most common method is called diffusion, and the idea behind training it sounds backwards, but it works well. Start with a real image. Add a little random noise to it. Add a bit more. Keep adding noise until the image is nothing but static. Now train a model to reverse one small step of this: given a noisy image, predict what the slightly less noisy version looked like.',
          'Once the model is trained, you use it in reverse, starting from nothing. Begin with pure random static — an image with no picture in it at all. Ask the model, again and again, to remove noise that was never actually added. At every step, your text prompt guides which noise to "remove". Step by step, the model turns static into a picture that never existed before. The image is not pulled from a database and it is not pieced together from other images. It is the result of a guided noise-removal process.'
        ] },
        { type: 'video', videoId: 'v-diffusion' },
        { type: 'text', body: [
          'This method explains several things that people find confusing.',
          'Why hands looked wrong for years: the model has no idea of a skeleton, and no built-in fact that a hand has five fingers. It only has a statistical sense of what hand-shaped regions tend to look like, and hands appear in many different positions in photos. Later models got better because of more data and better training, not because they learned anatomy.',
          'Why words inside images used to look like nonsense: to a noise-removing model, letters are just shapes, not symbols with meaning. Producing readable words meant learning shape patterns accurately enough that they happened to spell real words — which is why the improvement came suddenly, as models got bigger, rather than little by little.',
          'Why the same prompt gives a different picture each time: each run starts from different random noise. This randomness is what creates the image in the first place. It is not a flaw.'
        ] },
        { type: 'check', questions: [
          { id: 'q0901', kind: 'mcq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
            stem: 'How does a diffusion model create an image?',
            options: [
              'It starts from random noise and removes noise step by step, guided by the prompt',
              'It finds similar images and blends them together',
              'It predicts the image one pixel at a time, from top left to bottom right',
              'It searches a database for the image that matches the prompt best'
            ], answer: [0],
            rationale: 'The model removes noise step by step, starting from randomness, guided by the text. Nothing is fetched from storage and nothing is blended — which is why these models can create images unlike anything in their training data, and also why they can produce images that look close to their training data when a prompt is very specific.',
            distractors: {
              1: 'A common guess, but wrong. There is no step where the model fetches images while generating.',
              2: 'That describes an older type of image model, one that most systems have now moved past.',
              3: 'No database is checked while the image is being generated.'
            } }
        ] },
        { type: 'resource', resourceIds: ['r-ml-glossary'] }
      ]
    },
    {
      id: 'm09l2', title: 'Multimodal', minutes: 6, completion: 'read',
      summary: 'One model that handles several kinds of input — and what that does not mean.',
      blocks: [
        { type: 'text', body: [
          'A multimodal model can work with more than one kind of data — text and images, and sometimes audio and video too. You can show it a photograph and ask a question about it. You can give it a chart and ask what the chart shows.',
          'The method behind this is simpler than it sounds. Everything is turned into tokens that live in one shared space inside the model. An image is cut into small patches, and each patch is turned into a vector — a list of numbers. Those vectors sit in the same space as the text tokens. The model then pays attention across all of them together, without caring whether a piece of information came from the text or from the image.'
        ] },
        { type: 'compare', caption: 'What "multimodal" gives you, and what it does not',
          columns: ['Claim', 'Status'],
          rows: [
            ['It can answer questions about an image', 'True, and well proven. This works well, is used widely, and is genuinely useful.'],
            ['It reads charts and diagrams reliably', 'Only partly true. It often works, but it fails in ways that are hard to predict — reading the wrong axis, or making up numbers that are not on the chart. Always check any numbers it gives you.'],
            ['It "sees" the way people do', 'No. It performs worse on unusual angles, on fine details about where things are, and on counting things exactly — the same kind of gap you saw in module 7.'],
            ['One model for everything is better than specialised models', 'Not proven. Models built for one specific task still beat general-purpose models at many specific tasks. The general model wins on convenience and on handling many different kinds of tasks.'],
            ['It can describe an image for accessibility', 'Useful, and widely used — but someone should check it. A confident description that is wrong is worse than no description at all, because the person who needs it has no way to tell it is wrong.']
          ] },
        { type: 'takeaway', body: 'Multimodal means "the model accepts several kinds of input in one shared internal format". It does not mean the model understands the world the way a person does. Treating a smooth, confident description of a photograph as proof of real understanding is the same mistake from module 1, just wearing a different outfit.' }
      ]
    },
    {
      id: 'm09l3', title: 'Agents, tools and retrieval', minutes: 11, completion: 'activity',
      summary: 'What changes when a model can take actions, and how that changes the risk.',
      blocks: [
        { type: 'text', body: [
          'A language model on its own only produces text. An agent is a model connected to a loop: it can call tools, read what comes back, decide what to do next, and keep repeating this until it decides the task is finished.',
          'What really changes here is not intelligence. It is consequence. A wrong sentence is just a wrong sentence. A wrong action can send an email, change a file, or place an order. Every kind of failure covered earlier in this course can still happen — but now a failure has an effect out in the world, not just on your screen.'
        ] },
        { type: 'check', questions: [
          { id: 'q0904', kind: 'fitb', difficulty: 'easy', objective: 'Explain agents, tool use and retrieval',
            stem: 'Fill in the blank: a model connected to a loop, so that it can call tools, read the results, and decide the next step, is called an ___.',
            options: [], answer: [], blankAnswers: ['agent'],
            rationale: 'An agent. What changes is not intelligence — it is consequence. A wrong sentence is just a wrong sentence, but a wrong action can send an email.' }
        ] },
        { type: 'labeled', caption: 'Four extra abilities, and what each one fixes',
          parts: [
            { label: 'Tool use', body: 'The model calls a calculator, a search engine, a database, or another program (an API). What this fixes: maths, up-to-date facts, and anything that has a reliable, authoritative source. This is the rule-based layer from module 3, doing the part it is good at. A model that uses a calculator is not worse than one that does the maths in its "head" — it is better, for the same reason you use a calculator yourself.' },
            { label: 'Retrieval (RAG)', body: 'Before answering, the system fetches relevant passages from your own documents and adds them to what the model can see. What this fixes: the model\'s knowledge cut-off, and questions about material it was never trained on. What it does not fix: making things up. A model given the right passages can still misread them, and can still add a detail that sounds plausible but is not actually in any of them.' },
            { label: 'Memory', body: 'Keeping information from one session to the next. What this fixes: having to repeat yourself, and having to re-explain the background each time. What it introduces: a privacy risk. Anything the system remembers is stored somewhere, and it is worth asking exactly where before you turn this on.' },
            { label: 'Planning loops', body: 'Break a goal into steps, carry them out, check the results, and revise if needed. What this fixes: tasks with many steps that cannot be done in a single response. What it introduces: errors that build up. If each step is correct 95% of the time, ten steps together are correct only about 60% of the time — and these failures are hard to spot, because you usually do not see the steps in between.' }
          ] },
        { type: 'video', videoId: 'v-rag' },
        { type: 'evidence', confidence: 'medium',
          claim: 'Retrieval lowers, but does not remove, the amount of made-up content in a model\'s answers.',
          basis: 'This matches what vendor documentation and independent studies both show: basing an answer on retrieved passages reduces statements that are not backed up, and models still make claims that are not in the retrieved material at all. Rated medium confidence because how much the reduction helps varies a great deal depending on how it is built, and this is rarely measured openly.' },
        { type: 'scenario',
          setup: 'Someone proposes building an agent that reads your team\'s inbox, drafts replies, and sends the replies it judges to be routine.',
          question: 'What is the single most important question to ask about this design?',
          choices: [
            { text: '"Which actions are reversible, and which are not?"', verdict: 'best',
              feedback: 'This is the right way to think about it. Drafting an email can be undone; sending it cannot. The standard safe design is to let the agent do everything up to the step that cannot be undone, and require a person to approve that one step. This keeps almost all of the time saved, and almost none of the risk.' },
            { text: '"How accurate is the model?"', verdict: 'workable',
              feedback: 'Worth knowing, but not enough on its own. No accuracy number makes an action that cannot be undone safe. And a model that is only moderately accurate is fine, as long as a person confirms before the action happens. Asking about accuracy before asking about reversibility is asking the questions in the wrong order.' },
            { text: '"Which model does it use?"', verdict: 'poor',
              feedback: 'The weakest question of the four. Which model is used matters far less than what the system is allowed to do without asking anyone first.' },
            { text: '"Can we turn it off quickly?"', verdict: 'workable',
              feedback: 'Worth having, but this only reacts after the fact. By the time you switch it off, the emails may already be sent. It is better to design the system so the risky action needs a person\'s approval, rather than planning to catch the damage afterwards.' }
          ] },
        { type: 'practice', title: 'Map out one workflow',
          steps: [
            'Pick a real, repeated task from your work that has five to ten steps.',
            'Write down the steps in order.',
            'Mark each step: write "R" if it can be undone, and "I" if it cannot.',
            'Mark each step again: write "C" if you could check it in under a minute, and "U" if you could not check it.',
            'Circle every step marked both "I" and "U". These are the steps a person should keep doing.',
            'Everything else could be automated, and now you have a clear reason why.'
          ],
          output: 'A marked-up workflow with a clear, justified line between the part you would automate and the part a person should keep doing. This is something you can actually bring to a real meeting.' }
      ]
    },
    {
      id: 'm09l4', title: 'Robots and science', minutes: 9, completion: 'check',
      summary: 'The area where claims run far ahead of evidence — and the one where they do not.',
      blocks: [
        { type: 'text', body: [
          'Robotics is where the careful, questioning approach of this course matters most, because the gap between a demo and real-world use is bigger here than anywhere else.',
          'The reasons for this are built into the problem, not something that will simply improve with time. A language model that fails just costs you another try. A robot that fails can break something, or hurt someone. Reinforcement learning needs millions of attempts to work well, and you cannot let a real robot arm break millions of real dishes to learn. So training happens in computer simulation instead, and a simulation is never a perfect match for the real world. This gap has a name — the "sim-to-real gap" — and closing it is the central problem in the field, not a small detail.',
          'Then there is the problem with demos. Robot videos are almost always the best result out of many attempts. They are often sped up, and sometimes a person is secretly controlling the robot from off camera. None of this is necessarily dishonest — this is simply how demos get made. But a video is not evidence that the robot works reliably, and reliability is the whole question that matters.'
        ] },
        { type: 'video', videoId: 'v-robots' },
        { type: 'evidence', confidence: 'low',
          claim: 'General-purpose humanoid robots will soon be doing useful everyday work at large scale.',
          basis: 'Rated low on purpose. There are genuine advances in how robots walk, how they grasp objects, and in models that combine vision, language, and action. There are also many big claims from companies. But what is mostly missing from public information is independent data, gathered over time, on how reliably robots perform in messy, real-world settings — the exact evidence that would settle this question. Demo footage is not that evidence.' },
        { type: 'text', body: [
          'Now for the other side of the story, which deserves just as much attention, because a course that only teaches doubt would turn you into a cynic, not a fair judge.',
          'Predicting the three-dimensional shape of a protein from its chain of amino acids was an unsolved problem in biology for about fifty years. Before, each protein\'s structure had to be worked out experimentally, one at a time, and each one could take months or years. AlphaFold changed this. It now predicts the structure for a very large share of all known proteins, and these predictions are published openly in a free, searchable database. Working biologists use this database routinely.',
          'This is what a clear, undisputed success looks like. Notice what made it possible: a precisely defined problem, an objective way to measure success, a large body of real experimental data to train and check against, and an independent competition that judged the results. Very few problems in the world have all four of these things. Where a problem does have all four, expect more successes like this one.'
        ] },
        { type: 'video', videoId: 'v-alphafold' },
        { type: 'evidence', confidence: 'high', sourceId: 's-alphafold',
          claim: 'Machine-learning systems have produced large numbers of protein structure predictions, and these are published openly and used in biology research.',
          basis: 'The AlphaFold Protein Structure Database is public, run by EMBL-EBI, and searchable by anyone. Its performance was judged by the independent CASP competition, not just claimed by the team that built it. This is one of the most solidly proven results in applied AI that exists today.' },
        { type: 'compare', caption: 'Two claims from the same field, with very different evidence behind them',
          columns: ['', 'Protein structure prediction', 'General-purpose humanoid robots'],
          rows: [
            ['Problem definition', 'Precise, and everyone agrees on it', 'Vague — "useful work" is not a real specification'],
            ['Success measure', 'Objective, checked against real experiments', 'No standard measure; demos differ widely'],
            ['Independent assessment', 'Yes — the CASP competition, blind and external', 'Rare; mostly footage from the company itself'],
            ['Output available to check', 'Yes — an open, searchable database', 'No; hardware shown only in controlled settings'],
            ['Reasonable confidence', 'High', 'Low, for general ability any time soon']
          ] },
        { type: 'check', questions: [
          { id: 'q0902', kind: 'mcq', difficulty: 'hard', objective: 'Evaluate AI claims',
            stem: 'As evidence, what most sets the protein-folding result apart from a humanoid robot demonstration?',
            options: [
              'It was judged independently against an objective measure, and its output is public and checkable',
              'It used a bigger model',
              'It was published by a more trusted organisation',
              'It solved an easier problem'
            ], answer: [0],
            rationale: 'An independent, blind evaluation, plus output that anyone can inspect, is what turns a claim into a proven result. The robot footage might well be showing something real — it just is not the kind of evidence that can prove reliability.',
            distractors: {
              1: 'Model size is not what makes evidence strong.',
              2: 'Plenty of robotics work comes from equally trusted labs. A good reputation is not a substitute for independent checking.',
              3: 'Protein folding was an unsolved problem for fifty years. It was not the easier one.'
            } },
          { id: 'q0903', kind: 'tf', difficulty: 'easy', objective: 'Evaluate AI claims',
            stem: 'True or false: an impressive robot demonstration video is good evidence that the robot works reliably.',
            options: ['True', 'False'], answer: [1],
            rationale: 'A demo shows only that the task was possible once, under some set of conditions. Reliability is a rate — how often something works — and a single video cannot show a rate. Ask how many attempts it took to get that clip, whether a person was secretly controlling it, and what the success rate is over a hundred tries in a normal, unmodified setting.' }
        ] },
        { type: 'resource', resourceIds: ['r-alphafold-db', 'r-ieee'] }
      ]
    }
  ],
  extension: {
    title: 'The real mechanism, in full',
    body: 'If the short explanation of diffusion left you wanting the real mathematics behind it, the Welch Labs guest video on the 3Blue1Brown channel is the best free, in-depth explanation available.',
    resourceIds: ['r-alphafold-db']
  }
}
