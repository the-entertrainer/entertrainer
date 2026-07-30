<script setup lang="ts">
// Drop-in replacement for the old "Content coming soon" stub: a bit of
// self-aware copy, a fake live status feed, and a tiny game — used both
// inline (on pages that exist but aren't written yet) and full-page (the
// site's 404). Keeps people around instead of bouncing off a dead end.
//
// `isErrorPage` switches the "back home" action from a plain NuxtLink to
// Nuxt's clearError() — required to properly exit error.vue's error state
// rather than just changing the URL underneath it.
const props = withDefaults(defineProps<{ compact?: boolean; isErrorPage?: boolean; note?: string }>(), {
  compact: false,
  isErrorPage: false,
  note: "This part of the site isn't built yet. It will be, eventually — probably right after the next status update below."
})

function goHome() {
  if (props.isErrorPage) clearError({ redirect: '/' })
  else navigateTo('/')
}
</script>

<template>
  <div class="czone" :class="{ 'czone--compact': compact }">
    <p class="czone__note">{{ note }}</p>
    <UiNaveenStatus />
    <UiConstructionGame :autofocus="isErrorPage" />
    <button type="button" class="press-btn czone__home" @click="goHome">Back to the front page</button>
  </div>
</template>

<style scoped>
.czone {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.czone__note {
  font-family: var(--press-serif);
  font-size: var(--press-body);
  line-height: 1.55;
  color: var(--press-ink-80);
  max-width: 60ch;
}
.czone__home {
  align-self: flex-start;
}
.czone--compact .czone__note { font-size: var(--press-small); }
</style>
