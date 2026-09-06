import { persistComposedDelete } from '../../utils/github-composed-store'
import { assertComposeAccess } from '../../utils/compose-request'

export default defineEventHandler(async (event) => {
  assertComposeAccess(event)
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug required' })
  const result = await persistComposedDelete(slug)
  if (!result.ok) throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  return { ok: true, committed: result.committed, commitUrl: result.commitUrl }
})
