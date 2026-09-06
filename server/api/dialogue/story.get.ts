/** Health / capability check for Dialogue Canon Engine */
export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  const groq = Boolean(String(config.groqApiKey || process.env.GROQ_API_KEY || '').trim())
  const gemini = Boolean(String(config.geminiApiKey || process.env.GEMINI_API_KEY || '').trim())
  return {
    ok: true,
    service: 'dialogue-canon',
    version: 2,
    actions: ['expand', 'chat', 'densify', 'bible', 'pages'],
    densities: ['draft', 'studio', 'epic'],
    densityTargets: {
      draft: '4–8 panels/chapter',
      studio: '12–24 panels/chapter',
      epic: '24–40 panels/chapter (batched ≤8)'
    },
    providerPolicy: {
      expand: 'groq-preferred (speed)',
      chat: 'groq-preferred (speed)',
      densify: 'gemini-preferred (long JSON)',
      bible: 'gemini-preferred (long JSON)',
      pages: 'gemini-preferred (long JSON)'
    },
    providers: {
      groq,
      gemini,
      preferred: groq && gemini ? 'action-dependent' : groq ? 'groq' : gemini ? 'gemini' : null
    }
  }
})
