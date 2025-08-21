import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface RecentActivity {
  id: string;
  type: 'match_result' | 'tournament_join' | 'spa_earned' | 'profile_update' | 'challenge_received';
  title: string;
  description?: string;
  time: string;
  points?: { value: string; label: string };
  icon_type: 'trophy' | 'star' | 'user' | 'award' | 'challenge';
  gradient_type: 'blue' | 'emerald' | 'amber' | 'purple' | 'red';
}

export const useRecentActivities = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get recent matches (simple query without relations for now)
        const { data: matches, error: matchError } = await supabase
          .from('matches')
          .select('id, created_at, status, winner_id, player1_id, player2_id')
          .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(5);

        if (matchError) throw matchError;

        // Get player names for matches (separate query)
        const playerIds = new Set<string>();
        (matches || []).forEach(match => {
          if (match.player1_id) playerIds.add(match.player1_id);
          if (match.player2_id) playerIds.add(match.player2_id);
        });

        const { data: players, error: playersError } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', Array.from(playerIds));

        if (playersError) throw playersError;

        // Create player lookup map
        const playerMap = new Map();
        (players || []).forEach(player => {
          playerMap.set(player.user_id, player.full_name);
        });

        // Get recent tournament registrations (avoid PostgREST relationship)
        const { data: tournamentRegistrations, error: tournamentRegError } = await supabase
          .from('tournament_registrations')
          .select('id, created_at, tournament_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (tournamentRegError) throw tournamentRegError;

        // Get tournament names separately to avoid schema cache issues
        let tournamentNames = new Map();
        if (tournamentRegistrations && tournamentRegistrations.length > 0) {
          const tournamentIds = tournamentRegistrations.map(tr => tr.tournament_id);
          const { data: tournamentData, error: tournamentDataError } = await supabase
            .from('tournaments')
            .select('id, name')
            .in('id', tournamentIds);

          if (!tournamentDataError && tournamentData) {
            tournamentData.forEach(t => {
              tournamentNames.set(t.id, t.name);
            });
          }
        }

        // Get recent profile updates
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('updated_at')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;

        if (!cancelled) {
          const recentActivities: RecentActivity[] = [];

          // Add match results
          (matches || []).forEach(match => {
            const isPlayer1 = match.player1_id === user.id;
            const opponentId = isPlayer1 ? match.player2_id : match.player1_id;
            const opponentName = playerMap.get(opponentId) || 'Đối thủ';
            
            const isWin = match.winner_id === user.id;

            recentActivities.push({
              id: `match-${match.id}`,
              type: 'match_result',
              title: `${isWin ? 'Thắng' : 'Thua'} vs ${opponentName}`,
              time: formatTimeAgo(match.created_at),
              points: isWin ? { value: '+25', label: 'ELO' } : { value: '-15', label: 'ELO' },
              icon_type: 'trophy',
              gradient_type: isWin ? 'emerald' : 'red'
            });
          });

          // Add tournament joins
          (tournamentRegistrations || []).forEach(registration => {
            const tournamentName = tournamentNames.get(registration.tournament_id) || 'giải đấu';
            recentActivities.push({
              id: `tournament-${registration.id}`,
              type: 'tournament_join',
              title: `Tham gia ${tournamentName}`,
              time: formatTimeAgo(registration.created_at),
              icon_type: 'trophy',
              gradient_type: 'blue'
            });
          });

          // Add profile update (if recent)
          if (profile?.updated_at) {
            const updateTime = new Date(profile.updated_at);
            const daysSinceUpdate = (Date.now() - updateTime.getTime()) / (1000 * 60 * 60 * 24);
            
            if (daysSinceUpdate < 7) {
              recentActivities.push({
                id: 'profile-update',
                type: 'profile_update',
                title: 'Cập nhật hồ sơ',
                time: formatTimeAgo(profile.updated_at),
                icon_type: 'user',
                gradient_type: 'amber'
              });
            }
          }

          // Sort by time and limit to 5 most recent
          recentActivities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
          setActivities(recentActivities.slice(0, 5));
        }
      } catch (e: any) {
        if (!cancelled) {
          console.error('Error loading recent activities:', e);
          setError(e.message || 'Load activities failed');
          // Fallback to empty array
          setActivities([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return { activities, loading, error };
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }
  
  return date.toLocaleDateString('vi-VN');
};
