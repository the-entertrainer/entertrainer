<script setup lang="ts">
// A fake "live status" ticker for pages that aren't built yet — mixes mundane
// dev-work lines with absurd random ones, on a real per-line timer, so the
// "X ago" label actually counts up. Entirely fictional/generic; no real
// personal detail. Purely decorative — no network calls, nothing tracked.
const LINES = [
  // mundane "work"
  "Naveen is fixing a bug that definitely wasn't there yesterday.",
  'Naveen is arguing with CSS. CSS is winning.',
  'Naveen renamed a variable for the fourth time today.',
  'Naveen is Googling an error message, word for word.',
  'Naveen has 34 tabs open. All of them are Stack Overflow.',
  'Naveen is refactoring something nobody asked him to.',
  'Naveen found a new bug while fixing an old one.',
  'Naveen is staring at the screen, thinking very hard.',
  "Naveen just pushed a commit titled 'fix'.",
  'Naveen is waiting for the build to finish. Again.',
  'Naveen is polishing pixels nobody will notice.',
  'Naveen deleted 200 lines of code on purpose. Progress!',
  'Naveen is testing something that will probably break again.',
  "Naveen is measuring twice. Still hasn't cut once.",
  "Naveen is deep in a settings menu he didn't mean to open.",
  'Naveen is naming a function. This may take a while.',
  'Naveen is aligning a div by exactly one pixel.',
  // absurd / random
  'Naveen went to the washroom.',
  'Naveen is being lazy.',
  'Naveen started working on the website again.',
  'Naveen ordered food via Zomato.',
  "Naveen is petting a cat that isn't his.",
  'Naveen is on a coffee run.',
  'Naveen forgot what he was about to do.',
  'Naveen is staring out the window for no reason.',
  'Naveen is doing a very important nothing.',
  "Naveen got distracted by a video. It's been 40 minutes.",
  'Naveen is negotiating with his WiFi router.',
  "Naveen took a 5-minute break. It's been an hour.",
  'Naveen just found his charger.',
  'Naveen is pretending to be productive.',
  'Naveen is having an existential crisis about semicolons.',
  'Naveen stepped away to yell at the internet.',
  'Naveen spilled chai near the keyboard. Again.',
  "Naveen is in a meeting that could've been an email.",
  'Naveen is procrastinating productively.',
  "Naveen is doomscrolling for 'inspiration'.",
  "Naveen just realized he's been on mute for ten minutes.",
  'Naveen is reorganizing desktop icons instead of working.',
  'Naveen briefly considered giving up. Then he made chai instead.'
]

const index = ref(Math.floor(Math.random() * LINES.length))
const line = computed(() => LINES[index.value])
const changedAt = ref(Date.now())
const now = ref(Date.now())

function nextLine() {
  let next = Math.floor(Math.random() * LINES.length)
  if (LINES.length > 1) {
    while (next === index.value) next = Math.floor(Math.random() * LINES.length)
  }
  index.value = next
  changedAt.value = Date.now()
}

const ago = computed(() => {
  const s = Math.floor((now.value - changedAt.value) / 1000)
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  return `${m}m ago`
})

let rotateTimer: ReturnType<typeof setInterval> | null = null
let clockTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  rotateTimer = setInterval(nextLine, 4800 + Math.random() * 1600)
  clockTimer = setInterval(() => { now.value = Date.now() }, 1000)
})
onUnmounted(() => {
  if (rotateTimer) clearInterval(rotateTimer)
  if (clockTimer) clearInterval(clockTimer)
})
</script>

<template>
  <div class="nvstatus glass-panel">
    <div class="nvstatus__head">
      <span class="nvstatus__dot" />
      <span class="nvstatus__label">Naveen — live status</span>
      <span class="nvstatus__ago">{{ ago }}</span>
    </div>
    <Transition name="nvstatus-line" mode="out-in">
      <p :key="index" class="nvstatus__line">{{ line }}</p>
    </Transition>
  </div>
</template>

<style scoped>
.nvstatus {
  padding: 16rem 18rem;
  display: flex;
  flex-direction: column;
  gap: 9rem;
}
.nvstatus__head {
  display: flex;
  align-items: center;
  gap: 8rem;
  font-size: 11rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.6;
}
.nvstatus__dot {
  width: 7rem;
  height: 7rem;
  border-radius: 999px;
  background: #34D399;
  box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.6);
  animation: nvstatus-pulse 1.8s ease-out infinite;
  flex-shrink: 0;
}
@keyframes nvstatus-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.55); }
  70%  { box-shadow: 0 0 0 7rem rgba(52, 211, 153, 0); }
  100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
}
.nvstatus__ago {
  margin-left: auto;
  font-weight: 600;
  opacity: 0.7;
  white-space: nowrap;
}
.nvstatus__line {
  font-size: 15rem;
  line-height: 1.5;
  font-weight: 600;
  letter-spacing: -0.01em;
  min-height: 1.5em;
}
.nvstatus-line-enter-active, .nvstatus-line-leave-active { transition: opacity 0.28s ease, transform 0.28s ease; }
.nvstatus-line-enter-from { opacity: 0; transform: translateY(6rem); }
.nvstatus-line-leave-to { opacity: 0; transform: translateY(-6rem); }

@media (prefers-reduced-motion: reduce) {
  .nvstatus__dot { animation: none; }
  .nvstatus-line-enter-active, .nvstatus-line-leave-active { transition: none; }
}
</style>
