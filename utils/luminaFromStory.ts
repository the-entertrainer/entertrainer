import type { StoryCard, StoryGenProject } from '~/types/story'
import type { LuminaBlock, LuminaCourse, LuminaLesson } from '~/types/lumina'
import { orderCards, sanitizeConnections } from '~/utils/storyGraph'
import { modelOf, stageOf } from '~/utils/idModels'
import { createBlock, createCourse, createLesson } from '~/utils/luminaBlocks'

// StoryGen → Lumina bridge. A storyboard is a plan for a course; this
// turns that plan into a real Rise-style block course. The one editorial
// decision baked in: Rise-like courses are READ, not narrated — so a
// card's narration script is resolved into on-screen prose. Body text
// leads, and any narration that says something the body doesn't is folded
// in as follow-on paragraphs.

function resolveNarration(body: string, narration: string): string {
  const b = body.trim()
  const n = narration.trim()
  if (!n || n === b) return b
  if (!b) return n
  // Drop narration that merely restates the opening of the body.
  const flat = (s: string) => s.toLowerCase().replace(/\s+/g, ' ')
  if (flat(b).includes(flat(n))) return b
  return `${b}\n\n${n}`
}

function lines(s: string): string[] {
  return s.split('\n').map(l => l.replace(/^[-•*\d.)\s]+/, '').trim()).filter(Boolean)
}

// One storyboard card becomes one or more course blocks.
function blocksFromCard(card: StoryCard): LuminaBlock[] {
  const out: LuminaBlock[] = []
  const prose = resolveNarration(card.body, card.narration)

  const push = (b: LuminaBlock) => { out.push(b); return b }

  switch (card.kind) {
    case 'title': {
      const hero = push(createBlock('hero'))
      hero.title = card.title.trim() || 'Welcome'
      hero.body = prose.split('\n')[0] || ''
      break
    }
    case 'objectives': {
      const hero = push(createBlock('hero'))
      hero.variant = 'plain'
      hero.title = card.title.trim() || "What you'll learn"
      const list = push(createBlock('list'))
      list.variant = 'check'
      list.items = lines(prose)
      if (!list.items.length) list.items = ['']
      break
    }
    case 'divider': {
      const d = push(createBlock('divider'))
      if (card.title.trim()) {
        const hero = push(createBlock('hero'))
        hero.variant = 'plain'
        hero.title = card.title.trim()
      } else {
        d.variant = 'line'
      }
      break
    }
    case 'text-image': {
      if (prose) {
        const text = push(createBlock('text'))
        text.body = prose
      }
      // The storyboard called for a visual: stage an image block with the
      // art direction in the caption. The export gatekeeper will hold the
      // course until real artwork (and alt text) lands — by design.
      if (card.visual.trim()) {
        const img = push(createBlock('image'))
        img.caption = card.visual.trim()
      }
      if (!out.length) {
        const text = push(createBlock('text'))
        text.body = card.title.trim()
      }
      break
    }
    case 'video': {
      if (prose) {
        const text = push(createBlock('text'))
        text.body = prose
      }
      const vid = push(createBlock('video'))
      vid.caption = card.title.trim() || card.visual.trim()
      // Storyboards rarely carry a real URL; if the visual field holds one,
      // keep it. Otherwise the gatekeeper prompts for the link.
      const url = card.visual.match(/https?:\/\/\S+/)?.[0]
      if (url) vid.src = url
      break
    }
    case 'mcq': {
      const quiz = push(createBlock('quiz'))
      quiz.title = card.question.trim() || card.title.trim()
      quiz.options = [...card.options.slice(0, 4)]
      while (quiz.options.length < 4) quiz.options.push('')
      quiz.correctIndex = Math.max(0, Math.min(3, card.correctIndex || 0))
      quiz.feedback = resolveNarration(card.feedback, '')
      break
    }
    case 'summary': {
      const items = lines(prose)
      if (items.length > 1) {
        const call = push(createBlock('callout'))
        call.variant = 'tip'
        call.title = card.title.trim() || 'Key takeaways'
        const list = push(createBlock('list'))
        list.items = items
      } else {
        const call = push(createBlock('callout'))
        call.variant = 'tip'
        call.title = card.title.trim() || 'Key takeaways'
        call.body = prose
      }
      break
    }
    case 'thankyou': {
      const hero = push(createBlock('hero'))
      hero.title = card.title.trim() || 'Thank you'
      hero.body = prose.split('\n')[0] || ''
      break
    }
  }
  return out
}

export interface BridgeResult {
  course: LuminaCourse
  cardCount: number
  blockCount: number
}

export function courseFromStoryboard(project: StoryGenProject): BridgeResult {
  const model = modelOf(project.model)
  const cards = orderCards(project.cards, sanitizeConnections(project.cards, project.connections))

  const course = createCourse(project.title || 'Untitled Course')
  course.lessons = []

  // Lesson boundaries follow the storyboard's own structure:
  //  - journey frameworks: a new lesson whenever the stage changes,
  //    titled with the stage's label;
  //  - freeform / process: a title card (after the first) starts a new
  //    lesson — that's how designers already chapter their boards.
  let lesson: LuminaLesson | null = null
  let currentStage: string | null = null
  let courseTitleTaken = false

  const ensureLesson = (title: string) => {
    lesson = createLesson(title)
    course.lessons.push(lesson)
    return lesson
  }

  for (const card of cards) {
    const useStages = model.kind === 'journey' && model.stages.length > 0

    if (useStages) {
      const stageId = card.stage || ''
      if (!lesson || stageId !== currentStage) {
        currentStage = stageId
        ensureLesson(stageOf(model.id, stageId)?.label.replace(/^\d+ · /, '') || 'Introduction')
      }
    } else if (!lesson || (card.kind === 'title' && courseTitleTaken)) {
      ensureLesson(card.kind === 'title' ? (card.title.trim() || `Lesson ${course.lessons.length + 1}`) : (card.title.trim() || 'Lesson 1'))
    }

    // The very first title card names the course itself.
    if (card.kind === 'title' && !courseTitleTaken) {
      courseTitleTaken = true
      if (card.title.trim()) course.title = card.title.trim()
    }

    lesson!.blocks.push(...blocksFromCard(card))
  }

  // Drop lessons the mapping left empty (e.g. a lone stage of skipped cards).
  course.lessons = course.lessons.filter(l => l.blocks.length)
  if (!course.lessons.length) course.lessons = [createLesson('Lesson 1')]

  return {
    course,
    cardCount: cards.length,
    blockCount: course.lessons.reduce((s, l) => s + l.blocks.length, 0)
  }
}
