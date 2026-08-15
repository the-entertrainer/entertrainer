export type Confidence = 'Verified public evidence' | 'Informed analysis'

export type TextSection = {
  heading: string
  paragraphs: string[]
}

export type AiModule = {
  id: string
  number: string
  short: string
  title: string
  duration: string
  objective: string
  introduction: string[]
  sections: TextSection[]
  exampleTitle: string
  example: string[]
  bridge: string
  sourceLabel: string
  sourceUrl: string
  confidence: Confidence
  diagram: 'timeline' | 'task' | 'learning' | 'prediction' | 'landscape' | 'capabilities' | 'responsibility'
  visual?: 'history' | 'models'
  video?: { title: string; url: string; question: string }
  activity?: 'predictionLab' | 'evidence'
}
