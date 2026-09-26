<script setup lang="ts">
import { INNER_SPEECH_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${INNER_SPEECH_BLOG.socialTitle} · The Entertrainer Blogs`,
  description: INNER_SPEECH_BLOG.socialHook,
  ogTitle: INNER_SPEECH_BLOG.socialTitle,
  ogDescription: INNER_SPEECH_BLOG.socialHook,
  ogUrl: `https://entertrainer.in/elevate/${INNER_SPEECH_BLOG.slug}`,
  ogImage: `https://entertrainer.in${INNER_SPEECH_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: INNER_SPEECH_BLOG.socialTitle,
  twitterDescription: INNER_SPEECH_BLOG.socialHook,
  twitterImage: `https://entertrainer.in${INNER_SPEECH_BLOG.hero}`
})

const references = [
  { id: 1, title: 'Not Everybody Has an Inner Voice: Behavioral Consequences of Anendophasia', source: 'Nedergaard & Lupyan, Psychological Science, 2024', href: 'https://pubmed.ncbi.nlm.nih.gov/38728320/' },
  { id: 2, title: 'Inner Speech: Development, Cognitive Functions, Phenomenology, and Neurobiology', source: 'Alderson-Day & Fernyhough, Psychological Bulletin, 2015', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4538954/' },
  { id: 3, title: 'Suppressing the “white bears”', source: 'American Psychological Association, 2011', href: 'https://www.apa.org/monitor/2011/10/unwanted-thoughts' },
  { id: 4, title: 'Inner Speech', source: 'Stanford Encyclopedia of Philosophy, 2023', href: 'https://plato.stanford.edu/entries/inner-speech/' }
]
</script>

<template>
  <div class="taj">
    <header class="taj__head">
      <NuxtLink to="/elevate" class="taj__back">The Entertrainer Blogs</NuxtLink>
      <p class="taj__meta">{{ INNER_SPEECH_BLOG.category }} <span aria-hidden="true">·</span> {{ INNER_SPEECH_BLOG.minutes }} min read</p>
      <h1>{{ INNER_SPEECH_BLOG.title }}</h1>
      <p class="taj__dek">{{ INNER_SPEECH_BLOG.dek }}</p>
    </header>

    <figure class="taj__hero">
      <EdEditorialImage :src="INNER_SPEECH_BLOG.hero" :alt="INNER_SPEECH_BLOG.heroAlt" />
    </figure>

    <article class="taj__article">
      <aside class="taj__margin-note" aria-label="Reading note">
        <p>One tool.</p>
        <p>Inner speech is a way of thinking. It is not the whole mind, and you do not need it to have a rich inner life.</p>
      </aside>

      <div class="taj__prose">
        <p class="taj__lead">It is 1:00 a.m. The message is typed. The thumb hovers.</p>
        <p>Third version. The first was too sharp. The second was too soft. This one pretends not to care.</p>
        <p>None of it is out loud. A small press secretary is running lines before they reach anyone else’s phone.</p>

        <h2>What is it?</h2>
        <p>Words you experience without anyone saying them. Psychologists call that inner speech.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>It reads the text before you send it. It edits a sentence while you are still talking. Sometimes it objects after you already decided. Useful. A little late to the meeting.</p>
        <p>Try holding a phone number for ten seconds. You may repeat it silently. Try not to lose a name you just heard. You may say it once to yourself. The first draft of a hard explanation often happens in private.</p>
        <p>Words give a thought handles. You can line up a few pieces, move one, and come back without starting over. Researchers tie inner speech to verbal working memory and to keeping yourself on track — and they also say the experience varies wildly from person to person.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>Before a hard conversation you practise the opening line. Then the other person says something you did not write. Your imaginary version was very sure about that part.</p>

        <figure class="taj__visual">
          <EdEditorialImage
            src="/blog/inner-speech/rehearsal-loop.jpg"
            alt="A small desk inside a head, drawn in black ink, with one cobalt line leaving the mouth."
          />
          <figcaption>Rehearsal is a first draft. It does not predict what the other person will actually say.</figcaption>
        </figure>

        <h2>Why is it significant?</h2>
        <p>The voice feels like a person because language has a speaker-shaped feel. It asks. It answers. It can be kind in the morning and a prosecutor at 1:00 a.m.</p>
        <p>A narrator-feeling does not prove a second narrator lives behind your eyes.</p>
        <p>Better picture: a microphone in a much larger room. Language, memory, pictures, habits, feelings, and the body can all take part. The sentence you “hear” is often just the part that reached the mic.</p>
        <p>For a long time people talked as if everyone had a running monologue. A 2024 study made that harder to keep. Adults who reported very little inner speech did worse on a verbal memory task and on rhyme judgments than adults who reported a lot of it. That is a difference in one tool. It is not a score for intelligence, and it is not proof that thought is missing.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>Someone may think in pictures, in the feel of a route, in a remembered voice, or in a mix that changes by the hour. You can know what you mean before the words show up. Some people never need the words to show up the same way.</p>

        <h2>Interesting facts and thoughts</h2>
        <p>Tell yourself not to think of a white bear. The bear walks in.</p>
        <p>In Daniel Wegner’s suppression experiment, people trying not to think of a white bear reported the thought more than once a minute, on average.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>
        <p>Avoiding a thought means checking whether it has appeared. The mind keeps opening the door to see if the guest is still outside. Terrible security.</p>
        <p>That does not make every stray thought meaningful. It means attention is not a clean switch. Grip harder, demand that it vanish, and you may keep feeding it.</p>
        <p>Where I have to be honest: the press secretary will keep talking. That is the job. You do not have to put it in charge.</p>
        <p>The larger mind is already doing more than narrating. It knows a face before the name. It feels a room is off before it can say why. Words often arrive afterwards and take the credit.</p>

        <blockquote>
          <p>The sentence in your head reached the microphone. It did not hold the meeting.</p>
        </blockquote>

        <p class="taj__closing">If the voice can rehearse the text, hold the number, and talk you out of sending it, who exactly is left to decide whether it gets sent?</p>
        <p>You are the room. The voice is one person in it.</p>
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

