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
  options: { text: string; correct: boolean }[]
  feedback: string
}

function pad(n: number) { return String(n).padStart(2, '0') }

function rowOf(card: StoryCard, num: number): ExportRow {
  let content = card.body
  if (card.kind === 'mcq') {
    const opts = (card.options || []).map((o, i) => `${String.fromCharCode(65 + i)}. ${o.trim() || '—'}`).join('\n')
    content = [card.question, opts].filter(Boolean).join('\n')
  }
  return {
    num: pad(num),
    title: card.title || 'Untitled',
    type: CARD_KINDS[card.kind]?.label ?? card.kind,
    content,
    visual: card.visual,
    narration: card.narration,
    notes: card.notes,
    time: `${card.duration || 0}s`
  }
}

export function buildSections(cards: StoryCard[], connections: Connection[], model: IdModel): ExportSection[] {
  const ordered = orderCards(cards, connections)
  const numberOf = new Map(ordered.map((c, i) => [c.id, i + 1]))

  if (!model.stages.length) {
    return [{ label: null, prompt: null, color: null, rows: ordered.map(c => rowOf(c, numberOf.get(c.id)!)) }]
  }

  const sections: ExportSection[] = []
  for (const stage of model.stages) {
    const rows = ordered.filter(c => c.stage === stage.id).map(c => rowOf(c, numberOf.get(c.id)!))
    sections.push({ label: stage.label, prompt: stage.prompt, color: stage.color, rows })
  }
  const loose = ordered.filter(c => !model.stages.some(s => s.id === c.stage))
  if (loose.length) {
    sections.push({ label: 'Additional screens', prompt: null, color: '#94A3B8', rows: loose.map(c => rowOf(c, numberOf.get(c.id)!)) })
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
    options: (card.options || []).map((text, oi) => ({ text, correct: oi === card.correctIndex })),
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
