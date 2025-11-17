
import InputField from './InputField'
import { useState, useRef, useEffect } from 'react'
import './App.css'

let nextId = 1

function ChatPage() {
  const [value, setValue] = useState('')
  const [messages, setMessages] = useState([   /* messages are stored as an array*/
    {id: nextId++, role: 'bot', text: "Hello, I'm Amelia Earhart. Want to talk about the skies?"}])
  const containerRef = useRef(null)

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed) return       /*added a user messge object so your not talking to yourself */
    const userMsg = {id: nextId++, role: 'user', text: trimmed}
    // persist user input to localStorage history only if user is logged in
    const isLoggedIn = () => {
      try {
        // simple client-side check: presence of a currentUser key
        return !!localStorage.getItem('currentUser')
      } catch (e) {
        return false
      }
    }

    if (isLoggedIn()) {
      try {
        const raw = localStorage.getItem('chat_history')
        const arr = raw ? JSON.parse(raw) : []
        arr.push({ id: userMsg.id, text: userMsg.text, ts: Date.now() })
        localStorage.setItem('chat_history', JSON.stringify(arr))
      } catch (err) {
        // ignore storage errors
        console.warn('Failed to save chat history', err)
      }
    } else {
      // show a transient notice to the user that history wasn't saved
      setSaveNotice(true)
      window.setTimeout(() => setSaveNotice(false), 3000)
    }

    const botReplyTxt = placeholderReply(trimmed) /*here is the Amelia text, placeholder to simulate convo */
    const botMsg = {id: nextId++, role: 'bot', text: botReplyTxt}
    setMessages((prev) => [...prev, userMsg, botMsg])
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

  const [saveNotice, setSaveNotice] = useState(false)

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
              <div key={i} className={`message-line ${i % 2 === 0 ? 'bot' : 'user'}`}>    {/*switched around the sides of the conversation */}
                <div className="message-bubble">
                  {m.text}    {/*renders the text, not the whole object*/}
                </div>
                {/* Added alternating messages (later change to Amelia vs user) and bubbled messages */}
              </div>
            ))
          )}
        </div>
      </div>

      <InputField value={value} onChange={setValue} onSubmit={handleSubmit} />
      {saveNotice && (
        <div style={{ color: '#b45309', marginTop: 8 }}>
          Sign in to save your questions to History.
        </div>
      )}
    </div>
  )
}
//placeholder text for the 'bot' to simulate a conversation
function placeholderReply(userText){
  return "Placeholder Text"
}

export default ChatPage


