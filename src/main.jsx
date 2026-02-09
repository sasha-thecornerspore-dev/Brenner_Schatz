import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CaseProvider } from './context/CaseContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CaseProvider>
      <App />
    </CaseProvider>
  </StrictMode>,
)

