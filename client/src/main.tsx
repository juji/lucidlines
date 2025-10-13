import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// Make sure xterm CSS is loaded globally
import '@xterm/xterm/css/xterm.css'
// Import custom terminal styles for alignment fixes
import './terminal.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
