/**
 * Enrich figure blocks (and optional hero) with images from:
 * - Commons / Openverse (default free sourced)
 * - Gemini image models (GEMINI_API_KEY)
 * - Gamma standalone images API (GAMMA_API_KEY)
 */

export type ComposeImageSource = 'commons' | 'gemini' | 'gamma'

export interface ImageHit {
  src: string
  credit: string
  license: string
  title?: string
}

export type EnrichImagesResult = {
  images: ImageHit[]
  sourceUsed: ComposeImageSource
  warning?: string
}

const UA = 'EntertrainerComposeBot/1.0 (https://entertrainer.in; elevate-composer)'
const GAMMA_BASE = 'https://public-api.gamma.app/v1.0'
const DEFAULT_GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image'

/** Vercel gateway is ~60s; keep AI image phase well under after text completes. */
export const IMAGE_PHASE_BUDGET_MS = 22_000
export const GAMMA_POLL_MS = 2_000
export const GAMMA_PER_IMAGE_DEADLINE_MS = 22_000
export const GEMINI_PER_IMAGE_DEADLINE_MS = 20_000
/** Prefer fewer AI images under time pressure: 1 hero + 1 figure. */
export const MAX_AI_IMAGES = 2

const ELEVATE_STYLE =
  'Elevate editorial magazine style matching entertrainer.in/elevate covers: cream paper background #F7F1E4, ' +
  'black ink linework #0B0B0C, cobalt blue accents #2F5BD8, flat conceptual illustration, spare thoughtful composition, ' +
  'no text overlays, no logos, no watermarks, no photorealism'

function isLikelyFree(license: string): boolean {
  const l = license.toLowerCase()
  return (
    l.includes('public domain') ||
    l.includes('cc0') ||
    l.includes('pdm') ||
    l.includes('cc-zero') ||
    l === 'pd' ||
    l.includes('no rights reserved') ||
    l.includes('creativecommons.org/publicdomain')
  )
}

function stableCommonsUrl(url: string): string {
  try {
    const u = new URL(url)
    if (u.protocol === 'http:') u.protocol = 'https:'
    return u.toString()
  } catch {
    return url
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function remainingMs(deadlineAt: number, floor = 500): number {
  return Math.max(floor, deadlineAt - Date.now())
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (err) => {
        clearTimeout(timer)
        reject(err)
      }
    )
  })
}

function clampAiJobs<T extends { role: 'hero' | 'figure' }>(jobs: T[], maxImages = MAX_AI_IMAGES): T[] {
  const hero = jobs.find((j) => j.role === 'hero')
  const figures = jobs.filter((j) => j.role === 'figure')
  const out: T[] = []
  if (hero) out.push(hero)
  const figureSlots = Math.max(0, maxImages - out.length)
  out.push(...figures.slice(0, figureSlots))
  return out
}

async function searchCommons(query: string, limit = 6): Promise<ImageHit[]> {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: query,
    gsrnamespace: '6',
    gsrlimit: String(limit),
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|mime|size',
    iiurlwidth: '1600',
    format: 'json',
    origin: '*'
  })

  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' }
  })
  if (!res.ok) return []

  const data = (await res.json()) as any
  const pages = data?.query?.pages
  if (!pages) return []

  const hits: ImageHit[] = []
  for (const page of Object.values(pages) as any[]) {
    const info = page?.imageinfo?.[0]
    if (!info) continue
    const mime = String(info.mime || '')
    if (!mime.startsWith('image/') || mime.includes('svg')) continue

    const meta = info.extmetadata || {}
    const license = String(
      meta.LicenseShortName?.value || meta.License?.value || meta.UsageTerms?.value || ''
    )
    const freeEnough =
      isLikelyFree(license) ||
      /cc[- ]?by/i.test(license) ||
      /creative commons/i.test(license) ||
      !license

    if (!freeEnough) continue

    const src = stableCommonsUrl(String(info.thumburl || info.url || ''))
    if (!src) continue

    const artist = String(meta.Artist?.value || '')
      .replace(/<[^>]+>/g, '')
      .trim()
    const creditParts = [artist || 'Wikimedia Commons', license || 'see source'].filter(Boolean)

    hits.push({
      src,
      credit: creditParts.join(' · '),
      license: license || 'Unknown',
      title: String(page.title || '').replace(/^File:/, '')
    })
  }
  return hits
}

async function searchOpenverse(query: string, limit = 4): Promise<ImageHit[]> {
  const params = new URLSearchParams({
    q: query,
    license: 'cc0,pdm',
    page_size: String(limit)
  })
  try {
    const res = await fetch(`https://api.openverse.org/v1/images/?${params}`, {
      headers: { 'User-Agent': UA, Accept: 'application/json' }
    })
    if (!res.ok) return []
    const data = (await res.json()) as any
    const results = Array.isArray(data?.results) ? data.results : []
    return results
      .filter((r: any) => r?.url && String(r.url).startsWith('https://'))
      .map((r: any) => ({
        src: String(r.url),
        credit: [r.creator || r.provider || 'Openverse', r.license || 'CC0/PDM'].filter(Boolean).join(' · '),
        license: String(r.license || 'CC0'),
        title: String(r.title || '')
      }))
  } catch {
    return []
  }
}

export async function findTopicImages(topic: string, count = 4): Promise<ImageHit[]> {
  const cleaned = topic.replace(/[^\w\s-]/g, ' ').trim().slice(0, 80)
  const queries = [cleaned, `${cleaned} science diagram`, `${cleaned} illustration`]

  const collected: ImageHit[] = []
  const seen = new Set<string>()

  for (const q of queries) {
    if (collected.length >= count) break
    try {
      const hits = await searchCommons(q, 8)
      for (const hit of hits) {
        if (seen.has(hit.src)) continue
        seen.add(hit.src)
        collected.push(hit)
        if (collected.length >= count) break
      }
    } catch {
      /* continue */
    }
  }

  if (collected.length < count) {
    try {
      const more = await searchOpenverse(cleaned, count - collected.length)
      for (const hit of more) {
        if (seen.has(hit.src)) continue
        seen.add(hit.src)
        collected.push(hit)
      }
    } catch {
      /* ignore */
    }
  }

  return collected.slice(0, count)
}

function buildFigurePrompt(topic: string, role: 'hero' | 'figure', index: number, hint?: string): string {
  const subject = (hint || topic).replace(/\s+/g, ' ').trim().slice(0, 180)
  if (role === 'hero') {
    return (
      `Wide editorial hero/cover illustration for an Elevate essay about “${subject}”. ` +
      `${ELEVATE_STYLE}. Banner-like 16:9 contemplative cover art on a soft cream #F7F1E4 field, ` +
      `one strong conceptual idea, black + cobalt #2F5BD8 only, matching existing /public/blog/*/hero.jpg language.`
    )
  }
  return (
    `Editorial figure ${index} for an essay about “${topic}”. Focus: ${subject}. ` +
    `${ELEVATE_STYLE}. Conceptual diagram or quiet scene that clarifies the idea.`
  )
}

async function generateGeminiImage(opts: {
  apiKey: string
  model: string
  prompt: string
  aspectRatio?: string
}): Promise<{ dataUrl: string; mime: string } | null> {
  const model = opts.model || DEFAULT_GEMINI_IMAGE_MODEL
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-goog-api-key': opts.apiKey,
      'User-Agent': UA
    },
    method: 'POST',
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: opts.prompt }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: opts.aspectRatio || '16:9'
        }
      }
    })
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Gemini image ${res.status}: ${errText.slice(0, 200) || res.statusText}`)
  }

  const payload = (await res.json()) as any
  const parts = payload?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) return null

  for (const part of parts) {
    const inline = part?.inlineData || part?.inline_data
    if (!inline?.data) continue
    const mime = String(inline.mimeType || inline.mime_type || 'image/png').split(';')[0].trim()
    if (!mime.startsWith('image/') || mime.includes('svg')) continue
    return {
      mime,
      dataUrl: `data:${mime};base64,${inline.data}`
    }
  }
  return null
}

async function findGeminiImages(
  topic: string,
  count: number,
  apiKey: string,
  model: string,
  figureHints: string[],
  budgetMs = IMAGE_PHASE_BUDGET_MS,
  includeHero = true
): Promise<{ hits: ImageHit[]; timedOut: boolean; errors: string[] }> {
  const maxFigures = includeHero ? Math.max(0, MAX_AI_IMAGES - 1) : MAX_AI_IMAGES
  const figureSlots = Math.min(Math.max(0, count), maxFigures)
  const rawJobs = [
    ...(includeHero ? [{ role: 'hero' as const, index: 0, aspect: '16:9' }] : []),
    ...Array.from({ length: figureSlots }, (_, i) => ({
      role: 'figure' as const,
      index: i + 1,
      hint: figureHints[i],
      aspect: i % 2 === 0 ? '4:3' : '3:2'
    }))
  ]
  const jobs = clampAiJobs(rawJobs, MAX_AI_IMAGES)

  const phaseDeadline = Date.now() + budgetMs
  const errors: string[] = []
  let timedOut = false

  const settled = await Promise.allSettled(
    jobs.map(async (job) => {
      const perImage = Math.min(GEMINI_PER_IMAGE_DEADLINE_MS, remainingMs(phaseDeadline))
      if (Date.now() >= phaseDeadline) {
        timedOut = true
        throw new Error('Gemini image phase budget exhausted')
      }
      const prompt = buildFigurePrompt(topic, job.role, job.index, job.hint)
      const img = await withTimeout(
        generateGeminiImage({
          apiKey,
          model,
          prompt,
          aspectRatio: job.aspect
        }),
        perImage,
        `Gemini ${job.role}`
      )
      if (!img) throw new Error(`Gemini returned no image for ${job.role}`)
      return {
        order: job.role === 'hero' ? 0 : job.index,
        hit: {
          src: img.dataUrl,
          credit: `Gemini · ${model}`,
          license: 'AI-generated',
          title: job.role === 'hero' ? `${topic} hero` : `${topic} figure ${job.index}`
        } satisfies ImageHit
      }
    })
  )

  const ordered: Array<{ order: number; hit: ImageHit } | null> = jobs.map(() => null)
  settled.forEach((result, idx) => {
    if (result.status === 'fulfilled') {
      ordered[idx] = result.value
    } else {
      const msg = String(result.reason?.message || result.reason || 'error')
      errors.push(msg)
      if (/timed out|budget exhausted/i.test(msg)) timedOut = true
    }
  })

  const hits = ordered.filter(Boolean).map((row) => row!.hit)
  return { hits, timedOut, errors }
}

async function createGammaImage(
  apiKey: string,
  prompt: string,
  sizePreset: string,
  deadlineMs = GAMMA_PER_IMAGE_DEADLINE_MS
): Promise<string> {
  const createRes = await fetch(`${GAMMA_BASE}/images`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-KEY': apiKey,
      'User-Agent': UA
    },
    body: JSON.stringify({
      prompt,
      type: 'illustration',
      sizePreset
    })
  })

  if (!createRes.ok) {
    const errText = await createRes.text().catch(() => '')
    throw new Error(`Gamma image ${createRes.status}: ${errText.slice(0, 200) || createRes.statusText}`)
  }

  const created = (await createRes.json()) as { imageGenerationId?: string }
  const id = created?.imageGenerationId
  if (!id) throw new Error('Gamma image response missing imageGenerationId')

  const deadline = Date.now() + Math.max(1_000, deadlineMs)
  // First poll quickly; then every ~2s (not 5s / 120s).
  let waited = false
  while (Date.now() < deadline) {
    if (waited) await sleep(GAMMA_POLL_MS)
    else waited = true

    const pollRes = await fetch(`${GAMMA_BASE}/images/${encodeURIComponent(id)}`, {
      headers: {
        Accept: 'application/json',
        'X-API-KEY': apiKey,
        'User-Agent': UA
      }
    })
    if (!pollRes.ok) {
      const errText = await pollRes.text().catch(() => '')
      throw new Error(`Gamma poll ${pollRes.status}: ${errText.slice(0, 200) || pollRes.statusText}`)
    }
    const status = (await pollRes.json()) as {
      status?: string
      image?: { url?: string }
      error?: { message?: string }
    }
    if (status.status === 'completed') {
      const url = String(status.image?.url || '').trim()
      if (!url) throw new Error('Gamma completed without image.url')
      return url
    }
    if (status.status === 'failed') {
      throw new Error(status.error?.message || 'Gamma image generation failed')
    }
  }
  throw new Error(`Gamma image generation timed out after ${deadlineMs}ms`)
}

async function findGammaImages(
  topic: string,
  count: number,
  apiKey: string,
  figureHints: string[],
  budgetMs = IMAGE_PHASE_BUDGET_MS,
  includeHero = true
): Promise<{ hits: ImageHit[]; timedOut: boolean; errors: string[] }> {
  const maxFigures = includeHero ? Math.max(0, MAX_AI_IMAGES - 1) : MAX_AI_IMAGES
  const figureSlots = Math.min(Math.max(0, count), maxFigures)
  const rawJobs = [
    ...(includeHero ? [{ role: 'hero' as const, index: 0, size: 'banner' }] : []),
    ...Array.from({ length: figureSlots }, (_, i) => ({
      role: 'figure' as const,
      index: i + 1,
      hint: figureHints[i],
      size: 'slide'
    }))
  ]
  const jobs = clampAiJobs(rawJobs, MAX_AI_IMAGES)

  const phaseDeadline = Date.now() + budgetMs
  const errors: string[] = []
  let timedOut = false

  const settled = await Promise.allSettled(
    jobs.map(async (job) => {
      const perImage = Math.min(GAMMA_PER_IMAGE_DEADLINE_MS, remainingMs(phaseDeadline))
      if (Date.now() >= phaseDeadline) {
        timedOut = true
        throw new Error('Gamma image phase budget exhausted')
      }
      const prompt = buildFigurePrompt(topic, job.role, job.index, job.hint)
      const url = await createGammaImage(apiKey, prompt, job.size, perImage)
      return {
        order: job.role === 'hero' ? 0 : job.index,
        hit: {
          src: url,
          credit: 'Gamma · AI illustration',
          license: 'AI-generated',
          title: job.role === 'hero' ? `${topic} hero` : `${topic} figure ${job.index}`
        } satisfies ImageHit
      }
    })
  )

  const ordered: Array<{ order: number; hit: ImageHit } | null> = jobs.map(() => null)
  settled.forEach((result, idx) => {
    if (result.status === 'fulfilled') {
      ordered[idx] = result.value
    } else {
      const msg = String(result.reason?.message || result.reason || 'error')
      errors.push(msg)
      if (/timed out|budget exhausted/i.test(msg)) timedOut = true
    }
  })

  const hits = ordered.filter(Boolean).map((row) => row!.hit)
  return { hits, timedOut, errors }
}

export function applyImagesToFigures(
  blocks: Array<{ type: string; src?: string; alt?: string; caption?: string }>,
  images: ImageHit[],
  opts?: { skipHeroSlot?: boolean }
) {
  // When the first hit is reserved for hero, figures consume the rest.
  let i = opts?.skipHeroSlot ? 1 : 0
  for (const block of blocks) {
    if (block.type !== 'figure') continue
    const hit = images[i++]
    if (!hit) {
      if (!block.src) block.src = ''
      if (block.caption && !/credit|license|wikimedia|cc0|public domain|gemini|gamma/i.test(block.caption)) {
        block.caption = `${block.caption} (add image credit when you pick a file)`
      }
      continue
    }
    block.src = hit.src
    const baseCaption = (block.caption || block.alt || hit.title || 'Illustration').trim()
    // Keep existing credit-like captions; otherwise append source credit.
    if (/—|credit|wikimedia|openverse|gemini|gamma/i.test(baseCaption)) {
      block.caption = baseCaption
    } else {
      block.caption = `${baseCaption} — ${hit.credit}`
    }
    if (!block.alt) block.alt = hit.title || baseCaption
  }
}

export function applyHeroFromImages(
  post: { hero?: string; heroAlt?: string },
  images: ImageHit[]
) {
  const heroHit = images[0]
  if (!heroHit) return
  const current = String(post.hero || '').trim()
  // Keep committed site-relative paths; otherwise always set so the editor preview works.
  const isLocalSitePath = current.startsWith('/') && !current.startsWith('//')
  if (!isLocalSitePath) {
    post.hero = heroHit.src
  }
  if (!String(post.heroAlt || '').trim()) {
    post.heroAlt = heroHit.title || 'Editorial hero illustration'
  }
}

export function normalizeImageSource(raw: unknown): ComposeImageSource {
  const v = String(raw || '')
    .trim()
    .toLowerCase()
  if (v === 'gemini' || v === 'gamma' || v === 'commons') return v
  return 'commons'
}

async function fillMissingWithCommons(
  topic: string,
  partial: ImageHit[],
  wantTotal: number
): Promise<ImageHit[]> {
  if (partial.length >= wantTotal) return partial.slice(0, wantTotal)
  const extras = await findTopicImages(topic, wantTotal - partial.length + 1)
  const seen = new Set(partial.map((h) => h.src))
  const merged = [...partial]
  for (const hit of extras) {
    if (seen.has(hit.src)) continue
    seen.add(hit.src)
    merged.push(hit)
    if (merged.length >= wantTotal) break
  }
  return merged
}

function buildAiImageWarning(
  provider: 'Gemini' | 'Gamma',
  timedOut: boolean,
  mixed: boolean,
  errors: string[]
): string | undefined {
  if (timedOut || mixed) {
    return `${provider} images were time-budgeted on Vercel; slow gens fell back to Commons for remaining slots.`
  }
  if (errors.length) {
    return `Some ${provider} images failed (${errors[0]}) — filled gaps from Commons.`
  }
  return undefined
}

/**
 * Resolve images for a draft. Gemini/Gamma are time-budgeted (Vercel ~60s);
 * slow gens fall back to Commons for missing slots and surface imageWarning.
 * Never throws for timeout alone — callers always get images + optional warning.
 */
export async function enrichComposeImages(opts: {
  topic: string
  figureCount: number
  figureHints?: string[]
  imageSource?: ComposeImageSource | string
  geminiApiKey?: string
  geminiImageModel?: string
  gammaApiKey?: string
  /** Overall AI image phase budget after text completes (default ~22s). */
  budgetMs?: number
  /** When false, skip hero slot (procedural Elevate hero owns the cover). Default true. */
  includeHero?: boolean
}): Promise<EnrichImagesResult> {
  const source = normalizeImageSource(opts.imageSource)
  const includeHero = opts.includeHero !== false
  const wantFigures = Math.min(4, Math.max(1, opts.figureCount || 2))
  const wantTotal = wantFigures + (includeHero ? 1 : 0)
  const hints = (opts.figureHints || []).map((h) => String(h || '').trim()).filter(Boolean)
  const budgetMs = Math.max(3_000, opts.budgetMs ?? IMAGE_PHASE_BUDGET_MS)

  if (source === 'gemini') {
    const key = String(opts.geminiApiKey || '').trim()
    if (!key) {
      const images = await findTopicImages(opts.topic, wantTotal)
      return {
        images,
        sourceUsed: 'commons',
        warning: 'GEMINI_API_KEY missing — used Commons / Openverse instead.'
      }
    }
    try {
      const model = String(opts.geminiImageModel || DEFAULT_GEMINI_IMAGE_MODEL).trim() || DEFAULT_GEMINI_IMAGE_MODEL
      const aiFigures = Math.min(wantFigures, includeHero ? MAX_AI_IMAGES - 1 : MAX_AI_IMAGES)
      const result = await withTimeout(
        findGeminiImages(opts.topic, aiFigures, key, model, hints, budgetMs, includeHero),
        budgetMs + 1_500,
        'Gemini image phase'
      )
      if (!result.hits.length) {
        throw new Error(result.errors[0] || 'Gemini returned no images')
      }
      const images = await fillMissingWithCommons(opts.topic, result.hits, wantTotal)
      const mixed = images.length > result.hits.length || result.hits.length < Math.min(wantTotal, MAX_AI_IMAGES)
      return {
        images,
        sourceUsed: 'gemini',
        warning: buildAiImageWarning('Gemini', result.timedOut, mixed, result.errors)
      }
    } catch (err: any) {
      const images = await findTopicImages(opts.topic, wantTotal)
      return {
        images,
        sourceUsed: 'commons',
        warning: `Gemini images failed (${err?.message || 'error'}) — used Commons / Openverse.`
      }
    }
  }

  if (source === 'gamma') {
    const key = String(opts.gammaApiKey || '').trim()
    if (!key) {
      const images = await findTopicImages(opts.topic, wantTotal)
      return {
        images,
        sourceUsed: 'commons',
        warning: 'GAMMA_API_KEY missing — used Commons / Openverse instead.'
      }
    }
    try {
      const aiFigures = Math.min(wantFigures, includeHero ? MAX_AI_IMAGES - 1 : MAX_AI_IMAGES)
      const result = await withTimeout(
        findGammaImages(opts.topic, aiFigures, key, hints, budgetMs, includeHero),
        budgetMs + 1_500,
        'Gamma image phase'
      )
      if (!result.hits.length) {
        throw new Error(result.errors[0] || 'Gamma returned no images')
      }
      const images = await fillMissingWithCommons(opts.topic, result.hits, wantTotal)
      const mixed = images.length > result.hits.length || result.hits.length < Math.min(wantTotal, MAX_AI_IMAGES)
      return {
        images,
        sourceUsed: 'gamma',
        warning: buildAiImageWarning('Gamma', result.timedOut, mixed, result.errors)
      }
    } catch (err: any) {
      const images = await findTopicImages(opts.topic, wantTotal)
      return {
        images,
        sourceUsed: 'commons',
        warning: `Gamma images failed (${err?.message || 'error'}) — used Commons / Openverse.`
      }
    }
  }

  const images = await findTopicImages(opts.topic, wantTotal)
  return { images, sourceUsed: 'commons' }
}

export { DEFAULT_GEMINI_IMAGE_MODEL, createGammaImage }
