import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, getUserStatus } from "../services/userService";
import { getTournament, createTournament, joinTournament } from "../services/tournamentService";
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification, getUserNotifications } from "../services/notificationService";
import { getClubProfile, updateClubProfile } from "../services/clubService";
import { supabase } from '@/integrations/supabase/client';
import { safeRelationshipQuery } from '@/utils/relationshipMapper';
import { getDisplayName } from '@/types/unified-profile';

export interface SocialFeedPost {
  id: string;
  type: 'match_result' | 'achievement' | 'challenge' | 'tournament_update';
  user: {
    id: string;
    name: string;
    avatar: string;
    rank: string;
  };
  content: string;
  timestamp: string;
  stats?: {
    likes: number;
    comments: number;
    shares: number;
    score?: string;
    opponent?: string;
    achievement?: string;
    challenge_type?: string;
    tournament_name?: string;
  };
  isLiked?: boolean;
  raw_data?: any;
}

export interface SocialStoryItem {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  type: 'live_match' | 'achievement' | 'highlight' | 'tournament';
  thumbnail?: string;
  isLive?: boolean;
  title: string;
}

export const useSocialFeed = () => {
  const [feedPosts, setFeedPosts] = useState<SocialFeedPost[]>([]);
  const [stories, setStories] = useState<SocialStoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transform match data to feed post
  const transformMatchToPost = (match: any): SocialFeedPost => {
    const winner =
      match.winner_id === match.player1_id
        ? {
            id: match.player1_id,
            name:
              match.player1?.full_name ||
              match.player1?.display_name ||
              'Player 1',
            avatar: match.player1?.avatar_url,
          }
        : {
            id: match.player2_id,
            name:
              match.player2?.full_name ||
              match.player2?.display_name ||
              'Player 2',
            avatar: match.player2?.avatar_url,
          };

    const loser =
      match.winner_id === match.player1_id
        ? {
            id: match.player2_id,
            name:
              match.player2?.full_name ||
              match.player2?.display_name ||
              'Player 2',
          }
        : {
            id: match.player1_id,
            name:
              match.player1?.full_name ||
              match.player1?.display_name ||
              'Player 1',
          };

    return {
      id: `match_${match.id}`,
      type: 'match_result',
      user: {
        id: winner.id,
        name: winner.name,
        avatar: winner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(winner.name)}&background=random&size=40`,
        rank: 'Expert',
      },
      content: `Vừa thắng ${loser.name} với tỷ số ${match.score_player1 || 0}-${match.score_player2 || 0}! 🎱`,
      timestamp:
        new Date(match.created_at).toLocaleDateString('vi-VN') +
        ' ' +
        new Date(match.created_at).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      stats: {
        likes: Math.floor(Math.random() * 20) + 5,
        comments: Math.floor(Math.random() * 10) + 1,
        shares: Math.floor(Math.random() * 5) + 1,
        score: `${match.score_player1 || 0}-${match.score_player2 || 0}`,
        opponent: loser.name,
      },
      isLiked: Math.random() > 0.7,
      raw_data: match,
    };
  };

  // Transform challenge data to feed post
  const transformChallengeToPost = (challenge: any): SocialFeedPost => {
    const challenger = challenge.challenger || {
      full_name: 'Unknown Player',
      display_name: 'Unknown',
      avatar_url: null,
    };

    return {
      id: `challenge_${challenge.id}`,
      type: 'challenge',
      user: {
        id: challenge.challenger_id,
        name: getDisplayName(challenger),
        avatar: challenger.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName(challenger))}&background=random&size=40`,
        rank: 'Pro',
      },
      content: `Ai dám nhận thách đấu với tôi không? Đặt cược ${challenge.bet_points || 100} điểm! 🔥`,
      timestamp:
        new Date(challenge.created_at).toLocaleDateString('vi-VN') +
        ' ' +
        new Date(challenge.created_at).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      stats: {
        likes: Math.floor(Math.random() * 15) + 3,
        comments: Math.floor(Math.random() * 8) + 1,
        shares: Math.floor(Math.random() * 3) + 1,
        challenge_type: `Race to ${challenge.race_to || 5}`,
      },
      isLiked: Math.random() > 0.8,
      raw_data: challenge,
    };
  };

  // Transform tournament data to feed post
  const transformTournamentToPost = (tournament: any): SocialFeedPost => {
    return {
      id: `tournament_${tournament.id}`,
      type: 'tournament_update',
      user: {
        id: 'system',
        name: 'SABO Arena',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent('SABO Arena')}&background=0ea5e9&color=ffffff&size=40`,
        rank: 'System',
      },
      content: `${tournament.name} đang mở đăng ký! Phí tham gia ${tournament.entry_fee || 50000}đ. Hãy đăng ký ngay để nhận vị trí tốt nhất! 🎯`,
      timestamp:
        new Date(tournament.created_at).toLocaleDateString('vi-VN') +
        ' ' +
        new Date(tournament.created_at).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      stats: {
        likes: Math.floor(Math.random() * 30) + 10,
        comments: Math.floor(Math.random() * 15) + 5,
        shares: Math.floor(Math.random() * 8) + 2,
        tournament_name: tournament.name,
      },
      isLiked: Math.random() > 0.6,
      raw_data: tournament,
    };
  };

  // Transform tournament to story
  const transformTournamentToStory = (tournament: any): SocialStoryItem => {
    return {
      id: `story_tournament_${tournament.id}`,
      user: {
        name: 'SABO',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent('SABO')}&background=0ea5e9&color=ffffff&size=64`,
      },
      type: 'tournament',
      title: tournament.name?.substring(0, 15) + '...' || 'Tournament',
      isLive: tournament.status === 'ongoing',
    };
  };

  // Fetch social feed data
  const fetchFeedData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch recent completed matches (simple query without relationships)
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'completed')
        .not('winner_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (matchError) {
        throw matchError;
      }

      // Fetch player profiles separately to avoid relationship issues
      const playerIds = new Set<string>();
      matchData?.forEach(match => {
        if (match.player1_id) playerIds.add(match.player1_id);
        if (match.player2_id) playerIds.add(match.player2_id);
      });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, display_name, avatar_url')
        .in('user_id', Array.from(playerIds));

      const profileMap = (profiles || []).reduce(
        (acc, profile) => {
          acc[profile.user_id] = profile;
          return acc;
        },
        {} as Record<string, any>
      );

      // Merge data manually to ensure compatibility
      const matches =
        matchData?.map(match => ({
          ...match,
          player1: profileMap[match.player1_id] || null,
          player2: profileMap[match.player2_id] || null,
        })) || [];

      // Fetch recent challenges
      const { data: challenges, error: challengeError } = await supabase
        .from('challenges')
        .select(
          `
          *,
          challenger:profiles!challenger_id(full_name, display_name, avatar_url)
        `
        )
        .in('status', ['pending', 'accepted'])
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch active tournaments
      const { data: tournaments, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .in('status', ['registration_open', 'ongoing'])
        .order('created_at', { ascending: false })
        .limit(3);

      if (matchError) console.error('Error fetching matches:', matchError);
      if (challengeError)
        console.error('Error fetching challenges:', challengeError);
      if (tournamentError)
        console.error('Error fetching tournaments:', tournamentError);

      // Transform and combine data
      const allPosts: SocialFeedPost[] = [];

      if (matches) {
        allPosts.push(...matches.map(transformMatchToPost));
      }

      if (challenges) {
        allPosts.push(...challenges.map(transformChallengeToPost));
      }

      if (tournaments) {
        allPosts.push(...tournaments.map(transformTournamentToPost));
      }

      // Sort by timestamp (most recent first)
      allPosts.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setFeedPosts(allPosts);

      // Create stories from multiple sources
      const allStories: SocialStoryItem[] = [];

      // Tournament stories
      if (tournaments) {
        allStories.push(...tournaments.map(transformTournamentToStory));
      }

      // Match stories (recent winners)
      if (matches) {
        const recentMatches = matches.slice(0, 3); // Get 3 most recent matches
        const matchStories = recentMatches.map(match => {
          const winner = match.winner_id === match.player1_id ? 
            { 
              name: match.player1?.full_name || match.player1?.display_name || 'Player 1',
              avatar: match.player1?.avatar_url 
            } : 
            { 
              name: match.player2?.full_name || match.player2?.display_name || 'Player 2',
              avatar: match.player2?.avatar_url 
            };

          return {
            id: `story_match_${match.id}`,
            user: {
              name: winner.name,
              avatar: winner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(winner.name)}&background=random&size=64`,
            },
            type: 'achievement' as const,
            title: 'Vừa thắng trận!',
            isLive: false,
          };
        });
        allStories.push(...matchStories);
      }

      // Challenge stories (active challengers)
      if (challenges) {
        const activeChallengers = challenges.slice(0, 2); // Get 2 most recent challenges
        const challengeStories = activeChallengers.map(challenge => {
          const challenger = challenge.challenger || { full_name: 'Unknown', display_name: 'Unknown', avatar_url: null };
          
          return {
            id: `story_challenge_${challenge.id}`,
            user: {
              name: getDisplayName(challenger),
              avatar: challenger.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName(challenger))}&background=random&size=64`,
            },
            type: 'live_match' as const,
            title: 'Đang thách đấu',
            isLive: true,
          };
        });
        allStories.push(...challengeStories);
      }

      setStories(allStories);
    } catch (err) {
      console.error('Error fetching social feed:', err);
      setError('Failed to load social feed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    // Initial fetch
    fetchFeedData();

    // Subscribe to matches updates
    const matchesChannel = supabase
      .channel('matches-feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        () => fetchFeedData()
      )
      .subscribe();

    // Subscribe to challenges updates
    const challengesChannel = supabase
      .channel('challenges-feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'challenges' },
        () => fetchFeedData()
      )
      .subscribe();

    // Subscribe to tournaments updates
    const tournamentsChannel = supabase
      .channel('tournaments-feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournaments' },
        () => fetchFeedData()
      )
      .subscribe();

    return () => {
      // removeChannel(matchesChannel);
      // removeChannel(challengesChannel);
      // removeChannel(tournamentsChannel);
    };
  }, [fetchFeedData]);

  // Social interaction handlers
  const handleLike = useCallback((postId: string) => {
    setFeedPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              stats: {
                ...post.stats!,
                likes: post.isLiked
                  ? post.stats!.likes - 1
                  : post.stats!.likes + 1,
              },
            }
          : post
      )
    );
  }, []);

  // Delete post handler for admin
  const handleDelete = useCallback(async (postId: string) => {
    try {
      const post = feedPosts.find(p => p.id === postId);
      if (!post) return;

      // Determine the source table and ID
      let recordId = '';

      if (postId.startsWith('match_')) {
        recordId = postId.replace('match_', '');
        const { error } = await supabase
          .from('matches')
          .delete()
          .eq('id', recordId);
        if (error) throw error;
      } else if (postId.startsWith('challenge_')) {
        recordId = postId.replace('challenge_', '');
        const { error } = await supabase
          .from('challenges')
          .delete()
          .eq('id', recordId);
        if (error) throw error;
      } else if (postId.startsWith('tournament_')) {
        recordId = postId.replace('tournament_', '');
        const { error } = await supabase
          .from('tournaments')
          .delete()
          .eq('id', recordId);
        if (error) throw error;
      }

      // Remove from local state immediately
      setFeedPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }, [feedPosts]);

  const refreshFeed = useCallback(() => {
    fetchFeedData();
  }, [fetchFeedData]);

  return {
    feedPosts,
    stories,
    loading,
    error,
    refreshFeed,
    handleLike,
    handleDelete,
    isConnected: true,
  };
};

export default useSocialFeed;
