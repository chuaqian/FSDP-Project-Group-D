import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import OCBCLogo from './images/OCBC-Logo.png';
import { db, collection, getDocs } from './firebaseConfig';

interface TransactionState {
  type: string;
  amount: string;
  userId: string | null;
}

const TransactionConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const transaction = location.state as TransactionState;

  const [theme, setTheme] = useState('light');
  const [userId, setUserId] = useState<string | null>(null);
  const [textToSpeech, setTextToSpeech] = useState(false);

  useEffect(() => {
    const savedTheme = location.state?.theme || localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (transaction?.userId) {
      setUserId(transaction.userId);
      fetchPreferences(transaction.userId); // Fetch TTS preference based on user ID
    } else {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserId(user.uid);
          fetchPreferences(user.uid); // Fetch TTS preference based on authenticated user ID
        } else {
          console.error("No user ID found. Redirecting to login.");
          navigate('/');
        }
      });
    }
  }, [navigate, transaction]);

  // Fetch user preferences from Firestore using getDocs
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

  const goBack = () => {
    if (userId) {
      navigate('/shortcuts', { state: { userID: userId, theme } });
    } else {
      alert("No user ID found. Cannot proceed.");
      navigate('/');
    }
  };

  return (
    <div className={`home-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      <div className="home-content3">
        <h1
          className="text-2xl font-bold text-center"
          onClick={() => handleTextClick("Transaction Confirmation")}
        >
          Transaction Confirmation
        </h1>
        <p
          className="transaction-info1 text-center"
          onClick={() => handleTextClick(`You are about to confirm the ${transaction.type} transaction. Please review your details.`)}
        >
          You are about to confirm the {transaction.type} transaction. Please review your details.
        </p>
        <div className="transaction-box1 text-center">
          <p className="text-xl-half" onClick={() => handleTextClick(`Transaction: ${transaction.type}`)}>
            Transaction: {transaction.type}
          </p>
          <p className="text-xl-half" onClick={() => handleTextClick(`Amount: $${transaction.amount}`)}>
            Amount: ${transaction.amount}
          </p>
        </div>
        <div className="button-group flex justify-center gap-4 mt-4">
          <button
            className="go-back-button text-sm"
            onClick={() => handleTextClick("Go Back")}
            onDoubleClick={goBack}
          >
            Go Back
          </button>
          <button
            className="confirm-button text-sm"
            onClick={() => handleTextClick("Confirm")}
            onDoubleClick={() => alert("Transaction confirmed")} // Replace with actual confirmation action
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionConfirmation;
