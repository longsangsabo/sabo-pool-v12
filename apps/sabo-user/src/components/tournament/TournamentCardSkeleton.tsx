import React from 'react';
import { Card } from '@/components/ui/card';

interface TournamentCardSkeletonProps {
  isMobile?: boolean;
  variant?: 'card' | 'mobile';
}

const TournamentCardSkeleton: React.FC<TournamentCardSkeletonProps> = ({
  isMobile = false,
  variant = 'card',
}) => {
  if (variant === 'mobile') {
    return (
      <Card className='overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-md border-l-4 border-l-gray-300'>
        <div className='p-4 pb-3 space-y-3'>
          {/* Header */}
          <div className='flex items-start justify-between'>
            <div className='flex-1 mr-3 space-y-2'>
              <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
              <div className='h-3 bg-gray-150 dark:bg-gray-650 rounded animate-pulse w-3/4' />
            </div>
            <div className='w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
          </div>

          {/* Quick Info Grid */}
          <div className='grid grid-cols-2 gap-2'>
            <div className='flex items-center gap-1'>
              <div className='w-3 h-3 bg-gray-300 rounded animate-pulse' />
              <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1' />
            </div>
            <div className='flex items-center gap-1'>
              <div className='w-3 h-3 bg-gray-300 rounded animate-pulse' />
              <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1' />
            </div>
          </div>

          {/* Progress */}
          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20' />
              <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12' />
            </div>
            <div className='h-1.5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
          </div>

          {/* Action Buttons */}
          <div className='flex gap-2'>
            <div className='flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
            <div className='w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
            <div className='flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`
      overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-lg
      ${isMobile ? 'min-h-[320px]' : 'min-h-[400px]'}
    `}
    >
      {/* Hero Section Skeleton */}
      <div
        className={`
        ${isMobile ? 'h-32' : 'h-40'} 
        bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 
        animate-pulse relative
      `}
      >
        {/* Badges */}
        <div className='absolute top-3 left-3 flex gap-2'>
          <div className='w-16 h-6 bg-white/20 rounded animate-pulse' />
        </div>
        <div className='absolute top-3 right-3'>
          <div className='w-20 h-6 bg-white/20 rounded animate-pulse' />
        </div>

        {/* Title overlay */}
        <div className='absolute bottom-0 left-0 right-0 p-4 space-y-2'>
          <div className='h-5 bg-white/20 rounded animate-pulse' />
          <div className='h-3 bg-white/15 rounded animate-pulse w-3/4' />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className={`p-4 space-y-4 ${isMobile ? 'p-3 space-y-3' : ''}`}>
        {/* Details Grid */}
        <div className='grid grid-cols-2 gap-3'>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className='flex items-center gap-2'>
              <div className='w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse' />
              <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1' />
            </div>
          ))}
        </div>

        {/* Participants Progress */}
        <div className='space-y-2'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse' />
              <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24' />
            </div>
            <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16' />
          </div>
          <div className='h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
        </div>

        {/* Prize Info */}
        <div className='p-3 bg-gray-100 dark:bg-gray-800 rounded-lg'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse' />
              <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20' />
            </div>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16' />
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex gap-2 pt-2 ${isMobile ? 'flex-col' : ''}`}>
          <div
            className={`
            ${isMobile ? 'h-10' : 'h-10'} 
            bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1
          `}
          />
          <div
            className={`
            ${isMobile ? 'h-10' : 'h-10'} 
            bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1
          `}
          />
        </div>

        {/* Footer */}
        <div className='pt-2 border-t border-gray-200 dark:border-gray-700'>
          <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3' />
        </div>
      </div>
    </Card>
  );
};

export default TournamentCardSkeleton;
