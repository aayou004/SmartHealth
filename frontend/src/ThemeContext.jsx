import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [backgroundImage, setBackgroundImage] = useState(
    localStorage.getItem('backgroundImage') || ''
  );
  const [isSidebarOpen, setSidebarOpen] = useState(JSON.parse(localStorage.getItem('sidebarOpen')) !== false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    localStorage.setItem('sidebarOpen', isSidebarOpen);
  }, [isSidebarOpen]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.user_id) {
      fetch(`http://localhost:5000/api/profile/${user.user_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.background_image) {
            setBackgroundImage(`http://localhost:5000/${data.background_image}`);
          } else {
            setBackgroundImage('');
          }
        })
        .catch(err => console.error("Failed to fetch background", err));
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const value = {
    theme: 'dark',
    setTheme: () => {},
    backgroundImage,
    setBackgroundImage,
    isSidebarOpen,
    toggleSidebar,
    statusMessage,
    setStatusMessage,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
