import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'sonner';
import { getDisplayName } from '@/types/unified-profile';
import CardAvatar from '@/components/ui/card-avatar';
import DarkCardAvatar from '@/components/ui/dark-card-avatar';

interface SocialProfile {
  user_id: string;
  display_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  verified_rank: string | null;
  role: 'player' | 'club_owner' | 'both';
}

interface PlayerStats {
  elo: number;
  spa: number;
  total_matches: number;
  ranking_position: number;
}

const SocialProfileCard: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  const fetchProfileData = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // For testing: Use mock data if userId is 'user-1', 'user-2', etc.
      if (userId.startsWith('user-')) {
        const mockProfile = {
          user_id: userId,
          display_name: userId === 'user-1' ? 'Nguyễn Văn A' : 
                       userId === 'user-2' ? 'SABO BILLIARDS' : 
                       'Test Player',
          full_name: userId === 'user-1' ? 'Nguyễn Văn A' : 
                     userId === 'user-2' ? 'SABO BILLIARDS' : 
                     'Test Player',
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          verified_rank: userId === 'user-1' ? 'A' : 'H+',
          role: userId === 'user-2' ? 'club_owner' as const : 'player' as const,
        };

        const mockStats = {
          elo: 1500,
          spa: 398,
          total_matches: userId === 'user-1' ? 25 : 10,
          ranking_position: userId === 'user-1' ? 5 : 0,
        };

        setProfile(mockProfile);
        setStats(mockStats);
        setLoading(false);
        return;
      }

      // Real database queries for actual user IDs
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, display_name, full_name, avatar_url, verified_rank, role')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast.error('Không tìm thấy người chơi này');
        navigate('/');
        return;
      }

      // Fetch player stats
      const { data: statsData, error: statsError } = await supabase
        .from('player_stats')
        .select('elo, spa_points, total_matches')
        .eq('user_id', userId)
        .single();

      // Fetch ranking
      const { data: rankingData, error: rankingError } = await supabase
        .from('player_rankings')
        .select('ranking_position')
        .eq('user_id', userId)
        .single();

      setProfile(profileData);
      setStats({
        elo: statsData?.elo || 1500,
        spa: statsData?.spa_points || 398,
        total_matches: statsData?.total_matches || 0,
        ranking_position: rankingData?.ranking_position || 0,
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Có lỗi xảy ra khi tải thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleChallenge = () => {
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để thách đấu');
      navigate('/auth/login');
      return;
    }

    if (currentUser.id === userId) {
      toast.info('Bạn không thể thách đấu chính mình');
      return;
    }

    // Navigate to challenges page with pre-selected opponent
    navigate('/challenges', { 
      state: { 
        preSelectedOpponent: {
          id: userId,
          name: getDisplayName(profile),
          avatar: profile?.avatar_url
        }
      }
    });
  };

  const handleMessage = () => {
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để nhắn tin');
      navigate('/auth/login');
      return;
    }

    if (currentUser.id === userId) {
      toast.info('Bạn không thể nhắn tin cho chính mình');
      return;
    }

    // Navigate to messages with conversation
    navigate('/messages', { 
      state: { 
        startConversation: {
          userId: userId,
          userName: getDisplayName(profile),
          userAvatar: profile?.avatar_url
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center text-white">
          <h2 className="text-xl font-bold mb-2">Không tìm thấy người chơi</h2>
          <Button onClick={() => navigate('/')} variant="outline">
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;
  const displayName = getDisplayName(profile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 text-white hover:bg-white/10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại
      </Button>

      {/* Social Profile Card using existing CardAvatar */}
      <div className="max-w-sm mx-auto">
        {theme === 'dark' ? (
          <DarkCardAvatar
            userAvatar={profile.avatar_url || ''}
            onAvatarChange={null} // Completely disable avatar change for social profile view
            uploading={false}
            nickname={displayName}
            rank={profile.verified_rank || 'H+'}
            elo={stats?.elo || 1500}
            spa={stats?.spa || 398}
            ranking={stats?.ranking_position || 0}
            matches={stats?.total_matches || 0}
            size='lg'
            className='mb-8'
          />
        ) : (
          <CardAvatar
            userAvatar={profile.avatar_url || ''}
            onAvatarChange={null} // Completely disable avatar change for social profile view
            uploading={false}
            nickname={displayName}
            rank={profile.verified_rank || 'H+'}
            elo={stats?.elo || 1500}
            spa={stats?.spa || 398}
            ranking={stats?.ranking_position || 0}
            matches={stats?.total_matches || 0}
            size='lg'
            className='mb-8'
          />
        )}

        {/* Action Buttons */}
        {!isOwnProfile && currentUser && (
          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleChallenge}
              className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold py-3"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Thách đấu
            </Button>
            <Button
              onClick={handleMessage}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white py-3"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Nhắn tin
            </Button>
          </div>
        )}

        {isOwnProfile && (
          <Button
            onClick={() => navigate('/profile')}
            variant="outline"
            className="w-full mt-6 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white py-3"
          >
            Chỉnh sửa hồ sơ
          </Button>
        )}
      </div>
    </div>
  );
};

export default SocialProfileCard;
