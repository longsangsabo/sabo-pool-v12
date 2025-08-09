import React from 'react';

interface ProfileSummaryStatsProps {
  elo: number | null | undefined;
  spa: number | null | undefined;
  ranking: number | null | undefined;
  matches: number | null | undefined;
  theme: 'light' | 'dark';
}

export const ProfileSummaryStats: React.FC<ProfileSummaryStatsProps> = ({
  elo,
  spa,
  ranking,
  matches,
  theme,
}) => {
  const items = [
    { label: 'ELO', value: elo ?? '--' },
    { label: 'SPA', value: spa ?? '--' },
    { label: 'BXH', value: ranking ?? '--' },
    { label: 'Trận', value: matches ?? '--' },
  ];
  return (
    <div className='mt-2 flex items-center justify-center gap-4 text-center'>
      {items.map(i => (
        <div key={i.label} className='min-w-[48px]'>
          <div
            className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}
          >
            {i.value}
          </div>
          <div
            className={`text-[10px] tracking-wide uppercase font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
          >
            {i.label}
          </div>
        </div>
      ))}
    </div>
  );
};
