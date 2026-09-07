<script setup lang="ts">
/**
 * Quick daily scrambled-word splash after the preloader.
 * Cream / ink / yellow DNA; solved or "not today" hides until next local day.
 */
const {
  open,
  word,
  scrambled,
  markSolved,
  markSkipped
} = useDailyWord()

const guess = ref('')
const feedback = ref<'idle' | 'wrong' | 'ok'>('idle')
const inputEl = ref<HTMLInputElement | null>(null)

watch(open, async (v) => {
  if (!v) return
  guess.value = ''
  feedback.value = 'idle'
  await nextTick()
  inputEl.value?.focus()
})

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z]/g, '')
}

function submit() {
  const g = normalize(guess.value)
  if (!g) return
  if (g === word) {
    feedback.value = 'ok'
    window.setTimeout(() => markSolved(), 420)
    return
  }
  feedback.value = 'wrong'
}

function onKey(e: KeyboardEvent) {
  if (!open.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    markSkipped()
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="dw"
      role="presentation"
      @click.self="markSkipped()"
    >
      <div
        class="dw__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dw-title"
        aria-describedby="dw-hint"
      >
        <p class="dw__eyebrow">Word of the day</p>
        <h2 id="dw-title" class="dw__title">Unscramble this</h2>
        <p id="dw-hint" class="dw__hint">A quick warm-up — one word for today</p>

        <p class="dw__scramble" aria-label="Scrambled letters">{{ scrambled }}</p>

        <form class="dw__form" @submit.prevent="submit">
          <label class="sr-only" for="dw-guess">Your guess</label>
          <input
            id="dw-guess"
            ref="inputEl"
            v-model="guess"
            class="dw__input"
            type="text"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="none"
            spellcheck="false"
            maxlength="16"
            placeholder="Your guess"
            :aria-invalid="feedback === 'wrong'"
            :aria-describedby="feedback === 'wrong' ? 'dw-feedback' : undefined"
          >
          <button type="submit" class="dw__go" aria-label="Check answer">
            Check
          </button>
        </form>

        <p
          v-if="feedback === 'wrong'"
          id="dw-feedback"
          class="dw__feedback dw__feedback--wrong"
          role="status"
        >
          Not quite — try again
        </p>
        <p
          v-else-if="feedback === 'ok'"
          class="dw__feedback dw__feedback--ok"
          role="status"
        >
          Nice — see you tomorrow
        </p>

        <div class="dw__actions">
          <button type="button" class="dw__skip" @click="markSkipped()">
            Not today
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.dw {
  position: fixed;
  inset: 0;
  z-index: calc(var(--z-overlay) + 30);
  display: grid;
  place-items: center;
  padding: max(16rem, var(--safe-top)) 16rem max(16rem, var(--safe-bottom));
  background: color-mix(in srgb, var(--ink) 32%, transparent);
}
.dw__panel {
  width: min(420rem, 100%);
  padding: 28rem 24rem 22rem;
  background: var(--paper);
  color: var(--ink);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-l);
  box-shadow: 8rem 8rem 0 var(--accent);
  animation: dw-in 280ms var(--ease-out) both;
}
@keyframes dw-in {
  from { opacity: 0; transform: translateY(12rem) scale(.98); }
  to { opacity: 1; transform: none; }
}
.dw__eyebrow {
  margin: 0 0 6rem;
  font: 700 11rem/1.2 var(--font-mono);
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--muted);
}
.dw__title {
  margin: 0 0 6rem;
  font: 600 clamp(28rem, 5vw, 36rem)/1.05 var(--font-display);
  letter-spacing: -.03em;
}
.dw__hint {
  margin: 0 0 22rem;
  font: 400 14rem/1.4 var(--font-ui);
  color: var(--ink-soft);
}
.dw__scramble {
  margin: 0 0 18rem;
  padding: 16rem 14rem;
  text-align: center;
  font: 700 clamp(28rem, 7vw, 40rem)/1.1 var(--font-ui);
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--ink);
  background: var(--accent);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
}
.dw__form {
  display: flex;
  gap: 8rem;
  margin-bottom: 10rem;
}
.dw__input {
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
.dw__input:focus-visible {
  outline: 3rem solid var(--ink);
  outline-offset: 2rem;
}
.dw__go {
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
.dw__go:hover { background: var(--signal-field); }
.dw__go:active { transform: translate(1rem, 1rem); box-shadow: 2rem 2rem 0 var(--ink); }
.dw__go:focus-visible { outline: 3rem solid var(--ink); outline-offset: 2rem; }
.dw__feedback {
  margin: 0 0 12rem;
  min-height: 1.2em;
  font: 650 13rem/1.3 var(--font-ui);
}
.dw__feedback--wrong { color: var(--ink); }
.dw__feedback--ok { color: var(--ink); }
.dw__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10rem;
  justify-content: space-between;
  margin-top: 8rem;
  padding-top: 14rem;
  border-top: var(--stroke) solid var(--line);
}
.dw__skip {
  min-height: 40rem;
  padding: 0 12rem;
  border: 0;
  background: transparent;
  color: var(--ink-soft);
  font: 650 13rem/1 var(--font-ui);
  text-decoration: underline;
  text-underline-offset: 3rem;
}
.dw__skip:hover { color: var(--ink); }
.dw__skip:focus-visible {
  outline: 3rem solid var(--ink);
  outline-offset: 2rem;
  border-radius: var(--radius-s);
}
@media (prefers-reduced-motion: reduce) {
  .dw__panel { animation: none; }
}
:global(html[data-reduce-motion="on"]) .dw__panel { animation: none; }
</style>
