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

const ELEVATE_STYLE =
  'Elevate editorial style: cream paper background, black ink linework, cobalt blue accents, ' +
  'clean magazine illustration, thoughtful and spare, no text overlays, no logos, no watermarks'

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
      `Editorial hero illustration for an essay about “${subject}”. ` +
      `${ELEVATE_STYLE}. Wide contemplative composition, soft cream field, one strong idea.`
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
  figureHints: string[]
): Promise<ImageHit[]> {
  const hits: ImageHit[] = []
  const jobs: Array<{ role: 'hero' | 'figure'; index: number; hint?: string; aspect: string }> = [
    { role: 'hero', index: 0, aspect: '16:9' }
  ]
  for (let i = 0; i < count; i++) {
    jobs.push({
      role: 'figure',
      index: i + 1,
      hint: figureHints[i],
      aspect: i % 2 === 0 ? '4:3' : '3:2'
    })
  }

  // Sequential to stay polite on free-tier quotas
  for (const job of jobs) {
    try {
      const prompt = buildFigurePrompt(topic, job.role, job.index, job.hint)
      const img = await generateGeminiImage({
        apiKey,
        model,
        prompt,
        aspectRatio: job.aspect
      })
      if (!img) continue
      hits.push({
        src: img.dataUrl,
        credit: `Gemini · ${model}`,
        license: 'AI-generated',
        title: job.role === 'hero' ? `${topic} hero` : `${topic} figure ${job.index}`
      })
    } catch (err: any) {
      if (!hits.length) throw err
      break
    }
  }

  return hits
}

async function createGammaImage(apiKey: string, prompt: string, sizePreset: string): Promise<string> {
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

  const deadline = Date.now() + 120_000
  while (Date.now() < deadline) {
    await sleep(5000)
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
  throw new Error('Gamma image generation timed out')
}

async function findGammaImages(
  topic: string,
  count: number,
  apiKey: string,
  figureHints: string[]
): Promise<ImageHit[]> {
  const hits: ImageHit[] = []
  const jobs: Array<{ role: 'hero' | 'figure'; index: number; hint?: string; size: string }> = [
    { role: 'hero', index: 0, size: 'banner' }
  ]
  for (let i = 0; i < count; i++) {
    jobs.push({
      role: 'figure',
      index: i + 1,
      hint: figureHints[i],
      size: 'slide'
    })
  }

  for (const job of jobs) {
    try {
      const prompt = buildFigurePrompt(topic, job.role, job.index, job.hint)
      const url = await createGammaImage(apiKey, prompt, job.size)
      hits.push({
        src: url,
        credit: 'Gamma · AI illustration',
        license: 'AI-generated',
        title: job.role === 'hero' ? `${topic} hero` : `${topic} figure ${job.index}`
      })
    } catch (err: any) {
      if (!hits.length) throw err
      break
    }
  }

  return hits
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
  if (!current || /^https?:\/\//i.test(current) || current.startsWith('data:image/')) {
    post.hero = heroHit.src
  }
  if (!post.heroAlt) {
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

/**
 * Resolve images for a draft. Gemini/Gamma fall back to Commons on failure
 * and surface a warning string for the UI status line.
 */
export async function enrichComposeImages(opts: {
  topic: string
  figureCount: number
  figureHints?: string[]
  imageSource?: ComposeImageSource | string
  geminiApiKey?: string
  geminiImageModel?: string
  gammaApiKey?: string
}): Promise<EnrichImagesResult> {
  const source = normalizeImageSource(opts.imageSource)
  const wantFigures = Math.min(4, Math.max(1, opts.figureCount || 2))
  const hints = (opts.figureHints || []).map((h) => String(h || '').trim()).filter(Boolean)

  if (source === 'gemini') {
    const key = String(opts.geminiApiKey || '').trim()
    if (!key) {
      const images = await findTopicImages(opts.topic, wantFigures + 1)
      return {
        images,
        sourceUsed: 'commons',
        warning: 'GEMINI_API_KEY missing — used Commons / Openverse instead.'
      }
    }
    try {
      const model = String(opts.geminiImageModel || DEFAULT_GEMINI_IMAGE_MODEL).trim() || DEFAULT_GEMINI_IMAGE_MODEL
      const images = await findGeminiImages(opts.topic, wantFigures, key, model, hints)
      if (!images.length) throw new Error('Gemini returned no images')
      return { images, sourceUsed: 'gemini' }
    } catch (err: any) {
      const images = await findTopicImages(opts.topic, wantFigures + 1)
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
      const images = await findTopicImages(opts.topic, wantFigures + 1)
      return {
        images,
        sourceUsed: 'commons',
        warning: 'GAMMA_API_KEY missing — used Commons / Openverse instead.'
      }
    }
    try {
      const images = await findGammaImages(opts.topic, wantFigures, key, hints)
      if (!images.length) throw new Error('Gamma returned no images')
      return { images, sourceUsed: 'gamma' }
    } catch (err: any) {
      const images = await findTopicImages(opts.topic, wantFigures + 1)
      return {
        images,
        sourceUsed: 'commons',
        warning: `Gamma images failed (${err?.message || 'error'}) — used Commons / Openverse.`
      }
    }
  }

  const images = await findTopicImages(opts.topic, wantFigures + 1)
  return { images, sourceUsed: 'commons' }
}

export { DEFAULT_GEMINI_IMAGE_MODEL }
