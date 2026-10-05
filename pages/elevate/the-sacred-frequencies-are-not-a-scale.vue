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
    title: 'Ut queant laxis',
    source: 'Wikipedia, accessed 5 Oct 2026. Hymn text traditionally attributed to Paulus Diaconus; solmization syllables',
    href: 'https://en.wikipedia.org/wiki/Ut_queant_laxis'
  },
  {
    id: 2,
    title: 'Guido d’Arezzo',
    source: 'Encyclopaedia Britannica. Born c. 990, died 1050; solmization from Ut queant laxis; no evidenced link to the Guidonian hand',
    href: 'https://www.britannica.com/biography/Guido-dArezzo-Italian-musician'
  },
  {
    id: 3,
    title: 'What are sacred frequencies?',
    source: 'GotQuestions.org. Puleo’s six numbers from Numbers 7:12–83; hertz as a late-nineteenth-century measure',
    href: 'https://www.gotquestions.org/sacred-frequencies.html'
  },
  {
    id: 4,
    title: 'Healing Codes for the Biological Apocalypse',
    source: 'Leonard G. Horowitz and Joseph E. Barber, Tetrahedron Publishing LLC, 1999. Bibliographic record',
    href: 'https://books.google.com/books/about/Healing_Codes_for_the_Biological_Apocaly.html?id=0kALAAAACAAJ'
  },
  {
    id: 5,
    title: 'There is no evidence to support claim that Solfeggio frequencies remove toxins from the body',
    source: 'Science Feedback, Ian Le Guillou, 30 Sep 2022',
    href: 'https://science.feedback.org/review/no-evidence-support-claim-solfeggio-frequencies-remove-toxins-from-body/'
  },
  {
    id: 6,
    title: 'Solfeggio Frequencies',
    source: 'Craig Good, Skeptoid Podcast #474, 7 Jul 2015',
    href: 'https://skeptoid.com/episodes/474'
  },
  {
    id: 7,
    title: 'The Effects of 528 Hz Sound Wave to Reduce Cell Death in Human Astrocyte Primary Cell Culture Treated with Ethanol',
    source: 'Babayi and Riazi, Journal of Addiction Research & Therapy, 2017',
    href: 'https://www.omicsonline.org/open-access/the-effects-of-528-hz-sound-wave-to-reduce-cell-death-in-human-astrocyteprimary-cell-culture-treated-with-ethanol-2155-6105-1000335.php?aid=91771'
  },
  {
    id: 8,
    title: 'Influence of various intensities of 528 Hz sound-wave in production of testosterone in rat’s brain and analysis of behavioral changes',
    source: 'Babayi Daylari, Riazi, Pooyan, Fathi, and Hedayati Katouli, Genes & Genomics, published 9 Nov 2018',
    href: 'https://link.springer.com/article/10.1007/s13258-018-0753-6'
  },
  {
    id: 9,
    title: 'Solfeggio frequencies',
    source: 'RationalWiki. The nine-number list as promoted, and the misuse of the solfège name',
    href: 'https://rationalwiki.org/wiki/Solfeggio_frequencies'
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
      <EdMarginNote label="Hold this.">
        <p>A fourth is a ratio. Most of these gaps are just a count of hertz.</p>
      </EdMarginNote>

      <div class="taj__prose">
        <p class="taj__lead">Set a generator to 396 hertz, then to 528. The second tone is not a vague lift. 528 divided by 396 is exactly 4/3, a perfect fourth, 498 cents. On a piano a fourth is 500 cents. The list that holds those two numbers is still sold as a sacred scale.</p>
        <EdHzRow :hertz="tones" />

        <h2>The nine numbers</h2>
        <p>The pitches people put on that list are 174, 285, 396, 417, 528, 639, 741, 852, and 963 hertz.<a href="#ref-9" aria-label="Reference 9">[9]</a> The buttons above are those nine numbers and nothing else. Each one is a sine at that exact count of cycles per second.</p>
        <p>Count the gaps, in hertz: 111, 111, 21, 111, 111, 102, 111, 111. From 417 up, five of the six gaps are 111 hertz. The exception is 639 to 741, which is 102. A scale step is a ratio, not a fixed pile of cycles. Musicians measure the ratio in cents. An octave is 1,200 of them. The same 111 hertz is a wide jump at the bottom of the list, about 854 cents from 174 to 285, and a much smaller one at the top, about 212 cents from 852 to 963. A scale that stepped by one musical interval would keep the same cents. This list does not.</p>
        <p>Two skips do land on ordinary intervals. 852 divided by 639 is also exactly 4/3, the same fourth, 498 cents. 963 divided by 639 is about 8 cents sharper than 3/2, a just perfect fifth. Those are real facts about pairs. They are not a scale running from neighbor to neighbor. The next tone after 396 is 417, about 89 cents higher, which is under a semitone.</p>

        <h2>Ut queant laxis</h2>
        <p>Solfeggio, or solfège, is a way to teach singing by giving syllables to scale degrees. Guido of Arezzo, a Benedictine theorist born around 990 and dead in 1050, is credited with taking ut, re, mi, fa, sol, and la from the hymn Ut queant laxis, sung for John the Baptist.<a href="#ref-1" aria-label="Reference 1">[1]</a><a href="#ref-2" aria-label="Reference 2">[2]</a> In that melody the first six phrases each start one step higher. The syllables name those steps relative to each other. Mi to fa is the half step. They do not name a number of vibrations per second.</p>
        <p>The hymn’s words are traditionally credited to Paulus Diaconus, an eighth-century historian. Who wrote the tune is not settled. Guido may have composed it. He more likely used a melody already around.<a href="#ref-1" aria-label="Reference 1">[1]</a> The hand chart later called the Guidonian hand has no evidenced connection to Guido himself.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>The unit hertz is named for Heinrich Hertz, who lived from 1857 to 1894. Measuring pitch as a count of cycles per second, in hertz, is a late nineteenth-century practice.<a href="#ref-3" aria-label="Reference 3">[3]</a> An eleventh-century lesson cannot have been a table of these nine numbers. We also cannot recover the exact frequency a choir sang then.<a href="#ref-5" aria-label="Reference 5">[5]</a></p>

        <h2>Numbers, chapter 7</h2>
        <p>The six tones in the middle — 396, 417, 528, 639, 741, and 852 — are the ones Joseph Puleo is reported to have taken from Numbers 7.<a href="#ref-3" aria-label="Reference 3">[3]</a> The chapter is a list of offerings. Puleo looked for patterns in the numbers, including the verse numbers, and treated the results as hertz with healing power. Accounts place that work in the 1970s.<a href="#ref-5" aria-label="Reference 5">[5]</a> The book those accounts point to is Healing Codes for the Biological Apocalypse, by Leonard G. Horowitz and Joseph E. Barber, published by Tetrahedron in 1999.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>Sources do not even agree how many tones belong in the set. A 2022 review notes claims of anywhere from six frequencies to nine.<a href="#ref-5" aria-label="Reference 5">[5]</a> Craig Good’s Skeptoid episode of 7 July 2015 walks the same story and says 629 hertz for the step the usual list sets at 639. The same episode records a promoter who prefers 432.<a href="#ref-6" aria-label="Reference 6">[6]</a> The syllables ut through la sometimes get pasted onto 396 through 852. That is a second job for words that already meant scale degrees. It does not turn the hertz values into the hymn.</p>

        <h2>What the studies actually measured</h2>
        <p>The advertised jobs are specific and large. Promoters say 396 hertz liberates guilt and fear, and that 528 hertz does transformation and miracles, including DNA repair.<a href="#ref-6" aria-label="Reference 6">[6]</a><a href="#ref-9" aria-label="Reference 9">[9]</a> There is no good evidence for those jobs. In 2022 Science Feedback reviewed a viral claim that 741 hertz could regenerate the body, remove toxins, and remove negativity. The verdict was inadequate support: no scientific or clinical evidence for 741 hertz or for the other so-called solfeggio frequencies, and no plausible way an ordinary audible tone would do the detox work of the liver and the kidneys.<a href="#ref-5" aria-label="Reference 5">[5]</a> Claims that a particular frequency treats disease, or causes a miracle, are not supported.<a href="#ref-6" aria-label="Reference 6">[6]</a></p>
        <p>Laboratory papers exist, and they are narrower than the labels. In 2017 Tohid Babayi and Gholam Hossein Riazi played 528 hertz to human astrocyte cells in a dish after dosing the cells with ethanol. The abstract reports higher viability, about 20 percent, and lower reactive oxygen species. The results text ties the gentler loudness to about 80 decibels. They did not measure DNA repair. The sentence in that paper that says 528 hertz repairs DNA cites Horowitz’s book.<a href="#ref-7" aria-label="Reference 7">[7]</a> In 2018 the same group played 528 hertz at 100 decibels to rats and reported changes in genes tied to testosterone in brain tissue, lower reactive oxygen species, and less anxiety-like behavior in the animals.<a href="#ref-8" aria-label="Reference 8">[8]</a> One hundred decibels is a loud machine, not a quiet track. A dish of cells and a rat cage are not a person getting well.</p>
        <p>Neither result shows that these tones heal, repair DNA, or do the spiritual jobs on the playlist. Music can still change a mood. That does not require this list, and it does not make the list a scale.</p>

        <p class="taj__closing">If 528 over 396 was a fourth the whole time, what was left for the word sacred to add?</p>
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
