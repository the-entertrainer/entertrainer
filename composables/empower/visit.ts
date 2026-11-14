import { onMounted } from 'vue'
import { toolBySlug } from '~/utils/empower/catalog'
import { touchRecent } from '~/utils/empower/db'

export function useEmpowerVisit(slug: string) {
  onMounted(async () => {
    const tool = toolBySlug(slug)
    if (!tool) return
    await touchRecent({ id: tool.slug, title: tool.title, href: tool.href })
    document.documentElement.dataset.empowerRecent = slug
  })
}
