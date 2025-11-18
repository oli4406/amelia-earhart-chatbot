import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Register() {
    const [registered, setRegistered] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        try {
            setRegistered(!!localStorage.getItem('hasUser'))
        } catch (e) {
            setRegistered(false)
        }
    }, [])

    const handleRegister = () => {
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
            <h2>Register</h2>
            {registered ? (
                <p>Already registered.</p>
            ) : (
                <div>
                    <p>Create a demo account to save history locally.</p>
                    <button onClick={handleRegister}>Register (demo)</button>
                </div>
            )}
        </div>
    )
}