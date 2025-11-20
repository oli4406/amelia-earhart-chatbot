import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import NavBar from './NavBar.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <NavBar />
    <App />
  </BrowserRouter>
)

