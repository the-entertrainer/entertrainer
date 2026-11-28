<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

const POOL: [string, string][] = [
  ['Spacing', 'Coming back to it over days, not cramming once'],
  ['Retrieval', 'Pulling it out of memory, not reading it again'],
  ['Interleaving', 'Mixing problem types instead of blocking them'],
  ['Cognitive load', 'How much the working memory is juggling right now'],
  ['Forgetting curve', 'The steep early drop in what we keep'],
  ['Scaffolding', 'Support that is taken away as skill grows'],
  ['Transfer', 'Using it on the job, not just in the room'],
  ['Chunking', 'Grouping bits into one meaningful unit'],
  ['Worked example', 'A solved problem shown step by step'],
  ['Feedback', 'Telling someone what to change, while it still matters'],
  ['Elaboration', 'Explaining why, and linking it to what you know'],
  ['Desirable difficulty', 'Hard in a way that makes it stick']
]
interface Card { id: number; pair: number; face: string; side: 'term' | 'meaning' }
const cards = ref<Card[]>([])
const open = ref<number[]>([])
const done = ref<Set<number>>(new Set())
const moves = ref(0)
const secs = ref(0)
const best = ref<number | null>(null)
const lock = ref(false)
const started = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

function shuffle<T>(a: T[]) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
function deal() {
  const picks = shuffle(POOL.map((p, i) => i)).slice(0, 6)
  const list: Card[] = []
  picks.forEach((p, k) => {
    list.push({ id: k * 2, pair: p, face: POOL[p][0], side: 'term' })
    list.push({ id: k * 2 + 1, pair: p, face: POOL[p][1], side: 'meaning' })
  })
  cards.value = shuffle(list)
  open.value = []; done.value = new Set(); moves.value = 0; secs.value = 0; started.value = false; lock.value = false
  clearInterval(timer)
}
const won = computed(() => cards.value.length > 0 && done.value.size === 6)
function flip(c: Card) {
  if (lock.value || open.value.includes(c.id) || done.value.has(c.pair)) return
  if (!started.value) { started.value = true; timer = setInterval(() => { if (!document.hidden) secs.value++ }, 1000) }
  open.value = [...open.value, c.id]
  if (open.value.length < 2) return
  moves.value++
  const [a, b] = open.value.map((id) => cards.value.find((x) => x.id === id)!)
  if (a.pair === b.pair) {
    haptic(14)
    done.value = new Set([...done.value, a.pair])
    open.value = []
    if (done.value.size === 6) {
      clearInterval(timer)
      if (best.value === null || moves.value < best.value) { best.value = moves.value; localStorage.setItem('et-pairs-best', String(moves.value)) }
    }
  } else {
    haptic(4)
    lock.value = true
    setTimeout(() => { open.value = []; lock.value = false }, 1100)
  }
}
const isUp = (c: Card) => open.value.includes(c.id) || done.value.has(c.pair)
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
const matched = computed(() => [...done.value].map((p) => POOL[p]))
onMounted(() => { const b = localStorage.getItem('et-pairs-best'); best.value = b ? Number(b) : null; deal() })
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <BrandAppShell id="pairs">
    <div class="pr">
      <div class="pr__hud br-meta" aria-live="polite">
        <span>Moves <b>{{ moves }}</b></span>
        <span>Time <b>{{ fmt(secs) }}</b></span>
        <span>Pairs <b>{{ done.size }}/6</b></span>
        <span>Best <b>{{ best ?? '—' }}</b></span>
        <button type="button" class="fx-btn fx-btn--ghost fx-btn--sm pr__new" @click="deal">New board</button>
      </div>

      <div v-if="!won" class="pr__grid" role="group" aria-label="Cards">
        <button
          v-for="c in cards" :key="c.id" type="button" class="pr__card"
          :class="{ up: isUp(c), done: done.has(c.pair), meaning: c.side === 'meaning' }"
          :aria-label="isUp(c) ? c.face : 'Face-down card'" :aria-pressed="isUp(c)"
          data-cursor="Turn" @click="flip(c)"
        >
          <span class="pr__inner">
            <span class="pr__back" aria-hidden="true"><BrandMark id="pairs" :size="40" tone="paper" /></span>
            <span class="pr__face"><small class="br-meta">{{ c.side === 'term' ? 'Term' : 'Means' }}</small>{{ c.face }}</span>
          </span>
        </button>
      </div>

      <div v-else class="fx-stage fx-stage--sun pr__won">
        <p class="br-meta">Board cleared</p>
        <p class="pr__big">{{ moves }} moves, {{ fmt(secs) }}.</p>
        <p>Six is perfect. Every miss still taught you where a card was. That is retrieval practice, and you just did it.</p>
        <dl class="pr__recap">
          <div v-for="[t, m] in matched" :key="t"><dt>{{ t }}</dt><dd>{{ m }}</dd></div>
        </dl>
        <button type="button" class="fx-btn" data-cursor="Again" @click="deal">Deal again</button>
      </div>
    </div>
  </BrandAppShell>
</template>

<style scoped>
.pr__hud { display: flex; flex-wrap: wrap; gap: 22px; align-items: center; border-top: 3px solid var(--ink); padding-top: 12px; }
.pr__hud b { font-weight: 600; margin-left: 4px; }
.pr__new { margin-left: auto; }
.pr__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(8px, 1.4vw, 16px); margin-top: 24px; perspective: 1200px; }
@media (max-width: 640px) { .pr__grid { grid-template-columns: repeat(3, 1fr); } }
.pr__card { aspect-ratio: 4 / 5; border: 0; padding: 0; background: none; cursor: pointer; color: inherit; font: inherit; }
.pr__inner { position: relative; display: block; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform .6s var(--br-ease); }
.pr__card.up .pr__inner { transform: rotateY(180deg); }
.pr__back, .pr__face { position: absolute; inset: 0; border-radius: 14px; backface-visibility: hidden; display: flex; }
.pr__back { background: var(--br-ink); align-items: center; justify-content: center; background-image: radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--br-sun) 18%, transparent) 0 30%, transparent 31%); transition: transform .3s var(--br-ease); }
.pr__card:hover:not(.up) .pr__back { transform: translateY(-4px); }
.pr__face { transform: rotateY(180deg); flex-direction: column; justify-content: space-between; text-align: left; padding: clamp(10px, 1.4vw, 18px); background: var(--br-paper); border: 1px solid var(--ink); font: 400 clamp(15px, 1.7vw, 24px)/1.12 var(--font-display); letter-spacing: -.01em; }
.pr__card.meaning .pr__face { font: 400 clamp(12px, 1.15vw, 16px)/1.3 var(--font-ui); }
.pr__face small { color: var(--gray-500); font-size: 10px; }
.pr__card.done .pr__face { background: var(--br-sun); border-color: var(--br-sun); }
.pr__won { margin-top: 24px; }
.pr__big { font: 400 clamp(44px, 6vw, 96px)/.95 var(--font-display); letter-spacing: -.04em; margin: 8px 0 16px; }
.pr__recap { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px 28px; margin: 24px 0; }
.pr__recap dt { font: 400 22px/1.1 var(--font-display); }
.pr__recap dd { margin: 4px 0 0; font-size: 14px; }
@media (prefers-reduced-motion: reduce) { .pr__inner { transition: none; } }
html[data-reduce-motion="on"] .pr__inner { transition: none; }
</style>
