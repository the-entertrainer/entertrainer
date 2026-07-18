<script setup lang="ts">
import type { NavItem } from '~/types/nav'

// A calm, indexable section landing: header plus a grid of cards that link
// out to the real pages. Used by /tools and /my-work so those routes are
// genuine destinations (crawlable, shareable) rather than redirects back
// into the spiral. Sits on the quiet calm backdrop, not the living ripple.
defineProps<{
  eyebrow?: string
  title: string
  deck?: string
  intro?: string
  items: NavItem[]
}>()
</script>

<template>
  <div class="cg-page">
    <UiGlassBackdrop calm />

    <div class="cg-inner">
      <header class="cg-head">
        <p v-if="eyebrow" class="cg-eyebrow">{{ eyebrow }}</p>
        <h1 class="cg-title">{{ title }}</h1>
        <p v-if="deck" class="cg-deck">{{ deck }}</p>
        <p v-if="intro" class="cg-intro">{{ intro }}</p>
      </header>

      <div class="cg-grid">
        <NuxtLink
          v-for="(item, i) in items" :key="item.id"
          :to="item.href" class="glass-panel cg-card"
          :style="{ '--i': Math.min(i, 10) }"
        >
          <span class="cg-card__dot" aria-hidden="true" />
          <span class="cg-card__body">
            <strong class="cg-card__label">{{ item.label }}</strong>
            <span class="cg-card__desc">{{ item.description }}</span>
          </span>
          <span class="cg-card__arrow" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
        </NuxtLink>
      </div>

      <p v-if="!items.length" class="cg-empty">More is on the way. Check back soon.</p>
    </div>
  </div>
</template>

<style scoped>
.cg-page { position: fixed; inset: 0; overflow-y: auto; z-index: 1; }
.cg-inner {
  max-width: 900rem;
  margin: 0 auto;
  padding: calc(120rem + var(--safe-top)) 24rem calc(64rem + var(--safe-bottom));
}
.cg-head { margin-bottom: 34rem; animation: cg-rise 0.6s var(--ease-spring) both; }
.cg-eyebrow {
  font-size: 12rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.5;
  margin-bottom: 12rem;
}
.cg-title { font-size: clamp(32rem, 6vw, 46rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1.05; }
.cg-deck { font-size: 16rem; opacity: 0.65; margin-top: 12rem; line-height: 1.5; max-width: 34em; }
.cg-intro { font-size: 14rem; opacity: 0.55; margin-top: 14rem; line-height: 1.6; max-width: 40em; }

.cg-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280rem, 1fr));
  gap: 14rem;
}
.cg-card {
  display: flex;
  align-items: center;
  gap: 14rem;
  padding: 20rem 22rem;
  border-radius: 18rem;
  color: var(--color-text);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  animation: cg-rise 0.55s var(--ease-spring) both;
  animation-delay: calc(var(--i, 0) * 0.05s);
}
@media (hover: hover) {
  .cg-card:hover {
    transform: translateY(-4rem);
    border-color: color-mix(in srgb, var(--color-accent) 45%, var(--color-glass-border-hover));
    box-shadow: 0 26rem 54rem -26rem color-mix(in srgb, var(--color-accent) 40%, transparent);
  }
  .cg-card:hover .cg-card__arrow { transform: translateX(3rem); opacity: 1; }
  .cg-card:hover .cg-card__dot { transform: scale(1.25); }
}
.cg-card__dot {
  width: 12rem; height: 12rem;
  border-radius: 999px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #8B7CF6, #2DD4BF);
  transition: transform 0.2s ease;
}
.cg-card__body { display: flex; flex-direction: column; gap: 5rem; min-width: 0; margin-right: auto; }
.cg-card__label { font-size: 17rem; font-weight: 700; letter-spacing: -0.02em; }
.cg-card__desc { font-size: 13rem; opacity: 0.6; line-height: 1.45; }
.cg-card__arrow { flex-shrink: 0; opacity: 0.4; transition: transform 0.2s ease, opacity 0.2s ease; color: var(--color-text); }
.cg-empty { font-size: 14rem; opacity: 0.55; }

@keyframes cg-rise {
  from { opacity: 0; transform: translateY(16rem); }
  to   { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .cg-head, .cg-card { animation: none; }
}
@media (max-width: 640px) {
  .cg-inner { padding: calc(100rem + var(--safe-top)) 16rem calc(48rem + var(--safe-bottom)); }
  .cg-grid { grid-template-columns: 1fr; }
}
</style>
