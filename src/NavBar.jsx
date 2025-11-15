import {Link} from 'react-router-dom';
import {useState} from 'react'
const loggedIn = true; // Placeholder for actual authentication logic

export default function NavBar() {

  const [collapsed, setCollapsed] = useState(false)
  const [showSettings, setShowSettings] = useState(false);
  const toggleNav = () => {setCollapsed((prev) => !prev);};
  const openSettings = () => {setShowSettings(true);};
  const closeSettings = () => {setShowSettings(false);};
    return (
      <>
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
                <button type="button" onClick={openSettings}>Settings</button>
            </div>
          </div>
        </nav>
        
        {showSettings && (
          <div className="settings-overlay">
            <div className="settings-modal">
                <button className="settings-close" onClick={closeSettings}> x </button>
                <div className="settings-body">
                </div>
            </div>
          </div>
        )}
      </>
    );
}