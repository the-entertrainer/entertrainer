/**
 * One-hop 301s.
 * Trailing slashes go to the final target, not to an intermediate path.
 * Prefix rows such as /about/:slug are applied here too, because Nitro's
 * `/about/**` rule also matches `/about` and would redirect it to itself.
 * The site root stays `/`.
 */
import { slashlessTarget } from '../utils/slashless-path'

export default defineEventHandler((event) => {
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
})
