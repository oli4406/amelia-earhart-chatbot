import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

/**
 * Register component for user account creation
 * 
 * Handles user registration by collecting first name, last name, email, and password.
 * Validates input fields, ensures password confirmation matches, and sends registration
 * request to the backend API. On successful registration, navigates to login page.
 * 
 * @component
 * @returns {JSX.Element} The register form UI with input fields and submission button
 * 
 * @example
 * return (
 *   <Register />
 * )
 * 
 * @state {string} firstName - User's first name
 * @state {string} lastName - User's last name
 * @state {string} email - User's email address
 * @state {string} password - User's password
 * @state {string} confirmPassword - Password confirmation field
 * @state {string} error - Error message to display to user
 * @state {boolean} loading - Loading state during registration request
 * @state {boolean} registered - Flag indicating registration completion
 * 
 * @requires useState - React hook for state management
 * @requires useEffect - React hook for side effects
 * @requires useNavigate - React Router hook for navigation
 * @requires Link - React Router component for linking
 */
export default function Register() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    try {
      localStorage.removeItem('hasUser')
    } catch (e) {
      console.error(`Error removing 'hasUser': \n${e}`)
      /* ignore storage errors */
    }

    document.title = 'Register | Amelia Earhart Chatbot'
    setRegistered(false)
  }, [])

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('All fields are required')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const payload = { firstName, lastName, email, password }
      console.log('Register payload:', payload) // <-- add this
      const res = await fetch('http://localhost:3000/api/auth/register',  {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        const data = text ? JSON.parse(text) : {}
        setError(data.message || `Registration failed (status ${res.status})`)
        return
      }

      localStorage.setItem('hasUser', '1')
      setRegistered(true)
      navigate('/login')
    } catch (err) {
      console.error('Register error:', err)
      setError('Network or server error. Check backend and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <h2>Register Account</h2>
      {registered ? (
        <p>Already registered.</p>
      ) : (
        <form onSubmit={handleRegister} className="register-form" noValidate>
          <div className="input-group">
            <input type="text" placeholder="First Name" value={firstName} onChange={(e) => { setFirstName(e.target.value); if (error) setError('') }} />
          </div>
          <div className="input-group">
            <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => { setLastName(e.target.value); if (error) setError('') }} />
          </div>
          <div className="input-group">
            <input type="email" placeholder="Email" value={email} onChange={(e) => { setEmail(e.target.value); if (error) setError('') }} />
          </div>
          <div className="input-group">
            <input type="password" placeholder="Password" value={password} onChange={(e) => { setPassword(e.target.value); if (error) setError('') }} />
          </div>
          <div className="input-group">
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError('') }} />
          </div>
          {error && <p className="error">{error}</p>}
          <button className="register-button" type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Register'}
          </button>
          <p className="login-link">Already have an account? <Link to="/login">Login here</Link></p>
        </form>
      )}
    </div>
  )
}

