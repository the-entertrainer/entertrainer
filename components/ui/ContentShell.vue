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
    <UiPageOptics />
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
  max-width: var(--shell-max); margin: 0 auto;
  padding: calc(var(--page-top) + 20rem) var(--shell-gutter) calc(90rem + var(--safe-bottom));
}
@media (max-width: 640px) {
  .cs__inner { padding-top: var(--page-top); padding-bottom: calc(70rem + var(--safe-bottom)); }
}

/* A dead end is not a hero. The 404's title ran at the full 112px h1 ramp —
   three lines of display type apologising, louder than any real page on the
   site. It keeps the family and the frame, at the scale of a section head. */
.cs :deep(.ph__title) { font-size: var(--text-h2); max-width: 20ch; }
.cs :deep(.ph) { margin-bottom: clamp(28rem, 4vw, 48rem); }
</style>
