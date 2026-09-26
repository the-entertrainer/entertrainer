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
      <aside class="taj__margin-note" aria-label="Reading note">
        <p>The word stays a word.</p>
        <p>Your knowledge that “door” is real does not change. For a minute, it just stops feeling like one.</p>
      </aside>
      <div class="taj__prose">
        <p class="taj__lead">One evening at work I stared at the word “door” until it stopped looking like English.</p>
        <p>Same four letters. Suddenly a pile of shapes. I had walked into a glitch with a name, a research literature, and — as of 2023 — an Ig Nobel Prize.</p>
        <h2>The meaning drops out</h2>
        <p>The lab name for the staring trick is semantic satiation. Repeat a word, or look at it long enough, and the meaning drops out. What is left feels like sound, or ink, with nothing attached.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>Edward Titchener noted the feeling informally in the late 1800s. It picked up working names — verbal satiation, lapse of meaning, plain mental fatigue — before Leon Jakobovits James gave it the current name in his 1962 dissertation.<a href="#ref-2" aria-label="Reference 2">[2]</a><a href="#ref-3" aria-label="Reference 3">[3]</a></p>
        <p>So the wall I hit over “door” already had a name before I was born.</p>
        <p>Jamais vu is the stranger cousin: something you know feels unfamiliar, as if you are meeting it for the first time. Akira O’Connor put it this way: the strange feeling of finding something peculiar when we know it should be familiar.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <h2>Copy the word until it breaks</h2>
        <p>In 2023 Chris Moulin, Nicole Bell, and Akira O’Connor at the University of St Andrews won the Ig Nobel Prize in Literature for measuring the glitch on purpose, with a stopwatch.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>Ninety-four undergraduates copied a word by hand, over and over, and stopped when it started to feel wrong. Some words were ordinary (“door”). Some were obscure (“sward”). Across two experiments, roughly two-thirds of them reported the word turning strange — typically after about 30 repetitions, inside a single minute.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>The paper’s title tells the joke before you can: “The The The The Induction of Jamais Vu in the Laboratory.”</p>
        <p>You do not forget the word. You still know “door” is English. For a stretch, the knowing and the feeling come apart.</p>
        <figure class="taj__visual">
          <EdEditorialImage src="/blog/jamais-vu/checking-loop.svg" alt="A simple loop: see the word, check the meaning, see the word again, until the check comes back empty." />
          <figcaption>Repetition keeps asking “is this still a word?” until the answer briefly fails.</figcaption>
        </figure>
        <h2>The rest of the family</h2>
        <p>The family is bigger than one glitch.</p>
        <p>Déjà vu is the mirror. A brand-new moment feels like a rerun. On one influential reading, that is a fact-checker catching a false alarm before it becomes a false memory.<a href="#ref-4" aria-label="Reference 4">[4]</a> That is an interpretation, not a settled law.</p>
        <p>Everyday déjà vu reports do not line up neatly with standard lab tests of recollection and familiarity for words. Polite version: the full mechanism is still open.<a href="#ref-5" aria-label="Reference 5">[5]</a></p>
        <p>Tip of the tongue is another cousin. You know you know the word, and the word will not arrive.<a href="#ref-6" aria-label="Reference 6">[6]</a></p>
        <p>A 2024 paper used deep-learning models to poke at how satiation might work.<a href="#ref-7" aria-label="Reference 7">[7]</a> Where I have to be honest: that is a hypothesis built from an artificial model, not direct proof of a living brain, and it is one study. The evidence is mixed on the mechanism. It is not mixed on the feeling. Copy a word thirty times and a lot of people will tell you it went strange.</p>
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
