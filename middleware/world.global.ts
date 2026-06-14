import { useExperienceStore } from '~/stores/experience'
import { useHomeViewStore } from '~/stores/homeview'

// Hide the spiral when leaving home; reveal it again when returning.
export default defineNuxtRouteMiddleware((to, from) => {
  if (process.server) return

  const experienceStore = useExperienceStore()
  const homeViewStore = useHomeViewStore()
  const world = experienceStore.experience?.world

  if (!world) return

  // Leaving home → hide projects
  if (from.path === '/' && to.path !== '/') {
    world.hideProjects()
  }

  // Returning to home (in spiral mode) → reveal after a short delay
  if (to.path === '/' && from.path !== '/' && homeViewStore.mode === 'spiral') {
    setTimeout(() => {
      experienceStore.experience?.world?.revealProjects()
    }, 300)
  }
})
