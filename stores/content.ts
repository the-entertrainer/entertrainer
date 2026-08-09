import { defineStore } from 'pinia'
import nav from '~/content/navigation.json'
import panelData from '~/content/panels.json'
import type { NavItem } from '~/types/nav'
import type { Panel } from '~/types/panel'

export type { NavItem }

export const useContentStore = defineStore('content', {
  state: () => ({
    nav: nav as Record<string, NavItem[]>,
    /** The flat destination list. No sections, no categories — every page the
     *  home is responsible for, in reading order. */
    panels: panelData.panels as Panel[],
    name: 'Naveen Jose',
    brand: 'Entertrainer',
    tagline: 'Certified Instructional Design Specialist',
    yearsExperience: '4.0+',
    email: 'iamnaveenjose@outlook.com',
    socialLinks: [
      { platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/entertrainer' },
      { platform: 'email',    label: 'Email',    url: 'mailto:iamnaveenjose@outlook.com' }
    ]
  }),
  getters: {
    homeNav:                 (state): NavItem[] => state.nav.home                    ?? [],
    aboutNav:                (state): NavItem[] => state.nav.about                   ?? [],
    toolsNav:                (state): NavItem[] => state.nav.tools                   ?? [],
    myWorkNav:               (state): NavItem[] => state.nav['my-work']              ?? [],
    instructionalDesignNav:  (state): NavItem[] => state.nav['instructional-design'] ?? []
  }
})
