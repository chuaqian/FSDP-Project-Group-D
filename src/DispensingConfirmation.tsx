import React from 'react';
import { useNavigate } from 'react-router-dom';

const DispensingConfirmation: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/Home');
  };

  return (
    <div className="confirmation-container">
      <h2>Thank You!</h2>
      <p>Please wait while we dispense your new notes.</p>
      <button onClick={handleBackToHome} className="confirmation-button">
        Back to Home
      </button>
    </div>
  );
};

export default DispensingConfirmation;