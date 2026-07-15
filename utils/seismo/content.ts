export interface Objective {
  verb: string
  text: string
}

export const OBJECTIVES: Objective[] = [
  { verb: 'Tell apart', text: 'the P and S arrivals on a seismogram.' },
  { verb: 'Measure', text: 'the S-minus-P gap and turn it into a distance.' },
  { verb: 'Cross', text: "three stations' distances to fix an epicentre on the map." }
]

export interface AssessmentQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  because: string // shown after answering, factual
}

// Tests the taught concepts only. No trick options, no meta-jokes.
export const ASSESSMENT: AssessmentQuestion[] = [
  {
    id: 'first',
    prompt: 'Two waves leave the earthquake at the same instant. Which one reaches the station first?',
    options: ['The P wave', 'The S wave', 'They arrive together', 'It depends on the station'],
    correctIndex: 0,
    because: 'The answer was the P wave. P waves travel faster, so they always arrive first.'
  },
  {
    id: 'gap',
    prompt: 'One station shows a large S-minus-P gap and another shows a small one. What does the large gap tell you?',
    options: [
      'That station is closer to the epicentre',
      'That station is farther from the epicentre',
      'That earthquake was stronger there',
      'Nothing about distance'
    ],
    correctIndex: 1,
    because: 'The answer was farther. The gap widens with distance, because the faster P wave pulls further ahead of the S wave the longer they travel.'
  },
  {
    id: 'convert',
    prompt: 'You measured an S-minus-P gap of 30 seconds. Using the module\'s rule of thumb, roughly how far is the station from the epicentre?',
    options: ['About 4 km', 'About 30 km', 'About 240 km', 'About 3,000 km'],
    correctIndex: 2,
    because: 'The answer was about 240 km. The rule of thumb multiplies the gap in seconds by about 8: 30 × 8 = 240.'
  },
  {
    id: 'one-station',
    prompt: 'A single station gives you one distance. What does that distance tell you about where the earthquake was?',
    options: [
      'The exact spot',
      'How far away it was, but not in which direction',
      'The direction, but not how far',
      'Its magnitude'
    ],
    correctIndex: 1,
    because: 'The answer was how far, not which direction. One distance places the epicentre somewhere on a circle around the station.'
  },
  {
    id: 'three',
    prompt: 'Why does locating an epicentre take three stations rather than one or two?',
    options: [
      'Three readings are averaged for accuracy',
      'Two circles can cross at two points; a third circle picks the single point',
      'Each station only detects one wave type',
      'The third station measures magnitude'
    ],
    correctIndex: 1,
    because: 'The answer was that two circles cross at two points, and the third circle resolves which one is the epicentre.'
  }
]

export const PASS_MARK = 0.8

// Short reflective lines for the Thank You screen, chosen by how the learner
// actually did on the placement. Factual, not celebratory.
export function placementRemark(errorKm: number): string {
  if (errorKm <= 20) return 'Your placement sat almost exactly on the real epicentre.'
  if (errorKm <= 45) return 'Your placement fell inside the located zone, close to the real epicentre.'
  if (errorKm <= 90) return 'Your placement was near the crossing of the three circles, a little off the real epicentre.'
  return 'Your placement landed away from where the three circles cross. Re-reading the gaps would tighten it.'
}
