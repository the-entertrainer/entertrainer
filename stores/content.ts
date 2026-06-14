import { defineStore } from 'pinia'
import projectsData from '~/content/projects.json'

export interface Project {
  title: string
  slug: string
  year: number
  shortDescription: string
  color: string
}

export const useContentStore = defineStore('content', {
  state: () => ({
    projects: projectsData as Project[],
    email: 'hello@example.com',
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com' },
      { platform: 'behance', url: 'https://behance.net' },
      { platform: 'linkedin', url: 'https://linkedin.com' }
    ]
  }),
  getters: {
    getProjectBySlug: (state) => {
      return (slug: string) => state.projects.find((p) => p.slug === slug)
    }
  }
})
