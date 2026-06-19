export default defineEventHandler(async (event) => {
  try {
    let body: any
    try {
      body = await readBody(event)
    } catch {
      throw createError({ statusCode: 400, message: 'Could not read request body.' })
    }

    const question = String(body?.question ?? '').trim()
    const answer   = String(body?.answer   ?? '').trim()

    if (!question || !answer) {
      throw createError({ statusCode: 400, message: 'Question and answer are required.' })
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
    } catch (fetchErr: any) {
      throw createError({ statusCode: 422, message: `Could not reach AI service: ${fetchErr?.message ?? 'network error'}` })
    }

    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      throw createError({ statusCode: 422, message: `AI service returned ${res.status}: ${errBody.slice(0, 120)}` })
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

    if (!Array.isArray(parsed.distractors) || parsed.distractors.length < 3) {
      throw createError({ statusCode: 422, message: `Unexpected AI response shape. Try again.` })
    }

    return { distractors: parsed.distractors.slice(0, 3) as string[] }
  } catch (err: any) {
    if (err?.statusCode) throw err
    throw createError({ statusCode: 422, message: `Unexpected error: ${err?.message ?? String(err)}` })
  }
})
