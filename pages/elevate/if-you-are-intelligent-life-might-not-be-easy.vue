<script setup lang="ts">
import { INTELLIGENCE_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${INTELLIGENCE_BLOG.socialTitle} · The Entertrainer Blogs`,
  description: INTELLIGENCE_BLOG.socialHook,
  ogTitle: INTELLIGENCE_BLOG.socialTitle,
  ogDescription: INTELLIGENCE_BLOG.socialHook,
  ogUrl: `https://entertrainer.in/elevate/${INTELLIGENCE_BLOG.slug}`,
  ogImage: `https://entertrainer.in${INTELLIGENCE_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: INTELLIGENCE_BLOG.socialTitle,
  twitterDescription: INTELLIGENCE_BLOG.socialHook,
  twitterImage: `https://entertrainer.in${INTELLIGENCE_BLOG.hero}`
})

const references = [
  { id: 1, title: 'Differential associations between rumination and intelligence subtypes', source: 'Intelligence, 2019', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7453434/' },
  { id: 2, title: 'Anxiety and Depression in Gifted Individuals: A Systematic and Meta-Analytic Review', source: 'Gifted Child Quarterly, 2024', href: 'https://journals.sagepub.com/doi/abs/10.1177/00169862231208922' },
  { id: 3, title: 'Living With the Gift of Giftedness: An Exploratory Study on the Well-Being of Intellectually Gifted Adults', source: 'Gifted Child Quarterly, 2025', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12413024/' },
  { id: 4, title: 'The association between mental health and cognitive ability: Evidence from the Understanding Society survey', source: 'PLOS ONE, 2025', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12507287/' }
]

const windows = ref(4)
const windowLine = computed(() => {
  if (windows.value <= 2) return 'Two versions of the late bus. Close one. Board the other.'
  if (windows.value <= 5) return 'You can see a consequence early. You still do not have a legend for the map.'
  return `${windows.value} windows and no decision. A sharp mind can build a beautiful way to miss the bus.`
})
</script>

<template>
  <div class="taj">
    <header class="taj__head">
      <NuxtLink to="/elevate" class="taj__back">The Entertrainer Blogs</NuxtLink>
      <p class="taj__meta">{{ INTELLIGENCE_BLOG.category }} <span aria-hidden="true">·</span> {{ INTELLIGENCE_BLOG.minutes }} min read</p>
      <h1>{{ INTELLIGENCE_BLOG.title }}</h1>
      <p class="taj__dek">{{ INTELLIGENCE_BLOG.dek }}</p>
    </header>

    <figure class="taj__hero">
      <EdEditorialImage :src="INTELLIGENCE_BLOG.hero" :alt="INTELLIGENCE_BLOG.heroAlt" />
    </figure>

    <article class="taj__article">
      <aside class="taj__margin-note" aria-label="Reading note">
        <p>Not a diagnosis.</p>
        <p>“Intelligent” is not a medical category. A hard life is not proof that someone is smart.</p>
      </aside>

      <div class="taj__prose">
        <p class="taj__lead">The bus is six minutes late.</p>
        <p>Most people get annoyed, open a phone, and wait.</p>
        <p>You open a small studio in your skull. Another road. A crash. You should have walked. Every choice since 2017 was a cousin of this stop.</p>

        <EdTry v-model="windows" :min="1" :max="10" label="Versions of the late bus you keep open" :readout="String(windows)">
          <template #stage>
            <div class="wins" aria-hidden="true">
              <i v-for="n in windows" :key="n" :class="{ 'is-live': n === 1 }" />
            </div>
          </template>
          {{ windowLine }}
        </EdTry>

        <h2>More routes are not a plan</h2>
        <p>A mind that can build more than one future is useful. You catch a contradiction. You see a consequence early. You ask the question the room stepped around.</p>
        <p>It does not hand you a legend. Ten routes are not a decision.</p>
        <p>People turn this into a flattering myth. Smart people suffer because they see too much. The sentence is tidy. It also lets intelligence explain the whole week.</p>
        <p>A 2024 review of gifted groups found no significant overall rise in anxiety or depression. The studies did not agree with each other. They did not share one definition of gifted.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>The myth is not a finding. It is still a story some people live inside. These papers have not measured every heavy day.</p>

        <figure class="taj__visual">
          <EdEditorialImage
            src="/blog/intelligence/bus-stop.jpg"
            alt="A bus stop drawn in black ink on cream paper, with many branching paths and one cobalt line that actually leaves."
          />
          <figcaption>More routes are not a plan. One of them has to be the bus you actually board.</figcaption>
        </figure>

        <h2>Thinking hard is not being stuck</h2>
        <p>Repetitive thinking is not one habit.</p>
        <p>In a study of 751 young adults, reflective pondering lined up with several intelligence measures, after depressive symptoms were accounted for. Brooding, the heavier loop that sits in the bad feeling, did not line up the same way.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>They are cousins. They become unbearable when they refuse to leave the table.</p>
        <p>Someone replies “okay.” That can mean yes, or annoyance, or a kettle boiling. One reading may be wrong. Eight readings can just make you tired.</p>
        <p>More models help when a choice is due. They exhaust you when every half-signal gets a meeting. “If I think hard enough, uncertainty will behave” has never worked. It gives uncertainty a bigger office.</p>

        <h2>The curse story does not hold</h2>
        <p>Feeling out of step is a difference in pace or interest. It is not a licence to decide everyone else is shallow.</p>
        <p>A 2025 study of 219 Canadian adults identified as gifted found a mess, not a curse. Lower income and twice-exceptionality went with higher risk. A relationship, and a sense that your ability was being used, went with better well-being.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>
        <p>Good. If intelligence alone made life hard, the only move would be to become a houseplant. If money, health, belonging, and habits matter, there are handles.</p>
        <p>Reflection asks what happened, what you can learn, and what is next. It has an end time. Brooding asks why you are like this, and replays the evidence with worse lighting.</p>
        <p>You botch one slide. Reflection revises the slide. Brooding digs up every embarrassing thing since school assembly. Same brain. Different trip.</p>
        <p>Work on older adults finds thinking ability, mental health, friends, schooling, and circumstances tangled together. Not one arrow.<a href="#ref-4" aria-label="Reference 4">[4]</a> That study cannot tell a younger reader what their mind is doing. It does kill the one-variable story.</p>

        <blockquote>
          <p>The useful question is not “Do I think a lot?” It is “Does this thought go anywhere?”</p>
        </blockquote>

        <p class="taj__closing">Which window are you going to close before the bus actually comes?</p>
        <p>Get on. The white paper about the timetable can wait.</p>
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
.wins { display: grid; grid-template-columns: repeat(10, 1fr); gap: 4rem; }
.wins i { display: block; height: 28rem; border: var(--stroke) solid var(--ink); border-radius: 3rem; background: var(--paper); }
.wins i.is-live { background: var(--accent); }
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

