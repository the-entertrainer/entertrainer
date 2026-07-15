<script setup lang="ts">
import { OBJECTIVES } from '~/utils/strong/content'
</script>

<template>
  <section class="st-card st-obj">
    <p class="st-eyebrow">In five minutes</p>
    <h2 class="st-h2">You will size up any password</h2>

    <ol class="st-obj__list">
      <li v-for="(o, i) in OBJECTIVES" :key="i" class="st-obj__item">
        <span class="st-obj__num st-num">{{ String(i + 1).padStart(2, '0') }}</span>
        <p class="st-obj__text"><b>{{ o.verb }}</b> {{ o.text }}</p>
      </li>
    </ol>

    <p class="st-note st-obj__foot">A short lesson, a hands-on lab, and five questions. Move with the arrows below.</p>
  </section>
</template>

<style scoped>
.st-obj__list { list-style: none; margin: 34rem 0 24rem; padding: 0; }
.st-obj__item { display: flex; gap: 20rem; align-items: baseline; padding: 22rem 0; border-top: 1px solid var(--st-line); }
.st-obj__item:last-child { border-bottom: 1px solid var(--st-line); }
.st-obj__num { font-size: 15rem; color: var(--st-accent); flex-shrink: 0; }
.st-obj__text { font-size: clamp(18rem, 2.4vw, 22rem); line-height: 1.4; color: var(--st-text); }
.st-obj__text b { font-family: var(--st-display); font-weight: 600; }
.st-obj__foot { margin-top: 8rem; }
</style>
