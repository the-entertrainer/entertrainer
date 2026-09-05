import { getComposedPost, upsertComposedPost } from '../../utils/composed-store'
import type { ComposedPost } from '~/types/composed'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug required' })

  const body = await readBody<Partial<ComposedPost>>(event)
  const existing = getComposedPost(slug)
  if (!existing && !body.title) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }

  const now = new Date().toISOString()
  const merged: ComposedPost = {
    slug,
    title: body.title ?? existing?.title ?? '',
    dek: body.dek ?? existing?.dek ?? '',
    category: body.category ?? existing?.category ?? 'Mind & meaning',
    minutes: body.minutes ?? existing?.minutes ?? 5,
    hero: body.hero ?? existing?.hero ?? '',
    heroAlt: body.heroAlt ?? existing?.heroAlt ?? '',
    status: body.status ?? existing?.status ?? 'draft',
    publishedAt: body.status === 'published' && existing?.status !== 'published'
      ? now
      : (body.publishedAt ?? existing?.publishedAt ?? now),
    updatedAt: now,
    marginNote: body.marginNote ?? existing?.marginNote,
    blocks: body.blocks ?? existing?.blocks ?? [],
    references: body.references ?? existing?.references ?? []
  }

  if (!merged.title) {
    throw createError({ statusCode: 400, statusMessage: 'title is required' })
  }

  const saved = upsertComposedPost(merged)
  return { post: saved }
})
