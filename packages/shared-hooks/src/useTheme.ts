/**
 * @sabo/shared-hooks
 * Theme management hook for SABO Arena
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useAsync';

export type Theme = 'light' | 'dark';

/**
 * Hook for managing theme state
 */
export function useTheme() {
  const [theme, setThemeStorage] = useLocalStorage<Theme>('sabo-theme', 'dark');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('dark');

  // Update actual theme based on theme setting
  useEffect(() => {
    setActualTheme(theme);
  }, [theme]);

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
