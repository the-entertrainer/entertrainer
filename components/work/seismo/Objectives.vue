<script setup lang="ts">
import { OBJECTIVES } from '~/utils/seismo/content'
const emit = defineEmits<{ continue: [] }>()
</script>

<template>
  <section class="sg-screen sg-screen--narrow sg-obj">
    <p class="sg-eyebrow">What you will be able to do</p>
    <h2 class="sg-h2">By the end, you can find an epicentre yourself</h2>

    <ol class="sg-obj__list">
      <li v-for="(o, i) in OBJECTIVES" :key="i" class="sg-obj__item">
        <span class="sg-obj__num">{{ String(i + 1).padStart(2, '0') }}</span>
        <p class="sg-obj__text"><span class="sg-obj__verb">{{ o.verb }}</span> {{ o.text }}</p>
      </li>
    </ol>

    <p class="sg-note sg-obj__foot">
      Three sections follow: a short lesson, a hands-on location task, and a five-question check.
      The check needs 80 percent to pass, with unlimited attempts.
    </p>

    <div class="sg-obj__actions">
      <button type="button" class="sg-btn sg-btn--primary" @click="emit('continue')">Continue</button>
    </div>
  </section>
</template>

<style scoped>
.sg-obj { padding-top: 44rem; }
.sg-obj__list { list-style: none; margin: 30rem 0 26rem; padding: 0; }
.sg-obj__item {
  display: flex;
  gap: 18rem;
  align-items: baseline;
  padding: 20rem 0;
  border-top: 1px solid var(--sg-line);
}
.sg-obj__item:last-child { border-bottom: 1px solid var(--sg-line); }
.sg-obj__num {
  font-family: var(--sg-mono);
  font-size: 15rem;
  color: var(--sg-s);
  flex-shrink: 0;
}
.sg-obj__text {
  font-size: 19rem;
  line-height: 1.45;
  color: var(--sg-ink);
}
.sg-obj__verb { font-family: var(--sg-display); font-weight: 600; }
.sg-obj__foot { margin-bottom: 28rem; max-width: 54ch; }
</style>
