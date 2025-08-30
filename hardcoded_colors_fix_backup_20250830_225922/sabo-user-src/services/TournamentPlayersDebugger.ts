/**
 * DEBUG TOURNAMENT PLAYERS LOADING
 * Quick fix for "Failed to load players" issue
 */

import { supabase } from '@/integrations/supabase/client';

export class TournamentPlayersDebugger {
  static async debugTournamentPlayers(tournamentId: string) {
    console.log('🔍 DEBUGGING Tournament Players Loading...');
    console.log('Tournament ID:', tournamentId);

    try {
      // 1. Check if tournament exists
      const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .select('id, name, tournament_type')
        .eq('id', tournamentId)
        .single();

      console.log('🏆 Tournament:', tournament, tournamentError);

      // 2. Check tournament_registrations directly
      const { data: registrations, error: regError } = await supabase
        .from('tournament_registrations')
        .select('*')
        .eq('tournament_id', tournamentId);

      console.log('📝 Registrations:', registrations?.length, regError);
      console.log('📝 Registrations data:', registrations);

      // 3. Check confirmed registrations
      const { data: confirmedRegs, error: confirmedError } = await supabase
        .from('tournament_registrations')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('registration_status', 'confirmed');

      console.log('✅ Confirmed registrations:', confirmedRegs?.length, confirmedError);

      // 4. Check profiles table access
      const { data: profilesTest, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, elo')
        .limit(5);

      console.log('👤 Profiles test:', profilesTest?.length, profilesError);

      // 5. Test the original query
      const { data: originalQuery, error: originalError } = await supabase
        .from('tournament_registrations')
        .select(`
          user_id,
          profiles:user_id (
            full_name,
            elo
          )
        `)
        .eq('tournament_id', tournamentId)
        .eq('registration_status', 'confirmed')
        .limit(16);

      console.log('🔧 Original query result:', originalQuery, originalError);

      // 6. Test alternative query
      const { data: altQuery, error: altError } = await supabase
        .from('tournament_registrations')
        .select(`
          user_id,
          profiles!tournament_registrations_user_id_fkey (
            full_name,
            elo
          )
        `)
        .eq('tournament_id', tournamentId)
        .eq('registration_status', 'confirmed')
        .limit(16);

      console.log('🔄 Alternative query result:', altQuery, altError);

      return {
        tournament,
        registrationsCount: registrations?.length || 0,
        confirmedCount: confirmedRegs?.length || 0,
        originalQuery,
        originalError,
        altQuery,
        altError
      };

    } catch (error) {
      console.error('💥 Debug error:', error);
      return { error };
    }
  }

  static async fixLoadPlayers(tournamentId: string) {
    console.log('🔧 FIXING Tournament Players Loading...');

    try {
      // Try method 1: Join query
      const { data: joinData, error: joinError } = await supabase
        .from('tournament_registrations')
        .select(`
          user_id,
          profiles!inner (
            id,
            full_name,
            elo
          )
        `)
        .eq('tournament_id', tournamentId)
        .eq('registration_status', 'confirmed')
        .limit(16);

      if (!joinError && joinData?.length) {
        console.log('✅ Join query worked:', joinData.length, 'players');
        return joinData.map((reg, index) => ({
          user_id: reg.user_id,
          full_name: reg.profiles?.full_name || `Player ${index + 1}`,
          elo: reg.profiles?.elo || 1000,
          seed: 0
        }));
      }

      // Try method 2: Separate queries
      const { data: registrations, error: regError } = await supabase
        .from('tournament_registrations')
        .select('user_id')
        .eq('tournament_id', tournamentId)
        .eq('registration_status', 'confirmed')
        .limit(16);

      if (regError || !registrations?.length) {
        console.log('❌ No registrations found');
        return [];
      }

      const userIds = registrations.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, elo')
        .in('id', userIds);

      if (profilesError) {
        console.log('❌ Profiles query failed:', profilesError);
        return [];
      }

      const players = registrations.map((reg, index) => {
        const profile = profiles?.find(p => p.id === reg.user_id);
        return {
          user_id: reg.user_id,
          full_name: profile?.full_name || `Player ${index + 1}`,
          elo: profile?.elo || 1000,
          seed: 0
        };
      });

      console.log('✅ Separate queries worked:', players.length, 'players');
      return players;

    } catch (error) {
      console.error('💥 Fix error:', error);
      return [];
    }
  }
}
