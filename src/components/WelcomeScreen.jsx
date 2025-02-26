import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Welcome.css"; // Import the new CSS file

function WelcomeScreen() {
  const [showLoader, setShowLoader] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
      navigate("/home"); // Auto-redirect after 3 seconds
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="welcome-container">
      {showLoader && (
        <div className="loader-container">
          <div className="loader"></div>
          <p className="loading-text"> Welcome to Jupiter Payment Gateway </p>
        </div>
      )}
    </div>
  );
}

export default WelcomeScreen;
