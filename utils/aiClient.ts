// Thin browser-side Groq client. The user's key is passed per call and the
// request goes directly to api.groq.com — nothing touches our server.

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

export interface ChatOptions {
  temperature?: number
  maxTokens?: number
}

export async function groqChat(
  key: string,
  system: string,
  user: string,
  opts: ChatOptions = {}
): Promise<string> {
  let res: Response
  try {
    res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        response_format: { type: 'json_object' },
        temperature: opts.temperature ?? 0.4,
        max_tokens: opts.maxTokens ?? 4000
      })
    })
  } catch {
    throw new Error('Could not reach Groq. Check your connection.')
  }
  if (res.status === 401 || res.status === 403) throw new Error('Your Groq key was rejected — re-validate it in AI settings.')
  if (res.status === 429) throw new Error('Groq rate limit hit — wait a moment and try again.')
  if (!res.ok) throw new Error(`Groq responded with ${res.status}.`)
  const data = await res.json().catch(() => null)
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error('Groq returned an empty response — try again.')
  return content
}

// AI output is never trusted raw: pull the first JSON object out of
// whatever came back, fences and preambles included.
export function extractJson(content: string): any {
  try { return JSON.parse(content) } catch {}
  const cleaned = content.replace(/```(?:json)?/gi, '')
  const match = cleaned.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('The AI response was not valid JSON — try again.')
  return JSON.parse(match[0])
}
