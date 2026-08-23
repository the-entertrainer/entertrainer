<script setup lang="ts">
import { FEATURED_BLOG } from '~/content/blogs'

useSeoMeta({
  title: 'Elevate · The Entertrainer Blogs',
  description: 'Curious, evidence-led pieces about minds, machines, learning, and the everyday questions that become stranger when examined properly.',
  ogTitle: 'Elevate · The Entertrainer Blogs',
  ogDescription: 'Essays for the question you almost asked yourself.',
  ogUrl: 'https://entertrainer.in/elevate',
  ogImage: 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/oLmjqBPjwBxcOjsd.jpg'
})

const bannerStyle = { '--elevate-image': "url('https://files.manuscdn.com/user_upload_by_module/session_file/310419663032400460/oLmjqBPjwBxcOjsd.jpg')" }
</script>

<template>
  <main id="main" class="elevate">
    <section class="elevate__banner" :style="bannerStyle" aria-labelledby="elevate-title">
      <div class="elevate__tiles" aria-hidden="true"><span v-for="n in 21" :key="n"></span></div>
      <div class="elevate__banner-copy">
        <h1 id="elevate-title">Elevate</h1>
        <p>Articles about work, learning, technology, and the questions that stay with you.</p>
      </div>
    </section>

    <section class="elevate__entry" aria-labelledby="first-feature-title">
      <NuxtLink :to="`/blogs/${FEATURED_BLOG.slug}`" class="elevate__feature">
        <div class="elevate__feature-copy">
          <p class="elevate__meta">{{ FEATURED_BLOG.category }} <span aria-hidden="true">·</span> {{ FEATURED_BLOG.minutes }} min read</p>
          <h2 id="first-feature-title">{{ FEATURED_BLOG.title }}</h2>
          <p>{{ FEATURED_BLOG.dek }}</p>
          <span class="elevate__read">Read the feature</span>
        </div>
        <figure class="elevate__feature-image">
          <EdEditorialImage :src="FEATURED_BLOG.hero" :alt="FEATURED_BLOG.heroAlt" />
        </figure>
      </NuxtLink>
    </section>

    <EdNewsletter class="elevate__newsletter" />
  </main>
</template>

<style scoped>
/* Elevate: yellow-tile magazine entry with a real city-lights field, oversized editorial type, and controlled moving-paper energy. */
.elevate { max-width: var(--shell-wide); margin: 0 auto; padding: clamp(22rem, 4vw, 56rem) var(--shell-gutter) 110rem; }
.elevate__banner { position: relative; display: grid; min-height: min(680rem, calc(100dvh - 130rem)); overflow: hidden; border: var(--stroke) solid var(--ink); border-radius: var(--radius-l); background-image: linear-gradient(90deg, color-mix(in srgb, var(--ink) 75%, transparent), color-mix(in srgb, var(--ink) 16%, transparent)), var(--elevate-image); background-position: center; background-size: cover; }
.elevate__tiles { position: absolute; inset: -12%; display: grid; grid-template-columns: repeat(7, 1fr); grid-template-rows: repeat(3, 1fr); opacity: .78; transform: rotate(-6deg) scale(1.12); animation: elevate-tiles 22s linear infinite alternate; }
.elevate__tiles span { border: 1rem solid color-mix(in srgb, var(--paper) 45%, transparent); background: color-mix(in srgb, var(--signal-cobalt) calc((var(--i, 1) * 3) * 1%), transparent); }
.elevate__tiles span:nth-child(3n) { background: color-mix(in srgb, var(--signal-cobalt) 45%, transparent); }
.elevate__tiles span:nth-child(5n) { background: color-mix(in srgb, var(--ink) 43%, transparent); }
@keyframes elevate-tiles { from { transform: rotate(-6deg) scale(1.12) translate3d(-2%, -1%, 0); } to { transform: rotate(-6deg) scale(1.12) translate3d(3%, 2%, 0); } }
.elevate__banner-copy { position: relative; z-index: 1; align-self: end; max-width: 790rem; padding: clamp(34rem, 6vw, 84rem); color: var(--paper); }
.elevate__eyebrow, .elevate__section-label, .elevate__meta { margin: 0; font: 700 12rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.elevate__eyebrow { color: var(--signal-cobalt); }
.elevate h1 { margin: 12rem 0 14rem; font: 500 clamp(88rem, 18vw, 250rem)/.72 var(--font-display); letter-spacing: -.085em; }
.elevate__banner-copy > p:last-child { max-width: 400rem; margin: 0; font: 400 clamp(18rem, 2vw, 25rem)/1.35 var(--font-body); }
.elevate__banner-note { position: absolute; z-index: 1; right: clamp(22rem, 3vw, 44rem); bottom: 24rem; margin: 0; padding: 8rem 10rem; color: var(--paper); border: 1rem solid color-mix(in srgb, var(--paper) 65%, transparent); border-radius: var(--radius-s); background: color-mix(in srgb, var(--ink) 55%, transparent); font: 700 10rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.elevate__entry { padding: clamp(64rem, 10vw, 132rem) 0 0; }
.elevate__section-label { color: var(--signal-cobalt); margin-bottom: 18rem; }
.elevate__feature { display: grid; grid-template-columns: minmax(0, .92fr) minmax(360rem, 1.08fr); color: var(--ink); overflow: hidden; border-top: var(--stroke) solid var(--ink); border-bottom: var(--stroke) solid var(--ink); }
.elevate__feature-copy { display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-end; padding: clamp(28rem, 5vw, 66rem); }
.elevate__meta { color: var(--ink-soft); }
.elevate h2 { max-width: 700rem; margin: 20rem 0; font: 500 clamp(39rem, 4.5vw, 70rem)/.95 var(--font-display); letter-spacing: -.05em; }
.elevate__feature-copy > p:not(.elevate__meta) { max-width: 480rem; margin: 0; font-size: 19rem; line-height: 1.5; }
.elevate__read { display: inline-flex; margin-top: 28rem; padding: 10rem 14rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-s); font-weight: 800; transition: transform var(--dur-fast) var(--ease-spring), background var(--dur-fast) var(--ease-out); }
.elevate__feature:hover .elevate__read { background: var(--signal-cobalt); transform: translateY(-2rem); }
.elevate__feature-image { min-height: 500rem; margin: 0; overflow: hidden; border-left: var(--stroke) solid var(--ink); }
.elevate__feature-image :deep(.ed-editorial-image) { width: 100%; height: 100%; object-fit: cover; transition: transform 600ms var(--ease-out); }
.elevate__feature:hover :deep(.ed-editorial-image) { transform: scale(1.025); }
.elevate__manifesto { display: grid; grid-template-columns: .31fr .69fr; gap: clamp(28rem, 8vw, 130rem); padding: clamp(72rem, 11vw, 144rem) 0; border-bottom: var(--stroke) solid var(--ink); }
.elevate__manifesto-copy { max-width: 760rem; margin: 0; font: 500 clamp(30rem, 4.5vw, 58rem)/1.02 var(--font-display); letter-spacing: -.045em; }
.elevate__newsletter { margin-top: clamp(55rem, 8vw, 104rem); }
@media (max-width: 740px) { .elevate { padding-top: 18rem; }.elevate__banner { min-height: 510rem; }.elevate__banner-copy { padding: 28rem; }.elevate h1 { font-size: clamp(88rem, 25vw, 160rem); }.elevate__banner-note { display: none; }.elevate__feature { grid-template-columns: 1fr; }.elevate__feature-image { min-height: 330rem; order: -1; border: 0; border-bottom: var(--stroke) solid var(--ink); }.elevate__feature-copy { padding: 30rem 0; }.elevate__manifesto { grid-template-columns: 1fr; gap: 18rem; } }
@media (prefers-reduced-motion: reduce) { .elevate__tiles { animation: none; transform: none; }.elevate__feature-image :deep(.ed-editorial-image), .elevate__read { transition: none; } }
</style>
