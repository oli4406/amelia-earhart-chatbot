import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Minimal login page: clicking the button marks the user as present in localStorage
export default function Login() {
    const [loggedIn, setLoggedIn] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        try {
            setLoggedIn(!!localStorage.getItem('hasUser'))
        } catch (e) {
            setLoggedIn(false)
        }
    }, [])

    const handleLogin = () => {
        try {
            localStorage.setItem('hasUser', '1')
            localStorage.setItem('currentUser', JSON.stringify({ name: 'User' }))
            setLoggedIn(true)
        } catch (e) {
            console.warn('failed to set login', e)
        }
        // optional redirect after login
        navigate('/chat')
    }

    return (
        <div style={{ padding: 16 }}>
            <h2>Login / Sign up</h2>
            {loggedIn ? (
                <p>You are already signed in.</p>
            ) : (
                <div>
                    <p>Click the button below to sign in (demo).</p>
                    <button onClick={handleLogin}>Login / Sign up</button>
                </div>
            )}
        </div>
    )
}