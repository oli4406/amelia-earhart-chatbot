/**
 * @module components/Home
 */
import { Link } from 'react-router-dom'
import { useEffect } from 'react'

/**
 * Home component for the Amelia Earhart Chatbot application
 * 
 * Displays a welcome message and provides navigation to the chat interface.
 * Sets the document title on component mount.
 * 
 * @component
 * @returns {React.ReactElement} The home page JSX element with welcome message and chat link
 * 
 * @example
 * return <Home />
 */
export default function Home() {
  useEffect(() => {
    document.title = 'Home | Amelia Earhart Chatbot'
  }, [])

  return (
    <div>
      <h1>Welcome to the Amelia Earhart Chatbot!</h1>
      <p>Ask me anything about your flight plans.</p>
      <Link to="/chat">Go to Chat</Link>
    </div>
  )
}