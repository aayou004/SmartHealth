// src/ThemeContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(localStorage.getItem('mode') || 'light');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [backgroundImage, setBackgroundImage] = useState(
    localStorage.getItem('backgroundImage') || ''
  );

  useEffect(() => {
    // Apply the theme class to the document based on the current theme state
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save both the mode and theme to local storage
    localStorage.setItem('mode', mode);
    localStorage.setItem('theme', theme);
  }, [mode, theme]);

  useEffect(() => {
    localStorage.setItem('backgroundImage', backgroundImage);
  }, [backgroundImage]);

  const value = {
    mode,
    setMode,
    theme,
    setTheme,
    backgroundImage,
    setBackgroundImage,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};