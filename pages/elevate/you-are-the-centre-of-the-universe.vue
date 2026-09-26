<script setup lang="ts">
import { CENTRE_UNIVERSE_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${CENTRE_UNIVERSE_BLOG.socialTitle} · The Entertrainer Blogs`,
  description: CENTRE_UNIVERSE_BLOG.socialHook,
  ogTitle: CENTRE_UNIVERSE_BLOG.socialTitle,
  ogDescription: CENTRE_UNIVERSE_BLOG.socialHook,
  ogUrl: `https://entertrainer.in/elevate/${CENTRE_UNIVERSE_BLOG.slug}`,
  ogImage: `https://entertrainer.in${CENTRE_UNIVERSE_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: CENTRE_UNIVERSE_BLOG.socialTitle,
  twitterDescription: CENTRE_UNIVERSE_BLOG.socialHook,
  twitterImage: `https://entertrainer.in${CENTRE_UNIVERSE_BLOG.hero}`
})

const references = [
  { id: 1, title: 'Cosmological Principle', source: 'NASA / WMAP science overview', href: 'https://map.gsfc.nasa.gov/universe/bb_concepts.html' },
  { id: 2, title: 'What is the Universe Expanding Into?', source: 'NASA Space Place', href: 'https://spaceplace.nasa.gov/expansion/en/' },
  { id: 3, title: 'Hubble’s Law of Cosmic Expansion', source: 'ESA / Hubble', href: 'https://esahubble.org/wordbank/hubbles-law/' },
  { id: 4, title: 'A Relation between Distance and Radial Velocity among Extra-Galactic Nebulae', source: 'Hubble, PNAS 1929', href: 'https://www.pnas.org/doi/10.1073/pnas.15.3.168' }
]
</script>

<template>
<div class="taj">
    <header class="taj__head">
      <NuxtLink to="/elevate" class="taj__back">The Entertrainer Blogs</NuxtLink>
      <p class="taj__meta">{{ CENTRE_UNIVERSE_BLOG.category }} <span aria-hidden="true">·</span> {{ CENTRE_UNIVERSE_BLOG.minutes }} min read</p>
      <h1>{{ CENTRE_UNIVERSE_BLOG.title }}</h1>
      <p class="taj__dek">{{ CENTRE_UNIVERSE_BLOG.dek }}</p>
    </header>

    <figure class="taj__hero">
      <EdEditorialImage :src="CENTRE_UNIVERSE_BLOG.hero" :alt="CENTRE_UNIVERSE_BLOG.heroAlt" />
    </figure>

    <article class="taj__article">
      <aside class="taj__margin-note" aria-label="Reading note">
        <p>On the rubber, not in the air.</p>
        <p>The middle of a balloon is inside it. The dots live on the skin. Those are different places.</p>
      </aside>

      <div class="taj__prose">
        <p class="taj__lead">Someone on the terrace after dinner points at the dark.</p>
        <p>Not at a star. At the whole idea of the thing.</p>
        <p>“If it started with a bang,” they say, “where is the bang now?”</p>
        <p>Fair question. Wrong picture.</p>
        <p>A firework happens in a room. Smoke leaves a middle. You could walk back to the match.</p>

        <h2>What is it?</h2>
        <p>Space getting bigger between the galaxies. The galaxies are not walking.</p>
        <p>Draw dots on a balloon. Blow it up. Every dot sees the others move away, because the rubber stretches.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>No dot gets to say, “The start was over there.” The surface has no centre on it. The centre of the balloon is in the air inside, and the dots do not live there.</p>
        <p>In 1929 Hubble wrote down a plainer version of the same surprise. More distant nebulae recede faster. That is a relation between distance and speed. It is not a map with us in the middle.<a href="#ref-4" aria-label="Reference 4">[4]</a><a href="#ref-3" aria-label="Reference 3">[3]</a></p>
        <p>Take two photos of one patch of sky. In the second, the gaps are larger. Nobody packed a bag. The gaps grew.</p>
        <p>Now hold one galaxy still. Every other one appears to move away from it. Hold a different galaxy still. Same result. The new observer also sees the rest receding in every direction.</p>

        <h2>Why is it significant?</h2>
        <p>The terrace question smuggles a room into the sentence.</p>
        <p>If the bang happened in space, there would be a place you could point to. If space itself stretched, that “where” does not sit on the map.</p>
        <p>So you are not standing at the edge of someone else’s explosion.</p>
        <p>You are small. Earth is small. The Sun is small next to the rest of it. Small is not the same as off to the side.</p>
        <p>From your address, the sky opens outward. From your friend’s address, it does the same. From a galaxy ten billion light-years away, too. That is not a compliment. It is a symmetry.</p>
        <p>On large scales, no place is special and no direction is special. That stubborn claim has a name: the cosmological principle.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>

        <blockquote>
          <p>Hold any galaxy still, and the sky runs away from it.</p>
        </blockquote>

        <h2>Interesting facts and thoughts</h2>
        <p>Where I have to be honest: the balloon is a toy, then it lies.</p>
        <p>It is a two-dimensional skin sitting in a room. Our space is not a skin we can step off. Keep the useful bit. Drop the rest. Expansion is a change in distances, not a crowd leaving a chosen square.</p>
        <p>We also do not have a photograph of the whole thing from outside. Every popular balloon, including this one, is a reconstruction. It can show the symmetry. It is not a view from the gods.</p>
        <p>Physically, you are not the centre. Hubble’s result was never “everything is fleeing from us.” Once the same relation holds for any observer, the privileged middle disappears.</p>
        <p>From your point of view, yes, your address is the centre of the view you can make from your address. So is everyone else’s.</p>

        <p class="taj__closing">If every observer sees the sky running away, what exactly would a real middle look like — and who would be standing far enough outside to see it?</p>
        <p>Sit with that. The bang is not somewhere else. There is no somewhere else of that kind.</p>
      </div>
    </article>

    <section class="taj__sources" aria-labelledby="sources-title">
      <p class="taj__meta">References</p>
      <h2 id="sources-title">Sources used in this article</h2>
      <ol>
        <li v-for="reference in references" :id="`ref-${reference.id}`" :key="reference.id">
          <a :href="reference.href" target="_blank" rel="noreferrer"><span>[{{ reference.id }}]</span> {{ reference.title }} <em>{{ reference.source }}</em></a>
        </li>
      </ol>
    </section>

    <div class="taj__newsletter-wrap"><EdNewsletter /></div>
  </div>
</template>

<style scoped>
.taj { padding-bottom: 112rem; }
.taj__head { max-width: var(--shell-wide); margin: 0 auto; padding: clamp(26rem, 5vw, 64rem) var(--shell-gutter) clamp(28rem, 5vw, 56rem); }
.taj__back, .taj__meta { font: 700 12rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.taj__back { color: var(--ink); }
.taj__meta { margin: clamp(46rem, 8vw, 104rem) 0 16rem; color: var(--signal-cobalt); }
.taj h1, .taj h2 { font-family: var(--font-display); font-weight: 500; letter-spacing: -.05em; }
.taj h1 { max-width: 1080rem; margin: 0; font-size: clamp(40rem, 6.6vw, 100rem); line-height: .95; text-wrap: balance; }
.taj__dek { max-width: 700rem; margin: 30rem 0 0; font: 400 clamp(19rem, 2.25vw, 27rem)/1.4 var(--font-body); }
.taj__hero { max-width: 1400rem; margin: 0 auto; padding: 0 var(--shell-gutter); }
.taj__hero :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: 16 / 8.5; object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); overflow: hidden; background: var(--signal-field); }
.taj figure figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.taj figure figcaption a { color: var(--signal-cobalt); text-decoration: none; }
.taj__article { max-width: 1100rem; margin: clamp(36rem, 6vw, 76rem) auto 0; padding: 0 var(--shell-gutter); display: grid; grid-template-columns: 190rem minmax(0, 690rem); justify-content: space-between; gap: clamp(28rem, 6vw, 100rem); }
.taj__margin-note { align-self: start; position: sticky; top: 106rem; padding: 16rem; background: var(--signal-field); border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); font: 400 14rem/1.45 var(--font-body); }
.taj__margin-note p { margin: 0; }
.taj__margin-note p + p { margin-top: 10rem; }
.taj__margin-note p:first-child { font: 700 11rem/1.2 var(--font-mono); letter-spacing: .07em; text-transform: uppercase; }
.taj__prose { font: 400 clamp(18rem, 1.9vw, 21rem)/1.62 var(--font-body); }
.taj__prose p { margin: 0 0 24rem; }
.taj__prose .taj__lead::first-letter { float: left; margin: 2rem 11rem 0 0; font: 500 5.1em/.72 var(--font-display); color: var(--signal-cobalt); }
.taj__prose a { color: inherit; text-decoration: underline; text-decoration-color: var(--signal-cobalt); text-decoration-thickness: 2px; text-underline-offset: 3px; }
.taj__prose h2 { margin: 64rem 0 20rem; font-size: clamp(30rem, 3.6vw, 46rem); line-height: .98; }
.taj blockquote { margin: 45rem 0; padding: 24rem 26rem; border-left: 8rem solid var(--signal-cobalt); background: var(--paper-2); border-radius: 0 var(--radius-m) var(--radius-m) 0; font: 500 clamp(22rem, 2.6vw, 32rem)/1.12 var(--font-display); letter-spacing: -.03em; }
.taj blockquote p { margin: 0; }
.taj__visual { margin: 50rem 0 45rem; }
.taj__visual :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--signal-field); }
.taj__visual--wide :deep(.ed-editorial-image) { aspect-ratio: 16 / 7; object-fit: cover; }
.taj__visual--palm :deep(.ed-editorial-image) { aspect-ratio: 16 / 3.2; object-fit: cover; background: #f0e6d4; }
.taj__closing { margin-top: 38rem !important; padding-top: 28rem; border-top: var(--stroke) solid var(--ink); font: 500 clamp(22rem, 2.6vw, 34rem)/1.14 var(--font-display); letter-spacing: -.035em; }
.taj__sources { max-width: 1100rem; margin: clamp(64rem, 10vw, 130rem) auto 0; padding: 34rem var(--shell-gutter) 0; border-top: var(--stroke) solid var(--ink); }
.taj__sources h2 { margin: 12rem 0 30rem; font-size: clamp(33rem, 4vw, 48rem); line-height: .95; }
.taj__sources ol { max-width: 760rem; padding: 0; list-style: none; }
.taj__sources li { padding: 16rem 0; border-top: var(--stroke) solid var(--line); font-size: 15rem; line-height: 1.45; }
.taj__sources a { color: inherit; }
.taj__sources span { color: var(--signal-cobalt); font-family: var(--font-mono); }
.taj__sources em { color: var(--ink-soft); }
.taj__newsletter-wrap { max-width: 1100rem; margin: clamp(54rem, 8vw, 100rem) auto 0; padding: 0 var(--shell-gutter); }
@media (max-width: 760px) {
  .taj__hero { padding: 0; }
  .taj__hero :deep(.ed-editorial-image) { border-left: 0; border-right: 0; border-radius: 0; aspect-ratio: 4 / 3; }
  .taj__article { display: block; }
  .taj__margin-note { position: static; margin-bottom: 36rem; }
  .taj__prose h2 { margin-top: 52rem; }
  .taj__visual { margin-left: 0; margin-right: 0; }
  .taj__visual--palm :deep(.ed-editorial-image) { aspect-ratio: 16 / 4.5; }
}
</style>
