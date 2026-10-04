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
      <aside class="taj__margin-note" aria-label="Reading note">
        <p>A receipt, not a model.</p>
        <p>Familiarity is not the same as rebuilding the mechanism.</p>
      </aside>
      <div class="taj__prose">
        <p class="taj__lead">You have used a zip your whole life. You can work it in the dark. Ask what the slider actually does to the teeth — and watch the lighting go out.</p>
        <p>In 2002 Leonid Rozenblit and Frank Keil measured that blank. They asked people how well they understood everyday devices — zippers, toilets, speedometers, cylinder locks, helicopters — then asked for a detailed causal explanation, and a second rating. Understanding scores dropped. The drop was much larger for how things work than for facts, stories, or procedures.<a href="#ref-1" aria-label="Reference 1">[1]</a> They called it the illusion of explanatory depth. You do not find out you don’t know it by sitting with the feeling. You find out when the feeling has to become a sentence.</p>

        <h2>The illusion of explanatory depth</h2>
        <p>Try the zip out loud. Explain it to someone who has never seen one. No diagram. No “it just meshes.” The slider pulls. The teeth do something. There is a wedge, maybe. The two sides are forced together, or pulled apart. Now draw the part that actually does the work. Most people stall around step two.</p>
        <p>Not because they are foolish. The mind stored a label, a gist, and a motor habit, then issued a feeling that those three things were a working model. Someone at the table can explain a fridge, a tax, or why the match was lost with the same confidence — until someone asks for the mechanism. What pushes what. What happens next. The sentence that felt like a building turns out to be a doorway with nothing behind it.</p>

        <h2>Familiarity and fluency</h2>
        <p>Why issue a fake receipt? A plausible reading — an interpretation, not a little person in the skull — is that ordinary life rarely asks for the full model. The zip works. The fridge hums. Visible parts move, which is exactly when the illusion is strongest.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>What you often have is proximity. You have stood near the mechanism. You have heard the vocabulary. You can point. That is not nothing. It is also not the same as rebuilding the chain if the object vanished. You can use “it’s encrypted” as a social fact for years. Ask what a key is, who holds it, and what end-to-end actually forbids, and watch how fast the word becomes decoration.</p>
        <p>A 2024 set of preregistered studies still found the basic illusion for devices. Feeling powerful made people more generally overconfident. It barely changed the drop that appears once you have to explain the thing.<a href="#ref-8" aria-label="Reference 8">[8]</a> Search makes the receipt cheaper. In nine experiments with more than a thousand people, Matthew Fisher, Mariel Goddu, and Frank Keil found that searching online inflated how much knowledge people believed was already inside their own heads.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>

        <h2>Explanations and overconfidence</h2>
        <p>In 2013 Philip Fernbach and colleagues asked people about complex policies. Some had to explain the mechanism — how the policy would actually cause what it claimed. Some only listed reasons for liking or hating it. The mechanism group got less extreme.<a href="#ref-3" aria-label="Reference 3">[3]</a> Reasons feel like knowledge. A mechanism does not let you hide.</p>
        <p>The internet already named a picture: the Dunning–Kruger effect, from a 1999 paper about people who are unskilled and unaware of it.<a href="#ref-2" aria-label="Reference 2">[2]</a> Later work asked whether that picture was the data, or the way the data was drawn. A 2020 paper argued the famous pattern is mostly a statistical artefact.<a href="#ref-5" aria-label="Reference 5">[5]</a> A 2022 registered report found it was driven overwhelmingly by performance scores, not by a unique failure of insight at the bottom.<a href="#ref-6" aria-label="Reference 6">[6]</a> In 2026 Chris Dawson and David de Meza re-analysed large replication sets with models that treat both the test and the self-prediction as noisy. On that reading the popular picture shrinks a great deal.<a href="#ref-7" aria-label="Reference 7">[7]</a></p>
        <p>The 1999 claim and the later critiques are both still in the argument. What keeps showing up, under either reading, is smaller: people misjudge what they know. The feeling is cheap, especially for mechanisms, especially after a search. The test is not “do I feel sure.” Sure is the default of a mind that has seen the object before. The test is whether you can say the next three causal steps without using “basically” as a skip button. If you can’t, you do not have a crisis. You have a map with a blank.</p>

        <blockquote>
          <p>The feeling of knowing is cheap. The explanation is the invoice.</p>
        </blockquote>

        <p class="taj__closing">If the feeling arrives before the model, what are you actually holding when nobody has asked you a follow-up?</p>
        <p>Ask for the next step. Then sit with the blank.</p>
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
.taj__margin-note { position: static; max-width: var(--measure); margin: 0 0 var(--space-21); padding: var(--space-13); background: var(--accent); color: var(--accent-ink); border: var(--stroke) solid var(--ink); border-radius: 0; font: 400 var(--type-body)/1.45 var(--font-body); }
.taj__margin-note p { margin: 0; }
.taj__margin-note p + p { margin-top: 10rem; }
.taj__margin-note p:first-child { font: 500 var(--type-meta)/1.2 var(--font-mono); letter-spacing: .1em; text-transform: uppercase; }
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
@media (max-width: 760px) {
  .taj__hero { padding: 0; }
  .taj__hero :deep(.ed-editorial-image) { border-left: 0; border-right: 0; border-radius: 0; aspect-ratio: var(--crop); }
  .taj__article { display: block; }
  .taj__margin-note { position: static; margin-bottom: var(--space-21); }
  .taj__prose h2 { margin-top: 52rem; }
}
</style>
