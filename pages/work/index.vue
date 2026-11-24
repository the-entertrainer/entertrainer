<script setup lang="ts">
import { useContentStore } from '~/stores/content'

useSeoMeta({
  title: 'Work · Entertrainer',
  description: 'Selected projects: The SEWA Chronicles and Strong.',
  ogTitle: 'Work',
  ogDescription: 'The SEWA Chronicles, and a short module on how passwords actually break.',
  ogUrl: 'https://entertrainer.in/work'
})

const projects = useContentStore().workNav
</script>

<template>
  <EdShell width="page">
    <header class="work-head">
      <h1 class="t-display">Work</h1>
      <p>Two projects, taken apart enough to show the working.</p>
    </header>
    <ol>
      <li v-for="project in projects" :key="project.id">
        <NuxtLink :to="project.href">
          <p class="t-mono">{{ project.meta }}</p>
          <h2 class="t-display">{{ project.label }}</h2>
          <p>{{ project.description }}</p>
        </NuxtLink>
      </li>
    </ol>
  </EdShell>
</template>

<style scoped>
.work-head { padding: var(--space-55) 0 var(--space-34); border-bottom: var(--stroke) solid var(--line); }
.work-head h1 { margin: 0; font-size: var(--type-display); line-height: 0.95; }
.work-head p { max-width: 46ch; margin: var(--space-13) 0 0; color: var(--muted); font-family: var(--font-reading); font-size: var(--type-body); }
ol { list-style: none; margin: 0; padding: 0; }
li { border-bottom: var(--stroke) solid var(--line); }
a { display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-13); padding: var(--space-34) 0; color: var(--ink); }
h2 { margin: 0; font-size: var(--type-h2); line-height: 1; }
a p:last-child { max-width: 52ch; margin: 0; color: var(--muted); font-family: var(--font-reading); font-size: var(--type-body); line-height: 1.55; }
.t-mono { margin: 0; color: var(--muted); }
</style>
