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
      <aside class="taj__margin-note" aria-label="Reading note">
        <p>Two jobs.</p>
        <p>Moony took the poetry. Lunar took the observatory.</p>
      </aside>
      <div class="taj__prose">
        <p class="taj__lead">Friend becomes friendly. Love becomes lovely. Moon does not become moonly.</p>
        <p>The ending is sitting right there. English uses it all the time. Then it stops, and hands you a word with no visible link to the Moon: lunar. The same trick shows up for the sun (solar), for teeth (dental), and for a cat (feline).</p>

        <h2>What is it?</h2>
        <p>These pairs have a name: collateral adjectives. An adjective tied to a noun by meaning, and unrelated to it by descent.<a href="#ref-1" aria-label="Reference 1">[1]</a><a href="#ref-2" aria-label="Reference 2">[2]</a> Collateral means the same family stock, but not in a straight line — a cousin, not a child. Moon and lunar are two words that happen to share a job.</p>
        <p>Suppose English passed a law that every adjective must grow from its own noun, and borrowed ones are deleted. Tomorrow, astronomers study the moonly surface, engineers install sunly panels, you book a toothly surgeon, and your cat has excellent catly reflexes. Nothing there is broken. Every word obeys the rule you already use for friendly. It just sounds like a nine-year-old explaining space.</p>

        <h2>Why is it significant?</h2>
        <p>English did build a native adjective. Moony has been in the language since about 1586, and one listed meaning is, plainly, relating to the moon.<a href="#ref-6" aria-label="Reference 6">[6]</a> You would still never write “a moony eclipse.” Moony drifted. It now mostly means dreamy, a bit absent — the face of someone in love, not the surface of a rock.<a href="#ref-6" aria-label="Reference 6">[6]</a></p>
        <p>English did not have a gap. It had a staffing decision. Lunar took the observatory. Moony took the poetry. Old English was already here; then Norman French; then a flood of Latin, often through French, for the table, the church, the law, and the new sciences.<a href="#ref-3" aria-label="Reference 3">[3]</a> When the Renaissance needed a serious adjective for the Moon, it reached for Latin. Lunar entered English in the early 1400s meaning crescent-shaped, and settled into the scientific job.</p>
        <p>Linguists call the traffic warden blocking. If a word already holds a slot, a new well-formed word often fails to take it. Mark Aronoff described the idea in 1976.<a href="#ref-4" aria-label="Reference 4">[4]</a> Later work keeps arguing about how hard the block really is.<a href="#ref-5" aria-label="Reference 5">[5]</a></p>

        <h2>Interesting facts and thoughts</h2>
        <p>The two words do not even answer the same question about the rock. Moon comes from a root meaning to measure — the thing that counts time, a clock.<a href="#ref-7" aria-label="Reference 7">[7]</a> Lunar comes through Latin <em>luna</em>, from a root meaning light — a lamp. The same root shows up in old Slavic and Irish words for moon and light.<a href="#ref-8" aria-label="Reference 8">[8]</a> One set of ancestors looked up and saw a calendar. Another set looked up and saw a lamp. English kept both, and never announced it.</p>
        <p>The ending has a small secret. That <em>-ly</em> comes from Old English <em>-lic</em>, from a root meaning appearance, form, body.<a href="#ref-9" aria-label="Reference 9">[9]</a> Friendly did not originally mean “full of friendship.” It meant something closer to friend-shaped.</p>
        <p>This was never only about the Moon. English is several centuries of arrivals, still holding their old jobs. We raise a cow and eat beef: one word from the field, one from the table. The evidence is mixed on how strictly blocking works in a living language. It is not mixed on the staffing. Science got lunar. Longing kept moony.</p>

        <blockquote>
          <p>Same rock. One word for a clock, one word for a lamp.</p>
        </blockquote>

        <p class="taj__closing">What job was left for “moonly” to do?</p>
        <p>Moony is still around. It just took the poetry. For something that hangs over the sea doing nothing in particular, that is a very moony career.</p>
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
}
</style>
