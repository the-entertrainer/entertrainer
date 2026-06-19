export default defineEventHandler(async () => {
  const apiKey = process.env.GROQ_API_KEY ?? ''

  if (!apiKey) {
    return { ok: false, step: 'key-check', error: 'GROQ_API_KEY not set', keyLength: 0, keyPrefix: '' }
  }

  // Step 1: list available models
  let models: string[] = []
  try {
    const mr = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    })
    if (mr.ok) {
      const md = await mr.json()
      models = (md.data ?? []).map((m: any) => m.id).sort()
    } else {
      const t = await mr.text().catch(() => '')
      return { ok: false, step: 'list-models', status: mr.status, error: t.slice(0, 200), keyLength: apiKey.length, keyPrefix: apiKey.slice(0, 4) }
    }
  } catch (err: any) {
    return { ok: false, step: 'list-models', error: err?.message ?? String(err), keyLength: apiKey.length, keyPrefix: apiKey.slice(0, 4) }
  }

  const targetModel = 'llama-3.3-70b-versatile'
  const modelAvailable = models.includes(targetModel)

  // Step 2: make a minimal chat completion
  let chatStatus = 0
  let chatResult: any = null
  try {
    const cr = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: targetModel,
        messages: [{ role: 'user', content: 'Reply with this exact JSON: {"ok":true}' }],
        response_format: { type: 'json_object' },
        max_tokens: 20
      })
    })
    chatStatus = cr.status
    chatResult = await cr.json().catch(async () => ({ raw: await cr.text().catch(() => 'unreadable') }))
  } catch (err: any) {
    return {
      ok: false, step: 'chat-completion', error: err?.message ?? String(err),
      models, modelAvailable, keyLength: apiKey.length, keyPrefix: apiKey.slice(0, 4)
    }
  }

  return {
    ok: chatStatus === 200,
    step: 'done',
    keyLength: apiKey.length,
    keyPrefix: apiKey.slice(0, 4),
    modelAvailable,
    models,
    chatStatus,
    chatResult
  }
})
