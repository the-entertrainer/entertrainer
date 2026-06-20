// Scene 08 — "We cut / simplify / rearrange / remove" → physical editing.
//
// The four "remove" lines are struck through (rough-notation) and then released
// as Matter.js rigid bodies that fall and tumble out of frame, leaving only the
// survivor: "We keep what helps people understand." Driven by the scene's scroll
// progress so the editing happens as you move through it.

import { annotate } from 'rough-notation'

interface CutLine {
  el: HTMLElement
  released: boolean
  body: any
  w: number
  h: number
}

export class CutPhysics {
  private Matter: any = null
  private engine: any = null
  private lines: CutLine[] = []
  private keepEl: HTMLElement | null = null
  private raf = 0
  private running = false
  private started = false
  private thresholds: number[] = []

  async init(removeEls: HTMLElement[], keepEl: HTMLElement) {
    this.keepEl = keepEl
    this.Matter = await import('matter-js')
    this.engine = this.Matter.Engine.create({ gravity: { x: 0, y: 1 } })

    this.lines = removeEls.map(el => ({ el, released: false, body: null, w: 0, h: 0 }))
    // even thresholds across 0.15 .. 0.8 of scene progress
    const n = this.lines.length
    this.thresholds = this.lines.map((_, i) => 0.15 + (i / n) * 0.62)
  }

  private _release(line: CutLine) {
    if (line.released || !this.Matter) return
    line.released = true

    const rect = line.el.getBoundingClientRect()
    line.w = rect.width
    line.h = rect.height

    // strike-through, then drop a beat later
    const ann = annotate(line.el, { type: 'strike', color: '#8C8C8C', strokeWidth: 3, animationDuration: 260 })
    ann.show()

    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    const body = this.Matter.Bodies.rectangle(cx, cy, Math.max(rect.width, 40), Math.max(rect.height, 24), {
      restitution: 0.25,
      frictionAir: 0.01,
      angle: 0,
    })
    line.body = body

    setTimeout(() => {
      if (!this.Matter) return
      // pin element to viewport so we can drive it by physics
      line.el.style.position = 'fixed'
      line.el.style.left = '0'
      line.el.style.top = '0'
      line.el.style.margin = '0'
      line.el.style.zIndex = '6'
      line.el.style.willChange = 'transform'
      this._syncEl(line)

      this.Matter.Composite.add(this.engine.world, body)
      this.Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.35)
      this.Matter.Body.applyForce(body, body.position, {
        x: (Math.random() - 0.5) * 0.04,
        y: -0.02 - Math.random() * 0.03,
      })
      this._ensureLoop()
    }, 280)
  }

  private _syncEl(line: CutLine) {
    if (!line.body) return
    const { x, y } = line.body.position
    const angle = line.body.angle
    line.el.style.transform =
      `translate(${x - line.w / 2}px, ${y - line.h / 2}px) rotate(${angle}rad)`
  }

  private _ensureLoop() {
    if (this.running) return
    this.running = true
    const step = () => {
      if (!this.running || !this.Matter) return
      this.Matter.Engine.update(this.engine, 1000 / 60)
      let anyOnScreen = false
      for (const line of this.lines) {
        if (line.released && line.body) {
          this._syncEl(line)
          if (line.body.position.y < window.innerHeight + 240) anyOnScreen = true
        }
      }
      if (anyOnScreen) {
        this.raf = requestAnimationFrame(step)
      } else {
        this.running = false
      }
    }
    this.raf = requestAnimationFrame(step)
  }

  // progress 0..1 across the pinned scene
  setProgress(p: number) {
    this.started = true
    this.lines.forEach((line, i) => {
      if (!line.released && p >= this.thresholds[i]) this._release(line)
    })
    // survivor emphasis
    if (this.keepEl) {
      const k = Math.max(0, Math.min(1, (p - 0.78) / 0.22))
      this.keepEl.style.transform = `scale(${1 + k * 0.12})`
      this.keepEl.style.opacity = String(0.5 + k * 0.5)
    }
  }

  dispose() {
    this.running = false
    cancelAnimationFrame(this.raf)
    if (this.Matter && this.engine) this.Matter.Engine.clear(this.engine)
    this.Matter = null
    this.engine = null
    this.lines = []
  }
}
