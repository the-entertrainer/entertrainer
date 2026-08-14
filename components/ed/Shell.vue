<script setup lang="ts">
/**
 * The page frame.
 *
 * One gutter and one page box for every editorial route, so the left edge does
 * not move as you navigate — the fault the old site had five different answers
 * to. The measure *inside* the frame still varies with intent (a case study
 * wants a narrower column than a section index); that is the job of the type,
 * not of the box.
 */
withDefaults(defineProps<{
  /** `wide` is the story field, `read` is a narrow reading measure. */
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
  padding: clamp(24rem, 4vw, 44rem) var(--shell-gutter) clamp(48rem, 8vh, 88rem);
}
.shell--wide { max-width: var(--shell-wide); }
.shell--page { max-width: var(--shell-max); }
.shell--read { max-width: 880rem; }
</style>
