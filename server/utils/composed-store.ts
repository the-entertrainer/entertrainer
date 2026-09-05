import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { ComposedPost } from '~/types/composed'

const RELATIVE_PATH = join('content', 'composed-posts.json')

function storePath() {
  return join(process.cwd(), RELATIVE_PATH)
}

export function readComposedStore(): ComposedPost[] {
  const path = storePath()
  if (!existsSync(path)) return []
  try {
    const raw = readFileSync(path, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ComposedPost[]) : []
  } catch {
    return []
  }
}

export function writeComposedStore(posts: ComposedPost[]) {
  const path = storePath()
  const dir = dirname(path)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(path, `${JSON.stringify(posts, null, 2)}\n`, 'utf8')
}

export function upsertComposedPost(post: ComposedPost): ComposedPost {
  const posts = readComposedStore()
  const index = posts.findIndex((item) => item.slug === post.slug)
  const next = { ...post, updatedAt: new Date().toISOString() }
  if (index >= 0) posts[index] = next
  else posts.push(next)
  writeComposedStore(posts)
  return next
}

export function deleteComposedPost(slug: string): boolean {
  const posts = readComposedStore()
  const next = posts.filter((item) => item.slug !== slug)
  if (next.length === posts.length) return false
  writeComposedStore(next)
  return true
}

export function getComposedPost(slug: string): ComposedPost | undefined {
  return readComposedStore().find((item) => item.slug === slug)
}
