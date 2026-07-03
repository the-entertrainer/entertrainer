import type { Connection, StoryCard } from '~/types/story'
import type { CardKind } from '~/types/story'
import { groqChat, extractJson } from './aiClient'
import type { IdModel } from './idModels'
import { CARD_KINDS, createCard } from './storyCards'
import { orderCards } from './storyGraph'
import { laneLayout } from './storyLayout'

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
}

export async function aiGenerateStoryboard(
  key: string,
  source: string,
  model: IdModel,
  screenHint: number
): Promise<GeneratedStoryboard> {
  const stageList = model.stages.length
    ? model.stages.map(s => `"${s.id}" (${s.label}: ${s.prompt})`).join('\n')
    : '(freeform project — always use "" for stage)'

  const system = `You are StoryGen's structuring engine. Convert raw source material into an instructional storyboard following ${model.label}.
Return ONLY valid JSON, exactly this shape:
{"title":"short course title","cards":[{"kind":"...","stage":"...","title":"screen title","body":"on-screen text (one point per line for objectives/summary)","visual":"visual & media direction for a developer","narration":"spoken audio script, 30-80 words","notes":"developer notes, may be empty","durationSeconds":45,"question":"","options":["","","",""],"correctIndex":0,"feedback":""}]}
Hard rules:
- "kind" must be one of: ${KIND_LIST}.
- "stage" must be one of these ids (assign the best fit to EVERY card):
${stageList}
- Create ${Math.max(4, screenHint - 2)}-${screenHint + 2} cards. The first card must be kind "title". Include at least one "mcq" card with a real question, 4 plausible options, correctIndex, and feedback.
- Preserve facts from the source; never invent statistics or names. Plain text only, no markdown.
- Cards are in presentation order.`

  const content = await groqChat(key, system, `Source material:\n${source.slice(0, 24000)}`, { maxTokens: 6500, temperature: 0.4 })
  const parsed = extractJson(content)
  const rawCards = Array.isArray(parsed?.cards) ? parsed.cards : []
  if (rawCards.length < 2) throw new Error('The AI returned too few screens — try again or add more source material.')

  const cards = rawCards.slice(0, 24).map((raw: any) => sanitizeCard(raw, model))
  const connections: Connection[] = []
  for (let i = 1; i < cards.length; i++) connections.push(conn(cards[i - 1].id, cards[i].id))
  laneLayout(cards, connections, model)

  return { title: String(parsed?.title || 'AI Storyboard').slice(0, 120), cards, connections }
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
    `${i + 1}. [stage:${c.stage || 'none'}] ${c.title}: ${(c.body + ' ' + c.narration).replace(/\s+/g, ' ').slice(0, 260)}`
  ).join('\n')
  const stageIds = model.stages.map(s => `"${s.id}"`).join(', ') || '""'

  const system = `You write multiple-choice knowledge checks that test understanding of given storyboard content (never trivia beyond it).
Return ONLY JSON: {"mcqs":[{"stage":"one of ${stageIds} or \\"\\"","title":"short check title","question":"...","options":["A","B","C","D"],"correctIndex":0,"feedback":"one sentence"}]}
Create exactly ${count} questions, each grounded in a different part of the content, 4 options each, one correct.`
  const parsed = extractJson(await groqChat(key, system, `Storyboard content:\n${digest}`, { maxTokens: 2600, temperature: 0.6 }))
  const raw = Array.isArray(parsed?.mcqs) ? parsed.mcqs : []
  if (!raw.length) throw new Error('The AI returned no questions — try again.')
  return raw.slice(0, count).map((m: any) => sanitizeCard({ ...m, kind: 'mcq' }, model))
}
