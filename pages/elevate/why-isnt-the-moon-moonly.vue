<script setup lang="ts">
import { MOONLY_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${MOONLY_BLOG.socialTitle} · The Entertrainer Blogs`,
  description: MOONLY_BLOG.socialHook,
  ogTitle: MOONLY_BLOG.socialTitle,
  ogDescription: MOONLY_BLOG.socialHook,
  ogUrl: `https://entertrainer.in/elevate/${MOONLY_BLOG.slug}`,
  ogImage: `https://entertrainer.in${MOONLY_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: MOONLY_BLOG.socialTitle,
  twitterDescription: MOONLY_BLOG.socialHook,
  twitterImage: `https://entertrainer.in${MOONLY_BLOG.hero}`
})

const references = [
  { id: 1, title: 'What is a Collateral Adjective?', source: 'Merriam-Webster', href: 'https://www.merriam-webster.com/grammar/meaning-of-collateral-adjective' },
  { id: 2, title: 'Collateral adjective', source: 'Wikipedia', href: 'https://en.wikipedia.org/wiki/Collateral_adjective' },
  { id: 3, title: 'Borrowing in Middle English', source: 'Towson University', href: 'https://tigerweb.towson.edu/duncan/brmideng.html' },
  { id: 4, title: 'Blocking (linguistics)', source: 'Wikipedia, after Aronoff, Word Formation in Generative Grammar, 1976', href: 'https://en.wikipedia.org/wiki/Blocking_(linguistics)' },
  { id: 5, title: 'Blocking effects', source: 'Embick, Benz & Paparounas, University of Pennsylvania', href: 'https://www.ling.upenn.edu/~embick/block-over-21.pdf' },
  { id: 6, title: 'moony, adjective', source: 'Merriam-Webster', href: 'https://www.merriam-webster.com/dictionary/moony' },
  { id: 7, title: 'moon, etymology', source: 'Online Etymology Dictionary', href: 'https://www.etymonline.com/word/moon' },
  { id: 8, title: 'lunar, etymology', source: 'Online Etymology Dictionary', href: 'https://www.etymonline.com/word/lunar' },
  { id: 9, title: '-ly, suffix etymology', source: 'Online Etymology Dictionary', href: 'https://www.etymonline.com/word/-ly' }
]
</script>

<template>
<div class="taj">
    <header class="taj__head">
      <NuxtLink to="/elevate" class="taj__back">The Entertrainer Blogs</NuxtLink>
      <p class="taj__meta">{{ MOONLY_BLOG.category }} <span aria-hidden="true">·</span> {{ MOONLY_BLOG.minutes }} min read</p>
      <h1>{{ MOONLY_BLOG.title }}</h1>
      <p class="taj__dek">{{ MOONLY_BLOG.dek }}</p>
    </header>
    <figure class="taj__hero">
      <EdEditorialImage :src="MOONLY_BLOG.hero" :alt="MOONLY_BLOG.heroAlt" />
    </figure>
    <article class="taj__article">
      <EdMarginNote label="Two words, one rock">
        <p>English builds friendly from friend. It does not build the Moon's adjective from moon. The usual adjective is lunar, from Latin.</p>
      </EdMarginNote>
      <div class="taj__prose">
        <p class="taj__lead">A seven-year-old says the Moon has moonly mountains, and four adults correct him at once.</p>
        <p>The adults say the phrase is lunar mountains. The child asks why. Someone mentions Latin, and nobody at the table gives a clear answer.</p>
        <p>The child's pattern is the usual English pattern. Friend becomes friendly, love becomes lovely, and cost becomes costly. Moon does not become moonly in ordinary use. The Sun's adjective is solar, the adjective for teeth is dental, and the adjective for a cat is feline.</p>

        <h2>The adjective does not come from the noun</h2>
        <p>The name for a pair like moon and lunar is collateral adjective. The adjective matches the noun in meaning, but the adjective was not built from that noun.<a href="#ref-1" aria-label="Reference 1">[1]</a><a href="#ref-2" aria-label="Reference 2">[2]</a> Collateral, in a family tree, means a relative who is not a parent or a child. Moon and lunar share a job, and they do not share a direct word history.</p>
        <p>If every adjective had to be built from its own English noun, astronomers would write moonly surface, engineers would write sunly panels, a dentist would be a toothly surgeon, and a cat would have catly reflexes. Each of those words follows the same rule as friendly. They sound wrong only because English did not adopt them for formal use.</p>

        <h2>Moony exists, and lunar took the formal job</h2>
        <p>English did grow an adjective from moon. Moony has been recorded since about 1586, and one listed meaning is "relating to the Moon."<a href="#ref-6" aria-label="Reference 6">[6]</a> A science report does not say "a moony eclipse." Moony now mostly means dreamy or absent-minded.<a href="#ref-6" aria-label="Reference 6">[6]</a></p>
        <p>You can line up lunar surface, moony surface, and moonly surface. Moony sounds informal, so lunar sounds like the formal choice, and moonly rarely gets a formal use.</p>
        <p>Lunar won the formal job because of how English took in other languages. Old English was already in use. Norman French arrived in 1066. For centuries after that, Latin words kept entering English, often through French, in law, the church, and the sciences.<a href="#ref-3" aria-label="Reference 3">[3]</a> Speakers who wanted a formal word for the Moon used the Latin word. Lunar entered English in the early 1400s, first with the meaning "crescent-shaped," and later it became the usual word in astronomy.<a href="#ref-8" aria-label="Reference 8">[8]</a></p>
        <p>Linguists call one part of this blocking. When a word already fills a meaning, a well-formed rival often fails to enter that meaning. Mark Aronoff described the idea in 1976.<a href="#ref-4" aria-label="Reference 4">[4]</a> Later work has argued about how strict the block is.<a href="#ref-5" aria-label="Reference 5">[5]</a> Moonly is a case where the rival did not take the formal slot.</p>

        <figure class="taj__visual taj__visual--archive" style="--fig-ratio: 1800 / 894">
          <EdEditorialImage
            src="/blog/why-isnt-the-moon-moonly/rutherfurd-full-moon-1871.jpg"
            alt="Stereograph card with two photographs of the full Moon side by side, mounted on an orange card."
          />
          <figcaption>
            Image: Public Domain /
            <a href="https://www.metmuseum.org/art/collection/search/813902" target="_blank" rel="noreferrer">The Metropolitan Museum of Art</a>,
            Lewis Morris Rutherfurd, 1871
          </figcaption>
        </figure>

        <h2>One word meant a measure, and one word meant light</h2>
        <p>The two words did not start as names for the same idea. Moon comes from an old root meaning "to measure." The Moon was used to count months.<a href="#ref-7" aria-label="Reference 7">[7]</a> Lunar comes through Latin luna, from a root meaning "light."<a href="#ref-8" aria-label="Reference 8">[8]</a> One history treated the Moon as a calendar. The other history treated the Moon as a light. English kept both words.</p>
        <p>The ending -ly has a history too. It comes from Old English -lic, from a root meaning body, form, or appearance.<a href="#ref-9" aria-label="Reference 9">[9]</a> Friendly did not begin as "full of friendship." It was closer to "having the form of a friend." Moonly, on that older reading, is closer to "having the form of the Moon."</p>
        <p>The same split shows up with animals and food. English raises a cow and serves beef, and it keeps a pig and serves pork. One word stayed with the animal in the field, and the other word came from the Norman French dining table.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>

        <blockquote>
          <p>Moon comes from a word for measuring, and lunar comes from a word for light.</p>
        </blockquote>

        <p class="taj__closing">The child used the regular English pattern, and the formal adjective had already been taken from Latin several centuries earlier.</p>
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
