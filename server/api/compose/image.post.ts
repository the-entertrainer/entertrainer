import {
  composeOneImage,
  normalizeImageSource,
  type ComposeImageSource
} from '../../utils/compose-images'
import { safeReadJsonBody, assertComposeAccess } from '../../utils/compose-request'

/** Align with nitro.vercel.functions.maxDuration (global 60s). */
export const maxDuration = 60

/**
 * POST /api/compose/image
 * Body: { topic?, title?, hint?, imageSource: 'commons'|'gemini'|'gamma', role: 'figure'|'hero' }
 * Returns a single image for a figure or alternate cover slot.
 */
export default defineEventHandler(async (event) => {
  assertComposeAccess(event)
  const config = useRuntimeConfig()
  const geminiApiKey = String(config.geminiApiKey || process.env.GEMINI_API_KEY || '').trim()
  const geminiImageModel = String(
    config.geminiImageModel || process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image'
  ).trim() || 'gemini-2.5-flash-image'
  const gammaApiKey = String(config.gammaApiKey || process.env.GAMMA_API_KEY || '').trim()

  let body: any
  try {
    body = await safeReadJsonBody(event)
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: err?.statusMessage || 'Could not read request body.'
    })
  }

  const roleRaw = String(body?.role || 'figure').trim().toLowerCase()
  const role = roleRaw === 'hero' ? 'hero' : 'figure'
  const imageSource = normalizeImageSource(body?.imageSource) as ComposeImageSource
  const topic = String(body?.topic ?? '').trim()
  const title = String(body?.title ?? '').trim()
  const hint = String(body?.hint ?? '').trim()

  if (!topic && !title && !hint) {
    throw createError({
      statusCode: 400,
      statusMessage: 'topic, title, or hint is required'
    })
  }

  try {
    const result = await composeOneImage({
      topic: topic || title,
      title,
      hint,
      imageSource,
      role,
      geminiApiKey,
      geminiImageModel,
      gammaApiKey
    })
    return {
      image: result.image,
      sourceUsed: result.sourceUsed,
      role,
      ...(result.warning ? { warning: result.warning } : {})
    }
  } catch (err: any) {
    throw createError({
      statusCode: 502,
      statusMessage: err?.message || 'Image generation failed'
    })
  }
})
