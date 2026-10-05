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
      <EdMarginNote label="The heat did not vanish.">
        <p>Watch where a useful difference goes when nobody is spending it.</p>
      </EdMarginNote>

      <div class="taj__prose">
        <p class="taj__lead">You make the tea hot, then get lost in your phone, and when you come back the cup is ordinary.</p>
        <p>The heat did not disappear. It moved into the cooler room. The room barely noticed. You did. That one-way thinning of a useful difference is the everyday face of the second law of thermodynamics.<a href="#ref-1" aria-label="Reference 1">[1]</a> Physicists have a short name for what piles up as the difference fades. Hold the cup first. The label can wait a paragraph.</p>

        <h2>Heat flow and useful differences</h2>
        <p>Hot tea next to a cool room is a difference you can spend. So is a charged battery, or water sitting above the ground. Heat can move, the battery can run the phone, and falling water can turn a wheel. Then the difference thins out. The tea cools, the battery goes flat, the water reaches the bottom. Nothing vanished; it got worse at making something else happen.</p>
        <p>That one-way spreading is what the second law means in ordinary language. The name for the thinning is entropy: energy that has spread out and become harder to put to work.<a href="#ref-1" aria-label="Reference 1">[1]</a> You do not need the formal label to recognise your coffee. A useful temperature gap slowly becomes ordinary air.</p>

        <h2>Rest and common misconceptions</h2>
        <p>Here is the joke people want: stay in bed, do less, and help the universe last longer. A slower day usually burns less of the obvious stuff — less walking, less cooking, fewer lights — but you are not a phone on airplane mode. You are still breathing, still warm, still thinking, and the phone in your hand may be getting hot on its own. Rest does not need a cosmic excuse. Sometimes you are tired.</p>
        <p>Mess is not the same thing. Physics does not care where the socks are. You can tidy one patch any time you like. A fridge keeps its inside cool by paying an energy cost somewhere else. Folding a shirt spends energy and sends some heat into the wider room.<a href="#ref-2" aria-label="Reference 2">[2]</a> So clean the room; entropy is not going to do it for you. That point also ignores the long argument about whether the universe must end this way. That can wait. Your tea is already doing the small version.</p>

        <h2>Information, heat, and the far future</h2>
        <p>Your photos feel weightless, but the phone holding them is matter moving tiny amounts of electricity. It warms up. It asks to be charged. Resetting information has a tiny minimum energy cost, and real machines pay much more than that textbook floor. Information is not floating free; someone pays for it in electricity and heat.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>

        <figure class="taj__visual taj__visual--wide">
          <EdEditorialImage
            src="/blog/entropy-laziness/hubble-ultra-deep-field.jpg"
            alt="The Hubble Ultra Deep Field: thousands of galaxies packed into a small patch of sky."
          />
          <figcaption>One small patch of sky, seen by Hubble: roughly 10,000 galaxies. Image: NASA, ESA, S. Beckwith and the HUDF Team, and B. Mobasher.</figcaption>
        </figure>

        <p>Follow the same idea for an absurdly long time and the picture gets quiet: no big differences left, no easy fuel, no bright stars doing their usual work. People call that possible ending heat death.<a href="#ref-4" aria-label="Reference 4">[4]</a> That is not a reason to stay under the blanket this morning. It is your tea, drawn at the largest scale.</p>

        <blockquote>
          <p>A useful difference slowly becomes ordinary.</p>
        </blockquote>

        <p class="taj__closing">If every useful gap is only waiting to thin out, what exactly are you punishing when you treat a nap as a moral failure?</p>
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
.taj { padding-bottom: var(--space-89); }
.taj__head { max-width: calc(var(--column) + (var(--shell-gutter) * 2)); margin: 0 auto; padding: var(--space-34) var(--shell-gutter) var(--space-21); }
.taj__back, .taj__meta { font: 500 var(--type-meta)/1.2 var(--font-mono); letter-spacing: .1em; text-transform: uppercase; }
.taj__back { color: var(--ink); }
.taj__meta { margin: var(--space-21) 0 var(--space-13); color: var(--signal-cobalt); }
.taj h1, .taj h2 { font-family: var(--font-display); font-weight: 500; letter-spacing: -.05em; }
.taj h1 { max-width: var(--column); margin: 0; font-size: var(--type-h1); line-height: .95; text-wrap: balance; }
.taj__dek { max-width: var(--measure); margin: var(--space-13) 0 0; font: 400 var(--type-dek)/1.3 var(--font-body); }
.taj__hero { max-width: calc(var(--column) + (var(--shell-gutter) * 2)); margin: 0 auto; padding: 0 var(--shell-gutter); }
.taj__hero :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: var(--crop); object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); overflow: hidden; background: var(--signal-field); }
.taj figure figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.taj figure figcaption a { color: var(--signal-cobalt); text-decoration: none; }
.taj__article { max-width: calc(var(--column) + (var(--shell-gutter) * 2)); margin: var(--space-34) auto 0; padding: 0 var(--shell-gutter); display: block; }
.taj__prose { max-width: var(--measure); font: 400 var(--type-body)/1.55 var(--font-body); }
.taj__prose p { margin: 0 0 var(--space-21); }
.taj__prose .taj__lead::first-letter { float: left; margin: 2rem 11rem 0 0; font: 500 5.1em/.72 var(--font-display); color: var(--signal-cobalt); }
.taj__prose a { color: inherit; text-decoration: underline; text-decoration-color: var(--signal-cobalt); text-decoration-thickness: 2px; text-underline-offset: 3px; }
.taj__prose h2 { margin: var(--space-34) 0 var(--space-13); font-size: var(--type-h2); line-height: .98; }
.taj blockquote { margin: var(--space-34) 0; padding: var(--space-21); border-left: var(--stroke) solid var(--ink); background: var(--paper); border-radius: 0; font: 500 var(--type-h2)/1.15 var(--font-display); letter-spacing: -.03em; }
.taj blockquote p { margin: 0; }
.taj__visual { margin: 50rem 0 45rem; }
.taj__visual :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: var(--crop); object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--signal-field); }
.taj__visual--wide :deep(.ed-editorial-image) { aspect-ratio: var(--crop); object-fit: cover; }
.taj__closing { margin-top: 38rem !important; padding-top: 28rem; border-top: var(--stroke) solid var(--ink); font: 500 var(--type-h2)/1.15 var(--font-display); letter-spacing: -.035em; }
.taj__sources { max-width: calc(var(--column) + (var(--shell-gutter) * 2)); margin: var(--space-55) auto 0; padding: var(--space-34) var(--shell-gutter) 0; border-top: var(--stroke) solid var(--ink); }
.taj__sources h2 { margin: var(--space-13) 0 var(--space-21); font-size: var(--type-h1); line-height: .95; }
.taj__sources ol { max-width: 760rem; padding: 0; list-style: none; }
.taj__sources li { padding: var(--space-13) 0; border-top: var(--stroke) solid var(--line); font-size: var(--type-body); line-height: 1.45; }
.taj__sources a { color: inherit; }
.taj__sources span { color: var(--signal-cobalt); font-family: var(--font-mono); }
.taj__sources em { color: var(--ink-soft); }
.taj__newsletter-wrap { max-width: calc(var(--column) + (var(--shell-gutter) * 2)); margin: var(--space-55) auto 0; padding: 0 var(--shell-gutter); }
@media (max-width: 760px) {
  .taj__hero { padding: 0; }
  .taj__hero :deep(.ed-editorial-image) { border-left: 0; border-right: 0; border-radius: 0; aspect-ratio: var(--crop); }
  .taj__article { display: block; }
  .taj__prose h2 { margin-top: 52rem; }
  .taj__visual { margin-left: 0; margin-right: 0; }
}
</style>
