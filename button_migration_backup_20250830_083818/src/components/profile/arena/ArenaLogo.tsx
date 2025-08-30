import React from 'react';
import { cn } from '@/lib/utils';

/**
 * ArenaLogo (restored)
 * Lightweight decorative logo component kept after profile cleanup.
 * If later you revive the arena profile variant, you can extend this with
 * animated gradients or dynamic data.
 */
export interface ArenaLogoProps {
  className?: string;
  size?: number; // pixel size (width/height square)
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
        style={{ width: size, height: size }}
        aria-label='Arena Logo'
      >
        <span className='text-xl drop-shadow-sm'>AR</span>
      </div>
      <div className='mt-2 text-xs font-medium text-muted-foreground'>
        {subtitle}
      </div>
    </div>
  );
};

export default ArenaLogo;
