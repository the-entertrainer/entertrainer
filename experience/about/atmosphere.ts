// Canvas-2D atmosphere for the About narrative.
//
// Deliberately NOT WebGL and NOT "3D objects" — typography is the subject, this
// is only air around it: a deep base wash, one slow Pi Blue glow that drifts
// toward the active scene's focus, and a fine film grain. Cheap enough to run at
// a throttled frame rate on a single 2D context.

const PI_BLUE = { r: 0x24, g: 0x3f, b: 0x6a }

export interface AtmosphereOptions {
  dark: boolean
}

export class Atmosphere {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private grain: HTMLCanvasElement
  private w = 0
  private h = 0
  private dpr = 1
  private raf = 0
  private last = 0
  private running = false

  private dark: boolean
  private intensity = 0.0
  private intensityTarget = 0.0
  private focus = { x: 0.5, y: 0.5 }
  private focusTarget = { x: 0.5, y: 0.5 }
  private t = 0

  constructor(canvas: HTMLCanvasElement, opts: AtmosphereOptions) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d', { alpha: false })!
    this.dark = opts.dark
    this.grain = this._bakeGrain()
    this.resize()
  }

  private _bakeGrain(): HTMLCanvasElement {
    const size = 160
    const g = document.createElement('canvas')
    g.width = size; g.height = size
    const gc = g.getContext('2d')!
    const img = gc.createImageData(size, size)
    const d = img.data
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255
      d[i] = d[i + 1] = d[i + 2] = v
      d[i + 3] = 13 // very low alpha — barely-there texture
    }
    gc.putImageData(img, 0, 0)
    return g
  }

  setDark(dark: boolean) { this.dark = dark }

  // 0 = calm, 1 = charged. Drives glow strength per active scene.
  setIntensity(v: number) { this.intensityTarget = Math.max(0, Math.min(1, v)) }

  // viewport-relative focus the glow drifts toward.
  setFocus(x: number, y: number) { this.focusTarget.x = x; this.focusTarget.y = y }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.w = window.innerWidth
    this.h = window.innerHeight
    this.canvas.width = Math.floor(this.w * this.dpr)
    this.canvas.height = Math.floor(this.h * this.dpr)
    this.canvas.style.width = this.w + 'px'
    this.canvas.style.height = this.h + 'px'
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
  }

  start() {
    if (this.running) return
    this.running = true
    this.last = performance.now()
    this.raf = requestAnimationFrame(this._loop)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  private _loop = (now: number) => {
    if (!this.running) return
    this.raf = requestAnimationFrame(this._loop)
    const dt = Math.min((now - this.last) / 1000, 0.05)
    this.last = now
    this.t += dt

    // ease state toward targets
    this.intensity += (this.intensityTarget - this.intensity) * Math.min(dt * 2.4, 1)
    this.focus.x += (this.focusTarget.x - this.focus.x) * Math.min(dt * 1.8, 1)
    this.focus.y += (this.focusTarget.y - this.focus.y) * Math.min(dt * 1.8, 1)

    this._draw()
  }

  private _draw() {
    const { ctx, w, h } = this

    // base wash
    ctx.fillStyle = this.dark ? '#0C0E14' : '#FAFAF8'
    ctx.fillRect(0, 0, w, h)

    // drifting Pi Blue glow
    const driftX = Math.sin(this.t * 0.15) * 0.04
    const driftY = Math.cos(this.t * 0.11) * 0.04
    const cx = (this.focus.x + driftX) * w
    const cy = (this.focus.y + driftY) * h
    const radius = Math.max(w, h) * (0.55 + this.intensity * 0.25)

    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
    const a = (this.dark ? 0.36 : 0.16) * (0.35 + this.intensity * 0.65)
    glow.addColorStop(0, `rgba(${PI_BLUE.r},${PI_BLUE.g},${PI_BLUE.b},${a})`)
    glow.addColorStop(0.55, `rgba(${PI_BLUE.r},${PI_BLUE.g},${PI_BLUE.b},${a * 0.35})`)
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, w, h)

    // vignette
    const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75)
    vig.addColorStop(0, 'rgba(0,0,0,0)')
    vig.addColorStop(1, this.dark ? 'rgba(0,0,0,0.55)' : 'rgba(120,120,130,0.18)')
    ctx.fillStyle = vig
    ctx.fillRect(0, 0, w, h)

    // grain — tiled, jittered each frame
    const ox = Math.random() * this.grain.width
    const oy = Math.random() * this.grain.height
    const pattern = ctx.createPattern(this.grain, 'repeat')
    if (pattern) {
      ctx.save()
      ctx.globalAlpha = this.dark ? 0.6 : 0.4
      ctx.translate(-ox, -oy)
      ctx.fillStyle = pattern
      ctx.fillRect(ox, oy, w, h)
      ctx.restore()
    }
  }

  dispose() {
    this.stop()
  }
}
