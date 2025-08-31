/**
 * Unified Theme System Export
 * Mobile-first design system theme foundation
 */

// Core theme exports
export * from './tokens';
export * from './css-vars';
export * from './ThemeProvider';

// Tailwind configuration
export { default as sharedTailwindTheme } from './tailwind-theme';

// Theme utilities
export const THEME_VERSION = '2.0.0';
export const THEME_STORAGE_KEY = 'sabo-theme';

// Quick theme application function
export function applyThemeToDocument(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

// Mobile detection utility
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

// System theme detection utility
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// CSS variable names (for programmatic access)
export const CSS_VARS = {
  // Colors
  background: '--background',
  foreground: '--foreground',
  primary: '--primary',
  'primary-foreground': '--primary-foreground',
  secondary: '--secondary',
  'secondary-foreground': '--secondary-foreground',
  muted: '--muted',
  'muted-foreground': '--muted-foreground',
  accent: '--accent',
  'accent-foreground': '--accent-foreground',
  destructive: '--destructive',
  'destructive-foreground': '--destructive-foreground',
  border: '--border',
  input: '--input',
  ring: '--ring',
  card: '--card',
  'card-foreground': '--card-foreground',
  popover: '--popover',
  'popover-foreground': '--popover-foreground',
  
  // Mobile colors
  'mobile-nav': '--mobile-nav',
  'mobile-card': '--mobile-card',
  'mobile-accent': '--mobile-accent',
  
  // Spacing
  'mobile-nav-height': '--mobile-nav-height',
  'safe-area-top': '--safe-area-top',
  'safe-area-bottom': '--safe-area-bottom',
  'safe-area-left': '--safe-area-left',
  'safe-area-right': '--safe-area-right',
  'touch-target': '--touch-target',
  'mobile-padding': '--mobile-padding',
  'mobile-margin': '--mobile-margin',
  
  // Shadows
  'shadow-sm': '--shadow-sm',
  'shadow-base': '--shadow-base',
  'shadow-md': '--shadow-md',
  'shadow-lg': '--shadow-lg',
  'shadow-xl': '--shadow-xl',
  'shadow-mobile-card': '--shadow-mobile-card',
  'shadow-mobile-nav': '--shadow-mobile-nav',
  
  // Transitions
  'transition-theme-switch': '--transition-theme-switch',
  'transition-mobile-tap': '--transition-mobile-tap',
  'transition-mobile-swipe': '--transition-mobile-swipe',
  
  // Metadata
  'theme-mode': '--theme-mode',
  'design-system-version': '--design-system-version',
} as const;

// Helper to get CSS variable value
export function getCSSVar(variable: string): string {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

// Helper to set CSS variable value
export function setCSSVar(variable: string, value: string): void {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty(variable, value);
}

// Mobile-first breakpoints
export const BREAKPOINTS = {
  xs: '375px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Type exports for TypeScript users
export type {
  ThemeMode,
  ResolvedTheme,
  ThemeTokens,
  CSSVariablesOptions,
} from './tokens';

export type {
  ThemeContextType,
  ThemeProviderProps,
} from './ThemeProvider';
