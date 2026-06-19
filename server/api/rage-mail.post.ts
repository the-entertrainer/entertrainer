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
                'You are a RAGE analyst scoring an email for emotional intensity. Be strict and accurate — do NOT inflate scores.\n\n' +

                'SCORING RULES:\n' +
                '- If the email is polite, neutral, or has no real anger, score ALL dimensions 0–15.\n' +
                '- If the email is repetitive (same phrase repeated many times) or very short (under 20 words), treat it as low-substance and score 0–20.\n' +
                '- If the email is off-topic or has no emotional content, score all dimensions 0–10.\n' +
                '- Only score 70+ when the email is genuinely, viscerally angry with specific personal grievances.\n' +
                '- Only score 90+ when the email contains extreme language, threats, or serious personal attacks.\n\n' +

                'SCORE ANCHORS — use these as calibration:\n' +
                '"I would appreciate a timely response." → aggressiveness: 5, sarcasm: 0, offensiveness: 0\n' +
                '"This is unacceptable and I expect better from you." → aggressiveness: 25, sarcasm: 10, offensiveness: 5\n' +
                '"I am absolutely furious about what happened and you owe me an explanation." → aggressiveness: 55, sarcasm: 20, offensiveness: 15\n' +
                '"You have single-handedly destroyed this project with your incompetence and I am done pretending otherwise." → aggressiveness: 75, sarcasm: 35, offensiveness: 40\n' +
                '"You are a pathetic excuse for a [role] and everyone in this office knows it." → aggressiveness: 90, sarcasm: 50, offensiveness: 85\n\n' +

                'Return a JSON object with:\n' +
                '- "aggressiveness" (integer 0–100, see anchors above)\n' +
                '- "sarcasm" (integer 0–100)\n' +
                '- "offensiveness" (integer 0–100)\n' +
                '- "authenticity" (integer 0–100 — how raw, personal, and specific this email feels vs. generic/polished/templated. ' +
                'High authenticity = specific names, real grievances, personal details, raw unfiltered emotion. ' +
                'Low authenticity = could have been written by anyone, overly formal structure, no personal specifics, suspiciously perfect prose.)\n' +
                '- "rageTaunt" (one short, punchy sentence — sympathetic and validating, like a supportive friend who totally gets it. Never judgmental.)\n' +
                '- "rageVerdict" (1–2 sentences — vivid, cathartic validation of the sender\'s rage. ' +
                'Sound like the one friend who finally says "YES, you are COMPLETELY right to be this angry." ' +
                'Be specific to the email\'s content — reference what they\'re angry about. Never generic. Never a literary critique.)\n' +
                'Return only valid JSON.'
            },
            {
              role: 'user',
              content: `Email body:\n${mailBody}`
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.75,
          max_tokens: 700
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

    const { aggressiveness, sarcasm, offensiveness, authenticity, rageTaunt, rageVerdict } = parsed
    if (
      typeof aggressiveness !== 'number' ||
      typeof sarcasm        !== 'number' ||
      typeof offensiveness  !== 'number' ||
      typeof authenticity   !== 'number' ||
      !rageTaunt || !rageVerdict
    ) {
      throw createError({ statusCode: 422, message: 'Unexpected AI response shape. Try again.' })
    }

    return {
      aggressiveness: Math.min(100, Math.max(0, Math.round(aggressiveness))),
      sarcasm:        Math.min(100, Math.max(0, Math.round(sarcasm))),
      offensiveness:  Math.min(100, Math.max(0, Math.round(offensiveness))),
      authenticity:   Math.min(100, Math.max(0, Math.round(authenticity))),
      rageTaunt:      String(rageTaunt),
      rageVerdict:    String(rageVerdict)
    }
  } catch (err: any) {
    if (err?.statusCode) throw err
    throw createError({ statusCode: 422, message: `Unexpected error: ${err?.message ?? String(err)}` })
  }
})
