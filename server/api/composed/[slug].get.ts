import { getComposedPost } from '../../utils/composed-store'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug required' })
  const post = getComposedPost(slug)
  if (!post) throw createError({ statusCode: 404, statusMessage: 'Post not found' })

  const query = getQuery(event)
  if (post.status !== 'published' && query.draft !== '1') {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }
  return { post }
})
