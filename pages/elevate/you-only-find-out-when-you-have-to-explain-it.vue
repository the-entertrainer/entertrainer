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
      <EdMarginNote label="A receipt, not a model.">
        <p>Feeling that you understand something is not the same as being able to rebuild it.</p>
      </EdMarginNote>
      <div class="taj__prose">
        <p class="taj__lead">Around the turn of the millennium, in a psychology lab at Yale, volunteers were handed a list of ordinary objects, a zip, a flush toilet, a cylinder lock, a speedometer, and asked how well they understood each one.</p>
        <p>Most rated themselves pretty well. Why not? They had used zips all their lives. They could work one in the dark, half asleep, in a hurry, wearing gloves. Then came the cruel part. The researchers, Leonid Rozenblit and Frank Keil, asked them to write out, step by step, exactly how the thing works. Then they asked for the rating again.</p>
        <p>The scores dropped. Not a little. And the fall was much steeper for how-things-work questions than for facts, stories or procedures.<a href="#ref-1" aria-label="Reference 1">[1]</a> Rozenblit and Keil called it the illusion of explanatory depth. I prefer to think of it as the moment the lights go out in a room you were certain you knew.</p>

        <h2>The illusion of explanatory depth</h2>
        <p>Try it yourself, out loud. Explain a zip to someone who has never seen one. No diagram, no waving of hands, no “it just sort of meshes.” The slider moves. The teeth… do something. There is a wedge, probably. The two sides get pushed together, or pulled apart, by, well. Now draw the part that actually does the work. Most of us stall around step two, wearing the confident face of someone who has just realised they are lost but would rather not say so in front of the children.</p>
        <p>This is not because we are foolish. The mind stored a name, a rough gist and a habit of the hands, and then issued a feeling that those three things added up to understanding. It is a very convincing receipt. It just is not the item.</p>

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

        <h2>Familiarity and fluency</h2>
        <p>Why would the mind hand out fake receipts? One plausible reading is that daily life almost never asks for the full model. The zip works. The fridge hums. The clock on the wall tells the time without once showing you its insides. Gadgets with visible moving parts are where the illusion is strongest, because watching the parts move feels like watching how they work.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>What we usually have is proximity. We have stood near the mechanism. We know the vocabulary. We can point at it with confidence. That is not nothing. It is also not the same as being able to rebuild the thing if it vanished. You can say “it’s encrypted” at dinner parties for a decade. Ask what a key is, who holds it, and what end-to-end actually forbids, and watch the word quietly turn into decoration.</p>
        <p>Search makes the receipt cheaper still. In nine experiments with more than a thousand people, Matthew Fisher, Mariel Goddu and Frank Keil found that simply searching online made people believe more knowledge was stored inside their own heads.<a href="#ref-4" aria-label="Reference 4">[4]</a> A 2024 set of studies found that feeling powerful made people more confident in general but barely touched the drop that arrives once they have to explain the gadget.<a href="#ref-8" aria-label="Reference 8">[8]</a> The illusion does not care about your job title.</p>

        <h2>Explanations and confidence</h2>
        <p>My favourite version involves politics, the one subject on which everyone is an expert. In 2013 Philip Fernbach and colleagues asked people about complicated policies. Some listed their reasons for loving or hating a policy. Others had to explain, step by step, how the policy would actually produce the result it promised. The mechanism group softened.<a href="#ref-3" aria-label="Reference 3">[3]</a> Reasons feel like knowledge. A mechanism leaves nowhere to hide.</p>
        <p>Now imagine three people at a table, each holding forth on the same new tax. The first lists five reasons it is terrible. The second explains, haltingly, how it would change what a corner shop actually pays. The third has read one headline and is louder than both. The headline reader is the decoy. Next to him, the reasons person sounds thoughtful and the slow, honest mechanism explainer sounds unsure, which is exactly backwards.</p>
        <p>You have probably met the Dunning–Kruger effect, from a 1999 paper about people who are unskilled and unaware of it.<a href="#ref-2" aria-label="Reference 2">[2]</a> Researchers have argued ever since about how much of that famous picture is about people and how much is about the way the data was drawn.<a href="#ref-5" aria-label="Reference 5">[5]</a><a href="#ref-6" aria-label="Reference 6">[6]</a><a href="#ref-7" aria-label="Reference 7">[7]</a> What survives every version is smaller and more useful: all of us misjudge what we know, and the feeling of knowing is cheapest exactly where a mechanism is hiding.</p>
        <p>So the test is not whether you feel sure. Feeling sure is the factory setting of a mind that has seen something before. The test is whether you can say the next three steps without reaching for “basically” as a skip button. If you can’t, that is not a crisis. It is a map with a blank on it, and blanks are where the interesting walks begin.</p>

        <blockquote>
          <p>The feeling of knowing is cheap. The explanation is the invoice.</p>
        </blockquote>

        <p class="taj__closing">Maybe knowing is not something we have, like a coin in a pocket, but something we do, out loud, for exactly as long as someone keeps asking why.</p>
        <p>Ask for the next step. Then enjoy the blank.</p>
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
