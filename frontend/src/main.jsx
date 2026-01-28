import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.js'
import './index.css'
import './styles/editor.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  // Temporarily disable StrictMode to prevent double-rendering issues with templates
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
)
