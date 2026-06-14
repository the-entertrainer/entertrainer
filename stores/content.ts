import { defineStore } from 'pinia'
import nav from '~/content/navigation.json'
import type { NavItem } from '~/types/nav'

export type { NavItem }

export const useContentStore = defineStore('content', {
  state: () => ({
    nav: nav as Record<string, NavItem[]>,
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
    homeNav:      (state): NavItem[] => state.nav.home      ?? [],
    aboutNav:     (state): NavItem[] => state.nav.about     ?? [],
    toolsNav:     (state): NavItem[] => state.nav.tools     ?? [],
    downloadsNav: (state): NavItem[] => state.nav.downloads ?? []
  }
})
