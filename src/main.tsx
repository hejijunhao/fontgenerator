import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

if (import.meta.env.VITE_E2E_HOOKS === 'true') {
  import('@/store/projectStore').then(({ useProjectStore }) => {
    ;(window as Window & { __FONTGEN_E2E__?: { useProjectStore: typeof useProjectStore } })
      .__FONTGEN_E2E__ = { useProjectStore }
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)