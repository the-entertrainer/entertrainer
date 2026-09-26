<script setup lang="ts">
import { LIFE_MIDPOINT_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${LIFE_MIDPOINT_BLOG.socialTitle} · The Entertrainer Blogs`,
  description: LIFE_MIDPOINT_BLOG.socialHook,
  ogTitle: LIFE_MIDPOINT_BLOG.socialTitle,
  ogDescription: LIFE_MIDPOINT_BLOG.socialHook,
  ogUrl: `https://entertrainer.in/elevate/${LIFE_MIDPOINT_BLOG.slug}`,
  ogImage: `https://entertrainer.in${LIFE_MIDPOINT_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: LIFE_MIDPOINT_BLOG.socialTitle,
  twitterDescription: LIFE_MIDPOINT_BLOG.socialHook,
  twitterImage: `https://entertrainer.in${LIFE_MIDPOINT_BLOG.hero}`
})

const references = [
  { id: 1, title: 'Paul Janet and Changes in the Apparent Speed of Passage of Time with Aging', source: 'Timing & Time Perception, 2022', href: 'https://brill.com/abstract/journals/time/10/3/article-p279_006.xml' },
  { id: 2, title: 'Logtime: Logarithmic Time Perception With Aging', source: 'James Main Kenney', href: 'https://kafalas.com/Logtime.html' },
  { id: 3, title: 'What is your earliest memory? It depends', source: 'Memory, 2021', href: 'https://www.tandfonline.com/doi/full/10.1080/09658211.2021.1918174' },
  { id: 4, title: 'The Fate of Childhood Memories: Children Postdated Their Earliest Memories as They Grew Older', source: 'Frontiers in Psychology, via PMC', href: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4709485/' },
  { id: 5, title: 'Aging and the speed of time', source: 'Friedman & Janssen, Acta Psychologica, 2010', href: 'https://www.sciencedirect.com/science/article/abs/pii/S0001691810000132' },
  { id: 6, title: 'Why the Days Seem Shorter as We Get Older', source: 'Bejan, European Review, 2019', href: 'https://www.cambridge.org/core/journals/european-review/article/why-the-days-seem-shorter-as-we-get-older/2CB8EC9B0B30537230C7442B826E42F1' },
  { id: 7, title: 'On Soft Mathematical Models of Subjective Time Acceleration with Age', source: 'arXiv, 2023', href: 'https://arxiv.org/abs/2310.05945' },
  { id: 8, title: 'How does U.S. life expectancy compare to other countries?', source: 'Peterson-KFF Health System Tracker', href: 'https://www.healthsystemtracker.org/chart-collection/u-s-life-expectancy-compare-countries/' }
]
</script>

<template>
<div class="taj">
    <header class="taj__head">
      <NuxtLink to="/elevate" class="taj__back">The Entertrainer Blogs</NuxtLink>
      <p class="taj__meta">{{ LIFE_MIDPOINT_BLOG.category }} <span aria-hidden="true">·</span> {{ LIFE_MIDPOINT_BLOG.minutes }} min read</p>
      <h1>{{ LIFE_MIDPOINT_BLOG.title }}</h1>
      <p class="taj__dek">{{ LIFE_MIDPOINT_BLOG.dek }}</p>
    </header>
    <figure class="taj__hero">
      <EdEditorialImage :src="LIFE_MIDPOINT_BLOG.hero" :alt="LIFE_MIDPOINT_BLOG.heroAlt" />
    </figure>
    <article class="taj__article">
      <aside class="taj__margin-note" aria-label="Reading note">
        <p>18 is an output.</p>
        <p>It is what the formula says when you pick age 4 and a life of 81. Change either number and the middle moves.</p>
      </aside>
      <div class="taj__prose">
        <p class="taj__lead">A video told me the middle of an 81-year life is 18, not 40.</p>
        <p>The maths is real. It is also about 150 years old. It was never really “discovered,” and the honest version has three asterisks the voiceover skipped.</p>
        <h2>A year is not always one year</h2>
        <p>We quietly assume a year is a year. Age 4 to 5 is one unit. Age 40 to 41 is one unit. A clock does not care how old you are.</p>
        <p>Felt time does. In 1877 the French philosopher Paul Janet proposed a simple account: the felt length of a year is proportional to how much life you have already lived.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>To a 10-year-old, one year is a tenth of everything they have known. To a 50-year-old, the same 365 days is a fiftieth. Same calendar year. Different denominator.</p>
        <p>On a scale like that, the middle is not the average of the two ends. You cannot start at birth, because the log of zero does not exist. An infinite stretch of felt time would sit between age 0 and age 1.</p>
        <p>The video started at age 4, roughly where reliable autobiographical memory is often said to begin, and it used a life of 81. Plug those in: the square root of 4 times 81 is the square root of 324, which is 18 exactly.<a href="#ref-2" aria-label="Reference 2">[2]</a><a href="#ref-3" aria-label="Reference 3">[3]</a></p>
        <p>Real maths. Correctly done. Sitting on a personal-blog trace: a Logtime model built by an engineer, James Main Kenney, in the 1960s, who only later found that Janet had described the idea a century earlier.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <figure class="taj__visual">
          <EdEditorialImage src="/blog/life-midpoint/linear-vs-log.svg" alt="Two timelines on cream paper: an even ruler marked 40, and a stretched ruler whose middle falls nearer 18." />
          <figcaption>Same life, two rulers. The even one puts the middle at 40. The stretched one, with these inputs, puts it at 18.</figcaption>
        </figure>
        <h2>Eighteen is one answer, not the answer</h2>
        <p>The video presented 18 as if it were a constant of nature. It is the output of two choices: when memory starts, and how long you expect to live. Move either one and the “true midpoint” moves with it.</p>
        <p>Four is a commonly cited figure for the start of memory. It is contested. The traditional estimate for a person’s earliest memory sits closer to 3.5, and some newer work puts it younger still.<a href="#ref-3" aria-label="Reference 3">[3]</a> A longitudinal study that asked the same children again found they systematically postdated their earliest memories as they grew.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>Same formula. Same life expectancy. Four defensible starting ages. Eighteen is the one that happens to come out a whole number.</p>
        <p>Eighty-one is a reasonable round number, close to several wealthy countries. It is not a global constant. Current U.S. life expectancy sits nearer 80.<a href="#ref-8" aria-label="Reference 8">[8]</a> Swap in your own country’s figure and your personal 18 quietly becomes a 17 or a 19.</p>
        <h2>Several explanations, no winner</h2>
        <p>The feeling underneath the video is older than the punchline. William Friedman and Steve Janssen asked nearly 1,900 adults, aged 16 to 80, how fast the past week, month, year, and ten years seemed to have gone.<a href="#ref-5" aria-label="Reference 5">[5]</a> People do report that longer stretches speed up. That is not the same as proving Janet’s fraction is the mechanism.</p>
        <p>Adrian Bejan offered a different physical story in 2019.<a href="#ref-6" aria-label="Reference 6">[6]</a> A 2023 mathematical review tested several competing models and did not crown a single winner.<a href="#ref-7" aria-label="Reference 7">[7]</a></p>
        <p>The evidence is mixed. Real phenomenon. Several plausible explanations. No single confirmed mechanism. That is an unglamorous sentence, and it is the accurate one.</p>
        <p>Where I have to be honest: this was never really about proving 18, or 17, or 20. It was about noticing that a clock year and a felt year are not the same object.</p>
        <blockquote>
          <p>Eighteen is what falls out when you choose 4 and 81. It is not a law of life.</p>
        </blockquote>
        <p class="taj__closing">If the middle moves every time you change the starting age or the life you expect, whose midpoint were you actually being shown?</p>
        <p>Sit with the asterisks. The sand still falls. The ruler was optional.</p>
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
