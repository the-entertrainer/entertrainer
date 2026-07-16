// The victim: a rounded Limbo-silhouette cartoon, drawn procedurally. A single
// "hang-down from the neck" model serves both standing and hanging; only the
// neck point and the body's down-angle change. Facial + limb params lerp by
// state for calm -> nervous -> panicked -> limp expression.
//
// On top of the base states, two animation layers add life:
//   • Reactions  — a distinct one-shot flinch for every wrong guess.
//   • Death styles — the hang plays out differently each round (swing / snap /
//     kick / twitch), chosen by the page.

import { clamp, lerp } from './math'

export type CharState = 'IDLE' | 'NERVOUS' | 'STRUGGLING' | 'FALLING' | 'HANGING' | 'LIMP' | 'ESCAPED'
export type ReactKind = 'flinch' | 'gulp' | 'shiver' | 'dart' | 'tug' | 'wobble'
export type DeathStyle = 'swing' | 'snap' | 'kick' | 'twitch'

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

interface Drop { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number }

export class HangCharacter {
  state: CharState = 'IDLE'
  deathStyle: DeathStyle = 'swing'
  // Smoothed facial params.
  private f: FaceTarget = { ...FACE.IDLE }
  private squash = 0
  private flail = 0
  private t = 0
  private blink = 0
  private nextBlink = 2
  private pupilX = 0; private pupilY = 0

  // Reaction layer (a one-shot flinch per wrong guess).
  private reactKind: ReactKind | null = null
  private reactT = 0
  private reactDur = 0
  private reactAmp = 0
  private dartBoost = 0

  // Sweat / tears.
  private sweat: Drop[] = []
  private pendingSweat = 0
  private sweatSide = 1
  private sweatTimer = 0
  private lastHeadX = 0; private lastHeadY = 0; private lastHr = 0

  // Death-style extras.
  private headLoll = 0        // head lolls to the side when snapped / dead
  private twitchImpulse = 0   // spikes on a twitch, decays

  setState(s: CharState) {
    if (s === this.state) return
    if (s === 'FALLING') this.flail = 1
    if (s === 'HANGING') {
      this.squash = 1
      if (this.deathStyle === 'snap') this.headLoll = -0.9 // violent sideways snap
    }
    this.state = s
  }

  setDeathStyle(d: DeathStyle) { this.deathStyle = d }

  // One-shot reaction, triggered on each wrong guess. Escalating in feel.
  react(kind: ReactKind) {
    this.reactKind = kind
    this.reactT = 0
    this.reactAmp = 1
    this.reactDur = kind === 'shiver' ? 0.85 : kind === 'wobble' ? 1.1 : kind === 'tug' ? 0.75 : 0.55
    if (kind === 'flinch') this.squash = 0.55
    if (kind === 'dart') this.dartBoost = 1
    if (kind === 'gulp' || kind === 'tug') { this.pendingSweat += 1; this.sweatSide = Math.random() < 0.5 ? -1 : 1 }
    if (kind === 'wobble') { this.pendingSweat += 2 }
  }

  // A sharp full-body twitch (used by the "twitch" death style while hanging).
  twitch() {
    this.flail = Math.max(this.flail, 0.8)
    this.squash = 0.6
    this.twitchImpulse = 1
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
    this.twitchImpulse = lerp(this.twitchImpulse, 0, 1 - Math.pow(0.02, dt))

    // Head loll: dead heads drop to the side; snapped heads stay lolled; alive heads level.
    const lollTgt = this.state === 'LIMP' ? 0.55
      : (this.state === 'HANGING' && this.deathStyle === 'snap') ? -0.9
      : 0
    this.headLoll = lerp(this.headLoll, lollTgt, 1 - Math.pow(0.2, dt))

    // Flail energy: high on fall, decays through the swing, gone when limp.
    if (this.state === 'FALLING') this.flail = clamp(0.7 + opts.speed * 0.03, 0, 1.6)
    else if (this.state === 'HANGING') {
      // The "kick" style keeps thrashing far longer than the others.
      const settle = this.deathStyle === 'kick' ? 0.55 : 0.12
      this.flail = lerp(this.flail, settle, 1 - Math.pow(this.deathStyle === 'kick' ? 0.5 : 0.15, dt))
    }
    else if (this.state === 'LIMP') this.flail = lerp(this.flail, 0, 1 - Math.pow(0.05, dt))
    else this.flail = 0.05 + opts.wrongFrac * 0.28 // pre-drop fidget grows with danger

    // Advance the current reaction envelope.
    if (this.reactKind) {
      this.reactT += dt
      const rp = this.reactT / this.reactDur
      if (rp >= 1) { this.reactKind = null; this.reactAmp = 0 }
      else this.reactAmp = 1 - rp
    }
    this.dartBoost = lerp(this.dartBoost, 0, 1 - Math.pow(0.06, dt))

    // Darting pupils when nervous/struggling, amplified briefly by a "dart" reaction.
    const nervous = this.state === 'NERVOUS' || this.state === 'STRUGGLING'
    const dartT = nervous ? 4 : 1
    const dartAmp = (nervous ? 0.5 : 0.15) + this.dartBoost * 0.6
    this.pupilX = lerp(this.pupilX, Math.sin(this.t * (dartT + this.dartBoost * 6)) * dartAmp, 0.1)
    this.pupilY = lerp(this.pupilY, Math.cos(this.t * dartT * 0.7) * 0.2, 0.1)

    // Blink for alive states.
    if (this.state !== 'LIMP' && this.state !== 'HANGING') {
      this.nextBlink -= dt
      if (this.nextBlink <= 0) { this.blink = 1; this.nextBlink = 1.5 + Math.random() * 2.5 }
    }
    this.blink = lerp(this.blink, 0, 1 - Math.pow(0.0001, dt))

    // Idle stress-sweat while genuinely panicking.
    if (this.state === 'STRUGGLING') {
      this.sweatTimer -= dt
      if (this.sweatTimer <= 0) { this.pendingSweat += 1; this.sweatSide = Math.random() < 0.5 ? -1 : 1; this.sweatTimer = 0.6 + Math.random() * 0.8 }
    }

    // Sweat physics (px/sec units in canvas space).
    for (const d of this.sweat) {
      d.vy += 900 * dt
      d.x += d.vx * dt
      d.y += d.vy * dt
      d.life -= dt
    }
    if (this.sweat.length) this.sweat = this.sweat.filter(d => d.life > 0)
  }

  // Reaction-driven offsets, resolved per draw. Returns head + body shifts and a tilt.
  private reactionOffsets(s: number) {
    let headX = 0, headY = 0, bodyX = 0, bodyY = 0, tilt = 0
    const k = this.reactKind, a = this.reactAmp, rt = this.reactT
    if (k === 'flinch') { headY = -a * 8 * s; tilt = Math.sin(rt * 46) * 0.07 * a }
    else if (k === 'gulp') { headY = Math.abs(Math.sin(rt * 9)) * 5 * s * a }
    else if (k === 'shiver') { bodyX = Math.sin(rt * 55) * 3 * s * a; headX = Math.sin(rt * 61) * 3.4 * s * a; headY = Math.cos(rt * 52) * 2 * s * a }
    else if (k === 'dart') { tilt = Math.sin(rt * 13) * 0.09 * a }
    else if (k === 'tug') { headY = -a * 4 * s; tilt = -0.05 * a }
    else if (k === 'wobble') { bodyX = Math.sin(rt * 7.5) * 7 * s * a; bodyY = Math.abs(Math.sin(rt * 7.5)) * 4 * s * a; tilt = Math.sin(rt * 7.5) * 0.05 * a }
    // Twitch adds a jittery shove regardless of reaction.
    if (this.twitchImpulse > 0.02) { headX += Math.sin(this.t * 70) * 3 * s * this.twitchImpulse; headY += Math.cos(this.t * 66) * 2 * s * this.twitchImpulse }
    return { headX, headY, bodyX, bodyY, tilt }
  }

  // nx,ny = neck point; ang = body "down" direction (PI/2 == straight down).
  draw(ctx: CanvasRenderingContext2D, nxIn: number, nyIn: number, ang: number, s: number, footY: number | null) {
    const fill = '#111520'
    const rim = '#51586a'
    const rimW = 4 * s
    const alive = this.state !== 'LIMP'
    const breathe = alive ? Math.sin(this.t * 2) * 0.6 * s : 0

    const ro = this.reactionOffsets(s)
    // Body shift moves the whole figure (used for shivers / wobbles while standing).
    const nx = nxIn + (footY != null ? ro.bodyX : 0)
    const ny = nyIn + (footY != null ? ro.bodyY : 0)

    const hr = 34 * s
    const torsoLen = 70 * s
    const down = { x: Math.cos(ang), y: Math.sin(ang) }
    const up = { x: -down.x, y: -down.y }
    const side = { x: -down.y, y: down.x } // perpendicular

    // Head now sits a clear neck's length above the shoulders so the noose can
    // wrap the neck instead of covering the face. Reaction offsets nudge the head.
    const headOff = hr * 1.42
    const headC = {
      x: nx + up.x * headOff + side.x * ro.headX,
      y: ny + up.y * headOff + ro.headY
    }
    // Bottom of the head, where the neck meets the jaw.
    const chin = { x: headC.x + down.x * hr * 0.82, y: headC.y + down.y * hr * 0.82 }
    const hipC = { x: nx + down.x * torsoLen, y: ny + down.y * torsoLen + breathe }
    const shoulderC = { x: nx + down.x * 16 * s, y: ny + down.y * 16 * s }

    const wig = Math.sin(this.t * 9) * this.flail
    const wig2 = Math.sin(this.t * 7 + 1.3) * this.flail

    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    // Two-pass stroke: a lighter rim underneath, dark fill on top, so the
    // silhouette keeps a crisp lit edge against the fog.
    const limb = (w: number) => { ctx.strokeStyle = rim; ctx.lineWidth = w + rimW; ctx.stroke(); ctx.strokeStyle = fill; ctx.lineWidth = w; ctx.stroke() }

    // Legs.
    const kicking = this.state === 'HANGING' && this.deathStyle === 'kick'
    for (const sgn of [-1, 1]) {
      const hipX = hipC.x + side.x * 9 * s * sgn
      const hipY = hipC.y + side.y * 9 * s * sgn
      let footX: number, fy: number
      if (footY != null) { footX = nx + side.x * 16 * s * sgn; fy = footY - 2 * s }
      else {
        // Wild alternating kicks for the "kick" ending; a lazy dangle otherwise.
        const kick = kicking ? Math.sin(this.t * 15 + (sgn > 0 ? 0 : Math.PI)) * 0.7 : 0
        const la = ang + (0.18 * sgn) + wig * 0.5 * sgn + kick
        footX = hipX + Math.cos(la) * 60 * s
        fy = hipY + Math.sin(la) * 60 * s
      }
      const kneeX = (hipX + footX) / 2 + side.x * 4 * s * sgn
      const kneeY = (hipY + fy) / 2
      ctx.beginPath(); ctx.moveTo(hipX, hipY); ctx.quadraticCurveTo(kneeX, kneeY, footX, fy); limb(15 * s)
    }

    // Arms.
    const tugging = this.reactKind === 'tug'
    for (const sgn of [-1, 1]) {
      const shX = shoulderC.x + side.x * 12 * s * sgn
      const shY = shoulderC.y + side.y * 12 * s * sgn
      const raise = this.state === 'ESCAPED' ? -1.1 : 0
      let aa = ang + (0.5 * sgn) + raise * sgn + (wig2 * 0.7 * sgn)
      let reach = 50
      // On a "tug" reaction, the near hand yanks up at the collar.
      if (tugging && sgn === this.sweatSide) { aa = ang - Math.PI * 0.62 * sgn - 0.2 * sgn; reach = 34 + this.reactAmp * 6 }
      const handX = shX + Math.cos(aa) * reach * s
      const handY = shY + Math.sin(aa) * reach * s
      const elX = (shX + handX) / 2 + side.x * 6 * s * sgn * (this.flail > 0.3 || tugging ? 1 : 0)
      const elY = (shY + handY) / 2
      ctx.beginPath(); ctx.moveTo(shX, shY); ctx.quadraticCurveTo(elX, elY, handX, handY); limb(13 * s)
    }

    // Torso (tapered sausage).
    ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(hipC.x, hipC.y); limb(30 * s)

    // Neck bridging shoulders to the jaw.
    ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(chin.x, chin.y); limb(17 * s)

    // Noose loop around the neck — drawn BEFORE the head so the head overlaps its
    // far side and it reads as wrapping behind the neck, never over the face.
    const nkX = (nx + chin.x) / 2, nkY = (ny + chin.y) / 2
    ctx.strokeStyle = '#4a3728'; ctx.lineWidth = 5.5 * s
    ctx.beginPath(); ctx.ellipse(nkX, nkY, 13 * s, 10 * s, ang - Math.PI / 2, 0, Math.PI * 2); ctx.stroke()
    // Knot to one side.
    ctx.fillStyle = '#3a2b1c'
    ctx.beginPath(); ctx.arc(nkX + side.x * 12 * s, nkY + side.y * 12 * s, 4.5 * s, 0, Math.PI * 2); ctx.fill()

    ctx.fillStyle = fill

    // Head with squash on jerk and a loll when snapped / dead.
    const sq = 1 + this.squash * 0.18
    const st = 1 - this.squash * 0.14
    ctx.save()
    ctx.translate(headC.x, headC.y)
    ctx.rotate(ang - Math.PI / 2 + this.pupilX * 0.05 + this.headLoll + ro.tilt)
    ctx.scale(st, sq)
    ctx.beginPath(); ctx.arc(0, 0, hr, 0, Math.PI * 2); ctx.fill()
    ctx.lineWidth = 2 * s; ctx.strokeStyle = rim; ctx.stroke()
    this.drawFace(ctx, hr, s)
    ctx.restore()

    // Spawn any pending sweat now that the head position is known.
    if (this.pendingSweat > 0) {
      for (; this.pendingSweat > 0; this.pendingSweat--) {
        this.sweat.push({
          x: headC.x + side.x * (hr * 0.5) * this.sweatSide + (Math.random() - 0.5) * 4 * s,
          y: headC.y + hr * 0.2,
          vx: this.sweatSide * (20 + Math.random() * 20),
          vy: 30 + Math.random() * 30,
          life: 0.7 + Math.random() * 0.4, max: 1, r: (1.6 + Math.random() * 1.2) * s
        })
      }
    }
    this.lastHeadX = headC.x; this.lastHeadY = headC.y; this.lastHr = hr

    // Draw sweat droplets last so they read on top of the figure.
    if (this.sweat.length) {
      ctx.fillStyle = 'rgba(180,205,225,0.85)'
      for (const d of this.sweat) {
        ctx.globalAlpha = clamp(d.life * 2.2, 0, 0.9)
        ctx.beginPath(); ctx.ellipse(d.x, d.y, d.r * 0.7, d.r, 0, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1
    }
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
