import {Link, useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react'
import Settings from './Settings.jsx';

import homeIcon from './assets/dark_mode/home.png';
import chatIcon from './assets/dark_mode/chat.png';
import settingsIcon from './assets/dark_mode/settings.png';
import accountIcon from './assets/dark_mode/account.png';
import historyIcon from './assets/dark_mode/history.png';
import homeIconLight from './assets/light_mode/home.png';
import chatIconLight from './assets/light_mode/chat.png';
import historyIconLight from './assets/light_mode/history.png';
import homeIconContrast from './assets/high_contrast/home.png';
import chatIconContrast from './assets/high_contrast/chat.png';
import historyIconContrast from './assets/high_contrast/history.png';
import settingsIconContrast from './assets/high_contrast/settings.png';
import accountIconContrast from './assets/high_contrast/account.png';


export default function NavBar() {

  const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem('authToken')));
  const [collapsed, setCollapsed] = useState(true)
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

  // helper to read accessibility settings and apply to state
  const applyAccessibilitySettings = () => {
    try {
      const raw = localStorage.getItem('userAccessibilitySettings');
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.fontSize) setFontSize(saved.fontSize);
      if (saved.theme) setTheme(saved.theme);
      if (typeof saved.showKeyboardTips === 'boolean') setShowKeyboardTips(saved.showKeyboardTips);
      if (saved.messageDensity) setMessageDensity(saved.messageDensity);
    } catch (e) {
      console.warn('Failed to apply accessibility settings from storage', e);
    }
  };

  useEffect(() => {
    // listen for Settings component save events inside same window
    const onAccessibilityChanged = () => applyAccessibilitySettings();
    window.addEventListener('accessibilitySettingsChanged', onAccessibilityChanged);
    // also listen for cross-window localStorage changes
    const onStorage = (e) => {
      if (e.key === 'userAccessibilitySettings') applyAccessibilitySettings();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('accessibilitySettingsChanged', onAccessibilityChanged);
    };
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
          <button
            className={`nav-toggle ${collapsed ? 'SidebarBtn-Collapsed' : 'SidebarBtn-Expanded'}`}
            onClick={toggleNav}
            title={collapsed ? 'Expand menu' : 'Collapse menu'}
            aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
          >
            <span className="visually-hidden">{collapsed ? 'Expand' : 'Collapse'}</span>
          </button>
          <div className="nav-inner">
            <Link className="nav-link" title="Home" to="/">
              <span className="nav-icon"><img className="icon" src={theme === 'light' ? homeIconLight : theme === 'contrast' ? homeIconContrast : homeIcon} alt="Home"/></span>
              <span className="nav-text">Hanger</span>
            </Link>
            <Link className="nav-link" title="Chat" to="/chat">
              <span className="nav-icon"><img className="icon" src={theme === 'light' ? chatIconLight : theme === 'contrast' ? chatIconContrast : chatIcon} alt="Chat"/></span>
              <span className="nav-text">Communications</span>
            </Link>
            {loggedIn && (
              <Link className="nav-link" title="History" to="/history">
                <span className="nav-icon"><img className="icon" src={theme === 'light' ? historyIconLight : theme === 'contrast' ? historyIconContrast : historyIcon} alt="History"/></span>
                <span className="nav-text">Flight Log</span>
              </Link>
            )}

            <div className='navButtons'>
              <button className="nav-btn" onClick={handleSettingsClick} title="Settings">
                <span className="nav-icon"><img className="icon" src={theme === 'contrast' ? settingsIconContrast : settingsIcon} alt="Settings"/></span>
                <span className="nav-text">Flight Systems</span>
              </button>
              <button className="nav-btn" onClick={loggedIn ? handleLogoutClick : handleLoginClick} title={loggedIn ? 'Log out' : 'Login/Signup'}>
                <span className="nav-icon"><img className="icon" src={theme === 'contrast' ? accountIconContrast : accountIcon} alt="Account"/></span>
                <span className="nav-text">{loggedIn ? 'Disembark' : 'Pilot Login'}</span>
              </button>
            </div>
          </div>
        </nav>
  
        {showSettings && <Settings visible={showSettings} onClose={() => setShowSettings(false)} />}
      </>
    );
}