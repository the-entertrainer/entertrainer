<script setup lang="ts">
import { SPLIT_BRAIN_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${SPLIT_BRAIN_BLOG.socialTitle} · The Entertrainer Blogs`,
  description: SPLIT_BRAIN_BLOG.socialHook,
  ogTitle: SPLIT_BRAIN_BLOG.socialTitle,
  ogDescription: SPLIT_BRAIN_BLOG.socialHook,
  ogUrl: `https://entertrainer.in/elevate/${SPLIT_BRAIN_BLOG.slug}`,
  ogImage: `https://entertrainer.in${SPLIT_BRAIN_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: SPLIT_BRAIN_BLOG.socialTitle,
  twitterDescription: SPLIT_BRAIN_BLOG.socialHook,
  twitterImage: `https://entertrainer.in${SPLIT_BRAIN_BLOG.hero}`
})

const references = [
  {
    id: 1,
    title: 'Some Effects of Disconnecting the Cerebral Hemispheres',
    source: 'Roger W. Sperry, Nobel Lecture, 8 Dec 1981',
    href: 'https://www.nobelprize.org/prizes/medicine/1981/sperry/lecture/'
  },
  {
    id: 2,
    title: 'Observations on visual perception after disconnection of the cerebral hemispheres in man',
    source: 'Gazzaniga, Bogen & Sperry, Brain, 1965',
    href: 'https://doi.org/10.1093/brain/88.2.221'
  },
  {
    id: 3,
    title: 'The Integrated Mind',
    source: 'Gazzaniga & LeDoux, Plenum, 1978 (interpreter / chicken-claw–snow-shovel paradigms with patient P.S.)',
    href: 'https://link.springer.com/book/10.1007/978-1-4899-2192-5'
  },
  {
    id: 4,
    title: 'Forty-five years of split-brain research and still going strong',
    source: 'Michael S. Gazzaniga, Nature Reviews Neuroscience, 2005',
    href: 'https://www.nature.com/articles/nrn1740'
  },
  {
    id: 5,
    title: 'The Split-Brain Phenomenon Revisited: A Single Conscious Agent with Split Perception',
    source: 'Pinto et al., Trends in Cognitive Sciences, 2017',
    href: 'https://www.cell.com/trends/cognitive-sciences/fulltext/S1364-6613(17)30190-0'
  },
  {
    id: 6,
    title: 'Split-Brain: What We Know Now and Why This is Important for Understanding Consciousness',
    source: 'de Haan, Corballis et al., Neuropsychology Review, 2020',
    href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7305066/'
  },
  {
    id: 7,
    title: 'No disconnection syndrome after near-complete callosotomy',
    source: 'Bekir et al., Communications Psychology, 2025',
    href: 'https://www.nature.com/articles/s44271-025-00377-5'
  },
  {
    id: 8,
    title: 'The split brain: A tale of two halves',
    source: 'Nature News feature on Gazzaniga / W.J. (Jenkins), 2012',
    href: 'https://www.nature.com/news/the-split-brain-a-tale-of-two-halves-1.10213'
  }
]
</script>

<template>
  <div class="taj">
    <header class="taj__head">
      <NuxtLink to="/elevate" class="taj__back">The Entertrainer Blogs</NuxtLink>
      <p class="taj__meta">{{ SPLIT_BRAIN_BLOG.category }} <span aria-hidden="true">·</span> {{ SPLIT_BRAIN_BLOG.minutes }} min read</p>
      <h1>{{ SPLIT_BRAIN_BLOG.title }}</h1>
      <p class="taj__dek">{{ SPLIT_BRAIN_BLOG.dek }}</p>
    </header>

    <figure class="taj__hero">
      <EdEditorialImage :src="SPLIT_BRAIN_BLOG.hero" :alt="SPLIT_BRAIN_BLOG.heroAlt" />
    </figure>

    <article class="taj__article">
      <EdMarginNote label="Hold this.">
        <p>The voice that explains can be sure for reasons it never saw.</p>
      </EdMarginNote>

      <div class="taj__prose">
        <p class="taj__lead">In 1962 a former paratrooper named William Jenkins came round from brain surgery in Los Angeles, and as far as anyone at his bedside could tell, he was perfectly himself.</p>
        <p>That was the remarkable part. Jenkins had jumped in the Second World War. After a German soldier struck him on the head with a rifle butt, seizures slowly took over his life, and the drugs stopped working. So his surgeons, Joseph Bogen and Philip Vogel, tried something drastic. They cut his corpus callosum, the thick bridge of fibres joining the left and right halves of the brain, hoping a seizure on one side could no longer race across to the other.<a href="#ref-8" aria-label="Reference 8">[8]</a> The seizures eased. He chatted, joked, ate his breakfast. Nobody had removed half a brain. They had cut the phone line between the halves.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>Then a young researcher named Michael Gazzaniga, working with Roger Sperry at Caltech, sat him down for some tests, and the quiet recovery stopped looking quite so ordinary.<a href="#ref-2" aria-label="Reference 2">[2]</a><a href="#ref-8" aria-label="Reference 8">[8]</a></p>

        <h2>Sending a picture to one side</h2>
        <p>The trick is simpler than it sounds. Fix your eyes on a dot in the middle of a screen. Everything to the left of the dot is handled mainly by the right half of your brain; everything to the right goes mainly to the left half. Flash a picture quickly enough, before the eyes can dart across and cheat, and you can deliver it to one side only.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>In most of us, the bridge shares the news instantly and nobody notices. With the bridge cut, a strange pattern appeared. Flash a picture on the right, so the left half receives it, and Jenkins could usually name it. Flash it on the left, so it reaches the right half, and he would often say he had seen nothing at all, while his left hand calmly reached out and picked the matching object.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>Think about that for a minute. One half had seen it. The talking half had not. Both lived in the same skull, ate the same breakfast and answered to the same name. Sperry later shared the 1981 Nobel Prize for this line of work.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>

        <h2>The chicken claw and the snow shovel</h2>
        <p>A later patient, known in the papers as P.S., made the pattern unforgettable. The researchers flashed two pictures at once: a chicken claw to the speaking left half, and a snowy scene to the silent right half. Then they laid out a row of cards. His right hand chose a chicken. His left hand chose a snow shovel.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>
        <p>So far, fine. Each half picked sensibly for what it had seen. Then came the question: why did you pick those? The speaking half, which had seen only the claw and knew nothing of any snow, did not say “I don’t know.” It said, more or less, that the claw goes with the chicken, and you need a shovel to clean out the chicken shed.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>
        <p>Not a flicker of doubt. A tidy, plausible, entirely invented reason, delivered with the calm of someone explaining why they brought an umbrella. Gazzaniga called this storytelling habit the left-hemisphere interpreter.<a href="#ref-3" aria-label="Reference 3">[3]</a><a href="#ref-4" aria-label="Reference 4">[4]</a> In related tests, a word like “walk” flashed only to the right half got the patient up and moving; asked why, the talking half produced a perfectly reasonable excuse it had made up on the spot.</p>
        <p>After recovery these patients were not two people bickering at dinner. In everyday life they mostly seemed whole; eyes move, people cue themselves, the halves find workarounds. The split only showed when the lab arranged for one side to know something the other could not.</p>

        <h2>How many of you</h2>
        <p>So how many of you is in there? The honest answer is that nobody has settled it. Around 2017, Yair Pinto and colleagues argued for one conscious person with split perception: two streams that do not merge, rather than two little people sharing a flat.<a href="#ref-5" aria-label="Reference 5">[5]</a> Others suspect some of the apparent unity comes from one half quietly tipping off the other. A 2020 review concluded that we still lack the evidence to settle the first-person question cleanly.<a href="#ref-6" aria-label="Reference 6">[6]</a></p>
        <p>In 2025 a group studying the surgery itself found something lovely. Patients with a complete cut still showed the classic split. But one man, known as BT*, had kept about a centimetre of the bridge at the very back, a strip called the splenium. Years later he showed no classic disconnection at all, in vision, touch, space or language, as if that small remnant were enough to keep both halves talking.<a href="#ref-7" aria-label="Reference 7">[7]</a> One centimetre of cable, doing the work of a whole bridge.</p>
        <p>Sperry himself warned against the left-brain, right-brain personality posters that would later decorate a thousand office walls. The halves do specialise. The horoscope version is nonsense.<a href="#ref-1" aria-label="Reference 1">[1]</a> What lingers is quieter and stranger. The voice in you that says “I chose this because…” can be completely sincere and still be reporting only what reached it, after another part of you has already acted.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>Most of us know a milder version from ordinary life: the purchase we justify on the way home, the sharp word we explain once it has already left our mouth. The split-brain lab simply caught the narrator in the act, with a chicken claw in one hand and a snow shovel in the other.</p>

        <blockquote>
          <p>Feeling sure is not a perfect meter of what caused the answer.</p>
        </blockquote>

        <p class="taj__closing">If the voice that explains your choices can be sure for reasons it never saw, which of today’s reasons came before the choice, and which arrived afterwards to tidy up?</p>
        <p>Sit with the shovel. The shed was built later.</p>
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
