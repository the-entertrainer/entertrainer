import { useEffect } from 'react'
import './DetailPages.css'

export default function AboutPage() {
  useEffect(() => {
    document.documentElement.dataset.about = 'true'
    return () => {
      delete document.documentElement.dataset.about
    }
  }, [])

  return (
    <div className="about-wrap">
      <div className="about-container">
        <h1 className="about-intro anim">
          I am Naveen, and I'm an Instructional Designer.
        </h1>

        <hr className="about-rule anim" />

        <p className="about-lead anim">
          Finding Instructional Design as a career was never planned—it was a discovery.
        </p>

        {/* Content will be added from the original Vue component */}
        <p className="placeholder-text">
          [Full about page content will be added here]
        </p>
      </div>
    </div>
  )
}
