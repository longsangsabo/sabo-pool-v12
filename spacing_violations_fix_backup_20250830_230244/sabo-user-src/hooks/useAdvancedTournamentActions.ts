import { useCallback, useMemo } from 'react';
import { Tournament, Player } from '@/types/tournament-management';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAdvancedTournamentActions = () => {
  // Bulk operations
  const bulkUpdateTournamentStatus = useCallback(
    async (tournamentIds: string[], status: string) => {
      try {
        const { error } = await supabase
          .from('tournaments')
          .update({ status, updated_at: new Date().toISOString() })
          .in('id', tournamentIds);

        if (error) throw error;

        toast.success(`Đã cập nhật ${tournamentIds.length} giải đấu`);
        return { success: true };
      } catch (error) {
        console.error('Bulk update error:', error);
        toast.error('Lỗi khi cập nhật hàng loạt');
        return { success: false, error };
      }
    },
    []
  );

  // Smart bracket generation with AI-like seeding
  const generateSmartBracket = useCallback(
    async (tournament: Tournament, players: Player[]) => {
      try {
        // Advanced seeding algorithm considering multiple factors
        const rankedPlayers = players
          .map(player => ({
            ...player,
            score: calculatePlayerScore(player),
          }))
          .sort((a, b) => b.score - a.score);

        // Implement serpentine seeding for fairness
        const seededPlayers = serpentineSeeding(rankedPlayers);

        return {
          success: true,
          bracket: seededPlayers,
          algorithm: 'smart-serpentine',
        };
      } catch (error) {
        console.error('Smart bracket generation error:', error);
        return { success: false, error };
      }
    },
    []
  );

  // Auto-schedule matches based on optimal timing
  const autoScheduleMatches = useCallback(
    async (
      tournamentId: string,
      preferences: {
        startTime: string;
        matchDuration: number;
        breakBetweenMatches: number;
      }
    ) => {
      try {
        const { data: matches, error } = await supabase
          .from('tournament_matches')
          .select('*')
          .eq('tournament_id', tournamentId)
          .order('round_number', { ascending: true });

        if (error) throw error;

        const scheduledMatches = calculateOptimalSchedule(matches, preferences);

        // Update matches with calculated schedule
        for (const match of scheduledMatches) {
          await supabase
            .from('tournament_matches')
            .update({
              scheduled_time: match.scheduled_time,
              estimated_duration: preferences.matchDuration,
            })
            .eq('id', match.id);
        }

        toast.success('Đã tự động lên lịch các trận đấu');
        return { success: true };
      } catch (error) {
        console.error('Auto schedule error:', error);
        toast.error('Lỗi khi tự động lên lịch');
        return { success: false, error };
      }
    },
    []
  );

  return {
    bulkUpdateTournamentStatus,
    generateSmartBracket,
    autoScheduleMatches,
  };
};

// Helper functions
const calculatePlayerScore = (player: Player): number => {
  let score = player.elo || 1000;

  // Bonus for verified rank
  if (player.rank && player.rank !== 'Chưa xác thực') {
    const rankBonus = {
      A: 200,
      B: 150,
      C: 100,
      D: 50,
      E: 25,
      F: 10,
      G: 5,
      H: 2,
      I: 1,
    };
    score += rankBonus[player.rank as keyof typeof rankBonus] || 0;
  }

  return score;
};

const serpentineSeeding = (players: Player[]): Player[] => {
  const seeded: Player[] = [];
  const rounds = Math.ceil(Math.log2(players.length));

  // Implement serpentine pattern for balanced bracket
  for (let i = 0; i < players.length; i++) {
    const position = calculateSerpentinePosition(i, rounds);
    seeded[position] = players[i];
  }

  return seeded;
};

const calculateSerpentinePosition = (index: number, rounds: number): number => {
  // Advanced serpentine calculation for optimal seeding
  const groupSize = Math.pow(2, rounds - 1);
  const group = Math.floor(index / groupSize);
  const positionInGroup = index % groupSize;

  return group % 2 === 0
    ? group * groupSize + positionInGroup
    : (group + 1) * groupSize - 1 - positionInGroup;
};

const calculateOptimalSchedule = (matches: any[], preferences: any) => {
  let currentTime = new Date(preferences.startTime);

  return matches.map(match => {
    const scheduledTime = new Date(currentTime);
    currentTime = new Date(
      currentTime.getTime() +
        (preferences.matchDuration + preferences.breakBetweenMatches) * 60000
    );

    return {
      ...match,
      scheduled_time: scheduledTime.toISOString(),
    };
  });
};
