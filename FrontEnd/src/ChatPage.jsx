
import ChatField from './ChatField.jsx'
import TypingIndicator from './TypingIndicator.jsx'
import { useState, useRef, useEffect } from 'react'
import './App.css'

let nextId = 1

function ChatPage() {
  const [value, setValue] = useState('')
  const [messages, setMessages] = useState([   /* messages are stored as an array*/
    {id: nextId++, role: 'bot', text: "Hello, I'm Amelia Earhart. Want to talk about the skies?"}])
  const containerRef = useRef(null)

  const handleSubmit = async () => { // async function so we can await server response
    const trimmed = value.trim()
    if (!trimmed) return
    const userMsg = {id: nextId++, role: 'user', text: trimmed}
    // persist user input to localStorage history only if user is logged in
    const isLoggedIn = () => {
      try {
        // accept either 'authToken' or legacy 'hasUser' flag
        return !!localStorage.getItem('authToken') || !!localStorage.getItem('hasUser')
      } catch (e) {
        console.warn('Failed to access localStorage', e)
        return false
      }
    }

    // only show a transient notice if user is not logged in; actual save
    // of the question+answer pair happens after we receive the bot reply
    if (!isLoggedIn()) {
      // show a transient notice to the user that history wasn't saved
      setSaveNotice(true)
      window.setTimeout(() => setSaveNotice(false), 3000)
    }

    // optimistic update: show user message immediately
    setMessages((prev) => [...prev, userMsg])
    setValue('')
  // show typing indicator while we wait for the bot response
  setIsTyping(true)

    try {
      const token = localStorage.getItem('authToken')

      const res = await fetch('http://localhost:3000/api/chat/message', {
        method: 'POST',
        headers: {'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({message: trimmed}),
      })

      // check for HTTP error

      // try to parse JSON, fallback to plain text
      let serverText
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await res.json()

        if (data.status) {
          if (data.status == 'searching') {
            // TODO: server has sent message to say it is searching flight information
            // Add followup typing bubble
          }
        }

        serverText = data.reply ?? data.message ?? JSON.stringify(data)
      } else {
        serverText = await res.text()
      }

      const botMsg = {id: nextId++, role: 'bot', text: serverText}

      if (token) {
        fetch('http://localhost:3000/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            question: userMsg.text,
            answer: serverText
          })
        }).catch(err => {
          console.warn('Failed to persist chat history', err)
        })
      }

      // hide typing indicator and append bot message
      setIsTyping(false)
      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      console.error('Error communicating with server:', err)
      const botMsg = {id: nextId++, role: 'bot', text: 'Sorry, the response got lost somewhere over the Pacific Ocean.'}

      // On error also save the Q/A pair (with the error text as answer) if logged in
      if (isLoggedIn()) {
        try {
          const raw = localStorage.getItem('chat_history')
          const arr = raw ? JSON.parse(raw) : []
          arr.push({ id: userMsg.id, question: userMsg.text, answer: botMsg.text, ts: Date.now() })
          localStorage.setItem('chat_history', JSON.stringify(arr))
        } catch (err) {
          console.warn('Failed to save chat history', err)
        }
      }

      // hide typing indicator and show error message
      setIsTyping(false)
      setMessages((prev) => [...prev, botMsg])
    }
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

  // keep track of whether the bot is currently composing a reply
  const [isTyping, setIsTyping] = useState(false)

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
              <div key={i} className={`message-line ${m.role ?? (i % 2 === 0 ? 'bot' : 'user')}`}>  {/*alternating message styles for bot vs user*/}
                <div className="message-bubble">
                  {m.text.split("\n").map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              </div>
            ))
          )}
          {/* show typing indicator as a bot bubble while waiting for reply */}
          {isTyping && (
            <div className={`message-line bot`}>
              <div className="message-bubble">
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>
      </div>

      <ChatField value={value} onChange={setValue} onSubmit={handleSubmit} />
      {saveNotice && <p className="save-notice">Chat history not saved (you are not logged in)</p>}
      <p className="keyboard-tips">
        <strong>Keyboard tips:</strong> Press Enter to send, Shift+Enter for a new
        line. Press Esc to close the Settings panel.
      </p>
    </div>
  )
}

export default ChatPage