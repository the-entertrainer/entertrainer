#!/usr/bin/env node
/**
 * Fail closed: every published BlogPost must ship socialHook (80–180, ≠ dek)
 * and socialTitle (20–70, required). LinkedIn mobile often hides og:description,
 * so socialTitle must carry the pull alone. See docs/blog-social-hook.md.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(__dirname, '../content/blogs.ts'), 'utf8')

/** Naive extract of published objects from BLOG_POSTS array. */
const posts = []
const objectRe = /\{([^{}]*slug:\s*'([^']+)'[^{}]*)\}/gs
let m
while ((m = objectRe.exec(src))) {
  const body = m[1]
  const slug = m[2]
  const get = (key) => {
    const r = new RegExp(`${key}:\\s*((['\`"])([\\s\\S]*?)\\2)`)
    const hit = body.match(r)
    return hit ? hit[3] : null
  }
  const status = get('status')
  if (status !== 'published') continue
  posts.push({
    slug,
    dek: get('dek') ?? '',
    socialHook: get('socialHook') ?? '',
    socialTitle: get('socialTitle') ?? '',
    title: get('title') ?? ''
  })
}

const errors = []
if (posts.length < 1) errors.push('No published posts parsed from content/blogs.ts')

for (const post of posts) {
  const hook = post.socialHook
  const dek = post.dek
  const socialTitle = post.socialTitle
  const title = post.title

  if (!hook) {
    errors.push(`${post.slug}: missing socialHook`)
  } else {
    if (hook === dek) {
      errors.push(`${post.slug}: socialHook === dek (must differ)`)
    }
    const n = [...hook].length // code points
    if (n < 80 || n > 180) {
      errors.push(`${post.slug}: socialHook length ${n} outside 80–180`)
    }
  }

  if (!socialTitle || !socialTitle.trim()) {
    errors.push(`${post.slug}: missing socialTitle`)
  } else {
    const tn = [...socialTitle].length
    if (tn < 20 || tn > 70) {
      errors.push(`${post.slug}: socialTitle length ${tn} outside 20–70`)
    }
    // Branded one-word / thin titles must not reuse title as the OG line
    if (socialTitle === title && [...title].length < 20) {
      errors.push(
        `${post.slug}: socialTitle === title and title is too thin (<20) — LinkedIn mobile needs a punchy OG title`
      )
    }
  }
}

if (errors.length) {
  console.error('check-social-hooks FAILED:')
  for (const e of errors) console.error(' -', e)
  process.exit(1)
}

console.log(`check-social-hooks OK — ${posts.length} published posts`)
for (const post of posts) {
  console.log(
    `  hook ${[...post.socialHook].length}\ttitle ${[...post.socialTitle].length}\t${post.slug}`
  )
}
