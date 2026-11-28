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
      <EdMarginNote label="The speaking half can miss the picture">
        <p>After the bridge between the brain halves is cut, one half can see a picture and the speaking half can explain a choice it did not see.</p>
      </EdMarginNote>

      <div class="taj__prose">
        <p class="taj__lead">In 1962 William Jenkins woke from brain surgery in Los Angeles, and the people at his bedside thought he was himself.</p>
        <p>Jenkins had jumped as a paratrooper in the Second World War. After a rifle blow to the head, seizures took over his life, and the drugs stopped working. His surgeons, Joseph Bogen and Philip Vogel, cut his corpus callosum, the thick bundle of fibres that joins the left and right halves of the brain, so a seizure on one side would be less able to spread to the other side.<a href="#ref-8" aria-label="Reference 8">[8]</a> The seizures eased. He talked, joked, and ate breakfast. The surgeons had not removed half of the brain. They had cut the connection between the halves.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>Michael Gazzaniga, working with Roger Sperry at Caltech, then tested him, and the recovery no longer looked ordinary.<a href="#ref-2" aria-label="Reference 2">[2]</a><a href="#ref-8" aria-label="Reference 8">[8]</a></p>

        <h2>A picture can be sent to one half</h2>
        <p>The test uses eye wiring. If you look at a dot in the middle of a screen, what is left of the dot is handled mainly by the right half of the brain, and what is right of the dot is handled mainly by the left half. If a picture is flashed before the eyes can move, the picture can reach one half only.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>In an intact brain, the bridge shares that news quickly. With the bridge cut, a pattern appeared. A picture on the right, reaching the left half, was a picture Jenkins could usually name. A picture on the left, reaching the right half, was often a picture he said he had not seen, while his left hand picked the matching object.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>One half had seen the picture. The speaking half had not. Sperry later shared the 1981 Nobel Prize for this line of work.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>

        <h2>A claw, a snow scene, and a made-up reason</h2>
        <p>A later patient, called P.S. in the papers, made the pattern easy to follow. The researchers flashed two pictures at once. A chicken claw went to the speaking left half, and a snowy scene went to the right half. His right hand then chose a chicken. His left hand chose a snow shovel.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>
        <p>Each half picked an object that matched what it had seen. Asked why he picked those objects, the speaking half had seen only the claw and did not know about the snow. It did not say that it did not know. It said, in effect, that the claw goes with the chicken, and that you need a shovel to clean out the chicken shed.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>
        <p>The reason was calm, plausible, and invented. Gazzaniga called this habit the left-hemisphere interpreter.<a href="#ref-3" aria-label="Reference 3">[3]</a><a href="#ref-4" aria-label="Reference 4">[4]</a> In a related test, the word "walk," flashed only to the right half, got the patient moving. Asked why, the speaking half produced a reason it had made up.</p>
        <p>After recovery, these patients were not two people arguing at dinner. In daily life they mostly seemed whole, because the eyes move and the halves find workarounds. The split showed when the lab arranged for one side to know something the other side could not know.</p>

        <h2>The number of persons is not settled</h2>
        <p>The question of how many persons are in a split brain is not settled. Around 2017, Yair Pinto and colleagues argued for one conscious person with split perception, meaning two streams that do not merge.<a href="#ref-5" aria-label="Reference 5">[5]</a> Other researchers suspect that some of the apparent unity comes from one half giving a cue to the other. A 2020 review concluded that the evidence does not yet settle the first-person question.<a href="#ref-6" aria-label="Reference 6">[6]</a></p>
        <p>In 2025 a group studying the surgery found a useful limit. Patients with a complete cut still showed the classic split. One man, known as BT*, had kept about a centimetre of the bridge at the back, a strip called the splenium. Years later he showed no classic disconnection in vision, touch, space, or language.<a href="#ref-7" aria-label="Reference 7">[7]</a> About one centimetre of that back strip was enough, in his case, to keep the halves connected on those tests.</p>
        <p>Sperry warned against the later popular claim that people are simply left-brained or right-brained. The halves do specialise. The personality-poster version does not follow from the experiments.<a href="#ref-1" aria-label="Reference 1">[1]</a> The lasting point is narrower. The voice that says "I chose this because" can be sincere and still report only what reached it, after another part has already acted.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>A milder version is ordinary. A person can explain a purchase on the way home, or explain a sharp sentence after it has already been said. The split-brain lab caught that explaining half with a chicken claw in one hand and a snow shovel in the other.</p>

        <blockquote>
          <p>Feeling sure is not a record of what the speaking half actually saw.</p>
        </blockquote>

        <p class="taj__closing">The speaking half can give a tidy reason for a choice that another half already made.</p>
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
