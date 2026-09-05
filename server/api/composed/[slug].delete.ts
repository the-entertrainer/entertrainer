import { deleteComposedPost } from '../../utils/composed-store'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug required' })
  const ok = deleteComposedPost(slug)
  if (!ok) throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  return { ok: true }
})
