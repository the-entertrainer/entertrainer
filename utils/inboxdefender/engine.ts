// ============================================================
// INBOX DEFENDER — 2D arcade engine (Missile Command, reimagined).
// ============================================================
//
// Mail descends toward your inbox. A cannon at the bottom fires up. Shoot the
// THREATS out of the sky; let the SAFE mail land. A threat that lands, or a
// safe message you shoot by mistake, costs inbox integrity — zero ends the
// run. Cards are drawn identically whether safe or malicious (no colour
// tell), so the only way to win is to read the cue and decide. Rendered to a
// 2D canvas, supersampled x2 so the small type stays crisp.

import type { MailItem } from './items'
import { OFFICER, OFFICER_DARK, SPAM, VIRUS, HUD, INK_QUIET } from '~/utils/doombox/palette'

const RW = 480 // logical width
const RH = 320 // logical height
const S = 2 // supersample factor (crisp text)

const CARD_W = 156
const CARD_H = 54
const INBOX_Y = RH - 44
const CANNON_SPEED = 300 // px/s (buttons / keys)
const PROJ_SPEED = 540
const MAX_ON_SCREEN = 3

const BREACH_COST = 18 // a threat landed
const WRONGSHOT_COST = 12 // a safe message destroyed

export type ResolveAction = 'quarantined' | 'delivered' | 'wrongshot' | 'breach'
export interface ResolveEvent {
  item: MailItem
  action: ResolveAction
  correct: boolean
}

export interface DefenderOpts {
  items: MailItem[] // the shuffled round
  reduced: boolean
  onResolve: (e: ResolveEvent) => void
  onIntegrity: (v: number) => void
  onEnd: (outcome: 'cleared' | 'breached') => void
}

interface Card {
  item: MailItem
  x: number
  y: number
}
interface Shot {
  x: number
  y: number
  alive: boolean
}
interface Burst {
  x: number
  y: number
  t: number
  good: boolean
}

export class DefenderEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private opts: DefenderOpts

  private queue: MailItem[]
  private cards: Card[] = []
  private shots: Shot[] = []
  private bursts: Burst[] = []

  private cannonX = RW / 2
  private dir = 0 // -1 / 0 / 1 from buttons or keys
  private aimX: number | null = null // mouse aim (logical)
  private integrity = 100
  private spawnTimer = 0.8
  private handled = 0

  private keys = new Set<string>()
  private raf = 0
  private last = 0
  private paused = false
  private disposed = false
  private ended = false

  constructor(canvas: HTMLCanvasElement, opts: DefenderOpts) {
    this.canvas = canvas
    this.canvas.width = RW * S
    this.canvas.height = RH * S
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('INBOX DEFENDER: no 2d context')
    this.ctx = ctx
    this.opts = opts
    this.queue = opts.items.slice()
  }

  // ── lifecycle ──
  start() {
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    this.canvas.addEventListener('pointermove', this.onPointerMove)
    this.canvas.addEventListener('pointerdown', this.onPointerDown)
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.loop)
  }
  stop() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    this.canvas.removeEventListener('pointermove', this.onPointerMove)
    this.canvas.removeEventListener('pointerdown', this.onPointerDown)
  }
  pause() {
    this.paused = true
    this.dir = 0
    this.keys.clear()
  }
  resume() {
    this.paused = false
    this.last = performance.now()
  }

  // ── control surface (console buttons + touch) ──
  setDir(d: number) {
    this.dir = Math.max(-1, Math.min(1, d))
    this.aimX = null // buttons take over from mouse aim
  }
  fire() {
    if (this.paused || this.disposed || this.ended) return
    this.shots.push({ x: this.cannonX, y: INBOX_Y - 6, alive: true })
  }

  // ── input ──
  private onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase()
    if ([' ', 'arrowleft', 'arrowright', 'arrowup'].includes(k)) e.preventDefault()
    if (k === ' ' || k === 'arrowup' || k === 'enter' || k === 'f') {
      this.fire()
      return
    }
    this.keys.add(k)
  }
  private onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.key.toLowerCase())
  private onPointerMove = (e: PointerEvent) => {
    const r = this.canvas.getBoundingClientRect()
    this.aimX = ((e.clientX - r.left) / r.width) * RW
    this.dir = 0
  }
  private onPointerDown = () => this.fire()

  // ── update ──
  private update(dt: number) {
    // cannon
    let d = this.dir
    if (this.keys.has('arrowleft') || this.keys.has('a')) d -= 1
    if (this.keys.has('arrowright') || this.keys.has('d')) d += 1
    if (d !== 0) this.cannonX += d * CANNON_SPEED * dt
    else if (this.aimX != null) this.cannonX += (this.aimX - this.cannonX) * Math.min(1, dt * 14)
    this.cannonX = Math.max(20, Math.min(RW - 20, this.cannonX))

    // difficulty ramps with progress
    const ramp = Math.min(1, this.handled / 16)
    const fall = 26 + ramp * 30
    const spawnEvery = 2.3 - ramp * 1.0

    // spawn
    this.spawnTimer -= dt
    if (this.spawnTimer <= 0 && this.queue.length && this.cards.length < MAX_ON_SCREEN) {
      const item = this.queue.shift()!
      const x = 12 + Math.random() * (RW - CARD_W - 24)
      this.cards.push({ item, x, y: -CARD_H })
      this.spawnTimer = spawnEvery
    }

    // cards descend
    for (const c of this.cards) c.y += fall * dt
    // landings
    for (const c of this.cards) {
      if (c.y + CARD_H >= INBOX_Y) {
        if (c.item.malicious) this.resolve(c, 'breach')
        else this.resolve(c, 'delivered')
        c.y = 99999 // mark for removal
      }
    }

    // shots
    for (const s of this.shots) {
      if (!s.alive) continue
      s.y -= PROJ_SPEED * dt
      if (s.y < -10) {
        s.alive = false
        continue
      }
      for (const c of this.cards) {
        if (c.y > INBOX_Y) continue
        if (s.x >= c.x && s.x <= c.x + CARD_W && s.y >= c.y && s.y <= c.y + CARD_H) {
          s.alive = false
          if (c.item.malicious) this.resolve(c, 'quarantined')
          else this.resolve(c, 'wrongshot')
          c.y = 99999
          break
        }
      }
    }

    this.cards = this.cards.filter((c) => c.y < 99999)
    this.shots = this.shots.filter((s) => s.alive)
    for (const b of this.bursts) b.t -= dt
    this.bursts = this.bursts.filter((b) => b.t > 0)

    // end of round
    if (!this.ended && this.queue.length === 0 && this.cards.length === 0) {
      this.ended = true
      this.opts.onEnd('cleared')
    }
  }

  private resolve(c: Card, action: ResolveAction) {
    const correct = action === 'quarantined' || action === 'delivered'
    this.handled++
    this.opts.onResolve({ item: c.item, action, correct })
    this.bursts.push({ x: c.x + CARD_W / 2, y: c.y + CARD_H / 2, t: 0.35, good: correct })
    if (action === 'breach' || action === 'wrongshot') {
      this.integrity = Math.max(0, this.integrity - (action === 'breach' ? BREACH_COST : WRONGSHOT_COST))
      this.opts.onIntegrity(this.integrity)
      if (this.integrity <= 0 && !this.ended) {
        this.ended = true
        this.opts.onEnd('breached')
      }
    }
  }

  // ── render ──
  private render() {
    const ctx = this.ctx
    ctx.setTransform(S, 0, 0, S, 0, 0)
    // backdrop — a cool server-blue gradient
    const g = ctx.createLinearGradient(0, 0, 0, RH)
    g.addColorStop(0, '#0a1020')
    g.addColorStop(1, '#05060b')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, RW, RH)

    // faint descending data streaks
    ctx.strokeStyle = 'rgba(124,77,255,0.08)'
    ctx.lineWidth = 1
    for (let i = 0; i < RW; i += 32) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, INBOX_Y)
      ctx.stroke()
    }

    // cards
    for (const c of this.cards) this.drawCard(c)

    // shots
    ctx.fillStyle = SPAM
    for (const s of this.shots) {
      ctx.fillRect(s.x - 1.5, s.y, 3, 12)
    }

    // bursts
    for (const b of this.bursts) {
      const p = 1 - b.t / 0.35
      const rr = 6 + p * 22
      ctx.strokeStyle = b.good ? SPAM : VIRUS
      ctx.globalAlpha = 1 - p
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(b.x, b.y, rr, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    // top status strip — sized to sit behind the whole HUD (integrity + score)
    // so mail slides in from under the bar and is fully readable once clear
    ctx.fillStyle = '#0a1020'
    ctx.fillRect(0, 0, RW, 60)
    ctx.fillStyle = 'rgba(124,77,255,0.35)'
    ctx.fillRect(0, 60, RW, 1)

    // inbox tray
    ctx.fillStyle = '#0c1526'
    ctx.fillRect(0, INBOX_Y, RW, RH - INBOX_Y)
    ctx.fillStyle = 'rgba(124,77,255,0.5)'
    ctx.fillRect(0, INBOX_Y, RW, 2)
    ctx.fillStyle = INK_QUIET
    ctx.font = '9px "Press Start 2P", monospace'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.fillText('INBOX', 8, INBOX_Y + (RH - INBOX_Y) / 2)

    // cannon
    this.drawCannon()

    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
  }

  private drawCard(c: Card) {
    const ctx = this.ctx
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.fillRect(c.x + 2, c.y + 3, CARD_W, CARD_H)
    // body — neutral, identical for safe and malicious
    ctx.fillStyle = '#f4f1ea'
    ctx.fillRect(c.x, c.y, CARD_W, CARD_H)
    ctx.fillStyle = '#e5e0d3'
    ctx.fillRect(c.x, c.y, CARD_W, 15)
    // envelope glyph
    ctx.strokeStyle = '#8f8a7c'
    ctx.lineWidth = 1
    ctx.strokeRect(c.x + 7, c.y + 4, 12, 8)
    ctx.beginPath()
    ctx.moveTo(c.x + 7, c.y + 4)
    ctx.lineTo(c.x + 13, c.y + 9)
    ctx.lineTo(c.x + 19, c.y + 4)
    ctx.stroke()
    // from
    ctx.fillStyle = '#7a7566'
    ctx.font = '9px "Space Grotesk", system-ui, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.fillText(this.clip(c.item.from, 20), c.x + 25, c.y + 8)
    // the cue
    ctx.fillStyle = '#1c2233'
    ctx.font = 'bold 13px "Space Grotesk", system-ui, sans-serif'
    ctx.fillText(this.clip(c.item.tag, 22), c.x + 8, c.y + 34)
  }

  private drawCannon() {
    const ctx = this.ctx
    const x = this.cannonX
    const y = RH - 6
    ctx.fillStyle = OFFICER_DARK
    ctx.fillRect(x - 14, y - 14, 28, 14)
    ctx.fillStyle = OFFICER
    ctx.fillRect(x - 4, y - 26, 8, 16)
    ctx.fillStyle = HUD
    ctx.fillRect(x - 3, y - 28, 6, 3)
    // aim guide
    ctx.strokeStyle = 'rgba(57,255,136,0.25)'
    ctx.setLineDash([2, 6])
    ctx.beginPath()
    ctx.moveTo(x, y - 28)
    ctx.lineTo(x, 0)
    ctx.stroke()
    ctx.setLineDash([])
  }

  private clip(s: string, n: number) {
    return s.length > n ? s.slice(0, n - 1) + '…' : s
  }

  private loop = (now: number) => {
    if (this.disposed) return
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    if (!this.paused && !this.ended) this.update(dt)
    this.render()
    this.raf = requestAnimationFrame(this.loop)
  }
}

export { RW, RH }
