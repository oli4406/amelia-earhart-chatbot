import {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'

/**
 * ForgotPassword component for handling password reset requests.
 * 
 * This component displays a form where users can enter their email to request a password reset.
 * Currently, the password reset functionality is out of scope and displays a message directing
 * users to contact their administrator.
 * 
 * @component
 * @returns {JSX.Element} A forgot password form with email input, password input, error messaging,
 *                        and a reset password button with a link back to the login page.
 * 
 * @example
 * return (
 *   <ForgotPassword />
 * )
 * 
 * @requires useState from 'react'
 * @requires useEffect from 'react'
 * @requires Link from 'react-router-dom'
 * 
 * @state {string} email - The email address entered by the user
 * @state {string} password - The password entered by the user
 * @state {string} error - Error message to display to the user
 */
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