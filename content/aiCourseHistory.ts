import type { AiModule } from './aiCourseTypes'

export const historyModules: AiModule[] = [
  {
    id: 'before-chatbots',
    number: '01',
    short: 'Before ChatGPT',
    title: 'AI did not begin with ChatGPT',
    duration: '12 minutes',
    objective: 'Place modern generative AI in the longer history of ideas, research, and engineering that began decades before today’s chat tools.',
    introduction: [
      'Many people first noticed artificial intelligence when chat tools became widely available. Fair enough. A system that can answer questions, write a draft, or explain an idea does feel new when it arrives in your own browser.',
      'But the public moment is not the beginning of the field. Artificial intelligence has been a research area for roughly seven decades. Long before a conversational system could produce a paragraph, researchers were asking whether machines could reason, learn from examples, recognise patterns, and use language. Modern AI is the latest chapter of a much longer story, not chapter one.'
    ],
    sections: [
      {
        heading: 'A field before a product',
        paragraphs: [
          'In 1950, Alan Turing proposed replacing the vague argument about whether machines “think” with a more observable question: what can a machine do? In 1956, the Dartmouth Summer Research Project on Artificial Intelligence helped establish AI as a named research field. Its organisers were interested in learning, language, abstraction, and problem solving. Those are still the big questions underneath today’s AI conversation.',
          'The route from those early questions to a modern chat tool was neither straight nor quick. Researchers tried written rules, search, logic, pattern recognition, neural networks, large data sets, specialised processors, and new model architectures. At different times, progress was exciting, disappointing, expensive, or limited by the computers available. The field built up methods over decades, one imperfect layer at a time.'
        ]
      },
      {
        heading: 'Why the timeline matters',
        paragraphs: [
          'The history protects us from two easy mistakes. First, treating today’s systems as magic. They are built from research choices, training data, hardware, and evaluation methods that can be studied. Second, assuming a fluent chatbot is the whole of AI. It is one very visible system in a much wider family of technologies.',
          'This course starts with history because history gives the rest of the subject a shape. When you meet a language model, recommendation system, or image-recognition tool later, you can ask where its method came from and what problem it is actually trying to solve.'
        ]
      }
    ],
    exampleTitle: 'A short history in four movements',
    example: [
      'First came questions about reasoning, language, and how a machine might follow a method. Next came systems built from explicit rules and expert knowledge. Later, larger collections of examples and better computing made it practical for models to learn useful patterns from data. More recently, transformer-based models made it possible to handle very large sequences of text and other media efficiently.',
      'ChatGPT belongs to this most recent movement. It did not invent prediction, neural networks, language research, or the idea of machine intelligence. It made a long line of research unusually accessible to a large public audience. That is a big moment, not the beginning of time.'
    ],
    bridge: 'History gives us the timeline. Next, we need a practical definition that still works when AI is not sitting inside a chat window.',
    sourceLabel: 'Turing (1950) and Dartmouth’s history of the 1956 AI project',
    sourceUrl: 'https://home.dartmouth.edu/about/artificial-intelligence-ai-coined-dartmouth',
    confidence: 'Verified public evidence',
    diagram: 'timeline',
    visual: 'history'
  },
  {
    id: 'what-ai-is',
    number: '02',
    short: 'What AI is',
    title: 'AI is a way to make useful predictions',
    duration: '12 minutes',
    objective: 'Define an AI system through the task it supports, the information it receives, the pattern it uses, and the output a person must check.',
    introduction: [
      'Artificial intelligence is not one thing with one ability. It is a family of methods that help a computer perform a defined task. A system may predict a number, classify an image, recommend an option, recognise speech, generate a draft, or plan a sequence of steps.',
      'The useful definition is practical, not theatrical. For any AI system, ask four questions: What task is it helping with? What information does it receive? What pattern or method does it use? How will its output be checked? These questions work whether the system is hidden inside a phone, a map, a hospital workflow, or a chat window.'
    ],
    sections: [
      {
        heading: 'Prediction is broader than forecasting',
        paragraphs: [
          'In everyday language, a prediction often means a forecast about the future. In AI, prediction is broader: estimating a likely output from the input available. A system that labels an image “cat”, suggests the next word in a sentence, estimates a delivery time, or recommends a song is making a kind of prediction.',
          'The output changes, but the logic is similar. The system uses patterns drawn from data or rules to estimate what belongs next, what category fits, what value is likely, or which option may be useful. Useful does not mean certain. That is the bit people tend to skip when the answer sounds confident.'
        ]
      },
      {
        heading: 'A task is not a person',
        paragraphs: [
          'A navigation app can estimate travel time without understanding every reason a human might choose a route. A language model can draft a paragraph without holding beliefs about the subject. A medical image system can highlight a pattern without deciding what care a person should receive.',
          'Keeping the task in view prevents exaggerated claims. It also shows where human judgement still matters: setting the goal, deciding what data is appropriate, interpreting the output, and taking responsibility for the final decision. A useful tool is still not a person.'
        ]
      }
    ],
    exampleTitle: 'Worked example: a travel-time estimate',
    example: [
      'A map application receives a starting point, destination, road network, time of day, and signals about current traffic. Its task is to estimate how long a journey may take. The result is a useful prediction, not a promise that the journey will take exactly that long.',
      'A person can compare the estimate with weather, road closures, local knowledge, or simply the need to arrive early. The AI output supports a decision; it does not remove the need to make one.'
    ],
    bridge: 'Once we see AI as task-based prediction, the next question is obvious: where do the useful patterns come from?',
    sourceLabel: 'NIST AI Risk Management Framework: Generative AI Profile (2024)',
    sourceUrl: 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence',
    confidence: 'Verified public evidence',
    diagram: 'task'
  },
  {
    id: 'learning-patterns',
    number: '03',
    short: 'Learning patterns',
    title: 'From written rules to learning patterns',
    duration: '14 minutes',
    objective: 'Explain how a model can learn a pattern from examples, distinguish training from inference, and recognise why examples shape both performance and error.',
    introduction: [
      'Some computer systems work from rules people write in advance. If a form is incomplete, send it back for completion. If a password is wrong too many times, ask the person to reset it. These systems can be reliable when the rule is clear and the situation behaves itself.',
      'Other tasks are difficult to describe with one complete list of rules. A photograph can show a bicycle in different light, at different angles, and against different backgrounds. A customer request can use many different phrases to describe the same problem. In these cases, a model can learn from examples rather than from a rule for every possible wording or image.'
    ],
    sections: [
      {
        heading: 'Training gives a model a pattern to use later',
        paragraphs: [
          'During training, a model processes many examples. Some may be paired with labels: this image contains a bicycle; this message is about delivery; this recording contains a particular word. The model adjusts internal parameters so that a useful relationship between input and expected output becomes easier to reproduce.',
          'During inference, the model receives a new input and uses the pattern it learned to produce an output. It is not memorising a lesson in the human sense. It is estimating which output best fits the new input using patterns shaped by many earlier examples.'
        ]
      },
      {
        heading: 'Examples create strengths and blind spots',
        paragraphs: [
          'A training set is not a complete picture of the world. It contains the examples, labels, categories, and choices included by people and organisations. If relevant situations are rare, missing, poorly labelled, or outdated, the model may struggle when it meets them later.',
          'This is why an AI result needs context. A model can be highly useful for a well-defined task while still making mistakes outside the conditions represented in its examples. Performance is a question to test, not a quality to assume.'
        ]
      }
    ],
    exampleTitle: 'Worked example: learning a delivery category',
    example: [
      'Imagine a support team labels past messages as billing, delivery, or product help. It includes messages such as “Where is my parcel?”, “My order has not arrived”, and “The tracking page has not changed.” A model can learn that the messages have a related purpose even though the wording differs.',
      'Now imagine that the examples include almost no messages about rural delivery delays. The model may still return a category, but the team should expect uncertainty there. The pattern it learned is only as useful as the examples and testing behind it.'
    ],
    bridge: 'Learning from examples explains classification and recommendation. Next, the same principle meets the idea at the centre of modern language models: prediction.',
    sourceLabel: 'Stanford CRFM, On the Opportunities and Risks of Foundation Models (2021)',
    sourceUrl: 'https://crfm.stanford.edu/report.html',
    confidence: 'Verified public evidence',
    diagram: 'learning'
  }
]
