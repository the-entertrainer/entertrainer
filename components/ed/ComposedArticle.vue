<script setup lang="ts">
import type { ComposedPost } from '~/types/composed'

defineProps<{
  post: ComposedPost
}>()
</script>

<template>
  <div class="ca">
    <header class="ca__head">
      <NuxtLink to="/elevate" class="ca__back">The Entertrainer Blogs</NuxtLink>
      <p class="ca__meta">{{ post.category }} <span aria-hidden="true">·</span> {{ post.minutes }} min read</p>
      <h1>{{ post.title }}</h1>
      <p class="ca__dek">{{ post.dek }}</p>
      <ul v-if="post.tags?.length" class="ca__tags" aria-label="Tags">
        <li v-for="tag in post.tags" :key="tag">{{ tag }}</li>
      </ul>
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
  </div>
</template>

<style scoped>
/* Shared Elevate article rhythm — mirrors mid/moonly hand-authored posts. */
.ca { padding-bottom: var(--space-89); }
.ca__head { max-width: calc(var(--column) + (var(--shell-gutter) * 2)); margin: 0 auto; padding: var(--space-34) var(--shell-gutter) var(--space-21); }
.ca__back, .ca__meta { font: 500 var(--type-meta)/1.2 var(--font-mono); letter-spacing: .1em; text-transform: uppercase; }
.ca__back { color: var(--ink); }
.ca__meta { margin: var(--space-21) 0 var(--space-13); color: var(--signal-cobalt); }
.ca h1, .ca h2 { font-family: var(--font-display); font-weight: 500; letter-spacing: -.05em; }
.ca h1 { max-width: var(--column); margin: 0; font-size: var(--type-h1); line-height: .95; text-wrap: balance; }
.ca__tags {
  display: flex; flex-wrap: wrap; gap: 6rem;
  list-style: none; margin: 14rem 0 0; padding: 0;
}
.ca__tags li {
  padding: 3rem 9rem;
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-full);
  font: 600 10rem/1.4 var(--font-mono);
  letter-spacing: .04em;
  text-transform: uppercase;
  color: var(--muted);
}
.ca__dek { max-width: var(--measure); margin: var(--space-13) 0 0; font: 400 var(--type-dek)/1.3 var(--font-body); }
.ca__hero { max-width: calc(var(--column) + (var(--shell-gutter) * 2)); margin: 0 auto; padding: 0 var(--shell-gutter); }
.ca__hero :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: var(--crop); object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); overflow: hidden; background: var(--signal-field); }
.ca figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.ca__article { max-width: calc(var(--column) + (var(--shell-gutter) * 2)); margin: var(--space-34) auto 0; padding: 0 var(--shell-gutter); display: block; }
.ca__margin-note { position: static; max-width: var(--measure); margin: 0 0 var(--space-21); padding: var(--space-13); background: var(--accent); color: var(--accent-ink); border: var(--stroke) solid var(--ink); border-radius: 0; font: 400 var(--type-body)/1.45 var(--font-body); }
.ca__margin-note p { margin: 0; }
.ca__margin-note p + p { margin-top: 10rem; }
.ca__margin-body { white-space: pre-wrap; }
.ca__margin-note p:first-child { font: 500 var(--type-meta)/1.2 var(--font-mono); letter-spacing: .1em; text-transform: uppercase; }
.ca__prose { max-width: var(--measure); font: 400 var(--type-body)/1.55 var(--font-body); min-width: 0; }
.ca__prose > p { margin: 0 0 var(--space-21); }
.ca__lead::first-letter { float: left; margin: 2rem 11rem 0 0; font: 500 5.1em/.72 var(--font-display); color: var(--signal-cobalt); }
.ca__prose h2 { margin: var(--space-34) 0 var(--space-13); font-size: var(--type-h2); line-height: .98; }
.ca blockquote { margin: var(--space-34) 0; padding: var(--space-21); border-left: var(--stroke) solid var(--ink); background: var(--paper); border-radius: 0; font: 500 var(--type-h2)/1.15 var(--font-display); letter-spacing: -.03em; }
.ca blockquote p { margin: 0; }
.ca__callout { margin: 36rem 0; padding: 16rem; background: var(--signal-field); border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); font: 400 var(--type-body)/1.45 var(--font-body); }
.ca__callout-label { margin: 0 0 8rem; font: 500 var(--type-meta)/1.2 var(--font-mono); letter-spacing: .1em; text-transform: uppercase; }
.ca__callout p { margin: 0; }
.ca__figure { margin: var(--space-34) 0 var(--space-21); padding: var(--space-13); border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper-2); }
.ca__figure :deep(.ed-editorial-image) { display: block; width: 100%; height: auto; aspect-ratio: var(--crop); object-fit: cover; background: var(--paper-2); }
.ca__list { margin: 0 0 28rem; padding-left: 1.2em; }
.ca__list li { margin-bottom: 10rem; }
.ca__closing { margin-top: 38rem !important; padding-top: 28rem; border-top: var(--stroke) solid var(--ink); font: 500 var(--type-h2)/1.15 var(--font-display); letter-spacing: -.035em; }
.ca__sources { max-width: calc(var(--column) + (var(--shell-gutter) * 2)); margin: var(--space-55) auto 0; padding: var(--space-34) var(--shell-gutter) 0; border-top: var(--stroke) solid var(--ink); }
.ca__sources h2 { margin: var(--space-13) 0 var(--space-21); font-size: var(--type-h1); line-height: .95; }
.ca__sources ol { max-width: 760rem; padding: 0; list-style: none; }
.ca__sources li { padding: var(--space-13) 0; border-top: var(--stroke) solid var(--line); font-size: var(--type-body); line-height: 1.45; }
.ca__sources a { color: inherit; }
.ca__sources span { color: var(--signal-cobalt); font-family: var(--font-mono); }
.ca__sources em { color: var(--ink-soft); }
.ca__newsletter-wrap { max-width: calc(var(--column) + (var(--shell-gutter) * 2)); margin: var(--space-55) auto 0; padding: 0 var(--shell-gutter); }

@media (max-width: 760px) {
  .ca__hero { padding: 0; }
  .ca__hero :deep(.ed-editorial-image) { border-left: 0; border-right: 0; border-radius: 0; aspect-ratio: var(--crop); }
  .ca__article { display: block; }
  .ca__margin-note { position: static; margin-bottom: var(--space-21); }
  .ca__prose h2 { margin-top: 52rem; }
}
</style>
