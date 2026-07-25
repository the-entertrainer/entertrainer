<script setup lang="ts">
/**
 * Minimal chrome shared by every concept: the back link, the theme variables,
 * and a footnote naming the finding the page is built on. Everything else —
 * layout, type, motion, interaction — is the concept's own.
 */
const props = defineProps<{
  bg: string; ink: string; pop: string
  /** Font stack for the display face. */
  display?: string
  /** The research finding, shown as a footnote so the claim is always visible. */
  law?: string
}>()

const vars = computed(() => ({
  '--bg': props.bg, '--ink': props.ink, '--pop': props.pop,
  '--ink-70': alpha(props.ink, 0.7), '--ink-45': alpha(props.ink, 0.45), '--ink-15': alpha(props.ink, 0.15),
  '--display': props.display ?? "'DM Sans', system-ui, sans-serif"
}))

function alpha(hex: string, a: number) {
  const h = hex.replace('#', '')
  const n = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${a})`
}
</script>

<template>
  <div class="sh" :style="vars">
    <NuxtLink to="/lab" class="sh__back">◂ lab</NuxtLink>
    <slot />
    <p v-if="law" class="sh__law">{{ law }}</p>
  </div>
</template>

<style scoped>
.sh { position: fixed; inset: 0; overflow: hidden; background: var(--bg); color: var(--ink); font-family: var(--display); }
.sh__back { position: fixed; top: 16rem; left: 18rem; z-index: 90; color: var(--ink-45); text-decoration: none; font-size: 12rem; font-family: 'DM Sans', sans-serif; }
.sh__back:hover { color: var(--ink); }
.sh__back:focus-visible { outline: 2px solid var(--pop); outline-offset: 3px; border-radius: 3rem; }
.sh__law {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 80; margin: 0;
  padding: 8rem 18rem calc(8rem + env(safe-area-inset-bottom));
  font-family: 'DM Sans', sans-serif; font-size: 10rem; line-height: 1.45;
  color: var(--ink-45); text-align: center; pointer-events: none;
  border-top: 1px solid var(--ink-15); background: var(--bg);
}
@media (max-width: 680px) { .sh__law { font-size: 9rem; text-align: left; } }
</style>
