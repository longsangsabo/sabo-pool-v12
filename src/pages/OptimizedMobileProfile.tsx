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
        <div className='pb-20 -mt-20 min-h-screen relative' style={theme === 'light' ? {
          backgroundImage: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)'
        } : undefined}>
          {/* Card Avatar Layout - New Design */}
          <div className='relative flex flex-col items-center justify-start -mt-16 pt-4'>
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
        <Card>
          <CardContent className='p-0'>
            {/* Tab Navigation */}
            <div className='flex border-b border-border'>
              <button 
                className={`flex-1 px-3 py-3 text-sm font-medium ${
                  activeTab === 'activities' 
                    ? 'bg-primary text-primary-foreground border-b-2 border-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('activities')}
              >
                <Trophy className='w-4 h-4 mx-auto mb-1' />
                <div className='text-xs'>Hoạt động</div>
              </button>
              {/* Avatar tab temporarily hidden - Premium Octagon is now default */}
              {false && (
                <button 
                  className={`flex-1 px-3 py-3 text-sm font-medium ${
                    activeTab === 'avatar' 
                      ? 'bg-primary text-primary-foreground border-b-2 border-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setActiveTab('avatar')}
                >
                  <Palette className='w-4 h-4 mx-auto mb-1' />
                  <div className='text-xs'>Avatar</div>
                </button>
              )}
              <button 
                className={`flex-1 px-3 py-3 text-sm font-medium ${
                  activeTab === 'basic' 
                    ? 'bg-primary text-primary-foreground border-b-2 border-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('basic')}
              >
                <User className='w-4 h-4 mx-auto mb-1' />
                <div className='text-xs'>Cá nhân</div>
              </button>
              <button 
                className={`flex-1 px-3 py-3 text-sm font-medium ${
                  activeTab === 'rank' 
                    ? 'bg-primary text-primary-foreground border-b-2 border-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('rank')}
              >
                <Shield className='w-4 h-4 mx-auto mb-1' />
                <div className='text-xs'>Đăng ký hạng</div>
              </button>
              <button 
                className={`flex-1 px-3 py-3 text-sm font-medium ${
                  activeTab === 'club' 
                    ? 'bg-primary text-primary-foreground border-b-2 border-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('club')}
              >
                <Building className='w-4 h-4 mx-auto mb-1' />
                <div className='text-xs'>Đăng ký CLB</div>
              </button>
            </div>

            {/* Tab Content - Activities */}
            {activeTab === 'activities' && (
              <div className='p-4 space-y-3'>
                {/* Recent Match Results */}
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium mb-2'>Kết quả trận đấu gần đây</h4>
                  <div className={`flex items-center gap-3 p-3 rounded-lg border-l-4 border-green-500 ${
                    theme === 'dark' 
                      ? 'bg-green-900/20 backdrop-blur-sm' 
                      : 'bg-green-50'
                  }`}>
                    <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
                      <Trophy className='w-4 h-4 text-white' />
                    </div>
                    <div className='flex-1'>
                      <div className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-white drop-shadow-sm' : ''
                      }`}>Thắng vs Nguyễn Văn A</div>
                      <div className='text-xs text-muted-foreground'>10-8 • 2 giờ trước</div>
                    </div>
                    <div className={`text-xs font-bold ${
                      theme === 'dark' ? 'text-green-300' : 'text-green-600'
                    }`}>+25 ELO</div>
                  </div>

                  <div className={`flex items-center gap-3 p-3 rounded-lg border-l-4 border-red-500 ${
                    theme === 'dark' 
                      ? 'bg-red-900/20 backdrop-blur-sm' 
                      : 'bg-red-50'
                  }`}>
                    <div className='w-8 h-8 bg-red-500 rounded-full flex items-center justify-center'>
                      <Target className='w-4 h-4 text-white' />
                    </div>
                    <div className='flex-1'>
                      <div className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-white drop-shadow-sm' : ''
                      }`}>Thua vs Trần Văn B</div>
                      <div className='text-xs text-muted-foreground'>8-10 • 1 ngày trước</div>
                    </div>
                    <div className={`text-xs font-bold ${
                      theme === 'dark' ? 'text-red-300' : 'text-red-600'
                    }`}>-15 ELO</div>
                  </div>
                </div>

                {/* Active Challenges */}
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium mb-2'>Thách đấu đang chờ</h4>
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-blue-900/20 backdrop-blur-sm' 
                      : 'bg-blue-50'
                  }`}>
                    <Zap className='w-5 h-5 text-blue-500' />
                    <div className='flex-1'>
                      <div className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-white drop-shadow-sm' : ''
                      }`}>Thách đấu từ Lê Văn C</div>
                      <div className='text-xs text-muted-foreground'>Hạn: 2 ngày nữa</div>
                    </div>
                    <Button size='sm' variant='outline' className='text-xs'>
                      Xem chi tiết
                    </Button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className='grid grid-cols-2 gap-3 mt-4'>
                  <Button variant='outline' size='sm' className='h-12 flex-col gap-1'>
                    <Target className='w-4 h-4' />
                    <span className='text-xs'>Tạo thách đấu</span>
                  </Button>
                  <Button variant='outline' size='sm' className='h-12 flex-col gap-1'>
                    <Trophy className='w-4 h-4' />
                    <span className='text-xs'>Xem bảng xếp hạng</span>
                  </Button>
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

        {/* Recent Activities - Compact */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base font-epilogue flex items-center justify-between'>
              Hoạt động gần đây
              <Button variant='ghost' size='sm' className='text-xs h-6 px-2'>
                Xem tất cả <ChevronRight className='w-3 h-3 ml-1' />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className='p-4 pt-0 space-y-3'>
            <div className={`flex items-center gap-3 p-2 rounded-lg ${
              theme === 'dark' 
                ? 'bg-blue-900/20 backdrop-blur-sm' 
                : 'bg-blue-50'
            }`}>
              <div className='w-2 h-2 bg-blue-500 rounded-full flex-shrink-0'></div>
              <div className='flex-1 min-w-0'>
                <div className={`text-sm font-medium truncate ${
                  theme === 'dark' ? 'text-white drop-shadow-sm' : ''
                }`}>
                  Tham gia giải đấu mới
                </div>
                <div className='text-xs text-muted-foreground'>2 giờ trước</div>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-2 rounded-lg ${
              theme === 'dark' 
                ? 'bg-green-900/20 backdrop-blur-sm' 
                : 'bg-green-50'
            }`}>
              <div className='w-2 h-2 bg-green-500 rounded-full flex-shrink-0'></div>
              <div className='flex-1 min-w-0'>
                <div className={`text-sm font-medium truncate ${
                  theme === 'dark' ? 'text-white drop-shadow-sm' : ''
                }`}>
                  Nhận 50 SPA Points
                </div>
                <div className='text-xs text-muted-foreground'>
                  1 ngày trước
                </div>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-2 rounded-lg ${
              theme === 'dark' 
                ? 'bg-yellow-900/20 backdrop-blur-sm' 
                : 'bg-yellow-50'
            }`}>
              <div className='w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0'></div>
              <div className='flex-1 min-w-0'>
                <div className={`text-sm font-medium truncate ${
                  theme === 'dark' ? 'text-white drop-shadow-sm' : ''
                }`}>
                  Cập nhật hồ sơ
                </div>
                <div className='text-xs text-muted-foreground'>
                  3 ngày trước
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements - Compact */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base font-epilogue flex items-center justify-between'>
              Thành tích
              <Button variant='ghost' size='sm' className='text-xs h-6 px-2'>
                Xem tất cả <ChevronRight className='w-3 h-3 ml-1' />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className='p-4 pt-0 space-y-3'>
            <div className={`flex items-center gap-3 p-2 rounded-lg ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 backdrop-blur-sm' 
                : 'bg-gradient-to-r from-yellow-50 to-orange-50'
            }`}>
              <div className='w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0'>
                <Trophy className='w-4 h-4 text-white' />
              </div>
              <div className='flex-1 min-w-0'>
                <div className={`text-sm font-medium truncate ${
                  theme === 'dark' ? 'text-white drop-shadow-sm' : ''
                }`}>
                  Người mới xuất sắc
                </div>
                <div className='text-xs text-muted-foreground'>
                  Thắng 5 trận đầu tiên
                </div>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-2 rounded-lg ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm' 
                : 'bg-gradient-to-r from-blue-50 to-purple-50'
            }`}>
              <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0'>
                <span className='text-sm'>🎯</span>
              </div>
              <div className='flex-1 min-w-0'>
                <div className={`text-sm font-medium truncate ${
                  theme === 'dark' ? 'text-white drop-shadow-sm' : ''
                }`}>Chính xác</div>
                <div className='text-xs text-muted-foreground'>
                  Độ chính xác &gt; 80%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Completion */}
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between mb-3'>
              <span className='text-sm font-medium'>Hoàn thiện hồ sơ</span>
              <span className='text-sm font-racing-sans-one text-primary'>
                {profile.completion_percentage || 0}%
              </span>
            </div>
            <div className='w-full bg-muted rounded-full h-2 mb-2'>
              <div
                className='bg-primary h-2 rounded-full transition-all duration-300'
                style={{ width: `${profile.completion_percentage || 0}%` }}
              />
            </div>
            <p className='text-xs text-muted-foreground'>
              Hoàn thiện hồ sơ để tăng uy tín và cơ hội tham gia giải đấu
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Back to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className='fixed bottom-20 right-4 w-12 h-12 rounded-full shadow-lg z-50'
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