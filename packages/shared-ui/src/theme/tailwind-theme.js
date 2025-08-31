/**
 * Shared Tailwind Theme Configuration
 * For use across all apps in the monorepo
 */

import { generateTailwindTheme } from './css-vars';

// Generate the theme configuration from our design tokens
const baseTheme = generateTailwindTheme();

export const sharedTailwindTheme = {
  ...baseTheme,
  
  // Extended configuration for design system
  extend: {
    ...baseTheme,
    
    // Additional font sizes for design system
    fontSize: {
      'caption': ['12px', '16px'],      // Design system caption
      'body-small': ['14px', '20px'],   // Design system body-small
      'body': ['16px', '24px'],         // Design system body
      'body-large': ['18px', '28px'],   // Design system body-large
      'title': ['20px', '28px'],        // Design system title
      'heading': ['24px', '32px'],      // Design system heading
      'display': ['30px', '36px']       // Design system display
    },
    
    // Animation configuration
    animation: {
      'theme-switch': 'themeSwitch 200ms ease-in-out',
      'mobile-tap': 'mobileTap 150ms ease-out',
      'mobile-slide-up': 'mobileSlideUp 300ms ease-out',
      'mobile-slide-down': 'mobileSlideDown 300ms ease-out',
    },
    
    keyframes: {
      themeSwitch: {
        '0%': { opacity: '0.8' },
        '100%': { opacity: '1' }
      },
      mobileTap: {
        '0%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(0.95)' },
        '100%': { transform: 'scale(1)' }
      },
      mobileSlideUp: {
        '0%': { transform: 'translateY(100%)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' }
      },
      mobileSlideDown: {
        '0%': { transform: 'translateY(-100%)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' }
      }
    },
    
    // Screen breakpoints optimized for mobile-first
    screens: {
      'xs': '375px',    // Small mobile
      'sm': '640px',    // Large mobile
      'md': '768px',    // Tablet
      'lg': '1024px',   // Desktop
      'xl': '1280px',   // Large desktop
      '2xl': '1536px',  // Extra large desktop
      
      // Mobile-specific breakpoints
      'mobile': { 'max': '767px' },
      'tablet': { 'min': '768px', 'max': '1023px' },
      'desktop': { 'min': '1024px' },
      
      // Touch device optimization
      'touch': { 'raw': '(hover: none) and (pointer: coarse)' },
      'no-touch': { 'raw': '(hover: hover) and (pointer: fine)' },
    },
    
    // Z-index scale for consistent layering
    zIndex: {
      'modal': '1000',
      'dropdown': '1000',
      'sticky': '1020',
      'fixed': '1030',
      'modal-backdrop': '1040',
      'offcanvas': '1050',
      'popover': '1060',
      'tooltip': '1070',
      'toast': '1080',
    },
    
    // Container configuration
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
  }
};

// Export individual pieces for flexibility
export const {
  colors: sharedColors,
  spacing: sharedSpacing,
  boxShadow: sharedShadows,
  fontSize: sharedFontSizes,
  screens: sharedScreens,
  animation: sharedAnimations,
  keyframes: sharedKeyframes,
} = sharedTailwindTheme.extend;

// Mobile-first utilities
export const mobileUtilities = {
  '.mobile-container': {
    'max-width': '100%',
    'padding-left': 'var(--mobile-padding)',
    'padding-right': 'var(--mobile-padding)',
  },
  
  '.mobile-card': {
    'background-color': 'hsl(var(--mobile-card))',
    'border-radius': '0.75rem',
    'box-shadow': 'var(--shadow-mobile-card)',
    'padding': 'var(--mobile-padding)',
  },
  
  '.mobile-nav': {
    'background-color': 'hsl(var(--mobile-nav))',
    'height': 'var(--mobile-nav-height)',
    'box-shadow': 'var(--shadow-mobile-nav)',
  },
  
  '.mobile-touch-target': {
    'min-height': 'var(--touch-target)',
    'min-width': 'var(--touch-target)',
    'display': 'flex',
    'align-items': 'center',
    'justify-content': 'center',
  },
  
  '.mobile-safe-area': {
    'padding-top': 'var(--safe-area-top)',
    'padding-bottom': 'var(--safe-area-bottom)',
    'padding-left': 'var(--safe-area-left)',
    'padding-right': 'var(--safe-area-right)',
  },
  
  '.theme-transition': {
    'transition': 'var(--transition-theme-switch)',
  }
};

// Export default configuration for apps to use
export default sharedTailwindTheme;
