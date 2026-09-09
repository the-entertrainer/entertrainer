<script setup lang="ts">
import { CENTRE_UNIVERSE_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${CENTRE_UNIVERSE_BLOG.title} · The Entertrainer Blogs`,
  description: CENTRE_UNIVERSE_BLOG.dek,
  ogTitle: CENTRE_UNIVERSE_BLOG.title,
  ogDescription: CENTRE_UNIVERSE_BLOG.dek,
  ogUrl: `https://entertrainer.in/elevate/${CENTRE_UNIVERSE_BLOG.slug}`,
  ogImage: `https://entertrainer.in${CENTRE_UNIVERSE_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: CENTRE_UNIVERSE_BLOG.title,
  twitterDescription: CENTRE_UNIVERSE_BLOG.dek,
  twitterImage: `https://entertrainer.in${CENTRE_UNIVERSE_BLOG.hero}`
})

const references = [
  {
    id: 1,
    title: 'Cosmological Principle',
    source: 'NASA / WMAP science overview',
    href: 'https://map.gsfc.nasa.gov/universe/bb_concepts.html'
  },
  {
    id: 2,
    title: 'What is the Universe Expanding Into?',
    source: 'NASA Space Place',
    href: 'https://spaceplace.nasa.gov/expansion/en/'
  },
  {
    id: 3,
    title: 'Hubble’s Law of Cosmic Expansion',
    source: 'ESA / Hubble',
    href: 'https://esahubble.org/wordbank/hubbles-law/'
  }
]
</script>

<template>
  <main id="main" class="centre">
    <header class="centre__head">
      <NuxtLink to="/elevate" class="centre__back">The Entertrainer Blogs</NuxtLink>
      <p class="centre__meta">{{ CENTRE_UNIVERSE_BLOG.category }} <span aria-hidden="true">·</span> {{ CENTRE_UNIVERSE_BLOG.minutes }} min read</p>
      <h1>You Are the Centre of the Universe — and Here’s Why</h1>
      <p class="centre__dek">{{ CENTRE_UNIVERSE_BLOG.dek }}</p>
    </header>

    <figure class="centre__hero">
      <EdEditorialImage :src="CENTRE_UNIVERSE_BLOG.hero" :alt="CENTRE_UNIVERSE_BLOG.heroAlt" />
    </figure>

    <article class="centre__article">
      <aside class="centre__margin-note" aria-label="Reading note">
        <p>The short version.</p>
        <p>Choose yourself as the point of reference — and yes, you are the centre. Every other “you” gets the same gift.</p>
      </aside>

      <div class="centre__prose">
        <p class="centre__lead">No matter what people say — family, parents, friends, that voice that shrinks you — you are the centre of the universe.</p>
        <p>Not as a joke. Not as a gym poster. As a real thing you can choose.</p>
        <p>Every “you” is.</p>
        <p>Let me show you. Three tiny taps. Almost no words. Watch what happens.</p>

        <h2>First — everything drifts apart</h2>
        <p>Space stretches. Galaxies ride that stretch. From far away, it looks like everything is moving away from everything else.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>Hit Blow.</p>

        <ClientOnly>
          <EdCentreMiniSteps :step="1" />
          <template #fallback>
            <p class="centre__lab-fallback">Loading a tiny blow…</p>
          </template>
        </ClientOnly>

        <p>See? Nobody has to be special for that. The field just… opens.</p>

        <h2>Now stand on you</h2>
        <p>Here is the fun bit.</p>
        <p>Pick yourself as the point of reference. Stand on the yellow YOU. Watch the rest drift out.</p>

        <ClientOnly>
          <EdCentreMiniSteps :step="2" />
          <template #fallback>
            <p class="centre__lab-fallback">Loading “you”…</p>
          </template>
        </ClientOnly>

        <p>When you stand here, it looks like the middle.</p>
        <p>Because you chose you.</p>

        <blockquote>
          <p>You are the centre of the universe when you choose yourself as the point of reference. Every you is.</p>
        </blockquote>

        <h2>Now stand on a friend</h2>
        <p>Same sky. Different feet.</p>
        <p>Tap Friend. Expansion plays again — but now <em>they</em> sit still in the middle, and everything else slides away from them.</p>

        <ClientOnly>
          <EdCentreMiniSteps :step="3" />
          <template #fallback>
            <p class="centre__lab-fallback">Loading a friend…</p>
          </template>
        </ClientOnly>

        <p>They’re the middle too.</p>
        <p>Nothing about the stretch changed. Only who you decided to stand on.</p>
        <p>That is the whole trick. Homogeneous expansion flatters every honest observer the same way.<a href="#ref-1" aria-label="Reference 1">[1]</a><a href="#ref-3" aria-label="Reference 3">[3]</a></p>

        <h2>So…</h2>
        <p>If someone has told you that you are small, late, extra, or somehow off-centre — keep this picture.</p>
        <p>Choose yourself as the reference.</p>
        <p>The sky runs away in every direction from you.</p>
        <p>And from your friend.</p>
        <p>And from a galaxy that will never know your name.</p>

        <p class="centre__closing">You are the centre — and so is every other you.</p>
      </div>
    </article>

    <section class="centre__sources" aria-labelledby="sources-title">
      <p class="centre__meta">Soft footnotes</p>
      <h2 id="sources-title">A little science, if you want it</h2>
      <ol>
        <li v-for="reference in references" :id="`ref-${reference.id}`" :key="reference.id">
          <a :href="reference.href" target="_blank" rel="noreferrer"><span>[{{ reference.id }}]</span> {{ reference.title }} <em>{{ reference.source }}</em></a>
        </li>
      </ol>
    </section>

    <div class="centre__newsletter-wrap"><EdNewsletter /></div>
  </main>
</template>

<style scoped>
.centre { padding-bottom: 112rem; }
.centre__head { max-width: var(--shell-wide); margin: 0 auto; padding: clamp(26rem, 5vw, 64rem) var(--shell-gutter) clamp(36rem, 6vw, 76rem); }
.centre__back, .centre__meta { font: 700 12rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.centre__back { color: var(--ink); }
.centre__meta { margin: clamp(46rem, 8vw, 104rem) 0 16rem; color: var(--signal-cobalt); }
.centre h1, .centre h2 { font-family: var(--font-display); font-weight: 500; letter-spacing: -.05em; }
.centre h1 { max-width: 1080rem; margin: 0; font-size: clamp(48rem, 8vw, 122rem); line-height: .91; text-wrap: balance; }
.centre__dek { max-width: 720rem; margin: 30rem 0 0; font: 400 clamp(19rem, 2.25vw, 27rem)/1.4 var(--font-body); }
.centre__hero { max-width: 1400rem; margin: 0 auto; padding: 0 var(--shell-gutter); }
.centre__hero :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: 16 / 8.5; object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); overflow: hidden; background: var(--signal-field); }
.centre figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.centre__article { max-width: 1100rem; margin: clamp(44rem, 8vw, 112rem) auto 0; padding: 0 var(--shell-gutter); display: grid; grid-template-columns: 190rem minmax(0, 690rem); justify-content: space-between; gap: clamp(28rem, 6vw, 100rem); }
.centre__margin-note { align-self: start; position: sticky; top: 106rem; padding: 16rem; background: var(--signal-field); border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); font: 400 14rem/1.45 var(--font-body); }
.centre__margin-note p { margin: 0; }
.centre__margin-note p + p { margin-top: 10rem; }
.centre__margin-note p:first-child { font: 700 11rem/1.2 var(--font-mono); letter-spacing: .07em; text-transform: uppercase; }
.centre__prose { font: 400 clamp(18rem, 1.9vw, 21rem)/1.62 var(--font-body); }
.centre__prose p { margin: 0 0 24rem; }
.centre__prose .centre__lead::first-letter { float: left; margin: 2rem 11rem 0 0; font: 500 5.1em/.72 var(--font-display); color: var(--signal-cobalt); }
.centre__prose a { color: inherit; text-decoration: underline; text-decoration-color: var(--signal-cobalt); text-decoration-thickness: 2px; text-underline-offset: 3px; }
.centre__prose h2 { margin: 68rem 0 20rem; font-size: clamp(34rem, 4vw, 53rem); line-height: .98; }
.centre blockquote { margin: 45rem 0; padding: 24rem 26rem; border-left: 8rem solid var(--signal-cobalt); background: var(--paper-2); border-radius: 0 var(--radius-m) var(--radius-m) 0; font: 500 clamp(25rem, 3vw, 37rem)/1.06 var(--font-display); letter-spacing: -.035em; }
.centre blockquote p { margin: 0; }
.centre__lab-fallback { margin: 36rem 0; padding: 24rem; border: var(--stroke) dashed var(--line); border-radius: var(--radius-m); color: var(--ink-soft); font: 400 14rem/1.4 var(--font-mono); }
.centre__closing { margin-top: 38rem !important; padding-top: 28rem; border-top: var(--stroke) solid var(--ink); font: 500 clamp(26rem, 3vw, 40rem)/1.08 var(--font-display); letter-spacing: -.04em; }
.centre__sources { max-width: 1100rem; margin: clamp(64rem, 10vw, 130rem) auto 0; padding: 34rem var(--shell-gutter) 0; border-top: var(--stroke) solid var(--ink); }
.centre__sources h2 { margin: 12rem 0 30rem; font-size: clamp(33rem, 4vw, 48rem); line-height: .95; font-family: var(--font-display); font-weight: 500; letter-spacing: -.05em; }
.centre__sources ol { max-width: 760rem; padding: 0; list-style: none; }
.centre__sources li { padding: 16rem 0; border-top: var(--stroke) solid var(--line); font-size: 15rem; line-height: 1.45; }
.centre__sources a { color: inherit; }
.centre__sources span { color: var(--signal-cobalt); font-family: var(--font-mono); }
.centre__sources em { color: var(--ink-soft); }
.centre__newsletter-wrap { max-width: 1100rem; margin: clamp(54rem, 8vw, 100rem) auto 0; padding: 0 var(--shell-gutter); }
@media (max-width: 760px) {
  .centre__hero { padding: 0; }
  .centre__hero :deep(.ed-editorial-image) { border-left: 0; border-right: 0; border-radius: 0; aspect-ratio: 4 / 3; }
  .centre__article { display: block; }
  .centre__margin-note { position: static; margin-bottom: 36rem; }
  .centre__prose h2 { margin-top: 52rem; }
}
</style>
