import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext'
import { PresenceProvider } from './contexts/PresenceContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <PresenceProvider>
        <App />
      </PresenceProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
