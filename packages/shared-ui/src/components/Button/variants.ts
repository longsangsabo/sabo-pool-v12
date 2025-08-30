/**
 * Button Variants - Standardized từ audit findings
 * 20+ chaotic variants → 5 clean variants
 */

// Button variant definitions sử dụng design tokens
export const buttonVariants = {
  // Primary - Main brand action (most common from audit)
  default: {
    background: 'bg-primary-500',
    text: 'text-white',
    hover: 'hover:bg-primary-600',
    focus: 'focus-visible:ring-primary-500/50',
    shadow: 'shadow-sm hover:shadow-md'
  },
  
  // Destructive - Delete/danger actions (from error patterns in audit)
  destructive: {
    background: 'bg-error-500', 
    text: 'text-white',
    hover: 'hover:bg-error-600',
    focus: 'focus-visible:ring-error-500/50',
    shadow: 'shadow-sm hover:shadow-md'
  },
  
  // Outline - Secondary actions (very common pattern from audit)
  outline: {
    background: 'bg-white',
    border: 'border border-neutral-200',
    text: 'text-neutral-900',
    hover: 'hover:bg-neutral-50 hover:border-neutral-300',
    focus: 'focus-visible:ring-primary-500/50',
    shadow: 'shadow-sm hover:shadow-md'
  },
  
  // Secondary - Less prominent actions
  secondary: {
    background: 'bg-neutral-100',
    text: 'text-neutral-900', 
    hover: 'hover:bg-neutral-200',
    focus: 'focus-visible:ring-primary-500/50',
    shadow: 'shadow-sm hover:shadow-md'
  },
  
  // Ghost - Minimal actions (common in navigation from audit)
  ghost: {
    text: 'text-neutral-600',
    hover: 'hover:bg-neutral-100 hover:text-neutral-900',
    focus: 'focus-visible:ring-primary-500/50'
  }
} as const;

// Button size definitions using spacing tokens
export const buttonSizes = {
  sm: {
    height: 'h-8',      // 32px
    padding: 'px-3',    // 12px horizontal
    fontSize: 'text-xs' // 12px
  },
  default: {
    height: 'h-10',     // 40px  
    padding: 'px-4',    // 16px horizontal
    fontSize: 'text-sm' // 14px
  },
  lg: {
    height: 'h-12',     // 48px
    padding: 'px-6',    // 24px horizontal
    fontSize: 'text-base' // 16px
  },
  icon: {
    size: 'h-10 w-10'   // 40x40px square
  }
} as const;

// Base button styles - common across all variants
export const buttonBase = [
  'inline-flex items-center justify-center gap-2',
  'whitespace-nowrap rounded-md',
  'font-medium transition-colors duration-200',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  'disabled:pointer-events-none disabled:opacity-50',
  '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
] as const;

export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;
