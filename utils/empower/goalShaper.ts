export type GoalMode = 'personal' | 'work' | 'learning'

export interface GoalInput {
  goal: string
  mode: GoalMode
  deadline: string
  measure: string
  audience: string
  condition: string
  degree: string
}

export interface GoalPlan {
  smart: string
  steps: string[]
  bloomLevel: string | null
  audience: string | null
  behaviour: string | null
  condition: string | null
  degree: string | null
  vague: boolean
  assumedDeadline: boolean
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const VAGUE: Record<string, { level: string; verb: string }> = {
  know: { level: 'Understand', verb: 'explain' },
  learn: { level: 'Understand', verb: 'explain' },
  understand: { level: 'Understand', verb: 'explain' },
  get: { level: 'Apply', verb: 'demonstrate' },
  improve: { level: 'Apply', verb: 'demonstrate' },
  master: { level: 'Apply', verb: 'demonstrate' },
  grasp: { level: 'Understand', verb: 'explain' },
  familiarize: { level: 'Understand', verb: 'explain' },
  familiarise: { level: 'Understand', verb: 'explain' },
}

const BLOOM: { level: string; verbs: string[] }[] = [
  { level: 'Remember', verbs: ['define', 'list', 'name', 'recall', 'identify', 'state', 'recognize', 'recognise'] },
  { level: 'Understand', verbs: ['explain', 'describe', 'summarise', 'summarize', 'classify', 'interpret', 'discuss'] },
  { level: 'Apply', verbs: ['use', 'solve', 'demonstrate', 'apply', 'implement', 'calculate', 'show'] },
  { level: 'Analyze', verbs: ['analyze', 'analyse', 'compare', 'contrast', 'differentiate', 'examine', 'distinguish'] },
  { level: 'Evaluate', verbs: ['evaluate', 'judge', 'critique', 'justify', 'defend', 'assess', 'argue'] },
  { level: 'Create', verbs: ['create', 'design', 'compose', 'build', 'produce', 'develop', 'write'] },
]

export function formatDeadline(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!match) return iso.trim()
  const month = MONTHS[Number(match[2]) - 1]
  const day = Number(match[3])
  if (!month || !day) return iso.trim()
  return `${day} ${month} ${match[1]}`
}

function stem(word: string): string {
  return word.toLowerCase().replace(/[^a-z]/g, '')
}

function behaviourOf(goal: string): { text: string; level: string; vague: boolean } {
  const words = goal.trim().replace(/[.?!]+$/, '').split(/\s+/).filter(Boolean)
  const first = stem(words[0] || '')
  const vague = VAGUE[first]
  if (vague) {
    const rest = words.slice(1).join(' ')
    return { text: rest ? `${vague.verb} ${rest}` : vague.verb, level: vague.level, vague: true }
  }
  for (const band of BLOOM) {
    if (band.verbs.includes(first)) return { text: words.join(' '), level: band.level, vague: false }
  }
  for (const word of words) {
    const token = stem(word)
    for (const band of BLOOM) {
      if (band.verbs.includes(token)) return { text: words.join(' '), level: band.level, vague: false }
    }
  }
  const rest = words.join(' ')
  return { text: rest ? `demonstrate ${rest}` : 'demonstrate the skill', level: 'Apply', vague: true }
}

function given(condition: string): string {
  const value = condition.trim().replace(/[.]+$/, '')
  if (!value) return 'Given the materials for this goal'
  if (/^(given|when|after|using|with|during)\b/i.test(value)) return value
  return `Given ${value}`
}

function subjectLine(goal: string, subject: 'I' | 'We'): string {
  const cleaned = goal.trim().replace(/[.?!]+$/, '')
  if (/^(i|we)\b/i.test(cleaned)) return cleaned
  const lower = cleaned[0] === cleaned[0].toUpperCase() && cleaned.slice(1) === cleaned.slice(1).toLowerCase()
    ? cleaned[0].toLowerCase() + cleaned.slice(1)
    : cleaned
  return `${subject} will ${lower}`
}

export function shapeGoal(input: GoalInput): GoalPlan {
  const goal = input.goal.trim()
  const behaviour = behaviourOf(goal)
  const when = input.deadline.trim()
  const assumedDeadline = !when
  const whenText = when ? formatDeadline(when) : '30 days from today'
  const measure = input.measure.trim() || 'a result you can point to'

  if (input.mode === 'learning') {
    const audience = input.audience.trim() || 'the learner'
    const condition = given(input.condition)
    const degree = input.degree.trim().replace(/[.]+$/, '')
    let smart = `${condition}, ${audience} will ${behaviour.text}`
    if (degree) smart += `, ${degree}`
    smart += when ? ` by ${whenText}` : ''
    smart += '.'
    const steps = [
      `Objective: ${smart}`,
      `Audience: ${audience}.`,
      `Behaviour: ${behaviour.text}.`,
      `Condition: ${condition}.`,
      degree ? `Degree: ${degree}.` : 'Degree: add the standard that counts as done.',
      `Bloom level: ${behaviour.level}.`,
      behaviour.vague
        ? 'The opening verb was vague, so this plan uses a plain Bloom verb. Change it if you meant a different one.'
        : 'Read the verb out loud. If a learner could not show it, pick a sharper one.',
      when
        ? `Review the evidence on ${whenText}.`
        : 'No date was entered. Review in 30 days, or set a real date.',
    ]
    return {
      smart,
      steps,
      bloomLevel: behaviour.level,
      audience,
      behaviour: behaviour.text,
      condition,
      degree: degree || null,
      vague: behaviour.vague,
      assumedDeadline,
    }
  }

  const subject = input.mode === 'work' ? 'We' : 'I'
  const line = subjectLine(goal, subject)
  const smart = `By ${whenText}, ${line}, measured by ${measure}.`
  const steps = [
    `Finish line: ${smart}`,
    `This week, spend one sitting on the first piece of “${goal}”.`,
    `Track it by ${measure}.`,
    'Write down the one thing that usually stops this, and remove it before the next sitting.',
    assumedDeadline
      ? 'No date was entered. This plan uses 30 days. Change it if that is wrong.'
      : `Review on ${whenText}.`,
  ]
  return {
    smart,
    steps,
    bloomLevel: null,
    audience: null,
    behaviour: null,
    condition: null,
    degree: null,
    vague: behaviour.vague,
    assumedDeadline,
  }
}

export function goalAsText(plan: GoalPlan): string {
  const lines = [plan.smart, '', ...plan.steps.map((step, index) => `${index + 1}. ${step}`)]
  if (plan.bloomLevel) lines.push('', `Bloom level: ${plan.bloomLevel}`)
  return lines.join('\n')
}
