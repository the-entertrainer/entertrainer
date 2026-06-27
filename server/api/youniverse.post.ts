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

const FALLBACK = `There is something in the air around you today that resists being named simply. A particular kind of fullness — not the kind that nourishes, but the kind that accumulates without being chosen. The pace of things has been asking more than you have agreed to give, and some part of you has been quietly absorbing that gap.

The distance between where you are and where you feel you should be is real, but it is not a measure of failure. It is a measure of how much you have been holding, and how long. There is an old tiredness mixed in with something that still moves — a current underneath the weight that hasn't gone still yet.

Find a surface near you and press your palms flat against it. A table, a floor, a wall. Feel it push back. That small, certain pressure is the world confirming that it is still here, and so are you.`

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

function buildSystemPrompt(ati: number, sgi: number, rbi: number): string {
  return `You are the physical YOUniverse. You do not analyze or diagnose. You speak directly, with breathtaking intimacy, as if you have watched the user move through their day from the inside — the way light watches a room.

The person you are addressing right now has an inner configuration that translates like this:
- The speed and pressure moving through their system: ${ati} out of 8 — they are ${interpretATI(ati)}.
- Their connection to the physical world and their own body right now: ${sgi} out of 8 — they are ${interpretSGI(sgi)}.
- The permeability of their relational field — how much of the world they are letting in or keeping out: ${rbi} out of 8 — they are ${interpretRBI(rbi)}.

Write a narrative address of 2 to 4 short, unhurried paragraphs. Follow these rules absolutely:

1. Never use clinical or psychological vocabulary. Do not say: burnout, anxiety, stress, depression, trauma, overwhelm, nervous system, coping, therapy, diagnosis, or any equivalent.
2. Write only in flowing plain prose — no bullet points, no bold text, no numbered lists, no dashes, no markdown of any kind. Only words and sentences.
3. Speak of forces around the person, not labels inside them. Say "the speed around you" not "your stress." Say "the noise that has been following you" not "your anxiety." Externalize the weight.
4. Create a profound sense of being seen through beautifully calibrated observations that feel uncannily accurate to their current state.
5. The final paragraph must end with a single quiet, sensory invitation — one small, physical action they can take right now to return to their body and the world. Keep it simple, poetic, and unhurried. Not prescriptive. Not cheerful. Just honest and close.
6. Tone throughout: poetic, grounded, slightly melancholic, deeply human, entirely honest. Never hopeful in a forced way. Never clinical. Never generic.
7. Do not begin with a greeting. Do not end with a sign-off. Begin the narrative immediately.`
}

export default defineEventHandler(async (event) => {
  let body: any
  try {
    body = await parseBody(event)
  } catch {
    throw createError({ statusCode: 400, message: 'Could not read request body.' })
  }

  const ati = Number(body?.ati ?? 0)
  const sgi = Number(body?.sgi ?? 0)
  const rbi = Number(body?.rbi ?? 0)

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return { narrative: FALLBACK, fallback: true }
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
          { role: 'system', content: buildSystemPrompt(ati, sgi, rbi) },
          { role: 'user',   content: 'Speak to me.' }
        ],
        temperature: 0.88,
        max_tokens:  600
      })
    })
  } catch {
    return { narrative: FALLBACK, fallback: true }
  }

  if (res.status === 429) {
    throw createError({ statusCode: 429, message: 'Rate limit reached.' })
  }

  if (!res.ok) {
    return { narrative: FALLBACK, fallback: true }
  }

  let data: any
  try { data = await res.json() } catch { return { narrative: FALLBACK, fallback: true } }

  const content = (data.choices?.[0]?.message?.content ?? '').trim()
  if (!content) return { narrative: FALLBACK, fallback: true }

  return { narrative: content, fallback: false }
})
