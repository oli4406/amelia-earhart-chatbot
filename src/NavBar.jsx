import {Link} from 'react-router-dom';
import {useState} from 'react'
const loggedIn = true; // Placeholder for actual authentication logic

export default function NavBar() {

  const [collapsed, setCollapsed] = useState(false)
  const toggleNav = () => {setCollapsed((prev) => !prev);};
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
                <button>{loggedIn ? 'Log out' : 'Login/Signup'}</button>
                <button>Settings</button>
            </div>
          </div>
        </nav>
    );
}