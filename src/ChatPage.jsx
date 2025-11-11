
import InputField from './InputField'
import { useState } from 'react'
import './App.css'


function App() {
  const [value, setValue] = useState('')
  const [messages, setMessages] = useState([])

  const handleSubmit = () => {
    if (!value.trim()) return
    setMessages((prev) => [...prev, value.trim()])
    setValue('')
  }

  return (
    <div className="App" style={{ padding: 20 }}>
      <h1>Amelia Earhart Chatbot — Plan your flights!</h1>

      <div style={{ marginBottom: 12 }}>
        {messages.length === 0 ? (
          <em>No questions yet. Type something and press Send or Enter.</em>
        ) : (
          <ul>
            {messages.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        )}
      </div>

      <InputField value={value} onChange={setValue} onSubmit={handleSubmit} />
    </div>
  )
}

export default App
