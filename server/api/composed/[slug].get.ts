import { loadComposedPosts } from '../../utils/github-composed-store'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug required' })
  const posts = await loadComposedPosts()
  const post = posts.find((item) => item.slug === slug)
  if (!post) throw createError({ statusCode: 404, statusMessage: 'Post not found' })

  const query = getQuery(event)
  if (post.status !== 'published' && query.draft !== '1') {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }
  return { post }
})
