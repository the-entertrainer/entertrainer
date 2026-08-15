import type { Module } from './types'

export const M09: Module = {
  id: 'm09', n: '09', accent: 'var(--blue)',
  title: 'Generative, multimodal, agentic, embodied',
  intro: 'Four extensions of the same underlying machinery, each with a genuinely different failure profile. Images are made by a mechanism unlike text generation. Agents add the ability to act, which changes the risk calculation entirely. Robots add a body, and the physical world is not kind. And in one domain — structural biology — the results are as good as the promises.',
  objectives: [
    'Explain how diffusion models generate images and why that differs from text generation.',
    'Describe what multimodal means and what it does not guarantee.',
    'Explain agents, tool use and retrieval, and what each fixes and does not fix.',
    'Assess a robotics or scientific-AI claim against evidence rather than demo footage.'
  ],
  lessons: [
    {
      id: 'm09l1', title: 'Images: a different mechanism entirely', minutes: 10, completion: 'check',
      summary: 'Diffusion, and why it is not "the same as ChatGPT for pictures".',
      blocks: [
        { type: 'hotspot', diagram: 'four-modes', caption: 'Four extensions of the same machinery — this module, at a glance',
          points: [
            { x: 50, y: 17.8, label: 'Generative', body: 'Producing new content — images, text, audio — rather than a label or a number. This lesson is about how image models do it, and why the mechanism is genuinely different from language generation.' },
            { x: 83.8, y: 49.8, label: 'Multimodal', body: 'One model, several kinds of input, in a shared representation space. An image is turned into tokens the same way text is, and attention works across all of them without caring which came from where. Lesson 2.' },
            { x: 50, y: 82.2, label: 'Agentic', body: 'The model wired into a loop so it can act — call tools, read what comes back, decide the next step. The addition here is not intelligence, it is consequence. Lesson 3.' },
            { x: 16.3, y: 49.8, label: 'Embodied', body: 'Given a body, in the physical world, where a failed attempt breaks something real rather than costing a retry. This lesson\'s most surprising exception is not about robots at all. Lesson 4.' }
          ] },
        { type: 'text', lead: true, body: [
          'People assume image generators work like language models — predicting the next bit of picture. They do not, and the difference explains most of their characteristic behaviour.',
          'The dominant method is diffusion, and the training idea is beautifully perverse. Take a real image. Add a little random noise. Add a little more. Keep going until it is pure static. Now train a model to undo one step of that: given a noisy image, predict what the slightly-less-noisy version looked like.',
          'Once trained, you run it backwards from nowhere. Start with pure random static — an image of nothing — and repeatedly ask the model to remove noise that was never added. Guided by your text prompt at every step, it "removes" its way from static to a picture that was never there. The image is not retrieved or assembled. It is the output of a denoising process that has been steered.'
        ] },
        { type: 'video', videoId: 'v-diffusion' },
        { type: 'text', body: [
          'This mechanism explains things people find puzzling.',
          'Why hands were bad for years: the model has no skeleton, no concept of five fingers as a fact. It has a statistical sense of what hand-ish regions look like, and hands appear in wildly varying configurations. Later models improved through more data and better training, not by acquiring anatomy.',
          'Why text in images was garbled: letters are shapes to a denoiser, not symbols. Producing legible words meant learning shape sequences well enough that they happen to spell — which is why it improved suddenly as models grew rather than gradually.',
          'Why the same prompt gives different pictures: you start from different random noise each time. The randomness is the seed of the image, not a defect.'
        ] },
        { type: 'check', questions: [
          { id: 'q0901', kind: 'mcq', difficulty: 'moderate', objective: 'Distinguish AI approaches',
            stem: 'How does a diffusion model generate an image?',
            options: [
              'It starts from random noise and repeatedly removes noise, steered by the prompt',
              'It retrieves similar images and blends them together',
              'It predicts the image pixel by pixel from top left to bottom right',
              'It searches a database for the closest match to the prompt'
            ], answer: [0],
            rationale: 'Iterative denoising from a random start, guided by the text. Nothing is retrieved and nothing is blended — which is why these models can produce images unlike anything in their training data, and also why they can reproduce training-like images when a prompt is very specific.',
            distractors: {
              1: 'A common intuition and wrong. There is no retrieval step at generation time.',
              2: 'That describes an older class of autoregressive image models, largely superseded.',
              3: 'No database is consulted at generation time.'
            } }
        ] },
        { type: 'resource', resourceIds: ['r-ml-glossary'] }
      ]
    },
    {
      id: 'm09l2', title: 'Multimodal', minutes: 6, completion: 'read',
      summary: 'One model, several kinds of input — and what that does not imply.',
      blocks: [
        { type: 'text', body: [
          'A multimodal model handles more than one kind of data: text and images, sometimes audio and video. You show it a photograph and ask a question about it; you give it a chart and ask what it shows.',
          'The mechanism is less exotic than it sounds. Everything is turned into tokens in a shared representation space. An image is divided into patches, each patch becomes a vector, and those vectors sit in the same space the text tokens do. Attention then works across all of them without caring which came from where.'
        ] },
        { type: 'compare', caption: 'What multimodal does and does not get you',
          columns: ['Claim', 'Status'],
          rows: [
            ['It can answer questions about an image', 'Well supported. This works, is widely deployed, and is genuinely useful.'],
            ['It reads charts and diagrams reliably', 'Partly. It often works and fails in ways that are hard to predict — misreading axes, inventing values that are not on the chart. Check anything numerical.'],
            ['It "sees" the way people do', 'No. Performance drops on unusual viewpoints, fine spatial relationships and precise counting — the same class of gap as in module 7.'],
            ['One model for everything is better than specialised models', 'Not established. Specialised models still beat general ones on many specific tasks; the general model wins on convenience and breadth.'],
            ['It can describe an image for accessibility', 'Useful and widely used, and it should be reviewed. An alt text that is confidently wrong is worse than none, because nobody who needs it can tell.']
          ] },
        { type: 'takeaway', body: 'Multimodal means "accepts several input types in one shared representation". It does not mean the model has a unified understanding of the world, and treating a fluent description of a photograph as evidence that it does is the module 1 error in a new outfit.' }
      ]
    },
    {
      id: 'm09l3', title: 'Agents, tools and retrieval', minutes: 11, completion: 'activity',
      summary: 'What happens when a model can act, and what that changes about risk.',
      blocks: [
        { type: 'text', body: [
          'A language model on its own produces text. An agent is a model wired to a loop: it can call tools, read what comes back, decide what to do next, and repeat until it judges the task done.',
          'The step change is not intelligence. It is consequence. A wrong sentence is a wrong sentence. A wrong action sends an email, modifies a file, places an order. Every failure mode from earlier in this course still applies — but now failures have effects in the world rather than on your screen.'
        ] },
        { type: 'check', questions: [
          { id: 'q0904', kind: 'fitb', difficulty: 'easy', objective: 'Explain agents, tool use and retrieval',
            stem: 'Fill in the blank: a model wired into a loop so it can call tools, read what comes back, and decide the next step is called an ___.',
            options: [], answer: [], blankAnswers: ['agent'],
            rationale: 'An agent. The addition is not intelligence — it is consequence. A wrong sentence is a wrong sentence; a wrong action sends an email.' }
        ] },
        { type: 'labeled', caption: 'The four additions, and what each one fixes',
          parts: [
            { label: 'Tool use', body: 'The model calls a calculator, a search engine, a database, an API. Fixes: arithmetic, current facts, anything with an authoritative source. This is the symbolic layer from module 3, doing the part it does better. A model that calls a calculator is not worse than one that does mental arithmetic; it is better, and for the same reason you use a calculator.' },
            { label: 'Retrieval (RAG)', body: 'Before answering, fetch relevant passages from your documents and put them in the context. Fixes: the knowledge cut-off, and questions about material the model was never trained on. Does not fix: invention. A model given the right passages can still misread them, and can still add a plausible detail that is in none of them.' },
            { label: 'Memory', body: 'Persisting information across sessions. Fixes: repetition, and the need to re-explain context. Introduces: a privacy surface. Anything remembered is stored somewhere, and "somewhere" is a question worth asking before turning it on.' },
            { label: 'Planning loops', body: 'Break a goal into steps, execute, check, revise. Fixes: multi-step tasks that a single response cannot complete. Introduces: compounding error. If each step is 95% reliable, ten steps are about 60% reliable, and the failures are hard to see because the intermediate steps are not shown to you.' }
          ] },
        { type: 'video', videoId: 'v-rag' },
        { type: 'evidence', confidence: 'medium',
          claim: 'Retrieval reduces, but does not eliminate, fabricated content in model outputs.',
          basis: 'Consistent with vendor documentation and evaluation literature: grounding output in retrieved passages reduces unsupported statements, and models still produce claims not present in the retrieved material. Rated medium because the size of the reduction varies enormously with implementation and is rarely measured in public.' },
        { type: 'scenario',
          setup: 'Someone proposes an agent that reads your team\'s inbox, drafts replies, and sends the ones it judges routine.',
          question: 'What is the single most important design question?',
          choices: [
            { text: '"Which actions are reversible, and which are not?"', verdict: 'best',
              feedback: 'The right frame. Drafting is reversible; sending is not. The standard safe pattern is to let the agent do everything up to the irreversible step and require a human for that one — which keeps almost all the time saving and almost none of the risk.' },
            { text: '"How accurate is the model?"', verdict: 'workable',
              feedback: 'Necessary but not sufficient. No accuracy figure makes an irreversible action safe, and a modest one is fine if a human confirms before it fires. Accuracy without reversibility is the wrong question first.' },
            { text: '"Which model does it use?"', verdict: 'poor',
              feedback: 'The weakest question here. Model choice matters far less than what the system is permitted to do without asking.' },
            { text: '"Can we turn it off quickly?"', verdict: 'workable',
              feedback: 'Worth having, but reactive. By the time you turn it off, the emails have gone. Design so the damaging action needs a person, rather than planning to catch it afterwards.' }
          ] },
        { type: 'practice', title: 'Map one workflow',
          steps: [
            'Pick a real, repetitive task in your work — five to ten steps.',
            'Write the steps down in order.',
            'Mark each step: R for reversible, I for irreversible.',
            'Mark each step: C for checkable by you in under a minute, U for uncheckable.',
            'Circle every step that is both I and U. Those are the ones a person keeps.',
            'Everything else is a candidate for automation, and now you can say why.'
          ],
          output: 'A marked-up workflow with a defensible line between the automated part and the human part. This is a deliverable you can take into a real meeting.' }
      ]
    },
    {
      id: 'm09l4', title: 'Robots and science', minutes: 9, completion: 'check',
      summary: 'The domain where claims most outrun evidence, and the one where they do not.',
      blocks: [
        { type: 'text', body: [
          'Robotics is where this course\'s scepticism earns its keep, because the gap between demo and deployment is larger here than anywhere else.',
          'The reasons are structural, not temporary. A language model that fails costs you a retry. A robot that fails breaks something or hurts someone. Reinforcement learning needs millions of attempts, and you cannot have millions of attempts with a real arm and real crockery — so training happens in simulation, and simulation is never quite right. The gap has a name, the sim-to-real gap, and closing it is the field\'s central problem rather than a detail.',
          'And then there is the demo problem. Robot footage is almost always the best of many takes, often speeded up, sometimes teleoperated by a human off-camera. None of that is necessarily dishonest — it is how demos are made — but a video is not evidence of reliability, and reliability is the entire question.'
        ] },
        { type: 'video', videoId: 'v-robots' },
        { type: 'evidence', confidence: 'low',
          claim: 'General-purpose humanoid robots will be performing useful everyday work at scale in the near term.',
          basis: 'Rated low deliberately. There are real advances in locomotion, manipulation and vision-language-action models, and there are extensive commercial claims. What is largely absent from the public record is independent, longitudinal reliability data from unstructured environments — the thing that would actually settle it. Demonstration footage is not that evidence.' },
        { type: 'text', body: [
          'Then there is the other side of the ledger, and it deserves equal prominence, because a course that only teaches scepticism produces cynics rather than judges.',
          'Predicting the three-dimensional structure of a protein from its amino-acid sequence was an open problem in biology for roughly fifty years. Structures were determined experimentally, one at a time, at a cost of months to years each. AlphaFold changed that: predicted structures for a very large fraction of known proteins are now published openly in a database anyone can search, free, and they are in routine use by working biologists.',
          'This is what an unambiguous success looks like. Note the properties that made it possible: a precisely defined problem, an objective measure of success, a serious body of experimental data to train and validate against, and an independent competition that assessed the results. Very few problems in the world have all four. Where they do, expect more of this.'
        ] },
        { type: 'video', videoId: 'v-alphafold' },
        { type: 'evidence', confidence: 'high', sourceId: 's-alphafold',
          claim: 'Machine-learning systems have produced protein structure predictions at scale that are openly published and used in biological research.',
          basis: 'The AlphaFold Protein Structure Database is public, hosted by EMBL-EBI, and searchable. Performance was assessed in the independent CASP competition rather than self-reported. This is among the best-evidenced applied-AI results in existence.' },
        { type: 'compare', caption: 'Two claims, same field, very different evidence',
          columns: ['', 'Protein structure prediction', 'General-purpose humanoid robots'],
          rows: [
            ['Problem definition', 'Precise and agreed', 'Vague — "useful work" is not a specification'],
            ['Success measure', 'Objective, compared against experiment', 'No standard measure; demos vary'],
            ['Independent assessment', 'Yes — CASP, blind and external', 'Rare; mostly vendor footage'],
            ['Output available to check', 'Yes — an open, searchable database', 'No; hardware in controlled settings'],
            ['Reasonable confidence', 'High', 'Low for near-term general capability']
          ] },
        { type: 'check', questions: [
          { id: 'q0902', kind: 'mcq', difficulty: 'hard', objective: 'Evaluate AI claims',
            stem: 'What most distinguishes the protein-folding result from a humanoid robot demonstration, as evidence?',
            options: [
              'It was assessed independently against an objective measure, and the output is public and checkable',
              'It used a larger model',
              'It was published by a more reputable organisation',
              'It solved an easier problem'
            ], answer: [0],
            rationale: 'Blind external evaluation plus published, inspectable output is what turns a claim into a result. The robot footage may be showing something real; it simply is not the kind of evidence that can establish reliability.',
            distractors: {
              1: 'Model size is not what makes evidence strong.',
              2: 'Some robotics work comes from equally reputable labs. Reputation is not a substitute for independent assessment.',
              3: 'Protein folding was a fifty-year open problem. It was not the easier one.'
            } },
          { id: 'q0903', kind: 'tf', difficulty: 'easy', objective: 'Evaluate AI claims',
            stem: 'True or false: an impressive robot demonstration video is good evidence that the robot works reliably.',
            options: ['True', 'False'], answer: [1],
            rationale: 'A demo shows that the task is possible under some conditions, on some attempt. Reliability is a rate, and a video cannot report a rate. Ask how many takes, whether it was teleoperated, and what the success rate is over a hundred attempts in an unmodified environment.' }
        ] },
        { type: 'resource', resourceIds: ['r-alphafold-db', 'r-ieee'] }
      ]
    }
  ],
  extension: {
    title: 'The mechanism, properly',
    body: 'If the twelve-minute diffusion explanation left you wanting the actual mathematics, the Welch Labs guest video on 3Blue1Brown is the best long-form treatment available free.',
    resourceIds: ['r-alphafold-db']
  }
}
