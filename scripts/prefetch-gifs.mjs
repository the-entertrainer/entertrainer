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

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = resolve(__dirname, '..')
const OUT_DIR   = resolve(ROOT, 'public/about/gifs')

const KEY      = process.env.GIPHY_API_KEY || ''
const DRY_RUN  = process.env.GIPHY_DRY_RUN === '1'
const RATING   = 'pg-13'
const LIMIT    = 24   // more results = better landscape candidates

// Each entry can optionally carry a pinId — if set, the script fetches that
// specific GIF directly (deterministic, bypasses keyword search).
// minAspect: minimum width/height ratio for the "landscape" filter.
const PLAN = [
  {
    scene: 1, count: 1,
    keywords: ['hotel housekeeping funny', 'towel art hotel', 'maid hotel room service'],
    minAspect: 1.4,
    // pinId: 'SET_AFTER_DRY_RUN',
  },
  {
    scene: 2, count: 1,
    keywords: ['brain animation science', 'neuroscience visualization', 'mind thinking 3d'],
    minAspect: 1.3,
    // pinId: 'SET_AFTER_DRY_RUN',
  },
  {
    scene: 3, count: 2,
    keywords: ['comic book animation pages', 'graphic novel illustration', 'manga animation panels'],
    minAspect: 1.2,
    // pinId: 'SET_AFTER_DRY_RUN',  // only pins the first; use pinIds[] for multiple
  },
  {
    scene: 5, count: 1,
    keywords: ['lightbulb idea animation', 'innovation creativity eureka', 'aha moment animation'],
    minAspect: 1.4,
    // pinId: 'SET_AFTER_DRY_RUN',
  },
  {
    scene: 6, count: 1,
    keywords: ['minimalist design animation clean', 'organized workflow system', 'clarity focus animation'],
    minAspect: 1.4,
    // pinId: 'SET_AFTER_DRY_RUN',
  },
  {
    scene: 7, count: 2,
    keywords: ['film director clapperboard movie', 'behind the scenes filmmaking', 'cinematography camera operator'],
    minAspect: 1.5,
    // pinId: 'SET_AFTER_DRY_RUN',
  },
]

// Rendition preference: pinned IDs get 'original' (we want the best); search
// results use 'downsized_large' (good quality without massive file sizes).
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

// Search and return raw Giphy results.
async function search(keyword) {
  const url = `https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(KEY)}`
    + `&q=${encodeURIComponent(keyword)}&limit=${LIMIT}&rating=${RATING}&lang=en`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Giphy ${res.status} for "${keyword}"`)
  const json = await res.json()
  return json?.data ?? []
}

// Fetch a single GIF by ID (for pinned entries).
async function fetchById(id) {
  const url = `https://api.giphy.com/v1/gifs/${encodeURIComponent(id)}?api_key=${encodeURIComponent(KEY)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Giphy ${res.status} for id "${id}"`)
  const json = await res.json()
  return json?.data ? [json.data] : []
}

// From a pool of raw Giphy results, pick the single best landscape candidate.
// "Best" = widest aspect ratio >= minAspect. Falls back to any orientation if
// no landscape GIF is found.
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

  // Sort widest-first so the most cinematic result wins
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
  }

  const manifest = {}
  let total = 0

  for (const entry of PLAN) {
    console.log(`\nScene ${entry.scene} (need ${entry.count}):`)

    // Collect all raw results — from pinId or keyword search
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

    // Deduplicate by Giphy ID
    const seen = new Set()
    const unique = allResults.filter(g => g?.id && !seen.has(g.id) && seen.add(g.id))
    const preferOriginal = !!entry.pinId

    if (DRY_RUN) {
      // Show all landscape candidates so the developer can pick a pinId
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

    // Pick best N GIFs (for entries with count > 1, pick sequentially, excluding already-picked)
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
