import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import './Loader.css'

interface LoaderProps {
  onEntered?: () => void
}

export default function Loader({ onEntered }: LoaderProps) {
  const [isExiting, setIsExiting] = useState(false)
  const barRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      if (onEntered) {
        onEntered()
      }
      setTimeout(() => {
        // Animation complete
      }, 500)
    }, 1200)

    return () => clearTimeout(timer)
  }, [onEntered])

  useEffect(() => {
    const bars = barRefs.current.filter(Boolean) as HTMLElement[]
    if (bars.length === 0) return

    if (!isExiting) {
      // Entrance animation
      gsap.fromTo(
        bars,
        {
          scaleX: 0,
          opacity: 0
        },
        {
          scaleX: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.1
        }
      )
    } else {
      // Exit animation
      gsap.to(bars, {
        opacity: 0,
        y: -30,
        duration: 0.5,
        ease: 'power3.in',
        stagger: -0.08
      })
    }
  }, [isExiting])

  if (isExiting) return null

  return (
    <div className="loader-wrapper">
      <div className="loader-container">
        <div className="et-mark">E</div>
        <div className="loader-bars">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="loader-bar"
              ref={(el) => {
                barRefs.current[i] = el
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
