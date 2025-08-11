import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MilestoneCategoryTabs, { MilestoneCategory } from '@/components/milestones/MilestoneCategoryTabs';
import MilestoneList from '@/components/milestones/MilestoneList';
import { MilestoneData } from '@/components/milestones/MilestoneCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { milestoneService } from '@/services/milestoneService';
import { RecentMilestoneAwards } from '@/components/milestones/RecentMilestoneAwards';
import { useUser } from '@/hooks/useUser';

export const MilestonePage: React.FC = () => {
  const [category, setCategory] = useState<MilestoneCategory>('progress');
  const { user } = useUser();

  const milestonesQuery = useQuery<MilestoneData[]>({
    queryKey: ['milestones-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        category: row.category,
        milestone_type: row.milestone_type,
        requirement_value: row.requirement_value,
        spa_reward: row.spa_reward,
        badge_name: row.badge_name,
        badge_icon: row.badge_icon,
        badge_color: row.badge_color,
        is_repeatable: row.is_repeatable,
        daily_limit: row.daily_limit,
      }));
    }
  });

  const progressQuery = useQuery({
    queryKey: ['milestone-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return {} as Record<string, { progress: number; completed: boolean }>;
      const progress = await milestoneService.getPlayerMilestoneProgress(user.id);
      const map: Record<string, { progress: number; completed: boolean }> = {};
      progress.forEach(p => { map[p.milestone_id] = { progress: p.current_value, completed: p.completed }; });
      return map;
    },
    enabled: !!user?.id,
  });

  const merged: MilestoneData[] = (milestonesQuery.data || []).map(m => ({
    ...m,
    progress: progressQuery.data?.[m.id]?.progress || 0,
    completed: progressQuery.data?.[m.id]?.completed || false,
  }));

  const counts = merged.reduce((acc, m) => { acc[m.category as MilestoneCategory] = (acc[m.category as MilestoneCategory]||0)+1; return acc; }, {} as Record<MilestoneCategory, number>);

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-lg'>Milestones</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-wrap items-center gap-4'>
          <MilestoneCategoryTabs value={category} onChange={setCategory} counts={counts} />
        </CardContent>
      </Card>
      <MilestoneList milestones={merged} category={category} loading={milestonesQuery.isLoading || progressQuery.isLoading} />
      <div>
        <RecentMilestoneAwards />
      </div>
    </div>
  );
};

export default MilestonePage;
