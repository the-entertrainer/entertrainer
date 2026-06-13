// Contact form handler.
// Wire up to Resend / SendGrid / Nodemailer by replacing the stub below.
export default defineEventHandler(async (event) => {
  const body = await readBody<{ name?: string; email?: string; message?: string }>(event)
  const email = body?.email?.trim() ?? ''
  const message = body?.message?.trim() ?? ''

  if (!email || !message) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }

  // TODO: send via a real email service.
  console.log('[contact] message:', { name: body?.name, email, message })

  return { ok: true }
})
