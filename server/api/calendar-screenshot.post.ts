// Export calendar as PNG or PDF using Satori (pure-JS SVG renderer).
// No Chromium binary — works on Vercel with zero cold-start penalty.
//
// Option B (external screenshot API) scaffold lives in
// server/api/_calendar-screenshot-pw.post.ts — swap the endpoint URL in
// the client and POST the same JSON body to Screenshotone / Browserless
// if this approach needs replacing.

import { defineEventHandler, readBody, setResponseHeader } from 'h3'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Session {
  id: string; topic: string; slot: string; color: string
  duration: string; method: string; audiences: string[]; facilitator: string; priority: string
}
interface CalDay {
  date: number; weekday: number; inMonth: boolean; holiday: string | null; sessions: Session[]
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// ─── Font loading — cached across warm invocations ────────────────────────────
const fontCache = new Map<string, ArrayBuffer>()

async function loadFont(weight: 400 | 700): Promise<ArrayBuffer> {
  const key = `dmsans-${weight}`
  if (fontCache.has(key)) return fontCache.get(key)!
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=DM+Sans:wght@${weight}&display=swap`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' } }
  ).then(r => r.text())
  // Last match = latin subset (no unicode-range restriction)
  const urls = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g)]
  const url  = urls.at(-1)?.[1]
  if (!url) throw new Error(`DM Sans ${weight}: font URL not found`)
  const buf = await fetch(url).then(r => r.arrayBuffer())
  fontCache.set(key, buf)
  return buf
}

// ─── Satori element builder ───────────────────────────────────────────────────
// Satori requires display:'flex' on every container — CSS grid isn't supported.
type SEl = { type: string; props: Record<string, any> }
type Child = SEl | string | null | undefined | false

function e(tag: string, style: Record<string, any>, ...children: Child[]): SEl {
  const kids = (children as any[]).flat().filter((c: any) => c != null && c !== false)
  return {
    type: tag,
    props: {
      style: { display: 'flex', ...style },
      children: kids.length === 0 ? undefined : kids.length === 1 ? kids[0] : kids,
    },
  }
}

// ─── Element tree ─────────────────────────────────────────────────────────────
function buildTree(body: {
  calTitle: string; calOrg: string; calDept: string
  selectedMonth: number; selectedYear: number; calDays: CalDay[]
}) {
  const { calTitle, calOrg, calDept, selectedMonth, selectedYear, calDays } = body
  const monthName = MONTH_NAMES[(selectedMonth - 1) % 12]

  // Pad to a complete 7-column grid
  const padded = [...calDays]
  while (padded.length % 7) {
    padded.push({ date: 0, weekday: 0, inMonth: false, holiday: null, sessions: [] })
  }
  const rows: CalDay[][] = []
  for (let i = 0; i < padded.length; i += 7) rows.push(padded.slice(i, i + 7))

  const W      = 1240
  const CELL_H = 92
  const H      = 40 + 72 + 20 + 26 + rows.length * (CELL_H + 3) + 40

  // Day-name header row
  const dayHeaders = e('div', { gap: '2px', marginBottom: '8px' },
    ...DAY_NAMES.map(n =>
      e('div', {
        flex: 1, justifyContent: 'center',
        fontSize: '10px', fontWeight: 700,
        textTransform: 'uppercase', opacity: 0.35, letterSpacing: '0.08em',
      }, n)
    )
  )

  // Week rows
  const weekEls = rows.map(week =>
    e('div', { gap: '2px', marginBottom: '2px' },
      ...week.map(day => {
        if (!day.inMonth) return e('div', { flex: 1, minHeight: CELL_H })

        return e('div', {
          flex: 1, flexDirection: 'column', minHeight: CELL_H,
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 5,
          padding: 4, gap: 2, overflow: 'hidden',
          backgroundColor: day.holiday ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.025)',
        },
          // Date number
          e('span', { fontSize: 10, fontWeight: 600, opacity: 0.5, flexShrink: 0 },
            String(day.date)
          ),
          // Holiday label
          day.holiday
            ? e('span', {
                fontSize: 8, fontWeight: 600, color: '#ef4444',
                lineHeight: 1.2, flexShrink: 0,
              }, day.holiday.length > 17 ? day.holiday.slice(0, 16) + '…' : day.holiday)
            : undefined,
          // Session blocks
          ...day.sessions.map(s =>
            e('div', {
              flexDirection: 'column', flexShrink: 0,
              backgroundColor: s.color, borderRadius: 3,
              padding: '2px 4px', gap: 1,
            },
              e('span', { fontSize: 8, fontWeight: 700, color: '#fff', lineHeight: 1.2 },
                s.topic.length > 26 ? s.topic.slice(0, 25) + '…' : s.topic
              ),
              e('span', { fontSize: 7, color: 'rgba(255,255,255,0.75)' }, s.slot),
              s.duration
                ? e('span', { fontSize: 7, color: 'rgba(255,255,255,0.6)' }, s.duration)
                : undefined
            )
          )
        )
      })
    )
  )

  const tree = e('div', {
    flexDirection: 'column',
    backgroundColor: '#0D0C0A', color: '#F5F3EF',
    padding: 32, width: W, height: H,
    fontFamily: '"DM Sans", sans-serif',
  },
    e('div', {
      flexDirection: 'column', flex: 1,
      backgroundColor: 'rgba(255,255,255,0.055)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 16, padding: '20px 22px',
    },
      // Calendar header
      e('div', { flexDirection: 'column', marginBottom: 18 },
        e('div', {
          fontSize: 20, fontWeight: 700,
          letterSpacing: '-0.6px', marginBottom: 4,
        }, calTitle),
        e('div', { fontSize: 12, opacity: 0.5, gap: 4, alignItems: 'center' },
          e('span', {}, calOrg),
          e('span', { opacity: 0.4 }, '·'),
          e('span', {}, calDept),
          e('span', { opacity: 0.4 }, '·'),
          e('span', {}, `${monthName} ${selectedYear}`)
        )
      ),
      dayHeaders,
      ...weekEls
    )
  )

  return { tree, W, H }
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export default defineEventHandler(async (event) => {
  const body   = await readBody(event)
  const format = body.format === 'pdf' ? 'pdf' : 'png'
  const stem   = `training-calendar-${body.selectedYear}-${String(body.selectedMonth).padStart(2, '0')}`

  // Load in parallel — fonts are cached after the first cold-start
  const [{ default: satori }, { Resvg }, fontRegular, fontBold] = await Promise.all([
    import('satori'),
    import('@resvg/resvg-js'),
    loadFont(400),
    loadFont(700),
  ])

  const { tree, W, H } = buildTree(body)

  const svg = await satori(tree, {
    width:  W,
    height: H,
    fonts: [
      { name: 'DM Sans', data: fontRegular, weight: 400, style: 'normal' },
      { name: 'DM Sans', data: fontBold,    weight: 700, style: 'normal' },
    ],
  })

  // Render at 2× for crisp screens
  const png = Buffer.from(
    new Resvg(svg, { fitTo: { mode: 'width', value: W * 2 } }).render().asPng()
  )

  if (format === 'pdf') {
    const { PDFDocument } = await import('pdf-lib')
    const pdfDoc = await PDFDocument.create()
    const img    = await pdfDoc.embedPng(png)
    const page   = pdfDoc.addPage([img.width, img.height])
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height })
    const pdf = Buffer.from(await pdfDoc.save())
    setResponseHeader(event, 'Content-Type', 'application/pdf')
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="${stem}.pdf"`)
    return pdf
  }

  setResponseHeader(event, 'Content-Type', 'image/png')
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="${stem}.png"`)
  return png
})
