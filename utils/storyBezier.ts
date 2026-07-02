export interface Pt { x: number; y: number }

// One curve definition shared by the live canvas and the PNG exporter.
// Forward connections get the classic horizontal S; backward or very tight
// connections bow vertically so they read as a deliberate return loop
// instead of a sprawling tangle.
export function bezierControls(p1: Pt, p2: Pt): { c1: Pt; c2: Pt } {
  const dx = p2.x - p1.x
  if (dx >= 40) {
    const reach = Math.max(Math.abs(dx) * 0.55, 70)
    return { c1: { x: p1.x + reach, y: p1.y }, c2: { x: p2.x - reach, y: p2.y } }
  }
  const reach = Math.min(220, 100 + Math.abs(dx) * 0.2)
  const dir = p2.y >= p1.y ? 1 : -1
  const lift = dir * Math.max(70, Math.min(150, Math.abs(p2.y - p1.y) * 0.5))
  return {
    c1: { x: p1.x + reach, y: p1.y + lift },
    c2: { x: p2.x - reach, y: p2.y - lift }
  }
}

export function bezierPath(p1: Pt, p2: Pt): string {
  const { c1, c2 } = bezierControls(p1, p2)
  return `M${p1.x},${p1.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y}`
}

export function bezierPointAt(p1: Pt, p2: Pt, t: number): Pt {
  const { c1, c2 } = bezierControls(p1, p2)
  const mt = 1 - t
  return {
    x: mt * mt * mt * p1.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * p2.x,
    y: mt * mt * mt * p1.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * p2.y
  }
}
