/**
 * Compass constructions from The Sacred Geometry Movie.
 *
 * The film's order is the order of these functions. Do not invent a new
 * center. A circle's center is either the still point or exactly one radius
 * from a circle already drawn.
 *
 * Plug this into design, writing, or code. The picture can change size.
 * The ratios do not.
 */

export const PHI = 1.6180339887

export interface Circle {
  cx: number
  cy: number
  r: number
}

export interface Segment {
  x1: number
  y1: number
  x2: number
  y2: number
}

/** First circle: spirit expands and does not move. */
export function firstCircle(cx = 0, cy = 0, r = 1): Circle {
  return { cx, cy, r }
}

/**
 * Second circle, centered on the rim of the first.
 * The overlap is the vesica piscis. `angle` is where spirit moves.
 * The default is the top of the circle (12 o'clock).
 */
export function secondCircle(origin: Circle, angle = -Math.PI / 2): Circle {
  return {
    cx: origin.cx + origin.r * Math.cos(angle),
    cy: origin.cy + origin.r * Math.sin(angle),
    r: origin.r
  }
}

/**
 * Seed of Life, also called the Genesis Pattern.
 * Circle 0 is the still point. Circles 1–6 are the six movements,
 * each center exactly one radius from the still point and from its neighbors.
 * Returns 7 circles.
 */
export function seedOfLife(cx = 0, cy = 0, r = 1): Circle[] {
  const origin = firstCircle(cx, cy, r)
  const circles = [origin]
  for (let day = 0; day < 6; day++) {
    const angle = -Math.PI / 2 + (Math.PI / 3) * day
    circles.push(secondCircle(origin, angle))
  }
  return circles
}

/**
 * Fruit of Life. Thirteen circles.
 * The still point, the six seed centers, and six more at two radii
 * along the same six directions. Every neighboring pair is one radius apart.
 */
export function fruitOfLife(cx = 0, cy = 0, r = 1): Circle[] {
  const circles = seedOfLife(cx, cy, r)
  for (let i = 0; i < 6; i++) {
    const angle = -Math.PI / 2 + (Math.PI / 3) * i
    circles.push({
      cx: cx + 2 * r * Math.cos(angle),
      cy: cy + 2 * r * Math.sin(angle),
      r
    })
  }
  return circles
}

/**
 * Metatron's Cube: a straight line from the center of every circle
 * to the center of every other circle. Female circles, male lines.
 * Thirteen centers give 78 lines.
 */
export function metatronLines(circles: Circle[]): Segment[] {
  const lines: Segment[] = []
  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      const a = circles[i]!
      const b = circles[j]!
      lines.push({ x1: a.cx, y1: a.cy, x2: b.cx, y2: b.cy })
    }
  }
  return lines
}

/**
 * Phi mark on a rod of length C.
 * The film: A + B = C, and the ratio is 1.6180339…
 * The longer part is C / φ. The shorter part is the rest.
 */
export function phiMark(length: number): { longer: number; shorter: number; ratio: number } {
  const longer = length / PHI
  const shorter = length - longer
  return { longer, shorter, ratio: longer / shorter }
}

/** Fibonacci steps the site already spends: life walking toward phi. */
export const FIBONACCI_PX = [8, 13, 21, 34, 55, 89, 144] as const

/**
 * The site spends the same sequence the film spends.
 * Type and space walk the Fibonacci steps. Time does too.
 * Line height is phi. Do not invent a second scale.
 */
export const LEADING = 1.618

export const MOTION_MS = {
  tap: 144,
  fast: 233,
  mid: 377,
  slow: 610
} as const

export type GeometryFigure = 'seed' | 'vesica' | 'fruit' | 'metatron'

/** Circles for a figure, drawn around the origin. */
export function figureCircles(figure: GeometryFigure): Circle[] {
  if (figure === 'vesica') {
    const first = firstCircle(-36, 0, 72)
    return [first, secondCircle(first, 0)]
  }
  if (figure === 'fruit' || figure === 'metatron') return fruitOfLife(0, 0, 28)
  return seedOfLife(0, 0, 56)
}
