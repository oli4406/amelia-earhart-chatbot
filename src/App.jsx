import { Routes, Route } from 'react-router-dom'
import Home from './Home.jsx'
import ChatPage from './ChatPage.jsx'
import History from './History.jsx'

export default function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/history" element={<History />} />
    </Routes>
  )
}

