import {
  useEffect,
  useRef,
  useState
} from 'react'
import gsap from 'gsap'
import { useTheme } from '../context/ThemeContext'
import { useExperience } from '../context/ExperienceContext'
import { useHomeView } from '../context/HomeViewContext'
import type { NavItem } from '../context/ContentContext'
import Loader from './ui/Loader'
import './SpiralView.css'

interface SpiralViewProps {
  items: NavItem[]
  showLoader?: boolean
  showViewSwitch?: boolean
  title?: string
  onCardClick: (href: string) => void
}

export default function SpiralView({
  items,
  showLoader = false,
  showViewSwitch = false,
  title = '',
  onCardClick
}: SpiralViewProps) {
  const { isDark } = useTheme()
  const { hasEntered, setHasEntered } = useExperience()
  const { mode } = useHomeView()

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const atmoRef = useRef<HTMLCanvasElement | null>(null)
  const dollyOverlayRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  const [isLoaderDone, setIsLoaderDone] = useState(!showLoader || hasEntered)
  const isListMode = showViewSwitch && mode === 'list'

  // Atmosphere canvas animation state
  const atmoCtx = useRef<CanvasRenderingContext2D | null>(null)
  const atmoTile = useRef<HTMLCanvasElement | null>(null)
  const atmoRaf = useRef(0)
  const atmoRunning = useRef(false)
  const atmoT = useRef(0)
  const atmoLast = useRef(0)
  const atmoW = useRef(0)
  const atmoH = useRef(0)
  const atmoIntensity = useRef(0)
  const atmoIntensityTgt = useRef(0)

  // Bake grain texture for atmosphere
  const bakeGrain = (): HTMLCanvasElement => {
    const size = 160
    const g = document.createElement('canvas')
    g.width = size
    g.height = size
    const gc = g.getContext('2d')!
    const img = gc.createImageData(size, size)
    const d = img.data
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255
      d[i] = d[i + 1] = d[i + 2] = v
      d[i + 3] = 20
    }
    gc.putImageData(img, 0, 0)
    return g
  }

  // Resize atmosphere canvas
  const resizeAtmo = () => {
    const cv = atmoRef.current
    if (!cv) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    atmoW.current = window.innerWidth
    atmoH.current = window.innerHeight
    cv.width = Math.floor(atmoW.current * dpr)
    cv.height = Math.floor(atmoH.current * dpr)
    cv.style.width = atmoW.current + 'px'
    cv.style.height = atmoH.current + 'px'
    atmoCtx.current = cv.getContext('2d')!
    atmoCtx.current.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  // Animate atmosphere frame
  const atmoFrame = (now: number) => {
    if (!atmoRunning.current) return
    atmoRaf.current = requestAnimationFrame(atmoFrame)

    const dt = Math.min((now - atmoLast.current) / 1000, 0.05)
    atmoLast.current = now
    atmoT.current += dt

    atmoIntensityTgt.current *= Math.pow(0.18, dt)
    atmoIntensity.current +=
      (atmoIntensityTgt.current - atmoIntensity.current) * Math.min(dt * 6, 1)

    const ctx = atmoCtx.current
    const tile = atmoTile.current
    if (!ctx || !tile) return

    const w = atmoW.current
    const h = atmoH.current
    const dark = isDark
    const kick = atmoIntensity.current

    ctx.clearRect(0, 0, w, h)

    // Atmospheric glow
    const driftX = Math.sin(atmoT.current * 0.13) * 0.06
    const driftY = Math.cos(atmoT.current * 0.09) * 0.04
    const cx = (0.5 + driftX) * w
    const cy = (0.38 + driftY) * h
    const radius = Math.max(w, h) * (0.68 + kick * 0.14)
    const breath = 0.5 + Math.sin(atmoT.current * 0.48) * 0.5
    const baseA = dark ? 0.3 : 0.1
    const glowA = baseA * (0.6 + breath * 0.4 + kick * 0.7)
    const [gR, gG, gB] = dark ? [36, 63, 106] : [180, 120, 55]

    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
    glow.addColorStop(0, `rgba(${gR},${gG},${gB},${Math.min(glowA, 0.8)})`)
    glow.addColorStop(0.5, `rgba(${gR},${gG},${gB},${Math.min(glowA * 0.28, 0.28)})`)
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, w, h)

    // Radial vignette
    const vig = ctx.createRadialGradient(
      w / 2,
      h / 2,
      Math.min(w, h) * 0.22,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.78
    )
    vig.addColorStop(0, 'rgba(0,0,0,0)')
    vig.addColorStop(1, dark ? 'rgba(0,0,0,0.65)' : 'rgba(185,168,148,0.30)')
    ctx.fillStyle = vig
    ctx.fillRect(0, 0, w, h)

    // Grain
    const grainSpeed = 0.6
    const ox = (atmoT.current * grainSpeed * 31.7) % tile.width
    const oy = (atmoT.current * grainSpeed * 17.3) % tile.height
    const pat = ctx.createPattern(tile, 'repeat')
    if (pat) {
      ctx.save()
      ctx.globalAlpha = Math.min(
        ((dark ? 0.55 : 0.14) * (1 + kick * 0.4)),
        0.82
      )
      ctx.translate(-ox, -oy)
      ctx.fillStyle = pat
      ctx.fillRect(ox, oy, w, h)
      ctx.restore()
    }
  }

  const startAtmo = () => {
    if (atmoRunning.current) return
    atmoTile.current = bakeGrain()
    resizeAtmo()
    atmoRunning.current = true
    atmoLast.current = performance.now()
    atmoRaf.current = requestAnimationFrame(atmoFrame)
  }

  const stopAtmo = () => {
    atmoRunning.current = false
    cancelAnimationFrame(atmoRaf.current)
  }

  const onWheel = (e: WheelEvent) => {
    atmoIntensityTgt.current = Math.min(1, Math.abs(e.deltaY) / 280)
  }

  const animateListIn = () => {
    const rows = listRef.current?.querySelectorAll('.nav-row')
    if (!rows?.length) return
    gsap.fromTo(
      rows,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', stagger: 0.07, delay: 0.1 }
    )
  }

  useEffect(() => {
    startAtmo()
    window.addEventListener('resize', resizeAtmo)
    window.addEventListener('wheel', onWheel, { passive: true })

    return () => {
      stopAtmo()
      window.removeEventListener('resize', resizeAtmo)
      window.removeEventListener('wheel', onWheel)
    }
  }, [isDark])

  useEffect(() => {
    if (isListMode) {
      animateListIn()
    }
  }, [isListMode])

  const handleLoaderEntered = () => {
    setIsLoaderDone(true)
    setHasEntered()
  }

  const handleCardClick = (href: string) => {
    if (dollyOverlayRef.current) {
      gsap.to(dollyOverlayRef.current, { opacity: 1, duration: 0.45, ease: 'power2.in' })
    }
    onCardClick(href)
    setTimeout(() => {
      if (dollyOverlayRef.current) {
        gsap.to(dollyOverlayRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out',
          delay: 0.15
        })
      }
    }, 80)
  }

  return (
    <div className="spiral-view">
      {showLoader && !isLoaderDone && (
        <Loader onEntered={handleLoaderEntered} />
      )}

      <canvas
        ref={canvasRef}
        className={`spiral-canvas ${!isLoaderDone || isListMode ? 'hidden' : ''}`}
      />

      <canvas ref={atmoRef} className="spiral-atmo" />

      <div ref={dollyOverlayRef} className="dolly-overlay" />

      {isLoaderDone && isListMode && (
        <div ref={listRef} className="spiral-list">
          {items.map((item) => (
            <button
              key={item.id}
              className="nav-row"
              onClick={() => handleCardClick(item.href)}
            >
              <span className="nav-row__label">{item.label}</span>
              <span className="nav-row__desc">{item.description}</span>
              <span className="nav-row__arrow">→</span>
            </button>
          ))}
        </div>
      )}

      {isLoaderDone && (
        <div className="spiral-ui">
          {title && <p className="spiral-title">{title}</p>}
          {!isListMode && !title && <p className="spiral-hint">scroll to spin · tap to explore</p>}
        </div>
      )}
    </div>
  )
}
