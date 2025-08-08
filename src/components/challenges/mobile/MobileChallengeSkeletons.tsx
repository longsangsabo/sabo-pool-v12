import React from 'react';

export const MobileSkeletonCard = () => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
      </div>
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16" />
    </div>
    <div className="grid grid-cols-3 gap-2 mb-3">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded" />
    </div>
    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
  </div>
);

export const MobileSkeletonList = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <MobileSkeletonCard key={i} />
    ))}
  </div>
);

export const MobileSkeletonStats = () => (
  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 mb-6 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-24" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12" />
    </div>
    <div className="grid grid-cols-4 gap-2 mb-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-2">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      ))}
    </div>
    <div className="space-y-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-slate-100 dark:bg-slate-800/50 rounded-md p-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="flex-1">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-1" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            </div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-12" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default { MobileSkeletonCard, MobileSkeletonList, MobileSkeletonStats };
