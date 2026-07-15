<script setup lang="ts">
import { OBJECTIVES } from '~/utils/strong/content'
const emit = defineEmits<{ continue: [] }>()
</script>

<template>
  <section class="st-screen st-screen--narrow st-obj">
    <p class="st-eyebrow">What you will be able to do</p>
    <h2 class="st-h2">By the end, you can size up any password</h2>

    <ol class="st-obj__list">
      <li v-for="(o, i) in OBJECTIVES" :key="i" class="st-obj__item">
        <span class="st-obj__num st-num">{{ String(i + 1).padStart(2, '0') }}</span>
        <p class="st-obj__text"><span class="st-obj__verb">{{ o.verb }}</span> {{ o.text }}</p>
      </li>
    </ol>

    <p class="st-note st-obj__foot">
      Three sections follow: a short lesson on the math, a hands-on lab where you build a password
      and watch it break, and a five-question check. The check needs 80 percent to pass, with
      unlimited attempts. Nothing you type is stored or sent anywhere.
    </p>

    <div class="st-obj__actions">
      <button type="button" class="st-btn st-btn--primary" @click="emit('continue')">Continue</button>
    </div>
  </section>
</template>

<style scoped>
.st-obj { padding-top: 44rem; }
.st-obj__list { list-style: none; margin: 30rem 0 26rem; padding: 0; }
.st-obj__item { display: flex; gap: 18rem; align-items: baseline; padding: 20rem 0; border-top: 1px solid var(--st-line); }
.st-obj__item:last-child { border-bottom: 1px solid var(--st-line); }
.st-obj__num { font-size: 15rem; color: var(--st-accent); flex-shrink: 0; }
.st-obj__text { font-size: 19rem; line-height: 1.45; color: var(--st-text); }
.st-obj__verb { font-family: var(--st-display); font-weight: 600; }
.st-obj__foot { margin-bottom: 28rem; max-width: 58ch; }
</style>
