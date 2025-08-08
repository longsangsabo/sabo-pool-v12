import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MobileSectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  className?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const MobileSectionHeader: React.FC<MobileSectionHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary',
  className,
  children,
  size = 'md',
}) => {
  const headerSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  const subtitleSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div className='flex-1'>
        <div className='flex items-center gap-2'>
          {Icon && <Icon className={cn(iconSizes[size], iconColor)} />}
          <h2 className={cn(headerSizes[size], 'font-bold text-foreground')}>
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className={cn(subtitleSizes[size], 'text-muted-foreground mt-1')}>
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className='flex-shrink-0 ml-4'>{children}</div>}
    </div>
  );
};

export default MobileSectionHeader;
