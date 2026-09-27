import {
  CARDS,
  ENDINGS,
  chairOf,
  deathEnding,
  type Delta,
  type Ending,
  type Gauge,
  type Side,
  type StoryCard
} from './cards'

export type Phase = 'title' | 'play' | 'end'

export type RunEnd = Ending & {
  years: number
  age: number
  calendar: number
  chair: string
  name: string
}

type QueueItem = { id: string; at: number }

export type Snapshot = {
  phase: Phase
  name: string
  age: number
  calendar: number
  years: number
  turn: number
  gauges: Record<Gauge, number>
  card: StoryCard | null
  end: RunEnd | null
  flags: string[]
}

const GAUGES: Gauge[] = ['janta', 'khazana', 'kursi', 'kanoon']

function blankGauges(): Record<Gauge, number> {
  return { janta: 50, khazana: 50, kursi: 50, kanoon: 50 }
}

export function clampYear(year: number) {
  if (!Number.isFinite(year)) return 2026
  return Math.max(2026, Math.min(9999, Math.round(year)))
}

export function ticks(n: number): 1 | 2 {
  return Math.abs(n) >= 9 ? 2 : 1
}

function eligible(
  card: StoryCard,
  calendar: number,
  term: number,
  flags: Set<string>,
  seen: Set<string>,
  gauges: Record<Gauge, number>
): boolean {
  if (!card.repeat && seen.has(card.id)) return false
  if (card.minTerm != null && term < card.minTerm) return false
  if (card.maxTerm != null && term > card.maxTerm) return false
  const era = card.era ?? 'any'
  if (era === 'now' && calendar > 2040) return false
  if (era === 'later' && calendar < 2041) return false
  if (card.need && !card.need.every((f) => flags.has(f))) return false
  if (card.block && card.block.some((f) => flags.has(f))) return false
  if (card.any && !card.any.some((f) => flags.has(f))) return false
  if (card.maxGauge) {
    for (const key of Object.keys(card.maxGauge) as Gauge[]) {
      const cap = card.maxGauge[key]
      if (cap != null && gauges[key] > cap) return false
    }
  }
  return true
}

function applySide(side: Side, gauges: Record<Gauge, number>, flags: Set<string>) {
  const d: Delta = { ...(side.d ?? {}) }
  if (side.extraIf && flags.has(side.extraIf.flag)) {
    for (const key of GAUGES) {
      const extra = side.extraIf.d[key]
      if (extra) d[key] = (d[key] ?? 0) + extra
    }
  }
  for (const key of GAUGES) {
    const n = d[key]
    if (n) gauges[key] = Math.max(0, Math.min(100, gauges[key] + n))
  }
  return d
}

export function createNetagiri(random: () => number = Math.random) {
  let phase: Phase = 'title'
  let name = ''
  let calendar = 2026
  let turn = 0
  let gauges = blankGauges()
  let flags = new Set<string>()
  let seen = new Set<string>()
  let recent: string[] = []
  let queue: QueueItem[] = []
  let card: StoryCard | null = null
  let end: RunEnd | null = null

  const byId = new Map(CARDS.map((c) => [c.id, c]))

  function finish(ending: Ending): RunEnd {
    phase = 'end'
    end = {
      ...ending,
      years: turn,
      age: calendar,
      calendar,
      chair: chairOf(flags),
      name: name.trim() || 'You'
    }
    return end
  }

  function broken(delta: Delta): Ending | null {
    const hit = GAUGES.filter((g) => gauges[g] <= 0 || gauges[g] >= 100)
    if (!hit.length) return null
    hit.sort((a, b) => Math.abs(delta[b] ?? 0) - Math.abs(delta[a] ?? 0))
    const gauge = hit[0]
    return deathEnding(gauge, gauges[gauge] >= 100, flags)
  }

  function take(id: string): StoryCard | null {
    const next = byId.get(id)
    if (!next || !eligible(next, calendar, turn, flags, seen, gauges)) return null
    return next
  }

  function weighted(pool: StoryCard[]): StoryCard {
    const total = pool.reduce((sum, c) => sum + (c.weight ?? 5), 0)
    let roll = random() * total
    for (const c of pool) {
      roll -= c.weight ?? 5
      if (roll <= 0) return c
    }
    return pool[pool.length - 1]
  }

  function spineId(): string | null {
    if (turn === 0) return calendar <= 2040 ? 'oath_now' : 'oath_later'
    if (flags.has('crossed') && !seen.has('the_flip')) return 'the_flip'
    if (turn >= 36 && !seen.has('immortal')) return 'immortal'
    return null
  }

  function draw(forced?: string): StoryCard {
    if (forced) {
      const next = take(forced)
      if (next) return next
    }
    const due = queue.findIndex((q) => q.at <= turn)
    if (due !== -1) {
      const item = queue.splice(due, 1)[0]
      const next = take(item.id)
      if (next) return next
    }
    const spine = spineId()
    if (spine) {
      const next = take(spine)
      if (next) return next
    }
    const urgent = CARDS.filter((c) => c.priority && eligible(c, calendar, turn, flags, seen, gauges))
    if (urgent.length) return weighted(urgent)
    const recentSet = new Set(recent.slice(-6))
    let pool = CARDS.filter((c) =>
      !c.spine && !c.queueOnly && !c.priority &&
      eligible(c, calendar, turn, flags, seen, gauges) &&
      !recentSet.has(c.id)
    )
    if (!pool.length) {
      pool = CARDS.filter((c) => c.repeat && eligible(c, calendar, turn, flags, seen, gauges))
    }
    if (!pool.length) {
      const any = CARDS.find((c) => !c.queueOnly && eligible(c, calendar, turn, flags, seen, gauges))
      return any ?? CARDS[0]
    }
    return weighted(pool)
  }

  function present(next: StoryCard) {
    card = next
    seen.add(next.id)
    recent.push(next.id)
  }

  return {
    start(playerName: string, year = 2026) {
      phase = 'play'
      name = playerName
      calendar = clampYear(year)
      turn = 0
      gauges = blankGauges()
      flags = new Set()
      seen = new Set()
      recent = []
      queue = []
      end = null
      present(draw())
    },
    choose(hand: 'left' | 'right') {
      if (phase !== 'play' || !card) return
      const side = card[hand]
      const delta = applySide(side, gauges, flags)
      for (const flag of side.set ?? []) flags.add(flag)
      for (const flag of side.clear ?? []) flags.delete(flag)
      const prev = calendar
      turn += 1
      calendar += 1
      if (prev <= 2040 && calendar > 2040) flags.add('crossed')
      for (const [id, wait] of side.queue ?? []) queue.push({ id, at: turn + wait })
      if (side.ending) {
        const ending = ENDINGS[side.ending]
        if (!ending) throw new Error(`missing ending ${side.ending}`)
        finish(ending)
        return
      }
      const died = broken(delta)
      if (died) {
        finish(died)
        return
      }
      present(draw(side.next))
    },
    snapshot(): Snapshot {
      return {
        phase,
        name,
        age: calendar,
        calendar,
        years: turn,
        turn,
        gauges: { ...gauges },
        card,
        end,
        flags: [...flags]
      }
    }
  }
}

export type Netagiri = ReturnType<typeof createNetagiri>
