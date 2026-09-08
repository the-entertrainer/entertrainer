<script setup lang="ts">
import { FEATURED_BLOG } from '~/content/blogs'
import type { PhotoStackItem } from '~/components/ed/PhotoStack.vue'

useSeoMeta({
  title: 'About Me · Naveen Jose · Entertrainer',
  description: 'Naveen Jose on a Kerala farming village, machines, Club Mahindra floors, The SEWA Chronicles, Courtyard by Marriott Mahabaleshwar, and building Entertrainer.',
  ogTitle: 'About Me · Naveen Jose',
  ogDescription: 'From a Kerala cocoon to machines, hotel floors, comics, Marriott rooms, and learning design.',
  ogUrl: 'https://entertrainer.in/about',
  ogImage: 'https://entertrainer.in/about/naveen-portrait.jpg'
})

const clubMahindraPhotos: PhotoStackItem[] = [
  {
    src: '/about/about-housekeeper-1.webp',
    alt: 'Naveen bent over an under-maintenance game table, sketching on a whiteboard during the Club Mahindra years.',
    fit: 'contain',
    objectPosition: 'center center'
  },
  {
    src: '/about/about-sewa-2.webp',
    alt: 'Printed SEWA comic draft pages spread across a round white table.',
    fit: 'contain',
    objectPosition: 'center center'
  }
]

const marriottPhotos: PhotoStackItem[] = [
  {
    src: '/about/naveen-speaking-stage.jpg',
    alt: 'Naveen presenting with a handheld microphone to an audience in a wood-panelled room at Courtyard by Marriott, Mahabaleshwar.',
    fit: 'contain',
    objectPosition: 'center top'
  },
  {
    src: '/about/naveen-speaking-close.jpg',
    alt: 'Close portrait of Naveen speaking into a wireless microphone during a session at Courtyard by Marriott, Mahabaleshwar.',
    fit: 'contain',
    objectPosition: 'center top'
  },
  {
    src: '/about/naveen-speaking-projector.jpg',
    alt: 'Naveen speaking to an audience with a projector visible in the foreground at Courtyard by Marriott, Mahabaleshwar.',
    fit: 'contain',
    objectPosition: 'center center'
  },
  {
    src: '/about/about-cdt.webp',
    alt: 'CDT Masterclass Training the Trainers collage from Courtyard by Marriott, Mahabaleshwar.',
    fit: 'contain'
  },
  {
    src: '/about/about-ignite.webp',
    alt: 'Ignite by Marriott International event collage at Courtyard by Marriott, Mahabaleshwar.',
    fit: 'contain'
  },
  {
    src: '/about/about-onboarding.webp',
    alt: 'Gurukul Heroes on Board workshop collage at Courtyard by Marriott, Mahabaleshwar.',
    fit: 'contain'
  },
  {
    src: '/about/club-mahindra-resort.jpg',
    alt: 'Pool and tiered facade of Courtyard by Marriott, Mahabaleshwar.',
    fit: 'cover',
    objectPosition: 'center 40%'
  }
]
</script>

<template>
  <main id="main" class="about-story">
    <header class="about-story__hero">
      <div class="about-story__intro">
        <h1>Zero dreams. A thousand fears.</h1>
        <p class="about-story__deck">Then machines. Then hotel floors. Then comics. Then this.</p>
      </div>
      <figure class="about-story__hero-art">
        <EdEditorialImage
          src="/about/naveen-portrait.jpg"
          alt="Illustrated portrait of Naveen Jose in ink on cream paper, adjusting sunglasses."
        />
      </figure>
    </header>

    <article class="about-story__article">
      <p>
        Most people meet the site first.
        The modules. The tools. That little yellow Entertrainer mark.
      </p>
      <p>
        Fair enough. Those are easier to drop in a link.
      </p>
      <p>
        The part that actually explains how I work started much earlier.
        And with a lot less confidence.
      </p>

      <h2>I was a severe introvert with nothing to prove.</h2>
      <p>
        Childhood: zero dreams, a thousand fears.
      </p>
      <p>
        Talking to people felt like walking into weather I had not packed for.
        Anxiety sat in the room before I did.
      </p>
      <p>
        Farmer family. A village in central Kerala.
        My father is a farmer — sharp, intelligent, and quietly dangerous in the best way.
        His habit was unlocking extra doors. Same problem, different thought process.
      </p>
      <p>
        That one habit shaped more of my later life than any career brochure ever did.
      </p>

      <h2>School felt like weaving a cocoon.</h2>
      <p>
        There was a lot of indirect discrimination.
        The kind that comes with “didn’t mean it.”
      </p>
      <p>
        Academics dropped.
        The first thirteen years or so felt like a caterpillar weaving a cocoon — not for drama, for survival.
      </p>
      <p>
        I found peace in being alone.
        The calm you can’t really share, because it comes from solitude.
      </p>
      <p>
        Alone in the universe, I thought.
        That was the first reading of the cocoon.
      </p>
      <p>Then my father flipped the metaphor.</p>
      <p>
        The cocoon is not exile. It is cover.
        Space to try and fail without an audience taking notes.
      </p>
      <p>
        Once I heard it that way, everything changed.
        Quietly. Permanently.
      </p>

      <h2>Machines made excellent company.</h2>
      <p>
        Computers were still a novelty then.
      </p>
      <p>
        And machines, bless them, have no mind.
        They obey written rules.
        They do not form emotional judgements about whether you are interesting enough today.
      </p>
      <p>Best companion to work on yourself.</p>
      <p>
        I explored machines, the internet, books.
        Closed up — learning, reading, exploring, teaching myself.
      </p>
      <p>
        The hardest distractions, I later realised, are humans.
        Glad I did not have much of that then.
      </p>
      <p>
        I got addicted to logic. Rules. The base of programming.
      </p>
      <p>
        Every machine is logic and instructions.
        Later I learned minds work similarly — messier compiler, same hunger for structure.
      </p>

      <h2>After school, I needed a degree that earns a job.</h2>
      <p>
        Zero idea of career. No real guidance.
      </p>
      <p>
        Practical question only: what degree gets you employed.
      </p>
      <p>Answer: hospitality.</p>
      <p>
        IHMCT&amp;AN, Chennai. Prestigious.
        Often called the number one hotel management institute.
      </p>
      <p>
        In the final year I was selected as a Club Mahindra (MHRIL) Management Trainee — housekeeping.
      </p>
      <p>
        First deployment: Udaipur, Rajasthan.
        Cleaned rooms. Mopped floors and stairs.
        Fifteen to eighteen hours a day. All days. No weekly offs.
      </p>
      <p>
        Hotels are unforgiving at first.
        Then they give you a discipline you do not get from corporates.
      </p>
      <p>
        Somewhere in that stretch I heard myself think: I can do this all day.
      </p>

      <h2>Club Mahindra era — sketching on borrowed tables.</h2>
      <p>
        South Goa, Varca: supervisor.
      </p>
      <p>
        I still love housekeeping as art plus science.
        There is beauty in details — the kind guests notice without knowing they noticed.
      </p>

      <EdPhotoStack
        :photos="clubMahindraPhotos"
        label="Club Mahindra era photos"
        note="Club Mahindra — sketching on borrowed tables; SEWA drafts on the round table."
        aspect="5 / 4"
      />

      <h2>Then someone asked for a culture we could call ours.</h2>
      <p>
        Coorg.
        I was handpicked by Mr. Prakash Aranha — corporate L&amp;D for resort operations.
      </p>
      <p>
        His dream: something cultural Club Mahindra could call “ours.”
      </p>
      <p>
        SEWA — Service with Empathy, Warmth and Attentiveness — told as illustrated employee appreciation.
      </p>
      <p>I responded.</p>
      <p>
        After about three months, the first volume of <em>The SEWA Chronicles</em>:
        ten selected stories from seventy-plus resorts across India.
      </p>
      <p>Printed. Real.</p>
      <p>
        Why it hit was not just the visuals.
      </p>
      <p>
        The stories were sourced from company portal logs from the start.
        I picked the impactful ones where the employee was still in the company,
        contacted them without revealing the purpose,
        spoke to managers and colleagues to verify — then printed.
      </p>
      <p>
        Design met Aranha’s vision.
        That combination is what made the thing land.
      </p>

      <figure class="about-story__figure about-story__figure--wide">
        <EdEditorialImage
          src="/about/about-sewa-1.webp"
          alt="Printed SEWA Comics booklet and comic pages laid out on a white table."
        />
      </figure>

      <aside id="sewa-chronicles" class="about-story__sewa" aria-labelledby="sewa-title">
        <NuxtLink to="/my-work/sewa-chronicles" class="about-story__destination about-story__destination--sewa" aria-labelledby="sewa-title" aria-describedby="sewa-description">
          <figure class="about-story__destination-visual">
            <EdEditorialImage src="/work/sewa/cover.webp" alt="The SEWA Chronicles comic cover, showing four resort staff around the words Service, Empathy, Warmth and Attentiveness." />
          </figure>
          <div class="about-story__destination-copy">
            <p class="about-story__destination-label">Comic preview</p>
            <h2 id="sewa-title">The SEWA Chronicles</h2>
            <p id="sewa-description">First volume: ten verified SEWA stories from seventy-plus Club Mahindra resorts, printed as employee appreciation.</p>
            <span class="about-story__destination-action">Open The SEWA Chronicles</span>
          </div>
        </NuxtLink>
      </aside>

      <h2>Courtyard by Marriott, Mahabaleshwar.</h2>
      <p>
        I continued with Mahindra until I became Assistant L&amp;D Manager at Courtyard by Marriott, Mahabaleshwar.
      </p>
      <p>
        Genius minds around the table.
        Running HR department responsibility shaped me more than any soft-skill workshop.
      </p>

      <EdPhotoStack
        :photos="marriottPhotos"
        label="Courtyard by Marriott, Mahabaleshwar"
        note="Courtyard by Marriott, Mahabaleshwar — mic sessions, training rooms, the building itself."
        aspect="16 / 11"
      />

      <p>
        Then I chased Instructional Design properly.
      </p>
      <p>
        Now I create work that matters — turning operational detail into learning people can actually use.
      </p>
      <p>
        This blog. This site. Entertrainer.
      </p>
      <p>
        The place where the cocoon, the machines, the hotels, the comics, and the learning design finally share one address.
      </p>
      <p>
        Some pieces will be useful immediately.
        Some will need time.
      </p>
      <p>
        Both are allowed.
      </p>
      <p>
        I am still weaving.
        Just with better light.
      </p>
    </article>

    <footer class="about-story__close">
      <EdNote label="A line I keep" accent="var(--accent)">
        <p>The cocoon was never the end of the story. It was the room where I learned to begin.</p>
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
.about-story { max-width: var(--shell-page); margin: 0 auto; padding: clamp(44rem, 8vw, 112rem) var(--shell-gutter) clamp(70rem, 10vw, 130rem); }
.about-story__hero { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(260rem, .85fr); gap: clamp(32rem, 8vw, 120rem); align-items: end; padding-bottom: clamp(46rem, 8vw, 86rem); border-bottom: var(--stroke) solid var(--ink); }
.about-story h1 { max-width: 14ch; margin: 0; font: 500 clamp(66rem, 11vw, 152rem)/.79 var(--font-display); letter-spacing: -.08em; }
.about-story__deck { max-width: 32ch; margin: 22rem 0 0; font: 400 clamp(20rem, 2.3vw, 28rem)/1.3 var(--font-reading); }

/* Plain photo — rounded corners only, no heavy frame */
.about-story__hero-art {
  margin: 0;
  min-height: 280rem;
  overflow: hidden;
  border: 0;
  border-radius: var(--radius-l);
  background: #F7F1E4;
}
.about-story__hero-art :deep(.ed-editorial-image),
.about-story__hero-art :deep(img) {
  width: 100%;
  height: 100%;
  min-height: 280rem;
  object-fit: contain;
  object-position: center top;
  display: block;
  border: 0;
  border-radius: var(--radius-l);
  background: #F7F1E4;
}

.about-story__article { max-width: 720rem; margin: clamp(54rem, 9vw, 118rem) auto 0; font: 400 clamp(18rem, 1.85vw, 22rem)/1.62 var(--font-reading); }
.about-story__article > p { max-width: 42ch; margin: 0 0 18rem; }
.about-story__article h2 { max-width: 28ch; margin: clamp(54rem, 9vw, 96rem) 0 20rem; font: 500 clamp(36rem, 5.5vw, 68rem)/.94 var(--font-display); letter-spacing: -.055em; }

.about-story__figure {
  width: min(100%, 560rem);
  margin: clamp(42rem, 7vw, 80rem) 0 clamp(50rem, 8vw, 92rem) auto;
}
.about-story__figure--wide {
  width: min(100%, 640rem);
  margin-left: calc(clamp(0rem, 8vw, 110rem) * -1);
}
.about-story__figure :deep(.ed-editorial-image),
.about-story__figure :deep(img) {
  display: block;
  width: 100%;
  height: auto;
  max-height: 520rem;
  object-fit: contain;
  object-position: center center;
  border: 0;
  border-radius: var(--radius-m);
  background: var(--paper-2);
}

.about-story__article :deep(.photo-stack) {
  margin-left: calc(clamp(0rem, 6vw, 80rem) * -1);
  margin-right: calc(clamp(0rem, 6vw, 80rem) * -1);
  width: auto;
  max-width: none;
}

.about-story__sewa { margin: clamp(54rem, 9vw, 100rem) calc(clamp(0rem, 5vw, 68rem) * -1); }
.about-story__destination { display: grid; grid-template-columns: minmax(180rem, .72fr) minmax(0, 1.28fr); color: var(--ink); overflow: hidden; border: var(--stroke) solid var(--ink); border-radius: var(--radius-l); background: var(--signal-field); text-decoration: none; transition: background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-spring); }
.about-story__destination-visual { min-height: 260rem; margin: 0; overflow: hidden; border-right: var(--stroke) solid var(--ink); background: var(--paper-2); }
.about-story__destination-visual :deep(.ed-editorial-image), .about-story__destination-visual :deep(img) { width: 100%; height: 100%; object-fit: cover; }
.about-story__destination-copy { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding: clamp(24rem, 5vw, 48rem); }
.about-story__destination-label { margin: 0 0 16rem; color: var(--ink-soft); font: 700 11rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.about-story__destination h2 { max-width: 18ch; margin: 0; font: 500 clamp(34rem, 4.2vw, 58rem)/.95 var(--font-display); letter-spacing: -.055em; }
.about-story__destination-copy > p:not(.about-story__destination-label) { max-width: 43ch; margin: 16rem 0 0; font: 400 17rem/1.5 var(--font-reading); }
.about-story__destination-action { display: inline-flex; margin-top: 24rem; padding: 10rem 14rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-s); font: 800 14rem/1.1 var(--font-body); background: var(--accent); color: var(--accent-ink); }
.about-story__destination:hover, .about-story__destination:focus-visible { background: var(--paper); transform: translateY(-3rem); }
.about-story__destination:focus-visible { outline: 3rem solid var(--ink); outline-offset: 5rem; }
.about-story__close { display: grid; gap: 28rem; max-width: 720rem; margin: clamp(64rem, 10vw, 118rem) auto 0; padding-top: 30rem; border-top: var(--stroke) solid var(--ink); }
.about-story__destination--elevate { grid-template-columns: minmax(220rem, .86fr) minmax(0, 1.14fr); background: var(--paper); }
.about-story__destination--elevate .about-story__destination-visual { min-height: 230rem; }

@media (max-width: 700px) {
  .about-story__hero { grid-template-columns: 1fr; }
  .about-story__hero-art { min-height: 220rem; }
  .about-story__figure, .about-story__figure--wide { width: 100%; margin-left: 0; }
  .about-story__article :deep(.photo-stack) { margin-left: 0; margin-right: 0; }
  .about-story__sewa { margin-left: 0; margin-right: 0; }
  .about-story__destination, .about-story__destination--elevate { grid-template-columns: 1fr; }
  .about-story__destination-visual { border-right: 0; border-bottom: var(--stroke) solid var(--ink); }
}

@media (prefers-reduced-motion: reduce) {
  .about-story__destination { transition: none; }
}
</style>
