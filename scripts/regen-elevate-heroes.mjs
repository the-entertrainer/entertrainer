/**
 * One-off: regenerate composed Elevate heroes with topic-matched briefs.
 * Usage: node --import jiti/register scripts/regen-elevate-heroes.mjs
 * (or: node scripts/regen-elevate-heroes.mjs after compiling — uses jiti below)
 */
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const jiti = require('jiti')(fileURLToPath(import.meta.url), { esmResolve: true })
const { generateElevateHero } = jiti('../server/utils/elevate-hero.ts')

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const jobs = [
  {
    slug: 'why-your-brain-is-hardwired-to-commit-monumental-stupidity',
    topic: 'monumental historical blunders and cognitive bias',
    title: 'Why Your Brain Is Hardwired to Commit Monumental Stupidity',
    dek: 'Advanced intellect often enables catastrophic error.',
    brief: {
      metaphor: 'A confident mind doubling down while the map peels away from the territory',
      motif: 'tangled-paths',
      focal: 'head-open',
      cobaltRole: 'The single wrong path the expert keeps taking'
    },
    seed: 'stupidity-hero-v2'
  },
  {
    slug: 'why-your-brain-might-be-hiding-the-most-important-part-of-your-life',
    topic: 'why we dream during REM sleep',
    title: 'Why Your Brain Might Be Hiding the Most Important Part of Your Life',
    dek: 'Dreaming as an offline rehearsal space for waking life.',
    brief: {
      metaphor: 'Nocturnal orbits rehearsing waking life while the body stays still',
      motif: 'orbits',
      focal: 'crescent',
      cobaltRole: 'The privileged dream orbit looping around a quiet center'
    },
    seed: 'dream-hero-v2'
  },
  {
    slug: 'what-is-your-otp',
    topic: 'one-time passwords and the fragility of digital trust',
    title: 'What Is Your OTP?',
    dek: 'A six-digit code as a temporary fence around digital identity.',
    brief: {
      metaphor: 'A measured security grid interrupted by one fleeting authenticating pulse',
      motif: 'grid-anomaly',
      focal: 'grid',
      cobaltRole: 'The short-lived code path cutting through the grid'
    },
    seed: 'otp-hero-v2'
  }
]

for (const job of jobs) {
  const result = await generateElevateHero({
    topic: job.topic,
    slug: job.slug,
    title: job.title,
    dek: job.dek,
    brief: job.brief,
    seed: job.seed,
    width: 1600,
    format: 'png'
  })
  const dir = join(ROOT, 'public/blog', job.slug)
  mkdirSync(dir, { recursive: true })
  const filename = `hero.${result.ext}`
  const out = join(dir, filename)
  writeFileSync(out, result.bytes)
  console.log(JSON.stringify({
    slug: job.slug,
    path: `/blog/${job.slug}/${filename}`,
    motif: result.motif,
    alt: result.alt,
    bytes: result.bytes.length,
    ext: result.ext
  }, null, 2))
}
