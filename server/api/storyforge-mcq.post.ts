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

    const scenes = Array.isArray(body?.scenes) ? body.scenes : []
    const count = Math.max(1, Math.min(15, Number(body?.count ?? 5)))
    if (!scenes.length) throw createError({ statusCode: 400, message: 'Add at least one scene before generating knowledge checks.' })

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) throw createError({ statusCode: 422, message: 'API key not configured on the server.' })

    const sceneList = scenes.slice(0, 40).map((s: any, i: number) =>
      `${i + 1}. ${String(s.title || 'Untitled')} — ${String(s.visualDescription || '')} ${String(s.narration || '')}`.slice(0, 400)
    ).join('\n')

    const systemPrompt = `You are an expert instructional designer writing multiple-choice knowledge checks for an eLearning storyboard.
Return ONLY valid JSON: { "mcqs": [ { "sceneTitle": "exact scene title this question checks", "question": "...", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "..." } ] }
Rules:
- Create exactly ${count} questions, each tied to a specific scene title from the list (use the exact title text given).
- Exactly 4 options per question, exactly one correct (correctIndex 0-3).
- Test understanding of the scene content, not trivia. Plain text only, no markdown.`

    let res: Response
    try {
      res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Storyboard scenes:\n${sceneList}` }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.6,
          max_tokens: 3000
        })
      })
    } catch (e: any) {
      throw createError({ statusCode: 422, message: `Could not reach AI service: ${e?.message ?? 'network error'}` })
    }

    if (res.status === 429) throw createError({ statusCode: 429, message: 'Rate limit reached. Please try again shortly.' })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw createError({ statusCode: 422, message: `AI service returned ${res.status}: ${errText.slice(0, 160)}` })
    }

    const data = await res.json().catch(() => null)
    const content = data?.choices?.[0]?.message?.content ?? ''
    if (!content) throw createError({ statusCode: 422, message: 'AI returned an empty response. Try again.' })

    let parsed: any
    try {
      parsed = JSON.parse(content)
    } catch {
      const match = content.match(/\{[\s\S]*\}/)
      if (!match) throw createError({ statusCode: 422, message: 'AI response was not valid JSON. Try again.' })
      parsed = JSON.parse(match[0])
    }

    const rawMcqs = Array.isArray(parsed.mcqs) ? parsed.mcqs : []
    if (!rawMcqs.length) throw createError({ statusCode: 422, message: 'AI did not return any questions. Try again.' })

    const titleToId = new Map(scenes.map((s: any) => [String(s.title || '').trim().toLowerCase(), s.id]))
    const stamp = Date.now()
    const mcqs = rawMcqs.slice(0, count).map((mcq: any, index: number) => {
      const options = (Array.isArray(mcq.options) ? mcq.options : []).slice(0, 4).map(String)
      while (options.length < 4) options.push('')
      const correctIndex = Math.max(0, Math.min(3, Number(mcq.correctIndex ?? 0)))
      const linkedTitle = String(mcq.sceneTitle || '').trim().toLowerCase()
      return {
        id: `m${stamp}-${index}`,
        sceneId: titleToId.get(linkedTitle) || null,
        question: String(mcq.question || ''),
        options: options.map((text: string, i: number) => ({ id: `m${stamp}-${index}-o${i}`, text, correct: i === correctIndex })),
        explanation: String(mcq.explanation || '')
      }
    })

    return { mcqs }
  } catch (err: any) {
    if (err?.statusCode) throw err
    throw createError({ statusCode: 422, message: `Unexpected error: ${err?.message ?? String(err)}` })
  }
})
