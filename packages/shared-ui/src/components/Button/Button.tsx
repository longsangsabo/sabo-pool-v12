/**
 * Button Component - Updated với Design Tokens
 * Standardized từ audit findings: 20+ variants → 5 standard variants
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Button variants sử dụng design tokens
const buttonVariants = cva(
  // Base styles sử dụng design tokens
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
        // Primary - Main brand action
        default: [
          'bg-primary-500 text-white',
          'hover:bg-primary-600',
          'focus-visible:ring-primary-500/50',
          'shadow-sm hover:shadow-md'
        ],
        // Destructive - Delete/danger actions  
        destructive: [
          'bg-error-500 text-white',
          'hover:bg-error-600',
          'focus-visible:ring-error-500/50',
          'shadow-sm hover:shadow-md'
        ],
        // Outline - Secondary actions
        outline: [
          'border border-neutral-200 bg-white text-neutral-900',
          'hover:bg-neutral-50 hover:border-neutral-300',
          'focus-visible:ring-primary-500/50',
          'shadow-sm hover:shadow-md'
        ],
        // Secondary - Less prominent actions
        secondary: [
          'bg-neutral-100 text-neutral-900',
          'hover:bg-neutral-200',
          'focus-visible:ring-primary-500/50',
          'shadow-sm hover:shadow-md'
        ],
        // Ghost - Minimal actions
        ghost: [
          'text-neutral-600',
          'hover:bg-neutral-100 hover:text-neutral-900',
          'focus-visible:ring-primary-500/50'
        ],
      },
      size: {
        // Sizes sử dụng spacing tokens
        sm: 'h-8 px-3 text-xs',      // 32px height, 12px padding
        default: 'h-10 px-4 text-sm',  // 40px height, 16px padding
        lg: 'h-12 px-6 text-base',     // 48px height, 24px padding
        icon: 'h-10 w-10',             // Square for icons
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
export type { ButtonProps };
