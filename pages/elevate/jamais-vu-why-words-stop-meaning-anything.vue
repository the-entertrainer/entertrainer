<script setup lang="ts">
import { JAMAIS_VU_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${JAMAIS_VU_BLOG.title} · The Entertrainer Blogs`,
  description: JAMAIS_VU_BLOG.dek,
  ogTitle: JAMAIS_VU_BLOG.title,
  ogDescription: JAMAIS_VU_BLOG.dek,
  ogUrl: `https://entertrainer.in/elevate/${JAMAIS_VU_BLOG.slug}`,
  ogImage: `https://entertrainer.in${JAMAIS_VU_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: JAMAIS_VU_BLOG.title,
  twitterDescription: JAMAIS_VU_BLOG.dek,
  twitterImage: `https://entertrainer.in${JAMAIS_VU_BLOG.hero}`
})

const references = [
  { id: 1, title: 'Award for study into "the the the the" — the strange feeling of finding words unfamiliar', source: 'University of St Andrews', href: 'https://news.st-andrews.ac.uk/archive/award-for-study-into-the-the-the-the-strange-feeling-of-finding-words-unfamiliar/' },
  { id: 2, title: 'Semantic satiation', source: 'Wikipedia', href: 'https://en.wikipedia.org/wiki/Semantic_satiation' },
  { id: 3, title: 'Semantic Satiation and Cognitive Dynamics', source: 'Jakobovits, Psychological Reports, 1967', href: 'https://journals.sagepub.com/doi/10.1177/002246696700200103' },
  { id: 4, title: 'The Fascinating Science of Déjà Vu', source: 'Psychology Today, Dec 2023', href: 'https://www.psychologytoday.com/us/blog/brain-reboot/202312/the-fascinating-science-of-deja-vu' },
  { id: 5, title: 'Déjà vu experiences in healthy subjects are unrelated to laboratory tests of recollection and familiarity for word stimuli', source: 'Frontiers in Psychology, via PMC', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3842028/' },
  { id: 6, title: 'Tip of the tongue', source: 'Wikipedia, summarising Brown & McNeill, 1966', href: 'https://en.wikipedia.org/wiki/Tip_of_the_tongue' },
  { id: 7, title: 'Revealing the mechanisms of semantic satiation with deep learning models', source: 'Communications Biology, 2024', href: 'https://www.nature.com/articles/s42003-024-06162-0' },
  { id: 8, title: 'The Opposite of Déjà Vu Exists — And It’s Even Stranger', source: 'ScienceAlert', href: 'https://www.sciencealert.com/dj-vu-has-a-stranger-lesser-known-opposite-and-scientists-may-have-just-found-where-it-starts' },
  { id: 9, title: 'Entropy, Amnesia, and Abnormal Déjà Experiences', source: 'Frontiers in Psychology, via PMC', href: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9364811/' }
]

// The Vu family: four related, verified misfires between perception, memory, and the feeling of knowing.
const vuFamily = [
  { word: 'Jamais Vu', meaning: 'never seen', gloss: 'the familiar feels alien' },
  { word: 'Déjà Vu', meaning: 'already seen', gloss: 'the new feels like a rerun' },
  { word: 'Presque Vu', meaning: 'almost seen', gloss: 'the word is loaded, the label won’t surface' },
  { word: 'Déjà Vécu', meaning: 'already lived', gloss: 'the rarer, stronger cousin: not just familiar, but fully re-lived' }
]
</script>

<template>
  <main id="main" class="jv">
    <header class="jv__head">
      <NuxtLink to="/elevate" class="jv__back">The Entertrainer Blogs</NuxtLink>
      <p class="jv__meta">{{ JAMAIS_VU_BLOG.category }} <span aria-hidden="true">·</span> {{ JAMAIS_VU_BLOG.minutes }} min read</p>
      <h1>Why Staring at a Word Long Enough Can Make It Stop Being a Word</h1>
      <p class="jv__dek">{{ JAMAIS_VU_BLOG.dek }}</p>
    </header>

    <figure class="jv__hero">
      <EdEditorialImage :src="JAMAIS_VU_BLOG.hero" :alt="JAMAIS_VU_BLOG.heroAlt" />
      <figcaption>AI-generated illustration, created for this article. Not a photograph of any real document or object.</figcaption>
    </figure>

    <article class="jv__article">
      <aside class="jv__margin-note" aria-label="Reading note">
        <p>One useful word.</p>
        <p><strong>Jamais vu</strong> is French for "never seen" — the sensation of looking at something intensely familiar and finding it suddenly foreign. It is the stranger, lesser-known opposite of déjà vu.</p>
      </aside>

      <div class="jv__prose">
        <p class="jv__lead">I recently moved into a new role at work. Among other things, I am now a CQA auditor.</p>
        <p>Which mostly means reading the same training module four or five times in a row, hunting for the one wrong word sitting quietly inside forty right ones.</p>
        <p>One evening I had been staring at a single module for twenty minutes. I landed on one sentence, then on one word inside it. <em>Door.</em> Door. Door.</p>
        <p>By the eighth pass, something went wrong. The double <em>o</em> started looking absurd — two confused eyes staring back. The sound in my head turned into a flat, alien grunt. I knew exactly what a door was.</p>
        <p>And for about ten seconds, my brain looked at four letters and asked, with real suspicion, whether "door" was even a real English word.</p>
        <p>I hadn't forgotten how to spell.</p>
        <p>I had walked headfirst into a glitch with a name, a research literature, and — as of 2023 — an Ig Nobel Prize.</p>

        <h2>The question underneath the glitch</h2>
        <p>Actually, here's what bothered me about it. Meaning feels like something a word <em>carries</em> — cargo you pick up the instant your eyes land on the letters. But if that were true, meaning shouldn't be able to leak out through repetition. You didn't forget English between the first "door" and the eighth. Same four letters. Same volume of knowledge.</p>
        <p>The cargo just... came up empty.</p>
        <p>Which suggests meaning isn't cargo at all. It's something closer to a live feed — a connection your brain re-establishes between the shape of a word and its concept, freshly, more or less every time you read it. Most of the time that feed is instant and invisible, so you never notice it's a process rather than a fact.</p>
        <p>Stare at one word sixty times, though, and you can actually watch the feed drop.</p>

        <figure class="jv__fade" aria-label="The word door repeated six times, each repetition drawn fainter and more spaced out, to show the word losing its grip as a repeated word gets stared at.">
          <span v-for="n in 6" :key="n" class="jv__fade-word" :style="{ opacity: 1 - (n - 1) * 0.15, letterSpacing: `${(n - 1) * 0.09}em` }">door</span>
          <figcaption>Nothing about the letters changes. What changes, research suggests, is whether the "meaning connection" is still firing on that particular pass.<a href="#ref-2" aria-label="Reference 2">[2]</a></figcaption>
        </figure>

        <h2>A glitch old enough to predate its own name</h2>
        <p>This effect is called <strong>semantic satiation</strong>: repetition or prolonged staring causing a word to temporarily lose its meaning, leaving behind what feels like a string of meaningless sound or shape.<a href="#ref-2" aria-label="Reference 2">[2]</a> The psychologist Edward Titchener noted the experience informally in the late 1800s, and it collected several working names — "verbal satiation," "lapse of meaning," plain old "mental fatigue" — before Leon Jakobovits James gave it its current name in his 1962 doctoral dissertation at McGill, framing it as a kind of reactive inhibition building up in the neural circuits that keep firing the same signal.<a href="#ref-2" aria-label="Reference 2">[2]</a><a href="#ref-3" aria-label="Reference 3">[3]</a></p>
        <p>So the wall I hit over "door" already had a name before I was born. That is, honestly, a little deflating.</p>
        <p>It is also reassuring: an entire minor field of psychology exists because this happens to enough people, reliably enough, to be worth measuring. I am not malfunctioning. I am, apparently, a well-documented case.</p>

        <h2>The study that actually measured it</h2>
        <p>In 2023, a team led by Chris Moulin, with Nicole Bell and Akira O'Connor at the University of St Andrews, won the Ig Nobel Prize in Literature for a study that did exactly what I'd done by accident, except on purpose and with a stopwatch.<a href="#ref-1" aria-label="Reference 1">[1]</a> Ninety-four undergraduates were asked to copy out a word by hand, over and over, and to stop whenever it started to feel wrong. Some words were ordinary ("door"), some deliberately obscure ("sward"). Across two experiments, roughly two-thirds of participants reported the word turning strange — typically after about 30 repetitions, inside a single minute.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>The paper's title says the joke out loud before you can: "The The The The Induction of Jamais Vu in the Laboratory: Word Alienation and Semantic Satiation." As O'Connor put it, jamais vu is "the strange feeling of finding something unfamiliar or peculiar when we know it should be familiar" — and here, the researchers had found a reliable, low-tech way to switch it on.<a href="#ref-1" aria-label="Reference 1">[1]</a> Your knowledge that "door" is a real word doesn't change. Your <em>subjective experience</em> of encountering it does.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>

        <blockquote>
          <p>Nothing about the word moved. What moved was the feeling of recognising it — which turns out to be a separate thing from actually knowing it.</p>
        </blockquote>

        <h2>The rest of the family</h2>
        <p>Jamais vu is not a lone oddity. It belongs to a small, real family of moments where perception, memory, and the <em>feeling</em> of knowing fall out of sync with each other.</p>

        <figure class="jv__family" aria-label="Four related memory phenomena: Jamais Vu, Deja Vu, Presque Vu, and Deja Vecu.">
          <div v-for="item in vuFamily" :key="item.word" class="jv__family-card">
            <strong>{{ item.word }}</strong>
            <span class="jv__family-meaning">{{ item.meaning }}</span>
            <span class="jv__family-gloss">{{ item.gloss }}</span>
          </div>
          <figcaption>Four documented ways the "is this familiar?" check can misfire — not four names for the same thing.<a href="#ref-5" aria-label="Reference 5">[5]</a><a href="#ref-6" aria-label="Reference 6">[6]</a><a href="#ref-9" aria-label="Reference 9">[9]</a></figcaption>
        </figure>

        <p><strong>Déjà vu</strong> — "already seen" — is jamais vu's mirror image: a brand-new moment feels like a rerun. One influential account, developed by researchers including Akira O'Connor, treats it as a sign that a memory-checking system in the frontal lobe is doing its job. The temporal lobe sends up a raw "this feels familiar" signal; the frontal regions compare it against what you can actually recall, and when the two disagree — strong familiarity, zero matching memory — you get that specific, slightly vertiginous déjà vu feeling.<a href="#ref-4" aria-label="Reference 4">[4]</a> On this account, déjà vu is arguably a good sign: it means your brain's fact-checker caught a false alarm before it turned into a false memory.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>That is one influential interpretation, not a settled law. A separate line of research, including work using immersive virtual-reality scenes, points to a "gestalt familiarity" route instead: a new scene can share enough spatial layout with an old, unrecalled one that it feels eerily familiar even without any single object matching.<a href="#ref-4" aria-label="Reference 4">[4]</a> Other laboratory work has found that everyday déjà vu reports don't line up neatly with standard lab tests of recollection and familiarity for word stimuli, which is a polite scientific way of saying the full mechanism is still genuinely unsettled.<a href="#ref-5" aria-label="Reference 5">[5]</a></p>
        <p><strong>Presque vu</strong> — "almost seen" — is the tip-of-the-tongue state: certain you know a word, unable to produce it, sometimes stuck holding only its first letter or its rhythm. Roger Brown and David McNeill's classic 1966 study found this happens to most people roughly once a week, more often for proper names, and more often as people get older.<a href="#ref-6" aria-label="Reference 6">[6]</a> It is presented here as a genuine retrieval failure, not a lapse in knowledge — later work found that priming people with phonologically similar words can noticeably improve their odds of finally retrieving it, which fits the idea that the memory is there, just temporarily unreachable by the usual route.<a href="#ref-6" aria-label="Reference 6">[6]</a></p>
        <p><strong>Déjà vécu</strong> — "already lived" — is the family's more serious member. Instead of a fleeting flicker of false familiarity, it is a sustained, often distressing conviction of having already lived through the current moment in full detail. In its persistent form it's been documented in some cases of dementia and temporal lobe epilepsy, where it can shift from a passing curiosity into a genuine clinical symptom.<a href="#ref-9" aria-label="Reference 9">[9]</a> Worth saying plainly: an occasional jamais vu over a word you've been proofreading for twenty minutes is not that. Frequency and distress are what separate an everyday glitch from a medical one.</p>

        <figure class="jv__loop" aria-label="An original schematic diagram showing a signal path from the temporal lobe to the frontal lobe, where it is checked and returned as either a deja vu or jamais vu misfire.">
          <EdEditorialImage src="/blog/jamais-vu/checking-loop.svg" alt="A simplified original diagram: the temporal lobe sends a familiarity signal to the frontal lobe, which checks it against memory. A confirmed match is ordinary recognition. A signal with no matching memory is labelled deja vu. A weakened signal from a familiar, over-repeated input is labelled jamais vu." />
          <figcaption>Original schematic diagram drawn for this article, simplified for clarity — not an anatomical or clinical reference. © The Entertrainer, 2026. Based on the error-checking account described in the sources above.<a href="#ref-4" aria-label="Reference 4">[4]</a></figcaption>
        </figure>

        <h2>Where the tidy story gets complicated</h2>
        <p>It would be satisfying to end here: meaning is a live connection, repetition wears it down, done. Recent evidence suggests it isn't that clean.</p>
        <p>A 2024 study in <em>Communications Biology</em> built a deep-learning model wired to mimic the visual cortex — the part of the brain that processes raw shapes, before any question of "meaning" enters the picture — and fed it the same repeating visual pattern over and over. Its classification accuracy rose, peaked, and then fell, with nothing else changed.<a href="#ref-7" aria-label="Reference 7">[7]</a> The researchers' interpretation is that satiation may be, at least partly, a "bottom-up" process starting in low-level visual processing, rather than something imposed top-down by the brain's meaning system.<a href="#ref-7" aria-label="Reference 7">[7]</a></p>
        <p>Read carefully, that is a hypothesis built from an artificial model, not direct proof of what happens in a living brain — and it's one study, not a consensus. But if it holds up, it means my ten seconds of "door" alienation may not have started with my brain losing faith in what the word <em>means</em>. It may have started earlier than that, with my visual system quietly getting bored of the shape "d-o-o-r" itself, before meaning ever had a chance to fail.<a href="#ref-8" aria-label="Reference 8">[8]</a> Either way, the outcome at my desk was identical. The location of the glitch is still an open question; the glitch itself is not.</p>

        <h2>What this is actually about</h2>
        <p>This was never really about the word "door."</p>
        <p>My new job is, in a very literal sense, staring at things until they either hold up or don't. Turns out the machine doing the staring has a documented failure mode — one where the words keep working perfectly for a coworker glancing at the same page for the first time, and quietly stop working for me on the fifth pass. Nothing to do with my competence. Everything to do with how repetition interacts with a checking system that was never built to run in a loop.</p>
        <p>You've likely felt a smaller version of this without a job title attached to it. Imagine: walking into your own living room after a long trip and feeling, for a few seconds, like a guest in someone else's house. Looking at a close friend's face until the features stop assembling into "them" and just sit there as features.</p>
        <p>That's jamais vu, running on a room or a face instead of a word — the same signal, briefly declining to confirm what it already knows.</p>
        <p>So why did "door" stop looking like a word? Not because I forgot English. Because the specific, moment-to-moment feeling of recognising a word is generated fresh, almost every time, by a system that gets measurably worse at its job the moment you make it run the same check thirty times in a row.</p>
        <p class="jv__closing">Which is a strange thing to learn about your own mind from an auditing job — that the part of you checking for errors is, itself, running on a system that develops its own errors the harder you make it look.</p>
        <p>So the next time a word looks wrong on the fifth read: don't panic, don't Google your symptoms. Just blink, look away, look back. The feed reconnects. It always does.</p>
      </div>
    </article>

    <section class="jv__sources" aria-labelledby="sources-title">
      <p class="jv__meta">References</p>
      <h2 id="sources-title">Sources used in this article</h2>
      <ol>
        <li v-for="reference in references" :id="`ref-${reference.id}`" :key="reference.id">
          <a :href="reference.href" target="_blank" rel="noreferrer"><span>[{{ reference.id }}]</span> {{ reference.title }} <em>{{ reference.source }}</em></a>
        </li>
      </ol>
      <p class="jv__image-credit">Hero illustration: AI-generated for this article using Gamma, and original to The Entertrainer. Checking-loop diagram: hand-drawn schematic, original to The Entertrainer, © 2026 — simplified for clarity and not an anatomical or medical reference.</p>
    </section>

    <div class="jv__newsletter-wrap"><EdNewsletter /></div>
  </main>
</template>

<style scoped>
/* Jamais vu: same editorial rhythm as the moonly piece, plus a real hero
   image, a fading-word figure, a four-card family grid, and an original
   inline SVG diagram of the checking-loop mechanism. */
.jv { padding-bottom: 112rem; }
.jv__head { max-width: var(--shell-wide); margin: 0 auto; padding: clamp(26rem, 5vw, 64rem) var(--shell-gutter) clamp(28rem, 5vw, 56rem); }
.jv__back, .jv__meta { font: 700 12rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.jv__back { color: var(--ink); }
.jv__meta { margin: clamp(46rem, 8vw, 104rem) 0 16rem; color: var(--signal-cobalt); }
.jv h1, .jv h2 { font-family: var(--font-display); font-weight: 500; letter-spacing: -.05em; }
.jv h1 { max-width: 1080rem; margin: 0; font-size: clamp(40rem, 6.6vw, 100rem); line-height: .95; text-wrap: balance; }
.jv__dek { max-width: 700rem; margin: 30rem 0 0; font: 400 clamp(19rem, 2.25vw, 27rem)/1.4 var(--font-body); }
.jv__hero { max-width: 1400rem; margin: 0 auto; padding: 0 var(--shell-gutter); }
.jv__hero :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: 16 / 8.5; object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); overflow: hidden; background: var(--signal-field); }
.jv figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.jv figcaption a { color: var(--signal-cobalt); text-decoration: none; }
.jv__hero figcaption { padding: 0 2rem; }
.jv__article { max-width: 1100rem; margin: clamp(36rem, 6vw, 76rem) auto 0; padding: 0 var(--shell-gutter); display: grid; grid-template-columns: 190rem minmax(0, 690rem); justify-content: space-between; gap: clamp(28rem, 6vw, 100rem); }
.jv__margin-note { align-self: start; position: sticky; top: 106rem; padding: 16rem; background: var(--signal-field); border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); font: 400 14rem/1.45 var(--font-body); }
.jv__margin-note p { margin: 0; }
.jv__margin-note p + p { margin-top: 10rem; }
.jv__margin-note p:first-child { font: 700 11rem/1.2 var(--font-mono); letter-spacing: .07em; text-transform: uppercase; }
.jv__prose { font: 400 clamp(18rem, 1.9vw, 21rem)/1.62 var(--font-body); }
.jv__prose p { margin: 0 0 24rem; }
.jv__prose .jv__lead::first-letter { float: left; margin: 2rem 11rem 0 0; font: 500 5.1em/.72 var(--font-display); color: var(--signal-cobalt); }
.jv__prose a { color: inherit; text-decoration: underline; text-decoration-color: var(--signal-cobalt); text-decoration-thickness: 2px; text-underline-offset: 3px; }
.jv__prose h2 { margin: 64rem 0 20rem; font-size: clamp(30rem, 3.6vw, 46rem); line-height: .98; }
.jv blockquote { margin: 45rem 0; padding: 24rem 26rem; border-left: 8rem solid var(--signal-cobalt); background: var(--paper-2); border-radius: 0 var(--radius-m) var(--radius-m) 0; font: 500 clamp(22rem, 2.6vw, 32rem)/1.12 var(--font-display); letter-spacing: -.03em; }
.jv blockquote p { margin: 0; }

/* Fading word figure */
.jv__fade { display: flex; flex-direction: column; align-items: flex-start; gap: 6rem; margin: 48rem 0 20rem; padding: 26rem 24rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper-2); }
.jv__fade-word { font: 700 clamp(24rem, 4vw, 40rem)/1 var(--font-display); text-transform: uppercase; color: var(--ink); }

/* Vu family grid */
.jv__family { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10rem; margin: 46rem 0 12rem; }
.jv__family-card { display: flex; flex-direction: column; gap: 7rem; padding: 18rem 15rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper-2); }
.jv__family-card:nth-child(1) { background: var(--signal-field); }
.jv__family-card:nth-child(2) { background: color-mix(in srgb, var(--signal-field) 70%, var(--paper)); }
.jv__family-card:nth-child(4) { background: color-mix(in srgb, var(--ink) 6%, var(--paper-2)); }
.jv__family-card strong { font: 500 clamp(19rem, 2.1vw, 25rem)/1.06 var(--font-display); letter-spacing: -.03em; }
.jv__family-meaning { font: 700 11rem/1.2 var(--font-mono); letter-spacing: .07em; text-transform: uppercase; color: var(--signal-cobalt); }
.jv__family-gloss { font: 400 13rem/1.35 var(--font-mono); color: var(--ink-soft); }
.jv__family figcaption { grid-column: 1 / -1; }

/* Original diagram */
.jv__loop { margin: 50rem 0 20rem; padding: 12rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper-2); }
.jv__loop :deep(.ed-editorial-image) { display: block; width: 100%; height: auto; background: var(--paper-2); }
.jv__loop :deep(img) { width: 100%; height: auto; object-fit: contain; }

.jv__closing { margin-top: 38rem !important; padding-top: 28rem; border-top: var(--stroke) solid var(--ink); font: 500 clamp(22rem, 2.6vw, 34rem)/1.14 var(--font-display); letter-spacing: -.035em; }
.jv__sources { max-width: 1100rem; margin: clamp(64rem, 10vw, 130rem) auto 0; padding: 34rem var(--shell-gutter) 0; border-top: var(--stroke) solid var(--ink); }
.jv__sources h2 { margin: 12rem 0 30rem; font-size: clamp(33rem, 4vw, 48rem); line-height: .95; }
.jv__sources ol { max-width: 760rem; padding: 0; list-style: none; }
.jv__sources li { padding: 16rem 0; border-top: var(--stroke) solid var(--line); font-size: 15rem; line-height: 1.45; }
.jv__sources a { color: inherit; }
.jv__sources span { color: var(--signal-cobalt); font-family: var(--font-mono); }
.jv__sources em { color: var(--ink-soft); }
.jv__image-credit { max-width: 760rem; margin: 26rem 0 0; padding-top: 20rem; border-top: var(--stroke) solid var(--line); font: 400 13rem/1.5 var(--font-mono); color: var(--ink-soft); }
.jv__newsletter-wrap { max-width: 1100rem; margin: clamp(54rem, 8vw, 100rem) auto 0; padding: 0 var(--shell-gutter); }

@media (max-width: 760px) {
  .jv__hero { padding: 0; }
  .jv__hero :deep(.ed-editorial-image) { border-left: 0; border-right: 0; border-radius: 0; aspect-ratio: 4 / 3; }
  .jv__hero figcaption { padding: 0 var(--shell-gutter); }
  .jv__article { display: block; }
  .jv__margin-note { position: static; margin-bottom: 36rem; }
  .jv__prose h2 { margin-top: 52rem; }
  .jv__family { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
