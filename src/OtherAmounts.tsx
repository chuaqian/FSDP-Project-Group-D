import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OCBCLogo from './images/OCBC-Logo.png';
import { addDoc, collection, Timestamp, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebaseConfig';

interface LocationState {
  userID: string;
  theme?: string;
}

const OtherAmounts: React.FC = () => {
  const [theme, setTheme] = useState('light');
  const [amount, setAmount] = useState('0.00');
  const [loading, setLoading] = useState(true);
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [unusualActivity, setUnusualActivity] = useState(false); // To track unusual activity
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const userID = state?.userID;

  useEffect(() => {
    const savedTheme = state?.theme || localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (!userID) {
      console.error('No user ID found in location state. Cannot proceed.');
      navigate('/');
    } else {
      setLoading(false);
      fetchPreferences(userID); // Fetch preferences with user ID
      checkUnusualActivity(userID); // Check for unusual activity
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

  // Fetch and check for unusual activity (more than 10 transactions per day)
  const checkUnusualActivity = async (userID: string) => {
    const userDocRef = doc(db, 'users', userID);
    const transactionsRef = collection(userDocRef, 'transactions');

    // Query for today's transactions
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(transactionsRef, where('timestamp', '>=', startOfDay), where('timestamp', '<=', endOfDay));

    const querySnapshot = await getDocs(q);
    if (querySnapshot.size > 10) {
      setUnusualActivity(true); // Set the flag for unusual activity
    } else {
      setUnusualActivity(false); // No unusual activity
    }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!isNaN(Number(value))) {
      setAmount(value);
    }
  };

  const handleClear = () => {
    setAmount('0.00');
  };

  const handleConfirm = async () => {
    if (!userID) {
      console.error('No user ID found. Cannot save transaction.');
      return;
    }

    // If unusual activity is detected, show a warning message and prevent the transaction
    if (unusualActivity) {
      alert("Unusual activity detected: More than 10 withdrawals today.");
      return;
    }

    try {
      const userDocRef = doc(db, 'users', userID);
      const transactionsRef = collection(userDocRef, 'transactions');

      await addDoc(transactionsRef, {
        amount: parseFloat(amount),
        timestamp: Timestamp.now(),
      });

      navigate('/withdraw', { state: { userID, theme } });
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`home-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      <div className="home-content4">
      {unusualActivity && (
        <div className="unusual-activity-message">
          Unusual Activity Detected: More than 10 withdrawals today!
        </div>
      )}


        <h2
          className={`text-center ${theme === 'dark' ? 'text-white' : 'text-black'}`}
          onClick={() => handleTextClick("Please enter amount in multiples of $10 or $50")}
        >
          Please enter amount in multiples of $10 or $50
        </h2>

        <div className="input-container">
          <div className="input-box">
            <span>$</span>
            <input
              type="text"
              value={amount}
              onChange={handleInputChange}
              placeholder="0.00"
              onClick={() => handleTextClick("Amount entry field")}
            />
          </div>
        </div>

        <div className="buttons-container">
          <button
            className="button clear-button"
            onClick={() => handleTextClick("Clear")}
            onDoubleClick={handleClear}
          >
            Clear
          </button>
          <button
            className="button confirm-button1"
            onClick={() => handleTextClick("Confirm")}
            onDoubleClick={handleConfirm}
          >
            Confirm
          </button>
        </div>

        <button
          onClick={() => handleTextClick("Go Back")}
          onDoubleClick={() => navigate('/home', { state: { userID, theme } })}
          className="go-back-button2"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default OtherAmounts;
