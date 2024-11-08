import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OCBCLogo from './images/OCBC Logo.png';
import WatsonChat from './WatsonChat';

const Home = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [font, setFont] = useState('Inter');
  const [fontWeight, setFontWeight] = useState('normal');
  const [iconSize, setIconSize] = useState('medium');

  // load saved preferences from localStorage when the component mounts
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedFont = localStorage.getItem('font') || 'Inter';
    const savedFontWeight = localStorage.getItem('fontWeight') || 'normal';
    const savedIconSize = localStorage.getItem('iconSize') || 'medium';

    // apply saved preferences to state and document styling
    setTheme(savedTheme);
    setFont(savedFont);
    setFontWeight(savedFontWeight);
    setIconSize(savedIconSize);

    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.style.fontFamily = savedFont;
    document.documentElement.style.fontWeight = savedFontWeight === 'bold' ? '700' : '400';

    // set button font size based on icon size preference
    const buttonSize = savedIconSize === 'large' ? '24px' : '16px';
    document.documentElement.style.setProperty('--button-font-size', buttonSize);
  }, []);

  return (
    <div className={`home-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      <div className="home-content">
        <div className="home-grid">
          {/* cash options section */}
          <div className="cash-options">
            <h1 className="welcome-text">Hello! <br /> What would you like to do today?</h1>
            <div className="cash-buttons">
              <button className="cash-button" style={{ fontSize: 'var(--button-font-size)' }}>$50</button>
              <button className="cash-button" style={{ fontSize: 'var(--button-font-size)' }}>$80</button>
              <button className="cash-button" style={{ fontSize: 'var(--button-font-size)' }}>$100</button>
              <button className="cash-button" style={{ fontSize: 'var(--button-font-size)' }}>$500</button>
            </div>
            <button className="other-cash-button" style={{ fontSize: 'var(--button-font-size)' }}>Other cash amounts</button>
          </div>

          {/* other services section */}
          <div className="non-cash-services">
            <div className="service-box">Deposit Cash</div>
            <div className="service-box">Ask about Balance</div>

            {/* button to navigate to preferences page */}
            <div className="preferences-button">
              <button onClick={() => navigate('/preferences')} className="preference-nav-button" style={{ fontSize: 'var(--button-font-size)' }}>
                Preferences
              </button>
            </div>

            {/* button to navigate to shortcuts page */}
            <div className="shortcuts-button">
              <button onClick={() => navigate('/shortcuts')} className="shortcuts-nav-button" style={{ fontSize: 'var(--button-font-size)' }}>
                Shortcuts
              </button>
            </div>

            <div className="more-services">
              <p>More services</p>
              <p className="more-link">FAQs &gt;</p>
              <p className="more-link">Customise &gt;</p>
            </div>
          </div>
        </div>
      </div>
      <WatsonChat /> {/* Add Watson Chat component here */}
    </div>
  );
};

export default Home;
