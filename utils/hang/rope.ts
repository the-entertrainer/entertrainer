// Verlet-integrated rope. First point is pinned to the beam; the last point is
// pinned while the victim stands, then released for the drop so the rope's own
// pendulum physics carry the swing and settle. Framework-agnostic.

export interface Particle { x: number; y: number; ox: number; oy: number; pinned: boolean }

export class Rope {
  points: Particle[] = []
  segLen: number
  restTotal: number
  gravity: number
  damping: number
  iterations: number

  constructor(ax: number, ay: number, bx: number, by: number, count: number, opts?: { gravity?: number; damping?: number; iterations?: number }) {
    this.gravity = opts?.gravity ?? 0.6
    this.damping = opts?.damping ?? 0.99
    this.iterations = opts?.iterations ?? 14
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1)
      const x = ax + (bx - ax) * t
      const y = ay + (by - ay) * t
      this.points.push({ x, y, ox: x, oy: y, pinned: i === 0 || i === count - 1 })
    }
    this.segLen = Math.hypot(bx - ax, by - ay) / (count - 1)
    this.restTotal = this.segLen * (count - 1)
  }

  get last() { return this.points[this.points.length - 1] }

  setAnchor(x: number, y: number) { const p = this.points[0]; p.x = x; p.y = y; p.ox = x; p.oy = y }
  pinLast(x: number, y: number) { const p = this.last; p.pinned = true; p.x = x; p.y = y; p.ox = x; p.oy = y }
  unpinLast() { this.last.pinned = false }
  // Kick the free end (used to punch a little energy into the drop).
  nudgeLast(vx: number, vy: number) { const p = this.last; p.ox = p.x - vx; p.oy = p.y - vy }

  update() {
    for (const p of this.points) {
      if (p.pinned) continue
      const vx = (p.x - p.ox) * this.damping
      const vy = (p.y - p.oy) * this.damping
      p.ox = p.x; p.oy = p.y
      p.x += vx
      p.y += vy + this.gravity
    }
    for (let k = 0; k < this.iterations; k++) {
      for (let j = 1; j < this.points.length; j++) {
        const p1 = this.points[j - 1]
        const p2 = this.points[j]
        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const d = Math.hypot(dx, dy) || 0.0001
        const diff = (d - this.segLen) / d
        const ox = dx * 0.5 * diff
        const oy = dy * 0.5 * diff
        if (!p1.pinned) { p1.x += ox; p1.y += oy }
        if (!p2.pinned) { p2.x -= ox; p2.y -= oy }
      }
    }
  }

  endAngle(): number {
    const a = this.points[this.points.length - 2]
    const b = this.last
    return Math.atan2(b.y - a.y, b.x - a.x)
  }

  // 0 = fully slack, 1 = taut. Drives the rope's colour and the jerk trigger.
  tension(): number {
    const a = this.points[0], b = this.last
    const span = Math.hypot(b.x - a.x, b.y - a.y)
    return Math.min(1, span / this.restTotal)
  }

  draw(ctx: CanvasRenderingContext2D) {
    const pts = this.points
    const tight = this.tension()
    // Smooth the rope with quadratic midpoints for a natural drape. Aged hemp
    // ink-brown, darkening slightly as it loads up.
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.strokeStyle = `rgb(${82 - tight * 18}, ${60 - tight * 14}, ${38 - tight * 10})`
    ctx.lineWidth = 6.5
    ctx.beginPath()
    ctx.moveTo(pts[0].x, pts[0].y)
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = (pts[i].x + pts[i + 1].x) / 2
      const yc = (pts[i].y + pts[i + 1].y) / 2
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc)
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y)
    ctx.stroke()

    // Twist ticks — short slanted dashes across the line, the classic cartoon
    // shorthand for a wound rope.
    ctx.strokeStyle = 'rgba(30, 20, 10, 0.45)'
    ctx.lineWidth = 1.6
    for (let i = 1; i < pts.length - 1; i++) {
      const p = pts[i], q = pts[i + 1]
      const a = Math.atan2(q.y - p.y, q.x - p.x) + 0.9
      ctx.beginPath()
      ctx.moveTo(p.x - Math.cos(a) * 3.4, p.y - Math.sin(a) * 3.4)
      ctx.lineTo(p.x + Math.cos(a) * 3.4, p.y + Math.sin(a) * 3.4)
      ctx.stroke()
    }
  }
}
