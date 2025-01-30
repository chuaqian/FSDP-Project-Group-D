import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OCBCLogo from './images/OCBC-Logo.png';
import { addDoc, collection, Timestamp, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';

interface LocationState {
  userID: string;
  theme?: string;
  sgdAmount: number;  // Amount in SGD
  selectedCurrency: string;  // Selected currency (e.g., SGD, USD, etc.)
  exchangeRate: number;  // Exchange rate for selected currency to SGD
}

const Transfer: React.FC = () => {
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('SGD');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const userID = state?.userID;
  const theme = state?.theme || 'light';
  const sgdAmount = state?.sgdAmount || 0;  // Retrieve the passed SGD amount
  const selectedCurrency = state?.selectedCurrency || 'SGD';  // Retrieve the selected currency
  const exchangeRate = state?.exchangeRate || 1;  // Retrieve the exchange rate to SGD

  useEffect(() => {
    if (!userID) {
      console.error('No user ID found. Cannot proceed.');
      navigate('/');
    } else {
      setLoading(false);
    }
  }, [userID, navigate]);
  
  useEffect(() => {
    // Pre-fill the amount field with the passed SGD amount (already rounded)
    setAmount(sgdAmount.toString());
  }, [sgdAmount]);  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountNumber(e.target.value);
  };

  const handleConfirm = async () => {
    if (!accountNumber.match(/\d{3}-\d{5}6-001/)) {
      setError('Please enter a valid account number in the format XXX-XXXXX6-001.');
      return;
    }
  
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
  
    try {
      const userDocRef = doc(db, 'users', userID);
      const transactionsRef = collection(userDocRef, 'transactions');
  
      // Store account number and transaction details in Firestore
      await addDoc(transactionsRef, {
        accountno: accountNumber,
        amount: parseFloat(amount),
        currency: 'SGD',  // Store the currency as SGD
        timestamp: Timestamp.now(),
      });
  
      // After saving the transaction, redirect to the TransferSuccess page
      navigate('/transfersuccess', { state: { userID, theme, amount, accountNumber } });
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };
  

  const handleGoBack = () => {
    navigate('/currencyexchange', { state: { userID, theme } });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`home-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      <div className="home-content5">
        <h2
          className={`text-center ${theme === 'dark' ? 'text-white' : 'text-black'}`}
        >
          Please enter the account you want to transfer to
        </h2>

        <div className="input-container1">
          <div className="input-box1">
            <span>Account:</span>
            <input
              type="text"
              value={accountNumber}
              onChange={handleInputChange}
              placeholder="Account Number"
            />
          </div>

          <div className="input-box1">
            <span>Amount:</span>
            {/* Display the amount, but do not allow editing */}
            <div className="amount-display1">
              {/* Display "SGD $" in front of the amount */}
              <span>{`SGD $ ${amount}`}</span>
            </div>
          </div>

          {error && <p className="error1">{error}</p>}

          <button onClick={handleConfirm} className="confirm-button2">Confirm Transfer</button>
          <button onClick={handleGoBack} className="go-back-button4">Go Back</button>
        </div>
      </div>
    </div>
  );
};

export default Transfer;
