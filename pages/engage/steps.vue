<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

const PUZZLES: { title: string; steps: string[] }[] = [
  { title: 'Making cutting chai', steps: ['Boil water with crushed ginger', 'Add the tea leaves', 'Pour in the milk', 'Add sugar and bring it to a rolling boil', 'Strain into small glasses'] },
  { title: 'A fire alarm on your floor', steps: ['Stop work and raise the alarm', 'Leave by the nearest marked exit', 'Skip the lift, take the stairs', 'Gather at the assembly point', 'Wait for the headcount before going back'] },
  { title: 'ADDIE, the classic', steps: ['Analyse the gap and the audience', 'Design objectives and assessments', 'Develop the materials', 'Implement with real learners', 'Evaluate what changed at work'] },
  { title: 'Handling a guest complaint', steps: ['Listen without interrupting', 'Apologise for the experience', 'Ask what would make it right', 'Fix it, or hand it to someone who can', 'Follow up before they leave'] },
  { title: 'Giving feedback that lands', steps: ['Ask if now is a good time', 'Describe what you saw, not who they are', 'Say the effect it had', 'Agree one change together', 'Check in on it next week'] }
]

const idx = ref(0)
const order = ref<number[]>([])
const checks = ref(0)
const marks = ref<(boolean | null)[]>([])
const solved = ref(false)
const scores = ref<number[]>([])
const dragging = ref<number | null>(null)
const listEl = ref<HTMLElement | null>(null)

const puzzle = computed(() => PUZZLES[idx.value])
const total = computed(() => scores.value.reduce((a, b) => a + (b || 0), 0))

function shuffled(n: number) {
  let a: number[]
  do {
    a = [...Array(n).keys()]
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  } while (a.every((v, i) => v === i))
  return a
}
function load(i: number) {
  idx.value = i
  order.value = shuffled(PUZZLES[i].steps.length)
  marks.value = order.value.map(() => null)
  checks.value = 0
  solved.value = false
}
function swap(i: number, j: number) {
  if (j < 0 || j >= order.value.length || solved.value) return
  const a = order.value.slice(); [a[i], a[j]] = [a[j], a[i]]; order.value = a
  marks.value = marks.value.map(() => null)
}
function check() {
  checks.value++
  marks.value = order.value.map((v, i) => v === i)
  if (marks.value.every(Boolean)) {
    solved.value = true
    const s = Math.max(20, 100 - (checks.value - 1) * 20)
    const next = scores.value.slice(); next[idx.value] = Math.max(next[idx.value] || 0, s); scores.value = next
    localStorage.setItem('et-steps', JSON.stringify(scores.value))
  }
}

/* Pointer drag: hold the handle, slide, drop. Buttons do the same for keyboards. */
let startY = 0
function down(e: PointerEvent, i: number) {
  if (solved.value) return
  dragging.value = i
  startY = e.clientY
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function moveP(e: PointerEvent) {
  if (dragging.value === null || !listEl.value) return
  const items = [...listEl.value.children] as HTMLElement[]
  const i = dragging.value
  const h = items[i]?.offsetHeight || 64
  const dy = e.clientY - startY
  if (dy > h * 0.6 && i < items.length - 1) { swap(i, i + 1); dragging.value = i + 1; startY += h }
  else if (dy < -h * 0.6 && i > 0) { swap(i, i - 1); dragging.value = i - 1; startY -= h }
}
function up() { dragging.value = null }

onMounted(() => {
  try { scores.value = JSON.parse(localStorage.getItem('et-steps') || '[]') } catch { /* ignore */ }
  load(0)
})
</script>

<template>
  <BrandAppShell id="steps">
    <div class="st">
      <nav class="st__tabs" aria-label="Puzzles">
        <button v-for="(p, i) in PUZZLES" :key="p.title" type="button" class="st__tab" :class="{ on: i === idx, done: scores[i] }" :aria-current="i === idx ? 'true' : undefined" @click="load(i)">
          <span class="br-meta">0{{ i + 1 }}<template v-if="scores[i]"> · {{ scores[i] }}</template></span>
          {{ p.title }}
        </button>
      </nav>

      <div class="st__play">
        <header class="st__head">
          <h2 class="st__title">{{ puzzle.title }}</h2>
          <p class="br-meta">Checks used {{ checks }} · Total {{ total }}/{{ PUZZLES.length * 100 }}</p>
        </header>

        <ol ref="listEl" class="st__list" :class="{ solved }" @pointermove="moveP" @pointerup="up" @pointercancel="up">
          <li v-for="(s, i) in order" :key="s" class="st__item" :class="{ ok: marks[i] === true, no: marks[i] === false, drag: dragging === i }">
            <span class="st__n br-meta">{{ i + 1 }}</span>
            <span class="st__text">{{ puzzle.steps[s] }}</span>
            <span class="st__ctl">
              <button type="button" :disabled="i === 0 || solved" :aria-label="`Move “${puzzle.steps[s]}” up`" @click="swap(i, i - 1)">↑</button>
              <button type="button" :disabled="i === order.length - 1 || solved" :aria-label="`Move “${puzzle.steps[s]}” down`" @click="swap(i, i + 1)">↓</button>
              <span class="st__grip" aria-hidden="true" data-cursor="Drag" @pointerdown="down($event, i)">⋮⋮</span>
            </span>
          </li>
        </ol>

        <div class="fx-row st__acts" aria-live="polite">
          <template v-if="!solved">
            <button type="button" class="fx-btn" @click="check">Check order</button>
            <span v-if="checks && marks.some(m => m === false)" class="fx-note">{{ marks.filter(Boolean).length }} of {{ order.length }} in place. Ticked ones are right; the rest need a nudge.</span>
          </template>
          <template v-else>
            <span class="st__win">In order. {{ scores[idx] }} points.</span>
            <button v-if="idx < PUZZLES.length - 1" type="button" class="fx-btn fx-btn--sun" data-cursor="Next" @click="load(idx + 1)">Next puzzle →</button>
            <button v-else type="button" class="fx-btn fx-btn--sun" @click="load(0)">Back to the first</button>
          </template>
        </div>
      </div>
    </div>
  </BrandAppShell>
</template>

<style scoped>
.st { display: grid; grid-template-columns: 280px 1fr; gap: clamp(20px, 4vw, 60px); align-items: start; }
@media (max-width: 860px) { .st { grid-template-columns: 1fr; } .st__tabs { display: flex; overflow-x: auto; gap: 8px; } .st__tab { flex: none; width: 200px; } }
.st__tabs { display: grid; gap: 6px; border-top: 3px solid var(--ink); padding-top: 12px; }
.st__tab { text-align: left; background: none; border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px; cursor: pointer; font: 400 18px/1.2 var(--font-display); color: var(--ink); display: grid; gap: 4px; transition: background-color .2s, border-color .2s; }
.st__tab:hover { border-color: var(--ink); }
.st__tab.on { background: var(--br-ink); color: var(--br-paper); border-color: var(--br-ink); }
.st__tab.done .br-meta { color: var(--br-sun-deep); }
.st__tab.on.done .br-meta { color: var(--br-sun); }
.st__head { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; flex-wrap: wrap; border-top: 3px solid var(--ink); padding-top: 12px; }
.st__title { font: 400 clamp(32px, 4vw, 60px)/1 var(--font-display); letter-spacing: -.03em; margin: 0; }
.st__list { list-style: none; padding: 0; margin: 24px 0 0; display: grid; gap: 8px; touch-action: none; }
.st__item { display: grid; grid-template-columns: 40px 1fr auto; gap: 12px; align-items: center; min-height: 64px; padding: 6px 8px 6px 16px; border-radius: 14px; background: color-mix(in srgb, var(--paper) 50%, white); border: 1px solid var(--line-strong); transition: background-color .3s, border-color .3s, transform .2s, box-shadow .2s; }
.st__item.drag { transform: scale(1.02); box-shadow: 0 12px 30px -12px rgba(0,0,0,.35); border-color: var(--ink); z-index: 1; }
.st__item.ok { background: var(--br-sun); border-color: var(--br-sun); }
.st__item.no { border-color: var(--br-ember); }
.st__n { font-size: 14px; }
.st__text { font-size: 18px; }
.st__ctl { display: flex; align-items: center; }
.st__ctl button { width: 40px; height: 40px; border: 0; background: none; border-radius: 50%; cursor: pointer; font-size: 18px; color: var(--ink); }
.st__ctl button:hover { background: var(--br-ink); color: var(--br-paper); }
.st__ctl button:disabled { opacity: .25; pointer-events: none; }
.st__grip { width: 40px; height: 48px; display: grid; place-items: center; cursor: grab; color: var(--gray-500); letter-spacing: -3px; touch-action: none; user-select: none; }
.st__list.solved .st__grip { visibility: hidden; }
.st__acts { margin-top: 24px; }
.st__win { font: 400 clamp(26px, 3vw, 40px)/1 var(--font-display); }
</style>
