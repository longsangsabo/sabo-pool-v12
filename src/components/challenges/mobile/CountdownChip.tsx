import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

export interface CountdownInfo {
  expired: boolean;
  urgent: boolean;
  text: string;
  color: string;
  bgColor?: string;
}

export const CountdownChip = ({
  info,
  size = 'sm',
}: {
  info: CountdownInfo;
  size?: 'sm' | 'md';
}) => {
  if (info.expired) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}
      >
        <AlertCircle
          className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} text-red-500`}
        />
        <span className='font-medium text-red-600 dark:text-red-400'>Hết hạn</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${
        info.bgColor || 'bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600'
      } ${size === 'sm' ? 'text-xs' : 'text-sm'} ${info.urgent ? 'animate-pulse' : ''}`}
    >
      <Clock
        className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} ${info.color}`}
      />
      <span className={`font-medium ${info.color}`}>{info.text}</span>
    </div>
  );
};
