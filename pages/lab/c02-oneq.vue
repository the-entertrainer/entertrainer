<script setup lang="ts">
import { LAB_NAV, CONCEPTS } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: '02 One Question', robots: 'noindex' })
const C = CONCEPTS[1]

/**
 * Hick's Law: T = b·log₂(n+1). Four simultaneous choices costs log₂(5) ≈ 2.32
 * bits; two choices costs log₂(3) ≈ 1.58, and two of those in sequence still
 * lands under a single four-way decision. So the homepage never shows more
 * than two options — it asks, then asks again. It also reads like the opening
 * of a real scoping call, which is the pitch.
 */
type Node = { q: string; a: [Opt, Opt] }
type Opt = { label: string; sub: string; go?: string; next?: Node }

const leaf = (i: number) => ({ label: LAB_NAV[i].label, sub: LAB_NAV[i].desc, go: LAB_NAV[i].href })

const ROOT: Node = {
  q: 'What brought you here?',
  a: [
    { label: 'Sizing someone up', sub: 'You want to know if I can do the work.',
      next: { q: 'Proof or process?', a: [leaf(2), leaf(1)] } },
    { label: 'Looking for something useful', sub: 'You came for a tool or a story.',
      next: { q: 'Take something, or read something?', a: [leaf(3), leaf(0)] } }
  ]
}

const node = ref<Node>(ROOT)
const trail = ref<string[]>([])
const router = useRouter()

function choose(o: Opt) {
  if (o.go) { router.push(o.go); return }
  if (o.next) { trail.value = [...trail.value, o.label]; node.value = o.next }
}
function back() {
  trail.value = trail.value.slice(0, -1)
  node.value = ROOT   // one level deep, so root is always the way back
}
/** Decision cost in bits for the number of options on screen. */
const bits = computed(() => Math.log2(2 + 1).toFixed(2))
</script>

<template>
  <LabShell bg="#FBF7F0" ink="#16181D" pop="#2B59FF" display="'Fraunces',Georgia,serif" :law="C.law">
    <div class="q">
      <header class="q__head">
        <p class="q__kick">Naveen Jose — instructional designer</p>
        <div class="q__crumbs" v-if="trail.length">
          <button class="q__crumb" @click="back">← {{ trail[trail.length - 1] }}</button>
        </div>
      </header>

      <Transition name="q" mode="out-in">
        <section :key="node.q" class="q__stage">
          <h1 class="q__q">{{ node.q }}</h1>
          <div class="q__opts">
            <button v-for="o in node.a" :key="o.label" class="q__opt" @click="choose(o)">
              <span class="q__ol">{{ o.label }}</span>
              <span class="q__os">{{ o.sub }}</span>
              <span class="q__oa" aria-hidden="true">{{ o.go ? '↗' : '→' }}</span>
            </button>
          </div>
        </section>
      </Transition>

      <p class="q__meter">Two options on screen · decision cost ≈ <b>{{ bits }}</b> bits</p>
    </div>
  </LabShell>
</template>

<style scoped>
.q { position: absolute; inset: 0; display: grid; place-content: center; padding: 60rem 22rem 74rem; }
.q__head { position: absolute; top: 46rem; left: 0; right: 0; text-align: center; }
.q__kick { margin: 0; font-family: 'DM Sans', sans-serif; font-size: 10.5rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-45); }
.q__crumbs { margin-top: 12rem; }
.q__crumb { font-family: 'DM Sans', sans-serif; font-size: 12rem; color: var(--ink-70); background: none; border: 0; cursor: pointer; padding: 4rem 8rem; border-radius: 6rem; }
.q__crumb:hover { background: var(--ink-15); }
.q__crumb:focus-visible { outline: 2px solid var(--pop); outline-offset: 2px; }

.q__stage { width: min(680rem, 92vw); text-align: center; }
.q__q { margin: 0 0 30rem; font-size: clamp(30rem, 5.4vw, 58rem); line-height: 1.05; letter-spacing: -0.025em; font-weight: 400; }
.q__opts { display: grid; gap: 12rem; grid-template-columns: repeat(auto-fit, minmax(240rem, 1fr)); }
.q__opt {
  position: relative; display: grid; gap: 6rem; text-align: left;
  padding: 22rem 46rem 22rem 22rem; min-height: 108rem;
  background: #fff; border: 1px solid var(--ink-15); border-radius: 16rem; cursor: pointer;
  transition: border-color 180ms ease, transform 180ms cubic-bezier(.2,.8,.2,1), box-shadow 180ms ease;
}
.q__opt:hover { border-color: var(--pop); transform: translateY(-3rem); box-shadow: 0 14rem 30rem -18rem rgba(20,24,40,0.6); }
.q__opt:focus-visible { outline: 2px solid var(--pop); outline-offset: 3px; }
.q__ol { font-family: 'Fraunces', serif; font-size: 20rem; }
.q__os { font-family: 'DM Sans', sans-serif; font-size: 12.5rem; line-height: 1.5; color: var(--ink-70); }
.q__oa { position: absolute; right: 20rem; top: 22rem; color: var(--pop); font-size: 15rem; }

.q__meter { position: absolute; left: 0; right: 0; bottom: 46rem; margin: 0; text-align: center; font-family: 'DM Sans', sans-serif; font-size: 11rem; color: var(--ink-45); }
.q__meter b { color: var(--pop); font-variant-numeric: tabular-nums; }

/* 260ms — inside the 200–500ms band where UI motion reads as intentional. */
.q-enter-active, .q-leave-active { transition: opacity 260ms ease, transform 260ms cubic-bezier(.2,.8,.2,1); }
.q-enter-from { opacity: 0; transform: translateY(14rem); }
.q-leave-to { opacity: 0; transform: translateY(-10rem); }
@media (prefers-reduced-motion: reduce) {
  .q-enter-active, .q-leave-active { transition: opacity 120ms ease; }
  .q-enter-from, .q-leave-to { transform: none; }
  .q__opt { transition: none; }
}
</style>
