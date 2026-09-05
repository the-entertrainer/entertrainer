import { persistComposedUpsert } from '../../utils/github-composed-store'
import type { ComposedPost } from '~/types/composed'

export default defineEventHandler(async (event) => {
  const body = await readBody<ComposedPost>(event)
  if (!body?.slug || !body?.title) {
    throw createError({ statusCode: 400, statusMessage: 'slug and title are required' })
  }

  const saved = await persistComposedUpsert({
    ...body,
    updatedAt: new Date().toISOString(),
    publishedAt: body.status === 'published'
      ? (body.publishedAt || new Date().toISOString())
      : (body.publishedAt || new Date().toISOString())
  })

  return {
    post: saved.post,
    committed: saved.committed,
    commitUrl: saved.commitUrl
  }
})
