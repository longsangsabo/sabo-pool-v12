import { SupabaseClient } from '@supabase/supabase-js';
import { 
  TournamentData, 
  TournamentFormData,
  TournamentServiceResult,
  TournamentCreationResult,
  TournamentRegistration
} from './tournament-types';

/**
 * Tournament API Service
 * Handles all database operations for tournaments
 * Extracted from contexts and consolidated into single service
 */
export class TournamentAPIService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Create tournament in database
   * Extracted from UnifiedTournamentContext.tsx and TournamentContext.tsx
   */
  async createTournament(tournamentData: TournamentData): Promise<TournamentServiceResult<TournamentCreationResult>> {
    try {
      console.log('📤 Creating tournament in database:', tournamentData);

      // Insert tournament
      const { data: result, error } = await this.supabase
        .from('tournaments')
        .insert(tournamentData)
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Tournament created successfully:', result);

      // Send notification to club members (if applicable)
      let notificationSent = false;
      try {
        if (result.club_id) {
          const { error: notificationError } = await this.supabase.functions.invoke(
            'notify-club-members',
            {
              body: {
                tournament_id: result.id,
                club_id: result.club_id,
                tournament_name: result.name,
                created_by_id: result.created_by,
              },
            }
          );

          if (notificationError) {
            console.error('⚠️ Notification failed but tournament created:', notificationError);
          } else {
            console.log('📢 Club members notified successfully');
            notificationSent = true;
          }
        }
      } catch (notificationError) {
        console.error('⚠️ Notification failed but tournament created:', notificationError);
      }

      return {
        success: true,
        data: {
          tournament: result,
          notification_sent: notificationSent,
          bracket_initialized: false, // Will be handled separately
        },
        message: 'Tournament created successfully',
      };
    } catch (error: any) {
      console.error('❌ Error creating tournament:', error);
      return {
        success: false,
        error: error.message || 'Failed to create tournament',
      };
    }
  }

  /**
   * Update existing tournament
   * Extracted from TournamentContext.tsx updateExistingTournament
   */
  async updateTournament(id: string, updateData: Partial<TournamentData>): Promise<TournamentServiceResult<TournamentData>> {
    try {
      const { data, error } = await this.supabase
        .from('tournaments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data,
        message: 'Tournament updated successfully',
      };
    } catch (error: any) {
      console.error('❌ Error updating tournament:', error);
      return {
        success: false,
        error: error.message || 'Failed to update tournament',
      };
    }
  }

  /**
   * Fetch tournaments with optional filtering
   * Extracted from UnifiedTournamentContext.tsx fetchTournaments
   */
  async fetchTournaments(options?: {
    clubId?: string;
    status?: string;
    createdBy?: string;
    limit?: number;
  }): Promise<TournamentServiceResult<TournamentData[]>> {
    try {
      let query = this.supabase
        .from('tournaments')
        .select(`
          *,
          club:club_profiles(
            id,
            club_name,
            address,
            phone,
            contact_info
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (options?.clubId) {
        query = query.eq('club_id', options.clubId);
      }
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.createdBy) {
        query = query.eq('created_by', options.createdBy);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || [],
        message: 'Tournaments fetched successfully',
      };
    } catch (error: any) {
      console.error('❌ Error fetching tournaments:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch tournaments',
      };
    }
  }

  /**
   * Get tournament by ID with full details
   * Extracted from TournamentContext.tsx loadTournament
   */
  async getTournamentById(id: string): Promise<TournamentServiceResult<TournamentData>> {
    try {
      const { data, error } = await this.supabase
        .from('tournaments')
        .select(`
          *,
          club:club_profiles(
            id,
            club_name,
            address,
            phone,
            contact_info
          ),
          registrations:tournament_registrations(
            id,
            user_id,
            registration_status,
            profiles:user_id(
              id,
              display_name,
              full_name,
              avatar_url,
              verified_rank
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data,
        message: 'Tournament fetched successfully',
      };
    } catch (error: any) {
      console.error('❌ Error fetching tournament:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch tournament',
      };
    }
  }

  /**
   * Register user for tournament
   * Business logic for tournament registration
   */
  async registerForTournament(
    tournamentId: string, 
    userId: string, 
    options?: {
      notes?: string;
      paymentStatus?: 'unpaid' | 'pending' | 'paid';
    }
  ): Promise<TournamentServiceResult<TournamentRegistration>> {
    try {
      // First check if already registered
      const { data: existingReg, error: checkError } = await this.supabase
        .from('tournament_registrations')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingReg) {
        return {
          success: false,
          error: 'Bạn đã đăng ký giải đấu này rồi',
        };
      }

      // Register user
      const { data, error } = await this.supabase
        .from('tournament_registrations')
        .insert({
          tournament_id: tournamentId,
          user_id: userId,
          registration_status: 'confirmed',
          payment_status: options?.paymentStatus || 'unpaid',
          notes: options?.notes,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update tournament participant count
      await this.supabase.rpc('increment_tournament_participants', {
        tournament_id: tournamentId,
      });

      return {
        success: true,
        data,
        message: 'Đăng ký thành công',
      };
    } catch (error: any) {
      console.error('❌ Error registering for tournament:', error);
      return {
        success: false,
        error: error.message || 'Failed to register for tournament',
      };
    }
  }

  /**
   * Cancel tournament registration
   */
  async cancelRegistration(tournamentId: string, userId: string): Promise<TournamentServiceResult<boolean>> {
    try {
      const { error } = await this.supabase
        .from('tournament_registrations')
        .delete()
        .eq('tournament_id', tournamentId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      // Update tournament participant count
      await this.supabase.rpc('decrement_tournament_participants', {
        tournament_id: tournamentId,
      });

      return {
        success: true,
        data: true,
        message: 'Hủy đăng ký thành công',
      };
    } catch (error: any) {
      console.error('❌ Error canceling registration:', error);
      return {
        success: false,
        error: error.message || 'Failed to cancel registration',
      };
    }
  }

  /**
   * Get user's tournament registrations
   */
  async getUserRegistrations(userId: string): Promise<TournamentServiceResult<string[]>> {
    try {
      const { data, error } = await this.supabase
        .from('tournament_registrations')
        .select('tournament_id')
        .eq('user_id', userId)
        .eq('registration_status', 'confirmed');

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data?.map(r => r.tournament_id) || [],
        message: 'User registrations fetched successfully',
      };
    } catch (error: any) {
      console.error('❌ Error fetching user registrations:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch user registrations',
      };
    }
  }

  /**
   * Get tournament registrations
   */
  async getTournamentRegistrations(tournamentId: string): Promise<TournamentServiceResult<TournamentRegistration[]>> {
    try {
      const { data, error } = await this.supabase
        .from('tournament_registrations')
        .select(`
          *,
          profiles:user_id(
            id,
            display_name,
            full_name,
            avatar_url,
            verified_rank,
            elo_rating
          )
        `)
        .eq('tournament_id', tournamentId)
        .order('registered_at', { ascending: true });

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || [],
        message: 'Tournament registrations fetched successfully',
      };
    } catch (error: any) {
      console.error('❌ Error fetching tournament registrations:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch tournament registrations',
      };
    }
  }

  /**
   * Initialize SABO tournament (for double elimination)
   * Extracted from useTournamentUtils.tsx
   */
  async initializeSABOTournament(tournamentId: string, playerIds: string[]): Promise<TournamentServiceResult<boolean>> {
    try {
      const { data, error } = await this.supabase.rpc(
        'initialize_sabo_tournament',
        {
          p_tournament_id: tournamentId,
          p_player_ids: playerIds,
        }
      );

      if (error) {
        console.error('SABO tournament initialization failed:', error);
        throw error;
      }

      return {
        success: true,
        data: true,
        message: 'SABO tournament initialized successfully',
      };
    } catch (error: any) {
      console.error('❌ Error initializing SABO tournament:', error);
      return {
        success: false,
        error: error.message || 'Failed to initialize SABO tournament',
      };
    }
  }

  /**
   * Save tournament prizes
   * Extracted from TournamentContext.tsx saveTournamentPrizes
   */
  async saveTournamentPrizes(tournamentId: string, prizes: any[]): Promise<TournamentServiceResult<boolean>> {
    try {
      const prizesData = prizes.map(prize => ({
        tournament_id: tournamentId,
        position: prize.position,
        prize_type: 'cash',
        prize_value: prize.cashPrize || 0,
        elo_points: prize.eloPoints || 0,
        spa_points: prize.spaPoints || 0,
        items: prize.items || [],
        is_visible: prize.isVisible !== false,
      }));

      const { error } = await this.supabase
        .from('tournament_prizes')
        .upsert(prizesData, {
          onConflict: 'tournament_id,position',
        });

      if (error) {
        console.error('❌ Failed to save prizes:', error);
        throw error;
      }

      console.log('✅ Tournament prizes saved successfully:', prizes.length, 'entries');
      
      return {
        success: true,
        data: true,
        message: 'Tournament prizes saved successfully',
      };
    } catch (error: any) {
      console.error('❌ Error saving tournament prizes:', error);
      return {
        success: false,
        error: error.message || 'Failed to save tournament prizes',
      };
    }
  }

  /**
   * Load latest tournament for auto-fill
   * Extracted from TournamentContext.tsx loadLatestTournament
   */
  async getLatestTournamentByUser(userId: string): Promise<TournamentServiceResult<Partial<TournamentData>>> {
    try {
      const { data, error } = await this.supabase
        .from('tournaments')
        .select(`
          name,
          description,
          tournament_type,
          game_format,
          max_participants,
          tier_level,
          entry_fee,
          prize_pool,
          venue_address,
          contact_info,
          rules,
          requires_approval,
          allow_all_ranks,
          eligible_ranks,
          is_public
        `)
        .eq('created_by', userId)
        .neq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || {},
        message: 'Latest tournament fetched successfully',
      };
    } catch (error: any) {
      console.error('❌ Error fetching latest tournament:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch latest tournament',
      };
    }
  }
}
