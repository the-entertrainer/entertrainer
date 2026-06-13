<script setup lang="ts">
import type { SectionContent } from '~/content/site'

defineProps<{
  section: SectionContent
  index: number
}>()
</script>

<!--
  Generic placeholder panel (Milestone A). In Milestone B each `kind` gets a
  dedicated rich component (PanelHero, PanelAbout, …). The semantic <section>
  wrapper ensures SSR + screen readers see real content in document order.
-->
<template>
  <section
    :id="section.id"
    class="panel"
    :aria-labelledby="`${section.id}-title`"
  >
    <PanelChrome :accent="section.accent" :tab="section.tab" :index="index">
      <p v-if="section.eyebrow" class="panel__eyebrow eyebrow">{{ section.eyebrow }}</p>
      <h2 :id="`${section.id}-title`" class="panel__title">{{ section.title }}</h2>
      <p v-if="section.body" class="panel__body">{{ section.body }}</p>

      <!-- Lightweight preview of structured items -->
      <ul v-if="section.items?.length" class="panel__items">
        <li v-for="(item, i) in section.items.slice(0, 4)" :key="i" class="panel__item">
          <span class="panel__bullet" />
          <span>{{
            item.title || item.name || item.role || item.fact || item.quote || ''
          }}</span>
        </li>
      </ul>

      <span class="panel__wip chip">Work in progress</span>
    </PanelChrome>
  </section>
</template>

<style scoped>
.panel { display: block; width: 100%; height: 100%; }

.panel__eyebrow { margin-bottom: var(--sz-3); display: block; }

.panel__title {
  font-family: var(--font-display);
  font-size: clamp(1.1rem, 2.4vw, 1.6rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-bottom: var(--sz-3);
}

.panel__body {
  font-size: 0.86rem;
  line-height: 1.55;
  color: var(--text-muted);
  margin-bottom: var(--sz-4);
}

.panel__items { display: flex; flex-direction: column; gap: var(--sz-2); margin-bottom: var(--sz-4); }
.panel__item {
  display: flex;
  align-items: flex-start;
  gap: var(--sz-2);
  font-size: 0.82rem;
  color: var(--text);
}
.panel__bullet {
  margin-top: 6px;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--c, var(--neon-cyan));
  flex-shrink: 0;
}
</style>
