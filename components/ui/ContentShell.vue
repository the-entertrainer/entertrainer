<script setup lang="ts">
/**
 * The generic page frame for every route that isn't a tool app: placeholder
 * stubs (an about/my-work/downloads slug nobody has written yet) and the
 * site's own error page. It used to share `UiToolShell` with the three real
 * tool apps (EasyMCQ, Cadence, Draftly), which meant giving these pages the
 * site's current type and glass language would have reskinned those tools'
 * headers too. This is the same shell rebuilt on `UiPageHead`, so a dead-end
 * page reads as the same site as everywhere else while the tool apps stay
 * exactly as they are.
 */
defineProps<{
  eyebrow?: string
  title?: string
  deck?: string
}>()
</script>

<template>
  <div class="cs">
    <UiGlassBackdrop calm />
    <div class="cs__inner">
      <UiPageHead :eyebrow="eyebrow" :title="title || ''" :deck="deck" />
      <div class="cs__body">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.cs { position: relative; z-index: 1; min-height: 100dvh; overflow-x: clip; }
.cs__inner {
  position: relative; z-index: 1;
  max-width: 760rem; margin: 0 auto;
  padding: calc(var(--page-top) + 10rem) 24rem calc(90rem + var(--safe-bottom));
}
@media (max-width: 600px) {
  .cs__inner { padding: calc(var(--page-top)) 16rem calc(70rem + var(--safe-bottom)); }
}
</style>
