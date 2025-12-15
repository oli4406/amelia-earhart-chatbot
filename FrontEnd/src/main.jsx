/**
 * Main entry point for the React application.
 * 
 * Sets up the root React DOM and configures:
 * - React Router with BrowserRouter for client-side routing
 * - Global CSS styling (index.css and theme.css)
 * - Navigation bar and main App components
 * 
 * In development mode, clears authentication-related localStorage items
 * (authToken and hasUser) to facilitate easier testing.
 * 
 * @module main
 * @requires react-dom/client
 * @requires react-router-dom
 * @requires ./App.jsx
 * @requires ./NavBar.jsx
 * @requires ./index.css
 * @requires ./theme.css
 */
import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import './theme.css'
import App from './App.jsx'
import NavBar from './NavBar.jsx'


//clear local storage auth data in dev mode for easier testing
if (import.meta?.env?.DEV) {
  try {
    localStorage.removeItem('authToken')
    localStorage.removeItem('hasUser')
    console.log('[dev] cleared authToken and hasUser from localStorage')
  } catch (e) {
    console.warn('[dev] failed clearing auth data', e)
  }
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <NavBar />
    <App />
  </BrowserRouter>
)