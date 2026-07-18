import type { LuminaBlock, LuminaBlockKind, LuminaCourse } from '~/types/lumina'
import { createBlock, createPair, LUMINA_KINDS } from '~/utils/luminaBlocks'
import { groqChat, extractJson } from '~/utils/aiClient'

// Optional AI pass that reads an imported course and proposes interactive
// blocks where they would genuinely strengthen the learning, grounded in
// the actual content and in eLearning design principles (retrieval
// practice after teaching, spacing, active recall, matching the
// interaction to the content, and NOT over-assessing). It never edits the
// course itself: it returns suggestions the author reviews and picks from.

// Only kinds the model can author well from text. Games that need spatial
// authoring (matching, sort, memory) are left for the author to add by hand.
const SUGGESTABLE: LuminaBlockKind[] = [
  'quiz', 'multiquiz', 'truefalse', 'flashcards', 'reflection', 'accordion', 'reveal', 'scenario', 'ordering'
]

export interface LuminaSuggestion {
  id: string
  lesson: number   // 1-based lesson number
  after: number    // insert after this 1-based block index (0 = top of lesson)
  kind: LuminaBlockKind
  reason: string   // the eLearning rationale, shown to the author
  block: LuminaBlock
}

function clip(s: string, n = 200): string {
  const t = s.replace(/\s+/g, ' ').trim()
  return t.length > n ? t.slice(0, n) + '…' : t
}

// A compact, numbered digest of the course the model can anchor to. Block
// numbers are 1-based array positions so a suggestion's `after` maps back
// exactly.
function digest(course: LuminaCourse): string {
  return course.lessons.map((lesson, li) => {
    const lines = lesson.blocks.map((b, bi) => {
      const parts = [b.title, b.body, b.items.join(' · '), b.pairs.map(p => `${p.title} ${p.body}`).join(' · ')]
      return `  [${bi + 1}] ${LUMINA_KINDS[b.kind].label}: ${clip(parts.filter(Boolean).join(' — ')) || '(empty)'}`
    })
    return `Lesson ${li + 1}: "${lesson.title}"\n${lines.join('\n') || '  (no blocks)'}`
  }).join('\n\n')
}

const SYSTEM = `You are a senior instructional designer improving an eLearning course that was drafted from a storyboard. The course currently reads like slides: it teaches, but it rarely asks the learner to DO anything.

Propose a SMALL number of interactive blocks that would measurably improve learning. Quality over quantity: 2 to 6 suggestions for a typical course, sometimes zero if it is already well interleaved. Never add interaction for its own sake.

Follow these principles:
- Retrieval practice: put a knowledge check AFTER the content it tests, not before it, and not before the opening title.
- Space checks out across the course rather than stacking them at the end.
- Match the interaction to the content: a set of terms or definitions becomes flashcards; a described decision becomes a scenario; a process with clear steps becomes an ordering task; a reflective moment becomes a reflection; dense reference detail becomes an accordion; a "think, then see" beat becomes a reveal.
- Do not quiz trivia. Test the point that matters.
- Every question needs plausible, parallel options and one sentence of feedback explaining WHY.
- Write in plain language. Do not use em dashes or dashes as punctuation.

You may only use these block kinds, each with these fields:
- "quiz": one right answer. { "title": question, "options": [2 to 4 strings], "correctIndex": number, "feedback": string }
- "multiquiz": choose all that apply. { "title": question, "options": [3 to 5 strings], "correctSet": [indices], "feedback": string }
- "truefalse": { "title": statement, "correctIndex": 0 for true or 1 for false, "feedback": string }
- "flashcards": { "pairs": [{ "title": front, "body": back }, ...] }
- "reflection": { "title": prompt, "body": optional one-line guidance }
- "accordion": { "pairs": [{ "title": heading, "body": detail }, ...] }
- "reveal": { "title": optional prompt, "pairs": [{ "title": cue, "body": hidden answer }, ...] }
- "scenario": { "title": situation, "options": [choices], "outcomes": [what happens for each choice, same order and length as options], "correctIndex": index of the best choice, "feedback": debrief }
- "ordering": { "title": instruction, "items": [steps in the correct order], "feedback": string }

Return ONLY JSON of the form:
{ "suggestions": [ { "lesson": 1, "after": 3, "kind": "quiz", "reason": "why this helps, referencing the specific content", ...block fields } ] }
"lesson" is the 1-based lesson number. "after" is the 1-based block number to insert after (0 for the top of the lesson). Ground every suggestion in specific content from the digest.`

// Turn one validated raw suggestion into a real block, or null if it lacks
// what its kind needs. Never trusts AI shape: clamps and fills like the
// import normalizer does.
function buildBlock(kind: LuminaBlockKind, raw: any): LuminaBlock | null {
  const block = createBlock(kind)
  const str = (v: any) => String(v ?? '').trim()
  const strArr = (v: any) => (Array.isArray(v) ? v.map(str) : [])
  const pairArr = (v: any) => (Array.isArray(v) ? v.map((p: any) => createPair(str(p?.title), str(p?.body))) : [])

  switch (kind) {
    case 'quiz':
    case 'truefalse': {
      block.title = str(raw.title)
      if (kind === 'quiz') {
        const opts = strArr(raw.options).filter(Boolean).slice(0, 4)
        if (!block.title || opts.length < 2) return null
        while (opts.length < 4) opts.push('')
        block.options = opts
        block.correctIndex = Math.max(0, Math.min(opts.filter(Boolean).length - 1, Number(raw.correctIndex) || 0))
      } else {
        if (!block.title) return null
        block.correctIndex = Number(raw.correctIndex) === 1 ? 1 : 0
      }
      block.feedback = str(raw.feedback)
      return block
    }
    case 'multiquiz': {
      block.title = str(raw.title)
      const opts = strArr(raw.options).filter(Boolean).slice(0, 5)
      const set = (Array.isArray(raw.correctSet) ? raw.correctSet : []).map((n: any) => Number(n)).filter((n: number) => n >= 0 && n < opts.length)
      if (!block.title || opts.length < 2 || !set.length) return null
      while (opts.length < 4) opts.push('')
      block.options = opts
      block.correctSet = Array.from(new Set(set))
      block.feedback = str(raw.feedback)
      return block
    }
    case 'scenario': {
      block.title = str(raw.title)
      const opts = strArr(raw.options).filter(Boolean).slice(0, 4)
      if (!block.title || opts.length < 2) return null
      const outcomes = strArr(raw.outcomes)
      block.options = [...opts]
      while (block.options.length < 4) block.options.push('')
      block.outcomes = block.options.map((_, i) => outcomes[i] || '')
      block.correctIndex = Math.max(0, Math.min(opts.length - 1, Number(raw.correctIndex) || 0))
      block.feedback = str(raw.feedback)
      return block
    }
    case 'ordering': {
      block.title = str(raw.title)
      const items = strArr(raw.items).filter(Boolean)
      if (items.length < 3) return null
      block.items = items
      block.feedback = str(raw.feedback)
      return block
    }
    case 'flashcards':
    case 'accordion':
    case 'reveal': {
      const pairs = pairArr(raw.pairs).filter(p => p.title || p.body)
      if (!pairs.length) return null
      block.pairs = pairs
      if (kind === 'reveal') block.title = str(raw.title)
      return block
    }
    case 'reflection': {
      block.title = str(raw.title)
      if (!block.title) return null
      block.body = str(raw.body)
      return block
    }
    default:
      return null
  }
}

export async function aiSuggestInteractions(key: string, course: LuminaCourse): Promise<LuminaSuggestion[]> {
  const content = digest(course)
  const parsed = extractJson(await groqChat(key, SYSTEM, `Here is the course:\n\n${content}`, { maxTokens: 4000, temperature: 0.5 }))
  const raw = Array.isArray(parsed?.suggestions) ? parsed.suggestions : []

  const out: LuminaSuggestion[] = []
  for (const s of raw) {
    const kind = s?.kind as LuminaBlockKind
    if (!SUGGESTABLE.includes(kind)) continue
    const lesson = Math.max(1, Math.min(course.lessons.length, Number(s?.lesson) || 1))
    const lessonBlocks = course.lessons[lesson - 1]?.blocks.length ?? 0
    const after = Math.max(0, Math.min(lessonBlocks, Number(s?.after) || 0))
    const block = buildBlock(kind, s)
    if (!block) continue
    out.push({
      id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
      lesson, after, kind,
      reason: clip(String(s?.reason || 'Adds active practice to this lesson.'), 180),
      block
    })
    if (out.length >= 8) break
  }
  return out
}

// Insert the chosen suggestions into a fresh copy of the course. Inserts
// per lesson from the bottom up so earlier positions stay valid.
export function applyLuminaSuggestions(course: LuminaCourse, picks: LuminaSuggestion[]): LuminaCourse {
  const next: LuminaCourse = JSON.parse(JSON.stringify(course))
  const byLesson = new Map<number, LuminaSuggestion[]>()
  for (const p of picks) {
    const arr = byLesson.get(p.lesson) || []
    arr.push(p)
    byLesson.set(p.lesson, arr)
  }
  for (const [lesson, list] of byLesson) {
    const target = next.lessons[lesson - 1]
    if (!target) continue
    list.sort((a, b) => b.after - a.after)
    for (const s of list) {
      const at = Math.max(0, Math.min(target.blocks.length, s.after))
      target.blocks.splice(at, 0, JSON.parse(JSON.stringify(s.block)))
    }
  }
  return next
}
