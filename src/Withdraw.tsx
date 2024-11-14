import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import OCBCLogo from './images/OCBC-Logo.png';

interface LocationState {
  userID: string;
  theme?: string; // Optional theme property
}

const Withdraw: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const userID = state?.userID;
  const [theme, setTheme] = useState('light');

  // Handle cases where userID is missing (e.g., navigate to a safe page)
  useEffect(() => {
    const savedTheme = state?.theme || localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (!userID) {
      console.error('No user ID found in Withdraw page.');
      navigate('/'); // Redirect to home if no userID
    }
  }, [userID, navigate, state?.theme]);

  if (!userID) {
    return null; // Prevent rendering if there's no user ID
  }

  return (
    <div className={`home-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      <div className="home-content">
      <h2 className={`withdraw-heading ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
        Withdraw Confirmation
      </h2>
      <p className={`withdraw-message ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
        Your withdrawal has been successfully processed.
      </p>
        <button
          onClick={() => navigate('/OtherAmounts', { state: { userID, theme } })}
          className="go-back-button3"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Withdraw;
