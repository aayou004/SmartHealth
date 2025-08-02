// src/ThemeContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { argbFromHex, hexFromArgb, CorePalette, Scheme } from '@material/material-color-utilities';
import { FastAverageColor } from 'fast-average-color';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(localStorage.getItem('mode') || 'light');
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
    localStorage.setItem('mode', mode);
    localStorage.setItem('theme', theme);
  }, [mode, theme]);

  useEffect(() => {
    console.log("Background image URL changed:", backgroundImage);
    localStorage.setItem('backgroundImage', backgroundImage);
  }, [backgroundImage]);

  useEffect(() => {
    if (mode === 'custom' && backgroundImage) {
      const fac = new FastAverageColor();
      fac.getColorAsync(backgroundImage)
        .then(color => {
          const seedColor = argbFromHex(color.hex);
          
          const isDark = theme === 'dark';
          const scheme = isDark ? Scheme.dark(seedColor) : Scheme.light(seedColor);

          const palette = {
            primary: hexFromArgb(scheme.primary),
            onPrimary: hexFromArgb(scheme.onPrimary),
            background: hexFromArgb(scheme.background),
            onBackground: hexFromArgb(scheme.onBackground),
            outline: hexFromArgb(scheme.outline),
            surfaceContainerLow: hexFromArgb(scheme.surfaceContainerLow),
            surfaceContainer: hexFromArgb(scheme.surfaceContainer),
          };
          
          const root = document.documentElement;
          root.style.setProperty('--theme-primary', palette.primary);
          root.style.setProperty('--theme-primary-text', palette.onPrimary);
          root.style.setProperty('--theme-card-bg', palette.surfaceContainerLow);
          root.style.setProperty('--theme-text', palette.onBackground);
          root.style.setProperty('--theme-outline', palette.outline);
          root.style.setProperty('--theme-bg', palette.background);
          
          // FIX: Corrected syntax and adjusted alpha to 0.8 for more opacity
          const greyTint = isDark ? 50 : 200;
          const tintedColor = {
            r: Math.min(255, color.r + (isDark ? 0 : greyTint)),
            g: Math.min(255, color.g + (isDark ? 0 : greyTint)),
            b: Math.min(255, color.b + (isDark ? 0 : greyTint))
          };
          root.style.setProperty('--theme-card-bg-alpha', `rgba(${tintedColor.r}, ${tintedColor.g}, ${tintedColor.b}, 0.8)`);

          root.style.setProperty('--md-sys-color-primary', palette.primary);
          root.style.setProperty('--md-sys-color-on-primary', palette.onPrimary);
          root.style.setProperty('--md-sys-color-surface', palette.surfaceContainerLow);
          root.style.setProperty('--md-sys-color-on-surface', palette.onBackground);
          root.style.setProperty('--md-sys-color-outline', palette.outline);
          root.style.setProperty('--md-sys-color-surface-container-low', palette.surfaceContainerLow);
          root.style.removeProperty('--md-sys-color-surface-container');
        })
        .catch(e => {
          console.error('Monet color extraction failed:', e);
          const root = document.documentElement;
          root.style.removeProperty('--theme-primary');
          root.style.removeProperty('--theme-primary-text');
          root.style.removeProperty('--theme-card-bg');
          root.style.removeProperty('--theme-text');
          root.style.removeProperty('--theme-outline');
          root.style.removeProperty('--theme-bg');
          root.style.removeProperty('--theme-card-bg-alpha');
          
          root.style.removeProperty('--md-sys-color-primary');
          root.style.removeProperty('--md-sys-color-on-primary');
          root.style.removeProperty('--md-sys-color-surface');
          root.style.removeProperty('--md-sys-color-on-surface');
          root.style.removeProperty('--md-sys-color-outline');
          root.style.removeProperty('--md-sys-color-surface-container-low');
          root.style.removeProperty('--md-sys-color-surface-container');
        });
    } else if (mode !== 'custom') {
      const root = document.documentElement;
      root.style.removeProperty('--theme-primary');
      root.style.removeProperty('--theme-primary-text');
      root.style.removeProperty('--theme-card-bg');
      root.style.removeProperty('--theme-text');
      root.style.removeProperty('--theme-outline');
      root.style.removeProperty('--theme-bg');
      root.style.removeProperty('--theme-card-bg-alpha');
      
      root.style.removeProperty('--md-sys-color-primary');
      root.style.removeProperty('--md-sys-color-on-primary');
      root.style.removeProperty('--md-sys-color-surface');
      root.style.removeProperty('--md-sys-color-on-surface');
      root.style.removeProperty('--md-sys-color-outline');
      root.style.removeProperty('--md-sys-color-surface-container-low');
      root.style.removeProperty('--md-sys-color-surface-container');
    }
  }, [mode, backgroundImage, theme]);

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