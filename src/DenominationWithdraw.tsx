import React, { useState } from 'react';
import DenominationSelection from './DenominationSelection';
import { useLocation, useNavigate } from 'react-router-dom';
import OCBCLogo from './images/OCBC-Logo.png';

interface LocationState {
  userID: string;
  theme?: string;
}

const DenominationWithdraw: React.FC = () => {
  const [amount, setAmount] = useState<number>(1000);
  const [showDenominationSelection, setShowDenominationSelection] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const theme = state?.theme;
  const userID = state?.userID;

  const handleBackClick = () => {
    navigate('/Home', { state: { userID, theme } });
  };

  return (
    <div className={`home-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      {/* OCBC Logo */}
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      {/* Main Content Box */}
      <div className="withdraw-container">
        {!showDenominationSelection ? (
          <div className="withdraw-box">
            <h1 className="withdraw-title">Withdraw Cash</h1>
            <p className="withdraw-instruction">Enter the amount you wish to withdraw:</p>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value))}
              min="1"
              className="withdraw-input"
            />
            <div className="button-group">
              <button
                onClick={() => setShowDenominationSelection(true)}
                className="withdraw-button"
              >
                Select Denomination
              </button>
              <button
                onClick={handleBackClick}
                className="dsback-button"
              >
                Back
              </button>
            </div>
          </div>
        ) : (
          <DenominationSelection
            amount={amount}
            onBack={() => setShowDenominationSelection(false)}
          />
        )}
      </div>
    </div>
  );
};

export default DenominationWithdraw;