<script setup lang="ts">
/**
 * The lead story. A real front page opens with one thing set enormous — here,
 * the identity — and everything else the paper covers gets teased below it.
 * The credentials read as a fact box beside a photograph, not a resume.
 */
const R = useReveal()

const CREDENTIALS: Array<[string, string]> = [
  ['Certified', 'Instructional Design Specialist'],
  ['Now', 'Concentrix — Training-as-a-Service'],
  ['Before', 'Courtyard by Marriott — L&D Specialist'],
  ['Before', 'Club Mahindra — L&D, The SEWA Chronicles'],
  ['Started', 'Hotel management, Chennai'],
  ['Shipped', 'Four web apps, and this site']
]
</script>

<template>
  <section class="hh">
    <div class="hh__col">
      <p class="press-label" v-motion :initial="R.rise(0).initial" :visible-once="R.rise(0).visibleOnce">Front Page &middot; Entertrainer</p>

      <h1 class="hh__h1" v-motion :initial="R.rise(90).initial" :visible-once="R.rise(90).visibleOnce">
        Instructional<br>designer.
      </h1>

      <p class="press-dropcap hh__lead" v-motion :initial="R.rise(180).initial" :visible-once="R.rise(180).visibleOnce">
        I work with teams who need training people will actually finish — and when the tool to make
        that happen doesn't exist, I build it.
      </p>

      <p class="hh__run" v-motion :initial="R.rise(240).initial" :visible-once="R.rise(240).visibleOnce">
        I studied hotel management in Chennai, started on the hotel floor, moved into L&amp;D at
        Club Mahindra, drew a comic about guest service that changed my mind about everything, ran
        certification programs at Courtyard by Marriott, got certified as an instructional designer,
        started building the tools I couldn't find, shipped four of them, and now turn operational
        detail into e-learning for teams around the world at Concentrix — and I still learn
        something new every single build.
      </p>

      <NuxtLink to="/about" class="hh__more">The longer story <span aria-hidden="true">&rarr;</span></NuxtLink>
    </div>

    <aside class="hh__side" v-motion :initial="R.scaleIn(140).initial" :visible-once="R.scaleIn(140).visibleOnce">
      <PressHalftone src="/about-me.png" alt="Portrait of Naveen Jose" ratio="4/5" eager class="hh__portrait" />
      <dl class="press-table hh__facts">
        <div v-for="(c, i) in CREDENTIALS" :key="i" class="press-row">
          <dt>{{ c[0] }}</dt>
          <dd>{{ c[1] }}</dd>
        </div>
      </dl>
    </aside>
  </section>
</template>

<style scoped>
.hh {
  position: relative; z-index: 1;
  max-width: 1180px; margin: 0 auto;
  padding: clamp(40px, 6vw, 72px) var(--press-edge) clamp(56px, 7vw, 84px);
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: clamp(32px, 5vw, 64px);
  align-items: start;
}

.hh__h1 { margin: 14px 0 0; font-size: var(--press-display); }
.hh__lead { margin: 28px 0 0; font-size: var(--press-lead); line-height: 1.32; max-width: 32ch; }
.hh__run { margin: 22px 0 0; font-family: var(--press-serif); font-size: var(--press-body); line-height: 1.68; color: var(--press-ink-80); max-width: var(--press-measure); }
.hh__more {
  display: inline-flex; align-items: center; gap: 8px; margin-top: 28px;
  padding: 12px 20px; border: 1px solid var(--press-rule);
  font-family: var(--press-mono); font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--press-ink); transition: background 0.25s ease, color 0.25s ease;
}
.hh__more:hover { background: var(--press-ink); color: var(--press-paper); }
.hh__more span { transition: transform 0.25s ease; }
.hh__more:hover span { transform: translateX(4px); }

.hh__side { position: sticky; top: clamp(76px, 10vw, 96px); }
.hh__portrait { border: 1px solid var(--press-rule); }
.hh__facts { margin-top: 18px; }

@media (max-width: 900px) {
  .hh { grid-template-columns: 1fr; }
  .hh__side { position: static; max-width: 340px; }
}
</style>
