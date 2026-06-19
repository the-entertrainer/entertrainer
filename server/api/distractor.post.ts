export default defineEventHandler(async (event) => {
  const log: string[] = ['handler-start']

  try {
    let body: any
    try {
      body = await readBody(event)
      log.push('readBody-ok:' + JSON.stringify(body).slice(0, 80))
    } catch (e: any) {
      return { ok: false, step: 'readBody', error: String(e?.message ?? e), log }
    }

    const question = String(body?.question ?? '').trim()
    const answer   = String(body?.answer   ?? '').trim()
    log.push(`validation: q=${!!question} a=${!!answer}`)

    if (!question || !answer) {
      return { ok: false, step: 'validation', error: 'Question and answer are required.', log }
    }

    const apiKey = process.env.GROQ_API_KEY ?? ''
    log.push(`key: ${apiKey.slice(0, 4)}... len=${apiKey.length}`)

    if (!apiKey) {
      return { ok: false, step: 'key-check', error: 'API key not configured.', log }
    }

    log.push('fetch-start')
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
                'You are an expert instructional designer specialising in multiple-choice question design. ' +
                'Given a question and its correct answer, generate exactly 3 plausible but clearly incorrect distractors. ' +
                'Each distractor must be distinct, grammatically parallel to the correct answer, and believable to ' +
                'someone who has not fully mastered the topic. ' +
                'Return only valid JSON in this exact format: {"distractors": ["...", "...", "..."]}'
            },
            {
              role: 'user',
              content: `Question: ${question}\nCorrect answer: ${answer}`
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.8,
          max_tokens: 400
        })
      })
      log.push(`fetch-done: status=${res.status}`)
    } catch (e: any) {
      return { ok: false, step: 'fetch', error: String(e?.message ?? e), log }
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      log.push(`groq-error: ${errText.slice(0, 100)}`)
      return { ok: false, step: 'groq-status', error: `Groq returned ${res.status}: ${errText.slice(0, 120)}`, log }
    }

    let data: any
    try {
      data = await res.json()
      log.push('res-json-ok')
    } catch (e: any) {
      return { ok: false, step: 'res-json', error: String(e?.message ?? e), log }
    }

    const content = data.choices?.[0]?.message?.content ?? ''
    log.push(`content-len=${content.length} preview=${content.slice(0, 40)}`)

    if (!content) {
      return { ok: false, step: 'content-empty', error: 'AI returned empty response.', log }
    }

    let parsed: any
    try {
      parsed = JSON.parse(content)
      log.push(`parsed-ok keys=${Object.keys(parsed).join(',')}`)
    } catch (e: any) {
      return { ok: false, step: 'parse', error: `JSON parse failed: ${e?.message}`, log, raw: content.slice(0, 200) }
    }

    if (!Array.isArray(parsed.distractors) || parsed.distractors.length < 3) {
      return { ok: false, step: 'shape', error: 'Unexpected AI response shape.', log, raw: JSON.stringify(parsed).slice(0, 200) }
    }

    log.push('success')
    return { ok: true, distractors: parsed.distractors.slice(0, 3) as string[], log }
  } catch (err: any) {
    log.push(`outer-catch: ${err?.message ?? String(err)}`)
    return { ok: false, step: 'outer-catch', error: String(err?.message ?? err), log }
  }
})
