import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'card' | 'tournament' | 'player';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  lines = 1,
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-gray-200 rounded';
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-wave',
    none: ''
  };

  const variantClasses = {
    text: 'h-4',
    rectangular: 'h-12',
    circular: 'rounded-full w-12 h-12',
    card: 'h-48 w-full',
    tournament: 'h-32 w-full rounded-lg',
    player: 'h-16 w-full rounded-lg'
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className={clsx('space-y-2', className)}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={clsx(
              baseClasses,
              variantClasses[variant],
              animationClasses[animation],
              index === lines - 1 && 'w-3/4' // Last line shorter
            )}
            style={style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
    />
  );
};

// Predefined skeleton components for common use cases
export const TournamentCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
    <Skeleton variant="tournament" />
    <div className="space-y-2">
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" lines={2} />
    </div>
    <div className="flex justify-between items-center">
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="rectangular" width={80} height={32} />
    </div>
  </div>
);

export const PlayerCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center space-x-4">
    <Skeleton variant="circular" />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="60%" />
    </div>
    <Skeleton variant="rectangular" width={60} height={24} />
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="space-y-2">
      <Skeleton variant="text" width="30%" height={32} />
      <Skeleton variant="text" lines={2} />
    </div>
    
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <Skeleton variant="rectangular" height={60} />
          <Skeleton variant="text" />
          <Skeleton variant="text" width="70%" />
        </div>
      ))}
    </div>
    
    {/* Tournament List */}
    <div className="space-y-4">
      <Skeleton variant="text" width="25%" height={24} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }, (_, index) => (
          <TournamentCardSkeleton key={index} />
        ))}
      </div>
    </div>
  </div>
);
