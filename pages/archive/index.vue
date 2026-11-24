<script setup lang="ts">
useSeoMeta({
  title: 'Archive · Entertrainer',
  description: 'Downloads kept off the main path, plus quiet links to the lab and the compose desk.',
  ogTitle: 'Archive',
  ogDescription: 'Templates, frameworks, and resources. Lab and Compose stay unlisted.',
  ogUrl: 'https://entertrainer.in/archive'
})
</script>

<template>
  <EdShell width="page">
    <header class="arch-head">
      <h1 class="t-display">Archive</h1>
      <p>Things that used to sit on the main path, and a couple of rooms that stay off the map.</p>
    </header>
    <ul>
      <li>
        <NuxtLink to="/archive/downloads">
          <h2>Downloads</h2>
          <p>Templates, frameworks, and resources.</p>
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/lab">
          <h2>Lab</h2>
          <p>Homepage experiments. Not indexed.</p>
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/compose">
          <h2>Compose</h2>
          <p>The writing desk. Not indexed.</p>
        </NuxtLink>
      </li>
    </ul>
  </EdShell>
</template>

<style scoped>
.arch-head { padding: var(--space-55) 0 var(--space-34); border-bottom: var(--stroke) solid var(--line); }
.arch-head h1 { margin: 0; font-size: var(--type-display); line-height: 0.95; }
.arch-head p { max-width: 48ch; margin: var(--space-13) 0 0; color: var(--muted); font-family: var(--font-reading); font-size: var(--type-body); }
ul { list-style: none; margin: 0; padding: 0; }
li { border-bottom: var(--stroke) solid var(--line); }
a { display: block; padding: var(--space-21) 0; color: var(--ink); }
h2 { margin: 0; font-size: var(--type-h2); }
p { margin: var(--space-8) 0 0; color: var(--muted); font-size: var(--type-body); }
li:nth-child(n + 2) h2 { font-size: var(--type-body); font-family: var(--font-ui); font-weight: 600; }
</style>
