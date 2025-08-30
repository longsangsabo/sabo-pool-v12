import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Milestone {
  milestone_id: string;
  milestone_name: string;
  milestone_type: string;
  description: string;
  icon: string;
  requirement_value: number;
  current_progress: number;
  spa_reward: number;
  is_completed: boolean;
  is_repeatable: boolean;
  completed_at?: string;
}

export interface MilestoneStats {
  total_milestones: number;
  completed_milestones: number;
  total_spa_earned: number;
  completion_rate: number;
}

export function useMilestones() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user milestones
  const milestonesQuery = useQuery({
    queryKey: ['user-milestones', user?.id],
    queryFn: async (): Promise<Milestone[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase.rpc(
        'get_user_milestone_progress',
        {
          p_user_id: user.id,
        }
      );

      if (error) {
        console.error('Error fetching milestones:', error);
        toast.error('Không thể tải milestones');
        return [];
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  // Award milestone mutation
  const awardMilestoneMutation = useMutation({
    mutationFn: async ({
      milestoneType,
      progressIncrement = 1,
      referenceId,
      referenceType,
    }: {
      milestoneType: string;
      progressIncrement?: number;
      referenceId?: string;
      referenceType?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('award_spa_milestone', {
        p_user_id: user.id,
        p_milestone_type: milestoneType,
        p_progress_increment: progressIncrement,
        p_reference_id: referenceId || null,
        p_reference_type: referenceType || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.success) {
        // Invalidate milestones to refetch updated data
        queryClient.invalidateQueries({ queryKey: ['user-milestones'] });
        
        // Also invalidate SPA points query if it exists
        queryClient.invalidateQueries({ queryKey: ['user-spa-points'] });
        
        if (data.milestones_completed > 0) {
          toast.success(
            `🎉 Milestone hoàn thành! Bạn nhận được ${data.spa_earned} SPA!`,
            {
              description: data.milestone_name,
              duration: 5000,
            }
          );
        }
      }
    },
    onError: (error) => {
      console.error('Error awarding milestone:', error);
      toast.error('Có lỗi khi cập nhật milestone');
    },
  });

  // Award daily login milestone
  const awardDailyLoginMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('award_daily_login_milestone', {
        p_user_id: user.id,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.success) {
        queryClient.invalidateQueries({ queryKey: ['user-milestones'] });
        queryClient.invalidateQueries({ queryKey: ['user-spa-points'] });
        
        if (data.milestones_completed > 0) {
          toast.success(`🌅 Điểm danh hàng ngày! +${data.spa_earned} SPA`);
        }
      }
    },
  });

  // Award SPA bonus
  const awardSpaBonusMutation = useMutation({
    mutationFn: async ({
      amount,
      bonusType,
      description,
      referenceId,
      referenceType,
    }: {
      amount: number;
      bonusType: string;
      description: string;
      referenceId?: string;
      referenceType?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('award_spa_bonus', {
        p_user_id: user.id,
        p_amount: amount,
        p_bonus_type: bonusType,
        p_description: description,
        p_reference_id: referenceId || null,
        p_reference_type: referenceType || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.success) {
        queryClient.invalidateQueries({ queryKey: ['user-milestones'] });
        queryClient.invalidateQueries({ queryKey: ['user-spa-points'] });
        
        toast.success(
          `💰 Nhận thưởng SPA! +${data.spa_awarded} SPA`,
          {
            description: data.description,
          }
        );
      }
    },
  });

  // Calculate stats from milestones
  const stats: MilestoneStats = React.useMemo(() => {
    const milestones = milestonesQuery.data || [];
    const total = milestones.length;
    const completed = milestones.filter((m) => m.is_completed).length;
    const totalSpaEarned = milestones
      .filter((m) => m.is_completed)
      .reduce((sum, m) => sum + m.spa_reward, 0);

    return {
      total_milestones: total,
      completed_milestones: completed,
      total_spa_earned: totalSpaEarned,
      completion_rate: total > 0 ? (completed / total) * 100 : 0,
    };
  }, [milestonesQuery.data]);

  return {
    // Data
    milestones: milestonesQuery.data || [],
    stats,
    
    // Loading states
    isLoading: milestonesQuery.isLoading,
    isFetching: milestonesQuery.isFetching,
    
    // Mutations
    awardMilestone: awardMilestoneMutation.mutate,
    awardDailyLogin: awardDailyLoginMutation.mutate,
    awardSpaBonus: awardSpaBonusMutation.mutate,
    
    // Mutation states
    isAwarding: 
      awardMilestoneMutation.isPending ||
      awardDailyLoginMutation.isPending ||
      awardSpaBonusMutation.isPending,
    
    // Refetch
    refetch: milestonesQuery.refetch,
  };
}
