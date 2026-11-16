import { sitemapXml } from '~/content/visibility'

export default defineEventHandler((event) => {
  event.node.res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  event.node.res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300')
  return sitemapXml()
})
