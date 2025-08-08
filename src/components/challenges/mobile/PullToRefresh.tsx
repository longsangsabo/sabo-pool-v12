import React from 'react';

export interface PullState {
  startY: number;
  currentY: number;
  isPulling: boolean;
  isRefreshing: boolean;
}

export const PullToRefreshIndicator = ({ state }: { state: PullState }) => {
  const { currentY, isRefreshing } = state;
  const progress = Math.min(currentY / 60, 1);
  const shouldShow = currentY > 10;

  if (!shouldShow && !isRefreshing) return null;

  return (
    <div
      className='fixed top-0 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-200'
      style={{
        transform: `translate(-50%, ${Math.max(-30, currentY - 50)}px)` ,
        opacity: Math.max(0.3, progress),
      }}
    >
      <div className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 shadow-lg flex items-center gap-2'>
        <div
          className={`w-4 h-4 border-2 border-slate-300 dark:border-slate-600 border-t-primary rounded-full ${
            isRefreshing || progress >= 1 ? 'animate-spin' : ''
          }`}
        />
        <span className='text-sm text-slate-600 dark:text-slate-400 font-medium'>
          {isRefreshing
            ? 'Đang làm mới...'
            : progress >= 1
            ? 'Thả để làm mới'
            : 'Kéo để làm mới'}
        </span>
      </div>
    </div>
  );
};
