import type { Scene, Connection } from '~/types/story'

// The connection graph *is* the story sequence: numbering, export order, and
// "what comes next" all fall out of a depth-first walk starting at the
// root node(s) (scenes nothing points into). Disconnected islands are
// appended afterward, left-to-right, so nothing gets silently dropped.
export function orderScenes(scenes: Scene[], connections: Connection[]): Scene[] {
  const byId = new Map(scenes.map(s => [s.id, s]))
  const outgoing = new Map<string, string[]>()
  for (const c of connections) {
    if (!byId.has(c.from) || !byId.has(c.to)) continue
    if (!outgoing.has(c.from)) outgoing.set(c.from, [])
    outgoing.get(c.from)!.push(c.to)
  }
  const hasIncoming = new Set(connections.map(c => c.to))
  const roots = scenes.filter(s => !hasIncoming.has(s.id)).sort((a, b) => a.x - b.x || a.y - b.y)

  const visited = new Set<string>()
  const ordered: Scene[] = []

  function visit(id: string) {
    if (visited.has(id)) return
    const scene = byId.get(id)
    if (!scene) return
    visited.add(id)
    ordered.push(scene)
    for (const nextId of outgoing.get(id) || []) visit(nextId)
  }

  for (const root of roots) visit(root.id)
  const remaining = scenes.filter(s => !visited.has(s.id)).sort((a, b) => a.x - b.x || a.y - b.y)
  for (const s of remaining) visit(s.id)

  return ordered
}

export function sceneNumbers(scenes: Scene[], connections: Connection[]): Map<string, number> {
  const ordered = orderScenes(scenes, connections)
  return new Map(ordered.map((s, i) => [s.id, i + 1]))
}

// The single node at the end of the primary chain — new scenes auto-wire
// their input to this node's output so the graph always "snaps" onward.
export function lastInSequence(scenes: Scene[], connections: Connection[]): Scene | null {
  const ordered = orderScenes(scenes, connections)
  return ordered.length ? ordered[ordered.length - 1] : null
}
