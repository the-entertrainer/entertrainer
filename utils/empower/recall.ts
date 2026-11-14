import { uid } from './id'

export interface RecallCard {
  id: string
  deckId: string
  front: string
  back: string
  ease: number
  interval: number
  repetitions: number
  due: number
}

export interface RecallDeck {
  id: string
  title: string
  createdAt: number
}

export interface RecallPair {
  front: string
  back: string
}

function splitPair(line: string): RecallPair | null {
  for (const sep of [': ', ':', ' — ', ' – ', ' - ', ' | ']) {
    const index = line.indexOf(sep)
    if (index <= 0) continue
    const front = line.slice(0, index).trim()
    const back = line.slice(index + sep.length).trim()
    if (front && back) return { front, back }
  }
  return null
}

function pairFromChunk(chunk: string): RecallPair | null {
  const lines = chunk.split('\n').map(line => line.trim()).filter(Boolean)
  if (!lines.length) return null
  if (lines.length === 1) return splitPair(lines[0])
  if (lines.every(line => splitPair(line))) return null
  return { front: lines[0], back: lines.slice(1).join('\n') }
}

export function cardsFromNotes(notes: string, delimiter = ''): RecallPair[] {
  const text = notes.replace(/\r\n/g, '\n').trim()
  if (!text) return []
  const custom = delimiter.trim()
  if (custom) {
    return text.split(custom).map(chunk => pairFromChunk(chunk.trim())).filter((pair): pair is RecallPair => Boolean(pair))
  }
  const blocks = text.split(/\n\s*\n/).map(block => block.trim()).filter(Boolean)
  const cards: RecallPair[] = []
  for (const block of blocks) {
    const lines = block.split('\n').map(line => line.trim()).filter(Boolean)
    if (lines.length > 1 && lines.every(line => splitPair(line))) {
      for (const line of lines) {
        const pair = splitPair(line)
        if (pair) cards.push(pair)
      }
      continue
    }
    const pair = pairFromChunk(block)
    if (pair) cards.push(pair)
    else if (lines.length === 1) {
      const single = splitPair(lines[0])
      if (single) cards.push(single)
    }
  }
  return cards
}

export function freshCard(deckId: string, pair: RecallPair, now = Date.now()): RecallCard {
  return {
    id: uid('card'),
    deckId,
    front: pair.front,
    back: pair.back,
    ease: 2.5,
    interval: 0,
    repetitions: 0,
    due: now,
  }
}

/** SM-2. Quality is 0–5. Below 3 resets the streak and the card is due again tomorrow. */
export function gradeCard(card: RecallCard, quality: number, now = Date.now()): RecallCard {
  const q = Math.min(5, Math.max(0, Math.round(quality)))
  const next = { ...card }
  let ease = card.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  if (ease < 1.3) ease = 1.3
  next.ease = Math.round(ease * 100) / 100
  if (q < 3) {
    next.repetitions = 0
    next.interval = 1
  } else if (card.repetitions <= 0) {
    next.interval = 1
    next.repetitions = card.repetitions + 1
  } else if (card.repetitions === 1) {
    next.interval = 6
    next.repetitions = card.repetitions + 1
  } else {
    next.interval = Math.max(1, Math.round((card.interval || 1) * next.ease))
    next.repetitions = card.repetitions + 1
  }
  next.due = now + next.interval * 86_400_000
  return next
}

export function dueCards(cards: RecallCard[], now = Date.now()): RecallCard[] {
  return cards
    .filter(card => card.due <= now)
    .sort((a, b) => a.due - b.due || a.front.localeCompare(b.front))
}

export function cardsToCsv(cards: RecallPair[]): string {
  const escape = (value: string) => /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
  return ['front,back', ...cards.map(card => `${escape(card.front)},${escape(card.back)}`)].join('\n')
}

export function cardsToJson(title: string, cards: RecallPair[]): string {
  return JSON.stringify({ title, cards }, null, 2)
}

export function cardsFromJson(raw: string): { title: string; cards: RecallPair[] } | { error: string } {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return { error: 'That file is not valid JSON.' }
  }
  const record = data as { title?: unknown; cards?: unknown }
  const title = typeof record?.title === 'string' && record.title.trim() ? record.title.trim() : 'Imported deck'
  const list = Array.isArray(data) ? data : record?.cards
  if (!Array.isArray(list)) return { error: 'JSON needs a cards array with front and back.' }
  const cards: RecallPair[] = []
  for (const item of list) {
    const row = item as { front?: unknown; back?: unknown; q?: unknown; a?: unknown }
    const front = String(row?.front ?? row?.q ?? '').trim()
    const back = String(row?.back ?? row?.a ?? '').trim()
    if (front && back) cards.push({ front, back })
  }
  if (!cards.length) return { error: 'No cards with a front and a back were found.' }
  return { title, cards }
}
