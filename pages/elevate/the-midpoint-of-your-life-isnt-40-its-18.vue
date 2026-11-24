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
      <EdMarginNote label="Forty feels like the middle.">
        <p>A clock year and a felt year are not the same object.</p>
      </EdMarginNote>
      <div class="taj__prose">
        <p class="taj__lead">In 1877 a French philosopher named Paul Janet looked back over his years and accused them of getting shorter.</p>
        <p>He was not being dramatic, or not only. He was noticing what everyone over thirty eventually notices, usually somewhere around the second week of December: the year that just ended seems to have lasted about a fortnight, while the summer you were nine lasted roughly a century. Janet offered a simple explanation. The felt length of a year, he suggested, is proportional to how much life you have already lived.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>To a ten-year-old, one year is a tenth of everything they have ever known. To a fifty-year-old, the same 365 days is a fiftieth. Same calendar. A very different slice of the cake.</p>

        <h2>Paul Janet and felt time</h2>
        <p>Run Janet’s idea forward and something odd happens to the middle of your life. If every year is weighed against all the years before it, the early ones count for an enormous amount and the later ones for less and less. The felt middle slides backwards, away from forty and towards your teens.</p>
        <p>A viral video took this idea for a spin and announced, with tremendous confidence, that the middle of your life is not forty. It is eighteen. The sum behind that is real. The video started counting at age four, roughly where lasting memories are often said to begin, and assumed a life of eighty-one years. Under Janet’s rule, those two numbers meet in the felt middle at exactly eighteen.<a href="#ref-2" aria-label="Reference 2">[2]</a><a href="#ref-3" aria-label="Reference 3">[3]</a></p>
        <p>Even the eighteen has a lovely backstory. It traces to an engineer named James Main Kenney, who built what he called a Logtime model in the 1960s and only later discovered that a French philosopher had beaten him to the idea by nearly a century.<a href="#ref-2" aria-label="Reference 2">[2]</a> I like to imagine the face he made.</p>

        <figure class="taj__visual taj__visual--archive" style="--fig-ratio: 1800 / 1309">
          <EdEditorialImage
            src="/blog/the-midpoint-of-your-life-isnt-40-its-18/altzenbach-ages-of-man.jpg"
            alt="Seventeenth-century engraving of the ages of man as figures standing on a rising and falling staircase, with fifty at the top."
          />
          <figcaption>
            Image: Public Domain /
            <a href="https://www.metmuseum.org/art/collection/search/701308" target="_blank" rel="noreferrer">The Metropolitan Museum of Art</a>,
            Gerhard Altzenbach, The Eleven Ages of Man, 1609–72
          </figcaption>
        </figure>

        <h2>Three middles</h2>
        <p>Now look at that old print. Seventeenth-century printmakers loved drawing a life as a staircase. You climb from the cradle, step by step, stand on the top landing at fifty, and then walk carefully down the other side. The banner across the top reads, in old German, rise and decline. So we have three candidates for the middle of a life. The clock says forty. The staircase says fifty. Janet’s rule says eighteen.</p>
        <p>Notice what the three do to you. Forty feels sensible and a little dull, like the middle seat on a long flight. Fifty, at the top of the stairs, flatters you with a view. Eighteen is the shock option, and it works on us precisely because the other two make it look outrageous. Put it beside forty and fifty and it lands like a slap. Put it on its own and it is just a number someone chose.</p>
        <p>Because it was chosen. Eighteen falls out of two decisions: when memory starts, and how long you expect to live. Move either one and the middle moves with it. Four is a common figure for the start of memory, and it is argued over. Many estimates of a first memory sit nearer three and a half, and some newer work puts it younger still.<a href="#ref-3" aria-label="Reference 3">[3]</a> When researchers asked the same children again years later, the children kept pushing their earliest memory later as they grew up.<a href="#ref-4" aria-label="Reference 4">[4]</a> Eighty-one is a fair figure for several wealthy countries; U.S. life expectancy sits nearer eighty.<a href="#ref-8" aria-label="Reference 8">[8]</a> Change the country and your personal eighteen quietly becomes a seventeen or a nineteen. The middle is not a fact about you. It is a fact about the ruler you picked up.</p>

        <h2>Why the years speed up</h2>
        <p>The feeling underneath the punchline is older than any video, and it is real. William Friedman and Steve Janssen asked nearly 1,900 adults, aged sixteen to eighty, how fast the past week, month, year and decade seemed to have gone. People do report the longer stretches flying past faster as they age.<a href="#ref-5" aria-label="Reference 5">[5]</a></p>
        <p>Why, though, nobody has nailed down. In 2019 Adrian Bejan suggested that the mind takes in fewer fresh images per hour as we get older, so the days look shorter in hindsight.<a href="#ref-6" aria-label="Reference 6">[6]</a> A 2023 review lined up several competing explanations and declined to crown a winner.<a href="#ref-7" aria-label="Reference 7">[7]</a> I find that oddly reassuring. The years really do seem to speed up. We just do not know exactly why, which leaves a little room to push back.</p>
        <p>And perhaps that is the real gift of Janet’s small idea. It turns a gloomy question, how many years do I have left, into a better one: which of them will I actually notice?</p>

        <blockquote>
          <p>Eighteen is what falls out when you choose four and eighty-one. The middle moves when you do.</p>
        </blockquote>

        <p class="taj__closing">Maybe the middle of a life is not a point on a ruler at all, but whichever stretch you end up remembering most clearly, and you are still allowed to move it.</p>
        <p>The sand keeps falling either way. You get to decide where to look.</p>
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
