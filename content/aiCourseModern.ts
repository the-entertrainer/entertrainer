import type { AiModule } from './aiCourseTypes'

export const modernModules: AiModule[] = [
  {
    id: 'prediction-engine',
    number: '04',
    short: 'Prediction engine',
    title: 'How a language model builds a response',
    duration: '18 minutes',
    objective: 'Describe next-token prediction, explain how context changes a model’s estimate, and observe how repeated predictions become a sentence or response.',
    introduction: [
      'A modern language model does not begin with a finished answer hidden inside it. It constructs a response one small piece at a time. Given the text so far, it estimates which next token is likely to fit the surrounding context. It chooses or samples a continuation, adds it to the sequence, then repeats the process.',
      'A token is a piece of text. It may be a whole word, part of a word, punctuation, or a common sequence of characters. The model processes tokens rather than ideas in the human sense, but patterns across those tokens can still produce useful language, code, summaries, translations, and explanations.'
    ],
    sections: [
      {
        heading: 'Context changes the distribution of likely next tokens',
        paragraphs: [
          'Consider the unfinished sentence: “Please bring an umbrella because the forecast says there will be …” Several continuations are possible, but “rain” is likely because the words around the blank make it relevant. Change the setting to “Please bring a ladder because the forecast says the signal light is …” and a different continuation becomes more likely.',
          'The important idea is not that the model discovers one permanent correct answer. It estimates a distribution: some next tokens fit the context better than others. The surrounding sequence changes that distribution. This is why a language model can respond differently when a prompt contains different details, instructions, examples, or tone.'
        ]
      },
      {
        heading: 'A response is a chain of small estimates',
        paragraphs: [
          'After choosing one token, the model includes that token in the context for the next estimate. A short response therefore emerges through a chain of predictions. Each new piece affects the choices that follow. The response can appear deliberate because the chain respects many patterns in the text it has processed.',
          'This mechanism explains both the strength and the limitation of a language model. It can produce fluent language that fits a prompt, but fluency is not the same as verification. A model may generate a statement that sounds plausible because the words fit together even when a fact, citation, date, or conclusion needs checking.'
        ]
      }
    ],
    exampleTitle: 'Worked example: one sentence, two contexts',
    example: [
      'Start with “The museum is closed today because …”. A continuation about a public holiday, maintenance, or a private event may fit. Now add “because the river has flooded the entrance”. The added phrase changes the useful continuation. Context is not decoration; it narrows the model’s next estimate.',
      'The same process repeats throughout a response. A model can produce a summary of a meeting by repeatedly estimating the next useful token from the prompt, the instructions, and the response it has already started. It still needs a person to decide whether the summary is accurate, complete, and safe to share.'
    ],
    bridge: 'Prediction explains the engine inside a language model. The next lesson widens the view to the many different types of AI that use patterns in different ways.',
    sourceLabel: 'Vaswani et al., Attention Is All You Need (2017)',
    sourceUrl: 'https://arxiv.org/abs/1706.03762',
    confidence: 'Verified public evidence',
    diagram: 'prediction',
    video: { title: 'Transformers, the technology behind many language models', url: 'https://www.youtube-nocookie.com/embed/wjZofJX0v4M', question: 'As you watch, identify where the explanation describes a likely next token rather than a verified answer.' },
    activity: 'predictionLab'
  },
  {
    id: 'modern-landscape',
    number: '05',
    short: 'Modern AI types',
    title: 'The modern AI landscape is wider than chat',
    duration: '15 minutes',
    objective: 'Distinguish common modern AI types by the input they process, the output they produce, and the task they are designed to support.',
    introduction: [
      'A chatbot is one highly visible form of modern AI, but it is not the whole landscape. Different systems work with different forms of information: text, images, sound, video, measurements, locations, and structured records. Their outputs also differ: a label, a score, a recommendation, a forecast, a draft, an image, or a suggested action.',
      'Thinking in types helps a learner avoid both hype and confusion. The question is not which system is “most intelligent”. The better question is which kind of model fits a particular task, what input it needs, what output it can produce, and what evidence is required to judge the result.'
    ],
    sections: [
      {
        heading: 'Five useful families to recognise',
        paragraphs: [
          'Prediction and recommendation systems estimate a value or rank options: travel time, likely demand, possible fraud, or a video you may want to watch. Computer-vision systems classify or locate patterns in images and video: a defect on a product, a road sign, or a medical feature that needs a clinician’s attention.',
          'Language models work with text and code. Multimodal models combine information such as text, images, audio, and video. Tool-using systems connect a model to approved search, database, or workflow tools. The families overlap, but each one raises different questions about data quality, interpretation, and control.'
        ]
      },
      {
        heading: 'Capabilities depend on the task and the conditions',
        paragraphs: [
          'A model can be impressive in a benchmark or demonstration and still be unsuitable for a different environment. A vision system may work well with clear images and poorly with unusual lighting. A language model may explain a topic well but mishandle a recent or specialist fact. A recommendation system may surface useful options while also reinforcing a narrow pattern of past behaviour.',
          'Modern AI is therefore best understood as a set of specialised capabilities. The learner’s role is to connect a claimed capability to the task, data, evidence, and safeguards required for a real use.'
        ]
      }
    ],
    exampleTitle: 'Worked example: one question, different AI systems',
    example: [
      'A retailer wants to reduce late deliveries. A prediction model can estimate the risk of delay from shipment data. A vision model can inspect a damaged package image. A language model can draft a customer update. A tool-using workflow can retrieve the current delivery policy and prepare that draft for review.',
      'These systems are not interchangeable. Each one receives different information and creates a different kind of output. Designing the workflow requires matching the technology to the job rather than adding a chatbot to every step.'
    ],
    bridge: 'Now that the landscape is clear, the next lesson looks at well-known modern models and explains what their public capabilities do — and do not — show.',
    sourceLabel: 'Stanford CRFM, On the Opportunities and Risks of Foundation Models (2021)',
    sourceUrl: 'https://crfm.stanford.edu/report.html',
    confidence: 'Verified public evidence',
    diagram: 'landscape'
  },
  {
    id: 'models-world',
    number: '06',
    short: 'Models in the world',
    title: 'What famous AI models can do',
    duration: '13 minutes',
    objective: 'Describe well-known modern models through their documented inputs, outputs, capabilities, and limitations rather than through unsupported general claims.',
    introduction: [
      'Names such as GPT, Gemini, Claude, and AlphaFold often appear in public discussions of AI. These systems are useful examples because they make different capabilities visible. They should not be treated as interchangeable, all-knowing systems, or proof that a task has been solved in every setting.',
      'A careful description starts with what a model has been designed and documented to do. It then asks what input the model can process, what kind of output it produces, how its output will be evaluated, and where a person or specialist must remain responsible.'
    ],
    sections: [
      {
        heading: 'Language and multimodal models',
        paragraphs: [
          'GPT-4 is described in its technical report as a transformer-based model that accepts image and text inputs and produces text outputs. Gemini is described as a family of multimodal models designed to work across text, images, audio, and video. Claude is publicly described through capabilities such as text analysis, coding, structured output, and vision tasks.',
          'The shared lesson is not that one model wins a contest. It is that modern models can relate different forms of information and produce useful candidate outputs. The useful word is candidate: a draft, a classification, a summary, a code suggestion, or an explanation still needs evaluation in the setting where it will be used.'
        ]
      },
      {
        heading: 'A capability is not a guarantee',
        paragraphs: [
          'A system can write a convincing draft without knowing whether every statement is current. It can inspect an image without having the authority to make a clinical or legal decision. It can provide a code suggestion without proving that the code is secure, suitable, or complete.',
          'This is not a reason to ignore capability. It is a reason to use capability with proportion. Match the task to the tool, test the output where it matters, and state clearly who is accountable for the result.'
        ]
      }
    ],
    exampleTitle: 'Worked example: from a model demo to a useful workflow',
    example: [
      'Suppose a team sees a demonstration of a model that can read an image and answer questions about it. Before using it in a workplace process, the team needs to define the image conditions, accuracy requirement, failure procedure, privacy boundaries, reviewer role, and record of the decision.',
      'The demonstration is evidence that a capability may be possible. It is not yet evidence that the capability is reliable enough for the team’s specific task. The gap between those two statements is where evaluation and design begin.'
    ],
    bridge: 'The final lesson brings the course together: how to use a capable system without giving up evidence, privacy, or accountability.',
    sourceLabel: 'GPT-4, Gemini, and Claude public technical documentation',
    sourceUrl: 'https://arxiv.org/abs/2303.08774',
    confidence: 'Verified public evidence',
    diagram: 'capabilities',
    visual: 'models'
  },
  {
    id: 'know-ai',
    number: '07',
    short: 'Know AI',
    title: 'From capability to good judgement',
    duration: '12 minutes',
    objective: 'Use a practical routine to choose an appropriate AI use case, check the result, protect information, and retain human accountability.',
    introduction: [
      'The goal of this course is not to make every learner an AI engineer. It is to make AI less mysterious and more manageable. You now have a history, a task-centred definition, an account of learning and prediction, a map of modern AI types, and a way to interpret capability claims.',
      'The final step is judgement. A responsible AI use case is not merely a task a system can perform. It is a task where the information can be handled safely, the output can be checked, the possible consequences are understood, and a person remains accountable for the final decision.'
    ],
    sections: [
      {
        heading: 'Choose the right place to begin',
        paragraphs: [
          'A low-risk starting point may be drafting an outline from public material, grouping feedback into themes, creating a first list of questions, or translating a non-sensitive draft for review. In each case, a person can examine the result before it is shared or acted upon.',
          'A higher-risk use may affect someone’s eligibility, health, safety, employment, finances, or legal position. In those settings, a model output may still provide supporting information, but stronger evidence, testing, oversight, and specialist judgement are needed before any consequential decision is made.'
        ]
      },
      {
        heading: 'Keep four questions visible',
        paragraphs: [
          'What is the task? What information is safe and appropriate to use? What must be checked in the output? Who is accountable for the final decision? These questions are simple enough to use before any prompt is entered, yet they connect every major idea in the course.',
          'That is the difference between using AI as a novelty and using it as a tool. A tool can extend a person’s capacity when it is understood, bounded, and checked. It becomes risky when confidence replaces evidence or when accountability disappears behind the system.'
        ]
      }
    ],
    exampleTitle: 'Worked example: a responsible starting point',
    example: [
      'A learning coordinator uses a language model to create a first outline for a workshop from public policy notes. The coordinator removes personal information, checks every policy reference, asks a subject specialist to review the final draft, and records any changes that were made.',
      'The task is bounded, the input is controlled, the output can be reviewed, and the final decision remains with people who understand the subject. This is the kind of use case that turns capability into responsible practice.'
    ],
    bridge: 'The knowledge check will now ask you to retrieve the story of the course: from AI’s long history to the prediction mechanism and the judgement needed to use a modern system well.',
    sourceLabel: 'NIST, Generative AI Profile (2024)',
    sourceUrl: 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence',
    confidence: 'Verified public evidence',
    diagram: 'responsibility'
  }
]
