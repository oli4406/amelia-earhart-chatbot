import { useEffect, useState } from 'react'
import './App.css'

export default function History() {

    const [history, setHistory] = useState([])
    const [loggedIn, setLoggedIn] = useState(true)

    useEffect(() => {
        document.title = 'Chat History | Amelia Earhart Chatbot'

        const token = localStorage.getItem('authToken')
        if (!token) {
            setLoggedIn(false)
            setHistory([])
            return
        }

        setLoggedIn(true)

        fetch('http://localhost:3000/api/messages', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch history')
                return res.json()
            })
            .then(data => {
                setHistory(data)
            })
            .catch(err => {
                console.error('Failed to load history:', err)
                setHistory([])
            })
    }, [])


    const clearHistory = async () => {
        const token = localStorage.getItem('authToken')
        if (!token) return

        try {
            const res = await fetch('http://localhost:3000/api/messages', {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
            })

            if (!res.ok) {
            throw new Error('Failed to clear history')
            }

            setHistory([])
        } catch (err) {
            console.error('Clear history failed:', err)
        }
    }


    const deleteEntry = async (id) => {
        const token = localStorage.getItem('authToken')
        if (!token) return

        try {
            const res = await fetch(`http://localhost:3000/api/messages/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (!res.ok) {
                throw new Error('Failed to delete message')
            }

            setHistory(prev => prev.filter(h => h._id !== id))
        } catch (err) {
            console.error('Delete failed:', err)
        }
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
                                <button className="btn small" onClick={() => deleteEntry(h._id)}>
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