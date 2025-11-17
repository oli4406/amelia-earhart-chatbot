import { useEffect, useState } from 'react'
import './App.css'

export default function History() {

    const [history, setHistory] = useState([])
    const [loggedIn, setLoggedIn] = useState(true)

    useEffect(() => {
        document.title = 'Chat History | Amelia Earhart Chatbot'
        try {
            const hasUser = !!localStorage.getItem('currentUser')
            setLoggedIn(hasUser)
            if (hasUser) {
                const raw = localStorage.getItem('chat_history')
                setHistory(raw ? JSON.parse(raw) : [])
            } else {
                setHistory([])
            }
        } catch (e) {
            setLoggedIn(false)
            setHistory([])
        }
        }, [])

        // keep in sync if another tab changes login/history
        useEffect(() => {
            const onStorage = (e) => {
                if (e.key === 'currentUser' || e.key === 'chat_history') {
                    try {
                        const hasUser = !!localStorage.getItem('currentUser')
                        setLoggedIn(hasUser)
                        if (hasUser) {
                            const raw = localStorage.getItem('chat_history')
                            setHistory(raw ? JSON.parse(raw) : [])
                        } else {
                            setHistory([])
                        }
                    } catch (err) {
                        setLoggedIn(false)
                        setHistory([])
                    }
                }
            }
            window.addEventListener('storage', onStorage)
            return () => window.removeEventListener('storage', onStorage)
        }, [])

    const clearHistory = () => {
        localStorage.removeItem('chat_history')
        setHistory([])
    }

    const deleteEntry = (id) => {
        const filtered = history.filter((h) => h.id !== id)
        localStorage.setItem('chat_history', JSON.stringify(filtered))
        setHistory(filtered)
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
                            {history.map((h, i) => (
                                <article key={h.id} className="history-card">
                                    <div className="history-meta">
                                        <strong>#{i + 1}</strong>
                                        <span className="history-ts">{new Date(h.ts).toLocaleString()}</span>
                                    </div>
                                    <div className="history-text">{h.text}</div>
                                    <div className="history-actions">
                                        <button className="btn small" onClick={() => deleteEntry(h.id)}>
                                            Delete
                                        </button>
                                    </div>
                                </article>
                            ))}
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