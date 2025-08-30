/**
 * Layout Components - Standardized spacing system
 * Random spacing values → 8px grid system
 */

// Container component - standard page container
export const Container = {
  // Full width container
  full: {
    width: 'w-full',
    padding: 'px-4 md:px-6 lg:px-8'
  },
  // Centered container with max width
  centered: {
    width: 'w-full',
    maxWidth: 'max-w-7xl',
    margin: 'mx-auto',
    padding: 'px-4 md:px-6 lg:px-8'
  },
  // Narrow container for content
  narrow: {
    width: 'w-full',
    maxWidth: 'max-w-4xl',
    margin: 'mx-auto',
    padding: 'px-4 md:px-6'
  }
} as const;

// Grid system - systematic layout
export const Grid = {
  // Single column (mobile-first)
  single: {
    display: 'grid',
    columns: 'grid-cols-1',
    gap: 'gap-4'
  },
  // Two columns
  two: {
    display: 'grid',
    columns: 'grid-cols-1 md:grid-cols-2',
    gap: 'gap-4 md:gap-6'
  },
  // Three columns
  three: {
    display: 'grid',
    columns: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    gap: 'gap-4 md:gap-6'
  },
  // Four columns
  four: {
    display: 'grid',
    columns: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    gap: 'gap-4 md:gap-6'
  },
  // Auto-fit columns
  autoFit: {
    display: 'grid',
    columns: 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]',
    gap: 'gap-4 md:gap-6'
  }
} as const;

// Stack component - vertical spacing
export const Stack = {
  // Tight spacing
  tight: {
    display: 'flex',
    direction: 'flex-col',
    gap: 'gap-2'  // 8px
  },
  // Default spacing
  default: {
    display: 'flex',
    direction: 'flex-col',
    gap: 'gap-4'  // 16px
  },
  // Relaxed spacing
  relaxed: {
    display: 'flex',
    direction: 'flex-col',
    gap: 'gap-6'  // 24px
  },
  // Loose spacing
  loose: {
    display: 'flex',
    direction: 'flex-col',
    gap: 'gap-8'  // 32px
  }
} as const;

// Flex layouts - common patterns từ audit
export const Flex = {
  // Center everything
  center: {
    display: 'flex',
    align: 'items-center',
    justify: 'justify-center',
    gap: 'gap-2'
  },
  // Space between
  between: {
    display: 'flex',
    align: 'items-center',
    justify: 'justify-between',
    gap: 'gap-2'
  },
  // Start aligned
  start: {
    display: 'flex',
    align: 'items-center',
    justify: 'justify-start',
    gap: 'gap-2'
  },
  // End aligned
  end: {
    display: 'flex',
    align: 'items-center',
    justify: 'justify-end',
    gap: 'gap-2'
  },
  // Wrap layout
  wrap: {
    display: 'flex',
    wrap: 'flex-wrap',
    align: 'items-center',
    gap: 'gap-2'
  }
} as const;

// Page layout patterns - common structures từ audit
export const PageLayout = {
  // Standard page with header and content
  standard: {
    container: Container.centered,
    spacing: Stack.default,
    minHeight: 'min-h-screen',
    background: 'bg-neutral-50'
  },
  // Dashboard layout
  dashboard: {
    container: Container.full,
    spacing: Stack.tight,
    minHeight: 'min-h-screen',
    background: 'bg-neutral-50',
    padding: 'p-4 md:p-6'
  },
  // Modal/Card layout
  card: {
    container: Container.narrow,
    spacing: Stack.default,
    background: 'bg-white',
    border: 'border border-neutral-200',
    radius: 'rounded-lg',
    shadow: 'shadow-md',
    padding: 'p-6'
  },
  // Form layout
  form: {
    container: Container.narrow,
    spacing: Stack.relaxed,
    background: 'bg-white',
    padding: 'p-6'
  }
} as const;

// Spacing utilities - systematic spacing thay vì random values
export const Spacing = {
  // Internal component spacing
  component: {
    tight: 'p-2',     // 8px
    default: 'p-4',   // 16px
    relaxed: 'p-6',   // 24px
    loose: 'p-8'      // 32px
  },
  // Section spacing
  section: {
    tight: 'py-4',    // 16px vertical
    default: 'py-6',  // 24px vertical
    relaxed: 'py-8',  // 32px vertical
    loose: 'py-12'    // 48px vertical
  },
  // Element margins
  margin: {
    tight: 'm-2',     // 8px
    default: 'm-4',   // 16px
    relaxed: 'm-6',   // 24px
    loose: 'm-8'      // 32px
  }
} as const;

export type ContainerVariant = keyof typeof Container;
export type GridVariant = keyof typeof Grid;
export type StackVariant = keyof typeof Stack;
export type FlexVariant = keyof typeof Flex;
export type PageLayoutVariant = keyof typeof PageLayout;
