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
  padding-bottom: clamp(20rem, 3vw, 30rem);
  margin-bottom: clamp(24rem, 4vw, 40rem);
  border-bottom: var(--stroke) solid var(--line);
}
.cs__title { font-size: var(--type-h2); margin: 0; max-width: 22ch; }
.cs__deck {
  margin: 14rem 0 0; max-width: 52ch;
  font-family: var(--font-reading); font-size: 17rem; line-height: 1.6; color: var(--muted);
}
</style>
