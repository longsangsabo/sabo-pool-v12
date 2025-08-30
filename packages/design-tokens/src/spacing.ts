/**
 * Sabo Pool Design System - Spacing Tokens
 * Chuẩn hóa spacing system từ audit findings - implement 8px grid
 */

// Base spacing unit - 4px
const baseUnit = 4;

// Spacing Scale - Systematic 4px/8px grid thay vì random values từ audit
export const spacing = {
  0: '0px',
  px: '1px',
  0.5: `${baseUnit * 0.5}px`,  // 2px
  1: `${baseUnit * 1}px`,      // 4px
  1.5: `${baseUnit * 1.5}px`,  // 6px  
  2: `${baseUnit * 2}px`,      // 8px
  2.5: `${baseUnit * 2.5}px`,  // 10px
  3: `${baseUnit * 3}px`,      // 12px
  3.5: `${baseUnit * 3.5}px`,  // 14px
  4: `${baseUnit * 4}px`,      // 16px
  5: `${baseUnit * 5}px`,      // 20px
  6: `${baseUnit * 6}px`,      // 24px
  7: `${baseUnit * 7}px`,      // 28px
  8: `${baseUnit * 8}px`,      // 32px
  9: `${baseUnit * 9}px`,      // 36px
  10: `${baseUnit * 10}px`,    // 40px
  11: `${baseUnit * 11}px`,    // 44px
  12: `${baseUnit * 12}px`,    // 48px
  14: `${baseUnit * 14}px`,    // 56px
  16: `${baseUnit * 16}px`,    // 64px
  20: `${baseUnit * 20}px`,    // 80px
  24: `${baseUnit * 24}px`,    // 96px
  28: `${baseUnit * 28}px`,    // 112px
  32: `${baseUnit * 32}px`,    // 128px
  36: `${baseUnit * 36}px`,    // 144px
  40: `${baseUnit * 40}px`,    // 160px
  44: `${baseUnit * 44}px`,    // 176px
  48: `${baseUnit * 48}px`,    // 192px
  52: `${baseUnit * 52}px`,    // 208px
  56: `${baseUnit * 56}px`,    // 224px
  60: `${baseUnit * 60}px`,    // 240px
  64: `${baseUnit * 64}px`,    // 256px
  72: `${baseUnit * 72}px`,    // 288px
  80: `${baseUnit * 80}px`,    // 320px
  96: `${baseUnit * 96}px`     // 384px
} as const;

// Semantic spacing - Based on audit findings and common usage patterns
export const semanticSpacing = {
  // Component internal spacing
  component: {
    tight: spacing[1],      // 4px - Very tight spacing
    normal: spacing[2],     // 8px - Standard spacing
    comfortable: spacing[3], // 12px - Comfortable spacing
    relaxed: spacing[4]     // 16px - Relaxed spacing
  },

  // Layout spacing
  layout: {
    xs: spacing[4],   // 16px - Extra small sections
    sm: spacing[6],   // 24px - Small sections  
    md: spacing[8],   // 32px - Medium sections
    lg: spacing[12],  // 48px - Large sections
    xl: spacing[16],  // 64px - Extra large sections
    xxl: spacing[24]  // 96px - Extra extra large sections
  },

  // Container padding/margin
  container: {
    mobile: spacing[4],   // 16px - Mobile container padding
    tablet: spacing[6],   // 24px - Tablet container padding
    desktop: spacing[8]   // 32px - Desktop container padding
  },

  // Common UI patterns từ audit findings
  card: {
    padding: spacing[4],       // 16px - Card internal padding
    gap: spacing[3],           // 12px - Gap between card elements
    margin: spacing[4]         // 16px - Space between cards
  },

  button: {
    paddingX: spacing[4],      // 16px - Button horizontal padding
    paddingY: spacing[2],      // 8px - Button vertical padding
    gap: spacing[2]            // 8px - Gap between button elements
  },

  form: {
    fieldGap: spacing[4],      // 16px - Space between form fields
    labelGap: spacing[1],      // 4px - Space between label and input
    sectionGap: spacing[6]     // 24px - Space between form sections
  },

  modal: {
    padding: spacing[6],       // 24px - Modal internal padding
    headerGap: spacing[4],     // 16px - Gap after modal header
    buttonGap: spacing[3]      // 12px - Gap between modal buttons
  }
} as const;

// Grid system based on audit findings
export const grid = {
  // Container max widths
  container: {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // Grid gaps - Standardized từ audit chaos
  gap: {
    none: spacing[0],
    xs: spacing[1],    // 4px
    sm: spacing[2],    // 8px
    md: spacing[3],    // 12px - Most common from audit
    lg: spacing[4],    // 16px - Most common from audit
    xl: spacing[6],    // 24px
    xxl: spacing[8]    // 32px
  },

  // Common column configurations
  columns: {
    1: '1fr',
    2: 'repeat(2, 1fr)',
    3: 'repeat(3, 1fr)',
    4: 'repeat(4, 1fr)',
    6: 'repeat(6, 1fr)',
    12: 'repeat(12, 1fr)'
  }
} as const;

// Component-specific spacing patterns từ audit
export const componentSpacing = {
  // Navigation spacing
  navigation: {
    itemGap: spacing[6],       // 24px - Gap between nav items
    padding: spacing[4],       // 16px - Nav container padding
    height: spacing[16]        // 64px - Nav bar height
  },

  // List spacing
  list: {
    itemGap: spacing[2],       // 8px - Gap between list items
    padding: spacing[3],       // 12px - List item padding
    indent: spacing[6]         // 24px - List indentation
  },

  // Table spacing
  table: {
    cellPadding: spacing[3],   // 12px - Table cell padding
    rowGap: spacing[1],        // 4px - Row gap
    headerPadding: spacing[4]  // 16px - Header cell padding
  },

  // Tournament/Card specific (from audit findings)
  tournament: {
    cardGap: spacing[4],       // 16px - Gap between tournament cards
    cardPadding: spacing[4],   // 16px - Tournament card padding
    sectionGap: spacing[6],    // 24px - Gap between tournament sections
    bracketGap: spacing[8]     // 32px - Gap between bracket sections
  }
} as const;

// Spacing utilities
export const spacingUtils = {
  // Convert spacing token to pixel value
  toPx: (token: keyof typeof spacing): number => {
    return parseInt(spacing[token].replace('px', ''));
  },

  // Get responsive spacing
  responsive: {
    // Mobile-first responsive spacing
    mobile: (size: keyof typeof spacing) => spacing[size],
    tablet: (size: keyof typeof spacing) => spacing[size],
    desktop: (size: keyof typeof spacing) => spacing[size]
  },

  // Common spacing patterns từ audit
  patterns: {
    // Card layout pattern
    cardLayout: {
      padding: spacing[4],     // 16px
      gap: spacing[3],         // 12px
      margin: spacing[4]       // 16px
    },

    // Form layout pattern  
    formLayout: {
      fieldGap: spacing[4],    // 16px
      sectionGap: spacing[6],  // 24px
      buttonGap: spacing[3]    // 12px
    },

    // Button spacing pattern
    buttonSpacing: {
      paddingX: spacing[4],    // 16px
      paddingY: spacing[2],    // 8px
      gap: spacing[2]          // 8px
    }
  }
} as const;

export default {
  spacing,
  semanticSpacing,
  grid,
  componentSpacing,
  spacingUtils
};
