import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
};

const initialState: ThemeProviderState = {
  theme: 'dark',
  setTheme: () => null,
  isDark: true,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'sabo-ui-theme',
  ...props
}: ThemeProviderProps) {
  // Migration logic: Force dark mode for all users initially
  const migrateToDefaultDark = () => {
    const currentTheme = localStorage.getItem(storageKey) as Theme;
    const migrationKey = `${storageKey}-migrated-to-dark`;
    const hasMigrated = localStorage.getItem(migrationKey);

    // If hasn't migrated yet, set to dark and mark as migrated
    if (!hasMigrated) {
      localStorage.setItem(storageKey, 'dark');
      localStorage.setItem(migrationKey, 'true');
      return 'dark';
    }

    return currentTheme || defaultTheme;
  };

  const [theme, setTheme] = useState<Theme>(migrateToDefaultDark);

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      setIsDark(systemTheme === 'dark');
      return;
    }

    root.classList.add(theme);
    setIsDark(theme === 'dark');
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    isDark,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
