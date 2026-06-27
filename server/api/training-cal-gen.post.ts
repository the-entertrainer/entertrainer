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

    const month      = Number(body?.month)
    const year       = Number(body?.year)
    const topics     = Array.isArray(body?.topics)       ? body.topics as string[]  : []
    const preferredDays = Array.isArray(body?.preferredDays) ? body.preferredDays as number[] : [1,2,3,4,5]
    const timeSlots  = Array.isArray(body?.timeSlots)    ? body.timeSlots as string[] : []
    const maxPerDay  = Number(body?.maxPerDay) || 2
    const audience   = String(body?.audience ?? '').trim()

    if (!month || !year || topics.length === 0) {
      throw createError({ statusCode: 400, message: 'month, year and topics are required.' })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return { fallback: true, reason: 'no-key' }
    }

    const daysInMonth = new Date(year, month, 0).getDate()
    const availableDays: number[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      const wd = new Date(year, month - 1, d).getDay()
      if (preferredDays.includes(wd)) availableDays.push(d)
    }

    const systemPrompt =
      `You are an expert L&D scheduling assistant. Sequence the given training topics into the most pedagogically effective order for adult learners.\n\n` +
      `PRINCIPLES:\n` +
      `- Foundational topics before advanced ones\n` +
      `- Group related topics together to aid retention\n` +
      `- Alternate heavy cognitive-load sessions with lighter ones for balance\n` +
      `- Avoid scheduling the same facilitator or similar content in back-to-back slots\n` +
      `- Spread content types evenly across the month\n\n` +
      `CONSTRAINTS:\n` +
      `- Available training days this month: ${availableDays.join(', ')}\n` +
      `- Time slots per day: ${timeSlots.join(', ')}\n` +
      `- Max sessions per day: ${maxPerDay}\n` +
      (audience ? `- Target audience: ${audience}\n` : '') +
      `\nReturn ONLY valid JSON with this exact shape:\n` +
      `{ "orderedTopics": ["topic1", "topic2", ...], "reasoning": "one short paragraph explaining the sequencing logic" }\n` +
      `orderedTopics must contain every topic exactly once, reordered for optimal learning flow. No new topics.`

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
            { role: 'user',   content: `Training topics to sequence:\n${topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}` }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.4,
          max_tokens: 800
        })
      })
    } catch (e: any) {
      return { fallback: true, reason: 'network' }
    }

    if (res.status === 429) {
      throw createError({ statusCode: 429, message: 'Rate limit reached.' })
    }

    if (!res.ok) {
      return { fallback: true, reason: `api-${res.status}` }
    }

    let data: any
    try { data = await res.json() } catch { return { fallback: true, reason: 'parse' } }

    const content = data.choices?.[0]?.message?.content ?? ''
    if (!content) return { fallback: true, reason: 'empty' }

    let parsed: any
    try {
      parsed = JSON.parse(content)
    } catch {
      const m = content.match(/\{[\s\S]*\}/)
      if (m) { try { parsed = JSON.parse(m[0]) } catch {} }
    }

    if (!parsed || !Array.isArray(parsed.orderedTopics)) {
      return { fallback: true, reason: 'shape' }
    }

    // Ensure every submitted topic is present (guard against hallucination)
    const returned = new Set(parsed.orderedTopics.map((t: string) => t.trim().toLowerCase()))
    const allPresent = topics.every(t => returned.has(t.trim().toLowerCase()))
    if (!allPresent) return { fallback: true, reason: 'missing-topics' }

    return {
      fallback:      false,
      orderedTopics: parsed.orderedTopics as string[],
      reasoning:     String(parsed.reasoning ?? '')
    }
  } catch (err: any) {
    if (err?.statusCode) throw err
    return { fallback: true, reason: 'unexpected' }
  }
})
