<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

interface Beat { id: string; name: string; weight: number; does: string; on: boolean; min: number }
const NINE: Omit<Beat, 'on' | 'min'>[] = [
  { id: 'attention', name: 'Get attention', weight: 5, does: 'Open with a real moment: a complaint, a near miss, a number that surprises.' },
  { id: 'objective', name: 'Say the goal', weight: 3, does: 'Tell them what they will be able to do by the end, in one sentence.' },
  { id: 'recall', name: 'Wake what they know', weight: 7, does: 'Ask what they already do today. Write their answers up.' },
  { id: 'content', name: 'Show the new thing', weight: 20, does: 'Demonstrate {topic}. Short chunks, one idea each.' },
  { id: 'guide', name: 'Guide them', weight: 12, does: 'Walk through an example together. Point out the traps.' },
  { id: 'practice', name: 'Let them try', weight: 25, does: 'Pairs practise {topic} on a realistic case. You watch.' },
  { id: 'feedback', name: 'Feed back', weight: 10, does: 'Specific, kind, immediate. What worked, what to change.' },
  { id: 'assess', name: 'Check it landed', weight: 10, does: 'A short task they do alone, against the bar you set.' },
  { id: 'transfer', name: 'Take it to work', weight: 8, does: 'Each person names one shift where they will use it this week.' }
]

const topic = ref('Handling a guest complaint')
const total = ref(60)
const start = ref('10:00')
const beats = ref<Beat[]>(NINE.map((b) => ({ ...b, on: true, min: 0 })))

function spread() {
  const live = beats.value.filter((b) => b.on)
  const w = live.reduce((a, b) => a + b.weight, 0)
  let used = 0
  live.forEach((b, i) => {
    b.min = i === live.length - 1 ? Math.max(1, total.value - used) : Math.max(1, Math.round((b.weight / w) * total.value))
    used += b.min
  })
}
spread()
const planned = computed(() => beats.value.filter((b) => b.on).reduce((a, b) => a + b.min, 0))
const diff = computed(() => planned.value - total.value)

function clock(offset: number) {
  const [h, m] = (start.value || '10:00').split(':').map(Number)
  const t = (h || 0) * 60 + (m || 0) + offset
  const hh = Math.floor(t / 60) % 24, mm = t % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}
const timeline = computed(() => {
  let at = 0
  return beats.value.map((b) => { const from = at; if (b.on) at += b.min; return { ...b, from, at: clock(from) } })
})
function bump(b: Beat, n: number) { b.min = Math.max(1, Math.min(120, b.min + n)) }
function move(i: number, d: number) {
  const j = i + d
  if (j < 0 || j >= beats.value.length) return
  const a = beats.value.slice(); [a[i], a[j]] = [a[j], a[i]]; beats.value = a
}
function reset() { beats.value = NINE.map((b) => ({ ...b, on: true, min: 0 })); spread() }
const fill = (s: string) => s.replace('{topic}', topic.value.trim().toLowerCase() || 'the skill')

const copied = ref(false)
async function copy() {
  const lines = [`${topic.value} · ${total.value} min`, ...timeline.value.filter((b) => b.on).map((b) => `${b.at}  ${b.name} (${b.min} min): ${fill(b.does)}`)]
  try { await navigator.clipboard.writeText(lines.join('\n')); copied.value = true; setTimeout(() => (copied.value = false), 1600) } catch { /* ignore */ }
}
function print() { window.print() }

onMounted(() => {
  try {
    const s = JSON.parse(localStorage.getItem('et-cue') || 'null')
    if (s?.beats?.length === 9) { topic.value = s.topic; total.value = s.total; start.value = s.start; beats.value = s.beats }
  } catch { /* ignore */ }
})
watch([topic, total, start, beats], () => localStorage.setItem('et-cue', JSON.stringify({ topic: topic.value, total: total.value, start: start.value, beats: beats.value })), { deep: true })
</script>

<template>
  <BrandAppShell id="cue">
    <div class="cue">
      <div class="cue__setup fx-panel">
        <div class="fx-field cue__topic">
          <label class="fx-label" for="cue-topic">Topic</label>
          <input id="cue-topic" v-model="topic" class="fx-input" placeholder="Handling a guest complaint">
        </div>
        <div class="fx-field">
          <label class="fx-label" for="cue-start">Starts at</label>
          <input id="cue-start" v-model="start" type="time" class="fx-input">
        </div>
        <div class="fx-field cue__len">
          <label class="fx-label" for="cue-len">Length · {{ total }} min</label>
          <input id="cue-len" v-model.number="total" type="range" min="15" max="240" step="5" class="cue__range">
        </div>
        <div class="fx-row cue__btns">
          <button type="button" class="fx-btn" @click="spread">Fit to {{ total }} min</button>
          <button type="button" class="fx-btn fx-btn--ghost" @click="reset">Reset</button>
        </div>
      </div>

      <div class="cue__bar" role="img" :aria-label="`Session of ${planned} minutes split into ${timeline.filter(b => b.on).length} beats`">
        <span v-for="(b, i) in timeline.filter(x => x.on)" :key="b.id" :style="{ flexGrow: b.min }" :class="`c${i % 3}`"><em>{{ b.min }}</em></span>
      </div>
      <p class="cue__sum br-meta" aria-live="polite">
        Planned {{ planned }} of {{ total }} min
        <span v-if="diff > 0" class="cue__over"> · {{ diff }} over</span>
        <span v-else-if="diff < 0"> · {{ -diff }} spare</span>
        <span v-else> · on the dot</span>
      </p>

      <ol class="cue__list">
        <li v-for="(b, i) in timeline" :key="b.id" class="cue__beat" :class="{ off: !b.on }">
          <span class="cue__at br-meta">{{ b.on ? b.at : '—' }}</span>
          <div class="cue__main">
            <h3 class="cue__name">{{ b.name }}</h3>
            <p class="cue__does">{{ fill(b.does) }}</p>
          </div>
          <div class="cue__ctl">
            <div class="cue__min" role="group" :aria-label="`${b.name} minutes`">
              <button type="button" :disabled="!b.on" :aria-label="`Less time for ${b.name}`" @click="bump(beats[i], -1)">−</button>
              <output>{{ b.min }}<small>min</small></output>
              <button type="button" :disabled="!b.on" :aria-label="`More time for ${b.name}`" @click="bump(beats[i], 1)">+</button>
            </div>
            <div class="cue__order">
              <button type="button" :aria-label="`Move ${b.name} up`" :disabled="i === 0" @click="move(i, -1)">↑</button>
              <button type="button" :aria-label="`Move ${b.name} down`" :disabled="i === timeline.length - 1" @click="move(i, 1)">↓</button>
              <button type="button" class="cue__skip" :aria-pressed="!b.on" @click="beats[i].on = !beats[i].on">{{ b.on ? 'Skip' : 'Use' }}</button>
            </div>
          </div>
        </li>
      </ol>

      <div class="fx-row cue__out">
        <button type="button" class="fx-btn fx-btn--sun" @click="print">Print run of show</button>
        <button type="button" class="fx-btn fx-btn--ghost" @click="copy">{{ copied ? 'Copied' : 'Copy as text' }}</button>
        <span class="fx-note">Built on Gagné’s nine events of instruction. Saved in this browser.</span>
      </div>
    </div>
  </BrandAppShell>
</template>

<style scoped>
.cue__setup { display: grid; grid-template-columns: 2fr 1fr 2fr auto; gap: 0 24px; align-items: end; }
@media (max-width: 900px) { .cue__setup { grid-template-columns: 1fr 1fr; } .cue__topic, .cue__len, .cue__btns { grid-column: 1 / -1; } }
.cue__btns { margin-bottom: 22px; }
.cue__range { width: 100%; accent-color: var(--br-ink); height: 44px; }
.cue__bar { display: flex; gap: 3px; height: 64px; margin-top: 12px; border-radius: 12px; overflow: hidden; }
.cue__bar span { min-width: 6px; display: flex; align-items: flex-end; padding: 6px 8px; transition: flex-grow .6s var(--br-ease); }
.cue__bar .c0 { background: var(--br-ink); color: var(--br-paper); }
.cue__bar .c1 { background: var(--br-sun); color: var(--br-ink); }
.cue__bar .c2 { background: var(--paper-3); color: var(--br-ink); }
.cue__bar em { font: 500 11px/1 var(--font-mono); font-style: normal; overflow: hidden; }
.cue__sum { margin: 10px 0 0; }
.cue__over { color: var(--br-ember); }
.cue__list { list-style: none; padding: 0; margin: 32px 0 0; border-top: 3px solid var(--ink); }
.cue__beat { display: grid; grid-template-columns: 80px 1fr auto; gap: 20px; align-items: center; padding: 18px 0; border-bottom: 1px solid var(--line); transition: opacity .3s; }
.cue__beat.off { opacity: .4; }
.cue__beat.off .cue__name { text-decoration: line-through; }
.cue__at { font-size: 13px; }
.cue__name { font: 400 clamp(24px, 2.4vw, 34px)/1 var(--font-display); letter-spacing: -.02em; margin: 0 0 6px; }
.cue__does { margin: 0; color: var(--gray-500); max-width: 60ch; }
.cue__ctl { display: flex; gap: 14px; align-items: center; }
.cue__min { display: flex; align-items: center; border: 1px solid var(--line-strong); border-radius: 999px; }
.cue__min button, .cue__order button { width: 40px; height: 40px; border: 0; background: none; font-size: 18px; cursor: pointer; color: var(--ink); border-radius: 50%; }
.cue__min button:hover, .cue__order button:hover { background: var(--br-sun); }
.cue__min button:disabled, .cue__order button:disabled { opacity: .3; pointer-events: none; }
.cue__min output { min-width: 56px; text-align: center; font: 400 22px/1 var(--font-display); }
.cue__min small { font: 500 10px var(--font-mono); margin-left: 2px; }
.cue__order { display: flex; }
.cue__order .cue__skip { width: auto; padding: 0 12px; border-radius: 999px; font: 500 13px var(--font-ui); }
.cue__out { margin-top: 28px; }
@media (max-width: 760px) {
  .cue__beat { grid-template-columns: 56px 1fr; }
  .cue__ctl { grid-column: 1 / -1; justify-content: space-between; }
}
@media print {
  :global(.mh), :global(.ft), :global(.as__kin), :global(.as__steps), :global(.br-cursor), .cue__setup, .cue__out, .cue__ctl { display: none !important; }
  .cue__beat { grid-template-columns: 70px 1fr auto; break-inside: avoid; }
  .cue__beat.off { display: none; }
}
</style>
