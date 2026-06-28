import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { MenuProvider } from './context/MenuContext'
import { ExperienceProvider } from './context/ExperienceContext'
import { HomeViewProvider } from './context/HomeViewContext'
import App from './App'
import './styles/main.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <MenuProvider>
          <ExperienceProvider>
            <HomeViewProvider>
              <App />
            </HomeViewProvider>
          </ExperienceProvider>
        </MenuProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
