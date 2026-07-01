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

    const raw           = String(body?.raw           ?? '').trim()
    const audience      = String(body?.audience      ?? '').trim()
    const modality      = String(body?.modality      ?? 'eLearning storyboard').trim()
    const tone          = String(body?.tone          ?? 'clear, practical, and learner-centered').trim()
    const authoringTool = String(body?.authoringTool ?? 'Other').trim()
    const screenCount   = Math.max(3, Math.min(20, Number(body?.screenCount ?? 8)))

    const TOOL_HINTS: Record<string, string> = {
      Storyline: 'Articulate Storyline 360 — use slide layers, trigger-driven interactions, branching, and knowledge checks.',
      Rise:      'Articulate Rise 360 — use block-based interactions: flashcards, accordions, tabs, labelled diagrams, and inline knowledge checks.',
      Captivate: 'Adobe Captivate — use fluid boxes, advanced actions, multi-state objects, and xAPI tracking.',
      Vyond:     'Vyond animated video — frame scene directions as character actions, dialogue, and visual motion.',
      HeyGen:    'HeyGen AI video — write narration as teleprompter scripts for AI avatars with background scene notes.',
      Synthesia: 'Synthesia AI video — write clean narration blocks for AI presenters with slide overlay notes.',
      Other:     'General authoring tool — keep interactions and navigation tool-agnostic.',
    }
    const toolHint = TOOL_HINTS[authoringTool] ?? TOOL_HINTS.Other

    if (!raw || raw.length < 20) {
      throw createError({ statusCode: 400, message: 'Paste or upload at least a few lines of source material.' })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      throw createError({ statusCode: 422, message: 'API key not configured on the server.' })
    }

    const systemPrompt = `You are StoryForge, an expert instructional designer and learning storyboard architect. Turn messy raw material into a polished ${modality} storyboard.

Authoring tool target: ${toolHint}

Return ONLY valid JSON with this exact shape:
{
  "title": "short project title",
  "summary": "1-2 sentence learning experience summary",
  "learningObjectives": ["measurable objective", "..."],
  "scenes": [
    {
      "title": "scene title",
      "visualDescription": "specific visual layout, media direction, and on-screen text — tailored to the authoring tool",
      "narration": "spoken audio script or facilitator notes",
      "interactions": "learner action, decision, knowledge check, or reflection prompt — use the authoring tool's actual feature set",
      "navigation": "navigation or branching notes appropriate for the authoring tool",
      "duration": 60,
      "status": "Draft"
    }
  ]
}

Rules:
- Create exactly ${screenCount} scenes unless the source clearly needs fewer; never fewer than 3.
- Preserve facts from the source. If content is unclear, make sensible instructional assumptions instead of inventing risky specifics.
- Make scenes actionable for a designer/developer: concrete visuals, on-screen text, audio, interaction, and navigation.
- Audience: ${audience || 'general adult learners'}.
- Tone: ${tone}.
- Use plain text strings only; no markdown.`

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
            { role: 'user', content: `Raw source material:\n${raw.slice(0, 24000)}` }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.45,
          max_tokens: 5500
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

    const scenes = Array.isArray(parsed.scenes) ? parsed.scenes : []
    if (!scenes.length) throw createError({ statusCode: 422, message: 'AI did not return storyboard scenes. Try again.' })

    return {
      title: String(parsed.title || 'AI Storyboard'),
      summary: String(parsed.summary || ''),
      learningObjectives: Array.isArray(parsed.learningObjectives) ? parsed.learningObjectives.map(String).slice(0, 6) : [],
      scenes: scenes.map((scene: any, index: number) => ({
        id: `s${Date.now()}-${index}`,
        title: String(scene.title || `Scene ${index + 1}`),
        visualDescription: String(scene.visualDescription || ''),
        narration: String(scene.narration || ''),
        interactions: String(scene.interactions || ''),
        navigation: String(scene.navigation || 'Next'),
        duration: Number(scene.duration || 60),
        status: String(scene.status || 'Draft')
      }))
    }
  } catch (err: any) {
    if (err?.statusCode) throw err
    throw createError({ statusCode: 422, message: `Unexpected error: ${err?.message ?? String(err)}` })
  }
})
