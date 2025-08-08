import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CardAvatar from '@/components/ui/card-avatar';
import DarkCardAvatar from '@/components/ui/dark-card-avatar';
import { toast } from 'sonner';
import { ArrowUp, Settings } from 'lucide-react';
import { useMobileProfile } from './mobile/profile/hooks/useMobileProfile';
import { useClubs } from '@/hooks/useClubs';
import { TabEditProfile } from './mobile/profile/components/TabEditProfile';
import RankRegistrationForm from '@/components/RankRegistrationForm'; // still used inside RankSection indirectly
import { useRankRequests } from '@/hooks/useRankRequests';
import { useRankRequestModal } from '@/hooks/useRankRequestModal';
import { RecentActivities } from './mobile/profile/components/RecentActivities';
import { ActivityHighlights } from './mobile/profile/components/ActivityHighlights';
import { SkillLevelBadge } from '@/components/ui/skill-level-badge';
import { AchievementsCard } from './mobile/profile/components/AchievementsCard';
import { RankRequestModal } from './mobile/profile/components/RankRequestModal';
import { ProfileTabsMobile } from './mobile/profile/components/ProfileTabsMobile';
import { ClubSection } from './mobile/profile/components/ClubSection';
import { RankSection } from './mobile/profile/components/RankSection';
import { ProfileSummaryStats } from './mobile/profile/components/ProfileSummaryStats';
import { usePlayerStats } from '@/hooks/usePlayerStats';

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
  } = useMobileProfile();
  const { createRankRequest, checkExistingPendingRequest } = useRankRequests();
  const { stats: playerStats, loading: statsLoading } = usePlayerStats();

  // UI state
  const [activeTab, setActiveTab] = useState('activities');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { clubs: clubsForRank } = useClubs();
  const rankModal = useRankRequestModal(user, clubsForRank);

  // Effects
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // clubsForRank loaded via useClubs hook

  // Actions
  const submitRankChange = rankModal.submit;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Loading state
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
    <>
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
        <div className='pb-20 min-h-screen relative' style={theme === 'light' ? { backgroundImage: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)' } : undefined}>
          {/* Avatar */}
          <div className='relative flex flex-col items-center justify-start pt-2'>
            {theme === 'dark' ? (
              <DarkCardAvatar
                userAvatar={profile.avatar_url}
                onAvatarChange={handleAvatarUpload}
                uploading={uploading}
                nickname={profile.display_name || 'Chưa đặt tên'}
                rank={profile.verified_rank || 'K'}
                elo={playerStats?.elo || 1000}
                spa={playerStats?.spa || 0}
                ranking={0}
                matches={playerStats?.total_matches || 0}
                size='md'
                className='mb-8'
              />
            ) : (
              <CardAvatar
                userAvatar={profile.avatar_url}
                onAvatarChange={handleAvatarUpload}
                uploading={uploading}
                nickname={profile.display_name || 'Chưa đặt tên'}
                rank={profile.verified_rank || 'K'}
                elo={playerStats?.elo || 1000}
                spa={playerStats?.spa || 0}
                ranking={0}
                matches={playerStats?.total_matches || 0}
                size='md'
                className='mb-8'
              />
            )}
            <SkillLevelBadge
              skillLevel={profile.skill_level}
              theme={theme as 'light' | 'dark'}
              className='mt-[-4rem] translate-y-8 shadow-sm'
            />
            {statsLoading ? (
              <div className='mt-3 flex gap-4 animate-pulse'>
                {[1,2,3,4].map(i => (
                  <div key={i} className='w-10'>
                    <div className={`h-4 rounded ${theme==='dark'?'bg-slate-700/60':'bg-slate-200'}`}></div>
                    <div className={`h-2 mt-2 rounded ${theme==='dark'?'bg-slate-700/40':'bg-slate-200'}`}></div>
                  </div>
                ))}
              </div>
            ) : (
              <ProfileSummaryStats
                elo={playerStats?.elo}
                spa={playerStats?.spa}
                ranking={0}
                matches={playerStats?.total_matches}
                theme={theme as 'light' | 'dark'}
              />
            )}
          </div>

          {/* Tabs */}
          <Card className={`overflow-hidden ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700/60 backdrop-blur-sm' : 'bg-white border-slate-200'}`}>
            <CardContent className='p-0'>
              <ProfileTabsMobile activeTab={activeTab} onChange={setActiveTab} theme={theme as 'light' | 'dark'} />
              {/* Activities Tab */}
              {activeTab === 'activities' && (
                <div className='p-5 space-y-6'>
                  <ActivityHighlights theme={theme as 'light' | 'dark'} />
                  <RecentActivities theme={theme as 'light' | 'dark'} />
                </div>
              )}
              {/* Edit Tab */}
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
              {/* Rank Tab */}
              {activeTab === 'rank' && (
                <div className='p-5'>
                  <RankSection
                    theme={theme as 'light' | 'dark'}
                    onOpenRequest={() => rankModal.setOpen(true)}
                  />
                </div>
              )}
              {/* Club Tab */}
              {activeTab === 'club' && (
                <ClubSection theme={theme as 'light' | 'dark'} role={profile.role} />
              )}
            </CardContent>
          </Card>

          {/* Achievements & Completion */}
          <div className='mt-6 space-y-6 px-1'>
            <AchievementsCard theme={theme as 'light' | 'dark'} />
            <Card className={theme === 'dark' ? 'bg-slate-900/40 border-slate-700/50 backdrop-blur-sm' : 'bg-white border-slate-200'}>
              <CardContent className='p-5'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-2'>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-slate-700/50 border border-slate-600/30' : 'bg-slate-100 border border-slate-200'}`}>
                      <Settings className='w-3.5 h-3.5 text-slate-400' />
                    </div>
                    <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Hoàn thiện hồ sơ</span>
                  </div>
                  <span className={`text-sm font-bold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>{profile.completion_percentage || 75}%</span>
                </div>
                <div className={theme === 'dark' ? 'w-full rounded-full h-3 mb-3 bg-slate-700/50' : 'w-full rounded-full h-3 mb-3 bg-slate-200'}>
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${theme === 'dark' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}
                    style={{ width: `${profile.completion_percentage || 75}%` }}
                  />
                </div>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Cập nhật đầy đủ thông tin để nhận được nhiều lợi ích và quyền truy cập hơn trong hệ thống.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Scroll To Top */}
          {showScrollTop && (
            <Button
              variant='outline'
              className={`fixed bottom-20 right-4 w-12 h-12 rounded-full shadow-lg z-50 ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              size='sm'
              onClick={scrollToTop}
            >
              <ArrowUp className='w-4 h-4' />
            </Button>
          )}

          {/* Modal */}
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
        </div>
      </PageLayout>
    </>
  );
};

export default OptimizedMobileProfile;
