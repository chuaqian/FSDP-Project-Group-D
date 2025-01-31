import React, { useState, useEffect} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OCBCLogo from './images/OCBC-Logo.png';
import { db, collection, getDocs } from './firebaseConfig';

interface LocationState {
  userID: string;
  theme?: string;
}

const MoreServices: React.FC = () => {
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [theme, setTheme] = useState('light');
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const userID = state?.userID;

  // Fetch user preferences for TTS 
  useEffect(() => {
    const savedTheme = state?.theme || localStorage.getItem('theme') || 'light'; // Load theme preference
    setTheme(savedTheme); // Update theme state
    console.log('Saved theme:', savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme); // Apply theme to the document

    if (userID) {
      fetchPreferences(userID);
    }
  }, [userID, state?.theme]);

  const fetchPreferences = async (userID: string) => {
    const preferencesRef = collection(db, "preferences");
    const querySnapshot = await getDocs(preferencesRef);

    querySnapshot.forEach((doc) => {
      if (doc.id === userID) {
        const data = doc.data();
        setTextToSpeech(data.textToSpeech || false);
      }
    });
  };

  // Text-to-speech function 
  const speak = (text: string) => {
    if (textToSpeech && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  // Text click handler
  const handleTextClick = (text: string) => {
    if (textToSpeech) speak(text); // Call speak function for TTS
    console.log(text); // Log the clicked text
  };

  const handleNavigate = (page: string) => {
    if (page === 'CurrencyExchange') {
      navigate('/CurrencyExchange', { state: { userID, theme } });
    }
  }
  const handleNavigateDeno = (page: string) => {
    if (page === 'DenominationWithdraw') {
      navigate('/DenominationWithdraw', { state: { userID, theme } });
    }
  }
  
  // Back button handler
  const handleBackClick = () => {
    navigate('/Home', { state: { userID, theme } }); // Navigate back to Home page
  };

  return (
    <div className={`home-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      {/* OCBC Logo */}
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
        {/* Main Content Box */}
        <div className="home-content4">
            <h2
                className={`text-center ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                onClick={() => handleTextClick("More Services")}
                >
                More Services
            </h2>
            
            {/* Grid Layout for Service Boxes */}
            <div className="homeGrid">
                <div 
                  className="serviceBox" 
                  onClick={() => handleTextClick('Currency Exchange')}
                  onDoubleClick={() => handleNavigate ('CurrencyExchange')}
                  >
                    Currency Exchange
                </div>
                <div 
                className="serviceBox"
                onClick={() => handleTextClick('Denomination')}
                onDoubleClick={() => handleNavigateDeno('DenominationWithdraw')}
                  >
                    Denomination
                </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => handleTextClick("Back to Home")} // TTS on first click
              onDoubleClick={handleBackClick} // Navigate back to Home on second click
              className="backButton"
            >
              Back to Home
            </button>
      </div>
      
    </div>
  );
};

export default MoreServices;
