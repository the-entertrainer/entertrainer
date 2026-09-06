import {
  type Density,
  type ProviderId,
  GROQ_MAX_TOKENS,
  GEMINI_MAX_TOKENS,
  TEMPERATURE,
  DENSITY_TARGETS,
  BIBLE_MINS,
  PANEL_BATCH_SIZE,
  normalizeDensity,
  preferredProviderForAction,
  tryParseJson,
  systemForAction,
  buildUserPrompt,
  normalizeOutline,
  normalizeBible,
  normalizePages,
  mergePageBatches,
  countStoryPanels,
  bibleMeetsMinimums,
  outlineMeetsFloors
} from '../../utils/dialogue-canon'

/** Dialogue Canon Engine — expand / chat / densify / bible / enrich_bible / pages */
export const maxDuration = 120


const DEFAULT_GROQ_MODEL = 'groq/compound'
const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite'

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

async function callGroq(opts: {
  apiKey: string
  model: string
  systemPrompt: string
  userPrompt: string
  temperature: number
}): Promise<ProviderCallResult> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'EntertrainerDialogueCanon/2.0 (https://entertrainer.in; dialogue-canon)'
    },
    body: JSON.stringify({
      model: opts.model,
      messages: [
        { role: 'system', content: opts.systemPrompt },
        { role: 'user', content: opts.userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: opts.temperature,
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
  temperature: number
}): Promise<ProviderCallResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(opts.model)}:generateContent`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-goog-api-key': opts.apiKey,
      'User-Agent': 'EntertrainerDialogueCanon/2.0 (https://entertrainer.in; dialogue-canon)'
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: opts.systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: opts.userPrompt }] }],
      generationConfig: {
        temperature: opts.temperature,
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

async function generateJson(opts: {
  provider: ProviderId
  apiKey: string
  model: string
  systemPrompt: string
  userPrompt: string
  temperature: number
  providerLabel: string
}): Promise<any> {
  const callProvider = opts.provider === 'groq' ? callGroq : callGemini
  let parsed: any = null
  let lastError = ''

  const first = await callProvider({
    apiKey: opts.apiKey,
    model: opts.model,
    systemPrompt: opts.systemPrompt,
    userPrompt: opts.userPrompt,
    temperature: opts.temperature
  })
  if (first.status === 429) {
    throw createError({
      statusCode: 429,
      statusMessage: `${opts.providerLabel} rate limit hit. Wait a minute and retry.`
    })
  }
  if (first.status >= 400) {
    lastError = `${opts.providerLabel} error ${first.status}: ${first.errText.slice(0, 240) || 'request failed'}`
  } else {
    parsed = tryParseJson(first.content)
    if (!parsed) lastError = 'Could not parse story JSON on the first pass.'
  }

  if (!parsed) {
    const retry = await callProvider({
      apiKey: opts.apiKey,
      model: opts.model,
      systemPrompt: opts.systemPrompt,
      userPrompt: opts.userPrompt + '\n\nIMPORTANT: Return ONLY a single valid JSON object matching the required shape.',
      temperature: Math.max(0.2, opts.temperature - 0.15)
    })
    if (retry.status === 429) {
      throw createError({
        statusCode: 429,
        statusMessage: `${opts.providerLabel} rate limit hit on retry. Wait a minute and try again.`
      })
    }
    if (retry.status >= 400) {
      lastError = `Retry ${opts.providerLabel} error ${retry.status}: ${retry.errText.slice(0, 240) || 'request failed'}`
    } else {
      parsed = tryParseJson(retry.content)
      if (!parsed) lastError = 'Retry returned empty or invalid JSON.'
    }
  }

  if (!parsed) {
    throw createError({
      statusCode: 502,
      statusMessage: lastError || 'Could not generate story content. Try a shorter prompt.'
    })
  }
  return parsed
}

async function generatePagesForRequest(opts: {
  body: any
  density: Density
  provider: ProviderId
  apiKey: string
  model: string
  providerLabel: string
}): Promise<{ pages: any[]; provider: ProviderId; model: string }> {
  const { body, density, provider, apiKey, model, providerLabel } = opts
  const bible = normalizeBible(body.bible, body.outline)
  const outline = normalizeOutline(body.outline || {}, density)
  const chapterId = body?.chapterId ? String(body.chapterId) : ''
  const target = DENSITY_TARGETS[density]

  // studio/epic require chapterId (client should loop chapters)
  if ((density === 'studio' || density === 'epic') && !chapterId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'chapterId is required for studio/epic page generation. Call pages once per chapter.'
    })
  }

  const needsBatching = density === 'epic' || (density === 'studio' && target.max > PANEL_BATCH_SIZE)

  if (!needsBatching) {
    const parsed = await generateJson({
      provider,
      apiKey,
      model,
      systemPrompt: systemForAction('pages', density),
      userPrompt: buildUserPrompt('pages', { ...body, outline, bible }, density),
      temperature: TEMPERATURE.pages,
      providerLabel
    })
    const pagesPayload = normalizePages(parsed, bible)
    return { pages: pagesPayload.pages, provider, model }
  }

  // Chunked generation: batches of ≤ PANEL_BATCH_SIZE story panels
  const totalTarget = Math.min(target.max, Math.max(target.min, target.min + 4))
  const batches: any[][] = []
  let generated = 0
  let batchIndex = 0

  while (generated < totalTarget) {
    const remaining = totalTarget - generated
    const batchCount = Math.min(PANEL_BATCH_SIZE, remaining)
    const batchFinal = generated + batchCount >= totalTarget
    const batchBody = {
      ...body,
      outline,
      bible,
      chapterId,
      batchStart: generated,
      batchCount,
      batchFinal: batchFinal || undefined
    }
    const parsed = await generateJson({
      provider,
      apiKey,
      model,
      systemPrompt: systemForAction('pages', density),
      userPrompt: buildUserPrompt('pages', batchBody, density),
      temperature: TEMPERATURE.pages,
      providerLabel
    })
    const chunk = normalizePages(parsed, bible).pages
    batches.push(chunk)
    const got = countStoryPanels(chunk)
    generated += got > 0 ? got : batchCount
    batchIndex += 1
    if (batchIndex > 8) break // hard safety
    if (got === 0) break
  }

  const merged = mergePageBatches(batches)
  // Ensure chapterId stamped on story pages
  for (const pg of merged) {
    if (pg.kind === 'story' && chapterId && !pg.chapterId) pg.chapterId = chapterId
  }
  return { pages: merged, provider, model }
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
  if (!['expand', 'chat', 'densify', 'bible', 'enrich_bible', 'pages'].includes(action)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'action must be one of: expand, chat, densify, bible, enrich_bible, pages'
    })
  }

  const density = normalizeDensity(body?.density ?? body?.outline?.density)

  if (action === 'expand' && !String(body?.plot || '').trim()) {
    throw createError({ statusCode: 400, statusMessage: 'plot is required for expand' })
  }
  if (action === 'chat' && !body?.outline) {
    throw createError({ statusCode: 400, statusMessage: 'outline is required for chat' })
  }
  if (action === 'densify' && !body?.outline) {
    throw createError({ statusCode: 400, statusMessage: 'outline is required for densify' })
  }
  if (action === 'bible' && !body?.outline) {
    throw createError({ statusCode: 400, statusMessage: 'outline is required for bible' })
  }
  if (action === 'enrich_bible' && (!body?.bible || !body?.outline)) {
    throw createError({ statusCode: 400, statusMessage: 'bible and outline are required for enrich_bible' })
  }
  if (action === 'pages' && (!body?.outline || !body?.bible)) {
    throw createError({ statusCode: 400, statusMessage: 'outline and bible are required for pages' })
  }

  let provider: ProviderId
  try {
    provider = preferredProviderForAction(action, groqApiKey, geminiApiKey, body?.provider)
  } catch (err: any) {
    throw err
  }
  if (provider === 'groq' && !groqApiKey) {
    throw createError({ statusCode: 503, statusMessage: 'GROQ_API_KEY is not configured on the server.' })
  }
  if (provider === 'gemini' && !geminiApiKey) {
    throw createError({ statusCode: 503, statusMessage: 'GEMINI_API_KEY is not configured on the server.' })
  }

  const model = provider === 'groq' ? groqModel : geminiModel
  const apiKey = provider === 'groq' ? groqApiKey : geminiApiKey
  const providerLabel = provider === 'groq' ? 'Groq' : 'Gemini'
  const temperature = TEMPERATURE[action] ?? 0.7

  try {
    if (action === 'pages') {
      return await generatePagesForRequest({
        body,
        density,
        provider,
        apiKey,
        model,
        providerLabel
      })
    }

    const parsed = await generateJson({
      provider,
      apiKey,
      model,
      systemPrompt: systemForAction(action, density),
      userPrompt: buildUserPrompt(action, body, density),
      temperature,
      providerLabel
    })

    if (action === 'expand' || action === 'chat' || action === 'densify') {
      let outline = normalizeOutline(parsed.outline || parsed, density)
      // densify must never shrink; if still under floors, surface a hint (client may re-densify)
      if (action === 'densify' && !outlineMeetsFloors(outline, density)) {
        const floors = `Need ≥${density === 'draft' ? 3 : density === 'epic' ? 5 : 4} chapters with denser scenes`
        const msgExtra = ` Still thin vs ${density} floors — ${floors}.`
        const defaultMsg = `Densified “${outline.title}” — sharper conflicts, more scenes.` + msgExtra
        const message = String(parsed.message || defaultMsg).trim()
        return { message, outline, density, provider, model, thin: true }
      }
      const defaultMsg =
        action === 'expand'
          ? `Here's a ${density} beat graph for “${outline.title}”.`
          : action === 'densify'
            ? `Densified “${outline.title}” — sharper conflicts, more scenes.`
            : 'Updated the outline.'
      const message = String(parsed.message || defaultMsg).trim()
      return { message, outline, density, provider, model }
    }

    if (action === 'bible' || action === 'enrich_bible') {
      let bible = normalizeBible(
        action === 'enrich_bible' ? (parsed.bible || parsed) : parsed,
        body.outline
      )
      let enriched = action === 'enrich_bible'
      let check = bibleMeetsMinimums(bible, density)

      // Prefer second LLM pass when cast is thin (bible action only; enrich is already that pass)
      if (action === 'bible' && !check.ok) {
        try {
          const enrichParsed = await generateJson({
            provider,
            apiKey,
            model,
            systemPrompt: systemForAction('enrich_bible', density),
            userPrompt: buildUserPrompt('enrich_bible', { bible, outline: body.outline }, density),
            temperature: TEMPERATURE.enrich_bible ?? 0.4,
            providerLabel
          })
          bible = normalizeBible(enrichParsed.bible || enrichParsed, body.outline)
          enriched = true
          check = bibleMeetsMinimums(bible, density)
        } catch {
          // fall through — return what we have with thin flag
        }
      }

      if (!check.ok && action === 'enrich_bible') {
        const mins = BIBLE_MINS[density]
        throw createError({
          statusCode: 422,
          statusMessage: `Bible cast still thin for ${density}: need ≥${mins.characters} characters and ≥${mins.locations} locations with full visualDNA. Retry enrich_bible.`
        })
      }

      return {
        bible,
        density,
        provider,
        model,
        enriched: enriched || undefined,
        thin: check.ok ? undefined : true,
        bibleMins: BIBLE_MINS[density]
      }
    }

    throw createError({ statusCode: 400, statusMessage: 'Unknown action' })
  } catch (err: any) {
    if (err?.statusCode) throw err
    throw createError({
      statusCode: 502,
      statusMessage: `${providerLabel} request failed: ${err?.message || 'network error'}`
    })
  }
})
