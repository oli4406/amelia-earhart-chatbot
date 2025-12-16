/**
 * @module components/Login
 */
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

/**
 * Login component for user authentication
 * 
 * Handles user login with email and password validation.
 * On successful login, stores authentication token in localStorage and navigates to chat page.
 * 
 * @component
 * @returns {JSX.Element} Login form with email/password inputs and error handling
 * 
 * @example
 * return <Login />
 * 
 * @requires useState - React hook for state management
 * @requires useEffect - React hook for side effects
 * @requires useNavigate - React Router hook for navigation
 * @requires Link - React Router component for navigation links
 * 
 * @state {string} email - User's email input
 * @state {string} password - User's password input
 * @state {string} error - Error message to display
 * @state {boolean} loading - Loading state during login request
 * 
 * @description
 * Internal handleLogin function validates input, sends login request to API, and handles response.
 * Catches and displays login errors to user.
 */
function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        document.title = 'Login | Amelia Earhart Chatbot'
    }, [])

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
            const res = await fetch('http://localhost:3000/api/auth/login', {
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
                    {loading ? 'Performing Pre-Flight Checks…' : 'Embark'}
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

export default Login