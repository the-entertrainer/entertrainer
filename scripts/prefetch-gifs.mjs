#!/usr/bin/env node
// Prefetch About-page GIFs at build/author time.
//
// Downloads GIFs into public/about/gifs/ and writes a static manifest.json.
// The site serves these from its own domain — no per-visit Giphy API calls.
//
// Usage:
//   GIPHY_API_KEY=xxxx node scripts/prefetch-gifs.mjs        ← download
//   GIPHY_DRY_RUN=1 GIPHY_API_KEY=xxxx npm run gifs          ← preview candidates only
//
// Workflow for curation:
//   1. Run with GIPHY_DRY_RUN=1 to see landscape candidates with IDs
//   2. Copy winning IDs into the pinId field of the PLAN entry
//   3. Re-run without GIPHY_DRY_RUN to download the pinned GIFs deterministically

import { mkdir, writeFile, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = resolve(__dirname, '..')
const OUT_DIR   = resolve(ROOT, 'public/about/gifs')

const KEY      = process.env.GIPHY_API_KEY || ''
const DRY_RUN  = process.env.GIPHY_DRY_RUN === '1'
const RATING   = 'pg-13'
const LIMIT    = 24

// GIF scenes in the 25-scene About narrative.
// Scene 20 (montage) reuses GIFs from the scenes listed in montageSceneIds.
// Each entry can carry an optional pinId for deterministic, curated downloads.
const PLAN = [
  {
    scene: 2, count: 2,
    keywords: ['hotel corridor animated', 'hotel hallway cinematographic', 'hotel housekeeping maid animated', 'hotel room service animated'],
    minAspect: 1.5,
    // pinId: '',
  },
  {
    scene: 3, count: 2,
    keywords: ['towel animal art hotel', 'towel origami bathroom', 'hotel towel art folding', 'origami towel swan'],
    minAspect: 1.25,
    // pinId: '',
  },
  {
    scene: 4, count: 1,
    keywords: ['thinking brain animated', 'detective thinking conspiracy board', 'scientist research animated thinking'],
    minAspect: 1.4,
    // pinId: '',
  },
  {
    scene: 6, count: 2,
    keywords: ['comic book pages animation', 'sketch drawing art animated', 'ink illustration drawing animated', 'comic panel flip'],
    minAspect: 1.3,
    // pinId: '',
  },
  {
    scene: 7, count: 1,
    keywords: ['neuron firing brain animation', 'brain neural network visualization', 'neuroscience brain scan animated'],
    minAspect: 1.4,
    // pinId: '',
  },
  {
    scene: 8, count: 1,
    keywords: ['climbing upward growth animation', 'raise hand achievement animated', 'growth ambition progress animated'],
    minAspect: 1.4,
    // pinId: '',
  },
  {
    scene: 9, count: 1,
    keywords: ['team collaboration whiteboard animated', 'brainstorming group animated', 'mentoring discussion meeting animated'],
    minAspect: 1.4,
    // pinId: '',
  },
  {
    scene: 14, count: 2,
    keywords: ['film director clapperboard animated', 'movie production cinema animated', 'behind scenes filming animated'],
    minAspect: 1.5,
    // pinId: '',
  },
]

// Rendition preference: pinned IDs get 'original'; search results use 'downsized_large'.
function pickRendition(images, preferOriginal = false) {
  const order = preferOriginal
    ? ['original', 'downsized_large', 'downsized_medium', 'fixed_width']
    : ['downsized_large', 'original', 'downsized_medium', 'fixed_width']
  for (const k of order) {
    const r = images?.[k]
    if (r?.url) return { url: r.url, width: +r.width || 0, height: +r.height || 0 }
  }
  return null
}

async function search(keyword) {
  const url = `https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(KEY)}`
    + `&q=${encodeURIComponent(keyword)}&limit=${LIMIT}&rating=${RATING}&lang=en`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Giphy ${res.status} for "${keyword}"`)
  const json = await res.json()
  return json?.data ?? []
}

async function fetchById(id) {
  const url = `https://api.giphy.com/v1/gifs/${encodeURIComponent(id)}?api_key=${encodeURIComponent(KEY)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Giphy ${res.status} for id "${id}"`)
  const json = await res.json()
  return json?.data ? [json.data] : []
}

function pickBest(results, minAspect = 1.0, preferOriginal = false) {
  const withRenditions = results
    .map(g => {
      const r = pickRendition(g.images, preferOriginal)
      return r ? { g, r } : null
    })
    .filter(Boolean)

  if (withRenditions.length === 0) return null

  const landscape = withRenditions.filter(({ r }) => r.width > 0 && r.height > 0 && r.width / r.height >= minAspect)
  const pool = landscape.length > 0 ? landscape : withRenditions

  pool.sort((a, b) => (b.r.width / b.r.height) - (a.r.width / a.r.height))
  return pool[0]
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

  if (DRY_RUN) {
    console.log('── DRY RUN — no files will be written ──────────────────────────────\n')
  } else {
    await mkdir(OUT_DIR, { recursive: true })
    // Remove old GIFs before downloading fresh set
    const { readdir } = await import('node:fs/promises')
    try {
      const existing = await readdir(OUT_DIR)
      for (const f of existing) {
        if (f.endsWith('.gif')) await rm(resolve(OUT_DIR, f))
      }
    } catch {}
  }

  const manifest = {}
  let total = 0

  for (const entry of PLAN) {
    console.log(`\nScene ${entry.scene} (need ${entry.count}):`)

    let allResults = []
    if (entry.pinId) {
      console.log(`  pinId: ${entry.pinId}`)
      try { allResults = await fetchById(entry.pinId) } catch (e) { console.warn('  !', e.message) }
    } else {
      for (const kw of entry.keywords) {
        let results = []
        try { results = await search(kw) } catch (e) { console.warn('  !', e.message); continue }
        allResults.push(...results)
        console.log(`  searched "${kw}" → ${results.length} results`)
      }
    }

    const seen = new Set()
    const unique = allResults.filter(g => g?.id && !seen.has(g.id) && seen.add(g.id))
    const preferOriginal = !!entry.pinId

    if (DRY_RUN) {
      const candidates = unique
        .map(g => {
          const r = pickRendition(g.images, preferOriginal)
          if (!r || r.width === 0 || r.height === 0) return null
          return { id: g.id, title: g.title || '(no title)', ar: r.width / r.height, w: r.width, h: r.height }
        })
        .filter(Boolean)
        .sort((a, b) => b.ar - a.ar)

      const landscapeCount = candidates.filter(c => c.ar >= entry.minAspect).length
      console.log(`  landscape (≥${entry.minAspect}) candidates: ${landscapeCount} / ${candidates.length} total`)
      candidates.slice(0, 8).forEach(c => {
        const flag = c.ar >= entry.minAspect ? '✓' : ' '
        console.log(`  ${flag} [${c.w}×${c.h} AR:${c.ar.toFixed(2)}]  ${c.id}  "${c.title.slice(0, 60)}"`)
      })
      if (landscapeCount === 0 && candidates.length > 0) {
        console.log('  ⚠ no landscape results — would fall back to best available')
      }
      continue
    }

    manifest[entry.scene] = []
    const picked = []

    for (let n = 0; n < entry.count; n++) {
      const remaining = unique.filter(g => !picked.find(p => p.id === g.id))
      const best = pickBest(remaining, entry.minAspect ?? 1.0, preferOriginal)
      if (!best) { console.warn(`  ! scene ${entry.scene}[${n}] no usable GIF found`); continue }
      picked.push({ id: best.g.id, title: best.g.title || '(unknown)', ...best.r })
    }

    for (let i = 0; i < picked.length; i++) {
      const p = picked[i]
      const file = `/about/gifs/s${entry.scene}-${i}.gif`
      const dest = resolve(ROOT, 'public' + file)
      try {
        const bytes = await download(p.url, dest)
        total += bytes
        const ar = (p.width / p.height).toFixed(2)
        manifest[entry.scene].push({ id: p.id, url: file, width: p.width, height: p.height, title: p.title })
        console.log(`  ✓ [${p.width}×${p.height} AR:${ar}] ${(bytes / 1024 | 0)}KB  "${p.title}"`)
      } catch (e) {
        console.warn(`  ! scene ${entry.scene}[${i}] ${e.message}`)
      }
    }
  }

  if (DRY_RUN) {
    console.log('\n── End of dry run. Paste winning IDs as pinId in PLAN to lock selections. ──')
    return
  }

  const manifestPath = resolve(OUT_DIR, 'manifest.json')
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2))
  console.log(`\n✓ Wrote ${manifestPath}`)
  console.log(`✓ Total downloaded: ${(total / 1024 / 1024).toFixed(1)}MB`)
}

main().catch(e => { console.error(e); process.exit(1) })
