import type { Connection, StoryCard } from '~/types/story'
import type { CardKind } from '~/types/story'
import { groqChat, extractJson } from './aiClient'
import type { IdModel } from './idModels'
import { CARD_KINDS, createCard } from './storyCards'
import { orderCards } from './storyGraph'
import { laneLayout, tidyPositions } from './storyLayout'

// Every AI feature funnels through the same discipline: a rigid JSON
// contract in the prompt, then client-side sanitization that maps whatever
// came back onto our real data model — invalid kinds, stages, options, or
// durations are corrected, never trusted.

const KIND_LIST = Object.keys(CARD_KINDS).join(' | ')

function conn(from: string, to: string): Connection {
  return { id: `k${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`, from, to }
}

function clampDuration(v: any, narration: string): number {
  const n = Number(v)
  if (Number.isFinite(n) && n >= 10 && n <= 900) return Math.round(n)
  const words = String(narration || '').trim().split(/\s+/).filter(Boolean).length
  return Math.max(20, Math.ceil(words / 150 * 60 / 5) * 5)
}

function sanitizeCard(raw: any, model: IdModel): StoryCard {
  const kind: CardKind = CARD_KINDS[raw?.kind as CardKind] ? raw.kind : 'text-image'
  const card = createCard(kind, { x: 0, y: 0 })
  card.title = String(raw?.title || '').slice(0, 120) || card.title
  card.body = String(raw?.body || '')
  card.visual = String(raw?.visual || '')
  card.narration = String(raw?.narration || '')
  card.notes = String(raw?.notes || '')
  card.duration = clampDuration(raw?.durationSeconds, card.narration)
  const stage = String(raw?.stage || '')
  card.stage = model.stages.some(s => s.id === stage) ? stage : ''
  if (kind === 'mcq') {
    card.question = String(raw?.question || '')
    const options = (Array.isArray(raw?.options) ? raw.options : []).slice(0, 4).map((o: any) => String(o ?? ''))
    while (options.length < 4) options.push('')
    card.options = options
    card.correctIndex = Math.max(0, Math.min(3, Number(raw?.correctIndex ?? 0) || 0))
    card.feedback = String(raw?.feedback || '')
  }
  return card
}

export interface GeneratedStoryboard {
  title: string
  cards: StoryCard[]
  connections: Connection[]
  plan?: Record<string, string>
}

// The bar for every generated knowledge check. The single most common AI
// failure is quizzing the course instead of the content ("What is one of
// the learning objectives of this video?") — banned outright.
const MCQ_RULES = `Knowledge-check quality rules (non-negotiable):
- Questions test the SUBJECT MATTER: facts, procedures, and decisions the learner must master on the job, taken from the source.
- NEVER ask about the course/video/module itself — not its topic, title, objectives, summary, structure, or "what was described". Banned patterns: "What is the main topic of…", "What is one of the learning objectives…", "What is X described as…", "What did this video cover…".
- The correct answer must be verifiable from the source, and must never restate the question.
- Prefer scenario stems where the source allows ("An agent's ID verification fails. What must they do next?") over bare recall.
- Distractors are plausible same-domain mistakes a real novice would make — not obvious throwaways.`

const CRAFT_RULES = `Craft rules:
- Honor explicit client directives in the source: stated length limits (fit total durationSeconds within them), tone, visual style, and any "use this wording verbatim" instructions (verbatim wording belongs in narration).
- body = what the learner SEES (short on-screen text; one point per line for objectives/summary). narration = what they HEAR (natural spoken register). visual = direction for the developer (style, motion, layout). notes = production/dev reminders from the source that learners never see.
- Learning-objective cards state observable behaviors ("Approve or reject a change via the Referral Queue"), never vague awareness ("Understand the importance of…").
- Preserve facts exactly; never invent statistics, names, or features. Plain text only, no markdown.`

export async function aiGenerateStoryboard(
  key: string,
  source: string,
  model: IdModel,
  screenHint: number
): Promise<GeneratedStoryboard> {
  const isProcess = model.kind === 'process'

  let system: string
  if (isProcess) {
    // ADDIE/SAM: phases describe the designer's project — they become a
    // design-plan worksheet, never screen tags. The screen flow itself is
    // a plain learner narrative.
    const phaseList = model.stages.map(s => `"${s.id}" — ${s.label}: ${s.prompt}`).join('\n')
    system = `You are StoryGen's structuring engine. Convert raw source material into (1) a learner-facing storyboard and (2) a ${model.label} design plan. ${model.label} is a DESIGN PROCESS: its phases describe the project work, so they go in the plan — screens are never labeled with phases.
Return ONLY valid JSON, exactly this shape:
{"title":"short course title","plan":{${model.stages.map(s => `"${s.id}":"2-4 sentence notes"`).join(',')}},"cards":[{"kind":"...","title":"screen title","body":"on-screen text","visual":"visual & media direction","narration":"spoken audio script","notes":"production notes, may be empty","durationSeconds":45,"question":"","options":["","","",""],"correctIndex":0,"feedback":""}]}
Plan phases (write practical notes for each, grounded in the source):
${phaseList}
Hard rules:
- "kind" must be one of: ${KIND_LIST}.
- Create ${Math.max(4, screenHint - 2)}-${screenHint + 2} cards in the order the learner experiences them: a "title" card first, then objectives/content, any "mcq" checks right after the content they test, a "summary" near the end, "thankyou" last if used.
- Include at least one "mcq" card with a real question, 4 plausible options, correctIndex, and feedback.
${MCQ_RULES}
${CRAFT_RULES}`
  } else {
    const stageList = model.stages.length
      ? model.stages.map(s => `"${s.id}" (${s.label}: ${s.prompt})`).join('\n')
      : '(freeform project — always use "" for stage)'
    system = `You are StoryGen's structuring engine. Convert raw source material into an instructional storyboard following ${model.label} — a learner-journey framework whose stages are the lesson's arc.
Return ONLY valid JSON, exactly this shape:
{"title":"short course title","cards":[{"kind":"...","stage":"...","title":"screen title","body":"on-screen text","visual":"visual & media direction","narration":"spoken audio script","notes":"production notes, may be empty","durationSeconds":45,"question":"","options":["","","",""],"correctIndex":0,"feedback":""}]}
Hard rules:
- "kind" must be one of: ${KIND_LIST}.
- "stage" must be one of these ids (assign the best fit to EVERY card):
${stageList}
- Cards are in the order the learner experiences them, and stages must progress FORWARD through the list above — a later card never returns to an earlier stage. A "title" card opens, "thankyou" (if used) closes.
- Create ${Math.max(4, screenHint - 2)}-${screenHint + 2} cards. Include at least one "mcq" card with a real question, 4 plausible options, correctIndex, and feedback.
${MCQ_RULES}
${CRAFT_RULES}`
  }

  const content = await groqChat(key, system, `Source material:\n${source.slice(0, 24000)}`, { maxTokens: 7000, temperature: 0.4 })
  const parsed = extractJson(content)
  const rawCards = Array.isArray(parsed?.cards) ? parsed.cards : []
  if (rawCards.length < 2) throw new Error('The AI returned too few screens — try again or add more source material.')

  const cards = rawCards.slice(0, 24).map((raw: any) => sanitizeCard(raw, model))

  // Structural guarantees the model can't be trusted with: exactly one
  // opening title (first), thank-you at the very end, never mid-flow.
  const titleIdx = cards.findIndex((c: StoryCard) => c.kind === 'title')
  if (titleIdx > 0) cards.unshift(cards.splice(titleIdx, 1)[0])
  const tyIdx = cards.findIndex((c: StoryCard) => c.kind === 'thankyou')
  if (tyIdx >= 0 && tyIdx !== cards.length - 1) cards.push(cards.splice(tyIdx, 1)[0])

  // Journey arcs never step backwards: stage order along the chain is
  // made monotonic (a wayward tag is bumped forward to the current stage).
  if (!isProcess && model.stages.length) {
    const rank = new Map(model.stages.map((s, i) => [s.id, i]))
    let high = -1
    for (const card of cards) {
      const r = card.stage ? (rank.get(card.stage) ?? -1) : -1
      if (r < 0) continue
      if (r < high) card.stage = model.stages[high].id
      else high = r
    }
  }
  if (isProcess) for (const card of cards) card.stage = ''

  const connections: Connection[] = []
  for (let i = 1; i < cards.length; i++) connections.push(conn(cards[i - 1].id, cards[i].id))
  if (!isProcess && model.stages.length) laneLayout(cards, connections, model)
  else tidyPositions(cards, connections)

  // Plan notes only from the declared phases, only strings, bounded.
  let plan: Record<string, string> | undefined
  if (isProcess) {
    plan = {}
    for (const s of model.stages) plan[s.id] = String(parsed?.plan?.[s.id] || '').slice(0, 2000)
  }

  return { title: String(parsed?.title || 'AI Storyboard').slice(0, 120), cards, connections, plan }
}

export async function aiRewriteField(
  key: string,
  card: StoryCard,
  fieldLabel: string,
  text: string,
  model: IdModel
): Promise<string> {
  const stage = model.stages.find(s => s.id === card.stage)
  const system = `You are an expert instructional writer. Rewrite the given text to be clearer, tighter, and more engaging for adult learners. Keep the meaning and roughly the same length. Keep line breaks if the input is a list. Plain text only.
Return ONLY JSON: {"text":"the rewritten text"}`
  const user = `Screen: "${card.title}" (${CARD_KINDS[card.kind]?.label})${stage ? `\nStage guidance: ${stage.prompt}` : ''}\nField: ${fieldLabel}\nText to rewrite:\n${text}`
  const parsed = extractJson(await groqChat(key, system, user, { maxTokens: 1200, temperature: 0.55 }))
  const out = String(parsed?.text || '').trim()
  if (!out) throw new Error('The AI returned nothing usable — try again.')
  return out
}

export interface McqSuggestion {
  options: string[]
  correctIndex: number
  feedback: string
}

export async function aiSuggestOptions(key: string, card: StoryCard): Promise<McqSuggestion> {
  if (!card.question.trim()) throw new Error('Write the question first — then AI can draft the options.')
  const existingCorrect = card.options[card.correctIndex]?.trim()
  const system = `You write multiple-choice options for an eLearning knowledge check. Distractors must be plausible, distinct, and grammatically parallel to the correct answer.
Return ONLY JSON: {"options":["A","B","C","D"],"correctIndex":0,"feedback":"one sentence on why the correct option is right"}`
  const user = `Question: ${card.question}${existingCorrect ? `\nKeep this as the correct answer (place it at any index): ${existingCorrect}` : ''}`
  const parsed = extractJson(await groqChat(key, system, user, { maxTokens: 700, temperature: 0.7 }))
  const options = (Array.isArray(parsed?.options) ? parsed.options : []).slice(0, 4).map((o: any) => String(o ?? ''))
  while (options.length < 4) options.push('')
  if (!options.some((o: string) => o.trim())) throw new Error('The AI returned empty options — try again.')
  return {
    options,
    correctIndex: Math.max(0, Math.min(3, Number(parsed?.correctIndex ?? 0) || 0)),
    feedback: String(parsed?.feedback || '')
  }
}

export async function aiGenerateMcqCards(
  key: string,
  cards: StoryCard[],
  connections: Connection[],
  model: IdModel,
  count: number
): Promise<StoryCard[]> {
  const contentCards = orderCards(cards, connections).filter(c => c.kind !== 'mcq')
  if (!contentCards.length) throw new Error('Add some content screens first.')
  const digest = contentCards.slice(0, 30).map((c, i) =>
    `${i + 1}. ${c.title}: ${(c.body + ' ' + c.narration).replace(/\s+/g, ' ').slice(0, 260)}`
  ).join('\n')
  const useStages = model.kind === 'journey' && model.stages.length > 0
  const stageIds = useStages ? model.stages.map(s => `"${s.id}"`).join(', ') : '""'

  const system = `You write multiple-choice knowledge checks that test understanding of given storyboard content (never trivia beyond it).
Return ONLY JSON: {"mcqs":[{"stage":${useStages ? `"one of ${stageIds}"` : '""'},"title":"short check title","question":"...","options":["A","B","C","D"],"correctIndex":0,"feedback":"one sentence"}]}
Create exactly ${count} questions, each grounded in a different part of the content, 4 options each, one correct.
${MCQ_RULES}`
  const parsed = extractJson(await groqChat(key, system, `Storyboard content:\n${digest}`, { maxTokens: 2600, temperature: 0.6 }))
  const raw = Array.isArray(parsed?.mcqs) ? parsed.mcqs : []
  if (!raw.length) throw new Error('The AI returned no questions — try again.')
  return raw.slice(0, count).map((m: any) => sanitizeCard({ ...m, kind: 'mcq' }, model))
}
