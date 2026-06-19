// H3 v2 (Nuxt auto-imports) calls event.req.text() in readBody,
// but Nitro 2.x creates H3 v1.x events where event.req is a Node.js
// IncomingMessage — not a Web Request — so .text() doesn't exist.
// Read directly from the Node.js stream to bypass this version mismatch.
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

export default defineEventHandler(async (event) => {
  try {
    let body: any
    try {
      body = await parseBody(event)
    } catch {
      throw createError({ statusCode: 400, message: 'Could not read request body.' })
    }

    const mailBody = String(body?.body ?? '').trim()

    if (!mailBody) {
      throw createError({ statusCode: 400, message: 'Email body is required.' })
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
                '- "rageVerdict" (1–2 sentences — a poetic, dramatic expert critique of this email as a piece of fury writing. ' +
                'Speak like a sharp literary critic of anger: evocative, vivid, never generic. ' +
                'e.g. "This email radiates enough heat to melt the polar caps and the HR department simultaneously.")\n' +
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

    const { aggressiveness, sarcasm, offensiveness, rageTaunt, rageVerdict } = parsed
    if (
      typeof aggressiveness !== 'number' ||
      typeof sarcasm        !== 'number' ||
      typeof offensiveness  !== 'number' ||
      !rageTaunt || !rageVerdict
    ) {
      throw createError({ statusCode: 422, message: 'Unexpected AI response shape. Try again.' })
    }

    return {
      aggressiveness: Math.min(100, Math.max(0, Math.round(aggressiveness))),
      sarcasm:        Math.min(100, Math.max(0, Math.round(sarcasm))),
      offensiveness:  Math.min(100, Math.max(0, Math.round(offensiveness))),
      rageTaunt:      String(rageTaunt),
      rageVerdict:    String(rageVerdict)
    }
  } catch (err: any) {
    if (err?.statusCode) throw err
    throw createError({ statusCode: 422, message: `Unexpected error: ${err?.message ?? String(err)}` })
  }
})
