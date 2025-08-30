import React from 'react';
import { Typography } from '@/packages/shared-ui';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ClubEmptyStateProps {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const ClubEmptyState: React.FC<ClubEmptyStateProps> = ({
  icon: Icon,
  title = 'Chưa có dữ liệu',
  description = 'Hiện chưa có nội dung để hiển thị.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center text-center py-10 px-4 rounded-lg border border-dashed bg-muted/30 dark:bg-slate-800/40',
        className
      )}
    >
      {Icon && (
        <div className='w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600'>
          <Icon className='w-6 h-6 text-blue-500' />
        </div>
      )}
      <Typography variant="heading" size="lg">{title}</Typography>
      <p className='text-caption text-muted-foreground mb-4 max-w-xs leading-relaxed'>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          size='sm'
          variant='outline'
          onClick={onAction}
          className='text-xs'
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default ClubEmptyState;
