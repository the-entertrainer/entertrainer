<script setup lang="ts">
import { OBJECTIVES } from '~/utils/groove/content'
const emit = defineEmits<{ continue: [] }>()
</script>

<template>
  <section class="gv-screen gv-screen--narrow gv-obj">
    <p class="gv-eyebrow">What you will be able to do</p>
    <h2 class="gv-h2">By the end, you can build a beat</h2>

    <ol class="gv-obj__list">
      <li v-for="(o, i) in OBJECTIVES" :key="i" class="gv-obj__item">
        <span class="gv-obj__num">{{ String(i + 1).padStart(2, '0') }}</span>
        <p class="gv-obj__text"><span class="gv-obj__verb">{{ o.verb }}</span> {{ o.text }}</p>
      </li>
    </ol>

    <p class="gv-note gv-obj__foot">
      Three sections follow: a short lesson, a hands-on build, and a five-question check. The check
      needs 80 percent to pass, with unlimited attempts. Sound is used throughout, but every step
      also works by sight.
    </p>

    <div class="gv-obj__actions">
      <button type="button" class="gv-btn gv-btn--primary" @click="emit('continue')">Continue</button>
    </div>
  </section>
</template>

<style scoped>
.gv-obj { padding-top: 44rem; }
.gv-obj__list { list-style: none; margin: 30rem 0 26rem; padding: 0; }
.gv-obj__item { display: flex; gap: 18rem; align-items: baseline; padding: 20rem 0; border-top: 1px solid var(--gv-line); }
.gv-obj__item:last-child { border-bottom: 1px solid var(--gv-line); }
.gv-obj__num { font-family: var(--gv-mono); font-size: 15rem; color: var(--gv-accent); flex-shrink: 0; }
.gv-obj__text { font-size: 19rem; line-height: 1.45; color: var(--gv-text); }
.gv-obj__verb { font-family: var(--gv-display); font-weight: 700; }
.gv-obj__foot { margin-bottom: 28rem; max-width: 56ch; }
</style>
