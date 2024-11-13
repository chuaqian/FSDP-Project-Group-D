import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import OCBCLogo from './images/OCBC-Logo.png';

interface LocationState {
  userID: string;
}

const Withdraw = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const userID = state?.userID;

  // Handle cases where userID is missing (e.g., navigate to a safe page)
  if (!userID) {
    console.error("No user ID found in Withdraw page.");
    navigate('/'); // Redirect to home if no userID
    return null; // Render nothing during redirect
  }

  return (
    <div className="home-container">
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      <div className="home-content">
        <h2 className="withdraw-heading">Withdraw Confirmation</h2>
        <p className="withdraw-message">Your withdrawal has been successfully processed.</p>
        
        <button
          onClick={() => navigate('/OtherAmounts', { state: { userID } })}
          className="go-back-button3"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Withdraw;
