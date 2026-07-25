<script setup lang="ts">
import type { NavItem } from '~/types/nav'

/**
 * A section landing page: masthead plus the numbered index of what's inside.
 * Used by /tools, /my-work and /downloads so those routes are real, crawlable
 * destinations rather than redirects back into the spiral.
 *
 * It used to render a grid of small identical glass cards which left two
 * entries floating in an otherwise empty viewport. The index rows fill the
 * measure, show the work, and read the same whether there are two entries or
 * twenty. The name is kept because several routes import it.
 */
const props = defineProps<{
  eyebrow?: string
  title: string
  deck?: string
  intro?: string
  items: NavItem[]
  /** Overrides the auto "N projects" counter in the masthead. */
  meta?: string
  empty?: string
}>()

const count = computed(() =>
  props.meta ?? (props.items.length
    ? `${String(props.items.length).padStart(2, '0')} ${props.items.length === 1 ? 'entry' : 'entries'}`
    : undefined))
</script>

<template>
  <div class="cg-page">
    <UiGlassBackdrop calm />

    <div class="cg-inner">
      <UiPageHead :eyebrow="eyebrow" :title="title" :deck="deck" :intro="intro" :meta="count" />
      <UiIndexList :items="items" :empty="empty" />
      <slot />
    </div>
  </div>
</template>

<style scoped>
.cg-page { position: fixed; inset: 0; overflow-y: auto; z-index: 1; }
.cg-inner {
  max-width: 1180rem;
  margin: 0 auto;
  padding: calc(var(--page-top) + 20rem) clamp(20rem, 5vw, 60rem) calc(90rem + var(--safe-bottom));
}
@media (max-width: 640px) {
  .cg-inner { padding: calc(var(--page-top)) 18rem calc(60rem + var(--safe-bottom)); }
}
</style>
