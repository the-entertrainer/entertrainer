import { asComposeError } from '../utils/compose-errors'
import { safeQuery, assertComposeAccess } from '../utils/compose-request'
import { loadComposedPosts } from '../utils/github-composed-store'

/** GET /api/composed — same as /api/compose/posts (top-level file avoids nested index bundle bug). */
export default defineEventHandler(async (event) => {
  try {
    const query = safeQuery(event)
    if (query.includeDrafts === '1') assertComposeAccess(event)
    const posts = await loadComposedPosts()
    if (query.includeDrafts === '1') return { posts }
    return { posts: posts.filter((post) => post.status === 'published') }
  } catch (err) {
    asComposeError(err, 'Failed to load composed posts')
  }
})
