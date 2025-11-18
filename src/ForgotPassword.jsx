import {useState} from 'react'
import {Link} from 'react-router-dom'

export default function ForgotPassword(){

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const[error, setError] = useState('')

    //handle password reset functionality
    const handlePasswordReset = (s) => {
        s.preventDefault()
        if(!email || !password){
            setError("Please enter both email and password to continue")
            return
        }
        if(email.indexOf('@') === -1){
            setError("Please enter a valid email address")
            return
        }
        //reset password logic here
    }

    return(
        <div className="forgotpassword-container">
            <h2>Forgot Password</h2>
            <form onSubmit={handlePasswordReset} className="forgotpassword-form">
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
                {error && <p className="error">{error}</p>}
                <button 
                    onClick={handlePasswordReset} 
                    className="forgotpassword-button" 
                    type="submit">Reset Password
                </button>
            </form>
            <p className="login-link">
                <Link to="/login">Back to Login</Link>
            </p>
        </div>
    )
}