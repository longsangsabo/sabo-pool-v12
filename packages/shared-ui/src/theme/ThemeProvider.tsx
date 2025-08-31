/**
 * Unified Theme Provider
 * Mobile-first theme provider for the entire design system
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ThemeMode, ResolvedTheme, CSSVariablesOptions } from './tokens';

export interface ThemeContextType {
  // Current theme state
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  
  // Theme setters
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  
  // Theme utilities
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
  
  // Mobile detection
  isMobile: boolean;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme Provider Component
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'sabo-theme',
}: ThemeProviderProps) {
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  
  // System theme detection
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Current theme state
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    try {
      return (localStorage.getItem(storageKey) as ThemeMode) || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  // Resolved theme (what actually gets applied)
  const resolvedTheme: 'light' | 'dark' = theme === 'system' ? systemTheme : theme as 'light' | 'dark';

  // Mobile detection effect
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768 || 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // System theme change listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Theme persistence
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      // Ignore localStorage errors
    }
  }, [theme, storageKey]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    
    // Add mobile class for CSS targeting
    if (isMobile) {
      root.classList.add('mobile');
    } else {
      root.classList.remove('mobile');
    }
  }, [resolvedTheme, isMobile]);

  // Theme setters
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      // If system, toggle to opposite of current system theme
      setTheme(systemTheme === 'light' ? 'dark' : 'light');
    }
  }, [theme, systemTheme, setTheme]);

  // Context value
  const contextValue: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system',
    isMobile,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Theme hook
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme utilities
export const themeUtils = {
  /**
   * Get CSS custom properties for current theme
   */
  getCSSVariables: (theme: 'light' | 'dark', options: CSSVariablesOptions = {}) => {
    // This would be implemented based on your token system
    return {};
  },

  /**
   * Apply theme transitions
   */
  enableTransitions: () => {
    const css = document.createElement('style');
    css.appendChild(
      document.createTextNode(
        `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
      )
    );
    document.head.appendChild(css);

    return () => {
      // Force reflow
      (() => window.getComputedStyle(document.body))();
      
      // Wait for next tick before removing
      setTimeout(() => {
        document.head.removeChild(css);
      }, 1);
    };
  },

  /**
   * Check if system supports dark mode
   */
  supportsSystemTheme: () => {
    return typeof window !== 'undefined' && window.matchMedia;
  },
};

export default ThemeProvider;
