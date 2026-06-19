export default defineEventHandler(async (event) => {
  const { to, body } = await readBody(event)

  if (!to?.trim() || !body?.trim()) {
    throw createError({ statusCode: 400, message: 'Recipient and email body are required.' })
  }
  if (!to.includes('@')) {
    throw createError({ statusCode: 400, message: 'Please enter a valid email address.' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw createError({ statusCode: 500, message: 'API key not configured on the server.' })
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
            '- "rageLevel" (string — pick exactly one: "Mildly Miffed", "Properly Peeved", "Simmering Fury", "Full Rage Mode", "Red Mist Rising", "Nuclear Meltdown", "LEGENDARY RAGE")\n' +
            '- "rageTaunt" (one punchy, funny, sympathetic sentence — never judgmental)\n' +
            '- "imaginaryReply" (2–4 sentences — a fictional reply from the recipient that is absurd, ' +
            'deflating, or weirdly polite in a way that gives the sender total cathartic satisfaction)\n' +
            'Return only valid JSON.'
        },
        {
          role: 'user',
          content: `Email body:\n${body.trim()}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.85,
      max_tokens: 500
    })
  })

  if (!res.ok) {
    throw createError({ statusCode: 502, message: 'AI service unavailable. Please try again.' })
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content ?? ''

  try {
    const parsed = JSON.parse(content)
    const { aggressiveness, sarcasm, offensiveness, rageLevel, rageTaunt, imaginaryReply } = parsed
    if (
      typeof aggressiveness !== 'number' ||
      typeof sarcasm        !== 'number' ||
      typeof offensiveness  !== 'number' ||
      !rageLevel || !rageTaunt || !imaginaryReply
    ) {
      throw new Error('Unexpected response shape')
    }
    return {
      aggressiveness: Math.min(100, Math.max(0, Math.round(aggressiveness))),
      sarcasm:        Math.min(100, Math.max(0, Math.round(sarcasm))),
      offensiveness:  Math.min(100, Math.max(0, Math.round(offensiveness))),
      rageLevel:      String(rageLevel),
      rageTaunt:      String(rageTaunt),
      imaginaryReply: String(imaginaryReply)
    }
  } catch {
    throw createError({ statusCode: 502, message: 'Could not parse the AI response. Try again.' })
  }
})
