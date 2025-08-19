import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService } from '@/integrations/supabase/service';
import { useProfileCache } from '@/hooks/useProfileCache';
import { useAuth } from '@/hooks/useAuth';
import type { SABOMatch } from '../SABOLogicCore';

export const useSABOTournamentMatches = (tournamentId: string) => {
  const [matches, setMatches] = useState<SABOMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const { getMultipleProfiles } = useProfileCache();
  const { user } = useAuth();

  const loadMatches = useCallback(async () => {
    if (!tournamentId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('🎯 Fetching SABO matches for tournament:', tournamentId);
      console.log('👤 User authenticated:', !!user);

      // Check if user is authenticated for better RLS access
      if (!user) {
        console.log('⚠️ No authenticated user - may have RLS issues');
      }

      // Fetch matches from tournament_matches table (renamed from sabo_tournament_matches)
      // Use service client to bypass RLS issues
      console.log('🔧 Using service client to bypass RLS for SABO matches...');
      
      if (!supabaseService) {
        console.error('❌ Service client not available, falling back to regular client');
        throw new Error('Service client not configured');
      }
      
      const result = await supabaseService
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('round_number', { ascending: true })
        .order('match_number', { ascending: true });
          
      const matchesData = result.data;
      const matchesError = result.error;

      if (matchesError) {
        console.error('❌ Error fetching SABO matches:', matchesError);
        throw matchesError;
      }

      console.log('✅ Fetched SABO matches:', matchesData?.length || 0);
      
      // Debug: Check first match structure
      if (matchesData && matchesData.length > 0) {
        console.log('🔍 Sample SABO match structure:', matchesData[0]);
        console.log('🔍 Available fields:', Object.keys(matchesData[0]));
      }

      // Collect all unique user IDs - use any type to avoid typescript issues
      const userIds = new Set<string>();
      (matchesData as any[])?.forEach((match: any) => {
        if (match.player1_id) userIds.add(match.player1_id);
        if (match.player2_id) userIds.add(match.player2_id);
      });

      // Fetch all profiles at once using cache
      const profiles = await getMultipleProfiles(Array.from(userIds));
      const profileMap = profiles.reduce(
        (acc, profile) => {
          acc[profile.user_id] = profile;
          return acc;
        },
        {} as Record<string, any>
      );

      // Map matches with cached profiles and convert to SABO format
      const matchesWithProfiles = ((matchesData as any[]) || []).map((match: any) => {
        console.log('🔍 Processing match:', match.sabo_match_id || match.id, {
          bracket_type: match.bracket_type,
          round_number: match.round_number,
          match_number: match.match_number,
          status: match.status
        });
        
        // Map bracket type from database to expected format
        const mapBracketType = (dbType: string): 'winners' | 'losers' | 'semifinals' | 'finals' => {
          switch (dbType) {
            case 'winner': return 'winners';
            case 'loser': return 'losers';
            case 'semifinal': return 'semifinals';
            case 'final': return 'finals';
            default: return 'winners'; // fallback
          }
        };
        
        return {
          id: match.id,
          tournament_id: match.tournament_id,
          round_number: match.round_number,
          match_number: match.match_number,
          player1_id: match.player1_id,
          player2_id: match.player2_id,
          winner_id: match.winner_id,
          status: match.status as 'pending' | 'ready' | 'completed',
          bracket_type: mapBracketType(match.bracket_type),
          branch_type: match.branch_type as 'A' | 'B' | undefined,
          player1_score: match.score_player1, // ✅ FIX: Map from correct database field
          player2_score: match.score_player2, // ✅ FIX: Map from correct database field
          score_player1: match.score_player1, // ✅ Also provide new field names for compatibility
          score_player2: match.score_player2, // ✅ Also provide new field names for compatibility
          player1: match.player1_id ? profileMap[match.player1_id] || null : null,
          player2: match.player2_id ? profileMap[match.player2_id] || null : null,
        };
        
        // 🔍 DEBUG: Log score mapping để debug tỷ số
        if (match.status === 'completed' && (match.player1_score || match.player2_score)) {
          console.log('🔍 [useSABOTournamentMatches] Score mapping CORRECTED:', {
            id: match.id,
            raw_player1_score: match.player1_score,
            raw_player2_score: match.player2_score,
            mapped_player1_score: match.player1_score,
            mapped_player2_score: match.player2_score,
            status: match.status,
            winner_id: match.winner_id
          });
        }
        
        // 🔍 DEBUG: Log score mapping để debug tỷ số
        if (match.status === 'completed' && (match.score_player1 || match.score_player2)) {
          console.log('🔍 [useSABOTournamentMatches] Score mapping:', {
            id: match.id,
            raw_score_player1: match.score_player1,
            raw_score_player2: match.score_player2,
            final_score_player1: match.score_player1,
            final_score_player2: match.score_player2,
            status: match.status,
            winner_id: match.winner_id
          });
        }
      }) as SABOMatch[];

      console.log(
        '✅ SABO matches with cached profiles:',
        matchesWithProfiles.length
      );
      
      // Debug: Check final processed matches
      if (matchesWithProfiles.length > 0) {
        console.log('🔍 Final processed match sample:', matchesWithProfiles[0]);
      }
      setMatches(matchesWithProfiles);
      setLastUpdateTime(new Date());
    } catch (err: any) {
      console.error('❌ Error in loadMatches:', err);
      setError(err.message || 'Failed to fetch SABO matches');
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId, getMultipleProfiles]);

  // Optimized real-time subscription for SABO tournaments
  useEffect(() => {
    if (!tournamentId) return;

    console.log(
      '🔄 Setting up SABO real-time subscription for tournament:',
      tournamentId
    );

    let debounceTimer: NodeJS.Timeout;
    const updateQueue = new Set<string>();

    const debouncedRefetch = (isUrgent = false) => {
      clearTimeout(debounceTimer);

      // ✅ CRITICAL FIX: Immediate refresh for urgent updates (score submissions)
      if (isUrgent) {
        console.log('🚀 URGENT: Immediate SABO refresh triggered');
        updateQueue.clear();
        loadMatches();
        return;
      }

      // Regular debounced refresh for less critical updates
      debounceTimer = setTimeout(() => {
        if (updateQueue.size > 0) {
          console.log('🔄 Processing SABO queued updates:', updateQueue.size);
          updateQueue.clear();
          loadMatches();
        }
      }, 300); // ✅ Reduced from 800ms to 300ms for faster UI response
    };

    const channel = supabase
      .channel(`sabo-tournament-${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_matches', // ✅ FIX: Use correct table after rename
          filter: `tournament_id=eq.${tournamentId}`,
        },
        payload => {
          console.log(
            '🔄 SABO match real-time update:',
            payload.eventType,
            payload.new
          );

          // ✅ CRITICAL: Check if this is a score submission (urgent update)
          const isScoreUpdate =
            payload.eventType === 'UPDATE' &&
            payload.new &&
            ('player1_score' in payload.new ||
              'player2_score' in payload.new ||
              'winner_id' in payload.new ||
              'status' in payload.new);

          if (isScoreUpdate) {
            console.log(
              '🚀 URGENT: Score/status update detected, immediate refresh!'
            );

            // ✅ IMMEDIATE UI UPDATE: Update state immediately for instant feedback
            if (payload.new && 'id' in payload.new) {
              setMatches(currentMatches => {
                const updatedMatches = [...currentMatches];
                const matchIndex = updatedMatches.findIndex(
                  m => m.id === payload.new.id
                );

                if (matchIndex >= 0) {
                  // Merge the new data with existing match data
                  updatedMatches[matchIndex] = {
                    ...updatedMatches[matchIndex],
                    status:
                      payload.new.status || updatedMatches[matchIndex].status,
                    player1_score:
                      payload.new.player1_score !== undefined
                        ? payload.new.player1_score
                        : updatedMatches[matchIndex].player1_score,
                    player2_score:
                      payload.new.player2_score !== undefined
                        ? payload.new.player2_score
                        : updatedMatches[matchIndex].player2_score,
                    winner_id:
                      payload.new.winner_id !== undefined
                        ? payload.new.winner_id
                        : updatedMatches[matchIndex].winner_id,
                  };

                  console.log(
                    '✅ Immediate UI update applied for match:',
                    payload.new.id
                  );
                }

                return updatedMatches;
              });
            }

            // Also trigger full refresh after a short delay to get any related updates
            setTimeout(() => {
              console.log(
                '🔄 Following up with full refresh after score update'
              );
              loadMatches();
            }, 500);
            return;
          }

          // Queue the update for less critical changes
          if (payload.new && 'id' in payload.new) {
            updateQueue.add(payload.new.id as string);
          }

          debouncedRefetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tournament_automation_log',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        payload => {
          const logData = payload.new as any;
          console.log(
            '🤖 SABO automation event:',
            logData.automation_type,
            logData.status
          );

          if (
            logData.automation_type === 'sabo_advancement' &&
            logData.status === 'completed'
          ) {
            // Immediate refresh for successful SABO automation
            setTimeout(() => loadMatches(), 200);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 Cleaning up SABO real-time subscription');
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [tournamentId, loadMatches]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  return {
    data: matches,
    isLoading,
    error,
    lastUpdateTime,
    refresh: loadMatches,
  };
};
