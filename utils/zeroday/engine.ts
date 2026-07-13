// ============================================================
// ZERO DAY — run-and-gun engine (Contra, reimagined for the web).
// ============================================================
//
// A side-scrolling platformer: gravity + AABB tile collision, a following
// camera, 8-direction shooting, three malware enemy AIs, pickups, and
// parallax biomes. Ported in spirit from the Pygame Contra reference
// (player/enemy/bullet/tile separation, gravity, enemies that shoot back) but
// running on a raw 2D canvas at a fixed low resolution for the LCD look. The
// level is procedural (see mapgen.ts). Controls come from the console pad.

import { TILE, ROWS, type Level, type EnemyType } from './mapgen'
import { SpriteBank, P, E, PLAYER_FW, PLAYER_COLS, EXPLO_FW } from './sprites'
import { SPAM, VIRUS, HUD } from '~/utils/doombox/palette'

export const RW = 336
export const RH = ROWS * TILE // 272
const MAX_HP = 5

const GRAV = 900
const MOVE = 96
const JUMP_V = 330
const COYOTE = 0.09
const BUFFER = 0.11
const BULLET_V = 260
const FIRE_CD = 0.14

interface Body {
  x: number
  y: number
  w: number
  h: number
  vx: number
  vy: number
  onGround: boolean
}
interface Bullet {
  x: number
  y: number
  vx: number
  vy: number
  friendly: boolean
  life: number
  dmg: number
  alive: boolean
}
interface Enemy {
  b: Body
  type: EnemyType
  hp: number
  face: number
  cd: number
  animT: number
  shootT: number
  alive: boolean
}
interface Pickup {
  x: number
  y: number
  type: 'patch' | 'firewall' | 'twofa'
  alive: boolean
}
interface Boom {
  x: number
  y: number
  t: number
}

export interface ZeroDayCallbacks {
  onHp: (hp: number) => void
  onKill: () => void
  onProgress: (p: number) => void
  onShield: (sec: number) => void
  onExtract: () => void
  reduced: boolean
}

const ENEMY_HP: Record<EnemyType, number> = { ar: 2, sniper: 2, rpg: 3 }

export class ZeroDayEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private bank: SpriteBank
  private level: Level
  private cb: ZeroDayCallbacks

  private player: Body = { x: 40, y: 80, w: 12, h: 28, vx: 0, vy: 0, onGround: false }
  private face = 1
  private hp = MAX_HP
  private invuln = 0
  private rapid = 0
  private shield = 0
  private dead = false
  private won = false
  private animT = 0
  private fireCd = 0
  private camX = 0
  private lastSafe = { x: 40, y: 80 }

  private bullets: Bullet[] = []
  private enemies: Enemy[] = []
  private pickups: Pickup[] = []
  private booms: Boom[] = []

  // input
  private mv = 0 // -1/0/1
  private up = false
  private down = false
  private firing = false
  private jumpBuf = 0
  private coyote = 0

  private keys = new Set<string>()
  private raf = 0
  private last = 0
  private paused = false
  private disposed = false

  constructor(canvas: HTMLCanvasElement, bank: SpriteBank, level: Level, cb: ZeroDayCallbacks) {
    this.canvas = canvas
    canvas.width = RW
    canvas.height = RH
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('ZERO DAY: no 2d context')
    this.ctx = ctx
    ctx.imageSmoothingEnabled = false
    this.bank = bank
    this.level = level
    this.cb = cb

    // spawn player on the first ground column
    const gy = this.groundYAt(2)
    this.player.y = gy - this.player.h
    this.player.x = 32
    this.lastSafe = { x: this.player.x, y: this.player.y }

    for (const e of level.enemies) {
      const w = e.type === 'ar' ? 16 : 18
      const h = e.type === 'ar' ? 28 : 30
      this.enemies.push({
        b: { x: e.x - w / 2, y: e.y - h, w, h, vx: 0, vy: 0, onGround: true },
        type: e.type,
        hp: ENEMY_HP[e.type],
        face: -1,
        cd: 0.5 + Math.random(),
        animT: 0,
        shootT: 0,
        alive: true
      })
    }
    for (const p of level.pickups) this.pickups.push({ x: p.x, y: p.y, type: p.type, alive: true })
  }

  // ── lifecycle ──
  start() {
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.loop)
  }
  stop() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  }
  pause() {
    this.paused = true
  }
  resume() {
    this.paused = false
    this.last = performance.now()
  }

  // ── control surface (console pad) ──
  setMove(d: number) {
    this.mv = Math.sign(d)
    if (this.mv !== 0) this.face = this.mv
  }
  setUp(v: boolean) {
    this.up = v
  }
  setDown(v: boolean) {
    this.down = v
  }
  setFire(v: boolean) {
    this.firing = v
  }
  jump() {
    this.jumpBuf = BUFFER
  }

  // ── keyboard (desktop) ──
  private onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase()
    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault()
    if (k === 'arrowleft' || k === 'a') this.setMove(-1)
    else if (k === 'arrowright' || k === 'd') this.setMove(1)
    else if (k === 'arrowup' || k === 'w') this.up = true
    else if (k === 'arrowdown' || k === 's') this.down = true
    else if (k === ' ' || k === 'x') this.jump()
    else if (k === 'z' || k === 'j') this.firing = true
    this.keys.add(k)
  }
  private onKeyUp = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase()
    this.keys.delete(k)
    if ((k === 'arrowleft' || k === 'a') && this.mv < 0) this.mv = this.keys.has('arrowright') || this.keys.has('d') ? 1 : 0
    else if ((k === 'arrowright' || k === 'd') && this.mv > 0) this.mv = this.keys.has('arrowleft') || this.keys.has('a') ? -1 : 0
    else if (k === 'arrowup' || k === 'w') this.up = false
    else if (k === 'arrowdown' || k === 's') this.down = false
    else if (k === 'z' || k === 'j') this.firing = false
  }

  // ── tile helpers ──
  private solidAt(tx: number, ty: number): boolean {
    if (tx < 0 || ty < 0 || tx >= this.level.cols || ty >= ROWS) return false
    return this.level.solid[ty * this.level.cols + tx] === 1
  }
  private groundYAt(tx: number): number {
    for (let ty = 0; ty < ROWS; ty++) if (this.solidAt(tx, ty)) return ty * TILE
    return RH
  }

  private moveBody(b: Body, dt: number) {
    b.vy += GRAV * dt
    if (b.vy > 520) b.vy = 520
    // X
    b.x += b.vx * dt
    let t0 = Math.floor(b.y / TILE)
    let t1 = Math.floor((b.y + b.h - 1) / TILE)
    if (b.vx > 0) {
      const tx = Math.floor((b.x + b.w) / TILE)
      for (let ty = t0; ty <= t1; ty++)
        if (this.solidAt(tx, ty)) {
          b.x = tx * TILE - b.w
          b.vx = 0
          break
        }
    } else if (b.vx < 0) {
      const tx = Math.floor(b.x / TILE)
      for (let ty = t0; ty <= t1; ty++)
        if (this.solidAt(tx, ty)) {
          b.x = (tx + 1) * TILE
          b.vx = 0
          break
        }
    }
    // Y
    b.y += b.vy * dt
    b.onGround = false
    const c0 = Math.floor(b.x / TILE)
    const c1 = Math.floor((b.x + b.w - 1) / TILE)
    if (b.vy > 0) {
      const ty = Math.floor((b.y + b.h) / TILE)
      for (let tx = c0; tx <= c1; tx++)
        if (this.solidAt(tx, ty)) {
          b.y = ty * TILE - b.h
          b.vy = 0
          b.onGround = true
          break
        }
    } else if (b.vy < 0) {
      const ty = Math.floor(b.y / TILE)
      for (let tx = c0; tx <= c1; tx++)
        if (this.solidAt(tx, ty)) {
          b.y = (ty + 1) * TILE
          b.vy = 0
          break
        }
    }
  }

  private aim(): [number, number] {
    let ax = this.face
    let ay = 0
    if (this.up) {
      ay = -1
      ax = this.mv !== 0 ? this.face : 0
    } else if (this.down && !this.player.onGround) {
      ay = 1
      ax = 0
    }
    return [ax, ay]
  }

  private shoot() {
    const [ax, ay] = this.aim()
    const len = Math.hypot(ax, ay) || 1
    const cx = this.player.x + this.player.w / 2
    const cy = this.player.y + 10
    const spawn = (dax: number, day: number) => {
      const l = Math.hypot(dax, day) || 1
      this.bullets.push({
        x: cx + (dax / l) * 10,
        y: cy + (day / l) * 6,
        vx: (dax / l) * BULLET_V,
        vy: (day / l) * BULLET_V,
        friendly: true,
        life: 1.4,
        dmg: 1,
        alive: true
      })
    }
    spawn(ax, ay)
    if (this.rapid > 0) {
      // 2FA power: a tight three-round spread
      const ang = Math.atan2(ay / len, ax / len)
      for (const off of [-0.18, 0.18]) spawn(Math.cos(ang + off), Math.sin(ang + off))
    }
  }

  private hurt(dmg: number) {
    if (this.invuln > 0 || this.shield > 0 || this.dead) return
    this.hp = Math.max(0, this.hp - dmg)
    this.invuln = 1.0
    this.cb.onHp(this.hp)
    if (this.hp <= 0) this.dead = true
  }

  // ── update ──
  private update(dt: number) {
    if (this.dead) {
      this.animT += dt
      return
    }
    // timers
    if (this.invuln > 0) this.invuln -= dt
    if (this.rapid > 0) this.rapid -= dt
    if (this.shield > 0) {
      this.shield -= dt
      this.cb.onShield(Math.max(0, this.shield))
    }
    if (this.fireCd > 0) this.fireCd -= dt
    if (this.jumpBuf > 0) this.jumpBuf -= dt

    // horizontal
    this.player.vx = this.mv * MOVE
    // jump w/ coyote + buffer
    if (this.player.onGround) this.coyote = COYOTE
    else if (this.coyote > 0) this.coyote -= dt
    if (this.jumpBuf > 0 && this.coyote > 0) {
      this.player.vy = -JUMP_V
      this.jumpBuf = 0
      this.coyote = 0
      this.player.onGround = false
    }
    this.moveBody(this.player, dt)
    if (this.player.onGround) this.lastSafe = { x: this.player.x, y: this.player.y }

    // firing
    if (this.firing && this.fireCd <= 0) {
      this.shoot()
      this.fireCd = this.rapid > 0 ? FIRE_CD * 0.7 : FIRE_CD
    }

    // fell in a pit
    if (this.player.y > RH + 24) {
      this.hp = Math.max(0, this.hp - 1)
      this.cb.onHp(this.hp)
      if (this.hp <= 0) {
        this.dead = true
      } else {
        this.player.x = this.lastSafe.x
        this.player.y = this.lastSafe.y - 4
        this.player.vy = 0
        this.invuln = 1.2
      }
    }

    this.updateBullets(dt)
    this.updateEnemies(dt)
    this.updatePickups()
    for (const bm of this.booms) bm.t -= dt
    this.booms = this.booms.filter((b) => b.t > 0)

    // camera + progress
    const target = Math.max(0, Math.min(this.level.widthPx - RW, this.player.x + this.player.w / 2 - RW * 0.42))
    this.camX += (target - this.camX) * Math.min(1, dt * 8)
    this.cb.onProgress(this.player.x / this.level.exitX)

    // reached extraction
    if (!this.won && this.player.x >= this.level.exitX) {
      this.won = true
      this.cb.onExtract()
    }

    this.animT += dt
  }

  private updateBullets(dt: number) {
    for (const b of this.bullets) {
      if (!b.alive) continue
      b.x += b.vx * dt
      b.y += b.vy * dt
      b.life -= dt
      if (b.life <= 0) {
        b.alive = false
        continue
      }
      if (this.solidAt(Math.floor(b.x / TILE), Math.floor(b.y / TILE))) {
        b.alive = false
        continue
      }
      if (b.friendly) {
        for (const e of this.enemies) {
          if (!e.alive) continue
          if (b.x > e.b.x && b.x < e.b.x + e.b.w && b.y > e.b.y && b.y < e.b.y + e.b.h) {
            e.hp -= b.dmg
            b.alive = false
            if (e.hp <= 0) {
              e.alive = false
              this.booms.push({ x: e.b.x + e.b.w / 2, y: e.b.y + e.b.h / 2, t: 0.4 })
              this.cb.onKill()
            }
            break
          }
        }
      } else {
        const p = this.player
        if (b.x > p.x && b.x < p.x + p.w && b.y > p.y && b.y < p.y + p.h) {
          b.alive = false
          this.hurt(1)
        }
      }
    }
    if (this.bullets.length > 120) this.bullets = this.bullets.filter((b) => b.alive)
  }

  private enemyFire(e: Enemy, ax: number, ay: number, speed: number, dmg: number) {
    const l = Math.hypot(ax, ay) || 1
    this.bullets.push({
      x: e.b.x + e.b.w / 2,
      y: e.b.y + e.b.h / 2,
      vx: (ax / l) * speed,
      vy: (ay / l) * speed,
      friendly: false,
      life: 3,
      dmg,
      alive: true
    })
  }

  private updateEnemies(dt: number) {
    const px = this.player.x + this.player.w / 2
    const py = this.player.y + this.player.h / 2
    for (const e of this.enemies) {
      if (!e.alive) continue
      // cull far enemies (still simulate a margin around the camera)
      if (e.b.x < this.camX - 60 || e.b.x > this.camX + RW + 60) continue
      e.animT += dt
      e.cd -= dt
      if (e.shootT > 0) e.shootT -= dt
      const dx = px - (e.b.x + e.b.w / 2)
      const dist = Math.hypot(dx, py - (e.b.y + e.b.h / 2))
      e.face = dx < 0 ? -1 : 1

      if (e.type === 'ar') {
        // trojan: advances and fires level shots
        if (dist < 150 && dist > 26) e.b.vx = e.face * 34
        else e.b.vx = 0
        // don't walk off ledges
        const aheadTx = Math.floor((e.b.x + (e.face > 0 ? e.b.w + 2 : -2)) / TILE)
        const footTy = Math.floor((e.b.y + e.b.h + 2) / TILE)
        if (!this.solidAt(aheadTx, footTy)) e.b.vx = 0
        this.moveBody(e.b, dt)
        if (e.cd <= 0 && dist < 170 && Math.abs(py - (e.b.y + 8)) < 40) {
          this.enemyFire(e, dx, -8, 150, 1)
          e.cd = 1.4 + Math.random() * 0.6
          e.shootT = 0.25
        }
      } else if (e.type === 'sniper') {
        // rootkit: stationary, precise long-range shot with a telegraph
        this.moveBody(e.b, dt)
        if (e.cd <= 0 && dist < 260) {
          this.enemyFire(e, dx, py - (e.b.y + e.b.h / 2), 230, 1)
          e.cd = 2.0 + Math.random() * 0.8
          e.shootT = 0.3
        }
      } else {
        // ransomware: lobs a slow heavy arc
        this.moveBody(e.b, dt)
        if (e.cd <= 0 && dist < 200) {
          this.enemyFire(e, dx, -110, 130, 2)
          e.cd = 2.4 + Math.random()
          e.shootT = 0.35
        }
      }

      // contact damage
      if (
        px > e.b.x - 4 &&
        px < e.b.x + e.b.w + 4 &&
        this.player.y + this.player.h > e.b.y &&
        this.player.y < e.b.y + e.b.h
      )
        this.hurt(1)
    }
  }

  private updatePickups() {
    const p = this.player
    for (const k of this.pickups) {
      if (!k.alive) continue
      if (Math.abs(p.x + p.w / 2 - k.x) < 14 && Math.abs(p.y + p.h / 2 - k.y) < 16) {
        k.alive = false
        if (k.type === 'patch') {
          this.hp = Math.min(MAX_HP, this.hp + 1)
          this.cb.onHp(this.hp)
        } else if (k.type === 'firewall') {
          this.shield = 6
          this.cb.onShield(this.shield)
        } else {
          this.rapid = 8
        }
      }
    }
  }

  // ── render ──
  private render() {
    const ctx = this.ctx
    const biomeIsRoof = this.player.x > this.level.biomeSplitCol * TILE
    this.drawParallax(ctx, biomeIsRoof)
    this.drawTerrain(ctx, biomeIsRoof)
    this.drawExit(ctx)
    this.drawPickups(ctx)
    this.drawEnemies(ctx)
    this.drawBullets(ctx)
    this.drawPlayer(ctx)
    this.drawBooms(ctx)
  }

  private drawParallax(ctx: CanvasRenderingContext2D, roof: boolean) {
    if (roof) {
      const g = ctx.createLinearGradient(0, 0, 0, RH)
      g.addColorStop(0, '#e8663a')
      g.addColorStop(1, '#7a2e2a')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, RW, RH)
      this.tileBg(ctx, 'a2c3', 0.12, RH * 0.55, 0.9)
      this.tileBg(ctx, 'a2c2', 0.28, RH * 0.5, 0.9)
      this.tileBg(ctx, 'a2c1', 0.5, RH * 0.55, 1)
    } else {
      ctx.fillStyle = '#0c130f'
      ctx.fillRect(0, 0, RW, RH)
      this.tileBg(ctx, 'a1bg', 0.2, RH, 1)
      this.tileBg(ctx, 'a1wall', 0.45, RH, 1)
    }
  }
  private tileBg(ctx: CanvasRenderingContext2D, name: string, factor: number, h: number, alpha: number) {
    const img = this.bank.imgs[name]
    if (!img || !img.width) return
    const w = img.width * (h / img.height)
    const off = -((this.camX * factor) % w)
    ctx.globalAlpha = alpha
    for (let x = off; x < RW; x += w) ctx.drawImage(img, x, RH - h, w, h)
    ctx.globalAlpha = 1
  }

  private drawTerrain(ctx: CanvasRenderingContext2D, roof: boolean) {
    const body = roof ? '#4a423a' : '#22362a'
    const bodyDark = roof ? '#332d28' : '#182619'
    const moss = roof ? '#6f9a4a' : '#4f8a3c'
    const c0 = Math.floor(this.camX / TILE)
    const c1 = Math.ceil((this.camX + RW) / TILE)
    for (let tx = c0; tx <= c1; tx++) {
      for (let ty = 0; ty < ROWS; ty++) {
        if (!this.solidAt(tx, ty)) continue
        const sx = Math.round(tx * TILE - this.camX)
        const sy = ty * TILE
        ctx.fillStyle = ty % 2 ? body : bodyDark
        ctx.fillRect(sx, sy, TILE, TILE)
        if (!this.solidAt(tx, ty - 1)) {
          ctx.fillStyle = moss
          ctx.fillRect(sx, sy, TILE, 3)
        }
        ctx.fillStyle = 'rgba(0,0,0,0.18)'
        ctx.fillRect(sx, sy + TILE - 2, TILE, 2)
      }
    }
  }

  private drawExit(ctx: CanvasRenderingContext2D) {
    const x = Math.round(this.level.exitX - this.camX)
    if (x < -20 || x > RW + 20) return
    const t = this.animT * 3
    ctx.fillStyle = SPAM
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t)
    ctx.fillRect(x, 0, 3, RH)
    ctx.globalAlpha = 1
    ctx.fillStyle = SPAM
    ctx.font = '8px "Press Start 2P", monospace'
    ctx.textAlign = 'center'
    ctx.fillText('PATCH', x + 20, 40)
    ctx.fillText('NODE', x + 20, 52)
    ctx.textAlign = 'left'
  }

  private drawPickups(ctx: CanvasRenderingContext2D) {
    for (const k of this.pickups) {
      if (!k.alive) continue
      const x = Math.round(k.x - this.camX)
      const y = Math.round(k.y + Math.sin(this.animT * 3 + k.x) * 2)
      if (x < -12 || x > RW + 12) continue
      const col = k.type === 'patch' ? SPAM : k.type === 'firewall' ? '#4db8ff' : HUD
      ctx.fillStyle = 'rgba(0,0,0,0.4)'
      ctx.fillRect(x - 7, y - 7, 14, 14)
      ctx.fillStyle = col
      if (k.type === 'patch') {
        ctx.fillRect(x - 1, y - 5, 3, 11)
        ctx.fillRect(x - 5, y - 1, 11, 3)
      } else if (k.type === 'firewall') {
        ctx.fillRect(x - 5, y - 5, 10, 3)
        ctx.fillRect(x - 5, y - 5, 3, 10)
        ctx.fillRect(x + 2, y - 5, 3, 10)
        ctx.fillRect(x - 5, y + 2, 10, 3)
      } else {
        ctx.fillRect(x - 4, y - 4, 8, 8)
        ctx.fillStyle = '#000'
        ctx.fillRect(x - 1, y - 1, 2, 4)
      }
    }
  }

  private drawEnemies(ctx: CanvasRenderingContext2D) {
    for (const e of this.enemies) {
      if (!e.alive) continue
      const x = e.b.x + e.b.w / 2 - this.camX
      const feet = e.b.y + e.b.h
      if (x < -30 || x > RW + 30) continue
      const cfg = E[e.type]
      const cols = Math.max(1, Math.floor(this.bank.imgs[e.type]?.width / cfg.fw || 1))
      const frames = e.shootT > 0 ? cfg.shoot : cfg.idle
      const fr = frames[Math.floor(e.animT * 8) % frames.length]
      const scale = e.type === 'ar' ? 0.85 : 0.78
      this.bank.frame(ctx, e.type, fr, cfg.fw, cols, Math.round(x), Math.round(feet) + 4, scale, e.face > 0)
    }
  }

  private drawBullets(ctx: CanvasRenderingContext2D) {
    for (const b of this.bullets) {
      if (!b.alive) continue
      const x = Math.round(b.x - this.camX)
      ctx.fillStyle = b.friendly ? '#c8ffe0' : VIRUS
      const s = b.friendly ? 3 : b.dmg > 1 ? 5 : 3
      ctx.fillRect(x - (s >> 1), Math.round(b.y) - (s >> 1), s, s)
    }
  }

  private drawPlayer(ctx: CanvasRenderingContext2D) {
    const x = Math.round(this.player.x + this.player.w / 2 - this.camX)
    const feet = Math.round(this.player.y + this.player.h)
    if (this.invuln > 0 && !this.dead && Math.floor(this.animT * 20) % 2) return // hit flash
    let frames: number[]
    const moving = this.mv !== 0
    if (this.dead) frames = P.death
    else if (!this.player.onGround) frames = P.jump
    else if (this.down) frames = this.firing ? P.crouchShoot : P.crouch
    else if (this.up) frames = moving ? P.runAimUp : P.aimUp
    else if (moving) frames = this.firing ? P.runShoot : P.run
    else frames = this.firing ? P.shoot : P.idle
    const speed = this.dead ? 6 : moving ? 12 : 6
    const fr = frames[Math.floor(this.animT * speed) % frames.length]
    // sprite feet sit ~6px below the collision box (art has boots lower)
    this.bank.frame(ctx, 'player', fr, PLAYER_FW, PLAYER_COLS, x, feet + 8, 0.82, this.face < 0)
    if (this.shield > 0) {
      ctx.strokeStyle = '#4db8ff'
      ctx.globalAlpha = 0.6
      ctx.beginPath()
      ctx.arc(x, feet - 14, 20, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 1
    }
  }

  private drawBooms(ctx: CanvasRenderingContext2D) {
    const cols = Math.max(1, Math.floor((this.bank.imgs.explosion?.width || EXPLO_FW * 9) / EXPLO_FW))
    for (const bm of this.booms) {
      const fr = Math.min(cols - 1, Math.floor((1 - bm.t / 0.4) * cols))
      this.bank.frame(ctx, 'explosion', fr, EXPLO_FW, cols, Math.round(bm.x - this.camX), Math.round(bm.y) + 16, 1, false)
    }
  }

  private loop = (now: number) => {
    if (this.disposed) return
    const dt = Math.min(0.045, (now - this.last) / 1000)
    this.last = now
    if (!this.paused) this.update(dt)
    this.render()
    this.raf = requestAnimationFrame(this.loop)
  }
}
