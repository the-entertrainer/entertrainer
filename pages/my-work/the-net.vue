<script setup lang="ts">
import { useTheNetStore } from '~/stores/theNet'
import { BG } from '~/utils/thenet/palette'

// "The Net" — a single-page microlearning module on the Bezold effect.
// The pedagogy is gated: the learner commits to a wrong answer BEFORE any
// explanation exists. So scenes 1 and 2 carry no headings and no definitions;
// the first real words arrive only after the choice has been made.
definePageMeta({ layout: false })

useHead({
  title: 'The Net — Entertrainer',
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap'
    }
  ]
})

const store = useTheNetStore()
type View = 'stage' | 'proof' | 'transfer'
const view = ref<View>('stage')
const stageRevealed = ref(false)

onMounted(() => store.reset())
onBeforeUnmount(() => store.reset())

function onRevealed() {
  stageRevealed.value = true
}
function toProof() {
  view.value = 'proof'
  store.goTo(3)
}
function toTransfer() {
  view.value = 'transfer'
  store.goTo(4)
}

const step = computed(() => (view.value === 'stage' ? (stageRevealed.value ? 2 : 1) : view.value === 'proof' ? 3 : 4))
</script>

<template>
  <div class="net-module" :style="{ '--bg': BG }">
    <div class="net-module__bg" aria-hidden="true" />

    <!-- quiet step indicator; the canvas is the only ornament -->
    <div class="steps" aria-hidden="true">
      <span v-for="n in 4" :key="n" class="steps__dot" :class="{ 'steps__dot--on': step >= n }" />
    </div>

    <main class="net-module__main">
      <!-- SCENES 1 & 2 — full-bleed canvas, type inside the composition -->
      <section v-show="view === 'stage'" class="scene scene--stage">
        <WorkThenetNetStage @revealed="onRevealed" />
        <transition name="rise">
          <button v-if="stageRevealed" class="continue" type="button" @click="toProof">
            Continue
          </button>
        </transition>
      </section>

      <!-- SCENE 3 — THE PROOF -->
      <transition name="scene">
        <section v-if="view === 'proof'" class="scene scene--pad">
          <WorkThenetProofPanel />
          <button class="continue continue--static" type="button" @click="toTransfer">
            Continue
          </button>
        </section>
      </transition>

      <!-- SCENE 4 — THE TRANSFER (end state) -->
      <transition name="scene">
        <section v-if="view === 'transfer'" class="scene scene--pad">
          <WorkThenetTransferField />
        </section>
      </transition>
    </main>
  </div>
</template>

<style scoped>
.net-module {
  position: relative;
  min-height: 100dvh;
  background: var(--bg);
  font-family: 'Space Grotesk', 'DM Sans', system-ui, sans-serif;
  color: #f1ece6;
  overflow-x: clip;
}
.net-module__bg {
  position: fixed;
  inset: 0;
  background: var(--bg);
  z-index: 0;
}
.net-module__main {
  position: relative;
  z-index: 1;
}

.steps {
  position: fixed;
  top: calc(20px + env(safe-area-inset-top, 0px));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 5;
}
.steps__dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: rgba(241, 236, 230, 0.16);
  transition: background 0.5s ease;
}
.steps__dot--on {
  background: rgba(241, 236, 230, 0.55);
}

.net-module__main {
  position: relative;
}
.scene {
  position: relative;
}
.scene--stage {
  height: 100dvh;
  width: 100%;
}
.scene--pad {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(32px, 7vh, 64px);
  padding: clamp(72px, 12vh, 120px) clamp(20px, 5vw, 48px);
}

.continue {
  position: absolute;
  left: 50%;
  bottom: clamp(64px, 16vh, 120px);
  transform: translateX(-50%);
  padding: 10px 22px;
  border: 1px solid rgba(241, 236, 230, 0.24);
  border-radius: 4px;
  background: transparent;
  color: #b9b4ae;
  font-family: inherit;
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 0.3s ease, color 0.3s ease;
}
.continue:hover {
  border-color: rgba(241, 236, 230, 0.5);
  color: #f1ece6;
}
.continue--static {
  position: static;
  transform: none;
  align-self: center;
}

/* section crossfade */
.scene-enter-active { transition: opacity 0.6s ease; }
.scene-leave-active { transition: opacity 0.3s ease; position: absolute; inset: 0; }
.scene-enter-from,
.scene-leave-to { opacity: 0; }

/* the continue control rises in after the reveal line settles */
.rise-enter-active { transition: opacity 0.7s ease, transform 0.7s ease; }
.rise-enter-from { opacity: 0; transform: translate(-50%, 10px); }

@media (prefers-reduced-motion: reduce) {
  .rise-enter-active,
  .scene-enter-active,
  .scene-leave-active { transition: opacity 0.3s ease; }
  .rise-enter-from { transform: translateX(-50%); }
}
</style>
