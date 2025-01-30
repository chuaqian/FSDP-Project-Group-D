import React from "react";
import { useNavigate } from "react-router-dom";
import ocbcimg from "./images/OCBC-Logo.png";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page-container">
      <header className="landing-page-header">
        <img src={ocbcimg} alt="OCBC Logo" className="ocbc-logo" />
      </header>
      <div className="warning-section">
        <h1>STAY SAFE, BE VIGILANT ALWAYS.</h1>
        <p>
          Before using this machine, if you suspect it has been tampered with or
          there are suspicious individuals nearby, choose another machine or use
          it at another time. Please contact 1800 363 3333 for any security
          concerns.
        </p>
        <p>时刻保持警惕</p>
        <p>
          在使用提款机之前，如果发现提款机曾被人动过手脚或附近有任何可疑人
          物，请选择使用其他地点的提款机或改在其他时间来使用。若有任何保安
          方面的疑虑，请拨电1800 363 3333查詢。
        </p>
      </div>

      <div className="button-section">
        <button onClick={() => navigate("/CardLogin")} className="action-button">
          Login with Physical Card
        </button>
        <button onClick={() => navigate("/QRScanner")} className="action-button">
          Login with QR-Code
        </button>
        <button onClick={() => navigate("/FaceIDLogin")} className="action-button">
          Login with Face ID
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
