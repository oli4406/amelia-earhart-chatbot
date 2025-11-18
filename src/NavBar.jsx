import {Link} from 'react-router-dom';
import {useState} from 'react'
const loggedIn = true; // Placeholder for actual authentication logic

export default function NavBar() {

  const [collapsed, setCollapsed] = useState(false)
  const toggleNav = () => {setCollapsed((prev) => !prev);};
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
                <button>{loggedIn ? 'Log out' : 'Login/Signup'}</button>
                <button>Settings</button>
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
                        <h3>Text Size</h3>
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
                            <button type="button" className={`theme-button ${theme === 'contrast' ? 'theme-button--active' : ''}`} onClick={() => setTheme('contrast')}>High Contrast</button>
                        </div>
                    </section>
                    <section className="accessibility-section">
                        <h3>Keyboard Tips</h3>
                        <label>
                            <input type="checkbox" checked={showKeyboardTips} onChange={(e) => setShowKeyboardTips(e.target.checked)}/>
                            Show Keyboard Tips
                        </label>
                    </section>
                    <section className="accessibility-section">
                        <h3>Message Spacing</h3>
                        <div className="settings-row">
                            <label>
                                <input type="radio" name="message-density" value="default" checked={messageDensity === 'default'} onChange={(e) => setMessageDensity(e.target.value)}/>Default
                            </label>
                            <label>
                                <input type="radio" name="message-density" value="comfortable" checked={messageDensity === 'comfortable'} onChange={(e) => setMessageDensity(e.target.value)}/>Comfortable
                            </label>
                        </div>
                    </section>
                </div>
            </div>
          </div>
        )}
      </>
    );
}