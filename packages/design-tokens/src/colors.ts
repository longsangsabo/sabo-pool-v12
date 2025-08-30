/**
 * Sabo Pool Design System - Color Tokens
 * Chuẩn hóa color palette từ audit findings
 */

// Primary Brand Colors - Sabo Pool Blue
export const primary = {
  50: '#eff6ff',
  100: '#dbeafe', 
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',  // Main brand blue
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554'
} as const;

// Status Colors - Standardized from audit findings
export const success = {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0', 
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',  // Success green
  600: '#16a34a',
  700: '#15803d',
  800: '#166534',
  900: '#14532d',
  950: '#052e16'
} as const;

export const warning = {
  50: '#fffbeb',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d', 
  400: '#fbbf24',
  500: '#f59e0b',  // Warning yellow
  600: '#d97706',
  700: '#b45309',
  800: '#92400e',
  900: '#78350f',
  950: '#451a03'
} as const;

export const error = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444',  // Error red
  600: '#dc2626',
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
  950: '#450a0a'
} as const;

export const info = {
  50: '#f0f9ff',
  100: '#e0f2fe',
  200: '#bae6fd',
  300: '#7dd3fc',
  400: '#38bdf8',
  500: '#0ea5e9',  // Info blue
  600: '#0284c7',
  700: '#0369a1',
  800: '#075985',
  900: '#0c4a6e',
  950: '#082f49'
} as const;

// Neutral Colors - Consistent grays
export const neutral = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',  // Main gray
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617'
} as const;

// Semantic Color Mappings
export const semantic = {
  // Background colors
  background: {
    primary: neutral[50],
    secondary: neutral[100],
    tertiary: neutral[200],
    inverse: neutral[900]
  },
  
  // Text colors  
  text: {
    primary: neutral[900],
    secondary: neutral[600],
    tertiary: neutral[500],
    inverse: neutral[50],
    muted: neutral[400]
  },
  
  // Border colors
  border: {
    default: neutral[200],
    muted: neutral[100],
    strong: neutral[300]
  },
  
  // Status mappings based on audit findings
  status: {
    success: {
      bg: success[50],
      border: success[200], 
      text: success[800],
      emphasis: success[500]
    },
    warning: {
      bg: warning[50],
      border: warning[200],
      text: warning[800], 
      emphasis: warning[500]
    },
    error: {
      bg: error[50],
      border: error[200],
      text: error[800],
      emphasis: error[500]
    },
    info: {
      bg: info[50],
      border: info[200],
      text: info[800],
      emphasis: info[500]
    }
  }
} as const;

// Color utilities for consistent usage
export const colorUtils = {
  // Get color with opacity
  withOpacity: (color: string, opacity: number) => `${color}/${Math.round(opacity * 100)}`,
  
  // Common color combinations from audit
  combinations: {
    // Button color schemes
    primaryButton: {
      bg: primary[500],
      hover: primary[600],
      text: neutral[50]
    },
    secondaryButton: {
      bg: neutral[100], 
      hover: neutral[200],
      text: neutral[900]
    },
    destructiveButton: {
      bg: error[500],
      hover: error[600], 
      text: neutral[50]
    },
    
    // Badge color schemes (standardized from audit findings)
    successBadge: {
      bg: success[100],
      text: success[800],
      border: success[200]
    },
    warningBadge: {
      bg: warning[100],
      text: warning[800],
      border: warning[200]
    },
    errorBadge: {
      bg: error[100], 
      text: error[800],
      border: error[200]
    },
    infoBadge: {
      bg: info[100],
      text: info[800], 
      border: info[200]
    }
  }
} as const;

// Export all colors
export const colors = {
  primary,
  success,
  warning, 
  error,
  info,
  neutral,
  semantic,
  colorUtils
} as const;

export default colors;
