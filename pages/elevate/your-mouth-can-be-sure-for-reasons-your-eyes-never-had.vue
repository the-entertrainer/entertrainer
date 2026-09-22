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
        <p>Story spine</p>
        <p>A real patient. A real surgery. Then the lab tests that made the result hard to ignore.</p>
      </aside>

      <div class="split__prose">
        <p class="split__lead">In the Second World War, an American paratrooper named William Jenkins jumped behind enemy lines. A German soldier hit him in the head with a rifle butt.</p>
        <p>He survived. Later, the seizures began.</p>
        <p>They got worse for years. Drugs did not stop them. By the early 1960s, Jenkins was living with epilepsy so severe that doctors considered a last-resort operation: cut the thick bridge of fibres that joins the left and right halves of the brain — the corpus callosum — so a seizure starting on one side would be less able to race into the other.</p>
        <p>In February 1962, in Los Angeles, neurosurgeons Joseph Bogen and Philip Vogel did that surgery. Jenkins recovered. In ordinary conversation he seemed much like himself. The seizures eased.</p>
        <p>Then a young researcher named Michael Gazzaniga, working with Roger Sperry at Caltech, began testing him in a lab. That is where the story turns strange.<a href="#ref-8" aria-label="Reference 8">[8]</a><a href="#ref-2" aria-label="Reference 2">[2]</a></p>

        <h2>What the doctors cut</h2>
        <p>Your brain has two large halves. A cable of roughly two hundred million fibres connects them. That cable is the corpus callosum.</p>
        <p>In some hard epilepsy cases, a seizure begins on one side and spreads across that bridge. Cutting the bridge was meant to stop the spread. Nobody removed a half of the brain. Everyday chat could still look normal. The odd results showed up when the lab sent information to only one side.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>Sperry later shared the 1981 Nobel Prize for this line of work.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>

        <h2>How they tested Jenkins</h2>
        <p>Vision is wired in a useful way for this kind of test. If you stare at a centre mark, the left half of the scene is handled mainly by the right half of the brain, and the right half of the scene by the left half of the brain.</p>
        <p>In daily life your eyes keep moving, so both halves usually share the world. After the bridge is cut, a very brief flash locked to one side can reach only one half — too fast for the eyes to cheat.</p>
        <p>Gazzaniga’s team used that. Flash a picture or word to one side. Ask the mouth what it saw. Or ask one hand to point or feel for a match under a screen.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>With Jenkins and later patients, a pattern kept returning. When the flash went to the right side of the screen (left half of the brain), speech could often name it. When the flash went to the left side (right half of the brain), speech often said “nothing” — or only that a light had flashed — while the left hand could still pick the matching object.</p>
        <p>One half had seen it. The talking half had not. Both lived in the same skull.</p>

        <ClientOnly>
          <EdSplitBrainLab />
          <template #fallback>
            <p class="split__lab-fallback">Loading the split-brain lab…</p>
          </template>
        </ClientOnly>
        <p class="split__lab-note">Step through the lab above to see the same layout: fixation mark, left/right flash, speech versus left hand.</p>

        <h2>Patient P.S. and the shovel story</h2>
        <p>A later patient, known in the papers as P.S., was a teenager when Gazzaniga’s group studied him. In one famous trial, two pictures flashed at once.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>
        <p>Right side of the screen: a chicken claw — to the speaking left half. Left side: a snow scene — to the right half. Each hand then chose a related picture from a set.</p>
        <p>The right hand picked a chicken. The left hand picked a snow shovel.</p>
        <p>Asked why, the speaking half — which had seen only the claw — answered along these lines:</p>
        <blockquote>
          <p>Oh, that’s simple. The chicken claw goes with the chicken, and you need a shovel to clean out the chicken shed.</p>
        </blockquote>
        <p>The shovel choice came from the snow. The speaking half never got the snow. It did not say “I don’t know.” It built a reason that made the moment sound whole. Gazzaniga called that storytelling system the left-hemisphere <strong>interpreter</strong>.<a href="#ref-3" aria-label="Reference 3">[3]</a><a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>Related tests flashed a command only to the right half — “walk,” or “laugh.” The body did it. Asked why, speech invented a reason. Action first. Story after.</p>

        <h2>What people still argue about</h2>
        <p>For a long time the popular takeaway was “two minds in one head.” That oversells it.</p>
        <p>After recovery, a casual meeting with these patients often looked ordinary. Eyes move. People cue themselves. The split shows up when the lab forces one-sided input.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>Around 2017, Yair Pinto and colleagues argued for a different frame: one conscious agent with <strong>split perception</strong> — two streams that do not join, without Hollywood dual persons.<a href="#ref-5" aria-label="Reference 5">[5]</a> Gazzaniga’s side has answered that some apparent unity may be cross-cueing: one side quietly tipping off the other. A 2020 review said the evidence is still not enough to settle the first-person question cleanly.<a href="#ref-6" aria-label="Reference 6">[6]</a></p>

        <h2>A new patient, 2025</h2>
        <p>Here is a finding that is not the old chicken-claw loop.</p>
        <p>In 2025, researchers reported a new adult callosotomy cohort. Three patients with a complete cut still showed the classic disconnection pattern across vision, touch, space, and language tasks.</p>
        <p>One patient, called BT* in the paper, had a near-complete cut — about ninety percent of the callosum gone — but about one centimetre of the rear tip (the splenium) left. Tested years later, he showed <strong>no</strong> classic disconnection across those same domains. Behaviourally, he looked integrated, as if the tiny remaining bridge was enough to keep the sides working together.<a href="#ref-7" aria-label="Reference 7">[7]</a></p>
        <p>That does not erase Jenkins or P.S. It sharpens the lesson: how much is cut, and what is left, can change the whole picture.</p>

        <h2>Why the story matters</h2>
        <p>The useful takeaway is not a poster about left-brain and right-brain personalities. Sperry himself warned against that cartoon.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>The useful takeaway is smaller and harder. The voice that says “I saw it” can feel sure. In these patients, that voice sometimes reported only what reached the speaking half — while another half had already acted on something else. Feeling sure is not a perfect meter of what caused the answer.</p>
        <p>You do not need this surgery to meet a milder version in ordinary life: sincere reasons invented after the fact. Split-brain work is one clear neurological proof that fluent explanations can be built after the hands have moved.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p class="split__closing">Start with Jenkins. Then the lab. Then the shovel story. Then the argument that is still open. The question in the title is not poetry. It is what the tests keep forcing back onto the table.</p>
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
.split__visual :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--signal-field); }
.split__lab-fallback { margin: 36rem 0; padding: 18rem; border: var(--stroke) dashed var(--line); border-radius: var(--radius-m); color: var(--ink-soft); font: 400 14rem/1.4 var(--font-mono); }
.split__lab-note { margin: 28rem 0 36rem !important; padding: 14rem 16rem; background: var(--signal-field); border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); font: 400 15rem/1.45 var(--font-body); }
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
