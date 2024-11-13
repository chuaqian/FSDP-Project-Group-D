// home.tsx
import React, { useEffect, useState } from 'react';
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from './firebaseConfig';
import OCBCLogo from './images/OCBC-Logo.png';
import { useLocation, useNavigate } from "react-router-dom";

interface UserData {
  uid: string;
  email: string | null;
  displayName: string;
}

interface LocationState {
  userID: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [font, setFont] = useState('Inter');
  const [fontWeight, setFontWeight] = useState('normal');
  const [iconSize, setIconSize] = useState('medium');
  const [textToSpeech, setTextToSpeech] = useState(false);

  const location = useLocation();
  const state = location.state as LocationState;
  const userID = state?.userID;

  // State to store user data
  const [user, setUser] = useState<UserData | null>(null);

  // Fetch the user details if userID is provided
  useEffect(() => {
    const fetchUserData = async () => {
      if (userID) {
        try {
          const userRef = doc(db, "users", userID);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            setUser({ uid: userID, ...userDoc.data() } as UserData);
          } else {
            console.error("No such user found");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [userID]);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (userID) {
        const preferencesRef = doc(db, "preferences", userID);
        const docSnap = await getDoc(preferencesRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setTheme(data.theme);
          setFont(data.font);
          setFontWeight(data.fontWeight);
          setIconSize(data.iconSize);
          setTextToSpeech(data.textToSpeech);

          // Apply the loaded preferences to document styling
          document.documentElement.setAttribute('data-theme', data.theme);
          document.documentElement.style.fontFamily = data.font;
          document.documentElement.style.fontWeight = data.fontWeight === 'bold' ? '700' : '400';
          document.documentElement.style.setProperty('--button-font-size', data.iconSize === 'large' ? '24px' : '16px');
        }
      }
    };
    fetchPreferences();
  }, [userID]);

  const speak = (text: string) => {
    if (textToSpeech && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTextClick = (text: string) => {
    if (textToSpeech) speak(text);
  };

  const handleButtonClick = (label: string, action: () => void) => {
    if (textToSpeech) {
      return {
        onClick: () => handleTextClick(label),
        onDoubleClick: action,
      };
    } else {
      return { onClick: action };
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  console.log("User ID in Home:", userID);


  return (
    <div className={`home-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <img src={OCBCLogo} alt="OCBC Logo" className="fixed-logo large-logo" />
      <button onClick={handleLogout} className="logout-button">Log Out</button>
      <div className="home-content">
        <div className="home-grid">
          <div className="cash-options">
            <h1 className="welcome-text" onClick={() => handleTextClick("Hello! What would you like to do today?")}>
              Hello!  <br /> What would you like to do today?
            </h1>
            <div className="cash-buttons">
              {['$50', '$80', '$100', '$500'].map((amount) => (
                <button
                  key={amount}
                  {...handleButtonClick(amount, () => console.log(`${amount} activated`))}
                  className="cash-button"
                >
                  {amount}
                </button>
              ))}
            </div>
            <button 
              className="other-cash-button" 
              onClick={() => {
                handleButtonClick('Other cash amounts', () => console.log('Other cash amounts activated'));
                navigate('/OtherAmounts', { state: { userID} });  // Passing userID in the state
              }}
            >
              Other cash amounts
            </button>

          </div>

          <div className="non-cash-services">
            <div className="service-box" onClick={() => handleTextClick('Deposit Cash')}>Deposit Cash</div>
            <div className="service-box" onClick={() => handleTextClick('Ask about Balance')}>Ask about Balance</div>

            <div className="preferences-button">
              <button {...handleButtonClick('Preferences', () => navigate('/preferences', { state: { userID } }))} className="preference-nav-button">Preferences</button>
            </div>

            <div className="shortcuts-button">
              <button {...handleButtonClick('Shortcuts', () => navigate('/shortcuts', { state: { userID }}))} className="shortcuts-nav-button">Shortcuts</button>
            </div>

            <div className="more-services">
              <p className="more-link" onClick={() => handleTextClick('More services')}>More services &gt;</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
