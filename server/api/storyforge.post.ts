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

const TOOL_GUIDANCE: Record<string, string> = {
  storyline: 'Articulate Storyline 360: suggest triggers, variables, states, layers, slide-level interactions, branching, accessible keyboard alternatives, and concise developer notes.',
  rise: 'Articulate Rise: suggest specific Rise blocks, lessons, process/accordion/tabs blocks, knowledge checks, scenario blocks, and mobile-friendly chunking.',
  captivate: 'Adobe Captivate: suggest advanced actions, variables, responsive behavior, simulations, software-demo steps, conditional actions, and accessibility notes.',
  vyond: 'Vyond: suggest scene beats, character actions, camera movement, props, backgrounds, voiceover timing, and visual storytelling direction.',
  heygen: 'HeyGen: suggest avatar delivery, camera framing, script pacing, pronunciation notes, visual prompts, and concise on-screen text.',
  synthesia: 'Synthesia: suggest avatar script structure, scene layouts, voiceover timing, pronunciation notes, and on-screen text hierarchy.',
  other: 'Custom tool: adapt to the custom production constraints and ask for assumptions when the tool is unclear.'
}

const ACTION_CONTRACTS: Record<string, string> = {
  proactive: 'Return 3 proactive suggestions for the selected screen. Focus on tool-specific build ideas, risks, and quick wins.',
  quickDraft: 'Draft useful screen content from the user prompt and project objectives. Include title, visualDescription, narration, interactions, navigation, duration, and status in patch.',
  rewrite: 'Rewrite or improve the selected field/screen for clarity, engagement, accessibility, and selected-tool best practices. Return a patch only for fields that should change.',
  standardsRewrite: 'Rewrite the selected field, screen, or project screens to match the requested readability/language standard while preserving meaning and instructional intent. Always include a comparison object for single-field rewrites.',
  readability: 'Estimate readability/CEFR level and recommend the best standard for the audience, content complexity, and selected development tool. Return suggestions with rationale and optional project/screen metadata patches.',
  toolBuild: 'Create structured build notes for the selected authoring tool. Do not patch the screen unless a tiny clarification helps. Put implementation steps in toolBuild.',
  batch: 'Improve multiple screens consistently. Return batchPatches keyed by screenId. Keep changes focused and conservative.',
  chat: 'Answer the user as a contextual copilot. Prefer practical, tool-aware implementation advice. Return assistantMessage and optional suggestions.'
}

export default defineEventHandler(async (event) => {
  try {
    let body: any
    try {
      body = await parseBody(event)
    } catch {
      throw createError({ statusCode: 400, message: 'Could not read request body.' })
    }

    const action = ACTION_CONTRACTS[String(body?.action)] ? String(body.action) : 'proactive'
    const prompt = String(body?.prompt ?? '').trim()
    const project = body?.project ?? {}
    const screen = body?.screen ?? null
    const screens = Array.isArray(body?.screens) ? body.screens.slice(0, 12) : []
    const targetField = String(body?.targetField ?? 'all')
    const customInstruction = String(body?.customInstruction ?? '').trim()
    const chatHistory = Array.isArray(body?.chatHistory) ? body.chatHistory.slice(-8) : []
    const standard = String(body?.standard ?? '').trim()
    const standardLabel = String(body?.standardLabel ?? standard).trim()
    const scope = ['field', 'screen', 'project'].includes(body?.scope) ? String(body.scope) : 'field'

    const hasContext = prompt || customInstruction || screen?.title || project?.title || screens.length
    if (!hasContext) {
      throw createError({ statusCode: 400, message: 'Add a prompt, project context, or select a screen before asking StoryForge AI.' })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      throw createError({ statusCode: 422, message: 'API key not configured on the server.' })
    }

    const effectiveTool = String(screen?.developmentTool || project?.primaryTool || 'storyline')
    const customTool = String(screen?.customTool || project?.customTool || '').trim()
    const toolGuidance = effectiveTool === 'other' && customTool
      ? `Custom tool (${customTool}): adapt suggestions to this production environment and call out assumptions.`
      : TOOL_GUIDANCE[effectiveTool] || TOOL_GUIDANCE.storyline

    const systemPrompt = `You are StoryForge ID Copilot, an expert instructional design and e-learning development assistant.

Core behavior:
- You are suggestive, never fully automatic. The user must explicitly accept changes.
- Be proactive, practical, concise, and context-aware.
- Adapt every suggestion to the selected development tool.
- Preserve user facts. If you infer, say so in the rationale.
- Favor Groq free-tier efficiency: short high-value outputs, no filler.
- For standards rewrites, preserve instructional intent, facts, and assessment meaning. Use shorter sentences and simpler vocabulary for CEFR A1-B1. Keep advanced nuance for C1-C2.

Selected tool guidance:
${toolGuidance}

Action:
${action}: ${ACTION_CONTRACTS[action]}
Requested standard: ${standardLabel || 'none'}
Rewrite scope: ${scope}
Target field: ${targetField}

Return ONLY valid JSON in this shape:
{
  "assistantMessage": "optional chat answer, plain text",
  "suggestions": [
    {
      "label": "short action label",
      "rationale": "why this helps",
      "target": "project|screen|batch|chat",
      "screenId": "optional screen id",
      "patch": { "title": "optional", "visualDescription": "optional", "narration": "optional", "interactions": "optional", "navigation": "optional", "duration": 45, "status": "Draft", "developmentTool": "optional" },
      "projectPatch": { "summary": "optional", "objectives": ["optional"] },
      "toolBuild": "optional structured build guidance",
      "batchPatches": [{ "screenId": "id", "patch": { "narration": "..." }, "rationale": "..." }],
      "comparison": { "field": "narration", "original": "before", "rewritten": "after", "standardLabel": "CEFR A2" }
    }
  ]
}`

    const userPayload = {
      prompt: prompt.slice(0, 3000),
      targetField,
      standard,
      standardLabel,
      scope,
      customInstruction: customInstruction.slice(0, 1200),
      project: {
        title: project.title,
        summary: project.summary,
        objectives: project.objectives,
        primaryTool: project.primaryTool,
        customTool: project.customTool,
        tone: project.tone,
        audience: project.audience,
        screenTitles: project.screenTitles
      },
      selectedScreen: screen,
      screens: screens.map((item: any) => ({
        id: item.id,
        title: item.title,
        visualDescription: item.visualDescription,
        narration: item.narration,
        interactions: item.interactions,
        navigation: item.navigation,
        developmentTool: item.developmentTool
      })),
      chatHistory
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
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(userPayload) }
          ],
          response_format: { type: 'json_object' },
          temperature: action === 'rewrite' || action === 'standardsRewrite' || action === 'readability' || action === 'batch' ? 0.32 : 0.55,
          max_tokens: action === 'batch' || (action === 'standardsRewrite' && scope === 'project') ? 3400 : action === 'chat' ? 1700 : 2400
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

    return {
      assistantMessage: parsed.assistantMessage ? String(parsed.assistantMessage) : '',
      suggestions: normalizeSuggestions(parsed.suggestions, action, screen?.id)
    }
  } catch (err: any) {
    if (err?.statusCode) throw err
    throw createError({ statusCode: 422, message: `Unexpected error: ${err?.message ?? String(err)}` })
  }
})

function normalizeSuggestions(input: any, action: string, fallbackScreenId?: string) {
  const suggestions = Array.isArray(input) ? input : []
  return suggestions.slice(0, action === 'batch' ? 8 : 4).map((suggestion: any, index: number) => ({
    id: `ai-${Date.now()}-${index}`,
    action,
    label: String(suggestion?.label || defaultLabel(action)),
    rationale: String(suggestion?.rationale || 'Suggested by StoryForge ID Copilot.'),
    target: ['project', 'screen', 'batch', 'chat'].includes(suggestion?.target) ? suggestion.target : (action === 'batch' ? 'batch' : 'screen'),
    screenId: suggestion?.screenId ? String(suggestion.screenId) : fallbackScreenId,
    patch: normalizePatch(suggestion?.patch),
    projectPatch: normalizeProjectPatch(suggestion?.projectPatch),
    toolBuild: suggestion?.toolBuild ? String(suggestion.toolBuild) : '',
    batchPatches: Array.isArray(suggestion?.batchPatches)
      ? suggestion.batchPatches.slice(0, 12).map((item: any) => ({ screenId: String(item.screenId || ''), patch: normalizePatch(item.patch), rationale: String(item.rationale || '') }))
      : [],
    comparison: suggestion?.comparison ? {
      field: String(suggestion.comparison.field || 'screen'),
      original: String(suggestion.comparison.original || ''),
      rewritten: String(suggestion.comparison.rewritten || ''),
      standardLabel: String(suggestion.comparison.standardLabel || '')
    } : undefined,
    createdAt: new Date().toISOString()
  }))
}

function normalizePatch(patch: any) {
  if (!patch || typeof patch !== 'object') return undefined
  const next: any = {}
  for (const key of ['title', 'visualDescription', 'narration', 'interactions', 'navigation', 'status', 'developmentTool', 'customTool']) {
    if (patch[key] !== undefined) next[key] = String(patch[key])
  }
  if (patch.duration !== undefined) next.duration = Number(patch.duration || 45)
  if (patch.readability && typeof patch.readability === 'object') next.readability = patch.readability
  return Object.keys(next).length ? next : undefined
}

function normalizeProjectPatch(patch: any) {
  if (!patch || typeof patch !== 'object') return undefined
  const next: any = {}
  if (patch.summary !== undefined) next.summary = String(patch.summary)
  if (Array.isArray(patch.objectives)) next.objectives = patch.objectives.map(String).slice(0, 6)
  return Object.keys(next).length ? next : undefined
}

function defaultLabel(action: string) {
  return action === 'toolBuild' ? 'Tool build plan' : action === 'batch' ? 'Batch improvement' : 'AI suggestion'
}
