// Global type declarations
interface ImportMeta {
  readonly env: Record<string, string | undefined>;
}

declare global {
  interface Window {
    // Add any global window properties here
  }
}

export {};
