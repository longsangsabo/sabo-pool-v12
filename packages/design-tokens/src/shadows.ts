/**
 * Sabo Pool Design System - Shadow Tokens
 * Consistent shadow system for depth and elevation
 */

// Shadow scale for different elevation levels
export const shadows = {
  none: 'none',
  
  // Subtle shadows
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  
  // Default shadow
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  
  // Medium elevation
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  
  // High elevation
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  
  // Maximum elevation
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  
  // Inner shadows
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  
  // Focus ring
  focus: '0 0 0 3px rgb(59 130 246 / 0.5)'
} as const;

// Semantic shadow usage
export const semanticShadows = {
  // Card elevations
  card: {
    flat: shadows.none,
    raised: shadows.sm,
    elevated: shadows.md,
    floating: shadows.lg
  },
  
  // Interactive element shadows
  interactive: {
    default: shadows.sm,
    hover: shadows.md,
    active: shadows.inner,
    focus: shadows.focus
  },
  
  // Modal and overlay shadows
  overlay: {
    tooltip: shadows.md,
    dropdown: shadows.lg,
    modal: shadows.xl,
    drawer: shadows['2xl']
  },
  
  // Button shadows based on audit findings
  button: {
    default: shadows.sm,
    hover: shadows.md,
    pressed: shadows.inner
  }
} as const;

// Color-specific shadows for branded elements
export const colorShadows = {
  primary: '0 4px 6px -1px rgb(59 130 246 / 0.2), 0 2px 4px -2px rgb(59 130 246 / 0.1)',
  success: '0 4px 6px -1px rgb(34 197 94 / 0.2), 0 2px 4px -2px rgb(34 197 94 / 0.1)',
  warning: '0 4px 6px -1px rgb(245 158 11 / 0.2), 0 2px 4px -2px rgb(245 158 11 / 0.1)',
  error: '0 4px 6px -1px rgb(239 68 68 / 0.2), 0 2px 4px -2px rgb(239 68 68 / 0.1)'
} as const;

export default {
  shadows,
  semanticShadows,
  colorShadows
};
