/** Real tracks, not a synth.
 *  Free Music Pack by Alexander Ehlers, CC0.
 *  https://opengameart.org/content/free-music-pack
 *  Playback rate stays 1. The year only picks which song. */

const NOW = [
  '/netagiri/music/flags.mp3',
  '/netagiri/music/mission.mp3',
  '/netagiri/music/twists.mp3',
  '/netagiri/music/doomed.mp3',
  '/netagiri/music/devil.mp3'
]

const LATER = [
  '/netagiri/music/spacetime.mp3',
  '/netagiri/music/warped.mp3',
  '/netagiri/music/twists.mp3',
  '/netagiri/music/doomed.mp3'
]

const LEVEL = 0.45

export function pickTrack(year: number, roll: number) {
  const pool = year > 2040 ? LATER : NOW
  const r = Number.isFinite(roll) ? Math.min(0.999, Math.max(0, roll)) : 0
  return pool[Math.floor(r * pool.length)]
}

export type Score = {
  start: (year: number, roll: number) => string
  setMuted: (muted: boolean) => void
  soften: () => void
  stop: () => void
}

export function createScore(): Score {
  let audio: HTMLAudioElement | null = null
  let muted = false
  let soft = false

  function level() {
    if (muted) return 0
    return soft ? LEVEL * 0.4 : LEVEL
  }

  function node() {
    if (!audio) {
      audio = new Audio()
      audio.loop = true
      audio.preload = 'auto'
    }
    audio.playbackRate = 1
    return audio
  }

  return {
    start(year, roll) {
      const a = node()
      soft = false
      const src = pickTrack(year, roll)
      a.pause()
      a.src = src
      a.playbackRate = 1
      a.volume = level()
      a.currentTime = 0
      void a.play().catch(() => {})
      const file = src.split('/').pop() ?? ''
      return file.replace('.mp3', '')
    },
    setMuted(next) {
      muted = next
      if (audio) audio.volume = level()
    },
    soften() {
      soft = true
      if (audio) audio.volume = level()
    },
    stop() {
      audio?.pause()
    }
  }
}
