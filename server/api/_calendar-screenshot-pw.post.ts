import { defineEventHandler, readBody, setResponseHeader } from 'h3'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Session {
  id: string
  topic: string
  slot: string
  color: string
  duration: string
  method: string
  audiences: string[]
  facilitator: string
  priority: string
}

interface CalDay {
  date: number
  weekday: number
  inMonth: boolean
  holiday: string | null
  sessions: Session[]
}

const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December']
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// ─── HTML builder ─────────────────────────────────────────────────────────────
function buildHtml(body: {
  calTitle: string
  calOrg: string
  calDept: string
  selectedMonth: number
  selectedYear: number
  calDays: CalDay[]
  activeTheme: number
  format: 'png' | 'pdf'
}): string {
  const { calTitle, calOrg, calDept, selectedMonth, selectedYear, calDays } = body

  const monthName = MONTH_NAMES[(selectedMonth - 1) % 12]

  // Build day-header cells
  const dayHeaders = DAY_NAMES.map(n =>
    `<div class="col-head">${n}</div>`
  ).join('')

  // Build day cells
  const dayCells = calDays.map(day => {
    if (!day.inMonth) return `<div class="day day--empty"></div>`

    const holidayBadge = day.holiday
      ? `<span class="holiday-badge">${escHtml(day.holiday)}</span>`
      : ''

    const sessions = day.sessions.map(s => `
      <div class="session" style="background:${s.color}">
        <span class="session-topic">${escHtml(s.topic)}</span>
        <span class="session-slot">${escHtml(s.slot)}</span>
        ${s.duration ? `<span class="session-dur">${escHtml(s.duration)}</span>` : ''}
      </div>
    `).join('')

    const holidayCls = day.holiday ? ' day--holiday' : ''

    return `
      <div class="day${holidayCls}">
        <span class="date-num">${day.date}</span>
        ${holidayBadge}
        ${sessions}
      </div>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'DM Sans', sans-serif;
  background: #0D0C0A;
  color: #F5F3EF;
  padding: 32px;
  min-width: 900px;
}
#cal {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 24px;
  overflow: hidden;
}
.cal-header { margin-bottom: 20px; }
.cal-title {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: 4px;
}
.cal-meta {
  font-size: 12px;
  opacity: 0.5;
}
.cal-meta span + span::before { content: ' · '; opacity: 0.5; }
.col-head {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.35;
  text-align: center;
  padding-bottom: 8px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0;
}
.header-row { margin-bottom: 4px; }
.day {
  min-height: 80px;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  padding: 5px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  position: relative;
}
.day--empty { background: transparent; border-color: transparent; }
.day--holiday { background: rgba(239,68,68,0.08); }
.date-num {
  font-size: 11px;
  font-weight: 600;
  opacity: 0.55;
  line-height: 1;
}
.holiday-badge {
  font-size: 9px;
  font-weight: 600;
  color: #ef4444;
  line-height: 1.2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.session {
  border-radius: 4px;
  padding: 3px 6px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.session-topic {
  font-size: 9px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.session-slot {
  font-size: 8px;
  color: rgba(255,255,255,0.75);
  font-weight: 500;
}
.session-dur {
  font-size: 8px;
  color: rgba(255,255,255,0.6);
  font-weight: 500;
}
</style>
</head>
<body>
<div id="cal">
  <div class="cal-header">
    <div class="cal-title">${escHtml(calTitle)}</div>
    <div class="cal-meta">
      <span>${escHtml(calOrg)}</span>
      <span>${escHtml(calDept)}</span>
      <span>${monthName} ${selectedYear}</span>
    </div>
  </div>
  <div class="grid header-row">${dayHeaders}</div>
  <div class="grid">${dayCells}</div>
</div>
</body>
</html>`
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export default defineEventHandler(async (event) => {
  const body   = await readBody(event)
  const format = (body.format as string) === 'pdf' ? 'pdf' : 'png'
  const stem   = `training-calendar-${body.selectedYear}-${String(body.selectedMonth).padStart(2, '0')}`

  const html = buildHtml(body)

  // Dynamic imports — playwright-core and @sparticuz/chromium are marked as
  // externals in nitro config so they're never bundled by Rollup. Chromium
  // downloads its binary to /tmp on first cold-start and caches it there.
  const { chromium }  = await import('playwright-core')
  const sparticuz     = await import('@sparticuz/chromium').then((m: any) => m.default ?? m)

  const browser = await chromium.launch({
    args:             sparticuz.args,
    executablePath:   await sparticuz.executablePath(),
    headless:         sparticuz.headless,
  })

  try {
    const page = await browser.newPage()
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.setContent(html, { waitUntil: 'networkidle', timeout: 30_000 })

    if (format === 'pdf') {
      const pdf = await page.pdf({ format: 'A4', landscape: true, printBackground: true })
      setResponseHeader(event, 'Content-Type', 'application/pdf')
      setResponseHeader(event, 'Content-Disposition', `attachment; filename="${stem}.pdf"`)
      return pdf
    } else {
      const el  = await page.$('#cal')
      if (!el) throw new Error('Calendar element not found')
      const png = await el.screenshot({ type: 'png' })
      setResponseHeader(event, 'Content-Type', 'image/png')
      setResponseHeader(event, 'Content-Disposition', `attachment; filename="${stem}.png"`)
      return png
    }
  } finally {
    await browser.close()
  }
})
