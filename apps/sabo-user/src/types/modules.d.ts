import { logger } from '@/services/loggerService';

/**
 * Module Type Declarations
 * Fixes missing module TypeScript errors
 */

// Router modules
declare module './router/AdminRouter' {
  const AdminRouter: React.ComponentType;
  export default AdminRouter;
}

// Page modules
declare module './pages/DashboardPage' {
  const DashboardPage: React.ComponentType;
  export default DashboardPage;
}

declare module './pages/EnhancedChallengesPageV2' {
  const EnhancedChallengesPageV2: React.ComponentType;
  export default EnhancedChallengesPageV2;
}

declare module './pages/TournamentsPage' {
  const TournamentsPage: React.ComponentType;
  export default TournamentsPage;
}

// Utility modules
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

// CSS modules
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

export {};
