/**
 * Safe request helpers for compose APIs on Vercel/Nitro.
 * Avoid fragile getQuery/readBody paths that throw Invalid URL /
 * event.req.text is not a function on some bundled handlers.
 */

export function safeQuery(event: any): Record<string, string> {
  try {
    const raw =
      event?.node?.req?.url ||
      event?.req?.url ||
      event?.path ||
      ''
    const path = String(raw || '')
    const qIndex = path.indexOf('?')
    const search = qIndex >= 0 ? path.slice(qIndex + 1) : ''
    const out: Record<string, string> = {}
    if (!search) return out
    for (const part of search.split('&')) {
      if (!part) continue
      const eq = part.indexOf('=')
      const key = decodeURIComponent((eq >= 0 ? part.slice(0, eq) : part).replace(/\+/g, ' '))
      const val = decodeURIComponent((eq >= 0 ? part.slice(eq + 1) : '').replace(/\+/g, ' '))
      if (key) out[key] = val
    }
    return out
  } catch {
    return {}
  }
}

/** Same pattern as compose/generate.post.ts — Node IncomingMessage chunks. */
export function readNodeJsonBody(event: any): Promise<any> {
  const req = event?.node?.req ?? event?.req
  if (!req || typeof req.on !== 'function') {
    return Promise.reject(new Error('Request stream unavailable'))
  }
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const onData = (c: any) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(String(c)))
    const onEnd = () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8').trim()
        resolve(text ? JSON.parse(text) : {})
      } catch (e: any) {
        reject(new Error(`Body parse failed: ${e?.message || e}`))
      }
    }
    const onError = (err: any) => reject(err)
    req.on('data', onData)
    req.on('end', onEnd)
    req.on('error', onError)
    if (req.readableEnded || req.complete) {
      // Already consumed — try h3 readBody as last resort below via caller
      try {
        const text = Buffer.concat(chunks).toString('utf8').trim()
        resolve(text ? JSON.parse(text) : {})
      } catch {
        resolve({})
      }
    }
  })
}

export async function safeReadJsonBody(event: any): Promise<any> {
  try {
    return await readNodeJsonBody(event)
  } catch {
    // Fallback for runtimes where the Fetch-style body works
    try {
      return (await readBody(event)) ?? {}
    } catch (err: any) {
      throw createError({
        statusCode: 400,
        statusMessage: `Could not read JSON body: ${err?.message || 'parse error'}`,
        data: { detail: err?.message || 'parse error', statusMessage: 'Could not read JSON body' }
      })
    }
  }
}


/** Same keyword as pages/compose gate — lightweight shared secret for write APIs. */
export const COMPOSE_GATE_KEY = 'iamguru'
export const COMPOSE_KEY_HEADER = 'x-compose-key'

/**
 * Require the compose gate key (or optional COMPOSE_API_SECRET) on mutate / draft APIs.
 * Matches the client-side /compose unlock keyword so Nikita's UX stays the same once unlocked.
 */
export function assertComposeAccess(event: any) {
  const config = useRuntimeConfig()
  const expectedSecret = String(
    (config as any).composeApiSecret || process.env.COMPOSE_API_SECRET || ''
  ).trim()
  const expected = expectedSecret || COMPOSE_GATE_KEY

  const headers = event?.node?.req?.headers || event?.req?.headers || {}
  const raw =
    headers[COMPOSE_KEY_HEADER] ||
    headers['X-Compose-Key'] ||
    headers['x-compose-key'] ||
    ''
  const provided = String(Array.isArray(raw) ? raw[0] : raw).trim()

  if (!provided || provided !== expected) {
    throw createError({ statusCode: 401, statusMessage: 'Compose access required' })
  }
}
