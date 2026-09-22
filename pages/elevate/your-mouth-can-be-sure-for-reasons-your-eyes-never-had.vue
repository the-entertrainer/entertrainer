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
        <p>Keep this straight.</p>
        <p>Your mouth reports what the speaking half saw. The other half can see something else. That other half can still move a hand.</p>
      </aside>

      <div class="split__prose">
        <p class="split__lead">Look at a tiny mark on a screen.</p>
        <p>A picture flashes to the left of the mark. The flash is very fast. Your eyes cannot cheat.</p>
        <p>Someone asks what you saw.</p>
        <p>You say, honestly: “Nothing.”</p>
        <p>Then your left hand reaches under a tray. It picks the matching object.</p>
        <p>This is not a party trick. Surgeons cut a cable in the brain to treat epilepsy. Then scientists ran careful lab tests. The tests showed a gap between seeing and telling.</p>

        <ClientOnly>
          <EdSplitBrainLab />
          <template #fallback>
            <p class="split__lab-fallback">Loading the split-brain lab…</p>
          </template>
        </ClientOnly>

        <h2>Why anyone cut the cable</h2>
        <p>Your brain has a left half and a right half. A thick bridge of fibres links them. That bridge is called the corpus callosum.</p>
        <p>In some hard epilepsy cases, a seizure starts on one side. Then it races across the bridge. Doctors cut the bridge to stop that spread. This was a last-resort surgery.</p>
        <p>In the early 1960s in Los Angeles, Phillip Vogel and Joseph Bogen did this work. Roger Sperry and Michael Gazzaniga later studied the patients at Caltech.<a href="#ref-1" aria-label="Reference 1">[1]</a><a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>Nobody removed a half of the brain. Many patients seemed almost ordinary in everyday talk. The surprising results showed up in the lab.</p>
        <p>Sperry shared the 1981 Nobel Prize for this line of work. His Nobel lecture is still a clear first source.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>

        <h2>A map you can hold in your head</h2>
        <p>Hold this map in mind.</p>
        <p>Each eye sees left space and right space. The wiring still crosses. The <strong>left half of the scene</strong> goes mainly to the <strong>right half of the brain</strong>. The right half of the scene goes mainly to the left half of the brain.</p>
        <p>In daily life your eyes keep moving. Both halves of the brain keep getting samples. The bridge keeps them in sync.</p>
        <p>After the bridge is cut, that direct sharing is gone. A brief flash on one side can reach only one half.</p>

        <p class="split__lab-note">Use the lab above for this map. Left of the mark goes to the right half. Right of the mark goes to the left half. Speech usually lives with the left half.</p>

        <h2>The flash that speech cannot name</h2>
        <p>Here is the test, step by step.</p>
        <p>The patient looks at a centre mark. A word or picture flashes for a tiny moment. It sits fully on the left, or fully on the right. The flash is too short for a normal eye move to drag it across.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>Then the team asks for an answer. Sometimes they ask for speech. Sometimes they ask for a point with one hand. Sometimes they ask for a match by touch under a screen.</p>
        <p>In many right-handed patients, this pattern appears. Flash on the <strong>right</strong> (left half of the brain). The mouth can name it. Flash on the <strong>left</strong> (right half of the brain). The mouth often says it saw nothing, or only a flash of light. The <strong>left hand</strong> can still pick the right object.</p>

        <p class="split__lab-note">Beat A in the lab shows this. Speech reports what the speaking half saw. The left hand can answer for the half that cannot speak.</p>

        <p>Older ideas treated the right half as almost useless for understanding. Sperry’s work showed the opposite. The quiet half could understand and act. The speaking half often did not know those acts had happened.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>

        <h2>Chicken claw, snow shovel, chicken shed</h2>
        <p>This is the famous trial. Get the details exact.</p>
        <p>Patient P.S. sat for a dual flash. The right half of the screen showed a <strong>chicken claw</strong>. That went to the left half of the brain. The left half of the screen showed a <strong>snow scene</strong>. That went to the right half of the brain. Each hand then chose a related picture from a set.<a href="#ref-3" aria-label="Reference 3">[3]</a><a href="#ref-6" aria-label="Reference 6">[6]</a></p>
        <p>The right hand picked a chicken. The left hand picked a snow shovel.</p>
        <p>Then someone asked why. The speaking left half had seen only the claw. It could also see both hands’ choices. It answered along these lines:</p>
        <blockquote>
          <p>Oh, that’s simple. The chicken claw goes with the chicken, and you need a shovel to clean out the chicken shed.</p>
        </blockquote>

        <p class="split__lab-note">Beat B in the lab shows the two hand choices. The shovel belonged with the snow. Speech folded it into a claw story so the moment still made sense.</p>

        <p>The shovel choice came from the snow scene. The left half never got that scene. Speech did not say “I do not know.” Speech <strong>rewrote the cause</strong>. Gazzaniga called that storytelling system the left-hemisphere <strong>interpreter</strong>.<a href="#ref-3" aria-label="Reference 3">[3]</a><a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>Related tests flash a command only to the right half. Examples include “walk” or “laugh.” The body does the act. Asked why, speech invents a reason. Action comes first. The story comes after.</p>

        <p class="split__lab-note">The last lab step is the interpreter. This is not social lying. It is a system whose job is to keep a story that holds.</p>

        <h2>What this does to “I saw it”</h2>
        <p>In these half-field tests, “I saw X” means something narrow. It means X reached the speech system. It does not mean every part of the brain saw X.</p>
        <p>That is the hard clarity. The voice that says “I” can feel sure. Another stream in the same brain never had those reasons. Confidence is not a perfect meter of what caused the answer.</p>
        <p>You do not need brain surgery to taste a milder version. Everyday psychology already shows sincere wrong reasons. Split-brain work is a clear neurological proof that fluent verbal causes can be invented.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>

        <h2>Where I have to be careful</h2>
        <p>These patients were not “two people” arguing in one skull. After recovery, a casual meeting often looked normal. Eyes scan. People cue themselves. Unity looks intact until the lab forces one-sided input.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>Patients also differ. The cut can vary. Age can vary. Some leftover cross-talk can remain. The classic papers rest on a small set of carefully studied people.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>Modern reviews say the “two conscious agents” story goes too far. One careful frame is a single conscious agent with <strong>split perception</strong>. Streams do not join. That still is not Hollywood dual persons.<a href="#ref-5" aria-label="Reference 5">[5]</a> Gazzaniga’s later frame is modular processing plus a left-sided interpreter that builds authorship and continuity.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>Sperry himself warned against wild left-brain / right-brain posters. Specialization is real. The self-help cartoon is not.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>

        <h2>The useful part</h2>
        <p>So what do you do with this on a Tuesday?</p>
        <p>Notice when your mouth is very sure, very fast. The sentence can feel like a live camera. Sometimes it is a story written after the hands have already moved.</p>
        <p>That does not mean nothing is real. The snow scene was real. The claw was real. The shovel choice was real. What got stitched was the cause story that made them one plot.</p>
        <p class="split__closing">Your mouth can be sure for reasons your eyes — on the other half of the brain — never had. The useful question is not how many people you are. The useful question is how much of “I saw it” was the whole sensing brain, and how much was the narrator doing its job.</p>
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
