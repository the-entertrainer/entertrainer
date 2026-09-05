import { loadComposedPosts } from '../../utils/github-composed-store'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const posts = await loadComposedPosts()
  if (query.includeDrafts === '1') {
    return { posts }
  }
  return { posts: posts.filter((post) => post.status === 'published') }
})
