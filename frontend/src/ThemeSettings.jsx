import React, { useContext, useRef } from 'react';
import { ThemeContext } from './ThemeContext.jsx';

const ThemeSettings = () => {
  const { theme, toggleTheme, setBackgroundImage } = useContext(ThemeContext);
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Create a URL for the selected file to use as a background
      const reader = new FileReader();
      reader.onloadend = () => {
        // Set the background image state to the data URL
        setBackgroundImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearBackground = () => {
    setBackgroundImage('');
    // Clear the file input for future uploads
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <div className={`p-4 rounded-lg shadow-md mb-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <h2 className="text-xl font-bold mb-4">Appearance Settings</h2>
      
      {/* Light/Dark Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold">Dark Mode</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>
      
      {/* Custom Background Upload */}
      <div className="flex flex-col">
        <label htmlFor="bg-upload" className="font-semibold mb-2">
          Custom Background Image
        </label>
        <input
          type="file"
          id="bg-upload"
          accept="image/*"
          ref={fileInputRef}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          onChange={handleImageUpload}
        />
        <button
          onClick={handleClearBackground}
          className="mt-2 py-2 px-4 bg-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-300 transition-colors"
        >
          Clear Background
        </button>
      </div>
    </div>
  );
};

export default ThemeSettings;