/** Health / capability check for Dialogue Canon Engine */
export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  const groq = Boolean(String(config.groqApiKey || process.env.GROQ_API_KEY || '').trim())
  const gemini = Boolean(String(config.geminiApiKey || process.env.GEMINI_API_KEY || '').trim())
  return {
    ok: true,
    service: 'dialogue-canon',
    version: 3,
    actions: ['expand', 'chat', 'densify', 'bible', 'enrich_bible', 'pages'],
    densities: ['draft', 'studio', 'epic'],
    densityTargets: {
      draft: '3–4 ch · 4–6 scenes · 4–8 panels/chapter',
      studio: '4–6 ch · 6–10 scenes · 12–24 panels/chapter',
      epic: '5–8 ch · 8–12 scenes · 24–40 panels/chapter (batched ≤8)'
    },
    bibleMins: {
      draft: { characters: 4, locations: 3 },
      studio: { characters: 6, locations: 5 },
      epic: { characters: 8, locations: 6 }
    },
    providerPolicy: {
      expand: 'groq-preferred (speed)',
      chat: 'groq-preferred (speed)',
      densify: 'gemini-preferred (long JSON)',
      bible: 'gemini-preferred (long JSON)',
      enrich_bible: 'gemini-preferred (long JSON)',
      pages: 'gemini-preferred (long JSON)'
    },
    providers: {
      groq,
      gemini,
      preferred: groq && gemini ? 'action-dependent' : groq ? 'groq' : gemini ? 'gemini' : null
    }
  }
})
