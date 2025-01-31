import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OCBCLogo from './images/OCBC-Logo.png';
import { db, collection, getDocs } from './firebaseConfig';

// Import images for each note
import TwoDollarImage from './images/2note.png';
import FiveDollarImage from './images/5note.png';
import TenDollarImage from './images/10note.png';
import FiftyDollarImage from './images/50note.png';
import HundredDollarImage from './images/100note.png';
import ThousandDollarImage from './images/1000note.png';

// Import the DispensingConfirmation component
import DispensingConfirmation from './DispensingConfirmation'; // Adjust the path if necessary

interface LocationState {
  userID: string;
  theme?: string;
}

interface DenominationSelectionProps {
  amount: number;
  onBack: () => void; // Only onBack prop is needed
}

const DenominationSelection: React.FC<DenominationSelectionProps> = ({ amount, onBack }) => {
  const [denominations, setDenominations] = useState<{ [key: string]: number }>({
    '1000': 0,
    '100': 0,
    '50': 0,
    '10': 0,
    '5': 0,
    '2': 0,
  });

  const [total, setTotal] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false); // State for confirmation page

  useEffect(() => {
    const calculatedTotal = Object.entries(denominations).reduce((acc, [key, value]) => {
      return acc + parseInt(key) * value;
    }, 0);
    setTotal(calculatedTotal);
  }, [denominations]);

  const handleChange = (denomination: string, value: number) => {
    setDenominations((prev) => ({
      ...prev,
      [denomination]: value,
    }));
  };

  const handleSubmit = () => {
    if (total === amount) {
      setError('');
      setShowConfirmation(true); // Show confirmation page
    } else {
      setError(`Total must be exactly $${amount}. Current total: $${total}`);
    }
  };

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

  // If confirmation page should be shown, render the confirmation component
  if (showConfirmation) {
    return (
      <DispensingConfirmation />
    );
  }

  return (
    <div className={`home-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      {/* OCBC Logo */}
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      {/* Main Content Box */}
      <div className="dscontainer">
        <h1>Select Denomination</h1>
        <h2 className="dstext">Total Amount: ${amount}</h2>
        <div className="denomination-grid">
          <div className="denomination-row">
            <div className="dsinput-group">
              <label>
                <img src={TwoDollarImage} alt="$2 Note" className="note-image" /> $2 Notes:
              </label>
              <input
                type="number"
                min="0"
                value={denominations['2']}
                onChange={(e) => handleChange('2', parseInt(e.target.value))}
              />
            </div>
            <div className="dsinput-group">
              <label>
                <img src={FiveDollarImage} alt="$5 Note" className="note-image" /> $5 Notes:
              </label>
              <input
                type="number"
                min="0"
                value={denominations['5']}
                onChange={(e) => handleChange('5', parseInt(e.target.value))}
              />
            </div>
            <div className="dsinput-group">
              <label>
                <img src={TenDollarImage} alt="$10 Note" className="note-image" /> $10 Notes:
              </label>
              <input
                type="number"
                min="0"
                value={denominations['10']}
                onChange={(e) => handleChange('10', parseInt(e.target.value))}
              />
            </div>
          </div>
          <div className="denomination-row">
            <div className="dsinput-group">
              <label>
                <img src={FiftyDollarImage} alt="$50 Note" className="note-image" /> $50 Notes:
              </label>
              <input
                type="number"
                min="0"
                value={denominations['50']}
                onChange={(e) => handleChange('50', parseInt(e.target.value))}
              />
            </div>
            <div className="dsinput-group">
              <label>
                <img src={HundredDollarImage} alt="$100 Note" className="note-image" /> $100 Notes:
              </label>
              <input
                type="number"
                min="0"
                value={denominations['100']}
                onChange={(e) => handleChange('100', parseInt(e.target.value))}
              />
            </div>
            <div className="dsinput-group">
              <label>
                <img src={ThousandDollarImage} alt="$1000 Note" className="note-image" /> $1000 Notes:
              </label>
              <input
                type="number"
                min="0"
                value={denominations['1000']}
                onChange={(e) => handleChange('1000', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>
        <h3>Selected Total: ${total}</h3>
        {error && <p className="dserror">{error}</p>}
        <div className="button-group">
          <button onClick={handleSubmit} className="dsbutton">
            Confirm
          </button>
          <button onClick={onBack} className="dsback-button">
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default DenominationSelection;