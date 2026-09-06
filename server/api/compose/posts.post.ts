import { asComposeError, COMPOSE_BODY_MAX_BYTES, composeThrow, utf8ByteLength } from '../../utils/compose-errors'
import { safeReadJsonBody, assertComposeAccess } from '../../utils/compose-request'
import { persistComposedUpsert } from '../../utils/github-composed-store'
import type { ComposedPost } from '~/types/composed'

/** POST /api/compose/posts — upsert draft/published post. */
export default defineEventHandler(async (event) => {
  assertComposeAccess(event)
  try {
    const body = (await safeReadJsonBody(event)) as ComposedPost
    if (!body?.slug || !body?.title) {
      composeThrow(400, 'slug and title are required')
    }

    const approx = utf8ByteLength(JSON.stringify(body))
    if (approx > COMPOSE_BODY_MAX_BYTES) {
      composeThrow(
        413,
        `Request body too large (~${approx} bytes). Strip inline data: images before publish.`,
        `bodyBytes=${approx} limit=${COMPOSE_BODY_MAX_BYTES}`
      )
    }

    const saved = await persistComposedUpsert({
      ...body,
      updatedAt: new Date().toISOString(),
      publishedAt: body.publishedAt || new Date().toISOString()
    })

    return {
      post: saved.post,
      committed: saved.committed,
      commitUrl: saved.commitUrl,
      imageWarnings: saved.imageWarnings,
      imagesCommitted: saved.imagesCommitted
    }
  } catch (err) {
    asComposeError(err, 'Failed to persist composed post')
  }
})
