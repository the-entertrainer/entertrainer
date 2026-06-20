#!/usr/bin/env node
// Prefetch About-page GIFs at build/author time.
//
// Resolves each scene's keywords against the Giphy API ONCE, downloads the
// chosen large renditions into public/about/gifs/, and writes a static
// manifest.json. The site then serves these from its own domain — no per-visit
// Giphy calls, instant display, full CDN caching.
//
// Usage:  GIPHY_API_KEY=xxxx node scripts/prefetch-gifs.mjs
// Keep the plan below in sync with experience/about/narrative.ts gif keywords.

import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT_DIR = resolve(ROOT, 'public/about/gifs')

const KEY = process.env.GIPHY_API_KEY || ''
const RATING = 'pg-13'

// Wide / cinematic where possible — bias the search to landscape-friendly terms.
const PLAN = [
  { scene: 1, keywords: ['towel animal hotel', 'towel swan', 'towel monkey'], count: 1 },
  { scene: 2, keywords: ['human mind', 'thinking brain', 'curiosity'], count: 1 },
  { scene: 3, keywords: ['comic book pages', 'storytelling'], count: 2 },
  { scene: 5, keywords: ['brilliant idea', 'teamwork meeting'], count: 1 },
  { scene: 6, keywords: ['clarity focus', 'organized clean'], count: 1 },
  { scene: 7, keywords: ['movie director', 'film clapperboard'], count: 2 },
]

function pickRendition(images) {
  const order = ['downsized_large', 'original', 'downsized_medium', 'fixed_width']
  for (const k of order) {
    const r = images?.[k]
    if (r?.url) return { url: r.url, width: +r.width || 0, height: +r.height || 0 }
  }
  return null
}

async function search(keyword, limit) {
  const url = `https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(KEY)}`
    + `&q=${encodeURIComponent(keyword)}&limit=${limit}&rating=${RATING}&lang=en`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Giphy ${res.status} for "${keyword}"`)
  const json = await res.json()
  return json?.data ?? []
}

async function download(url, dest) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download ${res.status} ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(dest, buf)
  return buf.length
}

async function main() {
  if (!KEY) {
    console.error('✗ GIPHY_API_KEY not set — skipping prefetch (existing manifest kept).')
    process.exit(0)
  }
  await mkdir(OUT_DIR, { recursive: true })

  const manifest = {}
  let total = 0

  for (const entry of PLAN) {
    const picked = []
    const seen = new Set()
    for (const kw of entry.keywords) {
      if (picked.length >= entry.count) break
      let results = []
      try { results = await search(kw, 8) } catch (e) { console.warn('  !', e.message); continue }
      for (const g of results) {
        if (picked.length >= entry.count) break
        if (!g?.id || seen.has(g.id)) continue
        const r = pickRendition(g.images)
        if (!r) continue
        seen.add(g.id)
        picked.push({ id: g.id, title: g.title || kw, ...r })
      }
    }

    manifest[entry.scene] = []
    for (let i = 0; i < picked.length; i++) {
      const p = picked[i]
      const file = `/about/gifs/s${entry.scene}-${i}.gif`
      const dest = resolve(ROOT, 'public' + file)
      try {
        const bytes = await download(p.url, dest)
        total += bytes
        manifest[entry.scene].push({ id: p.id, url: file, width: p.width, height: p.height, title: p.title })
        console.log(`  ✓ scene ${entry.scene}[${i}] ${(bytes / 1024 | 0)}KB  ${p.title}`)
      } catch (e) {
        console.warn(`  ! scene ${entry.scene}[${i}] ${e.message}`)
      }
    }
  }

  const manifestPath = resolve(OUT_DIR, 'manifest.json')
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2))
  console.log(`\n✓ Wrote ${manifestPath}`)
  console.log(`✓ Total downloaded: ${(total / 1024 / 1024).toFixed(1)}MB`)
}

main().catch(e => { console.error(e); process.exit(1) })
