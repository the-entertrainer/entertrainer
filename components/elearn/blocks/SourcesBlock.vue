<script setup lang="ts">
defineProps<{ block: { items: { id: number; title: string; source: string; href: string }[] } }>()
</script>
<template>
  <section class="elearn-sources">
    <h2>Sources</h2>
    <ol>
      <li v-for="item in block.items" :key="item.id">
        <a :href="item.href" target="_blank" rel="noreferrer">
          [{{ item.id }}] {{ item.title }}
          <em>{{ item.source }}</em>
        </a>
      </li>
    </ol>
  </section>
</template>
<style scoped>
.elearn-sources { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--ink); }
.elearn-sources h2 { font: 500 1.5rem/1 var(--font-display); margin: 0 0 1rem; }
.elearn-sources ol { padding: 0; list-style: none; }
.elearn-sources li { padding: 0.5rem 0; border-top: 1px solid var(--line); }
.elearn-sources a { color: inherit; text-decoration: none; }
.elearn-sources em { display: block; color: var(--ink-soft); font-style: normal; font-size: 0.875rem; }
</style>
