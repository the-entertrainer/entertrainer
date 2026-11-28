/**
 * App icons, drawn from the same vector as public/favicon.svg and rasterised
 * on request (cached at the edge). Serves /brand/icon-<size>.png and
 * /brand/maskable-<size>.png. Plain Node response on purpose: see the note in
 * server/api/social-card/[key].png.ts about the mismatched h3 copies.
 */
const E = 'M15.5 24.6 H32.6 c0 -5.1 -3.7 -9.3 -8.4 -9.3 s-8.8 4.2 -8.8 9.3 4 9.3 8.8 9.3 c3 0 5.4 -1.3 7 -3.4'

function svg(maskable: boolean) {
  // Maskable icons keep the art inside the central 80% safe zone on a full-bleed field.
  const inner = maskable
    ? `<rect width="48" height="48" fill="#12110F"/><g transform="translate(9.6 9.6) scale(.6)"><circle cx="24" cy="24" r="23" fill="#FFD43B"/><path d="${E}" fill="none" stroke="#12110F" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></g>`
    : `<rect width="48" height="48" rx="11" fill="#12110F"/><circle cx="24" cy="24" r="19" fill="#FFD43B"/><path d="${E}" fill="none" stroke="#12110F" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${inner}</svg>`
}

export default defineEventHandler(async (event) => {
  const name = event.path.split('?')[0].split('/').pop() ?? ''
  const m = /^(icon|maskable)-(\d{2,4})\.png$/.exec(name)
  const size = m ? Number(m[2]) : 0
  if (!m || size < 16 || size > 1024) throw createError({ statusCode: 404 })
  const { Resvg } = await import('@resvg/resvg-js')
  const png = Buffer.from(new Resvg(svg(m[1] === 'maskable'), { fitTo: { mode: 'width', value: size } }).render().asPng())
  event.node.res.setHeader('Content-Type', 'image/png')
  event.node.res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=31536000, immutable')
  return png
})
