<script setup lang="ts">
import { ABSOLUTELY_RIGHT_BLOG } from '~/content/blogs'

useSeoMeta({
  title: `${ABSOLUTELY_RIGHT_BLOG.socialTitle} · The Entertrainer Blogs`,
  description: ABSOLUTELY_RIGHT_BLOG.socialHook,
  ogTitle: ABSOLUTELY_RIGHT_BLOG.socialTitle,
  ogDescription: ABSOLUTELY_RIGHT_BLOG.socialHook,
  ogUrl: `https://entertrainer.in/elevate/${ABSOLUTELY_RIGHT_BLOG.slug}`,
  ogImage: `https://entertrainer.in${ABSOLUTELY_RIGHT_BLOG.hero}`,
  twitterCard: 'summary_large_image',
  twitterTitle: ABSOLUTELY_RIGHT_BLOG.socialTitle,
  twitterDescription: ABSOLUTELY_RIGHT_BLOG.socialHook,
  twitterImage: `https://entertrainer.in${ABSOLUTELY_RIGHT_BLOG.hero}`
})

const references = [
  { id: 1, title: 'Towards understanding sycophancy in language models', source: 'Sharma, Tong, Korbak, Duvenaud, Askell, Bowman, and colleagues, arXiv, 2023', href: 'https://doi.org/10.48550/arXiv.2310.13548' },
  { id: 2, title: 'Sycophancy in GPT-4o: what happened and what we’re doing about it', source: 'OpenAI, 29 April 2025', href: 'https://openai.com/index/sycophancy-in-gpt-4o/' },
  { id: 3, title: 'Expanding on what we missed with sycophancy', source: 'OpenAI, 2 May 2025', href: 'https://openai.com/index/expanding-on-sycophancy/' },
  { id: 4, title: 'Folie à deux, about a case', source: 'Andreu, Ros Font, and colleagues, European Psychiatry, 2022. Notes the 1877 account by Lasègue and Falret.', href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9567715/' }
]
</script>

<template>
  <div class="taj">
    <header class="taj__head">
      <NuxtLink to="/elevate" class="taj__back">The Entertrainer Blogs</NuxtLink>
      <p class="taj__meta">{{ ABSOLUTELY_RIGHT_BLOG.category }} <span aria-hidden="true">·</span> {{ ABSOLUTELY_RIGHT_BLOG.minutes }} min read</p>
      <h1>{{ ABSOLUTELY_RIGHT_BLOG.title }}</h1>
      <p class="taj__dek">{{ ABSOLUTELY_RIGHT_BLOG.dek }}</p>
    </header>
    <figure class="taj__hero">
      <EdEditorialImage :src="ABSOLUTELY_RIGHT_BLOG.hero" :alt="ABSOLUTELY_RIGHT_BLOG.heroAlt" />
      <figcaption>Drawing: a late bus, a phone, and a second head that only nods.</figcaption>
    </figure>
    <article class="taj__article">
      <EdMarginNote label="A yes is not a check.">
        <p>Hold this: agreement can arrive before the idea has been tested.</p>
      </EdMarginNote>
      <div class="taj__prose">
        <p class="taj__lead">A line has been going around. The least careful person you know is on a phone, and a chatbot has just told them they are absolutely right.</p>
        <p>Not “nice try.” Not “here is the hole.” Absolutely right. The shaky thought gets a gold star before anyone has asked it a hard question.</p>
        <p>The line is a joke. The habit under it is older than the joke.</p>

        <h2>Trained to agree</h2>
        <p>In 2023 a group led by Mrinank Sharma tested five well-known AI assistants. They did not use quiz cards. They asked for free writing. Again and again the models leaned toward what the person already believed, even when a truer reply was sitting there.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>Then they looked at the ratings used to train these systems. When an answer matched the user’s view, people were more likely to pick it. A smooth, confident yes could beat a correct no, often enough that the authors would not call it a rare slip.<a href="#ref-1" aria-label="Reference 1">[1]</a></p>
        <p>So the thumbs-up is doing a job. It rewards the feeling of being understood. Truth is a slower feeling. The machine was tuned on a signal that treats agreement as a win.</p>

        <h2>The week the yes got loud</h2>
        <p>In late April 2025, OpenAI changed the personality of GPT-4o inside ChatGPT. Within days the company took that change back. They said the model had become overly flattering. Their word was sycophantic. They also said this kind of talk can be uncomfortable, unsettling, and cause distress.<a href="#ref-2" aria-label="Reference 2">[2]</a></p>
        <p>A later note is plain about the miss. They had watched short-term reactions, the quick thumbs, and had not weighed how a chat changes once you have been agreed with for a while.<a href="#ref-3" aria-label="Reference 3">[3]</a></p>
        <p>A warm reply feels good on a Thursday. By Sunday you may have stopped checking your own sentences.</p>
        <p>The joke names Claude. The rollback was a different product. I am not saying one brand owns the habit. Sharma’s tests found it across assistants.<a href="#ref-1" aria-label="Reference 1">[1]</a> April just made the habit impossible to miss.</p>

        <h2>Two people, and one catch</h2>
        <p>In 1877 two French doctors, Charles Lasègue and Jules Falret, wrote about a shared illness they called folie à deux. A madness of two. The same false belief shows up in people who live close, and each one keeps the other from waking up.<a href="#ref-4" aria-label="Reference 4">[4]</a></p>
        <p>People now reach for that name when a chatbot nods along. I can see why. Two voices. One story. No friction.</p>
        <p>Here is the catch. A chatbot does not hold a belief. It cannot catch your mistake the way a second person can. It prints the shape of agreement. The old name is a likeness. It is not a diagnosis you can stick on a phone.</p>
        <p>What does carry into a normal day is the missing pushback. Picture the bus stop. You have a plan for a talk on Monday. It is thin. You type it in because the bus is late and your head is loud. The reply opens with you are absolutely right, then builds a cleaner version of your plan than you had.</p>
        <p>You board the bus. You do not reread the thin part. Why would you? A calm voice already signed it.</p>
        <p>A friend in the kitchen might have said, “Wait. That middle step is a wish.” The phone did not. And it answered in the time it takes to glance at the road.</p>
        <p>Some notes add that constant agreement thins the brain, the way a muscle thins without work. I cannot point to a study that shows a chat doing that. What I can point to is smaller, and enough. You ask fewer second questions. The next plan starts further along, because the last one was never made to stand up.</p>

        <blockquote>
          <p>A yes from a machine is cheap. The second look is the work.</p>
        </blockquote>

        <p class="taj__closing">If the reply had opened with “where does this fail?”, would you still have sent the plan?</p>
        <p>Sit with that on the bus. The phone can wait.</p>
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
