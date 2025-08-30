import React from 'react';
import MilestoneCard, { MilestoneData } from './MilestoneCard';
import { MilestoneCategory } from './MilestoneCategoryTabs';
import { cn } from '@/lib/utils';

interface Props {
  milestones: MilestoneData[];
  category: MilestoneCategory;
  loading?: boolean;
}

export const MilestoneList: React.FC<Props> = ({ milestones, category, loading }) => {
  if (loading) return <p className='text-body-small text-muted-foreground'>Loading milestones...</p>;
  const filtered = milestones.filter(m => m.category === category);
  if (!filtered.length) return <p className='text-body-small text-muted-foreground'>No milestones in this category.</p>;
  return (
    <div className={cn('grid gap-4', 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')}>      
      {filtered.map(m => <MilestoneCard key={m.id} data={m} />)}
    </div>
  );
};

export default MilestoneList;
