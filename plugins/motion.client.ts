/**
 * Dawn Press route motion.
 *
 * On every route change between chrome pages, flag <html> with `dp-turning`
 * for one wipe (the "ink pull" band in dawn.css), and refresh ScrollTrigger
 * once the new page has painted, if a page has loaded it. GSAP itself is
 * never imported here; pages load it through useMotion() when they need it.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  let timer: ReturnType<typeof setTimeout> | undefined

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
    timer = setTimeout(() => html.classList.remove('dp-turning'), 620)
  })

  nuxtApp.hook('page:finish', () => {
    requestAnimationFrame(() => refreshMotion())
  })
})
