// The victim: a rounded Limbo-silhouette cartoon, drawn procedurally. A single
// "hang-down from the neck" model serves both standing and hanging; only the
// neck point and the body's down-angle change. Facial + limb params lerp by
// state for calm -> nervous -> panicked -> limp expression.

import { clamp, lerp } from './math'

export type CharState = 'IDLE' | 'NERVOUS' | 'STRUGGLING' | 'FALLING' | 'HANGING' | 'LIMP' | 'ESCAPED'

interface FaceTarget { eye: number; brow: number; mouth: number; xeyes: number; tongue: number }

const FACE: Record<CharState, FaceTarget> = {
  IDLE:       { eye: 1.0, brow: 0.0, mouth: 0.0, xeyes: 0, tongue: 0 },
  NERVOUS:    { eye: 1.15, brow: 0.5, mouth: 0.2, xeyes: 0, tongue: 0 },
  STRUGGLING: { eye: 1.4, brow: 0.9, mouth: 0.7, xeyes: 0, tongue: 0 },
  FALLING:    { eye: 1.5, brow: 1.0, mouth: 1.0, xeyes: 0, tongue: 0.1 },
  HANGING:    { eye: 0.5, brow: 0.7, mouth: 0.5, xeyes: 0.7, tongue: 0.7 },
  LIMP:       { eye: 0.0, brow: 0.3, mouth: 0.3, xeyes: 1, tongue: 1 },
  ESCAPED:    { eye: 0.9, brow: 0.0, mouth: -1.0, xeyes: 0, tongue: 0 }
}

export class HangCharacter {
  state: CharState = 'IDLE'
  // Smoothed facial params.
  private f: FaceTarget = { ...FACE.IDLE }
  private squash = 0
  private flail = 0
  private t = 0
  private blink = 0
  private nextBlink = 2
  private pupilX = 0; private pupilY = 0

  setState(s: CharState) {
    if (s === this.state) return
    if (s === 'FALLING') this.flail = 1
    if (s === 'HANGING') this.squash = 1
    this.state = s
  }

  update(dt: number, opts: { wrongFrac: number; speed: number }) {
    this.t += dt
    const tgt = FACE[this.state]
    const k = 1 - Math.pow(0.001, dt) // frame-rate independent smoothing
    this.f.eye = lerp(this.f.eye, tgt.eye, k)
    this.f.brow = lerp(this.f.brow, tgt.brow, k)
    this.f.mouth = lerp(this.f.mouth, tgt.mouth, k)
    this.f.xeyes = lerp(this.f.xeyes, tgt.xeyes, k * 0.7)
    this.f.tongue = lerp(this.f.tongue, tgt.tongue, k * 0.7)
    this.squash = lerp(this.squash, 0, 1 - Math.pow(0.02, dt))

    // Flail energy: high on fall, decays through the swing, gone when limp.
    if (this.state === 'FALLING') this.flail = clamp(0.7 + opts.speed * 0.03, 0, 1.6)
    else if (this.state === 'HANGING') this.flail = lerp(this.flail, 0.12, 1 - Math.pow(0.15, dt))
    else if (this.state === 'LIMP') this.flail = lerp(this.flail, 0, 1 - Math.pow(0.05, dt))
    else this.flail = 0.05 + opts.wrongFrac * 0.28 // pre-drop fidget grows with danger

    // Darting pupils when nervous/struggling.
    const nervous = this.state === 'NERVOUS' || this.state === 'STRUGGLING'
    const dartT = nervous ? 4 : 1
    this.pupilX = lerp(this.pupilX, Math.sin(this.t * dartT) * (nervous ? 0.5 : 0.15), 0.1)
    this.pupilY = lerp(this.pupilY, Math.cos(this.t * dartT * 0.7) * 0.2, 0.1)

    // Blink for alive states.
    if (this.state !== 'LIMP' && this.state !== 'HANGING') {
      this.nextBlink -= dt
      if (this.nextBlink <= 0) { this.blink = 1; this.nextBlink = 1.5 + Math.random() * 2.5 }
    }
    this.blink = lerp(this.blink, 0, 1 - Math.pow(0.0001, dt))
  }

  // nx,ny = neck point; ang = body "down" direction (PI/2 == straight down).
  draw(ctx: CanvasRenderingContext2D, nx: number, ny: number, ang: number, s: number, footY: number | null) {
    const fill = '#111520'
    const rim = '#51586a'
    const rimW = 4 * s
    const alive = this.state !== 'LIMP'
    const breathe = alive ? Math.sin(this.t * 2) * 0.6 * s : 0

    const hr = 34 * s
    const torsoLen = 70 * s
    const down = { x: Math.cos(ang), y: Math.sin(ang) }
    const up = { x: -down.x, y: -down.y }
    const side = { x: -down.y, y: down.x } // perpendicular

    const headC = { x: nx + up.x * hr * 0.95, y: ny + up.y * hr * 0.95 }
    const hipC = { x: nx + down.x * torsoLen, y: ny + down.y * torsoLen + breathe }
    const shoulderC = { x: nx + down.x * 16 * s, y: ny + down.y * 16 * s }

    const wig = Math.sin(this.t * 9) * this.flail
    const wig2 = Math.sin(this.t * 7 + 1.3) * this.flail

    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    // Two-pass stroke: a lighter rim underneath, dark fill on top, so the
    // silhouette keeps a crisp lit edge against the fog.
    const limb = (w: number) => { ctx.strokeStyle = rim; ctx.lineWidth = w + rimW; ctx.stroke(); ctx.strokeStyle = fill; ctx.lineWidth = w; ctx.stroke() }

    // Legs.
    for (const sgn of [-1, 1]) {
      const hipX = hipC.x + side.x * 9 * s * sgn
      const hipY = hipC.y + side.y * 9 * s * sgn
      let footX: number, fy: number
      if (footY != null) { footX = nx + side.x * 16 * s * sgn; fy = footY - 2 * s }
      else {
        const la = ang + (0.18 * sgn) + wig * 0.5 * sgn
        footX = hipX + Math.cos(la) * 60 * s
        fy = hipY + Math.sin(la) * 60 * s
      }
      const kneeX = (hipX + footX) / 2 + side.x * 4 * s * sgn
      const kneeY = (hipY + fy) / 2
      ctx.beginPath(); ctx.moveTo(hipX, hipY); ctx.quadraticCurveTo(kneeX, kneeY, footX, fy); limb(15 * s)
    }

    // Arms.
    for (const sgn of [-1, 1]) {
      const shX = shoulderC.x + side.x * 12 * s * sgn
      const shY = shoulderC.y + side.y * 12 * s * sgn
      const raise = this.state === 'ESCAPED' ? -1.1 : 0
      const aa = ang + (0.5 * sgn) + raise * sgn + (wig2 * 0.7 * sgn)
      const handX = shX + Math.cos(aa) * 50 * s
      const handY = shY + Math.sin(aa) * 50 * s
      const elX = (shX + handX) / 2 + side.x * 6 * s * sgn * (this.flail > 0.3 ? 1 : 0)
      const elY = (shY + handY) / 2
      ctx.beginPath(); ctx.moveTo(shX, shY); ctx.quadraticCurveTo(elX, elY, handX, handY); limb(13 * s)
    }

    // Torso (tapered sausage).
    ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(hipC.x, hipC.y); limb(30 * s)
    ctx.fillStyle = fill

    // Head with squash on jerk.
    const sq = 1 + this.squash * 0.18
    const st = 1 - this.squash * 0.14
    ctx.save()
    ctx.translate(headC.x, headC.y)
    ctx.rotate(ang - Math.PI / 2 + this.pupilX * 0.05)
    ctx.scale(st, sq)
    ctx.beginPath(); ctx.arc(0, 0, hr, 0, Math.PI * 2); ctx.fill()
    ctx.lineWidth = 2 * s; ctx.strokeStyle = rim; ctx.stroke()
    this.drawFace(ctx, hr, s)
    ctx.restore()

    // Noose loop at the neck.
    ctx.strokeStyle = '#4a3728'; ctx.lineWidth = 5 * s
    ctx.beginPath(); ctx.ellipse(nx, ny + 2 * s, 12 * s, 15 * s, ang - Math.PI / 2, 0, Math.PI * 2); ctx.stroke()
  }

  private drawFace(ctx: CanvasRenderingContext2D, hr: number, s: number) {
    const eyeY = -hr * 0.15
    const eyeDX = hr * 0.42
    const open = Math.max(0.06, this.f.eye * (1 - this.blink))
    // Eyes.
    for (const sgn of [-1, 1]) {
      const ex = sgn * eyeDX
      if (this.f.xeyes > 0.5) {
        ctx.strokeStyle = '#b8452f'; ctx.lineWidth = 3.2 * s
        const r = hr * 0.18
        ctx.beginPath(); ctx.moveTo(ex - r, eyeY - r); ctx.lineTo(ex + r, eyeY + r)
        ctx.moveTo(ex + r, eyeY - r); ctx.lineTo(ex - r, eyeY + r); ctx.stroke()
      } else {
        ctx.fillStyle = '#d7d9de'
        ctx.beginPath(); ctx.ellipse(ex, eyeY, hr * 0.2, hr * 0.24 * open, 0, 0, Math.PI * 2); ctx.fill()
        // Pupil.
        ctx.fillStyle = '#0b0c10'
        ctx.beginPath(); ctx.arc(ex + this.pupilX * hr * 0.12, eyeY + this.pupilY * hr * 0.12, hr * 0.09, 0, Math.PI * 2); ctx.fill()
      }
      // Brow.
      ctx.strokeStyle = '#2a2f3a'; ctx.lineWidth = 3 * s
      const bY = eyeY - hr * 0.34
      ctx.beginPath()
      ctx.moveTo(ex - hr * 0.22, bY + this.f.brow * hr * 0.12 * sgn)
      ctx.lineTo(ex + hr * 0.22, bY - this.f.brow * hr * 0.08 * sgn)
      ctx.stroke()
    }
    // Mouth: curve maps -1 (smile) .. 0 (line) .. 1 (open grimace).
    const mY = hr * 0.42
    const m = this.f.mouth
    ctx.strokeStyle = '#2a2f3a'; ctx.lineWidth = 3 * s; ctx.fillStyle = '#1a0e0e'
    if (m > 0.35) {
      const w = hr * 0.3, h = hr * 0.22 * m
      ctx.beginPath(); ctx.ellipse(0, mY, w, h, 0, 0, Math.PI * 2); ctx.fill()
      if (this.f.tongue > 0.4) { ctx.fillStyle = '#8b3a3a'; ctx.beginPath(); ctx.ellipse(hr * 0.08, mY + h * 0.5, w * 0.4, h * 0.7 * this.f.tongue, 0.3, 0, Math.PI * 2); ctx.fill() }
    } else {
      const curve = -m * hr * 0.5
      ctx.beginPath(); ctx.moveTo(-hr * 0.3, mY); ctx.quadraticCurveTo(0, mY + curve, hr * 0.3, mY); ctx.stroke()
    }
  }
}
