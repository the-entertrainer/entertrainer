// The victim: a 1930s rubber-hose cartoon in warm sepia ink — round head with a
// cream muzzle, pie-cut pupils, gloved mitts, noodle limbs, big shoes and a
// bowler hat with its own little physics. Drawn procedurally, no assets.
// One "hang-down from the neck" model serves standing and hanging; only the
// neck point and down-angle change. Facial + limb params lerp per state,
// one-shot reactions layer on top, and the ending style varies the hang.

import { clamp, lerp } from './math'

export type CharState = 'IDLE' | 'NERVOUS' | 'STRUGGLING' | 'FALLING' | 'HANGING' | 'LIMP' | 'ESCAPED'
export type ReactKind = 'flinch' | 'gulp' | 'shiver' | 'dart' | 'tug' | 'wobble'
export type DeathStyle = 'swing' | 'snap' | 'kick' | 'twitch'

const INK = '#241a10'
const CREAM = '#e9dcb8'
const WHITE = '#f7efd9'
const RED = '#8f3c2b'
const ROPE = '#4f3a24'

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

interface SweatDrop { x: number; y: number; vx: number; vy: number; life: number; r: number }
interface Hat { mode: 'worn' | 'flying' | 'landed'; x: number; y: number; vx: number; vy: number; rot: number; vr: number }

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

  // Sweat.
  private sweat: SweatDrop[] = []
  private pendingSweat = 0
  private sweatSide = 1
  private sweatTimer = 0

  // Death-style extras.
  private headLoll = 0        // head lolls to the side when snapped / dead
  private twitchImpulse = 0   // spikes on a twitch, decays

  // The bowler hat: worn until the drop, then it takes its own trajectory.
  private hat: Hat = { mode: 'worn', x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0 }
  private hatJump = 0
  private lastS = 1
  private groundY: number | null = null
  private headTop = { x: 0, y: 0 }

  setState(s: CharState) {
    if (s === this.state) return
    if (s === 'FALLING') {
      this.flail = 1
      // The hat stays behind for a beat, then follows physics down.
      if (this.hat.mode === 'worn') {
        this.hat.mode = 'flying'
        this.hat.x = this.headTop.x; this.hat.y = this.headTop.y
        this.hat.vx = (Math.random() - 0.5) * 160 * this.lastS
        this.hat.vy = -340 * this.lastS
        this.hat.vr = (Math.random() - 0.5) * 9
      }
    }
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
    if (kind === 'flinch') { this.squash = 0.55; this.hatJump = 1 }
    if (kind === 'dart') this.dartBoost = 1
    if (kind === 'gulp' || kind === 'tug') { this.pendingSweat += 1; this.sweatSide = Math.random() < 0.5 ? -1 : 1 }
    if (kind === 'wobble') { this.pendingSweat += 2; this.hatJump = 1 }
  }

  // A sharp full-body twitch (used by the "twitch" death style while hanging).
  twitch() {
    this.flail = Math.max(this.flail, 0.8)
    this.squash = 0.6
    this.twitchImpulse = 1
  }

  update(dt: number, opts: { wrongFrac: number; speed: number; groundY?: number }) {
    this.t += dt
    if (opts.groundY != null) this.groundY = opts.groundY
    const tgt = FACE[this.state]
    const k = 1 - Math.pow(0.001, dt) // frame-rate independent smoothing
    this.f.eye = lerp(this.f.eye, tgt.eye, k)
    this.f.brow = lerp(this.f.brow, tgt.brow, k)
    this.f.mouth = lerp(this.f.mouth, tgt.mouth, k)
    this.f.xeyes = lerp(this.f.xeyes, tgt.xeyes, k * 0.7)
    this.f.tongue = lerp(this.f.tongue, tgt.tongue, k * 0.7)
    this.squash = lerp(this.squash, 0, 1 - Math.pow(0.02, dt))
    this.twitchImpulse = lerp(this.twitchImpulse, 0, 1 - Math.pow(0.02, dt))
    this.hatJump = lerp(this.hatJump, 0, 1 - Math.pow(0.01, dt))

    // Head loll: dead heads drop to the side; snapped heads stay lolled.
    const lollTgt = this.state === 'LIMP' ? 0.55
      : (this.state === 'HANGING' && this.deathStyle === 'snap') ? -0.9
        : 0
    this.headLoll = lerp(this.headLoll, lollTgt, 1 - Math.pow(0.2, dt))

    // Flail energy: high on fall, decays through the swing, gone when limp.
    if (this.state === 'FALLING') this.flail = clamp(0.7 + opts.speed * 0.03, 0, 1.6)
    else if (this.state === 'HANGING') {
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

    // Darting pupils when nervous/struggling, amplified briefly by a "dart".
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

    // Sweat physics.
    for (const d of this.sweat) {
      d.vy += 900 * dt
      d.x += d.vx * dt
      d.y += d.vy * dt
      d.life -= dt
    }
    if (this.sweat.length) this.sweat = this.sweat.filter(d => d.life > 0)

    // Hat physics once airborne.
    if (this.hat.mode === 'flying') {
      const s = this.lastS
      this.hat.vy += 2400 * s * dt
      this.hat.x += this.hat.vx * dt
      this.hat.y += this.hat.vy * dt
      this.hat.rot += this.hat.vr * dt
      const gy = (this.groundY ?? Infinity) - 6 * s
      if (this.hat.y > gy) {
        this.hat.y = gy
        if (Math.abs(this.hat.vy) < 90 * s) { this.hat.mode = 'landed'; this.hat.rot = (Math.random() - 0.5) * 0.4 }
        else { this.hat.vy *= -0.42; this.hat.vx *= 0.6; this.hat.vr *= 0.5 }
      }
    }
  }

  // Reaction-driven offsets, resolved per draw. Head + body shifts and a tilt.
  private reactionOffsets(s: number) {
    let headX = 0, headY = 0, bodyX = 0, bodyY = 0, tilt = 0
    const k = this.reactKind, a = this.reactAmp, rt = this.reactT
    if (k === 'flinch') { headY = -a * 8 * s; tilt = Math.sin(rt * 46) * 0.07 * a }
    else if (k === 'gulp') { headY = Math.abs(Math.sin(rt * 9)) * 5 * s * a }
    else if (k === 'shiver') { bodyX = Math.sin(rt * 55) * 3 * s * a; headX = Math.sin(rt * 61) * 3.4 * s * a; headY = Math.cos(rt * 52) * 2 * s * a }
    else if (k === 'dart') { tilt = Math.sin(rt * 13) * 0.09 * a }
    else if (k === 'tug') { headY = -a * 4 * s; tilt = -0.05 * a }
    else if (k === 'wobble') { bodyX = Math.sin(rt * 7.5) * 7 * s * a; bodyY = Math.abs(Math.sin(rt * 7.5)) * 4 * s * a; tilt = Math.sin(rt * 7.5) * 0.05 * a }
    if (this.twitchImpulse > 0.02) { headX += Math.sin(this.t * 70) * 3 * s * this.twitchImpulse; headY += Math.cos(this.t * 66) * 2 * s * this.twitchImpulse }
    return { headX, headY, bodyX, bodyY, tilt }
  }

  // A noodle limb: sinusoidal bow + a travelling ripple, stroked twice for a
  // cream rim under the ink so it reads against the dark torso.
  private hose(ctx: CanvasRenderingContext2D, ax: number, ay: number, bx: number, by: number, bow: number, ripple: number, phase: number, w: number, s: number) {
    const dx = bx - ax, dy = by - ay
    const len = Math.hypot(dx, dy) || 1
    const px = -dy / len, py = dx / len
    ctx.beginPath()
    for (let i = 0; i <= 12; i++) {
      const q = i / 12
      const off = Math.sin(q * Math.PI) * bow + Math.sin(q * Math.PI * 2.2 + phase) * ripple * q
      const x = ax + dx * q + px * off
      const y = ay + dy * q + py * off
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = CREAM; ctx.lineWidth = w + 4 * s; ctx.stroke()
    ctx.strokeStyle = INK; ctx.lineWidth = w; ctx.stroke()
  }

  // A white mitt with knuckle seams.
  private glove(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
    ctx.fillStyle = WHITE; ctx.strokeStyle = INK; ctx.lineWidth = 2.6 * s
    ctx.beginPath(); ctx.arc(x, y, 8.5 * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    ctx.lineWidth = 1.6 * s
    ctx.beginPath()
    ctx.moveTo(x - 3 * s, y - 7 * s); ctx.lineTo(x - 3 * s, y - 2 * s)
    ctx.moveTo(x + 1.5 * s, y - 8 * s); ctx.lineTo(x + 1.5 * s, y - 3 * s)
    ctx.stroke()
  }

  // A big oval clown shoe with a toe shine.
  private shoe(ctx: CanvasRenderingContext2D, x: number, y: number, dir: number, s: number) {
    ctx.save()
    ctx.translate(x, y); ctx.rotate(dir)
    ctx.fillStyle = INK; ctx.strokeStyle = CREAM; ctx.lineWidth = 2 * s
    ctx.beginPath(); ctx.ellipse(6 * s, 0, 14 * s, 8 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    ctx.fillStyle = 'rgba(240,230,200,0.35)'
    ctx.beginPath(); ctx.ellipse(13 * s, -2 * s, 4 * s, 2.6 * s, 0, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }

  // The bowler, drawn at the origin of the current transform.
  private hatShape(ctx: CanvasRenderingContext2D, hr: number, s: number, lift = 0) {
    const hy = -hr * 0.78 - lift
    ctx.fillStyle = INK; ctx.strokeStyle = CREAM; ctx.lineWidth = 2 * s
    ctx.beginPath(); ctx.ellipse(0, hy, hr * 0.68, hr * 0.15, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.ellipse(0, hy - hr * 0.26, hr * 0.43, hr * 0.32, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    // Hat band.
    ctx.strokeStyle = 'rgba(240,230,200,0.4)'; ctx.lineWidth = 3 * s
    ctx.beginPath(); ctx.moveTo(-hr * 0.38, hy - hr * 0.1); ctx.lineTo(hr * 0.38, hy - hr * 0.1); ctx.stroke()
  }

  // nx,ny = neck point; ang = body "down" direction (PI/2 == straight down).
  draw(ctx: CanvasRenderingContext2D, nxIn: number, nyIn: number, ang: number, s: number, footY: number | null) {
    this.lastS = s
    const alive = this.state !== 'LIMP'
    const breathe = alive ? Math.sin(this.t * 2) * 0.6 * s : 0

    const ro = this.reactionOffsets(s)
    // Body shift moves the whole figure (shivers / wobbles while standing).
    const nx = nxIn + (footY != null ? ro.bodyX : 0)
    const ny = nyIn + (footY != null ? ro.bodyY : 0)

    const hr = 34 * s
    // Rubber stretch: the body elongates on a jerk instead of just squashing.
    const torsoLen = 66 * s * (1 + this.squash * 0.2)
    const down = { x: Math.cos(ang), y: Math.sin(ang) }
    const up = { x: -down.x, y: -down.y }
    const side = { x: -down.y, y: down.x } // perpendicular

    // Head sits a clear neck's length above the shoulders so the noose wraps
    // the neck, never the face.
    const headOff = hr * 1.42
    const headC = {
      x: nx + up.x * headOff + side.x * ro.headX,
      y: ny + up.y * headOff + ro.headY
    }
    const chin = { x: headC.x + down.x * hr * 0.82, y: headC.y + down.y * hr * 0.82 }
    const hipC = { x: nx + down.x * torsoLen, y: ny + down.y * torsoLen + breathe }
    const shoulderC = { x: nx + down.x * 16 * s, y: ny + down.y * 16 * s }
    this.headTop.x = headC.x + up.x * hr
    this.headTop.y = headC.y + up.y * hr

    const wig = Math.sin(this.t * 9) * this.flail
    const wig2 = Math.sin(this.t * 7 + 1.3) * this.flail

    ctx.lineCap = 'round'; ctx.lineJoin = 'round'

    // Soft contact shadow.
    const shadowY = footY != null ? footY + 10 * s : this.groundY
    if (shadowY != null) {
      const spread = footY != null ? 1 : clamp(1 - (shadowY - hipC.y) / (500 * s), 0.45, 1)
      ctx.fillStyle = 'rgba(36,26,16,0.16)'
      ctx.beginPath(); ctx.ellipse(nx, shadowY, 52 * s * spread, 9 * s * spread, 0, 0, Math.PI * 2); ctx.fill()
    }

    // Legs + shoes.
    const kicking = this.state === 'HANGING' && this.deathStyle === 'kick'
    for (const sgn of [-1, 1]) {
      const hipX = hipC.x + side.x * 9 * s * sgn
      const hipY = hipC.y + side.y * 9 * s * sgn
      let footX: number, fy: number, shoeDir: number
      if (footY != null) {
        footX = nx + side.x * 15 * s * sgn
        fy = footY - 6 * s
        shoeDir = sgn > 0 ? 0 : Math.PI
      } else {
        const kick = kicking ? Math.sin(this.t * 15 + (sgn > 0 ? 0 : Math.PI)) * 0.7 : 0
        const la = ang + 0.18 * sgn + wig * 0.5 * sgn + kick
        footX = hipX + Math.cos(la) * 58 * s
        fy = hipY + Math.sin(la) * 58 * s
        shoeDir = la + 0.3 * sgn
      }
      this.hose(ctx, hipX, hipY, footX, fy, -sgn * (7 + Math.abs(wig) * 7) * s, this.flail * 3 * s, this.t * 8 + sgn, 11 * s, s)
      this.shoe(ctx, footX, fy, shoeDir, s)
    }

    // Torso: an ink bean, wider at the hip, with a cream rim and two buttons.
    const nwid = 12 * s, hwid = 22 * s
    ctx.beginPath()
    ctx.moveTo(nx - side.x * nwid, ny - side.y * nwid)
    ctx.quadraticCurveTo(
      nx + down.x * torsoLen * 0.55 - side.x * (hwid + 6 * s),
      ny + down.y * torsoLen * 0.55 - side.y * (hwid + 6 * s),
      hipC.x - side.x * hwid * 0.8, hipC.y - side.y * hwid * 0.8
    )
    ctx.quadraticCurveTo(
      hipC.x + down.x * 16 * s, hipC.y + down.y * 16 * s,
      hipC.x + side.x * hwid * 0.8, hipC.y + side.y * hwid * 0.8
    )
    ctx.quadraticCurveTo(
      nx + down.x * torsoLen * 0.55 + side.x * (hwid + 6 * s),
      ny + down.y * torsoLen * 0.55 + side.y * (hwid + 6 * s),
      nx + side.x * nwid, ny + side.y * nwid
    )
    ctx.closePath()
    ctx.fillStyle = INK; ctx.fill()
    ctx.strokeStyle = CREAM; ctx.lineWidth = 2.2 * s; ctx.stroke()
    // Buttons.
    ctx.fillStyle = WHITE; ctx.strokeStyle = INK; ctx.lineWidth = 1.4 * s
    for (const q of [0.45, 0.68]) {
      const bxq = nx + down.x * torsoLen * q, byq = ny + down.y * torsoLen * q
      ctx.beginPath(); ctx.arc(bxq, byq, 3 * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    }

    // Arms + gloves (in front of the torso, cartoon-style).
    const tugging = this.reactKind === 'tug'
    for (const sgn of [-1, 1]) {
      const shX = shoulderC.x + side.x * 12 * s * sgn
      const shY = shoulderC.y + side.y * 12 * s * sgn
      const raise = this.state === 'ESCAPED' ? -1.1 + Math.sin(this.t * 6) * 0.18 : 0
      let aa = ang + 0.5 * sgn + raise * sgn + wig2 * 0.7 * sgn
      let reach = 48
      // On a "tug" reaction, the near hand yanks up at the noose.
      if (tugging && sgn === this.sweatSide) { aa = ang - Math.PI * 0.62 * sgn - 0.2 * sgn; reach = 32 + this.reactAmp * 6 }
      const handX = shX + Math.cos(aa) * reach * s
      const handY = shY + Math.sin(aa) * reach * s
      this.hose(ctx, shX, shY, handX, handY, sgn * (6 + Math.abs(wig2) * 8) * s, this.flail * 3.4 * s, this.t * 9 + sgn * 2, 9.5 * s, s)
      this.glove(ctx, handX, handY, s)
    }

    // Neck bridging shoulders to the jaw.
    ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(chin.x, chin.y)
    ctx.strokeStyle = CREAM; ctx.lineWidth = 19 * s; ctx.stroke()
    ctx.strokeStyle = INK; ctx.lineWidth = 15 * s; ctx.stroke()

    // Noose loop around the neck — drawn BEFORE the head so the head overlaps
    // its far side and it reads as wrapping behind the neck, never the face.
    const nkX = (nx + chin.x) / 2, nkY = (ny + chin.y) / 2
    ctx.strokeStyle = ROPE; ctx.lineWidth = 6 * s
    ctx.beginPath(); ctx.ellipse(nkX, nkY, 13.5 * s, 10 * s, ang - Math.PI / 2, 0, Math.PI * 2); ctx.stroke()
    ctx.fillStyle = '#3c2c1a'
    ctx.beginPath(); ctx.arc(nkX + side.x * 12.5 * s, nkY + side.y * 12.5 * s, 4.5 * s, 0, Math.PI * 2); ctx.fill()

    // Head: squash-and-stretch, loll, face, hat.
    const sq = 1 + this.squash * 0.18
    const st = 1 - this.squash * 0.14
    ctx.save()
    ctx.translate(headC.x, headC.y)
    ctx.rotate(ang - Math.PI / 2 + this.pupilX * 0.05 + this.headLoll + ro.tilt)
    ctx.scale(st, sq)
    ctx.fillStyle = INK
    ctx.beginPath(); ctx.arc(0, 0, hr, 0, Math.PI * 2); ctx.fill()
    ctx.lineWidth = 2.4 * s; ctx.strokeStyle = CREAM; ctx.stroke()
    this.drawFace(ctx, hr, s)
    if (this.hat.mode === 'worn') this.hatShape(ctx, hr, s, this.hatJump * 10 * s)
    ctx.restore()

    // The hat, once it's off on its own adventure.
    if (this.hat.mode !== 'worn') {
      ctx.save()
      ctx.translate(this.hat.x, this.hat.y)
      ctx.rotate(this.hat.rot)
      this.hatShape(ctx, hr, s)
      ctx.restore()
    }

    // Spawn any pending sweat now that the head position is known.
    if (this.pendingSweat > 0) {
      for (; this.pendingSweat > 0; this.pendingSweat--) {
        this.sweat.push({
          x: headC.x + side.x * (hr * 0.55) * this.sweatSide + (Math.random() - 0.5) * 4 * s,
          y: headC.y + hr * 0.15,
          vx: this.sweatSide * (24 + Math.random() * 24),
          vy: 30 + Math.random() * 30,
          life: 0.7 + Math.random() * 0.4,
          r: (1.7 + Math.random() * 1.2) * s
        })
      }
    }

    // Sweat droplets last, ink-outlined so they read on paper and on ink alike.
    if (this.sweat.length) {
      for (const d of this.sweat) {
        ctx.globalAlpha = clamp(d.life * 2.2, 0, 0.95)
        ctx.fillStyle = WHITE
        ctx.strokeStyle = INK
        ctx.lineWidth = 1.1 * s
        ctx.beginPath(); ctx.ellipse(d.x, d.y, d.r * 0.7, d.r, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
      }
      ctx.globalAlpha = 1
    }
  }

  private drawFace(ctx: CanvasRenderingContext2D, hr: number, s: number) {
    const happy = this.f.mouth < -0.4
    // Cream muzzle across the lower face.
    ctx.fillStyle = CREAM; ctx.strokeStyle = INK; ctx.lineWidth = 2.4 * s
    ctx.beginPath(); ctx.ellipse(0, hr * 0.42, hr * 0.6, hr * 0.46, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()

    const eyeY = -hr * 0.18
    const eyeDX = hr * 0.36
    const open = Math.max(0.08, this.f.eye * (1 - this.blink))
    for (const sgn of [-1, 1]) {
      const ex = sgn * eyeDX
      if (this.f.xeyes > 0.5) {
        // Dead X eyes on cream patches.
        ctx.fillStyle = WHITE; ctx.strokeStyle = INK; ctx.lineWidth = 2 * s
        ctx.beginPath(); ctx.ellipse(ex, eyeY, hr * 0.2, hr * 0.24, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
        ctx.strokeStyle = RED; ctx.lineWidth = 3.4 * s
        const r = hr * 0.12
        ctx.beginPath()
        ctx.moveTo(ex - r, eyeY - r); ctx.lineTo(ex + r, eyeY + r)
        ctx.moveTo(ex + r, eyeY - r); ctx.lineTo(ex - r, eyeY + r)
        ctx.stroke()
      } else if (happy) {
        // Content ∩ eyes for the escape.
        ctx.strokeStyle = WHITE; ctx.lineWidth = 3.6 * s
        ctx.beginPath(); ctx.arc(ex, eyeY + hr * 0.05, hr * 0.14, Math.PI, Math.PI * 2); ctx.stroke()
      } else {
        // Big eye white + pie-cut pupil, the rubber-hose signature.
        ctx.fillStyle = WHITE; ctx.strokeStyle = INK; ctx.lineWidth = 2 * s
        ctx.beginPath(); ctx.ellipse(ex, eyeY, hr * 0.2, hr * 0.26 * open, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
        const px = ex + this.pupilX * hr * 0.1
        const py = eyeY + this.pupilY * hr * 0.1
        const pr = hr * 0.1
        const notch = -2.0 // notch points up-left
        ctx.fillStyle = INK
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.arc(px, py, pr, notch + 0.45, notch - 0.45)
        ctx.closePath(); ctx.fill()
      }
      // Cream brow slab above (readable on the ink head).
      ctx.strokeStyle = CREAM; ctx.lineWidth = 4 * s
      const bY = eyeY - hr * 0.36
      ctx.beginPath()
      ctx.moveTo(ex - hr * 0.2, bY + this.f.brow * hr * 0.12 * sgn)
      ctx.lineTo(ex + hr * 0.2, bY - this.f.brow * hr * 0.08 * sgn)
      ctx.stroke()
    }

    // Mouth on the muzzle: -1 smile .. 0 line .. 1 open grimace (with teeth).
    const mY = hr * 0.46
    const m = this.f.mouth
    if (m > 0.35) {
      const w = hr * 0.28, h = hr * 0.2 * m
      ctx.fillStyle = '#1c1008'
      ctx.beginPath(); ctx.ellipse(0, mY, w, h, 0, 0, Math.PI * 2); ctx.fill()
      ctx.save()
      ctx.clip()
      // Upper teeth row.
      ctx.fillStyle = WHITE
      ctx.fillRect(-w, mY - h, w * 2, h * 0.55)
      if (this.f.tongue > 0.4) {
        ctx.fillStyle = RED
        ctx.beginPath(); ctx.ellipse(hr * 0.06, mY + h * 0.55, w * 0.5, h * 0.7 * this.f.tongue, 0.25, 0, Math.PI * 2); ctx.fill()
      }
      ctx.restore()
      ctx.strokeStyle = INK; ctx.lineWidth = 2.4 * s
      ctx.beginPath(); ctx.ellipse(0, mY, w, h, 0, 0, Math.PI * 2); ctx.stroke()
    } else {
      const curve = -m * hr * 0.5
      ctx.strokeStyle = INK; ctx.lineWidth = 3 * s
      ctx.beginPath(); ctx.moveTo(-hr * 0.26, mY); ctx.quadraticCurveTo(0, mY + curve, hr * 0.26, mY); ctx.stroke()
    }
  }
}
