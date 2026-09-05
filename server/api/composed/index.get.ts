import { readComposedStore } from '../../utils/composed-store'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const posts = readComposedStore()
  if (query.includeDrafts === '1') {
    return { posts }
  }
  return { posts: posts.filter((post) => post.status === 'published') }
})
