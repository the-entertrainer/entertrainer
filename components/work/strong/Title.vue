<script setup lang="ts">
import StrengthBar from './StrengthBar.vue'
import CrackTimes from './CrackTimes.vue'
import { randomPassphrase, type Passphrase } from '~/utils/strong/crypto'

const emit = defineEmits<{ start: [] }>()
const demo = ref<Passphrase>(randomPassphrase(7))
function reroll() { demo.value = randomPassphrase(7) }
</script>

<template>
  <section class="st-screen st-title">
    <div class="st-title__head">
      <p class="st-eyebrow">Security · the real math</p>
      <h1 class="st-h1">STRONG</h1>
      <p class="st-title__dek">
        Everyone says use a strong password. Almost no one shows you what strong actually means. It
        is not about symbols and capitals. It is a number, in bits, and there is a simple formula
        behind it. Learn the formula and you can size up any password in your head.
      </p>
      <button type="button" class="st-btn st-btn--primary st-title__cta" @click="emit('start')">
        Start the module
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
      </button>
      <p class="st-note st-title__privacy">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
        Nothing you type in this module ever leaves your device. Every number is worked out in your browser.
      </p>
    </div>

    <div class="st-title__box">
      <p class="st-title__box-label">A passphrase: seven words picked at random</p>
      <p class="st-title__phrase st-num">{{ demo.phrase }}</p>
      <button type="button" class="st-title__reroll" @click="reroll">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v5h-5"/></svg>
        Another
      </button>
      <div class="st-title__bar"><StrengthBar :bits="demo.bits" compact /></div>
      <CrackTimes :bits="demo.bits" compact />
    </div>
  </section>
</template>

<style scoped>
.st-title {
  min-height: 100%;
  display: grid;
  grid-template-columns: 1fr 0.92fr;
  gap: 46rem;
  align-items: center;
}
.st-title__head { max-width: 480rem; }
.st-h1 { margin: 4rem 0 0; }
.st-title__dek { margin-top: 22rem; font-size: 16.5rem; line-height: 1.6; color: var(--st-muted-strong); max-width: 46ch; }
.st-title__cta { margin-top: 28rem; }
.st-title__privacy { margin-top: 18rem; display: flex; align-items: center; gap: 7rem; color: var(--st-muted); }
.st-title__privacy svg { color: var(--st-accent); flex-shrink: 0; }

.st-title__box {
  background: var(--st-panel);
  border: 1px solid var(--st-line);
  border-radius: 16rem;
  padding: 22rem;
  box-shadow: 0 30rem 60rem -40rem #000;
}
.st-title__box-label { font-family: var(--st-mono); font-size: 11.5rem; color: var(--st-muted); margin-bottom: 12rem; }
.st-title__phrase { font-size: 18rem; font-weight: 500; color: var(--st-text); overflow-wrap: anywhere; line-height: 1.5; }
.st-title__reroll {
  display: inline-flex; align-items: center; gap: 6rem; margin: 12rem 0 18rem;
  padding: 6rem 11rem; border-radius: 8rem; border: 1px solid var(--st-line);
  font-family: var(--st-mono); font-size: 11.5rem; color: var(--st-muted);
  transition: color 0.14s ease, border-color 0.14s ease;
}
@media (hover: hover) { .st-title__reroll:hover { color: var(--st-text); border-color: var(--st-line-strong); } }
.st-title__reroll:focus-visible { outline: 2px solid var(--st-text); outline-offset: 2px; }
.st-title__bar { margin-bottom: 18rem; }

@media (max-width: 860px) {
  .st-title { grid-template-columns: 1fr; gap: 30rem; }
}
</style>
