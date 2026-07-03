import type { Connection, StoryCard } from '~/types/story'

// The connection graph *is* the storyboard sequence: numbering, export
// order, and "what comes next" all fall out of a depth-first walk starting
// at the root card(s) (cards nothing points into). Disconnected islands are
// appended afterward, left-to-right, so nothing gets silently dropped.
export function orderCards(cards: StoryCard[], connections: Connection[]): StoryCard[] {
  const byId = new Map(cards.map(c => [c.id, c]))
  const outgoing = new Map<string, string[]>()
  // Branches walk in option order (main port first, then A, B, C, D) so
  // numbering follows the "answer A" path before later branches.
  const sorted = [...connections].sort((a, b) => (a.fromPort || '').localeCompare(b.fromPort || ''))
  for (const c of sorted) {
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

// True if `target` is reachable by walking outgoing connections from
// `start` — connecting target→start would then close a loop.
export function isReachable(connections: Connection[], start: string, target: string): boolean {
  const outgoing = new Map<string, string[]>()
  for (const c of connections) {
    if (!outgoing.has(c.from)) outgoing.set(c.from, [])
    outgoing.get(c.from)!.push(c.to)
  }
  const stack = [start]
  const seen = new Set<string>()
  while (stack.length) {
    const id = stack.pop()!
    if (id === target) return true
    if (seen.has(id)) continue
    seen.add(id)
    for (const next of outgoing.get(id) || []) stack.push(next)
  }
  return false
}

// Flow rules: every output port carries at most one curve (an MCQ has one
// port per answer option), inputs may merge several branches, and no
// loops. Imports from older saves get squeezed through the same rules.
export function sanitizeConnections(cards: StoryCard[], connections: Connection[]): Connection[] {
  const ids = new Set(cards.map(c => c.id))
  const usedPorts = new Set<string>()
  const kept: Connection[] = []
  for (const c of connections) {
    if (!ids.has(c.from) || !ids.has(c.to) || c.from === c.to) continue
    const portKey = `${c.from}#${c.fromPort || ''}`
    if (usedPorts.has(portKey)) continue
    if (isReachable(kept, c.to, c.from)) continue
    kept.push(c)
    usedPorts.add(portKey)
  }
  return kept
}
