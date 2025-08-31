/**
 * 📂 CHALLENGE SYSTEM BUSINESS LOGIC
 * Centralized challenge creation, workflow management, and state handling
 * Extracted from scattered challenge components for better maintainability
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ===== TYPES =====
export interface Challenge {
  id: string;
  challenger_id: string;
  opponent_id?: string;
  club_id?: string;
  bet_points: number;
  race_to: number;
  handicap_1_rank?: number;
  handicap_05_rank?: number;
  status: 'pending' | 'accepted' | 'declined' | 'ongoing' | 'completed' | 'cancelled' | 'expired';
  message?: string;
  location?: string;
  required_rank?: string;
  scheduled_time?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  challenger_score?: number;
  opponent_score?: number;
  winner_id?: string;
  is_sabo?: boolean;
  is_open_challenge?: boolean;
  expires_at?: string;
  created_at: string;
  updated_at?: string;
  accepted_at?: string;
  completed_at?: string;
  
  // Profile data (populated via joins)
  challenger_profile?: ChallengeUserProfile;
  opponent_profile?: ChallengeUserProfile;
}

export interface ChallengeUserProfile {
  id?: string;
  user_id: string;
  full_name: string;
  display_name?: string;
  avatar_url?: string;
  current_rank?: string;
  elo_rating?: number;
  spa_points?: number;
  verified_rank?: string;
}

export interface CreateChallengeData {
  opponent_id?: string;
  bet_points: number;
  race_to: number;
  message?: string;
  location?: string;
  required_rank?: string;
  scheduled_time?: string;
  is_sabo?: boolean;
  is_open_challenge?: boolean;
  stake_amount?: number; // For SABO challenges
}

export interface ChallengeStats {
  totalChallenges: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  totalPointsWon: number;
  totalPointsLost: number;
  averageStake: number;
}

export interface ChallengeFilters {
  status?: string[];
  minBetPoints?: number;
  maxBetPoints?: number;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  isOpenOnly?: boolean;
  myOnly?: boolean;
}

// ===== RACE TO AND HANDICAP TABLES =====
export const RACE_TO_TABLE = {
  100: 3,
  200: 5,
  300: 7,
  400: 9,
  500: 11,
  600: 13,
} as const;

export const HANDICAP_TABLE = {
  // Simplified handicap system - can be expanded
  'S': 0,
  'A': 1,
  'B': 2,
  'C': 3,
  'D': 4,
  'K': 5,
} as const;

// ===== CHALLENGE BUSINESS LOGIC SERVICE =====
export class ChallengeService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * GET ALL CHALLENGES
   * Fetches challenges with profile data and filtering
   */
  async getChallenges(filters?: ChallengeFilters, userId?: string): Promise<Challenge[]> {
    try {
      let query = this.supabase
        .from('challenges')
        .select(`
          *,
          challenger_profile:profiles!challenges_challenger_id_fkey(
            id,
            user_id,
            full_name,
            display_name,
            avatar_url,
            current_rank,
            elo_rating,
            spa_points,
            verified_rank
          ),
          opponent_profile:profiles!challenges_opponent_id_fkey(
            id,
            user_id,
            full_name,
            display_name,
            avatar_url,
            current_rank,
            elo_rating,
            spa_points,
            verified_rank
          )
        `);

      // Apply filters
      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters?.minBetPoints) {
        query = query.gte('bet_points', filters.minBetPoints);
      }

      if (filters?.maxBetPoints) {
        query = query.lte('bet_points', filters.maxBetPoints);
      }

      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      if (filters?.isOpenOnly) {
        query = query.is('opponent_id', null);
      }

      if (filters?.myOnly && userId) {
        query = query.or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Challenge[];
    } catch (error) {
      console.error('Error getting challenges:', error);
      throw error;
    }
  }

  /**
   * CREATE CHALLENGE
   * Creates new challenge with validation and proper defaults
   */
  async createChallenge(challengeData: CreateChallengeData, challengerId: string): Promise<Challenge> {
    try {
      // Validate challenge data
      const validation = this.validateChallengeData(challengeData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Check user's current SPA points if needed
      if (challengeData.bet_points > 0) {
        const hasEnoughPoints = await this.checkUserPoints(challengerId, challengeData.bet_points);
        if (!hasEnoughPoints) {
          throw new Error('Không đủ SPA points để tạo thách đấu');
        }
      }

      // Set expiry time (48 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);

      // Determine if this is an open challenge
      const isOpenChallenge = !challengeData.opponent_id;

      // Create challenge object
      const newChallenge = {
        challenger_id: challengerId,
        opponent_id: challengeData.opponent_id || null,
        club_id: null, // Will be set based on location if needed
        bet_points: challengeData.bet_points,
        race_to: challengeData.race_to,
        handicap_1_rank: challengeData.stake_amount ? 
          this.calculateHandicap(challengeData.stake_amount) : 0,
        handicap_05_rank: 0, // Default for now
        message: challengeData.message?.trim() || null,
        location: challengeData.location?.trim() || null,
        required_rank: challengeData.required_rank || null,
        scheduled_time: challengeData.scheduled_time || null,
        is_sabo: challengeData.is_sabo || false,
        is_open_challenge: isOpenChallenge,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      };

      const { data, error } = await this.supabase
        .from('challenges')
        .insert([newChallenge])
        .select(`
          *,
          challenger_profile:profiles!challenges_challenger_id_fkey(
            id, user_id, full_name, display_name, avatar_url, current_rank, elo_rating, spa_points
          ),
          opponent_profile:profiles!challenges_opponent_id_fkey(
            id, user_id, full_name, display_name, avatar_url, current_rank, elo_rating, spa_points
          )
        `)
        .single();

      if (error) throw error;
      return data as Challenge;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  }

  /**
   * ACCEPT CHALLENGE
   * Handles both open and specific challenge acceptance
   */
  async acceptChallenge(challengeId: string, userId: string, scheduledTime?: string): Promise<Challenge> {
    try {
      // First fetch the challenge to validate
      const { data: challengeData, error: fetchError } = await this.supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .eq('status', 'pending')
        .single();

      if (fetchError) throw fetchError;
      if (!challengeData) throw new Error('Challenge not found or already processed');

      // Validate user can accept this challenge
      const isOpenChallenge = !challengeData.opponent_id;
      const isSpecificChallenge = challengeData.opponent_id === userId;

      if (!isOpenChallenge && !isSpecificChallenge) {
        throw new Error('You are not authorized to accept this challenge');
      }

      if (challengeData.challenger_id === userId) {
        throw new Error('You cannot accept your own challenge');
      }

      // Check if challenge has expired
      if (challengeData.expires_at && new Date(challengeData.expires_at) < new Date()) {
        throw new Error('This challenge has expired');
      }

      // For open challenges, use the database function
      if (isOpenChallenge) {
        const { data: result, error } = await this.supabase.rpc('accept_open_challenge', {
          p_challenge_id: challengeId,
          p_user_id: userId,
        });

        if (error) throw error;
        if (!result || !result.success) {
          throw new Error(result?.message || 'Failed to accept challenge');
        }
      } else {
        // For specific challenges, update directly
        const updateData: any = {
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        };

        if (scheduledTime) {
          updateData.scheduled_time = scheduledTime;
        }

        const { error: updateError } = await this.supabase
          .from('challenges')
          .update(updateData)
          .eq('id', challengeId);

        if (updateError) throw updateError;
      }

      // Fetch updated challenge
      const { data: updatedChallenge, error: refetchError } = await this.supabase
        .from('challenges')
        .select(`
          *,
          challenger_profile:profiles!challenges_challenger_id_fkey(
            id, user_id, full_name, display_name, avatar_url, current_rank, elo_rating, spa_points
          ),
          opponent_profile:profiles!challenges_opponent_id_fkey(
            id, user_id, full_name, display_name, avatar_url, current_rank, elo_rating, spa_points
          )
        `)
        .eq('id', challengeId)
        .single();

      if (refetchError) throw refetchError;
      return updatedChallenge as Challenge;
    } catch (error) {
      console.error('Error accepting challenge:', error);
      throw error;
    }
  }

  /**
   * DECLINE CHALLENGE
   * Declines a pending challenge
   */
  async declineChallenge(challengeId: string, userId: string, reason?: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('challenges')
        .update({
          status: 'declined',
          updated_at: new Date().toISOString(),
          ...(reason && { message: reason }),
        })
        .eq('id', challengeId)
        .eq('opponent_id', userId)
        .eq('status', 'pending');

      if (error) throw error;
    } catch (error) {
      console.error('Error declining challenge:', error);
      throw error;
    }
  }

  /**
   * CANCEL CHALLENGE
   * Cancels a challenge (challenger only)
   */
  async cancelChallenge(challengeId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('challenges')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', challengeId)
        .eq('challenger_id', userId)
        .in('status', ['pending', 'accepted']);

      if (error) throw error;
    } catch (error) {
      console.error('Error cancelling challenge:', error);
      throw error;
    }
  }

  /**
   * START CHALLENGE MATCH
   * Transitions accepted challenge to ongoing
   */
  async startChallenge(challengeId: string): Promise<Challenge> {
    try {
      const { data, error } = await this.supabase
        .from('challenges')
        .update({
          status: 'ongoing',
          actual_start_time: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', challengeId)
        .eq('status', 'accepted')
        .select(`
          *,
          challenger_profile:profiles!challenges_challenger_id_fkey(
            id, user_id, full_name, display_name, avatar_url, current_rank, elo_rating, spa_points
          ),
          opponent_profile:profiles!challenges_opponent_id_fkey(
            id, user_id, full_name, display_name, avatar_url, current_rank, elo_rating, spa_points
          )
        `)
        .single();

      if (error) throw error;
      return data as Challenge;
    } catch (error) {
      console.error('Error starting challenge:', error);
      throw error;
    }
  }

  /**
   * SUBMIT SCORE
   * Submits match score for ongoing challenge
   */
  async submitScore(
    challengeId: string, 
    challengerScore: number, 
    opponentScore: number,
    submitterId: string
  ): Promise<Challenge> {
    try {
      // Validate scores
      if (challengerScore < 0 || opponentScore < 0) {
        throw new Error('Scores cannot be negative');
      }

      const { data, error } = await this.supabase
        .from('challenges')
        .update({
          challenger_score: challengerScore,
          opponent_score: opponentScore,
          winner_id: challengerScore > opponentScore ? 
            (await this.supabase.from('challenges').select('challenger_id').eq('id', challengeId).single()).data?.challenger_id :
            (await this.supabase.from('challenges').select('opponent_id').eq('id', challengeId).single()).data?.opponent_id,
          status: 'completed',
          actual_end_time: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', challengeId)
        .eq('status', 'ongoing')
        .select(`
          *,
          challenger_profile:profiles!challenges_challenger_id_fkey(
            id, user_id, full_name, display_name, avatar_url, current_rank, elo_rating, spa_points
          ),
          opponent_profile:profiles!challenges_opponent_id_fkey(
            id, user_id, full_name, display_name, avatar_url, current_rank, elo_rating, spa_points
          )
        `)
        .single();

      if (error) throw error;
      
      // Update player points and rankings
      await this.updatePlayerStats(data);
      
      return data as Challenge;
    } catch (error) {
      console.error('Error submitting score:', error);
      throw error;
    }
  }

  /**
   * GET USER CHALLENGE STATS
   * Calculates comprehensive challenge statistics for user
   */
  async getUserChallengeStats(userId: string): Promise<ChallengeStats> {
    try {
      const { data: challenges, error } = await this.supabase
        .from('challenges')
        .select('*')
        .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
        .eq('status', 'completed');

      if (error) throw error;

      const completedChallenges = challenges || [];
      const wins = completedChallenges.filter(c => c.winner_id === userId);
      const losses = completedChallenges.filter(c => c.winner_id && c.winner_id !== userId);
      
      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;
      
      // Calculate streaks (most recent first)
      const sortedChallenges = [...completedChallenges].sort(
        (a, b) => new Date(b.completed_at || b.created_at).getTime() - 
                  new Date(a.completed_at || a.created_at).getTime()
      );

      for (const challenge of sortedChallenges) {
        if (challenge.winner_id === userId) {
          tempStreak++;
          bestStreak = Math.max(bestStreak, tempStreak);
        } else {
          if (currentStreak === 0) currentStreak = tempStreak;
          tempStreak = 0;
        }
      }

      if (currentStreak === 0) currentStreak = tempStreak;

      const totalPointsWon = wins.reduce((sum, c) => sum + c.bet_points, 0);
      const totalPointsLost = losses.reduce((sum, c) => sum + c.bet_points, 0);

      return {
        totalChallenges: completedChallenges.length,
        totalWins: wins.length,
        totalLosses: losses.length,
        winRate: completedChallenges.length > 0 ? (wins.length / completedChallenges.length) * 100 : 0,
        currentStreak,
        bestStreak,
        totalPointsWon,
        totalPointsLost,
        averageStake: completedChallenges.length > 0 ? 
          completedChallenges.reduce((sum, c) => sum + c.bet_points, 0) / completedChallenges.length : 0,
      };
    } catch (error) {
      console.error('Error getting user challenge stats:', error);
      throw error;
    }
  }

  /**
   * EXPIRE OLD CHALLENGES
   * Automatically expires challenges that have passed their expiry time
   */
  async expireOldChallenges(): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('challenges')
        .update({
          status: 'expired',
          updated_at: new Date().toISOString(),
        })
        .eq('status', 'pending')
        .lt('expires_at', new Date().toISOString())
        .select('id');

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Error expiring old challenges:', error);
      return 0;
    }
  }

  /**
   * SEARCH CHALLENGES
   * Search challenges by various criteria
   */
  async searchChallenges(query: string, filters?: ChallengeFilters): Promise<Challenge[]> {
    try {
      let queryBuilder = this.supabase
        .from('challenges')
        .select(`
          *,
          challenger_profile:profiles!challenges_challenger_id_fkey(
            id, user_id, full_name, display_name, avatar_url, current_rank, elo_rating, spa_points
          ),
          opponent_profile:profiles!challenges_opponent_id_fkey(
            id, user_id, full_name, display_name, avatar_url, current_rank, elo_rating, spa_points
          )
        `)
        .or(`message.ilike.%${query}%,location.ilike.%${query}%`);

      // Apply additional filters if provided
      if (filters) {
        if (filters.status && filters.status.length > 0) {
          queryBuilder = queryBuilder.in('status', filters.status);
        }
        // Add other filter logic...
      }

      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as Challenge[];
    } catch (error) {
      console.error('Error searching challenges:', error);
      throw error;
    }
  }

  // ===== HELPER METHODS =====

  /**
   * VALIDATE CHALLENGE DATA
   * Validates challenge creation data
   */
  private validateChallengeData(data: CreateChallengeData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate bet points
    if (data.bet_points < 100 || data.bet_points > 650) {
      errors.push('Bet points must be between 100 and 650');
    }

    // Validate race to
    if (data.race_to < 3 || data.race_to > 15) {
      errors.push('Race to must be between 3 and 15');
    }

    // Validate SABO challenges
    if (data.is_sabo) {
      const validStakes = [100, 200, 300, 400, 500, 600];
      if (data.stake_amount && !validStakes.includes(data.stake_amount)) {
        errors.push('Invalid SABO stake amount');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * CHECK USER POINTS
   * Verifies user has enough SPA points for challenge
   */
  private async checkUserPoints(userId: string, requiredPoints: number): Promise<boolean> {
    try {
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('spa_points')
        .eq('user_id', userId)
        .single();

      return (profile?.spa_points || 0) >= requiredPoints;
    } catch (error) {
      console.error('Error checking user points:', error);
      return false;
    }
  }

  /**
   * CALCULATE HANDICAP
   * Calculates handicap based on stake amount and ranks
   */
  private calculateHandicap(stakeAmount: number): number {
    // Simplified handicap calculation
    // In real implementation, this would consider both players' ranks
    return Math.floor(stakeAmount / 100);
  }

  /**
   * UPDATE PLAYER STATS
   * Updates player rankings and points after challenge completion
   */
  private async updatePlayerStats(challenge: Challenge): Promise<void> {
    try {
      if (!challenge.winner_id || !challenge.bet_points) return;

      const loserId = challenge.winner_id === challenge.challenger_id ? 
        challenge.opponent_id : challenge.challenger_id;

      if (!loserId) return;

      // Update winner's points
      await this.supabase.rpc('update_user_points', {
        p_user_id: challenge.winner_id,
        p_points_change: challenge.bet_points,
      });

      // Update loser's points
      await this.supabase.rpc('update_user_points', {
        p_user_id: loserId,
        p_points_change: -challenge.bet_points,
      });

      // Update player rankings if function exists
      const { error: rankingError } = await this.supabase.rpc('update_player_ranking', {
        p_winner_id: challenge.winner_id,
        p_loser_id: loserId,
        p_challenge_id: challenge.id,
      });

      if (rankingError) {
        console.error('❌ Error updating player ranking:', rankingError);
      }
    } catch (error) {
      console.error('Error updating player stats:', error);
      // Don't throw - challenge completion should succeed even if stats update fails
    }
  }
}
