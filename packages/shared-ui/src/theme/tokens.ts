/**
 * Design System Theme Tokens
 * Mobile-first, comprehensive theme foundation
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ResolvedTheme {
  mode: ThemeMode;
  name: string;
  variables: Record<string, string>;
}

export interface CSSVariablesOptions {
  includeMediaQueries?: boolean;
  includeSystemPreferences?: boolean;
}

export interface ThemeTokens {
  colors: {
    // Semantic base colors
    background: { light: string; dark: string };
    foreground: { light: string; dark: string };
    card: { light: string; dark: string };
    'card-foreground': { light: string; dark: string };
    popover: { light: string; dark: string };
    'popover-foreground': { light: string; dark: string };
    
    // Brand colors
    primary: { light: string; dark: string };
    'primary-foreground': { light: string; dark: string };
    secondary: { light: string; dark: string };
    'secondary-foreground': { light: string; dark: string };
    
    // UI states
    muted: { light: string; dark: string };
    'muted-foreground': { light: string; dark: string };
    accent: { light: string; dark: string };
    'accent-foreground': { light: string; dark: string };
    destructive: { light: string; dark: string };
    'destructive-foreground': { light: string; dark: string };
    
    // Borders & inputs
    border: { light: string; dark: string };
    input: { light: string; dark: string };
    ring: { light: string; dark: string };
    
    // Mobile-specific colors
    'mobile-nav': { light: string; dark: string };
    'mobile-card': { light: string; dark: string };
    'mobile-accent': { light: string; dark: string };
  };
  
  spacing: {
    // Mobile-safe areas
    'mobile-nav-height': string;
    'safe-area-top': string;
    'safe-area-bottom': string;
    'safe-area-left': string;
    'safe-area-right': string;
    
    // Touch-friendly spacing
    'touch-target': string;
    'mobile-padding': string;
    'mobile-margin': string;
  };
  
  shadows: {
    // Light & dark mode shadows
    sm: { light: string; dark: string };
    base: { light: string; dark: string };
    md: { light: string; dark: string };
    lg: { light: string; dark: string };
    xl: { light: string; dark: string };
    
    // Mobile-optimized shadows
    'mobile-card': { light: string; dark: string };
    'mobile-nav': { light: string; dark: string };
  };
  
  transitions: {
    // Theme switching
    'theme-switch': string;
    // Mobile interactions
    'mobile-tap': string;
    'mobile-swipe': string;
  };
}

// Design System Theme Tokens - Production Ready
export const themeTokens: ThemeTokens = {
  colors: {
    // === BASE SEMANTIC COLORS ===
    background: {
      light: '0 0% 100%',        // Pure white
      dark: '222 47% 11%'        // Deep dark blue-gray
    },
    foreground: {
      light: '222 47% 11%',      // Dark text on light
      dark: '213 31% 91%'        // Light text on dark
    },
    
    // === CARD COLORS ===
    card: {
      light: '0 0% 100%',        // White cards
      dark: '224 71% 4%'         // Darker cards for contrast
    },
    'card-foreground': {
      light: '222 47% 11%',      // Dark text on light cards
      dark: '213 31% 91%'        // Light text on dark cards
    },
    
    // === POPOVER COLORS ===
    popover: {
      light: '0 0% 100%',
      dark: '224 71% 4%'
    },
    'popover-foreground': {
      light: '222 47% 11%',
      dark: '213 31% 91%'
    },
    
    // === BRAND COLORS ===
    primary: {
      light: '221 83% 53%',      // Vibrant blue for light mode
      dark: '217 91% 60%'        // Lighter blue for dark mode visibility
    },
    'primary-foreground': {
      light: '0 0% 100%',        // White text on blue
      dark: '222 47% 11%'        // Dark text on light blue
    },
    
    // === SECONDARY COLORS ===
    secondary: {
      light: '210 40% 98%',      // Very light blue-gray
      dark: '222 47% 11%'        // Dark blue-gray
    },
    'secondary-foreground': {
      light: '222 47% 11%',
      dark: '213 31% 91%'
    },
    
    // === MUTED COLORS ===
    muted: {
      light: '210 40% 98%',      // Subtle background
      dark: '223 47% 11%'        // Muted dark background
    },
    'muted-foreground': {
      light: '215 16% 47%',      // Gray text
      dark: '215 20% 65%'        // Lighter gray for dark mode
    },
    
    // === ACCENT COLORS ===
    accent: {
      light: '210 40% 98%',      // Light accent
      dark: '216 34% 17%'        // Dark accent
    },
    'accent-foreground': {
      light: '222 47% 11%',
      dark: '213 31% 91%'
    },
    
    // === DESTRUCTIVE COLORS ===
    destructive: {
      light: '0 100% 50%',       // Pure red
      dark: '0 63% 31%'          // Darker red for dark mode
    },
    'destructive-foreground': {
      light: '0 0% 100%',        // White text on red
      dark: '0 0% 100%'          // White text on dark red
    },
    
    // === BORDERS & INPUTS ===
    border: {
      light: '214 32% 91%',      // Light gray border
      dark: '216 34% 17%'        // Dark border
    },
    input: {
      light: '214 32% 91%',      // Input border same as border
      dark: '216 34% 17%'
    },
    ring: {
      light: '221 83% 53%',      // Focus ring matches primary
      dark: '217 91% 60%'
    },
    
    // === MOBILE-SPECIFIC COLORS ===
    'mobile-nav': {
      light: '0 0% 100%',        // White mobile nav
      dark: '222 47% 11%'        // Dark mobile nav
    },
    'mobile-card': {
      light: '210 40% 98%',      // Subtle mobile card background
      dark: '224 71% 4%'         // Dark mobile card
    },
    'mobile-accent': {
      light: '221 83% 53%',      // Mobile accent color
      dark: '217 91% 60%'
    }
  },
  
  spacing: {
    // === MOBILE SAFE AREAS ===
    'mobile-nav-height': '64px',
    'safe-area-top': 'env(safe-area-inset-top)',
    'safe-area-bottom': 'env(safe-area-inset-bottom)',
    'safe-area-left': 'env(safe-area-inset-left)',
    'safe-area-right': 'env(safe-area-inset-right)',
    
    // === TOUCH-FRIENDLY SPACING ===
    'touch-target': '44px',     // iOS/Android recommendation
    'mobile-padding': '16px',   // Standard mobile padding
    'mobile-margin': '12px'     // Standard mobile margin
  },
  
  shadows: {
    // === LIGHT MODE SHADOWS ===
    sm: {
      light: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      dark: '0 1px 2px 0 rgb(0 0 0 / 0.8)'
    },
    base: {
      light: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      dark: '0 1px 3px 0 rgb(0 0 0 / 0.8), 0 1px 2px -1px rgb(0 0 0 / 0.8)'
    },
    md: {
      light: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      dark: '0 4px 6px -1px rgb(0 0 0 / 0.8), 0 2px 4px -2px rgb(0 0 0 / 0.8)'
    },
    lg: {
      light: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      dark: '0 10px 15px -3px rgb(0 0 0 / 0.8), 0 4px 6px -4px rgb(0 0 0 / 0.8)'
    },
    xl: {
      light: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      dark: '0 20px 25px -5px rgb(0 0 0 / 0.8), 0 8px 10px -6px rgb(0 0 0 / 0.8)'
    },
    
    // === MOBILE-OPTIMIZED SHADOWS ===
    'mobile-card': {
      light: '0 2px 8px 0 rgb(0 0 0 / 0.1)',
      dark: '0 2px 8px 0 rgb(0 0 0 / 0.8)'
    },
    'mobile-nav': {
      light: '0 -2px 8px 0 rgb(0 0 0 / 0.1)',
      dark: '0 -2px 8px 0 rgb(0 0 0 / 0.8)'
    }
  },
  
  transitions: {
    // === THEME TRANSITIONS ===
    'theme-switch': 'all 200ms ease-in-out',
    
    // === MOBILE INTERACTIONS ===
    'mobile-tap': 'all 150ms ease-out',
    'mobile-swipe': 'transform 300ms ease-out'
  }
};

// Export individual color palettes for convenience
export const lightColors = Object.fromEntries(
  Object.entries(themeTokens.colors).map(([key, value]) => [key, value.light])
);

export const darkColors = Object.fromEntries(
  Object.entries(themeTokens.colors).map(([key, value]) => [key, value.dark])
);
