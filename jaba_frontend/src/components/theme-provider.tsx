'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute: string;
  defaultTheme: string;
  enableSystem: boolean;
}

interface ThemeContextProps {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, attribute, defaultTheme, enableSystem }) => {
  const [theme, setTheme] = useState<string>(defaultTheme);

  useEffect(() => {
    if (enableSystem) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
    }
  }, [enableSystem]);

  useEffect(() => {
    document.documentElement.setAttribute(attribute, theme);
  }, [theme, attribute]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};