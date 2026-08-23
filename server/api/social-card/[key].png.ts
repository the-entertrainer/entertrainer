import { createError, defineEventHandler, getRequestURL, setResponseHeader } from 'h3'
import { getSocialPreviewByKey } from '~/content/social-previews'

const fontCache = new Map<string, ArrayBuffer>()

async function loadFont(weight: 400 | 700): Promise<ArrayBuffer> {
  const key = `dm-sans-${weight}`
  if (fontCache.has(key)) return fontCache.get(key)!

  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=DM+Sans:wght@${weight}&display=swap`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EntertrainerSocialCard/1.0)' } }
  ).then((response) => response.text())
  const url = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].at(-1)?.[1]
  if (!url) throw new Error(`DM Sans ${weight} font URL not found`)

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
  const key = getRequestURL(event).pathname.split('/').pop()?.replace(/\.png$/, '') ?? ''
  const preview = getSocialPreviewByKey(key)
  if (!preview) throw createError({ statusCode: 404, statusMessage: 'Social preview not found' })

  const [{ default: satori }, { Resvg }, regular, bold] = await Promise.all([
    import('satori'),
    import('@resvg/resvg-js'),
    loadFont(400),
    loadFont(700)
  ])

  const title = trim(preview.title, 110)
  const description = trim(preview.description, 175)
  const titleSize = title.length > 74 ? 52 : title.length > 45 ? 61 : 70
  const tree = element('div', {
    width: 1200,
    height: 630,
    padding: '48px 58px',
    backgroundColor: '#fffaf0',
    color: '#15120f',
    fontFamily: 'DM Sans',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden'
  },
    element('div', { width: '100%', height: 14, backgroundColor: '#ffd43b', borderRadius: 99 }),
    element('div', { flexDirection: 'column', maxWidth: 1010, gap: 18 },
      element('div', { fontSize: 18, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#625c52' }, preview.label),
      element('div', { fontSize: titleSize, fontWeight: 700, lineHeight: 1.02, letterSpacing: '-0.05em' }, title),
      element('div', { fontSize: 25, lineHeight: 1.35, color: '#49433b', maxWidth: 900 }, description)
    ),
    element('div', { width: '100%', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #15120f', paddingTop: 20 },
      element('div', { fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em' }, 'entertrainer'),
      element('div', { fontSize: 16, fontWeight: 700, letterSpacing: '0.08em', color: '#625c52' }, 'ENTERTAINER.IN')
    )
  )

  const svg = await satori(tree, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'DM Sans', data: regular, weight: 400, style: 'normal' },
      { name: 'DM Sans', data: bold, weight: 700, style: 'normal' }
    ]
  })
  const png = Buffer.from(new Resvg(svg).render().asPng())

  setResponseHeader(event, 'Content-Type', 'image/png')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800')
  return png
})
