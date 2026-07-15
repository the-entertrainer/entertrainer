<script setup lang="ts">
import StrengthBar from './StrengthBar.vue'
import CrackTimes from './CrackTimes.vue'
import { analyze, randomPassphrase, sciNotation, type Passphrase } from '~/utils/strong/crypto'
import { TARGET_BITS } from '~/utils/strong/content'

const store = useStrongStore()
const emit = defineEmits<{ back: []; continue: [] }>()

const input = ref('')
const reveal = ref(true)
const pp = ref<Passphrase | null>(null)

const a = computed(() => analyze(input.value))
// A generated passphrase's honest strength is its word-level entropy, which is
// far below the character-level estimate a naive meter would show.
const isPhrase = computed(() => pp.value != null && input.value === pp.value.phrase)
const effBits = computed(() => isPhrase.value ? pp.value!.bits : a.value.effBits)
const naiveForBar = computed(() => {
  if (isPhrase.value) return a.value.naiveBits
  return a.value.guessable ? a.value.naiveBits : null
})
const has = computed(() => input.value.length > 0)
const passed = computed(() => effBits.value >= TARGET_BITS)

function generate() { const p = randomPassphrase(7); pp.value = p; input.value = p.phrase; reveal.value = true }
function clear() { input.value = ''; pp.value = null }

watch(effBits, (b) => {
  if (b > store.bestBits) store.saveLab({ effBits: b, naiveBits: a.value.naiveBits, length: input.value.length, usedPassphrase: isPhrase.value })
})
</script>

<template>
  <section class="st-screen st-lab">
    <button type="button" class="st-back" @click="emit('back')">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7" /></svg>
      Menu
    </button>
    <p class="st-eyebrow">Password lab</p>
    <h2 class="st-h2">Build one and watch it break</h2>
    <p class="st-lab__intro st-body">
      Type anything and the numbers update as you go. Your goal: reach {{ TARGET_BITS }} bits of real
      strength. Try a short clever password first, then try a passphrase, and compare.
    </p>
    <p class="st-note st-lab__privacy">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
      This runs entirely in your browser. Nothing is sent, logged, or saved. Still, use a made-up password, not a real one.
    </p>

    <div class="st-lab__field">
      <input
        :type="reveal ? 'text' : 'password'"
        v-model="input"
        class="st-lab__input st-num"
        placeholder="type a password to test"
        autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
        aria-label="Password to test"
      />
      <button type="button" class="st-lab__icon" :aria-label="reveal ? 'Hide' : 'Show'" @click="reveal = !reveal">
        <svg v-if="reveal" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-1.2M9.9 5.2A9.5 9.5 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.2 6.2A17 17 0 0 0 2 12s3.5 7 10 7a9.5 9.5 0 0 0 3-.5"/></svg>
      </button>
      <button v-if="has" type="button" class="st-lab__icon" aria-label="Clear" @click="clear">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>

    <div class="st-lab__actions-row">
      <button type="button" class="st-lab__gen" @click="generate">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v5h-5"/></svg>
        Generate a passphrase
      </button>
    </div>

    <div v-if="has" class="st-lab__readout">
      <div class="st-lab__stats">
        <div class="st-lab__stat">
          <span class="st-lab__k">Length</span>
          <span class="st-lab__v st-num">{{ a.length }}</span>
        </div>
        <div class="st-lab__stat">
          <span class="st-lab__k">Pool</span>
          <span class="st-lab__v st-num">{{ a.pool }}</span>
        </div>
        <div class="st-lab__stat">
          <span class="st-lab__k">Possibilities</span>
          <span class="st-lab__v st-num">{{ sciNotation(a.possLog10) }}</span>
        </div>
      </div>

      <div class="st-lab__bar"><StrengthBar :bits="effBits" :naive="naiveForBar" /></div>

      <div v-if="a.guessable && !isPhrase" class="st-lab__flag st-lab__flag--warn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>
        <span>{{ a.guessReason }}</span>
      </div>
      <div v-else-if="isPhrase" class="st-lab__flag st-lab__flag--info">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16v-4M12 8h.01"/><circle cx="12" cy="12" r="9"/></svg>
        <span>A naive meter would call this {{ Math.round(a.naiveBits) }} bits, treating every letter as random. It is really seven words from a {{ Math.round(Math.pow(2, effBits / 7)) }}-word list, so its honest strength is {{ Math.round(effBits) }} bits. Strong, and you can picture it.</span>
      </div>

      <div class="st-lab__crack"><CrackTimes :bits="effBits" /></div>
    </div>

    <div v-else class="st-lab__empty">
      <p class="st-note">Start typing above, or generate a passphrase, to see the numbers.</p>
    </div>

    <div class="st-lab__foot">
      <div class="st-lab__goal" :class="{ 'is-met': passed }" role="status">
        <svg v-if="passed" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-11"/></svg>
        <span>{{ passed ? `Cleared. ${Math.round(effBits)} bits of real strength.` : `Goal: reach ${TARGET_BITS} bits. You are at ${Math.round(effBits)}.` }}</span>
      </div>
      <button type="button" class="st-btn st-btn--primary" :disabled="!passed" @click="emit('continue')">
        Continue to assessment
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
      </button>
    </div>
  </section>
</template>

<style scoped>
.st-lab__intro { max-width: 62ch; margin-bottom: 14rem; }
.st-lab__privacy { display: flex; align-items: flex-start; gap: 7rem; color: var(--st-muted); margin-bottom: 24rem; max-width: 64ch; }
.st-lab__privacy svg { color: var(--st-accent); flex-shrink: 0; margin-top: 2rem; }

.st-lab__field { position: relative; display: flex; align-items: center; gap: 4rem; background: var(--st-slot); border: 1px solid var(--st-line-strong); border-radius: 12rem; padding: 4rem 8rem 4rem 4rem; }
.st-lab__field:focus-within { border-color: var(--st-accent); }
.st-lab__input {
  flex: 1; min-width: 0; background: transparent; border: none; outline: none;
  padding: 15rem 14rem; font-size: 18rem; color: var(--st-text); letter-spacing: 0.02em;
}
.st-lab__input::placeholder { color: var(--st-muted); opacity: 0.7; font-family: var(--st-body); letter-spacing: 0; }
.st-lab__icon { width: 34rem; height: 34rem; display: flex; align-items: center; justify-content: center; border-radius: 8rem; color: var(--st-muted); flex-shrink: 0; }
@media (hover: hover) { .st-lab__icon:hover { color: var(--st-text); background: var(--st-slot-hover); } }
.st-lab__icon:focus-visible { outline: 2px solid var(--st-text); outline-offset: 2px; }

.st-lab__actions-row { margin-top: 12rem; }
.st-lab__gen {
  display: inline-flex; align-items: center; gap: 8rem; padding: 10rem 15rem;
  border-radius: 8rem; border: 1px solid var(--st-line-strong);
  font-family: var(--st-display); font-weight: 500; font-size: 13.5rem; color: var(--st-text);
  transition: border-color 0.14s ease, background 0.14s ease;
}
@media (hover: hover) { .st-lab__gen:hover { border-color: var(--st-accent); background: var(--st-slot-hover); } }
.st-lab__gen:focus-visible { outline: 2px solid var(--st-text); outline-offset: 2px; }

.st-lab__readout { margin-top: 24rem; }
.st-lab__stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10rem; margin-bottom: 22rem; }
.st-lab__stat { background: var(--st-panel); border: 1px solid var(--st-line); border-radius: 10rem; padding: 13rem 15rem; }
.st-lab__k { display: block; font-family: var(--st-mono); font-size: 10.5rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--st-muted); margin-bottom: 6rem; }
.st-lab__v { font-size: 20rem; font-weight: 600; color: var(--st-text); }
.st-lab__bar { background: var(--st-panel); border: 1px solid var(--st-line); border-radius: 12rem; padding: 18rem; margin-bottom: 14rem; }

.st-lab__flag { display: flex; align-items: flex-start; gap: 10rem; padding: 13rem 15rem; border-radius: 10rem; font-size: 13.5rem; line-height: 1.5; margin-bottom: 14rem; }
.st-lab__flag svg { flex-shrink: 0; margin-top: 1rem; }
.st-lab__flag--warn { background: color-mix(in srgb, var(--st-t0) 12%, transparent); border: 1px solid color-mix(in srgb, var(--st-t0) 40%, transparent); color: var(--st-text); }
.st-lab__flag--warn svg { color: var(--st-t0); }
.st-lab__flag--info { background: color-mix(in srgb, var(--st-t4) 10%, transparent); border: 1px solid color-mix(in srgb, var(--st-t4) 35%, transparent); color: var(--st-text); }
.st-lab__flag--info svg { color: var(--st-t4); }

.st-lab__crack { background: var(--st-panel); border: 1px solid var(--st-line); border-radius: 12rem; padding: 18rem; }
.st-lab__empty { margin-top: 24rem; padding: 30rem; text-align: center; background: var(--st-panel); border: 1px dashed var(--st-line-strong); border-radius: 12rem; }

.st-lab__foot { margin-top: 26rem; padding-top: 22rem; border-top: 1px solid var(--st-line); display: flex; align-items: center; justify-content: space-between; gap: 16rem; flex-wrap: wrap; }
.st-lab__goal { display: inline-flex; align-items: center; gap: 8rem; font-family: var(--st-mono); font-size: 13rem; color: var(--st-muted); }
.st-lab__goal.is-met { color: var(--st-t3); }

@media (max-width: 560px) {
  .st-lab__stats { grid-template-columns: 1fr; }
  .st-lab__foot { flex-direction: column; align-items: stretch; }
  .st-lab__foot .st-btn { width: 100%; }
}
</style>
