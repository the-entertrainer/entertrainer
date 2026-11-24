// Server-side MailerLite proxy for the newsletter widget.
//
// Keeps the API key off the client. Adds the subscriber to the "Entertrainer
// Weekly" group. When MAILERLITE_API_KEY is not configured (or the upstream
// call fails) it responds with `{ ok: false, configured: false }` so the
// client can fall back to the mailto flow instead of breaking.

const ENTERTRAINER_WEEKLY_GROUP_ID = '196621532477260821'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// H3 v2 (Nuxt auto-imports) calls event.req.text() in readBody, but Nitro 2.x
// creates H3 v1.x events where event.req is a Node.js IncomingMessage — not a
// Web Request — so .text() doesn't exist. Read directly from the Node.js
// stream to bypass this version mismatch (see better-emails.post.ts).
function parseBody(event: any): Promise<any> {
  const req = event.node?.req ?? event.req
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: any) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(String(c))))
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8').trim()
        resolve(text ? JSON.parse(text) : {})
      } catch (e: any) {
        reject(new Error(`Body parse failed: ${e?.message}`))
      }
    })
    req.on('error', reject)
    if (req.readableEnded) resolve({})
  })
}

export default defineEventHandler(async (event): Promise<{ ok: boolean; configured: boolean; message: string }> => {
  const { mailerliteApiKey } = useRuntimeConfig(event)
  const body = await parseBody(event).catch(() => ({}))
  const email = String(body?.email ?? '').trim()

  if (!EMAIL_RE.test(email)) {
    return { ok: false, configured: true, message: 'That email address doesn\'t look right.' }
  }

  if (!mailerliteApiKey) {
    return { ok: false, configured: false, message: 'Subscription service is not configured.' }
  }

  try {
    await $fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mailerliteApiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: { email, groups: [ENTERTRAINER_WEEKLY_GROUP_ID] },
      timeout: 8000
    })
    return { ok: true, configured: true, message: 'You\'re subscribed.' }
  } catch (error: any) {
    // A 422 here is almost always "already subscribed" — treat it as success
    // from the visitor's point of view rather than surfacing an API error.
    if (error?.response?.status === 422) {
      return { ok: true, configured: true, message: 'You\'re already on the list.' }
    }
    return { ok: false, configured: true, message: 'Something went wrong. Please try again.' }
  }
})
