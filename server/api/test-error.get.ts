export default defineEventHandler(() => {
  throw createError({ statusCode: 422, message: 'error-passthrough-confirmed' })
})
