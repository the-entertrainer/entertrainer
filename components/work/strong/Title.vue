<script setup lang="ts">
import StrengthBar from './StrengthBar.vue'
import CrackTimes from './CrackTimes.vue'
import { randomPassphrase, type Passphrase } from '~/utils/strong/crypto'

const emit = defineEmits<{ start: [] }>()
const demo = ref<Passphrase>(randomPassphrase(7))
function reroll() { demo.value = randomPassphrase(7) }
</script>

<template>
  <section class="st-card st-cover">
    <p class="st-eyebrow">Security · the real math</p>
    <h1 class="st-h1">STRONG</h1>
    <p class="st-lead st-cover__line">Strong is not a feeling. It is a number, and there is a formula behind it.</p>

    <button type="button" class="st-btn st-btn--primary st-cover__cta" @click="emit('start')">
      Start
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
    </button>

    <div class="st-cover__demo">
      <div class="st-cover__demo-top">
        <span class="st-cover__demo-label">a passphrase, seven random words</span>
        <button type="button" class="st-cover__reroll" aria-label="Generate another" @click="reroll">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v5h-5"/></svg>
        </button>
      </div>
      <p class="st-cover__phrase st-num">{{ demo.phrase }}</p>
      <StrengthBar :bits="demo.bits" compact />
      <div class="st-cover__crack"><CrackTimes :bits="demo.bits" compact /></div>
    </div>

    <p class="st-note st-cover__privacy">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
      Nothing you type here ever leaves your device.
    </p>
  </section>
</template>

<style scoped>
.st-cover { text-align: center; max-width: 640rem; }
.st-cover__line { margin: 22rem auto 0; max-width: 34ch; }
.st-cover__cta { margin-top: 30rem; }
.st-cover__demo {
  margin: 40rem auto 0; max-width: 520rem; text-align: left;
  background: color-mix(in srgb, var(--st-panel) 88%, transparent);
  border: 1px solid var(--st-line); border-radius: 16rem; padding: 20rem;
}
.st-cover__demo-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12rem; }
.st-cover__demo-label { font-family: var(--st-mono); font-size: 11rem; color: var(--st-muted); }
.st-cover__reroll { width: 28rem; height: 28rem; display: inline-flex; align-items: center; justify-content: center; border-radius: 7rem; border: 1px solid var(--st-line); color: var(--st-muted); }
@media (hover: hover) { .st-cover__reroll:hover { color: var(--st-text); border-color: var(--st-line-strong); } }
.st-cover__reroll:focus-visible { outline: 2px solid var(--st-text); outline-offset: 2px; }
.st-cover__phrase { font-size: 16rem; font-weight: 500; color: var(--st-text); overflow-wrap: anywhere; line-height: 1.5; margin-bottom: 16rem; }
.st-cover__crack { margin-top: 4rem; }
.st-cover__privacy { display: inline-flex; align-items: center; gap: 7rem; margin-top: 26rem; color: var(--st-muted); }
.st-cover__privacy svg { color: var(--st-accent); flex-shrink: 0; }
</style>
