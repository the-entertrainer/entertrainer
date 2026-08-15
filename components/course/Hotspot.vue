<script setup lang="ts">
/**
 * The real Rise 360 "labeled graphic" — numbered pins over an actual diagram,
 * each revealing its caption on click. The `labeled` block in Block.vue is a
 * deliberate accessibility-first substitute (a plain description list); this
 * is the diagram itself, for the modules where a real picture earns its keep.
 *
 * The four diagrams below are hand-drawn flat SVG, not generated raster art —
 * each needs to be geometrically *correct* (a real tape/head/rule-table, a
 * real layered network), which is a job for precise vector shapes, not an
 * image model. All four share one 400×225 viewBox so pin percentages line up
 * with the drawing underneath regardless of which diagram is showing.
 *
 * Same rule as the accordion and flashcards: you click before you see the
 * caption. A diagram with every label already printed on it is a poster, not
 * something a reader explores.
 */
const props = defineProps<{
  diagram: 'tape-machine' | 'neural-net' | 'token-pipeline' | 'four-modes'
  caption: string
  points: { x: number; y: number; label: string; body: string }[]
}>()

const active = ref<number | null>(null)
const seen = reactive<Set<number>>(new Set())
function select(i: number) {
  active.value = i
  seen.add(i)
}
</script>

<template>
  <figure class="hs">
    <figcaption class="t-mono hs__cap">{{ caption }}</figcaption>

    <div class="hs__stage">
      <svg viewBox="0 0 400 225" class="hs__art" aria-hidden="true">
        <!-- ── Tape machine: an endless tape, a head, a small rule table ── -->
        <g v-if="diagram === 'tape-machine'">
          <g v-for="i in 11" :key="i">
            <rect :x="25 + (i - 1) * 32" y="97" width="30" height="30"
                  :fill="[2, 5, 8].includes(i - 1) ? 'var(--ink)' : 'var(--paper)'"
                  stroke="var(--ink)" stroke-width="2" />
          </g>
          <path d="M 200 70 L 215 92 L 185 92 Z" fill="var(--blue)" stroke="var(--ink)" stroke-width="2" />
          <line x1="200" y1="92" x2="200" y2="97" stroke="var(--ink)" stroke-width="2" />
          <rect x="140" y="150" width="120" height="55" rx="3" fill="var(--paper)" stroke="var(--ink)" stroke-width="2" />
          <line x1="140" y1="168" x2="260" y2="168" stroke="var(--line)" stroke-width="2" />
          <line x1="140" y1="186" x2="260" y2="186" stroke="var(--line)" stroke-width="2" />
        </g>

        <!-- ── Neural net: input / hidden / output layers, one weighted
             edge picked out, a bias unit, one node marked as active ── -->
        <g v-else-if="diagram === 'neural-net'">
          <!-- input → hidden -->
          <template v-for="iy in [50, 112, 175]" :key="`row-${iy}`">
            <line v-for="hy in [30, 85, 140, 195]" :key="`i${iy}h${hy}`"
                  x1="60" :y1="iy" x2="200" :y2="hy" stroke="var(--line)" stroke-width="1.5" />
          </template>
          <!-- hidden → output -->
          <template v-for="hy in [30, 85, 140, 195]" :key="`row2-${hy}`">
            <line v-for="oy in [75, 150]" :key="`h${hy}o${oy}`"
                  x1="200" :y1="hy" x2="340" :y2="oy" stroke="var(--line)" stroke-width="1.5" />
          </template>
          <!-- the one weighted edge, picked out -->
          <line x1="60" y1="50" x2="200" y2="30" stroke="var(--blue)" stroke-width="4" stroke-linecap="round" />
          <!-- bias unit, feeding the hidden layer from below -->
          <rect x="185" y="203" width="30" height="16" rx="2" fill="var(--paper)" stroke="var(--ink)" stroke-width="2" />
          <line x1="200" y1="203" x2="200" y2="195" stroke="var(--ink)" stroke-width="2" />
          <!-- layers -->
          <circle v-for="iy in [50, 112, 175]" :key="`in${iy}`" cx="60" :cy="iy" r="13" fill="var(--paper)" stroke="var(--ink)" stroke-width="2.5" />
          <circle v-for="hy in [30, 85, 140, 195]" :key="`hd${hy}`" cx="200" :cy="hy" r="13" fill="var(--paper)" stroke="var(--ink)" stroke-width="2.5" />
          <circle v-for="oy in [75, 150]" :key="`ou${oy}`" cx="340" :cy="oy" r="13" fill="var(--paper)" stroke="var(--ink)" stroke-width="2.5" />
          <!-- activation, marked on one hidden node with a small curve -->
          <circle cx="200" cy="85" r="13" fill="var(--yellow)" stroke="var(--ink)" stroke-width="2.5" />
          <path d="M 193 89 Q 197 80 200 85 T 207 81" fill="none" stroke="var(--ink)" stroke-width="1.6" stroke-linecap="round" />
        </g>

        <!-- ── Token pipeline: text → tokens → embeddings → layers → prediction ── -->
        <g v-else-if="diagram === 'token-pipeline'">
          <rect x="31" y="92" width="50" height="40" rx="2" fill="var(--paper)" stroke="var(--ink)" stroke-width="2" />
          <line x1="39" y1="103" x2="73" y2="103" stroke="var(--line)" stroke-width="2" />
          <line x1="39" y1="112" x2="73" y2="112" stroke="var(--line)" stroke-width="2" />
          <line x1="39" y1="121" x2="60" y2="121" stroke="var(--line)" stroke-width="2" />

          <rect v-for="(x, i) in [105, 117, 129, 141]" :key="`tok${i}`" :x="x" y="97" width="10" height="30" fill="var(--blue)" opacity="0.85" stroke="var(--ink)" stroke-width="1.5" />

          <circle v-for="(pt, i) in [[180,92],[195,92],[210,92],[180,112],[195,112],[210,112],[180,132],[195,132],[210,132]]" :key="`emb${i}`"
                  :cx="pt[0]" :cy="pt[1]" r="3.4" fill="var(--purple)" />

          <rect v-for="(y, i) in [79, 103, 127]" :key="`lay${i}`" x="247" :y="y" width="50" height="16" rx="2" fill="var(--paper)" stroke="var(--ink)" stroke-width="2" />

          <rect x="324" y="92" width="40" height="40" rx="2" fill="var(--red)" stroke="var(--ink)" stroke-width="2" />
          <path d="M 336 116 L 344 104 L 352 116 Z" fill="var(--paper)" />

          <g stroke="var(--ink)" stroke-width="2" marker-end="url(#hs-arrow)">
            <line x1="83" y1="112" x2="102" y2="112" />
            <line x1="153" y1="112" x2="177" y2="112" />
            <line x1="222" y1="112" x2="244" y2="112" />
            <line x1="299" y1="112" x2="321" y2="112" />
          </g>
          <defs>
            <marker id="hs-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--ink)" />
            </marker>
          </defs>
        </g>

        <!-- ── Four modes, converging on one model ── -->
        <g v-else-if="diagram === 'four-modes'">
          <line x1="200" y1="112" x2="200" y2="55" stroke="var(--line)" stroke-width="2" />
          <line x1="200" y1="112" x2="325" y2="112" stroke="var(--line)" stroke-width="2" />
          <line x1="200" y1="112" x2="200" y2="170" stroke="var(--line)" stroke-width="2" />
          <line x1="200" y1="112" x2="75" y2="112" stroke="var(--line)" stroke-width="2" />

          <!-- generative: a shape producing new output -->
          <rect x="175" y="25" width="50" height="28" rx="2" fill="var(--paper)" stroke="var(--ink)" stroke-width="2.5" />
          <line x1="200" y1="25" x2="200" y2="10" stroke="var(--ink)" stroke-width="2.5" marker-end="url(#hs-arrow2)" />

          <!-- multimodal: different shape families clustered -->
          <circle cx="320" cy="100" r="9" fill="var(--blue)" stroke="var(--ink)" stroke-width="2" />
          <rect x="335" y="100" width="16" height="16" fill="var(--green)" stroke="var(--ink)" stroke-width="2" />
          <path d="M 322 128 L 334 128 L 328 116 Z" fill="var(--purple)" stroke="var(--ink)" stroke-width="2" />

          <!-- agentic: an act → observe loop -->
          <circle cx="200" cy="190" r="20" fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-dasharray="4 90" />
          <path d="M 180 190 A 20 20 0 1 1 200 210" fill="none" stroke="var(--ink)" stroke-width="2.5" marker-end="url(#hs-arrow2)" />

          <!-- embodied: a simple body -->
          <rect x="55" y="90" width="20" height="16" rx="6" fill="var(--paper)" stroke="var(--ink)" stroke-width="2.5" />
          <rect x="50" y="106" width="30" height="26" rx="4" fill="var(--paper)" stroke="var(--ink)" stroke-width="2.5" />
          <line x1="58" y1="132" x2="55" y2="150" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round" />
          <line x1="72" y1="132" x2="75" y2="150" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round" />

          <circle cx="200" cy="112" r="24" fill="var(--ink)" />
          <defs>
            <marker id="hs-arrow2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--ink)" />
            </marker>
          </defs>
        </g>
      </svg>

      <button v-for="(pt, i) in points" :key="i" type="button" class="hs__pin"
              :class="{ 'is-active': active === i, 'is-seen': seen.has(i) }"
              :style="{ left: pt.x + '%', top: pt.y + '%' }"
              :aria-expanded="active === i" :aria-label="`Show: ${pt.label}`"
              @click="select(i)">{{ i + 1 }}</button>
    </div>

    <div class="hs__panel" role="status">
      <template v-if="active !== null">
        <p class="hs__label">{{ points[active].label }}</p>
        <p class="hs__body">{{ points[active].body }}</p>
      </template>
      <p v-else class="hs__prompt">Tap a numbered pin to see what it is.</p>
    </div>
  </figure>
</template>

<style scoped>
.hs { margin: clamp(22rem, 3vw, 32rem) 0; border: none; border-radius: var(--radius-l); overflow: hidden; background: var(--co-surface, var(--paper)); box-shadow: var(--co-shadow, none); }
.hs__cap { padding: 14rem 18rem; background: var(--blue); color: #fff; border-bottom: none; }

.hs__stage { position: relative; aspect-ratio: 400 / 225; background: var(--paper-2); }
.hs__art { position: absolute; inset: 0; width: 100%; height: 100%; }

.hs__pin {
  position: absolute; transform: translate(-50%, -50%);
  width: 28rem; height: 28rem; border-radius: 50%;
  border: var(--stroke) solid var(--ink); background: var(--paper); color: var(--ink);
  font-family: var(--font-mono); font-size: 12rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  box-shadow: var(--shadow-sticky);
  transition: background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}
@media (hover: hover) { .hs__pin:hover { transform: translate(-50%, -50%) scale(1.08); } }
.hs__pin.is-seen { background: var(--paper-3); }
.hs__pin.is-active { background: var(--blue); color: #fff; border-color: var(--blue); }

.hs__panel { padding: clamp(16rem, 2.2vw, 22rem); min-height: 88rem; border-top: var(--stroke) solid var(--line); }
.hs__label { margin: 0 0 6rem; font-size: 16rem; font-weight: 700; }
.hs__body { margin: 0; font-size: 14.5rem; line-height: 1.6; color: var(--muted); max-width: 66ch; }
.hs__prompt { margin: 0; color: var(--muted); font-size: 14rem; }
</style>
