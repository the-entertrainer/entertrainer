import { useEffect, useRef, useState } from 'react'
import { createEngine, type VelocityEngine } from './engine'
import {
  SCALES, type ScaleId, type SpeedUnit, NEXT_UNIT,
  formatSpeed, formatDistance, speedForScale, latHemisphere,
} from './scales'
import './velocity.css'

export function VelocityApp() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<VelocityEngine | null>(null)
  const [scale, setScale] = useState<ScaleId>('earth')
  const [unit, setUnit] = useState<SpeedUnit>('km/h')
  const [lat, setLat] = useState(28.6)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [ready, setReady] = useState(false)
  const [story, setStory] = useState(false)
  const [paused, setPaused] = useState(false)
  const [rate, setRate] = useState(1)
  const [odom, setOdom] = useState(0)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((p) => setLat(p.coords.latitude), () => {}, { timeout: 3500, maximumAge: 86400000 })
    }
  }, [])

  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const eng = createEngine({
      canvas, lat, scale, theme, rate, paused,
      onReady: () => setReady(true),
      onTapBody: () => setStory(true),
    })
    engineRef.current = eng
    return () => { eng.dispose(); engineRef.current = null }
  }, [])

  useEffect(() => { engineRef.current?.setScale(scale) }, [scale])
  useEffect(() => { engineRef.current?.setLat(lat) }, [lat])
  useEffect(() => { engineRef.current?.setTheme(theme) }, [theme])
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

  const def = SCALES.find((s) => s.id === scale)!
  const kms = speedForScale(scale, lat)

  return (
    <div className="vel-root" data-theme={theme}>
      <canvas ref={canvasRef} className="vel-canvas" aria-label="Velocity simulation" />
      {!ready && <div className="vel-boot">Velocity</div>}
      <div className="vel-glass vel-left">
        <p className="vel-kicker">Perspective</p>
        {SCALES.map((s) => (
          <button key={s.id} type="button" className={s.id === scale ? 'is-on' : ''} onClick={() => { setScale(s.id); setStory(false) }}>
            {s.name}
          </button>
        ))}
        {scale === 'earth' && (
          <label className="vel-lat">
            Latitude {latHemisphere(lat)}
            <input type="range" min={-80} max={80} step={0.5} value={lat} onChange={(e) => setLat(Number(e.target.value))} />
          </label>
        )}
      </div>
      <header className="vel-top">
        <button type="button" className="vel-mark" onClick={() => setStory(true)} aria-label="Open note">
          <svg viewBox="0 0 32 32" width="20" height="20"><path d="M8 24 L16 8 L24 24 L20.6 24 L16 14.6 L11.4 24 Z" fill="currentColor" /></svg>
        </button>
        <div>
          <span className="vel-kicker">Velocity</span>
          <strong>{def.name}</strong>
        </div>
        <button type="button" className="vel-ghost" onClick={() => setTheme((t) => t === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? 'Paper' : 'Ink'}
        </button>
      </header>
      <div className="vel-glass vel-right">
        <p className="vel-kicker">Telemetry</p>
        <button type="button" className="vel-speed" onClick={() => setUnit((u) => NEXT_UNIT[u])}>
          <span className="vel-kicker">{def.kicker}</span>
          <b>{formatSpeed(kms, unit)}</b>
        </button>
        <div className="vel-odom">
          <span className="vel-kicker">Odometer</span>
          <code>{formatDistance(odom, unit)}</code>
        </div>
        <p className="vel-eq">{def.equivalent(kms)}</p>
        <p className="vel-fix">{latHemisphere(lat)}</p>
      </div>
      <div className="vel-bar">
        <button type="button" onClick={() => setOdom(0)} aria-label="Rewind">Rewind</button>
        <button type="button" onClick={() => setPaused((p) => !p)}>{paused ? 'Play' : 'Pause'}</button>
        {[0.25, 1, 5, 20].map((n) => (
          <button key={n} type="button" className={rate === n ? 'is-on' : ''} onClick={() => { setRate(n); setPaused(false) }}>{n}x</button>
        ))}
      </div>
      <aside className={`vel-sheet ${story ? 'is-open' : ''}`}>
        <button type="button" className="vel-handle" onClick={() => setStory(false)}><span /></button>
        <p className="vel-kicker">{def.kicker}</p>
        <h1>{def.name}</h1>
        {def.story.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
        <p className="vel-credit">Blue Marble / night lights via NASA. Sun: NASA SDO when the feed answers.</p>
      </aside>
    </div>
  )
}
