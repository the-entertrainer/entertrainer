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
  <div class="split">
    <header class="split__head">
      <NuxtLink to="/elevate" class="split__back">The Entertrainer Blogs</NuxtLink>
      <p class="split__meta">{{ SPLIT_BRAIN_BLOG.category }} <span aria-hidden="true">·</span> {{ SPLIT_BRAIN_BLOG.minutes }} min read</p>
      <h1>{{ SPLIT_BRAIN_BLOG.title }}</h1>
      <p class="split__dek">{{ SPLIT_BRAIN_BLOG.dek }}</p>
    </header>

    <figure class="split__hero">
      <EdEditorialImage :src="SPLIT_BRAIN_BLOG.hero" :alt="SPLIT_BRAIN_BLOG.heroAlt" />
    </figure>

    <article class="split__article">
      <aside class="split__margin-note" aria-label="Reading note">
        <p>Hold this.</p>
        <p>Speech can deny what another half of the same brain has already acted on.</p>
      </aside>

      <div class="split__prose">
        <p class="split__lead">In 1962, surgeons cut the main bridge between the two halves of a man’s brain.</p>
        <p>His name was William Jenkins. He had been a World War II paratrooper. After a German soldier hit him in the head with a rifle butt, seizures took over his life. Drugs failed. As a last resort in Los Angeles, Joseph Bogen and Philip Vogel sectioned his corpus callosum so a seizure on one side would be less able to race into the other. The seizures eased. In ordinary conversation he seemed much like himself.</p>
        <p>Then Michael Gazzaniga and Roger Sperry began testing him at Caltech. That is where the quiet recovery stopped looking ordinary.<a href="#ref-8" aria-label="Reference 8">[8]</a><a href="#ref-2" aria-label="Reference 2">[2]</a></p>

        <h2>The corpus callosum</h2>
        <p>The corpus callosum is the thick fibre bridge between the left and right cerebral hemispheres. In some hard epilepsy cases, a seizure starts on one side and spreads across that bridge. Cutting it was a last-resort attempt to stop the spread. Nobody removed a half of the brain.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>Everyday chat could still look normal. The odd results showed up when the lab sent information to only one side.</p>

        <h2>Visual-field tests</h2>
        <p>If you stare at a centre mark, the left half of the scene is handled mainly by the right half of the brain, and the right half of the scene by the left half. A flash too brief for the eyes to cheat can reach only one side.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>With Jenkins and later patients, a pattern returned. Flash on the right (left hemisphere): speech can often name it. Flash on the left (right hemisphere): speech often says “nothing,” while the left hand can still pick the matching object.</p>
        <p>One half had seen it. The talking half had not. Both lived in the same skull. Sperry later shared the 1981 Nobel Prize for this line of work.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>

        <figure class="split__visual">
          <EdEditorialImage
            src="/blog/your-mouth-can-be-sure-for-reasons-your-eyes-never-had/visual-field.jpg"
            alt="Cream-paper ink drawing of a face at a fixation cross: a cobalt key flashes only in the left visual field."
          />
          <figcaption>Left field flash → right hemisphere. Speech can say “nothing” while a hand still finds the match.</figcaption>
        </figure>


        <h2>Patient P.S. and the interpreter</h2>
        <p>A later patient, known as P.S., made the finding sharp. Two pictures flashed at once: a chicken claw to the speaking left half, a snow scene to the right half. The right hand picked a chicken. The left hand picked a snow shovel.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>
        <p>Asked why, speech — which had seen only the claw — answered along these lines: the claw goes with the chicken, and you need a shovel to clean the chicken shed.</p>
        <p>The shovel belonged to the snow. The speaking half never got the snow. It did not say “I don’t know.” It invented a reason that made the moment sound whole. Gazzaniga called that storytelling system the left-hemisphere interpreter.<a href="#ref-3" aria-label="Reference 3">[3]</a><a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>Related tests flashed “walk” or “laugh” only to the right half. The body did it. Asked why, speech invents a reason. Action first. Story after.</p>

        <figure class="split__visual">
          <EdEditorialImage
            src="/blog/your-mouth-can-be-sure-for-reasons-your-eyes-never-had/interpreter.jpg"
            alt="Cream-paper ink drawing: chicken claw and snow shovel linked by a cobalt scribble from a speaking mouth inventing a reason."
          />
          <figcaption>Claw to one half, snow to the other. The mouth never saw the snow — and still invents a shed story for the shovel.</figcaption>
        </figure>


        <h2>Later debates and incomplete cuts</h2>
        <p>These patients were not two people arguing at dinner. After recovery, a casual meeting often looked normal. Eyes move. People cue themselves. The split shows up when the lab forces one-sided input.</p>
        <p>Around 2017, Yair Pinto and colleagues argued for one conscious agent with split perception — two streams that do not join, without Hollywood dual persons.<a href="#ref-5" aria-label="Reference 5">[5]</a> Others say some apparent unity is cross-cueing: one side tipping the other off. A 2020 review said we still lack enough evidence to settle the first-person question cleanly.<a href="#ref-6" aria-label="Reference 6">[6]</a></p>
        <p>In 2025, a new cohort sharpened the cut itself. Fully callosotomized patients still showed classic disconnection. One patient, BT*, had a near-complete cut but about one centimetre of the rear tip (splenium) left. Years later he showed no classic disconnection across vision, touch, space, and language tasks — as if that tiny remnant was enough to keep the sides working together.<a href="#ref-7" aria-label="Reference 7">[7]</a></p>
        <p>Sperry himself warned against wild left-brain / right-brain personality posters. Specialization is real. The self-help cartoon is not.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>

        <h2>What the work shows</h2>
        <p>Not a poster about personality types. Not a claim that everyone is two people.</p>
        <p>It is a clearer, harder point: the voice that says “I saw it” can feel sure while reporting only what reached the speaking half — after another half has already acted. Feeling sure is not a perfect meter of what caused the answer.</p>
        <p>Everyday life already shows sincere wrong reasons after the fact. Split-brain work is one clear neurological proof that fluent explanations can be built after the hands have moved.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p class="split__closing">If the mouth can be sure for reasons another half of the same brain never had — how much of “I saw it” was the whole sensing brain, and how much was the narrator doing its job?</p>
      </div>
    </article>

    <section class="split__sources" aria-labelledby="sources-title">
      <p class="split__meta">References</p>
      <h2 id="sources-title">Sources used in this article</h2>
      <ol>
        <li v-for="reference in references" :id="`ref-${reference.id}`" :key="reference.id">
          <a :href="reference.href" target="_blank" rel="noreferrer"><span>[{{ reference.id }}]</span> {{ reference.title }} <em>{{ reference.source }}</em></a>
        </li>
      </ol>
    </section>

    <div class="split__newsletter-wrap"><EdNewsletter /></div>
  </div>
</template>


<style scoped>
.split { padding-bottom: 112rem; }
.split__head { max-width: var(--shell-wide); margin: 0 auto; padding: clamp(26rem, 5vw, 64rem) var(--shell-gutter) clamp(28rem, 5vw, 56rem); }
.split__back, .split__meta { font: 700 12rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.split__back { color: var(--ink); }
.split__meta { margin: clamp(46rem, 8vw, 104rem) 0 16rem; color: var(--signal-cobalt); }
.split h1, .split h2 { font-family: var(--font-display); font-weight: 500; letter-spacing: -.05em; }
.split h1 { max-width: 1080rem; margin: 0; font-size: clamp(36rem, 6vw, 92rem); line-height: .95; text-wrap: balance; }
.split__dek { max-width: 720rem; margin: 30rem 0 0; font: 400 clamp(19rem, 2.25vw, 27rem)/1.4 var(--font-body); }
.split__hero { max-width: 1400rem; margin: 0 auto; padding: 0 var(--shell-gutter); }
.split__hero :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: 16 / 8.5; object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); overflow: hidden; background: var(--signal-field); }
.split figure figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.split__article { max-width: 1100rem; margin: clamp(36rem, 6vw, 76rem) auto 0; padding: 0 var(--shell-gutter); display: grid; grid-template-columns: 190rem minmax(0, 690rem); justify-content: space-between; gap: clamp(28rem, 6vw, 100rem); }
.split__margin-note { align-self: start; position: sticky; top: 106rem; padding: 16rem; background: var(--signal-field); border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); font: 400 14rem/1.45 var(--font-body); }
.split__margin-note p { margin: 0; }
.split__margin-note p + p { margin-top: 10rem; }
.split__margin-note p:first-child { font: 700 11rem/1.2 var(--font-mono); letter-spacing: .07em; text-transform: uppercase; }
.split__prose { font: 400 clamp(18rem, 1.9vw, 21rem)/1.62 var(--font-body); }
.split__prose p { margin: 0 0 24rem; }
.split__prose .split__lead::first-letter { float: left; margin: 2rem 11rem 0 0; font: 500 5.1em/.72 var(--font-display); color: var(--signal-cobalt); }
.split__prose a { color: inherit; text-decoration: underline; text-decoration-color: var(--signal-cobalt); text-decoration-thickness: 2px; text-underline-offset: 3px; }
.split__prose h2 { margin: 64rem 0 20rem; font-size: clamp(30rem, 3.6vw, 46rem); line-height: .98; }
.split blockquote { margin: 45rem 0; padding: 24rem 26rem; border-left: 8rem solid var(--signal-cobalt); background: var(--paper-2); border-radius: 0 var(--radius-m) var(--radius-m) 0; font: 500 clamp(22rem, 2.6vw, 32rem)/1.12 var(--font-display); letter-spacing: -.03em; }
.split blockquote p { margin: 0; }
.split__visual { margin: 50rem 0 45rem; }
.split__visual figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.split__visual :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--signal-field); }
.split__prose :deep(.sbl) { margin-left: 0; margin-right: 0; }
.split__closing { margin-top: 38rem !important; padding-top: 28rem; border-top: var(--stroke) solid var(--ink); font: 500 clamp(22rem, 2.6vw, 34rem)/1.14 var(--font-display); letter-spacing: -.035em; }
.split__sources { max-width: 1100rem; margin: clamp(64rem, 10vw, 130rem) auto 0; padding: 34rem var(--shell-gutter) 0; border-top: var(--stroke) solid var(--ink); }
.split__sources h2 { margin: 12rem 0 30rem; font-size: clamp(33rem, 4vw, 48rem); line-height: .95; font-family: var(--font-display); font-weight: 500; letter-spacing: -.05em; }
.split__sources ol { max-width: 760rem; padding: 0; list-style: none; }
.split__sources li { padding: 16rem 0; border-top: var(--stroke) solid var(--line); font-size: 15rem; line-height: 1.45; }
.split__sources a { color: inherit; }
.split__sources span { color: var(--signal-cobalt); font-family: var(--font-mono); }
.split__sources em { color: var(--ink-soft); }
.split__newsletter-wrap { max-width: 1100rem; margin: clamp(54rem, 8vw, 100rem) auto 0; padding: 0 var(--shell-gutter); }
@media (max-width: 760px) {
  .split__hero { padding: 0; }
  .split__hero :deep(.ed-editorial-image) { border-left: 0; border-right: 0; border-radius: 0; aspect-ratio: 4 / 3; }
  .split__article { display: block; }
  .split__margin-note { position: static; margin-bottom: 36rem; }
  .split__prose h2 { margin-top: 52rem; }
  .split__visual { margin-left: 0; margin-right: 0; }
}
</style>
