// Matter.js word-scatter physics for Entry 08 (Clarity)
// Renders as DOM elements overlaid on the canvas, not inside Three.js

export interface ScatterWord {
  text: string
  el: HTMLDivElement
}

export class ScatterPhysics {
  private _container: HTMLElement
  private _engine: any = null
  private _runner: any = null
  private _bodies: any[] = []
  private _words: ScatterWord[] = []
  private _raf = 0
  private _active = false
  private _Matter: any = null

  constructor(container: HTMLElement) {
    this._container = container
  }

  async init(words: string[]) {
    if (this._Matter) return
    const Matter = await import('matter-js')
    this._Matter = Matter

    this._engine = Matter.Engine.create({ gravity: { x: 0, y: 0.3 } })

    const W = window.innerWidth
    const H = window.innerHeight

    // Create ground and walls (off-screen catchers)
    const ground = Matter.Bodies.rectangle(W / 2, H + 60, W * 2, 40, { isStatic: true })
    const wallL  = Matter.Bodies.rectangle(-60, H / 2, 40, H * 2, { isStatic: true })
    const wallR  = Matter.Bodies.rectangle(W + 60, H / 2, 40, H * 2, { isStatic: true })
    Matter.Composite.add(this._engine.world, [ground, wallL, wallR])

    // Create word DOM elements + physics bodies
    words.forEach((word, i) => {
      const el = document.createElement('div')
      el.textContent = word
      el.style.cssText = `
        position: fixed;
        font-family: "DM Sans", sans-serif;
        font-size: clamp(18px, 3vw, 32px);
        font-weight: 600;
        color: #E8E4DC;
        pointer-events: none;
        user-select: none;
        white-space: nowrap;
        z-index: 50;
        opacity: 0;
        transform-origin: center center;
        letter-spacing: -0.03em;
      `
      this._container.appendChild(el)

      // Position in a rough horizontal spread
      const x = W * 0.2 + (i / words.length) * W * 0.6
      const y = H * 0.35 + (i % 3) * (H * 0.08)
      el.style.left = x + 'px'
      el.style.top  = y + 'px'

      const bW = 120, bH = 36
      const body = Matter.Bodies.rectangle(x, y, bW, bH, {
        restitution: 0.35,
        friction: 0.1,
        frictionAir: 0.015,
        density: 0.001,
      })
      Matter.Composite.add(this._engine.world, body)

      this._words.push({ text: word, el })
      this._bodies.push(body)
    })
  }

  activate() {
    if (!this._Matter || this._active) return
    this._active = true

    // Fade words in
    this._words.forEach(({ el }, i) => {
      setTimeout(() => { el.style.opacity = '1' }, i * 80)
    })

    // Give random initial impulse after short delay
    setTimeout(() => {
      this._bodies.forEach((body, i) => {
        const fx = (Math.random() - 0.5) * 0.08
        const fy = -(0.03 + Math.random() * 0.06)
        this._Matter.Body.applyForce(body, body.position, { x: fx, y: fy })
        this._Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3)
      })
      this._loop()
    }, 400)
  }

  private _loop() {
    if (!this._active) return
    this._Matter.Engine.update(this._engine, 1000 / 60)

    this._words.forEach(({ el }, i) => {
      const b = this._bodies[i]
      const { x, y } = b.position
      const angle = b.angle
      el.style.left = (x - 60) + 'px'
      el.style.top  = (y - 18) + 'px'
      el.style.transform = `rotate(${angle}rad)`
    })

    // Stop when all have left viewport
    const allGone = this._bodies.every(b => b.position.y > window.innerHeight + 100)
    if (!allGone) {
      this._raf = requestAnimationFrame(() => this._loop())
    }
  }

  deactivate() {
    this._active = false
    cancelAnimationFrame(this._raf)
    this._words.forEach(({ el }) => { el.style.opacity = '0' })

    // Reset bodies
    if (this._Matter) {
      const W = window.innerWidth, H = window.innerHeight
      this._bodies.forEach((body, i) => {
        const x = W * 0.2 + (i / this._bodies.length) * W * 0.6
        const y = H * 0.35 + (i % 3) * (H * 0.08)
        this._Matter.Body.setPosition(body, { x, y })
        this._Matter.Body.setVelocity(body, { x: 0, y: 0 })
        this._Matter.Body.setAngle(body, 0)
      })
    }
  }

  dispose() {
    this.deactivate()
    this._words.forEach(({ el }) => el.remove())
    this._words = []
    this._bodies = []
    if (this._Matter && this._engine) {
      this._Matter.Engine.clear(this._engine)
    }
  }
}
