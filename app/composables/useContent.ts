import { site, type SiteData, type SectionContent } from '~/content/site'

/**
 * Returns the single site content object. SSR-safe (pure data import).
 */
export function useContent(): SiteData {
  return site
}

export type { SectionContent }
