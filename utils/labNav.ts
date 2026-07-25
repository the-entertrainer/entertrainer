// Shared nav set for the hidden /lab homepage concepts. Mirrors the real home
// destinations so each concept behaves like the actual site.
export interface LabItem { n: string; label: string; href: string; desc: string; img: string }

export const LAB_NAV: LabItem[] = [
  { n: '01', label: 'About',                href: '/about',                desc: 'The short story of how I got here — hospitality to L&D.', img: '/about-me.png' },
  { n: '02', label: 'Instructional Design', href: '/instructional-design', desc: 'How I think about learning that actually lands.',          img: '/instructional-design.png' },
  { n: '03', label: 'My Work',              href: '/my-work',              desc: 'Case studies, a comic, and the projects behind them.',    img: '/my-work.png' },
  { n: '04', label: 'Web Apps',             href: '/tools',                desc: 'Free tools I built for instructional designers.',         img: '/web-apps.png' }
]

/**
 * Fifteen homepage concepts, each built on one documented finding from
 * interaction research rather than on taste.
 *
 * `law` names the finding, `pitch` is the marketing angle it unlocks, and
 * `technique` is the implementation method. The three are deliberately
 * coupled: Naveen sells learning design, so a homepage that demonstrably
 * applies attention, memory and motion research *is* the portfolio argument —
 * the mechanism and the message are the same thing.
 */
export interface LabConcept {
  n: string; slug: string; name: string
  law: string; pitch: string; technique: string
}

export const CONCEPTS: LabConcept[] = [
  { n: '01', slug: 'c01-thumb', name: 'Thumb Zone',
    law: "Fitts's Law — T = a + b·log₂(2D/W); acquisition time falls as targets grow and close in.",
    pitch: '“Built for the device in your hand.”',
    technique: 'Radial menu anchored to the thumb arc; targets ≥64px, pointer-distance readout.' },

  { n: '02', slug: 'c02-oneq', name: 'One Question',
    law: "Hick's Law — T = b·log₂(n+1); decision time grows with the number of choices.",
    pitch: '“I ask before I answer.” Consultative, like a real scoping call.',
    technique: 'Progressive disclosure funnel — never more than two options on screen.' },

  { n: '03', slug: 'c03-doherty', name: 'Under 400',
    law: 'Doherty Threshold — productivity climbs when the system answers in under 400 ms.',
    pitch: '“Fast is a feature.” Craft you can feel before you can read.',
    technique: 'Live latency budget; every hover resolves in <100 ms with a measured readout.' },

  { n: '04', slug: 'c04-serial', name: 'First & Last',
    law: 'Serial Position Effect — items at the start and end of a list are recalled best.',
    pitch: '“I design what they remember, not what they saw.”',
    technique: 'A list that re-ranks live, with recall probability plotted per position.' },

  { n: '05', slug: 'c05-restorff', name: 'The Odd One',
    law: 'Von Restorff (isolation) Effect — the item that breaks the pattern is remembered.',
    pitch: '“Be the thing they remember.” The whole promise of good training.',
    technique: 'A uniform grid where exactly one cell violates the rule and moves.' },

  { n: '06', slug: 'c06-peakend', name: 'Peak & End',
    law: 'Peak-End Rule — an experience is judged by its most intense moment and its ending.',
    pitch: '“Design the moment they retell.”',
    technique: 'Scroll-driven three-act arc with an engineered peak and a deliberate close.' },

  { n: '07', slug: 'c07-region', name: 'Common Region',
    law: 'Gestalt — elements inside a shared boundary are perceived as one group.',
    pitch: '“Everything in its place.” Structure as the visible argument.',
    technique: 'Draggable bounded regions; grouping changes meaning as you move them.' },

  { n: '08', slug: 'c08-chunk', name: 'Four Chunks',
    law: "Miller's Law — working memory holds about 7±2 items; chunking raises effective capacity.",
    pitch: '“Four things, taught properly.” Chunking is the craft itself.',
    technique: 'Accordion chunks that expand in place, one open at a time.' },

  { n: '09', slug: 'c09-goal', name: 'Momentum',
    law: 'Goal-Gradient Effect — effort accelerates as the goal gets closer.',
    pitch: '“Completion rates are the only metric that matters.”',
    technique: 'A progress meter that visibly accelerates; artificial head-start on load.' },

  { n: '10', slug: 'c10-zeigarnik', name: 'Open Loop',
    law: 'Zeigarnik Effect — unfinished tasks stay in memory more than finished ones.',
    pitch: '“The hook before the lesson.” Curiosity gaps, on purpose.',
    technique: 'Deliberately incomplete reveals that only resolve on interaction.' },

  { n: '11', slug: 'c11-fpattern', name: 'F-Pattern',
    law: 'NN/g eye-tracking — 79% of users scan rather than read; scanning traces an F.',
    pitch: '“I write for how people actually read.”',
    technique: 'Layout pinned to the F path with a live scan-path overlay.' },

  { n: '12', slug: 'c12-fovea', name: 'Foveal Lens',
    law: 'Acuity falls sharply outside the ~2° fovea; the periphery detects motion, not detail.',
    pitch: '“Attention is the scarce resource.”',
    technique: 'Canvas lens — only what the pointer rests on resolves to full detail.' },

  { n: '13', slug: 'c13-timing', name: 'Timing Is Teaching',
    law: 'UI motion reads best at 200–500 ms; <100 ms is imperceptible, >1 s reads as lag.',
    pitch: '“Pacing is a teaching decision.”',
    technique: 'The same transition offered at 80 / 200 / 400 / 1000 ms, side by side.' },

  { n: '14', slug: 'c14-oklch', name: 'Colour That Behaves',
    law: 'OKLCH is perceptually uniform — fixing L holds apparent lightness across all hues.',
    pitch: '“Systems, not swatches.”',
    technique: 'Hue scrub at locked lightness; contrast ratio recomputed live against WCAG.' },

  { n: '15', slug: 'c15-calm', name: 'Calm & Keyboard',
    law: 'Vestibular disorders affect ~70M people; parallax and layered motion are triggers.',
    pitch: '“Accessible by default is a credential, not a checkbox.”',
    technique: 'Zero non-essential motion, command palette, full keyboard control.' }
]
