/**
 * Sabo Pool Design System - Design Tokens
 * Central export cho tất cả design tokens
 */

// Export all color tokens
export * from './colors';

// Export typography tokens
export * from './typography';

// Export spacing tokens
export * from './spacing';

// Export shadow tokens
export * from './shadows';

// Re-export as organized modules
export { colors } from './colors';
export { spacing, semanticSpacing } from './spacing';
export { shadows, semanticShadows } from './shadows';

// Import all tokens
import { colors } from './colors';
import { spacing, semanticSpacing } from './spacing';
import { shadows, semanticShadows } from './shadows';
import typographyTokens from './typography';

// Re-export typography correctly
export const typography = typographyTokens;

// Combined design tokens object
export const designTokens = {
  colors,
  typography: typographyTokens,
  spacing: {
    ...spacing,
    semantic: semanticSpacing
  },
  shadows: {
    ...shadows,
    semantic: semanticShadows
  }
} as const;

export default designTokens;

// Type definitions for better TypeScript support
export type ColorToken = keyof typeof colors.primary;
export type SpacingToken = keyof typeof spacing;
export type ShadowToken = keyof typeof shadows;
export type TypographyPreset = keyof typeof typographyTokens.typography;
export type FontSize = keyof typeof typographyTokens.fontSize;
