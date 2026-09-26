<script setup lang="ts">
import { AI_UNDERSTAND_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${AI_UNDERSTAND_BLOG.socialTitle} · The Entertrainer Blogs`,
  description: AI_UNDERSTAND_BLOG.socialHook,
  ogTitle: AI_UNDERSTAND_BLOG.socialTitle,
  ogDescription: AI_UNDERSTAND_BLOG.socialHook,
  ogUrl: `https://entertrainer.in/elevate/${AI_UNDERSTAND_BLOG.slug}`,
  ogImage: `https://entertrainer.in${AI_UNDERSTAND_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: AI_UNDERSTAND_BLOG.socialTitle,
  twitterDescription: AI_UNDERSTAND_BLOG.socialHook,
  twitterImage: `https://entertrainer.in${AI_UNDERSTAND_BLOG.hero}`
})

const references = [
  { id: 1, title: 'Bloom’s Revised Taxonomy', source: 'Colorado College, after Anderson & Krathwohl, 2001', href: 'https://www.coloradocollege.edu/other/assessment/how-to-assess-learning/learning-outcomes/blooms-revised-taxonomy.html' },
  { id: 2, title: 'Bloom’s Taxonomy of Learning: Domain Levels Explained', source: 'Simply Psychology', href: 'https://www.simplypsychology.org/blooms-taxonomy.html' },
  { id: 3, title: 'How does next-token prediction train a large language model?', source: 'Sebastian Raschka', href: 'https://sebastianraschka.com/faq/docs/next-token-prediction.html' },
  { id: 4, title: 'The Surprising Power of Next Word Prediction', source: 'Center for Security and Emerging Technology, Georgetown', href: 'https://cset.georgetown.edu/article/the-surprising-power-of-next-word-prediction-large-language-models-explained-part-1/' },
  { id: 5, title: 'The Chinese Room Argument', source: 'Stanford Encyclopedia of Philosophy', href: 'https://plato.stanford.edu/entries/chinese-room/' },
  { id: 6, title: 'The Symbol Grounding Problem', source: 'Stevan Harnad, Physica D, 1990', href: 'https://philpapers.org/rec/HARTSG' },
  { id: 7, title: 'On the Dangers of Stochastic Parrots: Can Language Models Be Too Big?', source: 'Bender, Gebru, McMillan-Major & Shmitchell, FAccT, 2021', href: 'https://faculty.washington.edu/ebender/papers/Bender-NE-ExpAI.pdf' },
  { id: 8, title: 'The debate over understanding in AI’s large language models', source: 'Mitchell & Krakauer, PNAS, 2023', href: 'https://www.pnas.org/doi/10.1073/pnas.2215907120' },
  { id: 9, title: 'Emergent World Representations', source: 'Li et al., ICLR, 2023', href: 'https://arxiv.org/abs/2210.13382' },
  { id: 10, title: 'The free-energy principle: a unified brain theory?', source: 'Friston, Nature Reviews Neuroscience, 2010', href: 'https://www.nature.com/articles/nrn2787' },
  { id: 11, title: 'Other Minds', source: 'Stanford Encyclopedia of Philosophy', href: 'https://plato.stanford.edu/entries/other-minds/' }
]
</script>

<template>
<div class="taj">
    <header class="taj__head">
      <NuxtLink to="/elevate" class="taj__back">The Entertrainer Blogs</NuxtLink>
      <p class="taj__meta">{{ AI_UNDERSTAND_BLOG.category }} <span aria-hidden="true">·</span> {{ AI_UNDERSTAND_BLOG.minutes }} min read</p>
      <h1>{{ AI_UNDERSTAND_BLOG.title }}</h1>
      <p class="taj__dek">{{ AI_UNDERSTAND_BLOG.dek }}</p>
    </header>
    <figure class="taj__hero">
      <EdEditorialImage :src="AI_UNDERSTAND_BLOG.hero" :alt="AI_UNDERSTAND_BLOG.heroAlt" />
    </figure>
    <article class="taj__article">
      <aside class="taj__margin-note" aria-label="Reading note">
        <p>A verb, not a state.</p>
        <p>Prediction is something running right now. Understanding is a condition a good answer is only evidence of.</p>
      </aside>
      <div class="taj__prose">
        <p class="taj__lead">You type a half-finished rant into a chat box.</p>
        <p>The reply is so on the nose that you say it out loud, alone in the room: “Okay. It gets me.”</p>
        <p>It doesn’t. The reply can still be the best one you got all week. That is the problem.</p>
        <p>I design courses. I get paid to worry about one word: understand. When a machine starts using that word about itself, I want the transcript.</p>
        <h2>Four seconds of fluency</h2>
        <p>In 1956 Benjamin Bloom and a committee of examiners tried to make “understanding” something you could test. A 2001 revision by Lorin Anderson and David Krathwohl is what most people half-remember as Bloom’s Taxonomy: six things a mind can do with information, stacked from easier to harder.<a href="#ref-1" aria-label="Reference 1">[1]</a><a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>Understand sits second from the bottom. One step above simply remembering.</p>
        <p>A student can recite the definition of photosynthesis and still fail to say, in one original sentence, why a plant dies in a sealed dark cupboard. Recitation and comprehension look the same for about four seconds. Then you ask a follow-up, and one of them falls over.</p>
        <p>A large language model is professionally excellent at those four seconds.</p>
        <p>Under the brand name, the job is repetitive. Given the text so far, guess the next chunk. Then do it again, faster than any committee could survive.<a href="#ref-3" aria-label="Reference 3">[3]</a><a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>“The cat sat on the ___.” Rank the candidates. Pick one. Add it. Repeat, thousands of times, until you have an email.</p>
        <p>There is no separate “thinking about it” step behind a curtain. The predicting is the writing.</p>
        <h2>A chef who has never eaten</h2>
        <p>Picture a chef, Devraj, who has read every cookbook, review, and chemistry paper on browning, in every language. Ask what makes a dish “balanced.” He will hand you the best paragraph on balance ever assembled. Better than a working cook, because he has read all of them and none of them have read each other.</p>
        <p>Devraj has never eaten anything. No tongue. No hunger at 6pm.</p>
        <p>When he says “balanced,” is he describing a flavour, or a word that reliably follows other words in sentences about flavour?</p>
        <p>That gap has a name. In 1990 Stevan Harnad asked how a symbol could ever mean something inside a system that only touches other symbols, never the world those symbols are about.<a href="#ref-6" aria-label="Reference 6">[6]</a> His picture was a Chinese-to-Chinese dictionary. You can chase definitions forever and never touch a noodle.</p>
        <p>Fluent about a thing is not contact with the thing.</p>
        <figure class="taj__visual">
          <EdEditorialImage src="/blog/ai-understand/vintage-terminal.jpg" alt="A cream-paper drawing of an old terminal, black ink letters fading into a cobalt square that never leaves the screen." />
          <figcaption>Symbols on a screen can look fluent for a long time before anyone asks what they are grounded in.</figcaption>
        </figure>
        <p>John Searle’s Chinese Room, from 1980, is the older version of the same worry: a person following rules can produce answers in a language they do not understand.<a href="#ref-5" aria-label="Reference 5">[5]</a> I would be cutting corners if I pretended every serious researcher signed that and closed the case. They did not.</p>
        <p>In 2022 a small model was trained on nothing but legal moves in Othello. Its only job was to predict the next move. Inside it, researchers found an unprompted model of the actual board — not a memorised list of patterns, but something that behaved like the game state. They could find it, probe it, and edit it so the next move changed.<a href="#ref-9" aria-label="Reference 9">[9]</a></p>
        <p>Nobody told it to build a board. Predicting hard enough, for long enough, seemed to require one anyway.</p>
        <h2>The field is not settled</h2>
        <p>The evidence is mixed, and the field says so out loud. Melanie Mitchell and David Krakauer, reviewing the fight in 2023, note the split: some researchers argue today’s large models are building real, if alien, understanding. Others argue we are still being fooled by fluency, the way people were fooled by simple chatbots in the 1960s.<a href="#ref-8" aria-label="Reference 8">[8]</a></p>
        <p>This is not settled. Anyone who tells you it is settled, on either side, is selling something.</p>
        <p>A 2021 paper put the warning in plainer clothes. A system can be dazzling at text and still have no stake in whether the sentence is true.<a href="#ref-7" aria-label="Reference 7">[7]</a></p>
        <p>Where I have to be honest: you also cannot strictly prove to me that you understand this sentence. Philosophers call that the problem of other minds. I have direct access to one inner life — mine. Yours I infer from behaviour. The model’s, too.<a href="#ref-11" aria-label="Reference 11">[11]</a> Nobody has produced a knockdown solution. It is old, and still open, for a reason.</p>
        <p>Some people extend the presumption of an inner life only to a body like their own: something that flinches, something that can lose. Some people look at a system that built a working board from nothing but next-move guesses, and think understanding has already started. Both are readings. Neither one gets to end the other.</p>
        <p>Karl Friston’s free-energy idea is one way people talk about a nervous system that pays a price when its guess is wrong.<a href="#ref-10" aria-label="Reference 10">[10]</a> A model can be read that way as well. Every unlikely next word was a cost in training. Whether that cost is anything like hunger, or only like arithmetic, is still an open question.</p>
        <blockquote>
          <p>Speed can feel like being understood. It might also be understanding, arriving fast.</p>
        </blockquote>
        <p class="taj__closing">If a reply can be the next likely word and also feel like being known, what would you count as the difference?</p>
        <p>Sit with both. The room has not voted.</p>
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
