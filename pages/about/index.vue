<script setup lang="ts">
import { FEATURED_BLOG } from '~/content/blogs'
import type { PhotoTileItem } from '~/components/ed/PhotoTiles.vue'

useSeoMeta({
  title: 'About Me · Naveen Jose · Entertrainer',
  description: 'Naveen Jose: Udaipur housekeeping shifts, Coorg verification calls for The SEWA Chronicles, Marriott L&D in Mahabaleshwar, and building Entertrainer.',
  ogTitle: 'About Me · Naveen Jose',
  ogDescription: 'Stairs in Udaipur. Verification calls in Coorg. A mic in Mahabaleshwar. Then learning design.',
  ogUrl: 'https://entertrainer.in/about',
  ogImage: 'https://entertrainer.in/about/naveen-portrait.jpg'
})

const clubMahindraPhotos: PhotoTileItem[] = [
  {
    src: '/about/about-housekeeper-1.webp',
    alt: 'Naveen bent over an under-maintenance game table in Coorg, sketching on a whiteboard during the Club Mahindra years.',
    fit: 'contain',
    objectPosition: 'center center',
    span: 'wide'
  },
  {
    src: '/about/about-sewa-2.webp',
    alt: 'Printed SEWA comic draft pages spread across a round white table in Coorg.',
    fit: 'contain',
    objectPosition: 'center center',
    span: 'wide'
  }
]

const marriottPhotos: PhotoTileItem[] = [
  {
    src: '/about/naveen-speaking-stage.jpg',
    alt: 'Naveen presenting with a handheld microphone to an audience in a wood-panelled room at Courtyard by Marriott, Mahabaleshwar.',
    fit: 'cover',
    objectPosition: 'center top',
    span: 'hero'
  },
  {
    src: '/about/naveen-speaking-close.jpg',
    alt: 'Close portrait of Naveen speaking into a wireless microphone during a session at Courtyard by Marriott, Mahabaleshwar.',
    fit: 'contain',
    objectPosition: 'center top',
    span: 'tall'
  },
  {
    src: '/about/naveen-speaking-projector.jpg',
    alt: 'Naveen speaking to an audience with a projector visible in the foreground at Courtyard by Marriott, Mahabaleshwar.',
    fit: 'cover',
    objectPosition: 'center center',
    span: 'normal'
  },
  {
    src: '/about/about-cdt.webp',
    alt: 'CDT Masterclass Training the Trainers collage from Courtyard by Marriott, Mahabaleshwar.',
    fit: 'contain',
    span: 'wide'
  },
  {
    src: '/about/about-ignite.webp',
    alt: 'Ignite by Marriott International event collage at Courtyard by Marriott, Mahabaleshwar.',
    fit: 'contain',
    span: 'normal'
  },
  {
    src: '/about/about-onboarding.webp',
    alt: 'Gurukul Heroes on Board workshop collage at Courtyard by Marriott, Mahabaleshwar.',
    fit: 'contain',
    span: 'tall'
  },
  {
    src: '/about/club-mahindra-resort.jpg',
    alt: 'Pool and tiered facade of Courtyard by Marriott, Mahabaleshwar.',
    fit: 'cover',
    objectPosition: 'center 40%',
    span: 'wide'
  }
]
</script>

<template>
  <main id="main" class="about-story">
    <header class="about-story__hero">
      <div class="about-story__intro">
        <h1>I mopped floors before I designed learning.</h1>
        <p class="about-story__deck">Udaipur stairs. Coorg phone calls. A Marriott mic. Then this.</p>
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
        Udaipur, year one as a Club Mahindra management trainee in housekeeping.
        Sixteen hours in. The staircase still looked like a staircase that needed mopping.
      </p>
      <p>
        Rooms. Floors. Stairs. Fifteen to eighteen hours. All days. No weekly offs.
        Nobody asked what IHMCT&amp;AN Chennai taught me about service philosophy.
        They asked if the landing was dry. That was fair.
      </p>
      <p>
        That is the part I trust. The rest of this page is just how that habit kept changing rooms.
      </p>

      <h2>Before hotels, a village and a lot of silence.</h2>
      <p>
        Central Kerala. Farming village. Father: farmer. Quietly good at looking at the same problem from a side door until it stopped looking stuck.
      </p>
      <p>
        I inherited the side-door habit. Not the farmland. That would have required a different CV.
      </p>
      <p>
        School was rough. Severe introvert. Anxiety sat down before I did.
        Soft discrimination — the “didn’t mean it” kind. Academics dropped.
      </p>
      <p>
        Roughly thirteen years alone with computers, books, logic.
        Machines were excellent company. No mood. No judgement. Just rules.
        I liked that they never asked me to make small talk.
      </p>
      <p>
        Later I noticed minds want structure too. Messier compiler. Same hunger.
      </p>
      <p>
        I needed a degree that gets you a job. No career map. Practical question: what pays.
        Answer: hospitality. Then the floors.
      </p>

      <h2>Goa, then Coorg — where the comic actually started.</h2>
      <p>
        South Goa, Varca: supervisor.
        I still like housekeeping as art plus science — the details guests register without knowing they registered them.
      </p>
      <p>
        Coorg is where the culture work began.
      </p>
      <p>
        Prakash Aranha — corporate L&amp;D for resort ops — handpicked me.
        Brief: something Club Mahindra could call ours.
        SEWA — Service with Empathy, Warmth and Attentiveness — as illustrated employee appreciation.
      </p>
      <p>
        My glamorous creative process: portal logs, then verification calls.
        Manager on the line. Colleague on the line. “Did this actually happen?”
        If the story survived the phone, it earned ink.
      </p>

      <EdPhotoTiles
        :photos="clubMahindraPhotos"
        label="Coorg — Club Mahindra sketching and SEWA drafts"
        :eager-count="2"
      />

      <p>
        About three months in: first volume of <em>The SEWA Chronicles</em>.
        Ten stories from seventy-plus resorts. Printed. Real.
      </p>
      <p>
        Design met Aranha’s vision. That combo is why it landed: the stories were real, and the people in them could recognise themselves.
      </p>

      <figure class="about-story__figure about-story__figure--wide">
        <EdEditorialImage
          src="/about/about-sewa-1.webp"
          alt="Printed SEWA Comics booklet and comic pages from the Coorg project, laid out on a white table."
        />
      </figure>

      <aside id="sewa-chronicles" class="about-story__sewa" aria-labelledby="sewa-title">
        <NuxtLink to="/my-work/sewa-chronicles" class="about-story__destination about-story__destination--sewa" aria-labelledby="sewa-title" aria-describedby="sewa-description">
          <figure class="about-story__destination-visual">
            <EdEditorialImage src="/work/sewa/cover.webp" alt="The SEWA Chronicles comic cover, showing four resort staff around the words Service, Empathy, Warmth and Attentiveness." />
          </figure>
          <div class="about-story__destination-copy">
            <h2 id="sewa-title">The SEWA Chronicles</h2>
            <p id="sewa-description">First volume from Coorg: ten verified SEWA stories from seventy-plus Club Mahindra resorts, printed as employee appreciation.</p>
            <span class="about-story__destination-action">Open The SEWA Chronicles</span>
          </div>
        </NuxtLink>
      </aside>

      <h2>Mahabaleshwar: different room, same job underneath.</h2>
      <p>
        Left Mahindra for Assistant L&amp;D Manager at Courtyard by Marriott, Mahabaleshwar.
      </p>
      <p>
        Wood-panelled room. Handheld mic. People who already knew their jobs better than any slide deck.
        My task was not to sound smart. It was to make the next shift slightly less chaotic than the last one.
      </p>
      <p>
        Carrying real HR-shaped responsibility taught me more than any soft-skill workshop.
      </p>

      <EdPhotoTiles
        :photos="marriottPhotos"
        label="Courtyard by Marriott, Mahabaleshwar"
        :eager-count="4"
      />

      <h2>Now I design learning on purpose.</h2>
      <p>
        Concentrix by day. Entertrainer and Elevate on the side — turning operational detail into learning people can actually use.
      </p>
      <p>
        If you came for the modules, open Elevate below. If you came for the comic, open SEWA above.
      </p>
    </article>

    <footer class="about-story__close">
      <NuxtLink to="/elevate" class="about-story__destination about-story__destination--elevate" aria-labelledby="elevate-preview-title" aria-describedby="elevate-preview-description">
        <figure class="about-story__destination-visual">
          <EdEditorialImage :src="FEATURED_BLOG.hero" :alt="FEATURED_BLOG.heroAlt" />
        </figure>
        <div class="about-story__destination-copy">
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
.about-story h1 { max-width: 16ch; margin: 0; font: 500 clamp(58rem, 9.5vw, 132rem)/.82 var(--font-display); letter-spacing: -.08em; }
.about-story__deck { max-width: 34ch; margin: 22rem 0 0; font: 400 clamp(20rem, 2.3vw, 28rem)/1.3 var(--font-reading); }

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

.about-story__article :deep(.photo-tiles) {
  margin-left: calc(clamp(0rem, 6vw, 80rem) * -1);
  margin-right: calc(clamp(0rem, 6vw, 80rem) * -1);
  width: auto;
  max-width: none;
}

.about-story__sewa { margin: clamp(54rem, 9vw, 100rem) calc(clamp(0rem, 5vw, 68rem) * -1); }
.about-story__destination { display: grid; grid-template-columns: minmax(180rem, .72fr) minmax(0, 1.28fr); color: var(--ink); overflow: hidden; border: var(--stroke) solid var(--ink); border-radius: var(--radius-l); background: var(--signal-field); text-decoration: none; transition: background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-spring); }
.about-story__destination-visual { min-height: 260rem; margin: 0; overflow: hidden; border-right: var(--stroke) solid var(--ink); background: var(--paper-2); }
.about-story__destination-visual :deep(.ed-editorial-image), .about-story__destination-visual :deep(img) { width: 100%; height: 100%; object-fit: contain; }
.about-story__destination-copy { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding: clamp(24rem, 5vw, 48rem); }
.about-story__destination h2 { max-width: 18ch; margin: 0; font: 500 clamp(34rem, 4.2vw, 58rem)/.95 var(--font-display); letter-spacing: -.055em; }
.about-story__destination-copy > p { max-width: 43ch; margin: 16rem 0 0; font: 400 17rem/1.5 var(--font-reading); }
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
  .about-story__article :deep(.photo-tiles) { margin-left: 0; margin-right: 0; }
  .about-story__sewa { margin-left: 0; margin-right: 0; }
  .about-story__destination, .about-story__destination--elevate { grid-template-columns: 1fr; }
  .about-story__destination-visual { border-right: 0; border-bottom: var(--stroke) solid var(--ink); }
}

@media (prefers-reduced-motion: reduce) {
  .about-story__destination { transition: none; }
}
</style>
