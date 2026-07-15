<script setup lang="ts">
// Instructional Design — a self-demonstrating page. The visitor applies
// three real instructional-design moves to one piece of content and watches
// its cognitive load fall. The page performs the craft it is describing.
//
// Rebuilt from scratch: the previous version was authored in Tailwind utility
// classes, but this project ships no Tailwind, so none of them resolved. This
// version uses the site's real token system (theme-aware --color-* variables,
// the 1rem = 1px scale, DM Sans) and the shared .glass-* primitives.
definePageMeta({ layout: false, pageTransition: { name: 'fade', mode: 'out-in' } })
useSeoMeta({
  title: 'Instructional Design · Entertrainer',
  description: 'A page that designs itself while you read it. See instructional design principles applied to the page you are on.',
  ogTitle: 'Instructional Design · Entertrainer',
  ogDescription: 'A page that designs itself while you read it.',
  ogUrl: 'https://entertrainer.in/instructional-design'
})

const cutJargon = ref(false)
const chunk = ref(false)
const show = ref(false)

const reduceMotion = ref(false)
onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

// The four steps of using an extinguisher (PASS), the demo's real content.
const STEPS = [
  { letter: 'P', word: 'Pull', tail: 'the pin.', icon: 'pin' },
  { letter: 'A', word: 'Aim', tail: 'low, at the base of the fire.', icon: 'aim' },
  { letter: 'S', word: 'Squeeze', tail: 'the handle.', icon: 'squeeze' },
  { letter: 'S', word: 'Sweep', tail: 'side to side until it is out.', icon: 'sweep' }
]

// One honest load figure. Each move removes a real kind of load; the numbers
// are illustrative, but the direction and ordering are the teaching point.
const load = computed(() => {
  let n = 100
  if (cutJargon.value) n -= 34 // extraneous load
  if (chunk.value) n -= 24     // intrinsic load, sequenced
  if (show.value) n -= 18      // dual coding
  return n
})
const loadLabel = computed(() => (load.value > 78 ? 'Heavy' : load.value > 45 ? 'Moderate' : 'Light'))
const moveCount = computed(() => Number(cutJargon.value) + Number(chunk.value) + Number(show.value))

const moves = [
  { key: 'cutJargon', model: cutJargon, label: 'Cut the jargon', principle: 'Extraneous load. Words the learner must decode are effort spent on nothing.' },
  { key: 'chunk', model: chunk, label: 'Chunk and order it', principle: 'Intrinsic load. One step at a time, in the sequence the hands follow.' },
  { key: 'show', model: show, label: 'Show it, do not just tell', principle: 'Dual coding. A picture and words carry different halves of the same idea.' }
] as const

function iconPath(name: string) {
  switch (name) {
    case 'pin': return 'M12 3v7M9 6l3-3 3 3M8 11h8l-1 9H9z'
    case 'aim': return 'M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0M12 4v3M12 17v3M4 12h3M17 12h3'
    case 'squeeze': return 'M7 8h9a3 3 0 0 1 3 3a3 3 0 0 1-3 3H9l-4 3V8a2 2 0 0 1 2-2z'
    case 'sweep': return 'M4 12h13M13 7l5 5-5 5M4 6v12'
    default: return ''
  }
}
</script>

<template>
  <div class="id-page">
    <UiGlassBackdrop />

    <NuxtLink to="/" class="id-exit" aria-label="Back to the site">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
      <span>Back</span>
    </NuxtLink>

    <div class="id-wrap">
      <header class="id-head">
        <p class="id-eyebrow">Instructional design</p>
        <h1 class="id-title">What gets designed when no one is watching</h1>
        <p class="id-dek">
          A subject expert can already do the thing. Instructional design is the work of turning
          what they know into something another person can learn. Most of that work is subtraction.
          Try it on the panel below.
        </p>
      </header>

      <section class="id-lab glass-panel" aria-label="Interactive demonstration">
        <div class="id-lab__top">
          <div>
            <p class="id-lab__kicker">The same instruction, redesigned live</p>
            <p class="id-lab__topic">How to use a fire extinguisher</p>
          </div>
          <div class="id-meter" role="img" :aria-label="`Cognitive load: ${loadLabel}`">
            <span class="id-meter__label">Load</span>
            <span class="id-meter__track"><span class="id-meter__fill" :class="{ 'no-anim': reduceMotion }" :style="{ width: load + '%' }" /></span>
            <span class="id-meter__val">{{ loadLabel }}</span>
          </div>
        </div>

        <!-- The content region that the moves transform -->
        <div class="id-canvas" :class="{ 'is-designed': moveCount === 3 }">
          <Transition :name="reduceMotion ? '' : 'id-swap'" mode="out-in">
            <!-- Raw: dense, jargon, unstructured -->
            <p v-if="!cutJargon" key="raw" class="id-raw">
              In the event of a Class A, B, or C combustion emergency, the operator shall first
              disengage the tamper-proof retention mechanism, subsequently orient the discharge
              nozzle toward the base of the combustion source, deposit manual compressive force upon
              the actuator lever to initiate agent expulsion, and translate the nozzle laterally
              across the affected substrate until extinguishment is visually confirmed.
            </p>

            <!-- Plain, single sentence (jargon cut, not yet chunked) -->
            <p v-else-if="!chunk" key="plain" class="id-plain">
              To put out a fire: pull the pin, aim low at the base of the fire, squeeze the handle,
              and sweep side to side until it is out.
            </p>

            <!-- Chunked into ordered steps, optionally shown with icons -->
            <ol v-else key="steps" class="id-steps" :class="{ 'has-icons': show }">
              <li v-for="(s, i) in STEPS" :key="i" class="id-step">
                <span class="id-step__badge">{{ show ? s.letter : i + 1 }}</span>
                <span v-if="show" class="id-step__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path :d="iconPath(s.icon)" /></svg>
                </span>
                <span class="id-step__text"><b>{{ s.word }}</b> {{ s.tail }}</span>
              </li>
            </ol>
          </Transition>

          <p v-if="show && chunk && cutJargon" class="id-mnemonic">Four steps, one word to hold them: <b>PASS</b>.</p>
        </div>

        <!-- The three moves -->
        <div class="id-moves">
          <button
            v-for="m in moves"
            :key="m.key"
            type="button"
            role="switch"
            :aria-checked="m.model.value"
            class="id-move"
            :class="{ 'is-on': m.model.value }"
            @click="m.model.value = !m.model.value"
          >
            <span class="id-move__check" aria-hidden="true">
              <svg v-if="m.model.value" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            </span>
            <span class="id-move__body">
              <span class="id-move__label">{{ m.label }}</span>
              <span class="id-move__principle">{{ m.principle }}</span>
            </span>
          </button>
        </div>
      </section>

      <footer class="id-foot">
        <p class="id-foot__line" :class="{ 'is-live': moveCount === 3 }">
          <template v-if="moveCount === 3">
            That is the whole job. The expert knew all of this already. The design is what made it
            learnable in about seven seconds.
          </template>
          <template v-else>
            Turn on all three moves to see the finished version. The content never changed. Only the
            design around it did.
          </template>
        </p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.id-page {
  position: fixed;
  inset: 0;
  overflow-y: auto;
  color: var(--color-text);
  background: var(--color-bg);
}
.id-wrap {
  position: relative;
  z-index: 1;
  max-width: 780rem;
  margin: 0 auto;
  padding: calc(96rem + var(--safe-top)) 24rem calc(80rem + var(--safe-bottom));
}

.id-exit {
  position: fixed;
  top: calc(18rem + var(--safe-top));
  left: calc(20rem + var(--safe-left));
  z-index: 30;
  display: inline-flex;
  align-items: center;
  gap: 6rem;
  padding: 8rem 13rem;
  border-radius: 999rem;
  font-size: 13rem;
  color: var(--color-text);
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: background 0.15s ease;
}
@media (hover: hover) { .id-exit:hover { background: var(--color-glass-bg-hover); } }
.id-exit:focus-visible { outline: 2px solid var(--color-text); outline-offset: 2px; }

.id-head { margin-bottom: 34rem; }
.id-eyebrow {
  font-size: 12rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.55;
  margin-bottom: 16rem;
}
.id-title {
  font-size: clamp(30rem, 5vw, 50rem);
  font-weight: 700;
  line-height: 1.06;
  letter-spacing: -0.03em;
  max-width: 16ch;
}
.id-dek {
  margin-top: 20rem;
  font-size: 17rem;
  line-height: 1.6;
  opacity: 0.72;
  max-width: 54ch;
}

.id-lab { padding: 26rem 26rem 24rem; }
.id-lab__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rem;
  margin-bottom: 22rem;
}
.id-lab__kicker { font-size: 11.5rem; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.5; margin-bottom: 6rem; }
.id-lab__topic { font-size: 19rem; font-weight: 600; letter-spacing: -0.01em; }

.id-meter { display: flex; align-items: center; gap: 10rem; flex-shrink: 0; }
.id-meter__label { font-size: 11rem; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.5; }
.id-meter__track { width: 88rem; height: 7rem; border-radius: 999rem; background: var(--color-glass-border); overflow: hidden; }
.id-meter__fill { display: block; height: 100%; border-radius: 999rem; background: var(--color-accent); transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
.id-meter__fill.no-anim { transition: none; }
.id-meter__val { font-size: 12.5rem; font-weight: 600; min-width: 62rem; }

.id-canvas {
  min-height: 190rem;
  padding: 24rem;
  border-radius: 14rem;
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
  border: 1px solid var(--color-glass-border);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.id-canvas.is-designed {
  border-color: color-mix(in srgb, var(--color-accent) 55%, var(--color-glass-border));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-accent) 22%, transparent);
}
.id-raw {
  font-size: 15rem;
  line-height: 1.5;
  opacity: 0.6;
  text-align: justify;
  font-family: 'Georgia', 'Times New Roman', serif;
}
.id-plain { font-size: 18rem; line-height: 1.6; }
.id-steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12rem; }
.id-step { display: flex; align-items: center; gap: 14rem; }
.id-step__badge {
  flex-shrink: 0;
  width: 30rem;
  height: 30rem;
  border-radius: 8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14rem;
  background: var(--color-accent);
  color: #fff;
}
.id-step__icon { flex-shrink: 0; color: var(--color-accent); display: flex; }
.id-step__text { font-size: 17rem; line-height: 1.4; }
.id-step__text b { font-weight: 700; }
.id-mnemonic { margin-top: 18rem; font-size: 14rem; opacity: 0.7; }
.id-mnemonic b { letter-spacing: 0.24em; font-weight: 700; opacity: 1; }

.id-moves { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12rem; margin-top: 22rem; }
.id-move {
  display: flex;
  gap: 12rem;
  text-align: left;
  padding: 15rem 15rem;
  border-radius: 12rem;
  border: 1px solid var(--color-glass-border);
  background: color-mix(in srgb, var(--color-bg) 40%, transparent);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}
@media (hover: hover) { .id-move:hover { border-color: var(--color-glass-border-hover); } }
.id-move.is-on { border-color: var(--color-accent); background: color-mix(in srgb, var(--color-accent) 12%, transparent); }
.id-move:focus-visible { outline: 2px solid var(--color-text); outline-offset: 2px; }
.id-move__check {
  flex-shrink: 0;
  width: 22rem;
  height: 22rem;
  border-radius: 6rem;
  border: 1.5px solid var(--color-glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.id-move.is-on .id-move__check { background: var(--color-accent); border-color: var(--color-accent); }
.id-move__body { display: flex; flex-direction: column; gap: 5rem; }
.id-move__label { font-size: 14.5rem; font-weight: 600; letter-spacing: -0.01em; }
.id-move__principle { font-size: 12rem; line-height: 1.45; opacity: 0.62; }

.id-foot { margin-top: 30rem; }
.id-foot__line { font-size: 16rem; line-height: 1.6; opacity: 0.72; max-width: 56ch; transition: opacity 0.3s ease; }
.id-foot__line.is-live { opacity: 1; font-weight: 500; }

.id-swap-enter-active, .id-swap-leave-active { transition: opacity 0.28s ease, transform 0.28s ease; }
.id-swap-enter-from { opacity: 0; transform: translateY(8rem); }
.id-swap-leave-to { opacity: 0; transform: translateY(-8rem); }

@media (max-width: 640px) {
  .id-wrap { padding-top: calc(84rem + var(--safe-top)); }
  .id-lab__top { flex-direction: column; gap: 14rem; }
  .id-moves { grid-template-columns: 1fr; }
  .id-canvas { padding: 20rem; }
}
</style>
