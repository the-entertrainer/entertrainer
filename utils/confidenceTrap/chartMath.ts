// Chart geometry for the Thank You reveal. The reference curve is an
// illustrative rendering of the *shape* Kruger & Dunning (1999) actually
// reported — confidence disproportionately high relative to accuracy at
// the low end, the gap narrowing and slightly inverting at the high end —
// not a precise refit of their published numbers, and not the popular
// "Mount Stupid" hump. It is captioned as illustrative wherever it's shown.
export interface CurveAnchor {
  accuracy: number   // x axis, 0-100
  confidence: number // y axis, 0-100
}

export const REFERENCE_CURVE: CurveAnchor[] = [
  { accuracy: 5, confidence: 56 },
  { accuracy: 30, confidence: 64 },
  { accuracy: 50, confidence: 68 },
  { accuracy: 70, confidence: 74 },
  { accuracy: 95, confidence: 87 }
]

export interface ChartFrame {
  width: number
  height: number
  marginLeft: number
  marginRight: number
  marginTop: number
  marginBottom: number
}

export function toPx(frame: ChartFrame, accuracy: number, confidence: number): { x: number; y: number } {
  const plotW = frame.width - frame.marginLeft - frame.marginRight
  const plotH = frame.height - frame.marginTop - frame.marginBottom
  const x = frame.marginLeft + (accuracy / 100) * plotW
  const y = frame.marginTop + plotH - (confidence / 100) * plotH
  return { x, y }
}

/** Catmull-Rom to cubic-bezier conversion — a smooth curve through every anchor, no external spline dependency. */
export function smoothPath(anchors: CurveAnchor[], frame: ChartFrame): string {
  const pts = anchors.map(a => toPx(frame, a.accuracy, a.confidence))
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  return d
}

export function diagonalPath(frame: ChartFrame): string {
  const a = toPx(frame, 0, 0)
  const b = toPx(frame, 100, 100)
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`
}
