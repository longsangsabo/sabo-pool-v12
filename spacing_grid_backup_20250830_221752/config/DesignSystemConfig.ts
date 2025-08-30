// Design System Configuration for SABO Arena
// Phase 1: Comprehensive Design Token System

export const SABO_DESIGN_TOKENS = {
  // Typography System
  typography: {
    // Font families
    fonts: {
      primary: 'var(--font-geist-sans)', // Main UI font
      display: 'var(--font-bebas)', // Headlines and user names
      numeric: 'var(--font-racing)', // Numbers and scores
      body: 'var(--font-geist-sans)', // Body text
    },
    
    // Font sizes (mobile-first responsive)
    sizes: {
      xs: { mobile: '0.75rem', desktop: '0.75rem' }, // 12px
      sm: { mobile: '0.875rem', desktop: '0.875rem' }, // 14px
      base: { mobile: '1rem', desktop: '1rem' }, // 16px
      lg: { mobile: '1.125rem', desktop: '1.125rem' }, // 18px
      xl: { mobile: '1.25rem', desktop: '1.25rem' }, // 20px
      '2xl': { mobile: '1.5rem', desktop: '1.75rem' }, // 24px/28px
      '3xl': { mobile: '1.875rem', desktop: '2.25rem' }, // 30px/36px
      '4xl': { mobile: '2.25rem', desktop: '3rem' }, // 36px/48px
    },
    
    // Font weights
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    
    // Line heights
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    }
  },

  // Enhanced Color System with Light/Dark Mode Support
  colors: {
    // Primary brand colors
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Main brand color
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    
    // Secondary colors for accents
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    
    // Success colors (for wins, achievements)
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    // Warning colors (for challenges, pending)
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    // Error colors (for losses, errors)
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    
    // Tournament specific colors
    tournament: {
      gold: '#ffd700',
      silver: '#c0c0c0',
      bronze: '#cd7f32',
    },
    
    // Theme-aware semantic colors
    semantic: {
      light: {
        // Text colors for light mode
        text: {
          primary: '#1f2937',     // Almost black for main text
          secondary: '#6b7280',   // Gray for secondary text  
          muted: '#9ca3af',      // Light gray for muted text
          inverse: '#ffffff',     // White text for dark backgrounds
        },
        // Background colors for light mode
        background: {
          primary: '#ffffff',     // Main background
          secondary: '#f9fafb',   // Secondary background
          muted: '#f3f4f6',      // Muted background
          overlay: 'rgba(0, 0, 0, 0.8)',
          card: '#ffffff',
          elevated: '#ffffff',
          hover: '#f9fafb',
        },
        // Border colors for light mode
        border: {
          primary: '#e5e7eb',     // Main borders
          secondary: '#d1d5db',   // Secondary borders
          muted: '#f3f4f6',      // Subtle borders
        }
      },
      dark: {
        // Text colors for dark mode
        text: {
          primary: '#f9fafb',     // Almost white for main text
          secondary: '#d1d5db',   // Light gray for secondary text
          muted: '#9ca3af',      // Gray for muted text
          inverse: '#111827',     // Dark text for light backgrounds
        },
        // Background colors for dark mode
        background: {
          primary: '#111827',     // Main dark background
          secondary: '#1f2937',   // Secondary dark background
          muted: '#374151',      // Muted dark background
          overlay: 'rgba(0, 0, 0, 0.9)',
          card: '#1f2937',
          elevated: '#374151',
          hover: '#374151',
        },
        // Border colors for dark mode
        border: {
          primary: '#374151',     // Main borders in dark
          secondary: '#4b5563',   // Secondary borders in dark
          muted: '#1f2937',      // Subtle borders in dark
        }
      }
    },
    
    // Background system (deprecated - use semantic instead)
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      muted: '#f1f5f9',
      overlay: 'rgba(0, 0, 0, 0.8)',
      card: '#ffffff',
      gradient: {
        primary: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
        success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        dark: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
      }
    }
  },

  // Spacing System (mobile-first)
  spacing: {
    // Base spacing scale
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem',  // 8px
    3: '0.75rem', // 12px
    4: '1rem',    // 16px
    5: '1.25rem', // 20px
    6: '1.5rem',  // 24px
    8: '2rem',    // 32px
    10: '2.5rem', // 40px
    12: '3rem',   // 48px
    16: '4rem',   // 64px
    20: '5rem',   // 80px
    24: '6rem',   // 96px
    
    // Mobile-specific spacing (reduced for mobile)
    mobile: {
      container: '1rem', // 16px container padding
      section: '1.5rem', // 24px section spacing
      component: '1rem', // 16px component spacing
      element: '0.5rem', // 8px element spacing
    },
    
    // Desktop spacing (standard)
    desktop: {
      container: '1.5rem', // 24px container padding
      section: '2rem',      // 32px section spacing
      component: '1.5rem',  // 24px component spacing
      element: '0.75rem',   // 12px element spacing
    }
  },

  // Border Radius System
  borderRadius: {
    none: '0',
    sm: '0.125rem',  // 2px
    base: '0.25rem', // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Enhanced Shadow System with Light/Dark Mode Support
  shadows: {
    light: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    },
    dark: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      base: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.6)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.2)',
      glow: '0 0 20px rgb(14 165 233 / 0.3)', // Blue glow for dark mode
    },
    // Legacy support (light mode defaults)
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },

  // Enhanced Component Specific Configurations with Light/Dark Mode Support
  components: {
    // Card standardization with theme support
    card: {
      light: {
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        hover: {
          shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          background: '#f9fafb',
        }
      },
      dark: {
        background: '#1f2937',
        border: '1px solid #374151',
        shadow: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
        hover: {
          shadow: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
          background: '#374151',
        }
      },
      borderRadius: '0.5rem', // lg
      padding: {
        mobile: '1rem',   // 16px
        desktop: '1.5rem' // 24px
      },
      hover: {
        transform: 'translateY(-1px)',
        transition: 'all 0.2s ease-in-out',
      }
    },
    
    // Button standardization with theme support
    button: {
      borderRadius: '0.375rem', // md
      padding: {
        sm: { mobile: '0.5rem 0.75rem', desktop: '0.5rem 1rem' },
        base: { mobile: '0.75rem 1rem', desktop: '0.75rem 1.5rem' },
        lg: { mobile: '1rem 1.5rem', desktop: '1rem 2rem' },
      },
      fontSize: {
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
      },
      minHeight: {
        mobile: '44px', // Touch-friendly minimum
        desktop: '40px',
      },
      variants: {
        primary: {
          light: {
            background: '#0ea5e9',
            color: '#ffffff',
            border: 'none',
            hover: {
              background: '#0284c7',
            }
          },
          dark: {
            background: '#0ea5e9',
            color: '#ffffff', 
            border: 'none',
            hover: {
              background: '#38bdf8',
            }
          }
        },
        secondary: {
          light: {
            background: '#f9fafb',
            color: '#374151',
            border: '1px solid #d1d5db',
            hover: {
              background: '#f3f4f6',
            }
          },
          dark: {
            background: '#374151',
            color: '#f9fafb',
            border: '1px solid #4b5563',
            hover: {
              background: '#4b5563',
            }
          }
        }
      }
    },
    
    // Form elements with theme support
    input: {
      borderRadius: '0.375rem', // md
      padding: {
        mobile: '0.75rem',
        desktop: '0.75rem 1rem',
      },
      fontSize: '1rem',
      minHeight: {
        mobile: '44px', // Touch-friendly
        desktop: '40px',
      },
      light: {
        background: '#ffffff',
        border: '1px solid #d1d5db',
        color: '#1f2937',
        placeholder: '#9ca3af',
        focus: {
          borderColor: '#0ea5e9',
          boxShadow: '0 0 0 3px rgb(14 165 233 / 0.1)',
        }
      },
      dark: {
        background: '#374151',
        border: '1px solid #4b5563',
        color: '#f9fafb',
        placeholder: '#9ca3af',
        focus: {
          borderColor: '#38bdf8',
          boxShadow: '0 0 0 3px rgb(56 189 248 / 0.2)',
        }
      }
    },
    
    // Navigation
    navigation: {
      mobile: {
        height: '60px',
        padding: '0.5rem',
        iconSize: '24px',
        fontSize: '0.75rem',
      },
      desktop: {
        width: '240px',
        collapsedWidth: '60px',
        padding: '1rem',
        iconSize: '20px',
        fontSize: '0.875rem',
      }
    }
  },

  // Responsive Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Animation & Transitions
  animation: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    }
  },

  // Z-index system
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  }
} as const;

// Component standardization utilities
export const getResponsiveValue = (
  values: { mobile: string; desktop: string },
  breakpoint: 'mobile' | 'desktop' = 'mobile'
) => {
  return values[breakpoint];
};

// Generate Tailwind CSS classes from design tokens
export const generateTailwindClasses = () => {
  const { typography, spacing, colors } = SABO_DESIGN_TOKENS;
  
  return {
    // Typography classes
    typography: {
      'font-primary': `font-family: ${typography.fonts.primary}`,
      'font-display': `font-family: ${typography.fonts.display}`,
      'font-numeric': `font-family: ${typography.fonts.numeric}`,
    },
    
    // Standardized component classes
    card: 'bg-white border border-gray-200 rounded-lg shadow-sm',
    cardHeader: 'p-4 md:p-6',
    cardContent: 'p-4 md:p-6 pt-0',
    button: 'rounded-md font-medium transition-colors duration-200',
    input: 'rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
  };
};

export type DesignTokens = typeof SABO_DESIGN_TOKENS;
export type ColorScale = typeof SABO_DESIGN_TOKENS.colors.primary;
export type SpacingScale = typeof SABO_DESIGN_TOKENS.spacing;
export type ComponentConfig = typeof SABO_DESIGN_TOKENS.components;
