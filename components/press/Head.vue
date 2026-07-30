<script setup lang="ts">
/**
 * The headline block every Press page opens its body with: eyebrow + folio
 * count on one hairline-ruled line, a display headline, a deck. Shared by
 * PressDeck and the ContentShell stub pages so the two only differ in what
 * comes after it.
 */
defineProps<{
  eyebrow?: string
  title: string
  deck?: string
  intro?: string
  meta?: string
}>()

const R = useReveal()
</script>

<template>
  <header class="phd">
    <div class="phd__top">
      <p v-if="eyebrow" class="press-label" v-motion :initial="R.rise(0).initial" :visible-once="R.rise(0).visibleOnce">{{ eyebrow }}</p>
      <p v-if="meta" class="press-label phd__meta" v-motion :initial="R.rise(0).initial" :visible-once="R.rise(0).visibleOnce">{{ meta }}</p>
    </div>
    <h1 class="press-h1" v-motion :initial="R.rise(90).initial" :visible-once="R.rise(90).visibleOnce">{{ title }}</h1>
    <p v-if="deck" class="phd__deck press-lead" v-motion :initial="R.rise(180).initial" :visible-once="R.rise(180).visibleOnce">{{ deck }}</p>
    <p v-if="intro" class="phd__intro" v-motion :initial="R.rise(250).initial" :visible-once="R.rise(250).visibleOnce">{{ intro }}</p>
    <slot />
  </header>
</template>

<style scoped>
.phd { max-width: var(--press-col); }
.phd__top { display: flex; align-items: baseline; justify-content: space-between; gap: 20px; padding-bottom: 12px; margin-bottom: 20px; border-bottom: 1px solid var(--press-rule); }
.phd__meta { color: var(--press-ink-42); }
.phd__deck { margin: 18px 0 0; max-width: 44ch; }
.phd__intro { margin: 16px 0 0; font-family: var(--press-serif); font-size: var(--press-body); line-height: 1.65; color: var(--press-ink-80); max-width: var(--press-measure); }
</style>
