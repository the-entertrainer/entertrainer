import { defineStore } from 'pinia'

const PALETTES: number[][][] = [
  [[1.0,0.15,0.60],[0.15,0.90,1.00],[0.30,0.30,1.00],[0.70,0.20,1.00],[1.00,0.40,0.85]],
  [[1.0,0.50,0.15],[1.00,0.20,0.25],[1.00,0.78,0.20],[0.90,0.20,0.60],[0.50,0.15,0.65]],
  [[0.2,1.00,0.60],[0.10,0.80,0.95],[0.20,0.50,1.00],[0.50,1.00,0.80],[0.55,0.30,1.00]],
  [[1.0,0.30,0.10],[1.00,0.62,0.12],[1.00,0.85,0.30],[0.95,0.20,0.35],[0.60,0.10,0.25]],
  [[0.6,0.20,1.00],[1.00,0.20,0.80],[0.20,0.65,1.00],[0.95,0.45,1.00],[0.30,0.95,1.00]],
]

export interface GlassParams {
  colors: number[][]; algo: number; noiseScale1: number; noiseScale2: number
  warp: number; warpSpeed: number; grain: number
  fluteStrength: number; seed: number
}

function roll(): GlassParams {
  const r = Math.random
  return {
    colors: PALETTES[Math.floor(r() * PALETTES.length)],
    algo: r() < 0.5 ? 0 : 1,
    noiseScale1: 0.25 + r() * 0.35,
    noiseScale2: 0.40 + r() * 0.40,
    warp: 0.03 + r() * 0.07,
    warpSpeed: 0.06 + r() * 0.10,
    fluteStrength: 80 + Math.floor(r() * 80),
    seed: r() * 10.0,
    grain: 0.07,
  }
}

export const useGlassStore = defineStore('glass', {
  state: () => ({
    params: roll(),
  }),
})
