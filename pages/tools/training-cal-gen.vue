<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

// ─── Types ───────────────────────────────────────────────────────────────────
interface TrainingModule {
  id:          string
  topic:       string
  duration:    string
  method:      string
  slot:        string
  audiences:   string[]
  facilitator: string
  priority:    string
}

interface Session {
  id:          string
  topic:       string
  slot:        string
  color:       string
  duration:    string
  method:      string
  audiences:   string[]
  facilitator: string
  priority:    string
}

interface CalDay {
  date:     number
  weekday:  number
  inMonth:  boolean
  holiday:  string | null
  sessions: Session[]
}

// ─── India public holidays 2024–2027 ────────────────────────────────────────
const INDIA_HOLIDAYS: Record<string, string> = {
  '2024-01-26': 'Republic Day',      '2025-01-26': 'Republic Day',      '2026-01-26': 'Republic Day',      '2027-01-26': 'Republic Day',
  '2024-08-15': 'Independence Day',  '2025-08-15': 'Independence Day',  '2026-08-15': 'Independence Day',  '2027-08-15': 'Independence Day',
  '2024-10-02': 'Gandhi Jayanti',    '2025-10-02': 'Gandhi Jayanti / Dussehra', '2026-10-02': 'Gandhi Jayanti',    '2027-10-02': 'Gandhi Jayanti',
  '2024-12-25': 'Christmas',         '2025-12-25': 'Christmas',         '2026-12-25': 'Christmas',         '2027-12-25': 'Christmas',
  '2024-04-14': 'Ambedkar Jayanti',  '2025-04-14': 'Ambedkar Jayanti',  '2026-04-14': 'Ambedkar Jayanti',  '2027-04-14': 'Ambedkar Jayanti',
  '2024-05-01': 'Labour Day',        '2025-05-01': 'Labour Day',        '2026-05-01': 'Labour Day',        '2027-05-01': 'Labour Day',
  '2024-03-25': 'Holi',              '2025-03-14': 'Holi',              '2026-03-04': 'Holi',              '2027-03-22': 'Holi',
  '2024-03-29': 'Good Friday',       '2025-04-18': 'Good Friday',       '2026-04-03': 'Good Friday',       '2027-03-26': 'Good Friday',
  '2024-04-17': 'Ram Navami',        '2025-04-06': 'Ram Navami',        '2026-03-26': 'Ram Navami',        '2027-04-15': 'Ram Navami',
  '2024-10-12': 'Dussehra',                                             '2026-09-21': 'Dussehra',          '2027-10-10': 'Dussehra',
  '2024-11-01': 'Diwali',            '2025-10-20': 'Diwali',            '2026-11-08': 'Diwali',            '2027-10-29': 'Diwali',
  '2024-04-11': 'Eid ul-Fitr',       '2025-03-31': 'Eid ul-Fitr',       '2026-03-20': 'Eid ul-Fitr',       '2027-03-09': 'Eid ul-Fitr',
  '2024-06-17': 'Eid ul-Adha',       '2025-06-07': 'Eid ul-Adha',       '2026-05-27': 'Eid ul-Adha',       '2027-05-16': 'Eid ul-Adha',
  '2024-07-17': 'Muharram',          '2025-07-06': 'Muharram',          '2026-06-25': 'Muharram',          '2027-06-15': 'Muharram',
  '2024-09-26': 'Navratri starts',   '2025-09-22': 'Navratri starts',   '2026-10-10': 'Navratri starts',   '2027-09-30': 'Navratri starts',
}

// ─── Color themes ─────────────────────────────────────────────────────────────
const THEMES: { name: string; colors: string[] }[] = [
  { name: 'Ocean',      colors: ['#2563EB','#0891B2','#0D9488','#7C3AED','#DB2777','#D97706'] },
  { name: 'Forest',     colors: ['#16A34A','#15803D','#4D7C0F','#CA8A04','#B45309','#92400E'] },
  { name: 'Terracotta', colors: ['#B45309','#C2410C','#9F1239','#7C3AED','#1D4ED8','#0F766E'] },
  { name: 'Lavender',   colors: ['#7C3AED','#6D28D9','#DB2777','#BE185D','#2563EB','#0891B2'] },
  { name: 'Dusk',       colors: ['#475569','#334155','#1E293B','#64748B','#94A3B8','#0F172A'] },
  { name: 'Harvest',    colors: ['#D97706','#CA8A04','#65A30D','#16A34A','#0891B2','#7C3AED'] },
]

const DURATION_OPTIONS = ['1h', '1.5h', '2h', '3h', '4h', 'Full day']
const METHOD_OPTIONS   = ['In-person', 'Virtual', 'Hybrid', 'Self-paced']
const PRIORITY_OPTIONS = ['High', 'Medium', 'Low']

const SAMPLE_TOPICS =
`Excel for Beginners
Data Storytelling
Business Communication
Leadership Fundamentals
Conflict Resolution
Time Management
Presentation Skills`

const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December']
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// ─── State ────────────────────────────────────────────────────────────────────
type Phase = 'input' | 'parsing' | 'table' | 'loading' | 'calendar'

const now   = new Date()
const phase = ref<Phase>('input')
const error = ref('')

// Calendar metadata (also used in editable header)
const calTitle = ref('Q3 Training Calendar')
const calOrg   = ref('My Organisation')
const calDept  = ref('Learning & Development')

// Input fields
const selectedMonth  = ref(now.getMonth() + 1)
const selectedYear   = ref(now.getFullYear())
const topicsText     = ref(SAMPLE_TOPICS)
const audiences      = ref(['New Joiners', 'Middle Management', 'All Staff'])
const newAudience    = ref('')
const timeSlots      = ref(['9:00–12:00', '14:00–17:00'])
const preferredDays  = ref([1, 2, 3, 4, 5])
const newSlot        = ref('')

// Table
const modules = ref<TrainingModule[]>([])

// Calendar
const calDays      = ref<CalDay[]>([])
const activeTheme  = ref(0)
const calendarEl   = ref<HTMLElement | null>(null)

// Drag & drop
const draggedSession = ref<{ session: Session; fromDay: CalDay } | null>(null)

// Sidebar session editor
const selectedSession = ref<{ session: Session; day: CalDay } | null>(null)

const canSubmitInput = computed(() =>
  topicsText.value.trim().length > 0 && preferredDays.value.length > 0
)
const canSubmitTable = computed(() => modules.value.some(m => m.topic.trim()))

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2) }

function holidayKey(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}

function topicColor(topic: string, themeIdx: number): string {
  const palette = THEMES[themeIdx].colors
  let hash = 0
  for (let i = 0; i < topic.length; i++) hash = (hash * 31 + topic.charCodeAt(i)) >>> 0
  return palette[hash % palette.length]
}

function buildCalendarGrid(year: number, month: number): CalDay[] {
  const daysInMonth  = new Date(year, month, 0).getDate()
  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const days: CalDay[] = []
  for (let i = 0; i < firstWeekday; i++) {
    days.push({ date: 0, weekday: i, inMonth: false, holiday: null, sessions: [] })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const wd  = new Date(year, month - 1, d).getDay()
    const key = holidayKey(year, month, d)
    days.push({ date: d, weekday: wd, inMonth: true, holiday: INDIA_HOLIDAYS[key] ?? null, sessions: [] })
  }
  return days
}

function assignSessions(days: CalDay[], orderedModules: TrainingModule[]) {
  const available = days.filter(
    d => d.inMonth && !d.holiday && preferredDays.value.includes(d.weekday)
  )
  const total = orderedModules.length
  if (!total || !available.length) return

  const step = Math.max(1, Math.floor(available.length / total))

  orderedModules.forEach((mod, i) => {
    const dayIdx = Math.min(i * step, available.length - 1)
    const slot   = mod.slot === 'Any'
      ? timeSlots.value[i % timeSlots.value.length]
      : mod.slot
    available[dayIdx].sessions.push({
      id:          uid(),
      topic:       mod.topic,
      slot,
      color:       topicColor(mod.topic, activeTheme.value),
      duration:    mod.duration,
      method:      mod.method,
      audiences:   [...mod.audiences],
      facilitator: mod.facilitator,
      priority:    mod.priority,
    })
  })
}

// ─── Audience management ─────────────────────────────────────────────────────
function addAudience() {
  const v = newAudience.value.trim()
  if (v && !audiences.value.includes(v)) audiences.value.push(v)
  newAudience.value = ''
}

function removeAudience(i: number) {
  const removed = audiences.value[i]
  audiences.value.splice(i, 1)
  modules.value.forEach(m => {
    m.audiences = m.audiences.filter(a => a !== removed)
  })
  if (selectedSession.value) {
    selectedSession.value.session.audiences =
      selectedSession.value.session.audiences.filter(a => a !== removed)
  }
}

function toggleModuleAudience(mod: TrainingModule, aud: string) {
  const idx = mod.audiences.indexOf(aud)
  if (idx >= 0) mod.audiences.splice(idx, 1)
  else mod.audiences.push(aud)
}

function toggleSessionAudience(aud: string) {
  if (!selectedSession.value) return
  const s   = selectedSession.value.session
  const idx = s.audiences.indexOf(aud)
  if (idx >= 0) s.audiences.splice(idx, 1)
  else s.audiences.push(aud)
}

// ─── Module management ───────────────────────────────────────────────────────
function addModule() {
  modules.value.push({
    id:          uid(),
    topic:       '',
    duration:    '2h',
    method:      'In-person',
    slot:        'Any',
    audiences:   [],
    facilitator: '',
    priority:    'Medium',
  })
}

function removeModule(i: number) {
  modules.value.splice(i, 1)
}

// ─── Parse table (input → table phase) ──────────────────────────────────────
async function parseTable() {
  if (!canSubmitInput.value || phase.value === 'parsing') return
  phase.value = 'parsing'
  error.value = ''

  try {
    const data = await $fetch<any>('/api/training-cal-gen-table', {
      method: 'POST',
      body: { topicsText: topicsText.value.trim(), audiences: audiences.value }
    })
    modules.value = (data.modules as any[]).map(m => ({ ...m, id: uid() }))
    phase.value   = 'table'
  } catch (e: any) {
    if (e?.response?.status === 429 || e?.data?.statusCode === 429) {
      error.value = 'Wow! Seems like there is a lot of traffic here today! Please grab a cup of coffee meanwhile and try again in a moment.'
      phase.value = 'input'
      return
    }
    // Fallback: build modules from text
    const topics = topicsText.value.split('\n').map((l: string) => l.split('|')[0].trim()).filter(Boolean)
    modules.value = topics.map(topic => ({
      id: uid(), topic, duration: '2h', method: 'In-person',
      slot: 'Any', audiences: [], facilitator: '', priority: 'Medium'
    }))
    phase.value = 'table'
  }
}

// ─── Generate calendar (table → calendar phase) ──────────────────────────────
async function generateCalendar() {
  if (!canSubmitTable.value || phase.value === 'loading') return
  phase.value = 'loading'
  error.value = ''
  selectedSession.value = null

  const validModules = modules.value.filter(m => m.topic.trim())
  const days = buildCalendarGrid(selectedYear.value, selectedMonth.value)
  assignSessions(days, validModules)
  calDays.value = days
  phase.value   = 'calendar'
}

// ─── Drag & drop ─────────────────────────────────────────────────────────────
function onDragStart(session: Session, day: CalDay) {
  selectedSession.value = null
  draggedSession.value  = { session, fromDay: day }
}

function onDrop(toDay: CalDay) {
  if (!draggedSession.value) return
  const { session, fromDay } = draggedSession.value

  if (toDay.date === fromDay.date && toDay.inMonth === fromDay.inMonth) {
    draggedSession.value = null; return
  }
  if (toDay.holiday) {
    if (!confirm(`${toDay.holiday} is a public holiday. Schedule here anyway?`)) {
      draggedSession.value = null; return
    }
  }
  fromDay.sessions = fromDay.sessions.filter(s => s.id !== session.id)
  toDay.sessions.push({ ...session })
  draggedSession.value = null
}

function onDayClick(day: CalDay) {
  if (!selectedSession.value) { selectedSession.value = null; return }
  const { session, day: fromDay } = selectedSession.value
  if (day === fromDay || !day.inMonth) { selectedSession.value = null; return }
  if (day.holiday && !confirm(`${day.holiday} is a public holiday. Schedule here anyway?`)) return
  fromDay.sessions = fromDay.sessions.filter(s => s.id !== session.id)
  day.sessions.push({ ...session })
  selectedSession.value = null
}

// ─── Session sidebar editor ───────────────────────────────────────────────────
function selectSession(session: Session, day: CalDay) {
  if (draggedSession.value) return
  selectedSession.value = selectedSession.value?.session.id === session.id
    ? null
    : { session, day }
}

function removeSelectedSession() {
  if (!selectedSession.value) return
  const { session, day } = selectedSession.value
  day.sessions = day.sessions.filter(s => s.id !== session.id)
  selectedSession.value = null
}

// ─── Theme ───────────────────────────────────────────────────────────────────
function changeTheme(idx: number) {
  activeTheme.value = idx
  calDays.value.forEach(day =>
    day.sessions.forEach(s => { s.color = topicColor(s.topic, idx) })
  )
}

// ─── Slot management ─────────────────────────────────────────────────────────
function addSlot() {
  const v = newSlot.value.trim()
  if (v && !timeSlots.value.includes(v)) timeSlots.value.push(v)
  newSlot.value = ''
}
function removeSlot(i: number) {
  if (timeSlots.value.length > 1) timeSlots.value.splice(i, 1)
}
function toggleDay(wd: number) {
  const idx = preferredDays.value.indexOf(wd)
  if (idx >= 0) {
    if (preferredDays.value.length > 1) preferredDays.value.splice(idx, 1)
  } else {
    preferredDays.value.push(wd)
    preferredDays.value.sort()
  }
}

// ─── Stats ───────────────────────────────────────────────────────────────────
const stats = computed(() => {
  const total      = calDays.value.reduce((n, d) => n + d.sessions.length, 0)
  const holidays   = calDays.value.filter(d => d.inMonth && d.holiday).length
  const scheduled  = new Set(calDays.value.flatMap(d => d.sessions.map(s => s.topic)))
  const allTopics  = modules.value.map(m => m.topic)
  const unscheduled = allTopics.filter(t => !scheduled.has(t))
  return { total, holidays, unscheduled }
})

// ─── Export ───────────────────────────────────────────────────────────────────
const exporting = ref(false)

async function exportPPTX() {
  if (exporting.value) return
  exporting.value = true

  try {
    const { default: PptxGenJS } = await import('pptxgenjs')
    const pptx = new PptxGenJS()

    const stem      = `training-calendar-${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}`
    const monthName = MONTH_NAMES[selectedMonth.value - 1]

    // Pad calDays to complete 7-col grid
    const padded = [...calDays.value]
    while (padded.length % 7) padded.push({ date: 0, weekday: 0, inMonth: false, holiday: null, sessions: [] })
    const rows: CalDay[][] = []
    for (let i = 0; i < padded.length; i += 7) rows.push(padded.slice(i, i + 7))

    // ── Dimensions (all in inches) ──────────────────────────────────────────
    const SW    = 20          // slide width
    const M     = 0.25        // outer margin
    const CX    = M, CY = M   // card origin
    const CW    = SW - M * 2  // 19.5
    const PAD   = 0.35        // card inner padding
    const GX    = CX + PAD    // grid left
    const GW    = CW - PAD * 2
    const COLW  = GW / 7
    const GAP   = 0.04        // inter-cell gap
    const CELLW = COLW - GAP
    const CELLH = 1.65        // cell height — more breathing room
    const RGAP  = 0.04        // row gap

    const TY   = CY + PAD           // title top
    const METY = TY  + 0.52         // meta top (taller title row)
    const DNY  = METY + 0.32 + 0.08 // day-names top
    const GRY  = DNY  + 0.30 + 0.08 // grid top
    const GRH  = rows.length * CELLH + (rows.length - 1) * RGAP
    const CH   = GRY - CY + GRH + PAD  // card height
    const SH   = CH + M               // slide height

    pptx.defineLayout({ name: 'CAL', width: SW, height: SH })
    pptx.layout = 'CAL'

    // ── Embed DM Sans (variable TTF from jsDelivr / Google Fonts repo) ───────
    // Runs in the user's browser so Vercel network restrictions don't apply.
    // Gracefully skips if the fetch fails — PowerPoint will substitute a similar font.
    try {
      const fontResp = await fetch(
        'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/dmsans/DMSans%5Bopsz%2Cwght%5D.ttf'
      )
      if (fontResp.ok) {
        const bytes = new Uint8Array(await fontResp.arrayBuffer())
        let binary = ''
        for (let i = 0; i < bytes.length; i += 8192)
          binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
        ;(pptx as any).defineFontFace({ name: 'DM Sans', data: btoa(binary), type: 'TrueType' })
      }
    } catch { /* system font fallback */ }

    // ── Theme palette (light only) ───────────────────────────────────────────
    const T = {
      slide:       'F5F3EF',
      card:        'FFFFFF',
      cardBorder:  { color: '000000', transparency: 88, width: 0.75 },
      title:       '1A1916',
      meta:        '6B6864',
      dayName:     '6B6864',
      dateNum:     '3A3835',
      cellFill:    { color: '000000', transparency: 94 },
      holidayFill: { color: 'EF4444', transparency: 88 },
      cellBorder:  { color: '000000', transparency: 82, width: 0.5 },
      holiday:     'DC2626',
      sessionText: 'FFFFFF',
    }

    // ── Slide ───────────────────────────────────────────────────────────────
    const slide = pptx.addSlide()
    slide.background = { color: T.slide }

    // Card background
    slide.addShape('roundRect' as any, {
      x: CX, y: CY, w: CW, h: CH,
      fill: { color: T.card },
      line: T.cardBorder,
      rectRadius: 0.05,
    } as any)

    // Title
    slide.addText(calTitle.value || 'Training Calendar', {
      x: GX, y: TY, w: GW * 0.7, h: 0.50,
      fontSize: 30, bold: true, color: T.title,
      fontFace: 'DM Sans',
      valign: 'middle',
    })

    // Meta line: org · dept · month year
    slide.addText(`${calOrg.value}  ·  ${calDept.value}  ·  ${monthName} ${selectedYear.value}`, {
      x: GX, y: METY, w: GW, h: 0.30,
      fontSize: 13, color: T.meta,
      fontFace: 'DM Sans', valign: 'middle',
    })

    // ── Day-name header row ──────────────────────────────────────────────────
    DAY_NAMES.forEach((name, i) => {
      slide.addText(name, {
        x: GX + i * COLW, y: DNY, w: CELLW, h: 0.28,
        fontSize: 11, bold: true, color: T.dayName,
        fontFace: 'DM Sans', align: 'center', charSpacing: 0.3,
      })
    })

    // ── Day cells ────────────────────────────────────────────────────────────
    rows.forEach((week, ri) => {
      week.forEach((day, ci) => {
        if (!day.inMonth) return

        const cx = GX + ci * COLW
        const cy = GRY + ri * (CELLH + RGAP)

        // Cell background
        slide.addShape('roundRect' as any, {
          x: cx, y: cy, w: CELLW, h: CELLH,
          fill: day.holiday ? T.holidayFill : T.cellFill,
          line: T.cellBorder,
          rectRadius: 0.04,
        } as any)

        // Date number
        slide.addText(String(day.date), {
          x: cx + 0.09, y: cy + 0.08, w: 0.42, h: 0.26,
          fontSize: 12, bold: true, color: T.dateNum,
          fontFace: 'DM Sans', valign: 'top',
        })

        let sy = cy + 0.38

        // Holiday label
        if (day.holiday) {
          slide.addText(day.holiday, {
            x: cx + 0.09, y: sy, w: CELLW - 0.18, h: 0.22,
            fontSize: 9, bold: true, color: T.holiday,
            fontFace: 'DM Sans', valign: 'top', shrinkText: true,
          })
          sy += 0.25
        }

        // Session blocks
        day.sessions.forEach(s => {
          const hex = s.color.replace('#', '')

          // Coloured pill
          slide.addShape('roundRect' as any, {
            x: cx + 0.09, y: sy, w: CELLW - 0.18, h: 0.48,
            fill: { color: hex },
            line: { transparency: 100, width: 0 },
            rectRadius: 0.04,
          } as any)

          // Text: topic (bold) + newline + slot · duration
          const parts: any[] = [
            { text: s.topic.length > 32 ? s.topic.slice(0, 31) + '…' : s.topic,
              options: { bold: true, fontSize: 10, breakLine: true } },
            { text: s.duration ? `${s.slot}  ·  ${s.duration}` : s.slot,
              options: { fontSize: 8.5 } },
          ]
          slide.addText(parts, {
            x: cx + 0.13, y: sy + 0.03, w: CELLW - 0.28, h: 0.42,
            color: T.sessionText, fontFace: 'DM Sans',
            valign: 'top', wrap: true, shrinkText: true,
          })

          sy += 0.52
        })
      })
    })

    // ── Trigger download — use arraybuffer + explicit MIME to avoid .zip suffix
    const buffer = await pptx.write({ outputType: 'arraybuffer' }) as unknown as ArrayBuffer
    const blob   = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
    const url    = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `${stem}.pptx`
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)

  } catch {
    alert('Export failed. Please try again.')
  } finally {
    exporting.value = false
  }
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function backToInput() {
  phase.value = 'input'
  calDays.value = []
  selectedSession.value = null
}

function backToTable() {
  phase.value = 'table'
  calDays.value = []
  selectedSession.value = null
}
</script>

<template>
  <UiToolShell wide eyebrow="Web App" title="Training Calendar" deck="Turn a list of topics into a ready-to-present monthly schedule.">
    <div>
      <Transition name="fade" mode="out-in">

        <!-- ── Input phase ──────────────────────────────────────── -->
        <div v-if="phase === 'input'" key="input" class="glass-panel tcg-input-panel">
          <form @submit.prevent="parseTable">

            <!-- Calendar metadata -->
            <div class="glass-label" style="font-weight:700; opacity:0.3; margin-bottom:4rem;">Calendar Details</div>
            <input
              v-model="calTitle"
              class="glass-field"
              style="font-size:22rem; font-weight:700; letter-spacing:-0.02em;"
              placeholder="Calendar title"
            />
            <div class="tcg-row" style="display:flex; gap:16rem; margin-top:12rem;">
              <div style="flex:1;">
                <label class="glass-label" for="tcg-org">Organisation</label>
                <input id="tcg-org" v-model="calOrg" class="glass-field" placeholder="My Organisation" />
              </div>
              <div style="flex:1;">
                <label class="glass-label" for="tcg-dept">Department</label>
                <input id="tcg-dept" v-model="calDept" class="glass-field" placeholder="Department" />
              </div>
            </div>

            <!-- Month / Year -->
            <div class="tcg-row" style="display:flex; gap:16rem; margin-top:12rem;">
              <div style="flex:1;">
                <label class="glass-label" for="tcg-month">Month</label>
                <select id="tcg-month" v-model="selectedMonth" class="glass-field glass-select">
                  <option v-for="(m, i) in MONTH_NAMES" :key="i" :value="i + 1">{{ m }}</option>
                </select>
              </div>
              <div style="flex:1;">
                <label class="glass-label" for="tcg-year">Year</label>
                <input id="tcg-year" v-model.number="selectedYear" type="number" min="2024" max="2030" class="glass-field" />
              </div>
            </div>

            <!-- Audiences -->
            <span class="glass-label" style="margin-top:12rem;">Target Audiences</span>
            <p style="font-size:12rem; opacity:0.4; margin:-4rem 0 8rem; font-style:italic;">Add all the groups this calendar will cater to</p>
            <div class="tcg-chips" style="display:flex; flex-wrap:wrap; gap:6rem; margin-bottom:12rem;">
              <div v-for="(aud, i) in audiences" :key="aud" class="glass-chip" style="display:flex; align-items:center; gap:4rem;">
                {{ aud }}
                <button type="button" @click="removeAudience(i)" aria-label="Remove" style="background:none; border:none; color:inherit; cursor:pointer; font-size:12rem; opacity:0.6;">×</button>
              </div>
              <div style="display:flex; align-items:center; gap:6rem;">
                <input
                  v-model="newAudience"
                  class="glass-field"
                  style="max-width:160rem; font-size:12rem;"
                  placeholder="Add audience…"
                  @keydown.enter.prevent="addAudience"
                />
                <button type="button" class="glass-btn glass-btn--ghost" style="font-size:12rem; padding:4rem 10rem;" @click="addAudience">Add</button>
              </div>
            </div>

            <!-- Topics -->
            <label class="glass-label" for="tcg-topics">Training Topics</label>
            <p style="font-size:12rem; opacity:0.4; margin:-4rem 0 8rem; font-style:italic;">One per line. Optional: <em>Topic | Hours</em></p>
            <textarea
              id="tcg-topics"
              v-model="topicsText"
              class="glass-field"
              rows="8"
              placeholder="Excel for Beginners&#10;Leadership Fundamentals | 6&#10;Communication Skills"
            />

            <!-- Preferred days -->
            <span class="glass-label" style="margin-top:12rem;">Preferred Training Days</span>
            <div style="display:flex; gap:8rem; flex-wrap:wrap; margin:8rem 0 12rem;">
              <button
                v-for="(name, wd) in DAY_NAMES" :key="wd"
                type="button"
                class="glass-chip"
                :class="{ active: preferredDays.includes(wd) }"
                style="font-size:12rem;"
                @click="toggleDay(wd)"
              >{{ name }}</button>
            </div>

            <!-- Time slots -->
            <span class="glass-label">Time Slots</span>
            <div style="display:flex; flex-wrap:wrap; gap:6rem; margin:8rem 0 12rem;">
              <div v-for="(slot, i) in timeSlots" :key="i" class="glass-chip" style="display:flex; align-items:center; gap:4rem; font-size:12rem;">
                {{ slot }}
                <button type="button" @click="removeSlot(i)" aria-label="Remove" style="background:none; border:none; color:inherit; cursor:pointer; font-size:12rem; opacity:0.6;">×</button>
              </div>
              <div style="display:flex; align-items:center; gap:6rem;">
                <input v-model="newSlot" class="glass-field" style="max-width:160rem; font-size:12rem;" placeholder="e.g. 10:00–13:00" @keydown.enter.prevent="addSlot" />
                <button type="button" class="glass-btn glass-btn--ghost" style="font-size:12rem; padding:4rem 10rem;" @click="addSlot">Add</button>
              </div>
            </div>

            <Transition name="fade">
              <p v-if="error" class="glass-note glass-note--error">{{ error }}</p>
            </Transition>

            <button type="submit" class="glass-btn" :disabled="!canSubmitInput" style="margin-top:8rem;">
              Build Training Table →
            </button>

          </form>
        </div>

        <!-- ── Parsing phase ────────────────────────────────────── -->
        <div v-else-if="phase === 'parsing'" key="parsing" class="glass-panel" style="padding:32rem 24rem; text-align:center;">
          <div style="width:32rem; height:32rem; border:3rem solid var(--color-glass-border); border-top-color:var(--color-accent); border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 16rem;"></div>
          <p style="font-size:var(--text-body); font-weight:600; margin:0 0 8rem;">Building your training table with AI…</p>
          <p style="font-size:var(--text-sm); opacity:0.75; margin:0;">Analyzing topics for optimal pedagogical order.</p>
        </div>

        <!-- ── Table phase ──────────────────────────────────────── -->
        <div v-else-if="phase === 'table'" key="table" class="glass-panel" style="max-width:760rem;">

          <div style="margin-bottom:16rem;">
            <h2 style="font-size:var(--text-body); font-weight:700; margin:0 0 4rem;">Review &amp; Customise</h2>
            <p style="font-size:var(--text-sm); opacity:0.6; margin:0;">AI suggested these configs. Adjust anything before generating your calendar.</p>
          </div>

          <div style="display:flex; flex-direction:column; gap:12rem;">
            <div v-for="(mod, i) in modules" :key="mod.id" class="glass-panel" style="padding:16rem;">

              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12rem;">
                <input
                  v-model="mod.topic"
                  class="glass-field"
                  placeholder="Topic name"
                  style="font-weight:600;"
                />
                <button type="button" @click="removeModule(i)" aria-label="Remove module" style="background:none; border:none; font-size:18rem; opacity:0.4; cursor:pointer;">×</button>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12rem;">

                <div>
                  <label class="glass-label" style="font-size:11rem;">Duration</label>
                  <select v-model="mod.duration" class="glass-field glass-select">
                    <option v-for="d in DURATION_OPTIONS" :key="d" :value="d">{{ d }}</option>
                  </select>
                </div>

                <div>
                  <label class="glass-label" style="font-size:11rem;">Method</label>
                  <select v-model="mod.method" class="glass-field glass-select">
                    <option v-for="m in METHOD_OPTIONS" :key="m" :value="m">{{ m }}</option>
                  </select>
                </div>

                <div>
                  <label class="glass-label" style="font-size:11rem;">Time Slot</label>
                  <select v-model="mod.slot" class="glass-field glass-select">
                    <option value="Any">Any (auto-assign)</option>
                    <option v-for="s in timeSlots" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>

                <div>
                  <label class="glass-label" style="font-size:11rem;">Priority</label>
                  <select v-model="mod.priority" class="glass-field glass-select">
                    <option v-for="p in PRIORITY_OPTIONS" :key="p" :value="p">{{ p }}</option>
                  </select>
                </div>

                <div style="grid-column: 1 / -1;">
                  <label class="glass-label" style="font-size:11rem;">Facilitator</label>
                  <input v-model="mod.facilitator" class="glass-field" placeholder="Facilitator name" />
                </div>

                <div style="grid-column: 1 / -1;">
                  <label class="glass-label" style="font-size:11rem;">Audiences</label>
                  <div style="display:flex; flex-wrap:wrap; gap:6rem; margin-top:6rem;">
                    <button
                      v-for="aud in audiences" :key="aud"
                      type="button"
                      class="glass-chip"
                      :class="{ active: mod.audiences.includes(aud) }"
                      style="font-size:12rem;"
                      @click="toggleModuleAudience(mod, aud)"
                    >{{ aud }}</button>
                  </div>
                </div>

              </div>
            </div>

            <button type="button" class="glass-btn glass-btn--ghost" style="align-self:flex-start;" @click="addModule">+ Add Module</button>
          </div>

          <Transition name="fade">
            <p v-if="error" class="glass-note glass-note--error" style="margin-top:12rem;">{{ error }}</p>
          </Transition>

          <div style="display:flex; gap:10rem; margin-top:16rem; flex-wrap:wrap;">
            <button type="button" class="glass-btn glass-btn--ghost" @click="backToInput">← Back</button>
            <button type="button" class="glass-btn" :disabled="!canSubmitTable" @click="generateCalendar">
              Generate Calendar →
            </button>
          </div>

        </div>

        <!-- ── Loading phase ─────────────────────────────────────── -->
        <div v-else-if="phase === 'loading'" key="loading" class="glass-panel" style="padding:32rem 24rem; text-align:center;">
          <div style="width:32rem; height:32rem; border:3rem solid var(--color-glass-border); border-top-color:var(--color-accent); border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 16rem;"></div>
          <p style="font-size:var(--text-body); font-weight:600; margin:0 0 8rem;">Scheduling your trainings intelligently…</p>
          <p style="font-size:var(--text-sm); opacity:0.75; margin:0;">Generating a pedagogically balanced calendar.</p>
        </div>

        <!-- ── Calendar phase ────────────────────────────────────── -->
        <div v-else key="calendar" class="tcg-calendar-wrap">

          <!-- Toolbar -->
          <div style="display:flex; align-items:center; gap:12rem; flex-wrap:wrap; margin-bottom:20rem;">
            <button class="glass-btn glass-btn--ghost" @click="backToInput">← New calendar</button>
            <button class="glass-btn glass-btn--ghost" style="margin-left:0" @click="backToTable">Edit modules</button>

            <div style="display:flex; gap:8rem; align-items:center; margin-left:4rem;">
              <button
                v-for="(th, i) in THEMES" :key="i"
                class="glass-chip"
                :class="{ active: activeTheme === i }"
                :title="th.name"
                :style="{ background: th.colors[0], padding: '4rem 4rem' }"
                @click="changeTheme(i)"
              />
            </div>

            <div style="display:flex; align-items:center; gap:8rem; margin-left:auto;">
              <button class="glass-btn" :disabled="exporting" @click="exportPPTX">
                {{ exporting ? 'Building…' : 'Export PPTX' }}
              </button>
            </div>
          </div>

          <div class="tcg-layout" @click.self="selectedSession = null">

            <!-- Calendar grid -->
            <div class="tcg-cal-scroll">
            <div ref="calendarEl" class="tcg-cal">

              <!-- Editable header -->
              <div class="tcg-cal-header">
                <input
                  v-model="calTitle"
                  class="glass-field"
                  style="font-size:20rem; font-weight:700; background:transparent; border:none; padding:0;"
                  placeholder="Calendar title"
                />
                <div style="display:flex; align-items:center; gap:8rem; font-size:12rem; opacity:0.6;">
                  <input v-model="calOrg"  class="glass-field" style="max-width:120rem; font-size:12rem; background:transparent;" placeholder="Organisation" />
                  <span>·</span>
                  <input v-model="calDept" class="glass-field" style="max-width:120rem; font-size:12rem; background:transparent;" placeholder="Department" />
                  <span>·</span>
                  <span>{{ MONTH_NAMES[selectedMonth - 1] }} {{ selectedYear }}</span>
                </div>
              </div>

              <!-- Day headers -->
              <div class="tcg-grid tcg-header-row">
                <div v-for="n in DAY_NAMES" :key="n" class="tcg-col-head">{{ n }}</div>
              </div>

              <!-- Day cells -->
              <div class="tcg-grid">
                <div
                  v-for="(day, i) in calDays" :key="i"
                  class="tcg-day"
                  :class="{
                    'tcg-day--empty':   !day.inMonth,
                    'tcg-day--holiday': day.inMonth && day.holiday,
                    'tcg-day--today':   day.inMonth && day.date === now.getDate() && selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear(),
                    'tcg-day--receive': day.inMonth && !!selectedSession && selectedSession.day !== day,
                  }"
                  @dragover.prevent
                  @drop="onDrop(day)"
                  @click="onDayClick(day)"
                >
                  <span v-if="day.inMonth" class="tcg-date-num">{{ day.date }}</span>
                  <span v-if="day.holiday" class="tcg-holiday-badge" :title="day.holiday">{{ day.holiday }}</span>
                  <div
                    v-for="session in day.sessions" :key="session.id"
                    class="tcg-session"
                    :class="{ 'tcg-session--selected': selectedSession?.session.id === session.id }"
                    :style="{ background: session.color }"
                    draggable="true"
                    @dragstart.stop="onDragStart(session, day)"
                    @dragover.prevent.stop
                    @click.stop="selectSession(session, day)"
                  >
                    <span class="tcg-session-topic">{{ session.topic }}</span>
                    <span class="tcg-session-slot">{{ session.slot }}</span>
                    <span v-if="session.duration" class="tcg-session-dur">{{ session.duration }}</span>
                  </div>
                </div>
              </div>
            </div>
            </div>

            <!-- Sidebar -->
            <aside class="tcg-sidebar">

              <!-- Session editor -->
              <Transition name="fade" mode="out-in">
                <div v-if="selectedSession" key="editor" class="glass-panel" style="padding:12rem;">
                  <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8rem;">
                    <span class="glass-label" style="margin:0;">Edit Session</span>
                    <button class="glass-chip" style="font-size:14rem; padding:2rem 6rem;" @click="selectedSession = null" aria-label="Close">×</button>
                  </div>

                  <div style="display:flex; flex-direction:column; gap:8rem;">
                    <div>
                      <label class="glass-label" style="font-size:11rem;">Topic</label>
                      <input v-model="selectedSession.session.topic" class="glass-field" placeholder="Topic name" />
                    </div>
                    <div>
                      <label class="glass-label" style="font-size:11rem;">Time Slot</label>
                      <select v-model="selectedSession.session.slot" class="glass-field glass-select">
                        <option v-for="s in timeSlots" :key="s" :value="s">{{ s }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="glass-label" style="font-size:11rem;">Duration</label>
                      <select v-model="selectedSession.session.duration" class="glass-field glass-select">
                        <option v-for="d in DURATION_OPTIONS" :key="d" :value="d">{{ d }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="glass-label" style="font-size:11rem;">Method</label>
                      <select v-model="selectedSession.session.method" class="glass-field glass-select">
                        <option v-for="m in METHOD_OPTIONS" :key="m" :value="m">{{ m }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="glass-label" style="font-size:11rem;">Priority</label>
                      <select v-model="selectedSession.session.priority" class="glass-field glass-select">
                        <option v-for="p in PRIORITY_OPTIONS" :key="p" :value="p">{{ p }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="glass-label" style="font-size:11rem;">Facilitator</label>
                      <input v-model="selectedSession.session.facilitator" class="glass-field" placeholder="Facilitator name" />
                    </div>
                    <div>
                      <label class="glass-label" style="font-size:11rem;">Audiences</label>
                      <div style="display:flex; flex-wrap:wrap; gap:6rem; margin-top:4rem;">
                        <button
                          v-for="aud in audiences" :key="aud"
                          type="button"
                          class="glass-chip"
                          :class="{ active: selectedSession.session.audiences.includes(aud) }"
                          style="font-size:11rem; padding:4rem 8rem;"
                          @click="toggleSessionAudience(aud)"
                        >{{ aud }}</button>
                      </div>
                    </div>
                  </div>

                  <button class="glass-btn--ghost" style="font-size:12rem; padding:6rem 12rem; margin-top:12rem; color:#ef4444; border-color: rgba(239,68,68,0.3);" @click="removeSelectedSession">
                    Remove from calendar
                  </button>
                  <p style="font-size:11rem; opacity:0.35; text-align:center; margin:4rem 0 0; font-style:italic;">Tap any date on the calendar to move this session there</p>
                </div>

                <!-- Stats + legend -->
                <div v-else key="stats" class="tcg-sidebar-content">
                  <div class="glass-panel" style="padding:12rem; margin-bottom:8rem;">
                    <span style="font-size:28rem; font-weight:700;">{{ stats.total }}</span>
                    <span class="glass-label" style="margin:0;">Sessions scheduled</span>
                  </div>
                  <div class="glass-panel" style="padding:12rem;">
                    <span style="font-size:28rem; font-weight:700;">{{ stats.holidays }}</span>
                    <span class="glass-label" style="margin:0;">Holidays this month</span>
                  </div>

                  <div v-if="stats.unscheduled.length" class="glass-panel" style="padding:8rem; margin:8rem 0;">
                    <p class="glass-label" style="margin:0 0 4rem;">Unscheduled topics</p>
                    <ul style="font-size:12rem; margin:0; padding-left:16rem;">
                      <li v-for="t in stats.unscheduled" :key="t">{{ t }}</li>
                    </ul>
                  </div>

                  <div class="glass-panel" style="padding:8rem;">
                    <p class="glass-label" style="margin:0 0 8rem;">Topics</p>
                    <div v-for="mod in modules" :key="mod.id" style="display:flex; align-items:center; gap:8rem; margin-bottom:4rem;">
                      <span style="width:12rem; height:12rem; border-radius:50%; flex-shrink:0;" :style="{ background: topicColor(mod.topic, activeTheme) }" />
                      <div style="font-size:11rem;">
                        <div>{{ mod.topic }}</div>
                        <div style="opacity:0.5;">{{ mod.duration }} · {{ mod.method }}</div>
                      </div>
                    </div>
                  </div>

                  <p class="tcg-sidebar-hint">Tap a session to select it, then tap any date to move it</p>
                </div>
              </Transition>

            </aside>
          </div>
        </div>

      </Transition>
    </div>
  </UiToolShell>
</template>

<style scoped>
/* Input form now uses global glass-panel and glass-field classes for consistency */

.tcg-textarea {
  width: 100%;
  background: color-mix(in srgb, var(--color-bg) 54%, transparent);
  border: 1px solid var(--color-glass-border);
  border-radius: 12rem;
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--text-sm);
  line-height: 1.6;
  padding: 14rem 16rem;
  resize: vertical;
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  transition: border-color 0.18s, background 0.18s, box-shadow 0.22s;
}
.tcg-textarea::placeholder { opacity: 0.35; }
.tcg-textarea:focus {
  outline: none;
  border-color: var(--color-glass-border-hover);
  background: color-mix(in srgb, var(--color-bg) 66%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, rgb(var(--accent-fog, 150,140,255)) 22%, transparent);
}

/* Chips (audiences + slots) */
.tcg-chips, .tcg-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 8rem;
  align-items: center;
}

.tcg-chip, .tcg-slot-tag {
  display: inline-flex;
  align-items: center;
  gap: 6rem;
  padding: 5rem 12rem;
  border-radius: var(--radius-full);
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  font-size: 13rem;
  font-weight: 500;
}

.tcg-chip-remove, .tcg-slot-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 15rem;
  line-height: 1;
  opacity: 0.45;
  padding: 0;
  transition: opacity 0.12s;
}
.tcg-chip-remove:hover, .tcg-slot-remove:hover { opacity: 1; }

.tcg-chip-add {
  display: flex;
  gap: 8rem;
  align-items: center;
}
.tcg-chip-input { max-width: 160rem; }

.tcg-add-btn {
  padding: 8rem 14rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-glass-border);
  background: transparent;
  color: var(--color-text);
  font-family: inherit;
  font-size: 12rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}
.tcg-add-btn:hover { background: var(--color-glass-bg-hover); }

/* Days */
.tcg-days { display: flex; gap: 8rem; flex-wrap: wrap; }
.tcg-day-btn {
  padding: 6rem 14rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-glass-border);
  background: transparent;
  color: var(--color-text);
  font-family: inherit;
  font-size: 12rem;
  font-weight: 500;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.15s, background 0.15s, border-color 0.15s;
}
.tcg-day-btn.active {
  opacity: 1;
  background: var(--color-text);
  color: var(--color-bg);
  border-color: var(--color-text);
}

/* Submit */
.tcg-submit {
  align-self: flex-start;
  margin-top: 8rem;
  padding: var(--btn-pad-y) var(--btn-pad-x);
  border-radius: var(--radius-full);
  background: var(--color-text);
  color: var(--color-bg);
  font-family: inherit;
  font-size: 14rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
}
.tcg-submit:disabled { opacity: 0.4; cursor: not-allowed; }
.tcg-submit:not(:disabled):active { transform: scale(var(--btn-press)); }

/* Error */
.tcg-error {
  font-size: var(--text-sm);
  background: color-mix(in srgb, var(--color-text) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-text) 22%, transparent);
  border-radius: 10rem;
  padding: 12rem 16rem;
  margin: 0;
  line-height: 1.55;
}

/* Loading now uses inline glass-panel styles for consistency with Better Emails */

/* ── Table phase ── */
.tcg-table-wrap {
  display: flex;
  flex-direction: column;
  gap: 20rem;
  max-width: 760rem;
}

.tcg-table-header { margin-bottom: 4rem; }
.tcg-table-title {
  font-size: 22rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: 6rem;
}
.tcg-table-sub {
  font-size: var(--text-sm);
  opacity: 0.5;
  margin: 0;
}

.tcg-modules {
  display: flex;
  flex-direction: column;
  gap: 12rem;
}

.tcg-module-card {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 38%),
    color-mix(in srgb, var(--color-bg) 60%, transparent);
  -webkit-backdrop-filter: blur(20px) saturate(1.35);
  backdrop-filter: blur(20px) saturate(1.35);
  border: 1px solid var(--color-glass-border);
  border-radius: 16rem;
  padding: 16rem;
  display: flex;
  flex-direction: column;
  gap: 14rem;
  box-shadow:
    0 24rem 60rem -36rem rgba(0, 0, 0, 0.55),
    inset 0 1px 1px color-mix(in srgb, var(--color-text) 14%, transparent);
}

.tcg-module-top {
  display: flex;
  align-items: center;
  gap: 10rem;
}

.tcg-module-topic {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-glass-border);
  border-radius: 0;
  color: var(--color-text);
  font-family: inherit;
  font-size: 16rem;
  font-weight: 600;
  padding: 4rem 0 8rem;
  outline: none;
  transition: border-color 0.15s;
}
.tcg-module-topic:focus { border-bottom-color: var(--color-glass-border-hover); }
.tcg-module-topic::placeholder { opacity: 0.3; }

.tcg-module-delete {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--color-text);
  opacity: 0.3;
  font-size: 20rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 4rem;
  transition: opacity 0.12s;
}
.tcg-module-delete:hover { opacity: 0.8; }

@keyframes spin { to { transform: rotate(360deg); } }

/* Table and input now use glass classes for consistency with other tools. Calendar grid retains custom light styles as intentional. */
/* back buttons now use glass-btn--ghost */

/* ── Calendar ── */
.tcg-calendar-wrap {
  display: flex;
  flex-direction: column;
  gap: 20rem;
}

.tcg-toolbar {
  display: flex;
  align-items: center;
  gap: 12rem;
  flex-wrap: wrap;
}

/* back buttons now use glass-btn--ghost */

.tcg-themes { display: flex; gap: 8rem; align-items: center; margin-left: 4rem; }
.tcg-theme-btn {
  width: 22rem;
  height: 22rem;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s;
}
.tcg-theme-btn.active { border-color: var(--color-text); transform: scale(1.2); }
.tcg-theme-btn:hover  { transform: scale(1.15); }

.tcg-export-btns { display: flex; align-items: center; gap: 8rem; margin-left: auto; }
.tcg-export {
  padding: 7rem 16rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-glass-border);
  background: transparent;
  color: var(--color-text);
  font-family: inherit;
  font-size: 12rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.tcg-export:hover:not(:disabled) { background: var(--color-glass-bg-hover); }
.tcg-export:disabled { opacity: 0.5; cursor: not-allowed; }



.tcg-layout {
  display: grid;
  grid-template-columns: 1fr 220rem;
  gap: 24rem;
  align-items: start;
}

@media (max-width: 700px) {
  .tcg-layout { grid-template-columns: 1fr; }
  .tcg-module-fields { grid-template-columns: 1fr; }
  .tcg-row { flex-direction: column; }
}

/* Calendar scroll shell — allows horizontal swipe on narrow screens */
.tcg-cal-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 16rem;
}

/* Calendar grid — fixed light palette, isolated from the site theme */
.tcg-cal {
  --color-glass-bg:           rgba(0, 0, 0, 0.04);
  --color-glass-bg-hover:     rgba(0, 0, 0, 0.07);
  --color-glass-border:       rgba(0, 0, 0, 0.1);
  --color-glass-border-hover: rgba(0, 0, 0, 0.2);
  --color-text:               #1A1916;
  --color-bg:                 #FFFFFF;
  --color-divider:            rgba(0, 0, 0, 0.12);
  background: #F7F5F1;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16rem;
  padding: 20rem;
  overflow: hidden;
  min-width: 560rem;
  color: #1A1916;
}

/* Editable calendar header */
.tcg-cal-header {
  margin-bottom: 20rem;
}

.tcg-hdr-title {
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 20rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-text);
  width: 100%;
  padding: 0;
  margin-bottom: 4rem;
  cursor: text;
}
.tcg-hdr-title::placeholder { opacity: 0.25; }

.tcg-hdr-meta {
  display: flex;
  align-items: center;
  gap: 6rem;
  flex-wrap: wrap;
}
.tcg-hdr-meta-input {
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 12rem;
  color: var(--color-text);
  opacity: 0.5;
  padding: 0;
  min-width: 40rem;
  cursor: text;
}
.tcg-hdr-meta-input::placeholder { opacity: 0.4; }
.tcg-hdr-meta-input:focus { opacity: 0.9; }
.tcg-hdr-sep { font-size: 12rem; opacity: 0.3; }
.tcg-hdr-period { font-size: 12rem; opacity: 0.5; font-weight: 500; }

.tcg-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
.tcg-header-row { margin-bottom: 4rem; }
.tcg-col-head {
  font-size: 10rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.35;
  text-align: center;
  padding-bottom: 8rem;
}

.tcg-day {
  min-height: 80rem;
  border: 1px solid color-mix(in srgb, var(--color-divider) 60%, transparent);
  border-radius: 6rem;
  padding: 5rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  position: relative;
  transition: background 0.15s;
  cursor: default;
}
.tcg-day:hover { background: color-mix(in srgb, var(--color-text) 3%, transparent); }
.tcg-day--empty { background: transparent; border-color: transparent; pointer-events: none; }
.tcg-day--holiday { background: color-mix(in srgb, #ef4444 8%, transparent); }
.tcg-day--receive {
  background: color-mix(in srgb, var(--color-text) 6%, transparent);
  border-color: color-mix(in srgb, var(--color-text) 35%, transparent);
  cursor: pointer;
}
.tcg-day--receive:hover { background: color-mix(in srgb, var(--color-text) 11%, transparent); }
.tcg-day--today .tcg-date-num {
  background: var(--color-text);
  color: var(--color-bg);
  border-radius: 50%;
  width: 20rem;
  height: 20rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tcg-date-num {
  font-size: 11rem;
  font-weight: 600;
  opacity: 0.55;
  line-height: 1;
  flex-shrink: 0;
}

.tcg-holiday-badge {
  font-size: 9rem;
  font-weight: 600;
  color: #ef4444;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tcg-session {
  border-radius: 4rem;
  padding: 3rem 6rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  user-select: none;
  transition: opacity 0.12s, transform 0.1s, box-shadow 0.12s;
}
.tcg-session:hover { opacity: 0.88; }
.tcg-session[draggable="true"] { cursor: grab; }
.tcg-session[draggable="true"]:active { cursor: grabbing; opacity: 0.7; transform: scale(0.97); }
.tcg-session--selected {
  box-shadow: 0 0 0 2px #1A1916, 0 0 0 4px rgba(255, 255, 255, 0.6);
}

.tcg-session-topic {
  font-size: 9rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tcg-session-slot {
  font-size: 8rem;
  color: rgba(255,255,255,0.75);
  font-weight: 500;
}
.tcg-session-dur {
  font-size: 8rem;
  color: rgba(255,255,255,0.6);
  font-weight: 500;
}

/* ── Sidebar ── */
.tcg-sidebar { display: flex; flex-direction: column; gap: 0; }

.tcg-sidebar-content {
  display: flex;
  flex-direction: column;
  gap: 16rem;
}

.tcg-stat-card {
  background: color-mix(in srgb, var(--color-bg) 60%, transparent);
  -webkit-backdrop-filter: blur(20px) saturate(1.35);
  backdrop-filter: blur(20px) saturate(1.35);
  border: 1px solid var(--color-glass-border);
  border-radius: 12rem;
  padding: 16rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;
  box-shadow: inset 0 1px 1px color-mix(in srgb, var(--color-text) 12%, transparent);
}
.tcg-stat-num {
  font-size: 32rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
}
.tcg-stat-label {
  font-size: 11rem;
  opacity: 0.45;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tcg-sidebar-label {
  font-size: var(--text-label);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-label);
  opacity: 0.4;
  margin-bottom: 8rem;
  display: block;
}

.tcg-sidebar-hint {
  font-size: 11rem;
  opacity: 0.3;
  text-align: center;
  margin: 0;
  font-style: italic;
}

.tcg-unscheduled {
  background: color-mix(in srgb, #ef4444 8%, transparent);
  border: 1px solid color-mix(in srgb, #ef4444 20%, transparent);
  border-radius: 12rem;
  padding: 14rem;
  font-size: 12rem;
}
.tcg-unscheduled ul { margin: 0; padding-left: 16rem; opacity: 0.8; }
.tcg-unscheduled li { margin-bottom: 3rem; }

.tcg-legend {
  background: color-mix(in srgb, var(--color-bg) 60%, transparent);
  -webkit-backdrop-filter: blur(20px) saturate(1.35);
  backdrop-filter: blur(20px) saturate(1.35);
  border: 1px solid var(--color-glass-border);
  border-radius: 12rem;
  padding: 14rem;
  box-shadow: inset 0 1px 1px color-mix(in srgb, var(--color-text) 12%, transparent);
}
.tcg-legend-row {
  display: flex;
  align-items: flex-start;
  gap: 8rem;
  margin-bottom: 8rem;
}
.tcg-legend-row:last-child { margin-bottom: 0; }
.tcg-legend-dot {
  width: 10rem;
  height: 10rem;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 3rem;
}
.tcg-legend-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.tcg-legend-name {
  font-size: 11rem;
  opacity: 0.75;
  line-height: 1.3;
  font-weight: 500;
}
.tcg-legend-meta {
  font-size: 10rem;
  opacity: 0.4;
}

/* Sidebar editor now uses glass-panel inside the light .tcg-cal */

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.22s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

