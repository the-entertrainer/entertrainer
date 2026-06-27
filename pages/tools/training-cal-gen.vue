<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

// ─── Types ───────────────────────────────────────────────────────────────────
interface Session { id: string; topic: string; slot: string; color: string }
interface CalDay {
  date:        number
  weekday:     number   // 0=Sun … 6=Sat
  inMonth:     boolean
  holiday:     string | null
  sessions:    Session[]
}

// ─── India public holidays 2024–2027 (YYYY-MM-DD) ────────────────────────────
const INDIA_HOLIDAYS: Record<string, string> = {
  // Fixed
  '2024-01-26': 'Republic Day',      '2025-01-26': 'Republic Day',      '2026-01-26': 'Republic Day',      '2027-01-26': 'Republic Day',
  '2024-08-15': 'Independence Day',  '2025-08-15': 'Independence Day',  '2026-08-15': 'Independence Day',  '2027-08-15': 'Independence Day',
  '2024-10-02': 'Gandhi Jayanti',    '2025-10-02': 'Gandhi Jayanti',    '2026-10-02': 'Gandhi Jayanti',    '2027-10-02': 'Gandhi Jayanti',
  '2024-12-25': 'Christmas',         '2025-12-25': 'Christmas',         '2026-12-25': 'Christmas',         '2027-12-25': 'Christmas',
  '2024-04-14': 'Ambedkar Jayanti',  '2025-04-14': 'Ambedkar Jayanti',  '2026-04-14': 'Ambedkar Jayanti',  '2027-04-14': 'Ambedkar Jayanti',
  '2024-05-01': 'Labour Day',        '2025-05-01': 'Labour Day',        '2026-05-01': 'Labour Day',        '2027-05-01': 'Labour Day',
  // Moveable (pre-calculated)
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

function holidayKey(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}

// ─── Color themes ─────────────────────────────────────────────────────────────
const THEMES: { name: string; colors: string[] }[] = [
  { name: 'Ocean',     colors: ['#2563EB','#0891B2','#0D9488','#7C3AED','#DB2777','#D97706'] },
  { name: 'Forest',   colors: ['#16A34A','#15803D','#4D7C0F','#CA8A04','#B45309','#92400E'] },
  { name: 'Terracotta', colors: ['#B45309','#C2410C','#9F1239','#7C3AED','#1D4ED8','#0F766E'] },
  { name: 'Lavender', colors: ['#7C3AED','#6D28D9','#DB2777','#BE185D','#2563EB','#0891B2'] },
  { name: 'Dusk',     colors: ['#475569','#334155','#1E293B','#64748B','#94A3B8','#0F172A'] },
  { name: 'Harvest',  colors: ['#D97706','#CA8A04','#65A30D','#16A34A','#0891B2','#7C3AED'] },
]

// ─── State ────────────────────────────────────────────────────────────────────
type Phase = 'input' | 'loading' | 'calendar'

const now   = new Date()
const phase = ref<Phase>('input')
const error = ref('')
const usedFallback = ref(false)
const aiReasoning  = ref('')

// Input
const selectedMonth  = ref(now.getMonth() + 1)
const selectedYear   = ref(now.getFullYear())
const topicsText     = ref('')
const timeSlots      = ref(['9:00–12:00', '14:00–17:00'])
const preferredDays  = ref([1, 2, 3, 4, 5])    // Mon–Fri
const maxPerDay      = ref(2)
const audience       = ref('')
const showAdvanced   = ref(false)
const newSlot        = ref('')

// Calendar
const calDays      = ref<CalDay[]>([])
const activeTheme  = ref(0)
const calendarEl   = ref<HTMLElement | null>(null)

// Drag & drop
const draggedSession = ref<{ session: Session; fromDay: CalDay } | null>(null)

const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December']
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const canSubmit = computed(() =>
  topicsText.value.trim().length > 0 && preferredDays.value.length > 0
)

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2) }

function parsedTopics(): string[] {
  return topicsText.value.split('\n')
    .map(l => l.split('|')[0].trim())
    .filter(Boolean)
}

function topicColor(topic: string, themeIdx: number): string {
  const palette = THEMES[themeIdx].colors
  let hash = 0
  for (let i = 0; i < topic.length; i++) hash = (hash * 31 + topic.charCodeAt(i)) >>> 0
  return palette[hash % palette.length]
}

function buildCalendarGrid(year: number, month: number): CalDay[] {
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const days: CalDay[] = []

  // Leading blanks
  for (let i = 0; i < firstWeekday; i++) {
    days.push({ date: 0, weekday: i, inMonth: false, holiday: null, sessions: [] })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const wd = new Date(year, month - 1, d).getDay()
    const key = holidayKey(year, month, d)
    days.push({
      date:     d,
      weekday:  wd,
      inMonth:  true,
      holiday:  INDIA_HOLIDAYS[key] ?? null,
      sessions: []
    })
  }
  return days
}

function assignSessions(days: CalDay[], orderedTopics: string[]) {
  const available = days.filter(
    d => d.inMonth && !d.holiday && preferredDays.value.includes(d.weekday)
  )
  const slots  = timeSlots.value
  const total  = orderedTopics.length
  if (!total || !available.length) return

  // Spread evenly: step through available days so topics land across the whole month
  const step = Math.max(1, Math.floor(available.length / total))

  orderedTopics.forEach((topic, i) => {
    const dayIdx = Math.min(i * step, available.length - 1)
    const slot   = slots[i % slots.length]
    available[dayIdx].sessions.push({
      id:    uid(),
      topic,
      slot,
      color: topicColor(topic, activeTheme.value)
    })
  })
}

// ─── Generate ─────────────────────────────────────────────────────────────────
async function generate() {
  if (!canSubmit.value || phase.value === 'loading') return
  phase.value    = 'loading'
  error.value    = ''
  usedFallback.value = false
  aiReasoning.value  = ''

  const topics = parsedTopics()
  let orderedTopics = [...topics]

  try {
    const data = await $fetch<any>('/api/training-cal-gen', {
      method: 'POST',
      body: {
        month:         selectedMonth.value,
        year:          selectedYear.value,
        topics,
        preferredDays: preferredDays.value,
        timeSlots:     timeSlots.value,
        maxPerDay:     maxPerDay.value,
        audience:      audience.value
      }
    })

    if (data.fallback) {
      usedFallback.value = true
    } else {
      orderedTopics   = data.orderedTopics
      aiReasoning.value = data.reasoning ?? ''
    }
  } catch (e: any) {
    if (e?.response?.status === 429 || e?.data?.statusCode === 429) {
      error.value  = 'Wow! Seems like there is a lot of traffic here today! Please grab a cup of coffee meanwhile and try again in a moment.'
      phase.value  = 'input'
      return
    }
    usedFallback.value = true
  }

  const days = buildCalendarGrid(selectedYear.value, selectedMonth.value)
  assignSessions(days, orderedTopics)
  calDays.value = days
  phase.value   = 'calendar'
}

// ─── Drag & drop ─────────────────────────────────────────────────────────────
function onDragStart(session: Session, day: CalDay) {
  draggedSession.value = { session, fromDay: day }
}

function onDragOver(e: DragEvent) { e.preventDefault() }

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

// ─── Theme change (recolour existing sessions) ──────────────────────────────
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
  const total    = calDays.value.reduce((n, d) => n + d.sessions.length, 0)
  const holidays = calDays.value.filter(d => d.inMonth && d.holiday).length
  const topics   = parsedTopics()
  const scheduled = new Set(calDays.value.flatMap(d => d.sessions.map(s => s.topic)))
  const unscheduled = topics.filter(t => !scheduled.has(t))
  return { total, holidays, unscheduled }
})

// ─── Export ───────────────────────────────────────────────────────────────────
async function exportPNG() {
  if (!import.meta.client || !calendarEl.value) return
  try {
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(calendarEl.value, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
    const a = document.createElement('a')
    a.download = `training-calendar-${selectedYear.value}-${String(selectedMonth.value).padStart(2,'0')}.png`
    a.href = canvas.toDataURL('image/png')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } catch {
    alert('PNG export failed. Please try again.')
  }
}

async function exportPDF() {
  if (!import.meta.client || !calendarEl.value) return
  try {
    const { default: html2canvas } = await import('html2canvas')
    const jspdfMod = await import('jspdf')
    const jsPDF = (jspdfMod as any).jsPDF ?? (jspdfMod as any).default?.jsPDF
    const canvas  = await html2canvas(calendarEl.value, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
    const imgData = canvas.toDataURL('image/png')
    const w = canvas.width  / 2
    const h = canvas.height / 2
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [w, h] })
    pdf.addImage(imgData, 'PNG', 0, 0, w, h)
    pdf.save(`training-calendar-${selectedYear.value}-${String(selectedMonth.value).padStart(2,'0')}.pdf`)
  } catch {
    alert('PDF export failed. Please try again.')
  }
}

function backToInput() {
  phase.value = 'input'
  calDays.value = []
}
</script>

<template>
  <div class="detail-page tcg-page">
    <h1 class="detail-title">Training Calendar</h1>
    <p class="detail-desc">Turn a list of topics into a ready-to-present monthly schedule.</p>

    <div class="tcg-body">

      <!-- ── Input phase ───────────────────────────────────────── -->
      <Transition name="fade" mode="out-in">

        <form v-if="phase === 'input'" key="input" class="tcg-form" @submit.prevent="generate">

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

          <!-- Topics -->
          <label class="tcg-label" for="tcg-topics">Training Topics</label>
          <p class="tcg-hint">One per line. Optional format: <em>Topic Name | Hours</em></p>
          <textarea
            id="tcg-topics"
            v-model="topicsText"
            class="tcg-textarea"
            rows="8"
            placeholder="Excel for Beginners | 3&#10;Data Storytelling | 4&#10;Communication Skills&#10;Leadership Fundamentals | 6&#10;Conflict Resolution"
          />

          <!-- Preferred days -->
          <span class="tcg-label">Preferred Training Days</span>
          <div class="tcg-days">
            <button
              v-for="(name, wd) in DAY_NAMES"
              :key="wd"
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
              <button type="button" class="tcg-slot-remove" @click="removeSlot(i)" aria-label="Remove slot">×</button>
            </div>
            <div class="tcg-slot-add">
              <input v-model="newSlot" class="tcg-input tcg-slot-input" placeholder="e.g. 10:00–13:00" @keydown.enter.prevent="addSlot" />
              <button type="button" class="tcg-slot-add-btn" @click="addSlot">Add</button>
            </div>
          </div>

          <!-- Advanced -->
          <details class="tcg-advanced" :open="showAdvanced" @toggle="showAdvanced = ($event.target as HTMLDetailsElement).open">
            <summary class="tcg-adv-summary">Advanced options</summary>
            <div class="tcg-adv-body">
              <label class="tcg-label" for="tcg-max">Max sessions per day</label>
              <input id="tcg-max" v-model.number="maxPerDay" type="number" min="1" max="6" class="tcg-input tcg-input-sm" />

              <label class="tcg-label" for="tcg-audience">Target audience / batch note</label>
              <input id="tcg-audience" v-model="audience" type="text" class="tcg-input" placeholder="e.g. New joiners, Batch of 25" />
            </div>
          </details>

          <!-- Error -->
          <Transition name="fade">
            <p v-if="error" class="tcg-error">{{ error }}</p>
          </Transition>

          <button type="submit" class="tcg-submit" :disabled="!canSubmit">
            Generate Calendar
          </button>

        </form>

        <!-- ── Loading phase ─────────────────────────────────── -->
        <div v-else-if="phase === 'loading'" key="loading" class="tcg-loading">
          <span class="tcg-spinner" />
          <p>Scheduling your trainings intelligently…</p>
        </div>

        <!-- ── Calendar phase ────────────────────────────────── -->
        <div v-else key="calendar" class="tcg-calendar-wrap">

          <!-- Toolbar -->
          <div class="tcg-toolbar">
            <button class="tcg-back" @click="backToInput">← New calendar</button>

            <div class="tcg-themes">
              <button
                v-for="(th, i) in THEMES"
                :key="i"
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

          <div class="tcg-layout">

            <!-- Calendar grid -->
            <div ref="calendarEl" class="tcg-cal">
              <h2 class="tcg-month-title">{{ MONTH_NAMES[selectedMonth - 1] }} {{ selectedYear }}</h2>

              <!-- Day headers -->
              <div class="tcg-grid tcg-header-row">
                <div v-for="n in DAY_NAMES" :key="n" class="tcg-col-head">{{ n }}</div>
              </div>

              <!-- Day cells -->
              <div class="tcg-grid">
                <div
                  v-for="(day, i) in calDays"
                  :key="i"
                  class="tcg-day"
                  :class="{
                    'tcg-day--empty':   !day.inMonth,
                    'tcg-day--holiday': day.inMonth && day.holiday,
                    'tcg-day--today':   day.inMonth && day.date === now.getDate() && selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear()
                  }"
                  @dragover="onDragOver"
                  @drop="onDrop(day)"
                >
                  <span v-if="day.inMonth" class="tcg-date-num">{{ day.date }}</span>
                  <span v-if="day.holiday" class="tcg-holiday-badge" :title="day.holiday">{{ day.holiday }}</span>
                  <div
                    v-for="session in day.sessions"
                    :key="session.id"
                    class="tcg-session"
                    :style="{ background: session.color }"
                    draggable="true"
                    @dragstart.stop="onDragStart(session, day)"
                    @dragover.prevent.stop
                  >
                    <span class="tcg-session-topic">{{ session.topic }}</span>
                    <span class="tcg-session-slot">{{ session.slot }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <aside class="tcg-sidebar">
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
                <div v-for="topic in parsedTopics()" :key="topic" class="tcg-legend-row">
                  <span class="tcg-legend-dot" :style="{ background: topicColor(topic, activeTheme) }" />
                  <span class="tcg-legend-name">{{ topic }}</span>
                </div>
              </div>
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
.tcg-input-sm { max-width: 80rem; }

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

/* Days */
.tcg-days {
  display: flex;
  gap: 8rem;
  flex-wrap: wrap;
}
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

/* Slots */
.tcg-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 8rem;
  align-items: center;
}
.tcg-slot-tag {
  display: inline-flex;
  align-items: center;
  gap: 6rem;
  padding: 5rem 12rem;
  border-radius: var(--radius-full);
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  font-size: 12rem;
  font-weight: 500;
}
.tcg-slot-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 14rem;
  line-height: 1;
  opacity: 0.5;
  padding: 0;
}
.tcg-slot-remove:hover { opacity: 1; }
.tcg-slot-add {
  display: flex;
  gap: 8rem;
  align-items: center;
}
.tcg-slot-input { max-width: 160rem; }
.tcg-slot-add-btn {
  padding: 8rem 14rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-glass-border);
  background: transparent;
  color: var(--color-text);
  font-family: inherit;
  font-size: 12rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}
.tcg-slot-add-btn:hover { background: var(--color-glass-bg-hover); }

/* Advanced */
.tcg-advanced { border: none; }
.tcg-adv-summary {
  font-size: var(--text-label);
  font-weight: 600;
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  opacity: 0.4;
  cursor: pointer;
  user-select: none;
  list-style: none;
  padding: 6rem 0;
}
.tcg-adv-summary::-webkit-details-marker { display: none; }
.tcg-adv-body {
  display: flex;
  flex-direction: column;
  gap: 12rem;
  padding-top: 12rem;
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

/* ── Calendar ── */
.tcg-calendar-wrap {
  display: flex;
  flex-direction: column;
  gap: 20rem;
}

.tcg-toolbar {
  display: flex;
  align-items: center;
  gap: 16rem;
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

.tcg-themes {
  display: flex;
  gap: 8rem;
  align-items: center;
}
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
  grid-template-columns: 1fr 200rem;
  gap: 24rem;
  align-items: start;
}

@media (max-width: 700px) {
  .tcg-layout { grid-template-columns: 1fr; }
}

/* Calendar grid */
.tcg-cal {
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  border-radius: 16rem;
  padding: 20rem;
  overflow: hidden;
}

.tcg-month-title {
  font-size: 20rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: 16rem;
}

.tcg-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.tcg-header-row {
  margin-bottom: 4rem;
}
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
  cursor: grab;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  user-select: none;
  transition: opacity 0.15s, transform 0.1s;
}
.tcg-session:active { cursor: grabbing; opacity: 0.7; transform: scale(0.97); }

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

/* ── Sidebar ── */
.tcg-sidebar {
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
  align-items: center;
  gap: 8rem;
  margin-bottom: 6rem;
}
.tcg-legend-dot {
  width: 10rem;
  height: 10rem;
  border-radius: 50%;
  flex-shrink: 0;
}
.tcg-legend-name {
  font-size: 11rem;
  opacity: 0.75;
  line-height: 1.3;
}

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.22s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
