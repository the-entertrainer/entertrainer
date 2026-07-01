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

type CardType = 'Learning Objective' | 'Content' | 'MCQ/Quiz' | 'Scenario' | 'Video/Animation' | 'Summary' | 'Assessment'
type EditableField = 'onscreenHtml' | 'narrationHtml' | 'notesHtml'

const CARD_TYPES: CardType[] = ['Learning Objective', 'Content', 'MCQ/Quiz', 'Scenario', 'Video/Animation', 'Summary', 'Assessment']
const CARD_STATUSES = ['Draft', 'SME Review', 'Approved', 'Final']
const CARD_THEMES = ['Glass', 'Slate', 'Aurora', 'Sunrise']
const CARD_LAYOUTS = ['Stack', 'Split', 'Focus']
const ASSIST_FIELDS: EditableField[] = ['onscreenHtml', 'narrationHtml', 'notesHtml']

function safeString(value: unknown, fallback = '') {
  return String(value ?? fallback).trim()
}

function capLength(value: unknown, max: number, fallback = '') {
  const text = safeString(value, fallback)
  return text.length > max ? text.slice(0, max) : text
}

export default defineEventHandler(async (event) => {
  try {
    let body: any
    try {
      body = await parseBody(event)
    } catch {
      throw createError({ statusCode: 400, message: 'Could not read request body.' })
    }

    const mode = String(body?.mode || 'generate')
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) throw createError({ statusCode: 422, message: 'API key not configured on the server.' })

    if (mode === 'card-assist') {
      const field = ASSIST_FIELDS.includes(body?.field) ? body.field as EditableField : 'notesHtml'
      const instruction = capLength(body?.instruction, 600)
      const tone = capLength(body?.tone, 200, 'clear and practical')
      const audience = capLength(body?.audience, 200, 'general adult learners')
      const card = body?.card || {}
      const title = capLength(card?.title, 120, 'Storyboard card')
      const type = CARD_TYPES.includes(card?.type) ? card.type : 'Content'
      const onscreenText = capLength(card?.onscreenText, 2200)
      const narrationText = capLength(card?.narrationText, 2200)
      const notesText = capLength(card?.notesText, 2200)

      if (!instruction) {
        throw createError({ statusCode: 400, message: 'Card assist instruction is required.' })
      }

      const systemPrompt = `You are an instructional design co-pilot for EnterTrainer StoryForge.
Return ONLY valid JSON in this exact shape:
{
  "field": "${field}",
  "content": "rewritten content as plain text with line breaks",
  "suggestions": ["short actionable addition", "..."]
}
Rules:
- Keep output crisp, structured, and practical.
- Preserve facts and intent from source content.
- Use audience-aware language for ${audience}.
- Follow this tone: ${tone}.
- Do not output markdown.
- suggestions must be 2-4 concise implementation-ready additions.`

      const userPrompt = `Card title: ${title}
Card type: ${type}
Instruction: ${instruction}
Current on-screen text:\n${onscreenText}
Current narration:\n${narrationText}
Current interactions/notes:\n${notesText}`

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.45,
          max_tokens: 900
        })
      }).catch((e: any) => {
        throw createError({ statusCode: 422, message: `Could not reach AI service: ${e?.message ?? 'network error'}` })
      })

      if (response.status === 429) throw createError({ statusCode: 429, message: 'Rate limit reached. Please try again shortly.' })
      if (!response.ok) {
        const errText = await response.text().catch(() => '')
        throw createError({ statusCode: 422, message: `AI service returned ${response.status}: ${errText.slice(0, 180)}` })
      }

      const payload = await response.json().catch(() => null)
      const content = payload?.choices?.[0]?.message?.content || ''
      if (!content) throw createError({ statusCode: 422, message: 'AI returned an empty response. Try again.' })

      let parsed: any
      try {
        parsed = JSON.parse(content)
      } catch {
        const match = content.match(/\{[\s\S]*\}/)
        if (!match) throw createError({ statusCode: 422, message: 'AI response was not valid JSON. Try again.' })
        parsed = JSON.parse(match[0])
      }

      return {
        field,
        content: capLength(parsed?.content, 4000),
        suggestions: Array.isArray(parsed?.suggestions)
          ? parsed.suggestions.map((item: any) => capLength(item, 180)).filter(Boolean).slice(0, 4)
          : []
      }
    }

    const raw = capLength(body?.raw, 28000)
    const audience = capLength(body?.audience, 220, 'general adult learners')
    const modality = capLength(body?.modality, 140, 'eLearning storyboard')
    const tone = capLength(body?.tone, 220, 'clear, practical, learner-centered')
    const cardCount = Math.max(4, Math.min(24, Number(body?.cardCount ?? body?.screenCount ?? 8)))

    if (!raw || raw.length < 20) {
      throw createError({ statusCode: 400, message: 'Paste or upload at least a few lines of source material.' })
    }

    const systemPrompt = `You are StoryForge, an expert instructional designer and branching learning architect.
Turn messy source content into a polished, branch-aware ${modality} plan.
Return ONLY valid JSON with this exact shape:
{
  "title": "short project title",
  "summary": "1-2 sentence summary",
  "learningObjectives": ["measurable objective", "..."],
  "cards": [
    {
      "type": "Learning Objective|Content|MCQ/Quiz|Scenario|Video/Animation|Summary|Assessment",
      "title": "card title",
      "onscreenText": "clean on-screen text",
      "narrationText": "narration script",
      "notesText": "interaction + feedback + implementation notes",
      "duration": 60,
      "status": "Draft|SME Review|Approved|Final",
      "theme": "Glass|Slate|Aurora|Sunrise",
      "layout": "Stack|Split|Focus"
    }
  ],
  "connections": [
    {
      "fromIndex": 1,
      "toIndex": 2,
      "label": "Next|If correct|If incorrect|Remediation|Optional path"
    }
  ]
}
Rules:
- Produce exactly ${cardCount} cards unless source truly requires fewer; never below 4.
- Include realistic branching with at least one decision/remediation path whenever assessment or scenario content appears.
- Keep card text implementation-ready, concise, and non-repetitive.
- Preserve source facts and avoid risky invention.
- Audience: ${audience}
- Tone: ${tone}
- No markdown, no extra keys.`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Raw source material:\n${raw}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.42,
        max_tokens: 5600
      })
    }).catch((e: any) => {
      throw createError({ statusCode: 422, message: `Could not reach AI service: ${e?.message ?? 'network error'}` })
    })

    if (response.status === 429) throw createError({ statusCode: 429, message: 'Rate limit reached. Please try again shortly.' })
    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      throw createError({ statusCode: 422, message: `AI service returned ${response.status}: ${errText.slice(0, 180)}` })
    }

    const payload = await response.json().catch(() => null)
    const content = payload?.choices?.[0]?.message?.content || ''
    if (!content) throw createError({ statusCode: 422, message: 'AI returned an empty response. Try again.' })

    let parsed: any
    try {
      parsed = JSON.parse(content)
    } catch {
      const match = content.match(/\{[\s\S]*\}/)
      if (!match) throw createError({ statusCode: 422, message: 'AI response was not valid JSON. Try again.' })
      parsed = JSON.parse(match[0])
    }

    const rawCards = Array.isArray(parsed?.cards) ? parsed.cards : []
    if (!rawCards.length) throw createError({ statusCode: 422, message: 'AI did not return storyboard cards. Try again.' })

    const cards = rawCards.slice(0, 24).map((entry: any, index: number) => {
      const type = CARD_TYPES.includes(entry?.type) ? entry.type : 'Content'
      const status = CARD_STATUSES.includes(entry?.status) ? entry.status : 'Draft'
      const theme = CARD_THEMES.includes(entry?.theme) ? entry.theme : CARD_THEMES[index % CARD_THEMES.length]
      const layout = CARD_LAYOUTS.includes(entry?.layout) ? entry.layout : CARD_LAYOUTS[index % CARD_LAYOUTS.length]
      const row = Math.floor(index / 4)
      const col = index % 4
      const zig = row % 2 === 0 ? col : 3 - col
      const x = 90 + zig * 340
      const y = 80 + row * 260

      return {
        id: `card-${Date.now()}-${index}`,
        type,
        title: capLength(entry?.title, 120, `${type} ${index + 1}`),
        onscreenText: capLength(entry?.onscreenText ?? entry?.visualDescription, 2200),
        narrationText: capLength(entry?.narrationText ?? entry?.narration, 2200),
        notesText: capLength(entry?.notesText ?? entry?.interactions ?? entry?.navigation, 2200),
        duration: Math.max(20, Math.min(360, Number(entry?.duration || 60))),
        status,
        theme,
        layout,
        x,
        y
      }
    })

    const cardByIndex = new Map(cards.map((card, idx) => [idx + 1, card.id]))
    let connections = Array.isArray(parsed?.connections)
      ? parsed.connections
        .map((link: any, idx: number) => {
          const fromId = cardByIndex.get(Number(link?.fromIndex))
          const toId = cardByIndex.get(Number(link?.toIndex))
          if (!fromId || !toId || fromId === toId) return null
          return {
            id: `link-${Date.now()}-${idx}`,
            fromId,
            toId,
            label: capLength(link?.label, 40, 'Next')
          }
        })
        .filter(Boolean)
      : []

    if (!connections.length) {
      connections = cards.slice(1).map((card: any, index: number) => ({
        id: `link-${Date.now()}-fallback-${index}`,
        fromId: cards[index].id,
        toId: card.id,
        label: 'Next'
      }))
    }

    const scenes = cards.map((card: any) => ({
      id: card.id,
      title: card.title,
      visualDescription: card.onscreenText,
      narration: card.narrationText,
      interactions: card.notesText,
      navigation: connections
        .filter((link: any) => link.fromId === card.id)
        .map((link: any) => {
          const target = cards.find((entry: any) => entry.id === link.toId)
          return `${link.label} -> ${target?.title || 'Next card'}`
        })
        .join(' | ') || 'Next',
      duration: card.duration,
      status: card.status
    }))

    return {
      title: capLength(parsed?.title, 140, 'AI Storyboard'),
      summary: capLength(parsed?.summary, 420),
      learningObjectives: Array.isArray(parsed?.learningObjectives)
        ? parsed.learningObjectives.map((item: any) => capLength(item, 220)).filter(Boolean).slice(0, 8)
        : [],
      cards,
      connections,
      scenes
    }
  } catch (err: any) {
    if (err?.statusCode) throw err
    throw createError({ statusCode: 422, message: `Unexpected error: ${err?.message ?? String(err)}` })
  }
})
