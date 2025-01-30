import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OCBCLogo from './images/OCBC-Logo.png';

interface TransferSuccessState {
  userID: string;
  theme: string;
  amount: string;
  accountNumber: string;
}

const TransferSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userID, theme, amount, accountNumber } = location.state as TransferSuccessState;

  const handleGoHome = () => {
    navigate('/home', { state: { userID, theme } });
  };

  return (
    <div className={`home-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      <div className="home-content5">
        <h1 className="text-2xl font-bold text-center">
          Transfer Successful
        </h1>
        <p className="transaction-info1 text-center">
          Your transfer of {`SGD $${amount}`} to account {accountNumber} has been successfully completed.
        </p>
        <div className="button-group flex justify-center gap-4 mt-4">
          <button onClick={handleGoHome} className="go-home-button">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferSuccess;
