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
      <EdMarginNote label="The ending works.">
        <p>English just refuses to spend it on this one rock.</p>
      </EdMarginNote>
      <div class="taj__prose">
        <p class="taj__lead">A seven-year-old at a crowded dinner table announces that the Moon has moonly mountains, and four adults correct him at once.</p>
        <p>Lunar, they say. Lunar mountains. He asks why, which is the only question seven-year-olds truly know, and the table goes quiet. Somebody mutters something about Latin. Somebody else reaches for the rice. Nobody actually knows.</p>
        <p>The boy has a point, and it is a good one. English hands out that ending like sweets. Friend becomes friendly. Love becomes lovely. Cost becomes costly. Then it arrives at the Moon, stops dead, and passes you a word that seems to have wandered in from another family altogether. The Sun gets the same treatment (solar). So do teeth (dental). So does your cat (feline).</p>

        <h2>Collateral adjectives</h2>
        <p>These mismatched pairs have a name that sounds like a bank product: collateral adjectives. An adjective tied to a noun by meaning but not by descent.<a href="#ref-1" aria-label="Reference 1">[1]</a><a href="#ref-2" aria-label="Reference 2">[2]</a> Collateral, in the family-tree sense, means the same stock but not in a straight line. A cousin, not a child. Moon and lunar share a job, not a bloodline.</p>
        <p>Try a small experiment. Suppose a stern committee passed a law that every adjective must grow from its own noun, and every borrowed one is sent home. By Monday, astronomers are studying the moonly surface, engineers are fitting sunly panels, you are booking a toothly surgeon, and your cat has excellent catly reflexes. Nothing here is broken. Every word obeys the exact rule you already use for friendly. It just sounds like one nine-year-old explaining space to another.</p>

        <h2>Moony, lunar, and the staffing decision</h2>
        <p>Here is the twist. English did grow its own adjective. Moony has been around since about 1586, and one of its listed meanings is, plainly, relating to the Moon.<a href="#ref-6" aria-label="Reference 6">[6]</a> Try writing “a moony eclipse” in a science report, though, and watch your editor’s eyebrows climb. Moony drifted. These days it mostly means dreamy and a little absent: the face of someone newly in love who keeps missing their bus stop.<a href="#ref-6" aria-label="Reference 6">[6]</a></p>
        <p>So line up three ways to describe the grey plains up there. The lunar surface. The moony surface. The moonly surface. Moony is the decoy. It is so obviously soft and swoony that it makes lunar look sober and grown-up by comparison, and it quietly shuts the door on moonly before moonly ever gets a hearing.</p>
        <p>Why lunar, though? Because English is less a language than a very old guesthouse. Old English checked in first. Norman French arrived in 1066 and took the best rooms. Then, for centuries, Latin kept pouring in, often by way of French, for the law, the church, the dinner table and the new sciences.<a href="#ref-3" aria-label="Reference 3">[3]</a> When educated speakers wanted a serious word for the Moon, they reached for Latin. Lunar entered English in the early 1400s, first meaning crescent-shaped, and slowly settled into the observatory job.<a href="#ref-8" aria-label="Reference 8">[8]</a></p>
        <p>Linguists call the doorman blocking. When a word already holds a slot, a perfectly well-built rival often fails to get in. Mark Aronoff described the idea in 1976,<a href="#ref-4" aria-label="Reference 4">[4]</a> and people have argued ever since about how strict the doorman really is.<a href="#ref-5" aria-label="Reference 5">[5]</a> You can feel him working every time “moonly” makes you wince.</p>

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

        <h2>A clock and a lamp</h2>
        <p>The best part is that the two words were never describing the same thing. Moon comes from an old root meaning to measure. The Moon was the thing that counted out the months: a clock hung in the sky.<a href="#ref-7" aria-label="Reference 7">[7]</a> Lunar comes through Latin <em>luna</em>, from a root meaning light. A lamp.<a href="#ref-8" aria-label="Reference 8">[8]</a> One set of ancestors looked up at night and saw a calendar. Another looked up at the same rock and saw a lantern. English kept both, filed them in different drawers, and never mentioned it to anyone.</p>
        <p>Even the humble ending has a secret. That <em>-ly</em> comes from Old English <em>-lic</em>, from a root meaning body, form or appearance.<a href="#ref-9" aria-label="Reference 9">[9]</a> Friendly did not begin as “full of friendship.” It meant something closer to friend-shaped. When the boy said moonly, he was reaching for moon-shaped, which, if you think about it, was the most accurate adjective on the table.</p>
        <p>None of this was ever only about the Moon. We raise a cow and eat beef. We keep a pig and serve pork. One word from the field, one from the banquet hall, still doing the jobs they were handed centuries ago.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>

        <blockquote>
          <p>Same rock. One word for a clock, one word for a lamp.</p>
        </blockquote>

        <p class="taj__closing">Every language is a house where the old guests still sleep in the rooms they claimed first. The boy at the table was not wrong. He was just several centuries late.</p>
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
