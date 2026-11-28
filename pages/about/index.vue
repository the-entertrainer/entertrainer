<script setup lang="ts">
import { FEATURED_BLOG } from '~/content/blogs'
import type { PhotoTileItem } from '~/components/ed/PhotoTiles.vue'

useSeoMeta({
  title: 'About Me · Naveen Jose · Entertrainer',
  description: 'Naveen Jose — central Kerala, Club Mahindra housekeeping, The SEWA Chronicles, Marriott L&D, Concentrix, Entertrainer.',
  ogTitle: 'About Me · Naveen Jose',
  ogDescription: 'Housekeeping floors, SEWA stories checked by phone, then instructional design.',
  ogUrl: 'https://entertrainer.in/about',
  ogImage: 'https://entertrainer.in/about/naveen-portrait.jpg'
})

const clubMahindraPhotos: PhotoTileItem[] = [
  {
    src: '/about/about-housekeeper-1.webp',
    alt: 'Naveen bent over an under-maintenance game table in Coorg, sketching on a whiteboard during the Club Mahindra years.',
    objectPosition: 'center 30%'
  },
  {
    src: '/about/about-sewa-2.webp',
    alt: 'Printed SEWA comic draft pages spread across a round white table in Coorg.',
    objectPosition: 'center 40%'
  }
]

const marriottPhotos: PhotoTileItem[] = [
  {
    src: '/about/naveen-speaking-stage.jpg',
    alt: 'Naveen presenting with a handheld microphone to an audience in a wood-panelled room at Courtyard by Marriott, Mahabaleshwar.',
    objectPosition: 'center 22%'
  },
  {
    src: '/about/naveen-speaking-close.jpg',
    alt: 'Close portrait of Naveen speaking into a wireless microphone during a session at Courtyard by Marriott, Mahabaleshwar.',
    objectPosition: 'center 18%'
  },
  {
    src: '/about/naveen-speaking-projector.jpg',
    alt: 'Naveen speaking to an audience with a projector visible in the foreground at Courtyard by Marriott, Mahabaleshwar.',
    objectPosition: 'center 24%'
  },
  {
    src: '/about/about-cdt.webp',
    alt: 'CDT Masterclass Training the Trainers collage from Courtyard by Marriott, Mahabaleshwar.',
    objectPosition: 'center 35%'
  },
  {
    src: '/about/about-ignite.webp',
    alt: 'Ignite by Marriott International event collage at Courtyard by Marriott, Mahabaleshwar.',
    objectPosition: 'center 40%'
  },
  {
    src: '/about/about-onboarding.webp',
    alt: 'Gurukul Heroes on Board workshop collage at Courtyard by Marriott, Mahabaleshwar.',
    objectPosition: 'center 38%'
  },
  {
    src: '/about/club-mahindra-resort.jpg',
    alt: 'Pool and tiered facade of Courtyard by Marriott, Mahabaleshwar.',
    objectPosition: 'center 45%'
  }
]

/* The journey, as stations along an ink line. Facts only, from the story below. */
const STATIONS = ['Kerala village', 'Club Mahindra', 'The SEWA Chronicles', 'Marriott', 'Concentrix', 'Entertrainer']

const root = ref<HTMLElement | null>(null)
const { run } = useMotion(root)
onMounted(() => {
  void run((m) => {
    const tl = m.gsap.timeline()
    tl.add(m.inkReveal(root.value!.querySelectorAll('.about-story__kicker, .about-story h1'), { y: 21 * m.d }), 0)
    tl.add(m.develop(root.value!.querySelector('.about-story__hero-art')!), 0.1)
    tl.add(m.drawRule(root.value!.querySelectorAll('.about-route__line')), 0.3)
    tl.add(m.stampIn(root.value!.querySelectorAll('.about-route__stop i')), 0.5)
    const line = root.value!.querySelector('.about-story__thread')
    if (line && window.matchMedia('(min-width: 1000px)').matches) {
      m.gsap.fromTo(line, { scaleY: 0 }, {
        scaleY: 1, ease: 'none', transformOrigin: '50% 0%',
        scrollTrigger: { trigger: root.value!.querySelector('.about-story__article'), start: 'top 70%', end: 'bottom 70%', scrub: 0.6 }
      })
    }
    m.ScrollTrigger.batch(root.value!.querySelectorAll('.about-story__article figure, .about-story__article :is(.photo-tiles) > *'), {
      start: 'top 85%', once: true,
      onEnter: els => { m.develop(els, { stagger: 0.1 * m.k }) }
    })
    m.ScrollTrigger.batch(root.value!.querySelectorAll('.about-story__break'), {
      start: 'top 80%', once: true,
      onEnter: els => { els.forEach(e => e.classList.add('is-reached')) }
    })
  })
})
</script>

<template>
  <div ref="root" class="about-story">
    <header class="about-story__hero">
      <div class="about-story__intro">
        <p class="about-story__kicker dp-kicker">About me · Naveen Jose</p>
        <h1>I am Naveen. I’m an instructional designer.</h1>
      </div>
      <figure class="about-story__hero-art">
        <EdEditorialImage
          src="/about/naveen-portrait.jpg"
          alt="Illustrated portrait of Naveen Jose in ink on cream paper, adjusting sunglasses."
        />
      </figure>
    </header>

    <ol class="about-route" aria-label="The route so far">
      <span class="about-route__line dp-rule" aria-hidden="true" />
      <li v-for="(st, i) in STATIONS" :key="st" class="about-route__stop"><i aria-hidden="true" />{{ st }}<span v-if="i < STATIONS.length - 1" class="dp-sr">, then</span></li>
    </ol>

    <article class="about-story__article">
      <span class="about-story__thread" aria-hidden="true" />
      <p>
        I grew up in a farming family in a village in central Kerala.
        As a kid I didn’t have a clear dream of what I’d become.
        I was introverted, and talking to people — especially confrontation — made me anxious.
      </p>
      <p>
        My father is a farmer.
        Even then I noticed how he thought.
        He often found another way into the same problem, another door the rest of us weren’t looking at.
        That habit influenced me more than any speech could have.
      </p>
      <p>
        School was hard.
        I dealt with a lot of discrimination, mostly indirect — the kind that hurts and then pretends it didn’t mean to.
        My academics suffered.
      </p>
      <p>
        For a long time I kept to myself.
        Being alone felt peaceful in a way that’s hard to explain to someone who wants company.
        It also meant I could try things and fail without an audience.
        My father’s way of flipping a problem helped me see that: the quiet wasn’t only isolation.
        It was space.
      </p>
      <p>
        Computers were still new around me then.
        I liked that machines don’t judge you.
        They follow rules.
        That made them easy to learn with.
        So I spent a lot of childhood closed in with machines, the internet, books, experiments, teaching myself.
      </p>
      <p>
        I also learned what breaks learning: distraction.
        People were the hardest distraction.
        I didn’t have much of that then, and I’m glad.
      </p>
      <p>
        I got interested in logic — rules, instructions, the base of programming.
        Machines, whatever the language, are basically “when this, do that.”
        Later I noticed minds aren’t that different: messier, but still hungry for structure.
      </p>

      <h2 class="about-story__break">College</h2>
      <p>
        After school I needed a college path.
        I didn’t know what career I wanted, and I didn’t have anyone guiding me.
        I needed a degree that could lead to a job.
        That led me to hospitality.
      </p>
      <p>
        I studied at IHMCT&amp;AN, Chennai.
        In my final year I was selected for Club Mahindra’s (MHRIL) management trainee program in housekeeping.
        First posting: Udaipur, Rajasthan.
      </p>
      <p>
        I cleaned rooms and mopped floors and stairs.
        Fifteen to eighteen hour days, seven days a week, no weekly offs at the start.
        Hotel work is tough early on.
        Once it becomes routine, you get a kind of stamina corporates don’t always teach.
        Discipline was the real gift.
      </p>

      <h2 class="about-story__break">Goa, then Coorg</h2>
      <p>
        I moved to South Goa — Varca — as a supervisor.
        I still like housekeeping as a subject.
        It’s detail work: art and process together.
      </p>
      <p>
        Then Coorg, with a different brief.
      </p>

      <h2 class="about-story__break">The SEWA Chronicles</h2>
      <p>
        Mr. Prakash Aranha, who handled corporate L&amp;D for resort operations, handpicked a small group for a project.
        He wanted something the company could call its own around SEWA — Service with Empathy, Warmth and Attentiveness — real service stories in illustrated form, as employee appreciation.
        He asked for ideas.
        I answered.
        We talked.
        He asked if I could do it.
        I said yes.
      </p>
      <p>
        Club Mahindra already logged strong customer-service stories in an online portal.
        I went through those logs from the beginning of the company, picked ten that mattered, and only kept ones where the employee was still with us.
        I called each person without saying why at first, and checked with managers and colleagues so we weren’t celebrating the wrong story.
      </p>

      <EdPhotoTiles
        :photos="clubMahindraPhotos"
        label="Coorg — Club Mahindra sketching and SEWA drafts"
        :eager-count="2"
      />

      <p>
        About three months later we printed the first volume of <em>The SEWA Chronicles</em>: ten stories from seventy-plus resorts.
        It did well — less because of how it looked, more because the stories had been checked.
        Early creative project: my design, his direction.
      </p>

      <figure class="about-story__figure about-story__figure--wide">
        <EdEditorialImage
          src="/about/about-sewa-1.webp"
          alt="Printed SEWA Chronicles booklet and comic pages from the Coorg project, laid out on a white table."
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

      <h2 class="about-story__break">Marriott and Concentrix</h2>
      <p>
        I stayed with Mahindra until an Assistant L&amp;D Manager role opened at Courtyard by Marriott, Mahabaleshwar.
        More responsibility on the learning and HR side.
        That stretch shaped a lot of how I work now.
      </p>

      <EdPhotoTiles
        :photos="marriottPhotos"
        label="Courtyard by Marriott, Mahabaleshwar"
        :eager-count="4"
      />

      <p>
        I wanted to treat learning as a craft with a method — instructional design.
        Next stop: Concentrix, where I still work, building learning that has to hold up with real people.
      </p>
      <p>
        Entertrainer is this site.
        Elevate is where the essays live.
        Same thread as the floors and the phone calls: make something someone can actually use.
      </p>
      <p class="about-story__signoff">
        — Naveen
      </p>
        </article>

    <footer class="about-story__close">
      <NuxtLink :to="`/elevate/${FEATURED_BLOG.slug}`" class="about-story__destination about-story__destination--elevate" aria-labelledby="elevate-preview-title" aria-describedby="elevate-preview-description">
        <figure class="about-story__destination-visual">
          <EdEditorialImage :src="FEATURED_BLOG.hero" :alt="FEATURED_BLOG.heroAlt" />
        </figure>
        <div class="about-story__destination-copy">
          <h2 id="elevate-preview-title">{{ FEATURED_BLOG.title }}</h2>
          <p id="elevate-preview-description">{{ FEATURED_BLOG.dek }}</p>
          <span class="about-story__destination-action">Read this</span>
        </div>
      </NuxtLink>
    </footer>
  </div>
</template>

<style scoped>
.about-story { max-width: var(--shell-max); margin: 0 auto; padding: var(--space-55) var(--shell-gutter) var(--space-89); }
.about-story__hero { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(260rem, .85fr); gap: var(--space-55); align-items: end; padding-bottom: var(--space-55); border-bottom: var(--stroke) solid var(--ink); }
.about-story h1 { max-width: 15ch; margin: var(--space-13) 0 0; font: 400 clamp(44px, 5.6vw, 88px)/.92 var(--font-display); font-variation-settings: "opsz" 144, "SOFT" 40, "WONK" 1; letter-spacing: -.04em; }

/* Station strip: the route in one line, drawn once. */
.about-route {
  position: relative;
  list-style: none;
  display: flex; flex-wrap: wrap; justify-content: space-between; gap: var(--space-13) var(--space-21);
  margin: var(--space-34) 0 0; padding: var(--space-21) 0 0;
}
.about-route__line { position: absolute; left: 0; right: 0; top: calc(var(--space-21) + 6rem); border-top-width: 2px; }
.about-route__stop { position: relative; display: grid; justify-items: start; gap: var(--space-8); padding-top: 22rem; font: 500 var(--type-meta)/1.3 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.about-route__stop i { position: absolute; top: 0; left: 0; width: 13rem; height: 13rem; border-radius: 50%; background: var(--paper); box-shadow: 0 0 0 2px var(--ink); }
.about-route__stop:last-child i { background: var(--accent); }
@media (max-width: 700px) {
  .about-route { flex-direction: column; padding: 0 0 0 var(--space-34); }
  .about-route__line { left: 6rem; right: auto; top: 0; bottom: 0; width: 0; border-top: 0; border-left: 2px solid var(--ink); }
  .about-route__stop { padding-top: 0; }
  .about-route__stop i { left: calc(var(--space-34) * -1); }
}

/* The ink thread beside the prose (desktop), and a station dot at each chapter. */
.about-story__article { position: relative; }
.about-story__thread { display: none; }
@media (min-width: 1000px) {
  .about-story__thread { display: block; position: absolute; left: -56rem; top: 0; bottom: 0; width: 2px; background: var(--ink); transform-origin: 50% 0; }
  .about-story__article h2.about-story__break { position: relative; }
  .about-story__article h2.about-story__break::after {
    content: ''; position: absolute; left: -63rem; top: 20rem;
    width: 16rem; height: 16rem; border-radius: 50%;
    background: var(--paper); box-shadow: 0 0 0 2px var(--ink);
    transition: background var(--dur-slow) var(--ease-ink), transform var(--dur-slow) var(--ease-stamp);
  }
  .about-story__article h2.about-story__break.is-reached::after { background: var(--accent); transform: scale(1.15); }
}

/* Portrait fills its column — cover crop, bias toward face */
.about-story__hero-art {
  margin: 0;
  overflow: hidden;
  border: 0;
  border-radius: var(--radius-l);
  background: var(--paper-2);
  line-height: 0;
  aspect-ratio: 1 / 1;
  width: 100%;
  max-width: 420rem;
  justify-self: end;
}
.about-story__hero-art :deep(.ed-editorial-image),
.about-story__hero-art :deep(img) {
  width: 100%;
  height: 100%;
  display: block;
  border: 0;
  border-radius: var(--radius-l);
  background: transparent;
  object-fit: cover;
  object-position: center 18%;
}

.about-story__article { max-width: var(--column); margin: var(--space-55) auto 0; font: 400 var(--type-body)/1.55 var(--font-reading); }
.about-story__article > p { max-width: var(--measure); margin: 0 0 var(--space-21); }
.about-story__article h2 { max-width: 22ch; margin: var(--space-55) 0 var(--space-13); font: 500 var(--type-h2)/1.05 var(--font-display); letter-spacing: -.02em; }
.about-story__article h2.about-story__break { max-width: 22ch; margin: var(--space-55) 0 var(--space-13); font: 500 var(--type-h2)/1.05 var(--font-display); letter-spacing: -.02em; color: var(--ink); }
.about-story__article h2.about-story__break::before { content: ''; display: block; width: 36rem; height: var(--stroke); background: var(--ink); margin: 0 0 14rem; opacity: .55; }

.about-story__figure {
  width: 100%;
  max-width: 640rem;
  margin: clamp(42rem, 7vw, 80rem) 0 clamp(50rem, 8vw, 92rem);
  overflow: hidden;
  border-radius: var(--radius-m);
  background: var(--paper-2);
  aspect-ratio: var(--crop);
  line-height: 0;
}
.about-story__figure--wide {
  width: 100%;
  max-width: none;
  margin-left: 0;
}
.about-story__figure :deep(.ed-editorial-image),
.about-story__figure :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: var(--radius-m);
  background: transparent;
  object-fit: cover;
  object-position: center 42%;
}

.about-story__article :deep(.photo-tiles) {
  /* Bleed into the shell gutter, but never past the viewport. Between ~700 and ~830 the old 6vw pull was wider than the gutter and the page scrolled sideways. */
  margin-left: calc(min(clamp(0rem, 6vw, 80rem), var(--shell-gutter)) * -1);
  margin-right: calc(min(clamp(0rem, 6vw, 80rem), var(--shell-gutter)) * -1);
  width: auto;
  max-width: none;
}

.about-story__signoff {
  margin-top: 22rem;
  font: 500 17rem/1.45 var(--font-reading);
}

.about-story__article :deep(.note) {
  max-width: 42ch;
  margin: clamp(48rem, 8vw, 88rem) 0 clamp(24rem, 4vw, 40rem);
}

.about-story__sewa { margin: clamp(54rem, 9vw, 100rem) calc(min(clamp(0rem, 5vw, 68rem), var(--shell-gutter)) * -1); }
.about-story__destination { display: grid; grid-template-columns: minmax(180rem, .72fr) minmax(0, 1.28fr); color: var(--ink); overflow: hidden; border: var(--stroke) solid var(--ink); border-radius: var(--radius-l); background: var(--signal-field); text-decoration: none; transition: background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-spring); }
.about-story__destination-visual { min-height: 260rem; margin: 0; overflow: hidden; border-right: var(--stroke) solid var(--ink); background: var(--paper-2); }
.about-story__destination-visual :deep(.ed-editorial-image), .about-story__destination-visual :deep(img) { width: 100%; height: 100%; object-fit: cover; object-position: center center; }
.about-story__destination-copy { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding: clamp(24rem, 5vw, 48rem); }
.about-story__destination h2 { max-width: 18ch; margin: 0; font: 500 var(--type-h2)/1.05 var(--font-display); letter-spacing: -.02em; }
.about-story__destination-copy > p { max-width: var(--measure); margin: var(--space-13) 0 0; font: 400 var(--type-body)/1.5 var(--font-reading); }
.about-story__destination-action { display: inline-flex; margin-top: 24rem; padding: 10rem 14rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-s); font: 800 14rem/1.1 var(--font-body); background: var(--accent); color: var(--accent-ink); }
.about-story__destination:hover, .about-story__destination:focus-visible { background: var(--paper); transform: translateY(-3rem); }
.about-story__destination:focus-visible { outline: 3rem solid var(--ink); outline-offset: 5rem; }
.about-story__close { display: grid; gap: 28rem; max-width: 720rem; margin: clamp(64rem, 10vw, 118rem) auto 0; padding-top: 30rem; border-top: var(--stroke) solid var(--ink); }
.about-story__destination--elevate { grid-template-columns: minmax(220rem, .86fr) minmax(0, 1.14fr); background: var(--paper); }
.about-story__destination--elevate .about-story__destination-visual { min-height: 230rem; }

@media (max-width: 700px) {
  .about-story__hero { grid-template-columns: 1fr; }
  .about-story__hero-art { justify-self: stretch; max-width: none; }
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
