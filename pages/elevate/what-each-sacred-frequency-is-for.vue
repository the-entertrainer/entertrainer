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
    source: 'Mind Vibrations. The nine tones and the job each is traditionally given in sound healing',
    href: 'https://www.mindvibrations.com/solfeggio-frequencies/'
  },
  {
    id: 2,
    title: 'Solfeggio frequencies: list, chart, meaning, generator',
    source: 'Mind University. Names, uses, and chakra pairings for each tone in the practice',
    href: 'https://mind.university/tools/solfeggio-frequencies'
  },
  {
    id: 3,
    title: 'Ut queant laxis',
    source: 'Wikipedia. The hymn to John the Baptist that gave Guido of Arezzo the syllables ut, re, mi, fa, sol, la',
    href: 'https://en.wikipedia.org/wiki/Ut_queant_laxis'
  },
  {
    id: 4,
    title: 'The Solfeggio Frequencies vs. The Solfège System',
    source: 'Sylvia Villa. Joseph Puleo’s six tones in the 1970s, and the three added later',
    href: 'https://sylviavilla.com/blog/the-solfeggio-frequencies-vs-the-solfege-system'
  },
  {
    id: 5,
    title: 'Healing Codes for the Biological Apocalypse',
    source: 'Leonard G. Horowitz and Joseph E. Barber, Tetrahedron Publishing LLC, 1999',
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
      <EdMarginNote label="Claims, not test results">
        <p>Each tone below is a use that sound-healing practice assigns. The list is not a clinical trial.</p>
      </EdMarginNote>

      <div class="taj__prose">
        <p class="taj__lead">A woman at a counter held two tuning forks, one marked 396 and one marked 528.</p>
        <p>The shopkeeper had said that 396 was for fear and guilt, and that 528 was for love. She had to choose which problem the fork was naming.</p>
        <p>A struck fork gives one pitch. You can play the nine pitches on this page. People call them the sacred frequencies, or the Solfeggio frequencies. Each control plays one pure sine tone.</p>
        <EdHzRow :hertz="tones" />

        <h2>The nine numbers and where the names come from</h2>
        <p>The nine numbers are 174, 285, 396, 417, 528, 639, 741, 852, and 963 hertz. In sound-healing practice, each number is given a job.<a href="#ref-1" aria-label="Reference 1">[1]</a><a href="#ref-2" aria-label="Reference 2">[2]</a> Practitioners hold forks near the chest, play long tracks for sleep, or tune songs to these pitches.</p>
        <p>The middle six borrow the old singing syllables ut, re, mi, fa, sol, and la. Around the year 1000, a Benedictine monk named Guido of Arezzo took those syllables from the first word of each line of a hymn to John the Baptist.<a href="#ref-3" aria-label="Reference 3">[3]</a> The hymn asks for singers' voices to be freed. One line asks for guilt to be washed from stained lips.</p>

        <figure class="taj__visual taj__visual--manuscript">
          <EdEditorialImage
            src="/blog/sacred-frequencies/monks-singing-1476.jpg"
            alt="Fifteenth-century manuscript illumination of black-robed monks singing before a lectern with an open choir book, inside a gilded initial K."
          />
          <figcaption>
            Image: Public Domain /
            <a href="https://www.metmuseum.org/art/collection/search/929276" target="_blank" rel="noreferrer">The Metropolitan Museum of Art</a>,
            choir book leaf, 1476
          </figcaption>
        </figure>

        <p>The numbers, as the usual story tells it, appeared in the 1970s. Joseph Puleo worked with the Book of Numbers and concluded that six healing tones were in its verses.<a href="#ref-4" aria-label="Reference 4">[4]</a> Leonard Horowitz carried the six into a 1999 book. Later teachers added 174, 285, and 963.<a href="#ref-4" aria-label="Reference 4">[4]</a><a href="#ref-5" aria-label="Reference 5">[5]</a> The story is a history of the list. It is not a measurement that the verses contain those pitches.</p>

        <h2>What the low tones are said to be for</h2>
        <p>174 Hz is the lowest note on the list. The practice assigns it comfort, safety, and the easing of pain and tension.</p>
        <p>285 Hz is assigned to healing and renewal. Practitioners say it restores tissue and what they call the energy field. 174 is the "you are safe" claim, and 285 is the "you can mend" claim.</p>
        <p>396 Hz carries ut, the first syllable of Guido's hymn, and the assigned job is releasing fear and guilt.<a href="#ref-2" aria-label="Reference 2">[2]</a><a href="#ref-3" aria-label="Reference 3">[3]</a> Practitioners tie it to the base of the spine. 417 Hz, re, is assigned to change, including leaving a stuck situation and clearing an old pattern.</p>

        <h2>What the middle tones are said to be for</h2>
        <p>528 Hz is the best known of the nine. Its syllable is mi. The tradition assigns it love and transformation. Some circles also credit it with repairing DNA, which is why it appears on more playlists than the other eight.<a href="#ref-1" aria-label="Reference 1">[1]</a><a href="#ref-2" aria-label="Reference 2">[2]</a> The DNA claim is a claim inside that tradition. It is not a result shown in the sources used here.</p>
        <p>639 Hz, fa, is assigned to relationships and connection, including reconciliation and honest conversation.</p>

        <h2>What the high tones are said to be for</h2>
        <p>741 Hz, sol, is assigned to the throat, and to expression, clarity, and solving problems.</p>
        <p>852 Hz, la, is assigned to intuition and to what the practice calls a return to spiritual order.</p>
        <p>963 Hz is assigned to the crown of the head, and to a feeling of oneness or belonging to something larger than a task list.</p>

        <h2>How to read the list</h2>
        <p>Put all nine forks on a counter and many people pick 528 first, because love is an easier label to buy than fear or guilt. If the counter shows a clean 528, a 396, and a damaged second 528, the clean 528 can look like the safe choice, and the 396 can drop out of the choice. The damaged fork changes the comparison. It does not change the pitches.</p>
        <p>The tradition places fear and guilt below love on the list. Guido's singers asked, about a thousand years earlier, for guilt to be washed away before the singing.</p>
        <p>If you play one, the tradition's own instruction is to pick the tone that names the week you are actually in. Use 174 when the body is tight, 285 when you are worn out, 396 when fear is the main problem, 417 when you are stuck, 528 when you want warmth, 639 when a relationship feels distant, 741 when the words will not come, 852 when you want a quieter mind, and 963 when you want a wider sense of belonging. Keep the volume low, give the tone about fifteen quiet minutes, and notice what changes. The effect is a personal report, not a measured cure.</p>
        <p>In one version of the shop story, the woman bought the 396 and said love could wait. A list of nine tones is also a list of nine named problems. The hard step is naming the problem, not reading the number of hertz.</p>

        <p class="taj__closing">Each tone is a different name for a problem or a hope, and the list does not prove that the pitch produces the result.</p>
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
.taj__visual { margin: 50rem 0 45rem; }
.taj__visual :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: 1800 / 1604; object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); overflow: hidden; background: var(--signal-field); }
.taj figure figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.taj .taj__prose figure figcaption a { color: inherit; text-decoration: underline; text-decoration-color: var(--line); text-decoration-thickness: 1px; text-underline-offset: 3px; }
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
