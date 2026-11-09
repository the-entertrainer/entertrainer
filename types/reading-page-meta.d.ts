/**
 * Reading Mode page meta.
 *
 * PR #78 adds the same `world.anchor` field from
 * `composables/world/world-page-meta.d.ts`. The two declarations merge.
 * This file exists so `definePageMeta({ world })` typechecks before that
 * module is on main. Do not put this augmentation under `composables/world/`.
 */
declare module '#app' {
  interface PageMeta {
    /** Which Satya Space anchor this Reading Mode page returns to. */
    world?: {
      anchor:
        | 'nexus'
        | 'elevate'
        | 'empower'
        | 'engage'
        | 'learn'
        | 'work'
        | 'dialogue'
        | 'story'
        | 'archive'
    }
  }
}

export {}
