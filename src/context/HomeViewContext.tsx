import React, { createContext, useContext, useState } from 'react'

export type ViewMode = 'spiral' | 'list'

interface HomeViewContextType {
  isHome: boolean
  mode: ViewMode
  pendingBack: boolean
  setIsHome: (isHome: boolean) => void
  setMode: (mode: ViewMode) => void
  toggle: () => void
  triggerBack: () => void
  ackBack: () => void
}

const HomeViewContext = createContext<HomeViewContextType | undefined>(undefined)

export const HomeViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHome, setIsHomeState] = useState(false)
  const [mode, setModeState] = useState<ViewMode>('spiral')
  const [pendingBack, setPendingBack] = useState(false)

  const setIsHome = (value: boolean) => setIsHomeState(value)
  const setMode = (m: ViewMode) => setModeState(m)
  const toggle = () => setModeState(prev => prev === 'spiral' ? 'list' : 'spiral')
  const triggerBack = () => setPendingBack(true)
  const ackBack = () => setPendingBack(false)

  return (
    <HomeViewContext.Provider
      value={{ isHome, mode, pendingBack, setIsHome, setMode, toggle, triggerBack, ackBack }}
    >
      {children}
    </HomeViewContext.Provider>
  )
}

export const useHomeView = () => {
  const context = useContext(HomeViewContext)
  if (!context) throw new Error('useHomeView must be used within HomeViewProvider')
  return context
}
