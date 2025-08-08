import { useMemo } from 'react';
import { Tournament } from '@/types/tournament-management';

interface TournamentAnalytics {
  totalRevenue: number;
  averageParticipants: number;
  completionRate: number;
  popularTypes: Array<{ type: string; count: number }>;
  monthlyTrends: Array<{ month: string; count: number }>;
}

export const useTournamentAnalytics = (
  tournaments: Tournament[]
): TournamentAnalytics => {
  return useMemo(() => {
    const totalRevenue = tournaments.reduce(
      (sum, t) => sum + t.entry_fee * t.current_participants,
      0
    );

    const averageParticipants =
      tournaments.length > 0
        ? tournaments.reduce((sum, t) => sum + t.current_participants, 0) /
          tournaments.length
        : 0;

    const completedTournaments = tournaments.filter(
      t => t.status === 'completed'
    );
    const completionRate =
      tournaments.length > 0
        ? (completedTournaments.length / tournaments.length) * 100
        : 0;

    const typeCount = tournaments.reduce(
      (acc, t) => {
        acc[t.tournament_type] = (acc[t.tournament_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const popularTypes = Object.entries(typeCount)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    const monthlyTrends = tournaments.reduce(
      (acc, t) => {
        const month = new Date(t.tournament_start).toLocaleDateString('vi-VN', {
          month: 'short',
          year: 'numeric',
        });
        const existing = acc.find(item => item.month === month);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ month, count: 1 });
        }
        return acc;
      },
      [] as Array<{ month: string; count: number }>
    );

    return {
      totalRevenue,
      averageParticipants,
      completionRate,
      popularTypes,
      monthlyTrends,
    };
  }, [tournaments]);
};
