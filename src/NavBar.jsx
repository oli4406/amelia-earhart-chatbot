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
        <button onClick={() => {
          if (!loggedIn) {
            // sign in: set currentUser and hasUser so other parts of the app will save history
            try {
              localStorage.setItem('currentUser', JSON.stringify({ name: 'Demo User' }))
              localStorage.setItem('hasUser', '1')
            } catch (e) {
              console.warn('failed to set login keys', e)
            }
            setLoggedIn(true)
          } else {
            // sign out: remove keys
            try {
              localStorage.removeItem('currentUser')
              localStorage.removeItem('hasUser')
            } catch (e) {
              console.warn('failed to remove login keys', e)
            }
            setLoggedIn(false)
          }
        }}>{loggedIn ? 'Log out' : 'Login/Signup'}</button>
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