<script setup lang="ts">
import gsap from 'gsap'
import { useExperienceStore } from '~/stores/experience'
import SoundEngine from '~/experience/SoundEngine'

const emit = defineEmits<{ (e: 'entered'): void }>()

const experienceStore = useExperienceStore()
const isReady         = computed(() => experienceStore.isReady)
const entering        = ref(false)

const loaderEl = ref<HTMLElement | null>(null)
const anchorEl = ref<HTMLElement | null>(null)
const padEl    = ref<HTMLElement | null>(null)
const barEls   = ref<HTMLElement[]>([])

// [centerWidth, centerHeight, btnWidth, btnHeight, centerY, btnYOffset, btnXOffset]
// btnXOffset is the x adjustment from anchor-center due to left-alignment + bar width
const BARS = [
  { cw: 64, ch: 5, bw: 22, bh: 2.5, cy: -22, by: -8.5, bx: 0  },  // top (full width)
  { cw: 44, ch: 5, bw: 14, bh: 2.5, cy: 0,   by: 0,    bx: -4 },  // mid (shorter = E)
  { cw: 64, ch: 5, bw: 22, bh: 2.5, cy: 22,  by: 8.5,  bx: 0  },  // bot (full width)
]

let idleTween:   gsap.core.Tween    | null = null
let assemblyTl:  gsap.core.Timeline | null = null

const reduceMotion = import.meta.client &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function setBarEl(el: any, i: number) { if (el) barEls.value[i] = el }

onMounted(() => {
  // Seed the E formation at screen centre.
  barEls.value.forEach((el, i) => {
    gsap.set(el, {
      xPercent: -50, yPercent: -50,
      x: reduceMotion ? 0 : -160,
      y: BARS[i].cy,
      width: BARS[i].cw, height: BARS[i].ch,
      borderRadius: '3rem',
      opacity: 0
    })
  })

  // Reduced motion: a calm fade-in, no slide, no idle pulse.
  if (reduceMotion) {
    gsap.to(barEls.value, { opacity: 1, duration: 0.4, ease: 'power1.out' })
    return
  }

  assemblyTl = gsap.timeline({
    onComplete: () => {
      assemblyTl = null
      idleTween = gsap.to(barEls.value[0], {
        scaleX: 1.06, duration: 1.1, ease: 'sine.inOut', repeat: -1, yoyo: true
      })
    }
  })

  barEls.value.forEach((el, i) => {
    assemblyTl!.to(el, {
      x: 0, opacity: 1,
      duration: 0.75, ease: 'back.out(1.6)'
    }, i * 0.1)
  })
})

onUnmounted(() => {
  assemblyTl?.kill()
  idleTween?.kill()
})

watch(isReady, (ready) => {
  if (ready) setTimeout(() => enter(), 700)
})

function enter() {
  if (entering.value || !anchorEl.value) return
  entering.value = true

  SoundEngine.init()
  SoundEngine.getInstance()?.unlock()

  assemblyTl?.kill()
  assemblyTl = null
  idleTween?.kill()

  // Snap bars to their final E-formation state before flying
  barEls.value.forEach((el, i) => {
    gsap.set(el, {
      x: 0, y: BARS[i].cy,
      width: BARS[i].cw, height: BARS[i].ch,
      scaleX: 1, opacity: 1
    })
  })

  // Compute where the real button lives (anchor mirrors the e-btn position exactly)
  const rect = anchorEl.value.getBoundingClientRect()
  const cx = rect.left + rect.width  / 2 - window.innerWidth  / 2
  const cy = rect.top  + rect.height / 2 - window.innerHeight / 2

  // The bar colour on the live button (dark foreground on the white pill).
  const root = getComputedStyle(document.documentElement)
  const barColor = root.getPropertyValue('--color-black').trim() || '#0D0C0A'

  // Reduced motion: no fly. Reveal the experience and cross-fade the overlay.
  if (reduceMotion) {
    experienceStore.setHasEntered()
    gsap.timeline({ onComplete: () => emit('entered') })
      .to(loaderEl.value, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.4 }, 0)
      .to(barEls.value, { opacity: 0, duration: 0.3 }, 0.1)
    return
  }

  const tl = gsap.timeline({ onComplete: () => emit('entered') })

  // Fly each bar to its slot inside the button
  barEls.value.forEach((el, i) => {
    const b = BARS[i]
    tl.to(el, {
      x: cx + b.bx,
      y: cy + b.by,
      width: b.bw, height: b.bh,
      borderRadius: '1.5rem',
      duration: 0.75, ease: 'power3.inOut'
    }, 0.1 + i * 0.04)
  })

  // Bloom the white pill behind the bars as they land — this IS the button's
  // visual, so the handoff to the real Menu component is seamless.
  if (padEl.value) {
    gsap.set(padEl.value, { xPercent: -50, yPercent: -50, x: cx, y: cy, scale: 0, opacity: 0 })
    tl.to(padEl.value, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.6)' }, 0.6)
  }
  // Bars darken from cream-on-bg to dark-on-pill to match the live button.
  tl.to(barEls.value, { backgroundColor: barColor, duration: 0.35, ease: 'power2.out' }, 0.62)

  // Fade the loader background, reveal the WebGL canvas beneath
  tl.add(() => {
    experienceStore.setHasEntered()
    gsap.to(loaderEl.value, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.55, ease: 'power2.out' })
  }, 0.95)

  // Cross-fade the morph overlay out, leaving the identical real button.
  tl.to([padEl.value, ...barEls.value], { opacity: 0, duration: 0.35, ease: 'power2.in' }, 1.35)
}
</script>

<template>
  <div ref="loaderEl" class="eloader">
    <!-- White pill that blooms in behind the bars as they land -->
    <span ref="padEl" class="epad"></span>

    <span
      v-for="i in 3"
      :key="'bar-' + i"
      :ref="(el: any) => setBarEl(el, i - 1)"
      class="ebar"
    ></span>

    <!-- Invisible anchor that mirrors the e-btn position for landing calculation -->
    <span ref="anchorEl" class="eanchor"></span>
  </div>
</template>

<style scoped>
.eloader {
  position: fixed;
  inset: 0;
  z-index: var(--z-loader);
  background: var(--color-bg);
  overflow: hidden;
}
.ebar {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 2;
  background: var(--color-text);
  border-radius: 3rem;
  will-change: transform, width, height;
  pointer-events: none;
}
.epad {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 1;
  width: var(--chrome-size);
  height: var(--chrome-size);
  border-radius: 50%;
  background: var(--color-white);
  opacity: 0;
  pointer-events: none;
}
.eanchor {
  position: fixed;
  right: calc(var(--chrome-offset) + var(--safe-right));
  top: calc(var(--chrome-offset) + var(--safe-top));
  width: var(--chrome-size);
  height: var(--chrome-size);
  opacity: 0;
  pointer-events: none;
}
</style>
