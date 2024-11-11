import { useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import ocbcimg from "./images/OCBC-Logo.png";
import CryptoJS from "crypto-js";
import { db } from "./firebaseConfig"; 

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

const generateToken = (userID: string, timestamp: number) => {
  return CryptoJS.HmacSHA256(`${userID}:${timestamp}`, SECRET_KEY).toString(CryptoJS.enc.Hex);
};

export default function QRScanner() {
  const navigate = useNavigate();

  const onScanSuccess = async (decodedText: string) => {
    try {
      const token = decodedText; // Only the token is in the QR code
      const currentTimestamp = Math.floor(Date.now() / 10000); 

      // Check each possible userID in Firestore to find the matching token
      const userRef = collection(db, "users");
      const querySnapshot = await getDocs(userRef);

      let isUserValid = false;

      querySnapshot.forEach((doc) => {
        const user = doc.data();
        const expectedToken = generateToken(user.userID, currentTimestamp);
        if (expectedToken === token || generateToken(user.userID, currentTimestamp - 1) === token) {
          isUserValid = true;
          navigate("/home", { state: { userID: user.userID } });
        }
      });

      if (!isUserValid) {
        console.error("Invalid or expired QR code");
      }
    } catch (error) {
      console.error("Failed to verify user:", error);
    }
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 350, height: 350 } }, false);
    scanner.render(onScanSuccess, (errorMessage) => {
      console.error(`QR Code scan error: ${errorMessage}`);
    });

    return () => {
      scanner.clear().catch((error) => console.error("Failed to clear scanner", error));
    };
  }, []);

  const handleExit = () => {
    navigate("/"); 
  };

  return (
    <div className="qr-scanner-container">
      <header className="qr-scanner-header">
        <img src={ocbcimg} alt="OCBC Logo" className="ocbc-logo" />
        <div className="header-actions">
          <button className="language-button">中文</button>
          <button onClick={handleExit} className="exit-button">Exit</button>
        </div>
      </header>
      <div className="qr-text-center">
        <h1 className="qr-title">QR Code Login</h1>
        <p className="qr-subtext">Scan the QR code to continue</p>
      </div>
      <div id="qr-reader" className="qr-reader-box"></div>
    </div>
  );
}
