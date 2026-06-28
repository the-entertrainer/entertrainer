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
  '2024-10-02': 'Gandhi Jayanti',    '2025-10-02': 'Gandhi Jayanti',    '2026-10-02': 'Gandhi Jayanti',    '2027-10-02': 'Gandhi Jayanti',
  '2024-12-25': 'Christmas',         '2025-12-25': 'Christmas',         '2026-12-25': 'Christmas',         '2027-12-25': 'Christmas',
  '2024-04-14': 'Ambedkar Jayanti',  '2025-04-14': 'Ambedkar Jayanti',  '2026-04-14': 'Ambedkar Jayanti',  '2027-04-14': 'Ambedkar Jayanti',
  '2024-05-01': 'Labour Day',        '2025-05-01': 'Labour Day',        '2026-05-01': 'Labour Day',        '2027-05-01': 'Labour Day',
  '2024-03-25': 'Holi',              '2025-03-14': 'Holi',              '2026-03-04': 'Holi',              '2027-03-22': 'Holi',
  '2024-03-29': 'Good Friday',       '2025-04-18': 'Good Friday',       '2026-04-03': 'Good Friday',       '2027-03-26': 'Good Friday',
  '2024-04-17': 'Ram Navami',        '2025-04-06': 'Ram Navami',        '2026-03-26': 'Ram Navami',        '2027-04-15': 'Ram Navami',
  '2024-10-12': 'Dussehra',          '2025-10-02': 'Dussehra',          '2026-09-21': 'Dussehra',          '2027-10-10': 'Dussehra',
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
const usedFallback = ref(false)
const aiReasoning  = ref('')

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
  phase.value        = 'loading'
  error.value        = ''
  usedFallback.value = false
  aiReasoning.value  = ''
  selectedSession.value = null

  const validModules = modules.value.filter(m => m.topic.trim())
  const topics       = validModules.map(m => m.topic.trim())
  let   orderedModules = [...validModules]

  try {
    const data = await $fetch<any>('/api/training-cal-gen', {
      method: 'POST',
      body: {
        month:         selectedMonth.value,
        year:          selectedYear.value,
        topics,
        preferredDays: preferredDays.value,
        timeSlots:     timeSlots.value,
        maxPerDay:     1,
        audience:      audiences.value.join(', ')
      }
    })

    if (data.fallback) {
      usedFallback.value = true
    } else {
      aiReasoning.value = data.reasoning ?? ''
      const topicOrder  = new Map((data.orderedTopics as string[]).map((t: string, i: number) => [t.toLowerCase(), i]))
      orderedModules    = [...validModules].sort((a, b) =>
        (topicOrder.get(a.topic.toLowerCase()) ?? 999) - (topicOrder.get(b.topic.toLowerCase()) ?? 999)
      )
    }
  } catch (e: any) {
    if (e?.response?.status === 429 || e?.data?.statusCode === 429) {
      error.value  = 'Wow! Seems like there is a lot of traffic here today! Please grab a cup of coffee meanwhile and try again in a moment.'
      phase.value  = 'table'
      return
    }
    usedFallback.value = true
  }

  const days = buildCalendarGrid(selectedYear.value, selectedMonth.value)
  assignSessions(days, orderedModules)
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
function isMobileOrIOS(): boolean {
  if (!import.meta.client) return false
  return /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

async function exportCanvas(purpose: 'png' | 'pdf') {
  if (!import.meta.client || !calendarEl.value) return
  const mobile = isMobileOrIOS()
  const stem   = `training-calendar-${selectedYear.value}-${String(selectedMonth.value).padStart(2,'0')}`

  // window.open must be called synchronously — iOS revokes the gesture after any await
  let win: Window | null = null
  if (mobile) {
    win = window.open('', '_blank')
    if (win) {
      win.document.write('<!doctype html><html><body style="margin:0;background:#111;display:flex;align-items:center;justify-content:center;min-height:100vh"><p style="color:#fff;font-family:sans-serif;opacity:.5">Loading…</p></body></html>')
      win.document.close()
    }
  }

  try {
    const { default: html2canvas } = await import('html2canvas')
    const canvas  = await html2canvas(calendarEl.value, { scale: mobile ? 1.5 : 2, useCORS: true, backgroundColor: '#ffffff' })
    const dataURL = canvas.toDataURL('image/png')

    if (mobile) {
      if (win) {
        win.document.open()
        win.document.write(`<!doctype html><html><head><title>${stem}</title></head><body style="margin:0;background:#000"><img src="${dataURL}" style="width:100%;height:auto;display:block"></body></html>`)
        win.document.close()
      }
    } else if (purpose === 'png') {
      const a = document.createElement('a')
      a.download = `${stem}.png`
      a.href     = dataURL
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } else {
      const jspdfMod = await import('jspdf')
      const jsPDF    = (jspdfMod as any).jsPDF ?? (jspdfMod as any).default?.jsPDF
      const w = canvas.width  / 2
      const h = canvas.height / 2
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [w, h] })
      pdf.addImage(dataURL, 'PNG', 0, 0, w, h)
      pdf.save(`${stem}.pdf`)
    }
  } catch {
    if (win) win.close()
    alert('Export failed. Please try again.')
  }
}

function exportPNG() { exportCanvas('png') }
function exportPDF() { exportCanvas('pdf') }

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
  <div class="detail-page tcg-page">
    <h1 class="detail-title">Training Calendar</h1>
    <p class="detail-desc">Turn a list of topics into a ready-to-present monthly schedule.</p>

    <div class="tcg-body">
      <Transition name="fade" mode="out-in">

        <!-- ── Input phase ──────────────────────────────────────── -->
        <form v-if="phase === 'input'" key="input" class="tcg-form" @submit.prevent="parseTable">

          <!-- Calendar metadata -->
          <div class="tcg-section-label">Calendar Details</div>
          <input
            v-model="calTitle"
            class="tcg-input tcg-input--hero"
            placeholder="Calendar title"
          />
          <div class="tcg-row">
            <div class="tcg-field">
              <label class="tcg-label" for="tcg-org">Organisation</label>
              <input id="tcg-org" v-model="calOrg" class="tcg-input" placeholder="My Organisation" />
            </div>
            <div class="tcg-field">
              <label class="tcg-label" for="tcg-dept">Department</label>
              <input id="tcg-dept" v-model="calDept" class="tcg-input" placeholder="Department" />
            </div>
          </div>

          <!-- Month / Year -->
          <div class="tcg-row">
            <div class="tcg-field">
              <label class="tcg-label" for="tcg-month">Month</label>
              <select id="tcg-month" v-model="selectedMonth" class="tcg-select">
                <option v-for="(m, i) in MONTH_NAMES" :key="i" :value="i + 1">{{ m }}</option>
              </select>
            </div>
            <div class="tcg-field">
              <label class="tcg-label" for="tcg-year">Year</label>
              <input id="tcg-year" v-model.number="selectedYear" type="number" min="2024" max="2030" class="tcg-input" />
            </div>
          </div>

          <!-- Audiences -->
          <span class="tcg-label">Target Audiences</span>
          <p class="tcg-hint">Add all the groups this calendar will cater to</p>
          <div class="tcg-chips">
            <div v-for="(aud, i) in audiences" :key="aud" class="tcg-chip">
              {{ aud }}
              <button type="button" class="tcg-chip-remove" @click="removeAudience(i)" aria-label="Remove">×</button>
            </div>
            <div class="tcg-chip-add">
              <input
                v-model="newAudience"
                class="tcg-input tcg-chip-input"
                placeholder="Add audience…"
                @keydown.enter.prevent="addAudience"
              />
              <button type="button" class="tcg-add-btn" @click="addAudience">Add</button>
            </div>
          </div>

          <!-- Topics -->
          <label class="tcg-label" for="tcg-topics">Training Topics</label>
          <p class="tcg-hint">One per line. Optional: <em>Topic | Hours</em></p>
          <textarea
            id="tcg-topics"
            v-model="topicsText"
            class="tcg-textarea"
            rows="8"
            placeholder="Excel for Beginners&#10;Leadership Fundamentals | 6&#10;Communication Skills"
          />

          <!-- Preferred days -->
          <span class="tcg-label">Preferred Training Days</span>
          <div class="tcg-days">
            <button
              v-for="(name, wd) in DAY_NAMES" :key="wd"
              type="button"
              class="tcg-day-btn"
              :class="{ active: preferredDays.includes(wd) }"
              @click="toggleDay(wd)"
            >{{ name }}</button>
          </div>

          <!-- Time slots -->
          <span class="tcg-label">Time Slots</span>
          <div class="tcg-slots">
            <div v-for="(slot, i) in timeSlots" :key="i" class="tcg-slot-tag">
              {{ slot }}
              <button type="button" class="tcg-slot-remove" @click="removeSlot(i)" aria-label="Remove">×</button>
            </div>
            <div class="tcg-chip-add">
              <input v-model="newSlot" class="tcg-input tcg-chip-input" placeholder="e.g. 10:00–13:00" @keydown.enter.prevent="addSlot" />
              <button type="button" class="tcg-add-btn" @click="addSlot">Add</button>
            </div>
          </div>

          <Transition name="fade">
            <p v-if="error" class="tcg-error">{{ error }}</p>
          </Transition>

          <button type="submit" class="tcg-submit" :disabled="!canSubmitInput">
            Build Training Table →
          </button>

        </form>

        <!-- ── Parsing phase ────────────────────────────────────── -->
        <div v-else-if="phase === 'parsing'" key="parsing" class="tcg-loading">
          <span class="tcg-spinner" />
          <p>Building your training table with AI…</p>
        </div>

        <!-- ── Table phase ──────────────────────────────────────── -->
        <div v-else-if="phase === 'table'" key="table" class="tcg-table-wrap">

          <div class="tcg-table-header">
            <div>
              <h2 class="tcg-table-title">Review &amp; Customise</h2>
              <p class="tcg-table-sub">AI suggested these configs. Adjust anything before generating your calendar.</p>
            </div>
          </div>

          <div class="tcg-modules">
            <div v-for="(mod, i) in modules" :key="mod.id" class="tcg-module-card">

              <div class="tcg-module-top">
                <input
                  v-model="mod.topic"
                  class="tcg-module-topic"
                  placeholder="Topic name"
                />
                <button type="button" class="tcg-module-delete" @click="removeModule(i)" aria-label="Remove module">×</button>
              </div>

              <div class="tcg-module-fields">

                <div class="tcg-mfield">
                  <label class="tcg-mlabel">Duration</label>
                  <select v-model="mod.duration" class="tcg-mselect">
                    <option v-for="d in DURATION_OPTIONS" :key="d" :value="d">{{ d }}</option>
                  </select>
                </div>

                <div class="tcg-mfield">
                  <label class="tcg-mlabel">Method</label>
                  <select v-model="mod.method" class="tcg-mselect">
                    <option v-for="m in METHOD_OPTIONS" :key="m" :value="m">{{ m }}</option>
                  </select>
                </div>

                <div class="tcg-mfield">
                  <label class="tcg-mlabel">Time Slot</label>
                  <select v-model="mod.slot" class="tcg-mselect">
                    <option value="Any">Any (auto-assign)</option>
                    <option v-for="s in timeSlots" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>

                <div class="tcg-mfield">
                  <label class="tcg-mlabel">Priority</label>
                  <select v-model="mod.priority" class="tcg-mselect">
                    <option v-for="p in PRIORITY_OPTIONS" :key="p" :value="p">{{ p }}</option>
                  </select>
                </div>

                <div class="tcg-mfield tcg-mfield--full">
                  <label class="tcg-mlabel">Facilitator</label>
                  <input v-model="mod.facilitator" class="tcg-minput" placeholder="Facilitator name" />
                </div>

                <div class="tcg-mfield tcg-mfield--full">
                  <label class="tcg-mlabel">Audiences</label>
                  <div class="tcg-aud-chips">
                    <button
                      v-for="aud in audiences" :key="aud"
                      type="button"
                      class="tcg-aud-chip"
                      :class="{ active: mod.audiences.includes(aud) }"
                      @click="toggleModuleAudience(mod, aud)"
                    >{{ aud }}</button>
                  </div>
                </div>

              </div>
            </div>

            <button type="button" class="tcg-add-module" @click="addModule">+ Add Module</button>
          </div>

          <Transition name="fade">
            <p v-if="error" class="tcg-error">{{ error }}</p>
          </Transition>

          <div class="tcg-table-actions">
            <button type="button" class="tcg-back-link" @click="backToInput">← Back</button>
            <button type="button" class="tcg-submit" :disabled="!canSubmitTable" @click="generateCalendar">
              Generate Calendar →
            </button>
          </div>

        </div>

        <!-- ── Loading phase ─────────────────────────────────────── -->
        <div v-else-if="phase === 'loading'" key="loading" class="tcg-loading">
          <span class="tcg-spinner" />
          <p>Scheduling your trainings intelligently…</p>
        </div>

        <!-- ── Calendar phase ────────────────────────────────────── -->
        <div v-else key="calendar" class="tcg-calendar-wrap">

          <!-- Toolbar -->
          <div class="tcg-toolbar">
            <button class="tcg-back" @click="backToInput">← New calendar</button>
            <button class="tcg-back" style="margin-left:0" @click="backToTable">Edit modules</button>

            <div class="tcg-themes">
              <button
                v-for="(th, i) in THEMES" :key="i"
                class="tcg-theme-btn"
                :class="{ active: activeTheme === i }"
                :title="th.name"
                :style="{ background: th.colors[0] }"
                @click="changeTheme(i)"
              />
            </div>

            <div class="tcg-export-btns">
              <button class="tcg-export" @click="exportPNG">Export PNG</button>
              <button class="tcg-export" @click="exportPDF">Export PDF</button>
            </div>
          </div>

          <!-- Fallback banner -->
          <Transition name="fade">
            <p v-if="usedFallback" class="tcg-banner">
              Smart scheduling unavailable — using rule-based scheduler.
            </p>
          </Transition>

          <!-- AI reasoning -->
          <Transition name="fade">
            <details v-if="aiReasoning" class="tcg-reasoning">
              <summary>AI scheduling notes</summary>
              <p>{{ aiReasoning }}</p>
            </details>
          </Transition>

          <div class="tcg-layout" @click.self="selectedSession = null">

            <!-- Calendar grid -->
            <div class="tcg-cal-scroll">
            <div ref="calendarEl" class="tcg-cal">

              <!-- Editable header -->
              <div class="tcg-cal-header">
                <input
                  v-model="calTitle"
                  class="tcg-hdr-title"
                  placeholder="Calendar title"
                />
                <div class="tcg-hdr-meta">
                  <input v-model="calOrg"  class="tcg-hdr-meta-input" placeholder="Organisation" />
                  <span class="tcg-hdr-sep">·</span>
                  <input v-model="calDept" class="tcg-hdr-meta-input" placeholder="Department" />
                  <span class="tcg-hdr-sep">·</span>
                  <span class="tcg-hdr-period">{{ MONTH_NAMES[selectedMonth - 1] }} {{ selectedYear }}</span>
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
                    'tcg-day--today':   day.inMonth && day.date === now.getDate() && selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear()
                  }"
                  @dragover.prevent
                  @drop="onDrop(day)"
                  @click="selectedSession = null"
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
                <div v-if="selectedSession" key="editor" class="tcg-edit-panel">
                  <div class="tcg-edit-header">
                    <span class="tcg-sidebar-label">Edit Session</span>
                    <button class="tcg-edit-close" @click="selectedSession = null" aria-label="Close">×</button>
                  </div>

                  <div class="tcg-edit-field">
                    <label class="tcg-mlabel">Topic</label>
                    <input v-model="selectedSession.session.topic" class="tcg-minput" placeholder="Topic name" />
                  </div>
                  <div class="tcg-edit-field">
                    <label class="tcg-mlabel">Time Slot</label>
                    <select v-model="selectedSession.session.slot" class="tcg-mselect">
                      <option v-for="s in timeSlots" :key="s" :value="s">{{ s }}</option>
                    </select>
                  </div>
                  <div class="tcg-edit-field">
                    <label class="tcg-mlabel">Duration</label>
                    <select v-model="selectedSession.session.duration" class="tcg-mselect">
                      <option v-for="d in DURATION_OPTIONS" :key="d" :value="d">{{ d }}</option>
                    </select>
                  </div>
                  <div class="tcg-edit-field">
                    <label class="tcg-mlabel">Method</label>
                    <select v-model="selectedSession.session.method" class="tcg-mselect">
                      <option v-for="m in METHOD_OPTIONS" :key="m" :value="m">{{ m }}</option>
                    </select>
                  </div>
                  <div class="tcg-edit-field">
                    <label class="tcg-mlabel">Priority</label>
                    <select v-model="selectedSession.session.priority" class="tcg-mselect">
                      <option v-for="p in PRIORITY_OPTIONS" :key="p" :value="p">{{ p }}</option>
                    </select>
                  </div>
                  <div class="tcg-edit-field">
                    <label class="tcg-mlabel">Facilitator</label>
                    <input v-model="selectedSession.session.facilitator" class="tcg-minput" placeholder="Facilitator name" />
                  </div>
                  <div class="tcg-edit-field">
                    <label class="tcg-mlabel">Audiences</label>
                    <div class="tcg-aud-chips tcg-aud-chips--sm">
                      <button
                        v-for="aud in audiences" :key="aud"
                        type="button"
                        class="tcg-aud-chip"
                        :class="{ active: selectedSession.session.audiences.includes(aud) }"
                        @click="toggleSessionAudience(aud)"
                      >{{ aud }}</button>
                    </div>
                  </div>

                  <button class="tcg-remove-session" @click="removeSelectedSession">
                    Remove from calendar
                  </button>
                </div>

                <!-- Stats + legend -->
                <div v-else key="stats" class="tcg-sidebar-content">
                  <div class="tcg-stat-card">
                    <span class="tcg-stat-num">{{ stats.total }}</span>
                    <span class="tcg-stat-label">Sessions scheduled</span>
                  </div>
                  <div class="tcg-stat-card">
                    <span class="tcg-stat-num">{{ stats.holidays }}</span>
                    <span class="tcg-stat-label">Holidays this month</span>
                  </div>

                  <div v-if="stats.unscheduled.length" class="tcg-unscheduled">
                    <p class="tcg-sidebar-label">Unscheduled topics</p>
                    <ul>
                      <li v-for="t in stats.unscheduled" :key="t">{{ t }}</li>
                    </ul>
                  </div>

                  <div class="tcg-legend">
                    <p class="tcg-sidebar-label">Topics</p>
                    <div v-for="mod in modules" :key="mod.id" class="tcg-legend-row">
                      <span class="tcg-legend-dot" :style="{ background: topicColor(mod.topic, activeTheme) }" />
                      <div class="tcg-legend-info">
                        <span class="tcg-legend-name">{{ mod.topic }}</span>
                        <span class="tcg-legend-meta">{{ mod.duration }} · {{ mod.method }}</span>
                      </div>
                    </div>
                  </div>

                  <p class="tcg-sidebar-hint">Tap a session to edit it</p>
                </div>
              </Transition>

            </aside>
          </div>
        </div>

      </Transition>
    </div>
  </div>
</template>

<style scoped>
.tcg-page {
  min-height: 100dvh;
  background: var(--color-bg);
  color: var(--color-text);
  padding: var(--page-top) var(--grid-margin) calc(100rem + var(--safe-bottom));
}

.tcg-body {
  border-top: 1px solid var(--color-divider);
  padding-top: 48rem;
}

/* ── Form ── */
.tcg-form {
  display: flex;
  flex-direction: column;
  gap: 14rem;
  max-width: 600rem;
}

.tcg-section-label {
  font-size: var(--text-label);
  font-weight: 700;
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  opacity: 0.3;
  padding-bottom: 2rem;
}

.tcg-label {
  display: block;
  font-size: var(--text-label);
  font-weight: 600;
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  opacity: 0.45;
  padding-bottom: 4rem;
}

.tcg-hint {
  font-size: 12rem;
  opacity: 0.4;
  margin: -8rem 0 4rem;
  font-style: italic;
}

.tcg-row {
  display: flex;
  gap: 16rem;
}
.tcg-field {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  flex: 1;
}

.tcg-input, .tcg-select {
  width: 100%;
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 10rem;
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--text-sm);
  padding: 10rem 14rem;
  transition: border-color 0.15s;
}
.tcg-input:focus, .tcg-select:focus { outline: none; border-color: var(--color-glass-border-hover); }

.tcg-input--hero {
  font-size: 22rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  padding: 12rem 16rem;
  border-radius: 12rem;
}

.tcg-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12rem center;
  padding-right: 32rem;
}

.tcg-textarea {
  width: 100%;
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 12rem;
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--text-sm);
  line-height: 1.6;
  padding: 14rem 16rem;
  resize: vertical;
  transition: border-color 0.15s;
}
.tcg-textarea::placeholder { opacity: 0.35; }
.tcg-textarea:focus { outline: none; border-color: var(--color-glass-border-hover); }

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

/* ── Loading ── */
.tcg-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rem;
  padding: 80rem 0;
  opacity: 0.6;
}
.tcg-spinner {
  width: 32rem;
  height: 32rem;
  border: 3px solid transparent;
  border-top-color: var(--color-text);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

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
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 14rem;
  padding: 16rem;
  display: flex;
  flex-direction: column;
  gap: 14rem;
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

.tcg-module-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10rem;
}

.tcg-mfield {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}
.tcg-mfield--full { grid-column: 1 / -1; }

.tcg-mlabel {
  font-size: 11rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.4;
}

.tcg-mselect, .tcg-minput {
  width: 100%;
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 8rem;
  color: var(--color-text);
  font-family: inherit;
  font-size: 13rem;
  padding: 8rem 10rem;
  transition: border-color 0.15s;
}
.tcg-mselect:focus, .tcg-minput:focus { outline: none; border-color: var(--color-glass-border-hover); }
.tcg-minput::placeholder { opacity: 0.35; }

.tcg-mselect {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10rem center;
  padding-right: 26rem;
}

.tcg-aud-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6rem;
}
.tcg-aud-chips--sm .tcg-aud-chip { font-size: 11rem; padding: 4rem 10rem; }

.tcg-aud-chip {
  padding: 5rem 12rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-glass-border);
  background: transparent;
  color: var(--color-text);
  font-family: inherit;
  font-size: 12rem;
  font-weight: 500;
  cursor: pointer;
  opacity: 0.45;
  transition: opacity 0.12s, background 0.12s, border-color 0.12s;
}
.tcg-aud-chip.active {
  opacity: 1;
  background: var(--color-text);
  color: var(--color-bg);
  border-color: var(--color-text);
}
.tcg-aud-chip:not(.active):hover { opacity: 0.75; }

.tcg-add-module {
  align-self: flex-start;
  background: transparent;
  border: 1px dashed var(--color-glass-border);
  border-radius: 10rem;
  color: var(--color-text);
  font-family: inherit;
  font-size: 13rem;
  font-weight: 500;
  opacity: 0.5;
  cursor: pointer;
  padding: 10rem 18rem;
  transition: opacity 0.15s, background 0.15s;
  margin-top: 4rem;
}
.tcg-add-module:hover { opacity: 0.9; background: var(--color-glass-bg); }

.tcg-table-actions {
  display: flex;
  align-items: center;
  gap: 20rem;
  margin-top: 8rem;
}
.tcg-back-link {
  background: none;
  border: none;
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--text-sm);
  font-weight: 500;
  opacity: 0.4;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.15s;
}
.tcg-back-link:hover { opacity: 0.8; }

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

.tcg-back {
  background: none;
  border: none;
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--text-sm);
  font-weight: 500;
  opacity: 0.45;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.15s;
}
.tcg-back:hover { opacity: 0.9; }

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

.tcg-export-btns { display: flex; gap: 8rem; margin-left: auto; }
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
.tcg-export:hover { background: var(--color-glass-bg-hover); }

.tcg-banner {
  font-size: 12rem;
  opacity: 0.5;
  font-style: italic;
  margin: 0;
  padding: 8rem 14rem;
  background: color-mix(in srgb, var(--color-text) 5%, transparent);
  border-radius: 8rem;
}

.tcg-reasoning {
  font-size: var(--text-sm);
  opacity: 0.7;
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 10rem;
  padding: 12rem 16rem;
}
.tcg-reasoning summary { cursor: pointer; font-weight: 600; }
.tcg-reasoning p { margin-top: 8rem; line-height: 1.55; }

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

/* Calendar grid */
.tcg-cal {
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 16rem;
  padding: 20rem;
  overflow: hidden;
  min-width: 560rem;
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
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(0,0,0,0.5);
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
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 12rem;
  padding: 16rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;
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
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 12rem;
  padding: 14rem;
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

/* ── Session editor panel ── */
.tcg-edit-panel {
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 14rem;
  padding: 16rem;
  display: flex;
  flex-direction: column;
  gap: 12rem;
}

.tcg-edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tcg-edit-close {
  background: none;
  border: none;
  color: var(--color-text);
  opacity: 0.4;
  font-size: 20rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.12s;
}
.tcg-edit-close:hover { opacity: 0.9; }

.tcg-edit-field {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.tcg-remove-session {
  margin-top: 4rem;
  padding: 8rem 14rem;
  border-radius: 8rem;
  border: 1px solid color-mix(in srgb, #ef4444 40%, transparent);
  background: color-mix(in srgb, #ef4444 8%, transparent);
  color: #ef4444;
  font-family: inherit;
  font-size: 12rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.tcg-remove-session:hover { background: color-mix(in srgb, #ef4444 15%, transparent); }

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.22s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
