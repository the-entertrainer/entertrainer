import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { useHomeView } from '../context/HomeViewContext'
import SpiralView from '../components/SpiralView'
import './HomePage.css'

type Section = 'home' | 'tools' | 'downloads' | 'my-work'

export default function HomePage() {
  const navigate = useNavigate()
  const { homeNav, toolsNav, downloadsNav, myWorkNav } = useContent()
  const { setIsHome } = useHomeView()

  const [sectionStack, setSectionStack] = useState<Section[]>(['home'])

  const currentSection = sectionStack[sectionStack.length - 1]

  const sectionItems = {
    home: homeNav,
    tools: toolsNav,
    downloads: downloadsNav,
    'my-work': myWorkNav
  }[currentSection] || []

  const sectionTitles: Record<Section, string> = {
    home: '',
    tools: 'Web Apps',
    downloads: 'Downloads',
    'my-work': 'My Work'
  }

  useEffect(() => {
    setIsHome(true)
  }, [setIsHome])

  const handleCardClick = (href: string) => {
    const sectionRoutes: Record<string, Section> = {
      '/tools': 'tools',
      '/downloads': 'downloads',
      '/my-work': 'my-work'
    }

    if (href in sectionRoutes) {
      setSectionStack([...sectionStack, sectionRoutes[href]])
    } else {
      navigate(href)
    }
  }

  return (
    <SpiralView
      items={sectionItems}
      showLoader={true}
      showViewSwitch={true}
      title={sectionTitles[currentSection]}
      onCardClick={handleCardClick}
    />
  )
}
