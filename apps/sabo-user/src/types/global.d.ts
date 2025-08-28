// Enhanced global type declarations
interface ImportMeta {
  readonly env: Record<string, string | undefined>;
  readonly hot?: {
    accept(): void;
    dispose(cb: () => void): void;
  };
}

// Vite-specific environment
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_ENVIRONMENT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Jest/Testing globals
declare global {
  var describe: jest.Describe;
  var it: jest.It;
  var test: jest.It;
  var expect: jest.Expect;
  var beforeEach: jest.LifeCycleMethod;
  var afterEach: jest.LifeCycleMethod;
  var beforeAll: jest.LifeCycleMethod;
  var afterAll: jest.LifeCycleMethod;
}

export {};
