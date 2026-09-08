<script setup lang="ts">
/**
 * Word of the Day — tiny daily scramble game.
 * Clue → guess → reveal. Win or peek → short meaning. No corporate fluff.
 */
import type { WotdDefinition } from '~/composables/useDailyWord'

const {
  open,
  word,
  scrambled,
  clue,
  entry,
  markSolved,
  markSkipped,
  markRevealed,
  close,
  fetchWotdDefinition,
  refresh
} = useDailyWord()

const guess = ref('')
const feedback = ref<'idle' | 'wrong' | 'ok' | 'revealed'>('idle')
const failCount = ref(0)
const inputEl = ref<HTMLInputElement | null>(null)
const meaning = ref<WotdDefinition | null>(null)
const meaningLoading = ref(false)

const showReveal = computed(() => failCount.value >= 1 && feedback.value !== 'ok' && feedback.value !== 'revealed')
const showMeaning = computed(() => feedback.value === 'ok' || feedback.value === 'revealed')

watch(open, async (v) => {
  if (!v) return
  refresh()
  guess.value = ''
  feedback.value = 'idle'
  failCount.value = 0
  meaning.value = null
  meaningLoading.value = false
  await nextTick()
  inputEl.value?.focus()
})

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z]/g, '')
}

async function loadMeaning() {
  meaningLoading.value = true
  try {
    meaning.value = await fetchWotdDefinition(entry)
  } finally {
    meaningLoading.value = false
  }
}

async function submit() {
  if (showMeaning.value) return
  const g = normalize(guess.value)
  if (!g) return
  if (g === word) {
    feedback.value = 'ok'
    markSolved()
    await loadMeaning()
    return
  }
  feedback.value = 'wrong'
  failCount.value += 1
}

async function revealAnswer() {
  if (!showReveal.value) return
  feedback.value = 'revealed'
  guess.value = word
  markRevealed()
  await loadMeaning()
}

function dismiss() {
  if (feedback.value === 'idle' || feedback.value === 'wrong') {
    markSkipped()
  } else {
    close()
  }
}

function onKey(e: KeyboardEvent) {
  if (!open.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    dismiss()
  }
}

onMounted(() => {
  refresh()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="wotd"
      role="presentation"
      @click.self="dismiss()"
    >
      <div
        class="wotd__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wotd-title"
        aria-describedby="wotd-hint"
      >
        <header class="wotd__head">
          <p class="wotd__eyebrow">Today’s word · 1 round</p>
          <h2 id="wotd-title" class="wotd__title">
            <template v-if="feedback === 'ok'">Got it!</template>
            <template v-else-if="feedback === 'revealed'">Here’s the word</template>
            <template v-else>Unscramble</template>
          </h2>
          <p id="wotd-hint" class="wotd__hint">
            <template v-if="showMeaning">Nice one — stash it for later</template>
            <template v-else>Letters are mixed. Clue’s below. Go.</template>
          </p>
        </header>

        <p
          v-if="!showMeaning"
          class="wotd__scramble"
          aria-label="Scrambled letters"
        >{{ scrambled }}</p>

        <p
          v-else
          class="wotd__answer"
          aria-label="Today's word"
        >{{ word }}</p>

        <p v-if="!showMeaning" class="wotd__clue" role="note">
          <span class="wotd__clue-label">Clue</span>
          <span class="wotd__clue-text">{{ clue }}</span>
        </p>

        <form
          v-if="!showMeaning"
          class="wotd__form"
          @submit.prevent="submit"
        >
          <label class="sr-only" for="wotd-guess">Your guess</label>
          <input
            id="wotd-guess"
            ref="inputEl"
            v-model="guess"
            class="wotd__input"
            type="text"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="none"
            spellcheck="false"
            maxlength="16"
            placeholder="Type it"
            :aria-invalid="feedback === 'wrong'"
            :aria-describedby="feedback === 'wrong' ? 'wotd-feedback' : 'wotd-clue-text'"
          >
          <button type="submit" class="wotd__go" aria-label="Try this guess">
            Try
          </button>
        </form>

        <p
          v-if="feedback === 'wrong'"
          id="wotd-feedback"
          class="wotd__feedback wotd__feedback--wrong"
          role="status"
        >
          Nope — again!
        </p>
        <p
          v-else-if="feedback === 'ok'"
          class="wotd__feedback wotd__feedback--ok"
          role="status"
        >
          Yes! That’s the one
        </p>
        <p
          v-else-if="feedback === 'revealed'"
          class="wotd__feedback wotd__feedback--ok"
          role="status"
        >
          Peeked — still counts as learning
        </p>

        <div v-if="showMeaning" class="wotd__meaning" aria-live="polite">
          <p v-if="meaningLoading" class="wotd__meaning-loading">Loading meaning…</p>
          <template v-else-if="meaning">
            <p class="wotd__meaning-pos">{{ meaning.pos }}</p>
            <p class="wotd__meaning-def">{{ meaning.definition }}</p>
            <p v-if="meaning.example" class="wotd__meaning-ex">“{{ meaning.example }}”</p>
            <p class="wotd__meaning-src">Meaning</p>
          </template>
        </div>

        <div class="wotd__actions">
          <button
            v-if="showReveal"
            type="button"
            class="wotd__reveal"
            @click="revealAnswer()"
          >
            Peek
          </button>
          <button
            v-if="!showMeaning"
            type="button"
            class="wotd__skip"
            @click="markSkipped()"
          >
            Skip
          </button>
          <button
            v-else
            type="button"
            class="wotd__done"
            @click="close()"
          >
            Played
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.wotd {
  position: fixed;
  inset: 0;
  z-index: calc(var(--z-overlay) + 30);
  display: grid;
  place-items: end center;
  padding: max(16rem, var(--safe-top)) 16rem max(16rem, var(--safe-bottom));
  background: color-mix(in srgb, var(--ink) 34%, transparent);
}
@media (min-width: 560px) {
  .wotd { place-items: center; }
}
.wotd__panel {
  width: min(440rem, 100%);
  padding: 26rem 22rem 20rem;
  background: var(--paper);
  color: var(--ink);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-l) var(--radius-l) var(--radius-m) var(--radius-m);
  box-shadow: 8rem 8rem 0 var(--accent);
  animation: wotd-in 280ms var(--ease-out) both;
}
@media (min-width: 560px) {
  .wotd__panel { border-radius: var(--radius-l); }
}
@keyframes wotd-in {
  from { opacity: 0; transform: translateY(16rem) scale(.98); }
  to { opacity: 1; transform: none; }
}
.wotd__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6rem;
  margin: 0 0 8rem;
  padding: 4rem 9rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-full);
  background: var(--accent);
  font: 700 10rem/1.2 var(--font-mono);
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--ink);
}
.wotd__title {
  margin: 0 0 6rem;
  font: 600 clamp(28rem, 5vw, 36rem)/1.05 var(--font-display);
  letter-spacing: -.03em;
}
.wotd__hint {
  margin: 0 0 18rem;
  font: 400 14rem/1.4 var(--font-ui);
  color: var(--ink-soft);
}
.wotd__scramble,
.wotd__answer {
  margin: 0 0 14rem;
  padding: 16rem 14rem;
  text-align: center;
  font: 700 clamp(26rem, 7vw, 40rem)/1.1 var(--font-ui);
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--ink);
  background: var(--accent);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
}
.wotd__answer {
  letter-spacing: .12em;
  background: color-mix(in srgb, var(--accent) 70%, var(--paper));
}
.wotd__clue {
  display: grid;
  gap: 4rem;
  margin: 0 0 16rem;
  padding: 12rem 14rem;
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-s);
  background: color-mix(in srgb, var(--accent) 12%, var(--paper));
}
.wotd__clue-label {
  font: 700 10rem/1.2 var(--font-mono);
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--muted);
}
.wotd__clue-text {
  font: 500 14rem/1.4 var(--font-ui);
  color: var(--ink);
}
.wotd__form {
  display: flex;
  gap: 8rem;
  margin-bottom: 10rem;
}
.wotd__input {
  flex: 1;
  min-width: 0;
  min-height: 48rem;
  padding: 0 14rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  background: var(--paper);
  color: var(--ink);
  font: 650 16rem/1 var(--font-ui);
}
.wotd__input:focus-visible {
  outline: 3rem solid var(--ink);
  outline-offset: 2rem;
}
.wotd__go,
.wotd__done,
.wotd__reveal {
  flex: none;
  min-height: 48rem;
  padding: 0 18rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  background: var(--accent);
  color: var(--ink);
  font: 700 14rem/1 var(--font-ui);
  box-shadow: 3rem 3rem 0 var(--ink);
}
.wotd__go:hover,
.wotd__done:hover,
.wotd__reveal:hover { background: var(--signal-field); }
.wotd__go:active,
.wotd__done:active,
.wotd__reveal:active { transform: translate(1rem, 1rem); box-shadow: 2rem 2rem 0 var(--ink); }
.wotd__go:focus-visible,
.wotd__done:focus-visible,
.wotd__reveal:focus-visible { outline: 3rem solid var(--ink); outline-offset: 2rem; }
.wotd__feedback {
  margin: 0 0 12rem;
  min-height: 1.2em;
  font: 650 13rem/1.3 var(--font-ui);
}
.wotd__meaning {
  margin: 0 0 14rem;
  padding: 14rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  background: var(--paper-2, var(--paper));
}
.wotd__meaning-pos {
  margin: 0 0 6rem;
  font: 700 11rem/1.2 var(--font-mono);
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--muted);
}
.wotd__meaning-def {
  margin: 0 0 8rem;
  font: 500 15rem/1.45 var(--font-ui);
}
.wotd__meaning-ex {
  margin: 0 0 8rem;
  font: italic 400 13rem/1.4 var(--font-ui);
  color: var(--ink-soft);
}
.wotd__meaning-src,
.wotd__meaning-loading {
  margin: 0;
  font: 400 11rem/1.3 var(--font-mono);
  color: var(--muted);
}
.wotd__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10rem;
  justify-content: space-between;
  align-items: center;
  margin-top: 8rem;
  padding-top: 14rem;
  border-top: var(--stroke) solid var(--line);
}
.wotd__skip {
  min-height: 40rem;
  padding: 0 12rem;
  border: 0;
  background: transparent;
  color: var(--ink-soft);
  font: 650 13rem/1 var(--font-ui);
  text-decoration: underline;
  text-underline-offset: 3rem;
}
.wotd__skip:hover { color: var(--ink); }
.wotd__skip:focus-visible {
  outline: 3rem solid var(--ink);
  outline-offset: 2rem;
  border-radius: var(--radius-s);
}
.wotd__reveal { margin-right: auto; }
.wotd__done { margin-left: auto; width: 100%; }
@media (min-width: 420px) {
  .wotd__done { width: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .wotd__panel { animation: none; }
}
:global(html[data-reduce-motion="on"]) .wotd__panel { animation: none; }
</style>
