import { useMemo, useCallback } from 'react';
import { Tournament } from '@/types/tournament-management';

export const useTournamentOptimizations = (tournaments: Tournament[]) => {
  // Memoized filtered tournaments
  const tournamentsByStatus = useMemo(() => {
    return {
      upcoming: tournaments.filter(t => t.status === 'upcoming'),
      ongoing: tournaments.filter(t => t.status === 'ongoing'),
      completed: tournaments.filter(t => t.status === 'completed'),
      registration_open: tournaments.filter(
        t => t.status === 'registration_open'
      ),
    };
  }, [tournaments]);

  // Memoized tournament statistics
  const tournamentStats = useMemo(() => {
    return {
      total: tournaments.length,
      upcoming: tournamentsByStatus.upcoming.length,
      ongoing: tournamentsByStatus.ongoing.length,
      completed: tournamentsByStatus.completed.length,
      registrationOpen: tournamentsByStatus.registration_open.length,
    };
  }, [tournaments, tournamentsByStatus]);

  // Optimized search function
  const searchTournaments = useCallback(
    (query: string, status?: string) => {
      if (!query && !status) return tournaments;

      return tournaments.filter(tournament => {
        const matchesQuery =
          !query ||
          tournament.name.toLowerCase().includes(query.toLowerCase()) ||
          tournament.description?.toLowerCase().includes(query.toLowerCase());

        const matchesStatus = !status || tournament.status === status;

        return matchesQuery && matchesStatus;
      });
    },
    [tournaments]
  );

  return {
    tournamentsByStatus,
    tournamentStats,
    searchTournaments,
  };
};
