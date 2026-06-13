// Email capture before a free download.
// Wire up to ConvertKit / Mailchimp by replacing the stub below.
export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; name?: string }>(event)
  const email = body?.email?.trim() ?? ''
  const name = body?.name?.trim() ?? ''

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email' })
  }

  // TODO: forward to a real email provider.
  console.log('[subscribe] new subscriber:', { email, name })

  return { ok: true }
})
