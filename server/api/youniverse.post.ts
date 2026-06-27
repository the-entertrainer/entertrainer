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

const FALLBACK_MIRROR     = `There is something moving through the space around you today that doesn't have a name yet — a particular weight that arrived quietly and hasn't announced itself.`
const FALLBACK_INSIGHT    = `The part of you that has been carrying this already knows what it is, even if the rest of you hasn't caught up.`
const FALLBACK_INVITATION = `Place both palms flat on the nearest surface and feel it push back. That pressure is the world confirming that it is still here, and so are you.`

function interpretATI(ati: number): string {
  if (ati >= 5)  return 'moving at a very high speed, pressured, vigilant'
  if (ati >= 2)  return 'elevated and alert, carrying urgency'
  if (ati >= -1) return 'in a moderate middle state, neither racing nor frozen'
  if (ati >= -4) return 'slowing toward exhaustion, losing momentum'
  return 'deeply depleted, in a frozen or shutdown state'
}

function interpretSGI(sgi: number): string {
  if (sgi >= 5)  return 'strongly seeking physical anchoring, nature, and embodiment'
  if (sgi >= 2)  return 'reaching toward the body and the sensory world'
  if (sgi >= -1) return 'somewhat disconnected from the physical, half-in half-out'
  if (sgi >= -4) return 'significantly detached from the body, living largely in thought'
  return 'profoundly adrift from physical reality, cognitively overloaded or dissociated'
}

function interpretRBI(rbi: number): string {
  if (rbi >= 5)  return 'open, vulnerable, longing intensely for warmth and closeness'
  if (rbi >= 2)  return 'reaching toward others, wanting connection and tenderness'
  if (rbi >= -1) return 'ambivalent, neither fully open nor closed'
  if (rbi >= -4) return 'protective, pulling inward, needing quiet and fewer demands'
  return 'walls fully up, needing solitude and strong sensory shielding'
}

function buildSystemPrompt(ati: number, sgi: number, rbi: number, choices: string[]): string {
  const choiceLines = choices.length
    ? choices.map((c, i) => `${i + 1}. ${c}`).join('\n')
    : 'No specific choices recorded.'

  return `You are a mirror. Return exactly 3 sentences on 3 separate lines. Nothing else — no greeting, no sign-off, no labels, no punctuation beyond normal sentence endings.

Line 1 — Mirror: An observation so specific and uncanny it stops the reader cold. Reference the sensory imagery from their choices obliquely, not literally. Externalize the weight — say "the speed around you" not "you are stressed." Make it feel like you were watching them move through their day from the inside.

Line 2 — Insight: One unnamed truth they already half-know. Quiet, not hopeful in a forced way. Honest and close. No clinical vocabulary. No therapy-speak.

Line 3 — Invitation: One tiny physical action they can take right now to return to their body and the world. Grounded, simple, poetic but concrete. Not cheerful. Not prescriptive. Just honest.

Their inner configuration:
- Speed and pressure (ATI ${ati}/8): ${interpretATI(ati)}
- Connection to body and physical world (SGI ${sgi}/8): ${interpretSGI(sgi)}
- Relational openness (RBI ${rbi}/8): ${interpretRBI(rbi)}

What they reached for when language failed:
${choiceLines}

Never use: burnout, anxiety, stress, depression, trauma, overwhelm, nervous system, coping, therapy, diagnosis, or any clinical equivalent. Write only in flowing plain prose.`
}

export default defineEventHandler(async (event) => {
  let body: any
  try {
    body = await parseBody(event)
  } catch {
    throw createError({ statusCode: 400, message: 'Could not read request body.' })
  }

  const ati     = Number(body?.ati ?? 0)
  const sgi     = Number(body?.sgi ?? 0)
  const rbi     = Number(body?.rbi ?? 0)
  const choices = Array.isArray(body?.choices) ? (body.choices as string[]).slice(0, 15) : []

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return { mirror: FALLBACK_MIRROR, insight: FALLBACK_INSIGHT, invitation: FALLBACK_INVITATION, fallback: true }
  }

  let res: Response
  try {
    res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({
        model:       'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: buildSystemPrompt(ati, sgi, rbi, choices) },
          { role: 'user',   content: 'Speak to me.' }
        ],
        temperature: 0.88,
        max_tokens:  300
      })
    })
  } catch {
    return { mirror: FALLBACK_MIRROR, insight: FALLBACK_INSIGHT, invitation: FALLBACK_INVITATION, fallback: true }
  }

  if (res.status === 429) {
    throw createError({ statusCode: 429, message: 'Rate limit reached.' })
  }

  if (!res.ok) {
    return { mirror: FALLBACK_MIRROR, insight: FALLBACK_INSIGHT, invitation: FALLBACK_INVITATION, fallback: true }
  }

  let data: any
  try { data = await res.json() } catch {
    return { mirror: FALLBACK_MIRROR, insight: FALLBACK_INSIGHT, invitation: FALLBACK_INVITATION, fallback: true }
  }

  const content = (data.choices?.[0]?.message?.content ?? '').trim()
  if (!content) {
    return { mirror: FALLBACK_MIRROR, insight: FALLBACK_INSIGHT, invitation: FALLBACK_INVITATION, fallback: true }
  }

  // Split on newlines, filter empty lines, take first 3 sentences
  const lines = content.split(/\n+/).map((l: string) => l.trim()).filter(Boolean)

  if (lines.length >= 3) {
    return { mirror: lines[0], insight: lines[1], invitation: lines[2], fallback: false }
  }

  // Fallback: split on '. ' if newlines weren't used
  const sentences = content.match(/[^.!?]+[.!?]+/g) ?? []
  if (sentences.length >= 3) {
    return {
      mirror:     sentences[0].trim(),
      insight:    sentences[1].trim(),
      invitation: sentences.slice(2).join(' ').trim(),
      fallback:   false
    }
  }

  return { mirror: content, insight: FALLBACK_INSIGHT, invitation: FALLBACK_INVITATION, fallback: false }
})
