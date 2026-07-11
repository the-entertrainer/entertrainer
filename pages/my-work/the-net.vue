<script setup lang="ts">
import { useTheNetStore, type NetScene } from '~/stores/theNet'
import { BG } from '~/utils/thenet/palette'

// "The Net" — a single-page interactive lesson on the Bezold effect.
// The pedagogy is gated: the learner commits to a wrong answer BEFORE any
// explanation exists (scenes 1–2 carry no headings and no theory), then the
// module pays the debt properly — proof, mechanism, the world, the transfer.
definePageMeta({ layout: false })

useHead({
  title: 'The Net — Entertrainer',
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Space+Grotesk:wght@300..600&display=swap'
    }
  ]
})

const store = useTheNetStore()
const stageKey = ref(0) // bump to remount the 3D stage on replay
const stageRevealed = ref(false)
const maxVisited = ref<NetScene>(1)

const SCENES: { n: NetScene; label: string }[] = [
  { n: 1, label: 'Pick' },
  { n: 2, label: 'Reveal' },
  { n: 3, label: 'Proof' },
  { n: 4, label: 'Why it works' },
  { n: 5, label: 'At the store' },
  { n: 6, label: 'Takeaway' }
]

onMounted(() => store.reset())
onBeforeUnmount(() => store.reset())

watch(
  () => store.scene,
  (s) => {
    if (s > maxVisited.value) maxVisited.value = s
    // each scene starts from its own top — scroll position must not carry over
    if (import.meta.client) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }
)

function onRevealed() {
  stageRevealed.value = true
}
function goTo(s: NetScene) {
  // the rail only navigates ground already covered — the trap can't be skipped
  if (s <= maxVisited.value && s !== 1) store.goTo(s === 2 ? (stageRevealed.value ? 2 : 1) : s)
}
function replay() {
  store.reset()
  stageRevealed.value = false
  maxVisited.value = 1
  stageKey.value++
}

const onStage = computed(() => store.scene <= 2)
</script>

<template>
  <div class="net-module" :style="{ '--bg': BG }">
    <!-- progress rail -->
    <nav class="rail" aria-label="Lesson progress">
      <button
        v-for="s in SCENES"
        :key="s.n"
        class="rail__item"
        :class="{
          'rail__item--on': store.scene === s.n,
          'rail__item--done': maxVisited > s.n || (s.n === 2 && stageRevealed)
        }"
        :disabled="s.n > maxVisited"
        :aria-current="store.scene === s.n ? 'step' : undefined"
        @click="goTo(s.n)"
      >
        <span class="rail__num">{{ String(s.n).padStart(2, '0') }}</span>
        <span class="rail__label">{{ s.label }}</span>
      </button>
    </nav>

    <main class="net-module__main">
      <!-- scenes 1–2: the full-bleed stage -->
      <section v-show="onStage" class="scene scene--stage">
        <WorkThenetNetStage :key="stageKey" @revealed="onRevealed" />
        <transition name="rise">
          <button v-if="stageRevealed && onStage" class="tn-btn scene__continue" @click="store.goTo(3)">
            Continue
          </button>
        </transition>
      </section>

      <!-- scene 3: the proof -->
      <transition name="scene">
        <section v-if="store.scene === 3" class="scene scene--pad">
          <WorkThenetProofPanel />
          <button class="tn-btn" @click="store.goTo(4)">Continue</button>
        </section>
      </transition>

      <!-- scene 4: the mechanism -->
      <transition name="scene">
        <section v-if="store.scene === 4" class="scene scene--pad">
          <WorkThenetWhyPanel />
          <button class="tn-btn" @click="store.goTo(5)">Continue</button>
        </section>
      </transition>

      <!-- scene 5: in the wild -->
      <transition name="scene">
        <section v-if="store.scene === 5" class="scene scene--pad">
          <WorkThenetWildPanel />
          <button class="tn-btn" @click="store.goTo(6)">Continue</button>
        </section>
      </transition>

      <!-- scene 6: the takeaway -->
      <transition name="scene">
        <section v-if="store.scene === 6" class="scene scene--pad">
          <WorkThenetTransferField @replay="replay" />
        </section>
      </transition>
    </main>
  </div>
</template>

<!-- shared type + control system for the module (unscoped, tn- prefixed) -->
<style>
.net-module .tn-overline {
  margin: 0;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #6f6a65;
}
.net-module .tn-h {
  margin: 0;
  font-family: 'Fraunces', serif;
  font-weight: 400;
  font-size: clamp(28px, 4.2vw, 42px);
  letter-spacing: -0.01em;
  line-height: 1.12;
  color: #f1ece6;
  text-align: center;
}
.net-module .tn-body {
  margin: 0;
  font-size: clamp(14.5px, 1.7vw, 16.5px);
  font-weight: 300;
  line-height: 1.68;
  color: #8a8480;
  max-width: 58ch;
}
.net-module .tn-em { color: #d8d2ca; }
.net-module .tn-dim { color: #6f6a65; }
.net-module .tn-note {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: #6f6a65;
  text-align: center;
}
.net-module .tn-btn {
  padding: 11px 26px;
  border: 1px solid rgba(241, 236, 230, 0.24);
  border-radius: 4px;
  background: transparent;
  color: #b9b4ae;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 0.3s ease, color 0.3s ease;
}
.net-module .tn-btn:hover {
  border-color: rgba(241, 236, 230, 0.55);
  color: #f1ece6;
}
.net-module .tn-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #6f6a65;
  font-size: 12.5px;
  cursor: pointer;
  user-select: none;
}
.net-module .tn-toggle input { accent-color: #e8471a; }
</style>

<style scoped>
.net-module {
  position: relative;
  min-height: 100dvh;
  background:
    radial-gradient(120% 85% at 50% 68%, #241c15 0%, #191410 42%, var(--bg) 75%);
  font-family: 'Space Grotesk', 'DM Sans', system-ui, sans-serif;
  color: #f1ece6;
  overflow-x: clip;
}
.net-module__main {
  position: relative;
  z-index: 1;
}

/* ── the rail ── */
.rail {
  position: fixed;
  right: clamp(16px, 3vw, 40px);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 18px;
  z-index: 6;
}
.rail__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px 0;
  background: none;
  border: 0;
  cursor: pointer;
  color: #57524d;
  transition: color 0.35s ease;
}
.rail__item:disabled { cursor: default; }
.rail__item--done { color: #7a746e; }
.rail__item--on { color: #f1ece6; }
.rail__num {
  font-size: 10.5px;
  letter-spacing: 0.1em;
  font-variant-numeric: tabular-nums;
}
.rail__label {
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.rail__item--on .rail__label,
.rail:hover .rail__item:not(:disabled) .rail__label {
  opacity: 1;
  transform: none;
}
@media (max-width: 760px) {
  .rail { right: 10px; gap: 13px; }
  .rail__label { display: none; }
  .rail__num { font-size: 9.5px; }
}

/* ── scenes ── */
.scene { position: relative; }
.scene--stage {
  height: 100dvh;
  width: 100%;
}
.scene--pad {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(24px, 4.5vh, 40px);
  padding: clamp(48px, 7vh, 84px) clamp(20px, 6vw, 72px);
}
/* centre short scenes without clipping tall ones off the top */
.scene--pad::before,
.scene--pad::after {
  content: '';
  margin: auto;
  min-height: 0;
}
.scene__continue {
  position: absolute;
  left: 50%;
  bottom: clamp(70px, 17vh, 130px);
  transform: translateX(-50%);
}
@media (max-width: 700px) {
  /* the stage's own bottom column (slider at 140px, line at 88px) sits
     above; continue takes the very bottom */
  .scene__continue { bottom: 22px; }
  .scene--pad { padding-right: 34px; }
}

/* transitions */
.scene-enter-active { transition: opacity 0.55s ease, transform 0.55s ease; }
.scene-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.scene-enter-from { opacity: 0; transform: translateY(14px); }
.scene-leave-to { opacity: 0; }

.rise-enter-active { transition: opacity 0.7s ease, transform 0.7s ease; }
.rise-enter-from { opacity: 0; transform: translate(-50%, 10px); }

@media (prefers-reduced-motion: reduce) {
  .scene-enter-active, .scene-leave-active, .rise-enter-active { transition: opacity 0.3s ease; }
  .scene-enter-from { transform: none; }
  .rise-enter-from { transform: translateX(-50%); }
}
</style>
