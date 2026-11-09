<script setup lang="ts">
defineProps<{ n: string; name: string; hint?: string }>()
</script>

<template>
  <div class="lf">
    <header class="lf__bar">
      <NuxtLink to="/lab" class="lf__back">◂ all concepts</NuxtLink>
      <span class="lf__name">{{ n }} · {{ name }}</span>
      <span class="lf__hint">{{ hint || 'preview' }}</span>
    </header>
    <slot />
  </div>
</template>

<style scoped>
.lf {
  position: fixed; inset: 0; overflow: hidden;
  background: var(--color-bg); color: var(--color-text);
  --serif: var(--display-font);
}
.lf__bar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  display: flex; align-items: center; justify-content: space-between; gap: 0.875rem;
  padding: calc(1rem + var(--safe-top)) clamp(1rem, 4vw, 2.5rem) 1rem;
  font-size: 0.75rem; letter-spacing: 0.04em; pointer-events: none;
}
.lf__bar > * { pointer-events: auto; }
.lf__back { color: var(--color-text); text-decoration: none; opacity: 0.7; min-height: 2.5rem; display: inline-flex; align-items: center; }
.lf__back:hover { opacity: 1; }
.lf__back:focus-visible { outline: 2px solid var(--color-text); outline-offset: 3px; }
.lf__name { font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.5; font-size: 0.75rem; }
.lf__hint { font-family: var(--serif); font-style: italic; opacity: 0.5; font-size: 0.875rem; }
@media (max-width: 620px) { .lf__hint { display: none; } }
</style>
