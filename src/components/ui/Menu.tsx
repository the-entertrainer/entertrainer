import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FiSun, FiMoon, FiList, FiGrid } from 'react-icons/fi'
import gsap from 'gsap'
import { useMenu } from '../../context/MenuContext'
import { useTheme } from '../../context/ThemeContext'
import { useHomeView } from '../../context/HomeViewContext'
import { useExperience } from '../../context/ExperienceContext'
import { useContent } from '../../context/ContentContext'
import './Menu.css'

export default function Menu() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isOpened, close, toggle } = useMenu()
  const { isDark, setTheme } = useTheme()
  const { isHome, mode, toggle: toggleView } = useHomeView()
  const { hasEntered } = useExperience()
  const { email } = useContent()

  const itemRefs = useRef<(HTMLElement | null)[]>([])

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

  const links = [
    { label: 'home', to: '/', external: false },
    { label: 'linkedin', to: 'https://www.linkedin.com/in/entertrainer/', external: true },
    { label: 'contact', to: `mailto:${email}`, external: true }
  ]

  useEffect(() => {
    const items = itemRefs.current.filter(Boolean) as HTMLElement[]
    gsap.killTweensOf(items)

    if (reduceMotion) {
      gsap.to(items, { opacity: isOpened ? 1 : 0, duration: 0.2, delay: isOpened ? 0.2 : 0 })
      return
    }

    if (isOpened) {
      gsap.to(items, {
        y: 0,
        x: 0,
        opacity: 1,
        duration: 0.5,
        delay: 0.2,
        ease: 'power2.out',
        stagger: 0.08
      })
    } else {
      gsap.to(items, {
        y: -20,
        x: 20,
        opacity: 0,
        duration: 0.2,
        ease: 'power4.out',
        stagger: -0.05
      })
    }
  }, [isOpened, reduceMotion])

  const handleThemeToggle = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  const handleViewToggle = () => {
    toggleView()
    close()
  }

  const handleBack = () => {
    close()
    if (location.pathname === '/') {
      // TODO: Trigger spiral back
    } else {
      navigate(-1)
    }
  }

  const handleLinkClick = (to: string, external: boolean) => {
    if (external) {
      window.open(to, '_blank', 'noopener,noreferrer')
    } else {
      navigate(to)
    }
    close()
  }

  const showViewToggle = isHome && hasEntered

  return (
    <>
      {isOpened && <div className="e-backdrop" onClick={close} />}

      <nav className={`e-nav ${isOpened ? 'panel-open' : ''}`}>
        <div className={`e-panel ${isOpened ? 'open' : ''}`}>
          <div className="e-panel-inner">
            <div className="e-nav-group">
              <button
                className="e-item e-back"
                ref={(el) => {
                  itemRefs.current[0] = el
                }}
                onClick={handleBack}
              >
                ← back
              </button>

              {links.map((link, i) => (
                <a
                  key={link.label}
                  href={link.external ? link.to : undefined}
                  onClick={(e) => {
                    if (!link.external) {
                      e.preventDefault()
                      handleLinkClick(link.to, false)
                    }
                  }}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="e-item e-link"
                  ref={(el) => {
                    itemRefs.current[i + 1] = el
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div
              className="e-controls"
              ref={(el) => {
                if (el) itemRefs.current[links.length + 1] = el
              }}
            >
              <button
                className={`e-ctl ${isDark ? 'alt' : ''}`}
                onClick={handleThemeToggle}
                aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              >
                <span className="ic-wrap">
                  <FiSun className="ic ic-sun" />
                  <FiMoon className="ic ic-moon" />
                </span>
                <span className="e-ctl-label">{isDark ? 'dark' : 'light'}</span>
              </button>

              {showViewToggle && (
                <button
                  className={`e-ctl e-view-ctl ${mode === 'list' ? 'alt' : ''}`}
                  onClick={handleViewToggle}
                  aria-label={mode === 'spiral' ? 'Switch to list view' : 'Switch to spiral view'}
                >
                  <span className="ic-wrap">
                    <FiList className="ic ic-list" />
                    <FiGrid className="ic ic-grid" />
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          className="e-btn e-btn-menu"
          onClick={toggle}
          aria-label="Toggle menu"
          aria-expanded={isOpened}
        >
          <span className="e-btn-mark">E</span>
        </button>
      </nav>
    </>
  )
}
