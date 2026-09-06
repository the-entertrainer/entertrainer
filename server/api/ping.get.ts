/** Lightweight health check — never reveal env, keys, or runtime details. */
export default defineEventHandler(() => ({ ok: true }))
