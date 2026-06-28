import React, { createContext, useContext, useState } from 'react'

interface ExperienceContextType {
  hasEntered: boolean
  isReady: boolean
  setHasEntered: () => void
  setReady: () => void
}

const ExperienceContext = createContext<ExperienceContextType | undefined>(undefined)

export const ExperienceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasEntered, setHasEnteredState] = useState(false)
  const [isReady, setReadyState] = useState(false)

  const setHasEntered = () => setHasEnteredState(true)
  const setReady = () => setReadyState(true)

  return (
    <ExperienceContext.Provider value={{ hasEntered, isReady, setHasEntered, setReady }}>
      {children}
    </ExperienceContext.Provider>
  )
}

export const useExperience = () => {
  const context = useContext(ExperienceContext)
  if (!context) throw new Error('useExperience must be used within ExperienceProvider')
  return context
}
