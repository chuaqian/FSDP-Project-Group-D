// homepreview.tsx

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
      window.speechSynthesis.cancel();
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
        width: '90%', 
        padding: '20px',
        margin: '0 auto',
        backgroundColor: settings.theme === 'dark' ? '#333' : '#fff',
        color: settings.theme === 'dark' ? '#fff' : '#000',
        border: '1px solid #ccc',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="home-grid" style={{ display: 'flex', justifyContent: 'space-between' }}>
        
        {/* Left Side: Cash Options */}
        <div className="cash-options" style={{ width: '48%' }}>
          <p 
            className="preview-welcome" 
            onClick={() => handleTextClick("Hello! What would you like to do today?")}
            style={{
              fontSize: settings.iconSize === 'large' ? '1.5rem' : '1.2rem',
              marginBottom: '15px',
              textAlign: 'center'
            }}
          >
            Hello! <br /> What would you like to do today?
          </p>
          <div className="preview-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {['$50', '$80', '$100', '$500'].map((amount) => (
              <button
                key={amount}
                onClick={() => handleTextClick(amount)} // single-click triggers TTS
                onDoubleClick={() => handleButtonDoubleClick(amount)} // double-click triggers button action
                className="preview-cash-button"
                style={{
                  backgroundColor: settings.theme === 'dark' ? '#555' : '#ddd',
                  color: settings.theme === 'dark' ? '#fff' : '#000',
                  fontSize: settings.iconSize === 'large' ? '1.1rem' : '0.9rem',
                  padding: '10px 15px',
                  borderRadius: '5px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {amount}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Other Services */}
        <div className="non-cash-services" style={{ width: '48%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            className="other-cash-button" 
            onClick={() => handleTextClick('Other cash amounts')}
            onDoubleClick={() => handleButtonDoubleClick('Other cash amounts')}
            style={{
              backgroundColor: settings.theme === 'dark' ? '#444' : '#ccc',
              color: settings.theme === 'dark' ? '#fff' : '#000',
              padding: '15px',
              fontSize: settings.iconSize === 'large' ? '1.1rem' : '0.9rem',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'center',
              fontWeight: settings.fontWeight === 'bold' ? 'bold' : 'normal',
            }}
          >
            Other cash amounts
          </button>

          <button 
            className="service-box"
            onClick={() => handleTextClick('Deposit Cash')}
            onDoubleClick={() => handleButtonDoubleClick('Deposit Cash')}
            style={{
              backgroundColor: '#1976d2',
              color: '#fff',
              padding: '15px',
              fontSize: settings.iconSize === 'large' ? '1.1rem' : '0.9rem',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              textAlign: 'center',
              fontWeight: settings.fontWeight === 'bold' ? 'bold' : 'normal',
            }}
          >
            Deposit Cash
          </button>

          <button 
            className="service-box"
            onClick={() => handleTextClick('Ask about Balance')}
            onDoubleClick={() => handleButtonDoubleClick('Ask about Balance')}
            style={{
              backgroundColor: '#1976d2',
              color: '#fff',
              padding: '15px',
              fontSize: settings.iconSize === 'large' ? '1.1rem' : '0.9rem',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              textAlign: 'center',
              fontWeight: settings.fontWeight === 'bold' ? 'bold' : 'normal',
            }}
          >
            Ask about Balance
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePreview;
