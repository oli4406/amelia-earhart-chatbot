import {useState, useEffect, useRef, useCallback} from 'react'

/**
 * Settings component for managing user accessibility preferences.
 * 
 * Provides a modal dialog for users to customize:
 * - Font size (75%, 100%, 125%, 150%, 200%)
 * - Theme (dark, light, high contrast)
 * - Keyboard tips visibility
 * - Message density/spacing (default, comfortable)
 * 
 * Settings are persisted to localStorage and applied to the document root via data attributes.
 * Changes trigger an 'accessibilitySettingsChanged' event for other components to listen to.
 * 
 * The modal supports:
 * - Closing via Escape key or clicking outside the modal
 * - Backspace key handling (only closes if not typing in an input)
 * - Focus management for keyboard accessibility
 * - ARIA attributes for screen reader support
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} [props.visible=true] - Controls initial visibility of the settings modal
 * @param {Function} [props.onClose] - Callback invoked when the modal is closed
 * @returns {React.ReactElement|null} The settings modal dialog, or null if not visible
 */
export default function Settings({ visible = true, onClose }) {
    const [showSettings, setShowSettings] = useState(visible);
    const [fontSize, setFontSize] = useState('100%');
    const [theme, setTheme] = useState('dark');
    const [showKeyboardTips, setShowKeyboardTips] = useState(false);
    const [messageDensity, setMessageDensity] = useState('default');

    useEffect(() => setShowSettings(visible), [visible]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('userAccessibilitySettings');
            if (!raw) return;
            const saved = JSON.parse(raw);
            if (saved.fontSize) setFontSize(saved.fontSize);
            if (saved.theme) setTheme(saved.theme);
            if (typeof saved.showKeyboardTips === 'boolean') setShowKeyboardTips(saved.showKeyboardTips);
            if (saved.messageDensity) setMessageDensity(saved.messageDensity);
        } catch (e) {
            console.warn('Failed to load accessibility settings', e);
        }
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        root.dataset.fontSize = fontSize;
        root.dataset.theme = theme;
        root.dataset.showKeyboardTips = showKeyboardTips ? 'true' : 'false';
        root.dataset.messageDensity = messageDensity;
        try {
                localStorage.setItem('userAccessibilitySettings', JSON.stringify({ fontSize, theme, showKeyboardTips, messageDensity }));
                // notify other components in same window that settings have changed
                window.dispatchEvent(new Event('accessibilitySettingsChanged'));
            } catch (e) {
                console.warn('Failed to save accessibility settings', e);
            }
    }, [fontSize, theme, showKeyboardTips, messageDensity]);

    const overlayRef = useRef();
    const modalRef = useRef();

    const close = useCallback(() => {
        setShowSettings(false);
        if (onClose) onClose();
    }, [onClose]);

    // Close when clicking outside the modal box
    const onOverlayClick = useCallback((e) => {
        if (e.target === overlayRef.current) close();
    }, [close]);

    // Focus the modal when it becomes visible so keyboard events are predictable
    useEffect(() => {
        if (showSettings && modalRef.current && typeof modalRef.current.focus === 'function') {
            modalRef.current.focus();
        }
    }, [showSettings]);

    // Close on Escape or Backspace (but avoid closing while typing in inputs)
    useEffect(() => {
        const onKeyDown = (e) => {
            const key = e.key || e.code;
            if (key !== 'Escape' && key !== 'Backspace') return;
            const active = document.activeElement;
            const tag = active?.tagName?.toLowerCase();
            const isEditable = active?.isContentEditable;
            const isInput = tag === 'input' || tag === 'textarea' || tag === 'select' || isEditable;
            if (key === 'Backspace' && isInput) return; // avoid interfering with typing
            close();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [close]);

    if (!showSettings) return null;

        return (
                <div
            className="settings-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            data-theme={theme}
            data-font-size={fontSize}
            data-show-keyboard-tips={showKeyboardTips ? 'true' : 'false'}
            data-message-density={messageDensity}
          
                    ref={overlayRef}
                    onMouseDown={onOverlayClick}
                    >
            <div
              className="settings-modal"
              data-theme={theme}
              data-font-size={fontSize}
              data-show-keyboard-tips={showKeyboardTips ? 'true' : 'false'}
              data-message-density={messageDensity}
                                ref={modalRef}
                                tabIndex={-1}
            >
                <button className="settings-close" onClick={close}> x </button>
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
    );
}