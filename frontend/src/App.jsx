// src/App.jsx
import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeContext } from "./ThemeContext.jsx";

import AuthPage from "./AuthPage";
import Dashboard from "./Dashboard";
import LogoutPage from "./LogoutPage";
import Calendar from "./Calendar";
import DateForm from "./DateForm";
import UserProfile from "./UserProfile";

function App() {
  const { mode, theme, backgroundImage } = useContext(ThemeContext);

  const isCustomMode = mode === 'custom';
  
  // Conditionally apply the background image style
  const mainBgStyle = isCustomMode && backgroundImage ? {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  } : {};

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isCustomMode ? 'bg-transparent' : (theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100')}`}
      style={mainBgStyle}
    >
      {/* Semi-transparent overlay only for custom mode */}
      {isCustomMode && (
        <div className={`absolute inset-0 z-0 bg-gray-800/80`}></div>
      )}
      
      <div className="relative z-10">
        <Router>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendar/:date" element={<DateForm />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/logout" element={<LogoutPage />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;