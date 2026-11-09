<script setup lang="ts">
import StrengthBar from './StrengthBar.vue'
import CrackTimes from './CrackTimes.vue'
import { analyze, randomPassphrase, sciNotation, type Passphrase } from '~/utils/strong/crypto'
import { TARGET_BITS } from '~/utils/strong/content'

const store = useStrongStore()

const input = ref('')
const reveal = ref(true)
const pp = ref<Passphrase | null>(null)

const a = computed(() => analyze(input.value))
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
  <section class="st-card st-card--wide st-lab">
    <p class="st-eyebrow">Password lab</p>
    <h2 class="st-h2">Build one. Watch it break.</h2>
    <p class="st-lead st-lab__line">Reach {{ TARGET_BITS }} bits of real strength to continue. Try a clever short one first. Then try a passphrase; the difference is the whole lesson.</p>

    <div class="st-lab__field">
      <input
        :type="reveal ? 'text' : 'password'"
        v-model="input"
        class="st-lab__input st-num"
        placeholder="type a made-up password"
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

    <button type="button" class="st-lab__gen" @click="generate">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v5h-5"/></svg>
      Generate a passphrase
    </button>

    <div v-if="has" class="st-lab__readout">
      <div class="st-lab__stats">
        <div class="st-lab__stat"><span class="st-lab__k">Length</span><span class="st-lab__v st-num">{{ a.length }}</span></div>
        <div class="st-lab__stat"><span class="st-lab__k">Pool</span><span class="st-lab__v st-num">{{ a.pool }}</span></div>
        <div class="st-lab__stat"><span class="st-lab__k">Possibilities</span><span class="st-lab__v st-num">{{ sciNotation(a.possLog10) }}</span></div>
      </div>

      <div class="st-lab__bar"><StrengthBar :bits="effBits" :naive="naiveForBar" /></div>

      <div v-if="a.guessable && !isPhrase" class="st-lab__flag st-lab__flag--warn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>
        <span>{{ a.guessReason }}</span>
      </div>
      <div v-else-if="isPhrase" class="st-lab__flag st-lab__flag--info">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16v-4M12 8h.01"/><circle cx="12" cy="12" r="9"/></svg>
        <span>A naive meter would call this {{ Math.round(a.naiveBits) }} bits. But this is really seven words, so its honest strength is {{ Math.round(effBits) }} bits. Strong and memorable, which is a useful combination.</span>
      </div>

      <div class="st-lab__crack"><CrackTimes :bits="effBits" /></div>
    </div>

    <div v-else class="st-lab__empty"><p class="st-note">Start typing, or generate a passphrase, and watch the numbers appear.</p></div>

    <div class="st-lab__goal" :class="{ 'is-met': passed }" role="status">
      <svg v-if="passed" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-11"/></svg>
      <span>{{ passed ? `Cleared at ${Math.round(effBits)} bits. Use the arrow to continue.` : `Goal: ${TARGET_BITS} bits. You are at ${Math.round(effBits)}.` }}</span>
    </div>
  </section>
</template>

<style scoped>
.st-lab__line { margin: 1.375rem 0 2.125rem; max-width: 46ch; }
.st-lab__field { position: relative; display: flex; align-items: center; gap: 0.25rem; background: var(--st-slot); border: 1px solid var(--st-line-strong); border-radius: 0.75rem; padding: 0.25rem 0.5rem 0.25rem 0.25rem; }
.st-lab__field:focus-within { border-color: var(--st-accent); }
.st-lab__input { flex: 1; min-width: 0; background: transparent; border: none; outline: none; padding: 0.9375rem 0.875rem; font-size: 1.125rem; color: var(--st-text); letter-spacing: 0.02em; }
.st-lab__input::placeholder { color: var(--st-muted); opacity: 0.7; font-family: var(--st-body); letter-spacing: 0; }
.st-lab__icon { width: 2.125rem; height: 2.125rem; display: flex; align-items: center; justify-content: center; border-radius: 0.5rem; color: var(--st-muted); flex-shrink: 0; }
@media (hover: hover) { .st-lab__icon:hover { color: var(--st-text); background: var(--st-slot-hover); } }
.st-lab__icon:focus-visible { outline: 2px solid var(--st-text); outline-offset: 2px; }
.st-lab__gen { display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 0.875rem; padding: 0.6875rem 1rem; border-radius: 0.5rem; border: 1px solid var(--st-line-strong); font-family: var(--st-display); font-weight: 500; font-size: 0.84375rem; color: var(--st-text); transition: border-color 0.14s ease, background 0.14s ease; }
@media (hover: hover) { .st-lab__gen:hover { border-color: var(--st-accent); background: var(--st-slot-hover); } }
.st-lab__gen:focus-visible { outline: 2px solid var(--st-text); outline-offset: 2px; }

.st-lab__readout { margin-top: 2rem; }
.st-lab__stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1.75rem; }
.st-lab__stat { background: color-mix(in srgb, var(--st-panel) 90%, transparent); border: 1px solid var(--st-line); border-radius: 0.75rem; padding: 1rem 1.125rem; }
.st-lab__k { display: block; font-family: var(--st-mono); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--st-muted); margin-bottom: 0.5rem; }
.st-lab__v { font-size: 1.25rem; font-weight: 600; color: var(--st-text); }
.st-lab__bar { background: color-mix(in srgb, var(--st-panel) 90%, transparent); border: 1px solid var(--st-line); border-radius: 0.875rem; padding: 1.375rem; margin-bottom: 1.125rem; }
.st-lab__flag { display: flex; align-items: flex-start; gap: 0.6875rem; padding: 0.9375rem 1.0625rem; border-radius: 0.75rem; font-size: 0.84375rem; line-height: 1.55; margin-bottom: 1.125rem; }
.st-lab__flag svg { flex-shrink: 0; margin-top: 0.0625rem; }
.st-lab__flag--warn { background: color-mix(in srgb, var(--st-t0) 12%, transparent); border: 1px solid color-mix(in srgb, var(--st-t0) 40%, transparent); color: var(--st-text); }
.st-lab__flag--warn svg { color: var(--st-t0); }
.st-lab__flag--info { background: color-mix(in srgb, var(--st-t4) 10%, transparent); border: 1px solid color-mix(in srgb, var(--st-t4) 35%, transparent); color: var(--st-text); }
.st-lab__flag--info svg { color: var(--st-t4); }
.st-lab__crack { background: color-mix(in srgb, var(--st-panel) 90%, transparent); border: 1px solid var(--st-line); border-radius: 0.875rem; padding: 1.375rem; }
.st-lab__empty { margin-top: 2rem; padding: 2.25rem; text-align: center; background: color-mix(in srgb, var(--st-panel) 70%, transparent); border: 1px dashed var(--st-line-strong); border-radius: 0.875rem; }
.st-lab__goal { margin-top: 1.75rem; display: inline-flex; align-items: center; gap: 0.5rem; font-family: var(--st-mono); font-size: 0.8125rem; color: var(--st-muted); }
.st-lab__goal.is-met { color: var(--st-t3); }

@media (max-width: 560px) { .st-lab__stats { grid-template-columns: 1fr; } }
</style>
