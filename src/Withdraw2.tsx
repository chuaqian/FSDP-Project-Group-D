import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import OCBCLogo from './images/OCBC-Logo.png';
import { db, collection, getDocs } from './firebaseConfig';

interface LocationState {
  userID: string;
  theme?: string;
  withdrawnAmount?: number;
}

const Withdraw: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const userID = state?.userID;
  const withdrawnAmount = state?.withdrawnAmount; 
  const [theme, setTheme] = useState('light');
  const [textToSpeech, setTextToSpeech] = useState(false);

  useEffect(() => {
    const savedTheme = state?.theme || localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (!userID) {
      console.error('No user ID found in Withdraw page.');
      navigate('/');
    } else {
      fetchPreferences(userID); // Fetch preferences with user ID
    }
  }, [userID, navigate, state?.theme]);

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

  const speak = (text: string) => {
    if (textToSpeech && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTextClick = (text: string) => {
    if (textToSpeech) speak(text);
  };

  return (
    <div className={`home-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      <div className="home-content">
        <h2
          className={`withdraw-heading ${theme === 'dark' ? 'text-white' : 'text-black'}`}
          onClick={() => handleTextClick("Withdraw Confirmation")}
        >
          Withdraw Confirmation
        </h2>
        <p
          className={`withdraw-message ${theme === 'dark' ? 'text-white' : 'text-black'}`}
          onClick={() => handleTextClick(`Your withdrawal of $${withdrawnAmount ? withdrawnAmount : 0} has been successfully processed.`)}
        >
          Your withdrawal of ${withdrawnAmount ? withdrawnAmount : 0} has been successfully processed.
        </p>
        <button
          onClick={() => handleTextClick("Go Back")}
          onDoubleClick={() => navigate('/Home', { state: { userID, theme } })}
          className="go-back-button3"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Withdraw;
