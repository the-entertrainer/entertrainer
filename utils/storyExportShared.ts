import type { Connection, StoryCard } from '~/types/story'
import { CARD_KINDS } from './storyCards'
import type { IdModel } from './idModels'
import { orderCards } from './storyGraph'

// Both document exports share one shape: screens grouped into the model's
// stages (template-style sections), each section led by its guiding
// question, with unassigned screens collected at the end.

export interface ExportRow {
  num: string
  title: string
  type: string
  content: string
  visual: string
  narration: string
  notes: string
  time: string
}

export interface ExportSection {
  label: string | null   // null = flat table (freeform, no sections)
  prompt: string | null
  color: string | null   // stage accent, hex with #
  rows: ExportRow[]
}

export interface McqRow {
  num: string
  screen: string
  question: string
  options: { text: string; correct: boolean; goto: string | null }[]
  feedback: string
}

function pad(n: number) { return String(n).padStart(2, '0') }

// "If A → Screen 04 · If B → Screen 07" for an MCQ card's answer branches.
function branchSummary(card: StoryCard, connections: Connection[], numberOf: Map<string, number>): string {
  if (card.kind !== 'mcq') return ''
  const parts: string[] = []
  for (let i = 0; i < 4; i++) {
    const conn = connections.find(c => c.from === card.id && c.fromPort === `opt-${i}`)
    const num = conn ? numberOf.get(conn.to) : undefined
    if (num) parts.push(`If ${String.fromCharCode(65 + i)} → Screen ${pad(num)}`)
  }
  return parts.join(' · ')
}

function rowOf(card: StoryCard, num: number, connections: Connection[], numberOf: Map<string, number>): ExportRow {
  let content = card.body
  if (card.kind === 'mcq') {
    const opts = (card.options || []).map((o, i) => `${String.fromCharCode(65 + i)}. ${o.trim() || '—'}`).join('\n')
    content = [card.question, opts].filter(Boolean).join('\n')
  }
  const branches = branchSummary(card, connections, numberOf)
  return {
    num: pad(num),
    title: card.title || 'Untitled',
    type: CARD_KINDS[card.kind]?.label ?? card.kind,
    content,
    visual: card.visual,
    narration: card.narration,
    notes: [card.notes, branches && `Branching: ${branches}`].filter(Boolean).join('\n'),
    time: `${card.duration || 0}s`
  }
}

export interface PlanRow {
  label: string
  prompt: string
  color: string
  notes: string
}

// Process frameworks export their phases as a Design Plan table — the
// designer's project worksheet — never as screen groupings.
export function buildPlanRows(model: IdModel, plan: Record<string, string> | undefined): PlanRow[] {
  if (model.kind !== 'process') return []
  return model.stages.map(s => ({
    label: s.label,
    prompt: s.prompt,
    color: s.color,
    notes: String(plan?.[s.id] || '')
  }))
}

export function buildSections(cards: StoryCard[], connections: Connection[], model: IdModel): ExportSection[] {
  const ordered = orderCards(cards, connections)
  const numberOf = new Map(ordered.map((c, i) => [c.id, i + 1]))
  const row = (c: StoryCard) => rowOf(c, numberOf.get(c.id)!, connections, numberOf)

  // Flat table when there are no learner-facing stages: freeform, and all
  // process frameworks (their phases belong to the plan, not the screens).
  if (model.kind === 'process' || !model.stages.length) {
    return [{ label: null, prompt: null, color: null, rows: ordered.map(row) }]
  }

  const sections: ExportSection[] = []
  for (const stage of model.stages) {
    const rows = ordered.filter(c => c.stage === stage.id).map(row)
    sections.push({ label: stage.label, prompt: stage.prompt, color: stage.color, rows })
  }
  const loose = ordered.filter(c => !model.stages.some(s => s.id === c.stage))
  if (loose.length) {
    sections.push({ label: 'Additional screens', prompt: null, color: '#94A3B8', rows: loose.map(row) })
  }
  return sections
}

export function buildMcqRows(cards: StoryCard[], connections: Connection[]): McqRow[] {
  const ordered = orderCards(cards, connections)
  const numberOf = new Map(ordered.map((c, i) => [c.id, i + 1]))
  return ordered.filter(c => c.kind === 'mcq').map((card, i) => ({
    num: pad(i + 1),
    screen: `Screen ${pad(numberOf.get(card.id)!)}: ${card.title || 'Knowledge Check'}`,
    question: card.question,
    options: (card.options || []).map((text, oi) => {
      const conn = connections.find(c => c.from === card.id && c.fromPort === `opt-${oi}`)
      const num = conn ? numberOf.get(conn.to) : undefined
      return { text, correct: oi === card.correctIndex, goto: num ? `Screen ${pad(num)}` : null }
    }),
    feedback: card.feedback
  }))
}

// Soft tint of a stage color for section-header fills (hex, no '#').
export function hexTint(hex: string | null, strength = 0.86): string {
  if (!hex) return 'F1F1F0'
  const n = hex.replace('#', '')
  const mix = (i: number) => {
    const c = parseInt(n.slice(i, i + 2), 16)
    return Math.round(c + (255 - c) * strength).toString(16).padStart(2, '0')
  }
  return `${mix(0)}${mix(2)}${mix(4)}`.toUpperCase()
}

// Darker shade of a stage color for section-header text (hex, no '#').
export function hexShade(hex: string | null, strength = 0.45): string {
  if (!hex) return '333333'
  const n = hex.replace('#', '')
  const mix = (i: number) => {
    const c = parseInt(n.slice(i, i + 2), 16)
    return Math.round(c * (1 - strength)).toString(16).padStart(2, '0')
  }
  return `${mix(0)}${mix(2)}${mix(4)}`.toUpperCase()
}
