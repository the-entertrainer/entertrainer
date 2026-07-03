<script setup lang="ts">
import { useContentStore } from '~/stores/content'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

const route        = useRoute()
const contentStore = useContentStore()
const slug         = route.params.slug as string

const item = computed(() =>
  contentStore.myWorkNav.find((n) => {
    const hrefSlug = n.href?.replace(/^\/my-work\//, '')
    return n.id === slug || hrefSlug === slug
  })
)

if (!item.value) throw createError({ statusCode: 404 })
</script>

<template>
  <UiToolShell v-if="item" eyebrow="My Work" :title="item.label" :deck="item.description">
    <UiConstructionZone />
  </UiToolShell>
</template>
