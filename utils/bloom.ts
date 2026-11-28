/** Bloom's revised taxonomy, low to high, with verbs you can observe. */
export const LEVELS = ['Remember', 'Understand', 'Apply', 'Analyse', 'Evaluate', 'Create'] as const
export type Level = typeof LEVELS[number]

export const VERBS: Record<Level, string[]> = {
  Remember: ['list', 'name', 'recall', 'label', 'state', 'define', 'recite', 'match'],
  Understand: ['explain', 'summarise', 'paraphrase', 'classify', 'describe', 'compare', 'give examples of', 'interpret'],
  Apply: ['use', 'demonstrate', 'perform', 'calculate', 'operate', 'complete', 'carry out', 'solve'],
  Analyse: ['diagnose', 'differentiate', 'troubleshoot', 'categorise', 'deconstruct', 'outline', 'prioritise', 'investigate'],
  Evaluate: ['judge', 'critique', 'justify', 'assess', 'recommend', 'defend', 'rate', 'verify'],
  Create: ['design', 'compose', 'build', 'plan', 'produce', 'devise', 'draft', 'invent']
}

/** Verbs that describe a state of mind. You cannot watch someone do them. */
export const FUZZY = ['understand', 'know', 'learn', 'appreciate', 'be aware of', 'grasp', 'realise', 'realize', 'be familiar with', 'believe', 'comprehend', 'master', 'internalise', 'see']

export function levelOf(verb: string): Level | null {
  const v = verb.trim().toLowerCase()
  for (const l of LEVELS) if (VERBS[l].includes(v)) return l
  return null
}
