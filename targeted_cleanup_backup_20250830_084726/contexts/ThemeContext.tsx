import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Theme types
export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

// Create Theme Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme Provider Props
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
}

// Theme Provider Component - DARK MODE LOCKED AS DEFAULT
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'dark' // LOCKED: Default to dark mode to preserve current styling
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // PROTECTION: Always start with dark mode to preserve current design
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('sabo-theme') as ThemeMode;
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        return savedTheme; // Allow both dark and light if previously saved
      }
      
      // DEFAULT: Force dark mode to preserve current styling as baseline
      return 'dark';
    }
    
    return 'dark'; // LOCKED: Always default to dark mode
  });

  // Update document class and localStorage when theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      
      // Remove existing theme classes
      root.classList.remove('light', 'dark');
      
      // Add current theme class
      root.classList.add(theme);
      
      // Save to localStorage
      localStorage.setItem('sabo-theme', theme);
      
      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#111827' : '#ffffff');
      }
    }
  }, [theme]);

  // Listen for system theme changes - DISABLED to protect dark mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        // PROTECTION: Disable auto-switching to preserve locked dark mode
        // Only auto-switch if no manual preference is saved AND we explicitly allow it
        const savedTheme = localStorage.getItem('sabo-theme');
        if (!savedTheme && theme !== 'dark') {
          // Only allow switching to dark, never away from dark
          if (e.matches) {
            setThemeState('dark');
          }
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]); // Added theme dependency

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

// Helper hook to get theme-aware styles
export const useThemedStyles = () => {
  const { theme } = useTheme();
  
  return {
    theme,
    getThemedValue: function<T>(lightValue: T, darkValue: T): T {
      return theme === 'dark' ? darkValue : lightValue;
    },
    isLight: theme === 'light',
    isDark: theme === 'dark',
  };
};

// Export theme context for advanced usage
export { ThemeContext };
