import { oneEqualsTwoLesson } from '~/content/oneEqualsTwoLesson'
import {
  LESSON_SCHEMA_VERSION,
  type AccordionItem,
  type Block,
  type BlockType,
  type Flashcard,
  type KnowledgeCheckOption,
  type Lesson,
  type LessonDocument,
  type ProcessStep,
  type SourcesBlock,
} from '~/types/lesson'

/**
 * Course Studio reads and writes schemaVersion 1.
 * A bare Lesson (no wrapper) still imports, so hand-written lessons keep working.
 * Export always writes a LessonDocument.
 *
 * TODO: SCORM 1.2, SCORM 2004, and xAPI exporters implement LessonPackageExporter
 * in types/lesson.ts and consume this document only. Do not scrape the player.
 */

export const COURSE_STUDIO_STORAGE_KEY = 'entertrainer.course-studio.v1'

export const BLOCK_MENU: { type: BlockType; label: string; hint: string }[] = [
  { type: 'heading', label: 'Heading', hint: 'Section title' },
  { type: 'text', label: 'Text', hint: 'Paragraph' },
  { type: 'statement', label: 'Statement', hint: 'A line set apart from the paragraph' },
  { type: 'quote', label: 'Quote', hint: 'A quotation and an optional attribution' },
  { type: 'image', label: 'Image', hint: 'Picture with alt text and a caption' },
  { type: 'process', label: 'Process', hint: 'Steps the learner reveals one at a time' },
  { type: 'accordion', label: 'Accordion', hint: 'Items that open and close' },
  { type: 'knowledgeCheck', label: 'Knowledge check', hint: 'One question, one correct answer, feedback' },
  { type: 'flashcards', label: 'Flashcards', hint: 'Cards with a front and a back' },
  { type: 'reflection', label: 'Reflection', hint: 'A prompt and a place to write' },
  { type: 'sources', label: 'Sources', hint: 'References with links' },
]

const BLOCK_TYPES = new Set<string>(BLOCK_MENU.map(item => item.type))

export function blockLabel(type: BlockType): string {
  return BLOCK_MENU.find(item => item.type === type)?.label ?? type
}

export function newId(prefix = 'b'): string {
  const uuid = globalThis.crypto?.randomUUID?.()
  if (uuid) return `${prefix}-${uuid}`
  return `${prefix}-${Math.random().toString(36).slice(2, 12)}`
}

export function cloneLesson(lesson: Lesson): Lesson {
  return JSON.parse(JSON.stringify(lesson)) as Lesson
}

export function cloneBlock(block: Block): Block {
  const copy = JSON.parse(JSON.stringify(block)) as Block
  copy.id = newId('b')
  if (copy.type === 'knowledgeCheck') {
    const map = new Map<string, string>()
    copy.options = copy.options.map((option) => {
      const id = newId('opt')
      map.set(option.id, id)
      return { ...option, id }
    })
    copy.correctId = map.get(copy.correctId) ?? copy.options[0]?.id ?? ''
  }
  if (copy.type === 'flashcards') {
    copy.cards = copy.cards.map(card => ({ ...card, id: newId('card') }))
  }
  return copy
}

export function createBlock(type: BlockType): Block {
  const id = newId('b')
  switch (type) {
    case 'heading':
      return { id, type, text: '', level: 2 }
    case 'text':
      return { id, type, content: '' }
    case 'statement':
      return { id, type, text: '', style: 'insight' }
    case 'quote':
      return { id, type, text: '', attribution: '' }
    case 'image':
      return { id, type, src: '', alt: '', caption: '', credit: '' }
    case 'process':
      return { id, type, title: '', steps: [{ label: '', detail: '' }] }
    case 'knowledgeCheck': {
      const first = newId('opt')
      return {
        id,
        type,
        question: '',
        options: [
          { id: first, text: '' },
          { id: newId('opt'), text: '' },
        ],
        correctId: first,
        feedback: { correct: '', incorrect: '' },
      }
    }
    case 'flashcards':
      return { id, type, title: '', cards: [{ id: newId('card'), front: '', back: '' }] }
    case 'accordion':
      return { id, type, title: '', items: [{ title: '', content: '' }] }
    case 'reflection':
      return { id, type, prompt: '', placeholder: '' }
    case 'sources':
      return { id, type, items: [{ id: 1, title: '', source: '', href: '' }] }
  }
}

export function blankLesson(): Lesson {
  const heading = createBlock('heading')
  return {
    id: newId('lesson'),
    slug: 'untitled-lesson',
    title: 'Untitled lesson',
    objective: '',
    dek: '',
    category: '',
    minutes: 5,
    blocks: [heading],
  }
}

export function sampleLesson(): Lesson {
  return cloneLesson(oneEqualsTwoLesson)
}

export function blockExcerpt(block: Block): string {
  const raw = excerptOf(block).replace(/\s+/g, ' ').trim()
  if (raw.length <= 72) return raw
  return `${raw.slice(0, 71).trimEnd()}…`
}

export function blockSummary(block: Block): string {
  const label = blockLabel(block.type)
  const excerpt = blockExcerpt(block)
  return excerpt ? `${label}: ${excerpt}` : label
}

function excerptOf(block: Block): string {
  switch (block.type) {
    case 'heading':
    case 'statement':
      return block.text
    case 'text':
      return block.content
    case 'quote':
      return block.text
    case 'image':
      return block.alt || block.caption || block.src
    case 'process':
      return block.title || block.steps[0]?.label || ''
    case 'knowledgeCheck':
      return block.question
    case 'flashcards':
      return block.title || block.cards[0]?.front || ''
    case 'accordion':
      return block.title || block.items[0]?.title || ''
    case 'reflection':
      return block.prompt
    case 'sources':
      return block.items[0]?.title || ''
  }
}

export function toDocument(lesson: Lesson): LessonDocument {
  return {
    schemaVersion: LESSON_SCHEMA_VERSION,
    lesson: cloneLesson(lesson),
  }
}

export function serializeLessonDocument(document: LessonDocument, pretty = false): string {
  const json = JSON.stringify(document, null, pretty ? 2 : 0)
  return pretty ? `${json}\n` : json
}

export function fileSlug(slug: string): string {
  const clean = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return clean || 'lesson'
}

export function parseLessonDocument(input: unknown): LessonDocument {
  if (!isRecord(input)) throw new Error('Lesson file must be a JSON object.')
  if ('schemaVersion' in input) {
    if (input.schemaVersion !== LESSON_SCHEMA_VERSION) {
      throw new Error(`This editor reads lesson schema version ${LESSON_SCHEMA_VERSION}. This file is version ${String(input.schemaVersion)}.`)
    }
    if (!('lesson' in input)) throw new Error('Lesson file is missing the lesson object.')
    return { schemaVersion: LESSON_SCHEMA_VERSION, lesson: parseLesson(input.lesson) }
  }
  return { schemaVersion: LESSON_SCHEMA_VERSION, lesson: parseLesson(input) }
}

function parseLesson(input: unknown): Lesson {
  if (!isRecord(input)) throw new Error('Lesson must be an object.')
  if (!Array.isArray(input.blocks)) throw new Error('Lesson needs a blocks array.')
  const seen = new Set<string>()
  const blocks = input.blocks.map((block, index) => parseBlock(block, index, seen))
  const lesson: Lesson = {
    id: text(input.id) || newId('lesson'),
    slug: text(input.slug) || 'lesson',
    title: text(input.title),
    objective: text(input.objective),
    dek: text(input.dek),
    category: text(input.category),
    minutes: minutesOf(input.minutes),
    blocks,
  }
  const hero = text(input.hero)
  const heroAlt = text(input.heroAlt)
  if (hero) lesson.hero = hero
  if (heroAlt) lesson.heroAlt = heroAlt
  return lesson
}

function parseBlock(input: unknown, index: number, seen: Set<string>): Block {
  const where = `Block ${index + 1}`
  if (!isRecord(input)) throw new Error(`${where} must be an object.`)
  const type = input.type
  if (typeof type !== 'string' || !type) throw new Error(`${where} is missing a type.`)
  if (!BLOCK_TYPES.has(type)) throw new Error(`${where} has an unknown type "${type}".`)
  const id = uniqueId(input.id, seen, 'b')
  switch (type as BlockType) {
    case 'heading':
      return {
        id,
        type: 'heading',
        text: text(input.text),
        level: input.level === 3 ? 3 : 2,
      }
    case 'text':
      return {
        id,
        type: 'text',
        content: text(input.content),
        ...(input.lead === true ? { lead: true } : {}),
      }
    case 'statement':
      return {
        id,
        type: 'statement',
        text: text(input.text),
        style: statementStyle(input.style),
      }
    case 'quote':
      return {
        id,
        type: 'quote',
        text: text(input.text),
        attribution: text(input.attribution),
      }
    case 'image':
      return {
        id,
        type: 'image',
        src: text(input.src),
        alt: text(input.alt),
        caption: text(input.caption),
        credit: text(input.credit),
      }
    case 'process':
      return {
        id,
        type: 'process',
        title: text(input.title),
        steps: parseSteps(input.steps),
      }
    case 'knowledgeCheck':
      return parseKnowledge(input, id)
    case 'flashcards':
      return {
        id,
        type: 'flashcards',
        title: text(input.title),
        cards: parseCards(input.cards),
      }
    case 'accordion':
      return {
        id,
        type: 'accordion',
        title: text(input.title),
        items: parseAccordion(input.items),
      }
    case 'reflection':
      return {
        id,
        type: 'reflection',
        prompt: text(input.prompt),
        placeholder: text(input.placeholder),
      }
    case 'sources':
      return {
        id,
        type: 'sources',
        items: parseSources(input.items),
      }
  }
}

function parseKnowledge(input: Record<string, unknown>, id: string): Block {
  const seen = new Set<string>()
  const options: KnowledgeCheckOption[] = Array.isArray(input.options)
    ? input.options.filter(isRecord).map(option => ({
      id: uniqueId(option.id, seen, 'opt'),
      text: text(option.text),
    }))
    : []
  const correctId = text(input.correctId)
  const feedback = isRecord(input.feedback) ? input.feedback : {}
  return {
    id,
    type: 'knowledgeCheck',
    question: text(input.question),
    options,
    correctId: options.some(option => option.id === correctId) ? correctId : (options[0]?.id ?? ''),
    feedback: {
      correct: text(feedback.correct),
      incorrect: text(feedback.incorrect),
    },
  }
}

function parseSteps(input: unknown): ProcessStep[] {
  if (!Array.isArray(input)) return []
  return input.filter(isRecord).map(step => ({
    label: text(step.label),
    detail: text(step.detail),
    ...(step.bad === true ? { bad: true } : {}),
    note: text(step.note),
  }))
}

function parseCards(input: unknown): Flashcard[] {
  if (!Array.isArray(input)) return []
  const seen = new Set<string>()
  return input.filter(isRecord).map(card => ({
    id: uniqueId(card.id, seen, 'card'),
    front: text(card.front),
    back: text(card.back),
  }))
}

function parseAccordion(input: unknown): AccordionItem[] {
  if (!Array.isArray(input)) return []
  return input.filter(isRecord).map(item => ({
    title: text(item.title),
    content: text(item.content),
  }))
}

function parseSources(input: unknown): SourcesBlock['items'] {
  if (!Array.isArray(input)) return []
  return input.filter(isRecord).map((item, index) => ({
    id: typeof item.id === 'number' && Number.isFinite(item.id) ? item.id : index + 1,
    title: text(item.title),
    source: text(item.source),
    href: text(item.href),
  }))
}

function statementStyle(value: unknown): 'callout' | 'warning' | 'insight' {
  if (value === 'callout' || value === 'warning' || value === 'insight') return value
  return 'insight'
}

function uniqueId(value: unknown, seen: Set<string>, prefix: string): string {
  const id = text(value)
  if (id && !seen.has(id)) {
    seen.add(id)
    return id
  }
  const next = newId(prefix)
  seen.add(next)
  return next
}

function minutesOf(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0
  return Math.max(0, Math.round(value))
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
