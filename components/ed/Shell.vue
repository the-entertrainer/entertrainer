<script setup lang="ts">
/**
 * The page frame.
 *
 * One gutter and one page box for every editorial route. The shell is 1180.
 * The content column inside it is 729 (1180 / φ). Reading measure is 66
 * characters, set by type, not by a second box.
 */
withDefaults(defineProps<{
  /** `wide` and `page` share the 1180 shell. `read` is the same shell; the column is 729. */
  width?: 'wide' | 'page' | 'read'
}>(), { width: 'page' })
</script>

<template>
  <div class="shell" :class="`shell--${width}`">
    <slot />
  </div>
</template>

<style scoped>
.shell {
  width: 100%;
  margin: 0 auto;
  padding: var(--space-34) var(--shell-gutter) var(--space-55);
}
.shell--wide,
.shell--page,
.shell--read { max-width: var(--shell-max); }
.shell--read { max-width: calc(var(--column) + (var(--shell-gutter) * 2)); }
</style>
