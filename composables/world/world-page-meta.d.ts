import type { WorldAnchorId } from './worldRoutes'

declare module '#app' {
  interface PageMeta {
    /** Set on Reading Mode pages so the shell knows which anchor it left. */
    world?: { anchor: WorldAnchorId }
  }
}

export {}
