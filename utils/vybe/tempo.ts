/** Onset clock. Keeps timestamps, not audio. */

export type TempoSnap = {
  bpm: number
  phase: number
  onset: boolean
}

export function createTempo(now = 0) {
  const onsets: number[] = []
  let bpm = 100
  let lastOnset = now
  let fluxAvg = 0.02

  return {
    get bpm() {
      return bpm
    },
    push(time: number, flux: number): TempoSnap {
      fluxAvg = fluxAvg * 0.94 + flux * 0.06
      const gap = time - lastOnset
      const onset = flux > Math.max(0.015, fluxAvg * 1.7) && gap > 150
      if (onset) {
        onsets.push(time)
        if (onsets.length > 28) onsets.shift()
        lastOnset = time
        const next = estimate(onsets)
        if (next) bpm = bpm * 0.65 + next * 0.35
      }
      const period = 60000 / bpm
      const phase = ((time - lastOnset) % period) / period
      return { bpm, phase, onset }
    }
  }
}

function estimate(times: number[]): number | null {
  if (times.length < 4) return null
  const gaps: number[] = []
  for (let i = 1; i < times.length; i++) {
    const d = times[i] - times[i - 1]
    if (d >= 300 && d <= 1100) gaps.push(d)
  }
  if (gaps.length < 3) return null
  gaps.sort((a, b) => a - b)
  const mid = gaps[Math.floor(gaps.length / 2)]
  return Math.min(180, Math.max(64, 60000 / mid))
}
