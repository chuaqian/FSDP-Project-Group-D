import React, { useState } from 'react';
import { useLocation, useNavigate  } from 'react-router-dom';
import './index.css';
import OCBCLogo from './images/OCBC-Logo.png';

interface LocationState {
  theme?: string;
}

const ThankYou = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const theme = state?.theme;
  

  const handleHome = () => {
    navigate('/Home');
  };

  return (
    <div className={`home-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      {/* OCBC Logo */}
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      {/* Main Content Box */}
      <div className="thankyoucontainer">
        <div className="thankyoucontent">
          <h1>Thank You!</h1>
          <p>Your purchase was successful. A confirmation email has been sent to your inbox.</p>
          <p>Your ticket number is: <strong>#123456</strong></p>

          <button onClick={handleHome} className="homebutton">
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;