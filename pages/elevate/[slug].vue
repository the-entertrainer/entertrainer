<script setup lang="ts">
import type { ComposedPost } from '~/types/composed'
import { getPublishedComposedPost } from '~/content/composed'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const { data, error } = await useAsyncData(
  () => `composed-elevate-${slug.value}`,
  async () => {
    // Prefer live store (picks up local publishes); fall back to committed JSON.
    try {
      const res = await $fetch<{ post: ComposedPost }>(`/api/composed/${slug.value}`)
      return res.post
    } catch {
      return getPublishedComposedPost(slug.value) ?? null
    }
  },
  { watch: [slug] }
)

if (error.value || !data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found' })
}

const post = computed(() => data.value as ComposedPost)

useSeoMeta({
  title: () => `${post.value.title} · The Entertrainer Blogs`,
  description: () => post.value.dek,
  ogTitle: () => post.value.title,
  ogDescription: () => post.value.dek,
  ogUrl: () => `https://entertrainer.in/elevate/${post.value.slug}`,
  ogImage: () => post.value.hero ? `https://entertrainer.in${post.value.hero}` : undefined,
  twitterCard: 'summary_large_image',
  twitterTitle: () => post.value.title,
  twitterDescription: () => post.value.dek,
  twitterImage: () => post.value.hero ? `https://entertrainer.in${post.value.hero}` : undefined
})
</script>

<template>
  <EdComposedArticle :post="post" />
</template>
