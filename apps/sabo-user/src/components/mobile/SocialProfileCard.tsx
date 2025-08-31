import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification } from "../services/notificationService";
import { uploadFile, getPublicUrl } from "../services/storageService";
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'sonner';
import { getDisplayName } from '@/types/unified-profile';
import CardAvatar from '@/components/ui/card-avatar';
import DarkCardAvatar from '@/components/ui/dark-card-avatar';
import { useSocialProfile } from '@/hooks/useSocialProfile';

interface SocialProfile {
 user_id: string;
 display_name: string | undefined;
 full_name: string | undefined;
 avatar_url: string | undefined;
 verified_rank: string | undefined;
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
 const { navigateToSocialProfile } = useSocialProfile();
 
 const [profile, setProfile] = useState<SocialProfile | null>(null);
 const [stats, setStats] = useState<PlayerStats | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  if (userId) {
   fetchProfileData();
  } else {
   toast.error('User ID không hợp lệ');
   navigate('/');
  }
 }, [userId]);

 const fetchProfileData = async () => {
  if (!userId) return;

  try {
   setLoading(true);

   // Development mode: Use mock data for testing with user-* IDs
   if (process.env.NODE_ENV === 'development' && userId.startsWith('user-')) {
    console.log('🧪 Using mock data for development testing');
    
    const mockProfiles = {
     'user-1': {
      user_id: 'user-1',
      display_name: 'BẢO HUYNH',
      full_name: 'Nguyễn Bảo Huynh',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user-1',
      verified_rank: 'G+',
      role: 'player' as const,
     },
     'user-2': {
      user_id: 'user-2',
      display_name: 'SABO BILLIARDS',
      full_name: 'SABO BILLIARDS CLUB',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=user-2',
      verified_rank: 'H+',
      role: 'club_owner' as const,
     },
     'user-3': {
      user_id: 'user-3',
      display_name: 'ACE PLAYER',
      full_name: 'Trần Văn C',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user-3',
      verified_rank: 'I',
      role: 'player' as const,
     },
    };

    const mockStats = {
     'user-1': { elo: 1500, spa: 398, total_matches: 15, ranking_position: 0 },
     'user-2': { elo: 1200, spa: 250, total_matches: 8, ranking_position: 0 },
     'user-3': { elo: 1800, spa: 450, total_matches: 22, ranking_position: 12 },
    };

    const profile = mockProfiles[userId as keyof typeof mockProfiles];
    const stats = mockStats[userId as keyof typeof mockStats];

    if (profile && stats) {
     setProfile(profile);
     setStats(stats);
    } else {
     toast.error('Mock user không tồn tại');
     navigate('/');
     return;
    }
    
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
    .from('player_rankings')
    .select('elo_points, spa_points, matches_played, current_rank, ranking_position')
    .eq('user_id', userId)
    .single();

   if (statsError) {
    console.log('No stats found, using defaults:', statsError);
   }

   setProfile(profileData);
   setStats({
    elo: statsData?.elo_points || 1000,
    spa: statsData?.spa_points || 0,
    total_matches: statsData?.matches_played || 0,
    ranking_position: statsData?.ranking_position || 0,
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

 const handleAvatarClick = () => {
  // Navigate to social profile when clicking avatar (for other users)
  if (profile && profile.user_id !== currentUser?.id) {
   navigateToSocialProfile(profile.user_id);
  }
 };

 if (loading) {
  return (
   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <div className="text-center text-white">
     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
     <h2 className="text-body-large-semibold mb-2">Đang tải thông tin</h2>
     <p className="text-slate-400">Vui lòng chờ trong giây lát...</p>
    </div>
   </div>
  );
 }

 if (!profile) {
  return (
   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <div className="text-center text-white">
     <h2 className="text-title font-bold mb-2">Không tìm thấy người chơi</h2>
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
      
      className='mb-8 cursor-pointer'
      onClick={handleAvatarClick}
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
      
      className='mb-8 cursor-pointer'
      onClick={handleAvatarClick}
     />
    )}

    {/* Action Buttons */}
    {!isOwnProfile && currentUser && (
     <div className="flex gap-3 mt-6">
      <Button
       onClick={handleChallenge}
       className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold py-3 transition-all duration-200"
      >
       <Trophy className="w-4 h-4 mr-2" />
       Thách đấu
      </Button>
      <Button
       onClick={handleMessage}
       variant="outline"
       className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white py-3 transition-all duration-200"
      >
       <MessageCircle className="w-4 h-4 mr-2" />
       Nhắn tin
      </Button>
     </div>
    )}

    {/* Login prompt for non-authenticated users */}
    {!isOwnProfile && !currentUser && (
     <div className="mt-6 text-center">
      <p className="text-slate-400 mb-4">Đăng nhập để thách đấu và nhắn tin</p>
      <Button
       onClick={() => navigate('/auth/login')}
       className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-6 transition-all duration-200"
      >
       Đăng nhập
      </Button>
     </div>
    )}

    {/* Own profile edit button */}
    {isOwnProfile && (
     <Button
      onClick={() => navigate('/profile')}
      variant="outline"
      className="w-full mt-6 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white py-3 transition-all duration-200"
     >
      Chỉnh sửa hồ sơ
     </Button>
    )}
   </div>
  </div>
 );
};

export default SocialProfileCard;
