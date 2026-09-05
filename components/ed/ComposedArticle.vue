<script setup lang="ts">
import type { ComposedPost } from '~/types/composed'

defineProps<{
  post: ComposedPost
}>()
</script>

<template>
  <main id="main" class="ca">
    <header class="ca__head">
      <NuxtLink to="/elevate" class="ca__back">The Entertrainer Blogs</NuxtLink>
      <p class="ca__meta">{{ post.category }} <span aria-hidden="true">·</span> {{ post.minutes }} min read</p>
      <h1>{{ post.title }}</h1>
      <p class="ca__dek">{{ post.dek }}</p>
    </header>

    <figure v-if="post.hero" class="ca__hero">
      <EdEditorialImage :src="post.hero" :alt="post.heroAlt || post.title" />
    </figure>

    <article class="ca__article">
      <aside v-if="post.marginNote?.body" class="ca__margin-note" aria-label="Reading note">
        <p>{{ post.marginNote.label || 'One useful idea.' }}</p>
        <p class="ca__margin-body">{{ post.marginNote.body }}</p>
      </aside>

      <div class="ca__prose">
        <template v-for="block in post.blocks" :key="block.id">
          <p v-if="block.type === 'lead'" class="ca__lead">{{ block.text }}</p>

          <p v-else-if="block.type === 'paragraph'">{{ block.text }}</p>

          <h2 v-else-if="block.type === 'heading'">{{ block.text }}</h2>

          <blockquote v-else-if="block.type === 'blockquote'">
            <p>{{ block.text }}</p>
          </blockquote>

          <aside v-else-if="block.type === 'callout'" class="ca__callout" :aria-label="block.label || 'Note'">
            <p v-if="block.label" class="ca__callout-label">{{ block.label }}</p>
            <p>{{ block.text }}</p>
          </aside>

          <figure v-else-if="block.type === 'figure'" class="ca__figure">
            <EdEditorialImage v-if="block.src" :src="block.src" :alt="block.alt || ''" />
            <figcaption v-if="block.caption">{{ block.caption }}</figcaption>
          </figure>

          <ul v-else-if="block.type === 'list'" class="ca__list">
            <li v-for="(item, i) in (block.items || [])" :key="i">{{ item }}</li>
          </ul>

          <p v-else-if="block.type === 'closing'" class="ca__closing">{{ block.text }}</p>
        </template>
      </div>
    </article>

    <section v-if="post.references?.length" class="ca__sources" aria-labelledby="ca-sources-title">
      <p class="ca__meta">References</p>
      <h2 id="ca-sources-title">Sources used in this article</h2>
      <ol>
        <li v-for="reference in post.references" :id="`ref-${reference.id}`" :key="reference.id">
          <a :href="reference.href" target="_blank" rel="noreferrer">
            <span>[{{ reference.id }}]</span> {{ reference.title }} <em>{{ reference.source }}</em>
          </a>
        </li>
      </ol>
    </section>

    <div class="ca__newsletter-wrap"><EdNewsletter /></div>
  </main>
</template>

<style scoped>
/* Shared Elevate article rhythm — mirrors mid/moonly hand-authored posts. */
.ca { padding-bottom: 112rem; }
.ca__head { max-width: var(--shell-wide); margin: 0 auto; padding: clamp(26rem, 5vw, 64rem) var(--shell-gutter) clamp(28rem, 5vw, 56rem); }
.ca__back, .ca__meta { font: 700 12rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.ca__back { color: var(--ink); }
.ca__meta { margin: clamp(46rem, 8vw, 104rem) 0 16rem; color: var(--signal-cobalt); }
.ca h1, .ca h2 { font-family: var(--font-display); font-weight: 500; letter-spacing: -.05em; }
.ca h1 { max-width: 1080rem; margin: 0; font-size: clamp(40rem, 6.6vw, 100rem); line-height: .95; text-wrap: balance; }
.ca__dek { max-width: 700rem; margin: 30rem 0 0; font: 400 clamp(19rem, 2.25vw, 27rem)/1.4 var(--font-body); }
.ca__hero { max-width: 1400rem; margin: 0 auto; padding: 0 var(--shell-gutter); }
.ca__hero :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: 16 / 8.5; object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); overflow: hidden; background: var(--signal-field); }
.ca figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.ca__article { max-width: 1100rem; margin: clamp(36rem, 6vw, 76rem) auto 0; padding: 0 var(--shell-gutter); display: grid; grid-template-columns: 190rem minmax(0, 690rem); justify-content: space-between; gap: clamp(28rem, 6vw, 100rem); }
.ca__margin-note { align-self: start; position: sticky; top: 106rem; padding: 16rem; background: var(--signal-field); border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); font: 400 14rem/1.45 var(--font-body); }
.ca__margin-note p { margin: 0; }
.ca__margin-note p + p { margin-top: 10rem; }
.ca__margin-body { white-space: pre-wrap; }
.ca__margin-note p:first-child { font: 700 11rem/1.2 var(--font-mono); letter-spacing: .07em; text-transform: uppercase; }
.ca__prose { font: 400 clamp(18rem, 1.9vw, 21rem)/1.62 var(--font-body); min-width: 0; }
.ca__prose > p { margin: 0 0 24rem; }
.ca__lead::first-letter { float: left; margin: 2rem 11rem 0 0; font: 500 5.1em/.72 var(--font-display); color: var(--signal-cobalt); }
.ca__prose h2 { margin: 64rem 0 20rem; font-size: clamp(30rem, 3.6vw, 46rem); line-height: .98; }
.ca blockquote { margin: 45rem 0; padding: 24rem 26rem; border-left: 8rem solid var(--signal-cobalt); background: var(--paper-2); border-radius: 0 var(--radius-m) var(--radius-m) 0; font: 500 clamp(22rem, 2.6vw, 32rem)/1.12 var(--font-display); letter-spacing: -.03em; }
.ca blockquote p { margin: 0; }
.ca__callout { margin: 36rem 0; padding: 16rem; background: var(--signal-field); border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); font: 400 15rem/1.45 var(--font-body); }
.ca__callout-label { margin: 0 0 8rem; font: 700 11rem/1.2 var(--font-mono); letter-spacing: .07em; text-transform: uppercase; }
.ca__callout p { margin: 0; }
.ca__figure { margin: 50rem 0 20rem; padding: 12rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper-2); }
.ca__figure :deep(.ed-editorial-image) { display: block; width: 100%; height: auto; aspect-ratio: 16 / 9; object-fit: cover; background: var(--paper-2); }
.ca__list { margin: 0 0 28rem; padding-left: 1.2em; }
.ca__list li { margin-bottom: 10rem; }
.ca__closing { margin-top: 38rem !important; padding-top: 28rem; border-top: var(--stroke) solid var(--ink); font: 500 clamp(22rem, 2.6vw, 34rem)/1.14 var(--font-display); letter-spacing: -.035em; }
.ca__sources { max-width: 1100rem; margin: clamp(64rem, 10vw, 130rem) auto 0; padding: 34rem var(--shell-gutter) 0; border-top: var(--stroke) solid var(--ink); }
.ca__sources h2 { margin: 12rem 0 30rem; font-size: clamp(33rem, 4vw, 48rem); line-height: .95; }
.ca__sources ol { max-width: 760rem; padding: 0; list-style: none; }
.ca__sources li { padding: 16rem 0; border-top: var(--stroke) solid var(--line); font-size: 15rem; line-height: 1.45; }
.ca__sources a { color: inherit; }
.ca__sources span { color: var(--signal-cobalt); font-family: var(--font-mono); }
.ca__sources em { color: var(--ink-soft); }
.ca__newsletter-wrap { max-width: 1100rem; margin: clamp(54rem, 8vw, 100rem) auto 0; padding: 0 var(--shell-gutter); }

@media (max-width: 760px) {
  .ca__hero { padding: 0; }
  .ca__hero :deep(.ed-editorial-image) { border-left: 0; border-right: 0; border-radius: 0; aspect-ratio: 4 / 3; }
  .ca__article { display: block; }
  .ca__margin-note { position: static; margin-bottom: 36rem; }
  .ca__prose h2 { margin-top: 52rem; }
}
</style>
