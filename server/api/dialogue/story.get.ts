/** Health / capability check for Dialogue Story Mode */
export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  const groq = Boolean(String(config.groqApiKey || process.env.GROQ_API_KEY || '').trim())
  const gemini = Boolean(String(config.geminiApiKey || process.env.GEMINI_API_KEY || '').trim())
  return {
    ok: true,
    service: 'dialogue-story',
    actions: ['expand', 'chat', 'bible', 'pages'],
    providers: {
      groq,
      gemini,
      preferred: groq ? 'groq' : gemini ? 'gemini' : null
    }
  }
})
