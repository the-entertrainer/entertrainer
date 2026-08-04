<script setup lang="ts">
import { useContentStore } from '~/stores/content'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

const route        = useRoute()
const contentStore = useContentStore()
const slug         = route.params.slug as string

const item = computed(() =>
  contentStore.downloadsNav.find((n) => n.id === slug)
)

if (!item.value) throw createError({ statusCode: 404 })
</script>

<template>
  <UiToolShell v-if="item" eyebrow="Download" :title="item.label" :deck="item.description">
    <UiConstructionZone />
  </UiToolShell>
</template>
