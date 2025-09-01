import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { getRecentMilestoneAwards } from '../../services/milestoneService';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Star, Target, Calendar } from 'lucide-react';

interface AwardRow {
 milestone_id: string | undefined;
 milestone_name: string | undefined;
 badge_icon: string | undefined;
 badge_color: string | undefined;
 event_type: string | undefined;
 spa_points_awarded: number | null;
 occurrence: number | null;
 status: string | undefined;
 awarded_at: string;
}

async function fetchRecentAwards(): Promise<AwardRow[]> {
 const { data, error } = await getRecentMilestoneAwards(10);
 if (error) throw new Error(error);
 return (data as AwardRow[]) || [];
}

export const RecentMilestoneAwards: React.FC<{ compact?: boolean }> = ({ compact }) => {
 const { data, isLoading, isError, error } = useQuery({ queryKey: ['recent_milestone_awards'], queryFn: fetchRecentAwards, staleTime: 60_000 });

 return (
  <Card className={compact ? 'h-full' : ''}>
   <CardHeader className='pb-2'>
    <CardTitle className='text-body-small-medium flex items-center gap-2'>
     🏅 Thành tựu gần đây
    </CardTitle>
   </CardHeader>
   <CardContent className='pt-0'>
    {isLoading && <div className='text-caption text-muted-foreground'>Đang tải...</div>}
    {isError && <div className='text-caption text-error-500'>Lỗi: {(error as any)?.message}</div>}
    {!isLoading && !isError && (!data || data.length === 0) && (
     <div className='text-caption text-muted-foreground'>Chưa có thành tựu nào</div>
    )}
    <ul className='space-y-2 max-h-64 overflow-auto pr-1'>
     {data?.map((aw) => {
      const badgeColor = aw.badge_color || 'var(--color-primary-500)';
      const icon = aw.badge_icon || '🎯';
      return (
       <li key={aw.awarded_at + (aw.milestone_id || '')} className='flex items-start gap-2 text-caption border-b last:border-b-0 pb-1'>
        <div 
         className='w-6 h-6 flex items-center justify-center rounded-md text-base' 
         style={{ backgroundColor: `${badgeColor}22`, color: badgeColor }}
        >
         {icon}
        </div>
        <div className='flex-1 leading-tight'>
         <div className='font-medium text-[13px]'>{aw.milestone_name || aw.event_type}</div>
         <div className='text-[11px] text-muted-foreground'>+{aw.spa_points_awarded || 0} SPA • {new Date(aw.awarded_at).toLocaleString()}</div>
        </div>
        {aw.status === 'error' && <span className='text-[10px] text-error-500'>ERR</span>}
       </li>
      );
     })}
    </ul>
   </CardContent>
  </Card>
 );
};

export default RecentMilestoneAwards;
