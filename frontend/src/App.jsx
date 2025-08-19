import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ThemeContext } from "./ThemeContext.jsx";
import { AnimatePresence, motion } from 'framer-motion';

import AuthPage from "./AuthPage";
import Dashboard from "./Dashboard";
import LogoutPage from "./LogoutPage";
import Calendar from "./Calendar";
import DateForm from "./DateForm";
import UserProfile from "./UserProfile";
import Settings from "./Settings";
import Assistant from "./Assistant";

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageWrapper><AuthPage /></PageWrapper>} />
                <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
                <Route path="/calendar/:date" element={<PageWrapper><DateForm /></PageWrapper>} />
                <Route path="/calendar" element={<PageWrapper><Calendar /></PageWrapper>} />
                <Route path="/profile" element={<PageWrapper><UserProfile /></PageWrapper>} />
                <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
                <Route path="/assistant" element={<PageWrapper><Assistant /></PageWrapper>} />
                <Route path="/logout" element={<PageWrapper><LogoutPage /></PageWrapper>} />
            </Routes>
        </AnimatePresence>
    );
}

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
          <AnimatedRoutes />
        </Router>
      </div>
    </div>
  );
}

export default App;
