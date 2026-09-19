import { useEffect, useRef, useState } from 'react'
import { createEngine, type VelocityEngine } from './engine'
import {
  SCALES,
  type ScaleId,
  type SpeedUnit,
  NEXT_UNIT,
  formatSpeed,
  speedForScale,
  latHemisphere,
} from './scales'
import './velocity.css'

const UNIT_KEY = 'velocity-unit-v1'
const THEME_KEY = 'velocity-theme-v1'
const LAT_KEY = 'velocity-lat-v1'

export function VelocityApp() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<VelocityEngine | null>(null)
  const [scale, setScale] = useState<ScaleId>('earth')
  const [unit, setUnit] = useState<SpeedUnit>('km/h')
  const [lat, setLat] = useState(28.6)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [ready, setReady] = useState(false)
  const [story, setStory] = useState(false)
  const [hint, setHint] = useState('Drag to turn. Tap the body for the note.')

  useEffect(() => {
    try {
      const u = localStorage.getItem(UNIT_KEY) as SpeedUnit | null
      if (u && NEXT_UNIT[u]) setUnit(u)
      const th = localStorage.getItem(THEME_KEY)
      if (th === 'light' || th === 'dark') setTheme(th)
      const l = Number(localStorage.getItem(LAT_KEY))
      if (Number.isFinite(l)) setLat(l)
      else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (p) => setLat(p.coords.latitude),
          () => {},
          { maximumAge: 86_400_000, timeout: 4000 },
        )
      }
    } catch { /* */ }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem(THEME_KEY, theme) } catch { /* */ }
  }, [theme])
  useEffect(() => {
    try { localStorage.setItem(UNIT_KEY, unit) } catch { /* */ }
  }, [unit])
  useEffect(() => {
    try { localStorage.setItem(LAT_KEY, String(lat)) } catch { /* */ }
  }, [lat])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const eng = createEngine({
      canvas,
      lat,
      scale,
      theme,
      onReady: () => setReady(true),
      onTapBody: () => setStory(true),
      onLat: (v) => setLat(Math.round(v * 10) / 10),
    })
    engineRef.current = eng
    return () => {
      eng.dispose()
      engineRef.current = null
    }
  }, [])

  useEffect(() => { engineRef.current?.setScale(scale) }, [scale])
  useEffect(() => { engineRef.current?.setLat(lat) }, [lat])
  useEffect(() => { engineRef.current?.setTheme(theme) }, [theme])

  useEffect(() => {
    setHint(scale === 'earth' ? 'Drag to orbit. Open the note for latitude.' : 'Drag to turn. Tap for the note.')
    const id = window.setTimeout(() => setHint(''), 3800)
    return () => window.clearTimeout(id)
  }, [scale])

  const def = SCALES.find((s) => s.id === scale)!
  const kms = speedForScale(scale, lat)
  const idx = SCALES.findIndex((s) => s.id === scale)

  return (
    <div className="vel-root" data-theme={theme}>
      <canvas ref={canvasRef} className="vel-canvas" aria-label="Velocity scene" />
      {!ready && <div className="vel-boot">Velocity</div>}
      <header className="vel-top">
        <button type="button" className="vel-mark" onClick={() => setStory(true)} aria-label="Open story">
          <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
            <path d="M8 24 L16 8 L24 24 L20.6 24 L16 14.6 L11.4 24 Z" fill="currentColor" />
          </svg>
        </button>
        <div className="vel-brand">
          <span>Velocity</span>
          <em>{def.name}</em>
        </div>
        <button type="button" className="vel-ghost" onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}>
          {theme === 'dark' ? 'Paper' : 'Ink'}
        </button>
      </header>
      <button type="button" className="vel-readout" onClick={() => setUnit((u) => NEXT_UNIT[u])}>
        <span className="vel-kicker">{def.kicker}</span>
        <strong>{formatSpeed(kms, unit)}</strong>
        <span className="vel-sub">{latHemisphere(lat)}</span>
      </button>
      {hint && <p className="vel-hint">{hint}</p>}
      <nav className="vel-rail" aria-label="Scales">
        {SCALES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={s.id === scale ? 'is-on' : ''}
            onClick={() => { setScale(s.id); setStory(false) }}
          >
            <i>{String(i + 1).padStart(2, '0')}</i>
            {s.name}
          </button>
        ))}
      </nav>
      <aside className={`vel-sheet ${story ? 'is-open' : ''}`} aria-hidden={!story}>
        <button type="button" className="vel-handle" onClick={() => setStory(false)} aria-label="Close">
          <span />
        </button>
        <p className="vel-kicker">{def.kicker}</p>
        <h1>{def.name}</h1>
        <p className="vel-meta">{latHemisphere(lat)} · {formatSpeed(kms, unit)}</p>
        {scale === 'earth' && (
          <label className="vel-lat">
            Latitude
            <input type="range" min={-80} max={80} step={0.5} value={lat} onChange={(e) => setLat(Number(e.target.value))} />
          </label>
        )}
        {def.story.map((p) => <p key={p.slice(0, 28)}>{p}</p>)}
        <p className="vel-credit">Blue Marble and night lights via NASA / three-globe. Sun from NASA SDO when the feed answers.</p>
      </aside>
      <div className="vel-progress" aria-hidden="true">
        {SCALES.map((s, i) => <i key={s.id} className={i === idx ? 'is-on' : ''} />)}
      </div>
    </div>
  )
}
