
import InputField from './InputField'
import { useState, useRef, useEffect } from 'react'
import './App.css'


function ChatPage() {
  const [value, setValue] = useState('')
  const [messages, setMessages] = useState([])
  const containerRef = useRef(null)

  const handleSubmit = () => {
    if (!value.trim()) return
    setMessages((prev) => [...prev, value.trim()])
    setValue('')
  }

  useEffect(() => {
    document.title = 'Chat | Amelia Earhart Chatbot';
  }, []);

  // auto-scroll to bottom when messages change
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    // smooth scroll to bottom so user sees the newest question
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages])

  return (
    <div className="App chat-container">
      <h1>Amelia Earhart Chatbot — Plan your flights!</h1>

      {/* fixed-size messages window with horizontal (side) scrolling */}
      <div className="messages-wrapper">
  <div className="messages-window" ref={containerRef}>
          {messages.length === 0 ? (
            <div className="empty-message">
              <em>No questions yet. Type something and press Send or Enter.</em>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className="message-line">
                {m}
              </div>
            ))
          )}
        </div>
      </div>

      <InputField value={value} onChange={setValue} onSubmit={handleSubmit} />
    </div>
  )
}

export default ChatPage
