import {useState} from 'react'
import {Link} from 'react-router-dom'


export default function RegisterPage(){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')


    //handle register functionality - this will be expanded later to look better with the error messages
    const handleRegister = (s) => {
        s.preventDefault()
        if(!email || !password || !confirmPassword){
            setError("Please enter all fields to continue")
            return
        }
    }

    return(
        <div className="register-container">
            <h2>Register Account</h2>
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
                    onClick={handleRegister}
                    className="register-button"
                    type="submit">Register
                </button>
            </form>
            <p className="login-link">
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>

        
    )
}