<script setup lang="ts">
/**
 * The generic page frame for every route that isn't a tool app: placeholder
 * stubs (an about/my-work/downloads slug nobody has written yet) and the
 * site's own error page. Same Press masthead and footer as every other page,
 * so a dead end still reads as the same publication rather than a different
 * website underneath it.
 */
defineProps<{
  eyebrow?: string
  title?: string
  deck?: string
}>()
</script>

<template>
  <div class="press-page cs">
    <PressMast :section="title || 'Not found'" />
    <div class="cs__inner">
      <PressHead :eyebrow="eyebrow" :title="title || ''" :deck="deck" />
      <div class="cs__body">
        <slot />
      </div>
    </div>
    <PressFoot />
  </div>
</template>

<style scoped>
.cs { display: flex; flex-direction: column; }
.cs__inner { flex: 1 1 auto; max-width: 780px; margin: 0 auto; width: 100%; padding: clamp(48px, 7vw, 84px) var(--press-edge) clamp(64px, 8vw, 96px); }
.cs__body { margin-top: clamp(28px, 4vw, 40px); }
.cs__body :deep(.glass-btn) {
  background: transparent;
  color: var(--press-ink);
  border: 1px solid var(--press-ink);
  border-radius: 0;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  font-family: var(--press-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.cs__body :deep(.glass-btn:hover) { background: var(--press-ink); color: var(--press-paper); transform: none; }
</style>
