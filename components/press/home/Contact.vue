<script setup lang="ts">
import { useContentStore } from '~/stores/content'

const content = useContentStore()
const R = useReveal()
</script>

<template>
  <section class="ct">
    <p class="press-label" v-motion :initial="R.rise(0).initial" :visible-once="R.rise(0).visibleOnce">Get in touch</p>
    <h2 class="ct__h2" v-motion :initial="R.rise(80).initial" :visible-once="R.rise(80).visibleOnce">Let's build.</h2>
    <p class="ct__lead" v-motion :initial="R.rise(160).initial" :visible-once="R.rise(160).visibleOnce">
      Got a course that isn't landing, a tool that doesn't exist yet, or an idea you can't quite
      explain? Those are my three favourite emails.
    </p>
    <a :href="`mailto:${content.email}`" class="press-btn press-btn--solid ct__btn" v-motion :initial="R.rise(220).initial" :visible-once="R.rise(220).visibleOnce">
      {{ content.email }}
    </a>
  </section>
</template>

<style scoped>
.ct {
  position: relative; z-index: 1;
  max-width: 640px; margin: 0 auto;
  padding: clamp(64px, 10vw, 120px) var(--press-edge);
  text-align: center;
}
.ct__h2 { margin: 16px 0 0; font-family: var(--press-serif); font-weight: 400; font-size: clamp(40px, 7vw, 76px); line-height: 1; }
.ct__lead { margin: 24px 0 0; font-size: var(--press-lead); line-height: 1.5; color: var(--press-ink-80); }
.ct__btn { margin-top: 30px; }
</style>
