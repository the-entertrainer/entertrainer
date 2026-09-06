/** Debug-only Groq probe — disabled in production. */
export default defineEventHandler(() => {
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
})
