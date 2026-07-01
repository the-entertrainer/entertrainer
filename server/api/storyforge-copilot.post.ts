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

const TOOL_CONTEXT: Record<string, string> = {
  Storyline:  'Articulate Storyline 360. Favour slide layers, states, triggers, variables, drag-and-drop interactions, branching timelines, and knowledge checks with retry logic.',
  Rise:       'Articulate Rise 360. Use block-based layout: scrollable lessons, labelled diagrams, flashcard stacks, tab interactions, accordion blocks, process steps, and Rise-native knowledge checks.',
  Captivate:  'Adobe Captivate. Leverage fluid boxes for responsive layout, multi-state objects, advanced actions, xAPI/SCORM tracking, and virtual-reality scene interactions.',
  Vyond:      'Vyond animated video. Scene directions should specify character actions, scene backgrounds, dialogue sync, on-screen text motion, and transition types.',
  HeyGen:     'HeyGen AI video. Scene directions should provide teleprompter-style narration scripts for AI avatars, background scene choices, and on-screen text or lower-third overlays.',
  Synthesia:  'Synthesia AI video. Scene directions should deliver clean narration blocks for AI presenters, slide-content overlays, chapter markers, and clear camera-angle intent.',
  Other:      'A general-purpose authoring tool. Keep interaction and navigation suggestions tool-agnostic.',
}

const CEFR_CONTEXT: Record<string, string> = {
  A1:    'A1 (Beginner): extremely simple sentences, max 8 words each, only the 1000 most common words, no idioms, no passive voice.',
  A2:    'A2 (Elementary): short, simple sentences, max 12 words, everyday vocabulary, minimal complex grammar.',
  B1:    'B1 (Intermediate): clear straightforward language, max 18 words per sentence, avoid jargon, familiar topics only.',
  B2:    'B2 (Upper-Intermediate): standard professional language, up to 25 words per sentence, technical terms allowed with brief in-line explanation.',
  C1:    'C1 (Advanced): fluent, natural professional prose, complex ideas expressed clearly, discipline-specific vocabulary acceptable.',
  C2:    'C2 (Mastery): full professional complexity, nuanced language, idiomatic expressions, and specialised terminology all acceptable.',
  Plain: 'Plain Language: active voice, sentences under 20 words, common words preferred, acronyms explained on first use, no unnecessary jargon.',
}

export default defineEventHandler(async (event) => {
  try {
    let body: any
    try {
      body = await parseBody(event)
    } catch {
      throw createError({ statusCode: 400, message: 'Could not read request body.' })
    }

    const action        = String(body?.action        ?? '').trim()
    const text          = String(body?.text          ?? '').trim()
    const sceneTitle    = String(body?.sceneTitle    ?? 'Untitled Scene').trim()
    const authoringTool = String(body?.authoringTool ?? 'Other').trim()
    const cefrLevel     = String(body?.cefrLevel     ?? '').trim()
    const audience      = String(body?.audience      ?? 'adult learners').trim()

    if (!action) throw createError({ statusCode: 400, message: 'Action is required.' })

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) throw createError({ statusCode: 422, message: 'API key not configured on the server.' })

    const toolCtx = TOOL_CONTEXT[authoringTool] ?? TOOL_CONTEXT.Other
    const cefrCtx = cefrLevel ? (CEFR_CONTEXT[cefrLevel] ?? '') : ''

    let systemPrompt = ''
    let userMessage  = ''

    if (action === 'rewrite_narration') {
      systemPrompt = `You are an expert instructional writer. Rewrite the narration / audio script for a scene titled "${sceneTitle}".
Authoring tool: ${toolCtx}
${cefrCtx ? `Target language level: ${cefrCtx}` : ''}
Audience: ${audience}
Return ONLY the improved narration. No preamble, no labels, no JSON. Preserve the core message; improve clarity, flow, and alignment with the authoring tool and language level.`
      userMessage = text || 'No narration yet — write an appropriate one for this scene.'

    } else if (action === 'rewrite_visual') {
      systemPrompt = `You are an expert instructional designer. Rewrite the visual description / on-screen text for a scene titled "${sceneTitle}".
Authoring tool: ${toolCtx}
${cefrCtx ? `Target language level: ${cefrCtx}` : ''}
Audience: ${audience}
Return ONLY the improved visual description: specific layout, media choices, on-screen text, and tool-specific components. No preamble, no JSON.`
      userMessage = text || 'No visual description yet — write an appropriate one for this scene.'

    } else if (action === 'suggest_interaction') {
      systemPrompt = `You are an expert instructional designer. Suggest a specific learner interaction for a scene titled "${sceneTitle}".
Authoring tool: ${toolCtx}
Audience: ${audience}
Return ONLY the interaction description: what the learner does, what feedback they receive, and how it connects to the learning objective. Be specific to the authoring tool capabilities. No preamble, no JSON.`
      userMessage = text ? `Current interaction: ${text}` : 'No interaction defined yet.'

    } else if (action === 'suggest_navigation') {
      systemPrompt = `You are an expert instructional designer. Suggest navigation and branching logic for a scene titled "${sceneTitle}".
Authoring tool: ${toolCtx}
Audience: ${audience}
Return ONLY the navigation / branching description, specific to the authoring tool. No preamble, no JSON.`
      userMessage = text ? `Current navigation: ${text}` : 'No navigation defined yet.'

    } else {
      throw createError({ statusCode: 400, message: `Unknown copilot action: ${action}` })
    }

    let res: Response
    try {
      res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model:    'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: userMessage },
          ],
          temperature: 0.55,
          max_tokens:  800,
        }),
      })
    } catch (e: any) {
      throw createError({ statusCode: 422, message: `Could not reach AI service: ${e?.message ?? 'network error'}` })
    }

    if (res.status === 429) throw createError({ statusCode: 429, message: 'Rate limit reached. Please try again in a moment.' })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw createError({ statusCode: 422, message: `AI service returned ${res.status}: ${errText.slice(0, 160)}` })
    }

    const data = await res.json().catch(() => null)
    const suggestion = data?.choices?.[0]?.message?.content?.trim() ?? ''
    if (!suggestion) throw createError({ statusCode: 422, message: 'AI returned an empty suggestion. Try again.' })

    return { suggestion }
  } catch (err: any) {
    if (err?.statusCode) throw err
    throw createError({ statusCode: 422, message: `Unexpected error: ${err?.message ?? String(err)}` })
  }
})
