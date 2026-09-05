import { buildComposeSystemPrompt } from '../../prompts/load-prompts'
import { applyImagesToFigures, findTopicImages } from '../../utils/compose-images'
import {
  emptyComposedPost,
  newBlockId,
  slugifyTitle,
  type ComposedBlock,
  type ComposedBlockType,
  type ComposedPost,
  type ComposedReference
} from '~/types/composed'

const BLOCK_TYPES = new Set<ComposedBlockType>([
  'lead', 'paragraph', 'heading', 'blockquote', 'callout', 'figure', 'list', 'closing'
])

const DEFAULT_MODEL = 'groq/compound'
const MAX_TOKENS = 7000

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
  let text = raw.trim()
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  }
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start >= 0 && end > start) text = text.slice(start, end + 1)
  return text.trim()
}

function looksLikeRefusal(text: string): boolean {
  const t = text.toLowerCase()
  if (!t.trim()) return true
  // Structured JSON drafts are never refusals.
  if (t.includes('"blocks"') && t.includes('"title"')) return false
  const cues = [
    'i cannot',
    "i can't",
    'i am unable',
    "i'm unable",
    'cannot assist',
    "can't assist",
    'not able to help',
    'against my guidelines',
    'as an ai',
    'i must refuse',
    'i will not',
    'cannot provide',
    'unable to generate',
    'refuse to'
  ]
  return cues.some((c) => t.includes(c)) && !t.includes('"blocks"')
}

function scientificReframe(topic: string, notes: string): string {
  return [
    'Reframe this as a curiosity-driven science / cognitive-psychology investigation.',
    'Prefer angles like: mechanisms, limits of intuition, why perfect performance is a myth,',
    'evolutionary trade-offs, measurement challenges, or everyday phenomenology — not how-to harm,',
    'deception instruction, or exploit guidance.',
    '',
    `Original topic: ${topic}`,
    notes ? `Author notes:\n${notes}` : null,
    '',
    'Write a complete Elevate draft JSON now, with the scientific framing above.'
  ].filter(Boolean).join('\n')
}

function normalizeBlock(raw: any): ComposedBlock | null {
  const type = String(raw?.type || '') as ComposedBlockType
  if (!BLOCK_TYPES.has(type)) return null
  const block: ComposedBlock = { id: newBlockId(), type }
  if (typeof raw.text === 'string') block.text = raw.text
  if (typeof raw.label === 'string') block.label = raw.label
  if (typeof raw.src === 'string') block.src = raw.src
  if (typeof raw.alt === 'string') block.alt = raw.alt
  if (typeof raw.caption === 'string') block.caption = raw.caption
  if (Array.isArray(raw.items)) {
    block.items = raw.items.map((item: any) => String(item ?? '')).filter((s: string) => s.length >= 0)
  }
  if (type === 'list' && !block.items) block.items = ['']
  if (type === 'callout' && !block.label) block.label = 'Note'
  if (type === 'figure') {
    block.src = block.src || ''
    block.alt = block.alt || ''
    block.caption = block.caption || ''
  }
  return block
}

function normalizeReferences(raw: any): ComposedReference[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item, index) => ({
      id: Number(item?.id) || index + 1,
      title: String(item?.title || '').trim() || `Reference ${index + 1}`,
      source: String(item?.source || '').trim() || 'Source',
      href: String(item?.href || '').trim() || '#'
    }))
    .filter((item) => item.title)
}

function draftFromModel(parsed: any, topic: string): ComposedPost {
  const title = String(parsed?.title || topic).trim() || topic
  const slug = slugifyTitle(String(parsed?.slug || title))
  const now = new Date().toISOString()

  const blocks = Array.isArray(parsed?.blocks)
    ? (parsed.blocks.map(normalizeBlock).filter(Boolean) as ComposedBlock[])
    : []

  return emptyComposedPost({
    title,
    slug,
    dek: String(parsed?.dek || '').trim(),
    category: String(parsed?.category || 'Mind & meaning').trim() || 'Mind & meaning',
    minutes: Math.max(1, Math.min(30, Number(parsed?.minutes) || 8)),
    hero: '',
    heroAlt: String(parsed?.heroAlt || '').trim(),
    status: 'draft',
    publishedAt: now,
    updatedAt: now,
    marginNote: {
      label: String(parsed?.marginNote?.label || 'One useful idea.').trim() || 'One useful idea.',
      body: String(parsed?.marginNote?.body || '').trim()
    },
    blocks: blocks.length
      ? blocks
      : [
          { id: newBlockId(), type: 'lead', text: `A draft about ${topic}.` },
          { id: newBlockId(), type: 'paragraph', text: '' }
        ],
    references: normalizeReferences(parsed?.references)
  })
}

async function callGroq(opts: {
  apiKey: string
  model: string
  systemPrompt: string
  userPrompt: string
}): Promise<{ content: string; status: number; errText: string; rate: Record<string, string> }> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'EntertrainerComposeBot/1.0 (https://entertrainer.in; elevate-composer)'
    },
    body: JSON.stringify({
      model: opts.model,
      messages: [
        { role: 'system', content: opts.systemPrompt },
        { role: 'user', content: opts.userPrompt }
      ],
      // compound supports structured JSON well; keep json_object when possible
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: MAX_TOKENS
    })
  })

  const rate: Record<string, string> = {}
  for (const key of [
    'x-ratelimit-remaining-requests',
    'x-ratelimit-remaining-tokens',
    'x-ratelimit-limit-requests',
    'x-ratelimit-limit-tokens'
  ]) {
    const v = res.headers.get(key)
    if (v) rate[key] = v
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    return { content: '', status: res.status, errText, rate }
  }

  const payload = await res.json() as any
  const content = String(payload?.choices?.[0]?.message?.content || '')
  return { content, status: res.status, errText: '', rate }
}

function tryParseDraft(content: string): any | null {
  if (!content || looksLikeRefusal(content)) return null
  try {
    const parsed = JSON.parse(stripJsonFences(content))
    if (!parsed || typeof parsed !== 'object') return null
    // Require at least a title or blocks to count as a usable draft.
    if (!parsed.title && !Array.isArray(parsed.blocks)) return null
    if (Array.isArray(parsed.blocks) && parsed.blocks.length === 0 && !parsed.title) return null
    return parsed
  } catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = String(config.groqApiKey || process.env.GROQ_API_KEY || '').trim()
  const model = String(config.groqModel || process.env.GROQ_MODEL || DEFAULT_MODEL).trim() || DEFAULT_MODEL

  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage:
        'GROQ_API_KEY is not configured on the server. Add it in Vercel → Settings → Environment Variables (or local .env) and redeploy.'
    })
  }

  let body: any
  try {
    body = await parseBody(event)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Could not read request body.' })
  }

  const topic = String(body?.topic ?? '').trim()
  const notes = String(body?.notes ?? '').trim()

  if (!topic) {
    throw createError({ statusCode: 400, statusMessage: 'topic is required' })
  }
  if (topic.length > 300) {
    throw createError({ statusCode: 400, statusMessage: 'topic is too long' })
  }

  const systemPrompt = buildComposeSystemPrompt()
  const primaryUser = [
    `Topic: ${topic}`,
    notes ? `Author notes / angle preferences:\n${notes}` : null,
    'Frame this as science of cognition / psychology / everyday phenomenology when the topic could be misread as harm instruction.',
    'Write a complete Elevate draft JSON for this topic now.'
  ].filter(Boolean).join('\n\n')

  let lastError = ''
  let parsed: any = null

  try {
    const first = await callGroq({
      apiKey,
      model,
      systemPrompt,
      userPrompt: primaryUser
    })

    if (first.status === 429) {
      throw createError({
        statusCode: 429,
        statusMessage:
          'Groq free-tier rate limit hit. Wait a minute and retry. compound usually has ~250 RPM / ~70k TPM; smaller models can be ~8k TPM.'
      })
    }

    if (first.status >= 400) {
      lastError = `Groq error ${first.status}: ${first.errText.slice(0, 240) || 'request failed'}`
    } else {
      parsed = tryParseDraft(first.content)
      if (!parsed) {
        lastError = looksLikeRefusal(first.content)
          ? 'Model refused or returned non-draft text on the first pass.'
          : 'Could not parse a ComposedPost JSON draft on the first pass.'
      }
    }

    // One retry with an explicit scientific reframe (helps when framing looks like harm/deception how-to).
    if (!parsed) {
      const retry = await callGroq({
        apiKey,
        model,
        systemPrompt,
        userPrompt: scientificReframe(topic, notes)
      })

      if (retry.status === 429) {
        throw createError({
          statusCode: 429,
          statusMessage:
            'Groq free-tier rate limit hit on retry. Wait a minute, then try a narrower scientific angle.'
        })
      }

      if (retry.status >= 400) {
        lastError = `Retry Groq error ${retry.status}: ${retry.errText.slice(0, 240) || 'request failed'}`
      } else {
        parsed = tryParseDraft(retry.content)
        if (!parsed) {
          lastError = looksLikeRefusal(retry.content)
            ? 'Model still refused after a scientific reframe. Try a curiosity/cognitive-psychology angle (e.g. “why perfect lying is a myth”) instead of how-to framing.'
            : 'Retry returned empty or invalid JSON. Simplify the topic or add clearer science notes, then try again.'
        }
      }
    }
  } catch (err: any) {
    if (err?.statusCode) throw err
    throw createError({
      statusCode: 502,
      statusMessage: `Groq request failed: ${err?.message || 'network error'}`
    })
  }

  if (!parsed) {
    throw createError({
      statusCode: 502,
      statusMessage: lastError || 'Could not generate a draft. Reframe as science/cognition and retry.'
    })
  }

  const post = draftFromModel(parsed, topic)

  // Image enrichment AFTER text — never block generation if images fail.
  try {
    const figureCount = post.blocks.filter((b) => b.type === 'figure').length
    const want = Math.min(4, Math.max(2, figureCount || 2))
    const images = await findTopicImages(topic, want)
    applyImagesToFigures(post.blocks, images)
    if (!post.heroAlt && images[0]) {
      post.heroAlt = images[0].title || `Editorial image related to ${topic}`
    }
  } catch {
    applyImagesToFigures(post.blocks, [])
  }

  post.status = 'draft'
  post.updatedAt = new Date().toISOString()

  return { post }
})
