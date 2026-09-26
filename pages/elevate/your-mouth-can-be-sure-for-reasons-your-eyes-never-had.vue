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
      <aside class="taj__margin-note" aria-label="Reading note">
        <p>Hold this.</p>
        <p>Speech can deny what another half of the same brain has already acted on.</p>
      </aside>

      <div class="taj__prose">
        <p class="taj__lead">In 1962, surgeons cut the main bridge between the two halves of a man’s brain.</p>
        <p>His name was William Jenkins. He had been a World War II paratrooper. After a German soldier hit him in the head with a rifle butt, seizures took over his life. Drugs failed.</p>
        <p>In Los Angeles, Joseph Bogen and Philip Vogel cut his corpus callosum so a seizure on one side would have a harder time racing into the other. The seizures eased. In ordinary talk he seemed much like himself.</p>
        <p>Then Michael Gazzaniga and Roger Sperry tested him at Caltech. The quiet recovery stopped looking ordinary.<a href="#ref-8" aria-label="Reference 8">[8]</a><a href="#ref-2" aria-label="Reference 2">[2]</a></p>

        <h2>What is it?</h2>
        <p>The corpus callosum is the thick fibre bridge between the left and right halves of the brain. In hard epilepsy, a seizure can start on one side and cross that bridge. Cutting it was a last resort. Nobody removed half a brain.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>Everyday chat could still look normal. The odd results showed up when the lab sent a fact to only one side.</p>
        <p>Stare at a centre mark. The left half of the scene is handled mainly by the right half of the brain. The right half of the scene goes mainly to the left half. A flash too brief for the eyes to cheat can reach only one side.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>With Jenkins, and with later patients, a pattern returned. Flash on the right, so the left half gets it: speech can often name it. Flash on the left, so the right half gets it: speech often says “nothing,” while the left hand still picks the matching object.</p>
        <p>One half had seen it. The talking half had not. Both lived in the same skull. Sperry later shared the 1981 Nobel Prize for this line of work.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>

        <figure class="taj__visual">
          <EdEditorialImage
            src="/blog/your-mouth-can-be-sure-for-reasons-your-eyes-never-had/visual-field.jpg"
            alt="Cream-paper diagram: a left-field flash going to the right half of a head, speech blank, a hand still choosing."
          />
          <figcaption>Left-field flash, right half of the brain. Speech can say “nothing” while a hand still finds the match.</figcaption>
        </figure>

        <h2>Why is it significant?</h2>
        <p>A later patient, known as P.S., made it sharp. Two pictures at once: a chicken claw to the speaking left half, a snow scene to the right half. The right hand picked a chicken. The left hand picked a snow shovel.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>
        <p>Asked why, speech — which had seen only the claw — answered along these lines: the claw goes with the chicken, and you need a shovel to clean the chicken shed.</p>
        <p>The shovel belonged to the snow. The speaking half never got the snow. It did not say “I don’t know.” It built a reason that made the moment sound whole. Gazzaniga called that storytelling habit the left-hemisphere interpreter.<a href="#ref-3" aria-label="Reference 3">[3]</a><a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>Related tests flashed “walk” or “laugh” only to the right half. The body did it. Asked why, speech invented a reason. Action first. Story after.</p>
        <p>These patients were not two people arguing at dinner. After recovery, a casual meeting often looked normal. Eyes move. People cue themselves. The split shows up when the lab forces one-sided input.</p>

        <figure class="taj__visual">
          <EdEditorialImage
            src="/blog/your-mouth-can-be-sure-for-reasons-your-eyes-never-had/interpreter.jpg"
            alt="Ink drawing of a speaking mouth inventing a reason while a hand holds a shovel the mouth never saw."
          />
          <figcaption>Claw to one half, snow to the other. The mouth never saw the snow, and still invents a shed for the shovel.</figcaption>
        </figure>

        <h2>Interesting facts and thoughts</h2>
        <p>The evidence is mixed on what the split means for “how many of you” there are. It is not mixed on the lab trick.</p>
        <p>Around 2017, Yair Pinto and colleagues argued for one conscious agent with split perception: two streams that do not join, without Hollywood dual persons.<a href="#ref-5" aria-label="Reference 5">[5]</a> Others say some apparent unity is cross-cueing, one side tipping the other off. A 2020 review said we still lack enough evidence to settle the first-person question cleanly.<a href="#ref-6" aria-label="Reference 6">[6]</a></p>
        <p>In 2025 a new group sharpened the cut itself. Fully callosotomized patients still showed the classic disconnection. One patient, BT*, had a near-complete cut but about one centimetre of the rear tip — the splenium — left. Years later he showed no classic disconnection across vision, touch, space, and language, as if that remnant was enough to keep the sides working together.<a href="#ref-7" aria-label="Reference 7">[7]</a></p>
        <p>Sperry himself warned against wild left-brain / right-brain personality posters. Specialization is real. The self-help cartoon is not.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>Where I have to be honest: this is not a poster about personality types, and it is not a claim that everyone is two people. It is a harder point. The voice that says “I saw it” can feel sure while reporting only what reached the speaking half — after another half has already acted.</p>
        <p>Everyday life already has sincere wrong reasons after the fact. Split-brain work is one clear neurological proof that a fluent explanation can be built after the hands have moved.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>

        <blockquote>
          <p>Feeling sure is not a perfect meter of what caused the answer.</p>
        </blockquote>

        <p class="taj__closing">If the mouth can be sure for reasons another half of the same brain never had, how much of “I saw it” was the whole sensing brain — and how much was the narrator doing its job?</p>
        <p>Sit with the shovel. The shed was invented later.</p>
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

