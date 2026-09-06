/**
 * Procedural Elevate-style hero/cover generator.
 *
 * Cream paper (#F7F1E4) + black ink (#0B0B0C) + cobalt (#2F5BD8).
 * Flat conceptual editorial illustration — no text overlays, no logos.
 * Wide ~16:9. Topic/slug hash selects a motif family; seeded PRNG + noise
 * drive geometry (ribbons, ripples, orbits, grids, Voronoi-ish cells, flows).
 *
 * Pure Node SVG → PNG via @resvg/resvg-js when available (already nitro-external).
 */

export type ElevateHeroInput = {
  topic: string
  slug: string
  seed?: number | string
  /** Output width in px (height = width * 9/16). Default 1600. */
  width?: number
  /** Prefer 'png' (resvg) or 'svg'. Default tries png then svg. */
  format?: 'png' | 'svg' | 'auto'
}

export type ElevateHeroResult = {
  /** data:image/png;base64,… or data:image/svg+xml;base64,… */
  dataUrl: string
  mime: 'image/png' | 'image/svg+xml'
  bytes: Buffer
  ext: 'png' | 'svg'
  alt: string
  motif: MotifFamily
  seed: number
  width: number
  height: number
  svg: string
}

export type MotifFamily =
  | 'ribbons'
  | 'ripples'
  | 'orbits'
  | 'dual'
  | 'fragments'
  | 'grid'
  | 'voronoi'
  | 'flows'

const CREAM = '#F7F1E4'
const INK = '#0B0B0C'
const COBALT = '#2F5BD8'

const MOTIFS: MotifFamily[] = [
  'ribbons',
  'ripples',
  'orbits',
  'dual',
  'fragments',
  'grid',
  'voronoi',
  'flows'
]

/* ─── seeded PRNG / hashing ─────────────────────────────────────────────── */

function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

function mulberry32(a: number): () => number {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashToSeed(topic: string, slug: string, seed?: number | string): number {
  if (typeof seed === 'number' && Number.isFinite(seed)) return seed >>> 0
  if (typeof seed === 'string' && seed.trim()) return cyrb53(seed.trim()) >>> 0
  return cyrb53(`${slug}::${topic}`) >>> 0
}

/* ─── noise ──────────────────────────────────────────────────────────────── */

function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/** Value noise on a lattice; seed-derived. */
function makeValueNoise(rand: () => number) {
  const table = new Float64Array(256)
  for (let i = 0; i < 256; i++) table[i] = rand()
  const perm = new Uint8Array(512)
  const p = Array.from({ length: 256 }, (_, i) => i)
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[p[i], p[j]] = [p[j], p[i]]
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]

  function lattice(ix: number, iy: number) {
    const n = perm[(ix + perm[iy & 255]) & 255]
    return table[n]
  }

  return function valueNoise(x: number, y: number): number {
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const fx = fade(x - x0)
    const fy = fade(y - y0)
    const v00 = lattice(x0 & 255, y0 & 255)
    const v10 = lattice((x0 + 1) & 255, y0 & 255)
    const v01 = lattice(x0 & 255, (y0 + 1) & 255)
    const v11 = lattice((x0 + 1) & 255, (y0 + 1) & 255)
    return lerp(lerp(v00, v10, fx), lerp(v01, v11, fx), fy)
  }
}

/** Simplex-ish 2D gradient noise (simplified skew). */
function makeSimplex(rand: () => number) {
  const grad2 = [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
  ]
  const perm = new Uint8Array(512)
  const p = Array.from({ length: 256 }, (_, i) => i)
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[p[i], p[j]] = [p[j], p[i]]
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]

  const F2 = 0.5 * (Math.sqrt(3) - 1)
  const G2 = (3 - Math.sqrt(3)) / 6

  return function simplex(xin: number, yin: number): number {
    const s = (xin + yin) * F2
    const i = Math.floor(xin + s)
    const j = Math.floor(yin + s)
    const t = (i + j) * G2
    const x0 = xin - (i - t)
    const y0 = yin - (j - t)
    const i1 = x0 > y0 ? 1 : 0
    const j1 = x0 > y0 ? 0 : 1
    const x1 = x0 - i1 + G2
    const y1 = y0 - j1 + G2
    const x2 = x0 - 1 + 2 * G2
    const y2 = y0 - 1 + 2 * G2
    const ii = i & 255
    const jj = j & 255

    function contrib(gx: number, gy: number, xx: number, yy: number) {
      let n = 0.5 - xx * xx - yy * yy
      if (n < 0) return 0
      n *= n
      return n * n * (gx * xx + gy * yy)
    }

    const gi0 = grad2[perm[ii + perm[jj]] % 8]
    const gi1 = grad2[perm[ii + i1 + perm[jj + j1]] % 8]
    const gi2 = grad2[perm[ii + 1 + perm[jj + 1]] % 8]
    const n0 = contrib(gi0[0], gi0[1], x0, y0)
    const n1 = contrib(gi1[0], gi1[1], x1, y1)
    const n2 = contrib(gi2[0], gi2[1], x2, y2)
    return 70 * (n0 + n1 + n2)
  }
}

function fbm(
  noise: (x: number, y: number) => number,
  x: number,
  y: number,
  octaves = 4
): number {
  let amp = 0.5
  let freq = 1
  let sum = 0
  let norm = 0
  for (let o = 0; o < octaves; o++) {
    sum += amp * noise(x * freq, y * freq)
    norm += amp
    amp *= 0.5
    freq *= 2
  }
  return sum / norm
}

/* ─── motif selection ────────────────────────────────────────────────────── */

function pickMotif(topic: string, slug: string, seed: number): MotifFamily {
  const t = `${topic} ${slug}`.toLowerCase().replace(/[-_]+/g, ' ')
  // Ordered: more specific stems first. Match prefixes (moonly, intelligence, …).
  const rules: Array<[RegExp, MotifFamily]> = [
    [/\b(lie|deceiv|truth|path|choice|fork|road|tangle)/, 'ribbons'],
    [/\b(brain|mind|intellig|think|cognit|conscious)/, 'ribbons'],
    [/\b(entropy|lazy|laziness|idle|ripple|vibrat|coffee|chaos)\b/, 'ripples'],
    [/\b(moon|orbit|planet|space|celest|lunar|tidal|cycle)/, 'orbits'],
    [/\b(midpoint|hourglass|forty|eighteen|ageing|aging)\b/, 'orbits'],
    [/\b(ai|a\.i\.|machine|circuit|digital|comput|neural|robot)\b/, 'dual'],
    [/\b(understand|dialogue|conver|mirror|empath)/, 'dual'],
    [/\b(jamais|memory|forget|fade|shatter|fragment|language)\b/, 'fragments'],
    [/\b(grid|network|matrix|structur|system)\b/, 'grid'],
    [/\b(cell|organic|biolog|tissue|growth)\b/, 'voronoi'],
    [/\b(flow|river|stream|current|time)\b/, 'flows'],
    [/\b(life|body)\b/, 'voronoi']
  ]
  for (const [re, motif] of rules) {
    if (re.test(t)) return motif
  }
  return MOTIFS[seed % MOTIFS.length]
}

function motifAlt(motif: MotifFamily, topic: string): string {
  const subject = topic.trim() || 'an idea'
  const map: Record<MotifFamily, string> = {
    ribbons: `Flat editorial illustration of tangled black ink paths with one cobalt ribbon, about ${subject}`,
    ripples: `Flat editorial illustration of concentric dashed ripples in black and cobalt on cream paper, about ${subject}`,
    orbits: `Flat editorial illustration of orbital arcs and celestial geometry in black and cobalt, about ${subject}`,
    dual: `Flat editorial illustration of two facing profiles — organic and geometric — linked by cobalt accents, about ${subject}`,
    fragments: `Flat editorial illustration of geometric shards disrupted by a cobalt wave, about ${subject}`,
    grid: `Flat editorial illustration of a structured grid with a cobalt anomaly path, about ${subject}`,
    voronoi: `Flat editorial illustration of organic cell-like regions with cobalt highlights, about ${subject}`,
    flows: `Flat editorial illustration of flowing Bézier currents in black ink with a cobalt thread, about ${subject}`
  }
  return map[motif]
}

/* ─── SVG helpers ────────────────────────────────────────────────────────── */

function esc(n: number, d = 2): string {
  return n.toFixed(d).replace(/\.?0+$/, (m) => (m.includes('.') ? m.replace(/0+$/, '').replace(/\.$/, '') : m))
}

function pt(x: number, y: number): string {
  return `${esc(x)},${esc(y)}`
}

function bezierRibbon(
  points: Array<[number, number]>,
  width: number
): { fill: string; dash: string } {
  if (points.length < 2) return { fill: '', dash: '' }
  // Build centerline as cubic through points
  const center: string[] = [`M ${pt(points[0][0], points[0][1])}`]
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]
    const [x1, y1] = points[i]
    const dx = x1 - x0
    const dy = y1 - y0
    const cx1 = x0 + dx * 0.35
    const cy1 = y0 + dy * 0.35
    const cx2 = x0 + dx * 0.65
    const cy2 = y0 + dy * 0.65
    center.push(`C ${pt(cx1, cy1)} ${pt(cx2, cy2)} ${pt(x1, y1)}`)
  }
  const dCenter = center.join(' ')

  // Offset polygon for thick ribbon (approx normals)
  const left: Array<[number, number]> = []
  const right: Array<[number, number]> = []
  const hw = width / 2
  for (let i = 0; i < points.length; i++) {
    const [x, y] = points[i]
    const prev = points[Math.max(0, i - 1)]
    const next = points[Math.min(points.length - 1, i + 1)]
    let tx = next[0] - prev[0]
    let ty = next[1] - prev[1]
    const len = Math.hypot(tx, ty) || 1
    tx /= len
    ty /= len
    const nx = -ty
    const ny = tx
    left.push([x + nx * hw, y + ny * hw])
    right.push([x - nx * hw, y - ny * hw])
  }
  const fillParts = [`M ${pt(left[0][0], left[0][1])}`]
  for (let i = 1; i < left.length; i++) fillParts.push(`L ${pt(left[i][0], left[i][1])}`)
  for (let i = right.length - 1; i >= 0; i--) fillParts.push(`L ${pt(right[i][0], right[i][1])}`)
  fillParts.push('Z')
  return { fill: fillParts.join(' '), dash: dCenter }
}

function paperGrain(rand: () => number, w: number, h: number, count = 180): string {
  const dots: string[] = []
  for (let i = 0; i < count; i++) {
    const x = rand() * w
    const y = rand() * h
    const r = 0.4 + rand() * 1.1
    const op = 0.015 + rand() * 0.035
    dots.push(
      `<circle cx="${esc(x)}" cy="${esc(y)}" r="${esc(r, 2)}" fill="${INK}" fill-opacity="${esc(op, 3)}" />`
    )
  }
  return `<g id="grain" aria-hidden="true">${dots.join('')}</g>`
}

/* ─── motif renderers ────────────────────────────────────────────────────── */

type Ctx = {
  w: number
  h: number
  rand: () => number
  noise: (x: number, y: number) => number
  simplex: (x: number, y: number) => number
  topic: string
}

function renderRibbons(ctx: Ctx): string {
  const { w, h, rand, simplex } = ctx
  const parts: string[] = []
  const originX = w * (0.14 + rand() * 0.08)
  const originY = h * (0.45 + rand() * 0.18)
  const ribbonCount = 12 + Math.floor(rand() * 8)

  // Soft source disc (abstract head / origin)
  const headR = Math.min(w, h) * (0.08 + rand() * 0.025)
  parts.push(`<circle cx="${esc(originX)}" cy="${esc(originY)}" r="${esc(headR)}" fill="${INK}" />`)
  if (rand() > 0.4) {
    const ang = -0.6 - rand() * 0.35
    const cutW = headR * 1.55
    const cx = originX + Math.cos(ang) * headR * 0.15
    const cy = originY - headR * 0.5
    parts.push(
      `<rect x="${esc(cx - cutW / 2)}" y="${esc(cy - 5)}" width="${esc(cutW)}" height="12" fill="${CREAM}" transform="rotate(${esc((ang * 180) / Math.PI, 1)} ${esc(cx)} ${esc(cy)})" />`
    )
  }

  function centerline(pts: Array<[number, number]>): string {
    if (pts.length < 2) return ''
    const d = [`M ${pt(pts[0][0], pts[0][1])}`]
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1]
      const [x1, y1] = pts[i]
      const dx = x1 - x0
      const dy = y1 - y0
      d.push(`C ${pt(x0 + dx * 0.35, y0 + dy * 0.2)} ${pt(x0 + dx * 0.65, y0 + dy * 0.8)} ${pt(x1, y1)}`)
    }
    return d.join(' ')
  }

  type Ribbon = { pts: Array<[number, number]>; cobalt: boolean; width: number }
  const ribbons: Ribbon[] = []
  for (let i = 0; i < ribbonCount; i++) {
    const cobalt = i === ribbonCount - 1
    const width = cobalt ? 16 + rand() * 6 : 11 + rand() * 8
    const pts: Array<[number, number]> = [
      [originX + (rand() - 0.5) * 16, originY - headR * 0.35 + (rand() - 0.5) * 16]
    ]
    let x = pts[0][0]
    let y = pts[0][1]
    const steps = cobalt ? 9 + Math.floor(rand() * 3) : 6 + Math.floor(rand() * 5)
    let angle = -0.35 + (rand() - 0.5) * 1.2
    for (let s = 0; s < steps; s++) {
      const n = simplex(x * 0.0035, y * 0.0035)
      if (cobalt) angle += n * 0.28 + (rand() - 0.5) * 0.12
      else {
        angle += n * 0.95 + (rand() - 0.5) * 0.75
        if (rand() > 0.78) angle += (rand() > 0.5 ? 1 : -1) * Math.PI * (0.55 + rand() * 0.7)
      }
      const step = cobalt ? 70 + rand() * 50 : 40 + rand() * 55
      x += Math.cos(angle) * step
      y += Math.sin(angle) * step
      x = Math.max(w * 0.04, Math.min(w * 0.98, x))
      y = Math.max(h * 0.06, Math.min(h * 0.94, y))
      pts.push([x, y])
    }
    ribbons.push({ pts, cobalt, width })
  }

  for (const r of ribbons.filter((r) => !r.cobalt)) {
    const d = centerline(r.pts)
    parts.push(`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${esc(r.width, 1)}" stroke-linecap="round" stroke-linejoin="round" />`)
    parts.push(
      `<path d="${d}" fill="none" stroke="${CREAM}" stroke-width="1.7" stroke-linecap="round" stroke-dasharray="6 8" opacity="0.95" />`
    )
  }
  for (const r of ribbons.filter((r) => r.cobalt)) {
    const d = centerline(r.pts)
    parts.push(`<path d="${d}" fill="none" stroke="${COBALT}" stroke-width="${esc(r.width, 1)}" stroke-linecap="round" stroke-linejoin="round" />`)
    parts.push(
      `<path d="${d}" fill="none" stroke="${CREAM}" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="7 9" />`
    )
  }
  return parts.join('\n')
}

function renderRipples(ctx: Ctx): string {
  const { w, h, rand, noise } = ctx
  const parts: string[] = []
  const cx = w * 0.5
  const cy = h * 0.5
  const maxR = Math.min(w, h) * 0.48
  const rings = 16 + Math.floor(rand() * 6)

  // Central cup-like icon (abstract: vessel + steam)
  const cupW = 42 + rand() * 10
  const cupH = 48 + rand() * 8
  parts.push(
    `<path d="M ${esc(cx - cupW / 2)} ${esc(cy - 8)} L ${esc(cx - cupW / 2 + 4)} ${esc(cy + cupH / 2)} Q ${esc(cx)} ${esc(cy + cupH / 2 + 10)} ${esc(cx + cupW / 2 - 4)} ${esc(cy + cupH / 2)} L ${esc(cx + cupW / 2)} ${esc(cy - 8)} Z" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" />`
  )
  parts.push(
    `<path d="M ${esc(cx - cupW / 2 - 2)} ${esc(cy - 8)} L ${esc(cx + cupW / 2 + 2)} ${esc(cy - 8)}" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" />`
  )
  for (let s = 0; s < 3; s++) {
    const sx = cx - 10 + s * 10
    parts.push(
      `<path d="M ${esc(sx)} ${esc(cy - 18)} Q ${esc(sx + 4)} ${esc(cy - 30)} ${esc(sx)} ${esc(cy - 42)}" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" />`
    )
  }

  for (let i = 1; i <= rings; i++) {
    const t = i / rings
    const r = maxR * (0.18 + t * 0.82)
    const cobalt = i % 3 === 0 || (noise(i * 0.3, 0.2) > 0.62 && i % 2 === 0)
    const color = cobalt ? COBALT : INK
    const segs = 18 + Math.floor(rand() * 16)
    const gapBias = 0.15 + t * 0.35
    for (let s = 0; s < segs; s++) {
      if (rand() < gapBias) continue
      const a0 = (s / segs) * Math.PI * 2 + rand() * 0.08
      const span = ((0.2 + rand() * 0.55) * (1 - t * 0.4)) / segs
      const a1 = a0 + span * Math.PI * 2
      const kind = rand()
      if (kind < 0.12) {
        const px = cx + Math.cos((a0 + a1) / 2) * r
        const py = cy + Math.sin((a0 + a1) / 2) * r
        const rr = 2 + rand() * 3.5
        if (rand() > 0.5) {
          parts.push(`<circle cx="${esc(px)}" cy="${esc(py)}" r="${esc(rr)}" fill="${color}" />`)
        } else {
          parts.push(
            `<rect x="${esc(px - rr)}" y="${esc(py - rr)}" width="${esc(rr * 2)}" height="${esc(rr * 2)}" fill="${color}" />`
          )
        }
      } else {
        const x0 = cx + Math.cos(a0) * r
        const y0 = cy + Math.sin(a0) * r
        const x1 = cx + Math.cos(a1) * r
        const y1 = cy + Math.sin(a1) * r
        const sw = 2.2 + (1 - t) * 1.4
        parts.push(
          `<path d="M ${pt(x0, y0)} A ${esc(r)} ${esc(r)} 0 0 1 ${pt(x1, y1)}" fill="none" stroke="${color}" stroke-width="${esc(sw, 2)}" stroke-linecap="round" />`
        )
      }
    }
  }
  return parts.join('\n')
}

function renderOrbits(ctx: Ctx): string {
  const { w, h, rand, simplex } = ctx
  const parts: string[] = []
  const cx = w * 0.5
  const cy = h * 0.52
  const orbits = 5 + Math.floor(rand() * 3)

  for (let i = 0; i < orbits; i++) {
    const rx = w * (0.12 + i * 0.08 + rand() * 0.02)
    const ry = h * (0.1 + i * 0.065 + rand() * 0.02)
    const rot = (rand() - 0.5) * 28
    const cobalt = i === orbits - 2 || (i === 1 && rand() > 0.4)
    const color = cobalt ? COBALT : INK
    const dash = cobalt ? '0' : `${8 + rand() * 12} ${6 + rand() * 10}`
    parts.push(
      `<ellipse cx="${esc(cx)}" cy="${esc(cy)}" rx="${esc(rx)}" ry="${esc(ry)}" fill="none" stroke="${color}" stroke-width="${esc(2.2 + (cobalt ? 1.2 : 0), 2)}" stroke-dasharray="${dash}" transform="rotate(${esc(rot, 1)} ${esc(cx)} ${esc(cy)})" />`
    )
    // Bodies on orbit
    const bodies = 1 + Math.floor(rand() * 2)
    for (let b = 0; b < bodies; b++) {
      const ang = rand() * Math.PI * 2
      const px = cx + Math.cos(ang) * rx
      const py = cy + Math.sin(ang) * ry
      // rotate around center
      const rad = (rot * Math.PI) / 180
      const dx = px - cx
      const dy = py - cy
      const rxp = cx + dx * Math.cos(rad) - dy * Math.sin(rad)
      const ryp = cy + dx * Math.sin(rad) + dy * Math.cos(rad)
      const br = 4 + rand() * 7 + (cobalt ? 3 : 0)
      parts.push(`<circle cx="${esc(rxp)}" cy="${esc(ryp)}" r="${esc(br)}" fill="${color}" />`)
    }
  }

  // Crescent / primary body
  const R = Math.min(w, h) * (0.07 + rand() * 0.03)
  parts.push(`<circle cx="${esc(cx)}" cy="${esc(cy)}" r="${esc(R)}" fill="${INK}" />`)
  const offset = R * (0.35 + rand() * 0.2)
  parts.push(
    `<circle cx="${esc(cx + offset)}" cy="${esc(cy - offset * 0.15)}" r="${esc(R * 0.92)}" fill="${CREAM}" />`
  )

  // Noise dust field
  for (let i = 0; i < 40; i++) {
    const x = w * (0.08 + rand() * 0.84)
    const y = h * (0.1 + rand() * 0.8)
    const n = simplex(x * 0.01, y * 0.01)
    if (n < 0.15) continue
    const r = 1 + rand() * 2.5
    parts.push(
      `<circle cx="${esc(x)}" cy="${esc(y)}" r="${esc(r)}" fill="${rand() > 0.78 ? COBALT : INK}" opacity="${esc(0.35 + rand() * 0.5, 2)}" />`
    )
  }
  return parts.join('\n')
}

function profilePath(x: number, y: number, s: number, facing: 1 | -1): string {
  // Abstract head profile facing ±1 (right / left)
  const f = facing
  return [
    `M ${pt(x, y - s * 1.1)}`,
    `C ${pt(x + f * s * 0.55, y - s * 1.15)} ${pt(x + f * s * 0.95, y - s * 0.55)} ${pt(x + f * s * 0.85, y)}`,
    `C ${pt(x + f * s * 0.9, y + s * 0.25)} ${pt(x + f * s * 0.55, y + s * 0.35)} ${pt(x + f * s * 0.35, y + s * 0.45)}`,
    `L ${pt(x + f * s * 0.2, y + s * 0.85)}`,
    `L ${pt(x - f * s * 0.15, y + s * 1.05)}`,
    `L ${pt(x - f * s * 0.35, y + s * 0.55)}`,
    `C ${pt(x - f * s * 0.55, y + s * 0.15)} ${pt(x - f * s * 0.5, y - s * 0.55)} ${pt(x, y - s * 1.1)}`,
    'Z'
  ].join(' ')
}

function renderDual(ctx: Ctx): string {
  const { w, h, rand } = ctx
  const parts: string[] = []
  const cy = h * 0.5
  const s = Math.min(w, h) * 0.22
  const gap = s * 0.55
  const leftX = w * 0.5 - gap - s * 0.35
  const rightX = w * 0.5 + gap + s * 0.35

  const left = profilePath(leftX, cy, s, 1)
  const right = profilePath(rightX, cy, s, -1)

  parts.push(`<path d="${left}" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round" />`)
  parts.push(`<path d="${right}" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round" />`)

  // Organic brain fill (left)
  const bx = leftX + s * 0.05
  const by = cy - s * 0.15
  parts.push(
    `<ellipse cx="${esc(bx)}" cy="${esc(by)}" rx="${esc(s * 0.38)}" ry="${esc(s * 0.42)}" fill="${INK}" />`
  )
  parts.push(
    `<path d="M ${pt(bx - s * 0.2, by)} Q ${pt(bx, by - s * 0.25)} ${pt(bx + s * 0.22, by)} Q ${pt(bx, by + s * 0.2)} ${pt(bx - s * 0.2, by)}" fill="${CREAM}" opacity="0.25" />`
  )

  // Circuit fill (right) — clip to ellipse inside profile
  const rx = rightX - s * 0.05
  const ry = cy - s * 0.12
  const crx = s * 0.36
  const cry = s * 0.4
  parts.push(`<ellipse cx="${esc(rx)}" cy="${esc(ry)}" rx="${esc(crx)}" ry="${esc(cry)}" fill="${COBALT}" />`)
  const lines: string[] = []
  for (let i = 0; i < 5; i++) {
    const yy = ry - cry * 0.7 + (i / 4) * cry * 1.4
    lines.push(
      `<line x1="${esc(rx - crx * 0.75)}" y1="${esc(yy)}" x2="${esc(rx + crx * 0.75)}" y2="${esc(yy)}" stroke="${INK}" stroke-width="2.2" />`
    )
  }
  for (let i = 0; i < 4; i++) {
    const xx = rx - crx * 0.55 + (i / 3) * crx * 1.1
    const y0 = ry - cry * 0.55
    const y1 = ry + cry * 0.55
    lines.push(
      `<path d="M ${pt(xx, y0)} L ${pt(xx, (y0 + y1) / 2)} L ${pt(xx + (rand() > 0.5 ? 12 : -12), (y0 + y1) / 2)} L ${pt(xx + (rand() > 0.5 ? 12 : -12), y1)}" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" />`
    )
  }
  parts.push(
    `<clipPath id="circClip"><ellipse cx="${esc(rx)}" cy="${esc(ry)}" rx="${esc(crx)}" ry="${esc(cry)}" /></clipPath>`
  )
  parts.push(`<g clip-path="url(#circClip)">${lines.join('')}</g>`)

  // Pixel bridge
  const n = 6
  const bw = 10
  const startX = w * 0.5 - ((n * bw + (n - 1) * 4) / 2)
  for (let i = 0; i < n; i++) {
    const color = i % 2 === 0 ? INK : COBALT
    parts.push(
      `<rect x="${esc(startX + i * (bw + 4))}" y="${esc(cy - s * 0.85)}" width="${bw}" height="${bw}" fill="${color}" />`
    )
  }
  return parts.join('\n')
}

function renderFragments(ctx: Ctx): string {
  const { w, h, rand, noise } = ctx
  const parts: string[] = []
  const cx = w * 0.5
  const rows = 5
  const baseY = h * 0.18
  const rowH = h * 0.14

  // Cobalt disruptor wave
  const wave: string[] = [`M ${pt(cx, baseY - 20)}`]
  for (let i = 0; i <= 24; i++) {
    const t = i / 24
    const y = baseY - 20 + t * (h * 0.7)
    const x = cx + Math.sin(t * Math.PI * 3 + rand() * 0.2) * (18 + t * 28)
    wave.push(`L ${pt(x, y)}`)
  }
  parts.push(
    `<path d="${wave.join(' ')}" fill="none" stroke="${COBALT}" stroke-width="10" stroke-linecap="round" />`
  )

  for (let row = 0; row < rows; row++) {
    const shatter = row / (rows - 1)
    const y = baseY + row * rowH
    const blocks = 8 + Math.floor(rand() * 4)
    const totalW = w * (0.28 + (1 - shatter) * 0.08)
    let x = cx - totalW / 2
    for (let b = 0; b < blocks; b++) {
      const bw = totalW / blocks + (rand() - 0.5) * 8 * shatter
      const bh = 28 + rand() * 18 - shatter * 8
      const rot = (rand() - 0.5) * shatter * 50
      const dx = (rand() - 0.5) * shatter * 90
      const dy = shatter * shatter * (20 + rand() * 50)
      const cobalt = shatter > 0.45 && rand() > 0.55
      const n = noise(b * 0.4, row * 0.5)
      if (n < 0.12 && shatter < 0.3) {
        x += bw
        continue
      }
      parts.push(
        `<rect x="${esc(x + dx)}" y="${esc(y + dy)}" width="${esc(Math.max(6, bw - 4))}" height="${esc(bh)}" fill="${cobalt ? COBALT : INK}" transform="rotate(${esc(rot, 1)} ${esc(x + bw / 2)} ${esc(y + bh / 2)})" />`
      )
      x += bw
    }
  }
  return parts.join('\n')
}

function renderGrid(ctx: Ctx): string {
  const { w, h, rand, simplex } = ctx
  const parts: string[] = []
  const marginX = w * 0.12
  const marginY = h * 0.14
  const cols = 12 + Math.floor(rand() * 4)
  const rows = 7 + Math.floor(rand() * 2)
  const gw = (w - marginX * 2) / cols
  const gh = (h - marginY * 2) / rows

  parts.push(
    `<rect x="${esc(marginX)}" y="${esc(marginY)}" width="${esc(w - marginX * 2)}" height="${esc(h - marginY * 2)}" fill="none" stroke="${INK}" stroke-width="2.5" />`
  )

  for (let c = 1; c < cols; c++) {
    const x = marginX + c * gw
    parts.push(
      `<line x1="${esc(x)}" y1="${esc(marginY)}" x2="${esc(x)}" y2="${esc(h - marginY)}" stroke="${INK}" stroke-width="1.2" opacity="0.55" />`
    )
  }
  for (let r = 1; r < rows; r++) {
    const y = marginY + r * gh
    parts.push(
      `<line x1="${esc(marginX)}" y1="${esc(y)}" x2="${esc(w - marginX)}" y2="${esc(y)}" stroke="${INK}" stroke-width="1.2" opacity="0.55" />`
    )
  }

  // Filled cells from noise
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const n = fbm(simplex, c * 0.35, r * 0.35, 3)
      if (n > 0.55) {
        const cobalt = n > 0.72 && rand() > 0.4
        parts.push(
          `<rect x="${esc(marginX + c * gw + 3)}" y="${esc(marginY + r * gh + 3)}" width="${esc(gw - 6)}" height="${esc(gh - 6)}" fill="${cobalt ? COBALT : INK}" opacity="${esc(cobalt ? 1 : 0.85, 2)}" />`
        )
      }
    }
  }

  // Anomaly path through grid
  let cx = Math.floor(rand() * cols)
  let cy = 0
  const pathPts: Array<[number, number]> = []
  while (cy < rows) {
    pathPts.push([marginX + (cx + 0.5) * gw, marginY + (cy + 0.5) * gh])
    if (rand() > 0.45) cx = Math.max(0, Math.min(cols - 1, cx + (rand() > 0.5 ? 1 : -1)))
    cy += 1
  }
  const d = pathPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${pt(p[0], p[1])}`).join(' ')
  parts.push(
    `<path d="${d}" fill="none" stroke="${COBALT}" stroke-width="6" stroke-linecap="square" stroke-linejoin="miter" />`
  )
  return parts.join('\n')
}

function renderVoronoi(ctx: Ctx): string {
  const { w, h, rand } = ctx
  const parts: string[] = []
  const sites: Array<[number, number]> = []
  const count = 18 + Math.floor(rand() * 10)
  for (let i = 0; i < count; i++) {
    sites.push([w * (0.1 + rand() * 0.8), h * (0.12 + rand() * 0.76)])
  }

  // Approximate cells via sampling nearest-site polygons (radial spokes)
  const cobaltSite = Math.floor(rand() * sites.length)
  for (let i = 0; i < sites.length; i++) {
    const [sx, sy] = sites[i]
    const angles = 10 + Math.floor(rand() * 6)
    const radius = 40 + rand() * 70
    const pts: Array<[number, number]> = []
    for (let a = 0; a < angles; a++) {
      const ang = (a / angles) * Math.PI * 2
      // Shrink toward midpoints with neighbors (crude)
      let r = radius * (0.7 + rand() * 0.45)
      const px = sx + Math.cos(ang) * r
      const py = sy + Math.sin(ang) * r
      // Clamp to nearest bisector: if another site is closer, pull back
      let best = r
      for (let j = 0; j < sites.length; j++) {
        if (j === i) continue
        const [ox, oy] = sites[j]
        const mx = (sx + ox) / 2
        const my = (sy + oy) / 2
        const dx = Math.cos(ang)
        const dy = Math.sin(ang)
        const denom = dx * (ox - sx) + dy * (oy - sy)
        if (denom <= 1e-6) continue
        const t = ((mx - sx) * (ox - sx) + (my - sy) * (oy - sy)) / denom
        if (t > 0 && t < best) best = t * 0.92
      }
      pts.push([sx + Math.cos(ang) * best, sy + Math.sin(ang) * best])
    }
    const d =
      pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${pt(p[0], p[1])}`).join(' ') + ' Z'
    const isCobalt = i === cobaltSite || (rand() > 0.92 && i % 5 === 0)
    parts.push(
      `<path d="${d}" fill="${isCobalt ? COBALT : 'none'}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" fill-opacity="${isCobalt ? 1 : 0}" />`
    )
    if (!isCobalt && rand() > 0.7) {
      parts.push(`<circle cx="${esc(sx)}" cy="${esc(sy)}" r="3.5" fill="${INK}" />`)
    }
  }
  // Accent site mark
  const [ax, ay] = sites[cobaltSite]
  parts.push(`<circle cx="${esc(ax)}" cy="${esc(ay)}" r="6" fill="${CREAM}" />`)
  parts.push(`<circle cx="${esc(ax)}" cy="${esc(ay)}" r="3" fill="${COBALT}" />`)
  return parts.join('\n')
}

function renderFlows(ctx: Ctx): string {
  const { w, h, rand, simplex } = ctx
  const parts: string[] = []
  const streams = 11 + Math.floor(rand() * 6)
  const cobaltIndex = Math.floor(streams * (0.55 + rand() * 0.3))

  for (let i = 0; i < streams; i++) {
    const y0 = h * (0.12 + (i / (streams - 1)) * 0.76)
    const pts: Array<[number, number]> = []
    let x = w * 0.04
    let y = y0
    while (x < w * 0.96) {
      pts.push([x, y])
      const n = simplex(x * 0.0035, y * 0.0035 + i * 0.2)
      y += n * 28 + Math.sin(x * 0.008 + i) * 4
      y = Math.max(h * 0.06, Math.min(h * 0.94, y))
      x += 28 + rand() * 18
    }
    const cobalt = i === cobaltIndex
    const width = cobalt ? 16 : 3 + (i % 3)
    if (cobalt) {
      const { fill, dash } = bezierRibbon(pts, width)
      parts.push(`<path d="${fill}" fill="${COBALT}" />`)
      parts.push(
        `<path d="${dash}" fill="none" stroke="${CREAM}" stroke-width="1.5" stroke-dasharray="6 8" stroke-linecap="round" />`
      )
    } else {
      const d = pts
        .map((p, idx) => {
          if (idx === 0) return `M ${pt(p[0], p[1])}`
          const prev = pts[idx - 1]
          const c1x = prev[0] + (p[0] - prev[0]) * 0.4
          const c1y = prev[1]
          const c2x = prev[0] + (p[0] - prev[0]) * 0.6
          const c2y = p[1]
          return `C ${pt(c1x, c1y)} ${pt(c2x, c2y)} ${pt(p[0], p[1])}`
        })
        .join(' ')
      parts.push(
        `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${esc(width, 1)}" stroke-linecap="round" opacity="${esc(0.55 + (i % 4) * 0.1, 2)}" />`
      )
    }
  }
  return parts.join('\n')
}

const RENDERERS: Record<MotifFamily, (ctx: Ctx) => string> = {
  ribbons: renderRibbons,
  ripples: renderRipples,
  orbits: renderOrbits,
  dual: renderDual,
  fragments: renderFragments,
  grid: renderGrid,
  voronoi: renderVoronoi,
  flows: renderFlows
}

function buildSvg(opts: {
  w: number
  h: number
  motif: MotifFamily
  topic: string
  seed: number
}): string {
  const rand = mulberry32(opts.seed)
  const noise = makeValueNoise(mulberry32(opts.seed ^ 0x9e3779b9))
  const simplex = makeSimplex(mulberry32(opts.seed ^ 0x85ebca6b))
  const ctx: Ctx = {
    w: opts.w,
    h: opts.h,
    rand,
    noise,
    simplex,
    topic: opts.topic
  }
  const body = RENDERERS[opts.motif](ctx)
  const grain = paperGrain(mulberry32(opts.seed ^ 0xc2b2ae35), opts.w, opts.h, 160)

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${opts.w}" height="${opts.h}" viewBox="0 0 ${opts.w} ${opts.h}" role="img" aria-label="">
  <rect width="100%" height="100%" fill="${CREAM}" />
  ${grain}
  <g id="motif">${body}</g>
</svg>`
}

async function rasterizePng(svg: string, width: number): Promise<Buffer | null> {
  try {
    const mod = await import('@resvg/resvg-js')
    const Resvg = mod.Resvg || (mod as any).default?.Resvg
    if (!Resvg) return null
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: width },
      font: { loadSystemFonts: false },
      background: CREAM
    })
    const rendered = resvg.render()
    return Buffer.from(rendered.asPng())
  } catch {
    return null
  }
}

function svgToDataUrl(svg: string): string {
  const b64 = Buffer.from(svg, 'utf8').toString('base64')
  return `data:image/svg+xml;base64,${b64}`
}

/**
 * Generate an Elevate-styled procedural hero for any blog topic.
 * Prefer PNG (resvg); fall back to SVG data URL if rasterization fails.
 */
export async function generateElevateHero(input: ElevateHeroInput): Promise<ElevateHeroResult> {
  const topic = String(input.topic || '').trim() || 'Untitled'
  const slug = String(input.slug || '').trim() || 'draft'
  const seed = hashToSeed(topic, slug, input.seed)
  const width = Math.max(800, Math.min(2400, Math.round(input.width || 1600)))
  const height = Math.round((width * 9) / 16)
  const motif = pickMotif(topic, slug, seed)
  const svg = buildSvg({ w: width, h: height, motif, topic, seed })
  const alt = motifAlt(motif, topic)
  const format = input.format || 'auto'

  if (format !== 'svg') {
    const png = await rasterizePng(svg, width)
    if (png && png.length > 0) {
      const dataUrl = `data:image/png;base64,${png.toString('base64')}`
      return {
        dataUrl,
        mime: 'image/png',
        bytes: png,
        ext: 'png',
        alt,
        motif,
        seed,
        width,
        height,
        svg
      }
    }
    if (format === 'png') {
      // Caller insisted on png but resvg failed — still return svg rather than throw.
    }
  }

  const bytes = Buffer.from(svg, 'utf8')
  return {
    dataUrl: svgToDataUrl(svg),
    mime: 'image/svg+xml',
    bytes,
    ext: 'svg',
    alt,
    motif,
    seed,
    width,
    height,
    svg
  }
}

/** Sync SVG-only path (no resvg). Useful for tests. */
export function generateElevateHeroSvg(input: ElevateHeroInput): Omit<ElevateHeroResult, 'dataUrl' | 'mime' | 'bytes' | 'ext'> & {
  svg: string
  dataUrl: string
  mime: 'image/svg+xml'
  bytes: Buffer
  ext: 'svg'
} {
  const topic = String(input.topic || '').trim() || 'Untitled'
  const slug = String(input.slug || '').trim() || 'draft'
  const seed = hashToSeed(topic, slug, input.seed)
  const width = Math.max(800, Math.min(2400, Math.round(input.width || 1600)))
  const height = Math.round((width * 9) / 16)
  const motif = pickMotif(topic, slug, seed)
  const svg = buildSvg({ w: width, h: height, motif, topic, seed })
  const bytes = Buffer.from(svg, 'utf8')
  return {
    dataUrl: svgToDataUrl(svg),
    mime: 'image/svg+xml',
    bytes,
    ext: 'svg',
    alt: motifAlt(motif, topic),
    motif,
    seed,
    width,
    height,
    svg
  }
}
