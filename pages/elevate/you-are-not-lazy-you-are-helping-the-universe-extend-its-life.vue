<script setup lang="ts">
import { ENTROPY_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${ENTROPY_BLOG.socialTitle} · The Entertrainer Blogs`,
  description: ENTROPY_BLOG.socialHook,
  ogTitle: ENTROPY_BLOG.socialTitle,
  ogDescription: ENTROPY_BLOG.socialHook,
  ogUrl: `https://entertrainer.in/elevate/${ENTROPY_BLOG.slug}`,
  ogImage: `https://entertrainer.in${ENTROPY_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: ENTROPY_BLOG.socialTitle,
  twitterDescription: ENTROPY_BLOG.socialHook,
  twitterImage: `https://entertrainer.in${ENTROPY_BLOG.hero}`
})

const references = [
  { id: 1, title: 'Second Law – Entropy', source: 'NASA Glenn Research Center, 2023', href: 'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/second-law-entropy/' },
  { id: 2, title: 'The Second Law and Entropy Misconceptions Demystified', source: 'Entropy, 2020', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7517180/' },
  { id: 3, title: 'Landauer principle and thermodynamics of computation', source: 'Reports on Progress in Physics, 2025', href: 'https://iopscience.iop.org/article/10.1088/1361-6633/add6b3/meta' },
  { id: 4, title: 'Ask an Astrophysicist: Cosmology', source: 'NASA Goddard Space Flight Center', href: 'https://imagine.gsfc.nasa.gov/ask_astro/cosmology.html' }
]
</script>

<template>
<div class="taj">
    <header class="taj__head">
      <NuxtLink to="/elevate" class="taj__back">The Entertrainer Blogs</NuxtLink>
      <p class="taj__meta">{{ ENTROPY_BLOG.category }} <span aria-hidden="true">·</span> {{ ENTROPY_BLOG.minutes }} min read</p>
      <h1>{{ ENTROPY_BLOG.title }}</h1>
      <p class="taj__dek">{{ ENTROPY_BLOG.dek }}</p>
    </header>

    <figure class="taj__hero">
      <EdEditorialImage :src="ENTROPY_BLOG.hero" :alt="ENTROPY_BLOG.heroAlt" />
    </figure>

    <article class="taj__article">
      <aside class="taj__margin-note" aria-label="Reading note">
        <p>One useful word.</p>
        <p>Entropy is the name for energy that has spread out and become harder to use.</p>
      </aside>

      <div class="taj__prose">
        <p class="taj__lead">You make the tea properly hot, then get lost in your phone.</p>
        <p>Come back. It is disappointingly normal.</p>
        <p>The tea did not lose all its energy. It gave some warmth to the cooler room. The room barely changed. The cup changed enough for you to notice.</p>

        <h2>What is it?</h2>
        <p>A difference you can spend.</p>
        <p>Hot tea beside a cool room has a difference. A charged battery has one. Water sitting high above the ground has one. Heat can move. The battery can run the phone. Falling water can turn a wheel.</p>
        <p>Then the difference thins out. The tea cools. The battery goes flat. The water reaches the bottom. Nothing vanished. It just got worse at making something else happen.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>That direction has a formal name: the second law of thermodynamics. You do not need the label. You have watched it happen to coffee.</p>
        <p>Hot things cool. Full batteries become empty ones. A room with a window open stops having one side that is wildly colder than the other.</p>

        <figure class="taj__visual">
          <EdEditorialImage
            src="/blog/entropy-laziness/tea-heat-flow.jpg"
            alt="A steaming teacup on cream paper, black ink rings spreading outward as the heat leaves the cup."
          />
          <figcaption>A hot cup and a cool room start different. The warmth spreads. The useful gap shrinks.</figcaption>
        </figure>

        <h2>Why is it significant?</h2>
        <p>Here is the joke people want. Stay in bed, do less, help the universe last longer.</p>
        <p>A slower day usually burns less of the obvious stuff. Less walking. Less cooking. Fewer lights.</p>
        <p>You are not a phone on airplane mode while you lie there. You are still breathing, still warm, still thinking odd thoughts. The phone in your hand may be getting hot on its own. The universe will manage either way.</p>
        <p>Rest does not need a cosmic excuse. Sometimes you are tired. Sometimes your back would like a chair.</p>
        <p>People hear the word and look at the bedroom. Mess looks random. A folded shirt looks like a win against physics.</p>
        <p>Physics does not care where the socks are. You can make one small patch more ordered any time you like. A fridge keeps its inside cool. A body keeps itself alive. Folding a shirt spends energy and sends some heat somewhere else.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>So clean the room. Entropy is not going to do it for you.</p>

        <h2>Interesting facts and thoughts</h2>
        <p>Your photos feel weightless. The phone holding them is a lump of matter moving tiny amounts of electricity around. It warms up. It asks to be charged.</p>
        <p>Resetting information has a tiny minimum energy cost. Real machines pay much more than the neat textbook floor, and they pay it messily. The simple point is enough. Information is not floating free. Somebody is paying for it in electricity and heat.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>

        <figure class="taj__visual taj__visual--wide">
          <EdEditorialImage
            src="/blog/entropy-laziness/hubble-ultra-deep-field.jpg"
            alt="The Hubble Ultra Deep Field: thousands of galaxies packed into a small patch of sky."
          />
          <figcaption>One small patch of sky, seen by Hubble: roughly 10,000 galaxies. Image: NASA, ESA, S. Beckwith and the HUDF Team, and B. Mobasher.</figcaption>
        </figure>

        <p>Follow the same idea for an absurdly long time and the picture gets quiet. No big differences left. No easy fuel. No bright stars doing their usual work. People call that possible ending heat death.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>Where I have to be honest: that is not a reason to stay under the blanket this morning. It is the largest version of what your tea is already doing on the table.</p>

        <blockquote>
          <p>A useful difference slowly becomes ordinary.</p>
        </blockquote>

        <p class="taj__closing">If the universe is only smoothing things out, what are you actually protecting when you treat a nap as a moral failure?</p>
        <p>Take the nap. Then reply to the message.</p>
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
