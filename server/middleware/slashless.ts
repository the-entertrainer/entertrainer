/**
 * Canonical URLs have no trailing slash. `/dialogue/` and any other `/path/`
 * 308 once to the slashless path. The site root stays `/`.
 */
export default defineEventHandler((event) => {
  const raw = event.node?.req?.url || event.path || '/'
  const q = raw.indexOf('?')
  const path = q === -1 ? raw : raw.slice(0, q)
  const search = q === -1 ? '' : raw.slice(q)
  if (path.length <= 1 || !path.endsWith('/')) return
  const dest = (path.replace(/\/+$/, '') || '/') + search
  event.node.res.statusCode = 308
  event.node.res.setHeader('location', dest)
  event.node.res.setHeader('content-type', 'text/html; charset=utf-8')
  const safe = dest.replace(/"/g, '%22')
  return `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${safe}"></head></html>`
})
