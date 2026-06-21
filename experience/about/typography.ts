// Typography animation engine — SplitType + GSAP.
//
// Redesigned from 3D character rise to a blur+scale+Y-drift system.
// The old rotateX: -88 approach was jarring on backward scrub — characters
// visibly rotated in reverse. The new system uses only opacity, scale, and
// filter blur, which scrub cleanly in both directions.
//
// Each tone gets its own timing weights so a quiet sm aside feels different
// from a monumental hero word. Timeline is strictly sequential (no overlap)
// so only one beat is ever partially visible during a scrub.

import gsap from 'gsap'
import SplitType from 'split-type'
import type { Beat } from './narrative'

export interface SplitBeat {
  el: HTMLElement
  chars: HTMLElement[]
  beat: Beat
}

// Per-tone timing weights. All durations in seconds.
// enterY / exitY in percentage units (yPercent).
// enterBlur / exitBlur in pixels.
const TONE_WEIGHTS = {
  sm:   { enterDur: 0.28, holdDur: 0.40, exitDur: 0.20, stagger: 0.010, enterY: 16, enterScale: 0.99, enterBlur: 4,  exitY: -7,  exitScale: 1.005, exitBlur: 3  },
  md:   { enterDur: 0.36, holdDur: 0.52, exitDur: 0.24, stagger: 0.014, enterY: 20, enterScale: 0.98, enterBlur: 6,  exitY: -9,  exitScale: 1.008, exitBlur: 3  },
  lg:   { enterDur: 0.44, holdDur: 0.62, exitDur: 0.28, stagger: 0.018, enterY: 24, enterScale: 0.97, enterBlur: 8,  exitY: -11, exitScale: 1.010, exitBlur: 4  },
  xl:   { enterDur: 0.54, holdDur: 0.76, exitDur: 0.32, stagger: 0.015, enterY: 20, enterScale: 0.95, enterBlur: 10, exitY: -8,  exitScale: 1.015, exitBlur: 5  },
  hero: { enterDur: 0.70, holdDur: 1.00, exitDur: 0.38, stagger: 0.008, enterY: 12, enterScale: 0.90, enterBlur: 22, exitY: -4,  exitScale: 1.025, exitBlur: 8  },
  deva: { enterDur: 0.62, holdDur: 0.88, exitDur: 0.34, stagger: 0.022, enterY: 18, enterScale: 0.96, enterBlur: 10, exitY: -8,  exitScale: 1.010, exitBlur: 5  },
  sig:  { enterDur: 0.38, holdDur: 0.56, exitDur: 0.24, stagger: 0.028, enterY: 10, enterScale: 0.99, enterBlur: 4,  exitY: -5,  exitScale: 1.005, exitBlur: 2  },
} as const
type ToneKey = keyof typeof TONE_WEIGHTS

const REST = { yPercent: 0, scale: 1, opacity: 1, filter: 'blur(0px)' }

// Split a beat element into characters (words preserved for wrapping).
export function splitBeat(el: HTMLElement, beat: Beat): SplitBeat {
  const split = new SplitType(el, { types: 'words,chars', tagName: 'span' })
  const chars = (split.chars ?? []) as HTMLElement[]
  return { el, chars, beat }
}

// Build one scene's scrubbed teleprompter timeline. Beats occupy the same space;
// the timeline sequences enter → hold → exit so exactly one beat reads at a time.
// `introFirst` keeps the first beat already at rest at progress 0 so it can be
// revealed by a separate on-mount intro (avoids a blank hero before any scroll).
export function buildSceneTimeline(
  beats: SplitBeat[],
  opts: { introFirst?: boolean } = {}
): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true })

  beats.forEach((b, i) => {
    const presentAtStart = opts.introFirst && i === 0
    const tone = (b.beat.tone ?? 'md') as ToneKey
    const w = TONE_WEIGHTS[tone] ?? TONE_WEIGHTS.md

    const enterFrom = {
      yPercent: w.enterY,
      scale: w.enterScale,
      opacity: 0,
      filter: `blur(${w.enterBlur}px)`,
    }

    // initial state — first beat may start visible so the intro can animate it
    gsap.set(b.el, { opacity: 1 })
    gsap.set(b.chars, presentAtStart ? REST : enterFrom)

    // ENTER — blur + scale + Y drift reveal; skipped for intro-revealed first beat
    if (!presentAtStart) {
      tl.to(b.chars, {
        ...REST,
        duration: w.enterDur,
        ease: 'power2.out',
        stagger: { each: w.stagger, from: 'start' },
      }, i === 0 ? 0 : '>')   // strictly sequential — no '>-0.05' overlap
    } else {
      tl.set(b.chars, { ...REST }, 0)
    }

    // IDLE — hold at full legibility
    tl.to(b.chars, { duration: w.holdDur }, '>')

    // EXIT — last beat of a scene stays visible
    const isLast = i === beats.length - 1
    if (!isLast) {
      if (b.beat.fx === 'scatter') {
        // Impermanence beats: scatter with same rhythm as tone (not hardcoded 0.7s)
        tl.to(b.chars, {
          x: () => gsap.utils.random(-180, 180),
          y: () => gsap.utils.random(-120, 120),
          rotation: () => gsap.utils.random(-60, 60),
          opacity: 0,
          filter: 'blur(5px)',
          duration: w.exitDur + 0.12,
          ease: 'power2.in',
          stagger: { each: 0.01, from: 'random' },
        }, '>')
      } else {
        // Default: gentle upward defocus — natural opposite of enter
        tl.to(b.chars, {
          yPercent: w.exitY,
          scale: w.exitScale,
          opacity: 0,
          filter: `blur(${w.exitBlur}px)`,
          duration: w.exitDur,
          ease: 'power2.in',
          stagger: { each: w.stagger * 0.6, from: 'end' },
        }, '>')
      }
    }
  })

  return tl
}

// Scatter chars in-place (Scene 08 fallback when physics is unavailable).
export function scatterChars(chars: HTMLElement[]) {
  gsap.to(chars, {
    x: () => gsap.utils.random(-260, 260),
    y: () => gsap.utils.random(240, 520),
    rotation: () => gsap.utils.random(-140, 140),
    opacity: 0,
    duration: 0.9,
    ease: 'power2.in',
    stagger: { each: 0.012, from: 'random' },
  })
}

export function cleanup(splits: SplitBeat[]) {
  splits.forEach(s => {
    s.chars.length = 0
  })
}
