import type { AssessmentQuestion, GauntletQuestion } from '~/types/confidenceTrap'

export interface LessonSection {
  id: string
  heading: string
  paragraphs: string[]
}

// Editorial long-form lesson content. Grounded in Kruger & Dunning (1999,
// Journal of Personality and Social Psychology, 77(6), 1121-1134) and the
// later statistical-artifact critique (Nuhfer et al.; Gignac & Zajenkowski,
// 2020) rather than the popularised "Mount Stupid" graph, which is not
// what either paper's data actually shows.
export const LESSON_SECTIONS: LessonSection[] = [
  {
    id: 'the-claim',
    heading: 'The claim',
    paragraphs: [
      'In 1999, Justin Kruger and David Dunning published four studies testing how well people judge their own performance on tasks involving humor, grammar, and logical reasoning. Participants took a test, then estimated where their score would rank against everyone else in the room.',
      'People who scored in the bottom quartile overestimated their standing by the widest margin, often placing themselves near the middle of the pack. People who scored in the top quartile were closer to accurate, and in some conditions slightly underestimated their own rank.'
    ]
  },
  {
    id: 'the-mechanism',
    heading: 'The proposed mechanism',
    paragraphs: [
      'Kruger and Dunning\'s explanation was not that weak performers are arrogant. It was narrower and more specific: judging the quality of an answer in a domain requires much of the same skill as producing a good answer in that domain.',
      'If you lack the grammar knowledge to write a correct sentence, you also lack the grammar knowledge to notice that your sentence is wrong. The deficit shows up twice, once in the performance and once in the judgment of the performance.'
    ]
  },
  {
    id: 'the-top',
    heading: 'What actually happens at the top',
    paragraphs: [
      'The popular version of this idea shows a single curve that rises to "Mount Stupid," falls into a "Valley of Despair," then climbs a "Slope of Enlightenment." That graph does not come from the original paper. It is a later illustration that oversimplifies the finding into a story with a shape.',
      'What Kruger and Dunning actually reported was two lines across four skill quartiles: perceived ability and actual ability. Both tend to rise together. The gap between them is largest at the bottom and narrows steadily toward the top, where high performers occasionally rate themselves a little lower than their real standing. There is no single hump.'
    ]
  },
  {
    id: 'the-pushback',
    heading: 'The pushback',
    paragraphs: [
      'The effect is not settled science. Ed Nuhfer and colleagues showed that a similar-looking pattern can be produced from randomly generated data, which suggests some of the effect may be a statistical artifact of regression to the mean combined with a general tendency for most people to rate themselves as above average.',
      'Gignac and Zajenkowski (2020) reanalyzed the relationship with more rigorous methods and found a much smaller effect than the original studies suggested. Other researchers have pushed back on their statistical choices in turn. As of now, this is an active, unresolved argument in the literature, not a closed case.'
    ]
  },
  {
    id: 'why-measure',
    heading: 'Why this module measures you',
    paragraphs: [
      'Reading about a bias and noticing it in yourself are different skills, and the second one is the harder of the two. So this module is quietly logging two things as you go: how confident you feel after each section of this lesson, and how your confidence compares to your actual accuracy in the exercise that follows.',
      'Nothing about that measurement is hidden from you. You are being told about it now, before it happens, and you will see the actual result at the end. That is the whole mechanism.'
    ]
  }
]

// Hands-On domain: medieval English fiscal history. Chosen because almost
// no adult has formal exposure to it, so stated confidence has to come
// from reasoning rather than recall; it is specific enough that plausible
// wrong answers can be written from real adjacent facts rather than
// invented ones; and it carries no emotional charge that would compete
// with the metacognitive task itself.
export const GAUNTLET_QUESTIONS: GauntletQuestion[] = [
  {
    id: 'scutage',
    prompt: 'What was scutage, in medieval English feudal law?',
    options: [
      'A tax on hearths and fireplaces',
      'A payment made in place of military service owed to the crown',
      'A toll charged on ships entering English ports',
      'A fine imposed on unlicensed markets'
    ],
    correctIndex: 1
  },
  {
    id: 'domesday',
    prompt: 'The Domesday Book, completed in 1086, was compiled primarily to:',
    options: [
      'Record noble titles and coats of arms',
      'Catalogue church relics across England',
      'Assess land and resources for taxation',
      'Document trade routes to the continent'
    ],
    correctIndex: 2
  },
  {
    id: 'danegeld',
    prompt: 'What was Danegeld originally raised to do?',
    options: [
      'Fund the construction of cathedrals',
      'Pay tribute to Viking raiders',
      'Finance the Norman Conquest',
      'Repay loans to Italian bankers'
    ],
    correctIndex: 1
  },
  {
    id: 'tallage',
    prompt: 'Unlike other feudal levies, tallage could be imposed by the crown on royal demesne and towns:',
    options: [
      'Only with baronial consent',
      'Only once per reign',
      'Without requiring consent',
      'Only in years of war'
    ],
    correctIndex: 2
  },
  {
    id: 'hearth-tax',
    prompt: 'The hearth tax, introduced in 1662, assessed a household\'s liability based on:',
    options: [
      'The number of servants employed',
      'The size of its landholding',
      'The number of fireplaces in the house',
      'The value of its livestock'
    ],
    correctIndex: 2
  }
]

// Assessment: tests the taught mechanism, not more trivia. No meta-jokes
// in the answer options, which was flagged as a validity flaw earlier.
export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'why-overestimate',
    prompt: 'According to Kruger and Dunning\'s account, why do low performers tend to overestimate their ability?',
    options: [
      'They receive less feedback than high performers',
      'The same skill needed to perform well is needed to judge performance accurately, so weak performers lack the skill to detect their own weakness',
      'They are naturally more overconfident as a personality trait',
      'They compare themselves only to weaker peers, on purpose'
    ],
    correctIndex: 1
  },
  {
    id: 'top-performers',
    prompt: 'In the actual study, what happened to high performers\' self-assessments?',
    options: [
      'They also overestimated, but less dramatically',
      'They rated themselves with near-perfect accuracy in every case',
      'They tended to slightly underestimate their relative standing',
      'They declined to estimate their performance at all'
    ],
    correctIndex: 2
  },
  {
    id: 'main-critique',
    prompt: 'What is the main critique researchers have raised about the Dunning-Kruger effect?',
    options: [
      'The original sample size was too small to publish',
      'The pattern may be explainable as a statistical artifact from regression to the mean and general self-enhancement bias',
      'The effect only applies to judgments about humor',
      'No one has ever attempted to replicate it'
    ],
    correctIndex: 1
  },
  {
    id: 'slider-purpose',
    prompt: 'In this module, what did the confidence slider in the Hands-On section actually measure?',
    options: [
      'Reaction time',
      'A self-reported estimate of certainty, compared afterward to actual correctness',
      'A guessed final score for the whole module',
      'A preference between two answer choices'
    ],
    correctIndex: 1
  },
  {
    id: 'expertise-lowers-confidence',
    prompt: 'Why does expertise sometimes come with lower stated confidence, not higher?',
    options: [
      'Experts are trained to appear modest in public',
      'Greater knowledge of a domain reveals more of what remains uncertain or complex within it',
      'Experts are penalized for confidence in surveys',
      'Confidence naturally declines with age'
    ],
    correctIndex: 1
  }
]

export const ASSESSMENT_PASS_THRESHOLD = 0.8
