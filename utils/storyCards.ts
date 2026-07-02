import type { CardKind, StoryCard } from '~/types/story'

export interface CardKindMeta {
  label: string
  glyph: string
  color: string
  hint: string
  defaults: Partial<StoryCard>
}

// The single source of truth for every card type StoryGen offers: how it
// reads in the palette, its accent color on the canvas and in the exported
// diagram, and the starter content a fresh card is born with.
export const CARD_KINDS: Record<CardKind, CardKindMeta> = {
  'title': {
    label: 'Title Screen',
    glyph: 'Aa',
    color: '#A78BFA',
    hint: 'Course title, subtitle, and welcome',
    defaults: { title: 'Welcome', body: '', narration: 'Welcome the learner and set the stage.' }
  },
  'objectives': {
    label: 'Learning Objectives',
    glyph: '◎',
    color: '#34D399',
    hint: 'What learners will be able to do',
    defaults: { title: 'Learning Objectives', body: '' }
  },
  'divider': {
    label: 'Section Divider',
    glyph: '§',
    color: '#94A3B8',
    hint: 'Marks the start of a new section',
    defaults: { title: 'Section 1', body: '' }
  },
  'text-image': {
    label: 'Text & Image',
    glyph: '▤',
    color: '#60A5FA',
    hint: 'Content screen with copy and a visual',
    defaults: { title: 'New Screen', body: '', visual: '' }
  },
  'video': {
    label: 'Fullscreen Video',
    glyph: '▶',
    color: '#E879F9',
    hint: 'Immersive full-bleed video moment',
    defaults: { title: 'Video', visual: '', body: '' }
  },
  'mcq': {
    label: 'MCQ',
    glyph: '?',
    color: '#FB7185',
    hint: 'Question with four options',
    defaults: { title: 'Knowledge Check', question: '', options: ['', '', '', ''], correctIndex: 0, feedback: '' }
  },
  'summary': {
    label: 'Summary',
    glyph: '≣',
    color: '#2DD4BF',
    hint: 'Key takeaways, recapped',
    defaults: { title: 'Summary', body: '' }
  },
  'thankyou': {
    label: 'Thank You',
    glyph: '✻',
    color: '#F59E0B',
    hint: 'Closing screen and next steps',
    defaults: { title: 'Thank You', body: '' }
  }
}

export const CARD_KIND_ORDER: CardKind[] = [
  'title', 'objectives', 'divider', 'text-image', 'video', 'mcq', 'summary', 'thankyou'
]

export function cardId() {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

export function createCard(kind: CardKind, position: { x: number; y: number }): StoryCard {
  const meta = CARD_KINDS[kind]
  return {
    id: cardId(),
    kind,
    stage: '',
    title: '',
    body: '',
    visual: '',
    narration: '',
    notes: '',
    duration: 45,
    status: 'Draft',
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    feedback: '',
    // Deep-clone the registry defaults — a shared `options` array reference
    // would silently link every MCQ card's answers together.
    ...JSON.parse(JSON.stringify(meta.defaults)),
    x: position.x,
    y: position.y
  }
}

// The line the node card shows under its title — a glimpse of the content
// that matters most for that kind of screen.
export function cardPreview(card: StoryCard): string {
  switch (card.kind) {
    case 'mcq': {
      const filled = (card.options || []).filter(o => o.trim()).length
      return card.question.trim() || (filled ? `${filled} options drafted` : 'No question yet.')
    }
    case 'video':
      return card.visual.trim() || 'No video direction yet.'
    case 'objectives':
    case 'summary': {
      const lines = card.body.split('\n').map(l => l.trim()).filter(Boolean)
      return lines.length ? lines.slice(0, 3).map(l => `• ${l}`).join('\n') : 'Nothing listed yet.'
    }
    default:
      return card.body.trim() || card.visual.trim() || 'No content yet.'
  }
}
