// homepreview.tsx
import React from 'react';

interface Settings {
  theme: string;
  font: string;
  fontWeight: string;
  iconSize: string;
  textToSpeech: boolean;
}

const HomePreview = ({ settings }: { settings: Settings }) => {
  // function to read text aloud if TTS is enabled
  const speak = (text: string) => {
    if (settings.textToSpeech && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.cancel(); // Stop any ongoing speech to avoid overlap
      window.speechSynthesis.speak(utterance);
    }
  };

  // handle single-click for text elements (TTS only)
  const handleTextClick = (text: string) => {
    speak(text);
  };

  // handle double-click for button actions
  const handleButtonDoubleClick = (label: string) => {
    console.log(`${label} activated`);
    alert(`${label} activated`); // Add a visual cue for testing
  };

  return (
    <div
      className={`home-preview-container ${settings.theme === 'dark' ? 'dark-theme' : 'light-theme'}`}
      style={{
        fontFamily: settings.font,
        fontWeight: settings.fontWeight === 'bold' ? '700' : '400',
        fontSize: settings.iconSize === 'large' ? '1.2rem' : '1rem',
        width: '80%', 
        padding: '20px',
        backgroundColor: settings.theme === 'dark' ? '#333' : '#fff',
        color: settings.theme === 'dark' ? '#fff' : '#000',
        border: '1px solid #ccc',
        borderRadius: '8px',
      }}
    >
      <div className="home-grid">
        <div className="cash-options">
          <p 
            className="preview-welcome" 
            onClick={() => handleTextClick("Hello! What would you like to do today?")}
          >
            Hello! <br /> What would you like to do today?
          </p>
          <div className="preview-buttons">
            {['$50', '$80', '$100', '$500'].map((amount) => (
              <button
                key={amount}
                onClick={() => handleTextClick(amount)} // single-click triggers TTS
                onDoubleClick={() => handleButtonDoubleClick(amount)} // double-click triggers button action
                className="preview-cash-button"
                style={{
                  backgroundColor: settings.theme === 'dark' ? '#555' : '#ddd',
                  color: settings.theme === 'dark' ? '#fff' : '#000',
                  fontSize: settings.iconSize === 'large' ? '1.2rem' : '0.9rem'
                }}
              >
                {amount}
              </button>
            ))}
          </div>
        </div>
        <button 
          className="other-cash-button" 
          onClick={() => handleTextClick('Other cash amounts')}
          onDoubleClick={() => handleButtonDoubleClick('Other cash amounts')}
        >
          Other cash amounts
        </button>
      </div>
    </div>
  );
};

export default HomePreview;
