import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { ComposedPost } from '~/types/composed'
import { readComposedStore, writeComposedStore } from './composed-store'
import { localizePostImages, type LocalizedImageFile } from './compose-image-commit'

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

function contentsUrl(cfg: ComposeGithubConfig, path = CONTENT_PATH) {
  return `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`
}

function apiUrl(cfg: ComposeGithubConfig, suffix: string) {
  return `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/${suffix}`
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

/**
 * Atomically commit multiple files via Git Data API (blobs → tree → commit → ref).
 * Used when publishing images + composed-posts.json together.
 */
export async function commitFilesToGithub(
  files: Array<{ path: string; bytes: Buffer }>,
  message: string
): Promise<{ sha: string; htmlUrl?: string }> {
  const cfg = getComposeGithubConfig()
  if (!cfg.enabled) {
    throw createError({
      statusCode: 503,
      statusMessage: 'COMPOSE_GITHUB_TOKEN (or GITHUB_TOKEN) is required to persist composed posts to GitHub'
    })
  }
  if (!files.length) {
    throw createError({ statusCode: 400, statusMessage: 'No files to commit' })
  }

  const headers = {
    ...githubHeaders(cfg.token),
    'Content-Type': 'application/json'
  }

  // 1) Resolve branch HEAD
  const refRes = await fetch(apiUrl(cfg, `git/ref/heads/${encodeURIComponent(cfg.branch)}`), {
    headers: githubHeaders(cfg.token)
  })
  if (!refRes.ok) {
    const detail = await safeErrorText(refRes)
    throw createError({
      statusCode: 502,
      statusMessage: `GitHub ref read failed (${refRes.status}): ${detail}`
    })
  }
  const refData = (await refRes.json()) as { object?: { sha?: string } }
  const headSha = refData.object?.sha
  if (!headSha) {
    throw createError({ statusCode: 502, statusMessage: 'GitHub ref missing commit SHA' })
  }

  // 2) Parent commit → base tree
  const commitRes = await fetch(apiUrl(cfg, `git/commits/${headSha}`), {
    headers: githubHeaders(cfg.token)
  })
  if (!commitRes.ok) {
    const detail = await safeErrorText(commitRes)
    throw createError({
      statusCode: 502,
      statusMessage: `GitHub commit read failed (${commitRes.status}): ${detail}`
    })
  }
  const commitData = (await commitRes.json()) as { tree?: { sha?: string } }
  const baseTreeSha = commitData.tree?.sha
  if (!baseTreeSha) {
    throw createError({ statusCode: 502, statusMessage: 'GitHub commit missing tree SHA' })
  }

  // 3) Create a blob per file
  const treeItems: Array<{ path: string; mode: '100644'; type: 'blob'; sha: string }> = []
  for (const file of files) {
    const blobRes = await fetch(apiUrl(cfg, 'git/blobs'), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content: file.bytes.toString('base64'),
        encoding: 'base64'
      })
    })
    if (!blobRes.ok) {
      const detail = await safeErrorText(blobRes)
      throw createError({
        statusCode: 502,
        statusMessage: `GitHub blob create failed for ${file.path} (${blobRes.status}): ${detail}`
      })
    }
    const blob = (await blobRes.json()) as { sha?: string }
    if (!blob.sha) {
      throw createError({ statusCode: 502, statusMessage: `GitHub blob missing sha for ${file.path}` })
    }
    treeItems.push({
      path: file.path,
      mode: '100644',
      type: 'blob',
      sha: blob.sha
    })
  }

  // 4) Create tree
  const treeRes = await fetch(apiUrl(cfg, 'git/trees'), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: treeItems
    })
  })
  if (!treeRes.ok) {
    const detail = await safeErrorText(treeRes)
    throw createError({
      statusCode: 502,
      statusMessage: `GitHub tree create failed (${treeRes.status}): ${detail}`
    })
  }
  const treeData = (await treeRes.json()) as { sha?: string }
  if (!treeData.sha) {
    throw createError({ statusCode: 502, statusMessage: 'GitHub tree missing sha' })
  }

  // 5) Create commit
  const newCommitRes = await fetch(apiUrl(cfg, 'git/commits'), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message,
      tree: treeData.sha,
      parents: [headSha]
    })
  })
  if (!newCommitRes.ok) {
    const detail = await safeErrorText(newCommitRes)
    throw createError({
      statusCode: 502,
      statusMessage: `GitHub commit create failed (${newCommitRes.status}): ${detail}`
    })
  }
  const newCommit = (await newCommitRes.json()) as { sha?: string; html_url?: string }
  if (!newCommit.sha) {
    throw createError({ statusCode: 502, statusMessage: 'GitHub commit missing sha' })
  }

  // 6) Move branch ref (no force)
  const updateRefRes = await fetch(apiUrl(cfg, `git/refs/heads/${encodeURIComponent(cfg.branch)}`), {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ sha: newCommit.sha, force: false })
  })
  if (updateRefRes.status === 422) {
    throw createError({
      statusCode: 409,
      statusMessage: 'GitHub content conflict — retry with a fresh SHA'
    })
  }
  if (!updateRefRes.ok) {
    const detail = await safeErrorText(updateRefRes)
    throw createError({
      statusCode: 502,
      statusMessage: `GitHub ref update failed (${updateRefRes.status}): ${detail}`
    })
  }

  return {
    sha: newCommit.sha,
    htmlUrl: newCommit.html_url || `https://github.com/${cfg.owner}/${cfg.repo}/commit/${newCommit.sha}`
  }
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

function bestEffortLocalImages(files: LocalizedImageFile[]) {
  try {
    for (const file of files) {
      const full = join(process.cwd(), file.path)
      mkdirSync(dirname(full), { recursive: true })
      writeFileSync(full, file.bytes)
    }
  } catch {
    /* ignore on Vercel */
  }
}

/**
 * Upsert a post. When a GitHub token is present, localize remote/data images,
 * merge against the latest GitHub file, then commit JSON (+ image files).
 */
export async function persistComposedUpsert(post: ComposedPost): Promise<{
  post: ComposedPost
  committed: boolean
  commitUrl?: string
  imageWarnings?: string[]
  imagesCommitted?: number
}> {
  const cfg = getComposeGithubConfig()
  let working = { ...post, updatedAt: new Date().toISOString() }
  let imageFiles: LocalizedImageFile[] = []
  let imageWarnings: string[] = []

  // Localize images whenever we have remote/data URLs (publish or draft).
  try {
    const localized = await localizePostImages(working)
    working = localized.post
    imageFiles = localized.files
    imageWarnings = localized.warnings
  } catch (err: any) {
    imageWarnings = [`Image localization skipped: ${err?.message || 'error'}`]
  }

  if (cfg.enabled) {
    const verb = working.status === 'published' ? 'Publish' : 'Save draft'
    let lastError: unknown
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { posts, sha } = await fetchComposedPostsFromGithub()
        const merged = upsertIntoPosts(posts, working)
        const saved = merged.find((item) => item.slug === working.slug) || working

        const jsonBytes = Buffer.from(`${JSON.stringify(merged, null, 2)}\n`, 'utf8')
        const filesToCommit: Array<{ path: string; bytes: Buffer }> = [
          { path: CONTENT_PATH, bytes: jsonBytes },
          ...imageFiles.map((f) => ({ path: f.path, bytes: f.bytes }))
        ]

        const imageNote = imageFiles.length
          ? ` + ${imageFiles.length} image${imageFiles.length === 1 ? '' : 's'}`
          : ''
        const result = await commitFilesToGithub(
          filesToCommit,
          `compose: ${verb} ${saved.slug}${imageNote}`
        )

        bestEffortLocalWrite(merged)
        bestEffortLocalImages(imageFiles)
        return {
          post: saved,
          committed: true,
          commitUrl: result.htmlUrl,
          imageWarnings,
          imagesCommitted: imageFiles.length
        }
      } catch (err: any) {
        lastError = err
        if (err?.statusCode !== 409) {
          // If multi-file commit fails for a non-conflict reason but we only
          // needed JSON, fall back to single-file Contents API so publish
          // still lands the post (images may remain remote).
          if (imageFiles.length && err?.statusCode === 502) {
            try {
              const { posts, sha } = await fetchComposedPostsFromGithub()
              const merged = upsertIntoPosts(posts, working)
              const saved = merged.find((item) => item.slug === working.slug) || working
              const result = await commitComposedPosts(
                merged,
                `compose: ${verb} ${saved.slug} (JSON only; image commit failed)`,
                sha
              )
              bestEffortLocalWrite(merged)
              return {
                post: saved,
                committed: true,
                commitUrl: result.htmlUrl,
                imageWarnings: [
                  ...imageWarnings,
                  `Image files not committed (${err?.statusMessage || err?.message || 'error'}); JSON saved.`
                ],
                imagesCommitted: 0
              }
            } catch (fallbackErr: any) {
              if (fallbackErr?.statusCode !== 409) throw fallbackErr
              lastError = fallbackErr
              continue
            }
          }
          throw err
        }
      }
    }
    throw lastError
  }

  // Local-only path (nuxt dev without token)
  if (working.status === 'published' && isComposeProductionRuntime()) {
    throw createError({
      statusCode: 503,
      statusMessage:
        'COMPOSE_GITHUB_TOKEN (or GITHUB_TOKEN) is required to publish on Vercel. Add a PAT with contents:write on the-entertrainer/entertrainer, then republish.'
    })
  }

  const local = readComposedStore()
  const merged = upsertIntoPosts(local, working)
  const saved = merged.find((item) => item.slug === working.slug) || working
  writeComposedStore(merged)
  bestEffortLocalImages(imageFiles)
  return {
    post: saved,
    committed: false,
    imageWarnings,
    imagesCommitted: imageFiles.length
  }
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
