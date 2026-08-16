<script setup lang="ts">
/**
 * Instructional Design — a self-demonstrating page.
 *
 * The visitor applies three real instructional-design moves to one piece of
 * content and watches its cognitive load fall. The page performs the craft it
 * is describing, which is why it is the lead item on the front page.
 *
 * The interaction is unchanged by the redesign — predict, then reveal, then
 * three toggles over one live content region. What changed is that it is now
 * set as an article rather than floated in a glass panel: the raw instruction
 * is genuinely printed as a dense block of serif, and the redesigned version
 * genuinely looks like something you would hand to somebody. The demonstration
 * is more convincing when the two states look like two real documents.
 */
useSeoMeta({
  title: 'Instructional Design · Entertrainer',
  description: 'Try a four-minute lesson that turns a hard-to-read instruction into something much easier to follow.',
  ogTitle: 'Instructional Design · Entertrainer',
  ogDescription: 'Try a four-minute lesson that turns a hard-to-read instruction into something much easier to follow.',
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
  { letter: 'S', word: 'Sweep', tail: "side to side until it's out.", icon: 'sweep' }
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

/**
 * Predict, then reveal.
 *
 * Eliciting a prediction before showing the answer improves recall, and using
 * the visualisation itself as the prompt is an effective way to get readers to
 * self-explain. Deliberately not a gate: skipping is one click, the panel is
 * fully usable without answering, and nothing is scored.
 */
const guess = ref<string | null>(null)
const guessSkipped = ref(false)
const answered = computed(() => guess.value !== null || guessSkipped.value)
/** The move that removes the most load — see the numbers in `load` above. */
const HEAVIEST = 'cutJargon'
function makeGuess(key: string) { guess.value = key }
function skipGuess() { guessSkipped.value = true }

const moves = [
  { key: 'cutJargon', model: cutJargon, label: 'Cut the jargon', principle: 'Extraneous load. Words the learner must decode are effort spent on nothing.' },
  { key: 'chunk', model: chunk, label: 'Chunk and order it', principle: 'Intrinsic load. One step at a time, in the sequence the hands follow.' },
  { key: 'show', model: show, label: "Show it, don't just tell", principle: 'Dual coding. A picture and words carry different halves of the same idea.' }
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
  <EdShell width="page">
    <EdStoryHero
      category="practice"
      media="interactive"
      title="What gets designed when no one is watching"
      deck="Someone who knows a job well can still find it hard to explain. This is a short hands-on lesson about making instructions easier for another person to follow. Answer one question, then improve a badly written instruction yourself."
      :minutes="4"
      byline
    />

    <!-- Ask before showing. See the note on `guess` in the script above. -->
    <section v-if="!answered" class="ask" aria-labelledby="ask-q">
      <p class="t-mono ask__eyebrow">Before you start</p>
      <p id="ask-q" class="ask__q">
        Three moves are about to be applied to a badly written instruction.
        Which one do you think removes the most effort for the learner?
      </p>
      <div class="ask__opts">
        <button v-for="m in moves" :key="m.key" type="button" class="ask__opt" @click="makeGuess(m.key)">
          {{ m.label }}
        </button>
      </div>
      <button type="button" class="ask__skip" @click="skipGuess">I would rather just try it</button>
    </section>

    <section class="lab" aria-label="Interactive demonstration">
      <p v-if="guess" class="lab__verdict" role="status">
        <template v-if="guess === HEAVIEST">
          You picked <b>{{ moves.find(m => m.key === guess)?.label }}</b> — that is the one.
          Cutting what the learner has to decode buys back more than chunking and showing put together.
        </template>
        <template v-else>
          You picked <b>{{ moves.find(m => m.key === guess)?.label }}</b>. It helps, but
          <b>cutting the jargon</b> buys back more than the other two combined. Nothing you write is
          free, and the words a learner has to decode cost the most.
        </template>
        Toggle them below and watch the meter.
      </p>

      <div class="lab__top">
        <div>
          <p class="t-mono lab__kicker">The same instruction, redesigned live</p>
          <p class="lab__topic">How to use a fire extinguisher</p>
        </div>
        <div class="meter" role="img" :aria-label="`Cognitive load: ${loadLabel}`">
          <span class="t-mono meter__label">Load</span>
          <span class="meter__track">
            <span class="meter__fill"
                  :class="{ 'no-anim': reduceMotion, 'is-mid': load <= 78 && load > 45, 'is-light': load <= 45 }"
                  :style="{ width: load + '%' }" />
          </span>
          <span class="meter__val">{{ loadLabel }}</span>
        </div>
      </div>

      <!-- The content region the moves transform -->
      <div class="canvas" :class="{ 'is-designed': moveCount === 3 }">
        <Transition :name="reduceMotion ? '' : 'swap'" mode="out-in">
          <p v-if="!cutJargon" key="raw" class="canvas__raw">
            In the event of a Class A, B, or C combustion emergency, the operator shall first
            disengage the tamper-proof retention mechanism, subsequently orient the discharge
            nozzle toward the base of the combustion source, deposit manual compressive force upon
            the actuator lever to initiate agent expulsion, and translate the nozzle laterally
            across the affected substrate until extinguishment is visually confirmed.
          </p>

          <p v-else-if="!chunk" key="plain" class="canvas__plain">
            To put out a fire: pull the pin, aim low at the base of the fire, squeeze the handle,
            and sweep side to side until it's out.
          </p>

          <ol v-else key="steps" class="steps" :class="{ 'has-icons': show }">
            <li v-for="(s, i) in STEPS" :key="i" class="step">
              <span class="step__badge">{{ show ? s.letter : i + 1 }}</span>
              <span v-if="show" class="step__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor"
                     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path :d="iconPath(s.icon)" /></svg>
              </span>
              <span class="step__text"><b>{{ s.word }}</b> {{ s.tail }}</span>
            </li>
          </ol>
        </Transition>

        <p v-if="show && chunk && cutJargon" class="canvas__mnemonic">
          Four steps, one word to hold them: <b>PASS</b>.
        </p>
      </div>

      <!-- The three moves -->
      <div class="moves">
        <button
          v-for="m in moves" :key="m.key" type="button" role="switch"
          :aria-checked="m.model.value" class="move"
          :class="{ 'is-on': m.model.value, 'is-guess': guess === m.key }"
          @click="m.model.value = !m.model.value"
        >
          <span v-if="guess === m.key" class="t-mono move__tag">your pick</span>
          <span class="move__check" aria-hidden="true">
            <svg v-if="m.model.value" viewBox="0 0 24 24" width="14" height="14" fill="none"
                 stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </span>
          <span class="move__body">
            <span class="move__label">{{ m.label }}</span>
            <span class="move__principle">{{ m.principle }}</span>
          </span>
        </button>
      </div>
    </section>

    <footer class="close">
      <p class="close__line" :class="{ 'is-live': moveCount === 3 }">
        <template v-if="moveCount === 3">
          That's the whole job. The expert knew every word of this already. Design is what got it
          into someone else's head in seven seconds.
        </template>
        <template v-else>
          Turn on all three to see the finished version. Not one fact changed — only the shape
          around them.
        </template>
      </p>
    </footer>

    <EdReadNext from="instructional-design" />
  </EdShell>
</template>

<style scoped>
/* ── The prediction prompt ───────────────────────────────────────────────
   Sits above the panel and is replaced by it. All three options are the same
   size so none of them looks like the default answer. */
.ask {
  background: var(--paper-2);
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-l);
  
  padding: clamp(22rem, 3vw, 32rem);
  margin-bottom: clamp(22rem, 3vw, 34rem);
}
.ask__eyebrow { margin: 0 0 10rem; color: var(--muted); }
.ask__q { margin: 0 0 20rem; max-width: 46ch; font-size: clamp(18rem, 1.8vw, 22rem); line-height: 1.4; font-weight: 600; }
.ask__opts { display: flex; flex-wrap: wrap; gap: 10rem; }
.ask__opt {
  flex: 1 1 210rem; min-height: 54rem; padding: 14rem 18rem; text-align: left;
  background: var(--paper); color: var(--ink);
  border: var(--stroke) solid var(--line); border-radius: var(--radius-m);
  font-family: var(--font-ui); font-size: 15rem; font-weight: 600; cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}
@media (hover: hover) { .ask__opt:hover { background: var(--yellow); color: var(--on-yellow);  } }
.ask__skip {
  margin-top: 16rem; min-height: 34rem; padding: 6rem 0;
  color: var(--muted); font-size: 14rem;
  text-decoration: underline; text-underline-offset: 3px;
}
.ask__skip:hover { color: var(--ink); }

/* ── The lab ─────────────────────────────────────────────────────────────
   Deliberately a plain sheet with a rule around it. The demonstration inside
   is the loud thing; a decorated container would compete with the point. */
.lab {
  background: var(--paper);
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-xl);
  padding: clamp(20rem, 3vw, 32rem);
}
.lab__verdict {
  margin: 0 0 22rem; padding-bottom: 18rem;
  border-bottom: var(--stroke) solid var(--line);
  font-family: var(--font-reading); font-size: 16rem; line-height: 1.6; max-width: 62ch;
  color: var(--muted);
}
.lab__verdict b { color: var(--ink); font-weight: 700; }

.lab__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 20rem; margin-bottom: 22rem; }
.lab__kicker { margin: 0 0 6rem; color: var(--muted); }
.lab__topic { margin: 0; font-size: clamp(19rem, 2vw, 24rem); font-weight: 700; }

.meter { display: flex; align-items: center; gap: 10rem; flex-shrink: 0; }
.meter__label { color: var(--muted); }
.meter__track {
  width: 96rem; height: 12rem; border-radius: 999rem; overflow: hidden;
  background: var(--paper-3); border: var(--stroke) solid var(--ink);
}
.meter__fill {
  display: block; height: 100%;
  background: var(--red);
  transition: width 500ms var(--ease-out), background 500ms var(--ease-out);
}
/* The bar changes hue as the load falls, but the word beside it changes with
   it — the reading never depends on telling coral from mint. */
.meter__fill.is-mid { background: var(--yellow); }
.meter__fill.is-light { background: var(--green); }
.meter__fill.no-anim { transition: none; }
.meter__val { font-size: 14rem; font-weight: 700; min-width: 68rem; }

.canvas {
  min-height: 200rem;
  padding: clamp(20rem, 2.5vw, 28rem);
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-m);
  background: var(--paper-2);
  transition: border-color var(--dur-mid) var(--ease-out), background var(--dur-mid) var(--ease-out);
}
.canvas.is-designed { border: var(--stroke) solid var(--line); background: var(--paper); }

/* The raw version is set as the document it actually is: justified serif, tight
   leading, no air. Nothing about it is exaggerated — this is how the sentence
   arrives in real safety documentation. */
.canvas__raw {
  font-family: var(--font-reading);
  font-size: 15.5rem; line-height: 1.45; text-align: justify; hyphens: auto;
  color: var(--muted);
}
.canvas__plain { font-family: var(--font-reading); font-size: 19rem; line-height: 1.6; }

.steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14rem; }
.step { display: flex; align-items: center; gap: 14rem; }
.step__badge {
  flex: none; width: 34rem; height: 34rem; border-radius: var(--radius-s);
  display: flex; align-items: center; justify-content: center;
  background: var(--blue); color: var(--on-blue);
  border: var(--stroke) solid var(--line);
  font-family: var(--font-ui); font-weight: 700; font-size: 15rem;
}
.step__icon { flex: none; display: flex; color: var(--ink); }
.step__text { font-size: 18rem; line-height: 1.4; }
.step__text b { font-weight: 700; }
.canvas__mnemonic { margin-top: 20rem; font-size: 15rem; color: var(--muted); }
.canvas__mnemonic b { letter-spacing: 0.24em; font-weight: 700; color: var(--ink); }

.moves { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12rem; margin-top: 22rem; }
.move {
  position: relative; display: flex; gap: 12rem; text-align: left;
  padding: 15rem; border-radius: var(--radius-m);
  border: var(--stroke) solid var(--line);
  background: var(--paper); cursor: pointer;
  transition: border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
}
@media (hover: hover) { .move:hover { border-color: var(--ink); } }
.move.is-on { border: var(--stroke) solid var(--line); background: var(--paper-2); }
.move.is-guess { box-shadow: 0 0 0 2px var(--yellow); }
.move__tag { position: absolute; top: 8rem; right: 10rem; color: var(--muted); font-size: 10rem; }
.move__check {
  flex: none; width: 24rem; height: 24rem; border-radius: var(--radius-xs);
  border: var(--stroke) solid var(--ink);
  display: flex; align-items: center; justify-content: center;
  color: var(--on-green);
  transition: background var(--dur-fast) var(--ease-out);
}
.move.is-on .move__check { background: var(--green); }
.move__body { display: flex; flex-direction: column; gap: 5rem; }
.move__label { font-size: 15rem; font-weight: 700; }
.move__principle { font-size: 13rem; line-height: 1.45; color: var(--muted); }

.close { margin-top: 30rem; }
.close__line {
  font-family: var(--font-reading);
  font-size: 17rem; line-height: 1.6; color: var(--muted); max-width: 58ch;
  transition: color var(--dur-mid) var(--ease-out);
}
.close__line.is-live { color: var(--ink); }

.swap-enter-active, .swap-leave-active { transition: opacity var(--dur-mid) var(--ease-out), transform var(--dur-mid) var(--ease-out); }
.swap-enter-from { opacity: 0; transform: translateY(8rem); }
.swap-leave-to { opacity: 0; transform: translateY(-8rem); }

@media (max-width: 720px) {
  .lab__top { flex-direction: column; gap: 14rem; }
  .moves { grid-template-columns: 1fr; }
}
</style>
