export default defineEventHandler(async (event) => {
  const { question, answer } = await readBody(event)

  if (!question?.trim() || !answer?.trim()) {
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
            content: `Question: ${question.trim()}\nCorrect answer: ${answer.trim()}`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 400
      })
    })
  } catch {
    throw createError({ statusCode: 422, message: 'Could not reach AI service. Check your connection.' })
  }

  if (!res.ok) {
    throw createError({ statusCode: 422, message: 'AI service unavailable. Please try again.' })
  }

  let data: any
  try {
    data = await res.json()
  } catch {
    throw createError({ statusCode: 422, message: 'Could not parse the AI response. Try again.' })
  }

  const content = data.choices?.[0]?.message?.content ?? ''

  try {
    const parsed = JSON.parse(content)
    if (!Array.isArray(parsed.distractors) || parsed.distractors.length < 3) {
      throw new Error('Unexpected response shape')
    }
    return { distractors: parsed.distractors.slice(0, 3) as string[] }
  } catch {
    throw createError({ statusCode: 422, message: 'Could not parse the AI response. Try again.' })
  }
})
