/**
 * When the browser draws the route change itself (View Transitions), the Vue
 * page fades would be captured mid-way, so they are switched off there.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server || !('startViewTransition' in document)) return
  to.meta.pageTransition = false
  to.meta.layoutTransition = false
})
