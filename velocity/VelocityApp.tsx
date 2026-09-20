import { useEffect, useRef, useState } from 'react'
import { createEngine, type VelocityEngine } from './engine'
import {
  SCALES, type ScaleId, type SpeedUnit, NEXT_UNIT,
  formatSpeed, formatDistance, speedForScale, latHemisphere,
} from './scales'
import './velocity.css'

const TABS: { id: ScaleId; label: string; glyph: string }[] = [
  { id: 'earth', label: 'Earth', glyph: '◎' },
  { id: 'sun', label: 'Orbit', glyph: '◌' },
  { id: 'galaxy', label: 'Galaxy', glyph: '✧' },
  { id: 'cosmos', label: 'CMB', glyph: '↝' },
  { id: 'helix', label: 'Helix', glyph: '∿' },
]

function haptic(ms = 8) {
  try { navigator.vibrate?.(ms) } catch { /* */ }
}

export function VelocityApp() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<VelocityEngine | null>(null)
  const [scale, setScale] = useState<ScaleId>('earth')
  const [unit, setUnit] = useState<SpeedUnit>('km/h')
  const [lat, setLat] = useState(28.6)
  const [ready, setReady] = useState(false)
  const [story, setStory] = useState(false)
  const [paused, setPaused] = useState(false)
  const [rate, setRate] = useState(1)
  const [odom, setOdom] = useState(0)
  const [clock, setClock] = useState('')

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setLat(p.coords.latitude),
        () => {},
        { timeout: 3500, maximumAge: 86400000 },
      )
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const eng = createEngine({
      canvas,
      lat,
      scale,
      theme: 'dark',
      rate,
      paused,
      onReady: () => setReady(true),
      onTapBody: () => setStory(true),
    })
    engineRef.current = eng
    return () => {
      eng.dispose()
      engineRef.current = null
    }
    // Engine is a session. Scale/lat/rate stream in via setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { engineRef.current?.setScale(scale) }, [scale])
  useEffect(() => { engineRef.current?.setLat(lat) }, [lat])
  useEffect(() => { engineRef.current?.setRate(rate) }, [rate])
  useEffect(() => { engineRef.current?.setPaused(paused) }, [paused])

  useEffect(() => {
    let id = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      if (!paused) setOdom((d) => d + speedForScale(scale, lat) * (dt / 3600) * rate)
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [paused, rate, scale, lat])

  useEffect(() => {
    const stamp = () => {
      const d = new Date()
      setClock(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }
    stamp()
    const id = window.setInterval(stamp, 15000)
    return () => window.clearInterval(id)
  }, [])

  const def = SCALES.find((s) => s.id === scale)!
  const kms = speedForScale(scale, lat)

  const pickScale = (id: ScaleId) => {
    haptic()
    setScale(id)
    setStory(false)
  }

  return (
    <div className="vel-app">
      <canvas ref={canvasRef} className="vel-canvas" aria-label="Velocity simulation" />
      {!ready && (
        <div className="vel-boot" role="status">
          <span className="vel-boot-mark" aria-hidden="true" />
          <p>Velocity</p>
          <small>Lighting the disc</small>
        </div>
      )}

      <header className="vel-status">
        <span className="vel-status-app">Velocity</span>
        <span className="vel-status-live">{paused ? 'Paused' : 'Live'}</span>
        <time>{clock}</time>
      </header>

      <section className="vel-hud" aria-live="polite">
        <p className="vel-kicker">{def.kicker}</p>
        <button
          type="button"
          className="vel-speed"
          onClick={() => { haptic(4); setUnit((u) => NEXT_UNIT[u]) }}
        >
          {formatSpeed(kms, unit)}
        </button>
        <p className="vel-eq">{def.equivalent(kms)}</p>
        <p className="vel-odom">
          <span>Since open</span>
          <code>{formatDistance(odom, unit)}</code>
        </p>
        {scale === 'earth' && (
          <label className="vel-lat">
            <span>{latHemisphere(lat)}</span>
            <input
              type="range"
              min={-80}
              max={80}
              step={0.5}
              value={lat}
              onChange={(e) => setLat(Number(e.target.value))}
            />
          </label>
        )}
      </section>

      <div className="vel-dock">
        <button type="button" onClick={() => { haptic(); setOdom(0) }}>Reset</button>
        <button type="button" className="vel-dock-main" onClick={() => { haptic(); setPaused((p) => !p) }}>
          {paused ? 'Play' : 'Pause'}
        </button>
        {[1, 5, 20].map((n) => (
          <button
            key={n}
            type="button"
            className={rate === n ? 'is-on' : ''}
            onClick={() => { haptic(4); setRate(n); setPaused(false) }}
          >
            {n}×
          </button>
        ))}
        <button type="button" onClick={() => { haptic(); setStory(true) }} aria-label="Open note">Note</button>
      </div>

      <nav className="vel-tabs" aria-label="Frame of reference">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={t.id === scale ? 'is-on' : ''}
            onClick={() => pickScale(t.id)}
          >
            <span className="vel-tab-glyph" aria-hidden="true">{t.glyph}</span>
            {t.label}
          </button>
        ))}
      </nav>

      <aside className={`vel-sheet ${story ? 'is-open' : ''}`} aria-hidden={!story}>
        <button type="button" className="vel-handle" onClick={() => setStory(false)} aria-label="Close note">
          <span />
        </button>
        <p className="vel-kicker">{def.kicker}</p>
        <h1>{def.name}</h1>
        {def.story.map((p) => <p key={p.slice(0, 28)}>{p}</p>)}
        <p className="vel-credit">
          Earth: NASA Blue Marble / city lights. Sun: NASA SDO when the feed answers.
          Drag to orbit. Pinch to move in. Space stays black on purpose.
        </p>
      </aside>
    </div>
  )
}
