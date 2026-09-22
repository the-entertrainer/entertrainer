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
    title: 'The split-brain phenomenon revisited: A single conscious agent with split perception',
    source: 'Pinto, Lamme, de Haan et al., Trends in Cognitive Sciences, 2017',
    href: 'https://www.cell.com/trends/cognitive-sciences/fulltext/S1364-6613(17)30190-0'
  },
  {
    id: 6,
    title: 'Fifty years of split-brain research — a personal narrative and some implications',
    source: 'Brain, 2017 (interpreter figure and P.S. trial wording in the anniversary discussion)',
    href: 'https://academic.oup.com/brain/article/140/7/2051/3892700'
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
        <p>One fact to keep</p>
        <p>Speech reports what reached the talking side of the brain. The other side can still see something and move a hand — without speech knowing.</p>
      </aside>

      <div class="split__prose">
        <p class="split__lead">Have you ever been totally sure you saw nothing… and then your hand somehow still finds the right object?</p>
        <p>That is close to what happened in the classic split-brain lab tests. A person stares at a small mark on a screen. A picture flashes for a split second to the left of the mark — too fast for the eyes to cheat. Asked what they saw, they say “nothing.” Then the left hand, feeling under a tray, picks the matching object anyway.</p>
        <p>This was not a magic show. Surgeons had cut the main cable between the two halves of the brain to treat severe epilepsy. Later, researchers used careful tests to ask a simple question: if the halves cannot talk to each other, what can each half still do?<a href="#ref-1" aria-label="Reference 1">[1]</a><a href="#ref-2" aria-label="Reference 2">[2]</a></p>

        <ClientOnly>
          <EdSplitBrainLab />
          <template #fallback>
            <p class="split__lab-fallback">Loading the split-brain lab…</p>
          </template>
        </ClientOnly>

        <h2>Why the cable was cut</h2>
        <p>The brain has a left half and a right half. A thick bundle of fibres connects them. That bundle is called the corpus callosum.</p>
        <p>In some epilepsy cases, a seizure starts on one side and races across that bridge into the other side. In the early 1960s, surgeons Phillip Vogel and Joseph Bogen sometimes cut the bridge as a last-resort treatment. Roger Sperry and Michael Gazzaniga then studied those patients at Caltech.<a href="#ref-1" aria-label="Reference 1">[1]</a><a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>Nobody removed a half of the brain. In ordinary conversation, many patients looked almost normal. The strange results showed up when the lab sent information to only one side.</p>
        <p>Sperry shared the 1981 Nobel Prize for this work. His Nobel lecture is still a clear place to start.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>

        <h2>How vision is split</h2>
        <p>Here is the wiring map in plain terms.</p>
        <p>Each eye sees both left and right space. But inside the brain, the <strong>left half of what you are looking at</strong> is handled mainly by the <strong>right half of the brain</strong>, and the right half of the scene is handled mainly by the left half of the brain.</p>
        <p>In daily life your eyes keep moving, so both halves usually get overlapping samples, and the bridge keeps them coordinated. After the bridge is cut, a brief flash locked to one side of the fixation mark can reach only one half.</p>
        <p class="split__lab-note">The lab above shows this map. Left of the mark goes to the right half. Right of the mark goes to the left half. Speech usually lives with the left half.</p>

        <h2>The flash speech cannot name</h2>
        <p>The basic test works like this. The patient looks at a centre mark. A word or picture flashes for a fraction of a second, fully on the left or fully on the right — too short for a normal eye movement to drag it across.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>Then the experimenters ask for different kinds of answers: speech, pointing with one hand, or matching by touch under a screen.</p>
        <p>In many right-handed patients, a clear pattern showed up. Flash on the <strong>right</strong> (left half of the brain): the mouth can name it. Flash on the <strong>left</strong> (right half of the brain): the mouth often says it saw nothing, or only a flash of light — while the <strong>left hand</strong> can still pick the correct object.</p>
        <p class="split__lab-note">Beat A in the lab is this test. Speech reports what the talking half saw. The left hand can answer for the half that cannot speak.</p>
        <p>Older neurology had treated the right half as weak at understanding. Sperry’s work showed it could understand and act, while the speaking half often did not know those acts had happened.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>

        <h2>Chicken claw, snow, and a shovel</h2>
        <p>This is the famous trial. The details matter.</p>
        <p>Patient P.S. got two pictures at once. On the right side of the screen: a <strong>chicken claw</strong> (to the left half of the brain). On the left side: a <strong>snow scene</strong> (to the right half of the brain). Each hand then chose a related picture from an array.<a href="#ref-3" aria-label="Reference 3">[3]</a><a href="#ref-6" aria-label="Reference 6">[6]</a></p>
        <p>The right hand picked a chicken. The left hand picked a snow shovel.</p>
        <p>Asked why, the speaking left half — which had seen only the claw, but could see both hands’ choices — answered along these lines:</p>
        <blockquote>
          <p>Oh, that’s simple. The chicken claw goes with the chicken, and you need a shovel to clean out the chicken shed.</p>
        </blockquote>
        <p class="split__lab-note">Beat B in the lab shows the two hand choices. The shovel belonged with the snow. Speech folded it into a chicken story so the moment still made sense.</p>
        <p>The shovel choice was driven by the snow scene the left half never received. Speech did not say “I don’t know.” It invented a cause that fitted. Gazzaniga called that storytelling system the left-hemisphere <strong>interpreter</strong>.<a href="#ref-3" aria-label="Reference 3">[3]</a><a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>Related tests flash a command only to the right half — “walk,” or “laugh.” The body does it. Asked why, speech invents a reason. Action first. Story after.</p>
        <p class="split__lab-note">The last lab step is that interpreter. It is not social lying. It is a system whose job is to keep a story that holds together.</p>

        <h2>What “I saw it” means here</h2>
        <p>In these tests, “I saw X” is really a report about what reached the speech system. It is not a full readout of everything the brain registered.</p>
        <p>That is the uncomfortable part. The voice that says “I” can feel sure for reasons another part of the same brain never had. Feeling sure is not a perfect meter of what caused the answer.</p>
        <p>You do not need this surgery to meet a milder version. Everyday psychology already shows sincere wrong reasons after the fact. Split-brain work is a clear neurological proof that fluent explanations can be invented.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>

        <h2>Limits (important)</h2>
        <p>These patients were not “two people” arguing inside one skull. After recovery, a casual meeting often looked normal. Eyes move. People cue themselves. The odd split shows up when the lab forces one-sided input.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>Patients also differ — how much was cut, age, leftover cross-talk, later change. The classic literature rests on a small number of carefully studied people.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>Modern reviews say the popular “two conscious agents” packaging goes too far. One careful frame is a single conscious agent with <strong>split perception</strong> — streams that do not join, without Hollywood dual persons.<a href="#ref-5" aria-label="Reference 5">[5]</a> Gazzaniga’s later frame is modular processing plus a left-sided interpreter that builds a sense of authorship and continuity.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>Sperry himself warned against wild left-brain / right-brain posters. Specialization is real. The self-help cartoon is not.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>

        <h2>Why this is useful</h2>
        <p>So what do you take into an ordinary Tuesday?</p>
        <p>Notice when your mouth is very sure, very fast. The sentence can feel like a live camera feed. Sometimes it is a story written after the hands have already moved.</p>
        <p>That does not mean nothing is real. The snow was real. The claw was real. The shovel choice was real. What got stitched was the cause story that made them one plot.</p>
        <p class="split__closing">The useful question is not “how many people am I?” It is how much of “I saw it” was the whole sensing brain… and how much was the narrator doing its job.</p>
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
