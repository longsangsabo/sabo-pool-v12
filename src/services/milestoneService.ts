// Milestone business logic service (Phase 2 - initial)
import { supabase } from '@/integrations/supabase/client';
import { spaService } from '@/services/spaService';

export interface Milestone {
  id: string;
  name: string;
  description: string | null;
  category: 'progress' | 'achievement' | 'social' | 'repeatable';
  milestone_type: string;
  requirement_value: number;
  spa_reward: number;
  badge_name?: string | null;
  badge_icon?: string | null;
  badge_color: string;
  is_repeatable: boolean;
  daily_limit?: number | null;
  is_active: boolean;
  sort_order: number;
}

export interface PlayerMilestone {
  id: string;
  player_id: string;
  milestone_id: string;
  current_progress: number;
  is_completed: boolean;
  completed_at?: string | null;
  times_completed: number;
  last_daily_completion?: string | null;
  milestone?: Milestone;
}

class MilestoneService {
  async getMilestonesByCategory(category: Milestone['category']): Promise<Milestone[]> {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('sort_order');
    if (error) throw error;
    return data as Milestone[];
  }

  async getPlayerMilestoneProgress(playerId: string): Promise<PlayerMilestone[]> {
    const { data, error } = await supabase
      .from('player_milestones')
      .select('*, milestone:milestones(*)')
      .eq('player_id', playerId);
    if (error) throw error;
    return (data || []) as unknown as PlayerMilestone[];
  }

  async initializePlayerMilestones(playerId: string): Promise<void> {
    const { data: milestones, error } = await supabase
      .from('milestones')
      .select('id')
      .eq('is_active', true);
    if (error) throw error;
    if (!milestones) return;
    for (const m of milestones) {
      await supabase
        .from('player_milestones')
        .upsert({ player_id: playerId, milestone_id: m.id }, { onConflict: 'player_id,milestone_id' });
    }
  }

  async updatePlayerProgress(playerId: string, milestoneType: string, increment: number): Promise<void> {
    if (increment <= 0) return;
    const { data: milestone } = await supabase
      .from('milestones')
      .select('*')
      .eq('milestone_type', milestoneType)
      .eq('is_active', true)
      .order('requirement_value')
      .limit(1)
      .single();
    if (!milestone) return;

    await supabase
      .from('player_milestones')
      .upsert({ player_id: playerId, milestone_id: milestone.id }, { onConflict: 'player_id,milestone_id' });

    const { data: progressRow } = await supabase
      .from('player_milestones')
      .select('*')
      .eq('player_id', playerId)
      .eq('milestone_id', milestone.id)
      .single();

    const newProgress = (progressRow?.current_progress || 0) + increment;
    let isCompleted = progressRow?.is_completed || false;
    let timesCompleted = progressRow?.times_completed || 0;
    let completedAt = progressRow?.completed_at || null;

    if (!isCompleted && newProgress >= milestone.requirement_value) {
      isCompleted = true;
      completedAt = new Date().toISOString();
      timesCompleted = (timesCompleted || 0) + 1;
      if (milestone.spa_reward > 0) {
        await spaService.addSPAPoints(
          playerId,
          milestone.spa_reward,
          'milestone_award',
          milestone.milestone_type,
          milestone.id
        );
        await supabase.rpc('create_challenge_notification', {
          p_type: 'milestone_completed',
          p_user_id: playerId,
          p_title: '🏆 Hoàn thành milestone!',
          p_message: `🎉 ${milestone.name} - Nhận ${milestone.spa_reward} SPA!`,
          p_icon: 'trophy',
          p_priority: 'high',
          p_action_text: 'Xem thưởng',
          p_action_url: '/milestones',
          p_metadata: JSON.stringify({ 
            milestone_id: milestone.id, 
            milestone_type: milestone.milestone_type,
            spa_reward: milestone.spa_reward,
            badge_name: milestone.badge_name || 'Achievement',
            celebration: true
          })
        });
      }
    }

    await supabase
      .from('player_milestones')
      .update({
        current_progress: newProgress,
        is_completed: isCompleted,
        completed_at: completedAt,
        times_completed: timesCompleted,
        last_progress_update: new Date().toISOString()
      })
      .eq('player_id', playerId)
      .eq('milestone_id', milestone.id);
  }

  async checkAndAwardMilestone(playerId: string, milestoneType: string, currentValue: number): Promise<boolean> {
    const { data: milestone } = await supabase
      .from('milestones')
      .select('*')
      .eq('milestone_type', milestoneType)
      .eq('is_active', true)
      .order('requirement_value')
      .limit(1)
      .single();
    if (!milestone) return false;

    await supabase
      .from('player_milestones')
      .upsert({ player_id: playerId, milestone_id: milestone.id }, { onConflict: 'player_id,milestone_id' });

    const { data: progressRow } = await supabase
      .from('player_milestones')
      .select('*')
      .eq('player_id', playerId)
      .eq('milestone_id', milestone.id)
      .single();

    if (progressRow?.is_completed) return false;
    if (currentValue < milestone.requirement_value) return false;

    await supabase
      .from('player_milestones')
      .update({
        current_progress: milestone.requirement_value,
        is_completed: true,
        completed_at: new Date().toISOString(),
        times_completed: (progressRow?.times_completed || 0) + 1
      })
      .eq('player_id', playerId)
      .eq('milestone_id', milestone.id);

    if (milestone.spa_reward > 0) {
      await spaService.addSPAPoints(playerId, milestone.spa_reward, 'milestone_award', milestone.milestone_type, milestone.id);
    }
    return true;
  }

  async processDailyCheckin(playerId: string): Promise<{ success: boolean; rewards: number }> {
    const today = new Date().toISOString().slice(0, 10);
    const { data: dailyRow, error } = await supabase
      .from('player_daily_progress')
      .select('*')
      .eq('player_id', playerId)
      .eq('date', today)
      .single();
    if (error && (error as any).code !== 'PGRST116') {
      return { success: false, rewards: 0 };
    }
    if (dailyRow?.daily_checkin) return { success: false, rewards: 0 };

    await supabase
      .from('player_daily_progress')
      .upsert({ player_id: playerId, date: today, daily_checkin: true }, { onConflict: 'player_id,date' });

    await this.updateLoginStreak(playerId);
    await this.updatePlayerProgress(playerId, 'daily_checkin', 1);
    await this.updatePlayerProgress(playerId, 'weekly_checkin', 1);
    return { success: true, rewards: 0 };
  }

  async getPlayerDailyProgress(playerId: string) {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from('player_daily_progress')
      .select('*')
      .eq('player_id', playerId)
      .eq('date', today)
      .single();
    return data;
  }

  async updateLoginStreak(playerId: string): Promise<void> {
    const today = new Date();
    const todayDate = today.toISOString().slice(0, 10);
    const { data: streak } = await supabase
      .from('player_login_streaks')
      .select('*')
      .eq('player_id', playerId)
      .single();

    if (!streak) {
      await supabase.from('player_login_streaks').insert({
        player_id: playerId,
        current_streak: 1,
        longest_streak: 1,
        last_login_date: todayDate,
        weekly_logins: 1,
        week_start_date: todayDate
      });
      await this.checkAndAwardMilestone(playerId, 'login_streak', 1);
      return;
    }

    let currentStreak = streak.current_streak || 0;
    const lastDate = streak.last_login_date ? new Date(streak.last_login_date) : null;
    const diffDays = lastDate ? Math.floor((today.getTime() - lastDate.getTime()) / 86400000) : null;
    if (diffDays === 1) currentStreak += 1;
    else if (diffDays && diffDays > 1) currentStreak = 1; // reset if gap

    const longest = Math.max(currentStreak, streak.longest_streak || 0);
    const weeklyLogins = (streak.weekly_logins || 0) + (diffDays === 0 ? 0 : 1);

    await supabase
      .from('player_login_streaks')
      .update({
        current_streak: currentStreak,
        longest_streak: longest,
        last_login_date: todayDate,
        weekly_logins: weeklyLogins
      })
      .eq('player_id', playerId);

    await this.checkAndAwardMilestone(playerId, 'login_streak', currentStreak);
  }
}

export const milestoneService = new MilestoneService();
