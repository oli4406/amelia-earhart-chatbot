import {Link} from 'react-router-dom';
import {useState} from 'react'

export default function NavBar() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    return (
      <>
        <nav className={`nav ${collapsed ? 'nav--collapsed' : ''}`}>
          <button className="nav-toggle" onClick={() => setCollapsed((prev) => !prev)}>
            {collapsed ? '☰' : '☰'}
          </button>
          <div className="nav-inner">
            <Link style={{display:'block',margin: '10px auto'}} to="/">Home</Link>
            <Link style={{display:'block',margin: '10px auto'}} to="/chat">Chat</Link>
            {loggedIn && (<Link style={{display:'block',margin: '10px auto'}} to="/history">History</Link>)}
            <div className='navButtons'>
                <button onClick={() => setLoggedIn((prev) => !prev)}>{loggedIn ? 'Log out' : 'Login/Signup'}</button>
                <button type="button" onClick={() => setShowSettings(true)}>Settings</button>
            </div>
          </div>
        </nav>
        
        {showSettings && (
          <div className="settings-overlay">
            <div className="settings-modal">
                <button className="settings-close" onClick={() => setShowSettings(false)}> x </button>
                <div className="settings-body">
                </div>
            </div>
          </div>
        )}
      </>
    );
}