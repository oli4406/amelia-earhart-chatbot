import {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'

export default function ForgotPassword(){

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const[error, setError] = useState('')

    useEffect(() => {
    document.title = 'Forgot Password | Amelia Earhart Chatbot';
  }, []);

    //handle password reset functionality
    // NOTE: this is out of scope of the project for now
    const handlePasswordReset = (s) => {
        s.preventDefault()
        setError("Please contact your administrator to reset your password.")
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
                <div className="error-message">
                {error && <p className="error">{error}</p>}
                </div>
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