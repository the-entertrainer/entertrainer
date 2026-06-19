export default defineEventHandler(() => {
  const key = process.env.GROQ_API_KEY ?? ''
  return {
    ok:            true,
    groqKeySet:    key.length > 0,
    groqKeyLength: key.length,
    groqKeyPrefix: key.slice(0, 4),
    node:          process.version,
    env:           process.env.NODE_ENV ?? 'unknown'
  }
})
