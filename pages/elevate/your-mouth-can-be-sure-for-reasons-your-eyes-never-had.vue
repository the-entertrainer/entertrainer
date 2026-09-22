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
        <p>The mouth reports what reached the speaking half. Another half can register something the mouth never got — and still move a hand.</p>
      </aside>

      <div class="split__prose">
        <p class="split__lead">Imagine you are staring at a tiny mark on a screen.</p>
        <p>A picture flashes to the left of the mark — too quick for your eyes to cheat. Someone asks what you saw.</p>
        <p>You say, honestly: “Nothing.”</p>
        <p>Then your left hand, out of sight under a tray of objects, reaches over and picks the matching thing.</p>
        <p>Not a party trick. A surgery. A cable cut for epilepsy. And a laboratory that made the gap between <em>seeing</em> and <em>telling</em> impossible to ignore.</p>

        <h2>Why anyone cut the cable</h2>
        <p>The corpus callosum is the thick bridge of fibres between the left and right cortical hemispheres — on the order of hundreds of millions of axons. In severe, drug-resistant epilepsy, a seizure can start on one side and race across that bridge into the other.</p>
        <p>In the early 1960s in Los Angeles, neurosurgeons Phillip Vogel and Joseph Bogen sectioned that bridge (and sometimes related commissures) as a last-resort operation. The patients who reshaped cognitive science were then studied at Caltech with Roger Sperry and a young Michael Gazzaniga.<a href="#ref-1" aria-label="Reference 1">[1]</a><a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>Important: nobody removed a hemisphere. Subcortical routes stayed. After recovery, many patients looked almost ordinary in a casual conversation. The drama lived in the lab, where each half of the visual world could be delivered to only one side.</p>
        <p>Sperry shared the 1981 Nobel Prize in Physiology or Medicine for work on hemispheric specialization. His lecture is still the cleanest primary overview from the discoverer’s side.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>

        <h2>A map you can hold in your head</h2>
        <p>Each eye sees both left and right space. The wiring still crosses so that the <strong>left half of what you are looking at</strong> is handled mainly by the <strong>right hemisphere</strong>, and the right half by the left.</p>
        <p>In everyday life your eyes move. Both hemispheres keep getting overlapping samples. The callosum keeps them in register. After section, that direct cortical sharing is gone — so a brief flash locked to one side of fixation can reach one half while the other stays dark.</p>

        <figure class="split__visual">
          <EdEditorialImage
            src="/blog/your-mouth-can-be-sure-for-reasons-your-eyes-never-had/vision-map.jpg"
            alt="Cartoon head split left and right with a cobalt cable across the midline; left visual field box with a star arrows to the right half; right visual field box arrows to the left half."
          />
          <figcaption>Left of gaze → right half. Right of gaze → left half. The speaking system usually sits with the left.</figcaption>
        </figure>

        <h2>The flash that speech cannot name</h2>
        <p>Protocol, in plain clothes:</p>
        <p>Patient fixates a centre point. A word or picture is flashed for a fraction of a second entirely to the left or entirely to the right — historically with a tachistoscope, too brief for a voluntary eye movement to drag the image across.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>Then the experimenters ask for different kinds of answer: speech, or pointing with one hand, or matching by touch under a screen.</p>
        <p>Classic pattern in right-handers: flash to the <strong>right</strong> field (left hemisphere) → names it. Flash to the <strong>left</strong> field (right hemisphere) → speech often says it saw nothing, or only a flash of light — while the <strong>left hand</strong> can still select the correct object.</p>

        <figure class="split__visual">
          <EdEditorialImage
            src="/blog/your-mouth-can-be-sure-for-reasons-your-eyes-never-had/flash-test.jpg"
            alt="Lab screen with a fixation dot; a key flashes on the left; a silhouette says Nothing in a speech bubble while a left hand points to the matching key in a choice tray."
          />
          <figcaption>Speech reports the speaking half. The left hand can answer for the half that never got a microphone.</figcaption>
        </figure>

        <p>Sperry’s surprise, against older neurology, was how much the “mute” right side could comprehend and act — while the speaking left side stayed unaware of those performances.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>

        <h2>Chicken claw, snow shovel, chicken shed</h2>
        <p>This is the trial people retell. Worth getting exact.</p>
        <p>Patient P.S., in the Gazzaniga and LeDoux line of work: simultaneous half-field presentation. Right visual field (left hemisphere) gets a <strong>chicken claw</strong>. Left visual field (right hemisphere) gets a <strong>snow scene</strong>. Each hand chooses a related picture from an array.<a href="#ref-3" aria-label="Reference 3">[3]</a><a href="#ref-6" aria-label="Reference 6">[6]</a></p>
        <p>Right hand picks a chicken. Left hand picks a snow shovel.</p>
        <p>Asked why, the speaking left hemisphere — which saw only the claw, and can see both hands’ choices — answered along the lines of:</p>
        <blockquote>
          <p>Oh, that’s simple. The chicken claw goes with the chicken, and you need a shovel to clean out the chicken shed.</p>
        </blockquote>

        <figure class="split__visual">
          <EdEditorialImage
            src="/blog/your-mouth-can-be-sure-for-reasons-your-eyes-never-had/chicken-shovel.jpg"
            alt="Split panels: chicken claw to the left half, snow scene to the right half; right hand picks a chicken, left hand picks a cobalt shovel; speech bubble invents a chicken-shed story."
          />
          <figcaption>The shovel belonged to the snow. Speech folded it into a claw story so the moment stayed coherent.</figcaption>
        </figure>

        <p>The shovel choice was driven by a snow scene the left hemisphere never received. Rather than say “I don’t know why my left hand did that,” speech <strong>rewrote the cause</strong>. Gazzaniga called that storytelling system the left-hemisphere <strong>interpreter</strong>.<a href="#ref-3" aria-label="Reference 3">[3]</a><a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>Related demos: flash a command only to the right hemisphere (“walk,” “laugh”); the body complies; asked why, speech invents a reason. Action first. Narrative after.</p>

        <figure class="split__visual">
          <EdEditorialImage
            src="/blog/your-mouth-can-be-sure-for-reasons-your-eyes-never-had/interpreter.jpg"
            alt="Large head silhouette: cream left half contains a tiny press-secretary desk with a WHY bubble; black right half holds a cobalt eye; a cobalt arrow leaves the mouth."
          />
          <figcaption>Not a liar in the social sense. A system whose job is a story that holds.</figcaption>
        </figure>

        <h2>What this does to “I saw it”</h2>
        <p>Under half-field constraint, “I saw X” is a report about what entered the speech system — not a transparent readout of everything the brain registered.</p>
        <p>That is the uncomfortable clarity. The voice that says “I” can be sure for reasons another stream of the same brain never had. Confidence is not a meter of causal access.</p>
        <p>You do not need epilepsy surgery for the flavour of this. Everyday psychology already knows sincere wrong reasons — choice blindness, post-hoc justifications. Split-brain work is a neurological existence proof that fluent verbal causation can be invented.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>

        <h2>Where I have to be careful</h2>
        <p>These were not “two people” living in one skull, arguing over dinner. After recovery, casual meeting often failed to show anything odd. Eyes scan. People cue themselves. Unity looks intact until the lab forces lateralized input.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>Patients differ: extent of section, age, residual cross-talk, plastic change. P.S. later showed evolving right-hemisphere speech capacity in some reports. The classical literature rests on a small set of intensively studied individuals.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>Modern reviews argue the popular “two conscious agents” packaging overshoots. One line of work frames a single conscious agent with <strong>split perception</strong> — streams that do not integrate, without Hollywood dual persons.<a href="#ref-5" aria-label="Reference 5">[5]</a> Gazzaniga’s mature framing is modular processing plus a left-sided interpreter that constructs authorship and continuity.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>Sperry himself warned that left-brain / right-brain dichotomies are easy to run wild with. Specialization is real. The self-help poster is not.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>

        <h2>The useful part</h2>
        <p>So what do you do with this on a Tuesday?</p>
        <p>Maybe notice when your mouth is very sure, very fast. The sentence can feel like a camera feed. Sometimes it is a press release written after the hands have already moved.</p>
        <p>That is not “nothing is real.” The snow scene was real. The claw was real. The shovel choice was real. What got stitched was the causal story that made them one plot.</p>
        <p class="split__closing">Your mouth can be sure for reasons your eyes — on the other half of the brain — never had. The interesting question is not how many people you are. It is how much of “I saw it” was ever the whole sensorium, and how much was the narrator doing its job.</p>
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
