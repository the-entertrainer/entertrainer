<script setup lang="ts">
/**
 * Frame for dead-end pages: unwritten slug, error handoff.
 */
defineProps<{
  title?: string
  deck?: string
}>()
</script>

<template>
  <EdShell width="read">
    <header class="cs">
      <h1 class="cs__title">{{ title }}</h1>
      <p v-if="deck" class="cs__deck">{{ deck }}</p>
    </header>

    <div class="cs__body">
      <slot />
    </div>
  </EdShell>
</template>

<style scoped>
.cs {
  padding-bottom: var(--space-21);
  margin-bottom: var(--space-34);
  border-bottom: var(--stroke) solid var(--ink);
}
.cs__title { font-size: var(--type-h1); margin: 0; max-width: 22ch; }
.cs__deck {
  margin: var(--space-13) 0 0; max-width: var(--measure);
  font-family: var(--font-reading); font-size: var(--type-dek); line-height: 1.35; color: var(--ink);
}
</style>
