<script setup lang="ts">
import { BLOG_POSTS, FEATURED_BLOG } from '~/content/blogs'

useSeoMeta({
  title: 'The Entertrainer Blogs · Science, minds, and ordinary mysteries',
  description: 'Curious, evidence-led essays about minds, machines, learning, and the strange things ordinary life is quietly doing.',
  ogTitle: 'The Entertrainer Blogs',
  ogDescription: 'Science, minds, learning, and ordinary mysteries worth stopping for.',
  ogUrl: 'https://entertrainer.in/blogs'
})
</script>

<template>
  <main id="main" class="blogs-index">
    <section class="blogs-index__mast" aria-labelledby="blogs-title">
      <p class="blogs-index__kicker">The Entertrainer Blogs</p>
      <h1 id="blogs-title">Things that become stranger when you look at them properly.</h1>
      <p class="blogs-index__intro">Science, minds, learning, and the ordinary questions that refuse to remain ordinary. Written to be read slowly, but not seriously in the boring way.</p>
    </section>

    <section class="blogs-index__lead" aria-labelledby="featured-title">
      <NuxtLink :to="`/blogs/${FEATURED_BLOG.slug}`" class="blogs-index__feature">
        <div class="blogs-index__feature-copy">
          <p class="blogs-index__meta">{{ FEATURED_BLOG.category }} <span aria-hidden="true">·</span> {{ FEATURED_BLOG.minutes }} min read</p>
          <h2 id="featured-title">{{ FEATURED_BLOG.title }}</h2>
          <p>{{ FEATURED_BLOG.dek }}</p>
          <span class="blogs-index__read">Read the feature <span aria-hidden="true">→</span></span>
        </div>
        <figure class="blogs-index__feature-art">
          <EdEditorialImage :src="FEATURED_BLOG.hero" :alt="FEATURED_BLOG.heroAlt" />
        </figure>
      </NuxtLink>
    </section>

    <section class="blogs-index__archive" aria-labelledby="archive-title">
      <div class="blogs-index__archive-head">
        <p class="blogs-index__kicker">Issue one</p>
        <h2 id="archive-title">Start here.</h2>
      </div>
      <ol class="blogs-index__list">
        <li v-for="post in BLOG_POSTS" :key="post.slug">
          <NuxtLink :to="`/blogs/${post.slug}`">
            <span class="blogs-index__number">01</span>
            <span class="blogs-index__list-title">{{ post.title }}</span>
            <span class="blogs-index__list-meta">{{ post.category }} · {{ post.minutes }} min</span>
            <span class="blogs-index__arrow" aria-hidden="true">↗</span>
          </NuxtLink>
        </li>
      </ol>
    </section>

    <aside class="blogs-index__next" aria-label="Upcoming blogs">
      <p class="blogs-index__kicker">More is coming</p>
      <p>There are already too many questions on the table. That is a fairly good problem for a blog to have.</p>
    </aside>

    <EdNewsletter class="blogs-index__newsletter" />
  </main>
</template>

<style scoped>
/* The Entertrainer Blogs: warm yellow e-magazine identity, archival type scale, off-centre editorial pacing, restrained radii. */
.blogs-index { max-width: var(--shell-wide); margin: 0 auto; padding: clamp(34rem, 7vw, 96rem) var(--shell-gutter) 100rem; }
.blogs-index__mast { max-width: 920rem; padding-bottom: clamp(42rem, 7vw, 82rem); }
.blogs-index__kicker, .blogs-index__meta, .blogs-index__list-meta { font: 700 12rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.blogs-index__kicker { color: var(--signal-cobalt); margin-bottom: 18rem; }
.blogs-index h1, .blogs-index h2 { font-family: var(--font-display); letter-spacing: -.045em; font-weight: 500; }
.blogs-index h1 { max-width: 850rem; font-size: clamp(46rem, 7.4vw, 104rem); line-height: .94; margin: 0; text-wrap: balance; }
.blogs-index__intro { max-width: 620rem; margin: 26rem 0 0; font: 400 clamp(18rem, 2vw, 24rem)/1.45 var(--font-body); }
.blogs-index__lead { border-top: var(--stroke) solid var(--ink); border-bottom: var(--stroke) solid var(--ink); }
.blogs-index__feature { display: grid; grid-template-columns: minmax(0, .93fr) minmax(360rem, 1.07fr); min-height: 540rem; color: inherit; }
.blogs-index__feature-copy { display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-end; padding: clamp(28rem, 5vw, 68rem); }
.blogs-index__feature-copy h2 { margin: 18rem 0; max-width: 670rem; font-size: clamp(38rem, 4.4vw, 68rem); line-height: .98; }
.blogs-index__feature-copy > p:not(.blogs-index__meta) { max-width: 550rem; margin: 0; font-size: 19rem; line-height: 1.5; }
.blogs-index__read { display: inline-flex; margin-top: 30rem; padding: 10rem 14rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-s); font-weight: 700; transition: background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out); }
.blogs-index__feature:hover .blogs-index__read { background: var(--signal-cobalt); transform: translateY(-2rem); }
.blogs-index__feature-art { position: relative; margin: 0; overflow: hidden; background: var(--paper-2); border-left: var(--stroke) solid var(--ink); }
.blogs-index__feature-art :deep(.ed-editorial-image) { width: 100%; height: 100%; object-fit: cover; transition: transform 600ms var(--ease-out); }
.blogs-index__feature:hover :deep(.ed-editorial-image) { transform: scale(1.025); }
.blogs-index__archive { display: grid; grid-template-columns: .35fr .65fr; gap: clamp(30rem, 7vw, 110rem); padding: clamp(58rem, 9vw, 130rem) 0; }
.blogs-index__archive h2 { margin: 0; font-size: clamp(36rem, 5vw, 64rem); line-height: .95; }
.blogs-index__list { padding: 0; margin: 0; list-style: none; border-top: var(--stroke) solid var(--ink); }
.blogs-index__list a { display: grid; grid-template-columns: 48rem minmax(0, 1fr) auto 28rem; gap: 14rem; align-items: baseline; padding: 20rem 0; color: inherit; border-bottom: var(--stroke) solid var(--line); }
.blogs-index__list-title { font: 500 clamp(22rem, 2.4vw, 31rem)/1.05 var(--font-display); }
.blogs-index__number, .blogs-index__arrow { color: var(--signal-cobalt); font: 700 14rem/1 var(--font-mono); }
.blogs-index__arrow { text-align: right; }
.blogs-index__next { max-width: 570rem; padding: 26rem 0 0; border-top: var(--stroke) solid var(--ink); font-size: 20rem; line-height: 1.4; }
.blogs-index__next p:last-child { margin-bottom: 0; }
.blogs-index__newsletter { margin-top: clamp(52rem, 8vw, 104rem); }
@media (max-width: 760px) {
  .blogs-index { padding-top: 30rem; }
  .blogs-index__feature { grid-template-columns: 1fr; }
  .blogs-index__feature-copy { padding: 30rem 0; }
  .blogs-index__feature-art { min-height: 340rem; order: -1; border: 0; border-bottom: var(--stroke) solid var(--ink); }
  .blogs-index__archive { grid-template-columns: 1fr; gap: 28rem; }
  .blogs-index__list a { grid-template-columns: 34rem 1fr 24rem; }
  .blogs-index__list-meta { grid-column: 2; }
}
</style>
