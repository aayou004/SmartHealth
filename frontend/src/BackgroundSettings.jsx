// src/BackgroundSettings.jsx
import React, { useContext, useRef, useEffect } from 'react';
import { ThemeContext } from './ThemeContext.jsx';

const BackgroundSettings = () => {
  const { theme, setBackgroundImage, backgroundImage } = useContext(ThemeContext);
  const fileInputRef = useRef(null);
  
  // This useEffect will log the state every time the background image changes
  useEffect(() => {
    console.log("Background image URL from context:", backgroundImage);
  }, [backgroundImage]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setBackgroundImage(reader.result);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleClearBackground = () => {
    setBackgroundImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <div className={`p-4 rounded-lg shadow-md mb-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <h2 className="text-xl font-bold mb-4">Custom Background</h2>
      
      {/* Conditional UI based on whether a background image is set */}
      {backgroundImage ? (
        <div className="flex flex-col items-center gap-4">
          <p className="font-semibold text-green-500">
            ✅ Custom background is set!
          </p>
          <div className="w-full h-32 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
            <img src={backgroundImage} alt="Current background" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col gap-2 w-full mt-2">
             <label htmlFor="bg-upload" className="font-semibold">
                Change background image
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
                className="mt-2 py-2 px-4 bg-red-200 text-red-700 rounded-full font-semibold hover:bg-red-300 transition-colors"
            >
                Clear Background
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <label htmlFor="bg-upload" className="font-semibold mb-2">
            Upload a new background image
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
        </div>
      )}
    </div>
  );
};

export default BackgroundSettings;