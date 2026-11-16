import { isUnlistedCatalogPath } from '~/content/visibility'

/**
 * Crawlers that do not render the page still see noindex on unlisted URLs.
 * Headers go through event.node.res. Auto-imported h3 helpers resolve the
 * wrong h3 major in this repo and 500 the response.
 */
export default defineEventHandler((event) => {
  const path = (event.path || '/').split('?')[0]
  if (path.startsWith('/api/') || path.startsWith('/_nuxt/')) return
  if (!isUnlistedCatalogPath(path)) return
  const current = event.node.res.getHeader('x-robots-tag')
  if (current) return
  event.node.res.setHeader('X-Robots-Tag', 'noindex')
})
