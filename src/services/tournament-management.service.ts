/**
 * Tournament Management Service Layer
 * Extracted from TournamentManagementHub.tsx for better separation of concerns
 * Phase 1 - Step 1.2 of refactoring process
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  Tournament,
  Player,
  BracketMatch,
  TournamentServiceResponse,
  BracketGenerationResult,
  PlayerRegistration,
  TournamentFilter,
} from '@/types/tournament-management';

export class TournamentManagementService {
  /**
   * Fetch tournaments for a specific club
   */
  static async fetchTournaments(clubId: string): Promise<Tournament[]> {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tournaments:', error);
      throw new Error(`Failed to fetch tournaments: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Fetch tournaments with filtering
   */
  static async fetchFilteredTournaments(
    clubId: string,
    filter: TournamentFilter
  ): Promise<Tournament[]> {
    let query = supabase
      .from('tournaments')
      .select('*')
      .eq('club_id', clubId);

    // Apply filters
    switch (filter) {
      case 'active':
        query = query.in('status', ['registration_open', 'ongoing']);
        break;
      case 'upcoming':
        query = query.eq('status', 'registration_closed');
        break;
      case 'completed':
        query = query.eq('status', 'completed');
        break;
      case 'all':
      default:
        // No additional filter
        break;
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching filtered tournaments:', error);
      throw new Error(`Failed to fetch tournaments: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Fetch tournament participants/registrations
   */
  static async fetchTournamentParticipants(tournamentId: string): Promise<Player[]> {
    const { data: registrations, error } = await supabase
      .from('tournament_registrations')
      .select(`
        user_id,
        registration_status,
        payment_status,
        profiles:user_id (
          full_name,
          display_name,
          avatar_url,
          elo
        )
      `)
      .eq('tournament_id', tournamentId)
      .eq('registration_status', 'confirmed');

    if (error) {
      console.error('Error fetching tournament participants:', error);
      throw new Error(`Failed to fetch participants: ${error.message}`);
    }

    // Transform registrations to Player format
    return (registrations as PlayerRegistration[])?.map((reg, index) => ({
      id: reg.user_id,
      full_name: reg.profiles?.full_name || 'Unknown Player',
      display_name: reg.profiles?.display_name,
      avatar_url: reg.profiles?.avatar_url,
      elo: reg.profiles?.elo || 1000,
    })) || [];
  }

  /**
   * Fetch all available players for bracket generation
   */
  static async fetchAvailablePlayers(): Promise<Player[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, full_name, display_name, avatar_url, elo')
      .not('full_name', 'is', null)
      .order('elo', { ascending: false });

    if (error) {
      console.error('Error fetching available players:', error);
      throw new Error(`Failed to fetch players: ${error.message}`);
    }

    return data?.map(profile => ({
      id: profile.user_id,
      full_name: profile.full_name || 'Unknown',
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      elo: profile.elo || 1000,
    })) || [];
  }

  /**
   * Generate random bracket
   */
  static generateRandomBracket(players: Player[]): BracketMatch[] {
    if (players.length < 2) {
      throw new Error('Need at least 2 players to generate bracket');
    }

    // Shuffle players randomly
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    
    // Ensure even number of players by adding bye if necessary
    if (shuffledPlayers.length % 2 !== 0) {
      shuffledPlayers.push({
        id: 'bye',
        full_name: 'BYE',
        elo: 0,
      });
    }

    const matches: BracketMatch[] = [];
    for (let i = 0; i < shuffledPlayers.length; i += 2) {
      matches.push({
        round: 1,
        match_number: Math.floor(i / 2) + 1,
        player1: shuffledPlayers[i],
        player2: shuffledPlayers[i + 1],
        status: 'scheduled',
      });
    }

    return matches;
  }

  /**
   * Generate seeded bracket based on ELO
   */
  static generateSeededBracket(players: Player[]): BracketMatch[] {
    if (players.length < 2) {
      throw new Error('Need at least 2 players to generate bracket');
    }

    // Sort players by ELO (highest first)
    const sortedPlayers = [...players].sort((a, b) => b.elo - a.elo);
    
    // Calculate bracket size (next power of 2)
    const totalPlayers = Math.pow(2, Math.ceil(Math.log2(sortedPlayers.length)));
    
    // Apply tournament seeding (1 vs 8, 2 vs 7, 3 vs 6, 4 vs 5 pattern)
    const seededPlayers: (Player | null)[] = [];
    for (let i = 0; i < totalPlayers / 2; i++) {
      seededPlayers.push(sortedPlayers[i] || null);
      seededPlayers.push(sortedPlayers[totalPlayers - 1 - i] || null);
    }

    const matches: BracketMatch[] = [];
    for (let i = 0; i < seededPlayers.length; i += 2) {
      matches.push({
        round: 1,
        match_number: Math.floor(i / 2) + 1,
        player1: seededPlayers[i],
        player2: seededPlayers[i + 1],
        status: 'scheduled',
      });
    }

    return matches;
  }

  /**
   * Save generated bracket to tournament
   */
  static async saveBracketToTournament(
    tournamentId: string,
    matches: BracketMatch[]
  ): Promise<TournamentServiceResponse<BracketGenerationResult>> {
    try {
      // Prepare matches for database insertion
      const matchesToInsert = matches.map((match, index) => ({
        tournament_id: tournamentId,
        round_number: match.round,
        match_number: match.match_number,
        player1_id: match.player1?.id || null,
        player2_id: match.player2?.id || null,
        status: match.status || 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // First, delete existing matches for this tournament
      const { error: deleteError } = await supabase
        .from('tournament_matches')
        .delete()
        .eq('tournament_id', tournamentId);

      if (deleteError) {
        throw new Error(`Failed to clear existing matches: ${deleteError.message}`);
      }

      // Then insert new matches
      const { data, error: insertError } = await supabase
        .from('tournament_matches')
        .insert(matchesToInsert)
        .select();

      if (insertError) {
        throw new Error(`Failed to save bracket: ${insertError.message}`);
      }

      // Update tournament status
      const { error: updateError } = await supabase
        .from('tournaments')
        .update({
          bracket_generated: true,
          status: 'registration_closed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', tournamentId);

      if (updateError) {
        console.warn('Failed to update tournament status:', updateError);
      }

      return {
        success: true,
        data: {
          success: true,
          matches: data,
          total_matches: data?.length || 0,
          matches_created: data?.length || 0,
        },
        message: 'Bracket saved successfully',
      };
    } catch (error) {
      console.error('Error saving bracket:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Fetch existing tournament matches
   */
  static async fetchTournamentMatches(tournamentId: string): Promise<BracketMatch[]> {
    const { data, error } = await supabase
      .from('tournament_matches')
      .select(`
        round_number,
        match_number,
        status,
        player1_id,
        player2_id,
        winner_id,
        player1:player1_id (
          user_id,
          full_name,
          display_name,
          avatar_url,
          elo
        ),
        player2:player2_id (
          user_id,
          full_name,
          display_name,
          avatar_url,
          elo
        )
      `)
      .eq('tournament_id', tournamentId)
      .order('round_number', { ascending: true })
      .order('match_number', { ascending: true });

    if (error) {
      console.error('Error fetching tournament matches:', error);
      throw new Error(`Failed to fetch matches: ${error.message}`);
    }

    return data?.map(match => ({
      round: match.round_number,
      match_number: match.match_number,
      status: match.status as any,
      player1: match.player1 ? {
        id: match.player1.user_id,
        full_name: match.player1.full_name || 'Unknown',
        display_name: match.player1.display_name,
        avatar_url: match.player1.avatar_url,
        elo: match.player1.elo || 1000,
      } : null,
      player2: match.player2 ? {
        id: match.player2.user_id,
        full_name: match.player2.full_name || 'Unknown',
        display_name: match.player2.display_name,
        avatar_url: match.player2.avatar_url,
        elo: match.player2.elo || 1000,
      } : null,
      tournament_id: tournamentId,
    })) || [];
  }

  /**
   * Delete tournament
   */
  static async deleteTournament(tournamentId: string): Promise<TournamentServiceResponse> {
    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentId);

      if (error) {
        throw new Error(`Failed to delete tournament: ${error.message}`);
      }

      return {
        success: true,
        message: 'Tournament deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting tournament:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update tournament
   */
  static async updateTournament(
    tournamentId: string,
    updates: Partial<Tournament>
  ): Promise<TournamentServiceResponse<Tournament>> {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tournamentId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update tournament: ${error.message}`);
      }

      return {
        success: true,
        data,
        message: 'Tournament updated successfully',
      };
    } catch (error) {
      console.error('Error updating tournament:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
