<script setup lang="ts">
import {
  COURSE, MODULES, SCHEDULE, DIAGNOSTIC, FINAL, CAPSTONE,
  TOTAL_LESSONS, moduleMinutes, nextPosition, prevPosition, lessonKey,
  type Position
} from '~/content/course/ai'
import { useCourseStore } from '~/stores/course'

/**
 * Artificial Intelligence: From Its Origins to the Frontier.
 *
 * A full-day course, built as a course rather than as a page about a course.
 * It renders without the site's masthead — see the `bare` list in app.vue —
 * because a learner three hours into a module should not be looking at a
 * publication's navigation. It has its own chrome: progress, contents, exit.
 *
 * Everything is client-side and nothing is submitted anywhere. Progress lives
 * in this browser's local storage, which is stated plainly on the cover rather
 * than discovered later when someone opens it on their phone.
 *
 * Structure of this file: one `view` ref switches between the cover, the
 * contents, the lesson player, the two assessments, the capstone and the
 * reference shelf. Lessons themselves are data — see content/course/ai — and
 * are drawn by CourseBlock.
 */
useSeoMeta({
  title: 'Artificial Intelligence: From Its Origins to the Frontier — a one-day course · Entertrainer',
  description: 'A free, full-day course on how AI actually developed — from Turing and symbolic systems through two collapses to transformers, agents and the frontier — built around a method for telling evidence from announcement.',
  ogTitle: 'Artificial Intelligence: From Its Origins to the Frontier',
  ogDescription: 'A free one-day course on how AI got here, and how to judge what is claimed about it.',
  ogUrl: 'https://entertrainer.in/my-work/ai-origins-to-frontier'
})

// This one page borrows Rise 360's actual look rather than the rest of the
// site's typographic system — Nunito Sans is the rounded, friendly face Rise
// itself ships with, so it's loaded here and nowhere else, the same exception
// Strong already makes for Inter. Everything else on the site keeps its own
// faces untouched.
useHead({
  link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700;6..12,800;6..12,900&display=swap' }]
})

type View = 'cover' | 'contents' | 'lesson' | 'diagnostic' | 'final' | 'capstone' | 'reference'

const store = useCourseStore()
const view = ref<View>('cover')
const scroller = ref<HTMLElement | null>(null)

onMounted(() => store.load())

const pos = computed<Position>(() => store.pos)
const currentModule = computed(() => MODULES[pos.value.moduleIndex])
const currentLesson = computed(() => currentModule.value?.lessons[pos.value.lessonIndex])
const lessonNumber = computed(() => {
  let n = 0
  for (let m = 0; m < pos.value.moduleIndex; m++) n += MODULES[m].lessons.length
  return n + pos.value.lessonIndex + 1
})

const hasNext = computed(() => !!nextPosition(pos.value))
const hasPrev = computed(() => !!prevPosition(pos.value))
const lessonDone = computed(() =>
  currentModule.value && currentLesson.value
    ? store.isDone(currentModule.value.id, currentLesson.value.id) : false)

/** Completion rule. A lesson with checks needs them attempted; others need the
 *  Continue press, which is a deliberate acknowledgement rather than a scroll. */
const checksAnswered = ref(false)
const requiresChecks = computed(() => currentLesson.value?.completion === 'check')
const canContinue = computed(() => !requiresChecks.value || checksAnswered.value || lessonDone.value)

function go(v: View) { view.value = v; scrollTop() }
function scrollTop() { nextTick(() => scroller.value?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })) }

function start() {
  store.begin()
  go(store.started ? 'lesson' : 'diagnostic')
}
function openLesson(moduleIndex: number, lessonIndex: number) {
  store.goTo({ moduleIndex, lessonIndex })
  checksAnswered.value = false
  go('lesson')
}
function advance() {
  if (currentModule.value && currentLesson.value) store.complete(currentModule.value.id, currentLesson.value.id)
  const n = nextPosition(pos.value)
  if (n) { store.goTo(n); checksAnswered.value = false; scrollTop() }
  else go('final')
}
function back() {
  const p = prevPosition(pos.value)
  if (p) { store.goTo(p); checksAnswered.value = false; scrollTop() }
}

// Reset the per-lesson gate whenever the lesson changes.
watch(() => `${pos.value.moduleIndex}.${pos.value.lessonIndex}`, () => { checksAnswered.value = false })

/* ── Assessments ─────────────────────────────────────────────────────── */
const finalScore = computed(() => {
  let right = 0
  for (const q of FINAL) {
    const a = store.final[q.id]
    if (!a) continue
    const p = [...a].sort(), c = [...q.answer].sort()
    if (p.length === c.length && p.every((v, i) => v === c[i])) right++
  }
  return right
})
const finalAnswered = computed(() => FINAL.filter(q => store.final[q.id]).length)

const hours = (m: number) => `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`
</script>

<template>
  <div ref="scroller" class="co">
    <!-- ── Chrome ──────────────────────────────────────────────────── -->
    <header class="co__bar">
      <button type="button" class="co__brand" @click="go('cover')">
        <EdWordmark variant="mark" :size="26" />
        <span class="co__brand-text">AI: Origins to Frontier</span>
      </button>
      <nav class="co__actions" aria-label="Course">
        <button type="button" class="co__link" :class="{ 'is-on': view === 'reference' }" @click="go('reference')">Reference</button>
        <NuxtLink to="/my-work" class="co__link">Exit</NuxtLink>
      </nav>
    </header>

    <div class="co__subbar">
      <button type="button" class="co__hamburger" :class="{ 'is-on': view === 'contents' }"
              aria-label="Course contents" @click="go('contents')">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
      </button>
      <div class="co__progress" v-if="store.started">
        <span class="t-mono co__progress-n">{{ store.completedCount }}/{{ TOTAL_LESSONS }}</span>
        <span class="t-mono co__progress-left">{{ hours(store.minutesLeft) }} left</span>
      </div>
    </div>
    <span v-if="store.started" class="co__progress-track" role="img" :aria-label="`${store.percent}% complete`">
      <span class="co__progress-fill" :style="{ width: store.percent + '%' }" />
    </span>

    <main class="co__main">
      <!-- ── Cover ─────────────────────────────────────────────────── -->
      <section v-if="view === 'cover'" class="cv">
        <div class="cv__banner">
          <h1 class="cv__title">{{ COURSE.title }}</h1>
          <button type="button" class="cv__start" @click="start">
            {{ store.started ? 'Resume where you left off' : 'Start course' }}
          </button>
        </div>

        <div class="cv__content">
          <EdWordmark variant="mark" :size="34" />
          <p class="cv__sub">{{ COURSE.subtitle }}</p>

          <dl class="cv__facts">
            <div><dt class="t-mono">Duration</dt><dd>{{ hours(COURSE.minutes) }}, self-paced</dd></div>
            <div><dt class="t-mono">Level</dt><dd>{{ COURSE.level }}</dd></div>
            <div><dt class="t-mono">Prerequisites</dt><dd>{{ COURSE.prerequisites }}</dd></div>
            <div><dt class="t-mono">Modules</dt><dd>{{ MODULES.length }} modules · {{ TOTAL_LESSONS }} lessons</dd></div>
          </dl>

          <div class="cv__cta">
            <button type="button" class="ticket ticket--ghost" @click="go('contents')">See the whole day</button>
          </div>
          <p v-if="store.started" class="t-mono cv__resume">
            You are on lesson {{ lessonNumber }} of {{ TOTAL_LESSONS }} — {{ currentLesson?.title }}
          </p>

          <div class="cv__panel">
            <h2 class="cv__h">Objectives</h2>
            <p class="cv__h-sub">By the end of this course, you should be able to:</p>
            <ul class="cv__obj">
              <li v-for="(o, i) in COURSE.objectives" :key="i">{{ o }}</li>
            </ul>
          </div>

          <h2 class="cv__h2">Why this matters</h2>
          <div class="cv__why">
            <p v-for="(p, i) in COURSE.whyThisMatters" :key="i">{{ p }}</p>
          </div>

          <h2 class="cv__h2">Who it is for</h2>
          <p class="cv__body">{{ COURSE.audience }}</p>
          <p class="cv__body">{{ COURSE.promise }}</p>

          <EdNote label="Before you start" accent="var(--blue)">
            <p>Your progress is saved only in this browser, nowhere else. There is no account, and
              nothing is sent anywhere. You can stop and pick up again any time on this device. If you
              clear your browser data or switch devices, you start over.</p>
            <p>All facts are correct as of {{ COURSE.currentAsOf }}. Every video and link was checked on
              that date. The Reference tab shows what was checked and what could not be.</p>
          </EdNote>
        </div>
      </section>

      <!-- ── Contents ──────────────────────────────────────────────── -->
      <section v-else-if="view === 'contents'" class="ct">
        <h1 class="ct__title t-display">The whole day</h1>
        <p class="ct__deck">
          Ten modules, {{ TOTAL_LESSONS }} lessons, two assessments and a capstone.
          Sequential is recommended — the later modules assume the earlier ones — but nothing is
          locked, and you can revisit anything at any point.
        </p>

        <ol class="ct__modules">
          <li v-for="(m, mi) in MODULES" :key="m.id" class="cm">
            <div class="cm__head">
              <span class="t-mono cm__n">{{ m.n }}</span>
              <div class="cm__headings">
                <h2 class="cm__title">{{ m.title }}</h2>
                <p class="t-mono cm__meta">
                  {{ m.lessons.length }} lessons · {{ moduleMinutes(m) }} min ·
                  {{ store.moduleProgress(mi).done === m.lessons.length ? 'Completed'
                    : store.moduleProgress(mi).done > 0 ? `In progress (${store.moduleProgress(mi).done}/${m.lessons.length})`
                    : 'Not started' }}
                </p>
              </div>
              <span class="cm__bar" aria-hidden="true">
                <span class="cm__bar-fill" :style="{ width: (store.moduleProgress(mi).done / m.lessons.length * 100) + '%', background: m.accent }" />
              </span>
            </div>
            <p class="cm__intro">{{ m.intro }}</p>
            <ul class="cm__lessons">
              <li v-for="(l, li) in m.lessons" :key="l.id">
                <button type="button" class="cl" :class="{ 'is-done': store.isDone(m.id, l.id) }" @click="openLesson(mi, li)">
                  <span class="cl__icon" :class="`cl__icon--${l.completion}`" aria-hidden="true">
                    <svg v-if="l.completion === 'check'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.7-2.5 2-2.5 4" /><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" /></svg>
                    <svg v-else-if="l.completion === 'activity'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><circle cx="12" cy="12" r="4.5" /></svg>
                    <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 4h11l3 3v13H5z" /><path d="M9 10h7M9 14h7M9 18h4" /></svg>
                  </span>
                  <span class="cl__body">
                    <span class="cl__title">{{ l.title }}</span>
                    <span class="cl__summary">{{ l.summary }}</span>
                  </span>
                  <span class="t-mono cl__min">{{ l.minutes }} min</span>
                  <span class="cl__dot" aria-hidden="true" />
                </button>
              </li>
            </ul>
          </li>
        </ol>

        <h2 class="ct__h2">A realistic schedule</h2>
        <p class="ct__note">If you are doing this in one sitting, this is the shape that works. The breaks are part of the design.</p>
        <div class="ct__scroll">
          <table class="ct__table">
            <thead><tr><th scope="col">Time</th><th scope="col">What</th><th scope="col">Min</th><th scope="col">You end up with</th></tr></thead>
            <tbody>
              <tr v-for="(r, i) in SCHEDULE" :key="i" :class="`is-${r.kind}`">
                <td class="t-mono">{{ r.time }}</td>
                <td>{{ r.what }}</td>
                <td class="t-mono">{{ r.minutes }}</td>
                <td class="ct__out">{{ r.output }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="ct__ends">
          <button type="button" class="ticket ticket--ghost" @click="go('diagnostic')">Take the diagnostic</button>
          <button type="button" class="ticket ticket--ghost" @click="go('final')">Final assessment</button>
          <button type="button" class="ticket ticket--ghost" @click="go('capstone')">Capstone</button>
        </div>
      </section>

      <!-- ── Lesson ────────────────────────────────────────────────── -->
      <article v-else-if="view === 'lesson' && currentModule && currentLesson" class="ls" :key="currentLesson.id">
        <header class="ls__head">
          <p class="ls__crumb t-mono">Lesson {{ lessonNumber }} of {{ TOTAL_LESSONS }}</p>
          <h1 class="ls__title">{{ currentLesson.title }}</h1>
          <span class="ls__rule" aria-hidden="true" />
        </header>
        <p class="t-mono ls__meta">
          Module {{ currentModule.n }} · {{ currentModule.title }} · {{ currentLesson.minutes }} min ·
          {{ lessonDone ? 'Completed' : 'In progress' }}
        </p>

        <!-- Module cover: objectives, in the required format, on the first lesson -->
        <section v-if="pos.lessonIndex === 0" class="ls__obj">
          <p class="ls__intro">{{ currentModule.intro }}</p>
          <h2 class="ls__obj-h">Objectives</h2>
          <p class="ls__obj-sub">By the end of this module, you should be able to:</p>
          <ul>
            <li v-for="(o, i) in currentModule.objectives" :key="i">{{ o }}</li>
          </ul>
        </section>

        <CourseBlock
          v-for="(blk, i) in currentLesson.blocks" :key="`${currentLesson.id}-${i}`"
          :block="blk" :block-key="`${currentLesson.id}-${i}`"
          @answered="checksAnswered = $event"
        />

        <section v-if="currentModule.extension && pos.lessonIndex === currentModule.lessons.length - 1" class="ls__ext">
          <p class="t-mono ls__ext-kicker">Optional extension</p>
          <h3>{{ currentModule.extension.title }}</h3>
          <p>{{ currentModule.extension.body }}</p>
        </section>

        <footer class="ls__foot">
          <p v-if="requiresChecks && !canContinue" class="t-mono ls__gate">
            Answer the knowledge check above to continue. You can get it wrong — you just have to commit.
          </p>
          <div class="ls__nav">
            <button type="button" class="ticket ticket--ghost" :disabled="!hasPrev" @click="back">← Previous</button>
            <button type="button" class="ticket" :disabled="!canContinue" @click="advance">
              {{ hasNext ? 'Complete and continue →' : 'Finish the modules →' }}
            </button>
          </div>
        </footer>
      </article>

      <!-- ── Diagnostic ────────────────────────────────────────────── -->
      <section v-else-if="view === 'diagnostic'" class="as">
        <p class="t-mono as__eyebrow">Before you start</p>
        <h1 class="as__title t-display">Six questions, not scored</h1>
        <p class="as__deck">
          This is not a test. It just puts your current beliefs on paper, so that when a module later
          proves one of them wrong, you notice it happening. Answer honestly — even the ones you are
          just guessing at.
        </p>
        <CourseCheck :questions="DIAGNOSTIC" title="Diagnostic" />
        <div class="as__foot">
          <button type="button" class="ticket" @click="openLesson(0, 0)">Begin module 01 →</button>
        </div>
      </section>

      <!-- ── Final ─────────────────────────────────────────────────── -->
      <section v-else-if="view === 'final'" class="as">
        <p class="t-mono as__eyebrow">Final assessment</p>
        <h1 class="as__title t-display">Fifteen questions</h1>
        <p class="as__deck">
          These questions test your judgement more than your memory, because memory fades by Friday
          and judgement does not. Every answer comes with an explanation — even the ones you get right.
        </p>
        <p v-if="finalAnswered" class="as__score t-mono" role="status">
          {{ finalScore }} of {{ finalAnswered }} answered correctly so far
        </p>
        <CourseCheck :questions="FINAL" title="Final assessment" />
        <div class="as__foot">
          <button type="button" class="ticket" @click="go('capstone')">On to the capstone →</button>
        </div>
      </section>

      <!-- ── Capstone ──────────────────────────────────────────────── -->
      <section v-else-if="view === 'capstone'" class="cp">
        <p class="t-mono cp__eyebrow">Capstone</p>
        <h1 class="cp__title t-display">{{ CAPSTONE.title }}</h1>
        <p class="cp__deck">{{ CAPSTONE.brief }}</p>

        <ol class="cp__parts">
          <li v-for="p in CAPSTONE.parts" :key="p.n">
            <span class="t-mono cp__n">{{ p.n }}</span>
            <div>
              <h2>{{ p.title }}</h2>
              <p>{{ p.ask }}</p>
            </div>
          </li>
        </ol>

        <h2 class="cp__h2">Rubric</h2>
        <p class="cp__note">You grade your own work. Read the "strong" column before you write, not after.</p>
        <div class="cp__scroll">
          <table class="cp__table">
            <thead><tr><th scope="col">Criterion</th><th scope="col">Strong</th><th scope="col">Adequate</th><th scope="col">Weak</th></tr></thead>
            <tbody>
              <tr v-for="r in CAPSTONE.rubric" :key="r.criterion">
                <th scope="row">{{ r.criterion }}</th>
                <td>{{ r.strong }}</td><td>{{ r.adequate }}</td><td>{{ r.weak }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <EdNote label="On completion" accent="var(--green)">
          <p>{{ CAPSTONE.completion }}</p>
        </EdNote>

        <div class="cp__foot">
          <p class="cp__done" v-if="store.percent === 100">
            All {{ TOTAL_LESSONS }} lessons complete. That is the whole day.
          </p>
          <div class="cp__links">
            <NuxtLink to="/tools" class="ticket">See the tools I build</NuxtLink>
            <button type="button" class="ticket ticket--ghost" @click="go('reference')">Keep the reference shelf</button>
          </div>
        </div>
      </section>

      <!-- ── Reference ─────────────────────────────────────────────── -->
      <section v-else class="rs">
        <h1 class="rs__title t-display">Reference</h1>
        <p class="rs__deck">
          Everything this course links to, in one searchable place. The glossary explains every term
          used. The source list shows what backs up each evidence label.
        </p>
        <CourseReference />
      </section>
    </main>
  </div>
</template>

<style scoped>
/* ── Rise 360 skin ─────────────────────────────────────────────────────────
   This page borrows Rise's actual look rather than the rest of the site's:
   one brand blue used everywhere var(--blue) already appears (buttons, links,
   chart lines, the medium-confidence accent — nothing else has to change to
   pick this up), bigger rounded corners, and soft-shadow cards instead of
   hairline borders. Scoped to `.co` only, so nothing outside this page
   is affected — the rest of the site keeps its own system untouched. */
.co {
  --blue: #1467C8;
  --co-blue-dark: #0F52A0;
  --co-blue-tint: #EAF2FC;
  --co-surface: var(--paper);
  --co-shadow: 0 1px 2px rgba(20, 40, 70, 0.06), 0 4px 16px rgba(20, 40, 70, 0.08);
  --radius-xs: 6rem; --radius-s: 8rem; --radius-m: 10rem; --radius-l: 16rem;
  min-height: 100dvh; background: var(--paper); color: var(--ink); display: flex; flex-direction: column;
  font-family: 'Nunito Sans', var(--font-ui), sans-serif;
}
.co .t-display {
  font-family: 'Nunito Sans', var(--font-ui), sans-serif; font-weight: 900; letter-spacing: -0.01em;
}
/* Dark mode needs its own tint and surface, not just the light ones left to
   cope: #EAF2FC (the light "picked" tint) on a near-black page made picked
   answers render as a near-white box with invisible text — this caught it. */
[data-theme="dark"] .co {
  --co-blue-tint: #15304C;
  --co-surface: var(--paper-2);
  --co-shadow: 0 1px 2px rgba(0, 0, 0, 0.5), 0 4px 18px rgba(0, 0, 0, 0.45);
}

/* ── Chrome ────────────────────────────────────────────────────────── */
/* Two rows plus a hairline progress strip, the same structure Rise itself
   uses: brand row, then an action row with the contents toggle on the left
   and page links on the right, then one thin line of progress under both. */
.co__bar {
  position: sticky; top: 0; z-index: var(--z-chrome);
  display: flex; align-items: center; gap: clamp(12rem, 2vw, 26rem);
  padding: 12rem clamp(14rem, 3vw, 28rem);
  padding-top: calc(12rem + var(--safe-top));
  background: var(--paper); border-bottom: var(--stroke) solid var(--line);
}
.co__brand { display: inline-flex; align-items: center; gap: 10rem; flex: none; }
.co__brand-text { font-family: 'Nunito Sans', var(--font-ui), sans-serif; font-weight: 900; font-size: 18rem; letter-spacing: 0; }

.co__actions { display: flex; align-items: center; gap: 18rem; margin-left: auto; }
.co__link {
  font-family: 'Nunito Sans', var(--font-ui), sans-serif; font-size: 14.5rem; font-weight: 700;
  color: var(--ink); text-decoration: none; white-space: nowrap; cursor: pointer;
}
.co__link.is-on { color: var(--blue); }
@media (hover: hover) { .co__link:hover { color: var(--blue); } }

.co__subbar {
  position: sticky; top: 0; z-index: calc(var(--z-chrome) - 1);
  display: flex; align-items: center; gap: 14rem;
  padding: 10rem clamp(14rem, 3vw, 28rem);
  background: var(--paper); border-bottom: var(--stroke) solid var(--line);
}
.co__hamburger {
  display: flex; align-items: center; justify-content: center;
  width: 34rem; height: 34rem; border-radius: var(--radius-s);
  border: none; background: var(--paper-2); color: var(--ink); cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
.co__hamburger.is-on, .co__hamburger:hover { background: var(--blue); color: #fff; }

.co__progress { display: flex; align-items: center; gap: 10rem; margin-left: auto; min-width: 0; }
.co__progress-n, .co__progress-left { font-size: 12.5rem; color: var(--muted); white-space: nowrap; }

.co__progress-track {
  display: block; width: 100%; height: 4rem;
  background: var(--co-blue-tint);
}
.co__progress-fill { display: block; height: 100%; background: var(--blue); transition: width var(--dur-mid) var(--ease-out); }

@media (max-width: 780px) {
  .co__brand-text, .co__progress-left { display: none; }
}

.co__main { flex: 1; width: 100%; max-width: 880rem; margin: 0 auto; padding: clamp(26rem, 4vw, 48rem) clamp(18rem, 4vw, 32rem) clamp(60rem, 9vh, 110rem); }

/* ── Cover ─────────────────────────────────────────────────────────── */
/* The banner: a flat colored rectangle standing in for the photo Rise itself
   would show here. No stock photo — nothing was available to use honestly,
   so the layout keeps the shape and the color carries it instead. */
.cv__banner {
  position: relative; margin: 0 0 clamp(24rem, 3.4vw, 36rem);
  padding: clamp(48rem, 9vw, 96rem) clamp(20rem, 4vw, 40rem) clamp(56rem, 8vw, 80rem);
  background: linear-gradient(135deg, var(--co-blue-dark, #0F52A0), var(--blue) 65%);
  border-radius: var(--radius-l); overflow: hidden;
}
.cv__title {
  position: relative; z-index: 1; margin: 0 0 clamp(28rem, 4vw, 44rem);
  color: #fff; font-family: 'Nunito Sans', var(--font-ui), sans-serif; font-weight: 900;
  font-size: clamp(32rem, 5.4vw, 64rem); line-height: 1.05; max-width: 18ch;
}
.cv__start {
  position: relative; z-index: 1; display: inline-block;
  padding: 15rem 32rem; border: none; border-radius: var(--radius-full);
  background: #fff; color: var(--blue);
  font-family: 'Nunito Sans', var(--font-ui), sans-serif; font-size: 15rem; font-weight: 800;
  letter-spacing: 0.02em; text-transform: uppercase; cursor: pointer;
  box-shadow: var(--co-shadow);
}
@media (hover: hover) { .cv__start:hover { background: var(--co-blue-tint); } }

.cv__content { display: block; }
.cv__sub { margin: 18rem 0 0; font-size: clamp(17rem, 1.8vw, 21rem); line-height: 1.55; color: var(--ink); max-width: 56ch; }

.cv__facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(160rem, 1fr)); gap: 18rem; margin: clamp(26rem, 4vw, 38rem) 0; padding: 20rem 0; border-top: var(--stroke) solid var(--line); border-bottom: var(--stroke) solid var(--line); }
.cv__facts dt { color: var(--muted); margin-bottom: 5rem; }
.cv__facts dd { margin: 0; font-size: 15rem; font-weight: 700; line-height: 1.4; }

.cv__cta { display: flex; flex-wrap: wrap; gap: 12rem; }
.cv__resume { margin: 14rem 0 0; color: var(--muted); }

.cv__panel { margin: clamp(30rem, 4vw, 44rem) 0; padding: clamp(20rem, 2.6vw, 28rem); background: var(--co-surface); border: none; border-radius: var(--radius-l); box-shadow: var(--co-shadow); }
.cv__h { font-family: 'Nunito Sans', var(--font-ui), sans-serif; font-weight: 900; font-size: clamp(20rem, 2.1vw, 24rem); margin: 0 0 10rem; }
.cv__h-sub { font-size: 16rem; font-weight: 700; margin: 0 0 16rem; }
.cv__obj { list-style: none; margin: 0; padding: 0; display: grid; gap: 12rem; }
.cv__obj li { position: relative; padding-left: 22rem; font-size: 16rem; line-height: 1.5; }
.cv__obj li::before { content: ''; position: absolute; left: 4rem; top: 8rem; width: 7rem; height: 7rem; border-radius: 50%; background: var(--blue); }

.cv__h2 { font-family: 'Nunito Sans', var(--font-ui), sans-serif; font-weight: 900; letter-spacing: -0.01em; font-size: clamp(22rem, 2.6vw, 30rem); margin: clamp(30rem, 4vw, 44rem) 0 14rem; }
.cv__why p, .cv__body { font-size: 16.5rem; line-height: 1.7; max-width: var(--measure-body); margin: 0 0 1em; color: var(--ink); }

/* ── Contents ──────────────────────────────────────────────────────── */
.ct__title { font-size: clamp(32rem, 4.6vw, 60rem); margin: 0; }
.ct__deck { margin: 16rem 0 clamp(28rem, 4vw, 40rem); font-family: 'Nunito Sans', var(--font-reading); font-size: 16.5rem; line-height: 1.65; color: var(--muted); max-width: var(--measure-body); }

.ct__modules { list-style: none; margin: 0; padding: 0; display: grid; gap: 16rem; }
.cm { border: none; border-radius: var(--radius-l); background: var(--co-surface); overflow: hidden; box-shadow: var(--co-shadow); }
.cm__head { display: grid; grid-template-columns: 40rem minmax(0, 1fr); gap: 14rem; padding: 16rem 18rem 12rem; align-items: start; }
.cm__n { color: var(--muted); font-size: 15rem; padding-top: 4rem; }
.cm__title { font-size: clamp(18rem, 2vw, 23rem); margin: 0 0 5rem; }
.cm__meta { margin: 0; color: var(--muted); }
.cm__bar { grid-column: 1 / -1; height: 6rem; background: var(--paper-3); border-radius: 999rem; overflow: hidden; margin-top: 6rem; }
.cm__bar-fill { display: block; height: 100%; transition: width var(--dur-mid) var(--ease-out); }
.cm__intro { margin: 0; padding: 0 18rem 14rem; font-size: 14.5rem; line-height: 1.6; color: var(--muted); max-width: 72ch; }

.cm__lessons { list-style: none; margin: 0; padding: 0; border-top: var(--stroke) solid var(--line); }
.cl {
  display: grid; grid-template-columns: 30rem minmax(0, 1fr) auto 16rem; gap: 14rem; align-items: start;
  width: 100%; text-align: left; padding: 13rem 18rem;
  border-bottom: var(--stroke) solid var(--line);
  transition: background var(--dur-fast) var(--ease-out);
}
.cm__lessons li:last-child .cl { border-bottom: 0; }
@media (hover: hover) { .cl:hover { background: var(--co-blue-tint); } }
.cl__icon {
  width: 30rem; height: 30rem; border-radius: var(--radius-s);
  display: flex; align-items: center; justify-content: center;
  background: var(--co-blue-tint); color: var(--blue); margin-top: 1rem;
}
.cl.is-done .cl__icon { background: var(--blue); color: #fff; }
.cl__body { display: grid; gap: 3rem; min-width: 0; }
.cl__title { font-size: 15.5rem; font-weight: 600; }
.cl__summary { font-size: 13.5rem; line-height: 1.5; color: var(--muted); }
.cl:hover .cl__summary { color: inherit; opacity: 0.75; }
.cl__min { color: var(--muted); white-space: nowrap; padding-top: 6rem; }
.cl:hover .cl__min { color: inherit; opacity: 0.75; }
.cl__dot {
  width: 16rem; height: 16rem; margin-top: 6rem; border-radius: 50%;
  border: var(--stroke) solid var(--line); background: transparent;
}
.cl.is-done .cl__dot { background: var(--blue); border-color: var(--blue); }

.ct__h2 { font-family: 'Nunito Sans', var(--font-ui), sans-serif; font-weight: 900; letter-spacing: -0.01em; font-size: clamp(22rem, 2.6vw, 30rem); margin: clamp(34rem, 5vw, 52rem) 0 10rem; }
.ct__note { margin: 0 0 18rem; font-size: 14.5rem; color: var(--muted); max-width: 62ch; }
.ct__scroll { overflow-x: auto; border: var(--stroke) solid var(--line); border-radius: var(--radius-m); }
.ct__table { border-collapse: collapse; width: 100%; min-width: 560rem; }
.ct__table th, .ct__table td { text-align: left; padding: 11rem 13rem; font-size: 14rem; line-height: 1.45; border-bottom: var(--stroke) solid var(--line); vertical-align: top; }
.ct__table thead th { background: var(--blue); color: #fff; font-family: 'Nunito Sans', var(--font-ui), sans-serif; font-size: 11.5rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.ct__table tr.is-break td { background: var(--paper-2); color: var(--muted); font-style: italic; }
.ct__table tr.is-assessment td, .ct__table tr.is-capstone td { background: var(--co-blue-tint); }
.ct__out { color: var(--muted); }
.ct__ends { display: flex; flex-wrap: wrap; gap: 12rem; margin-top: clamp(26rem, 4vw, 38rem); }

/* ── Lesson ────────────────────────────────────────────────────────── */
/* The lesson banner: a flat colour block behind the title, the same device
   Rise uses to mark the start of a new lesson — with an eyebrow, a bold
   title, and a short accent rule underneath. */
.ls__head {
  position: relative; margin-bottom: clamp(18rem, 2.4vw, 26rem);
  padding: clamp(22rem, 3.4vw, 34rem) clamp(20rem, 3vw, 32rem) clamp(28rem, 4vw, 40rem);
  background: var(--co-blue-tint); border-radius: var(--radius-l);
}
.ls__crumb { margin: 0 0 10rem; text-align: right; color: var(--muted); }
.ls__title { font-family: 'Nunito Sans', var(--font-ui), sans-serif; font-weight: 900; letter-spacing: -0.01em; font-size: clamp(26rem, 3.6vw, 40rem); line-height: 1.08; margin: 0; }
.ls__rule { display: block; width: 64rem; height: 4rem; margin-top: 16rem; background: var(--ink); }
.ls__meta { margin: 12rem 0 clamp(24rem, 3.4vw, 34rem); color: var(--muted); }

.ls__obj { margin-bottom: clamp(26rem, 3.4vw, 36rem); padding: clamp(18rem, 2.4vw, 26rem); background: var(--co-surface); border: none; border-radius: var(--radius-l); box-shadow: var(--co-shadow); }
.ls__intro { margin: 0 0 18rem; font-family: 'Nunito Sans', var(--font-reading); font-size: 16.5rem; line-height: 1.65; }
.ls__obj-h { font-family: 'Nunito Sans', var(--font-ui), sans-serif; font-weight: 900; font-size: 18rem; margin: 0 0 8rem; }
.ls__obj-sub { font-size: 15rem; font-weight: 700; margin: 0 0 12rem; }
.ls__obj ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 9rem; }
.ls__obj li { position: relative; padding-left: 22rem; font-size: 15rem; line-height: 1.5; }
.ls__obj li::before { content: ''; position: absolute; left: 4rem; top: 7rem; width: 7rem; height: 7rem; border-radius: 50%; background: var(--blue); }

.ls__ext { margin-top: clamp(28rem, 4vw, 40rem); padding: clamp(18rem, 2.4vw, 24rem); border: var(--stroke) dashed var(--ink); border-radius: var(--radius-m); }
.ls__ext-kicker { margin: 0 0 8rem; color: var(--muted); }
.ls__ext h3 { margin: 0 0 8rem; font-size: 17rem; }
.ls__ext p { margin: 0; font-size: 14.5rem; line-height: 1.6; color: var(--muted); max-width: 66ch; }

.ls__foot { margin-top: clamp(34rem, 5vw, 52rem); padding-top: 22rem; border-top: var(--stroke) solid var(--line); }
.ls__gate { margin: 0 0 14rem; color: var(--muted); }
.ls__nav { display: flex; flex-wrap: wrap; gap: 12rem; justify-content: space-between; }

/* ── Assessments ───────────────────────────────────────────────────── */
.as__eyebrow, .cp__eyebrow { margin: 0 0 14rem; color: var(--muted); }
.as__title, .cp__title, .rs__title { font-size: clamp(30rem, 4.4vw, 54rem); margin: 0; }
.as__deck, .cp__deck, .rs__deck { margin: 16rem 0 26rem; font-family: 'Nunito Sans', var(--font-reading); font-size: 16.5rem; line-height: 1.65; color: var(--muted); max-width: var(--measure-body); }
.as__score { margin: 0 0 18rem; color: var(--muted); }
.as__foot { margin-top: 30rem; }

/* ── Capstone ──────────────────────────────────────────────────────── */
.cp__parts { list-style: none; margin: 0 0 clamp(30rem, 4vw, 44rem); padding: 0; display: grid; gap: 16rem; }
.cp__parts li { display: grid; grid-template-columns: 44rem minmax(0, 1fr); gap: 14rem; padding: 18rem; border: none; border-radius: var(--radius-m); background: var(--co-surface); box-shadow: var(--co-shadow); }
.cp__n { color: var(--muted); font-size: 15rem; }
.cp__parts h2 { margin: 0 0 8rem; font-size: 17.5rem; }
.cp__parts p { margin: 0; font-size: 15rem; line-height: 1.6; color: var(--muted); }
.cp__h2 { font-family: 'Nunito Sans', var(--font-ui), sans-serif; font-weight: 900; letter-spacing: -0.01em; font-size: clamp(20rem, 2.4vw, 26rem); margin: 0 0 8rem; }
.cp__note { margin: 0 0 16rem; font-size: 14.5rem; color: var(--muted); }
.cp__scroll { overflow-x: auto; border: var(--stroke) solid var(--line); border-radius: var(--radius-m); margin-bottom: clamp(26rem, 4vw, 36rem); }
.cp__table { border-collapse: collapse; width: 100%; min-width: 700rem; }
.cp__table th, .cp__table td { text-align: left; padding: 11rem 13rem; font-size: 13.5rem; line-height: 1.5; border-bottom: var(--stroke) solid var(--line); vertical-align: top; }
.cp__table thead th { background: var(--blue); color: #fff; font-family: 'Nunito Sans', var(--font-ui), sans-serif; font-size: 11.5rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.cp__table tbody th { background: var(--paper-2); font-weight: 700; }
.cp__foot { margin-top: clamp(30rem, 4vw, 44rem); padding-top: 24rem; border-top: var(--stroke) solid var(--line); }
.cp__done { margin: 0 0 18rem; font-family: 'Nunito Sans', var(--font-ui), sans-serif; font-weight: 900; font-size: 22rem; }
.cp__links { display: flex; flex-wrap: wrap; gap: 12rem; }

@media (prefers-reduced-motion: reduce) {
  .co__progress-fill, .cm__bar-fill { transition: none; }
}
</style>

<style>
/* Unscoped on purpose: .ticket is defined once in the site's global stylesheet
   and used by every course component (Check, Interactions, Descent, this page
   itself) — a scoped block here could never reach a button rendered inside a
   child component, since Vue's scoping attribute belongs to whichever
   component rendered the element, not to this page. Keyed by the real DOM
   ancestor `.co` instead, so it only ever applies inside the course. */
.co .ticket,
.co .px-btn,
.co .glass-btn {
  background: var(--blue);
  border-color: var(--blue);
  box-shadow: var(--co-shadow, none);
}
@media (hover: hover) {
  .co .ticket:not(:disabled):hover,
  .co .px-btn:not(:disabled):hover,
  .co .glass-btn:not(:disabled):hover {
    background: var(--co-blue-dark, #0F52A0);
    border-color: var(--co-blue-dark, #0F52A0);
  }
}
.co .ticket--ghost,
.co .glass-btn--ghost,
.co .px-btn--ghost {
  background: transparent;
  color: var(--blue);
  border-color: var(--blue);
  box-shadow: none;
}
@media (hover: hover) {
  .co .ticket--ghost:not(:disabled):hover,
  .co .glass-btn--ghost:not(:disabled):hover,
  .co .px-btn--ghost:not(:disabled):hover {
    background: var(--co-blue-tint, #EAF2FC);
    color: var(--blue);
    border-color: var(--blue);
  }
}
</style>
