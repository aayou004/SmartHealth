import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeContext } from "./ThemeContext.jsx";

import AuthPage from "./AuthPage";
import Dashboard from "./Dashboard";
import LogoutPage from "./LogoutPage";
import Calendar from "./Calendar";
import DateForm from "./DateForm";
import UserProfile from "./UserProfile";
import Settings from "./Settings";

function App() {
  const { theme, backgroundImage } = useContext(ThemeContext);

  const mainBgStyle = backgroundImage ? {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  } : {};

  const overlayClass = backgroundImage ? 'bg-gray-800/80' : '';

  return (
    <div
      className={`min-h-screen transition-colors duration-300`}
      style={mainBgStyle}
    >
      <div className={`relative z-10 ${overlayClass}`}>
        <Router>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendar/:date" element={<DateForm />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/logout" element={<LogoutPage />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
