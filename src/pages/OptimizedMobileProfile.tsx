import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import { useAvatar } from '@/contexts/AvatarContext';
import { useTheme } from '@/hooks/useTheme';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SaboAvatar } from '@/components/ui/sabo-avatar';
import { AvatarCustomizer } from '@/components/ui/avatar-customizer';
import PolaroidFrame from '@/components/ui/polaroid-frame';
import CardAvatar from '@/components/ui/card-avatar';
import DarkCardAvatar from '@/components/ui/dark-card-avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Camera,
  MapPin,
  User,
  UserCircle,
  Phone,
  Calendar,
  Trophy,
  ArrowUp,
  Edit3,
  Star,
  TrendingUp,
  Activity,
  Target,
  Zap,
  ChevronRight,
  Settings,
  Award,
  Shield,
  Building,
  Palette,
} from 'lucide-react';
import { isAdminUser } from '@/utils/adminHelpers';

interface ProfileData {
  user_id: string;
  display_name: string;
  phone: string;
  bio: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  city: string;
  district: string;
  avatar_url: string;
  member_since: string;
  role: 'player' | 'club_owner' | 'both';
  active_role: 'player' | 'club_owner';
  verified_rank: string | null;
  completion_percentage?: number;
}

const OptimizedMobileProfile = () => {
  const { user } = useAuth();
  const { avatarUrl, updateAvatar } = useAvatar();
  const { theme } = useTheme();
  const [profile, setProfile] = useState<ProfileData>({
    user_id: '',
    display_name: '',
    phone: '',
    bio: '',
    skill_level: 'beginner',
    city: '',
    district: '',
    avatar_url: '',
    member_since: '',
    role: 'player',
    active_role: 'player',
    verified_rank: null,
    completion_percentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState('activities');

  // Handle scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        const profileData = {
          user_id: data.user_id || user.id,
          display_name: data.display_name || data.full_name || '',
          phone: data.phone || user.phone || '',
          bio: data.bio || '',
          skill_level: (data.skill_level || 'beginner') as
            | 'beginner'
            | 'intermediate'
            | 'advanced'
            | 'pro',
          city: data.city || '',
          district: data.district || '',
          avatar_url: data.avatar_url || '',
          member_since: data.member_since || data.created_at || '',
          role: (data.role || 'player') as 'player' | 'club_owner' | 'both',
          active_role: (data.active_role || 'player') as
            | 'player'
            | 'club_owner',
          verified_rank: data.verified_rank || null,
          completion_percentage: data.completion_percentage || 0,
        };
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const compressImage = (
    file: File,
    maxSizeKB: number = 500
  ): Promise<File> => {
    return new Promise(resolve => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        const targetSize = 400;
        canvas.width = targetSize;
        canvas.height = targetSize;

        const { width, height } = img;
        const size = Math.min(width, height);
        const offsetX = (width - size) / 2;
        const offsetY = (height - size) / 2;

        ctx.drawImage(
          img,
          offsetX,
          offsetY,
          size,
          size,
          0,
          0,
          targetSize,
          targetSize
        );

        let quality = 0.8;
        const tryCompress = () => {
          canvas.toBlob(
            blob => {
              if (blob && (blob.size <= maxSizeKB * 1024 || quality <= 0.1)) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                quality -= 0.1;
                tryCompress();
              }
            },
            'image/jpeg',
            quality
          );
        };

        tryCompress();
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleAvatarUpload = async (file: File, croppedDataUrl?: string) => {
    if (!file || !user) return;

    setUploading(true);

    try {
      let uploadFile = file;
      
      // Compress if needed
      if (file.size > 500 * 1024) {
        toast.info('Đang nén ảnh để tối ưu...');
        uploadFile = await compressImage(file);
      }

      const fileExt = 'jpg';
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, uploadFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl + '?t=' + new Date().getTime();

      await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id);

      await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      });

      setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
      updateAvatar(avatarUrl);

      toast.success('Đã cập nhật ảnh đại diện!');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error('Lỗi khi tải ảnh: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center px-4'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  const skillLevels = {
    beginner: { 
      label: 'Người mới', 
      color: theme === 'dark' 
        ? 'bg-green-900/50 text-green-200 border border-green-800/50' 
        : 'bg-green-100 text-green-800'
    },
    intermediate: { 
      label: 'Trung bình', 
      color: theme === 'dark' 
        ? 'bg-blue-900/50 text-blue-200 border border-blue-800/50' 
        : 'bg-blue-100 text-blue-800'
    },
    advanced: { 
      label: 'Khá', 
      color: theme === 'dark' 
        ? 'bg-purple-900/50 text-purple-200 border border-purple-800/50' 
        : 'bg-purple-100 text-purple-800'
    },
    pro: { 
      label: 'Chuyên nghiệp', 
      color: theme === 'dark' 
        ? 'bg-yellow-900/50 text-yellow-200 border border-yellow-800/50' 
        : 'bg-yellow-100 text-yellow-800'
    },
  };
  // Fallback nếu skill_level không hợp lệ
  const skillKey = skillLevels[profile.skill_level] ? profile.skill_level : 'beginner';
  
  // Dynamic colors based on theme
  const borderColor = theme === 'light' ? '#000000' : '#ffffff';
  const shadowColor = theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)';
  const frameStroke = theme === 'light' ? 'black' : 'white';

  return (

    <>
      {/* Full Screen Background Overlay - Outside PageLayout */}
      {theme === 'dark' && (
        <div 
          className='fixed inset-0 w-full h-full z-0'
          style={{
            backgroundImage: 'url(https://exlqvlbawytbglioqfbc.supabase.co/storage/v1/object/public/logo//billiards-background.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        />
      )}
      <PageLayout variant='dashboard' className={theme === 'dark' ? 'relative z-10 bg-transparent' : ''}>
        <Helmet>
          <title>Hồ sơ cá nhân - SABO ARENA</title>
        </Helmet>
        <div className='pb-20 min-h-screen relative' style={theme === 'light' ? {
          backgroundImage: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)'
        } : undefined}>
          {/* Card Avatar Layout - New Design */}
          <div className='relative flex flex-col items-center justify-start pt-2'>
            {theme === 'dark' ? (
              <DarkCardAvatar
                userAvatar={profile.avatar_url}
                onAvatarChange={handleAvatarUpload}
                uploading={uploading}
                nickname={profile.display_name || 'Chưa đặt tên'}
                rank={profile.verified_rank || 'K'}
                elo={1485}
                spa={320}
                ranking={89}
                matches={37}
                size="md"
                className="mb-8"
              />
            ) : (
              <CardAvatar
                userAvatar={profile.avatar_url}
                onAvatarChange={handleAvatarUpload}
                uploading={uploading}
                nickname={profile.display_name || 'Chưa đặt tên'}
                rank={profile.verified_rank || 'K'}
                elo={1485}
                spa={320}
                ranking={89}
                matches={37}
                size="md"
                className="mb-8"
              />
            )}
            
          </div>

        {/* Profile Content Tabs */}
        <Card className={`overflow-hidden ${
          theme === 'dark' 
            ? 'bg-slate-900/50 border-slate-700/60 backdrop-blur-sm' 
            : 'bg-white border-slate-200'
        }`}>
          <CardContent className='p-0'>
            {/* Tab Navigation - Gradient Icons with Shadow */}
            <div className={`flex ${
              theme === 'dark' 
                ? 'border-b border-slate-700/50' 
                : 'border-b border-slate-200'
            }`}>
              <button 
                className={`flex-1 px-2 py-3 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'activities' 
                    ? theme === 'dark'
                      ? 'text-white border-b-2 border-blue-400'
                      : 'text-slate-900 border-b-2 border-blue-500'
                    : theme === 'dark'
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setActiveTab('activities')}
              >
                <div className={`relative mx-auto mb-1 w-4 h-4 flex items-center justify-center ${
                  activeTab === 'activities' 
                    ? 'drop-shadow-lg' 
                    : 'drop-shadow-sm'
                }`}>
                  <Activity className={`w-4 h-4 transition-all duration-200 ${
                    activeTab === 'activities'
                      ? theme === 'dark'
                        ? 'text-blue-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                        : 'text-blue-600 drop-shadow-[0_2px_4px_rgba(37,99,235,0.4)]'
                      : theme === 'dark'
                        ? 'text-slate-400'
                        : 'text-slate-500'
                  }`} />
                </div>
                <div className='text-xs font-semibold'>Hoạt động</div>
              </button>
              
              <button 
                className={`flex-1 px-2 py-3 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'basic' 
                    ? theme === 'dark'
                      ? 'text-white border-b-2 border-emerald-400'
                      : 'text-slate-900 border-b-2 border-emerald-500'
                    : theme === 'dark'
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setActiveTab('basic')}
              >
                <div className={`relative mx-auto mb-1 w-4 h-4 flex items-center justify-center ${
                  activeTab === 'basic' 
                    ? 'drop-shadow-lg' 
                    : 'drop-shadow-sm'
                }`}>
                  <UserCircle className={`w-4 h-4 transition-all duration-200 ${
                    activeTab === 'basic'
                      ? theme === 'dark'
                        ? 'text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                        : 'text-emerald-600 drop-shadow-[0_2px_4px_rgba(5,150,105,0.4)]'
                      : theme === 'dark'
                        ? 'text-slate-400'
                        : 'text-slate-500'
                  }`} />
                </div>
                <div className='text-xs font-semibold'>Cá nhân</div>
              </button>
              
              <button 
                className={`flex-1 px-2 py-3 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'rank' 
                    ? theme === 'dark'
                      ? 'text-white border-b-2 border-purple-400'
                      : 'text-slate-900 border-b-2 border-purple-500'
                    : theme === 'dark'
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setActiveTab('rank')}
              >
                <div className={`relative mx-auto mb-1 w-4 h-4 flex items-center justify-center ${
                  activeTab === 'rank' 
                    ? 'drop-shadow-lg' 
                    : 'drop-shadow-sm'
                }`}>
                  <Award className={`w-4 h-4 transition-all duration-200 ${
                    activeTab === 'rank'
                      ? theme === 'dark'
                        ? 'text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]'
                        : 'text-purple-600 drop-shadow-[0_2px_4px_rgba(147,51,234,0.4)]'
                      : theme === 'dark'
                        ? 'text-slate-400'
                        : 'text-slate-500'
                  }`} />
                </div>
                <div className='text-xs font-semibold'>Đăng ký hạng</div>
              </button>
              
              <button 
                className={`flex-1 px-2 py-3 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'club' 
                    ? theme === 'dark'
                      ? 'text-white border-b-2 border-cyan-400'
                      : 'text-slate-900 border-b-2 border-cyan-500'
                    : theme === 'dark'
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setActiveTab('club')}
              >
                <div className={`relative mx-auto mb-1 w-4 h-4 flex items-center justify-center ${
                  activeTab === 'club' 
                    ? 'drop-shadow-lg' 
                    : 'drop-shadow-sm'
                }`}>
                  <Star className={`w-4 h-4 transition-all duration-200 ${
                    activeTab === 'club'
                      ? theme === 'dark'
                        ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                        : 'text-cyan-600 drop-shadow-[0_2px_4px_rgba(8,145,178,0.4)]'
                      : theme === 'dark'
                        ? 'text-slate-400'
                        : 'text-slate-500'
                  }`} />
                </div>
                <div className='text-xs font-semibold'>Đăng ký CLB</div>
              </button>
            </div>

            {/* Tab Content - Activities */}
            {activeTab === 'activities' && (
              <div className='p-5 space-y-6'>
                {/* Recent Match Results */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-2 mb-4'>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      theme === 'dark' 
                        ? 'bg-slate-700/50 border border-slate-600/30' 
                        : 'bg-slate-100 border border-slate-200'
                    }`}>
                      <Trophy className='w-3.5 h-3.5 text-slate-400' />
                    </div>
                    <h4 className={`text-sm font-semibold tracking-wide ${
                      theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                    }`}>Kết quả trận đấu gần đây</h4>
                  </div>
                  
                  {/* Win Match Card */}
                  <div className={`group relative overflow-hidden rounded-xl border ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-emerald-950/30 to-emerald-900/20 border-emerald-800/30 backdrop-blur-sm' 
                      : 'bg-gradient-to-r from-emerald-50 to-green-50/50 border-emerald-100'
                  }`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-500'
                    }`}></div>
                    <div className='flex items-center gap-4 p-4'>
                      <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center ${
                        theme === 'dark' 
                          ? 'bg-emerald-500/20 ring-1 ring-emerald-400/30' 
                          : 'bg-emerald-100 ring-1 ring-emerald-200'
                      }`}>
                        <Trophy className={`w-5 h-5 ${
                          theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'
                        }`} />
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                          theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-500'
                        }`}></div>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className={`text-sm font-medium mb-1 ${
                          theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
                        }`}>Thắng vs Nguyễn Văn A</div>
                        <div className={`text-xs flex items-center gap-2 ${
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          <span className='font-medium'>10-8</span>
                          <span className='w-1 h-1 rounded-full bg-current opacity-50'></span>
                          <span>2 giờ trước</span>
                        </div>
                      </div>
                      <div className={`text-right ${
                        theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'
                      }`}>
                        <div className='text-sm font-bold'>+25</div>
                        <div className='text-xs font-medium opacity-80'>ELO</div>
                      </div>
                    </div>
                  </div>

                  {/* Loss Match Card */}
                  <div className={`group relative overflow-hidden rounded-xl border ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-rose-950/30 to-red-900/20 border-rose-800/30 backdrop-blur-sm' 
                      : 'bg-gradient-to-r from-rose-50 to-red-50/50 border-rose-100'
                  }`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      theme === 'dark' ? 'bg-rose-400' : 'bg-rose-500'
                    }`}></div>
                    <div className='flex items-center gap-4 p-4'>
                      <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center ${
                        theme === 'dark' 
                          ? 'bg-rose-500/20 ring-1 ring-rose-400/30' 
                          : 'bg-rose-100 ring-1 ring-rose-200'
                      }`}>
                        <Target className={`w-5 h-5 ${
                          theme === 'dark' ? 'text-rose-300' : 'text-rose-600'
                        }`} />
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                          theme === 'dark' ? 'bg-rose-400' : 'bg-rose-500'
                        }`}></div>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className={`text-sm font-medium mb-1 ${
                          theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
                        }`}>Thua vs Trần Văn B</div>
                        <div className={`text-xs flex items-center gap-2 ${
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          <span className='font-medium'>8-10</span>
                          <span className='w-1 h-1 rounded-full bg-current opacity-50'></span>
                          <span>1 ngày trước</span>
                        </div>
                      </div>
                      <div className={`text-right ${
                        theme === 'dark' ? 'text-rose-300' : 'text-rose-600'
                      }`}>
                        <div className='text-sm font-bold'>-15</div>
                        <div className='text-xs font-medium opacity-80'>ELO</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Challenges */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-2 mb-4'>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      theme === 'dark' 
                        ? 'bg-slate-700/50 border border-slate-600/30' 
                        : 'bg-slate-100 border border-slate-200'
                    }`}>
                      <Zap className='w-3.5 h-3.5 text-slate-400' />
                    </div>
                    <h4 className={`text-sm font-semibold tracking-wide ${
                      theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                    }`}>Thách đấu đang chờ</h4>
                  </div>
                  
                  <div className={`group relative overflow-hidden rounded-xl border ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-blue-950/30 to-indigo-900/20 border-blue-800/30 backdrop-blur-sm' 
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50/50 border-blue-100'
                  }`}>
                    <div className='flex items-center gap-4 p-4'>
                      <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center ${
                        theme === 'dark' 
                          ? 'bg-blue-500/20 ring-1 ring-blue-400/30' 
                          : 'bg-blue-100 ring-1 ring-blue-200'
                      }`}>
                        <Zap className={`w-5 h-5 ${
                          theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
                        }`} />
                        <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse ${
                          theme === 'dark' ? 'bg-amber-400' : 'bg-amber-500'
                        }`}></div>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className={`text-sm font-medium mb-1 ${
                          theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
                        }`}>Thách đấu từ Lê Văn C</div>
                        <div className={`text-xs flex items-center gap-2 ${
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          <span>Hạn:</span>
                          <span className='font-medium'>2 ngày nữa</span>
                        </div>
                      </div>
                      <Button 
                        size='sm' 
                        variant='outline' 
                        className={`text-xs font-medium px-3 py-1.5 h-auto ${
                          theme === 'dark' 
                            ? 'bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-2 mb-4'>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      theme === 'dark' 
                        ? 'bg-slate-700/50 border border-slate-600/30' 
                        : 'bg-slate-100 border border-slate-200'
                    }`}>
                      <Activity className='w-3.5 h-3.5 text-slate-400' />
                    </div>
                    <h4 className={`text-sm font-semibold tracking-wide ${
                      theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                    }`}>Hành động nhanh</h4>
                  </div>
                  
                  <div className='grid grid-cols-2 gap-3'>
                    <Button 
                      variant='outline' 
                      className={`h-16 flex-col gap-2 border-dashed transition-all duration-200 ${
                        theme === 'dark' 
                          ? 'bg-slate-800/30 border-slate-600/50 text-slate-300 hover:bg-slate-700/40 hover:border-slate-500/60' 
                          : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        theme === 'dark' 
                          ? 'bg-rose-500/20 ring-1 ring-rose-400/30' 
                          : 'bg-rose-100 ring-1 ring-rose-200'
                      }`}>
                        <Target className={`w-4 h-4 ${
                          theme === 'dark' ? 'text-rose-300' : 'text-rose-600'
                        }`} />
                      </div>
                      <span className='text-xs font-medium'>Tạo thách đấu</span>
                    </Button>
                    
                    <Button 
                      variant='outline' 
                      className={`h-16 flex-col gap-2 border-dashed transition-all duration-200 ${
                        theme === 'dark' 
                          ? 'bg-slate-800/30 border-slate-600/50 text-slate-300 hover:bg-slate-700/40 hover:border-slate-500/60' 
                          : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        theme === 'dark' 
                          ? 'bg-indigo-500/20 ring-1 ring-indigo-400/30' 
                          : 'bg-indigo-100 ring-1 ring-indigo-200'
                      }`}>
                        <Trophy className={`w-4 h-4 ${
                          theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'
                        }`} />
                      </div>
                      <span className='text-xs font-medium'>Xem bảng xếp hạng</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content - Avatar Customizer - Temporarily Hidden */}
            {false && activeTab === 'avatar' && (
              <div className='p-4'>
                <AvatarCustomizer 
                  size="lg"
                  showControls={true}
                  showUpload={true}
                  fallbackName={profile.display_name || 'User'}
                  className="w-full"
                />
              </div>
            )}

            {/* Tab Content - Personal Info */}
            {activeTab === 'basic' && (
              <div className='p-4 space-y-3'>
                <div className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'>
                  <Phone className='w-4 h-4 text-muted-foreground' />
                  <div>
                    <div className='text-sm font-medium'>Số điện thoại</div>
                    <div className='text-xs text-muted-foreground'>
                      {profile.phone || 'Chưa cập nhật'}
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'>
                  <MapPin className='w-4 h-4 text-muted-foreground' />
                  <div>
                    <div className='text-sm font-medium'>Địa điểm</div>
                    <div className='text-xs text-muted-foreground'>
                      {profile.city && profile.district 
                        ? `${profile.district}, ${profile.city}`
                        : 'Chưa cập nhật'
                      }
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'>
                  <Star className='w-4 h-4 text-muted-foreground' />
                  <div>
                    <div className='text-sm font-medium'>Trình độ</div>
                    <div className='text-xs text-muted-foreground'>
                      {skillLevels[skillKey].label}
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'>
                  <Calendar className='w-4 h-4 text-muted-foreground' />
                  <div>
                    <div className='text-sm font-medium'>Thành viên từ</div>
                    <div className='text-xs text-muted-foreground'>
                      {profile.member_since
                        ? new Date(profile.member_since).toLocaleDateString('vi-VN')
                        : 'Không rõ'
                      }
                    </div>
                  </div>
                </div>

                <Button 
                  variant='outline' 
                  size='sm' 
                  className='w-full mt-4'
                  onClick={() => (window.location.href = '/settings')}
                >
                  <Edit3 className='w-4 h-4 mr-2' />
                  Chỉnh sửa thông tin
                </Button>
              </div>
            )}

            {/* Tab Content - Rank Verification */}
            {activeTab === 'rank' && (
              <div className='p-4 space-y-3'>
                <div className='text-center py-6'>
                  <Shield className='w-12 h-12 mx-auto text-muted-foreground mb-3' />
                  <h4 className='text-sm font-medium mb-2'>Đăng ký xác nhận hạng</h4>
                  <p className='text-xs text-muted-foreground mb-4'>
                    Xác nhận trình độ chơi bida của bạn thông qua câu lạc bộ uy tín
                  </p>
                  {profile.verified_rank ? (
                    <div className={`bg-green-50 border border-green-200 rounded-lg p-3 ${
                      theme === 'dark' 
                        ? 'bg-green-900/20 border-green-800/50 backdrop-blur-sm' 
                        : 'bg-green-50 border-green-200'
                    }`}>
                      <div className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-green-200' : 'text-green-800'
                      }`}>
                        Đã xác thực: {profile.verified_rank}
                      </div>
                      <div className={`text-xs mt-1 ${
                        theme === 'dark' ? 'text-green-300' : 'text-green-600'
                      }`}>
                        Tài khoản của bạn đã được xác thực
                      </div>
                    </div>
                  ) : (
                    <Button 
                      variant='outline' 
                      size='sm'
                      onClick={() => (window.location.href = '/rank-registration')}
                    >
                      <Award className='w-4 h-4 mr-2' />
                      Đăng ký xác nhận hạng
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Tab Content - Club Registration */}
            {activeTab === 'club' && (
              <div className='p-4 space-y-3'>
                <div className='text-center py-6'>
                  <Building className='w-12 h-12 mx-auto text-muted-foreground mb-3' />
                  <h4 className='text-sm font-medium mb-2'>Đăng ký câu lạc bộ</h4>
                  <p className='text-xs text-muted-foreground mb-4'>
                    Tạo và đăng ký câu lạc bộ bida của riêng bạn
                  </p>
                  {profile.role === 'club_owner' || profile.role === 'both' ? (
                    <div className='space-y-2'>
                      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${
                        theme === 'dark' 
                          ? 'bg-blue-900/20 border-blue-800/50 backdrop-blur-sm' 
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-blue-200' : 'text-blue-800'
                        }`}>
                          Bạn đã là chủ CLB
                        </div>
                        <div className={`text-xs mt-1 ${
                          theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
                        }`}>
                          Quản lý câu lạc bộ hiện tại của bạn
                        </div>
                      </div>
                      <Button variant='outline' size='sm' className='w-full'>
                        <Building className='w-4 h-4 mr-2' />
                        Quản lý CLB hiện tại
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant='outline' 
                      size='sm'
                      onClick={() => (window.location.href = '/club-registration')}
                    >
                      <Building className='w-4 h-4 mr-2' />
                      Đăng ký CLB mới
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities - Elegant Design */}
        <Card className={`overflow-hidden ${
          theme === 'dark' 
            ? 'bg-slate-900/40 border-slate-700/50 backdrop-blur-sm' 
            : 'bg-white border-slate-200'
        }`}>
          <CardHeader className='pb-4 border-b border-slate-200/10'>
            <CardTitle className={`text-base font-semibold flex items-center justify-between ${
              theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
            }`}>
              <div className='flex items-center gap-2'>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  theme === 'dark' 
                    ? 'bg-slate-700/50 border border-slate-600/30' 
                    : 'bg-slate-100 border border-slate-200'
                }`}>
                  <Activity className='w-3.5 h-3.5 text-slate-400' />
                </div>
                Hoạt động gần đây
              </div>
              <Button 
                variant='ghost' 
                size='sm' 
                className={`text-xs h-7 px-2 ${
                  theme === 'dark' 
                    ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50' 
                    : 'text-slate-500 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                Xem tất cả <ChevronRight className='w-3 h-3 ml-1' />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className='p-5 space-y-4'>
            {/* Tournament Activity */}
            <div className={`group relative overflow-hidden rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-blue-950/30 to-indigo-900/20 border-blue-800/30 backdrop-blur-sm' 
                : 'bg-gradient-to-r from-blue-50 to-indigo-50/50 border-blue-100'
            }`}>
              <div className='flex items-center gap-4 p-3'>
                <div className={`relative w-9 h-9 rounded-lg flex items-center justify-center ${
                  theme === 'dark' 
                    ? 'bg-blue-500/20 ring-1 ring-blue-400/30' 
                    : 'bg-blue-100 ring-1 ring-blue-200'
                }`}>
                  <Trophy className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
                  }`} />
                  <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                    theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
                  }`}></div>
                </div>
                <div className='flex-1 min-w-0'>
                  <div className={`text-sm font-medium mb-0.5 ${
                    theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
                  }`}>Tham gia giải đấu mới</div>
                  <div className={`text-xs ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`}>2 giờ trước</div>
                </div>
              </div>
            </div>

            {/* SPA Points Activity */}
            <div className={`group relative overflow-hidden rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-emerald-950/30 to-green-900/20 border-emerald-800/30 backdrop-blur-sm' 
                : 'bg-gradient-to-r from-emerald-50 to-green-50/50 border-emerald-100'
            }`}>
              <div className='flex items-center gap-4 p-3'>
                <div className={`relative w-9 h-9 rounded-lg flex items-center justify-center ${
                  theme === 'dark' 
                    ? 'bg-emerald-500/20 ring-1 ring-emerald-400/30' 
                    : 'bg-emerald-100 ring-1 ring-emerald-200'
                }`}>
                  <Star className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'
                  }`} />
                  <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                    theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-500'
                  }`}></div>
                </div>
                <div className='flex-1 min-w-0'>
                  <div className={`text-sm font-medium mb-0.5 ${
                    theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
                  }`}>Nhận 50 SPA Points</div>
                  <div className={`text-xs ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`}>1 ngày trước</div>
                </div>
                <div className={`text-right ${
                  theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'
                }`}>
                  <div className='text-sm font-bold'>+50</div>
                  <div className='text-xs font-medium opacity-80'>SPA</div>
                </div>
              </div>
            </div>

            {/* Update Profile Activity */}
            <div className={`group relative overflow-hidden rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-amber-950/30 to-yellow-900/20 border-amber-800/30 backdrop-blur-sm' 
                : 'bg-gradient-to-r from-amber-50 to-yellow-50/50 border-amber-100'
            }`}>
              <div className='flex items-center gap-4 p-3'>
                <div className={`relative w-9 h-9 rounded-lg flex items-center justify-center ${
                  theme === 'dark' 
                    ? 'bg-amber-500/20 ring-1 ring-amber-400/30' 
                    : 'bg-amber-100 ring-1 ring-amber-200'
                }`}>
                  <User className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-amber-300' : 'text-amber-600'
                  }`} />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className={`text-sm font-medium mb-0.5 ${
                    theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
                  }`}>Cập nhật hồ sơ</div>
                  <div className={`text-xs ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`}>3 ngày trước</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements - Modern Design */}
        <Card className={`overflow-hidden ${
          theme === 'dark' 
            ? 'bg-slate-900/40 border-slate-700/50 backdrop-blur-sm' 
            : 'bg-white border-slate-200'
        }`}>
          <CardHeader className='pb-4 border-b border-slate-200/10'>
            <CardTitle className={`text-base font-semibold flex items-center justify-between ${
              theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
            }`}>
              <div className='flex items-center gap-2'>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  theme === 'dark' 
                    ? 'bg-slate-700/50 border border-slate-600/30' 
                    : 'bg-slate-100 border border-slate-200'
                }`}>
                  <Award className='w-3.5 h-3.5 text-slate-400' />
                </div>
                Thành tích
              </div>
              <Button 
                variant='ghost' 
                size='sm' 
                className={`text-xs h-7 px-2 ${
                  theme === 'dark' 
                    ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50' 
                    : 'text-slate-500 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                Xem tất cả <ChevronRight className='w-3 h-3 ml-1' />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className='p-5 space-y-4'>
            <div className={`group relative overflow-hidden rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-violet-950/30 to-purple-900/20 border-violet-800/30 backdrop-blur-sm' 
                : 'bg-gradient-to-r from-violet-50 to-purple-50/50 border-violet-100'
            }`}>
              <div className='flex items-center gap-4 p-4'>
                <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-violet-500/30 to-purple-500/20 ring-2 ring-violet-400/30' 
                    : 'bg-gradient-to-br from-violet-200 to-purple-200 ring-2 ring-violet-300'
                }`}>
                  <Trophy className={`w-6 h-6 ${
                    theme === 'dark' ? 'text-violet-300' : 'text-violet-700'
                  }`} />
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                    theme === 'dark' ? 'bg-violet-400 text-violet-900' : 'bg-violet-500 text-white'
                  }`}>✨</div>
                </div>
                <div className='flex-1 min-w-0'>
                  <div className={`text-sm font-semibold mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>Người mới xuất sắc</div>
                  <div className={`text-xs ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-500'
                  }`}>Hoàn thành 5 trận đấu đầu tiên</div>
                </div>
                <div className={`text-right ${
                  theme === 'dark' ? 'text-violet-300' : 'text-violet-600'
                }`}>
                  <div className='text-sm font-bold'>+100</div>
                  <div className='text-xs opacity-80'>EXP</div>
                </div>
              </div>
            </div>

            {/* Second Achievement */}
            <div className={`group relative overflow-hidden rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-blue-950/30 to-indigo-900/20 border-blue-800/30 backdrop-blur-sm' 
                : 'bg-gradient-to-r from-blue-50 to-indigo-50/50 border-blue-100'
            }`}>
              <div className='flex items-center gap-4 p-4'>
                <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-blue-500/30 to-indigo-500/20 ring-2 ring-blue-400/30' 
                    : 'bg-gradient-to-br from-blue-200 to-indigo-200 ring-2 ring-blue-300'
                }`}>
                  <Target className={`w-6 h-6 ${
                    theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                  }`} />
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                    theme === 'dark' ? 'bg-blue-400 text-blue-900' : 'bg-blue-500 text-white'
                  }`}>🎯</div>
                </div>
                <div className='flex-1 min-w-0'>
                  <div className={`text-sm font-semibold mb-1 ${
                    theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
                  }`}>Chính xác</div>
                  <div className={`text-xs ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`}>Độ chính xác &gt; 80%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Completion */}
        <Card className={`overflow-hidden ${
          theme === 'dark' 
            ? 'bg-slate-900/40 border-slate-700/50 backdrop-blur-sm' 
            : 'bg-white border-slate-200'
        }`}>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-2'>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  theme === 'dark' 
                    ? 'bg-slate-700/50 border border-slate-600/30' 
                    : 'bg-slate-100 border border-slate-200'
                }`}>
                  <Settings className='w-3.5 h-3.5 text-slate-400' />
                </div>
                <span className={`text-sm font-semibold ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
                }`}>Hoàn thiện hồ sơ</span>
              </div>
              <span className={`text-sm font-bold ${
                theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
              }`}>
                {profile.completion_percentage || 75}%
              </span>
            </div>
            <div className={`w-full rounded-full h-3 mb-3 ${
              theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-200'
            }`}>
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600'
                }`}
                style={{ width: `${profile.completion_percentage || 75}%` }}
              />
            </div>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Hoàn thiện hồ sơ để tăng uy tín và cơ hội tham gia giải đấu
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Back to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className={`fixed bottom-20 right-4 w-12 h-12 rounded-full shadow-lg z-50 ${
            theme === 'dark' 
              ? 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700' 
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
          size='sm'
        >
          <ArrowUp className='w-4 h-4' />
        </Button>
      )}
    </PageLayout>
    </>
  );
};

export default OptimizedMobileProfile;