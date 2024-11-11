// home.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth"; // Import signOut function
import { auth } from './firebase'; // Import the auth instance
import OCBCLogo from './images/OCBC-Logo.png';

const Home = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [font, setFont] = useState('Inter');
  const [fontWeight, setFontWeight] = useState('normal');
  const [iconSize, setIconSize] = useState('medium');
  const [textToSpeech, setTextToSpeech] = useState(false); // default TTS to disabled

  // load saved preferences from localStorage when the component mounts
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedFont = localStorage.getItem('font') || 'Inter';
    const savedFontWeight = localStorage.getItem('fontWeight') || 'normal';
    const savedIconSize = localStorage.getItem('iconSize') || 'medium';
    const savedTextToSpeech = localStorage.getItem('textToSpeech') === 'enabled';

    setTheme(savedTheme);
    setFont(savedFont);
    setFontWeight(savedFontWeight);
    setIconSize(savedIconSize);
    setTextToSpeech(savedTextToSpeech);

    // apply the saved preferences to document styling
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.style.fontFamily = savedFont;
    document.documentElement.style.fontWeight = savedFontWeight === 'bold' ? '700' : '400';

    // set button font size based on icon size preference
    const buttonSize = savedIconSize === 'large' ? '24px' : '16px';
    document.documentElement.style.setProperty('--button-font-size', buttonSize);
  }, []);

  // function to trigger text-to-speech for a given text if TTS is enabled
  const speak = (text: string) => {
    if (textToSpeech && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.cancel(); // cancel any ongoing speech to avoid overlap
      window.speechSynthesis.speak(utterance);
    }
  };

  // handle single-click for text elements to trigger TTS
  const handleTextClick = (text: string) => {
    if (textToSpeech) speak(text); // only activate TTS if enabled
  };

  // handle double-click for button actions when TTS is enabled
  const handleButtonClick = (label: string, action: () => void) => {
    if (textToSpeech) {
      // with TTS enabled, require double-click to activate
      return {
        onClick: () => handleTextClick(label),
        onDoubleClick: action,
      };
    } else {
      // without TTS, single-click activates button action directly
      return {
        onClick: action,
      };
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign the user out using Firebase
      navigate('/'); // Redirect to the login page after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className={`home-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      <button onClick={handleLogout} className="logout-button">Log Out</button>
      <div className="home-content">
        <div className="home-grid">
          {/* cash options section */}
          <div className="cash-options">
            <h1 
              className="welcome-text" 
              onClick={() => handleTextClick("Hello! What would you like to do today?")}
            >
              Hello! <br /> What would you like to do today?
            </h1>
            <div className="cash-buttons">
              {['$50', '$80', '$100', '$500'].map((amount) => (
                <button
                  key={amount}
                  {...handleButtonClick(amount, () => console.log(`${amount} activated`))} // handle single or double click based on TTS
                  className="cash-button"
                  style={{ fontSize: 'var(--button-font-size)' }}
                >
                  {amount}
                </button>
              ))}
            </div>
            <button 
              className="other-cash-button" 
              {...handleButtonClick('Other cash amounts', () => console.log('Other cash amounts activated'))}
              style={{ fontSize: 'var(--button-font-size)' }}
            >
              Other cash amounts
            </button>
          </div>

          {/* other services section */}
          <div className="non-cash-services">
            <div 
              className="service-box" 
              onClick={() => handleTextClick('Deposit Cash')}
            >
              Deposit Cash
            </div>
            <div 
              className="service-box" 
              onClick={() => handleTextClick('Ask about Balance')}
            >
              Ask about Balance
            </div>

            {/* button to navigate to preferences page */}
            <div className="preferences-button">
              <button 
                {...handleButtonClick('Preferences', () => navigate('/preferences'))}
                className="preference-nav-button"
                style={{ fontSize: 'var(--button-font-size)' }}
              >
                Preferences
              </button>
            </div>

            {/* button to navigate to shortcuts page */}
            <div className="shortcuts-button">
              <button 
                {...handleButtonClick('Shortcuts', () => navigate('/shortcuts'))}
                className="shortcuts-nav-button"
                style={{ fontSize: 'var(--button-font-size)' }}
              >
                Shortcuts
              </button>
            </div>

            <div className="more-services">
              <p 
                className="more-link" 
                onClick={() => handleTextClick('More services')}
              >
                More services
              </p>
              <p 
                className="more-link" 
                onClick={() => handleTextClick('FAQs')}
              >
                FAQs &gt;
              </p>
              <p 
                className="more-link" 
                onClick={() => handleTextClick('Customise')}
              >
                Customise &gt;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
