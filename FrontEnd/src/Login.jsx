import {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'

// harry watson will be working on this file next
export default function Login(){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
    document.title = 'Login | Amelia Earhart Chatbot';
  }, []);

    //handle login functionality
    const handleLogin = (s) => {
        s.preventDefault()
        if(!email || !password){
            setError("Please enter both email and password to continue")
            return
        }
        if(email.indexOf('@') === -1){
            setError("Please enter a valid email address")
            return
        }
        //login logic here
    }

    return(
        <div className="login-container">
            <h2>Login Here</h2>
            <form onSubmit={handleLogin} className="login-form">
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
                    onClick={handleLogin} 
                    className="login-button" 
                    type="submit">Login
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