/**
 * Entertrainer route motion (the sun curtain).
 *
 * On every route change between chrome pages, flag <html> with `dp-turning`
 * for one wipe (the "ink pull" band in dawn.css), and refresh ScrollTrigger
 * once the new page has painted, if a page has loaded it. GSAP itself is
 * never imported here; pages load it through useMotion() when they need it.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  let timer: ReturnType<typeof setTimeout> | undefined

  // The sun curtain opens from wherever the reader clicked.
  window.addEventListener('pointerdown', (e) => {
    const html = document.documentElement
    html.style.setProperty('--wipe-x', `${Math.round(e.clientX)}px`)
    html.style.setProperty('--wipe-y', `${Math.round(e.clientY)}px`)
  }, { passive: true })

  router.beforeEach((to, from) => {
    if (!from.name || to.path === from.path) return
    markFreshStage()
    const html = document.documentElement
    if (motionLevel() === 'off') return
    html.classList.remove('dp-turning')
    // Force a reflow so the animation restarts on quick successive clicks.
    void html.offsetWidth
    html.classList.add('dp-turning')
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => html.classList.remove('dp-turning'), 700)
    // Hold the route until the sun covers the page, so the swap is never seen.
    if (motionLevel() === 'full') return new Promise<void>((resolve) => setTimeout(resolve, 280))
  })

  nuxtApp.hook('page:finish', () => {
    requestAnimationFrame(() => refreshMotion())
  })
})
