/**
 * Deterministic Elevate procedural hero covers.
 * Palette: cream #F7F1E4, ink #0B0B0C, cobalt #2F5BD8 — matching public/blog/*/hero.jpg.
 */

export type ElevateHeroResult = {
  /** data:image/svg+xml;base64,… ready for draft.hero + localizePostImages */
  dataUrl: string
  svg: string
  seed: number
  motif: string
  alt: string
}

const CREAM = '#F7F1E4'
const INK = '#0B0B0C'
const COBALT = '#2F5BD8'

function hashSeed(input: string): number {
  let h = 2166136261 >>> 0
  const s = String(input || 'elevate')
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pickMotif(seed: number): string {
  const motifs = ['tangle-path', 'orbits', 'midpoint', 'shards', 'lattice', 'wave']
  return motifs[seed % motifs.length]
}

function headProfile(cx: number, cy: number, r: number): string {
  // Simplified right-facing head silhouette (open top for tangle)
  const x0 = cx - r * 0.55
  const y0 = cy - r * 0.15
  return [
    `M ${x0.toFixed(1)} ${(cy + r * 0.85).toFixed(1)}`,
    `C ${(x0 - r * 0.1).toFixed(1)} ${(cy + r * 0.2).toFixed(1)} ${(cx - r * 0.95).toFixed(1)} ${(cy - r * 0.2).toFixed(1)} ${(cx - r * 0.35).toFixed(1)} ${(cy - r * 0.95).toFixed(1)}`,
    `L ${(cx + r * 0.15).toFixed(1)} ${(cy - r * 0.55).toFixed(1)}`,
    `C ${(cx + r * 0.55).toFixed(1)} ${(cy - r * 0.35).toFixed(1)} ${(cx + r * 0.75).toFixed(1)} ${(cy + r * 0.05).toFixed(1)} ${(cx + r * 0.55).toFixed(1)} ${(cy + r * 0.45).toFixed(1)}`,
    `C ${(cx + r * 0.45).toFixed(1)} ${(cy + r * 0.7).toFixed(1)} ${(cx + r * 0.15).toFixed(1)} ${(cy + r * 0.95).toFixed(1)} ${x0.toFixed(1)} ${(cy + r * 0.85).toFixed(1)}`,
    'Z'
  ].join(' ')
}

function roadPath(rng: () => number, x: number, y: number, len: number, turn: number): string {
  const x2 = x + Math.cos(turn) * len
  const y2 = y + Math.sin(turn) * len
  const c1x = x + Math.cos(turn - 0.6) * len * 0.35
  const c1y = y + Math.sin(turn - 0.6) * len * 0.35
  const c2x = x + Math.cos(turn + 0.5) * len * 0.7
  const c2y = y + Math.sin(turn + 0.5) * len * 0.7
  void rng
  return `M ${x.toFixed(1)} ${y.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

function motifTangle(rng: () => number): string {
  const cx = 640
  const cy = 420
  const r = 150
  const roads: string[] = []
  const n = 14 + Math.floor(rng() * 8)
  for (let i = 0; i < n; i++) {
    const ang = -Math.PI * 0.85 + rng() * Math.PI * 1.1
    const len = 90 + rng() * 160
    const path = roadPath(rng, cx + Math.cos(ang) * 20, cy - r * 0.5, len, ang - 0.4 + rng())
    const color = i === 0 ? COBALT : INK
    roads.push(`<path d="${path}" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round"/>`)
    roads.push(`<path d="${path}" fill="none" stroke="${CREAM}" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="5 7"/>`)
  }
  return `<path d="${headProfile(cx, cy, r)}" fill="${INK}"/>${roads.join('')}`
}

function motifOrbits(rng: () => number): string {
  const cx = 640 + (rng() - 0.5) * 40
  const cy = 360 + (rng() - 0.5) * 30
  const parts: string[] = []
  parts.push(`<circle cx="${cx}" cy="${cy}" r="42" fill="${INK}"/>`)
  parts.push(`<circle cx="${cx}" cy="${cy}" r="18" fill="${CREAM}"/>`)
  for (let i = 0; i < 5; i++) {
    const rx = 90 + i * 55 + rng() * 20
    const ry = 55 + i * 32 + rng() * 12
    const rot = (rng() * 50 - 25).toFixed(1)
    const stroke = i === 2 ? COBALT : INK
    const sw = i === 2 ? 6 : 3
    parts.push(`<ellipse cx="${cx}" cy="${cy}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="none" stroke="${stroke}" stroke-width="${sw}" transform="rotate(${rot} ${cx} ${cy})" stroke-dasharray="${i % 2 ? '0' : '10 8'}"/>`)
    const a = rng() * Math.PI * 2
    const px = cx + Math.cos(a) * rx
    const py = cy + Math.sin(a) * ry
    parts.push(`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${i === 2 ? 10 : 6}" fill="${i === 2 ? COBALT : INK}"/>`)
  }
  return parts.join('')
}

function motifMidpoint(rng: () => number): string {
  const parts: string[] = []
  const baseY = 520
  for (let i = 0; i < 9; i++) {
    const h = 40 + rng() * 280
    const x = 180 + i * 110
    const color = i === 4 ? COBALT : INK
    parts.push(`<rect x="${x}" y="${(baseY - h).toFixed(1)}" width="54" height="${h.toFixed(1)}" fill="${color}" rx="4"/>`)
  }
  parts.push(`<line x1="160" y1="200" x2="1120" y2="200" stroke="${COBALT}" stroke-width="4" stroke-dasharray="12 10"/>`)
  parts.push(`<circle cx="640" cy="200" r="14" fill="${COBALT}"/>`)
  return parts.join('')
}

function motifShards(rng: () => number): string {
  const parts: string[] = []
  const cx = 640
  const cy = 360
  for (let i = 0; i < 16; i++) {
    const ang = (i / 16) * Math.PI * 2 + rng() * 0.2
    const len = 80 + rng() * 220
    const w = 14 + rng() * 28
    const x2 = cx + Math.cos(ang) * len
    const y2 = cy + Math.sin(ang) * len
    const px = cx + Math.cos(ang + 0.15) * w
    const py = cy + Math.sin(ang + 0.15) * w
    const qx = cx + Math.cos(ang - 0.15) * w
    const qy = cy + Math.sin(ang - 0.15) * w
    const fill = i % 5 === 0 ? COBALT : INK
    parts.push(`<polygon points="${px.toFixed(1)},${py.toFixed(1)} ${qx.toFixed(1)},${qy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" fill="${fill}"/>`)
  }
  parts.push(`<circle cx="${cx}" cy="${cy}" r="36" fill="${CREAM}" stroke="${INK}" stroke-width="8"/>`)
  return parts.join('')
}

function motifLattice(rng: () => number): string {
  const parts: string[] = []
  const cols = 8
  const rows = 5
  const nodes: Array<{ x: number; y: number }> = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = 180 + c * 130 + (rng() - 0.5) * 20
      const y = 140 + r * 110 + (rng() - 0.5) * 20
      nodes.push({ x, y })
    }
  }
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x
      const dy = nodes[i].y - nodes[j].y
      const d = Math.hypot(dx, dy)
      if (d < 170 && rng() > 0.45) {
        const stroke = rng() > 0.82 ? COBALT : INK
        parts.push(`<line x1="${nodes[i].x.toFixed(1)}" y1="${nodes[i].y.toFixed(1)}" x2="${nodes[j].x.toFixed(1)}" y2="${nodes[j].y.toFixed(1)}" stroke="${stroke}" stroke-width="${stroke === COBALT ? 4 : 2}"/>`)
      }
    }
  }
  for (const n of nodes) {
    const cobalt = rng() > 0.78
    parts.push(`<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${cobalt ? 9 : 5}" fill="${cobalt ? COBALT : INK}"/>`)
  }
  return parts.join('')
}

function motifWave(rng: () => number): string {
  const parts: string[] = []
  for (let i = 0; i < 7; i++) {
    const y = 160 + i * 70
    const amp = 30 + rng() * 50
    const phase = rng() * Math.PI * 2
    const pts: string[] = []
    for (let x = 80; x <= 1200; x += 20) {
      const yy = y + Math.sin(x * 0.012 + phase) * amp
      pts.push(`${x},${yy.toFixed(1)}`)
    }
    const stroke = i === 3 ? COBALT : INK
    parts.push(`<polyline points="${pts.join(' ')}" fill="none" stroke="${stroke}" stroke-width="${i === 3 ? 8 : 3}" stroke-linecap="round"/>`)
  }
  parts.push(`<circle cx="640" cy="370" r="28" fill="${COBALT}"/>`)
  return parts.join('')
}

function buildSvg(topic: string, seed: number, motif: string, body: string): string {
  const label = String(topic || 'Elevate').slice(0, 48)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-label="${escapeXml(label)} editorial cover">
  <rect width="1280" height="720" fill="${CREAM}"/>
  <g opacity="0.035">
    ${Array.from({ length: 40 }, (_, i) => {
      const x = (seed + i * 97) % 1280
      const y = (seed * 3 + i * 53) % 720
      return `<circle cx="${x}" cy="${y}" r="1.2" fill="${INK}"/>`
    }).join('')}
  </g>
  <g>${body}</g>
  <rect x="48" y="48" width="1184" height="624" fill="none" stroke="${INK}" stroke-width="2" opacity="0.08"/>
</svg>`
}

function escapeXml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
}

function bodyForMotif(motif: string, rng: () => number): string {
  switch (motif) {
    case 'orbits': return motifOrbits(rng)
    case 'midpoint': return motifMidpoint(rng)
    case 'shards': return motifShards(rng)
    case 'lattice': return motifLattice(rng)
    case 'wave': return motifWave(rng)
    case 'tangle-path':
    default: return motifTangle(rng)
  }
}

/** Build a deterministic Elevate hero for any topic. */
export function generateElevateHero(topic: string, slug?: string): ElevateHeroResult {
  const seed = hashSeed(`${slug || ''}|${topic || 'elevate'}`)
  const rng = mulberry32(seed)
  const motif = pickMotif(seed)
  const body = bodyForMotif(motif, rng)
  const svg = buildSvg(topic, seed, motif, body)
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`
  return {
    dataUrl,
    svg,
    seed,
    motif,
    alt: `Elevate editorial cover for ${topic || 'essay'} (${motif})`
  }
}
