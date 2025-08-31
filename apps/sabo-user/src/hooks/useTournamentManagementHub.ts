/**
 * Tournament Management Hub Hook
 * Extracted state management logic from TournamentManagementHub.tsx
 * Phase 1 - Step 1.3 of refactoring process
 */

import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from "../services/userService";
import { getTournament, createTournament } from "../services/tournamentService";
import { getUserProfile } from "../services/profileService";
import { useAuth } from '@/hooks/useAuth';
// Removed supabase import - migrated to services
import { toast } from 'sonner';
import { TournamentManagementService } from '@/services/tournament-management.service';
import type {
  Tournament,
  TournamentFilter,
  TournamentManagementView,
  UseTournamentManagementReturn,
} from '@/types/tournament-management';

export const useTournamentManagementHub = (): UseTournamentManagementReturn => {
  const { user } = useAuth();

  // State
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);
  const [currentView, setCurrentView] =
    useState<TournamentManagementView>('list');
  const [activeFilter, setActiveFilter] = useState<TournamentFilter>('active');
  const [clubId, setClubId] = useState<string | null>(null);

  // Fetch club ID for current user
  const fetchClubId = useCallback(async () => {
    if (!user) return;

    try {
//       const { data: clubData, error: clubError } = await supabase
        .from('club_profiles')
        .select('id')
        .getByUserId(user.id)
        .single();

      if (clubError) {
        if (clubError.code !== 'PGRST116') {
          console.error('Error fetching club:', clubError);
        }
        setClubId(null);
        return;
      }

      setClubId(clubData?.id || null);
    } catch (error) {
      console.error('Error in fetchClubId:', error);
      setClubId(null);
    }
  }, [user]);

  // Fetch tournaments
  const fetchTournaments = useCallback(async () => {
    if (!clubId) {
      setTournaments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const tournamentsData =
        await TournamentManagementService.fetchFilteredTournaments(
          clubId,
          activeFilter
        );

      setTournaments(tournamentsData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch tournaments';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  }, [clubId, activeFilter]);

  // Refresh tournaments (public method for external components)
  const refreshTournaments = useCallback(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  // Initialize club and tournaments
  useEffect(() => {
    fetchClubId();
  }, [fetchClubId]);

  useEffect(() => {
    if (clubId) {
      fetchTournaments();
    }
  }, [clubId, fetchTournaments]);

  // Real-time subscription for tournament updates
  useEffect(() => {
    if (!clubId) return;

//     const channel = supabase
      .channel('tournament-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments',
          filter: `club_id=eq.${clubId}`,
        },
        payload => {
          console.log('🔄 Tournament updated:', payload);
          // Refresh tournament list when any tournament changes
          fetchTournaments();
        }
      )
      .subscribe();

    return () => {
      // removeChannel(channel);
    };
  }, [clubId, fetchTournaments]);

  return {
    tournaments,
    loading,
    error,
    selectedTournament,
    currentView,
    activeFilter,
    setSelectedTournament,
    setCurrentView,
    setActiveFilter,
    fetchTournaments,
    refreshTournaments,
  };
};
