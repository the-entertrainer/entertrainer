import { isUnlistedCatalogPath } from '~/content/visibility'

/**
 * Unlisted catalog URLs stay reachable. They carry noindex.
 * Listed routes set an explicit index tag so a previous noindex
 * does not stick across client navigations.
 * A page may still set a stricter robots tag after this runs.
 */
export default defineNuxtRouteMiddleware((to) => {
  useSeoMeta({
    robots: isUnlistedCatalogPath(to.path) ? 'noindex' : 'index, follow',
  })
})
