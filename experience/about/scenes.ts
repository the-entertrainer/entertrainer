import * as THREE from 'three'

export interface Attractor {
  x: number; y: number; z: number
}

export interface SceneParticleConfig {
  attractors: Attractor[]
  color: string
  speed: number      // how fast particles flow to attractor
  noise: number      // random jitter amplitude
  size: number       // point size
  mouseRepel: number // repulsion radius (0 = none)
}

export interface SceneWaypoint {
  pos: [number, number, number]
  target: [number, number, number]
}

export interface SceneDef {
  id: string
  waypoint: SceneWaypoint
  particles: SceneParticleConfig
  // optional extra Three.js object type for this scene
  extra?: 'constellation' | 'neural' | 'godray' | 'panels' | 'portrait' | 'timeline'
}

// Z-spacing between scenes: camera flies 8 units forward per scene
const Z_STEP = 8

export const SCENES: SceneDef[] = [
  // ── 01 · WHO AM I ──────────────────────────────────────────────
  {
    id: 'who',
    waypoint: { pos: [0, 0.5, 6], target: [0, 0, 0] },
    particles: {
      attractors: [
        { x: 0,    y:  1.8, z: 0 },   // top of head
        { x: -0.5, y:  1.2, z: 0 },   // left temple
        { x:  0.5, y:  1.2, z: 0 },   // right temple
        { x: -0.3, y:  0.5, z: 0 },   // left cheek
        { x:  0.3, y:  0.5, z: 0 },   // right cheek
        { x:  0,   y: -0.2, z: 0 },   // chin
      ],
      color: '#B8CCE8', speed: 0.018, noise: 0.004, size: 1.4, mouseRepel: 2.5
    }
  },
  // ── 02 · THE PLAN ──────────────────────────────────────────────
  {
    id: 'plan',
    waypoint: { pos: [2, 0.5, 6 + Z_STEP], target: [0, 0, Z_STEP] },
    particles: {
      attractors: [
        { x: -3.5, y: 0, z: Z_STEP }, { x: -2.5, y: 0, z: Z_STEP },
        { x: -1.5, y: 0, z: Z_STEP }, { x: -0.5, y: 0, z: Z_STEP },
        { x:  0.5, y: 0, z: Z_STEP }, { x:  1.5, y: 0, z: Z_STEP },
        { x:  2.5, y: 0, z: Z_STEP }, { x:  3.5, y: 0, z: Z_STEP },
      ],
      color: '#F4D03F', speed: 0.012, noise: 0.003, size: 1.2, mouseRepel: 0
    },
    extra: 'timeline'
  },
  // ── 03 · THE DETOUR ──────────────────────────────────────────────
  {
    id: 'detour',
    waypoint: { pos: [-1.5, 0, 6 + Z_STEP * 2], target: [0, 0.5, Z_STEP * 2] },
    particles: {
      attractors: [
        { x: -2,   y:  0,   z: Z_STEP * 2 },
        { x: -0.5, y:  1,   z: Z_STEP * 2 },
        { x:  1,   y:  0.5, z: Z_STEP * 2 },
        { x:  2,   y: -0.5, z: Z_STEP * 2 },
      ],
      color: '#E74C3C', speed: 0.025, noise: 0.008, size: 1.3, mouseRepel: 0
    }
  },
  // ── 04 · REALIZATION ──────────────────────────────────────────────
  {
    id: 'realization',
    waypoint: { pos: [0, -0.5, 6 + Z_STEP * 3], target: [0, 0, Z_STEP * 3] },
    particles: {
      attractors: Array.from({ length: 18 }, (_, i) => ({
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 3,
        z: Z_STEP * 3
      })).concat([
        { x: -0.6, y: 0.4, z: Z_STEP * 3 },
        { x:  0.6, y: 0.4, z: Z_STEP * 3 },
      ]),
      color: '#FFFFFF', speed: 0.022, noise: 0.006, size: 1.1, mouseRepel: 0
    }
  },
  // ── 05 · MENTORS ──────────────────────────────────────────────
  {
    id: 'mentors',
    waypoint: { pos: [0, 1.5, 6 + Z_STEP * 4], target: [0, 0, Z_STEP * 4] },
    particles: {
      attractors: [
        { x: -3,   y:  1.5, z: Z_STEP * 4 },
        { x: -1.8, y: -1,   z: Z_STEP * 4 },
        { x:  0,   y:  2,   z: Z_STEP * 4 },
        { x:  1.5, y:  0.5, z: Z_STEP * 4 },
        { x:  3,   y: -0.8, z: Z_STEP * 4 },
        { x:  0.8, y: -1.8, z: Z_STEP * 4 },
        { x: -1,   y:  1,   z: Z_STEP * 4 },
      ],
      color: '#FFD700', speed: 0.01, noise: 0.002, size: 2.2, mouseRepel: 0
    },
    extra: 'constellation'
  },
  // ── 06 · OBSESSION / NEURAL ──────────────────────────────────────────────
  {
    id: 'obsession',
    waypoint: { pos: [0, 0, 6 + Z_STEP * 5], target: [0, 0, Z_STEP * 5] },
    particles: {
      attractors: Array.from({ length: 20 }, (_, i) => ({
        x: ((i % 5) - 2) * 1.4,
        y: (Math.floor(i / 5) - 2) * 1.1,
        z: Z_STEP * 5
      })),
      color: '#06D6A0', speed: 0.02, noise: 0.005, size: 1.0, mouseRepel: 0
    },
    extra: 'neural'
  },
  // ── 07 · DISCOVERY ──────────────────────────────────────────────
  {
    id: 'discovery',
    waypoint: { pos: [0, 0, 6 + Z_STEP * 6], target: [0, 0, Z_STEP * 6] },
    particles: {
      attractors: [
        { x:  0,    y:  0.5, z: Z_STEP * 6 },
        { x: -0.8,  y: -0.3, z: Z_STEP * 6 },
        { x:  0.8,  y: -0.3, z: Z_STEP * 6 },
      ],
      color: '#4FC3F7', speed: 0.03, noise: 0.01, size: 1.2, mouseRepel: 0
    }
  },
  // ── 08 · STRIP THE NOISE ──────────────────────────────────────────────
  {
    id: 'strip',
    waypoint: { pos: [-2, 0, 6 + Z_STEP * 7], target: [0, 0, Z_STEP * 7] },
    particles: {
      attractors: [
        { x: -1, y:  0.3, z: Z_STEP * 7 },
        { x:  0, y:  0,   z: Z_STEP * 7 },
        { x:  1, y: -0.3, z: Z_STEP * 7 },
      ],
      color: '#FF9800', speed: 0.028, noise: 0.007, size: 1.3, mouseRepel: 0
    }
  },
  // ── 09 · SEWA / STORIES ──────────────────────────────────────────────
  {
    id: 'stories',
    waypoint: { pos: [2, 0.5, 6 + Z_STEP * 8], target: [0, 0, Z_STEP * 8] },
    particles: {
      attractors: [
        { x: -1.5, y:  0.9, z: Z_STEP * 8 },
        { x:  0,   y:  0.9, z: Z_STEP * 8 },
        { x:  1.5, y:  0.9, z: Z_STEP * 8 },
        { x: -1.5, y: -0.5, z: Z_STEP * 8 },
        { x:  0,   y: -0.5, z: Z_STEP * 8 },
        { x:  1.5, y: -0.5, z: Z_STEP * 8 },
      ],
      color: '#CE93D8', speed: 0.009, noise: 0.002, size: 1.4, mouseRepel: 0
    },
    extra: 'panels'
  },
  // ── 10 · MANTRA ──────────────────────────────────────────────
  {
    id: 'mantra',
    waypoint: { pos: [0, -1, 6 + Z_STEP * 9], target: [0, 3, Z_STEP * 9] },
    particles: {
      attractors: [
        { x: 0, y: 5, z: Z_STEP * 9 },
      ],
      color: '#FDFCF8', speed: 0.008, noise: 0.001, size: 1.6, mouseRepel: 0
    },
    extra: 'godray'
  },
  // ── 11 · TODAY ──────────────────────────────────────────────
  {
    id: 'today',
    waypoint: { pos: [0, 0, 6 + Z_STEP * 10], target: [0, 0, Z_STEP * 10] },
    particles: {
      attractors: Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        return { x: Math.cos(angle) * 2.8, y: Math.sin(angle) * 1.4, z: Z_STEP * 10 }
      }),
      color: '#26C6DA', speed: 0.015, noise: 0.003, size: 1.5, mouseRepel: 0
    }
  },
  // ── 12 · ENDING ──────────────────────────────────────────────
  {
    id: 'ending',
    waypoint: { pos: [0, 0, 6 + Z_STEP * 11], target: [0, 0, Z_STEP * 11] },
    particles: {
      attractors: [
        { x: 0, y: 0, z: Z_STEP * 11 },
      ],
      color: '#F4F1EC', speed: 0.035, noise: 0.002, size: 1.2, mouseRepel: 0
    },
    extra: 'portrait'
  },
]

// Realization scene: early vs late attractor sets
export const REALIZATION_EARLY = SCENES[3].particles.attractors
export const REALIZATION_LATE  = [
  { x: -0.6, y: 0.4, z: Z_STEP * 3 },
  { x:  0.6, y: 0.4, z: Z_STEP * 3 },
  { x:  0,   y: -0.5, z: Z_STEP * 3 },
]
