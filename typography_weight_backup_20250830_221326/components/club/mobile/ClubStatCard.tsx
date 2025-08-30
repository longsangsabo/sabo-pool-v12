import React from 'react';
import { cn } from '@/lib/utils';

interface ClubStatCardProps {
  label: string;
  value: number | string;
  icon?: React.ElementType;
  accentClass?: string; // text color for icon
  className?: string;
}

export const ClubStatCard: React.FC<ClubStatCardProps> = ({
  label,
  value,
  icon: Icon,
  accentClass = 'text-blue-500',
  className = '',
}) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-3 flex items-center gap-3 transition-colors bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-900/70',
        className
      )}
    >
      <div className='w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 shadow-inner'>
        {Icon && <Icon className={`w-5 h-5 ${accentClass}`} />}
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-[11px] font-medium text-muted-foreground uppercase tracking-wide'>
          {label}
        </p>
        <p className='text-body-large font-semibold'>{value}</p>
      </div>
    </div>
  );
};

export default ClubStatCard;
