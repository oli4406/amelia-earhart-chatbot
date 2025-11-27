import {Link, useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react'
import homeIcon from './assets/home.png';
import chatIcon from './assets/chat.png';
import settingsIcon from './assets/settings.png';
import accountIcon from './assets/account.png';
import historyIcon from './assets/history.png';


export default function NavBar() {

  const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem('authToken')));
  const [collapsed, setCollapsed] = useState(false)
  const toggleNav = () => {setCollapsed((prev) => !prev);};
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState('100%');
  const [theme, setTheme] = useState('dark');
  const [showKeyboardTips, setShowKeyboardTips] = useState(false);
  const [messageDensity, setMessageDensity] = useState('default');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'authToken') setLoggedIn(Boolean(e.newValue));
    };
        const onAuthChanged = () => {
      setLoggedIn(Boolean(localStorage.getItem('authToken')));
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('authChanged', onAuthChanged);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('authChanged', onAuthChanged);
    };
  }, []);

  //handle logout button click
  const handleLogoutClick = () => {
    localStorage.removeItem('authToken');
    setLoggedIn(false);
    window.dispatchEvent(new Event('authChanged'));
    navigate('/');
  };

  //handle login button click
    const handleLoginClick = () => {
    if (loggedIn) {
      handleLogoutClick();
      return;
    }
    navigate('/login');
  };

  //handle settings button click
  const handleSettingsClick = () => {
    setShowSettings(true);
    };
    useEffect(() => {
    try {
        const raw = localStorage.getItem('userAccessibilitySettings');
        if (!raw) return;

        const saved = JSON.parse(raw);
        if (saved.fontSize) setFontSize(saved.fontSize);
        if (saved.theme) setTheme(saved.theme);
        if (typeof saved.showKeyboardTips === 'boolean') {
            setShowKeyboardTips(saved.showKeyboardTips);
        }
        if (saved.messageDensity) setMessageDensity(saved.messageDensity);
    } catch (e) {
        console.warn('Failed to load accesibility settings', e);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.fontSize = fontSize;
    root.dataset.theme = theme;
    root.dataset.showKeyboardTips = showKeyboardTips ? 'true' : 'false';
    root.dataset.messageDensity = messageDensity;
  }, [fontSize, theme, showKeyboardTips, messageDensity]);

  useEffect(() => {
    if (!loggedIn) {
      setUser(null);
      return;
    }

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setUser(null);
          return;
        }
        const res = await fetch('http://localhost:3000/api/user',{
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser({ firstName: data.firstName, lastName: data.lastName, email: data.email });
      } catch (e) {
        console.error('Failed to fetch user data', e);
        setUser(null);
      }
    };

    fetchUser();
  }, [loggedIn]);

  useEffect(() => {
    if (!loggedIn) return;

    const settings = { fontSize, theme, showKeyboardTips, messageDensity};

    try {
        localStorage.setItem('userAccessibilitySettings', JSON.stringify(settings));
    } catch (e) {
        console.warn('Failed to save accessibility settings', e);
    }
  }, [loggedIn, fontSize, theme, showKeyboardTips, messageDensity]);

    return (
      <>
        {/* displays first and last name when logged in */}
        <div className="page-user-name">{user ? `Welcome, ${user.firstName} ${user.lastName}` : ''}</div>
        <nav className={`nav ${collapsed ? 'nav--collapsed' : ''}`}>
          <button className="nav-toggle" onClick={toggleNav} title={collapsed ? 'Expand menu' : 'Collapse menu'}>
            {collapsed ? '☰' : '☰'}
          </button>
          <div className="nav-inner">
            <Link className="nav-link" title="Home" to="/">
              <span className="nav-icon"><img src={homeIcon} alt="Home"/></span>
              <span className="nav-text">Hanger</span>
            </Link>
            <Link className="nav-link" title="Chat" to="/chat">
              <span className="nav-icon"><img src={chatIcon} alt="Chat"/></span>
              <span className="nav-text">Communications</span>
            </Link>
            {loggedIn && (
              <Link className="nav-link" title="History" to="/history">
                <span className="nav-icon"><img src={historyIcon} alt="History"/></span>
                <span className="nav-text">Flight Log</span>
              </Link>
            )}

            <div className='navButtons'>
              <button className="nav-btn" onClick={loggedIn ? handleLogoutClick : handleLoginClick} title={loggedIn ? 'Log out' : 'Login/Signup'}>
                <span className="nav-icon"><img src={accountIcon} alt="Account"/></span>
                <span className="nav-text">{loggedIn ? 'Disembark' : 'Pilot Login'}</span>
              </button>
              <button className="nav-btn" onClick={handleSettingsClick} title="Settings">
                <span className="nav-icon"><img src={settingsIcon} alt="Settings"/></span>
                <span className="nav-text">Flight Systems</span>
              </button>
            </div>
          </div>
        </nav>
  
        {showSettings && (
          <div
            className="settings-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            data-theme={theme}
            data-font-size={fontSize}
            data-show-keyboard-tips={showKeyboardTips ? 'true' : 'false'}
            data-message-density={messageDensity}
          >
            <div
              className="settings-modal"
              data-theme={theme}
              data-font-size={fontSize}
              data-show-keyboard-tips={showKeyboardTips ? 'true' : 'false'}
              data-message-density={messageDensity}
            >
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
                        <div className="theme-buttons">
                                <button type="button" className={`theme-button ${messageDensity === 'default' ? 'theme-button--active' : ''}`} onClick={() => setMessageDensity('default')}>Default</button>
                                <button type="button" className={`theme-button ${messageDensity === 'comfortable' ? 'theme-button--active' : ''}`} onClick={() => setMessageDensity('comfortable')}>Comfortable</button>
                        </div>
                    </section>
                </div>
            </div>
          </div>
        )}
      </>
    );
}