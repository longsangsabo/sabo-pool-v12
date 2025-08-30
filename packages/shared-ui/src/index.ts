/**
 * @sabo/shared-ui - Updated Design System
 * Standardized components với design tokens integration
 */

// Utility functions
export * from './lib/utils';

// Core Components (legacy)
export * from './components/button';
export * from './components/card';
export * from './components/input';
export * from './components/badge';
export * from './components/loading';

// New Design System Components
export * from './components/Button/Button';
export * from './components/Button/variants';

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

// Re-export commonly used components and patterns
export { Button } from './components/button';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/card';
export { Input } from './components/input';
export { Badge } from './components/badge';
export { Loading } from './components/loading';

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
