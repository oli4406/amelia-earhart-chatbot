import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
    const [registered, setRegistered] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        try {
            setRegistered(!!localStorage.getItem('hasUser'))
        } catch (e) {
            setRegistered(false)
        }
    }, [])

    const handleRegister = () => {
        if (!email || !password || !confirmPassword) {
            setError('All fields are required')
            return
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }
        try {
            localStorage.setItem('hasUser', '1')
            localStorage.setItem('currentUser', JSON.stringify({ name: 'New User' }))
            setRegistered(true)
        } catch (e) {
            console.warn('failed to register', e)
        }
        navigate('/chat')
    }

    return (
        <div style={{ padding: 16 }}>
            <h2>Register Account</h2>
            {registered ? (
                <p>Already registered.</p>
            ) : (
                <div className="register-container">
                    <form onSubmit={handleRegister} className="register-form">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => {setEmail(e.target.value); if(error) setError('')}}
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => {setPassword(e.target.value); if(error) setError('')}}
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => {setConfirmPassword(e.target.value); if(error) setError('')}}
                            />
                        </div>
                        {error && <p className="error">{error}</p>}
                        <button
                            className="register-button"
                            type="submit">Register
                        </button>
                    </form>
                    <p className="login-link">
                        Already have an account? <Link to="/login">Login here</Link>
                    </p>
                </div>    
                    )}
                </div>
  )
}

