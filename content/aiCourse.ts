/**
 * From No AI to Know AI — content-led curriculum index.
 * Each module advances one connected narrative; interactions are introduced
 * only after the explanation and worked example that make them meaningful.
 */
import { historyModules } from './aiCourseHistory'
import { modernModules } from './aiCourseModern'

export type { AiModule, Confidence, TextSection } from './aiCourseTypes'

export const AI_MODULES = [...historyModules, ...modernModules]

export const AI_GLOSSARY = [
  ['Algorithm', 'A repeatable method for carrying out a task or solving a problem.'],
  ['Dataset', 'A collection of examples used to train, test, or analyse a system.'],
  ['Inference', 'Using a trained model to produce an output for a new input.'],
  ['Model', 'A system whose internal parameters have been adjusted to perform a task from data or examples.'],
  ['Token', 'A piece of text that a language model processes when it generates a response.'],
  ['Transformer', 'A neural-network architecture that uses attention to relate pieces of a sequence.'],
  ['Multimodal', 'Able to work across more than one type of information, such as text, images, audio, or video.'],
  ['Hallucination', 'A confident-looking output that is incorrect, unsupported, or invented.']
]
