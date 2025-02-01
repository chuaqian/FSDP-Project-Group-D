import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const ThankYou = () => {
  const navigate = useNavigate();

  const handleHome = () => {
    navigate('/Home'); // Navigate back to the home page
  };

  return (
    <div className="thankyoucontainer">
      <div className="thankyoucontent">
        <h1>Thank You!</h1>
        <p>Your purchase was successful. A confirmation email has been sent to your inbox.</p>
        <p>Your ticket number is: <strong>#123456</strong></p>

        {/* Home Button */}
        <button onClick={handleHome} className="homebutton">
          Home
        </button>
      </div>
    </div>
  );
};

export default ThankYou;