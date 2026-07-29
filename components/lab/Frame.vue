<script setup lang="ts">
/**
 * The lab's own chrome. It has to sit legibly over five very different
 * grounds — near-black void, bone paper, cream stock — so it carries a `tone`
 * rather than assuming the site's palette.
 */
withDefaults(defineProps<{ n: string; name: string; hint?: string; tone?: 'dark' | 'light' }>(), {
  tone: 'dark'
})
</script>

<template>
  <div class="lf" :class="`lf--${tone}`">
    <header class="lf__bar">
      <NuxtLink to="/lab" class="lf__back">◂ Lab</NuxtLink>
      <span class="lf__name">{{ n }} · {{ name }}</span>
      <span class="lf__hint">{{ hint || 'preview' }}</span>
    </header>
    <slot />
  </div>
</template>

<style scoped>
.lf {
  position: fixed; inset: 0; overflow: hidden;
  --lf-ink: #f4f2ee;
}
.lf--light { --lf-ink: #14130f; }

.lf__bar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 60;
  display: flex; align-items: center; justify-content: space-between; gap: 14rem;
  padding: calc(16rem + var(--safe-top)) clamp(16rem, 4vw, 40rem) 16rem;
  font-family: var(--mono-font);
  font-size: 11rem; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--lf-ink);
  pointer-events: none;
}
.lf__bar > * { pointer-events: auto; }
.lf__back { color: inherit; text-decoration: none; opacity: 0.75; min-height: 40rem; display: inline-flex; align-items: center; }
.lf__back:hover { opacity: 1; }
.lf__back:focus-visible { outline: 1px solid currentColor; outline-offset: 4px; }
.lf__name { font-weight: 500; }
.lf__hint { opacity: 0.5; text-transform: none; letter-spacing: 0.04em; }

@media (max-width: 620px) { .lf__hint { display: none; } }
</style>
