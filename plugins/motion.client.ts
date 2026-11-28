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

  // Phone navigation direction for the app-style slide (brand.css, view transitions).
  const TAB = ['/', '/elevate', '/empower', '/engage', '/about']
  const tabOf = (p: string) => p === '/' ? 0 : TAB.findIndex((t, i) => i > 0 && p.startsWith(t))
  const depth = (p: string) => p.split('/').filter(Boolean).length
  const phone = () => window.matchMedia('(max-width: 860px)').matches

  router.beforeEach((to, from) => {
    if (!from.name || to.path === from.path) return
    markFreshStage()
    const html = document.documentElement
    const dt = depth(to.path) - depth(from.path)
    const ta = tabOf(to.path), fa = tabOf(from.path)
    const root = (p: string) => TAB.includes(p.replace(/\/$/, '') || '/')
    html.dataset.navDir = root(to.path) && root(from.path) && ta !== fa ? (ta > fa ? 'right' : 'left') : dt > 0 ? 'forward' : dt < 0 ? 'back' : (ta >= 0 && fa >= 0 && ta !== fa ? (ta > fa ? 'right' : 'left') : (history.state?.forward === from.fullPath ? 'back' : 'forward'))
    if (motionLevel() === 'off') return
    // Phones get native-style slides from the View Transitions API instead of the curtain.
    if (phone() && 'startViewTransition' in document) return
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
