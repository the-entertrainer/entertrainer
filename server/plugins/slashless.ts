/**
 * Nitro matches `/path` and `/path/` as the same route rule, then builds the
 * Location from the original URL, so `/games/stack/` became `/engage/stack/`
 * and `/dialogue` ↔ `/dialogue/` looped. This handler is inserted ahead of
 * route rules. A trailing slash is statusCode 301 to the slashless path,
 * or straight to the final target when that path is already a redirect.
 * The site root stays `/`.
 */
export default defineNitroPlugin((nitroApp) => {
  const handler = (event: any) => {
    const raw = event.node?.req?.url || event.path || '/'
    const q = raw.indexOf('?')
    const path = q === -1 ? raw : raw.slice(0, q)
    const search = q === -1 ? '' : raw.slice(q)
    if (path.length <= 1 || !path.endsWith('/')) return
    const bare = path.replace(/\/+$/, '') || '/'
    const destPath = slashlessTarget(bare)
    const dest = destPath + search
    event.node.res.statusCode = 301
    event.node.res.setHeader('location', dest)
    event.node.res.setHeader('content-type', 'text/html; charset=utf-8')
    const safe = dest.replace(/"/g, '%22')
    return `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${safe}"></head></html>`
  }
  nitroApp.h3App.stack.unshift({ route: '/', handler })
})
