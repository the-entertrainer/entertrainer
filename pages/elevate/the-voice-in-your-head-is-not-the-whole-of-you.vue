<script setup lang="ts">
import { INNER_SPEECH_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${INNER_SPEECH_BLOG.title} · The Entertrainer Blogs`,
  description: INNER_SPEECH_BLOG.dek,
  ogTitle: INNER_SPEECH_BLOG.title,
  ogDescription: INNER_SPEECH_BLOG.dek,
  ogUrl: `https://entertrainer.in/elevate/${INNER_SPEECH_BLOG.slug}`,
  ogImage: `https://entertrainer.in${INNER_SPEECH_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: INNER_SPEECH_BLOG.title,
  twitterDescription: INNER_SPEECH_BLOG.dek,
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
  <main id="main" class="voice">
    <header class="voice__head">
      <NuxtLink to="/elevate" class="voice__back">The Entertrainer Blogs</NuxtLink>
      <p class="voice__meta">{{ INNER_SPEECH_BLOG.category }} <span aria-hidden="true">·</span> {{ INNER_SPEECH_BLOG.minutes }} min read</p>
      <h1>{{ INNER_SPEECH_BLOG.title }}</h1>
      <p class="voice__dek">{{ INNER_SPEECH_BLOG.dek }}</p>
    </header>

    <figure class="voice__hero">
      <EdEditorialImage :src="INNER_SPEECH_BLOG.hero" :alt="INNER_SPEECH_BLOG.heroAlt" />
    </figure>

    <article class="voice__article">
      <aside class="voice__margin-note" aria-label="Reading note">
        <p>Keep this distinction.</p>
        <p><strong>Inner speech is one way of thinking.</strong> It is not the whole mind, and it is not a requirement for having a rich inner life.</p>
      </aside>

      <div class="voice__prose">
        <p class="voice__lead">You are reading this sentence in a voice that is not coming from the room.</p>
        <p>It may sound like you. It may sound like a quicker, flatter version of you. It may not sound like anything at all. Perhaps the words simply arrive with their meaning attached.</p>
        <p>That small difference is easy to miss because we spend most of our lives inside our own version of it. We call it thinking, planning, remembering, worrying, rehearsing. Psychologists usually call the language-like part <em>inner speech</em>: words experienced without anyone saying them out loud.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>Mine is often busy. It reads messages before I send them, edits sentences while I am still saying them, and occasionally raises an objection after I have already made a decision. Very helpful. Also a little late to meetings.</p>

        <figure class="voice__visual">
          <EdEditorialImage src="/manus-storage/inner-speech-press-secretary_f953ca87.jpg" alt="A warm editorial illustration of a small press secretary at a desk inside a larger mind, surrounded by notes, memories, and quiet shapes." />
          <figcaption>The inner voice can prepare a sentence, review a memory, or make a case. It is a press secretary, not the whole government.</figcaption>
        </figure>

        <h2>The voice is useful because words can hold a place open</h2>
        <p>Try keeping a phone number in your head for ten seconds. You may repeat it silently. Try not to forget the name of a person you have just met. You may say it to yourself once or twice. Try to explain a difficult idea before you explain it to another person. The first explanation often happens privately.</p>
        <p>Words give a thought handles. They let you line up a few pieces, move one out of the way, and return to it without starting from the beginning. This is one reason researchers connect inner speech with verbal working memory and self-regulation, while also warning that the experience varies widely between people.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>It can also be a rehearsal room. Before a difficult conversation, you run through the opening line. Then the other person says something you did not write. Your imaginary version was very confident about this part.</p>

        <figure class="voice__visual">
          <EdEditorialImage src="/manus-storage/inner-speech-rehearsal-loop_77d44028.jpg" alt="A warm editorial illustration showing a person rehearsing a conversation through looping speech bubbles, notes, and small changes to the same sentence." />
          <figcaption>Rehearsal does not predict the conversation. It gives the mind a first draft.</figcaption>
        </figure>

        <h2>It is not a tiny person living behind your eyes</h2>
        <p>The voice feels like a speaker because language has a speaker-shaped quality. It forms questions. It answers back. It can sound encouraging in the morning and prosecutorial at 1:00 a.m. But the feeling of a narrator does not prove there is a separate narrator inside you.</p>
        <p>A better image is a tool being used by a much larger system. Language, memories, sensations, visual scenes, habits, emotions, and bodily signals can all take part in a decision. The sentence you hear in your head is often the part that reached the microphone.</p>

        <figure class="voice__diagram" aria-labelledby="voice-diagram-title">
          <svg viewBox="0 0 760 300" role="img" aria-labelledby="voice-diagram-title voice-diagram-description">
            <title id="voice-diagram-title">Inner speech as one tool among several mental systems</title>
            <desc id="voice-diagram-description">A central circle labelled inner speech connects to language, working memory, self-regulation, and social learning. Other thought sources such as images, sensations, memories, and actions surround the same mind without passing through the inner-speech circle.</desc>
            <rect x="18" y="18" width="724" height="264" rx="24" fill="#fbf8f0" stroke="#1b1b1b" stroke-width="3" />
            <path d="M380 150 L160 84 M380 150 L600 84 M380 150 L160 216 M380 150 L600 216" stroke="#3157b7" stroke-width="4" stroke-linecap="round" />
            <circle cx="380" cy="150" r="63" fill="#ffd43b" stroke="#1b1b1b" stroke-width="3" />
            <text x="380" y="143" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#1b1b1b">inner</text>
            <text x="380" y="168" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#1b1b1b">speech</text>
            <g fill="#ffffff" stroke="#1b1b1b" stroke-width="3">
              <rect x="78" y="52" width="164" height="62" rx="16" />
              <rect x="518" y="52" width="164" height="62" rx="16" />
              <rect x="78" y="186" width="164" height="62" rx="16" />
              <rect x="518" y="186" width="164" height="62" rx="16" />
            </g>
            <g fill="#1b1b1b" font-family="Arial, sans-serif" font-size="17" font-weight="700" text-anchor="middle">
              <text x="160" y="89">language</text>
              <text x="600" y="89">working memory</text>
              <text x="160" y="223">self-regulation</text>
              <text x="600" y="223">social learning</text>
            </g>
            <g fill="#3157b7" font-family="Arial, sans-serif" font-size="14" font-weight="700">
              <text x="34" y="42">WORDS ARE A ROUTE</text>
              <text x="505" y="274">NOT THE WHOLE MAP</text>
            </g>
          </svg>
          <figcaption>Inner speech connects to several useful jobs, but thought can also arrive through pictures, sensations, memories, and action.</figcaption>
        </figure>

        <h2>Some people do not hear much of a voice</h2>
        <p>For a long time, people casually spoke about the inner monologue as if everyone had one. Recent research has made that assumption harder to keep. In a 2024 study, adults who reported very little inner speech performed less well on a verbal working-memory task and on rhyme judgments than adults who reported a lot of inner speech. The result points to a difference in one tool, not a measurement of intelligence or the presence of thought.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>Someone may think in pictures, physical sensations, spatial arrangements, remembered voices, abstract relationships, or a mixture that changes from moment to moment. A person can know what they mean before the words arrive. Some people never need the words to arrive in the same way.</p>
        <p>That is why “What does your inner voice sound like?” is a more interesting question than “Do you have one?” The answer may be a full sentence, a few keywords, a visual scene, a feeling of direction, or a polite request to stop asking such complicated questions before breakfast.</p>

        <figure class="voice__visual">
          <EdEditorialImage src="/manus-storage/inner-speech-quiet-mind_d07afab2.jpg" alt="A warm editorial illustration of two equally complete inner worlds, one represented with quiet words and one with visual, spatial, and sensory shapes." />
          <figcaption>A quiet inner voice is not an empty mind. It may simply be a different route through the same complexity.</figcaption>
        </figure>

        <h2>And then there are the thoughts you do not invite</h2>
        <p>The press secretary is not always working for you. Tell yourself not to think about a white bear and the bear may walk straight into the room. In Daniel Wegner’s well-known thought-suppression experiment, participants trying not to think about a white bear reported the thought more than once per minute on average.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>
        <p>Part of the problem is that avoiding a thought requires checking whether the thought has appeared. The mind keeps opening the door to see if the unwanted guest is still outside. It is a terrible security system.</p>
        <p>This does not mean every unwanted thought is meaningful, or that you have failed because one arrived. It means attention is not a clean switch. The more tightly you grip a thought and demand that it disappear, the more information you may keep sending toward it.</p>

        <blockquote>
          <p>The voice in your head is one of the ways your mind makes itself easier to handle. It is not the owner of the mind.</p>
        </blockquote>

        <h2>So what is the voice for?</h2>
        <p>Sometimes it is a rehearsal partner. Sometimes it is a memory aid. Sometimes it is a critic with excellent timing and no useful suggestions. It can help turn a vague intention into a sentence: call them, carry an umbrella, do not send that email yet.</p>
        <p>But the larger mind is doing more than narrating. It is recognising a face before naming it, feeling that a room is unsafe before explaining why, remembering the shape of a route, noticing a pattern, and making a decision that words only describe afterwards.</p>
        <p>You are not the voice. You are the whole room in which the voice is one person speaking.</p>
        <p class="voice__closing">The next time the commentary becomes loud, you do not have to argue with every sentence. You can notice it, use it when it helps, and remember that silence is not the absence of thought.</p>
      </div>
    </article>

    <section class="voice__sources" aria-labelledby="sources-title">
      <p class="voice__meta">References</p>
      <h2 id="sources-title">Sources used in this article</h2>
      <ol>
        <li v-for="reference in references" :id="`ref-${reference.id}`" :key="reference.id">
          <a :href="reference.href" target="_blank" rel="noreferrer"><span>[{{ reference.id }}]</span> {{ reference.title }} <em>{{ reference.source }}</em></a>
        </li>
      </ol>
    </section>

    <div class="voice__newsletter-wrap"><EdNewsletter /></div>
  </main>
</template>

<style scoped>
.voice { padding-bottom: 112rem; }
.voice__head { max-width: var(--shell-wide); margin: 0 auto; padding: clamp(26rem, 5vw, 64rem) var(--shell-gutter) clamp(28rem, 5vw, 56rem); }
.voice__back, .voice__meta { font: 700 12rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.voice__back { color: var(--ink); }
.voice__meta { margin: clamp(46rem, 8vw, 104rem) 0 16rem; color: var(--signal-cobalt); }
.voice h1, .voice h2 { font-family: var(--font-display); font-weight: 500; letter-spacing: -.05em; }
.voice h1 { max-width: 1080rem; margin: 0; font-size: clamp(40rem, 6.6vw, 100rem); line-height: .95; text-wrap: balance; }
.voice__dek { max-width: 700rem; margin: 30rem 0 0; font: 400 clamp(19rem, 2.25vw, 27rem)/1.4 var(--font-body); }
.voice__hero { max-width: 1400rem; margin: 0 auto; padding: 0 var(--shell-gutter); }
.voice__hero :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: 16 / 8.5; object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); overflow: hidden; background: var(--signal-field); }
.voice figure figcaption { margin-top: 10rem; color: var(--ink-soft); font: 400 13rem/1.35 var(--font-mono); }
.voice__article { max-width: 1100rem; margin: clamp(36rem, 6vw, 76rem) auto 0; padding: 0 var(--shell-gutter); display: grid; grid-template-columns: 190rem minmax(0, 690rem); justify-content: space-between; gap: clamp(28rem, 6vw, 100rem); }
.voice__margin-note { align-self: start; position: sticky; top: 106rem; padding: 16rem; background: var(--signal-field); border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); font: 400 14rem/1.45 var(--font-body); }
.voice__margin-note p { margin: 0; }
.voice__margin-note p + p { margin-top: 10rem; }
.voice__margin-note p:first-child { font: 700 11rem/1.2 var(--font-mono); letter-spacing: .07em; text-transform: uppercase; }
.voice__prose { font: 400 clamp(18rem, 1.9vw, 21rem)/1.62 var(--font-body); }
.voice__prose p { margin: 0 0 24rem; }
.voice__prose .voice__lead::first-letter { float: left; margin: 2rem 11rem 0 0; font: 500 5.1em/.72 var(--font-display); color: var(--signal-cobalt); }
.voice__prose a { color: inherit; text-decoration: underline; text-decoration-color: var(--signal-cobalt); text-decoration-thickness: 2px; text-underline-offset: 3px; }
.voice__prose h2 { margin: 64rem 0 20rem; font-size: clamp(30rem, 3.6vw, 46rem); line-height: .98; }
.voice blockquote { margin: 45rem 0; padding: 24rem 26rem; border-left: 8rem solid var(--signal-cobalt); background: var(--paper-2); border-radius: 0 var(--radius-m) var(--radius-m) 0; font: 500 clamp(22rem, 2.6vw, 32rem)/1.12 var(--font-display); letter-spacing: -.03em; }
.voice blockquote p { margin: 0; }
.voice__visual { margin: 50rem 0 45rem; }
.voice__visual :deep(.ed-editorial-image) { display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--signal-field); }
.voice__diagram { margin: 50rem 0 45rem; padding: 14rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); background: var(--paper-2); }
.voice__diagram svg { display: block; width: 100%; height: auto; }
.voice__closing { margin-top: 38rem !important; padding-top: 28rem; border-top: var(--stroke) solid var(--ink); font: 500 clamp(22rem, 2.6vw, 34rem)/1.14 var(--font-display); letter-spacing: -.035em; }
.voice__sources { max-width: 1100rem; margin: clamp(64rem, 10vw, 130rem) auto 0; padding: 34rem var(--shell-gutter) 0; border-top: var(--stroke) solid var(--ink); }
.voice__sources h2 { margin: 12rem 0 30rem; font-size: clamp(33rem, 4vw, 48rem); line-height: .95; }
.voice__sources ol { max-width: 760rem; padding: 0; list-style: none; }
.voice__sources li { padding: 16rem 0; border-top: var(--stroke) solid var(--line); font-size: 15rem; line-height: 1.45; }
.voice__sources a { color: inherit; }
.voice__sources span { color: var(--signal-cobalt); font-family: var(--font-mono); }
.voice__sources em { color: var(--ink-soft); }
.voice__newsletter-wrap { max-width: 1100rem; margin: clamp(54rem, 8vw, 100rem) auto 0; padding: 0 var(--shell-gutter); }
@media (max-width: 760px) {
  .voice__hero { padding: 0; }
  .voice__hero :deep(.ed-editorial-image) { border-left: 0; border-right: 0; border-radius: 0; aspect-ratio: 4 / 3; }
  .voice__article { display: block; }
  .voice__margin-note { position: static; margin-bottom: 36rem; }
  .voice__prose h2 { margin-top: 52rem; }
  .voice__visual { margin-left: 0; margin-right: 0; }
  .voice__diagram { padding: 8rem; margin-left: -6rem; margin-right: -6rem; }
}
</style>
