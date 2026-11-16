<script setup lang="ts">
import type { Component } from 'vue'
import type { Lesson, Block } from '~/types/lesson'
import TextBlock from './blocks/TextBlock.vue'
import HeadingBlock from './blocks/HeadingBlock.vue'
import StatementBlock from './blocks/StatementBlock.vue'
import QuoteBlock from './blocks/QuoteBlock.vue'
import ImageBlock from './blocks/ImageBlock.vue'
import ProcessBlock from './blocks/ProcessBlock.vue'
import KnowledgeCheckBlock from './blocks/KnowledgeCheckBlock.vue'
import FlashcardsBlock from './blocks/FlashcardsBlock.vue'
import AccordionBlock from './blocks/AccordionBlock.vue'
import ReflectionBlock from './blocks/ReflectionBlock.vue'
import SourcesBlock from './blocks/SourcesBlock.vue'

const props = defineProps<{ lesson: Lesson; embedded?: boolean }>()
const completed = ref(new Set<string>())
const interactiveTypes = new Set(['knowledgeCheck', 'process', 'reflection', 'accordion', 'flashcards'])

const progress = computed(() => {
  const interactive = props.lesson.blocks.filter(block => interactiveTypes.has(block.type))
  if (!interactive.length) return 100
  return Math.round((completed.value.size / interactive.length) * 100)
})

function markComplete(id: string) {
  completed.value = new Set([...completed.value, id])
}

function blockComponent(block: Block): Component {
  const map: Record<Block['type'], Component> = {
    text: TextBlock,
    heading: HeadingBlock,
    statement: StatementBlock,
    quote: QuoteBlock,
    image: ImageBlock,
    process: ProcessBlock,
    knowledgeCheck: KnowledgeCheckBlock,
    flashcards: FlashcardsBlock,
    accordion: AccordionBlock,
    reflection: ReflectionBlock,
    sources: SourcesBlock,
  }
  return map[block.type]
}
</script>

<template>
  <div class="elearn">
    <header class="elearn__header">
      <NuxtLink v-if="!embedded" to="/elevate" class="elearn__back">← Elevate</NuxtLink>
      <span v-else class="elearn__back">Preview</span>
      <div class="elearn__progress">
        <div class="elearn__progress-bar" :style="{ width: progress + '%' }" />
        <span class="elearn__progress-label">{{ progress }}%</span>
      </div>
    </header>

    <div class="elearn__objective">
      <p class="elearn__objective-label">Learning objective</p>
      <p class="elearn__objective-text">{{ lesson.objective }}</p>
    </div>

    <h1 class="elearn__title">{{ lesson.title }}</h1>
    <p class="elearn__dek">{{ lesson.dek }}</p>
    <p class="elearn__meta">{{ lesson.category }} · {{ lesson.minutes }} min</p>

    <figure v-if="lesson.hero" class="elearn__hero">
      <EdEditorialImage :src="lesson.hero" :alt="lesson.heroAlt || ''" />
    </figure>

    <div class="elearn__blocks">
      <component
        :is="blockComponent(block)"
        v-for="block in lesson.blocks"
        :key="block.id"
        :block="block"
        @complete="markComplete(block.id)"
      />
    </div>

    <footer class="elearn__footer">
      <p v-if="progress === 100" class="elearn__done">Lesson complete. The map has edges.</p>
      <NuxtLink v-if="!embedded" to="/elevate" class="elearn__next">Back to Elevate</NuxtLink>
      <span v-else class="elearn__next">Back to Elevate</span>
    </footer>
  </div>
</template>

<style scoped>
.elearn {
  max-width: 42rem;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 4rem;
  font-family: var(--font-body);
  color: var(--ink);
  background: var(--paper);
}
.elearn__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
  background: color-mix(in srgb, var(--paper) 92%, transparent);
  backdrop-filter: blur(8px);
  padding: 0.75rem 0;
}
.elearn__back { font: 500 0.75rem/1 var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink); text-decoration: none; }
.elearn__progress { flex: 1; height: 0.375rem; background: var(--line); border-radius: 999px; position: relative; overflow: hidden; }
.elearn__progress-bar { height: 100%; background: var(--accent); transition: width 0.4s ease; }
.elearn__progress-label { position: absolute; right: 0; top: -1.25rem; font: 500 0.7rem/1 var(--font-mono); color: var(--ink-soft); }
.elearn__objective {
  background: color-mix(in srgb, var(--accent) 8%, var(--paper));
  border-left: 4px solid var(--accent);
  padding: 1rem 1.25rem;
  margin-bottom: 2rem;
  border-radius: 0 0.5rem 0.5rem 0;
}
.elearn__objective-label { margin: 0 0 0.25rem; font: 500 0.7rem/1 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink); }
.elearn__objective-text { margin: 0; font-weight: 500; }
.elearn__title { font: 500 2.25rem/1.05 var(--font-display); letter-spacing: -0.04em; margin: 0 0 0.75rem; }
.elearn__dek { font-size: 1.125rem; line-height: 1.4; margin: 0 0 0.5rem; color: var(--ink-soft); }
.elearn__meta { font: 500 0.75rem/1 var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink); margin: 0 0 1.5rem; }
.elearn__hero { margin: 0 0 2.5rem; }
.elearn__hero :deep(.ed-editorial-image) { width: 100%; border: 1px solid var(--ink); border-radius: 0.5rem; }
.elearn__blocks { display: flex; flex-direction: column; gap: 2.25rem; }
.elearn__footer { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--line); text-align: center; }
.elearn__done { font-weight: 500; color: var(--ink); margin-bottom: 1rem; }
.elearn__next { display: inline-block; padding: 0.75rem 1.5rem; border: 1px solid var(--ink); border-radius: 999px; text-decoration: none; color: var(--ink); font-weight: 500; }
.elearn__next:hover { background: var(--accent); color: var(--accent-ink); }
</style>
