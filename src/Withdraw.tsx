import React from 'react';
import { useNavigate } from 'react-router-dom';
import OCBCLogo from './images/OCBC-Logo.png'; 

const Withdraw = () => {
  const navigate = useNavigate();
  
  const userID = "user-id";  

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
