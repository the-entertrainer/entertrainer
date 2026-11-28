import { getSocialPreviewByKey } from '~/content/social-previews'

/**
 * No `import ... from 'h3'` here, and no h3 request/response helpers
 * (getRequestURL, setResponseHeader) at all — on purpose. A stray dev
 * dependency (`@nuxt/devtools` -> `h3@2.0.1-rc.22`) gets hoisted to the
 * top-level node_modules/h3, shadowing the h3 1.x that Nitro's runtime
 * actually builds its event objects with. That mismatch isn't limited to
 * explicit imports: Nitro's *auto-import* for h3 utilities resolves the
 * same bare `h3` specifier, so `setResponseHeader` broke too even though
 * nothing here named it directly (every request 500'd, in dev and in the
 * production build, since it's the same node_modules resolution). The
 * fix is to route request/response access through the plain Node request
 * (`event.path`) and response (`event.node.res`) instead, which are the
 * same on every h3 major version this project could resolve to.
 */

const fontCache = new Map<string, ArrayBuffer>()

async function loadFont(family: 'Archivo' | 'Fraunces', weight: 400 | 700): Promise<ArrayBuffer> {
  const key = `${family}-${weight}`
  if (fontCache.has(key)) return fontCache.get(key)!

  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=swap`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EntertrainerSocialCard/1.0)' } }
  ).then((response) => response.text())
  const url = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].at(-1)?.[1]
  if (!url) throw new Error(`${family} ${weight} font URL not found`)

  const font = await fetch(url).then((response) => response.arrayBuffer())
  fontCache.set(key, font)
  return font
}

type SocialElement = { type: string; props: Record<string, unknown> }
type SocialChild = SocialElement | string | undefined | false

function element(tag: string, style: Record<string, unknown>, ...children: SocialChild[]): SocialElement {
  const content = children.filter(Boolean)
  return {
    type: tag,
    props: {
      style: { display: 'flex', ...style },
      children: content.length === 1 ? content[0] : content
    }
  }
}

function trim(value: string, limit: number): string {
  return value.length > limit ? `${value.slice(0, limit - 1).trimEnd()}…` : value
}

export default defineEventHandler(async (event) => {
  const key = event.path.split('?')[0].split('/').pop()?.replace(/\.png$/, '') ?? ''
  const preview = getSocialPreviewByKey(key)
  if (!preview) throw createError({ statusCode: 404, statusMessage: 'Social preview not found' })

  const [{ default: satori }, { Resvg }, regular, bold, display] = await Promise.all([
    import('satori'),
    import('@resvg/resvg-js'),
    loadFont('Archivo', 400),
    loadFont('Archivo', 700),
    loadFont('Fraunces', 400)
  ])

  // Brand card: paper, ink, one sun. See DESIGN.md → Brand guide.
  const title = trim(preview.title, 90)
  const description = trim(preview.description, 150)
  const titleSize = title.length > 60 ? 60 : title.length > 36 ? 72 : 88
  const tree = element('div', {
    width: 1200,
    height: 630,
    padding: '52px 60px',
    backgroundColor: '#F7F1E4',
    color: '#12110F',
    fontFamily: 'Archivo',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative'
  },
    element('div', { position: 'absolute', right: -170, bottom: -230, width: 620, height: 620, borderRadius: 999, backgroundColor: '#FFD43B' }),
    element('div', { width: '100%', justifyContent: 'space-between', borderTop: '5px solid #12110F', paddingTop: 14, fontSize: 17, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' },
      element('div', {}, preview.label),
      element('div', { color: '#5E584D' }, 'Entertain + Train')
    ),
    element('div', { flexDirection: 'column', maxWidth: 900, gap: 22 },
      element('div', { fontFamily: 'Fraunces', fontSize: titleSize, fontWeight: 400, lineHeight: 0.98, letterSpacing: '-0.04em' }, title),
      element('div', { fontSize: 25, lineHeight: 1.35, color: '#3F3A33', maxWidth: 760 }, description)
    ),
    element('div', { width: '100%', alignItems: 'center', gap: 14 },
      element('div', { width: 34, height: 34, borderRadius: 99, backgroundColor: '#12110F', alignItems: 'center', justifyContent: 'center', color: '#FFD43B', fontFamily: 'Fraunces', fontSize: 26, lineHeight: 1, paddingBottom: 4 }, 'e'),
      element('div', { fontFamily: 'Fraunces', fontSize: 34, letterSpacing: '-0.03em' }, 'entertrainer'),
      element('div', { fontSize: 16, fontWeight: 700, letterSpacing: '0.12em', color: '#12110F', marginLeft: 'auto' }, 'ENTERTRAINER.IN')
    )
  )

  const svg = await satori(tree, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Archivo', data: regular, weight: 400, style: 'normal' },
      { name: 'Archivo', data: bold, weight: 700, style: 'normal' },
      { name: 'Fraunces', data: display, weight: 400, style: 'normal' }
    ]
  })
  const png = Buffer.from(new Resvg(svg).render().asPng())

  // event.node.res.setHeader (the raw Node response), not h3's
  // setResponseHeader — same mismatched-h3 crash as above, one function later.
  event.node.res.setHeader('Content-Type', 'image/png')
  event.node.res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800')
  return png
})
