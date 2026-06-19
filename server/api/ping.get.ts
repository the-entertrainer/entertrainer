export default defineEventHandler(() => {
  return {
    ok:         true,
    groqKeySet: !!process.env.GROQ_API_KEY,
    node:       process.version,
    env:        process.env.NODE_ENV ?? 'unknown'
  }
})
