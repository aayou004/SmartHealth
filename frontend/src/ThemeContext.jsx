import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [backgroundImage, setBackgroundImage] = useState(
    localStorage.getItem('backgroundImage') || ''
  );

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

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

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = {
    theme,
    toggleTheme,
    backgroundImage,
    setBackgroundImage,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
