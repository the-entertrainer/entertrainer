<script setup lang="ts">
import { useContentStore } from '~/stores/content'

useSeoMeta({
  title: 'Downloads · Archive · Entertrainer',
  description: 'Templates, frameworks, and resources.',
  ogTitle: 'Downloads',
  ogDescription: 'Ready-to-use templates, frameworks, and a short resource list.',
  ogUrl: 'https://entertrainer.in/archive/downloads'
})

const packs = useContentStore().downloadsNav
</script>

<template>
  <EdShell width="page">
    <header class="dl-head">
      <p class="t-mono"><NuxtLink to="/archive">Archive</NuxtLink></p>
      <h1 class="t-display">Downloads</h1>
    </header>
    <ul>
      <li v-for="pack in packs" :key="pack.id">
        <NuxtLink :to="pack.href">
          <p class="t-mono">{{ pack.meta }}</p>
          <h2>{{ pack.label }}</h2>
          <p>{{ pack.description }}</p>
        </NuxtLink>
      </li>
    </ul>
  </EdShell>
</template>

<style scoped>
.dl-head { padding: var(--space-55) 0 var(--space-34); border-bottom: var(--stroke) solid var(--line); }
.dl-head h1 { margin: var(--space-13) 0 0; font-size: var(--type-display); line-height: 0.95; }
.t-mono { margin: 0; color: var(--muted); }
ul { list-style: none; margin: 0; padding: 0; }
li { border-bottom: var(--stroke) solid var(--line); }
a { display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-8); padding: var(--space-34) 0; color: var(--ink); }
h2 { margin: 0; font-family: var(--font-ui); font-size: var(--type-h2); font-weight: 650; }
a p:last-child { margin: 0; color: var(--muted); font-size: var(--type-body); }
</style>
