/**
 * Dialogue Canon Engine — prompts, density targets, normalizers, Prompt Forge.
 * Used by server/api/dialogue/story.post.ts
 */

export type Density = 'draft' | 'studio' | 'epic'
export type BeatKind = 'setup' | 'turn' | 'payoff' | 'hook'
export type ShotKind = 'establishing' | 'wide' | 'medium' | 'close' | 'insert' | 'reaction'
export type ProviderId = 'groq' | 'gemini'

export const DENSITY_TARGETS: Record<Density, { min: number; max: number; label: string }> = {
  draft: { min: 4, max: 8, label: 'Draft · 4–8 panels/chapter' },
  studio: { min: 12, max: 24, label: 'Studio · 12–24 panels/chapter' },
  epic: { min: 24, max: 40, label: 'Epic · 24–40 panels/chapter' }
}

export const PANEL_BATCH_SIZE = 8

export const TEMPERATURE: Record<string, number> = {
  expand: 0.8,
  chat: 0.8,
  densify: 0.55,
  bible: 0.4,
  pages: 0.6
}

export const GROQ_MAX_TOKENS = 8000
export const GEMINI_MAX_TOKENS = 16384

export function normalizeDensity(raw: unknown): Density {
  const d = String(raw || '').trim().toLowerCase()
  if (d === 'draft' || d === 'epic') return d
  return 'studio'
}

/** Prefer Gemini for long structured JSON; Groq for faster expand/chat. */
export function preferredProviderForAction(
  action: string,
  groqKey: string,
  geminiKey: string,
  requested?: unknown
): ProviderId {
  const raw = String(requested || '').trim().toLowerCase()
  if (raw === 'groq' || raw === 'gemini') {
    if (raw === 'groq' && groqKey) return 'groq'
    if (raw === 'gemini' && geminiKey) return 'gemini'
  }
  const longJson = action === 'bible' || action === 'pages' || action === 'densify'
  if (longJson && geminiKey) return 'gemini'
  if (!longJson && groqKey) return 'groq'
  if (groqKey) return 'groq'
  if (geminiKey) return 'gemini'
  throw createError({
    statusCode: 503,
    statusMessage:
      'No AI provider configured. Set GROQ_API_KEY and/or GEMINI_API_KEY in Vercel → Settings → Environment Variables (or local .env) and redeploy.'
  })
}

export function stripJsonFences(raw: string): string {
  let text = String(raw || '').trim()
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  }
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start >= 0 && end > start) text = text.slice(start, end + 1)
  return text.trim()
}

export function tryParseJson(content: string): any | null {
  if (!content) return null
  try {
    const parsed = JSON.parse(stripJsonFences(content))
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

const SYSTEM_BASE = `You are Dialogue Canon Engine for Entertrainer Dialogue — a pro-grade webcomic / vertical-scroll story orchestrator.
Return ONLY valid JSON (no markdown fences).
Never use copyrighted character names, franchise IP, or trademarked brands as characters.
Write with adult/YA sophistication by default (subtext, stakes, sensory detail) unless the user explicitly asks for kids/all-ages.`

function densityGuidance(density: Density): string {
  const t = DENSITY_TARGETS[density]
  if (density === 'draft') {
    return `Density=draft: lean beat graph, ${t.min}–${t.max} story panels per chapter later. Still include beat/conflict/emotion on every scene.`
  }
  if (density === 'epic') {
    return `Density=epic: maximal densification — many scenes with sharp conflicts, ${t.min}–${t.max} panels/chapter target. Webtoon episode pacing (40–80 panels/episode industry norm → we target chapter-level).`
  }
  return `Density=studio (default): production-ready beat graph, ${t.min}–${t.max} panels/chapter. Industry Character Bible / event-graph density.`
}

export function systemForAction(action: string, density: Density = 'studio'): string {
  const dg = densityGuidance(density)

  if (action === 'expand') {
    return `${SYSTEM_BASE}

ACTION expand — expand a short plot into a richer beat graph outline.
${dg}
Return JSON:
{
  "message": "short assistant reply",
  "outline": {
    "title": "story title",
    "logline": "one-sentence pitch with stakes",
    "density": "${density}",
    "maturityHint": "all-ages|teen|adult",
    "chapters": [
      {
        "id": "ch1",
        "title": "chapter title",
        "summary": "2-4 sentences",
        "arcRole": "setup|rising|midpoint|crisis|climax|resolution",
        "scenes": [
          {
            "id": "sc1",
            "summary": "scene beat with sensory hook",
            "beat": "setup|turn|payoff|hook",
            "conflict": "who wants what vs what",
            "emotion": "dominant emotion / subtext",
            "pageHint": 1
          }
        ]
      }
    ],
    "suggestedPages": 12,
    "rationale": "why this structure / density"
  }
}
Rules:
- draft: 2–3 chapters, 2–4 scenes each. studio: 3–5 chapters, 3–6 scenes. epic: 4–6 chapters, 5–8 scenes.
- Every scene MUST include beat, conflict, emotion, pageHint ≥ 1.
- Chapters MUST include arcRole.
- Prefer webtoon vertical storytelling; forbid bland children's-book flatness unless plot asks for kids.`
  }

  if (action === 'chat') {
    return `${SYSTEM_BASE}

ACTION chat — revise an existing outline from user feedback. Preserve density=${density}.
${dg}
Return JSON:
{
  "message": "what you changed, conversational",
  "outline": { same shape as expand.outline, including beat/conflict/emotion/pageHint and chapter arcRole }
}
Preserve chapter/scene ids when possible; invent new ids only for new items.
Keep suggestedPages synced to scene weight.`
  }

  if (action === 'densify') {
    return `${SYSTEM_BASE}

ACTION densify — CRITIC PASS. Take an outline and return a denser, sharper outline.
FORBIDDEN: kiddie blandness, generic "then they became friends", empty travel montages, moral-of-the-story lectures.
DEMAND: subtext, concrete stakes, sensory detail, sharper conflicts, adult/YA sophistication unless outline maturityHint or user plot clearly asks for kids/all-ages.
${dg}
Add scenes where chapters feel thin. Split weak scenes. Raise conflict specificity. Keep ids stable when possible; new scenes get new ids.
Return JSON:
{
  "message": "critic notes: what you densified",
  "outline": { same shape as expand.outline, denser }
}`
  }

  if (action === 'bible') {
    return `${SYSTEM_BASE}

ACTION bible — DEEP Visual DNA Story Bible from an approved outline.
Return JSON:
{
  "characters": [{
    "id": "char_maya",
    "name": "Maya",
    "role": "protagonist",
    "ageRange": "28-32",
    "genderPresentation": "feminine|masculine|androgynous|unspecified",
    "visualDNA": {
      "face": "shape, eyes, brows, expression baseline",
      "hair": "color, cut, texture",
      "body": "build, posture, height vibe",
      "skin": "tone description",
      "distinctiveMarks": "scar, freckles, piercings, etc or none",
      "wardrobeLocked": ["item 1 always worn", "item 2"],
      "colorHex": ["#1A1A2E", "#E94560"],
      "props": ["key prop"]
    },
    "voice": { "diction": "how they speak", "catchphrases": [], "taboo": "words/topics they avoid" },
    "psychology": { "want": "", "need": "", "wound": "", "lie": "", "fear": "" },
    "relationships": [{ "targetId": "char_other", "type": "rival|ally|love|family|mentor", "tension": "one line" }],
    "arc": "one-sentence character arc",
    "appearance": "legacy flat string summarizing visualDNA for older clients",
    "personality": "legacy short"
  }],
  "locations": [{
    "id": "loc_station",
    "name": "Night Bus Station",
    "sensory": "sight/sound/smell/touch concrete",
    "palette": ["#0D0C0A", "#F5C518"],
    "recurringMotifs": ["wet asphalt reflections"],
    "description": "legacy flat description"
  }],
  "rules": ["world rule 1"],
  "motifs": ["recurring symbol"],
  "timeline": [{ "label": "inciting", "when": "night of the blackout" }],
  "visualStyle": {
    "medium": "webtoon ink / painterly / etc",
    "line": "line weight description",
    "lighting": "key lighting grammar",
    "palette": "overall palette words",
    "cameraGrammar": "vertical scroll, dutch angles rare, etc",
    "referencesAvoid": "no specific living artist names; describe vibe only"
  },
  "toneNotes": "tone / pacing",
  "maturity": "all-ages|teen|adult",
  "chapters": [{ "id": "ch1", "title": "", "summary": "" }]
}
Rules:
- Character ids: char_<slug>, unique lowercase underscore.
- visualDNA must be specific enough for external image tools (SD / IP-Adapter style prompts).
- Include 2–8 characters, 1–6 locations.
- Also fill legacy appearance/personality/description fields for backward compatibility.
- visualStyle may also be accepted as a flat string by the normalizer if the model slips.`
  }

  if (action === 'pages') {
    const t = DENSITY_TARGETS[density]
    return `${SYSTEM_BASE}

ACTION pages — compile comic page specs with panels from outline + deep bible.
${dg}
Target ${t.min}–${t.max} STORY panels for the focused chapter (not counting cover/back).
Each panel MUST include:
- shot: establishing|wide|medium|close|insert|reaction
- camera: lens/angle/framing note
- action: visible action
- subtext: what is unsaid
- dialogue[]: { speakerId, text, balloon: speech|thought|caption }
- characters[]: character ids present
- scene: slugline
- imagePrompt: Prompt Forge quality (see rules)
- notes: optional

Return JSON:
{
  "pages": [
    {
      "id": "page_cover",
      "chapterId": null,
      "title": "Cover",
      "kind": "cover",
      "panels": [ /* 1 panel */ ]
    }
  ]
}

Prompt Forge rules for imagePrompt (CRITICAL):
1. Lead with locked style from bible.visualStyle (medium, line, lighting, palette, cameraGrammar).
2. Inject every appearing character as: ID (Name): face…; hair…; body…; skin…; marks…; wardrobeLocked…; colors…
3. Location sensory + palette.
4. Shot + action + lighting.
5. End with: DO NOT change locked wardrobe/colors/face marks.
6. Webtoon vertical 9:16 framing. No copyrighted names.

Always include cover (kind:cover) first and back (kind:back) last when generating a full/single-chapter package.
Story pages: kind:"story". Prefer 1–3 panels per story page card for scroll pacing.
If batchStart/batchCount provided, generate ONLY that slice of story panels (still may omit cover/back if batchStart>0).`
  }

  return SYSTEM_BASE
}

export function buildUserPrompt(action: string, body: any, density: Density): string {
  if (action === 'expand') {
    const plot = String(body?.plot || '').trim()
    const tone = String(body?.tone || '').trim()
    return [
      `Plot prompt:\n${plot}`,
      tone ? `Preferred tone: ${tone}` : null,
      `Density: ${density}`,
      'Expand into beat-graph outline JSON now.'
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
      `Density: ${density}`,
      `Current outline JSON:\n${JSON.stringify(outline)}`,
      `Conversation:\n${transcript || '(none)'}`,
      'Apply the latest user request and return updated outline JSON with full beat fields.'
    ].join('\n\n')
  }
  if (action === 'densify') {
    return [
      `Density target: ${density}`,
      `Outline to densify:\n${JSON.stringify(body?.outline || {})}`,
      body?.plot ? `Original plot (context):\n${String(body.plot)}` : null,
      'Run critic pass. Return denser outline JSON.'
    ].filter(Boolean).join('\n\n')
  }
  if (action === 'bible') {
    return [
      `Density: ${density}`,
      `Approved outline JSON:\n${JSON.stringify(body?.outline || {})}`,
      'Create the DEEP Visual DNA Story Bible JSON now.'
    ].join('\n\n')
  }
  if (action === 'pages') {
    const chapterId = body?.chapterId ? String(body.chapterId) : ''
    const batchStart = Number.isFinite(Number(body?.batchStart)) ? Number(body.batchStart) : 0
    const batchCount = Number.isFinite(Number(body?.batchCount)) ? Number(body.batchCount) : 0
    const t = DENSITY_TARGETS[density]
    return [
      `Density: ${density} → target ${t.min}–${t.max} story panels for the chapter.`,
      `Outline JSON:\n${JSON.stringify(body?.outline || {})}`,
      `Story Bible JSON:\n${JSON.stringify(body?.bible || {})}`,
      chapterId
        ? `Focus chapterId: ${chapterId} (REQUIRED for studio/epic).`
        : 'Generate pages for the full story at draft density (keep reasonable length).',
      batchCount > 0
        ? `BATCH MODE: generate story panels ${batchStart}..${batchStart + batchCount - 1} (0-based). Omit cover/back unless batchStart===0 (then include cover only). If this is the final batch (see batchFinal), include back cover.`
        : null,
      body?.batchFinal ? 'This is the FINAL batch — include back cover page.' : null,
      'Return pages JSON now. Fill Prompt Forge imagePrompt on every panel.'
    ].filter(Boolean).join('\n\n')
  }
  return JSON.stringify(body || {})
}

const BEATS: BeatKind[] = ['setup', 'turn', 'payoff', 'hook']
const SHOTS: ShotKind[] = ['establishing', 'wide', 'medium', 'close', 'insert', 'reaction']
const ARC_ROLES = ['setup', 'rising', 'midpoint', 'crisis', 'climax', 'resolution']

function asBeat(v: any): BeatKind {
  const s = String(v || '').toLowerCase()
  return (BEATS.includes(s as BeatKind) ? s : 'setup') as BeatKind
}

function asShot(v: any): ShotKind {
  const s = String(v || '').toLowerCase()
  return (SHOTS.includes(s as ShotKind) ? s : 'medium') as ShotKind
}

export function normalizeOutline(raw: any, density: Density): any {
  const chapters = Array.isArray(raw?.chapters)
    ? raw.chapters.map((ch: any, i: number) => {
        const arcRole = String(ch?.arcRole || '').toLowerCase()
        return {
          id: String(ch?.id || `ch${i + 1}`),
          title: String(ch?.title || `Chapter ${i + 1}`),
          summary: String(ch?.summary || ''),
          arcRole: ARC_ROLES.includes(arcRole) ? arcRole : (i === 0 ? 'setup' : 'rising'),
          scenes: Array.isArray(ch?.scenes)
            ? ch.scenes.map((sc: any, j: number) => ({
                id: String(sc?.id || `sc${i + 1}_${j + 1}`),
                summary: String(sc?.summary || ''),
                beat: asBeat(sc?.beat),
                conflict: String(sc?.conflict || '').trim(),
                emotion: String(sc?.emotion || '').trim(),
                pageHint: Math.max(1, Number(sc?.pageHint) || 1)
              }))
            : []
        }
      })
    : []
  const sceneCount = chapters.reduce((n: number, ch: any) => n + (ch.scenes?.length || 0), 0)
  const pageWeight = chapters.reduce(
    (n: number, ch: any) => n + (ch.scenes || []).reduce((m: number, sc: any) => m + (sc.pageHint || 1), 0),
    0
  )
  return {
    title: String(raw?.title || 'Untitled Story').trim() || 'Untitled Story',
    logline: String(raw?.logline || '').trim(),
    density,
    maturityHint: ['all-ages', 'teen', 'adult'].includes(String(raw?.maturityHint || ''))
      ? String(raw.maturityHint)
      : 'teen',
    chapters,
    suggestedPages: Math.max(1, Number(raw?.suggestedPages) || pageWeight || sceneCount || 1),
    rationale: String(raw?.rationale || '').trim()
  }
}

function slugId(prefix: string, name: string, i: number): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || `x${i + 1}`
  return slug.startsWith(prefix) ? slug : `${prefix}${slug}`
}

function normalizeVisualStyle(raw: any): any {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return {
      medium: String(raw.medium || 'Clean webtoon ink').trim(),
      line: String(raw.line || 'confident mid-weight outlines').trim(),
      lighting: String(raw.lighting || 'soft key with rim accents').trim(),
      palette: String(raw.palette || 'warm night paper with yellow accent').trim(),
      cameraGrammar: String(raw.cameraGrammar || 'vertical webtoon scroll, readable silhouettes').trim(),
      referencesAvoid: String(raw.referencesAvoid || 'no living-artist name-drops').trim()
    }
  }
  const flat = String(raw || 'Clean webtoon ink, soft cel shading, warm night palette').trim()
  return {
    medium: flat,
    line: 'confident mid-weight outlines',
    lighting: 'soft key with rim accents',
    palette: flat,
    cameraGrammar: 'vertical webtoon scroll, readable silhouettes',
    referencesAvoid: 'no living-artist name-drops'
  }
}

function flattenVisualStyle(vs: any): string {
  if (!vs) return 'Clean webtoon ink'
  if (typeof vs === 'string') return vs
  return [vs.medium, vs.line, vs.lighting, vs.palette, vs.cameraGrammar].filter(Boolean).join('; ')
}

export function normalizeBible(raw: any, outline: any): any {
  const characters = Array.isArray(raw?.characters)
    ? raw.characters.map((c: any, i: number) => {
        const name = String(c?.name || `Character ${i + 1}`).trim()
        let id = String(c?.id || '').trim()
        if (!id) id = slugId('char_', name, i)
        const dna = c?.visualDNA && typeof c.visualDNA === 'object' ? c.visualDNA : {}
        const wardrobeLocked = Array.isArray(dna.wardrobeLocked)
          ? dna.wardrobeLocked.map((x: any) => String(x))
          : (c?.appearance ? [String(c.appearance).slice(0, 120)] : [])
        const colorHex = Array.isArray(dna.colorHex)
          ? dna.colorHex.map((x: any) => String(x)).filter((h: string) => /^#?[0-9a-fA-F]{3,8}$/.test(h)).map((h: string) => (h.startsWith('#') ? h : `#${h}`))
          : []
        const props = Array.isArray(dna.props) ? dna.props.map((x: any) => String(x)) : []
        const voice = c?.voice && typeof c.voice === 'object' ? c.voice : {}
        const psych = c?.psychology && typeof c.psychology === 'object' ? c.psychology : {}
        const relationships = Array.isArray(c?.relationships)
          ? c.relationships.map((r: any) => {
              if (typeof r === 'string') return { targetId: '', type: 'ally', tension: r }
              return {
                targetId: String(r?.targetId || ''),
                type: String(r?.type || 'ally'),
                tension: String(r?.tension || '')
              }
            })
          : (c?.relationships
              ? [{ targetId: '', type: 'ally', tension: String(c.relationships) }]
              : [])
        const visualDNA = {
          face: String(dna.face || '').trim(),
          hair: String(dna.hair || '').trim(),
          body: String(dna.body || '').trim(),
          skin: String(dna.skin || '').trim(),
          distinctiveMarks: String(dna.distinctiveMarks || '').trim(),
          wardrobeLocked,
          colorHex,
          props
        }
        const appearanceLegacy = String(c?.appearance || '').trim()
          || [visualDNA.face, visualDNA.hair, visualDNA.body, visualDNA.skin, wardrobeLocked.join(', ')].filter(Boolean).join('; ')
        return {
          id,
          name,
          role: String(c?.role || '').trim(),
          ageRange: String(c?.ageRange || '').trim(),
          genderPresentation: String(c?.genderPresentation || '').trim(),
          visualDNA,
          voice: {
            diction: String(voice.diction || c?.personality || '').trim(),
            catchphrases: Array.isArray(voice.catchphrases) ? voice.catchphrases.map((x: any) => String(x)) : [],
            taboo: String(voice.taboo || '').trim()
          },
          psychology: {
            want: String(psych.want || '').trim(),
            need: String(psych.need || '').trim(),
            wound: String(psych.wound || '').trim(),
            lie: String(psych.lie || '').trim(),
            fear: String(psych.fear || '').trim()
          },
          relationships,
          arc: String(c?.arc || '').trim(),
          // legacy
          appearance: appearanceLegacy,
          personality: String(c?.personality || voice.diction || '').trim()
        }
      })
    : []

  const locations = Array.isArray(raw?.locations)
    ? raw.locations.map((l: any, i: number) => {
        const name = String(l?.name || `Location ${i + 1}`)
        const palette = Array.isArray(l?.palette)
          ? l.palette.map((x: any) => String(x))
          : []
        const motifs = Array.isArray(l?.recurringMotifs)
          ? l.recurringMotifs.map((x: any) => String(x))
          : []
        const sensory = String(l?.sensory || l?.description || '').trim()
        return {
          id: String(l?.id || slugId('loc_', name, i)),
          name,
          sensory,
          palette,
          recurringMotifs: motifs,
          description: String(l?.description || sensory).trim()
        }
      })
    : []

  const visualStyle = normalizeVisualStyle(raw?.visualStyle)
  return {
    characters,
    locations,
    rules: Array.isArray(raw?.rules) ? raw.rules.map((x: any) => String(x)) : [],
    motifs: Array.isArray(raw?.motifs) ? raw.motifs.map((x: any) => String(x)) : [],
    timeline: Array.isArray(raw?.timeline)
      ? raw.timeline.map((t: any) => ({
          label: String(t?.label || ''),
          when: String(t?.when || '')
        }))
      : [],
    visualStyle,
    // legacy flat string for older clients / Prompt Forge fallback
    visualStyleFlat: flattenVisualStyle(visualStyle),
    toneNotes: String(raw?.toneNotes || '').trim(),
    maturity: ['all-ages', 'teen', 'adult'].includes(String(raw?.maturity || ''))
      ? String(raw.maturity)
      : (outline?.maturityHint || 'teen'),
    chapters: Array.isArray(raw?.chapters) && raw.chapters.length
      ? raw.chapters.map((ch: any) => ({
          id: String(ch?.id || ''),
          title: String(ch?.title || ''),
          summary: String(ch?.summary || '')
        }))
      : (outline?.chapters || []).map((ch: any) => ({
          id: ch.id,
          title: ch.title,
          summary: ch.summary
        }))
  }
}

/** Prompt Forge — build or repair denser image prompts from bible + panel. */
export function forgeImagePrompt(panel: any, bible: any): string {
  const existing = String(panel?.imagePrompt || '').trim()
  const vs = bible?.visualStyle
  const styleBlock = typeof vs === 'object'
    ? `STYLE: ${vs.medium || ''}; line: ${vs.line || ''}; lighting: ${vs.lighting || ''}; palette: ${vs.palette || ''}; camera: ${vs.cameraGrammar || ''}`
    : `STYLE: ${bible?.visualStyleFlat || vs || 'Clean webtoon ink'}`

  const charIds: string[] = Array.isArray(panel?.characters) ? panel.characters.map(String) : []
  const charMap = new Map((bible?.characters || []).map((c: any) => [c.id, c]))
  const charBlocks = charIds.map((id) => {
    const c: any = charMap.get(id)
    if (!c) return `${id}`
    const dna = c.visualDNA || {}
    const wardrobe = (dna.wardrobeLocked || []).join(', ')
    const colors = (dna.colorHex || []).join(', ')
    return `${c.id} (${c.name}): face ${dna.face || c.appearance || ''}; hair ${dna.hair || ''}; body ${dna.body || ''}; skin ${dna.skin || ''}; marks ${dna.distinctiveMarks || 'none'}; wardrobeLocked [${wardrobe}]; colors [${colors}]`
  }).filter(Boolean)

  const locIdGuess = ''
  const locs = bible?.locations || []
  const loc = locs[0]
  const locBlock = loc
    ? `LOCATION: ${loc.name} — ${loc.sensory || loc.description || ''}; palette ${(loc.palette || []).join(', ')}`
    : ''

  const shot = panel?.shot || 'medium'
  const action = panel?.action || panel?.scene || ''
  const camera = panel?.camera || ''
  const lighting = (typeof vs === 'object' && vs.lighting) ? vs.lighting : 'cinematic comic lighting'

  const forged = [
    styleBlock,
    charBlocks.length ? `CHARACTERS: ${charBlocks.join(' | ')}` : null,
    locBlock || null,
    `SHOT: ${shot}. CAMERA: ${camera || 'eye-level webtoon panel'}. ACTION: ${action}. LIGHTING: ${lighting}.`,
    panel?.subtext ? `SUBTEXT mood: ${panel.subtext}` : null,
    'Webtoon vertical panel, 9:16 friendly composition.',
    'DO NOT change locked wardrobe/colors/face marks.'
  ].filter(Boolean).join('\n')

  // Prefer model prompt if already long/forge-like; else replace/augment
  if (existing.length > 180 && /DO NOT change locked/i.test(existing)) return existing
  if (existing.length > 120) {
    return `${existing}\n---\n${forged}`
  }
  return forged
}

export function normalizePages(raw: any, bible?: any): any {
  const pages = Array.isArray(raw?.pages) ? raw.pages : []
  return {
    pages: pages.map((pg: any, i: number) => {
      const kind = ['cover', 'back', 'story'].includes(String(pg?.kind))
        ? String(pg.kind)
        : (i === 0 ? 'cover' : 'story')
      const panels = Array.isArray(pg?.panels)
        ? pg.panels.map((pan: any, j: number) => {
            const panel = {
              id: String(pan?.id || `pan_${i}_${j}`),
              order: Number.isFinite(Number(pan?.order)) ? Number(pan.order) : j,
              scene: String(pan?.scene || '').trim(),
              shot: asShot(pan?.shot),
              camera: String(pan?.camera || '').trim(),
              action: String(pan?.action || '').trim(),
              subtext: String(pan?.subtext || '').trim(),
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
            }
            if (bible) {
              panel.imagePrompt = forgeImagePrompt(panel, bible)
            }
            return panel
          })
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

export function mergePageBatches(batches: any[][]): any[] {
  const byId = new Map<string, any>()
  const order: string[] = []
  for (const pages of batches) {
    for (const pg of pages) {
      if (!byId.has(pg.id)) {
        byId.set(pg.id, { ...pg, panels: [...(pg.panels || [])] })
        order.push(pg.id)
      } else {
        const existing = byId.get(pg.id)
        const seen = new Set((existing.panels || []).map((p: any) => p.id))
        for (const pan of pg.panels || []) {
          if (!seen.has(pan.id)) {
            existing.panels.push(pan)
            seen.add(pan.id)
          }
        }
      }
    }
  }
  // Re-order panels
  return order.map((id) => {
    const pg = byId.get(id)
    pg.panels = (pg.panels || [])
      .slice()
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      .map((p: any, i: number) => ({ ...p, order: i }))
    return pg
  })
}

export function countStoryPanels(pages: any[]): number {
  return (pages || [])
    .filter((p) => p.kind === 'story')
    .reduce((n, p) => n + ((p.panels || []).length), 0)
}
