import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, type ColorScheme } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { useSettingsStore } from '@store/settings-store';

export interface Theme {
  colors: typeof lightColors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  isDark: boolean;
}

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  toggleTheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme() as ColorScheme;
  
  const { 
    colorScheme: savedColorScheme, 
    useSystemTheme,
    setColorScheme: saveColorScheme,
    setUseSystemTheme 
  } = useSettingsStore();

  const activeColorScheme: ColorScheme = useSystemTheme 
    ? (systemColorScheme || 'light')
    : savedColorScheme;

  const theme: Theme = {
    colors: activeColorScheme === 'dark' ? darkColors : lightColors,
    typography,
    spacing,
    borderRadius,
    isDark: activeColorScheme === 'dark',
  };

  const toggleTheme = () => {
    const newScheme: ColorScheme = activeColorScheme === 'light' ? 'dark' : 'light';
    setUseSystemTheme(false); 
    saveColorScheme(newScheme);
  };

  const setColorScheme = (scheme: ColorScheme) => {
    setUseSystemTheme(false);
    saveColorScheme(scheme);
  };

  useEffect(() => {
    if (useSystemTheme && systemColorScheme) {
      saveColorScheme(systemColorScheme);
    }
  }, [systemColorScheme, useSystemTheme]);

  const value: ThemeContextType = {
    theme,
    colorScheme: activeColorScheme,
    toggleTheme,
    setColorScheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};