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
    const context = String(body?.context ?? '').trim()
    const audience = String(body?.audience ?? '').trim()
    const refineInstruction = String(body?.refineInstruction ?? '').trim()

    if (!draft) {
      throw createError({ statusCode: 400, message: 'Email draft is required.' })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      throw createError({ statusCode: 422, message: 'API key not configured on the server.' })
    }

    const toneDesc =
      tone === 'casual'     ? 'casual and friendly — warm, conversational, but still professional' :
      tone === 'formal'     ? 'formal and professional — precise, no contractions, respectful distance' :
      /* semi-formal */       'semi-formal — clear, respectful, and natural (recommended default)'

    const audienceDesc = audience ? `AUDIENCE: ${audience}. ` : ''
    const contextDesc = context ? `CONTEXT / GOAL: ${context}. ` : ''
    const refinePart = refineInstruction ? `REFINE INSTRUCTION: ${refineInstruction}. Apply this on top of the original draft while keeping the target tone.` : ''

    const systemPrompt =
      `You are an expert email coach who specializes in clear, action-oriented professional communication.\n\n` +
      `TASK: Turn the user's messy draft into a polished, effective email.\n` +
      `TARGET TONE: ${toneDesc}\n` +
      `${audienceDesc}${contextDesc}${refinePart}\n\n` +
      `RETURN ONLY this exact JSON shape (no markdown, no extra text):\n` +
      `{\n` +
      `  "subject": "concise, specific subject line (ideally 6-10 words)",\n` +
      `  "body": "the full polished email body as plain text with natural paragraph breaks",\n` +
      `  "improvements": ["3 to 5 short, specific bullets explaining the key improvements and why they matter"]\n` +
      `}\n\n` +
      `STRICT RULES:\n` +
      `- Never use corporate fluff: "hope this email finds you well", "please do not hesitate to reach out", "delve", "foster", "furthermore", "moreover", "testament".\n` +
      `- Make the ask or next step crystal clear (who should do what by when).\n` +
      `- Use short paragraphs and varied sentence length.\n` +
      `- If sender name is missing, sign as "— [Your Name]".\n` +
      `- If recipient is unclear, use "Hi [Name]," or "Hi team,".\n` +
      `- For very short drafts (< 25 words), focus on clarity and structure rather than adding content.\n` +
      `- improvements should be honest, educational, and specific (e.g. "Replaced vague request with a clear deadline and owner").\n` +
      `- Subject must be useful and specific, never generic.`

    const userContent = refineInstruction
      ? `Original messy draft:\n${draft}`
      : `Messy draft:\n${draft}`

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
            { role: 'user',   content: userContent }
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

    const improvements = Array.isArray(parsed.improvements)
      ? parsed.improvements.map((s: any) => String(s).trim()).filter(Boolean)
      : []

    return {
      subject: parsed.subject.trim(),
      body:    parsed.body.trim(),
      improvements
    }
  } catch (err: any) {
    if (err?.statusCode) throw err
    throw createError({ statusCode: 422, message: `Unexpected error: ${err?.message ?? String(err)}` })
  }
})
