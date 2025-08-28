/**
 * @sabo/shared-ui
 * Shared UI components for SABO Arena
 */

// Utility functions
export * from './lib/utils';

// Core Components
export * from './components/button';
export * from './components/card';
export * from './components/input';
export * from './components/badge';
export * from './components/loading';

// Component metadata
export const SharedUIVersion = '1.0.0';
export const ComponentsReady = true;

// Re-export commonly used components
export { Button } from './components/button';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/card';
export { Input } from './components/input';
export { Badge } from './components/badge';
export { Loading } from './components/loading';
