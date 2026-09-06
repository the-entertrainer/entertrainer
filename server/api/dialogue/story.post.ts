/** Dialogue AI Story Mode — outline / chat / bible / pages */
export const maxDuration = 60

const DEFAULT_GROQ_MODEL = 'groq/compound'
const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite'
const GROQ_MAX_TOKENS = 7000
const GEMINI_MAX_TOKENS = 8192

type ProviderId = 'groq' | 'gemini'

type ProviderCallResult = {
  content: string
  status: number
  errText: string
}

/** H3/Nitro body parse workaround used elsewhere in this codebase. */
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

function stripJsonFences(raw: string): string {
  let text = String(raw || '').trim()
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  }
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start >= 0 && end > start) text = text.slice(start, end + 1)
  return text.trim()
}

function tryParseJson(content: string): any | null {
  if (!content) return null
  try {
    const parsed = JSON.parse(stripJsonFences(content))
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

async function callGroq(opts: {
  apiKey: string
  model: string
  systemPrompt: string
  userPrompt: string
}): Promise<ProviderCallResult> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'EntertrainerDialogueStory/1.0 (https://entertrainer.in; dialogue-story)'
    },
    body: JSON.stringify({
      model: opts.model,
      messages: [
        { role: 'system', content: opts.systemPrompt },
        { role: 'user', content: opts.userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.75,
      max_tokens: GROQ_MAX_TOKENS
    })
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    return { content: '', status: res.status, errText }
  }
  const payload = await res.json() as any
  const content = String(payload?.choices?.[0]?.message?.content || '')
  return { content, status: res.status, errText: '' }
}

function extractGeminiText(payload: any): string {
  const parts = payload?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) return ''
  return parts
    .map((part: any) => (typeof part?.text === 'string' ? part.text : ''))
    .filter(Boolean)
    .join('\n')
    .trim()
}

async function callGemini(opts: {
  apiKey: string
  model: string
  systemPrompt: string
  userPrompt: string
}): Promise<ProviderCallResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(opts.model)}:generateContent`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-goog-api-key': opts.apiKey,
      'User-Agent': 'EntertrainerDialogueStory/1.0 (https://entertrainer.in; dialogue-story)'
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: opts.systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: opts.userPrompt }] }],
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: GEMINI_MAX_TOKENS,
        responseMimeType: 'application/json'
      }
    })
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    return { content: '', status: res.status, errText }
  }
  const payload = await res.json() as any
  return { content: extractGeminiText(payload), status: res.status, errText: '' }
}

function resolveProvider(
  requested: unknown,
  groqKey: string,
  geminiKey: string
): ProviderId {
  const raw = String(requested || '').trim().toLowerCase()
  if (raw === 'groq' || raw === 'gemini') return raw as ProviderId
  if (groqKey) return 'groq'
  if (geminiKey) return 'gemini'
  throw createError({
    statusCode: 503,
    statusMessage:
      'No AI provider configured. Set GROQ_API_KEY and/or GEMINI_API_KEY in Vercel → Settings → Environment Variables (or local .env) and redeploy.'
  })
}

const SYSTEM_BASE = `You are Dialogue Story Mode, an AI comic writer for Entertrainer Dialogue.
You write original webcomic / vertical-scroll stories. Return ONLY valid JSON (no markdown fences).
Never use copyrighted character names, franchise IP, or trademarked brands as characters.
Keep tone suitable for a general audience phone comic app.`

function systemForAction(action: string): string {
  if (action === 'expand') {
    return `${SYSTEM_BASE}

ACTION expand — expand a short plot into a comic outline.
Return JSON shape:
{
  "message": "short assistant reply to the user",
  "outline": {
    "title": "story title",
    "logline": "one-sentence pitch",
    "chapters": [
      {
        "id": "ch1",
        "title": "chapter title",
        "summary": "2-4 sentences",
        "scenes": [
          { "id": "sc1", "summary": "scene beat", "pageHint": 1 }
        ]
      }
    ],
    "suggestedPages": 8,
    "rationale": "why this page count / structure"
  }
}
Rules:
- 2–5 chapters; each chapter 2–6 scenes.
- suggestedPages = total scene count (or close), typically 6–20.
- pageHint is a positive integer suggesting relative page weight.
- Prefer webtoon-friendly vertical storytelling.`
  }
  if (action === 'chat') {
    return `${SYSTEM_BASE}

ACTION chat — revise an existing outline from user feedback.
You receive prior messages and the current outline JSON.
Return JSON shape:
{
  "message": "what you changed, conversational",
  "outline": { same shape as expand.outline }
}
Preserve chapter/scene ids when possible; invent new ids only for new items.
Keep suggestedPages synced to scene count.`
  }
  if (action === 'bible') {
    return `${SYSTEM_BASE}

ACTION bible — create a Story Bible from an approved outline.
Return JSON shape:
{
  "characters": [
    {
      "id": "char_maya",
      "name": "Maya",
      "role": "protagonist",
      "appearance": "detailed visual description for artists",
      "personality": "short",
      "relationships": "short"
    }
  ],
  "locations": [
    { "id": "loc_station", "name": "Night Bus Station", "description": "visual description" }
  ],
  "visualStyle": "art direction string (medium, palette, line weight, lighting)",
  "toneNotes": "tone / pacing notes",
  "chapters": [ /* copy outline chapters with id, title, summary */ ]
}
Rules:
- Character ids MUST be slug-like: char_<name>, unique, lowercase, underscore.
- Appearance must be specific enough for image generators (age range, hair, clothing, vibe).
- Include 2–8 characters and 1–6 locations.`
  }
  if (action === 'pages') {
    return `${SYSTEM_BASE}

ACTION pages — generate comic page specs with panels and dialogue from outline + bible.
Return JSON shape:
{
  "pages": [
    {
      "id": "page_cover",
      "chapterId": null,
      "title": "Cover",
      "kind": "cover",
      "panels": [
        {
          "id": "pan1",
          "order": 0,
          "scene": "INT. TITLE — night",
          "characters": ["char_maya"],
          "dialogue": [
            { "speakerId": null, "text": "title caption", "balloon": "caption" }
          ],
          "imagePrompt": "full image generation prompt",
          "notes": "optional"
        }
      ]
    }
  ]
}
Rules for imagePrompt (CRITICAL):
1. Start with bible.visualStyle.
2. Name characters as \`ID (Name): appearance\` using bible characters.
3. Specify comic panel framing; prefer 9:16 or webtoon vertical.
4. No copyrighted character names.
5. Include scene slugline / lighting / mood.
Dialogue balloon values: "speech" | "thought" | "caption".
Always include a cover page (kind:"cover") first and a back cover (kind:"back") last.
Story pages use kind:"story". Stack 1–4 panels per story page for webtoon.
If chapterId is provided in the user request, focus story pages on that chapter but still return cover + back.`
  }
  return SYSTEM_BASE
}

function buildUserPrompt(action: string, body: any): string {
  if (action === 'expand') {
    const plot = String(body?.plot || '').trim()
    const tone = String(body?.tone || '').trim()
    return [
      `Plot prompt:\n${plot}`,
      tone ? `Preferred tone: ${tone}` : null,
      'Expand into outline JSON now.'
    ].filter(Boolean).join('\n\n')
  }
  if (action === 'chat') {
    const messages = Array.isArray(body?.messages) ? body.messages : []
    const outline = body?.outline || {}
    const transcript = messages
      .slice(-12)
      .map((m: any) => `${String(m?.role || 'user').toUpperCase()}: ${String(m?.content || '')}`)
      .join('\n')
    return [
      `Current outline JSON:\n${JSON.stringify(outline)}`,
      `Conversation:\n${transcript || '(none)'}`,
      'Apply the latest user request and return updated outline JSON.'
    ].join('\n\n')
  }
  if (action === 'bible') {
    return `Approved outline JSON:\n${JSON.stringify(body?.outline || {})}\n\nCreate the Story Bible JSON now.`
  }
  if (action === 'pages') {
    const chapterId = body?.chapterId ? String(body.chapterId) : ''
    return [
      `Outline JSON:\n${JSON.stringify(body?.outline || {})}`,
      `Story Bible JSON:\n${JSON.stringify(body?.bible || {})}`,
      chapterId ? `Focus chapterId: ${chapterId}` : 'Generate pages for the full story (keep length reasonable: prefer 6–14 story pages + cover + back).',
      'Return pages JSON now.'
    ].join('\n\n')
  }
  return JSON.stringify(body || {})
}

function normalizeOutline(raw: any): any {
  const chapters = Array.isArray(raw?.chapters)
    ? raw.chapters.map((ch: any, i: number) => ({
        id: String(ch?.id || `ch${i + 1}`),
        title: String(ch?.title || `Chapter ${i + 1}`),
        summary: String(ch?.summary || ''),
        scenes: Array.isArray(ch?.scenes)
          ? ch.scenes.map((sc: any, j: number) => ({
              id: String(sc?.id || `sc${i + 1}_${j + 1}`),
              summary: String(sc?.summary || ''),
              pageHint: Math.max(1, Number(sc?.pageHint) || 1)
            }))
          : []
      }))
    : []
  const sceneCount = chapters.reduce((n: number, ch: any) => n + (ch.scenes?.length || 0), 0)
  return {
    title: String(raw?.title || 'Untitled Story').trim() || 'Untitled Story',
    logline: String(raw?.logline || '').trim(),
    chapters,
    suggestedPages: Math.max(1, Number(raw?.suggestedPages) || sceneCount || 1),
    rationale: String(raw?.rationale || '').trim()
  }
}

function normalizeBible(raw: any, outline: any): any {
  const characters = Array.isArray(raw?.characters)
    ? raw.characters.map((c: any, i: number) => {
        const name = String(c?.name || `Character ${i + 1}`).trim()
        let id = String(c?.id || '').trim()
        if (!id) {
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || `c${i + 1}`
          id = slug.startsWith('char_') ? slug : `char_${slug}`
        }
        return {
          id,
          name,
          role: String(c?.role || '').trim(),
          appearance: String(c?.appearance || '').trim(),
          personality: String(c?.personality || '').trim(),
          relationships: String(c?.relationships || '').trim()
        }
      })
    : []
  const locations = Array.isArray(raw?.locations)
    ? raw.locations.map((l: any, i: number) => ({
        id: String(l?.id || `loc_${i + 1}`),
        name: String(l?.name || `Location ${i + 1}`),
        description: String(l?.description || '').trim()
      }))
    : []
  return {
    characters,
    locations,
    visualStyle: String(raw?.visualStyle || 'Clean webtoon ink, soft cel shading, warm night palette').trim(),
    toneNotes: String(raw?.toneNotes || '').trim(),
    chapters: Array.isArray(raw?.chapters) && raw.chapters.length
      ? raw.chapters
      : (outline?.chapters || []).map((ch: any) => ({
          id: ch.id,
          title: ch.title,
          summary: ch.summary
        }))
  }
}

function normalizePages(raw: any): any {
  const pages = Array.isArray(raw?.pages) ? raw.pages : []
  return {
    pages: pages.map((pg: any, i: number) => {
      const kind = ['cover', 'back', 'story'].includes(String(pg?.kind))
        ? String(pg.kind)
        : (i === 0 ? 'cover' : 'story')
      const panels = Array.isArray(pg?.panels)
        ? pg.panels.map((pan: any, j: number) => ({
            id: String(pan?.id || `pan_${i}_${j}`),
            order: Number.isFinite(Number(pan?.order)) ? Number(pan.order) : j,
            scene: String(pan?.scene || '').trim(),
            characters: Array.isArray(pan?.characters)
              ? pan.characters.map((c: any) => String(c))
              : [],
            dialogue: Array.isArray(pan?.dialogue)
              ? pan.dialogue.map((d: any) => ({
                  speakerId: d?.speakerId == null || d?.speakerId === ''
                    ? null
                    : String(d.speakerId),
                  text: String(d?.text || '').trim(),
                  balloon: ['speech', 'thought', 'caption'].includes(String(d?.balloon))
                    ? String(d.balloon)
                    : 'speech'
                }))
              : [],
            imagePrompt: String(pan?.imagePrompt || '').trim(),
            notes: String(pan?.notes || '').trim()
          }))
        : []
      return {
        id: String(pg?.id || `page_${i + 1}`),
        chapterId: pg?.chapterId == null || pg?.chapterId === '' ? null : String(pg.chapterId),
        title: String(pg?.title || `Page ${i + 1}`),
        kind,
        panels
      }
    })
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const groqApiKey = String(config.groqApiKey || process.env.GROQ_API_KEY || '').trim()
  const groqModel = String(config.groqModel || process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL).trim() || DEFAULT_GROQ_MODEL
  const geminiApiKey = String(config.geminiApiKey || process.env.GEMINI_API_KEY || '').trim()
  const geminiModel = String(config.geminiModel || process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL).trim() || DEFAULT_GEMINI_MODEL

  let body: any
  try {
    body = await parseBody(event)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Could not read request body.' })
  }

  const action = String(body?.action || '').trim().toLowerCase()
  if (!['expand', 'chat', 'bible', 'pages'].includes(action)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'action must be one of: expand, chat, bible, pages'
    })
  }

  if (action === 'expand' && !String(body?.plot || '').trim()) {
    throw createError({ statusCode: 400, statusMessage: 'plot is required for expand' })
  }
  if (action === 'chat' && !body?.outline) {
    throw createError({ statusCode: 400, statusMessage: 'outline is required for chat' })
  }
  if (action === 'bible' && !body?.outline) {
    throw createError({ statusCode: 400, statusMessage: 'outline is required for bible' })
  }
  if (action === 'pages' && (!body?.outline || !body?.bible)) {
    throw createError({ statusCode: 400, statusMessage: 'outline and bible are required for pages' })
  }

  const provider = resolveProvider(body?.provider, groqApiKey, geminiApiKey)
  if (provider === 'groq' && !groqApiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'GROQ_API_KEY is not configured on the server.'
    })
  }
  if (provider === 'gemini' && !geminiApiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'GEMINI_API_KEY is not configured on the server.'
    })
  }

  const model = provider === 'groq' ? groqModel : geminiModel
  const apiKey = provider === 'groq' ? groqApiKey : geminiApiKey
  const callProvider = provider === 'groq' ? callGroq : callGemini
  const providerLabel = provider === 'groq' ? 'Groq' : 'Gemini'

  const systemPrompt = systemForAction(action)
  const userPrompt = buildUserPrompt(action, body)

  let parsed: any = null
  let lastError = ''

  try {
    const first = await callProvider({ apiKey, model, systemPrompt, userPrompt })
    if (first.status === 429) {
      throw createError({
        statusCode: 429,
        statusMessage: `${providerLabel} rate limit hit. Wait a minute and retry.`
      })
    }
    if (first.status >= 400) {
      lastError = `${providerLabel} error ${first.status}: ${first.errText.slice(0, 240) || 'request failed'}`
    } else {
      parsed = tryParseJson(first.content)
      if (!parsed) lastError = 'Could not parse story JSON on the first pass.'
    }

    if (!parsed) {
      const retry = await callProvider({
        apiKey,
        model,
        systemPrompt,
        userPrompt: userPrompt + '\n\nIMPORTANT: Return ONLY a single valid JSON object matching the required shape.'
      })
      if (retry.status === 429) {
        throw createError({
          statusCode: 429,
          statusMessage: `${providerLabel} rate limit hit on retry. Wait a minute and try again.`
        })
      }
      if (retry.status >= 400) {
        lastError = `Retry ${providerLabel} error ${retry.status}: ${retry.errText.slice(0, 240) || 'request failed'}`
      } else {
        parsed = tryParseJson(retry.content)
        if (!parsed) lastError = 'Retry returned empty or invalid JSON.'
      }
    }
  } catch (err: any) {
    if (err?.statusCode) throw err
    throw createError({
      statusCode: 502,
      statusMessage: `${providerLabel} request failed: ${err?.message || 'network error'}`
    })
  }

  if (!parsed) {
    throw createError({
      statusCode: 502,
      statusMessage: lastError || 'Could not generate story content. Try a shorter prompt.'
    })
  }

  if (action === 'expand' || action === 'chat') {
    const outline = normalizeOutline(parsed.outline || parsed)
    const message = String(parsed.message || (action === 'expand'
      ? `Here's a draft outline for “${outline.title}”.`
      : 'Updated the outline.')).trim()
    return { message, outline, provider, model }
  }

  if (action === 'bible') {
    const bible = normalizeBible(parsed, body.outline)
    return { bible, provider, model }
  }

  // pages
  const pagesPayload = normalizePages(parsed)
  return { ...pagesPayload, provider, model }
})
