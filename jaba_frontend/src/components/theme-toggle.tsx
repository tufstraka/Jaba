/* FILE: components/theme-toggle.tsx
import React from 'react';
import { useTheme } from '@/components/theme-provider';
import { SunIcon, MoonIcon } from '@heroicons/react/outline'; // Assuming you have heroicons installed

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <MoonIcon className="w-6 h-6 text-gray-800" />
      ) : (
        <SunIcon className="w-6 h-6 text-yellow-500" />
      )}
    </button>
  );
};*/