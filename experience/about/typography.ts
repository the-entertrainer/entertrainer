// Typography animation engine — SplitType + GSAP.
//
// Every beat gets three states: ENTER, IDLE (the scroll dwell while fully
// legible), EXIT. No beat merely fades or merely slides — entrances are a
// character-level 3D rise; exits vary by intent (lift-off vs. scatter for the
// "disappears by lunch" / "noisy information" impermanence beats).
//
// Built to be driven by a scrubbed ScrollTrigger: the functions here only
// construct a paused gsap.timeline; the page binds it to scroll.

import gsap from 'gsap'
import SplitType from 'split-type'
import type { Beat } from './narrative'

export interface SplitBeat {
  el: HTMLElement
  chars: HTMLElement[]
  beat: Beat
}

// Split a beat element into characters (words preserved for wrapping).
export function splitBeat(el: HTMLElement, beat: Beat): SplitBeat {
  const split = new SplitType(el, { types: 'words,chars', tagName: 'span' })
  const chars = (split.chars ?? []) as HTMLElement[]
  return { el, chars, beat }
}

const ENTER_FROM = { yPercent: 120, rotateX: -88, opacity: 0, filter: 'blur(10px)' }
const REST = { yPercent: 0, rotateX: 0, opacity: 1, filter: 'blur(0px)' }

// Build one scene's scrubbed teleprompter timeline. Beats occupy the same space;
// the timeline sequences enter → hold → exit so exactly one beat reads at a time.
export function buildSceneTimeline(beats: SplitBeat[]): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true })

  beats.forEach((b, i) => {
    // initial hidden state
    gsap.set(b.el, { opacity: 1 })
    gsap.set(b.chars, { ...ENTER_FROM, transformOrigin: '50% 100% -20px' })

    const enterDur = 0.5
    const holdDur = 0.7
    const exitDur = 0.45

    // ENTER — character 3D rise
    tl.to(b.chars, {
      ...REST,
      duration: enterDur,
      ease: 'power3.out',
      stagger: { each: 0.018, from: 'start' },
    }, i === 0 ? 0 : '>-0.05')

    // IDLE — hold (a tiny settle keeps it alive without "breathing" jitter)
    tl.to(b.chars, { duration: holdDur }, '>')

    // EXIT — last beat of a scene stays; others leave
    const isLast = i === beats.length - 1
    if (!isLast) {
      if (b.beat.fx === 'scatter') {
        tl.to(b.chars, {
          x: () => gsap.utils.random(-220, 220),
          y: () => gsap.utils.random(-160, 160),
          rotation: () => gsap.utils.random(-90, 90),
          opacity: 0,
          filter: 'blur(6px)',
          duration: exitDur + 0.25,
          ease: 'power2.in',
          stagger: { each: 0.01, from: 'random' },
        }, '>')
      } else {
        tl.to(b.chars, {
          yPercent: -70,
          rotateX: 60,
          opacity: 0,
          filter: 'blur(7px)',
          duration: exitDur,
          ease: 'power2.in',
          stagger: { each: 0.012, from: 'end' },
        }, '>')
      }
    }
  })

  return tl
}

// Scatter a single beat's characters in place (used outside the scrub for the
// Scene 08 fallback when physics is unavailable).
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
    // SplitType keeps a static revert via the instance; re-querying is enough
    // for our teardown since the whole component unmounts.
    s.chars.length = 0
  })
}
