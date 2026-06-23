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

    const draft = String(body?.draft ?? '').trim()
    const tone  = String(body?.tone  ?? 'semi-formal').trim()

    if (!draft) {
      throw createError({ statusCode: 400, message: 'Email draft is required.' })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      throw createError({ statusCode: 422, message: 'API key not configured on the server.' })
    }

    const toneDesc =
      tone === 'casual'     ? 'casual and friendly — warm but not sloppy' :
      tone === 'formal'     ? 'formal and professional — precise, no contractions' :
      /* semi-formal */       'semi-formal — clear, respectful, and natural'

    const systemPrompt =
      `You are an expert email editor. Your only job is to polish the user's draft email and return a JSON object with exactly two keys: "subject" (string) and "body" (string).\n\n` +
      `TARGET TONE: ${toneDesc}\n\n` +
      `STRICT RULES:\n` +
      `- Return ONLY valid JSON — no markdown, no prose, no explanation.\n` +
      `- If the sender's name is missing, sign off as "XYZ".\n` +
      `- If the recipient is unknown, open with "Hi there," or "Hi [Name],".\n` +
      `- For short drafts (under 30 words): only polish grammar/tone — never invent new information or expand the message.\n` +
      `- Vary paragraph structure naturally — avoid uniform single-sentence paragraphs.\n` +
      `- Never use: "hope this email finds you well", "delve", "foster", "furthermore", "moreover", "testament", "please do not hesitate to reach out".\n` +
      `- Never use arbitrary bolding or italics inside the body.\n` +
      `- Never use emojis.\n` +
      `- The subject line should be concise and specific (under 10 words when possible).\n` +
      `- Return only the JSON object, nothing else.`

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
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: `Draft email:\n${draft}` }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.5,
          max_tokens: 1000
        })
      })
    } catch (e: any) {
      throw createError({ statusCode: 422, message: `Could not reach AI service: ${e?.message ?? 'network error'}` })
    }

    if (res.status === 429) {
      throw createError({ statusCode: 429, message: 'Rate limit reached.' })
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
      const match = content.match(/\{[\s\S]*\}/)
      if (match) {
        try { parsed = JSON.parse(match[0]) } catch {}
      }
    }

    if (!parsed || typeof parsed.subject !== 'string' || typeof parsed.body !== 'string') {
      throw createError({ statusCode: 422, message: 'Unexpected AI response shape. Try again.' })
    }

    return {
      subject: parsed.subject.trim(),
      body:    parsed.body.trim()
    }
  } catch (err: any) {
    if (err?.statusCode) throw err
    throw createError({ statusCode: 422, message: `Unexpected error: ${err?.message ?? String(err)}` })
  }
})
