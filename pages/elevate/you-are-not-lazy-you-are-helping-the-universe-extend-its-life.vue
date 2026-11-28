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
  { id: 4, title: 'Ask an Astrophysicist: Cosmology', source: 'NASA Goddard Space Flight Center', href: 'https://imagine.gsfc.nasa.gov/ask_astro/cosmology.html' },
  { id: 5, title: 'entropy, etymology', source: 'Online Etymology Dictionary. Coined by Rudolf Clausius in 1865 from Greek for a turning or transformation', href: 'https://www.etymonline.com/word/entropy' }
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
      <EdMarginNote label="Where the heat goes">
        <p>The heat leaves the hot tea and spreads into the cooler room. After the temperatures match, the tea cannot heat itself again.</p>
      </EdMarginNote>

      <div class="taj__prose">
        <p class="taj__lead">You pour the tea, answer one message, and the tea is no longer hot.</p>
        <p>The heat did not leave the universe, and it did not move into your phone. The heat moved into the cooler air, the table, and your hand, until the cup and the room were close to the same temperature.<a href="#ref-1" aria-label="Reference 1">[1]</a> You notice the change because the drink is no longer hot. The room is large, so the room's temperature barely changes.</p>
        <p>A hot cup is useful because the tea is hotter than the things around it, and that difference can warm your hands. A charged phone is useful because its battery is not in the same state as an empty battery. When the difference is gone, the energy is still in the room, but you cannot use it to heat the tea again.</p>

        <h2>Heat moves until the temperatures match</h2>
        <p>In 1865 Rudolf Clausius gave the spread a name, entropy. He built the word from a Greek word for transformation, and he chose a form that would sit beside the word energy.<a href="#ref-5" aria-label="Reference 5">[5]</a> Energy is the amount. Entropy is a measure of how spread out, and how unavailable for work, that energy has become.<a href="#ref-1" aria-label="Reference 1">[1]</a> The second law of thermodynamics says that, if you leave the cup alone, the spread goes one way. The tea does not become hot again by itself.</p>

        <figure class="taj__visual taj__visual--archive taj__visual--portrait" style="--fig-ratio: 1099 / 1500">
          <EdEditorialImage
            src="/blog/you-are-not-lazy-you-are-helping-the-universe-extend-its-life/tissot-tea-1872.jpg"
            alt="James Tissot painting of a young woman in a black bonnet pouring from a silver tea urn at a table by a window."
          />
          <figcaption>
            Image: Public Domain /
            <a href="https://www.metmuseum.org/art/collection/search/438098" target="_blank" rel="noreferrer">The Metropolitan Museum of Art</a>,
            James Tissot, 1872
          </figcaption>
        </figure>

        <h2>Rest does not stop the spread</h2>
        <p>A common joke says that if everything is running down, then lying in bed helps the universe. The joke is not correct. A day with fewer trips and less cooking uses less fuel. A person lying still is still breathing, digesting food, and keeping a warm body in a cooler room, so the body still sends heat into the room. A phone resting on the chest warms up too.</p>
        <p>A block of real work, a nap, and an afternoon of many open browser tabs are three different uses of time. The afternoon of tabs often finishes less work than the work block, and it gives less rest than the nap. People still often treat the busy-looking afternoon as more acceptable than the nap. The open tabs do not change the physics. The open tabs change the social judgment.</p>
        <p>Tidying a room is a separate question. Physics does not score where the socks are. A fridge stays cold by moving heat out of the back of the machine, and folding a shirt uses a little energy that leaves as warmth.<a href="#ref-2" aria-label="Reference 2">[2]</a> You can make one place more ordered. The heat cost is paid somewhere else.</p>

        <h2>Stored information also makes heat</h2>
        <p>Photos and messages are stored as physical states in a device, and changing those states warms the device. Erasing one bit of information has a minimum energy cost in physics, and real machines use more than that minimum.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>

        <figure class="taj__visual taj__visual--wide">
          <EdEditorialImage
            src="/blog/entropy-laziness/hubble-ultra-deep-field.jpg"
            alt="The Hubble Ultra Deep Field: thousands of galaxies packed into a small patch of sky."
          />
          <figcaption>Image: NASA, ESA, S. Beckwith and the HUDF Team, and B. Mobasher</figcaption>
        </figure>

        <p>If the same spread continues until no large temperature differences remain, astronomers call one possible ending heat death.<a href="#ref-4" aria-label="Reference 4">[4]</a> The tea is a small example of the same one-way spread. A heartbeat, a sunrise, and a hot drink all happen while a temperature difference, or some other usable difference, is still there.</p>

        <blockquote>
          <p>A usable difference becomes an even state, and the useful work happens while the difference is still there.</p>
        </blockquote>

        <p class="taj__closing">The tea did not fail. The heat moved from the cup into the room, which is what heat does when one thing is hotter than another.</p>
        <p>You can rest, and you can pour a fresh cup while the new cup is still hotter than the room.</p>
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
/* Pen rewrite: archival figures keep their own proportions; credit links stay quiet ink. */
.taj__visual { margin: 50rem 0 45rem; }
.taj__visual--archive :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: var(--fig-ratio, var(--crop)); object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); overflow: hidden; background: var(--signal-field); }
.taj__visual--portrait { max-width: 440rem; }
.taj .taj__prose figure figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.taj .taj__prose figure figcaption a { color: inherit; text-decoration: underline; text-decoration-color: var(--line); text-decoration-thickness: 1px; text-underline-offset: 3px; }
@media (max-width: 760px) {
  .taj__hero { padding: 0; }
  .taj__hero :deep(.ed-editorial-image) { border-left: 0; border-right: 0; border-radius: 0; aspect-ratio: var(--crop); }
  .taj__article { display: block; }
  .taj__prose h2 { margin-top: 52rem; }
  .taj__visual { margin-left: 0; margin-right: 0; }
}
</style>
