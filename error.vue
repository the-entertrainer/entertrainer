<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'

// Nuxt's app-wide error page — replaces app.vue entirely whenever a route
// doesn't resolve (404) or a page throws. Every unbuilt/unmatched link on
// the site lands here instead of a bare browser error screen. app.vue's
// onMounted (theme init) never runs for this route, so sync it ourselves —
// otherwise the animated backdrop can pick colours for the wrong theme.
const props = defineProps<{ error: { statusCode?: number; statusMessage?: string; message?: string } }>()

onMounted(() => useThemeStore().init())

const isNotFound = computed(() => props.error?.statusCode === 404)
const title = computed(() => isNotFound.value ? "This page hasn't been built yet." : 'Something went sideways.')
const deck = computed(() => isNotFound.value
  ? "You found a corner of the site that doesn't exist — or doesn't exist *yet*. Either way, here's something to do about it."
  : "That wasn't supposed to happen. It's been quietly noted (by nobody, this is a static site) — try heading back."
)

useHead({ title: isNotFound.value ? 'Page not found — Entertrainer' : 'Error — Entertrainer' })
</script>

<template>
  <div>
    <UiToolShell :eyebrow="`Error ${error?.statusCode ?? ''}`" :title="title" :deck="deck">
      <UiConstructionZone is-error-page />
    </UiToolShell>
  </div>
</template>
