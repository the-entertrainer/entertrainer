import { sliceWebtoon } from '../../utils/dialogue/sliceWebtoon'
import { comicInfo } from '../../utils/dialogue/comicInfo'
import { FORMATS } from '../../utils/dialogue/formats'

export function useDialogueExport() {
  return {
    sliceWebtoon,
    comicInfo,
    formats: FORMATS,
    async runBrowserExport(kind: string) {
      if (!process.client) return
      const w = window as any
      if (w.DialogueAppActions?.runExport) return w.DialogueAppActions.runExport(kind)
      throw new Error('Static Dialogue export bridge not mounted')
    },
  }
}
