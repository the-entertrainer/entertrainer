<script setup lang="ts">
import gsap from 'gsap'

const emit = defineEmits<{ continue: [] }>()
const titleEl = ref<HTMLElement | null>(null)

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!titleEl.value) return
  gsap.from(titleEl.value, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'power3.out' })
})
</script>

<template>
  <section class="ct-title">
    <p class="ct-title__kicker">An interactive case study</p>
    <h1 ref="titleEl" class="ct-title__headline">The Confidence Trap</h1>
    <div class="ct-title__rule" />
    <p class="ct-title__dek">
      A short module on the gap between how sure you feel and how right you are,
      built to measure that gap in you specifically, then show you the number.
    </p>
    <button type="button" class="ct-btn ct-btn--primary ct-title__cta" @click="emit('continue')">
      Begin
    </button>
  </section>
</template>

<style scoped>
.ct-title {
  min-height: calc(100dvh - 160rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 620rem;
}
.ct-title__kicker {
  font-family: var(--ct-sans);
  font-size: 13rem;
  letter-spacing: 0.02em;
  color: var(--ct-secondary);
  margin-bottom: 28rem;
}
.ct-title__headline {
  font-family: var(--ct-serif);
  font-size: clamp(38rem, 6vw, 58rem);
  font-weight: 600;
  line-height: 1.08;
  color: var(--ct-graphite);
  max-width: 12ch;
}
.ct-title__rule {
  width: 64rem;
  height: 1px;
  background: var(--ct-border);
  margin: 32rem 0;
}
.ct-title__dek {
  font-family: var(--ct-sans);
  font-size: 17rem;
  line-height: 1.6;
  color: var(--ct-secondary);
  max-width: 46ch;
}
.ct-title__cta { margin-top: 44rem; align-self: flex-start; }

@media (max-width: 600px) {
  .ct-title { min-height: calc(100dvh - 120rem); }
}
</style>
