<script setup lang="ts">
import { BLOG_POSTS, type BlogPost } from '~/content/blogs'
import { composedToBlogPost, getPublishedComposedPosts } from '~/content/composed'
import type { ComposedPost } from '~/types/composed'

useSeoMeta({
  title: 'Elevate · The Entertrainer Blogs',
  description: 'Curious, evidence-led pieces about minds, machines, learning, and the everyday questions that become stranger when examined properly.',
  ogTitle: 'Elevate · The Entertrainer Blogs',
  ogDescription: 'Essays for the question you almost asked yourself.',
  ogUrl: 'https://entertrainer.in/elevate',
  ogImage: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/oLmjqBPjwBxcOjsd.jpg'
})

useHead({
  link: [{ rel: 'alternate', type: 'application/rss+xml', title: 'Elevate · The Entertrainer Blogs', href: 'https://entertrainer.in/elevate.xml' }]
})

const { data: liveComposed } = await useAsyncData('elevate-composed-listing', async () => {
  try {
    const res = await $fetch<{ posts: ComposedPost[] }>('/api/composed')
    return res.posts ?? []
  } catch {
    return getPublishedComposedPosts()
  }
})

const posts = computed<BlogPost[]>(() => {
  const seen = new Set(BLOG_POSTS.map((post) => post.slug))
  const extras = (liveComposed.value ?? [])
    .filter((post) => post.status === 'published' && !seen.has(post.slug))
    .map(composedToBlogPost)
  return [...BLOG_POSTS, ...extras]
})
</script>

<template>
  <main id="main" class="elevate">
    <EdStageHero
      class="elevate__stage"
      variant="flow"
      title="Elevate"
      title-id="elevate-title"
      deck="Articles about work, learning, technology, and the questions that stay with you."
    />

    <section class="elevate__entry" aria-labelledby="articles-title">
      <h2 id="articles-title" class="elevate__section-label">Articles</h2>
      <NuxtLink v-for="post in posts" :key="post.slug" :to="`/elevate/${post.slug}`" class="elevate__feature" :aria-labelledby="`article-${post.slug}`">
        <div class="elevate__feature-copy">
          <p class="elevate__meta">{{ post.category }} <span aria-hidden="true">·</span> {{ post.minutes }} min read</p>
          <h3 :id="`article-${post.slug}`">{{ post.title }}</h3>
          <p>{{ post.dek }}</p>
          <span class="elevate__read">Read</span>
        </div>
        <figure class="elevate__feature-image">
          <EdEditorialImage :src="post.hero" :alt="post.heroAlt" />
        </figure>
      </NuxtLink>
    </section>

    <EdNewsletter class="elevate__newsletter" />
  </main>
</template>

<style scoped>
/* Elevate: Elevate-DNA flow stage + magazine article shelf. */
.elevate { max-width: var(--shell-wide); margin: 0 auto; padding: clamp(22rem, 4vw, 56rem) var(--shell-gutter) 110rem; }
.elevate__stage { min-height: min(520rem, calc(100dvh - 160rem)); }
.elevate__stage :deep(h1) { font: 500 clamp(88rem, 18vw, 250rem)/.72 var(--font-display); letter-spacing: -.085em; }
.elevate__stage :deep(.stage__deck) { max-width: 400rem; font: 400 clamp(18rem, 2vw, 25rem)/1.35 var(--font-body); }
.elevate__section-label, .elevate__meta { margin: 0; font: 700 12rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.elevate__entry { padding: clamp(64rem, 10vw, 132rem) 0 0; }
.elevate__section-label { color: var(--signal-cobalt); margin-bottom: 18rem; }
.elevate__feature { display: grid; grid-template-columns: minmax(0, .92fr) minmax(360rem, 1.08fr); color: var(--ink); overflow: hidden; border-top: var(--stroke) solid var(--ink); border-bottom: var(--stroke) solid var(--ink); }
.elevate__feature + .elevate__feature { border-top: 0; }
.elevate__feature-copy { display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-end; padding: clamp(28rem, 5vw, 66rem); }
.elevate__meta { color: var(--ink-soft); }
.elevate h3 { max-width: 700rem; margin: 20rem 0; font: 500 clamp(39rem, 4.5vw, 70rem)/.95 var(--font-display); letter-spacing: -.05em; }
.elevate__feature-copy > p:not(.elevate__meta) { max-width: 480rem; margin: 0; font-size: 19rem; line-height: 1.5; }
.elevate__read { display: inline-flex; margin-top: 28rem; padding: 10rem 14rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-s); font-weight: 800; transition: transform var(--dur-fast) var(--ease-spring), background var(--dur-fast) var(--ease-out); }
.elevate__feature:hover .elevate__read { background: var(--signal-cobalt); transform: translateY(-2rem); }
.elevate__feature-image { min-height: 500rem; margin: 0; overflow: hidden; border-left: var(--stroke) solid var(--ink); }
.elevate__feature-image :deep(.ed-editorial-image) { width: 100%; height: 100%; object-fit: cover; transition: transform 600ms var(--ease-out); }
.elevate__feature:hover :deep(.ed-editorial-image) { transform: scale(1.025); }
.elevate__manifesto { display: grid; grid-template-columns: .31fr .69fr; gap: clamp(28rem, 8vw, 130rem); padding: clamp(72rem, 11vw, 144rem) 0; border-bottom: var(--stroke) solid var(--ink); }
.elevate__manifesto-copy { max-width: 760rem; margin: 0; font: 500 clamp(30rem, 4.5vw, 58rem)/1.02 var(--font-display); letter-spacing: -.045em; }
.elevate__newsletter { margin-top: clamp(55rem, 8vw, 104rem); }
@media (max-width: 740px) { .elevate { padding-top: 18rem; }.elevate__stage { min-height: 360rem; }.elevate__stage :deep(h1) { font-size: clamp(88rem, 25vw, 160rem); }.elevate__feature { grid-template-columns: 1fr; }.elevate__feature-image { min-height: 330rem; order: -1; border: 0; border-bottom: var(--stroke) solid var(--ink); }.elevate__feature-copy { padding: 30rem 0; }.elevate__manifesto { grid-template-columns: 1fr; gap: 18rem; } }
@media (prefers-reduced-motion: reduce) { .elevate__feature-image :deep(.ed-editorial-image), .elevate__read { transition: none; } }
</style>
