import type { Connection, StoryCard } from '~/types/story'

// The connection graph *is* the storyboard sequence: numbering, export
// order, and "what comes next" all fall out of a depth-first walk starting
// at the root card(s) (cards nothing points into). Disconnected islands are
// appended afterward, left-to-right, so nothing gets silently dropped.
export function orderCards(cards: StoryCard[], connections: Connection[]): StoryCard[] {
  const byId = new Map(cards.map(c => [c.id, c]))
  const outgoing = new Map<string, string[]>()
  for (const c of connections) {
    if (!byId.has(c.from) || !byId.has(c.to)) continue
    if (!outgoing.has(c.from)) outgoing.set(c.from, [])
    outgoing.get(c.from)!.push(c.to)
  }
  const hasIncoming = new Set(connections.map(c => c.to))
  const roots = cards.filter(c => !hasIncoming.has(c.id)).sort((a, b) => a.x - b.x || a.y - b.y)

  const visited = new Set<string>()
  const ordered: StoryCard[] = []

  function visit(id: string) {
    if (visited.has(id)) return
    const card = byId.get(id)
    if (!card) return
    visited.add(id)
    ordered.push(card)
    for (const nextId of outgoing.get(id) || []) visit(nextId)
  }

  for (const root of roots) visit(root.id)
  const remaining = cards.filter(c => !visited.has(c.id)).sort((a, b) => a.x - b.x || a.y - b.y)
  for (const c of remaining) visit(c.id)

  return ordered
}

export function cardNumbers(cards: StoryCard[], connections: Connection[]): Map<string, number> {
  const ordered = orderCards(cards, connections)
  return new Map(ordered.map((c, i) => [c.id, i + 1]))
}

// The single card at the end of the primary chain — new cards auto-wire
// their input to this card's output so the flow always "snaps" onward.
export function lastInSequence(cards: StoryCard[], connections: Connection[]): StoryCard | null {
  const ordered = orderCards(cards, connections)
  return ordered.length ? ordered[ordered.length - 1] : null
}
