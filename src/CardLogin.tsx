import React, { useState } from "react";
import ocbcimg from "./images/OCBC-Logo.png"; // Update the path as needed
import { useNavigate } from "react-router-dom";

const CardLogin: React.FC = () => {
  const [pin, setPin] = useState<string[]>(["", "", "", "", "", ""]);
  const navigate = useNavigate();

  const handlePinChange = (value: string, index: number) => {
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Move focus to the next input if a digit is entered
    if (value && index < pin.length - 1) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }

    // Check if all fields are filled after updating the PIN
    if (newPin.every((digit) => digit !== "")) {
      navigate("/Home");
    }
  };

  const handleExit = () => {
    navigate("/");
  };

  return (
    <div className="card-login-container">
      <header className="card-login-header">
        <img src={ocbcimg} alt="OCBC Logo" className="ocbc-logo" />
        <div className="header-actions">
          <button className="language-button">中文</button>
          <button onClick={handleExit} className="exit-button">Exit</button>
        </div>
      </header>

      <div className="login-content">
        <h1>Welcome to OCBC ATM</h1>
        <p>Please enter your PIN</p>

        <div className="pin-inputs">
          {pin.map((value, index) => (
            <input
              key={index}
              id={`pin-${index}`}
              type="password"
              maxLength={1}
              value={value}
              onChange={(e) => handlePinChange(e.target.value, index)}
              className="pin-input"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardLogin;
