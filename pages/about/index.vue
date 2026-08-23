<script setup lang="ts">
import { FEATURED_BLOG } from '~/content/blogs'

useSeoMeta({
  title: 'About Me · Naveen Jose · Entertrainer',
  description: 'Naveen Jose writes about moving from hotel operations into learning design, building tools, and making The SEWA Chronicles.',
  ogTitle: 'About Me · Naveen Jose',
  ogDescription: 'From hotel operations to learning design, tools, and The SEWA Chronicles.',
  ogUrl: 'https://entertrainer.in/about'
})
</script>

<template>
  <main id="main" class="about-story">
    <header class="about-story__hero">
      <div class="about-story__intro">
        <h1>I started on hotel floors.</h1>
        <p class="about-story__deck">Now I build learning, tools, and the occasional comic.</p>
      </div>
      <EdPaperSignal class="about-story__hero-art" variant="route" label="A yellow Paper Signal illustration for Naveen Jose's career story" />
    </header>

    <article class="about-story__article">
      <p>
        People often see the learning modules, the tools, or the website first. Fair enough. They are easier to put in a link.
        But the part that explains how I work began in hotels, where you learn very quickly that a small detail can change somebody’s entire day.
      </p>

      <h2>Hotel work taught me to notice.</h2>
      <p>
        I studied hotel management in Chennai and started on hotel floors. The job was not dramatic. It was service work: notice what is missing, respond before a small problem becomes a long conversation, and remember that a guest is usually carrying more than the thing they are complaining about.
      </p>
      <p>
        That stayed with me. A confusing instruction, a badly timed training session, or a tool that asks somebody to think harder than necessary is also a service problem. It just happens on a screen instead of at a reception desk.
      </p>

      <figure class="about-story__figure about-story__figure--wide">
        <EdPaperSignal variant="lesson" label="A yellow Paper Signal illustration for hospitality work and learning" />
        <figcaption>Chennai · hotel management</figcaption>
      </figure>

      <h2>The report became a comic.</h2>
      <p>
        At Club Mahindra, I moved into Learning and Development while working as a housekeeper. I was asked to work with real resort service stories. Somewhere in that process, the report became a sixteen-page comic called <em>The SEWA Chronicles</em>.
      </p>
      <p>
        I reported the stories, wrote the script, drew the pages, and laid out the publication. It was an early project, so naturally I tried to do several jobs at once. In hindsight, that was either commitment or poor resource planning. Both can look identical from a distance.
      </p>

      <aside id="sewa-chronicles" class="about-story__sewa" aria-labelledby="sewa-title">
        <NuxtLink to="/my-work/sewa-chronicles" class="about-story__destination about-story__destination--sewa" aria-labelledby="sewa-title" aria-describedby="sewa-description">
          <figure class="about-story__destination-visual">
            <EdEditorialImage src="/work/sewa/cover.webp" alt="The SEWA Chronicles comic cover, showing four resort staff around the words Service, Empathy, Warmth and Attentiveness." />
          </figure>
          <div class="about-story__destination-copy">
            <p class="about-story__destination-label">Comic preview</p>
            <h2 id="sewa-title">The SEWA Chronicles</h2>
            <p id="sewa-description">A sixteen-page comic based on real resort service stories at Club Mahindra.</p>
            <span class="about-story__destination-action">Open The SEWA Chronicles</span>
          </div>
        </NuxtLink>
      </aside>

      <h2>Training has to survive real life.</h2>
      <p>
        Later, at Courtyard by Marriott, I worked on certification programmes for teams from frontline associates to managers. That made the rule even clearer: a training programme is not successful because it has been launched. It has to be finished, understood, and used after the session ends.
      </p>
      <p>
        It sounds obvious when written down. A lot of things do. Then somebody puts a twenty-seven-step process into a slide deck and suddenly the obvious has escaped the building.
      </p>

      <figure class="about-story__figure">
        <EdPaperSignal variant="evidence" label="A yellow Paper Signal illustration for practical training work" />
        <figcaption>Courtyard by Marriott · learning and development</figcaption>
      </figure>

      <h2>I started building the missing tools.</h2>
      <p>
        I build learning in Articulate Storyline and I build the small tools around the work as well. StoryGen, EasyMCQ, Cadence, and this site exist because repetitive work has a way of introducing itself every Monday as if we have never met before.
      </p>
      <p>
        I do not build tools because every task needs an app. I build them when the same useful step keeps getting buried under copying, checking, formatting, or remembering where the previous version went.
      </p>

      <h2>Where I am now.</h2>
      <p>
        I work with the Training-as-a-Service team at Concentrix, turning operational detail into e-learning for teams. I use motion, WebGL, and AI when they make an explanation clearer or a task easier to complete. If they do not, they are just furniture with electricity.
      </p>
      <p>
        That is also what Entertrainer is for: a place to put the stories, tools, courses, and experiments that come out of this work. Some will be useful immediately. Some will need time. Both are allowed.
      </p>
    </article>

    <footer class="about-story__close">
      <EdNote label="A line I keep" accent="var(--signal-cobalt)">
        <p>Asatoma Sadgamaya — from ignorance, toward truth.</p>
      </EdNote>
      <NuxtLink to="/elevate" class="about-story__destination about-story__destination--elevate" aria-labelledby="elevate-preview-title" aria-describedby="elevate-preview-description">
        <figure class="about-story__destination-visual">
          <EdEditorialImage :src="FEATURED_BLOG.hero" :alt="FEATURED_BLOG.heroAlt" />
        </figure>
        <div class="about-story__destination-copy">
          <p class="about-story__destination-label">Elevate</p>
          <h2 id="elevate-preview-title">{{ FEATURED_BLOG.title }}</h2>
          <p id="elevate-preview-description">{{ FEATURED_BLOG.dek }}</p>
          <span class="about-story__destination-action">Open Elevate</span>
        </div>
      </NuxtLink>
    </footer>
  </main>
</template>

<style scoped>
/* About Me: first-person editorial story with a narrow reading rhythm, quiet diagrams, and no portfolio-card choreography. */
.about-story { max-width: var(--shell-page); margin: 0 auto; padding: clamp(44rem, 8vw, 112rem) var(--shell-gutter) clamp(70rem, 10vw, 130rem); }
.about-story__hero { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(260rem, .85fr); gap: clamp(32rem, 8vw, 120rem); align-items: end; padding-bottom: clamp(46rem, 8vw, 86rem); border-bottom: var(--stroke) solid var(--ink); }
.about-story h1 { max-width: 8ch; margin: 0; font: 500 clamp(66rem, 11vw, 152rem)/.79 var(--font-display); letter-spacing: -.08em; }
.about-story__deck { max-width: 26ch; margin: 22rem 0 0; font: 400 clamp(20rem, 2.3vw, 28rem)/1.3 var(--font-reading); }
.about-story__hero-art { min-height: 250rem; border: 0; }
.about-story__article { max-width: 720rem; margin: clamp(54rem, 9vw, 118rem) auto 0; font: 400 clamp(18rem, 1.85vw, 22rem)/1.62 var(--font-reading); }
.about-story__article > p { max-width: 62ch; margin: 0 0 24rem; }
.about-story__article h2 { max-width: 18ch; margin: clamp(54rem, 9vw, 96rem) 0 20rem; font: 500 clamp(36rem, 5.5vw, 68rem)/.94 var(--font-display); letter-spacing: -.055em; }
.about-story__figure { width: min(100%, 560rem); margin: clamp(42rem, 7vw, 80rem) 0 clamp(50rem, 8vw, 92rem) auto; }
.about-story__figure--wide { width: min(100%, 640rem); margin-left: calc(clamp(0rem, 8vw, 110rem) * -1); }
.about-story__figure :deep(.ps-art) { min-height: 230rem; border-radius: var(--radius-m); }
.about-story__figure figcaption { margin-top: 10rem; color: var(--ink-soft); font: 700 11rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.about-story__sewa { margin: clamp(54rem, 9vw, 100rem) calc(clamp(0rem, 5vw, 68rem) * -1); }
.about-story__destination { display: grid; grid-template-columns: minmax(180rem, .72fr) minmax(0, 1.28fr); color: var(--ink); overflow: hidden; border: var(--stroke) solid var(--ink); border-radius: var(--radius-l); background: var(--signal-field); text-decoration: none; transition: background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-spring); }
.about-story__destination-visual { min-height: 260rem; margin: 0; overflow: hidden; border-right: var(--stroke) solid var(--ink); background: var(--paper-2); }
.about-story__destination-visual :deep(.ed-editorial-image), .about-story__destination-visual :deep(img) { width: 100%; height: 100%; object-fit: cover; }
.about-story__destination--sewa .about-story__destination-visual :deep(img) { object-position: center; }
.about-story__destination-copy { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding: clamp(24rem, 5vw, 48rem); }
.about-story__destination-label { margin: 0 0 16rem; color: var(--ink-soft); font: 700 11rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.about-story__destination h2 { max-width: 16ch; margin: 0; font: 500 clamp(34rem, 4.2vw, 58rem)/.95 var(--font-display); letter-spacing: -.055em; }
.about-story__destination-copy > p:not(.about-story__destination-label) { max-width: 43ch; margin: 16rem 0 0; font: 400 17rem/1.5 var(--font-reading); }
.about-story__destination-action { display: inline-flex; margin-top: 24rem; padding: 10rem 14rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-s); font: 800 14rem/1.1 var(--font-body); transition: background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-spring); }
.about-story__destination:hover, .about-story__destination:focus-visible { background: var(--paper); transform: translateY(-3rem); }
.about-story__destination:hover .about-story__destination-action, .about-story__destination:focus-visible .about-story__destination-action { background: var(--signal-cobalt); transform: translateY(-2rem); }
.about-story__destination:focus-visible { outline: 3rem solid var(--signal-cobalt); outline-offset: 5rem; }
.about-story__close { display: grid; gap: 28rem; max-width: 720rem; margin: clamp(64rem, 10vw, 118rem) auto 0; padding-top: 30rem; border-top: var(--stroke) solid var(--ink); }
.about-story__destination--elevate { grid-template-columns: minmax(220rem, .86fr) minmax(0, 1.14fr); background: var(--paper); }
.about-story__destination--elevate .about-story__destination-visual { min-height: 230rem; }
@media (max-width: 700px) { .about-story__hero { grid-template-columns: 1fr; }.about-story__hero-art { min-height: 200rem; }.about-story__article { margin-top: 52rem; }.about-story__figure, .about-story__figure--wide { width: 100%; margin-left: 0; }.about-story__sewa { margin-left: 0; margin-right: 0; }.about-story__destination, .about-story__destination--elevate { grid-template-columns: 1fr; }.about-story__destination-visual, .about-story__destination--elevate .about-story__destination-visual { min-height: 230rem; border-right: 0; border-bottom: var(--stroke) solid var(--ink); }.about-story__destination-copy { padding: 28rem; } }
@media (prefers-reduced-motion: reduce) { .about-story__destination, .about-story__destination-action { transition: none; } }
</style>
