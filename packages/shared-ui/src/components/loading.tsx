/**
 * Loading Component
 * Extracted and enhanced from user app
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  variant?: 'default' | 'card' | 'fullscreen';
}

export const Loading: React.FC<LoadingProps> = ({
  className,
  size = 'md',
  text = 'Loading...',
  variant = 'default',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  if (variant === 'card') {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8', className)}>
        <Loader2 className={cn('animate-spin text-muted-foreground', sizeClasses[size])} />
        {text && (
          <p className={cn('mt-2 text-muted-foreground', textSizes[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div className={cn(
        'fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50',
        className
      )}>
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className={cn('animate-spin', sizeClasses[size])} />
          {text && (
            <p className={cn('text-foreground', textSizes[size])}>
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      {text && (
        <span className={cn(textSizes[size])}>
          {text}
        </span>
      )}
    </div>
  );
};
