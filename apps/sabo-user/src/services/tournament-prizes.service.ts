/**
 * Tournament Prizes Management Service
 * Handles CRUD operations for tournament_prizes table
 */

// Removed supabase import - migrated to services
import { calculateRewards } from '@sabo/shared-utils';
import type { RankCode } from '@sabo/shared-utils';

// Types for tournament prizes
export interface TournamentPrize {
  id: string;
  tournament_id: string;
  prize_position: number;
  position_name: string;
  position_description?: string;
  cash_amount: number;
  cash_currency: string;
  elo_points: number;
  spa_points: number;
  physical_items: string[]; // JSON array as TypeScript array
  is_visible: boolean;
  is_guaranteed: boolean;
  special_conditions?: string;
  display_order?: number;
  color_theme?: string;
  icon_name?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CreateTournamentPrizeInput {
  tournament_id: string;
  prize_position: number;
  position_name: string;
  position_description?: string;
  cash_amount?: number;
  cash_currency?: string;
  elo_points?: number;
  spa_points?: number;
  physical_items?: string[];
  is_visible?: boolean;
  is_guaranteed?: boolean;
  special_conditions?: string;
  display_order?: number;
  color_theme?: string;
  icon_name?: string;
}

export interface TournamentPrizeWithDetails extends TournamentPrize {
  tournament_name: string;
  tournament_type: string;
  game_format: string;
  tournament_prize_pool: number;
  max_participants: number;
  tournament_status: string;
  prize_percentage: number;
}

export class TournamentPrizesService {
  /**
   * Get all prizes for a tournament
   */
  static async getTournamentPrizes(tournamentId: string): Promise<TournamentPrize[]> {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('tournament_prizes')
      .select('*')
      .getByTournamentId(tournamentId)
      .eq('is_visible', true)
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('prize_position', { ascending: true });

    if (error) {
      console.error('Error fetching tournament prizes:', error);
      throw new Error(`Failed to fetch tournament prizes: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get tournament prizes with tournament details using the view
   */
  static async getTournamentPrizesWithDetails(
    tournamentId: string
  ): Promise<TournamentPrizeWithDetails[]> {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('tournament_prizes_with_details')
      .select('*')
      .getByTournamentId(tournamentId)
      .eq('is_visible', true)
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('prize_position', { ascending: true });

    if (error) {
      console.error('Error fetching tournament prizes with details:', error);
      throw new Error(`Failed to fetch tournament prizes: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create a new prize for tournament
   */
  static async createTournamentPrize(
    prizeData: CreateTournamentPrizeInput
  ): Promise<TournamentPrize> {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('tournament_prizes')
      .create({
        ...prizeData,
        physical_items: prizeData.physical_items || [],
        cash_currency: prizeData.cash_currency || 'VND',
        cash_amount: prizeData.cash_amount || 0,
        elo_points: prizeData.elo_points || 0,
        spa_points: prizeData.spa_points || 0,
        is_visible: prizeData.is_visible ?? true,
        is_guaranteed: prizeData.is_guaranteed ?? true,
      })
      .getAll()
      .single();

    if (error) {
      console.error('Error creating tournament prize:', error);
      throw new Error(`Failed to create tournament prize: ${error.message}`);
    }

    return data;
  }

  /**
   * Update tournament prize
   */
  static async updateTournamentPrize(
    prizeId: string,
    updates: Partial<CreateTournamentPrizeInput>
  ): Promise<TournamentPrize> {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('tournament_prizes')
      .update(updates)
      .eq('id', prizeId)
      .getAll()
      .single();

    if (error) {
      console.error('Error updating tournament prize:', error);
      throw new Error(`Failed to update tournament prize: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete tournament prize
   */
  static async deleteTournamentPrize(prizeId: string): Promise<void> {
    // TODO: Replace with service call - const { error } = await supabase
      .from('tournament_prizes')
      .delete()
      .eq('id', prizeId);

    if (error) {
      console.error('Error deleting tournament prize:', error);
      throw new Error(`Failed to delete tournament prize: ${error.message}`);
    }
  }

  /**
   * Bulk create prizes for a tournament (useful for templates)
   */
  static async createBulkTournamentPrizes(
    prizesData: CreateTournamentPrizeInput[]
  ): Promise<TournamentPrize[]> {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('tournament_prizes')
      .create(
        prizesData.map(prize => ({
          ...prize,
          physical_items: prize.physical_items || [],
          cash_currency: prize.cash_currency || 'VND',
          cash_amount: prize.cash_amount || 0,
          elo_points: prize.elo_points || 0,
          spa_points: prize.spa_points || 0,
          is_visible: prize.is_visible ?? true,
          is_guaranteed: prize.is_guaranteed ?? true,
        }))
      )
      .getAll();

    if (error) {
      console.error('Error creating bulk tournament prizes:', error);
      throw new Error(`Failed to create tournament prizes: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Calculate total prize pool for a tournament using the database function
   */
  static async calculateTournamentTotalPrizes(
    tournamentId: string
  ): Promise<number> {
    const { data, error } = await tournamentService.callRPC(
      'calculate_tournament_total_prizes',
      {
        p_tournament_id: tournamentId,
      }
    );

    if (error) {
      console.error('Error calculating total prizes:', error);
      throw new Error(`Failed to calculate total prizes: ${error.message}`);
    }

    return parseFloat(data) || 0;
  }

  /**
   * Get prizes using the database function (optimized)
   */
  static async getTournamentPrizesOptimized(
    tournamentId: string
  ): Promise<TournamentPrize[]> {
    const { data, error } = await tournamentService.callRPC('get_tournament_prizes', {
      p_tournament_id: tournamentId,
    });

    if (error) {
      console.error('Error fetching tournament prizes (optimized):', error);
      throw new Error(`Failed to fetch tournament prizes: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create default prize structure using existing tournament logic
   * 16 ranking positions (1st-16th) + 1 participation reward
   */
  static createDefaultPrizeTemplate(
    tournamentId: string,
    format: 'standard' | 'winner-takes-all' | 'top-heavy' | 'distributed',
    totalPrizePool: number = 10000000, // 10M VND default
    playerRank: RankCode = 'K' // Default to K rank for SPA points calculation
  ): CreateTournamentPrizeInput[] {
    
    // Create a mock tournament object for the existing calculation
    const mockTournament = {
      id: tournamentId,
      prize_pool: totalPrizePool,
      max_participants: 16,
      entry_fee: totalPrizePool / 16, // Approximate
    };

    // Use the existing proven logic
    const rewardsCalculation = calculateRewards(mockTournament, playerRank);
    console.log('🔍 Rewards calculation result:', rewardsCalculation.positions.length, 'positions');
    
    // Convert to our new prize structure - FILTER OUT participation (position 99) 
    let positions = rewardsCalculation.positions.filter(pos => pos.position !== 99);
    console.log('🔍 After filtering out participation:', positions.length, 'positions');

    // Apply format modifications to the base calculation
    switch (format) {
      case 'winner-takes-all':
        // Give everything to position 1, zero out the rest
        positions = positions.map((pos, index) => ({
          ...pos,
          cashPrize: index === 0 ? totalPrizePool : 0,
          // Keep ELO/SPA as calculated by existing logic
        }));
        break;

      case 'top-heavy':
        // Redistribute to favor top 3 positions more (60-30-10% pattern)
        positions = positions.map((pos, index) => {
          let cashPrize = pos.cashPrize;
          if (index === 0) cashPrize = Math.round(totalPrizePool * 0.6); // 60%
          else if (index === 1) cashPrize = Math.round(totalPrizePool * 0.3); // 30%  
          else if (index === 2) cashPrize = Math.round(totalPrizePool * 0.1); // 10%
          else cashPrize = 0; // Nothing for other positions
          
          return { ...pos, cashPrize };
        });
        break;

      case 'distributed':
        // Use the existing distribution (it's already well distributed across 16+1 positions)
        // No changes needed - the existing logic already distributes nicely
        break;

      case 'standard':
      default:
        // Use existing calculation as-is (it's already a good standard distribution)
        break;
    }

    // Convert to CreateTournamentPrizeInput format - ONLY 16 positions with clear individual names
    return positions.map((position, index) => ({
      tournament_id: tournamentId,
      prize_position: position.position,
      position_name: this.getIndividualPositionName(position.position), // Use individual names
      cash_amount: position.cashPrize,
      elo_points: position.eloPoints,
      spa_points: position.spaPoints,
      physical_items: position.items || [],
      color_theme: this.getPositionColorTheme(position.position),
      display_order: position.position, 
      is_visible: position.isVisible ?? true,
      is_guaranteed: true,
      cash_currency: 'VND'
    }));
  }

  /**
   * Helper to get individual position names (not grouped)
   */
  private static getIndividualPositionName(position: number): string {
    switch (position) {
      case 1: return 'Vô địch';
      case 2: return 'Á quân';
      case 3: return 'Hạng 3';
      case 4: return 'Hạng 4';
      case 5: return 'Hạng 5';
      case 6: return 'Hạng 6';
      case 7: return 'Hạng 7';
      case 8: return 'Hạng 8';
      case 9: return 'Hạng 9';
      case 10: return 'Hạng 10';
      case 11: return 'Hạng 11';
      case 12: return 'Hạng 12';
      case 13: return 'Hạng 13';
      case 14: return 'Hạng 14';
      case 15: return 'Hạng 15';
      case 16: return 'Hạng 16';
      default: return `Hạng ${position}`;
    }
  }

  /**
   * Helper to get color theme based on position (from existing logic)
   */
  private static getPositionColorTheme(position: number): string {
    switch (position) {
      case 1: return 'gold';
      case 2: return 'silver'; 
      case 3: return 'bronze';
      case 4: return 'blue';
      case 99: return 'green'; // Participation
      default: 
        if (position <= 8) return 'purple';
        else return 'gray';
    }
  }
}
