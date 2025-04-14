'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';

// Removing unused variable
// const storageKey = 'theme-preference';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Handle mounted state to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use useCallback to memoize the toggleTheme function
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Prevent hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Half-circle icon that works for both light and dark mode */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        className="w-5 h-5"
        strokeWidth="2"
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M12 8a2.83 2.83 0 0 0 4 4 4 4 0 1 1-4-4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.9 4.9 1.4 1.4" />
        <path d="m17.7 17.7 1.4 1.4" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.3 17.7-1.4 1.4" />
        <path d="m19.1 4.9-1.4 1.4" />
      </svg>
    </button>
  );
}
