import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import ocbcimg from "./images/OCBC-Logo.png";
import faceIO from "@faceio/fiojs";

const FaceIDLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const faceioInstance = useRef<any>(null);

  useEffect(() => {
    if (!faceioInstance.current) {
      console.log("Initializing FaceIO...");
      try {
        faceioInstance.current = new faceIO(import.meta.env.VITE_FACEIO_API_KEY);
      } catch (error) {
        console.error("Failed to initialize FaceIO:", error);
        setMessage("Error initializing FaceIO. Please refresh.");
      }
    }
  }, []);

  const handleFaceLogin = async () => {
    setLoading(true);
    setMessage(null);
  
    if (!faceioInstance.current) {
      console.error("FaceIO instance is undefined.");
      setMessage("FaceIO is not initialized. Please refresh and try again.");
      setLoading(false);
      return;
    }
  
    try {
      console.log("Authenticating with FaceIO...");
      const response = await faceioInstance.current.authenticate({ locale: "auto" });
  
      console.log("FaceIO authentication response:", response);
  
      // ✅ Query Firestore to find the user with this `faceID`
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("faceID", "==", response.facialId));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        setMessage("Face ID not found. Please register first.");
        console.error("No matching user found for faceID:", response.facialId);
        return;
      }
  
      // ✅ Extract user data
      const userData = querySnapshot.docs[0].data();
      console.log("User Found:", userData);
  
      navigate("/home", { state: { userID: userData.userID } });
    } catch (error: any) {
      console.error("FaceIO Error:", error);
  
      if (error.code === 10) {
        setMessage("Invalid FaceIO Public ID. Please check your API key.");
      } else {
        setMessage("Face ID authentication failed. Try again.");
      }
  
      // ✅ Restart FaceIO session safely
      try {
        if (faceioInstance.current) {
          console.log("Restarting FaceIO session...");
          faceioInstance.current.restartSession();
        } else {
          console.warn("FaceIO instance is null, cannot restart session.");
        }
      } catch (restartError) {
        console.error("Failed to restart FaceIO session:", restartError);
      }
    }
  
    setLoading(false);
  };

  const handleExit = () => {
    navigate("/");
  };

  return (
    <div className="faceid-login-container">
  {/* Header Section */}
  <header className="faceid-login-header">
    <img src={ocbcimg} alt="OCBC Logo" className="ocbc-logo" />
    <button onClick={handleExit} className="exit-button">Exit</button>
  </header>

  {/* Main Content */}
  <div className="faceid-main">
    <h1 className="faceid-title">Face ID Login</h1>
    <p className="faceid-subtext">Click below to start face scanning.</p>

    <button onClick={handleFaceLogin} className="start-scan-button">
      Start Face Scan
    </button>
  </div>

  {/* Floating Action Button (if needed) */}
  <div className="floating-action-button">
    <span>🔄</span>
  </div>
</div>

  );
};

export default FaceIDLogin;
