import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OCBCLogo from './images/OCBC Logo.png';

const Preference = () => {
  // state variables for user preferences with default values
  const [theme, setTheme] = useState('light');
  const [font, setFont] = useState('Inter');
  const [fontWeight, setFontWeight] = useState('normal');
  const [iconSize, setIconSize] = useState('medium');
  const navigate = useNavigate();

  // load saved preferences from localStorage when the component mounts
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedFont = localStorage.getItem('font') || 'Inter';
    const savedFontWeight = localStorage.getItem('fontWeight') || 'normal';
    const savedIconSize = localStorage.getItem('iconSize') || 'medium';

    // set state based on saved preferences
    setTheme(savedTheme);
    setFont(savedFont);
    setFontWeight(savedFontWeight);
    setIconSize(savedIconSize);

    // apply preferences globally
    applyPreferences(savedTheme, savedFont, savedFontWeight, savedIconSize);
  }, []);

  // function to apply preferences to the document's root element
  const applyPreferences = (theme: string, font: string, weight: string, iconSize: string) => {
    // apply theme
    document.documentElement.setAttribute('data-theme', theme);

    // apply font and font weight using css variables
    document.documentElement.style.setProperty('--font-family', font);
    document.documentElement.style.setProperty('--font-weight', weight === 'bold' ? '700' : '400');

    // adjust button/icon size based on preference
    const buttonSize = iconSize === 'large' ? '24px' : '16px';
    document.documentElement.style.setProperty('--button-font-size', buttonSize);
  };

  // update preferences in real time as user makes changes
  useEffect(() => {
    applyPreferences(theme, font, fontWeight, iconSize);
  }, [theme, font, fontWeight, iconSize]);

  // save preferences to localStorage and navigate to the home page
  const handleSave = () => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('font', font);
    localStorage.setItem('fontWeight', fontWeight);
    localStorage.setItem('iconSize', iconSize);
    navigate('/'); // navigate back to home page
  };

  return (
    <div className={`preference-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      <div className="preference-content">
        <h1 className="preference-title">Preferences</h1>
        
        {/* dropdown to select theme */}
        <div>
          <label className="label">Select Theme:</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)} className="select-box">
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
          </select>
        </div>

        {/* dropdown to select font */}
        <div>
          <label className="label">Select Font:</label>
          <select value={font} onChange={(e) => setFont(e.target.value)} className="select-box">
            <option value="Inter">Inter</option>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Roboto">Roboto</option>
            <option value="Georgia">Georgia</option>
            <option value="Courier New">Courier New</option>
          </select>
        </div>

        {/* dropdown to select font weight */}
        <div>
          <label className="label">Select Font Weight:</label>
          <select value={fontWeight} onChange={(e) => setFontWeight(e.target.value)} className="select-box">
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </div>

        {/* dropdown to select icon size */}
        <div>
          <label className="label">Select Icon Size:</label>
          <select value={iconSize} onChange={(e) => setIconSize(e.target.value)} className="select-box">
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        {/* save preferences button */}
        <button onClick={handleSave} className="save-button">Save Preferences</button>
      </div>
    </div>
  );
};

export default Preference;
