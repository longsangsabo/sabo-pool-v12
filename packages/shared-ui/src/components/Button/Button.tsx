/**
 * Button Component - Updated với Design Tokens
 * Standardized từ audit findings: 20+ variants → 5 standard variants
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Button variants sử dụng CSS variables từ theme system
const buttonVariants = cva(
  // Base styles sử dụng theme variables
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md',
    'font-medium transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
  ],
  {
    variants: {
      variant: {
        // Primary - Main brand action (theme-aware)
        default: [
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90',
          'focus-visible:ring-ring',
          'shadow-sm hover:shadow-md'
        ],
        // Destructive - Delete/danger actions (theme-aware)
        destructive: [
          'bg-destructive text-destructive-foreground',
          'hover:bg-destructive/90',
          'focus-visible:ring-ring',
          'shadow-sm hover:shadow-md'
        ],
        // Outline - Secondary actions (theme-aware)
        outline: [
          'border border-input bg-background text-foreground',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:ring-ring',
          'shadow-sm hover:shadow-md'
        ],
        // Secondary - Less prominent actions (theme-aware)
        secondary: [
          'bg-secondary text-secondary-foreground',
          'hover:bg-secondary/80',
          'focus-visible:ring-ring',
          'shadow-sm hover:shadow-md'
        ],
        // Ghost - Minimal actions (theme-aware)
        ghost: [
          'text-foreground',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:ring-ring'
        ],
      },
      size: {
        // Mobile-first sizes - ensuring 44px minimum touch target
        sm: 'h-9 px-3 text-xs min-h-[36px]',      // 36px height (acceptable for small)
        default: 'h-11 px-4 text-sm min-h-[44px]',  // 44px height (mobile standard)
        lg: 'h-12 px-6 text-base min-h-[48px]',     // 48px height (large touch target)
        icon: 'h-11 w-11 min-h-[44px] min-w-[44px]', // Square 44px for mobile accessibility
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
