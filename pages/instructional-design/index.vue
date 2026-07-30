<script setup lang="ts">
// Instructional Design — a self-demonstrating page. The visitor applies
// three real instructional-design moves to one piece of content and watches
// its cognitive load fall. The page performs the craft it is describing.
//
// Styled as a Press worksheet — the interactive logic below is unchanged;
// only the markup and CSS were reskinned onto the site's `--press-*` layer.
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
  <div class="press-page id-page">
    <PressMast section="Instructional Design" />

    <div class="id-wrap">
      <PressHead
        eyebrow="Instructional design"
        title="What gets designed when no one is watching"
        deck="A subject expert can already do the thing. Instructional design is the work of turning what they know into something another person can learn. Most of that work is subtraction. Try it on the worksheet below."
      />

      <section class="id-lab" aria-label="Interactive demonstration">
        <div class="id-lab__top">
          <div>
            <p class="press-label">The same instruction, redesigned live</p>
            <p class="id-lab__topic">How to use a fire extinguisher</p>
          </div>
          <div class="id-meter" role="img" :aria-label="`Cognitive load: ${loadLabel}`">
            <span class="press-label">Load</span>
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
            class="press-cell id-move"
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

    <PressFoot />
  </div>
</template>

<style scoped>
.id-wrap {
  position: relative; z-index: 1;
  max-width: var(--press-col); margin: 0 auto;
  padding: var(--press-pad-top) var(--press-edge) var(--press-pad-bottom);
}

/* The worksheet — a proof sheet: bordered, faintly screened, unmistakably a
   panel to work on rather than a card to admire. */
.id-lab {
  margin-top: clamp(32px, 5vw, 48px);
  padding: 26px 26px 24px;
  border: 1px solid var(--press-ink);
  background-image: radial-gradient(var(--press-rule) 0.7px, transparent 0.7px);
  background-size: 8px 8px;
}
.id-lab__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 22px; padding-bottom: 18px; border-bottom: 1px solid var(--press-rule); }
.id-lab__topic { margin-top: 6px; font-family: var(--press-serif); font-weight: 700; font-size: var(--press-h3); letter-spacing: -0.01em; }

.id-meter { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.id-meter__track { width: 88px; height: 7px; border: 1px solid var(--press-ink); background: var(--press-paper); overflow: hidden; }
.id-meter__fill { display: block; height: 100%; background: var(--press-ink); transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
.id-meter__fill.no-anim { transition: none; }
.id-meter__val { font-family: var(--press-mono); font-size: var(--press-small); font-weight: 600; min-width: 62px; }

.id-canvas {
  min-height: 190px; padding: 24px;
  background: var(--press-paper);
  border: 1px solid var(--press-rule);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.id-canvas.is-designed { border-color: var(--press-ink); box-shadow: inset 0 0 0 1px var(--press-ink); }
/* The "before" state, and the one place on the site that deliberately opts out
   of the type system: a justified wall in the browser's own default serif. It
   has to look untouched for the designed version beside it to mean anything,
   so `serif` here is the generic keyword — not a font choice, the absence of
   one. Everything else on the page uses `--press-serif`. */
.id-raw { font-size: var(--press-body); line-height: 1.5; color: var(--press-ink-62); text-align: justify; font-family: serif; }
.id-plain { font-family: var(--press-serif); font-size: var(--press-lead); line-height: 1.5; }
.id-steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.id-step { display: flex; align-items: center; gap: 14px; }
.id-step__badge {
  flex-shrink: 0; width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--press-serif); font-weight: 800; font-size: var(--press-body);
  background: var(--press-ink); color: var(--press-paper);
}
.id-step__icon { flex-shrink: 0; color: var(--press-ink); display: flex; }
.id-step__text { font-family: var(--press-serif); font-size: var(--press-body); line-height: 1.4; }
.id-step__text b { font-weight: 700; }
.id-mnemonic { margin-top: 18px; font-family: var(--press-serif); font-size: var(--press-small); color: var(--press-ink-62); }
.id-mnemonic b { font-family: var(--press-mono); letter-spacing: 0.2em; font-weight: 700; color: var(--press-ink); }

.id-moves { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; margin-top: 22px; background: var(--press-rule); border: 1px solid var(--press-rule); }
/* Flush toggles in a hairline grid — `.press-cell` carries hover, press, focus
   and timing; this only adds layout and the selected state. */
.id-move { display: flex; gap: 12px; text-align: left; padding: 16px 16px; }
.id-move.is-on { background: var(--press-ink); color: var(--press-paper); }
.id-move__check {
  flex-shrink: 0; width: 20px; height: 20px; margin-top: 1px;
  border: 1.5px solid currentColor;
  display: flex; align-items: center; justify-content: center;
}
.id-move.is-on .id-move__check { background: var(--press-paper); color: var(--press-ink); }
.id-move__body { display: flex; flex-direction: column; gap: 5px; }
.id-move__label { font-family: var(--press-serif); font-size: var(--press-body); font-weight: 700; letter-spacing: -0.01em; }
.id-move__principle { font-family: var(--press-serif); font-size: var(--press-small); line-height: 1.45; opacity: 0.82; }

.id-foot { margin-top: 30px; padding-top: 24px; border-top: 1px solid var(--press-rule); }
.id-foot__line { font-family: var(--press-serif); font-size: var(--press-body); line-height: 1.6; color: var(--press-ink-62); max-width: 56ch; transition: color 0.3s ease; }
.id-foot__line.is-live { color: var(--press-ink); font-weight: 500; }

.id-swap-enter-active, .id-swap-leave-active { transition: opacity 0.28s ease, transform 0.28s ease; }
.id-swap-enter-from { opacity: 0; transform: translateY(8px); }
.id-swap-leave-to { opacity: 0; transform: translateY(-8px); }

@media (max-width: 640px) {
  .id-lab__top { flex-direction: column; gap: 14px; }
  .id-moves { grid-template-columns: 1fr; }
  .id-canvas { padding: 20px; }
}
</style>
