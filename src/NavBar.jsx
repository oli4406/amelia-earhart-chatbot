import {Link} from 'react-router-dom';
import {useState, useEffect} from 'react'

export default function NavBar() {
  const [loggedIn, setLoggedIn] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [fontSize, setFontSize] = useState('100%');
    const [theme, setTheme] = useState('dark');


    useEffect(() => {
        const root = document.documentElement;
        root.dataset.fontSize = fontSize;
        root.dataset.theme = theme;
    }, [fontSize, theme]);
    
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
                    <h2 id="settings-title">Settings</h2>
                    <section className="settings-section">
                        <h3>Text size</h3>
                        <div className="text-sizing">
                            <label>
                                <input type="radio" name="text-size" value="75%" checked={fontSize === '75%'} onChange={(e) => setFontSize(e.target.value)}/>
                                75%
                            </label>
                            <label>
                                <input type="radio" name="text-size" value="100%" checked={fontSize === '100%'} onChange={(e) => setFontSize(e.target.value)}/>
                                100%
                            </label>
                            <label>
                                <input type="radio" name="text-size" value="125%" checked={fontSize === '125%'} onChange={(e) => setFontSize(e.target.value)}/>
                                125%
                            </label>
                            <label>
                                <input type="radio" name="text-size" value="150%" checked={fontSize === '150%'} onChange={(e) => setFontSize(e.target.value)}/>
                                150%
                            </label>
                            <label>
                                <input type="radio" name="text-size" value="200%" checked={fontSize === '200%'} onChange={(e) => setFontSize(e.target.value)}/>
                                200%
                            </label>
                        </div>
                    </section>
                    <section className="accessibility-section">
                        <h3>Theme</h3>
                        <div className="theme-buttons">
                            <button type="button" className={`theme-button ${theme === 'dark' ? 'theme-button--active' : ''}`} onClick={() => setTheme('dark')}>Dark Mode</button>
                            <button type="button" className={`theme-button ${theme === 'light' ? 'theme-button--active' : ''}`} onClick={() => setTheme('light')}>Light Mode</button>
                        </div>
                    </section>
                </div>
            </div>
          </div>
        )}
      </>
    );
}