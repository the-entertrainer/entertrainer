// ============================================================
// DOOMBOX — the raycasting engine (how Doom was made).
// ============================================================
//
// A grid map, a DDA wall raycaster, billboarded sprites with a per-column
// depth buffer, and a first-person weapon. Rendered to a raw 2D canvas at a
// fixed logical resolution with smoothing off — authentic 2.5D, no WebGL.
//
// The engine owns its own input (keyboard + pointer-lock mouse) and exposes
// hooks for touch controls and for the Vue layer to pause it while a puzzle
// is open. It never touches the DOM beyond its canvas and the listeners it
// adds in start()/removes in stop().

import { WALL_A, WALL_B, FLOOR, CEIL, SPAM, hexToRgb, shade } from './palette'
import { threatSprite, weaponSprite } from './sprites'

const MAP_W = 24
const MAP_H = 18

function buildMap(): Uint8Array {
  const m = new Uint8Array(MAP_W * MAP_H)
  const set = (x: number, y: number, v: number) => {
    m[y * MAP_W + x] = v
  }
  for (let x = 0; x < MAP_W; x++) {
    set(x, 0, 1)
    set(x, MAP_H - 1, 1)
  }
  for (let y = 0; y < MAP_H; y++) {
    set(0, y, 1)
    set(MAP_W - 1, y, 1)
  }
  // 2x2 server racks laid out on a regular grid → reads as a machine hall,
  // and an open hall minus isolated pillars is guaranteed fully connected.
  const racks = [
    [4, 3], [10, 3], [16, 3], [20, 3],
    [4, 8], [10, 8], [16, 8], [20, 8],
    [4, 13], [10, 13], [16, 13], [20, 13]
  ]
  for (const [rx, ry] of racks) {
    set(rx, ry, 1)
    set(rx + 1, ry, 1)
    set(rx, ry + 1, 1)
    set(rx + 1, ry + 1, 1)
  }
  return m
}

// where the ten specimens live, spread through the aisles
const THREAT_CELLS: [number, number][] = [
  [7, 3], [13, 3], [19, 5], [7, 8], [13, 8],
  [19, 10], [7, 13], [13, 13], [19, 15], [3, 10]
]

interface Threat {
  id: number
  x: number
  y: number
  kind: 'spam' | 'virus'
  alive: boolean
  sprite: HTMLCanvasElement
}

export interface EngineOpts {
  onHitThreat: (id: number) => void
  onShoot: () => void
  reduced: boolean
  /** id → kind, so spawns glow correctly and the sprite matches the specimen */
  threatKinds: Record<number, 'spam' | 'virus'>
}

const RW = 480 // logical render width
const RH = 300 // logical render height
const MOVE = 2.6 // cells / second
const TURN = 2.4 // radians / second (keyboard)

export class DoomEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private opts: EngineOpts
  private map = buildMap()
  private threats: Threat[] = []
  private zbuf = new Float32Array(RW)

  // player
  private px = 2.5
  private py = 2.5
  private ang = 0
  private bob = 0

  // input
  private keys = new Set<string>()
  private moveVec = { f: 0, s: 0 } // touch: forward, strafe (-1..1)
  private lookQueue = 0 // pending rotation from mouse/touch (radians)
  private locked = false
  private firing = 0 // frames of muzzle flash left

  private raf = 0
  private last = 0
  private paused = false
  private disposed = false

  constructor(canvas: HTMLCanvasElement, opts: EngineOpts) {
    this.canvas = canvas
    this.canvas.width = RW
    this.canvas.height = RH
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('DOOMBOX: no 2d context')
    this.ctx = ctx
    this.ctx.imageSmoothingEnabled = false
    this.opts = opts

    for (let i = 0; i < THREAT_CELLS.length; i++) {
      const [cx, cy] = THREAT_CELLS[i]
      const id = i + 1
      const kind = opts.threatKinds[id] ?? 'spam'
      this.threats.push({
        id,
        x: cx + 0.5,
        y: cy + 0.5,
        kind,
        alive: true,
        sprite: threatSprite(kind)
      })
    }
  }

  // ── lifecycle ──────────────────────────────────────────────
  start() {
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    this.canvas.addEventListener('click', this.onCanvasClick)
    document.addEventListener('pointerlockchange', this.onLockChange)
    document.addEventListener('mousemove', this.onMouseMove)
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.loop)
  }

  stop() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    this.canvas.removeEventListener('click', this.onCanvasClick)
    document.removeEventListener('pointerlockchange', this.onLockChange)
    document.removeEventListener('mousemove', this.onMouseMove)
    if (document.pointerLockElement === this.canvas) document.exitPointerLock()
  }

  pause() {
    this.paused = true
    this.keys.clear()
    this.moveVec.f = this.moveVec.s = 0
    if (document.pointerLockElement === this.canvas) document.exitPointerLock()
  }

  resume() {
    this.paused = false
    this.last = performance.now()
  }

  // ── public control surface (touch + inspector) ─────────────
  setMove(f: number, s: number) {
    this.moveVec.f = Math.max(-1, Math.min(1, f))
    this.moveVec.s = Math.max(-1, Math.min(1, s))
  }

  addLook(dx: number) {
    this.lookQueue += dx
  }

  killThreat(id: number) {
    const t = this.threats.find((t) => t.id === id)
    if (t) t.alive = false
  }

  remaining() {
    return this.threats.filter((t) => t.alive).length
  }

  // ── input handlers ─────────────────────────────────────────
  private onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase()
    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault()
    if (k === ' ' || k === 'f' || k === 'enter') {
      this.fire()
      return
    }
    this.keys.add(k)
  }
  private onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.key.toLowerCase())

  private onCanvasClick = () => {
    if (this.paused) return
    if (this.locked) this.fire()
    else this.canvas.requestPointerLock?.()
  }
  private onLockChange = () => {
    this.locked = document.pointerLockElement === this.canvas
  }
  private onMouseMove = (e: MouseEvent) => {
    if (this.locked && !this.paused) this.lookQueue += e.movementX * 0.0025
  }

  fire() {
    if (this.paused || this.disposed) return
    this.opts.onShoot()
    this.firing = 6
    const hit = this.pickTarget()
    if (hit != null) this.opts.onHitThreat(hit)
  }

  /** center-ray hit test against alive threats, respecting wall occlusion */
  private pickTarget(): number | null {
    const dx = Math.cos(this.ang)
    const dy = Math.sin(this.ang)
    const wallDist = this.centerWallDist()
    let best: number | null = null
    let bestDepth = Infinity
    for (const t of this.threats) {
      if (!t.alive) continue
      const rx = t.x - this.px
      const ry = t.y - this.py
      const depth = rx * dx + ry * dy // projection onto view dir
      if (depth <= 0.2 || depth > 12 || depth > wallDist) continue
      const lateral = Math.abs(-rx * dy + ry * dx) // perpendicular offset
      // forgiving aim cone: within ~half a cell of the crosshair line
      if (lateral / depth < 0.14 && depth < bestDepth) {
        bestDepth = depth
        best = t.id
      }
    }
    return best
  }

  private centerWallDist(): number {
    const dx = Math.cos(this.ang)
    const dy = Math.sin(this.ang)
    let x = this.px
    let y = this.py
    for (let i = 0; i < 240; i++) {
      x += dx * 0.05
      y += dy * 0.05
      if (this.isWall(x, y)) return Math.hypot(x - this.px, y - this.py)
    }
    return 12
  }

  private isWall(x: number, y: number): boolean {
    const cx = Math.floor(x)
    const cy = Math.floor(y)
    if (cx < 0 || cy < 0 || cx >= MAP_W || cy >= MAP_H) return true
    return this.map[cy * MAP_W + cx] === 1
  }

  // ── update ─────────────────────────────────────────────────
  private update(dt: number) {
    // rotation: keys + queued mouse/touch look
    let turn = this.lookQueue
    this.lookQueue = 0
    if (this.keys.has('arrowleft')) turn -= TURN * dt
    if (this.keys.has('arrowright')) turn += TURN * dt
    this.ang += turn

    // movement intent
    let f = this.moveVec.f
    let s = this.moveVec.s
    if (this.keys.has('w') || this.keys.has('arrowup')) f += 1
    if (this.keys.has('s') || this.keys.has('arrowdown')) f -= 1
    if (this.keys.has('a')) s -= 1
    if (this.keys.has('d')) s += 1
    f = Math.max(-1, Math.min(1, f))
    s = Math.max(-1, Math.min(1, s))

    const dx = Math.cos(this.ang)
    const dy = Math.sin(this.ang)
    const step = MOVE * dt
    const nx = this.px + (dx * f - dy * s) * step
    const ny = this.py + (dy * f + dx * s) * step
    // slide along walls: resolve axes independently, keep a body radius
    const r = 0.18
    if (!this.isWall(nx + Math.sign(dx * f - dy * s) * r, this.py)) this.px = nx
    if (!this.isWall(this.px, ny + Math.sign(dy * f + dx * s) * r)) this.py = ny

    if (!this.opts.reduced && (f !== 0 || s !== 0)) this.bob += dt * 9
  }

  // ── render ─────────────────────────────────────────────────
  private render() {
    const ctx = this.ctx
    const dirX = Math.cos(this.ang)
    const dirY = Math.sin(this.ang)
    // camera plane perpendicular to dir, length sets the FOV (~66°)
    const planeX = -dirY * 0.66
    const planeY = dirX * 0.66

    // ceiling / floor
    ctx.fillStyle = CEIL
    ctx.fillRect(0, 0, RW, RH / 2)
    ctx.fillStyle = FLOOR
    ctx.fillRect(0, RH / 2, RW, RH / 2)

    const wallA = hexToRgb(WALL_A)
    const wallB = hexToRgb(WALL_B)

    // walls, column by column (DDA)
    for (let col = 0; col < RW; col++) {
      const camX = (2 * col) / RW - 1
      const rayX = dirX + planeX * camX
      const rayY = dirY + planeY * camX
      let mapX = Math.floor(this.px)
      let mapY = Math.floor(this.py)
      const deltaX = Math.abs(1 / rayX)
      const deltaY = Math.abs(1 / rayY)
      let stepX: number
      let stepY: number
      let sideX: number
      let sideY: number
      if (rayX < 0) {
        stepX = -1
        sideX = (this.px - mapX) * deltaX
      } else {
        stepX = 1
        sideX = (mapX + 1 - this.px) * deltaX
      }
      if (rayY < 0) {
        stepY = -1
        sideY = (this.py - mapY) * deltaY
      } else {
        stepY = 1
        sideY = (mapY + 1 - this.py) * deltaY
      }
      let hit = false
      let side = 0
      let guard = 0
      while (!hit && guard++ < 64) {
        if (sideX < sideY) {
          sideX += deltaX
          mapX += stepX
          side = 0
        } else {
          sideY += deltaY
          mapY += stepY
          side = 1
        }
        if (mapX < 0 || mapY < 0 || mapX >= MAP_W || mapY >= MAP_H || this.map[mapY * MAP_W + mapX] === 1)
          hit = true
      }
      const dist = side === 0 ? sideX - deltaX : sideY - deltaY
      this.zbuf[col] = dist
      const lineH = Math.min(RH * 4, (RH / Math.max(dist, 0.05)) | 0)
      const y0 = ((RH - lineH) / 2) | 0
      // distance + side shading
      const f = Math.max(0.18, Math.min(1, 1.25 - dist * 0.11)) * (side === 1 ? 0.72 : 1)
      const base = side === 1 ? wallB : wallA
      ctx.fillStyle = shade(base, f)
      ctx.fillRect(col, y0, 1, lineH)
      // a couple of horizontal seams so racks read as stacked units
      ctx.fillStyle = shade(base, f * 0.6)
      ctx.fillRect(col, y0 + (lineH * 0.33) | 0, 1, 1)
      ctx.fillRect(col, y0 + (lineH * 0.66) | 0, 1, 1)
    }

    // sprites (threats), far → near, occluded by zbuffer
    const order = this.threats
      .filter((t) => t.alive)
      .map((t) => ({ t, d: (t.x - this.px) ** 2 + (t.y - this.py) ** 2 }))
      .sort((a, b) => b.d - a.d)

    const invDet = 1 / (planeX * dirY - dirX * planeY)
    for (const { t } of order) {
      const rx = t.x - this.px
      const ry = t.y - this.py
      const transX = invDet * (dirY * rx - dirX * ry)
      const transY = invDet * (-planeY * rx + planeX * ry) // depth
      if (transY <= 0.1) continue
      const bobY = this.opts.reduced ? 0 : Math.sin(performance.now() / 400 + t.id) * 0.12
      const screenX = ((RW / 2) * (1 + transX / transY)) | 0
      const size = Math.min(RH * 2, Math.abs((RH / transY) | 0))
      const sy = ((RH - size) / 2 - bobY * (RH / transY)) | 0
      const sx = (screenX - size / 2) | 0
      // draw column-clipped against the wall depth buffer
      for (let stripe = 0; stripe < size; stripe++) {
        const colX = sx + stripe
        if (colX < 0 || colX >= RW) continue
        if (transY >= this.zbuf[colX]) continue
        ctx.drawImage(t.sprite, (stripe / size) * t.sprite.width, 0, t.sprite.width / size, t.sprite.height, colX, sy, 1, size)
      }
    }

    // weapon, bottom-centre, bobbing
    const w = weaponSprite(this.firing > 0)
    const scale = 4
    const ww = w.width * scale
    const wh = w.height * scale
    const bobX = this.opts.reduced ? 0 : Math.sin(this.bob) * 6
    const bobDip = this.opts.reduced ? 0 : Math.abs(Math.cos(this.bob)) * 4
    ctx.drawImage(w, ((RW - ww) / 2 + bobX) | 0, (RH - wh + 6 + bobDip) | 0, ww, wh)
    if (this.firing > 0) this.firing--

    // crosshair
    ctx.fillStyle = SPAM
    ctx.fillRect((RW / 2) | 0, (RH / 2 - 5) | 0, 1, 4)
    ctx.fillRect((RW / 2) | 0, (RH / 2 + 2) | 0, 1, 4)
    ctx.fillRect((RW / 2 - 5) | 0, (RH / 2) | 0, 4, 1)
    ctx.fillRect((RW / 2 + 2) | 0, (RH / 2) | 0, 4, 1)
  }

  private loop = (now: number) => {
    if (this.disposed) return
    const dt = Math.min(0.05, (now - this.last) / 1000)
    this.last = now
    if (!this.paused) this.update(dt)
    this.render()
    this.raf = requestAnimationFrame(this.loop)
  }
}

export { MAP_W, MAP_H }
