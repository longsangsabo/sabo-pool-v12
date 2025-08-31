/**
 * CSS Variables Generator
 * Generates theme-aware CSS variables from design tokens
 */

import { themeTokens, type ThemeTokens } from './tokens';

export interface CSSVariablesOptions {
  prefix?: string;
  includeMobile?: boolean;
  includeAccessibility?: boolean;
}

/**
 * Generate CSS variables string from theme tokens
 */
export function generateCSSVariables(
  tokens: ThemeTokens = themeTokens,
  options: CSSVariablesOptions = {}
): string {
  const { prefix = '', includeMobile = true, includeAccessibility = true } = options;
  
  const prefixVar = (name: string) => prefix ? `--${prefix}-${name}` : `--${name}`;
  
  // Generate color variables
  const colorVars = Object.entries(tokens.colors)
    .map(([key, value]) => `  ${prefixVar(key)}: ${value.light};`)
    .join('\n');
    
  const darkColorVars = Object.entries(tokens.colors)
    .map(([key, value]) => `  ${prefixVar(key)}: ${value.dark};`)
    .join('\n');
    
  // Generate spacing variables
  const spacingVars = Object.entries(tokens.spacing)
    .map(([key, value]) => `  ${prefixVar(key)}: ${value};`)
    .join('\n');
    
  // Generate shadow variables
  const shadowVars = Object.entries(tokens.shadows)
    .map(([key, value]) => `  ${prefixVar(`shadow-${key}`)}: ${value.light};`)
    .join('\n');
    
  const darkShadowVars = Object.entries(tokens.shadows)
    .map(([key, value]) => `  ${prefixVar(`shadow-${key}`)}: ${value.dark};`)
    .join('\n');
    
  // Generate transition variables
  const transitionVars = Object.entries(tokens.transitions)
    .map(([key, value]) => `  ${prefixVar(`transition-${key}`)}: ${value};`)
    .join('\n');

  // Mobile-specific variables
  const mobileSection = includeMobile ? `
/* === MOBILE-SPECIFIC VARIABLES === */
@media (max-width: 768px) {
  :root {
    ${prefixVar('mobile-active')}: true;
    ${prefixVar('touch-optimized')}: true;
  }
}

@supports (padding: env(safe-area-inset-top)) {
  :root {
    ${prefixVar('supports-safe-area')}: true;
  }
}` : '';

  // Accessibility variables
  const accessibilitySection = includeAccessibility ? `
/* === ACCESSIBILITY ENHANCEMENTS === */
@media (prefers-contrast: high) {
  :root {
    ${prefixVar('border')}: 0 0% 0%;
    ${prefixVar('shadow-base')}: 0 2px 4px 0 rgb(0 0 0 / 0.8);
  }
  
  .dark {
    ${prefixVar('border')}: 0 0% 100%;
    ${prefixVar('background')}: 0 0% 0%;
    ${prefixVar('foreground')}: 0 0% 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  :root {
    ${prefixVar('transition-theme-switch')}: none;
    ${prefixVar('transition-mobile-tap')}: none;
    ${prefixVar('transition-mobile-swipe')}: none;
  }
}

@media (prefers-color-scheme: light) {
  :root:not(.dark) {
    color-scheme: light;
  }
}

@media (prefers-color-scheme: dark) {
  :root.dark {
    color-scheme: dark;
  }
}` : '';

  return `/* === SABO DESIGN SYSTEM THEME VARIABLES === */
/* Generated from design tokens - DO NOT EDIT MANUALLY */

:root {
/* === COLOR VARIABLES === */
${colorVars}

/* === SPACING VARIABLES === */
${spacingVars}

/* === SHADOW VARIABLES === */
${shadowVars}

/* === TRANSITION VARIABLES === */
${transitionVars}

/* === THEME METADATA === */
  ${prefixVar('theme-mode')}: light;
  ${prefixVar('design-system-version')}: 2.0.0;
}

/* === DARK MODE VARIABLES === */
.dark {
/* === DARK COLOR VARIABLES === */
${darkColorVars}

/* === DARK SHADOW VARIABLES === */
${darkShadowVars}

/* === THEME METADATA === */
  ${prefixVar('theme-mode')}: dark;
}

/* === THEME TRANSITIONS === */
*,
*::before,
*::after {
  transition: 
    background-color var(${prefixVar('transition-theme-switch')}),
    border-color var(${prefixVar('transition-theme-switch')}),
    color var(${prefixVar('transition-theme-switch')}),
    box-shadow var(${prefixVar('transition-theme-switch')});
}

/* === SMOOTH SCROLLING === */
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
${mobileSection}
${accessibilitySection}

/* === UTILITY CLASSES === */
.theme-transition-none {
  transition: none !important;
}

.theme-transition-fast {
  transition-duration: 100ms !important;
}

.theme-transition-slow {
  transition-duration: 500ms !important;
}

/* === MOBILE UTILITIES === */
@media (max-width: 768px) {
  .mobile-nav-height {
    height: var(${prefixVar('mobile-nav-height')});
  }
  
  .mobile-safe-top {
    padding-top: var(${prefixVar('safe-area-top')});
  }
  
  .mobile-safe-bottom {
    padding-bottom: var(${prefixVar('safe-area-bottom')});
  }
  
  .mobile-touch-target {
    min-height: var(${prefixVar('touch-target')});
    min-width: var(${prefixVar('touch-target')});
  }
}`;
}

/**
 * Generate CSS variables for specific theme mode
 */
export function generateThemeCSS(mode: 'light' | 'dark'): string {
  const tokens = themeTokens;
  const colorVars = Object.entries(tokens.colors)
    .map(([key, value]) => `  --${key}: ${value[mode]};`)
    .join('\n');
    
  const shadowVars = Object.entries(tokens.shadows)
    .map(([key, value]) => `  --shadow-${key}: ${value[mode]};`)
    .join('\n');

  return `/* ${mode.toUpperCase()} MODE VARIABLES */
.${mode} {
${colorVars}
${shadowVars}
  --theme-mode: ${mode};
}`;
}

/**
 * Generate Tailwind CSS theme configuration
 */
export function generateTailwindTheme(): Record<string, any> {
  return {
    colors: {
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))',
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
      },
      popover: {
        DEFAULT: 'hsl(var(--popover))',
        foreground: 'hsl(var(--popover-foreground))',
      },
      card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--card-foreground))',
      },
      // Mobile-specific colors
      'mobile-nav': 'hsl(var(--mobile-nav))',
      'mobile-card': 'hsl(var(--mobile-card))',
      'mobile-accent': 'hsl(var(--mobile-accent))',
    },
    spacing: {
      'mobile-nav': 'var(--mobile-nav-height)',
      'safe-top': 'var(--safe-area-top)',
      'safe-bottom': 'var(--safe-area-bottom)',
      'safe-left': 'var(--safe-area-left)',
      'safe-right': 'var(--safe-area-right)',
      'touch-target': 'var(--touch-target)',
      'mobile-padding': 'var(--mobile-padding)',
      'mobile-margin': 'var(--mobile-margin)',
    },
    boxShadow: {
      'theme-sm': 'var(--shadow-sm)',
      'theme-base': 'var(--shadow-base)',
      'theme-md': 'var(--shadow-md)',
      'theme-lg': 'var(--shadow-lg)',
      'theme-xl': 'var(--shadow-xl)',
      'mobile-card': 'var(--shadow-mobile-card)',
      'mobile-nav': 'var(--shadow-mobile-nav)',
    },
    transitionDuration: {
      'theme': '200ms',
      'mobile-tap': '150ms',
      'mobile-swipe': '300ms',
    },
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    },
  };
}
