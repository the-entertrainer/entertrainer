<script setup lang="ts">
import { SACRED_FREQUENCIES_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${SACRED_FREQUENCIES_BLOG.socialTitle} · The Entertrainer Blogs`,
  description: SACRED_FREQUENCIES_BLOG.socialHook,
  ogTitle: SACRED_FREQUENCIES_BLOG.socialTitle,
  ogDescription: SACRED_FREQUENCIES_BLOG.socialHook,
  ogUrl: `https://entertrainer.in/elevate/${SACRED_FREQUENCIES_BLOG.slug}`,
  ogImage: `https://entertrainer.in${SACRED_FREQUENCIES_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: SACRED_FREQUENCIES_BLOG.socialTitle,
  twitterDescription: SACRED_FREQUENCIES_BLOG.socialHook,
  twitterImage: `https://entertrainer.in${SACRED_FREQUENCIES_BLOG.hero}`
})

const tones = [174, 285, 396, 417, 528, 639, 741, 852, 963]

const references = [
  {
    id: 1,
    title: 'Solfeggio Frequencies Guide: History, Science & Benefits',
    source: 'Mind Vibrations. Traditional associations for the nine-tone set used in modern sound healing',
    href: 'https://www.mindvibrations.com/solfeggio-frequencies/'
  },
  {
    id: 2,
    title: 'Solfeggio frequencies: list, chart, meaning, generator',
    source: 'Mind University. Field guide to what each tone is used for in the practice',
    href: 'https://mind.university/tools/solfeggio-frequencies'
  },
  {
    id: 3,
    title: 'The Solfeggio Frequencies vs. The Solfège System',
    source: 'Sylvia Villa. How the modern nine-tone list is presented alongside the older singing syllables',
    href: 'https://sylviavilla.com/blog/the-solfeggio-frequencies-vs-the-solfege-system'
  },
  {
    id: 4,
    title: 'Healing Codes for the Biological Apocalypse',
    source: 'Leonard G. Horowitz and Joseph E. Barber, Tetrahedron Publishing LLC, 1999. The book that popularised the modern list',
    href: 'https://books.google.com/books/about/Healing_Codes_for_the_Biological_Apocaly.html?id=0kALAAAACAAJ'
  }
]
</script>

<template>
  <div class="taj">
    <header class="taj__head">
      <NuxtLink to="/elevate" class="taj__back">The Entertrainer Blogs</NuxtLink>
      <p class="taj__meta">{{ SACRED_FREQUENCIES_BLOG.category }} <span aria-hidden="true">·</span> {{ SACRED_FREQUENCIES_BLOG.minutes }} min read</p>
      <h1>{{ SACRED_FREQUENCIES_BLOG.title }}</h1>
      <p class="taj__dek">{{ SACRED_FREQUENCIES_BLOG.dek }}</p>
    </header>

    <figure class="taj__hero">
      <EdEditorialImage :src="SACRED_FREQUENCIES_BLOG.hero" :alt="SACRED_FREQUENCIES_BLOG.heroAlt" />
    </figure>

    <article class="taj__article">
      <EdMarginNote label="Pick a job.">
        <p>Each tone on the list comes with a traditional use. Press one and sit with it.</p>
      </EdMarginNote>

      <div class="taj__prose">
        <p class="taj__lead">Someone presses 528 hertz and calls it the love tone. The room fills with a single, steady pitch — no melody, no lyric — and they sit with it the way you might sit with a tuning fork held to your chest.</p>
        <EdHzRow :hertz="tones" />

        <h2>The nine tones</h2>
        <p>Sound-healing practice treats nine pure tones as a map: 174, 285, 396, 417, 528, 639, 741, 852, and 963 hertz.<a href="#ref-1" aria-label="Reference 1">[1]</a><a href="#ref-2" aria-label="Reference 2">[2]</a> The buttons above are those nine numbers. Each one is a sine at that exact pitch. People listen as a bare tone, as music tuned around it, or as a tuning fork in the hand.</p>
        <p>The six middle pitches — 396 through 852 — are the set that Joseph Puleo and Leonard Horowitz made famous in the late twentieth century.<a href="#ref-3" aria-label="Reference 3">[3]</a><a href="#ref-4" aria-label="Reference 4">[4]</a> 174, 285, and 963 joined the map later, and the nine-tone chart is what most meditation tracks and healing playlists use now.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>What follows is the job each tone is traditionally given. Not a hospital protocol. A field guide to how the practice names them, so you can press one with a clear intention and notice what happens in the body.</p>

        <h2>What each tone is for</h2>
        <p><strong>174 Hz — comfort and safety.</strong> The lowest tone on the list. People reach for it when they want grounding, a sense of security, or ease around pain and tension. It is the “settle the room” pitch.</p>
        <p><strong>285 Hz — healing and renewal.</strong> Listeners use this one for restoration: tissue, energy field, the feeling of something repairing after strain. In the tradition it is the renewal tone.</p>
        <p><strong>396 Hz — liberating fear and guilt.</strong> Linked with the root. People play it when fear or old guilt is loud, and they want a steadier floor under the day.</p>
        <p><strong>417 Hz — facilitating change.</strong> The clearing tone. Used when old patterns need room to leave, and a new situation is trying to arrive. Practitioners call it the undo-and-begin pitch.</p>
        <p><strong>528 Hz — love and transformation.</strong> The most famous of the nine. Often called the love frequency, and in the tradition linked with deep change and the “miracle” / DNA-repair claim. People press it when they want warmth, harmony, or a lift toward love.</p>
        <p><strong>639 Hz — relationships and connection.</strong> The heart-harmony tone. Used for reconciliation, communication, and the soft work of being with other people without armour.</p>
        <p><strong>741 Hz — expression and clarity.</strong> For solving problems, cleansing, and saying what needs saying. Listeners pick it when the throat feels stuck or the mind needs a clear line through noise.</p>
        <p><strong>852 Hz — intuition and spiritual order.</strong> Tied to the third eye in chakra maps. People sit with it when they want quieter knowing, inner order, and a return to what feels coherent.</p>
        <p><strong>963 Hz — oneness and higher connection.</strong> The crown tone. Sometimes called the frequency of the gods. Used for unity, stillness above the chatter, and a sense of belonging to something larger than the day’s list.</p>

        <h2>Listening</h2>
        <p>There is no single correct tone. Many beginners start with 528 because the tradition wraps it in love and ease. Others match the pitch to the job: 174 when the body is tight, 396 when fear is running the room, 639 when a relationship needs soft ground, 963 when the practice is simply to sit open.<a href="#ref-1" aria-label="Reference 1">[1]</a><a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>Try one tone at a time. Fifteen quiet minutes is enough to notice whether the pitch feels useful for the job you brought it. Headphones help if the room is busy. Speakers are fine if you want the tone to fill the space. Volume stays gentle — these are listening tones, not alarms.</p>
        <p>The map is old in spirit and modern in its exact hertz numbers. What it offers today is practical: nine named intentions, nine buttons, and a chance to hear which pitch your body answers.</p>

        <p class="taj__closing">Which tone would you press first — and what job are you bringing to it?</p>
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
.taj__article { max-width: calc(var(--column) + (var(--shell-gutter) * 2)); margin: var(--space-34) auto 0; padding: 0 var(--shell-gutter); display: block; }
.taj__prose { max-width: var(--measure); font: 400 var(--type-body)/1.55 var(--font-body); }
.taj__prose p { margin: 0 0 var(--space-21); }
.taj__prose .taj__lead::first-letter { float: left; margin: 2rem 11rem 0 0; font: 500 5.1em/.72 var(--font-display); color: var(--signal-cobalt); }
.taj__prose a { color: inherit; text-decoration: underline; text-decoration-color: var(--signal-cobalt); text-decoration-thickness: 2px; text-underline-offset: 3px; }
.taj__prose h2 { margin: var(--space-34) 0 var(--space-13); font-size: var(--type-h2); line-height: .98; }
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
  .taj__prose h2 { margin-top: 52rem; }
}
</style>
