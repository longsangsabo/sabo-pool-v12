/**
 * SABO ARENA THEME CONSTANTS
 * 
 * DARK MODE IS LOCKED AND PROTECTED
 * These are the exact classes used in our current dark mode design
 * DO NOT MODIFY these dark mode classes - they are production-ready
 */

// LOCKED DARK MODE CLASSES - DO NOT CHANGE
export const DARK_MODE_CLASSES = {
  // Backgrounds (current working design)
  background: 'bg-slate-900',
  backgroundBlur: 'bg-slate-900/30 backdrop-blur-sm',
  backgroundCard: 'bg-slate-800/60',
  backgroundCardSecondary: 'bg-slate-800/40',
  backgroundOverlay: 'bg-slate-900/80',
  
  // Text colors (optimized for readability)
  textPrimary: 'text-slate-100',
  textSecondary: 'text-slate-300',
  textMuted: 'text-slate-400',
  textAccent: 'text-blue-400',
  
  // Borders and dividers
  border: 'border-slate-700',
  borderCard: 'border-slate-600',
  
  // Interactive elements
  buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
  buttonSecondary: 'bg-slate-700/50 hover:bg-slate-700 text-slate-200',
  
  // Status colors
  statusOnline: 'bg-green-500',
  statusOffline: 'bg-gray-500',
  statusLive: 'bg-red-500',
  
  // Badges and tags
  badge: 'bg-slate-700/50 text-slate-200',
  badgeAccent: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
  
  // Navigation
  navBackground: 'bg-slate-900/95 backdrop-blur border-slate-800',
  navActive: 'text-blue-400 bg-blue-500/10',
  navInactive: 'text-slate-400 hover:text-slate-300',
  
  // Feed components
  feedBackground: 'bg-slate-800/60',
  feedStats: 'bg-slate-700/40 text-slate-300',
  feedInteraction: 'text-slate-400 hover:text-slate-300'
} as const;

// LIGHT MODE CLASSES - NO GRAY BACKGROUNDS, ONLY WHITE/TRANSPARENT
export const LIGHT_MODE_CLASSES = {
  // Backgrounds (pure white or transparent only)
  background: 'bg-white',
  backgroundBlur: 'bg-white/70 backdrop-blur-sm', // Transparent white
  backgroundCard: 'bg-white/70', // Transparent white for feed cards
  backgroundCardSecondary: 'bg-white/50', // More transparent white for story section
  backgroundOverlay: 'bg-black/5', // Very subtle overlay
  
  // Text colors (high contrast for light background)
  textPrimary: 'text-slate-900', // Changed from gray to slate
  textSecondary: 'text-slate-700', // Changed from gray to slate
  textMuted: 'text-slate-600', // Changed from gray to slate
  textAccent: 'text-blue-600',
  
  // Borders and dividers (white/transparent only)
  border: 'border-white/30', // Transparent white border
  borderCard: 'border-white/20', // More transparent white border
  
  // Interactive elements (no gray backgrounds)
  buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
  buttonSecondary: 'bg-white/90 hover:bg-white text-slate-800 border border-white/40',
  
  // Status colors
  statusOnline: 'bg-green-500',
  statusOffline: 'bg-slate-400', // Changed from gray to slate
  statusLive: 'bg-red-500',
  
  // Badges and tags (white/transparent only)
  badge: 'bg-white/70 text-slate-800 border border-white/40',
  badgeAccent: 'bg-blue-50/80 text-blue-700 border border-blue-200/60',
  
  // Navigation (white/transparent only)
  navBackground: 'bg-white/95 backdrop-blur border-white/40',
  navActive: 'text-blue-600 bg-blue-50/90',
  navInactive: 'text-slate-600 hover:text-slate-800',
  
  // Feed components (PURE WHITE/TRANSPARENT - NO GRAY)
  feedBackground: 'bg-white/60 backdrop-blur-sm', // Pure transparent white
  feedStats: 'bg-white/50 text-slate-700', // Pure transparent white
  feedInteraction: 'text-slate-500 hover:text-slate-700'
} as const;

// Theme selector utility
export const getThemeClasses = (isDark: boolean) => {
  return isDark ? DARK_MODE_CLASSES : LIGHT_MODE_CLASSES;
};

// Protected dark mode utility - ensures dark mode classes are never overridden
export const getProtectedDarkClasses = () => {
  return DARK_MODE_CLASSES;
};

// Component-specific theme classes
export const COMPONENT_THEMES = {
  dashboard: {
    dark: `${DARK_MODE_CLASSES.backgroundBlur} min-h-screen`,
    light: `${LIGHT_MODE_CLASSES.backgroundBlur} min-h-screen` // Transparent light dashboard
  },
  
  storySection: {
    dark: `${DARK_MODE_CLASSES.backgroundCardSecondary} rounded-lg p-4`,
    light: `${LIGHT_MODE_CLASSES.backgroundCardSecondary} backdrop-blur-sm rounded-lg p-4 border ${LIGHT_MODE_CLASSES.borderCard}` // Transparent story section
  },
  
  feedCard: {
    dark: `${DARK_MODE_CLASSES.feedBackground} ${DARK_MODE_CLASSES.border} rounded-lg p-4`,
    light: `${LIGHT_MODE_CLASSES.feedBackground} ${LIGHT_MODE_CLASSES.border} rounded-lg p-4 shadow-sm` // Transparent feed cards
  },
  
  navigation: {
    dark: `${DARK_MODE_CLASSES.navBackground} fixed bottom-0 left-0 right-0 z-50`,
    light: `${LIGHT_MODE_CLASSES.navBackground} fixed bottom-0 left-0 right-0 z-50 shadow-lg` // Transparent navigation
  }
} as const;

export type ThemeClassKey = keyof typeof DARK_MODE_CLASSES;
