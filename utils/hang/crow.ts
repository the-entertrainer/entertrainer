// A rubber-hose crow perched on the gallows beam. It idles, blinks and bobs;
// every wrong guess startles it into a little hop closer to the noose; the
// drop excites it (open beak, flapping); a win sends it flying off in disgust.

import { clamp, lerp } from './math'

const INK = '#241a10'
const CREAM = '#e9dcb8'
const WHITE = '#f7efd9'

export class Crow {
  private t = 0
  private x: number
  private y: number
  private homeX: number
  private closeX: number
  private tension = 0
  private hopT = -1
  private hopFrom = 0
  private hopTo = 0
  private blink = 0
  private nextBlink = 1.5
  private flap = 0
  private excited = 0
  private mode: 'perch' | 'fly' | 'gone' = 'perch'
  private flyT = 0

  constructor(homeX: number, beamTopY: number, closeX: number) {
    this.homeX = homeX
    this.closeX = closeX
    this.x = homeX
    this.y = beamTopY
  }

  // A wrong guess: flap, and hop half the distance toward the current dread.
  startle() {
    this.flap = 1
    const target = lerp(this.homeX, this.closeX, this.tension)
    if (this.hopT < 0 && Math.abs(target - this.x) > 4) {
      this.hopT = 0
      this.hopFrom = this.x
      this.hopTo = lerp(this.x, target, 0.55)
    }
  }

  excite() { this.excited = 1; this.flap = 1 }

  flyAway() { if (this.mode === 'perch') { this.mode = 'fly'; this.flyT = 0 } }

  update(dt: number, tension: number) {
    this.t += dt
    this.tension = tension
    this.flap = lerp(this.flap, 0, 1 - Math.pow(0.03, dt))
    this.excited = lerp(this.excited, 0, 1 - Math.pow(0.25, dt))
    this.nextBlink -= dt
    if (this.nextBlink <= 0) { this.blink = 1; this.nextBlink = 1.2 + Math.random() * 3 }
    this.blink = lerp(this.blink, 0, 1 - Math.pow(0.0001, dt))
    if (this.hopT >= 0) {
      this.hopT += dt / 0.32
      if (this.hopT >= 1) { this.x = this.hopTo; this.hopT = -1 }
      else this.x = lerp(this.hopFrom, this.hopTo, this.hopT)
    }
    if (this.mode === 'fly') {
      this.flyT += dt
      if (this.flyT > 3) this.mode = 'gone'
    }
  }

  draw(ctx: CanvasRenderingContext2D, s: number) {
    if (this.mode === 'gone') return
    let x = this.x, y = this.y
    let alpha = 1
    if (this.mode === 'fly') {
      x += this.flyT * 250 * s
      y -= this.flyT * 170 * s + this.flyT * this.flyT * 30 * s
      alpha = clamp(1 - this.flyT / 2.2, 0, 1)
      if (alpha <= 0) return
    }
    const hop = this.hopT >= 0 ? Math.sin(this.hopT * Math.PI) * 15 * s : 0
    const bob = Math.sin(this.t * 2.3) * 1.2 * s
    // Leans left, toward the victim, more as the tension grows.
    const lean = -0.1 - this.tension * 0.28 - this.excited * 0.22
    const flying = this.mode === 'fly'
    const flapAmt = flying ? 1 : this.flap
    const flapA = flapAmt > 0.05 ? Math.sin(this.t * 26) * (flying ? 0.95 : 0.6) * flapAmt : 0

    ctx.save()
    ctx.globalAlpha = alpha
    ctx.translate(x, y + bob - hop - (flying ? 6 * s : 0))
    ctx.rotate(lean)
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'

    // Legs (tucked when flying).
    if (!flying) {
      ctx.strokeStyle = INK; ctx.lineWidth = 2.2 * s
      ctx.beginPath()
      ctx.moveTo(-4 * s, -6 * s); ctx.lineTo(-4 * s, 0)
      ctx.moveTo(3 * s, -6 * s); ctx.lineTo(3 * s, 0)
      ctx.stroke()
    }
    // Tail feathers, back-right.
    ctx.strokeStyle = INK; ctx.lineWidth = 3.4 * s
    for (const a of [-0.22, 0, 0.22]) {
      ctx.beginPath()
      ctx.moveTo(8 * s, -14 * s)
      ctx.lineTo(8 * s + Math.cos(a + 0.45) * 15 * s, -14 * s + Math.sin(a + 0.45) * 8 * s)
      ctx.stroke()
    }
    // Body.
    ctx.fillStyle = INK; ctx.strokeStyle = CREAM; ctx.lineWidth = 1.8 * s
    ctx.beginPath(); ctx.ellipse(0, -14 * s, 13 * s, 9.5 * s, -0.18, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    // Wing.
    ctx.save()
    ctx.translate(2 * s, -16 * s)
    ctx.rotate(flapA)
    ctx.fillStyle = INK; ctx.strokeStyle = CREAM; ctx.lineWidth = 1.5 * s
    ctx.beginPath(); ctx.ellipse(3 * s, 2 * s, 8.5 * s, 5 * s, 0.35, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    ctx.restore()
    // Head.
    ctx.fillStyle = INK; ctx.strokeStyle = CREAM; ctx.lineWidth = 1.8 * s
    ctx.beginPath(); ctx.arc(-11 * s, -24 * s, 7.5 * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    // Beak — opens with excitement.
    const gap = 0.5 + this.excited * 1.8
    ctx.fillStyle = CREAM; ctx.strokeStyle = INK; ctx.lineWidth = 1.2 * s
    ctx.beginPath()
    ctx.moveTo(-17 * s, -25.5 * s)
    ctx.lineTo(-25 * s, -24 * s - gap * s)
    ctx.lineTo(-17 * s, -23.5 * s)
    ctx.closePath(); ctx.fill(); ctx.stroke()
    // Eye.
    const open = Math.max(0.15, 1 - this.blink)
    ctx.fillStyle = WHITE
    ctx.beginPath(); ctx.ellipse(-12.5 * s, -26 * s, 2.6 * s, 2.6 * s * open, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = INK
    ctx.beginPath(); ctx.arc(-13.2 * s, -26 * s, 1.1 * s * open, 0, Math.PI * 2); ctx.fill()

    ctx.restore()
  }
}
