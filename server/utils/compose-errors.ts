/**
 * Compose API error helpers.
 * Nuxt production often rewrites `message` to "Server Error"; `statusMessage`
 * and `data.detail` are what the /compose UI should read.
 */

export function composeThrow(
  statusCode: number,
  statusMessage: string,
  detail?: string
): never {
  throw createError({
    statusCode,
    statusMessage,
    message: statusMessage,
    data: {
      detail: detail || statusMessage,
      statusMessage
    }
  })
}

export function asComposeError(err: unknown, fallback = 'Compose store operation failed'): never {
  const anyErr = err as any
  if (anyErr?.statusCode && (anyErr?.statusMessage || anyErr?.data?.detail || anyErr?.message)) {
    const statusMessage = String(anyErr.statusMessage || anyErr.data?.detail || anyErr.message || fallback)
    throw createError({
      statusCode: Number(anyErr.statusCode) || 500,
      statusMessage,
      message: statusMessage,
      data: {
        detail: String(anyErr.data?.detail || statusMessage),
        statusMessage
      }
    })
  }
  const msg = anyErr?.message ? String(anyErr.message) : fallback
  composeThrow(502, msg, msg)
}

/** Decode base64 without relying on Buffer (safer across Nitro runtimes). */
export function decodeBase64Utf8(b64: string): string {
  const clean = String(b64 || '').replace(/\s/g, '')
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(clean, 'base64').toString('utf8')
  }
  // Fallback for edge-ish runtimes
  const binary = atob(clean)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder('utf-8').decode(bytes)
}

export function encodeUtf8Base64(text: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(text, 'utf8').toString('base64')
  }
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

export function utf8ByteLength(text: string): number {
  if (typeof Buffer !== 'undefined') return Buffer.byteLength(text, 'utf8')
  return new TextEncoder().encode(text).length
}

/** Soft limit before GitHub Contents API hard-caps (~1 MiB file content). */
export const COMPOSE_JSON_MAX_BYTES = 900_000
/** Reject obviously oversized request bodies (data: URLs) early with a clear 413. */
export const COMPOSE_BODY_MAX_BYTES = 4_000_000
