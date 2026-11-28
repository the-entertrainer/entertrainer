<script setup lang="ts">
import { LEVELS, VERBS, type Level } from '~/utils/bloom'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

const ROUND = 60
type Phase = 'intro' | 'play' | 'paused' | 'over'
const phase = ref<Phase>('intro')
const left = ref(ROUND)
const score = ref(0)
const streak = ref(0)
const bestStreak = ref(0)
const best = ref(0)
const answered = ref(0)
const right = ref(0)
const misses = ref<{ verb: string; level: Level; picked: Level }[]>([])
const current = ref<{ verb: string; level: Level } | null>(null)
const flash = ref<{ rung: Level; ok: boolean } | null>(null)
const rungs = [...LEVELS].reverse()
let bag: { verb: string; level: Level }[] = []
let timer: ReturnType<typeof setInterval> | undefined

function deal() {
  if (!bag.length) {
    bag = LEVELS.flatMap((l) => VERBS[l].map((verb) => ({ verb, level: l })))
    for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]] }
  }
  current.value = bag.pop() || null
}
function begin() {
  score.value = 0; streak.value = 0; bestStreak.value = 0; answered.value = 0; right.value = 0; misses.value = []; left.value = ROUND
  bag = []
  deal()
  phase.value = 'play'
  tickOn()
}
function tickOn() {
  clearInterval(timer)
  timer = setInterval(() => {
    if (phase.value !== 'play') return
    left.value--
    if (left.value <= 0) end()
  }, 1000)
}
function end() {
  clearInterval(timer)
  phase.value = 'over'
  haptic([20, 60, 20, 60, 40])
  if (score.value > best.value) { best.value = score.value; localStorage.setItem('et-ladder-best', String(best.value)) }
}
function pick(l: Level) {
  if (phase.value !== 'play' || !current.value) return
  answered.value++
  const ok = l === current.value.level
  if (ok) {
    right.value++
    streak.value++
    bestStreak.value = Math.max(bestStreak.value, streak.value)
    score.value += 10 + Math.min(streak.value - 1, 5) * 2
  } else {
    streak.value = 0
    misses.value.push({ verb: current.value.verb, level: current.value.level, picked: l })
  }
  haptic(ok ? 10 : [30, 40, 30])
  flash.value = { rung: ok ? l : current.value.level, ok }
  setTimeout(() => (flash.value = null), 380)
  deal()
}
function onKey(e: KeyboardEvent) {
  if (phase.value === 'play' && /^[1-6]$/.test(e.key)) pick(LEVELS[Number(e.key) - 1])
  if (e.key === ' ' && phase.value !== 'play' && phase.value !== 'paused' && (e.target as HTMLElement)?.tagName !== 'BUTTON') { e.preventDefault(); begin() }
}
function onVis() {
  if (document.hidden && phase.value === 'play') phase.value = 'paused'
}
onMounted(() => {
  best.value = Number(localStorage.getItem('et-ladder-best') || 0)
  window.addEventListener('keydown', onKey)
  document.addEventListener('visibilitychange', onVis)
})
onBeforeUnmount(() => {
  clearInterval(timer)
  window.removeEventListener('keydown', onKey)
  document.removeEventListener('visibilitychange', onVis)
})
const accuracy = computed(() => answered.value ? Math.round((right.value / answered.value) * 100) : 0)
</script>

<template>
  <BrandAppShell id="ladder">
    <div class="fx-stage lad" :class="`is-${phase}`">
      <div class="lad__hud br-meta">
        <span>Score <b>{{ score }}</b></span>
        <span>Streak <b>{{ streak }}</b></span>
        <span>Best <b>{{ best }}</b></span>
        <span class="lad__time" :class="{ low: left <= 10 }">{{ left }}s</span>
      </div>
      <div class="lad__clock" aria-hidden="true"><i :style="{ transform: `scaleX(${left / ROUND})` }" /></div>

      <div class="lad__board">
        <div class="lad__card-wrap" aria-live="polite">
          <template v-if="phase === 'intro'">
            <p class="lad__big">Sixty seconds.<br>Six rungs.</p>
            <p class="lad__sub">Each verb belongs on one level of Bloom’s ladder. Tap the rung, or press 1 to 6.</p>
            <button type="button" class="fx-btn fx-btn--sun" data-cursor="Play" @click="begin">Start climbing</button>
          </template>
          <template v-else-if="phase === 'play' && current">
            <span class="br-meta lad__hint">Which rung?</span>
            <Transition name="lad-verb" mode="out-in"><p :key="current.verb + answered" class="lad__verb">{{ current.verb }}</p></Transition>
          </template>
          <template v-else-if="phase === 'paused'">
            <p class="lad__big">Paused.</p>
            <button type="button" class="fx-btn fx-btn--sun" @click="phase = 'play'">Keep going</button>
          </template>
          <template v-else-if="phase === 'over'">
            <span class="br-meta">Time</span>
            <p class="lad__big">{{ score }} points</p>
            <p class="lad__sub">{{ right }} of {{ answered }} right · {{ accuracy }}% · longest streak {{ bestStreak }}<template v-if="score && score >= best"> · new best</template></p>
            <button type="button" class="fx-btn fx-btn--sun" data-cursor="Again" @click="begin">Climb again</button>
          </template>
        </div>

        <div class="lad__ladder" role="group" aria-label="Bloom’s levels">
          <button
            v-for="(l, i) in rungs" :key="l" type="button" class="lad__rung"
            :class="{ hit: flash?.rung === l && flash.ok, miss: flash?.rung === l && !flash.ok }"
            :disabled="phase !== 'play'" @click="pick(l)"
          >
            <span class="br-meta">{{ 6 - i }}</span>{{ l }}
          </button>
        </div>
      </div>

      <div v-if="phase === 'over' && misses.length" class="lad__review">
        <h2 class="fx-label">Worth a second look</h2>
        <ul>
          <li v-for="m in misses.slice(0, 8)" :key="m.verb"><b>{{ m.verb }}</b> is <em>{{ m.level }}</em><span>you said {{ m.picked }}</span></li>
        </ul>
      </div>
    </div>
  </BrandAppShell>
</template>

<style scoped>
.lad { min-height: 560px; }
.lad__hud { display: flex; gap: 22px; flex-wrap: wrap; }
.lad__hud b { color: var(--br-sun); font-weight: 600; margin-left: 4px; }
.lad__time { margin-left: auto; font-size: 14px; }
.lad__time.low { color: var(--br-ember); }
.lad__clock { height: 3px; background: color-mix(in srgb, var(--br-paper) 15%, transparent); margin: 12px 0 0; }
.lad__clock i { display: block; height: 100%; background: var(--br-sun); transform-origin: 0 50%; transition: transform 1s linear; }
.lad__board { display: grid; grid-template-columns: 1.2fr 1fr; gap: clamp(20px, 4vw, 60px); align-items: center; margin-top: 32px; }
@media (max-width: 760px) { .lad__board { grid-template-columns: 1fr; } }
.lad__card-wrap { min-height: 260px; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; gap: 18px; }
.lad__big { font: 400 clamp(40px, 5.6vw, 88px)/.95 var(--font-display); letter-spacing: -.04em; margin: 0; }
.lad__sub { margin: 0; opacity: .75; max-width: 40ch; }
.lad__hint { opacity: .6; }
.lad__verb { font: 400 clamp(64px, 10vw, 160px)/.9 var(--font-display); font-variation-settings: "opsz" 144, "SOFT" 30, "WONK" 1; letter-spacing: -.05em; margin: 0; color: var(--br-sun); }
.lad-verb-enter-active { transition: transform .35s var(--br-ease), opacity .35s; }
.lad-verb-leave-active { transition: transform .18s ease-in, opacity .18s; }
.lad-verb-enter-from { transform: translateY(40%); opacity: 0; }
.lad-verb-leave-to { transform: translateY(-40%); opacity: 0; }
.lad__ladder { display: grid; gap: 8px; position: relative; padding: 0 18px; border-left: 3px solid var(--br-paper); border-right: 3px solid var(--br-paper); }
.lad__rung { display: flex; justify-content: space-between; align-items: center; min-height: 52px; padding: 0 16px; border-radius: 8px; border: 1px solid color-mix(in srgb, var(--br-paper) 30%, transparent); background: color-mix(in srgb, var(--br-paper) 6%, transparent); color: var(--br-paper); font: 500 18px/1 var(--font-ui); cursor: pointer; transition: background-color .2s, transform .2s, color .2s; flex-direction: row-reverse; }
.lad__rung:hover:not(:disabled) { background: var(--br-paper); color: var(--br-ink); }
.lad__rung:disabled { cursor: default; opacity: .65; }
.lad__rung.hit { background: var(--br-sun); color: var(--br-ink); transform: scale(1.03); }
.lad__rung.miss { background: var(--br-ember); color: var(--br-ink); animation: lad-shake .35s; }
@keyframes lad-shake { 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
.lad__review { margin-top: 32px; border-top: 1px solid color-mix(in srgb, var(--br-paper) 20%, transparent); padding-top: 18px; }
.lad__review ul { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px 24px; }
.lad__review li { display: grid; }
.lad__review b { font: 400 24px/1.1 var(--font-display); color: var(--br-sun); }
.lad__review em { font-style: normal; }
.lad__review span { opacity: .6; font-size: 14px; }
@media (prefers-reduced-motion: reduce) { .lad-verb-enter-active, .lad-verb-leave-active { transition: none; } .lad__rung.miss { animation: none; } }
</style>
