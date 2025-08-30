import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses, getProtectedDarkClasses, COMPONENT_THEMES, type ThemeClassKey } from '../constants/theme';

/**
 * Protected Theme Hook
 * 
 * This hook ensures that:
 * 1. Dark mode classes are never accidentally overridden
 * 2. Current dark mode design is preserved
 * 3. Light mode can be safely added without affecting dark mode
 */
export const useProtectedTheme = () => {
  const { theme, toggleTheme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  
  // Get theme classes with protection for dark mode
  const getClasses = (classKey: ThemeClassKey) => {
    if (isDark) {
      // Always return protected dark mode classes
      return getProtectedDarkClasses()[classKey];
    }
    // Safe to return light mode classes
    return getThemeClasses(false)[classKey];
  };
  
  // Get component theme classes
  const getComponentClasses = (component: keyof typeof COMPONENT_THEMES) => {
    return COMPONENT_THEMES[component][isDark ? 'dark' : 'light'];
  };
  
  // Protected theme toggle - warns when switching away from dark
  const safeToggleTheme = () => {
    if (isDark) {
      console.warn('🛡️ SABO ARENA: Switching away from protected dark mode');
    }
    toggleTheme();
  };
  
  // Theme-aware className builder
  const buildClassNames = (...classKeys: ThemeClassKey[]) => {
    return classKeys.map(key => getClasses(key)).join(' ');
  };
  
  // Conditional classes based on theme
  const conditionalClasses = (darkClass: string, lightClass: string) => {
    return isDark ? darkClass : lightClass;
  };
  
  return {
    // Theme state
    theme,
    isDark,
    isLight: !isDark,
    
    // Theme actions
    setTheme,
    toggleTheme: safeToggleTheme,
    
    // Class utilities
    getClasses,
    getComponentClasses,
    buildClassNames,
    conditionalClasses,
    
    // Quick access to common classes
    bg: getClasses('background'),
    bgCard: getClasses('backgroundCard'),
    bgBlur: getClasses('backgroundBlur'),
    text: getClasses('textPrimary'),
    textSecondary: getClasses('textSecondary'),
    textMuted: getClasses('textMuted'),
    border: getClasses('border'),
    
    // Protected dark mode flag
    isProtectedDarkMode: isDark
  };
};

// Utility for components that need theme-aware styling
export const useComponentTheme = (componentName: keyof typeof COMPONENT_THEMES) => {
  const { getComponentClasses, isDark } = useProtectedTheme();
  
  return {
    className: getComponentClasses(componentName),
    isDark,
    themeClass: isDark ? 'dark' : 'light'
  };
};

// HOC for theme-protected components
export const withProtectedTheme = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  const WrappedComponent = (props: P) => {
    const themeProps = useProtectedTheme();
    return React.createElement(Component, { ...props, themeProps } as P & { themeProps: any });
  };
  
  WrappedComponent.displayName = `withProtectedTheme(${Component.displayName || Component.name})`;
  return WrappedComponent;
};
