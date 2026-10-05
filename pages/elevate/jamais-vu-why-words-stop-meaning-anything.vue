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
      <EdMarginNote label="The letters stay.">
        <p>For a minute, the feeling that they mean something leaves.</p>
      </EdMarginNote>
      <div class="taj__prose">
        <p class="taj__lead">One evening at work I stared at the word “door” until it stopped looking like English.</p>
        <p>Same four letters. Suddenly a pile of shapes. I still knew it was a word. I just could not feel that anymore. The wall I hit already had a research literature — and, as of 2023, an Ig Nobel Prize.</p>

        <h2>Semantic satiation</h2>
        <p>The lab name for the staring trick is semantic satiation. Repeat a word, or look at it long enough, and the meaning drops out. What is left feels like sound, or ink, with nothing attached.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>Edward Titchener noted the feeling informally in the late 1800s. It picked up working names — verbal satiation, lapse of meaning, plain mental fatigue — before Leon Jakobovits James gave it the current name in his 1962 dissertation.<a href="#ref-2" aria-label="Reference 2">[2]</a><a href="#ref-3" aria-label="Reference 3">[3]</a> So the wall over “door” already had a name before I was born.</p>
        <p>Jamais vu is the stranger cousin: something you know feels unfamiliar, as if you are meeting it for the first time. Akira O’Connor put it this way: the strange feeling of finding something peculiar when we know it should be familiar.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>

        <h2>Laboratory copying experiments</h2>
        <p>In 2023 Chris Moulin, Nicole Bell, and Akira O’Connor at the University of St Andrews won the Ig Nobel Prize in Literature for measuring the glitch on purpose, with a stopwatch.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>Ninety-four undergraduates copied a word by hand, over and over, and stopped when it started to feel wrong. Some words were ordinary (“door”). Some were obscure (“sward”). Across two experiments, roughly two-thirds of them reported the word turning strange — typically after about 30 repetitions, inside a single minute.<a href="#ref-1" aria-label="Reference 1">[1]</a> The paper’s title tells the joke before you can: “The The The The Induction of Jamais Vu in the Laboratory.”</p>
        <p>You do not forget the word. You still know “door” is English. For a stretch, the knowing and the feeling come apart.</p>

        <h2>Déjà vu and related glitches</h2>
        <p>The family is bigger than one glitch. Déjà vu is the mirror: a brand-new moment feels like a rerun. On one influential reading, that is a fact-checker catching a false alarm before it becomes a false memory.<a href="#ref-4" aria-label="Reference 4">[4]</a> That is an interpretation, not a settled law. Everyday déjà vu reports do not line up neatly with standard lab tests of recollection and familiarity for words; the full mechanism is still open.<a href="#ref-5" aria-label="Reference 5">[5]</a></p>
        <p>Tip of the tongue is another cousin. You know you know the word, and the word will not arrive.<a href="#ref-6" aria-label="Reference 6">[6]</a></p>
        <p>A 2024 paper used deep-learning models to poke at how satiation might work.<a href="#ref-7" aria-label="Reference 7">[7]</a> That is a hypothesis built from an artificial model, not direct proof of a living brain, and it is one study. The evidence is mixed on the mechanism. It is not mixed on the feeling. Copy a word thirty times and a lot of people will tell you it went strange.</p>
        <p>The opposite of déjà vu has its own small write-ups, and the stranger memory theories get tangled fast.<a href="#ref-8" aria-label="Reference 8">[8]</a><a href="#ref-9" aria-label="Reference 9">[9]</a> None of that cancels the copying result. It just refuses to turn one glitch into a complete map of memory.</p>

        <blockquote>
          <p>You still know the word. For a minute, it refuses to feel like one.</p>
        </blockquote>

        <p class="taj__closing">If thirty repetitions can make “door” feel like a stranger, what else in your day is only familiar because you stopped looking?</p>
        <p>Stare a little longer than habit wants. Then let the word come back.</p>
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
@media (max-width: 760px) {
  .taj__hero { padding: 0; }
  .taj__hero :deep(.ed-editorial-image) { border-left: 0; border-right: 0; border-radius: 0; aspect-ratio: var(--crop); }
  .taj__article { display: block; }
  .taj__prose h2 { margin-top: 52rem; }
}
</style>
