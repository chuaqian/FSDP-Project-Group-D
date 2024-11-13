import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OCBCLogo from './images/OCBC-Logo.png';
import { addDoc, collection, Timestamp, doc } from 'firebase/firestore';
import { db } from './firebaseConfig'; // Make sure db is correctly imported

interface LocationState {
  userID: string;
}

const OtherAmounts: React.FC = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('0.00');
  const [loading, setLoading] = useState(true);

  // Access the userID from location state
  const location = useLocation();
  const state = location.state as LocationState;
  const userID = state?.userID; 

  useEffect(() => {
    console.log('User ID in OtherAmounts:', userID); // Debug log to verify userID
    if (!userID) {
      console.error('No user ID found in location state. Cannot proceed.');
      navigate('/'); 
    } else {
      setLoading(false); 
    }
  }, [userID, navigate]);

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

    try {
      const userDocRef = doc(db, 'users', userID);
      const transactionsRef = collection(userDocRef, 'transactions');

      await addDoc(transactionsRef, {
        amount: parseFloat(amount),  // amount entered by the user
        timestamp: Timestamp.now(),  // current time (timestamp)
      });

      console.log(`Transaction of $${amount} recorded for user ${userID}`);

      navigate('/withdraw', { state: { userID } });
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="home-container">
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      <div className="home-content4">
        <h2 style={{ fontWeight: 'normal', fontSize: '1rem', textAlign: 'center' }}>
          Please enter amount in multiples of $10 or $50
        </h2>

        {/* Input box for amount */}
        <div className="input-container">
          <div className="input-box">
            <span>$</span>
            <input
              type="text"
              value={amount}
              onChange={handleInputChange}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Buttons for actions */}
        <div className="buttons-container">
          <button className="button clear-button" onClick={handleClear}>
            Clear
          </button>
          <button className="button confirm-button1" onClick={handleConfirm}>
            Confirm
          </button>
        </div>

        {/* Go back button */}
        <button onClick={() => navigate('/home', { state: { userID } })} className="go-back-button2">Go Back</button>
      </div>
    </div>
  );
};

export default OtherAmounts;
