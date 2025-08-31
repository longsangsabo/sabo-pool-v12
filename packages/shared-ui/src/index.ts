/**
 * @sabo/shared-ui - Updated Design System
 * Standardized components với design tokens integration
 */

// Utility functions
export * from './lib/utils';

// === THEME SYSTEM ===
export * from './theme';

// Core Components (legacy - will be phased out)
export { Button, buttonVariants, type ButtonProps } from './components/button';
export * from './components/card';
export * from './components/input';
export * from './components/badge';
export * from './components/loading';

// New Design System Components (v2.0)
export { 
  Button as DesignSystemButton, 
  type ButtonProps as DesignSystemButtonProps 
} from './components/Button/Button';

// Typography System
export * from './components/Typography/variants';

// Layout System
export * from './components/Layout/variants';

// Form System
export * from './components/Form/variants';

// Component metadata
export const SharedUIVersion = '2.0.0';
export const ComponentsReady = true;
export const DesignSystemReady = true;
export const ThemeSystemReady = true;

// Progress Components
export { ProgressBar } from './Progress/ProgressBar';

// Layout Components
export { DynamicSizer } from './Layout/DynamicSizer';
// Utility Components
export { DynamicStyle } from './Utils/DynamicStyle';

// Typography Components
export { Typography } from './Typography/Typography';
export { Caption } from './Typography/Caption';
export { BodyText } from './Typography/BodyText';
export { Heading } from './Typography/Heading';
