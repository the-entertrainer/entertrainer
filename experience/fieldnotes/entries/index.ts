import * as THREE from 'three'
import type { ParticleConfig } from '../ParticleField'

export interface NoteSpec {
  pos: [number, number, number]
  rot: [number, number, number]
  lines: string[]
  scale?: number
}

export interface PhotoSpec {
  pos: [number, number, number]
  rot: [number, number, number]
  label?: string
  scale?: number
}

export interface ComicPanelSpec {
  pos: [number, number, number]
  rot: [number, number, number]
  seed: number
  scale?: number
}

export interface EntryDef {
  id: string
  zCenter: number        // center Z of this entry's world cluster
  notes: NoteSpec[]
  photos: PhotoSpec[]
  comicPanels: ComicPanelSpec[]
  particles: ParticleConfig | null
  hasBlueprint?: boolean
  hasMantra?: boolean
  hasKnowledgeGraph?: boolean
  constellationNodes?: THREE.Vector3[]  // Entry 05
  scatterWords?: string[]               // Entry 08
}

// Z-band per entry: each occupies ~10 units along Z
const Z = (n: number) => n * 10  // Z center for entry n (1-indexed)

export const ENTRIES: EntryDef[] = [

  // ── 01 WHO AM I ──────────────────────────────────────────────────────────
  {
    id: 'who',
    zCenter: Z(1),
    notes: [
      { pos: [-4.5, 2.5, Z(1)-2], rot: [0.08, -0.35, 0.22], lines: ['Who am I?'] },
      { pos: [4.2, -1.8, Z(1)],   rot: [-0.1, 0.28, -0.18], lines: ['A question', 'worth asking.'] },
      { pos: [-3, -2.5, Z(1)+3],  rot: [0.14, -0.2, 0.12],  lines: ['Learning', 'by doing.'] },
      { pos: [3.8, 3, Z(1)-1],    rot: [-0.05, -0.3, 0.16], lines: ['Always', 'curious.'] },
      { pos: [-6, 0.5, Z(1)+2],   rot: [0.2, -0.1, 0.3],    lines: ['Observer.'] },
      { pos: [5.5, 1, Z(1)+4],    rot: [-0.12, 0.22, -0.1], lines: ['Builder.'] },
    ],
    photos: [],
    comicPanels: [],
    particles: {
      attractors: [
        // Face oval – world space around Z(1)
        { x: 0, y: 2.2, z: Z(1)+1 },
        { x: -0.6, y: 1.8, z: Z(1)+1 },
        { x:  0.6, y: 1.8, z: Z(1)+1 },
        { x: -1.0, y: 1.2, z: Z(1)+1 },
        { x:  1.0, y: 1.2, z: Z(1)+1 },
        { x: -0.4, y: 0.9, z: Z(1)+1 },
        { x:  0.4, y: 0.9, z: Z(1)+1 },
        { x:  0, y:  0.4, z: Z(1)+1 },
        { x: -0.7, y: 0.5, z: Z(1)+1 },
        { x:  0.7, y: 0.5, z: Z(1)+1 },
        { x:  0, y: -0.1, z: Z(1)+1 },
      ],
      color: '#D0CCC4',
      speed: 0.016,
      noise: 0.004,
      size: 1.3,
      mouseRepel: 2.8,
    },
  },

  // ── 02 THE PLAN ──────────────────────────────────────────────────────────
  {
    id: 'plan',
    zCenter: Z(2),
    notes: [
      { pos: [-3.5, 1.5, Z(2)-2], rot: [0.06, 0.15, -0.22], lines: ['The plan:', 'Work in hotels.', 'Grow steadily.'] },
      { pos: [3, -1, Z(2)+2],     rot: [-0.1, -0.2, 0.18],  lines: ['Keep moving', 'forward.'] },
      { pos: [-5, -1.5, Z(2)],    rot: [0.18, 0.1, -0.14],  lines: ['Hospitality', 'seemed right.'] },
    ],
    photos: [
      { pos: [-1.8, 0.6, Z(2)+1],  rot: [0.04, 0.25, -0.18], label: '2012', scale: 1.1 },
      { pos: [1.5,  -0.8, Z(2)-1], rot: [-0.06, -0.2, 0.24], label: 'College', scale: 0.95 },
      { pos: [4.5,  1.5, Z(2)+3],  rot: [0.1, 0.15, -0.12],  label: '', scale: 0.88 },
      { pos: [-4, 2.5, Z(2)+2],    rot: [-0.08, -0.18, 0.2], label: 'Graduation', scale: 1.0 },
    ],
    comicPanels: [],
    particles: {
      attractors: [
        { x: -2, y: 0, z: Z(2) }, { x: -1, y: 0, z: Z(2) }, { x: 0, y: 0, z: Z(2) },
        { x:  1, y: 0, z: Z(2) }, { x:  2, y: 0, z: Z(2) }, { x: 3, y: 0, z: Z(2) },
      ],
      color: '#B8B5AE', speed: 0.010, noise: 0.003, size: 1.1, mouseRepel: 0,
    },
  },

  // ── 03 THE DETOUR ─────────────────────────────────────────────────────────
  {
    id: 'detour',
    zCenter: Z(3),
    notes: [
      { pos: [-4, 1.5, Z(3)-2], rot: [0.1, -0.28, 0.2],   lines: ['L&D appeared.', 'Not as a dream.'] },
      { pos: [2.5, 0.5, Z(3)+1], rot: [-0.05, 0.22, -0.16], lines: ['Just a door.'] },
      { pos: [-2, -2, Z(3)+3],  rot: [0.2, -0.12, 0.28],  lines: ['One I walked', 'through.'] },
      { pos: [4, -1.5, Z(3)],   rot: [-0.12, -0.2, 0.1],  lines: ['No master plan.'] },
      { pos: [-5.5, 0, Z(3)+2], rot: [0.08, 0.35, -0.22], lines: ['A detour', 'became the path.'] },
    ],
    photos: [],
    comicPanels: [],
    particles: {
      attractors: [
        { x: -2,   y: 0, z: Z(3) }, { x: -0.8, y: 0.8, z: Z(3) },
        { x: 0.5,  y: 0.5, z: Z(3) }, { x: 2, y: -0.5, z: Z(3) },
      ],
      color: '#AEAAA3', speed: 0.022, noise: 0.007, size: 1.2, mouseRepel: 0,
    },
  },

  // ── 04 REALIZATION ────────────────────────────────────────────────────────
  {
    id: 'realization',
    zCenter: Z(4),
    notes: [
      // Grid of notes that will "collapse" — placed in rough 4×3 grid
      ...Array.from({ length: 12 }, (_, i) => ({
        pos: [(i % 4) * 2.2 - 3.3, Math.floor(i / 4) * 2.2 - 2.2, Z(4) + (Math.random() - 0.5) * 2] as [number,number,number],
        rot: [(Math.random()-0.5)*0.15, (Math.random()-0.5)*0.25, (Math.random()-0.5)*0.2] as [number,number,number],
        lines: [['Information', 'Slides', 'Quiz', 'Course'][i % 4], ['Data', 'Content', 'Deck', 'Training'][Math.floor(i/4)]],
        scale: 0.75,
      })),
      // The surviving note — large, centered, revealed later
      { pos: [0, 0, Z(4)+2], rot: [0, 0, 0], lines: ['Information', '≠ Learning'], scale: 1.4 },
    ],
    photos: [],
    comicPanels: [],
    particles: {
      attractors: Array.from({ length: 20 }, (_, i) => ({
        x: (Math.random() - 0.5) * 6,
        y: (Math.random() - 0.5) * 4,
        z: Z(4),
      })),
      color: '#C0BDB6', speed: 0.020, noise: 0.006, size: 1.0, mouseRepel: 0,
    },
  },

  // ── 05 MENTORS ────────────────────────────────────────────────────────────
  {
    id: 'mentors',
    zCenter: Z(5),
    constellationNodes: [
      new THREE.Vector3(-3.5, 2, Z(5)),
      new THREE.Vector3(-1.8, -1.2, Z(5)),
      new THREE.Vector3(0, 2.8, Z(5)),
      new THREE.Vector3(1.8, 0.5, Z(5)+1),
      new THREE.Vector3(3.5, -1, Z(5)),
      new THREE.Vector3(0.8, -2.2, Z(5)),
      new THREE.Vector3(-1.2, 0.8, Z(5)+0.5),
    ],
    notes: [
      { pos: [-3.5, 2, Z(5)],    rot: [0, 0.1, 0.1],   lines: ['Mentor.'] },
      { pos: [-1.8, -1.2, Z(5)], rot: [0.05, -0.1, -0.12], lines: ['Teacher.'] },
      { pos: [0, 2.8, Z(5)],     rot: [-0.08, 0, 0.08], lines: ['Guide.'] },
      { pos: [1.8, 0.5, Z(5)+1], rot: [0.1, 0.12, 0],  lines: ['Model.'] },
      { pos: [3.5, -1, Z(5)],    rot: [-0.05, -0.1, 0.1], lines: ['Spark.'] },
      { pos: [0.8, -2.2, Z(5)],  rot: [0.12, 0.08, -0.1], lines: ['Vision.'] },
      { pos: [-1.2, 0.8, Z(5)+0.5], rot: [-0.1, 0.06, 0.08], lines: ['Belief.'] },
    ],
    photos: [],
    comicPanels: [],
    particles: {
      attractors: [
        { x: -3.5, y: 2, z: Z(5) }, { x: -1.8, y: -1.2, z: Z(5) },
        { x: 0, y: 2.8, z: Z(5) }, { x: 1.8, y: 0.5, z: Z(5) },
        { x: 3.5, y: -1, z: Z(5) }, { x: 0.8, y: -2.2, z: Z(5) },
        { x: -1.2, y: 0.8, z: Z(5) },
      ],
      color: '#B0ACA6', speed: 0.010, noise: 0.002, size: 1.8, mouseRepel: 0,
    },
  },

  // ── 06 OBSESSION ──────────────────────────────────────────────────────────
  {
    id: 'obsession',
    zCenter: Z(6),
    notes: [
      { pos: [0, 0.5, Z(6)],     rot: [0, 0, 0],            lines: ['Memory.', 'Attention.', 'Motivation.'], scale: 1.1 },
      { pos: [-4, 2, Z(6)-1],    rot: [0.1, -0.3, 0.2],    lines: ['Why do some', 'things stick?'] },
      { pos: [3.5, -1.5, Z(6)+2],rot: [-0.12, 0.25, -0.18],lines: ['Why do others', 'vanish by lunch?'] },
      { pos: [-2.5, -2, Z(6)+1], rot: [0.18, -0.15, 0.25], lines: ['Cognitive', 'load.'] },
      { pos: [2, 2.5, Z(6)-2],   rot: [-0.08, -0.22, 0.14],lines: ['Spaced', 'repetition.'] },
      { pos: [-5, 0, Z(6)+3],    rot: [0.22, 0.18, -0.1],  lines: ['Retrieval', 'practice.'] },
      { pos: [5, 1, Z(6)+1],     rot: [-0.15, -0.28, 0.2], lines: ['Interleaving.'] },
      { pos: [0, -3, Z(6)+2],    rot: [0.05, 0.1, -0.22],  lines: ['Elaborative', 'interrogation.'] },
    ],
    photos: [],
    comicPanels: [],
    particles: {
      attractors: Array.from({ length: 20 }, (_, i) => ({
        x: ((i % 5) - 2) * 1.6,
        y: (Math.floor(i / 5) - 2) * 1.2,
        z: Z(6),
      })),
      color: '#BCBAB3', speed: 0.018, noise: 0.005, size: 1.0, mouseRepel: 0,
    },
  },

  // ── 07 DISCOVERY ──────────────────────────────────────────────────────────
  {
    id: 'discovery',
    zCenter: Z(7),
    hasBlueprint: true,
    notes: [
      { pos: [-3, 1.5, Z(7)-1],  rot: [0.08, 0.18, -0.15], lines: ["It isn't slides.", "It isn't courses."] },
      { pos: [2.5, -1, Z(7)+2],  rot: [-0.12, -0.22, 0.18],lines: ["It's understanding", "how people learn."] },
      { pos: [0, 0, Z(7)+1],     rot: [0, 0, 0],            lines: ['MAKE LEARNING STICK'], scale: 1.2 },
      { pos: [-4.5, -2, Z(7)+3], rot: [0.2, -0.1, 0.28],   lines: ['Design for', 'the brain.'] },
      { pos: [4, 2, Z(7)],       rot: [-0.1, 0.3, -0.2],   lines: ['Architecture', 'of learning.'] },
    ],
    photos: [],
    comicPanels: [],
    particles: {
      attractors: [
        { x: 0, y: 0.5, z: Z(7) }, { x: -1, y: -0.5, z: Z(7) }, { x: 1, y: -0.5, z: Z(7) },
      ],
      color: '#C0BDB5', speed: 0.028, noise: 0.008, size: 1.1, mouseRepel: 0,
    },
  },

  // ── 08 CLARITY ────────────────────────────────────────────────────────────
  {
    id: 'clarity',
    zCenter: Z(8),
    scatterWords: ['Jargon', 'Complexity', 'Clutter', 'Noise', 'Fluff', 'Filler', 'Bloat', 'Waffle', 'Junk', 'Excess'],
    notes: [
      { pos: [-4, 2, Z(8)-2],    rot: [0.1, -0.25, 0.2],    lines: ['Remove jargon.'] },
      { pos: [3.5, 1, Z(8)+1],   rot: [-0.08, 0.2, -0.14],  lines: ['Remove clutter.'] },
      { pos: [-2, -2.5, Z(8)+3], rot: [0.22, -0.1, 0.3],    lines: ['Keep what', 'matters.'] },
      { pos: [0, 0, Z(8)+2],     rot: [0, 0, 0],             lines: ['CLARITY', 'UNDERSTANDING', 'ACTION'], scale: 1.3 },
    ],
    photos: [],
    comicPanels: [],
    particles: {
      attractors: [
        { x: -1, y: 0.3, z: Z(8) }, { x: 0, y: 0, z: Z(8) }, { x: 1, y: -0.3, z: Z(8) },
      ],
      color: '#C8C5BE', speed: 0.025, noise: 0.007, size: 1.2, mouseRepel: 0,
    },
  },

  // ── 09 STORIES (SEWA Chronicles) ─────────────────────────────────────────
  {
    id: 'stories',
    zCenter: Z(9),
    notes: [
      { pos: [-4.5, 2, Z(9)-2],  rot: [0.08, -0.22, 0.18], lines: ['People rarely', 'remember data.'] },
      { pos: [4, -1, Z(9)+3],    rot: [-0.1, 0.28, -0.2],  lines: ['Stories create', 'meaning.'] },
      { pos: [-3, -2.5, Z(9)+1], rot: [0.2, -0.12, 0.25],  lines: ['Meaning creates', 'memory.'] },
      { pos: [0, 2.5, Z(9)-1],   rot: [-0.06, -0.18, 0.12],lines: ['SEWA Chronicles'] },
    ],
    photos: [],
    comicPanels: [
      { pos: [-2.8, 1, Z(9)+1],  rot: [0.06, 0.18, -0.12], seed: 1, scale: 1.1 },
      { pos: [0, 0, Z(9)+2],     rot: [0, 0, 0],            seed: 2, scale: 1.0 },
      { pos: [2.8, 1, Z(9)+1],   rot: [-0.06, -0.18, 0.12], seed: 3, scale: 1.1 },
      { pos: [-2.8, -1.4, Z(9)+2],rot: [0.08, 0.22, -0.08], seed: 4, scale: 1.0 },
      { pos: [0, -1.4, Z(9)+3],  rot: [0, -0.08, 0.1],     seed: 5, scale: 1.0 },
      { pos: [2.8, -1.4, Z(9)+2],rot: [-0.08, -0.2, 0.06], seed: 6, scale: 1.1 },
    ],
    particles: {
      attractors: [
        { x: -1.5, y: 0.9, z: Z(9) }, { x: 0, y: 0.9, z: Z(9) }, { x: 1.5, y: 0.9, z: Z(9) },
        { x: -1.5, y: -0.5, z: Z(9) }, { x: 0, y: -0.5, z: Z(9) }, { x: 1.5, y: -0.5, z: Z(9) },
      ],
      color: '#BBBAB5', speed: 0.009, noise: 0.002, size: 1.3, mouseRepel: 0,
    },
  },

  // ── 10 MANTRA ─────────────────────────────────────────────────────────────
  {
    id: 'mantra',
    zCenter: Z(10),
    hasMantra: true,
    notes: [
      { pos: [-4, 2, Z(10)-3],  rot: [0.1, -0.2, 0.15], lines: ['From assumption', 'to understanding.'] },
      { pos: [4, -1, Z(10)+3],  rot: [-0.1, 0.25, -0.2],lines: ['That is', 'learning.'] },
    ],
    photos: [],
    comicPanels: [],
    particles: {
      attractors: [{ x: 0, y: 4, z: Z(10) }],
      color: '#D8D5CE', speed: 0.008, noise: 0.001, size: 1.5, mouseRepel: 0,
    },
  },

  // ── 11 TODAY ──────────────────────────────────────────────────────────────
  {
    id: 'today',
    zCenter: Z(11),
    notes: [
      // 3×3 grid that assembles
      ...Array.from({ length: 9 }, (_, i) => ({
        pos: [(i % 3) * 2.5 - 2.5, Math.floor(i / 3) * 2.5 - 2.5, Z(11) + (Math.random()-0.5)] as [number,number,number],
        rot: [(Math.random()-0.5)*0.08, (Math.random()-0.5)*0.12, (Math.random()-0.5)*0.1] as [number,number,number],
        lines: [
          'eLearning', 'Video', 'Workshop',
          'Simulation', 'Coaching', 'Assessment',
          'Onboarding', 'Job Aid', 'Performance',
        ][i].split(' '),
        scale: 0.9,
      })),
    ],
    photos: [],
    comicPanels: [],
    particles: {
      attractors: Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        return { x: Math.cos(angle) * 3.2, y: Math.sin(angle) * 1.6, z: Z(11) }
      }),
      color: '#C0BDB8', speed: 0.014, noise: 0.003, size: 1.4, mouseRepel: 0,
    },
  },

  // ── 12 FINAL ──────────────────────────────────────────────────────────────
  {
    id: 'final',
    zCenter: Z(12),
    hasKnowledgeGraph: true,
    notes: [
      { pos: [0, 0.5, Z(12)+3], rot: [0, 0, 0], lines: ['I turn complexity', 'into clarity.', '— Naveen Jose'], scale: 1.5 },
    ],
    photos: [],
    comicPanels: [],
    particles: {
      attractors: [{ x: 0, y: 0, z: Z(12)+1 }],
      color: '#D8D4CC', speed: 0.032, noise: 0.002, size: 1.2, mouseRepel: 0,
    },
  },
]

// Camera waypoints: one per entry, scrubbed via GSAP ScrollTrigger
export const WAYPOINTS = [
  { pos: [0, 0, -4]  as [number,number,number], target: [0, 0.2, Z(1)] as [number,number,number] },   // 01
  { pos: [2, 0.8, Z(2)-8]  as [number,number,number], target: [-0.5, 0.3, Z(2)] as [number,number,number] }, // 02
  { pos: [-2, 0.5, Z(3)-8] as [number,number,number], target: [1, 0, Z(3)] as [number,number,number] },     // 03
  { pos: [0, -0.8, Z(4)-8] as [number,number,number], target: [0, 0, Z(4)] as [number,number,number] },     // 04
  { pos: [0, 2.5, Z(5)-8]  as [number,number,number], target: [0, 0, Z(5)] as [number,number,number] },     // 05
  { pos: [0, 0, Z(6)-8]    as [number,number,number], target: [0, 0.5, Z(6)] as [number,number,number] },   // 06
  { pos: [1, -0.5, Z(7)-8] as [number,number,number], target: [0, 0.5, Z(7)] as [number,number,number] },  // 07
  { pos: [-2.5, 0, Z(8)-8] as [number,number,number], target: [0, 0, Z(8)] as [number,number,number] },    // 08
  { pos: [2.5, 0.8, Z(9)-8] as [number,number,number], target: [0, 0, Z(9)] as [number,number,number] },   // 09
  { pos: [0, -0.8, Z(10)-8] as [number,number,number], target: [0, 2.5, Z(10)] as [number,number,number] }, // 10
  { pos: [0, 0, Z(11)-8]   as [number,number,number], target: [0, 0, Z(11)] as [number,number,number] },   // 11
  { pos: [0, 0.3, Z(12)-8] as [number,number,number], target: [0, 0, Z(12)+2] as [number,number,number] }, // 12
]
