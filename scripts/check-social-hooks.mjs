#!/usr/bin/env node
/**
 * Fail closed: every published BlogPost must ship a socialHook that is
 * 80–180 chars and not equal to dek. See docs/blog-social-hook.md.
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
    const r = new RegExp(`${key}:\\s*((['\`])([\\s\\S]*?)\\2)`)
    const hit = body.match(r)
    return hit ? hit[3] : null
  }
  const status = get('status')
  if (status !== 'published') continue
  posts.push({
    slug,
    dek: get('dek') ?? '',
    socialHook: get('socialHook') ?? '',
    title: get('title') ?? ''
  })
}

const errors = []
if (posts.length < 1) errors.push('No published posts parsed from content/blogs.ts')

for (const post of posts) {
  const hook = post.socialHook
  const dek = post.dek
  if (!hook) {
    errors.push(`${post.slug}: missing socialHook`)
    continue
  }
  if (hook === dek) {
    errors.push(`${post.slug}: socialHook === dek (must differ)`)
  }
  const n = [...hook].length // code points
  if (n < 80 || n > 180) {
    errors.push(`${post.slug}: socialHook length ${n} outside 80–180`)
  }
}

if (errors.length) {
  console.error('check-social-hooks FAILED:')
  for (const e of errors) console.error(' -', e)
  process.exit(1)
}

console.log(`check-social-hooks OK — ${posts.length} published posts`)
for (const post of posts) {
  console.log(`  ${[...post.socialHook].length}\t${post.slug}`)
}
