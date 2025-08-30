/**
 * Sabo Pool Design System - Typography Tokens
 * Chuẩn hóa typography scale từ audit findings
 */

// Font Families
export const fontFamily = {
  sans: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif'
  ],
  mono: [
    'SF Mono',
    'Monaco',
    'Inconsolata',
    'Roboto Mono',
    'monospace'
  ]
} as const;

// Font Sizes - Simplified từ audit chaos (15+ combinations → 8 scales)
export const fontSize = {
  xs: {
    size: '12px',
    lineHeight: '16px'
  },
  sm: {
    size: '14px', 
    lineHeight: '20px'
  },
  base: {
    size: '16px',
    lineHeight: '24px'
  },
  lg: {
    size: '18px',
    lineHeight: '28px'
  },
  xl: {
    size: '20px',
    lineHeight: '28px'
  },
  '2xl': {
    size: '24px',
    lineHeight: '32px'
  },
  '3xl': {
    size: '30px',
    lineHeight: '36px'
  },
  '4xl': {
    size: '36px',
    lineHeight: '40px'
  }
} as const;

// Font Weights - Standardized từ audit findings
export const fontWeight = {
  light: '300',
  normal: '400',
  medium: '500',   // Most common in audit
  semibold: '600', // Most common in audit  
  bold: '700',     // Most common in audit
  extrabold: '800'
} as const;

// Line Heights
export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375', 
  normal: '1.5',
  relaxed: '1.625',
  loose: '2'
} as const;

// Letter Spacing
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em'
} as const;

// Typography Presets - Dựa trên audit findings và common patterns
export const typography = {
  // Headings
  h1: {
    fontSize: fontSize['4xl'].size,
    lineHeight: fontSize['4xl'].lineHeight,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight
  },
  h2: {
    fontSize: fontSize['3xl'].size,
    lineHeight: fontSize['3xl'].lineHeight,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight
  },
  h3: {
    fontSize: fontSize['2xl'].size,
    lineHeight: fontSize['2xl'].lineHeight,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal
  },
  h4: {
    fontSize: fontSize.xl.size,
    lineHeight: fontSize.xl.lineHeight,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal
  },
  h5: {
    fontSize: fontSize.lg.size,
    lineHeight: fontSize.lg.lineHeight,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.normal
  },
  h6: {
    fontSize: fontSize.base.size,
    lineHeight: fontSize.base.lineHeight,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.normal
  },

  // Body text
  body: {
    fontSize: fontSize.base.size,
    lineHeight: fontSize.base.lineHeight,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal
  },
  bodySmall: {
    fontSize: fontSize.sm.size,
    lineHeight: fontSize.sm.lineHeight,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal
  },
  bodyLarge: {
    fontSize: fontSize.lg.size,
    lineHeight: fontSize.lg.lineHeight,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal
  },

  // UI Elements - Common patterns từ audit
  label: {
    fontSize: fontSize.sm.size,
    lineHeight: fontSize.sm.lineHeight,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.normal
  },
  caption: {
    fontSize: fontSize.xs.size,
    lineHeight: fontSize.xs.lineHeight,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.wide
  },
  overline: {
    fontSize: fontSize.xs.size,
    lineHeight: fontSize.xs.lineHeight,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase' as const
  },

  // Button text styles - Từ audit findings
  buttonLarge: {
    fontSize: fontSize.base.size,
    lineHeight: fontSize.base.lineHeight,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal
  },
  buttonMedium: {
    fontSize: fontSize.sm.size,
    lineHeight: fontSize.sm.lineHeight,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal
  },
  buttonSmall: {
    fontSize: fontSize.xs.size,
    lineHeight: fontSize.xs.lineHeight,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.normal
  }
} as const;

// Utility functions
export const typographyUtils = {
  // Generate CSS styles from typography preset
  getStyles: (preset: keyof typeof typography) => {
    const config = typography[preset];
    return {
      fontSize: config.fontSize,
      lineHeight: config.lineHeight,
      fontWeight: config.fontWeight,
      letterSpacing: config.letterSpacing,
      ...('textTransform' in config && config.textTransform && { textTransform: config.textTransform })
    };
  },

  // Common text combinations từ audit
  combinations: {
    // Card titles (from audit findings)
    cardTitle: {
      fontSize: fontSize.lg.size,
      fontWeight: fontWeight.semibold,
      lineHeight: fontSize.lg.lineHeight
    },
    // Modal titles  
    modalTitle: {
      fontSize: fontSize.xl.size,
      fontWeight: fontWeight.bold,
      lineHeight: fontSize.xl.lineHeight
    },
    // Form labels
    formLabel: {
      fontSize: fontSize.sm.size,
      fontWeight: fontWeight.medium,
      lineHeight: fontSize.sm.lineHeight
    },
    // Status text (badges, etc)
    statusText: {
      fontSize: fontSize.xs.size,
      fontWeight: fontWeight.medium,
      lineHeight: fontSize.xs.lineHeight,
      letterSpacing: letterSpacing.wide
    }
  }
} as const;

export default {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  typography,
  typographyUtils
};
