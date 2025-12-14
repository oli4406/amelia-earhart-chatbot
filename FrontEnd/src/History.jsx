import { useEffect, useState } from 'react'
import './App.css'

export default function History() {

    const [history, setHistory] = useState([])
    const [loggedIn, setLoggedIn] = useState(true)

    useEffect(() => {
        document.title = 'Chat History | Amelia Earhart Chatbot'
        try {
            const token = localStorage.getItem('authToken')
            const hasUser = !!token
            setLoggedIn(hasUser)

            const raw = localStorage.getItem('chat_history')
            setHistory(raw ? JSON.parse(raw) : [])
        } catch (e) {
            console.warn('Failed to initialize history/auth state', e)
            setLoggedIn(false)
            setHistory([])
        }
    }, [])


    const clearHistory = () => {
        localStorage.removeItem('chat_history')
        setHistory([])
    }

    const deleteEntry = (id) => {
        const filtered = history.filter(
            (h) => (h._id || h.id) !== id
        )

        setHistory(filtered)
        localStorage.setItem('chat_history', JSON.stringify(filtered))
    }

    if (!loggedIn) {
        return (
            <div>
                <h1>Chat History</h1>
                <p>Please sign in to view your saved questions.</p>
            </div>
        )
    }

    return (
        <div>
            <h1>Chat History</h1>
            {history.length === 0 ? (
                <p>No saved questions yet.</p>
            ) : (
                <div className="history-list">
                    {history.map((h, i) => {
                        const entryId = h._id || h.id
                        const timestamp = h.createdAt || h.ts

                    return (
                        <article key={entryId} className="history-card">
                            <div className="history-meta">
                                <strong>#{i + 1}</strong>
                                <span className="history-ts">{timestamp ? new Date(timestamp).toLocaleString() : ''}</span>
                            </div>
                            {/* support both legacy single-field entries and new Q/A pairs */}
                            {h.question && h.answer ? (
                                <div className="history-qa">
                                    <div className="history-question"><strong>Q:</strong> {h.question}</div>
                                    <div className="history-answer"><strong>A:</strong> {h.answer}</div>
                                </div>
                            ) : (
                                <div className="history-text">{h.text || JSON.stringify(h)}</div>
                            )}
                            <div className="history-actions">
                                <button className="btn small" onClick={() => deleteEntry(h._id | h.id)}>
                                    Delete
                                </button>
                            </div>
                        </article>
                    )})}
                </div>
            )}

            <div style={{ marginTop: 12 }}>
                <button onClick={clearHistory} disabled={history.length === 0}>
                    Clear history
                </button>
            </div>
        </div>
    )
}