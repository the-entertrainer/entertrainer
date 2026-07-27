import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default defineNuxtPlugin((nuxtApp) => {
  gsap.registerPlugin(ScrollTrigger)

  const lenis = new Lenis({
    gestureOrientation: 'vertical',
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    autoRaf: false,
    autoResize: true
  })

  // Drive Lenis via the GSAP ticker for frame-perfect sync
  const raf = (time: number) => {
    lenis.raf(time * 1000)
  }
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  // ScrollTrigger has to be told that Lenis, not the browser, owns the scroll
  // position — otherwise every pinned section reads a stale offset and the
  // pins drift a frame behind the content they are pinning.
  lenis.on('scroll', ScrollTrigger.update)
  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value) {
      if (arguments.length && typeof value === 'number') lenis.scrollTo(value, { immediate: true })
      return lenis.scroll
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
    }
  })

  nuxtApp.hook('app:beforeMount', () => {
    lenis.resize()
  })

  // Refresh on route change — and snap to the top so a previous page's scroll
  // depth (e.g. the About page's 500vh verse intro) never bleeds into the next
  // route. Without this, returning to the fixed-viewport home leaves Lenis
  // parked at a stale offset and the spiral renders in a broken scroll state.
  nuxtApp.hook('page:finish', () => {
    lenis.resize()
    lenis.scrollTo(0, { immediate: true, force: true })
    // Pinned sections measure themselves on creation, so a route swap has to
    // re-measure or the new page inherits the old page's trigger positions.
    ScrollTrigger.refresh()
  })

  return {
    provide: {
      lenis
    }
  }
})
