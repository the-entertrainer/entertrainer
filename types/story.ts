export interface Scene {
  id: string
  title: string
  visualDescription: string
  narration: string
  interactions: string
  navigation: string
  duration: number
  status: string
  x: number
  y: number
}

export interface Connection {
  id: string
  from: string
  to: string
}

export interface McqOption {
  id: string
  text: string
  correct: boolean
}

export interface Mcq {
  id: string
  sceneId: string | null
  question: string
  options: McqOption[]
  explanation: string
}

export interface StoryProject {
  version: string
  title: string
  summary: string
  learningObjectives: string[]
  created: string
  scenes: Scene[]
  connections: Connection[]
  mcqs: Mcq[]
}
