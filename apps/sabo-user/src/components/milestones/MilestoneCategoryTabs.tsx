import React from 'react';
import { cn } from '@/lib/utils';

export type MilestoneCategory = 'progress' | 'achievement' | 'social' | 'repeatable';

const LABELS: Record<MilestoneCategory,string> = {
 progress: 'Progress',
 achievement: 'Achievement',
 social: 'Social',
 repeatable: 'Repeatable',
};

interface Props {
 value: MilestoneCategory;
 onChange: (cat: MilestoneCategory) => void;
 counts?: Partial<Record<MilestoneCategory, number>>;
 className?: string;
}

export const MilestoneCategoryTabs: React.FC<Props> = ({ value, onChange, counts = {}, className }) => {
 const tabs: MilestoneCategory[] = ['progress','achievement','social','repeatable'];
 return (
  <div className={cn('inline-flex rounded-lg border bg-background p-1 text-sm', className)}>
   {tabs.map(tab => {
    const active = tab === value;
    return (
     <Button
      key={tab}
      onClick={() => onChange(tab)}
      className={cn('px-3 py-1.5 rounded-md transition-colors flex items-center gap-1',
       active ? 'bg-primary text-primary-foreground shadow' : 'hover:bg-muted')}>
      <span>{LABELS[tab]}</span>
      {typeof counts[tab] === 'number' && (
       <span className={cn('text-[10px] rounded px-1.5 py-0.5 bg-muted-foreground/10', active && 'bg-primary-foreground/20')}>{counts[tab]}</span>
      )}
     </Button>
    );
   })}
  </div>
 );
};

export default MilestoneCategoryTabs;
