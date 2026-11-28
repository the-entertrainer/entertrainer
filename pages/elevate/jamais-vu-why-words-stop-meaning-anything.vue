<script setup lang="ts">
import { JAMAIS_VU_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${JAMAIS_VU_BLOG.socialTitle} · The Entertrainer Blogs`,
  description: JAMAIS_VU_BLOG.socialHook,
  ogTitle: JAMAIS_VU_BLOG.socialTitle,
  ogDescription: JAMAIS_VU_BLOG.socialHook,
  ogUrl: `https://entertrainer.in/elevate/${JAMAIS_VU_BLOG.slug}`,
  ogImage: `https://entertrainer.in${JAMAIS_VU_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: JAMAIS_VU_BLOG.socialTitle,
  twitterDescription: JAMAIS_VU_BLOG.socialHook,
  twitterImage: `https://entertrainer.in${JAMAIS_VU_BLOG.hero}`
})

const references = [
  { id: 1, title: 'Award for study into "the the the the" — the strange feeling of finding words unfamiliar', source: 'University of St Andrews', href: 'https://news.st-andrews.ac.uk/archive/award-for-study-into-the-the-the-the-strange-feeling-of-finding-words-unfamiliar/' },
  { id: 2, title: 'Semantic satiation', source: 'Wikipedia', href: 'https://en.wikipedia.org/wiki/Semantic_satiation' },
  { id: 3, title: 'Semantic Satiation and Cognitive Dynamics', source: 'Jakobovits, Psychological Reports, 1967', href: 'https://journals.sagepub.com/doi/10.1177/002246696700200103' },
  { id: 4, title: 'The Fascinating Science of Déjà Vu', source: 'Psychology Today, Dec 2023', href: 'https://www.psychologytoday.com/us/blog/brain-reboot/202312/the-fascinating-science-of-deja-vu' },
  { id: 5, title: 'Déjà vu experiences in healthy subjects are unrelated to laboratory tests of recollection and familiarity for word stimuli', source: 'Frontiers in Psychology, via PMC', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3842028/' },
  { id: 6, title: 'Tip of the tongue', source: 'Wikipedia, summarising Brown & McNeill, 1966', href: 'https://en.wikipedia.org/wiki/Tip_of_the_tongue' },
  { id: 7, title: 'Revealing the mechanisms of semantic satiation with deep learning models', source: 'Communications Biology, 2024', href: 'https://www.nature.com/articles/s42003-024-06162-0' },
  { id: 8, title: 'The Opposite of Déjà Vu Exists — And It’s Even Stranger', source: 'ScienceAlert', href: 'https://www.sciencealert.com/dj-vu-has-a-stranger-lesser-known-opposite-and-scientists-may-have-just-found-where-it-starts' },
  { id: 9, title: 'Entropy, Amnesia, and Abnormal Déjà Experiences', source: 'Frontiers in Psychology, via PMC', href: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9364811/' }
]
</script>

<template>
<div class="taj">
    <header class="taj__head">
      <NuxtLink to="/elevate" class="taj__back">The Entertrainer Blogs</NuxtLink>
      <p class="taj__meta">{{ JAMAIS_VU_BLOG.category }} <span aria-hidden="true">·</span> {{ JAMAIS_VU_BLOG.minutes }} min read</p>
      <h1>{{ JAMAIS_VU_BLOG.title }}</h1>
      <p class="taj__dek">{{ JAMAIS_VU_BLOG.dek }}</p>
    </header>
    <figure class="taj__hero">
      <EdEditorialImage :src="JAMAIS_VU_BLOG.hero" :alt="JAMAIS_VU_BLOG.heroAlt" />
    </figure>
    <article class="taj__article">
      <EdMarginNote label="The letters stay">
        <p>You can still spell the word and define it. For a short time, it stops feeling like a word.</p>
      </EdMarginNote>
      <div class="taj__prose">
        <p class="taj__lead">One evening at work I stared at the word "door" until it stopped feeling like English.</p>
        <p>The four letters stayed on the screen. I could still spell the word, define it, and use a door. For a short time I could not feel that the letters meant anything.</p>
        <p>The effect already has a research record, a name, and, as of 2023, an Ig Nobel Prize.</p>

        <h2>Repeating a word can drain the meaning</h2>
        <p>The name for the staring effect is semantic satiation. Semantic means "about meaning," and satiation means "filled up." If you repeat a word, or look at it for long enough, the meaning feels weaker, and the marks can feel like shapes with nothing attached.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>Edward Titchener described the feeling informally in the late 1800s. For decades the notes used names such as verbal satiation, lapse of meaning, and mental fatigue. Leon Jakobovits James gave it the current name in a 1962 dissertation.<a href="#ref-2" aria-label="Reference 2">[2]</a><a href="#ref-3" aria-label="Reference 3">[3]</a></p>
        <p>A related effect is jamais vu, French for "never seen." Something you know well suddenly feels unfamiliar. Akira O'Connor, who studies it, describes the feeling as finding something peculiar when you know it should be familiar.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>

        <figure class="taj__visual taj__visual--archive" style="--fig-ratio: 1800 / 1582">
          <EdEditorialImage
            src="/blog/jamais-vu-why-words-stop-meaning-anything/eakins-writing-master-1882.jpg"
            alt="Thomas Eakins portrait of an elderly writing master in a dark suit, bent over a sheet of penmanship at a table."
          />
          <figcaption>
            Image: Public Domain /
            <a href="https://www.metmuseum.org/art/collection/search/10828" target="_blank" rel="noreferrer">The Metropolitan Museum of Art</a>,
            Thomas Eakins, 1882
          </figcaption>
        </figure>

        <h2>A lab made the feeling happen on purpose</h2>
        <p>In 2023 Chris Moulin, Nicole Bell, and Akira O'Connor, at the University of St Andrews, won the Ig Nobel Prize in Literature for producing the effect with pens and a stopwatch.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>Ninety-four undergraduates copied a word by hand, over and over, and stopped when the word began to feel wrong. Some words were ordinary, such as "door." Some words were rare, such as "sward." Across two experiments, about two-thirds of the students reported the word turning strange, usually after about thirty repetitions, inside a single minute.<a href="#ref-1" aria-label="Reference 1">[1]</a> The paper's title is "The The The The Induction of Jamais Vu in the Laboratory."</p>
        <p>About sixty seconds of copying was enough to make a daily word feel unfamiliar. The students had not forgotten the word. They still knew that "door" is English. For a short time, knowing the word and feeling that it was familiar came apart.</p>

        <h2>Related memory feelings</h2>
        <p>Deja vu is a related feeling in the other direction. A new moment feels as if it has happened before. One reading says the brain's familiarity check raises a false alarm before the moment becomes a false memory.<a href="#ref-4" aria-label="Reference 4">[4]</a> The false-alarm reading is an interpretation, not a settled result, and everyday deja vu does not match the usual lab tests of memory.<a href="#ref-5" aria-label="Reference 5">[5]</a></p>
        <p>Tip of the tongue is another related feeling. You know that you know the word. You may know its first letter and how many syllables it has. The word still does not come to mind.<a href="#ref-6" aria-label="Reference 6">[6]</a></p>
        <p>In 2024 one team used deep-learning models to propose how satiation might work.<a href="#ref-7" aria-label="Reference 7">[7]</a> The study used artificial networks, and the mechanism is still argued.<a href="#ref-8" aria-label="Reference 8">[8]</a><a href="#ref-9" aria-label="Reference 9">[9]</a> The reported feeling is clearer than the mechanism. If people copy a word about thirty times, many of them say the word went strange.</p>
        <p>Familiar often seems to belong to the object itself. The copying experiment suggests a narrower claim. The feeling of familiarity can drop while the knowledge stays, if you keep looking at the same word.</p>

        <blockquote>
          <p>You still know the word. For a short time, it does not feel like one.</p>
        </blockquote>

        <p class="taj__closing">About thirty repetitions can make "door" feel unfamiliar, even though you still know what the word means.</p>
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
}
</style>
