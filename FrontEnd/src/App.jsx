import { Routes, Route } from 'react-router-dom'
import Home from './Home.jsx'
import ChatPage from './ChatPage.jsx'
import History from './History.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'
import ForgotPassword from './ForgotPassword.jsx'


/**
 * App - Main application router component
 * 
 * Renders the main routing configuration for the application, providing navigation
 * between different pages and features of the Amelia Earhart chatbot application.
 * 
 * @component
 * @returns {JSX.Element} The Routes component containing all application routes:
 *   - "/" - Home page (index route)
 *   - "/chat" - Chat page for interacting with the chatbot
 *   - "/history" - Chat history page
 *   - "/login" - User login page
 *   - "/register" - User registration page
 *   - "/forgotpassword" - Password recovery page
 */
export default function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/history" element={<History />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
    </Routes>
  )
}

