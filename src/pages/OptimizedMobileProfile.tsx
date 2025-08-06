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

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    setUploading(true);

    try {
      let uploadFile = file;
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
    beginner: { label: 'Người mới', color: 'bg-green-100 text-green-800' },
    intermediate: { label: 'Trung bình', color: 'bg-blue-100 text-blue-800' },
    advanced: { label: 'Khá', color: 'bg-purple-100 text-purple-800' },
    pro: { label: 'Chuyên nghiệp', color: 'bg-gold-100 text-gold-800' },
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

        <div 
          className='pb-20 -mt-20 min-h-screen relative'
          style={theme === 'light' ? {
            backgroundImage: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)'
          } : undefined}
        >
        {/* SABO ARENA Avatar Container */}
        <div className='flex flex-col items-center justify-start -mt-24'>
          <div className='avatar-container relative w-[90vw] max-w-[360px] h-[90vw] max-h-[360px] flex items-center justify-center'>
            {/* Avatar with SABO ARENA styling */}
            <div className='relative w-[90%] h-[90%]'>
              <img
                className='avatar absolute w-full h-full object-cover'
                src={profile.avatar_url || avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name || 'User')}&background=random`}
                alt="User Avatar"
                style={{
                  clipPath: 'polygon(0% 10%, 10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%)',
                  boxShadow: `0 0 20px 5px ${shadowColor}`
                }}
              />
              
              {/* Upload overlay */}
              <label 
                className='absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center z-10'
                style={{
                  clipPath: 'polygon(0% 10%, 10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%)'
                }}
              >
                <Camera className='w-8 h-8 text-white' />
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleAvatarUpload}
                  className='hidden'
                />
              </label>

              {uploading && (
                <div 
                  className='absolute inset-0 bg-black/70 flex items-center justify-center z-20'
                  style={{
                    clipPath: 'polygon(0% 10%, 10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%)'
                  }}
                >
                  <div className='animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent' />
                </div>
              )}
            </div>

            {/* Frame SVG with mask for stamp */}
            <div className='frame absolute w-full h-full pointer-events-none'>
              <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-full h-full'>
                <defs>
                  {profile.verified_rank && (
                    <mask id="frame-mask">
                      <rect width="400" height="400" fill="white" />
                      {/* Circular hole for stamp - positioned at bottom right */}
                      <circle cx="350" cy="360" r="35" fill="black" />
                    </mask>
                  )}
                </defs>
                <g mask={profile.verified_rank ? "url(#frame-mask)" : undefined}>
                  <polygon points="50,10 350,10 390,50 390,350 350,390 50,390 10,350 10,50" stroke={frameStroke} strokeWidth="4" fill="none" />
                  <polygon points="0,80 80,0 320,0 400,80 400,320 320,400 80,400 0,320" stroke={frameStroke} strokeWidth="2" fill="none" />
                </g>
              </svg>
            </div>

            {/* Verified Stamp */}
            {profile.verified_rank && (
              <div className='stamp absolute bottom-[-35px] right-[-10px] w-[32%] h-auto z-20' style={{ filter: `drop-shadow(0 0 6px ${shadowColor})` }}>
                <img 
                  src="https://exlqvlbawytbglioqfbc.supabase.co/storage/v1/object/public/logo//certified-sabo-arena.png"
                  alt="Certified SABO ARENA"
                  className='w-full h-full object-contain'
                />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className='user-info mt-4 flex items-center justify-center gap-0'>
            <div 
              className={`username-box px-5 py-1 text-base font-bold flex items-center h-9 rounded-l-lg ${
                theme === 'light' 
                  ? 'bg-white text-black border-2 border-black' 
                  : 'bg-black text-white border-2 border-white'
              }`}
              style={{ boxShadow: `0 0 6px ${shadowColor}` }}
            >
              {profile.display_name || 'Chưa đặt tên'}
            </div>
            <div 
              className={`rank-box text-base font-bold w-11 h-9 flex items-center justify-center rounded-r-lg ${
                theme === 'light'
                  ? 'bg-black text-white'
                  : 'bg-white text-black'
              }`}
              style={{ boxShadow: `0 0 6px ${shadowColor}` }}
            >
              {profile.verified_rank ? profile.verified_rank[0]?.toUpperCase() : 'K'}
            </div>
          </div>

          {/* Stats */}
          <div className='stats mt-5 flex justify-center gap-1.5 w-[90vw] max-w-[360px]'>
            <div 
              className={`stat-box flex-1 flex flex-col items-center text-xs rounded-md p-1 ${
                theme === 'light' 
                  ? 'bg-black/5 border border-black' 
                  : 'bg-white/5 border border-white'
              }`}
              style={{ boxShadow: `0 0 4px ${theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'}` }}
            >
              <div className='stat-icon text-base mb-0.5'>
                <Trophy className='w-4 h-4 text-yellow-400' />
              </div>
              <div>ELO</div>
              <strong>1000</strong>
            </div>
            <div 
              className={`stat-box flex-1 flex flex-col items-center text-xs rounded-md p-1 ${
                theme === 'light' 
                  ? 'bg-black/5 border border-black' 
                  : 'bg-white/5 border border-white'
              }`}
              style={{ boxShadow: `0 0 4px ${theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'}` }}
            >
              <div className='stat-icon text-base mb-0.5'>
                <Zap className='w-4 h-4 text-blue-400' />
              </div>
              <div>SPA</div>
              <strong>2225</strong>
            </div>
            <div 
              className={`stat-box flex-1 flex flex-col items-center text-xs rounded-md p-1 ${
                theme === 'light' 
                  ? 'bg-black/5 border border-black' 
                  : 'bg-white/5 border border-white'
              }`}
              style={{ boxShadow: `0 0 4px ${theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'}` }}
            >
              <div className='stat-icon text-base mb-0.5'>
                <Award className='w-4 h-4 text-orange-400' />
              </div>
              <div>Xếp hạng</div>
              <strong>Top 5%</strong>
            </div>
            <div 
              className={`stat-box flex-1 flex flex-col items-center text-xs rounded-md p-1 ${
                theme === 'light' 
                  ? 'bg-black/5 border border-black' 
                  : 'bg-white/5 border border-white'
              }`}
              style={{ boxShadow: `0 0 4px ${theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'}` }}
            >
              <div className='stat-icon text-base mb-0.5'>
                <Target className='w-4 h-4 text-green-400' />
              </div>
              <div>Số trận</div>
              <strong>6</strong>
            </div>
          </div>
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
                  <div className='flex items-center gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500'>
                    <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
                      <Trophy className='w-4 h-4 text-white' />
                    </div>
                    <div className='flex-1'>
                      <div className='text-sm font-medium'>Thắng vs Nguyễn Văn A</div>
                      <div className='text-xs text-muted-foreground'>10-8 • 2 giờ trước</div>
                    </div>
                    <div className='text-xs font-bold text-green-600'>+25 ELO</div>
                  </div>

                  <div className='flex items-center gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500'>
                    <div className='w-8 h-8 bg-red-500 rounded-full flex items-center justify-center'>
                      <Target className='w-4 h-4 text-white' />
                    </div>
                    <div className='flex-1'>
                      <div className='text-sm font-medium'>Thua vs Trần Văn B</div>
                      <div className='text-xs text-muted-foreground'>8-10 • 1 ngày trước</div>
                    </div>
                    <div className='text-xs font-bold text-red-600'>-15 ELO</div>
                  </div>
                </div>

                {/* Active Challenges */}
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium mb-2'>Thách đấu đang chờ</h4>
                  <div className='flex items-center gap-3 p-3 bg-blue-50 rounded-lg'>
                    <Zap className='w-5 h-5 text-blue-500' />
                    <div className='flex-1'>
                      <div className='text-sm font-medium'>Thách đấu từ Lê Văn C</div>
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
                    <div className='bg-green-50 border border-green-200 rounded-lg p-3'>
                      <div className='text-sm font-medium text-green-800'>
                        Đã xác thực: {profile.verified_rank}
                      </div>
                      <div className='text-xs text-green-600 mt-1'>
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
                      <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                        <div className='text-sm font-medium text-blue-800'>
                          Bạn đã là chủ CLB
                        </div>
                        <div className='text-xs text-blue-600 mt-1'>
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
            <div className='flex items-center gap-3 p-2 bg-blue-50 rounded-lg'>
              <div className='w-2 h-2 bg-blue-500 rounded-full flex-shrink-0'></div>
              <div className='flex-1 min-w-0'>
                <div className='text-sm font-medium truncate'>
                  Tham gia giải đấu mới
                </div>
                <div className='text-xs text-muted-foreground'>2 giờ trước</div>
              </div>
            </div>

            <div className='flex items-center gap-3 p-2 bg-green-50 rounded-lg'>
              <div className='w-2 h-2 bg-green-500 rounded-full flex-shrink-0'></div>
              <div className='flex-1 min-w-0'>
                <div className='text-sm font-medium truncate'>
                  Nhận 50 SPA Points
                </div>
                <div className='text-xs text-muted-foreground'>
                  1 ngày trước
                </div>
              </div>
            </div>

            <div className='flex items-center gap-3 p-2 bg-yellow-50 rounded-lg'>
              <div className='w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0'></div>
              <div className='flex-1 min-w-0'>
                <div className='text-sm font-medium truncate'>
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
            <div className='flex items-center gap-3 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg'>
              <div className='w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0'>
                <Trophy className='w-4 h-4 text-white' />
              </div>
              <div className='flex-1 min-w-0'>
                <div className='text-sm font-medium truncate'>
                  Người mới xuất sắc
                </div>
                <div className='text-xs text-muted-foreground'>
                  Thắng 5 trận đầu tiên
                </div>
              </div>
            </div>

            <div className='flex items-center gap-3 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg'>
              <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0'>
                <span className='text-sm'>🎯</span>
              </div>
              <div className='flex-1 min-w-0'>
                <div className='text-sm font-medium truncate'>Chính xác</div>
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
