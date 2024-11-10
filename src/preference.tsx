// preference.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OCBCLogo from './images/OCBC Logo.png';
import HomePreview from './homepreview';

const Preference = () => {
  const [theme, setTheme] = useState('light');
  const [font, setFont] = useState('Inter');
  const [fontWeight, setFontWeight] = useState('normal');
  const [iconSize, setIconSize] = useState('medium');
  const [textToSpeech, setTextToSpeech] = useState(false); // TTS disabled by default

  const [previewSettings, setPreviewSettings] = useState({
    theme: 'light',
    font: 'Inter',
    fontWeight: 'normal',
    iconSize: 'medium',
    textToSpeech: false,
  });

  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  // load preferences from localStorage on mount
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

    setPreviewSettings({
      theme: savedTheme,
      font: savedFont,
      fontWeight: savedFontWeight,
      iconSize: savedIconSize,
      textToSpeech: savedTextToSpeech,
    });
  }, []);

  // function to handle text-to-speech
  const speak = (text: string) => {
    if (textToSpeech && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.cancel(); // cancel ongoing speech if any
      window.speechSynthesis.speak(utterance);
    }
  };

  // function to apply settings globally for theme, font, and icon size
  const applySettingsGlobally = (theme: string, font: string, weight: string, iconSize: string) => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--font-family', font);
    document.documentElement.style.setProperty('--font-weight', weight === 'bold' ? '700' : '400');
    const buttonSize = iconSize === 'large' ? '24px' : '16px';
    document.documentElement.style.setProperty('--button-font-size', buttonSize);
  };

  // handle saving preferences to localStorage
  const handleSave = () => {
    applySettingsGlobally(previewSettings.theme, previewSettings.font, previewSettings.fontWeight, previewSettings.iconSize);
    localStorage.setItem('theme', previewSettings.theme);
    localStorage.setItem('font', previewSettings.font);
    localStorage.setItem('fontWeight', previewSettings.fontWeight);
    localStorage.setItem('iconSize', previewSettings.iconSize);
    localStorage.setItem('textToSpeech', previewSettings.textToSpeech ? 'enabled' : 'disabled');
    navigate('/');
  };

  // update preview settings
  const updatePreview = (key: 'theme' | 'font' | 'fontWeight' | 'iconSize' | 'textToSpeech', value: any) => {
    setPreviewSettings((prevSettings) => ({ ...prevSettings, [key]: value }));
    if (key === 'textToSpeech') setTextToSpeech(value);
  };

  return (
    <div className={`preference-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      <div className="preference-content">
        <h1 
          className="preference-title" 
          onClick={() => speak("Preferences")}
        >
          Preferences
        </h1>

        <div>
          <label 
            className="label" 
            onClick={() => speak("Select Theme")}
          >
            Select Theme:
          </label>
          <select 
            value={previewSettings.theme} 
            onChange={(e) => updatePreview('theme', e.target.value)} 
            className="select-box"
            onClick={() => speak(`Theme is set to ${previewSettings.theme}`)}
          >
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
          </select>
        </div>

        <div>
          <label 
            className="label" 
            onClick={() => speak("Select Font")}
          >
            Select Font:
          </label>
          <select 
            value={previewSettings.font} 
            onChange={(e) => updatePreview('font', e.target.value)} 
            className="select-box"
            onClick={() => speak(`Font is set to ${previewSettings.font}`)}
          >
            <option value="Inter">Inter</option>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Roboto">Roboto</option>
            <option value="Georgia">Georgia</option>
            <option value="Courier New">Courier New</option>
          </select>
        </div>

        <div>
          <label 
            className="label" 
            onClick={() => speak("Select Font Weight")}
          >
            Select Font Weight:
          </label>
          <select 
            value={previewSettings.fontWeight} 
            onChange={(e) => updatePreview('fontWeight', e.target.value)} 
            className="select-box"
            onClick={() => speak(`Font weight is set to ${previewSettings.fontWeight}`)}
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </div>

        <div>
          <label 
            className="label" 
            onClick={() => speak("Select Icon Size")}
          >
            Select Icon Size:
          </label>
          <select 
            value={previewSettings.iconSize} 
            onChange={(e) => updatePreview('iconSize', e.target.value)} 
            className="select-box"
            onClick={() => speak(`Icon size is set to ${previewSettings.iconSize}`)}
          >
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div>
          <label 
            className="label" 
            onClick={() => speak("Enable Text-to-Speech")}
          >
            Enable Text-to-Speech:
          </label>
          <select
            value={previewSettings.textToSpeech ? 'enabled' : 'disabled'}
            onChange={(e) => updatePreview('textToSpeech', e.target.value === 'enabled')}
            className="select-box"
            onClick={() => speak(`Text-to-speech is ${previewSettings.textToSpeech ? "enabled" : "disabled"}`)}
          >
            <option value="disabled">Disable</option>
            <option value="enabled">Enable</option>
          </select>
        </div>

        <button
          onClick={() => {
            setShowPreview(!showPreview);
            speak(showPreview ? "Hide Live Preview" : "Show Live Preview");
          }}
          className="preview-toggle-button"
          style={{
            backgroundColor: showPreview ? '#d32f2f' : '#1976d2',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            marginBottom: '15px',
            cursor: 'pointer',
          }}
        >
          {showPreview ? 'Hide Live Preview' : 'Show Live Preview'}
        </button>

        <button 
          onClick={() => {
            handleSave();
            speak("Save Preferences");
          }}
          className="save-button"
        >
          Save Preferences
        </button>

        {showPreview && (
          <div className="live-preview">
            <h2 className="preview-title" onClick={() => speak("Live Preview")}>Live Preview</h2>
            <div className="preview-container">
              <HomePreview settings={previewSettings} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Preference;
