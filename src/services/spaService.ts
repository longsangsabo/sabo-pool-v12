import { supabase } from '@/integrations/supabase/client';

export interface SPAMilestone {
  id: string;
  title: string;
  description?: string;
  target_value: number;
  reward_points: number;
  milestone_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserMilestoneProgress {
  id: string;
  user_id: string;
  milestone_id: string;
  current_progress: number;
  is_completed: boolean;
  completed_at?: string;
  reward_claimed: boolean;
  created_at: string;
  updated_at: string;
  milestone?: SPAMilestone;
}

export interface SPABonusActivity {
  id: string;
  activity_type: string;
  title: string;
  description?: string;
  bonus_points: number;
  is_active: boolean;
  max_claims_per_user: number;
  created_at: string;
  updated_at: string;
}

export interface SPATransaction {
  id: string;
  user_id: string;
  transaction_type: string;
  points_change: number;
  previous_balance: number;
  new_balance: number;
  description?: string;
  reference_id?: string;
  created_at: string;
}

class SPAService {
  async getMilestones(): Promise<SPAMilestone[]> {
    const { data, error } = await supabase
      .from('spa_milestones')
      .select('*')
      .eq('is_active', true)
      .order('target_value');

    if (error) {
      throw error;
    }

    return data || [];
  }

  async getUserMilestoneProgress(
    userId: string
  ): Promise<UserMilestoneProgress[]> {
    const { data, error } = await supabase
      .from('user_milestone_progress')
      .select(
        `
        *,
        milestone:spa_milestones(*)
        `
      )
      .eq('user_id', userId)
      .order('created_at');

    if (error) {
      throw error;
    }

    return data || [];
  }

  async getBonusActivities(): Promise<SPABonusActivity[]> {
    const { data, error } = await supabase
      .from('spa_bonus_activities')
      .select('*')
      .eq('is_active', true)
      .order('bonus_points', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  async getUserTransactions(
    userId: string,
    limit = 50
  ): Promise<SPATransaction[]> {
    const { data, error } = await supabase
      .from('spa_transaction_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  }

  async awardBonusActivity(
    userId: string,
    activityType: string,
    referenceData?: Record<string, unknown>
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('award_bonus_activity', {
        p_user_id: userId,
        p_activity_type: activityType,
        p_reference_data: referenceData || null,
      });

      if (error) {
        return false;
      }

      return data === true;
    } catch {
      return false;
    }
  }

  async checkMilestoneProgress(
    userId: string,
    milestoneType: string,
    currentValue: number
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('check_milestone_progress', {
        p_user_id: userId,
        p_milestone_type: milestoneType,
        p_current_value: currentValue,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  async updateSPAPoints(
    userId: string,
    pointsChange: number,
    transactionType: string,
    description?: string,
    referenceId?: string
  ): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('update_spa_points', {
        p_user_id: userId,
        p_points_change: pointsChange,
        p_transaction_type: transactionType,
        p_description: description || null,
        p_reference_id: referenceId || null,
      });

      if (error) {
        throw error;
      }

      return data || 0;
    } catch (error) {
      throw error;
    }
  }

  async getCurrentSPAPoints(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('player_rankings')
      .select('spa_points')
      .eq('user_id', userId)
      .single();

    if (error) {
      return 0;
    }

    return data?.spa_points || 0;
  }

  async getUnclaimedMilestones(userId: string): Promise<UserMilestoneProgress[]> {
    const { data, error } = await supabase
      .from('user_milestone_progress')
      .select(
        `
        *,
        milestone:spa_milestones(*)
        `
      )
      .eq('user_id', userId)
      .eq('is_completed', true)
      .eq('reward_claimed', false);

    if (error) {
      throw error;
    }

    return data || [];
  }

  async getSPALeaderboard(limit = 100): Promise<unknown[]> {
    const { data, error } = await supabase
      .from('player_rankings')
      .select(
        `
        user_id,
        spa_points,
        total_games,
        wins,
        profiles:user_id (
          display_name,
          avatar_url
        )
        `
      )
      .order('spa_points', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  }

  async triggerGameComplete(userId: string, won: boolean): Promise<void> {
    try {
      const { data: stats } = await supabase
        .from('player_rankings')
        .select('total_games, wins, spa_points')
        .eq('user_id', userId)
        .single();

      if (stats) {
        await this.checkMilestoneProgress(userId, 'games_played', stats.total_games);
        
        if (won) {
          await this.checkMilestoneProgress(userId, 'wins', stats.wins);
        }
        
        await this.checkMilestoneProgress(userId, 'spa_earned', stats.spa_points);
      }
    } catch {
      // Silently fail
    }
  }

  async triggerTournamentJoined(userId: string): Promise<void> {
    try {
      const { count } = await supabase
        .from('tournament_registrations')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      if (count !== null) {
        await this.checkMilestoneProgress(userId, 'tournaments_joined', count);
      }
    } catch {
      // Silently fail
    }
  }

  async handleNewUserRegistration(userId: string): Promise<void> {
    try {
      await this.awardBonusActivity(userId, 'new_user');
      
      await this.checkMilestoneProgress(userId, 'games_played', 0);
      await this.checkMilestoneProgress(userId, 'wins', 0);
      await this.checkMilestoneProgress(userId, 'spa_earned', 100);
      await this.checkMilestoneProgress(userId, 'tournaments_joined', 0);
    } catch {
      // Silently fail
    }
  }

  async handleRankRegistration(userId: string): Promise<void> {
    try {
      await this.awardBonusActivity(userId, 'rank_registration');
    } catch {
      // Silently fail
    }
  }

  async handleReferralSuccess(referrerId: string, newUserId: string): Promise<void> {
    try {
      await this.awardBonusActivity(referrerId, 'referral_success', {
        referred_user_id: newUserId,
      });
    } catch {
      // Silently fail
    }
  }
}

export const spaService = new SPAService();
