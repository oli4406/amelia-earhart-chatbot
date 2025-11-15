import {Link, useNavigate} from 'react-router-dom';
import {useState} from 'react'
const loggedIn = false; // Placeholder for actual authentication logic - changed to false for testing purposes of button links to login/register pages

export default function NavBar() {

  const [collapsed, setCollapsed] = useState(false)
  const toggleNav = () => {setCollapsed((prev) => !prev);};
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (loggedIn) {
      // Perform logout logic here
      return
    }
      navigate('/login');
  };
    return (
        <nav className={`nav ${collapsed ? 'nav--collapsed' : ''}`}>
          <button className="nav-toggle" onClick={toggleNav}>
            {collapsed ? '☰' : '☰'}
          </button>
          <div className="nav-inner">
            <Link style={{display:'block',margin: '10px auto'}} to="/">Home</Link>
            <Link style={{display:'block',margin: '10px auto'}} to="/chat">Chat</Link>
            {loggedIn && (<Link style={{display:'block',margin: '10px auto'}} to="/history">History</Link>)}

            <div className='navButtons'>
                <button className="login-button" onClick={handleAuthClick}>{loggedIn ? 'Log out' : "Login/Signup"}</button>
                <button className="settings-button">Settings</button>
            </div>
          </div>
        </nav>
    );
}