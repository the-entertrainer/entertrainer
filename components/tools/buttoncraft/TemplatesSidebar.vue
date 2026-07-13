<script setup lang="ts">
import { BUTTON_TEMPLATES } from '~/utils/buttonTemplates'
import ButtonPreview from './ButtonPreview.vue'

const store = useButtonCraftStore()

function apply(templateId: string) {
  store.loadTemplate(templateId)
}
</script>

<template>
  <aside class="bc-templates">
    <p class="glass-label bc-templates__label">Templates</p>
    <div class="bc-templates__grid">
      <button
        v-for="t in BUTTON_TEMPLATES"
        :key="t.id"
        type="button"
        class="bc-template-card"
        :class="{ 'bc-template-card--active': store.currentProject?.templateId === t.id }"
        @click="apply(t.id)"
      >
        <span class="bc-template-card__preview">
          <ButtonPreview :config="t.button" state="normal" />
        </span>
        <span class="bc-template-card__meta">
          <span class="bc-template-card__name">{{ t.name }}</span>
          <span class="bc-template-card__desc">{{ t.description }}</span>
        </span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.bc-templates {
  height: 100%;
  overflow-y: auto;
  padding: 18rem 14rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;
}
.bc-templates__label { padding: 0 6rem 10rem; }
.bc-templates__grid {
  display: flex;
  flex-direction: column;
  gap: 8rem;
}
.bc-template-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12rem;
  padding: 14rem;
  border-radius: 14rem;
  border: 1px solid var(--color-glass-border);
  background: color-mix(in srgb, var(--color-bg) 50%, transparent);
  text-align: left;
  transition: background 0.16s ease, border-color 0.16s ease;
  width: 100%;
}
@media (hover: hover) {
  .bc-template-card:hover { background: var(--color-glass-bg-hover); border-color: var(--color-glass-border-hover); }
}
.bc-template-card--active {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
}
.bc-template-card__preview {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14rem 0;
  pointer-events: none;
  transform: scale(0.82);
  transform-origin: center;
}
.bc-template-card__meta {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}
.bc-template-card__name {
  font-size: 13rem;
  font-weight: 600;
  color: var(--color-text);
}
.bc-template-card__desc {
  font-size: 11.5rem;
  line-height: 1.4;
  color: var(--color-text);
  opacity: 0.55;
}
</style>
