/**
 * Nitro matches `/path` and `/path/` as the same route rule, then builds the
 * Location from the original URL. This handler is inserted ahead of route
 * rules so a trailing slash, or a prefix redirect such as /about/:slug, is
 * statusCode 301 straight to the final target. The site root stays `/`.
 */
import { slashlessTarget } from '../utils/slashless-path'

export default defineNitroPlugin((nitroApp) => {
  const handler = (event: any) => {
    const raw = event.node?.req?.url || event.path || '/'
    const q = raw.indexOf('?')
    const path = q === -1 ? raw : raw.slice(0, q)
    const search = q === -1 ? '' : raw.slice(q)
    if (!path.startsWith('/') || path.startsWith('/api/') || path.startsWith('/_nuxt/')) return
    const bare = path.length > 1 ? path.replace(/\/+$/, '') || '/' : path
    const destPath = slashlessTarget(bare)
    const dest = destPath + search
    if (dest === path + search) return
    event.node.res.statusCode = 301
    event.node.res.setHeader('location', dest)
    event.node.res.setHeader('content-type', 'text/html; charset=utf-8')
    const safe = dest.replace(/"/g, '%22')
    return `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${safe}"></head></html>`
  }
  nitroApp.h3App.stack.unshift({ route: '/', handler })
})