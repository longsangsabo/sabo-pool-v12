import React from 'react';
import { cn } from '@/lib/utils';

export interface ArenaLogoProps {
  className?: string;
  size?: number;
  subtitle?: string;
}

export const ArenaLogo: React.FC<ArenaLogoProps> = ({
  className,
  size = 72,
  subtitle = 'Sabo Pool Arena',
}) => {
  return (
    <div className={cn('flex flex-col items-center select-none', className)}>
      <div
        className={cn(
          'relative rounded-2xl overflow-hidden shadow-md ring-1 ring-primary/30 bg-gradient-to-br from-primary/80 via-primary/60 to-accent-blue/70 text-primary-foreground flex items-center justify-center font-bold tracking-wide',
          'after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_60%)]'
        )}
        className="size-dynamic" style={{ "--dynamic-size": size }}
        aria-label='Arena Logo'
      >
        <span className='text-title drop-shadow-sm'>AR</span>
      </div>
      <div className='mt-2 text-caption-medium text-muted-foreground'>
        {subtitle}
      </div>
    </div>
  );
};

export default ArenaLogo;
