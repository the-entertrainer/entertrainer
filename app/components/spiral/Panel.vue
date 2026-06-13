<script setup lang="ts">
import type { SectionContent } from '~/content/site'

defineProps<{
  section: SectionContent
  index: number
  compact?: boolean
}>()
</script>

<template>
  <section
    :id="section.id"
    class="panel"
    :class="{ 'is-compact': compact }"
    :aria-labelledby="`${section.id}-title`"
  >
    <PanelChrome :accent="section.accent" :tab="section.tab" :index="index" :compact="compact">
      <p v-if="section.eyebrow" class="panel__eyebrow eyebrow">{{ section.eyebrow }}</p>
      <h2 :id="`${section.id}-title`" class="panel__title">{{ section.title }}</h2>
      <p v-if="section.body" class="panel__body">{{ section.body }}</p>

      <ul v-if="section.items?.length" class="panel__items">
        <li v-for="(item, i) in section.items.slice(0, compact ? 2 : 4)" :key="i" class="panel__item">
          <span class="panel__bullet" />
          <span>{{ item.title || item.name || item.role || item.fact || item.quote || '' }}</span>
        </li>
      </ul>

      <span v-if="!compact" class="panel__wip chip">Work in progress</span>
    </PanelChrome>
  </section>
</template>

<style scoped>
.panel { display: block; width: 100%; height: 100%; }

.panel.is-compact {
  --compact-scale: 0.82;
}

.panel__eyebrow { margin-bottom: 4px; display: block; font-size: 0.62rem; }

.panel__title {
  font-family: var(--font-display);
  font-size: clamp(0.95rem, 2.1vw, 1.35rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.05;
  margin-bottom: 4px;
}

.panel.is-compact .panel__title {
  font-size: 0.82rem;
  margin-bottom: 2px;
}

.panel__body {
  font-size: 0.72rem;
  line-height: 1.4;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.panel.is-compact .panel__body {
  font-size: 0.62rem;
  margin-bottom: 4px;
}

.panel__items { display: flex; flex-direction: column; gap: 3px; margin-bottom: 6px; }
.panel.is-compact .panel__items { gap: 2px; margin-bottom: 4px; }

.panel__item {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 0.68rem;
  color: var(--text);
}

.panel.is-compact .panel__item {
  font-size: 0.58rem;
  gap: 3px;
}

.panel__bullet {
  margin-top: 4px;
  width: 4px; height: 4px;
  border-radius: 50%;
  background: var(--c, var(--neon-cyan));
  flex-shrink: 0;
}
</style>
