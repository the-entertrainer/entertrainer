<script setup lang="ts">
import { WEB_NOT_NET_BLOG as post } from '~/content/blogs'
import article from '~/content/articles/web-not-net.json'
const url = `https://entertrainer.in/elevate/${post.slug}`
useSeoMeta({
  title: `${post.title} · The Entertrainer Blogs`, description: post.dek,
  ogTitle: post.title, ogDescription: post.dek, ogUrl: url, ogType: 'article',
  ogImage: `https://entertrainer.in${post.hero}`, ogImageAlt: post.heroAlt,
  twitterCard: 'summary_large_image', twitterTitle: post.title,
  twitterDescription: post.dek, twitterImage: `https://entertrainer.in${post.hero}`
})
useHead({ link: [{ rel: 'canonical', href: url }] })
// Keep article text escaped while turning checked reference markers into links.
function parts(text: string) {
  return text.split(/(\[\d+\])/g).filter(Boolean).map(text => {
    const match = /^\[(\d+)\]$/.exec(text)
    const reference = match ? article.references.find(ref => ref.id === Number(match[1])) : undefined
    return { text, reference }
  })
}
</script>

<template>
  <main id="main" class="webnet">
    <header class="webnet__head">
      <NuxtLink to="/elevate" class="webnet__back">The Entertrainer Blogs</NuxtLink>
      <p class="webnet__meta">{{ post.category }} · {{ post.minutes }} min read</p>
      <h1>{{ post.title }}</h1>
      <p class="webnet__dek">{{ post.dek }}</p>
    </header>
    <figure class="webnet__hero">
      <EdEditorialImage :src="post.hero" :alt="post.heroAlt" />
      <figcaption>Different application protocols can use the same network. The lines show logical paths, not separate cables.</figcaption>
    </figure>
    <article class="webnet__article">
      <aside class="webnet__margin-note" aria-label="Video inspiration">
        <p>The starting point</p>
        <p><a href="https://www.youtube.com/watch?v=scWj1BMRHUA" target="_blank" rel="noopener noreferrer">Watch Vsauce: The Web Is Not The Net</a></p>
        <p>An independently sourced essay inspired by the video's central distinction.</p>
      </aside>
      <div class="webnet__prose">
        <template v-for="(block, index) in article.blocks" :key="index">
          <h2 v-if="block.type === 'heading'">{{ block.text }}</h2>
          <p v-else :class="{ 'webnet__lead': block.type === 'lead', 'webnet__closing': block.type === 'closing' }">
            <template v-for="(part, i) in parts(block.text)" :key="i"><a v-if="part.reference" :href="part.reference.href" :aria-label="`Reference ${part.reference.id}: ${part.reference.title}`">{{ part.text }}</a><template v-else>{{ part.text }}</template></template>
          </p>
        </template>
      </div>
    </article>
    <section class="webnet__sources" aria-labelledby="sources-title">
      <p class="webnet__meta">References</p>
      <h2 id="sources-title">Sources used in this article</h2>
      <ol><li v-for="reference in article.references" :id="`ref-${reference.id}`" :key="reference.id"><a :href="reference.href" target="_blank" rel="noopener noreferrer"><span>[{{ reference.id }}]</span> {{ reference.title }} <em>{{ reference.source }}</em></a></li></ol>
    </section>
    <div class="webnet__newsletter-wrap"><EdNewsletter /></div>
  </main>
</template>

<style scoped>
.webnet { padding-bottom: 112rem; }
.webnet__head { max-width: var(--shell-wide); margin: 0 auto; padding: clamp(26rem, 5vw, 64rem) var(--shell-gutter) clamp(36rem, 6vw, 76rem); }
.webnet__back, .webnet__meta { font: 700 12rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.webnet__back { color: var(--ink); }
.webnet__meta { margin: clamp(46rem, 8vw, 104rem) 0 16rem; color: var(--signal-cobalt); }
.webnet h1, .webnet h2 { font-family: var(--font-display); font-weight: 500; letter-spacing: -.05em; }
.webnet h1 { max-width: 1080rem; margin: 0; font-size: clamp(48rem, 8vw, 122rem); line-height: .91; text-wrap: balance; }
.webnet__dek { max-width: 700rem; margin: 30rem 0 0; font: 400 clamp(19rem, 2.25vw, 27rem)/1.4 var(--font-body); }
.webnet__hero { max-width: 1400rem; margin: 0 auto; padding: 0 var(--shell-gutter); }
.webnet__hero :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: 16 / 8.5; object-fit: contain; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); overflow: hidden; background: var(--signal-field); }
.webnet figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.webnet__article { max-width: 1100rem; margin: clamp(44rem, 8vw, 112rem) auto 0; padding: 0 var(--shell-gutter); display: grid; grid-template-columns: 190rem minmax(0, 690rem); justify-content: space-between; gap: clamp(28rem, 6vw, 100rem); }
.webnet__margin-note { align-self: start; position: sticky; top: 106rem; padding: 16rem; background: var(--signal-field); border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); font: 400 14rem/1.45 var(--font-body); }
.webnet__margin-note p { margin: 0; }
.webnet__margin-note p + p { margin-top: 10rem; }
.webnet__margin-note p:first-child { font: 700 11rem/1.2 var(--font-mono); letter-spacing: .07em; text-transform: uppercase; }
.webnet__prose { font: 400 clamp(18rem, 1.9vw, 21rem)/1.62 var(--font-body); }
.webnet__prose p { margin: 0 0 24rem; }
.webnet__prose .webnet__lead::first-letter { float: left; margin: 2rem 11rem 0 0; font: 500 5.1em/.72 var(--font-display); color: var(--signal-cobalt); }
.webnet__prose a { color: inherit; text-decoration: underline; text-decoration-color: var(--signal-cobalt); text-decoration-thickness: 2px; text-underline-offset: 3px; }
.webnet__prose h2 { margin: 68rem 0 20rem; font-size: clamp(34rem, 4vw, 53rem); line-height: .98; }
.webnet blockquote { margin: 45rem 0; padding: 24rem 26rem; border-left: 8rem solid var(--signal-cobalt); background: var(--paper-2); border-radius: 0 var(--radius-m) var(--radius-m) 0; font: 500 clamp(25rem, 3vw, 37rem)/1.06 var(--font-display); letter-spacing: -.035em; }
.webnet blockquote p { margin: 0; }
.webnet__visual { position: relative; margin: 48rem 0 58rem; }
.webnet__visual :deep(.ed-editorial-image) { display: block; overflow: hidden; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper-2); }
.webnet__visual :deep(img) { width: 100%; height: auto; object-fit: contain; }
.webnet__visual--wide :deep(.ed-editorial-image) { aspect-ratio: 16 / 9; }
.webnet__types { display: grid; grid-template-columns: 1fr 1fr; gap: 12rem; margin: 36rem 0 52rem; }
.webnet__type { padding: 16rem 16rem 18rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper-2); }
.webnet__type strong { display: block; font: 700 12rem/1.2 var(--font-mono); letter-spacing: .06em; text-transform: uppercase; color: var(--signal-cobalt); }
.webnet__type span { display: block; margin: 8rem 0 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.webnet__type p { margin: 0 !important; font-size: 15rem; line-height: 1.45; }
.webnet__diagram { margin: 48rem 0 58rem; padding: 12rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper-2); }
.webnet__diagram svg { display: block; width: 100%; height: auto; }
.webnet__closing { margin-top: 38rem !important; padding-top: 28rem; border-top: var(--stroke) solid var(--ink); font: 500 clamp(26rem, 3vw, 40rem)/1.08 var(--font-display); letter-spacing: -.04em; }
.webnet__sources { max-width: 1100rem; margin: clamp(64rem, 10vw, 130rem) auto 0; padding: 34rem var(--shell-gutter) 0; border-top: var(--stroke) solid var(--ink); }
.webnet__sources h2 { margin: 12rem 0 30rem; font-size: clamp(33rem, 4vw, 48rem); line-height: .95; }
.webnet__sources ol { max-width: 760rem; padding: 0; list-style: none; }
.webnet__sources li { padding: 16rem 0; border-top: var(--stroke) solid var(--line); font-size: 15rem; line-height: 1.45; }
.webnet__sources a { color: inherit; }
.webnet__sources span { color: var(--signal-cobalt); font-family: var(--font-mono); }
.webnet__sources em { color: var(--ink-soft); }
.webnet__newsletter-wrap { max-width: 1100rem; margin: clamp(54rem, 8vw, 100rem) auto 0; padding: 0 var(--shell-gutter); }
@media (max-width: 760px) {
  .webnet__hero { padding: 0; }
  .webnet__hero :deep(.ed-editorial-image) { border-left: 0; border-right: 0; border-radius: 0; aspect-ratio: 16 / 8.5; }
  .webnet__hero figcaption { padding: 0 var(--shell-gutter); }
  .webnet__article { display: block; }
  .webnet__margin-note { position: static; margin-bottom: 36rem; }
  .webnet__prose h2 { margin-top: 52rem; }
  .webnet__types { grid-template-columns: 1fr; }
}
</style>
