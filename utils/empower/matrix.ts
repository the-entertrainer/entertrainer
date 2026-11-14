import { uid } from './id'

export interface MatrixOption {
  id: string
  name: string
}

export interface MatrixCriterion {
  id: string
  name: string
  weight: number
}

export interface MatrixState {
  options: MatrixOption[]
  criteria: MatrixCriterion[]
  scores: Record<string, number>
}

export interface RankedOption {
  id: string
  name: string
  points: number
}

export function scoreKey(optionId: string, criterionId: string): string {
  return `${optionId}:${criterionId}`
}

export function emptyMatrix(): MatrixState {
  return {
    options: [
      { id: 'opt-1', name: 'Option 1' },
      { id: 'opt-2', name: 'Option 2' },
    ],
    criteria: [
      { id: 'crit-1', name: 'Cost', weight: 50 },
      { id: 'crit-2', name: 'Quality', weight: 50 },
    ],
    scores: {},
  }
}

export function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(10, Math.max(0, value))
}

export function clampWeight(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, Math.round(value)))
}

export function weightSum(state: MatrixState): number {
  return state.criteria.reduce((sum, criterion) => sum + clampWeight(criterion.weight), 0)
}

export function pointsFor(state: MatrixState, optionId: string): number {
  let total = 0
  for (const criterion of state.criteria) {
    const score = clampScore(state.scores[scoreKey(optionId, criterion.id)] ?? 0)
    total += clampWeight(criterion.weight) * (score / 10)
  }
  return total
}

export function formatPoints(value: number): string {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

export function anyScore(state: MatrixState): boolean {
  return Object.values(state.scores).some(score => clampScore(score) > 0)
}

export function ranked(state: MatrixState): RankedOption[] | null {
  if (weightSum(state) !== 100) return null
  if (!state.options.length) return null
  return state.options
    .map(option => ({ id: option.id, name: option.name.trim() || 'Untitled option', points: pointsFor(state, option.id) }))
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name))
}

export function winnerText(state: MatrixState): string {
  const sum = weightSum(state)
  if (sum !== 100) return `Weights add up to ${sum}. They need to add up to 100.`
  if (!anyScore(state)) return 'Name the options. Weight what matters. See what wins.'
  const rows = ranked(state) ?? []
  if (!rows.length) return 'Add an option to see a winner.'
  const top = rows[0].points
  const leaders = rows.filter(row => Math.abs(row.points - top) < 0.05)
  if (leaders.length > 1) {
    return `Tie between ${leaders.map(row => row.name).join(' and ')} at ${formatPoints(top)} points.`
  }
  return `${rows[0].name} wins with ${formatPoints(rows[0].points)} points.`
}

export function encodeMatrix(state: MatrixState): string {
  return encodeURIComponent(JSON.stringify(state))
}

export function decodeMatrix(hash: string): MatrixState | null {
  const raw = hash.replace(/^#/, '')
  if (!raw.startsWith('d=')) return null
  try {
    const data = JSON.parse(decodeURIComponent(raw.slice(2))) as MatrixState
    if (!data || !Array.isArray(data.options) || !Array.isArray(data.criteria) || data.options.length < 1) return null
    const options = data.options.slice(0, 12).map((option, index) => ({
      id: String(option.id || uid('opt')),
      name: String(option.name ?? `Option ${index + 1}`).slice(0, 80),
    }))
    const criteria = data.criteria.slice(0, 12).map((criterion, index) => ({
      id: String(criterion.id || uid('crit')),
      name: String(criterion.name ?? `Criterion ${index + 1}`).slice(0, 80),
      weight: clampWeight(Number(criterion.weight)),
    }))
    const scores: Record<string, number> = {}
    if (data.scores && typeof data.scores === 'object') {
      for (const [key, value] of Object.entries(data.scores)) scores[key] = clampScore(Number(value))
    }
    return { options, criteria, scores }
  } catch {
    return null
  }
}

export function matrixAsText(state: MatrixState): string {
  const lines = [winnerText(state), '']
  for (const option of state.options) {
    const bits = state.criteria.map(criterion => {
      const score = clampScore(state.scores[scoreKey(option.id, criterion.id)] ?? 0)
      return `${criterion.name || 'Criterion'} ${score}/10 (weight ${clampWeight(criterion.weight)})`
    })
    lines.push(`${option.name || 'Untitled'}: ${formatPoints(pointsFor(state, option.id))} points`)
    lines.push(bits.join('; '))
  }
  return lines.join('\n')
}

export function evenWeights(state: MatrixState): MatrixState {
  const count = state.criteria.length || 1
  const base = Math.floor(100 / count)
  let spare = 100 - base * count
  return {
    ...state,
    criteria: state.criteria.map(criterion => {
      const weight = base + (spare > 0 ? 1 : 0)
      if (spare > 0) spare -= 1
      return { ...criterion, weight }
    }),
  }
}
