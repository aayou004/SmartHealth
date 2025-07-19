// src/LogoutPage.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear session
    localStorage.removeItem("user");
    navigate("/"); // Go back to login
  }, [navigate]);

  return null; // no UI needed
};

export default LogoutPage;
