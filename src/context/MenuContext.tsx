import React, { createContext, useContext, useState } from 'react'

interface MenuContextType {
  isOpened: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpened, setIsOpened] = useState(false)

  const open = () => setIsOpened(true)
  const close = () => setIsOpened(false)
  const toggle = () => setIsOpened(prev => !prev)

  return (
    <MenuContext.Provider value={{ isOpened, open, close, toggle }}>
      {children}
    </MenuContext.Provider>
  )
}

export const useMenu = () => {
  const context = useContext(MenuContext)
  if (!context) throw new Error('useMenu must be used within MenuProvider')
  return context
}
