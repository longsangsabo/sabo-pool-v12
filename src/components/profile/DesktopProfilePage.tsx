import React, { useEffect, useState } from 'react';
import { useUnifiedProfile } from '@/hooks/useUnifiedProfile';
import { useTheme } from '@/hooks/useTheme';
import { UnifiedProfile } from '@/types/unified-profile'; // ✅ Use unified type
// Loại bỏ avatar/cover cũ: dùng CardAvatar/DarkCardAvatar thống nhất với mobile
// import { ProfileHeader } from './responsive/ProfileHeader';
import DesktopProfileContent from './DesktopProfileContent';
import { ProfileActivities } from './responsive/ProfileActivities';
import ProfileErrorBoundary from './ProfileErrorBoundary';
import { RefreshCw, Settings, Shield, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DesktopProfileBackground from './DesktopProfileBackground';
import DesktopProfileHero from './DesktopProfileHero';
import DesktopProfileSkeleton from './DesktopProfileSkeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';

/**
 * DesktopProfilePage
 * ------------------------------------------------------------------
 * Mục tiêu: Tái thiết kế giao diện desktop dựa trên triết lý UI của mobile:
 *  - Rõ ràng phân cấp thông tin (Header -> Stats -> Content -> Activities)
 *  - Giữ hành động quan trọng (Quick Actions) luôn hiển thị (sticky sidebar)
 *  - Nền động dark mode tương tự mobile để đồng bộ trải nghiệm
 *  - Giảm logic responsive trộn lẫn (desktop file chỉ tập trung desktop)
 */
const DesktopProfilePage: React.FC = () => {
  const { data: profile, isLoading, error, refetch } = useUnifiedProfile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('basic');
  const [editingProfile, setEditingProfile] = useState<Partial<UnifiedProfile> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showRankRequestModal, setShowRankRequestModal] = useState(false);
  const [rankChangeType, setRankChangeType] = useState<'up' | 'down'>('up');
  const [requestedRank, setRequestedRank] = useState('');
  const [rankReason, setRankReason] = useState('');
  const [selectedClubId, setSelectedClubId] = useState('');
  const rankOptions = [
    { value: '1000', label: '1000 - K' },
    { value: '1100', label: '1100 - K+' },
    { value: '1200', label: '1200 - I' },
    { value: '1300', label: '1300 - I+' },
    { value: '1400', label: '1400 - H' },
    { value: '1500', label: '1500 - H+' },
    { value: '1600', label: '1600 - G' },
    { value: '1700', label: '1700 - G+' },
    { value: '1800', label: '1800 - F' },
    { value: '1900', label: '1900 - F+' },
    { value: '2000', label: '2000 - E' },
    { value: '2100', label: '2100 - E+' },
  ];

  const allowedTabs = ['basic', 'rank', 'club', 'edit'];

  // Đồng bộ tab lần đầu từ URL + dọn dẹp param lỗi thời
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      if (allowedTabs.includes(tabParam)) {
        setActiveTab(tabParam);
      } else {
        // Tab cũ (ví dụ: activities) đã bị loại bỏ -> dọn dẹp query + thông báo nhẹ
        urlParams.delete('tab');
        window.history.replaceState(
          {},
          '',
          `${window.location.pathname}?${urlParams.toString()}`.replace(
            /\?$/,
            ''
          )
        );
        toast.message('Tab này không còn tồn tại, quay về thông tin cơ bản');
        setActiveTab('basic');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lắng nghe thao tác Back/Forward của trình duyệt để đồng bộ state tab
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && allowedTabs.includes(tabParam)) {
        setActiveTab(tabParam);
      } else {
        setActiveTab('basic');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (tab: string) => {
    if (!allowedTabs.includes(tab)) return;
    setActiveTab(tab);
    const url = new URL(window.location.href);
    if (tab === 'basic') url.searchParams.delete('tab');
    else url.searchParams.set('tab', tab);
    // Dùng pushState để người dùng có thể dùng Back quay lại tab trước
    window.history.pushState({}, '', url.toString());
  };

  const navigateToClub = () => handleTabChange('club');
  const navigateToRank = () => handleTabChange('rank');
  const navigateToCommunity = () => navigate('/community');

  // Upload avatar (desktop) giống logic mobile rút gọn
  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    try {
      setUploading(true);
      const ext = file.name.split('.').pop();
      const fileName = `avatar-${user.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = data.publicUrl;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl } as any)
        .eq('user_id', user.id);
      if (updateError) throw updateError;
      toast.success('Cập nhật avatar thành công');
      await refetch();
    } catch (e: any) {
      console.error(e);
      toast.error('Lỗi cập nhật avatar');
    } finally {
      setUploading(false);
    }
  };

  // Khởi tạo editing profile từ unified profile
  useEffect(() => {
    if (profile) {
      setEditingProfile({
        display_name: profile.display_name || profile.full_name || '',
        phone: profile.phone || '',
        city: profile.city || '',
        district: profile.district || '',
        bio: profile.bio || '',
        skill_level: (profile as any).skill_level || 'beginner',
        role: (profile.role as UnifiedProfile['role']) || 'player',
        active_role: (profile.active_role as UnifiedProfile['active_role']) || 'player',
      });
    }
  }, [profile]);

  const handleEditField = (field: string, value: any) => {
    setEditingProfile((prev: any) =>
      prev ? { ...prev, [field]: value } : prev
    );
  };

  const handleSaveProfile = async () => {
    if (!user || !editingProfile) return;
    setSaving(true);
    try {
      // ✅ SAFE: Only include fields that exist and are safe
      const payload: Partial<UnifiedProfile> = {
        display_name: editingProfile.display_name || null, // Allow null
        phone: editingProfile.phone || null,
        bio: editingProfile.bio || null,
        city: editingProfile.city || null,
        district: editingProfile.district || null,
      };
      
      // ✅ Add enum fields safely if they exist
      if (editingProfile.role) {
        payload.role = editingProfile.role;
      }
      if (editingProfile.active_role) {
        payload.active_role = editingProfile.active_role;
      }
      if (editingProfile.skill_level) {
        payload.skill_level = editingProfile.skill_level;
      }
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update(payload)
        .eq('user_id', user.id);
        
      if (updateError) throw updateError;
      toast.success('Đã lưu thông tin hồ sơ');
      await refetch();
      setActiveTab('basic');
    } catch (e: any) {
      console.error('❌ [DesktopProfile] Save error:', e);
      toast.error(`Lỗi lưu hồ sơ: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const submitRankChange = async () => {
    // Placeholder: implement actual request mutation later
    if (!requestedRank || !rankReason || !selectedClubId) return;
    toast.success('Đã gửi yêu cầu thay đổi hạng (demo)');
    setShowRankRequestModal(false);
    setRequestedRank('');
    setRankReason('');
    setSelectedClubId('');
  };

  const handleCancelEdit = () => {
    if (!profile) return;
    setEditingProfile({
      display_name: profile.display_name || profile.full_name || '',
      phone: profile.phone || '',
      city: profile.city || '',
      district: profile.district || '',
      bio: profile.bio || '',
      skill_level: (profile as any).skill_level || 'beginner',
      role: (profile.role as UnifiedProfile['role']) || 'player',
      active_role: (profile.active_role as UnifiedProfile['active_role']) || 'player',
    });
    setActiveTab('basic');
  };  if (isLoading) {
    return (
      <div className='relative min-h-screen'>
        <DesktopProfileBackground />
        <div className='relative z-10'>
          <DesktopProfileSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex justify-center items-center min-h-screen p-4'>
        <Card className='w-full max-w-md'>
          <CardContent className='pt-6'>
            <div className='text-center space-y-4'>
              <div className='text-destructive font-medium'>
                Có lỗi khi tải thông tin profile
              </div>
              <div className='text-sm text-muted-foreground bg-muted p-3 rounded-md'>
                {error.message}
              </div>
              <Button
                onClick={() => refetch()}
                variant='outline'
                className='w-full'
              >
                <RefreshCw className='mr-2 h-4 w-4' /> Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProfileErrorBoundary
      onRecover={() => setActiveTab('basic')}
      recoverLabel='Quay về thông tin cơ bản'
    >
      <div className='relative min-h-screen'>
        <DesktopProfileBackground />
        <div className='relative z-10'>
          <div className='mx-auto w-full max-w-[1440px] px-6 py-10'>
            <div className='grid grid-cols-12 gap-8'>
              {/* Sidebar trái: chỉ còn Activities (đã gỡ Quick Actions để tránh trùng) */}
              <aside className='hidden xl:block col-span-3'>
                <div className='sticky top-24 space-y-6'>
                  <ProfileActivities
                    activities={profile?.recent_activities || []}
                  />
                </div>
              </aside>

              {/* Nội dung chính */}
              <main className='col-span-12 xl:col-span-9 space-y-8'>
                <div className='flex flex-col items-start gap-8'>
                  <DesktopProfileHero
                    profile={profile}
                    theme={theme}
                    uploading={uploading}
                    onAvatarUpload={handleAvatarUpload}
                    onEdit={() => setActiveTab('edit')}
                    onRequestRank={() => setShowRankRequestModal(true)}
                    onNavigateClub={navigateToClub}
                    onNavigateRank={navigateToRank}
                    onNavigateCommunity={navigateToCommunity}
                  />
                  {/* Thông tin phụ: bio + badges + completion */}
                  <div className='w-full grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    {/* Completion Card (giữ vì không xuất hiện ở tab khác) */}
                    <div
                      className={`relative col-span-1 rounded-2xl border p-5 flex flex-col justify-between overflow-hidden
                      ${theme === 'dark' ? 'bg-slate-900/60 border-slate-700/60' : 'bg-white border-slate-200'}`}
                    >
                      <div className='pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle_at_top_right,white,transparent_70%)] bg-gradient-to-bl from-cyan-500/10 via-transparent to-blue-500/10' />
                      <div className='relative'>
                        <div className='flex items-center justify-between mb-4'>
                          <div className='flex items-center gap-2'>
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center border
                              ${theme === 'dark' ? 'bg-slate-800/70 border-slate-600/40' : 'bg-slate-100 border-slate-200'}`}
                            >
                              <Settings className='w-4 h-4 text-slate-400' />
                            </div>
                            <span
                              className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}
                            >
                              Hoàn thiện hồ sơ
                            </span>
                          </div>
                          <span
                            className={`text-sm font-bold tracking-wide ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}
                          >
                            {profile?.completion_percentage ?? 0}%
                          </span>
                        </div>
                        <div
                          className={`w-full rounded-full h-3 mb-3 overflow-hidden ${theme === 'dark' ? 'bg-slate-800/70' : 'bg-slate-200'}`}
                        >
                          <div
                            className={`h-3 rounded-full transition-all duration-700 ease-out
                              ${theme === 'dark' ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}
                            style={{
                              width: `${profile?.completion_percentage ?? 0}%`,
                            }}
                          />
                        </div>
                        <p
                          className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
                        >
                          Hoàn thiện hồ sơ để tăng uy tín và cơ hội tham gia
                          giải đấu
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs + Content */}
                <DesktopProfileContent
                  profile={profile}
                  theme={theme}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  editingProfile={editingProfile}
                  saving={saving}
                  onEditField={handleEditField}
                  onSave={handleSaveProfile}
                  onCancel={handleCancelEdit}
                />

                {/* Activities không còn là tab: hiển thị luôn dưới cùng trên mobile nếu cần */}
                <div className='block xl:hidden'>
                  <ProfileActivities
                    activities={profile?.recent_activities || []}
                  />
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
      {/* Rank Request Modal */}
      <Dialog
        open={showRankRequestModal}
        onOpenChange={setShowRankRequestModal}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Yêu cầu thay đổi hạng</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='flex gap-2'>
              <Button
                size='sm'
                variant={rankChangeType === 'up' ? 'default' : 'outline'}
                className='flex-1'
                onClick={() => setRankChangeType('up')}
              >
                Tăng hạng
              </Button>
              <Button
                size='sm'
                variant={rankChangeType === 'down' ? 'default' : 'outline'}
                className='flex-1'
                onClick={() => setRankChangeType('down')}
              >
                Giảm hạng
              </Button>
            </div>
            <div>
              <label className='text-xs font-medium mb-1 block'>Chọn CLB</label>
              <select
                className='w-full px-3 py-2 text-sm rounded-md border bg-background'
                value={selectedClubId}
                onChange={e => setSelectedClubId(e.target.value)}
              >
                <option value=''>-- Chọn CLB --</option>
                <option value='demo'>Demo Club</option>
              </select>
            </div>
            <div>
              <label className='text-xs font-medium mb-1 block'>
                Chọn hạng mới
              </label>
              <select
                className='w-full px-3 py-2 text-sm rounded-md border bg-background'
                value={requestedRank}
                onChange={e => setRequestedRank(e.target.value)}
              >
                <option value=''>-- Chọn --</option>
                {rankOptions.map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='text-xs font-medium mb-1 block'>Lý do</label>
              <textarea
                rows={3}
                className='w-full px-3 py-2 text-sm rounded-md border bg-background resize-none'
                value={rankReason}
                onChange={e => setRankReason(e.target.value)}
                placeholder='Mô tả vì sao bạn muốn thay đổi hạng...'
              />
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowRankRequestModal(false)}
              >
                Hủy
              </Button>
              <Button
                size='sm'
                disabled={!requestedRank || !rankReason || !selectedClubId}
                onClick={submitRankChange}
              >
                Gửi yêu cầu
              </Button>
            </div>
            <p className='text-[10px] text-muted-foreground'>
              Sau khi CLB phê duyệt, hạng của bạn sẽ được cập nhật.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </ProfileErrorBoundary>
  );
};

export default DesktopProfilePage;
