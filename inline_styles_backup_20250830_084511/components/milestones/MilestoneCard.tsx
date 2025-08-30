import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MilestoneData {
  id: string;
  name: string;
  description: string | undefined;
  category: string;
  milestone_type: string;
  requirement_value: number;
  spa_reward: number;
  badge_name?: string | undefined;
  badge_icon?: string | undefined;
  badge_color?: string | undefined;
  is_repeatable: boolean;
  daily_limit?: number | null;
  progress?: number; // current progress value
  completed?: boolean;
}

export interface MilestoneCardProps { data: MilestoneData; }
export const MilestoneCard: React.FC<MilestoneCardProps> = ({ data }) => {
  const pct = Math.min(100, Math.round(((data.progress || 0) / data.requirement_value) * 100));
  return (
    <Card className={cn('relative overflow-hidden group', data.completed && 'ring-1 ring-green-500/40')}>      
      {data.completed && (
        <div className='absolute top-2 right-2 text-success-600 flex items-center gap-1 text-xs font-medium'>
          <CheckCircle2 className='h-4 w-4' /> Done
        </div>
      )}
      <CardContent className='p-4 space-y-3'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <h3 className='font-semibold leading-tight'>{data.name}</h3>
            <p className='text-xs text-muted-foreground line-clamp-2'>{data.description}</p>
          </div>
          <div className='text-right text-xs shrink-0'>
            <div className='font-medium'>{data.spa_reward} SPA</div>
            {data.is_repeatable && <div className='text-[10px] text-amber-600'>Repeatable</div>}
          </div>
        </div>
        <div>
          <Progress value={pct} className='h-2' />
          <p className='mt-1 text-[11px] text-muted-foreground'>{data.progress || 0}/{data.requirement_value}</p>
        </div>
        {data.badge_name && (
          <div className='flex items-center gap-1 text-[10px] mt-1'>
            <span className='px-1.5 py-0.5 rounded bg-muted'>{data.badge_name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MilestoneCard;
