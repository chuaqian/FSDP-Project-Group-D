// preference.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import OCBCLogo from './images/OCBC-Logo.png';
import HomePreview from './homepreview';

interface LocationState {
  userID: string;
}

const Preference = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const userID = state?.userID;

  // Preferences states
  const [theme, setTheme] = useState('light');
  const [font, setFont] = useState('Inter');
  const [fontWeight, setFontWeight] = useState('normal');
  const [iconSize, setIconSize] = useState('medium');
  const [textToSpeech, setTextToSpeech] = useState(false);

  const [previewSettings, setPreviewSettings] = useState({
    theme: 'light',
    font: 'Inter',
    fontWeight: 'normal',
    iconSize: 'medium',
    textToSpeech: false,
  });

  const [showPreview, setShowPreview] = useState(false);

  // Fetch preferences from Firestore when userID is available
  useEffect(() => {
    const fetchPreferences = async () => {
      if (userID) {
        const preferencesRef = doc(db, "preferences", userID);
        const docSnap = await getDoc(preferencesRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setTheme(data.theme || 'light');
          setFont(data.font || 'Inter');
          setFontWeight(data.fontWeight || 'normal');
          setIconSize(data.iconSize || 'medium');
          setTextToSpeech(data.textToSpeech || false);
          setPreviewSettings({
            theme: data.theme || 'light',
            font: data.font || 'Inter',
            fontWeight: data.fontWeight || 'normal',
            iconSize: data.iconSize || 'medium',
            textToSpeech: data.textToSpeech || false,
          });
          applySettingsGlobally(data.theme, data.font, data.fontWeight, data.iconSize);
        }
      } else {
        console.error("User ID is missing. Please log in again.");
        navigate('/'); // Redirect to login if userID is missing
      }
    };
    fetchPreferences();
  }, [userID, navigate]);

  // Function to handle text-to-speech
  const speak = (text: string) => {
    if (textToSpeech && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  // Function to apply settings globally
  const applySettingsGlobally = (theme: string, font: string, weight: string, iconSize: string) => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--font-family', font);
    document.documentElement.style.setProperty('--font-weight', weight === 'bold' ? '700' : '400');
    document.documentElement.style.setProperty('--button-font-size', iconSize === 'large' ? '24px' : '16px');
  };

  // Save preferences to Firebase
  const handleSave = async () => {
    try {
      if (!userID) {
        alert("Failed to save preferences. User ID not found. Please log in again.");
        return;
      }

      const preferencesRef = doc(db, "preferences", userID);
      await setDoc(preferencesRef, {
        theme: previewSettings.theme,
        font: previewSettings.font,
        fontWeight: previewSettings.fontWeight,
        iconSize: previewSettings.iconSize,
        textToSpeech: previewSettings.textToSpeech,
      });

      applySettingsGlobally(previewSettings.theme, previewSettings.font, previewSettings.fontWeight, previewSettings.iconSize);
      alert("Preferences saved successfully!");
      navigate('/Home', { state: { userID } }); // Pass userID back to Home for consistency
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert("Failed to save preferences. Please try again.");
    }
  };

  // Update preview settings
  const updatePreview = (key: 'theme' | 'font' | 'fontWeight' | 'iconSize' | 'textToSpeech', value: any) => {
    setPreviewSettings((prevSettings) => ({ ...prevSettings, [key]: value }));
    if (key === 'textToSpeech') setTextToSpeech(value);
  };

  console.log("User ID in Preference:", userID); // Debug log for userID

  return (
    <div className={`preference-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      <div className="preference-content">
        <h1 className="preference-title" onClick={() => speak("Preferences")}>Preferences</h1>
        
        <div>
          <label className="label" onClick={() => speak("Select Theme")}>Select Theme:</label>
          <select value={previewSettings.theme} onChange={(e) => updatePreview('theme', e.target.value)} className="select-box">
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
          </select>
        </div>
        
        <div>
          <label className="label" onClick={() => speak("Select Font")}>Select Font:</label>
          <select value={previewSettings.font} onChange={(e) => updatePreview('font', e.target.value)} className="select-box">
            <option value="Inter">Inter</option>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Roboto">Roboto</option>
            <option value="Georgia">Georgia</option>
          </select>
        </div>

        <div>
          <label className="label" onClick={() => speak("Select Font Weight")}>Select Font Weight:</label>
          <select value={previewSettings.fontWeight} onChange={(e) => updatePreview('fontWeight', e.target.value)} className="select-box">
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </div>

        <div>
          <label className="label" onClick={() => speak("Select Icon Size")}>Select Icon Size:</label>
          <select value={previewSettings.iconSize} onChange={(e) => updatePreview('iconSize', e.target.value)} className="select-box">
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div>
          <label className="label" onClick={() => speak("Enable Text-to-Speech")}>Enable Text-to-Speech:</label>
          <select value={previewSettings.textToSpeech ? 'enabled' : 'disabled'} onChange={(e) => updatePreview('textToSpeech', e.target.value === 'enabled')} className="select-box">
            <option value="disabled">Disable</option>
            <option value="enabled">Enable</option>
          </select>
        </div>

        <button onClick={() => { setShowPreview(!showPreview); speak(showPreview ? "Hide Live Preview" : "Show Live Preview"); }} className="preview-toggle-button" style={{ backgroundColor: showPreview ? '#d32f2f' : '#1976d2', color: 'white' }}>
          {showPreview ? 'Hide Live Preview' : 'Show Live Preview'}
        </button>

        <button onClick={handleSave} className="save-button">Save Preferences</button>
        
        {showPreview && <HomePreview settings={previewSettings} />}
      </div>
    </div>
  );
};

export default Preference;
