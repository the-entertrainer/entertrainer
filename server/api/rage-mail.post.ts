// Nitro's Vercel preset stores the body as a string on event.req.text instead
// of a callable method, which breaks H3's readBody. Read it directly.
async function parseBody(event: any): Promise<any> {
  const t = event.req?.text
  if (typeof t === 'string') return t ? JSON.parse(t) : {}
  return await readBody(event)
}

export default defineEventHandler(async (event) => {
  try {
    let body: any
    try {
      body = await parseBody(event)
    } catch {
      throw createError({ statusCode: 400, message: 'Could not read request body.' })
    }

    const to       = String(body?.to   ?? '').trim()
    const mailBody = String(body?.body ?? '').trim()

    if (!to || !mailBody) {
      throw createError({ statusCode: 400, message: 'Recipient and email body are required.' })
    }
    if (!to.includes('@')) {
      throw createError({ statusCode: 400, message: 'Please enter a valid email address.' })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      throw createError({ statusCode: 422, message: 'API key not configured on the server.' })
    }

    let res: Response
    try {
      res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content:
                'You are a RAGE analyst. Analyse the email body provided and return a JSON object with:\n' +
                '- "aggressiveness" (integer 0–100)\n' +
                '- "sarcasm" (integer 0–100)\n' +
                '- "offensiveness" (integer 0–100)\n' +
                '- "rageTaunt" (one punchy, funny, sympathetic sentence — never judgmental)\n' +
                '- "imaginaryReply" (2–4 sentences — a fictional reply from the recipient that is absurd, ' +
                'deflating, or weirdly polite in a way that gives the sender total cathartic satisfaction)\n' +
                'Return only valid JSON.'
            },
            {
              role: 'user',
              content: `Email body:\n${mailBody}`
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.85,
          max_tokens: 600
        })
      })
    } catch (e: any) {
      throw createError({ statusCode: 422, message: `Could not reach AI service: ${e?.message ?? 'network error'}` })
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw createError({ statusCode: 422, message: `AI service returned ${res.status}: ${errText.slice(0, 120)}` })
    }

    let data: any
    try {
      data = await res.json()
    } catch {
      throw createError({ statusCode: 422, message: 'Could not parse the AI response. Try again.' })
    }

    const content = data.choices?.[0]?.message?.content ?? ''
    if (!content) {
      throw createError({ statusCode: 422, message: 'AI returned an empty response. Try again.' })
    }

    let parsed: any
    try {
      parsed = JSON.parse(content)
    } catch {
      throw createError({ statusCode: 422, message: 'AI response was not valid JSON. Try again.' })
    }

    const { aggressiveness, sarcasm, offensiveness, rageTaunt, imaginaryReply } = parsed
    if (
      typeof aggressiveness !== 'number' ||
      typeof sarcasm        !== 'number' ||
      typeof offensiveness  !== 'number' ||
      !rageTaunt || !imaginaryReply
    ) {
      throw createError({ statusCode: 422, message: 'Unexpected AI response shape. Try again.' })
    }

    return {
      aggressiveness: Math.min(100, Math.max(0, Math.round(aggressiveness))),
      sarcasm:        Math.min(100, Math.max(0, Math.round(sarcasm))),
      offensiveness:  Math.min(100, Math.max(0, Math.round(offensiveness))),
      rageTaunt:      String(rageTaunt),
      imaginaryReply: String(imaginaryReply)
    }
  } catch (err: any) {
    if (err?.statusCode) throw err
    throw createError({ statusCode: 422, message: `Unexpected error: ${err?.message ?? String(err)}` })
  }
})
