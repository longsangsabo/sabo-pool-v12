/**
 * Environment Type Declarations
 * Comprehensive import.meta.env TypeScript support
 */

interface ImportMetaEnv {
  // Supabase Configuration
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY?: string;
  
  // App Configuration
  readonly VITE_APP_ENVIRONMENT?: 'development' | 'staging' | 'production';
  readonly VITE_APP_VERSION?: string;
  readonly VITE_ENABLE_DEBUG?: string;
  
  // Analytics & Monitoring
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_ANALYTICS_ID?: string;
  
  // Social Login Configuration
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_FACEBOOK_APP_ID?: string;
  readonly VITE_TWITTER_CLIENT_ID?: string;
  readonly VITE_GITHUB_CLIENT_ID?: string;
  
  // Payment Configuration
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
  readonly VITE_PAYPAL_CLIENT_ID?: string;
  
  // Node Environment
  readonly NODE_ENV: 'development' | 'production' | 'test';
  readonly DEV?: boolean;
  readonly PROD?: boolean;
  readonly SSR?: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: {
    readonly data: Record<PropertyKey, any>;
    accept(): void;
    accept(cb: (mod: ModuleNamespace | undefined) => void): void;
    accept(dep: string, cb: (mod: ModuleNamespace | undefined) => void): void;
    accept(deps: readonly string[], cb: (mods: Array<ModuleNamespace | undefined>) => void): void;
    dispose(cb: (data: Record<PropertyKey, any>) => void): void;
    prune(cb: (data: Record<PropertyKey, any>) => void): void;
    invalidate(message?: string): void;
    on<T extends string>(event: T, cb: (payload: any) => void): void;
    off<T extends string>(event: T, cb: (payload: any) => void): void;
    send<T extends string>(event: T, data?: any): void;
  };
}

// Global type augmentation
declare global {
  interface Window {
    // React Query
    queryClient?: any;
    
    // Analytics
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    
    // Social Login APIs
    google?: any;
    FB?: any;
    twttr?: any;
    
    // Payment APIs
    Stripe?: any;
    paypal?: any;
    
    // Development Tools
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: any;
  }

  // Extend process for Node.js compatibility
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
  }

  // Module namespace for hot reload
  interface ModuleNamespace {
    [key: string]: any;
  }
}

export {};
