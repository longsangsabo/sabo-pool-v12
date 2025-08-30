import React from 'react';
import { cn } from '@/lib/utils';

interface ScrollableTableProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

export const ScrollableTable: React.FC<ScrollableTableProps> = ({
  children,
  className,
  maxHeight = "400px"
}) => {
  return (
    <div className='overflow-x-auto'>
      <div 
        className={cn(
          'bg-neutral-800/30 backdrop-blur-sm border border-gray-600 rounded-xl overflow-hidden',
          className
        )}
      >
        <div 
          className="overflow-y-auto scrollbar-custom"
          style={{ maxHeight }}
        >
          <div className="min-w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ScrollableTableWithStickyHeaderProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
  stickyHeaderClassName?: string;
}

export const ScrollableTableWithStickyHeader: React.FC<ScrollableTableWithStickyHeaderProps> = ({
  children,
  className,
  maxHeight = "400px",
  stickyHeaderClassName = "bg-gradient-to-r from-gray-700/50 to-gray-800/50 backdrop-blur-sm sticky top-0 z-10"
}) => {
  return (
    <div className='overflow-x-auto'>
      <div 
        className={cn(
          'bg-neutral-800/30 backdrop-blur-sm border border-gray-600 rounded-xl overflow-hidden scrollbar-custom',
          className
        )}
        style={{ maxHeight }}
      >
        <div className="overflow-y-auto h-full scrollbar-custom">
          <table className='min-w-full'>
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child) && child.type === 'thead') {
                return React.cloneElement(child, {
                  className: cn(child.props.className, stickyHeaderClassName)
                });
              }
              return child;
            })}
          </table>
        </div>
      </div>
    </div>
  );
};

export default ScrollableTable;
