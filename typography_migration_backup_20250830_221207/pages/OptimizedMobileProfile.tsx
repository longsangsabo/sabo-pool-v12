import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CardAvatar from '@/components/ui/card-avatar';
import DarkCardAvatar from '@/components/ui/dark-card-avatar';
import { MobileImageCropper } from '@/components/ui/mobile-image-cropper';
import { ArrowUp, Settings } from 'lucide-react';
import { useMobileProfile } from './mobile/profile/hooks/useMobileProfile';
import { useClubs } from '@/hooks/useClubs';
import { TabEditProfile } from './mobile/profile/components/TabEditProfile';
import { useRankRequestModal } from '@/hooks/useRankRequestModal';
import { RecentActivities } from './mobile/profile/components/RecentActivities';
import { ActivityHighlights } from './mobile/profile/components/ActivityHighlights';
import { AchievementsCard } from './mobile/profile/components/AchievementsCard';
import { RankRequestModal } from './mobile/profile/components/RankRequestModal';
import { ProfileTabsMobile } from './mobile/profile/components/ProfileTabsMobile';
import { ClubSection } from './mobile/profile/components/ClubSection';
import { RankSection } from './mobile/profile/components/RankSection';
import SpaHistoryTab from './mobile/profile/components/SpaHistoryTab';
import { usePlayerStats } from '@/hooks/usePlayerStats';
import { usePlayerRanking } from '@/hooks/usePlayerRanking';
import { useMobilePageTitle } from '@/hooks/useMobilePageTitle';
import { MOBILE_PAGE_TITLES } from '@/components/mobile/MobilePlayerLayout';
import { getDisplayName } from '@/types/unified-profile'; // ✅ Import utility

const OptimizedMobileProfile: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const {
    profile,
    editingProfile,
    loading,
    saving,
    uploading,
    handleEditField,
    handleSaveProfile,
    handleCancelEdit,
    handleAvatarUpload,
    handleCroppedImageUpload,
    showImageCropper,
    setShowImageCropper,
    originalImageForCrop,
  } = useMobileProfile();
  const { stats: playerStats, loading: statsLoading } = usePlayerStats();
  const { ranking: playerRanking, loading: rankingLoading } = usePlayerRanking();
  const [activeTab, setActiveTab] = useState('activities');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { clubs: clubsForRank } = useClubs();
  const rankModal = useRankRequestModal(user, clubsForRank);

  // Set mobile page title
  useMobilePageTitle();

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (loading || !profile) {
    return (
      <div className='min-h-screen flex items-center justify-center px-4'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`pb-24 min-h-screen relative px-2 transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-white' 
          : 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
      }`}
      style={{
        backgroundColor: theme === 'light' ? '#ffffff' : undefined
      }}
    >
      <Helmet>
        <title>Hồ sơ cá nhân - SABO ARENA</title>
      </Helmet>

      {/* Avatar & Stats */}
      <div className='relative flex flex-col items-center justify-start pt-0'>
        {theme === 'dark' ? (
          <DarkCardAvatar
            userAvatar={profile.avatar_url || ''}
            onAvatarChange={handleAvatarUpload}
            uploading={uploading}
            nickname={getDisplayName(profile)} // ✅ Use utility function
            rank={profile.verified_rank || 'K'}
            elo={playerStats?.elo || 1000}
            spa={playerStats?.spa || 0}
            ranking={playerRanking?.ranking_position || 0}
            matches={playerStats?.total_matches || 0}
            size='md'
            className='mb-8 shadow-2xl'
          />
        ) : (
          <CardAvatar
            userAvatar={profile.avatar_url || ''}
            onAvatarChange={handleAvatarUpload}
            uploading={uploading}
            nickname={getDisplayName(profile)} // ✅ Use utility function
            rank={profile.verified_rank || 'K'}
            elo={playerStats?.elo || 1000}
            spa={playerStats?.spa || 0}
            ranking={playerRanking?.ranking_position || 0}
            matches={playerStats?.total_matches || 0}
            size='md'
            className='mb-8 shadow-2xl border-white/20 backdrop-blur-sm'
          />
        )}
      </div>

      {/* Tabs Card */}
      <Card
        className={`mx-2 mb-6 overflow-hidden mt-2 transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-slate-900/90 border-slate-700/50 backdrop-blur-sm shadow-2xl'
            : 'bg-white border-slate-200 shadow-lg'
        }`}
      >
        <CardContent className='p-0'>
          <ProfileTabsMobile
            activeTab={activeTab}
            onChange={setActiveTab}
            theme={theme as 'light' | 'dark'}
          />
          {activeTab === 'activities' && (
            <div className='p-5 space-y-6'>
              <ActivityHighlights theme={theme as 'light' | 'dark'} />
              <RecentActivities theme={theme as 'light' | 'dark'} />
            </div>
          )}
          {activeTab === 'edit' && (
            <div className='p-5'>
              <TabEditProfile
                editingProfile={editingProfile}
                saving={saving}
                onChange={handleEditField}
                onSave={handleSaveProfile}
                onCancel={handleCancelEdit}
                theme={theme as string}
              />
            </div>
          )}
          {activeTab === 'rank' && (
            <div className='p-5'>
              <RankSection
                theme={theme as 'light' | 'dark'}
                onOpenRequest={() => rankModal.setOpen(true)}
              />
            </div>
          )}
          {activeTab === 'spa-history' && (
            <SpaHistoryTab theme={theme as 'light' | 'dark'} />
          )}
          {activeTab === 'club' && (
            <ClubSection
              theme={theme as 'light' | 'dark'}
              role={profile.role}
            />
          )}
        </CardContent>
      </Card>

      {/* Achievements & Completion */}
      <div className='mt-6 space-y-6 px-1'>
        <AchievementsCard theme={theme as 'light' | 'dark'} />
        <Card
          className={
            theme === 'dark'
              ? 'bg-slate-900/40 border-slate-700/50 backdrop-blur-sm'
              : 'bg-white border-slate-200'
          }
        >
          <CardContent className='p-5'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-2'>
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    theme === 'dark'
                      ? 'bg-slate-700/50 border border-slate-600/30'
                      : 'bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Settings className='w-3.5 h-3.5 text-slate-400' />
                </div>
                <span
                  className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
                  }`}
                >
                  Hoàn thiện hồ sơ
                </span>
              </div>
              <span
                className={`text-sm font-bold ${
                  theme === 'dark' ? 'text-blue-300' : 'text-primary-600'
                }`}
              >
                {profile.completion_percentage || 75}%
              </span>
            </div>
            <div
              className={
                theme === 'dark'
                  ? 'w-full rounded-full h-3 mb-3 bg-slate-700/50'
                  : 'w-full rounded-full h-3 mb-3 bg-slate-200'
              }
            >
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600'
                }`}
                style={{ width: `${profile.completion_percentage || 75}%` }}
              />
            </div>
            <p
              className={`text-xs ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Cập nhật đầy đủ thông tin để nhận được nhiều lợi ích và quyền truy
              cập hơn trong hệ thống.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Scroll To Top */}
      {showScrollTop && (
        <Button
          variant='outline'
          className={`fixed bottom-20 right-4 w-12 h-12 rounded-full shadow-lg z-50 ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
          size='sm'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowUp className='w-4 h-4' />
        </Button>
      )}

      {/* Rank Request Modal */}
      <RankRequestModal
        open={rankModal.open}
        onOpenChange={rankModal.setOpen}
        onSubmit={rankModal.submit}
        changeType={rankModal.changeType}
        setChangeType={rankModal.setChangeType}
        selectedClubId={rankModal.selectedClubId}
        setSelectedClubId={rankModal.setSelectedClubId}
        requestedRank={rankModal.requestedRank}
        setRequestedRank={rankModal.setRequestedRank}
        rankReason={rankModal.rankReason}
        setRankReason={rankModal.setRankReason}
        clubs={clubsForRank}
        theme={theme as 'light' | 'dark'}
      />

      {/* Image Cropper Modal - Temporarily disabled for better reliability */}
      {/* {originalImageForCrop && (
        <MobileImageCropper
          open={showImageCropper}
          onOpenChange={setShowImageCropper}
          originalImage={originalImageForCrop}
          onCropComplete={handleCroppedImageUpload}
          aspectRatio={1} // Square aspect ratio for avatar
        />
      )} */}
    </div>
  );
};

export default OptimizedMobileProfile;
