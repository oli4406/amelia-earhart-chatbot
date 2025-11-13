import { Routes, Route } from 'react-router-dom'
import Home from './Home.jsx'
import ChatPage from './ChatPage.jsx'
import History from './History.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'


export default function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/history" element={<History />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

