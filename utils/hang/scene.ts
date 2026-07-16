// The world: dark gradient, fog, distant barren trees, gallows, ground grit,
// and drifting dust. All procedural Canvas, no assets.

import { mulberry32 } from './math'

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

// A soft column of light behind the gallows so the dark figure reads as a crisp
// silhouette against a lighter haze, the way Limbo lights its foreground forms.
export function drawBacklight(ctx: CanvasRenderingContext2D, L: Layout) {
  const cx = L.anchorX, cy = L.H * 0.38, r = L.H * 0.5
  const g = ctx.createRadialGradient(cx, cy, r * 0.08, cx, cy, r)
  g.addColorStop(0, 'rgba(78,86,102,0.4)')
  g.addColorStop(0.45, 'rgba(52,58,72,0.2)')
  g.addColorStop(1, 'rgba(52,58,72,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, L.W, L.H)
}

export function drawBackground(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#0a0c12')
  g.addColorStop(0.55, '#0f121b')
  g.addColorStop(1, '#12151f')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  // Soft vignette.
  const rg = ctx.createRadialGradient(W / 2, H * 0.42, H * 0.2, W / 2, H * 0.5, H * 0.85)
  rg.addColorStop(0, 'rgba(0,0,0,0)')
  rg.addColorStop(1, 'rgba(0,0,0,0.55)')
  ctx.fillStyle = rg
  ctx.fillRect(0, 0, W, H)
}

function branch(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, ang: number, w: number, depth: number, rand: () => number) {
  if (depth <= 0 || len < 4) return
  const x2 = x + Math.cos(ang) * len
  const y2 = y + Math.sin(ang) * len
  ctx.lineWidth = w
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke()
  const spread = 0.4 + rand() * 0.4
  branch(ctx, x2, y2, len * (0.7 + rand() * 0.1), ang - spread, w * 0.7, depth - 1, rand)
  branch(ctx, x2, y2, len * (0.7 + rand() * 0.1), ang + spread, w * 0.7, depth - 1, rand)
  if (rand() > 0.5) branch(ctx, x2, y2, len * 0.6, ang + (rand() - 0.5) * 0.5, w * 0.6, depth - 1, rand)
}

export function drawTrees(ctx: CanvasRenderingContext2D, L: Layout, driftX: number) {
  const rand = mulberry32(77)
  ctx.strokeStyle = 'rgba(20,24,32,0.85)'
  ctx.lineCap = 'round'
  const n = 5
  for (let i = 0; i < n; i++) {
    const x = ((i + 0.5) / n) * L.W + Math.sin(i * 2.1) * 40 * L.s + driftX * (0.2 + i * 0.05)
    const baseY = L.groundY + 6 * L.s
    const h = (120 + rand() * 90) * L.s
    ctx.save()
    ctx.globalAlpha = 0.5
    branch(ctx, x, baseY, h, -Math.PI / 2 + (rand() - 0.5) * 0.2, 5 * L.s, 6, rand)
    ctx.restore()
  }
}

export function drawGround(ctx: CanvasRenderingContext2D, L: Layout) {
  const g = ctx.createLinearGradient(0, L.groundY - 30 * L.s, 0, L.H)
  g.addColorStop(0, 'rgba(26,30,40,0)')
  g.addColorStop(1, 'rgba(18,21,30,1)')
  ctx.fillStyle = g
  ctx.fillRect(0, L.groundY - 30 * L.s, L.W, L.H - L.groundY + 30 * L.s)
  // Grit specks.
  const rand = mulberry32(9)
  ctx.fillStyle = 'rgba(60,66,78,0.5)'
  for (let i = 0; i < 90; i++) {
    const x = rand() * L.W
    const y = L.groundY + rand() * (L.H - L.groundY)
    ctx.fillRect(x, y, 2 * L.s, 1 * L.s)
  }
}

export function drawGallows(ctx: CanvasRenderingContext2D, L: Layout, platformDrop: number) {
  const woodBase = '#241a12', woodMid = '#3c2c1d', woodHi = '#4a3728'
  const postW = 22 * L.s
  // Left post.
  ctx.fillStyle = woodBase
  ctx.fillRect(L.postX - postW / 2, L.beamY, postW, L.groundY - L.beamY + 4 * L.s)
  ctx.fillStyle = woodMid
  ctx.fillRect(L.postX - postW / 2, L.beamY, postW * 0.4, L.groundY - L.beamY)
  // Beam.
  const beamH = 24 * L.s
  ctx.fillStyle = woodMid
  ctx.fillRect(L.postX - postW / 2 - 6 * L.s, L.beamY - beamH, L.beamRightX - L.postX + 40 * L.s, beamH)
  ctx.fillStyle = woodHi
  ctx.fillRect(L.postX - postW / 2 - 6 * L.s, L.beamY - beamH, L.beamRightX - L.postX + 40 * L.s, beamH * 0.28)
  // Brace.
  ctx.strokeStyle = woodBase; ctx.lineWidth = 12 * L.s; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(L.postX + postW / 2, L.beamY + 30 * L.s); ctx.lineTo(L.postX + 70 * L.s, L.beamY); ctx.stroke()

  // Trapdoor platform (drops on execution).
  const py = L.platformY + platformDrop
  ctx.fillStyle = woodBase
  ctx.fillRect(L.platformX - L.platformW / 2, py, L.platformW, 16 * L.s)
  ctx.fillStyle = woodHi
  ctx.fillRect(L.platformX - L.platformW / 2, py, L.platformW, 4 * L.s)
  // Legs of the platform (short).
  ctx.fillStyle = woodBase
  ctx.fillRect(L.platformX - L.platformW / 2 + 8 * L.s, py + 16 * L.s, 10 * L.s, L.groundY - py - 16 * L.s)
  ctx.fillRect(L.platformX + L.platformW / 2 - 18 * L.s, py + 16 * L.s, 10 * L.s, L.groundY - py - 16 * L.s)
}

export class Atmosphere {
  motes: { x: number; y: number; r: number; a: number; ph: number; sp: number }[] = []
  constructor(W: number, H: number, count = 34) {
    const rand = mulberry32(21)
    for (let i = 0; i < count; i++) {
      this.motes.push({ x: rand() * W, y: rand() * H, r: (0.6 + rand() * 1.6), a: 0.05 + rand() * 0.12, ph: rand() * Math.PI * 2, sp: 0.1 + rand() * 0.3 })
    }
  }
  draw(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
    ctx.fillStyle = '#aeb6c4'
    for (const m of this.motes) {
      const x = m.x + Math.sin(t * m.sp + m.ph) * 12
      const y = (m.y + t * 6 * m.sp) % (H + 20)
      ctx.globalAlpha = m.a
      ctx.beginPath(); ctx.arc(x, y, m.r, 0, Math.PI * 2); ctx.fill()
    }
    ctx.globalAlpha = 1
  }
}

// Foggy horizontal bands for depth.
export function drawFog(ctx: CanvasRenderingContext2D, L: Layout, t: number) {
  ctx.save()
  const bands = 3
  for (let i = 0; i < bands; i++) {
    const y = L.groundY - 80 * L.s + i * 40 * L.s
    const drift = Math.sin(t * 0.15 + i) * 30 * L.s
    const g = ctx.createLinearGradient(0, y - 60 * L.s, 0, y + 60 * L.s)
    g.addColorStop(0, 'rgba(42,47,58,0)')
    g.addColorStop(0.5, `rgba(42,47,58,${0.12 - i * 0.02})`)
    g.addColorStop(1, 'rgba(42,47,58,0)')
    ctx.fillStyle = g
    ctx.fillRect(drift - 40 * L.s, y - 60 * L.s, L.W + 80 * L.s, 120 * L.s)
  }
  ctx.restore()
}
