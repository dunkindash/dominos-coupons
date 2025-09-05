/**
 * src/main.tsx
 * 
 * Application Entry Point
 * 
 * Requirements:
 * - React 19+
 * - TypeScript 5.0+
 * - Vite 5.0+
 * 
 * Dependencies:
 * - react: StrictMode wrapper for development checks
 * - react-dom/client: Modern React 18+ rendering API
 * - ./App.tsx: Main application component
 * - ./index.css: Global styles and Tailwind CSS imports
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
