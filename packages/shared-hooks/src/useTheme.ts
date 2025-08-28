/**
 * @sabo/shared-hooks
 * Theme management hook for SABO Arena
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useAsync';

export type Theme = 'light' | 'dark' | 'system';

/**
 * Hook for managing theme state
 */
export function useTheme() {
  const [theme, setThemeStorage] = useLocalStorage<Theme>('sabo-theme', 'system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('dark');

  // Function to get system theme
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  }, []);

  // Update actual theme based on theme setting
  useEffect(() => {
    if (theme === 'system') {
      setActualTheme(getSystemTheme());
    } else {
      setActualTheme(theme);
    }
  }, [theme, getSystemTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => setActualTheme(getSystemTheme());
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, getSystemTheme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(actualTheme);
  }, [actualTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeStorage(newTheme);
  }, [setThemeStorage]);

  return { 
    theme, 
    setTheme, 
    actualTheme,
    isLight: actualTheme === 'light',
    isDark: actualTheme === 'dark',
    toggleTheme: () => setTheme(actualTheme === 'light' ? 'dark' : 'light')
  };
}
