// The world, redrawn as a 1930s rubber-hose cartoon: warm sepia paper, a pale
// ringed sun, drifting outline clouds, curling dead trees, a hand-inked
// gallows, a waiting gravestone — finished with film grain, projector flicker,
// passing scratches and a heavy vignette. All procedural Canvas, no assets.

import { mulberry32 } from './math'

const INK = '#241a10'
const CREAM = '#efe3c2'

export interface Layout {
  W: number; H: number
  s: number            // uniform scale unit (based on height)
  groundY: number
  beamY: number
  postX: number
  beamRightX: number
  anchorX: number; anchorY: number
  platformX: number; platformY: number; platformW: number
  standNeckX: number; standNeckY: number
  tautNeckY: number
  dropDist: number
}

export function computeLayout(W: number, H: number): Layout {
  const s = H / 900
  const groundY = H * 0.84
  const beamY = H * 0.13
  const anchorX = W * 0.53
  const anchorY = beamY + 8 * s
  const platformY = H * 0.6
  const standNeckY = platformY - 150 * s
  const dropDist = 150 * s
  return {
    W, H, s, groundY, beamY,
    postX: W * 0.5 - 210 * s,
    beamRightX: anchorX + 60 * s,
    anchorX, anchorY,
    platformX: anchorX, platformY, platformW: 150 * s,
    standNeckX: anchorX, standNeckY,
    tautNeckY: standNeckY + dropDist,
    dropDist
  }
}

export function drawBackground(ctx: CanvasRenderingContext2D, W: number, H: number, t = 0) {
  const k = H / 900
  const g = ctx.createRadialGradient(W * 0.5, H * 0.4, H * 0.1, W * 0.5, H * 0.52, H * 0.95)
  g.addColorStop(0, '#dbcda8')
  g.addColorStop(0.6, '#cbbc95')
  g.addColorStop(1, '#a8966d')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  // A pale sun, printed with a halo ring like an old plate.
  const sx = W * 0.79, sy = H * 0.14, sr = 46 * k
  // Slowly wheeling poster rays behind the disc.
  ctx.save()
  ctx.translate(sx, sy)
  ctx.rotate(t * 0.045)
  ctx.fillStyle = 'rgba(244,233,203,0.14)'
  for (let i = 0; i < 12; i++) {
    ctx.rotate(Math.PI / 6)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(sr * 4.4, -sr * 0.42)
    ctx.lineTo(sr * 4.4, sr * 0.42)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
  ctx.fillStyle = 'rgba(244,233,203,0.85)'
  ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = 'rgba(90,74,44,0.3)'; ctx.lineWidth = 2 * k; ctx.stroke()
  ctx.strokeStyle = 'rgba(244,233,203,0.45)'
  ctx.beginPath(); ctx.arc(sx, sy, sr * 1.55, 0, Math.PI * 2); ctx.stroke()

  // Slow cartoon clouds.
  ctx.fillStyle = 'rgba(238,228,198,0.6)'
  for (let i = 0; i < 3; i++) {
    const cw = (170 + i * 60) * k
    const x = ((t * (6 + i * 3) * k + i * 560) % (W + cw * 2)) - cw
    const y = H * (0.09 + i * 0.07)
    const r = (22 + i * 8) * k
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.arc(x + r * 1.1, y + r * 0.25, r * 0.75, 0, Math.PI * 2)
    ctx.arc(x - r * 1.05, y + r * 0.3, r * 0.65, 0, Math.PI * 2)
    ctx.fill()
  }
}

// A soft column of warm light behind the gallows so the ink figure pops.
export function drawBacklight(ctx: CanvasRenderingContext2D, L: Layout) {
  const cx = L.anchorX, cy = L.H * 0.4, r = L.H * 0.52
  const g = ctx.createRadialGradient(cx, cy, r * 0.08, cx, cy, r)
  g.addColorStop(0, 'rgba(246,236,208,0.5)')
  g.addColorStop(0.5, 'rgba(240,228,196,0.22)')
  g.addColorStop(1, 'rgba(240,228,196,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, L.W, L.H)
}

// A branch that runs straight then winds into a spiral — the rubber-hose tree.
function curlBranch(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, size: number, w: number) {
  let a = ang, px = x, py = y, step = size * 0.2
  ctx.lineWidth = w
  ctx.beginPath(); ctx.moveTo(px, py)
  for (let k = 0; k < 14; k++) {
    px += Math.cos(a) * step; py += Math.sin(a) * step
    ctx.lineTo(px, py)
    a += k < 4 ? 0.12 : 0.55
    step *= k < 4 ? 0.98 : 0.86
  }
  ctx.stroke()
}

export function drawTrees(ctx: CanvasRenderingContext2D, L: Layout, driftX: number) {
  const rand = mulberry32(77)
  ctx.strokeStyle = 'rgba(46,32,18,0.75)'
  ctx.lineCap = 'round'
  const xs = [0.08, 0.19, 0.87, 0.97]
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i] * L.W + driftX * (0.15 + i * 0.05)
    const h = (110 + rand() * 80) * L.s
    const lean = (rand() - 0.5) * 0.5
    const topX = x + lean * h * 0.4
    const topY = L.groundY - h
    // Tapered trunk in two strokes.
    ctx.lineWidth = 8 * L.s
    ctx.beginPath(); ctx.moveTo(x, L.groundY + 4 * L.s); ctx.lineTo((x + topX) / 2, (L.groundY + topY) / 2); ctx.stroke()
    ctx.lineWidth = 5 * L.s
    ctx.beginPath(); ctx.moveTo((x + topX) / 2, (L.groundY + topY) / 2); ctx.lineTo(topX, topY); ctx.stroke()
    // Curling branches.
    curlBranch(ctx, topX, topY, -Math.PI / 2 + lean - 0.5 + rand() * 0.3, h * 0.5, 3.4 * L.s)
    curlBranch(ctx, topX, topY, -Math.PI / 2 + lean + 0.4 + rand() * 0.3, h * 0.42, 3 * L.s)
    curlBranch(ctx, (x + topX) / 2, (L.groundY + topY) / 2, -Math.PI / 2 + (rand() > 0.5 ? 1 : -1) * (0.9 + rand() * 0.3), h * 0.34, 2.6 * L.s)
  }
}

export function drawGround(ctx: CanvasRenderingContext2D, L: Layout) {
  const { W, H, groundY, s } = L
  // Distant rolling hills.
  ctx.fillStyle = 'rgba(150,130,92,0.5)'
  ctx.beginPath(); ctx.moveTo(-20, groundY + 2)
  ctx.quadraticCurveTo(W * 0.16, groundY - 64 * s, W * 0.4, groundY + 2)
  ctx.closePath(); ctx.fill()
  ctx.beginPath(); ctx.moveTo(W * 0.55, groundY + 2)
  ctx.quadraticCurveTo(W * 0.82, groundY - 52 * s, W + 20, groundY + 2)
  ctx.closePath(); ctx.fill()

  // Soil.
  const g = ctx.createLinearGradient(0, groundY, 0, H)
  g.addColorStop(0, '#b3a075')
  g.addColorStop(1, '#87744c')
  ctx.fillStyle = g
  ctx.fillRect(0, groundY, W, H - groundY)

  const rand = mulberry32(5)
  // Hand-inked ground line with a lazy wobble.
  ctx.strokeStyle = INK; ctx.lineWidth = 4 * s; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(-10, groundY)
  for (let x = 0; x <= W + 40; x += 44) ctx.lineTo(x, groundY + (rand() - 0.5) * 5 * s)
  ctx.stroke()

  // Grass tufts and pebbles.
  ctx.strokeStyle = 'rgba(60,45,24,0.55)'
  for (let i = 0; i < 16; i++) {
    const x = rand() * W
    const y = groundY + 6 * s + rand() * (H - groundY) * 0.4
    ctx.lineWidth = 1.8 * s
    ctx.beginPath()
    ctx.moveTo(x, y); ctx.lineTo(x - 3 * s, y - 7 * s)
    ctx.moveTo(x, y); ctx.lineTo(x + 1 * s, y - 9 * s)
    ctx.moveTo(x, y); ctx.lineTo(x + 4 * s, y - 6 * s)
    ctx.stroke()
  }
  for (let i = 0; i < 7; i++) {
    const x = rand() * W, y = groundY + 10 * s + rand() * (H - groundY) * 0.5
    ctx.lineWidth = 1.6 * s
    ctx.beginPath(); ctx.ellipse(x, y, (3 + rand() * 3) * s, (2 + rand() * 2) * s, 0, 0, Math.PI * 2); ctx.stroke()
  }

  // A modest gravestone, dug and dated in advance.
  ctx.save()
  ctx.translate(W * 0.3, groundY + 4 * s)
  ctx.rotate(-0.07)
  ctx.fillStyle = '#b6a67d'; ctx.strokeStyle = INK; ctx.lineWidth = 2.6 * s
  ctx.beginPath()
  ctx.moveTo(-20 * s, 0); ctx.lineTo(-20 * s, -30 * s)
  ctx.quadraticCurveTo(0, -54 * s, 20 * s, -30 * s)
  ctx.lineTo(20 * s, 0); ctx.closePath()
  ctx.fill(); ctx.stroke()
  // Engraved cross.
  ctx.strokeStyle = 'rgba(36,26,16,0.65)'; ctx.lineWidth = 2.4 * s
  ctx.beginPath()
  ctx.moveTo(0, -36 * s); ctx.lineTo(0, -18 * s)
  ctx.moveTo(-6 * s, -30 * s); ctx.lineTo(6 * s, -30 * s)
  ctx.stroke()
  // Fresh mound.
  ctx.fillStyle = 'rgba(90,72,44,0.5)'
  ctx.beginPath(); ctx.ellipse(0, 2 * s, 30 * s, 6 * s, 0, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

export function drawGallows(ctx: CanvasRenderingContext2D, L: Layout, platformDrop: number) {
  const s = L.s
  const beam = (x1: number, y1: number, x2: number, y2: number, w: number) => {
    ctx.strokeStyle = INK; ctx.lineWidth = w; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
    // A pale grain line running along the timber.
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1
    const px = (-dy / len) * w * 0.24, py = (dx / len) * w * 0.24
    ctx.strokeStyle = 'rgba(240,230,200,0.22)'
    ctx.lineWidth = Math.max(1.5, w * 0.14)
    ctx.beginPath(); ctx.moveTo(x1 + px, y1 + py); ctx.lineTo(x2 + px, y2 + py); ctx.stroke()
  }
  const bolt = (x: number, y: number) => {
    ctx.fillStyle = CREAM; ctx.strokeStyle = INK; ctx.lineWidth = 2.4 * s
    ctx.beginPath(); ctx.arc(x, y, 6 * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x - 3 * s, y); ctx.lineTo(x + 3 * s, y); ctx.stroke()
  }

  beam(L.postX, L.groundY + 2 * s, L.postX, L.beamY - 8 * s, 24 * s)
  beam(L.postX - 14 * s, L.beamY, L.beamRightX + 26 * s, L.beamY, 20 * s)
  beam(L.postX + 6 * s, L.beamY + 66 * s, L.postX + 72 * s, L.beamY + 4 * s, 11 * s)
  bolt(L.postX, L.beamY)
  bolt(L.beamRightX + 10 * s, L.beamY)

  // Rope lashing where it meets the beam.
  ctx.strokeStyle = '#4f3a24'; ctx.lineWidth = 3.2 * s
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.moveTo(L.anchorX - 7 * s, L.anchorY - 2 * s + i * 4 * s)
    ctx.lineTo(L.anchorX + 7 * s, L.anchorY - 4 * s + i * 4 * s)
    ctx.stroke()
  }

  // Trapdoor platform (a whole nervous little table — it all drops).
  const py = L.platformY + platformDrop
  ctx.fillStyle = INK
  ctx.fillRect(L.platformX - L.platformW / 2, py, L.platformW, 13 * s)
  ctx.fillStyle = 'rgba(240,230,200,0.28)'
  ctx.fillRect(L.platformX - L.platformW / 2, py, L.platformW, 3 * s)
  ctx.fillStyle = INK
  ctx.fillRect(L.platformX - L.platformW / 2 + 10 * s, py + 13 * s, 9 * s, Math.max(0, L.groundY - py - 13 * s))
  ctx.fillRect(L.platformX + L.platformW / 2 - 19 * s, py + 13 * s, 9 * s, Math.max(0, L.groundY - py - 13 * s))
  // Nail heads.
  ctx.fillStyle = 'rgba(240,230,200,0.6)'
  ctx.beginPath(); ctx.arc(L.platformX - L.platformW / 2 + 14 * s, py + 7 * s, 1.8 * s, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(L.platformX + L.platformW / 2 - 14 * s, py + 7 * s, 1.8 * s, 0, Math.PI * 2); ctx.fill()
}

// Subtle warm haze bands for depth.
export function drawFog(ctx: CanvasRenderingContext2D, L: Layout, t: number) {
  ctx.save()
  for (let i = 0; i < 3; i++) {
    const y = L.groundY - 80 * L.s + i * 40 * L.s
    const drift = Math.sin(t * 0.15 + i) * 30 * L.s
    const g = ctx.createLinearGradient(0, y - 60 * L.s, 0, y + 60 * L.s)
    g.addColorStop(0, 'rgba(240,230,205,0)')
    g.addColorStop(0.5, `rgba(240,230,205,${0.07 - i * 0.015})`)
    g.addColorStop(1, 'rgba(240,230,205,0)')
    ctx.fillStyle = g
    ctx.fillRect(drift - 40 * L.s, y - 60 * L.s, L.W + 80 * L.s, 120 * L.s)
  }
  ctx.restore()
}

// Film effects layer: sepia dust, animated grain, projector flicker, passing
// scratches and the vignette. Drawn last, over everything.
export class Atmosphere {
  private motes: { x: number; y: number; r: number; a: number; ph: number; sp: number }[] = []
  private grain: HTMLCanvasElement | null = null
  private pat: CanvasPattern | null = null
  private dots: HTMLCanvasElement | null = null
  private dotPat: CanvasPattern | null = null
  private scratches: { x: number; life: number }[] = []
  private lastT = 0

  constructor(W: number, H: number, count = 30) {
    const rand = mulberry32(21)
    for (let i = 0; i < count; i++) {
      this.motes.push({ x: rand() * W, y: rand() * H, r: 0.6 + rand() * 1.6, a: 0.05 + rand() * 0.1, ph: rand() * Math.PI * 2, sp: 0.1 + rand() * 0.3 })
    }
    if (typeof document !== 'undefined') {
      const gc = document.createElement('canvas')
      gc.width = gc.height = 128
      const g2 = gc.getContext('2d')!
      const id = g2.createImageData(128, 128)
      for (let i = 0; i < id.data.length; i += 4) {
        const v = Math.random() * 255
        id.data[i] = v * 0.4 + 40
        id.data[i + 1] = v * 0.35 + 30
        id.data[i + 2] = v * 0.25 + 18
        id.data[i + 3] = Math.random() * 44
      }
      g2.putImageData(id, 0, 0)
      this.grain = gc

      // Halftone dot tile — the cheap-print texture of an old comic page.
      const hc = document.createElement('canvas')
      hc.width = hc.height = 8
      const h2 = hc.getContext('2d')!
      h2.fillStyle = 'rgba(36,26,16,0.085)'
      h2.beginPath(); h2.arc(2, 2, 1.15, 0, Math.PI * 2); h2.fill()
      h2.beginPath(); h2.arc(6, 6, 1.15, 0, Math.PI * 2); h2.fill()
      this.dots = hc
    }
  }

  draw(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
    const dt = Math.min(Math.max(t - this.lastT, 0), 0.1)
    this.lastT = t

    // Drifting sepia dust.
    ctx.fillStyle = '#7a6844'
    for (const m of this.motes) {
      const x = m.x + Math.sin(t * m.sp + m.ph) * 12
      const y = (m.y + t * 6 * m.sp) % (H + 20)
      ctx.globalAlpha = m.a
      ctx.beginPath(); ctx.arc(x, y, m.r, 0, Math.PI * 2); ctx.fill()
    }
    ctx.globalAlpha = 1

    // Static halftone print texture.
    if (this.dots) {
      if (!this.dotPat) this.dotPat = ctx.createPattern(this.dots, 'repeat')
      if (this.dotPat) {
        ctx.save()
        ctx.globalAlpha = 0.5
        ctx.fillStyle = this.dotPat
        ctx.fillRect(0, 0, W, H)
        ctx.restore()
      }
    }

    // Animated film grain (a noise tile stamped at a random offset each frame).
    if (this.grain) {
      if (!this.pat) this.pat = ctx.createPattern(this.grain, 'repeat')
      if (this.pat) {
        const ox = (Math.random() * 128) | 0, oy = (Math.random() * 128) | 0
        ctx.save()
        ctx.globalAlpha = 0.55
        ctx.translate(-ox, -oy)
        ctx.fillStyle = this.pat
        ctx.fillRect(0, 0, W + 128, H + 128)
        ctx.restore()
      }
    }

    // Projector flicker.
    const fl = 0.02 + Math.abs(Math.sin(t * 8.3)) * 0.018 + Math.random() * 0.012
    ctx.fillStyle = `rgba(214,199,160,${fl.toFixed(3)})`
    ctx.fillRect(0, 0, W, H)

    // Passing scratches.
    if (Math.random() < 0.025) this.scratches.push({ x: Math.random() * W, life: 0.1 + Math.random() * 0.2 })
    this.scratches = this.scratches.filter(sc => (sc.life -= dt) > 0)
    ctx.strokeStyle = 'rgba(40,28,14,0.12)'
    ctx.lineWidth = 1
    for (const sc of this.scratches) {
      ctx.beginPath(); ctx.moveTo(sc.x, 0); ctx.lineTo(sc.x + 3, H); ctx.stroke()
    }

    // Vignette.
    const vg = ctx.createRadialGradient(W / 2, H * 0.46, H * 0.3, W / 2, H * 0.5, Math.max(W, H) * 0.75)
    vg.addColorStop(0, 'rgba(30,20,8,0)')
    vg.addColorStop(1, 'rgba(30,20,8,0.5)')
    ctx.fillStyle = vg
    ctx.fillRect(0, 0, W, H)
  }
}

// The old-film iris: ink fills everything outside a circle. r shrinks to close.
export function drawIris(ctx: CanvasRenderingContext2D, W: number, H: number, cx: number, cy: number, r: number) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, W, H)
  ctx.arc(cx, cy, Math.max(1, r), 0, Math.PI * 2, true)
  ctx.fillStyle = '#150e07'
  ctx.fill('evenodd')
  ctx.restore()
}
