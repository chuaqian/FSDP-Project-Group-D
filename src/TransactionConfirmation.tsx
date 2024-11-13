import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; 
import OCBCLogo from './images/OCBC-Logo.png';

interface TransactionState {
  type: string;
  amount: string;
  userId: string | null;
}

const TransactionConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState('light');
  const [userId, setUserId] = useState<string | null>(null);

  // Access the passed transaction data
  const transaction = location.state as TransactionState;

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (transaction?.userId) {
      setUserId(transaction.userId); // Use the userId passed from Shortcuts
    } else {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserId(user.uid); 
        } else {
          console.error("No user ID found. Redirecting to login.");
          navigate('/'); 
        }
      });
    }
  }, [navigate, transaction]);

  const goBack = () => {
    if (userId) {
      // Navigate back to Shortcuts with userId in state
      navigate('/shortcuts', { state: { userID: userId } });
    } else {
      alert("No user ID found. Cannot proceed.");
      navigate('/');
    }
  };

  return (
    <div className={`home-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      
      <div className="home-content3">
        <h1 className="text-2xl font-bold text-center">Transaction Confirmation</h1>
        <p className="transaction-info1 text-center">
          You are about to confirm the {transaction.type} transaction. Please review your details.
        </p>
        <div className="transaction-box1 text-center">
          <p className="text-xl-half">Transaction: {transaction.type}</p>
          <p className="text-xl-half">Amount: ${transaction.amount}</p>
        </div>
        <div className="button-group flex justify-center gap-4 mt-4">
          <button onClick={goBack} className="go-back-button text-sm">
            Go Back
          </button>
          <button className="confirm-button text-sm">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionConfirmation;
