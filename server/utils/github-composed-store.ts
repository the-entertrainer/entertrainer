import type { ComposedPost } from '~/types/composed'
import { readComposedStore, writeComposedStore } from './composed-store'

const CONTENT_PATH = 'content/composed-posts.json'

export type ComposeGithubConfig = {
  token: string
  owner: string
  repo: string
  branch: string
  enabled: boolean
}

export function getComposeGithubConfig(): ComposeGithubConfig {
  const config = useRuntimeConfig()
  const token = String(
    config.composeGithubToken || config.githubToken || process.env.COMPOSE_GITHUB_TOKEN || process.env.GITHUB_TOKEN || ''
  ).trim()
  const fullRepo = String(
    config.composeGithubRepo || process.env.COMPOSE_GITHUB_REPO || 'the-entertrainer/entertrainer'
  ).trim()
  const branch = String(
    config.composeGithubBranch || process.env.COMPOSE_GITHUB_BRANCH || 'main'
  ).trim() || 'main'
  const [owner, repo] = fullRepo.split('/')
  return {
    token,
    owner: owner || 'the-entertrainer',
    repo: repo || 'entertrainer',
    branch,
    enabled: Boolean(token)
  }
}

export function isComposeProductionRuntime() {
  return process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
}

function githubHeaders(token: string): HeadersInit {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'entertrainer-compose'
  }
}

function contentsUrl(cfg: ComposeGithubConfig) {
  return `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${CONTENT_PATH}`
}

function parsePosts(raw: unknown): ComposedPost[] {
  return Array.isArray(raw) ? (raw as ComposedPost[]) : []
}

function bestEffortLocalWrite(posts: ComposedPost[]) {
  try {
    writeComposedStore(posts)
  } catch {
    // Ephemeral FS on Vercel / read-only — ignore.
  }
}

export type GithubComposedFile = {
  posts: ComposedPost[]
  sha: string | null
}

/** Read latest composed-posts.json from GitHub Contents API. */
export async function fetchComposedPostsFromGithub(): Promise<GithubComposedFile> {
  const cfg = getComposeGithubConfig()
  if (!cfg.enabled) {
    throw createError({
      statusCode: 503,
      statusMessage: 'COMPOSE_GITHUB_TOKEN (or GITHUB_TOKEN) is not configured'
    })
  }

  const url = `${contentsUrl(cfg)}?ref=${encodeURIComponent(cfg.branch)}`
  const res = await fetch(url, { headers: githubHeaders(cfg.token) })

  if (res.status === 404) {
    return { posts: [], sha: null }
  }

  if (!res.ok) {
    const detail = await safeErrorText(res)
    throw createError({
      statusCode: 502,
      statusMessage: `GitHub read failed (${res.status}): ${detail}`
    })
  }

  const data = (await res.json()) as { content?: string; encoding?: string; sha?: string }
  if (!data.content || !data.sha) {
    return { posts: [], sha: data.sha ?? null }
  }

  try {
    const decoded = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8')
    const parsed = JSON.parse(decoded)
    return { posts: parsePosts(parsed), sha: data.sha }
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: 'GitHub composed-posts.json is not valid JSON'
    })
  }
}

/** Commit full posts array to content/composed-posts.json on the configured branch. */
export async function commitComposedPosts(
  posts: ComposedPost[],
  message: string,
  sha?: string | null
): Promise<{ sha: string; htmlUrl?: string }> {
  const cfg = getComposeGithubConfig()
  if (!cfg.enabled) {
    throw createError({
      statusCode: 503,
      statusMessage: 'COMPOSE_GITHUB_TOKEN (or GITHUB_TOKEN) is required to persist composed posts to GitHub'
    })
  }

  let currentSha = sha
  if (currentSha === undefined) {
    const latest = await fetchComposedPostsFromGithub()
    currentSha = latest.sha
  }

  const body: Record<string, string> = {
    message,
    content: Buffer.from(`${JSON.stringify(posts, null, 2)}\n`, 'utf8').toString('base64'),
    branch: cfg.branch
  }
  if (currentSha) body.sha = currentSha

  const res = await fetch(contentsUrl(cfg), {
    method: 'PUT',
    headers: {
      ...githubHeaders(cfg.token),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (res.status === 409 || res.status === 422) {
    throw createError({
      statusCode: 409,
      statusMessage: 'GitHub content conflict — retry with a fresh SHA'
    })
  }

  if (!res.ok) {
    const detail = await safeErrorText(res)
    throw createError({
      statusCode: 502,
      statusMessage: `GitHub commit failed (${res.status}): ${detail}`
    })
  }

  const data = (await res.json()) as { content?: { sha?: string; html_url?: string }; commit?: { html_url?: string } }
  return {
    sha: data.content?.sha || currentSha || '',
    htmlUrl: data.commit?.html_url || data.content?.html_url
  }
}

async function safeErrorText(res: Response) {
  try {
    const raw = await res.text()
    try {
      const json = JSON.parse(raw) as { message?: string }
      if (json?.message) return json.message
    } catch {
      /* not JSON */
    }
    if (raw) return raw.slice(0, 240)
  } catch {
    /* ignore */
  }
  return res.statusText || 'unknown error'
}

/**
 * Load posts: GitHub when token present (source of truth for prod persistence),
 * otherwise local filesystem (nuxt dev without token).
 */
export async function loadComposedPosts(): Promise<ComposedPost[]> {
  const cfg = getComposeGithubConfig()
  if (cfg.enabled) {
    try {
      const { posts } = await fetchComposedPostsFromGithub()
      bestEffortLocalWrite(posts)
      return posts
    } catch (err: any) {
      // Prefer local fallback for transient GitHub errors in non-publish paths.
      const local = readComposedStore()
      if (local.length) return local
      throw err
    }
  }
  return readComposedStore()
}

export function upsertIntoPosts(posts: ComposedPost[], post: ComposedPost): ComposedPost[] {
  const next = { ...post, updatedAt: new Date().toISOString() }
  const index = posts.findIndex((item) => item.slug === post.slug)
  const copy = [...posts]
  if (index >= 0) copy[index] = next
  else copy.push(next)
  return copy
}

export function deleteFromPosts(posts: ComposedPost[], slug: string): ComposedPost[] | null {
  const next = posts.filter((item) => item.slug !== slug)
  if (next.length === posts.length) return null
  return next
}

/**
 * Upsert a post. When a GitHub token is present, merge against the latest
 * GitHub file then commit. Always best-effort writes local FS for nuxt dev.
 */
export async function persistComposedUpsert(post: ComposedPost): Promise<{
  post: ComposedPost
  committed: boolean
  commitUrl?: string
}> {
  const cfg = getComposeGithubConfig()
  const nextPost = { ...post, updatedAt: new Date().toISOString() }

  if (cfg.enabled) {
    const verb = nextPost.status === 'published' ? 'Publish' : 'Save draft'
    let lastError: unknown
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { posts, sha } = await fetchComposedPostsFromGithub()
        const merged = upsertIntoPosts(posts, nextPost)
        const saved = merged.find((item) => item.slug === nextPost.slug) || nextPost
        const result = await commitComposedPosts(
          merged,
          `compose: ${verb} ${saved.slug}`,
          sha
        )
        bestEffortLocalWrite(merged)
        return { post: saved, committed: true, commitUrl: result.htmlUrl }
      } catch (err: any) {
        lastError = err
        if (err?.statusCode !== 409) throw err
      }
    }
    throw lastError
  }

  // Local-only path (nuxt dev without token)
  if (nextPost.status === 'published' && isComposeProductionRuntime()) {
    throw createError({
      statusCode: 503,
      statusMessage:
        'COMPOSE_GITHUB_TOKEN (or GITHUB_TOKEN) is required to publish on Vercel. Add a PAT with contents:write on the-entertrainer/entertrainer, then republish.'
    })
  }

  const local = readComposedStore()
  const merged = upsertIntoPosts(local, nextPost)
  const saved = merged.find((item) => item.slug === nextPost.slug) || nextPost
  writeComposedStore(merged)
  return { post: saved, committed: false }
}

export async function persistComposedDelete(slug: string): Promise<{
  ok: boolean
  committed: boolean
  commitUrl?: string
}> {
  const cfg = getComposeGithubConfig()

  if (cfg.enabled) {
    let lastError: unknown
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { posts, sha } = await fetchComposedPostsFromGithub()
        const next = deleteFromPosts(posts, slug)
        if (!next) return { ok: false, committed: false }
        const result = await commitComposedPosts(next, `compose: Delete ${slug}`, sha)
        bestEffortLocalWrite(next)
        return { ok: true, committed: true, commitUrl: result.htmlUrl }
      } catch (err: any) {
        lastError = err
        if (err?.statusCode !== 409) throw err
      }
    }
    throw lastError
  }

  const local = readComposedStore()
  const next = deleteFromPosts(local, slug)
  if (!next) return { ok: false, committed: false }
  writeComposedStore(next)
  return { ok: true, committed: false }
}
