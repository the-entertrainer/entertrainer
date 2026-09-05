/**
 * Download remote (or decode data:) images on a composed post and rewrite
 * paths to /blog/<slug>/… for GitHub commit alongside composed-posts.json.
 */

import type { ComposedPost } from '~/types/composed'

const MAX_BYTES = 8 * 1024 * 1024
const UA = 'EntertrainerComposeBot/1.0 (https://entertrainer.in; elevate-composer)'

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
}

export type LocalizedImageFile = {
  /** Repo-relative path, e.g. public/blog/slug/hero.jpg */
  path: string
  /** Raw file bytes */
  bytes: Buffer
  /** Site path written into the post, e.g. /blog/slug/hero.jpg */
  sitePath: string
}

export type LocalizeResult = {
  post: ComposedPost
  files: LocalizedImageFile[]
  skipped: string[]
  warnings: string[]
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim())
}

function isDataUrl(value: string): boolean {
  return /^data:image\//i.test(value.trim())
}

function isAlreadyLocalBlog(value: string, slug: string): boolean {
  const v = value.trim()
  return v.startsWith(`/blog/${slug}/`) || v.startsWith(`blog/${slug}/`)
}

function extFromMime(mime: string, fallback = 'jpg'): string {
  const key = mime.split(';')[0].trim().toLowerCase()
  return ALLOWED_MIME[key] || fallback
}

function extFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname
    const m = pathname.match(/\.(jpe?g|png|webp|gif)$/i)
    if (!m) return null
    const e = m[1].toLowerCase()
    return e === 'jpeg' ? 'jpg' : e
  } catch {
    return null
  }
}

function sniffExt(buf: Buffer): string | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg'
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return 'png'
  }
  if (
    buf.length >= 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'webp'
  }
  if (buf.length >= 6 && (buf.toString('ascii', 0, 6) === 'GIF87a' || buf.toString('ascii', 0, 6) === 'GIF89a')) {
    return 'gif'
  }
  return null
}

async function fetchHttpImage(url: string): Promise<{ bytes: Buffer; ext: string } | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 45000)
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'image/*,*/*' },
      redirect: 'follow',
      signal: controller.signal
    })
    if (!res.ok) return null
    const mime = String(res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
    if (mime && !mime.startsWith('image/')) return null
    if (mime && mime.includes('svg')) return null

    const lenHeader = res.headers.get('content-length')
    if (lenHeader && Number(lenHeader) > MAX_BYTES) return null

    const ab = await res.arrayBuffer()
    if (ab.byteLength === 0 || ab.byteLength > MAX_BYTES) return null
    const bytes = Buffer.from(ab)
    const sniffed = sniffExt(bytes)
    const fromMime = mime ? extFromMime(mime, '') : ''
    const fromUrl = extFromUrl(url)
    const ext = sniffed || fromMime || fromUrl
    if (!ext || !['jpg', 'png', 'webp', 'gif'].includes(ext)) return null
    return { bytes, ext }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

function decodeDataUrl(dataUrl: string): { bytes: Buffer; ext: string } | null {
  const m = dataUrl.trim().match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i)
  if (!m) return null
  const mime = m[1].toLowerCase()
  if (mime.includes('svg')) return null
  const ext = extFromMime(mime, '')
  if (!ext) return null
  try {
    const bytes = Buffer.from(m[2], 'base64')
    if (!bytes.length || bytes.length > MAX_BYTES) return null
    return { bytes, ext: sniffExt(bytes) || ext }
  } catch {
    return null
  }
}

type Slot = {
  kind: 'hero' | 'figure'
  index: number
  url: string
}

function collectSlots(post: ComposedPost): Slot[] {
  const slots: Slot[] = []
  const hero = String(post.hero || '').trim()
  if (hero && (isHttpUrl(hero) || isDataUrl(hero)) && !isAlreadyLocalBlog(hero, post.slug)) {
    slots.push({ kind: 'hero', index: 0, url: hero })
  }
  let figureIndex = 0
  for (const block of post.blocks || []) {
    if (block.type !== 'figure') continue
    figureIndex += 1
    const src = String(block.src || '').trim()
    if (!src) continue
    if (isAlreadyLocalBlog(src, post.slug)) continue
    if (!isHttpUrl(src) && !isDataUrl(src)) continue
    slots.push({ kind: 'figure', index: figureIndex, url: src })
  }
  return slots
}

function filenameFor(slot: Slot, ext: string): string {
  if (slot.kind === 'hero') return `hero.${ext}`
  return `figure-${String(slot.index).padStart(2, '0')}.${ext}`
}

/**
 * Download/decode remote images on the post, rewrite hero/figure src to
 * /blog/<slug>/…, and return file buffers ready for GitHub commit.
 * Failed downloads leave the original src untouched.
 */
export async function localizePostImages(post: ComposedPost): Promise<LocalizeResult> {
  const slug = String(post.slug || '').trim()
  const warnings: string[] = []
  const skipped: string[] = []
  const files: LocalizedImageFile[] = []

  if (!slug) {
    return { post, files, skipped, warnings: ['Missing slug — skipped image localization'] }
  }

  const next: ComposedPost = {
    ...post,
    blocks: (post.blocks || []).map((b) => ({ ...b }))
  }

  const slots = collectSlots(next)
  if (!slots.length) {
    return { post: next, files, skipped, warnings }
  }

  // Parallel downloads with a modest concurrency limit
  const results = await Promise.all(
    slots.map(async (slot) => {
      const loaded = isDataUrl(slot.url)
        ? decodeDataUrl(slot.url)
        : await fetchHttpImage(slot.url)
      return { slot, loaded }
    })
  )

  for (const { slot, loaded } of results) {
    if (!loaded) {
      skipped.push(slot.url.slice(0, 120))
      warnings.push(
        slot.kind === 'hero'
          ? 'Hero image download failed — left remote URL as-is'
          : `Figure ${String(slot.index).padStart(2, '0')} download failed — left remote URL as-is`
      )
      continue
    }
    const name = filenameFor(slot, loaded.ext)
    const repoPath = `public/blog/${slug}/${name}`
    const sitePath = `/blog/${slug}/${name}`
    files.push({ path: repoPath, bytes: loaded.bytes, sitePath })

    if (slot.kind === 'hero') {
      next.hero = sitePath
    } else {
      let fi = 0
      for (const block of next.blocks) {
        if (block.type !== 'figure') continue
        fi += 1
        if (fi === slot.index) {
          block.src = sitePath
          break
        }
      }
    }
  }

  return { post: next, files, skipped, warnings }
}
