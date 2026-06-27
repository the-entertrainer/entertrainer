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

function fallbackModules(topics: string[], audiences: string[]) {
  return topics.map((topic) => ({
    topic,
    duration:    '2h',
    method:      'In-person',
    slot:        'Any',
    audiences:   audiences.length ? [audiences[0]] : [],
    facilitator: '',
    priority:    'Medium'
  }))
}

export default defineEventHandler(async (event) => {
  let body: any
  try {
    body = await parseBody(event)
  } catch {
    throw createError({ statusCode: 400, message: 'Could not read request body.' })
  }

  const topicsText = String(body?.topicsText ?? '').trim()
  const audiences  = Array.isArray(body?.audiences) ? body.audiences as string[] : []

  if (!topicsText) {
    throw createError({ statusCode: 400, message: 'topicsText is required.' })
  }

  const topics = topicsText
    .split('\n')
    .map((l: string) => l.split('|')[0].trim())
    .filter(Boolean)

  if (!topics.length) {
    throw createError({ statusCode: 400, message: 'No topics found in topicsText.' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return { fallback: true, modules: fallbackModules(topics, audiences) }
  }

  const audienceList = audiences.length ? audiences.join(', ') : 'All Staff'

  const systemPrompt =
    `You are an expert L&D curriculum designer. For each training topic, suggest metadata that helps build an effective training plan.\n\n` +
    `For each topic assign:\n` +
    `- duration: one of [1h, 1.5h, 2h, 3h, 4h, Full day] — estimate based on topic depth\n` +
    `- method: one of [In-person, Virtual, Hybrid, Self-paced] — choose based on topic nature\n` +
    `- audiences: an array containing one or more of the available audiences that benefit most\n` +
    `- priority: one of [High, Medium, Low] — High for foundational/compliance, Low for optional enrichment\n` +
    `- facilitator: always empty string ""\n\n` +
    `Available audiences: ${audienceList}\n\n` +
    `Return ONLY valid JSON:\n` +
    `{ "modules": [{ "topic": "...", "duration": "...", "method": "...", "audiences": [...], "priority": "...", "facilitator": "" }, ...] }\n` +
    `The modules array must contain exactly one entry per input topic, in the same order. Do not add or remove topics.`

  let res: Response
  try {
    res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({
        model:           'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: `Training topics:\n${topics.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')}` }
        ],
        response_format: { type: 'json_object' },
        temperature:     0.3,
        max_tokens:      1200
      })
    })
  } catch {
    return { fallback: true, modules: fallbackModules(topics, audiences) }
  }

  if (res.status === 429) {
    throw createError({ statusCode: 429, message: 'Rate limit reached.' })
  }

  if (!res.ok) {
    return { fallback: true, modules: fallbackModules(topics, audiences) }
  }

  let data: any
  try { data = await res.json() } catch { return { fallback: true, modules: fallbackModules(topics, audiences) } }

  const content = data.choices?.[0]?.message?.content ?? ''
  if (!content) return { fallback: true, modules: fallbackModules(topics, audiences) }

  let parsed: any
  try {
    parsed = JSON.parse(content)
  } catch {
    const m = content.match(/\{[\s\S]*\}/)
    if (m) { try { parsed = JSON.parse(m[0]) } catch {} }
  }

  if (!parsed || !Array.isArray(parsed.modules) || parsed.modules.length !== topics.length) {
    return { fallback: true, modules: fallbackModules(topics, audiences) }
  }

  return {
    fallback: false,
    modules:  parsed.modules.map((m: any, i: number) => ({
      topic:       topics[i],
      duration:    String(m.duration    ?? '2h').trim(),
      method:      String(m.method      ?? 'In-person').trim(),
      slot:        'Any',
      audiences:   Array.isArray(m.audiences) ? m.audiences.map(String) : [],
      facilitator: '',
      priority:    String(m.priority    ?? 'Medium').trim()
    }))
  }
})
