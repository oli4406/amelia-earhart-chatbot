import {useState} from 'react'
import {Link} from 'react-router-dom'


// harry watson will be working on this file next
export default function Login(){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')


    //handle login functionality
    const handleLogin = (s) => {
        s.preventDefault()
        if(!email || !password){
            setError("Please enter both email and password to continue")
            return
        }
    }
    //to add forgot password login functionality later

    return(
        <div className="login-container">
            <h2>Login</h2>
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
                {error && <p className="error">{error}</p>}
                <button 
                    onClick={handleLogin} 
                    className="login-button" 
                    type="submit">Login
                </button>
            </form>
            <p className="register-link">
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    )
}