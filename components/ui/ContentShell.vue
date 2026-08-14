<script setup lang="ts">
/**
 * The frame for pages that are a dead end: an unwritten slug, and the site's
 * own error page. A dead end is not a hero — it keeps the publication's frame
 * and type at the scale of a section head, and its whole job is to hand you
 * somewhere real to go next.
 */
defineProps<{
  eyebrow?: string
  title?: string
  deck?: string
}>()
</script>

<template>
  <EdShell width="read">
    <header class="cs">
      <p v-if="eyebrow" class="t-mono cs__eyebrow">{{ eyebrow }}</p>
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
  border-bottom: var(--stroke) solid var(--ink);
}
.cs__eyebrow { margin: 0 0 12rem; color: var(--muted); }
.cs__title { font-size: var(--type-h2); margin: 0; max-width: 22ch; }
.cs__deck {
  margin: 14rem 0 0; max-width: 52ch;
  font-family: var(--font-reading); font-size: 17rem; line-height: 1.6; color: var(--muted);
}
</style>
