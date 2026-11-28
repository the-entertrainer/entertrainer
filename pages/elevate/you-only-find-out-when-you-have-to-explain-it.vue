<script setup lang="ts">
import { KNOWING_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${KNOWING_BLOG.socialTitle} · The Entertrainer Blogs`,
  description: KNOWING_BLOG.socialHook,
  ogTitle: KNOWING_BLOG.socialTitle,
  ogDescription: KNOWING_BLOG.socialHook,
  ogUrl: `https://entertrainer.in/elevate/${KNOWING_BLOG.slug}`,
  ogImage: `https://entertrainer.in${KNOWING_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: KNOWING_BLOG.socialTitle,
  twitterDescription: KNOWING_BLOG.socialHook,
  twitterImage: `https://entertrainer.in${KNOWING_BLOG.hero}`
})

const references = [
  { id: 1, title: 'The misunderstood limits of folk science: an illusion of explanatory depth', source: 'Rozenblit & Keil, Cognitive Science, 2002', href: 'https://doi.org/10.1207/s15516709cog2605_1' },
  { id: 2, title: 'Unskilled and unaware of it: How difficulties in recognizing one’s own incompetence lead to inflated self-assessments', source: 'Kruger & Dunning, Journal of Personality and Social Psychology, 1999', href: 'https://doi.org/10.1037/0022-3514.77.6.1121' },
  { id: 3, title: 'Political extremism is supported by an illusion of understanding', source: 'Fernbach, Rogers, Fox & Sloman, Psychological Science, 2013', href: 'https://doi.org/10.1177/0956797612464058' },
  { id: 4, title: 'Searching for explanations: How the Internet inflates estimates of internal knowledge', source: 'Fisher, Goddu & Keil, Journal of Experimental Psychology: General, 2015', href: 'https://doi.org/10.1037/xge0000070' },
  { id: 5, title: 'The Dunning-Kruger effect is (mostly) a statistical artefact', source: 'Gignac & Zajenkowski, Intelligence, 2020', href: 'https://doi.org/10.1016/j.intell.2020.101449' },
  { id: 6, title: 'Skill and self-knowledge: empirical refutation of the dual-burden account of the Dunning–Kruger effect', source: 'McIntosh, Fowler, Lyu & Della Sala, Royal Society Open Science, 2022', href: 'https://doi.org/10.1098/rsos.191727' },
  { id: 7, title: 'Talking the Talk, Not Walking the Walk: Coevolution of Overconfidence and Loss Aversion', source: 'Dawson & de Meza, Psychological Review, 2026', href: 'https://doi.org/10.1037/rev0000644' },
  { id: 8, title: 'Power and the illusion of explanatory depth', source: 'Körner, Schütz & Petersen, PLOS ONE, 2024', href: 'https://doi.org/10.1371/journal.pone.0297850' }
]
</script>

<template>
<div class="taj">
    <header class="taj__head">
      <NuxtLink to="/elevate" class="taj__back">The Entertrainer Blogs</NuxtLink>
      <p class="taj__meta">{{ KNOWING_BLOG.category }} <span aria-hidden="true">·</span> {{ KNOWING_BLOG.minutes }} min read</p>
      <h1>{{ KNOWING_BLOG.title }}</h1>
      <p class="taj__dek">{{ KNOWING_BLOG.dek }}</p>
    </header>
    <figure class="taj__hero">
      <EdEditorialImage :src="KNOWING_BLOG.hero" :alt="KNOWING_BLOG.heroAlt" />
    </figure>
    <article class="taj__article">
      <EdMarginNote label="A feeling is not the steps">
        <p>Feeling that you understand an object is not the same as being able to write the steps that make it work.</p>
      </EdMarginNote>
      <div class="taj__prose">
        <p class="taj__lead">Around the year 2000, in a psychology lab at Yale, volunteers were given a list of ordinary objects, including a zip, a flush toilet, a cylinder lock, and a speedometer, and they were asked how well they understood each one.</p>
        <p>Most people rated their understanding as fairly good. They had used zips for years, including in the dark. Leonid Rozenblit and Frank Keil then asked them to write, step by step, how the object works. After that writing, the researchers asked for the rating again.</p>
        <p>The scores fell. The fall was much larger for questions about how a thing works than for facts, stories, or procedures.<a href="#ref-1" aria-label="Reference 1">[1]</a> Rozenblit and Keil called the gap the illusion of explanatory depth. The name means that people feel they understand a mechanism more deeply than they can explain it.</p>

        <h2>Most explanations of a zip stop early</h2>
        <p>You can test the claim on a zip. Explain it to someone who has never seen one, without a diagram and without hand gestures. The slider moves, and the teeth meet or separate. Most explanations stall when they have to name the part inside the slider that pushes the teeth together or apart.</p>
        <p>The mind can store a name, a rough outline, and a habit of the hands, and those three can produce a feeling of understanding. The feeling is not the written sequence of steps.</p>

        <figure class="taj__visual taj__visual--archive taj__visual--portrait" style="--fig-ratio: 1143 / 1400">
          <EdEditorialImage
            src="/blog/you-only-find-out-when-you-have-to-explain-it/polvini-clock-movement-1745.jpg"
            alt="An eighteenth-century table clock movement in a metal case, with a bell on top and an enamel dial."
          />
          <figcaption>
            Image: Public Domain /
            <a href="https://www.metmuseum.org/art/collection/search/238025" target="_blank" rel="noreferrer">The Metropolitan Museum of Art</a>,
            Filippo Polvini, clock movement, 1745
          </figcaption>
        </figure>

        <h2>Use is not the same as a full account</h2>
        <p>One plausible reading is that daily life rarely asks for the full account. The zip works, the fridge runs, and a clock shows the time without showing its parts. The illusion is strongest for devices with visible moving parts, because watching the parts move can feel like seeing how they work.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>People often have a name and a place near the object, and they can point at it. Pointing is not the same as being able to rebuild the object. A person can say "it is encrypted" for years and still be unable to say what a key is, who holds it, and what end-to-end encryption forbids.</p>
        <p>Search can increase the feeling without adding the steps. In nine experiments with more than a thousand people, Matthew Fisher, Mariel Goddu, and Frank Keil found that searching online made people believe more knowledge was stored in their own heads.<a href="#ref-4" aria-label="Reference 4">[4]</a> A 2024 set of studies found that feeling powerful raised general confidence, and it barely changed the drop that arrives once people have to explain a device.<a href="#ref-8" aria-label="Reference 8">[8]</a></p>

        <h2>Reasons and mechanisms do different work</h2>
        <p>In 2013 Philip Fernbach and colleagues asked people about complicated policies. Some people listed reasons for liking or disliking a policy. Other people had to explain, step by step, how the policy would produce the result it promised. The group that had to explain the mechanism became less extreme.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>
        <p>A list of reasons, a step-by-step account of a shop's tax bill, and a repeated headline are three different kinds of talk. The headline can be the loudest, and the step-by-step account can sound less sure, even when it contains more of the mechanism.</p>
        <p>The Dunning-Kruger effect comes from a 1999 paper about people who were unskilled and did not know it.<a href="#ref-2" aria-label="Reference 2">[2]</a> Later researchers have argued about how much of that picture comes from the people and how much comes from the way the scores were plotted.<a href="#ref-5" aria-label="Reference 5">[5]</a><a href="#ref-6" aria-label="Reference 6">[6]</a><a href="#ref-7" aria-label="Reference 7">[7]</a> A smaller claim survives the argument. People misjudge what they know, and the feeling of knowing is easiest to have where a mechanism has not been written down.</p>
        <p>The useful test is not whether you feel sure. The useful test is whether you can state the next three steps. If you cannot, the account has a gap.</p>

        <blockquote>
          <p>The feeling of knowing is not the written explanation.</p>
        </blockquote>

        <p class="taj__closing">You find the gap when you have to say the next step, not when you rate how well you already know the object.</p>
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
