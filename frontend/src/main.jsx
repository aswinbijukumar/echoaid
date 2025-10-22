import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import logger from './utils/prettyLogger.js'

// Initialize pretty logging
logger.appInit('1.0.0', import.meta.env.MODE);

createRoot(document.getElementById('root')).render(
  <App />
)
