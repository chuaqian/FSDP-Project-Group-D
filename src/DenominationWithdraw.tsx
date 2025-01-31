import React, { useState, useEffect } from 'react';
import DenominationSelection from './DenominationSelection';
import { useLocation, useNavigate } from 'react-router-dom';
import { db, collection, getDocs } from './firebaseConfig';
import OCBCLogo from './images/OCBC-Logo.png';

interface LocationState {
  userID: string;
  theme?: string;
}

const DenominationWithdraw: React.FC = () => {
  const [amount, setAmount] = useState<number>(1000);
  const [showDenominationSelection, setShowDenominationSelection] = useState<boolean>(false);

  const [textToSpeech, setTextToSpeech] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const userID = state?.userID;
  const theme = state?.theme;

  // Fetch user preferences for TTS 
  useEffect(() => {
    const fetchPreferences = async () => {
      if (userID) {
        const preferencesRef = collection(db, "preferences");
        const querySnapshot = await getDocs(preferencesRef);
        querySnapshot.forEach((doc) => {
          if (doc.id === userID) {
            const data = doc.data();
            setTextToSpeech(data.textToSpeech || false); // Set TTS preference
          }
        });
      }
    };

    fetchPreferences();
  }, [userID]);

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

  // Back button handler
  const handleBackClick = () => {
    navigate('/Home', { state: { userID, theme } }); // Navigate back to Home page
  };

  return (
    <div className={`home-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      {/* OCBC Logo */}
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      {/* Main Content Box */}
      <div className="withdraw-container">
        {!showDenominationSelection ? (
          <div className="withdraw-box">
            <h1 className="withdraw-title">Withdraw Cash</h1>
            <p className="withdraw-instruction">Enter the amount you wish to withdraw:</p>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value))}
              min="1"
              className="withdraw-input"
            />
            <div className="button-group">
              <button
                onClick={() => setShowDenominationSelection(true)}
                className="withdraw-button"
              >
                Select Denomination
              </button>
              <button
                onClick={handleBackClick}
                className="dsback-button"
              >
                Back
              </button>
            </div>
          </div>
        ) : (
          <DenominationSelection
            amount={amount}
            onBack={() => setShowDenominationSelection(false)} // Only pass onBack prop
          />
        )}
      </div>
    </div>
  );
};

export default DenominationWithdraw;