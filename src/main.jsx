import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { preloadPublicContent } from './lib/content'

// Start fetching shared content in parallel with the first render.
if (!window.location.pathname.startsWith('/admin')) preloadPublicContent()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
