import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ContentProvider } from './context/ContentContext'
import { useHomeView } from './context/HomeViewContext'
import Menu from './components/ui/Menu'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import InstructionalDesignPage from './pages/InstructionalDesignPage'
import MyWorkPage from './pages/MyWorkPage'
import DownloadsPage from './pages/DownloadsPage'
import DetailPage from './pages/DetailPage'
import EasyMCQPage from './pages/tools/EasyMCQPage'
import BetterEmailsPage from './pages/tools/BetterEmailsPage'
import ScribeFlowPage from './pages/tools/ScribeFlowPage'
import TrainingCalGenPage from './pages/tools/TrainingCalGenPage'
import NotFoundPage from './pages/NotFoundPage'

const AppContent = () => {
  const location = useLocation()
  const { setIsHome } = useHomeView()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location])

  useEffect(() => {
    const isHomePath = location.pathname === '/'
    setIsHome(isHomePath)
    if (isHomePath) {
      document.documentElement.removeAttribute('data-about')
    }
  }, [location, setIsHome])

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/about/:slug" element={<DetailPage />} />
        <Route path="/instructional-design" element={<InstructionalDesignPage />} />
        <Route path="/my-work" element={<MyWorkPage />} />
        <Route path="/my-work/:slug" element={<DetailPage />} />
        <Route path="/downloads" element={<DownloadsPage />} />
        <Route path="/downloads/:slug" element={<DetailPage />} />
        <Route path="/tools/easymcq" element={<EasyMCQPage />} />
        <Route path="/tools/better-emails" element={<BetterEmailsPage />} />
        <Route path="/tools/scribeflow" element={<ScribeFlowPage />} />
        <Route path="/tools/training-cal-gen" element={<TrainingCalGenPage />} />
        <Route path="/tools/:slug" element={<DetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Menu />
    </>
  )
}

export default function App() {
  return (
    <ContentProvider>
      <AppContent />
    </ContentProvider>
  )
}
