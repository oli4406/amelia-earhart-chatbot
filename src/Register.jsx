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

        //TO BE IMPLEMENTED AS FRONT END FORM LATER
        //<div className="register-container">
        //     <h2>Register Account</h2>
        //     <form onSubmit={handleRegister} className="register-form">
        //         <div className="input-group">
        //             <input
        //                 type="text"
        //                 placeholder="Email"
        //                 value={email}
        //                 onChange={(e) => {setEmail(e.target.value); if(error) setError('')}}
        //             />
        //         </div>
        //         <div className="input-group">
        //             <input
        //                 type="password"
        //                 placeholder="Password"
        //                 value={password}
        //                 onChange={(e) => {setPassword(e.target.value); if(error) setError('')}}
        //             />
        //         </div>
        //         <div className="input-group">
        //             <input
        //                 type="password"
        //                 placeholder="Confirm Password"
        //                 value={confirmPassword}
        //                 onChange={(e) => {setConfirmPassword(e.target.value); if(error) setError('')}}
        //             />
        //         </div>
        //         {error && <p className="error">{error}</p>}
        //         <button
        //             onClick={handleRegister}
        //             className="register-button"
        //             type="submit">Register
        //         </button>
        //     </form>
        //     <p className="login-link">
        //         Already have an account? <Link to="/login">Login here</Link>
        //     </p>
        // </div>
    )
}

