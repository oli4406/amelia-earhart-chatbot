import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// harry watson will be working on this file next
export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        document.title = 'Login | Amelia Earhart Chatbot'
    }, [])

    // make handler async and only set loading once validation passes
    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')

        if (!email || !password) {
            setError('Please enter both email and password to continue')
            return
        }

        if (email.indexOf('@') === -1) {
            setError('Please enter a valid email address')
            return
        }

        setLoading(true)
        try {
            // use Vite env var if provided, fallback to localhost:3000
            const res = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            const data = await res.json().catch(() => ({}))

            if (!res.ok) {
                setError(data.message || 'Login failed. Please try again.')
                return
            }

            if (data.token) {
                localStorage.setItem('authToken', data.token)
                window.dispatchEvent(new Event('authChanged'))
                document.title = `Logged in — ${email}`
                navigate('/chat')
            } else {
                setError('Login failed. Please try again.')
            }
        } catch (err) {
            console.error('Login error:', err)
            setError('An error occurred. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <h2>Login Here</h2>
            <form onSubmit={handleLogin} className="login-form">
                <div className="input-group">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if (error) setError('') }}
                    />
                </div>
                <div className="input-group">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); if (error) setError('') }}
                    />
                </div>
                <div className="error-message">
                    {error && <p className="error">{error}</p>}
                </div>
                <button className="login-button" type="submit" disabled={loading}>
                    {loading ? 'Signing in…' : 'Login'}
                </button>
            </form>
            <p className="forgotpassword-link">
                <Link to="/forgotpassword">Forgot Password</Link>
            </p>
            <p className="register-link">
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    )
}