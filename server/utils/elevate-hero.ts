/**
 * Elevate hero/cover generator — topic-driven conceptual illustrations.
 *
 * Cream #F7F1E4 · ink #0B0B0C · cobalt #2F5BD8.
 * Flat editorial DNA matching public/blog/.../hero.jpg:
 * ONE clear metaphor (head → tangled roads vs clear path, cup + ripples, orbits…).
 *
 * Pipeline:
 *  1. Optional LLM `heroBrief` { metaphor, motif, focal, cobaltRole }
 *  2. Else heuristic brief from title/dek/topic
 *  3. Procedural SVG built from that brief (real structure, not fBm sludge)
 *  4. Rasterize PNG via @resvg/resvg-js when available
 */

export type MotifFamily =
  | 'tangled-paths' // head + tangled roads vs clear cobalt path (intelligence / lie / choice)
  | 'ripples' // vessel + concentric dashed rings (entropy / focus / vibration)
  | 'orbits' // celestial arcs + crescent (moon / cycles / midpoint)
  | 'dual-minds' // facing profiles organic vs geometric (AI / dialogue)
  | 'balance' // scales / tipping point (judgment / trade-offs / midpoint)
  | 'shatter' // ordered bars → fragments (memory / jamais vu / language)
  | 'grid-anomaly' // structure + cobalt anomaly path (systems / networks)
  | 'flow-thread' // parallel currents + one cobalt thread (time / current)

export type HeroFocal =
  | 'head-profile'
  | 'head-open'
  | 'vessel'
  | 'crescent'
  | 'dual-profiles'
  | 'scales'
  | 'bars'
  | 'grid'
  | 'streams'

export type HeroBrief = {
  /** One-sentence idea the cover should communicate */
  metaphor: string
  /** Motif family the renderer understands */
  motif: MotifFamily
  /** Primary silhouette / object */
  focal: HeroFocal
  /** What cobalt highlights (the “punch line” of the metaphor) */
  cobaltRole: string
}

export type ElevateHeroInput = {
  topic: string
  slug: string
  title?: string
  dek?: string
  seed?: number | string
  /** LLM or caller-supplied brief — preferred over heuristics */
  brief?: Partial<HeroBrief> | null
  /** Output width in px (height = width * 9/16). Default 1600. */
  width?: number
  format?: 'png' | 'svg' | 'auto'
}

export type ElevateHeroResult = {
  dataUrl: string
  mime: 'image/png' | 'image/svg+xml'
  bytes: Buffer
  ext: 'png' | 'svg'
  alt: string
  motif: MotifFamily
  brief: HeroBrief
  seed: number
  width: number
  height: number
  svg: string
}

const CREAM = '#F7F1E4'
const INK = '#0B0B0C'
const COBALT = '#2F5BD8'

const MOTIFS: MotifFamily[] = [
  'tangled-paths',
  'ripples',
  'orbits',
  'dual-minds',
  'balance',
  'shatter',
  'grid-anomaly',
  'flow-thread'
]

const MOTIF_SET = new Set<string>(MOTIFS)

/* ─── seeded PRNG ────────────────────────────────────────────────────────── */

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

/* ─── brief selection ────────────────────────────────────────────────────── */

function normalizeMotif(raw: unknown): MotifFamily | null {
  const s = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
  const aliases: Record<string, MotifFamily> = {
    ribbons: 'tangled-paths',
    roads: 'tangled-paths',
    tangled: 'tangled-paths',
    'tangled-roads': 'tangled-paths',
    paths: 'tangled-paths',
    ripple: 'ripples',
    concentric: 'ripples',
    orbit: 'orbits',
    celestial: 'orbits',
    lunar: 'orbits',
    dual: 'dual-minds',
    'dual-profiles': 'dual-minds',
    dialogue: 'dual-minds',
    scales: 'balance',
    balance: 'balance',
    hourglass: 'balance',
    fragments: 'shatter',
    shatter: 'shatter',
    memory: 'shatter',
    grid: 'grid-anomaly',
    network: 'grid-anomaly',
    flows: 'flow-thread',
    flow: 'flow-thread',
    thread: 'flow-thread',
    voronoi: 'shatter'
  }
  if (MOTIF_SET.has(s)) return s as MotifFamily
  if (aliases[s]) return aliases[s]
  return null
}

function normalizeFocal(raw: unknown, motif: MotifFamily): HeroFocal {
  const s = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
  const allowed: HeroFocal[] = [
    'head-profile',
    'head-open',
    'vessel',
    'crescent',
    'dual-profiles',
    'scales',
    'bars',
    'grid',
    'streams'
  ]
  if ((allowed as string[]).includes(s)) return s as HeroFocal
  const defaults: Record<MotifFamily, HeroFocal> = {
    'tangled-paths': 'head-profile',
    ripples: 'vessel',
    orbits: 'crescent',
    'dual-minds': 'dual-profiles',
    balance: 'scales',
    shatter: 'bars',
    'grid-anomaly': 'grid',
    'flow-thread': 'streams'
  }
  return defaults[motif]
}

/** Heuristic brief from title/dek/topic — mirrors Elevate cover DNA. */
export function pickHeroBrief(topic: string, slug: string, title = '', dek = ''): HeroBrief {
  const t = `${title} ${dek} ${topic} ${slug}`.toLowerCase().replace(/[-_]+/g, ' ')

  const rules: Array<{ re: RegExp; brief: HeroBrief }> = [
    {
      re: /\b(lie|deceiv|truth|fiction|honesty|falsehood)\b/,
      brief: {
        metaphor: 'Curated simplicity of a lie versus tangled complexity of reality',
        motif: 'tangled-paths',
        focal: 'head-profile',
        cobaltRole: 'The straight path — artificial clarity leaving the mouth'
      }
    },
    {
      re: /\b(intellig|brain|mind|think|cognit|overthink|choice|path|fork|decision)\b/,
      brief: {
        metaphor: 'Clarity emerging from mental clutter',
        motif: 'tangled-paths',
        focal: 'head-open',
        cobaltRole: 'Single exit path escaping the tangle'
      }
    },
    {
      re: /\b(entropy|lazy|laziness|idle|coffee|chaos|vibrat|energy|focus)\b/,
      brief: {
        metaphor: 'A small act radiating through a vibrating field',
        motif: 'ripples',
        focal: 'vessel',
        cobaltRole: 'Rhythmic accents in the expanding rings'
      }
    },
    {
      re: /\b(moon|lunar|orbit|planet|space|celest|tidal|cycle)\b/,
      brief: {
        metaphor: 'Celestial pull and the quiet correction of a name',
        motif: 'orbits',
        focal: 'crescent',
        cobaltRole: 'One privileged orbit among many'
      }
    },
    {
      re: /\b(midpoint|hourglass|forty|eighteen|ageing|aging|lifespan|balance|trade.?off)\b/,
      brief: {
        metaphor: 'A tipping point that is not where intuition places it',
        motif: 'balance',
        focal: 'scales',
        cobaltRole: 'The lighter pan that actually matters'
      }
    },
    {
      re: /\b(ai|a\.i\.|machine|circuit|digital|comput|neural|robot|understand)\b/,
      brief: {
        metaphor: 'Organic mind meeting geometric machine across a bridge',
        motif: 'dual-minds',
        focal: 'dual-profiles',
        cobaltRole: 'Machine profile and the pixel bridge between them'
      }
    },
    {
      re: /\b(dialogue|conver|mirror|empath|listen)\b/,
      brief: {
        metaphor: 'Two minds facing each other across a shared signal',
        motif: 'dual-minds',
        focal: 'dual-profiles',
        cobaltRole: 'The signal bridge linking both profiles'
      }
    },
    {
      re: /\b(jamais|memory|forget|fade|shatter|fragment|language|word)\b/,
      brief: {
        metaphor: 'Meaning breaking apart as familiar forms lose hold',
        motif: 'shatter',
        focal: 'bars',
        cobaltRole: 'Disruptor wave cutting through ordered structure'
      }
    },
    {
      re: /\b(grid|network|matrix|structur|system|organiz)\b/,
      brief: {
        metaphor: 'Order interrupted by one anomalous path',
        motif: 'grid-anomaly',
        focal: 'grid',
        cobaltRole: 'Anomaly route through the measured grid'
      }
    },
    {
      re: /\b(flow|river|stream|current|time|river)\b/,
      brief: {
        metaphor: 'Many currents, one decisive thread',
        motif: 'flow-thread',
        focal: 'streams',
        cobaltRole: 'The cobalt thread riding the flow'
      }
    }
  ]

  for (const { re, brief } of rules) {
    if (re.test(t)) return brief
  }

  // Default: tangled paths from a head — Elevate’s strongest recurring metaphor.
  return {
    metaphor: `One clear idea cutting through the noise of “${topic.trim() || 'the essay'}”`,
    motif: 'tangled-paths',
    focal: 'head-open',
    cobaltRole: 'The single legible path among tangled thoughts'
  }
}

export function resolveHeroBrief(
  input: ElevateHeroInput,
  seed: number
): HeroBrief {
  const fallback = pickHeroBrief(input.topic, input.slug, input.title || '', input.dek || '')
  const raw = input.brief
  if (!raw || typeof raw !== 'object') return fallback

  const motif = normalizeMotif(raw.motif) || fallback.motif
  const focal = normalizeFocal(raw.focal, motif)
  const metaphor =
    String(raw.metaphor || '').trim() ||
    fallback.metaphor ||
    `Conceptual cover for ${input.topic || input.slug}`
  const cobaltRole =
    String(raw.cobaltRole || '').trim() ||
    fallback.cobaltRole ||
    'Cobalt accent carrying the essay’s punch line'

  // Slight seed-based focal flip for tangled-paths when LLM omitted focal.
  if (!raw.focal && motif === 'tangled-paths') {
    const alt: HeroFocal = seed % 2 === 0 ? 'head-profile' : 'head-open'
    return { metaphor, motif, focal: alt, cobaltRole }
  }

  return { metaphor, motif, focal, cobaltRole }
}

function briefAlt(brief: HeroBrief, topic: string): string {
  const subject = topic.trim() || 'the essay idea'
  return `Flat editorial illustration on cream paper: ${brief.metaphor} (${brief.motif}; ${brief.focal}; cobalt = ${brief.cobaltRole}). About ${subject}.`
}

/* ─── SVG helpers ────────────────────────────────────────────────────────── */

function esc(n: number, d = 2): string {
  return n.toFixed(d).replace(/\.?0+$/, (m) => (m.includes('.') ? m.replace(/0+$/, '').replace(/\.$/, '') : m))
}

function pt(x: number, y: number): string {
  return `${esc(x)},${esc(y)}`
}

function paperGrain(rand: () => number, w: number, h: number, count = 120): string {
  const dots: string[] = []
  for (let i = 0; i < count; i++) {
    const x = rand() * w
    const y = rand() * h
    const r = 0.35 + rand() * 0.9
    const op = 0.012 + rand() * 0.028
    dots.push(
      `<circle cx="${esc(x)}" cy="${esc(y)}" r="${esc(r, 2)}" fill="${INK}" fill-opacity="${esc(op, 3)}" />`
    )
  }
  return `<g id="grain" aria-hidden="true">${dots.join('')}</g>`
}

function roadStroke(
  d: string,
  color: string,
  width: number,
  dashCream = true
): string {
  const parts = [
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${esc(width, 1)}" stroke-linecap="round" stroke-linejoin="round" />`
  ]
  if (dashCream) {
    parts.push(
      `<path d="${d}" fill="none" stroke="${CREAM}" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="6 8" opacity="0.95" />`
    )
  }
  return parts.join('\n')
}

function cubicThrough(pts: Array<[number, number]>): string {
  if (pts.length < 2) return ''
  const d = [`M ${pt(pts[0][0], pts[0][1])}`]
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const dx = x1 - x0
    const dy = y1 - y0
    d.push(
      `C ${pt(x0 + dx * 0.35, y0 + dy * 0.15)} ${pt(x0 + dx * 0.65, y0 + dy * 0.85)} ${pt(x1, y1)}`
    )
  }
  return d.join(' ')
}

/** Profile head silhouette facing right (filled). */
function headProfileFilled(cx: number, cy: number, s: number): string {
  // Classic Elevate silhouette — forehead → nose → lips → chin → neck
  return [
    `M ${pt(cx - s * 0.15, cy - s * 1.05)}`,
    `C ${pt(cx + s * 0.15, cy - s * 1.15)} ${pt(cx + s * 0.55, cy - s * 0.85)} ${pt(cx + s * 0.62, cy - s * 0.35)}`,
    `C ${pt(cx + s * 0.68, cy - s * 0.05)} ${pt(cx + s * 0.55, cy + s * 0.08)} ${pt(cx + s * 0.48, cy + s * 0.18)}`,
    `C ${pt(cx + s * 0.58, cy + s * 0.28)} ${pt(cx + s * 0.5, cy + s * 0.42)} ${pt(cx + s * 0.35, cy + s * 0.48)}`,
    `L ${pt(cx + s * 0.22, cy + s * 0.95)}`,
    `L ${pt(cx - s * 0.25, cy + s * 1.1)}`,
    `L ${pt(cx - s * 0.35, cy + s * 0.55)}`,
    `C ${pt(cx - s * 0.55, cy + s * 0.1)} ${pt(cx - s * 0.5, cy - s * 0.55)} ${pt(cx - s * 0.15, cy - s * 1.05)}`,
    'Z'
  ].join(' ')
}

/** Open-top head (intelligence DNA) — diagonal cut, facing right. */
function headOpenTop(cx: number, cy: number, s: number): string {
  return [
    `M ${pt(cx - s * 0.55, cy - s * 0.35)}`,
    `L ${pt(cx + s * 0.35, cy - s * 0.95)}`,
    `L ${pt(cx + s * 0.55, cy - s * 0.55)}`,
    `C ${pt(cx + s * 0.7, cy - s * 0.15)} ${pt(cx + s * 0.55, cy + s * 0.15)} ${pt(cx + s * 0.42, cy + s * 0.28)}`,
    `C ${pt(cx + s * 0.52, cy + s * 0.38)} ${pt(cx + s * 0.4, cy + s * 0.52)} ${pt(cx + s * 0.25, cy + s * 0.55)}`,
    `L ${pt(cx + s * 0.12, cy + s * 1.05)}`,
    `L ${pt(cx - s * 0.35, cy + s * 1.12)}`,
    `L ${pt(cx - s * 0.45, cy + s * 0.5)}`,
    `C ${pt(cx - s * 0.65, cy + s * 0.05)} ${pt(cx - s * 0.7, cy - s * 0.15)} ${pt(cx - s * 0.55, cy - s * 0.35)}`,
    'Z'
  ].join(' ')
}

type Ctx = {
  w: number
  h: number
  rand: () => number
  brief: HeroBrief
  topic: string
}

/* ─── motif renderers (structured metaphors) ─────────────────────────────── */

function renderTangledPaths(ctx: Ctx): string {
  const { w, h, rand, brief } = ctx
  const parts: string[] = []
  const headParts: string[] = []
  const open = brief.focal === 'head-open'
  const s = Math.min(w, h) * (open ? 0.22 : 0.2)
  const hx = w * 0.18
  const hy = h * (open ? 0.52 : 0.5)
  const mouthX = open ? hx + s * 0.15 : hx + s * 0.45
  const mouthY = open ? hy - s * 0.15 : hy + s * 0.12

  const headD = open ? headOpenTop(hx, hy, s) : headProfileFilled(hx, hy, s)
  headParts.push(`<path d="${headD}" fill="${INK}" />`)

  // Cream cut for open head (reads as hollow container)
  if (open) {
    headParts.push(
      `<path d="M ${pt(hx - s * 0.5, hy - s * 0.32)} L ${pt(hx + s * 0.32, hy - s * 0.88)} L ${pt(hx + s * 0.12, hy - s * 0.55)} L ${pt(hx - s * 0.35, hy - s * 0.15)} Z" fill="${CREAM}" />`
    )
  }

  const tangleCount = 10 + Math.floor(rand() * 5)
  for (let i = 0; i < tangleCount; i++) {
    const pts: Array<[number, number]> = [[mouthX + (rand() - 0.5) * 12, mouthY + (rand() - 0.5) * 10]]
    let x = pts[0][0]
    let y = pts[0][1]
    let angle = -0.9 + rand() * 1.6
    const steps = 7 + Math.floor(rand() * 5)
    for (let step = 0; step < steps; step++) {
      angle += (rand() - 0.45) * 1.15
      if (rand() > 0.72) angle += (rand() > 0.5 ? 1 : -1) * Math.PI * (0.4 + rand() * 0.6)
      const len = 36 + rand() * 55
      x += Math.cos(angle) * len
      y += Math.sin(angle) * len
      x = Math.max(w * 0.12, Math.min(w * 0.98, x))
      y = Math.max(h * 0.06, Math.min(h * 0.94, y))
      pts.push([x, y])
    }
    const width = 11 + rand() * 7
    parts.push(roadStroke(cubicThrough(pts), INK, width))
  }

  // Cobalt clear path — the metaphor punch line
  const cobaltPts: Array<[number, number]> = [[mouthX, mouthY + (open ? 8 : 4)]]
  let cx = cobaltPts[0][0]
  let cy = cobaltPts[0][1]
  // Prefer a readable arc toward top-right (intelligence) or straight right (lie)
  const straight = /straight|lie|mouth|clear path|artificial/i.test(brief.cobaltRole + brief.metaphor)
  if (straight) {
    cobaltPts.push([w * 0.55, cy])
    cobaltPts.push([w * 0.98, cy + (rand() - 0.5) * 8])
  } else {
    for (let step = 0; step < 6; step++) {
      cx += 90 + rand() * 40
      cy += -18 - rand() * 28 + (step > 3 ? rand() * 20 : 0)
      cx = Math.min(w * 0.98, cx)
      cy = Math.max(h * 0.08, Math.min(h * 0.75, cy))
      cobaltPts.push([cx, cy])
    }
  }
  parts.push(roadStroke(cubicThrough(cobaltPts), COBALT, 15 + rand() * 3))

  // Optional crossed-fingers / marker on the cobalt road (lie DNA)
  if (straight && rand() > 0.25) {
    const mx = mouthX + (w * 0.22)
    const my = cobaltPts[0][1] - 18
    parts.push(
      `<g transform="translate(${esc(mx)} ${esc(my)})" fill="${COBALT}">`,
      `<path d="M -8,12 C -10,-2 -2,-14 2,-8 C 4,-18 14,-10 10,4 Z" />`,
      `<path d="M 4,10 C 2,-4 10,-16 14,-8 C 16,-18 24,-8 18,8 Z" />`,
      `</g>`
    )
  }

  // Head on top so the silhouette stays readable over road origins
  return [...parts, ...headParts].join('\n')
}

function renderRipples(ctx: Ctx): string {
  const { w, h, rand } = ctx
  const parts: string[] = []
  const cx = w * 0.5
  const cy = h * 0.5
  const maxR = Math.min(w, h) * 0.48

  // Coffee cup vessel (entropy DNA)
  const cupW = 48
  const cupH = 52
  parts.push(
    `<path d="M ${esc(cx - cupW / 2)} ${esc(cy - 6)} L ${esc(cx - cupW / 2 + 5)} ${esc(cy + cupH / 2)} Q ${esc(cx)} ${esc(cy + cupH / 2 + 12)} ${esc(cx + cupW / 2 - 5)} ${esc(cy + cupH / 2)} L ${esc(cx + cupW / 2)} ${esc(cy - 6)} Z" fill="none" stroke="${INK}" stroke-width="3.8" stroke-linejoin="round" />`
  )
  parts.push(
    `<path d="M ${esc(cx - cupW / 2 - 2)} ${esc(cy - 6)} L ${esc(cx + cupW / 2 + 2)} ${esc(cy - 6)}" fill="none" stroke="${INK}" stroke-width="3.8" stroke-linecap="round" />`
  )
  // Handle
  parts.push(
    `<path d="M ${esc(cx + cupW / 2)} ${esc(cy + 4)} Q ${esc(cx + cupW / 2 + 22)} ${esc(cy + 10)} ${esc(cx + cupW / 2)} ${esc(cy + 28)}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" />`
  )
  for (let s = 0; s < 3; s++) {
    const sx = cx - 12 + s * 12
    parts.push(
      `<path d="M ${esc(sx)} ${esc(cy - 14)} Q ${esc(sx + 5)} ${esc(cy - 28)} ${esc(sx)} ${esc(cy - 40)}" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" />`
    )
  }

  const rings = 14 + Math.floor(rand() * 4)
  for (let i = 1; i <= rings; i++) {
    const t = i / rings
    const r = maxR * (0.2 + t * 0.8)
    const cobalt = i % 3 === 0
    const color = cobalt ? COBALT : INK
    const segs = 16 + Math.floor(rand() * 10)
    const gapBias = 0.12 + t * 0.32
    for (let s = 0; s < segs; s++) {
      if (rand() < gapBias) continue
      const a0 = (s / segs) * Math.PI * 2 + rand() * 0.06
      const span = ((0.25 + rand() * 0.5) * (1 - t * 0.35)) / segs
      const a1 = a0 + span * Math.PI * 2
      if (rand() < 0.1) {
        const px = cx + Math.cos((a0 + a1) / 2) * r
        const py = cy + Math.sin((a0 + a1) / 2) * r
        const rr = 2 + rand() * 3
        parts.push(
          rand() > 0.5
            ? `<circle cx="${esc(px)}" cy="${esc(py)}" r="${esc(rr)}" fill="${color}" />`
            : `<rect x="${esc(px - rr)}" y="${esc(py - rr)}" width="${esc(rr * 2)}" height="${esc(rr * 2)}" fill="${color}" />`
        )
      } else {
        const x0 = cx + Math.cos(a0) * r
        const y0 = cy + Math.sin(a0) * r
        const x1 = cx + Math.cos(a1) * r
        const y1 = cy + Math.sin(a1) * r
        parts.push(
          `<path d="M ${pt(x0, y0)} A ${esc(r)} ${esc(r)} 0 0 1 ${pt(x1, y1)}" fill="none" stroke="${color}" stroke-width="${esc(2.2 + (1 - t) * 1.2, 2)}" stroke-linecap="round" />`
        )
      }
    }
  }
  return parts.join('\n')
}

function renderOrbits(ctx: Ctx): string {
  const { w, h, rand } = ctx
  const parts: string[] = []
  const cx = w * 0.5
  const cy = h * 0.52
  const orbits = 5 + Math.floor(rand() * 2)

  for (let i = 0; i < orbits; i++) {
    const rx = w * (0.14 + i * 0.075)
    const ry = h * (0.11 + i * 0.06)
    const rot = (rand() - 0.5) * 24
    const cobalt = i === orbits - 2
    const color = cobalt ? COBALT : INK
    const dash = cobalt ? '0' : `${10 + rand() * 10} ${7 + rand() * 8}`
    parts.push(
      `<ellipse cx="${esc(cx)}" cy="${esc(cy)}" rx="${esc(rx)}" ry="${esc(ry)}" fill="none" stroke="${color}" stroke-width="${esc(cobalt ? 3.4 : 2.2, 2)}" stroke-dasharray="${dash}" transform="rotate(${esc(rot, 1)} ${esc(cx)} ${esc(cy)})" />`
    )
    const ang = rand() * Math.PI * 2
    const rad = (rot * Math.PI) / 180
    const px = Math.cos(ang) * rx
    const py = Math.sin(ang) * ry
    const rxp = cx + px * Math.cos(rad) - py * Math.sin(rad)
    const ryp = cy + px * Math.sin(rad) + py * Math.cos(rad)
    parts.push(
      `<circle cx="${esc(rxp)}" cy="${esc(ryp)}" r="${esc(5 + (cobalt ? 4 : rand() * 4))}" fill="${color}" />`
    )
  }

  // Crescent primary body
  const R = Math.min(w, h) * 0.085
  parts.push(`<circle cx="${esc(cx)}" cy="${esc(cy)}" r="${esc(R)}" fill="${INK}" />`)
  parts.push(
    `<circle cx="${esc(cx + R * 0.42)}" cy="${esc(cy - R * 0.12)}" r="${esc(R * 0.92)}" fill="${CREAM}" />`
  )
  return parts.join('\n')
}

function profileOutline(x: number, y: number, s: number, facing: 1 | -1): string {
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

function renderDualMinds(ctx: Ctx): string {
  const { w, h, rand } = ctx
  const parts: string[] = []
  const cy = h * 0.5
  const s = Math.min(w, h) * 0.22
  const gap = s * 0.55
  const leftX = w * 0.5 - gap - s * 0.35
  const rightX = w * 0.5 + gap + s * 0.35

  parts.push(
    `<path d="${profileOutline(leftX, cy, s, 1)}" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round" />`
  )
  parts.push(
    `<path d="${profileOutline(rightX, cy, s, -1)}" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round" />`
  )

  // Organic fill (left)
  const bx = leftX + s * 0.05
  const by = cy - s * 0.15
  parts.push(`<ellipse cx="${esc(bx)}" cy="${esc(by)}" rx="${esc(s * 0.38)}" ry="${esc(s * 0.42)}" fill="${INK}" />`)

  // Circuit fill (right) in cobalt
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
    lines.push(
      `<path d="M ${pt(xx, ry - cry * 0.55)} L ${pt(xx, ry)} L ${pt(xx + (rand() > 0.5 ? 12 : -12), ry)} L ${pt(xx + (rand() > 0.5 ? 12 : -12), ry + cry * 0.55)}" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" />`
    )
  }
  parts.push(
    `<clipPath id="circClip"><ellipse cx="${esc(rx)}" cy="${esc(ry)}" rx="${esc(crx)}" ry="${esc(cry)}" /></clipPath>`
  )
  parts.push(`<g clip-path="url(#circClip)">${lines.join('')}</g>`)

  // Pixel bridge
  const n = 6
  const bw = 10
  const startX = w * 0.5 - (n * bw + (n - 1) * 4) / 2
  for (let i = 0; i < n; i++) {
    parts.push(
      `<rect x="${esc(startX + i * (bw + 4))}" y="${esc(cy - s * 0.85)}" width="${bw}" height="${bw}" fill="${i % 2 === 0 ? INK : COBALT}" />`
    )
  }
  return parts.join('\n')
}

function renderBalance(ctx: Ctx): string {
  const { w, h, rand } = ctx
  const parts: string[] = []
  const cx = w * 0.5
  const cy = h * 0.42
  const arm = w * 0.28

  // Fulcrum
  parts.push(
    `<path d="M ${pt(cx, cy)} L ${pt(cx - 28, h * 0.78)} L ${pt(cx + 28, h * 0.78)} Z" fill="${INK}" />`
  )
  parts.push(
    `<line x1="${esc(cx)}" y1="${esc(cy)}" x2="${esc(cx)}" y2="${esc(h * 0.78)}" stroke="${INK}" stroke-width="4" />`
  )

  // Beam tipped toward one side (midpoint surprise)
  const tip = -12 - rand() * 8
  const lx = cx - arm
  const rx = cx + arm
  const ly = cy + tip
  const ry = cy - tip
  parts.push(
    `<line x1="${esc(lx)}" y1="${esc(ly)}" x2="${esc(rx)}" y2="${esc(ry)}" stroke="${INK}" stroke-width="5" stroke-linecap="round" />`
  )

  // Pans — cobalt on the “surprising” lighter side
  const panR = 42
  parts.push(
    `<path d="M ${esc(lx - panR)} ${esc(ly + 8)} Q ${esc(lx)} ${esc(ly + 38)} ${esc(lx + panR)} ${esc(ly + 8)}" fill="none" stroke="${INK}" stroke-width="3.5" />`
  )
  parts.push(
    `<path d="M ${esc(rx - panR)} ${esc(ry + 8)} Q ${esc(rx)} ${esc(ry + 38)} ${esc(rx + panR)} ${esc(ry + 8)}" fill="none" stroke="${COBALT}" stroke-width="4" />`
  )
  // Weights: many ink dots left, one cobalt right
  for (let i = 0; i < 5; i++) {
    parts.push(
      `<circle cx="${esc(lx - 16 + i * 8)}" cy="${esc(ly + 18)}" r="6" fill="${INK}" />`
    )
  }
  parts.push(`<circle cx="${esc(rx)}" cy="${esc(ry + 18)}" r="10" fill="${COBALT}" />`)

  return parts.join('\n')
}

function renderShatter(ctx: Ctx): string {
  const { w, h, rand } = ctx
  const parts: string[] = []
  const cx = w * 0.5
  const rows = 5
  const baseY = h * 0.16
  const rowH = h * 0.14

  // Cobalt disruptor wave
  const wave: string[] = [`M ${pt(cx, baseY - 16)}`]
  for (let i = 0; i <= 20; i++) {
    const t = i / 20
    const y = baseY - 16 + t * (h * 0.72)
    const x = cx + Math.sin(t * Math.PI * 2.8) * (14 + t * 26)
    wave.push(`L ${pt(x, y)}`)
  }
  parts.push(
    `<path d="${wave.join(' ')}" fill="none" stroke="${COBALT}" stroke-width="11" stroke-linecap="round" />`
  )

  for (let row = 0; row < rows; row++) {
    const shatter = row / (rows - 1)
    const y = baseY + row * rowH
    const blocks = 8 + Math.floor(rand() * 3)
    const totalW = w * (0.3 + (1 - shatter) * 0.06)
    let x = cx - totalW / 2
    for (let b = 0; b < blocks; b++) {
      const bw = totalW / blocks
      const bh = 26 + rand() * 16 - shatter * 6
      const rot = (rand() - 0.5) * shatter * 48
      const dx = (rand() - 0.5) * shatter * 80
      const dy = shatter * shatter * (16 + rand() * 40)
      const cobalt = shatter > 0.5 && rand() > 0.6
      parts.push(
        `<rect x="${esc(x + dx)}" y="${esc(y + dy)}" width="${esc(Math.max(6, bw - 5))}" height="${esc(bh)}" fill="${cobalt ? COBALT : INK}" transform="rotate(${esc(rot, 1)} ${esc(x + bw / 2)} ${esc(y + bh / 2)})" />`
      )
      x += bw
    }
  }
  return parts.join('\n')
}

function renderGridAnomaly(ctx: Ctx): string {
  const { w, h, rand } = ctx
  const parts: string[] = []
  const marginX = w * 0.12
  const marginY = h * 0.14
  const cols = 12
  const rows = 7
  const gw = (w - marginX * 2) / cols
  const gh = (h - marginY * 2) / rows

  parts.push(
    `<rect x="${esc(marginX)}" y="${esc(marginY)}" width="${esc(w - marginX * 2)}" height="${esc(h - marginY * 2)}" fill="none" stroke="${INK}" stroke-width="2.5" />`
  )
  for (let c = 1; c < cols; c++) {
    const x = marginX + c * gw
    parts.push(
      `<line x1="${esc(x)}" y1="${esc(marginY)}" x2="${esc(x)}" y2="${esc(h - marginY)}" stroke="${INK}" stroke-width="1.2" opacity="0.5" />`
    )
  }
  for (let r = 1; r < rows; r++) {
    const y = marginY + r * gh
    parts.push(
      `<line x1="${esc(marginX)}" y1="${esc(y)}" x2="${esc(w - marginX)}" y2="${esc(y)}" stroke="${INK}" stroke-width="1.2" opacity="0.5" />`
    )
  }

  // A few filled cells
  for (let i = 0; i < 8; i++) {
    const c = Math.floor(rand() * cols)
    const r = Math.floor(rand() * rows)
    parts.push(
      `<rect x="${esc(marginX + c * gw + 3)}" y="${esc(marginY + r * gh + 3)}" width="${esc(gw - 6)}" height="${esc(gh - 6)}" fill="${INK}" opacity="0.85" />`
    )
  }

  // Cobalt anomaly path
  let cx = Math.floor(cols * 0.3)
  let cy = 0
  const pathPts: Array<[number, number]> = []
  while (cy < rows) {
    pathPts.push([marginX + (cx + 0.5) * gw, marginY + (cy + 0.5) * gh])
    if (rand() > 0.4) cx = Math.max(0, Math.min(cols - 1, cx + (rand() > 0.45 ? 1 : -1)))
    cy += 1
  }
  const d = pathPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${pt(p[0], p[1])}`).join(' ')
  parts.push(
    `<path d="${d}" fill="none" stroke="${COBALT}" stroke-width="7" stroke-linecap="square" stroke-linejoin="miter" />`
  )
  return parts.join('\n')
}

function renderFlowThread(ctx: Ctx): string {
  const { w, h, rand } = ctx
  const parts: string[] = []
  const streams = 10
  const cobaltIndex = Math.floor(streams * 0.62)

  for (let i = 0; i < streams; i++) {
    const y0 = h * (0.14 + (i / (streams - 1)) * 0.72)
    const pts: Array<[number, number]> = []
    let x = w * 0.04
    let y = y0
    while (x < w * 0.96) {
      pts.push([x, y])
      y += Math.sin(x * 0.008 + i * 0.7) * 14 + (rand() - 0.5) * 6
      y = Math.max(h * 0.08, Math.min(h * 0.92, y))
      x += 36
    }
    const cobalt = i === cobaltIndex
    if (cobalt) {
      parts.push(roadStroke(cubicThrough(pts), COBALT, 16))
    } else {
      parts.push(
        `<path d="${cubicThrough(pts)}" fill="none" stroke="${INK}" stroke-width="${esc(2.5 + (i % 3), 1)}" stroke-linecap="round" opacity="${esc(0.55 + (i % 4) * 0.1, 2)}" />`
      )
    }
  }
  return parts.join('\n')
}

const RENDERERS: Record<MotifFamily, (ctx: Ctx) => string> = {
  'tangled-paths': renderTangledPaths,
  ripples: renderRipples,
  orbits: renderOrbits,
  'dual-minds': renderDualMinds,
  balance: renderBalance,
  shatter: renderShatter,
  'grid-anomaly': renderGridAnomaly,
  'flow-thread': renderFlowThread
}

function buildSvg(opts: {
  w: number
  h: number
  brief: HeroBrief
  topic: string
  seed: number
}): string {
  const rand = mulberry32(opts.seed)
  const ctx: Ctx = {
    w: opts.w,
    h: opts.h,
    rand,
    brief: opts.brief,
    topic: opts.topic
  }
  const body = RENDERERS[opts.brief.motif](ctx)
  const grain = paperGrain(mulberry32(opts.seed ^ 0xc2b2ae35), opts.w, opts.h, 140)

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
 * Generate an Elevate-styled conceptual hero from topic + optional LLM brief.
 */
export async function generateElevateHero(input: ElevateHeroInput): Promise<ElevateHeroResult> {
  const topic = String(input.topic || input.title || '').trim() || 'Untitled'
  const slug = String(input.slug || '').trim() || 'draft'
  const seed = hashToSeed(topic, slug, input.seed)
  const width = Math.max(800, Math.min(2400, Math.round(input.width || 1600)))
  const height = Math.round((width * 9) / 16)
  const brief = resolveHeroBrief({ ...input, topic, slug }, seed)
  const svg = buildSvg({ w: width, h: height, brief, topic, seed })
  const alt = briefAlt(brief, topic)
  const format = input.format || 'auto'

  if (format !== 'svg') {
    const png = await rasterizePng(svg, width)
    if (png && png.length > 0) {
      return {
        dataUrl: `data:image/png;base64,${png.toString('base64')}`,
        mime: 'image/png',
        bytes: png,
        ext: 'png',
        alt,
        motif: brief.motif,
        brief,
        seed,
        width,
        height,
        svg
      }
    }
  }

  const bytes = Buffer.from(svg, 'utf8')
  return {
    dataUrl: svgToDataUrl(svg),
    mime: 'image/svg+xml',
    bytes,
    ext: 'svg',
    alt,
    motif: brief.motif,
    brief,
    seed,
    width,
    height,
    svg
  }
}

/** Sync SVG-only path (no resvg). Useful for tests. */
export function generateElevateHeroSvg(input: ElevateHeroInput) {
  const topic = String(input.topic || input.title || '').trim() || 'Untitled'
  const slug = String(input.slug || '').trim() || 'draft'
  const seed = hashToSeed(topic, slug, input.seed)
  const width = Math.max(800, Math.min(2400, Math.round(input.width || 1600)))
  const height = Math.round((width * 9) / 16)
  const brief = resolveHeroBrief({ ...input, topic, slug }, seed)
  const svg = buildSvg({ w: width, h: height, brief, topic, seed })
  const bytes = Buffer.from(svg, 'utf8')
  return {
    dataUrl: svgToDataUrl(svg),
    mime: 'image/svg+xml' as const,
    bytes,
    ext: 'svg' as const,
    alt: briefAlt(brief, topic),
    motif: brief.motif,
    brief,
    seed,
    width,
    height,
    svg
  }
}

/** Parse a loose heroBrief object from model JSON. */
export function parseHeroBrief(raw: unknown): Partial<HeroBrief> | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const motif = normalizeMotif(o.motif)
  const metaphor = String(o.metaphor || '').trim()
  const cobaltRole = String(o.cobaltRole || o.cobalt_role || '').trim()
  const focalRaw = o.focal
  if (!metaphor && !motif && !cobaltRole && !focalRaw) return null
  const out: Partial<HeroBrief> = {}
  if (metaphor) out.metaphor = metaphor
  if (motif) out.motif = motif
  if (cobaltRole) out.cobaltRole = cobaltRole
  if (focalRaw) {
    const f = normalizeFocal(focalRaw, motif || 'tangled-paths')
    out.focal = f
  }
  return out
}
