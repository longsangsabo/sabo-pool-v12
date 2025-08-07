import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useOptimizedChallenges } from '@/hooks/useOptimizedChallenges';
import { toast } from 'sonner';
import { Calendar, Search, Trophy, Users, Zap, RefreshCw } from 'lucide-react';
import UnifiedChallengeCard from './UnifiedChallengeCard';
import { OpenChallengeCard } from './OpenChallengeCard';
import { CompletedChallengeCard } from './CompletedChallengeCard';
import LiveMatchCard from './LiveMatchCard';
import UnifiedCreateChallengeModal from '@/components/modals/UnifiedCreateChallengeModal';
import { ActiveChallengeHighlight } from './ActiveChallengeHighlight';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ChallengeProfile } from '@/types/challenge';

interface MobileChallengeManagerProps {
  className?: string;
}

const MobileChallengeManager: React.FC<MobileChallengeManagerProps> = ({
  className,
}) => {
  const { user } = useAuth();
  const {
    challenges,
    loading,
    error,
    acceptChallenge,
    declineChallenge,
    fetchChallenges,
  } = useOptimizedChallenges();

  // Convert challenge data to local format
  const convertToLocalChallenge = (c: any) => ({
    id: c.id,
    challenger_id: c.challenger_id,
    opponent_id: c.opponent_id,
    bet_points: c.bet_points || 0,
    race_to: c.race_to || 5,
    status: c.status,
    message: c.message || c.challenge_message,
    challenge_type: c.challenge_type,
    created_at: c.created_at,
    expires_at: c.expires_at,
    completed_at: c.completed_at,
    challenger_profile: c.challenger_profile,
    opponent_profile: c.opponent_profile,
    club: c.club || null,
  });

  // Enhanced debug: Check what challenges we have with profile details
  console.log('🔍 [MobileChallengeManager] Detailed analysis:', {
    totalChallenges: challenges.length,
    currentUser: user?.id?.slice(-8),
    challengeBreakdown: {
      pending: challenges.filter(c => c.status === 'pending').length,
      accepted: challenges.filter(c => c.status === 'accepted').length,
      completed: challenges.filter(c => c.status === 'completed').length,
      withOpponent: challenges.filter(c => c.opponent_id).length,
      openChallenges: challenges.filter(
        c => !c.opponent_id && c.status === 'pending'
      ).length,
      myOpenChallenges: challenges.filter(
        c =>
          !c.opponent_id &&
          c.status === 'pending' &&
          c.challenger_id === user?.id
      ).length,
      otherUserOpenChallenges: challenges.filter(
        c =>
          !c.opponent_id &&
          c.status === 'pending' &&
          c.challenger_id !== user?.id
      ).length,
    },
    sampleChallenges: challenges.slice(0, 5).map(c => ({
      id: c.id?.slice(-8) || 'NO_ID',
      challenger_name:
        c.challenger_profile?.display_name ||
        c.challenger_profile?.full_name ||
        'Unknown',
      challenger_id: c.challenger_id?.slice(-8) || 'NO_CHALLENGER',
      opponent_id: c.opponent_id?.slice(-8) || 'NULL',
      status: c.status,
      isOpen: !c.opponent_id,
      isMyChallenge: c.challenger_id === user?.id,
      hasProfile: !!c.challenger_profile,
      profileData: c.challenger_profile
        ? {
            name: c.challenger_profile.full_name,
            display: c.challenger_profile.display_name,
            rank:
              c.challenger_profile.verified_rank ||
              c.challenger_profile.current_rank,
            spa_points: (c.challenger_profile as any)?.spa_points || 0,
          }
        : null,
      challenger_spa: (c.challenger_profile as any)?.spa_points || 0,
      opponent_spa: (c.opponent_profile as any)?.spa_points || 0,
    })),
  });

  // Filter open challenges from other users with enhanced logging
  const openChallenges = challenges
    .filter(c => {
      const isOpen = !c.opponent_id && c.status === 'pending';
      const isNotMyChallenge = c.challenger_id !== user?.id;
      const shouldShow = isOpen && isNotMyChallenge;

      if (isOpen && !isNotMyChallenge) {
        console.log('🔍 Filtering out my own challenge:', {
          id: c.id?.slice(-8),
          challenger:
            c.challenger_profile?.display_name ||
            c.challenger_profile?.full_name,
          isMyChallenge: c.challenger_id === user?.id,
        });
      }

      return shouldShow;
    })
    .map(convertToLocalChallenge);

  console.log(
    '✅ [MobileChallengeManager] Open challenges processing result:',
    {
      totalFiltered: openChallenges.length,
      allOpenChallenges: challenges.filter(
        c => !c.opponent_id && c.status === 'pending'
      ).length,
      myOpenChallenges: challenges.filter(
        c =>
          !c.opponent_id &&
          c.status === 'pending' &&
          c.challenger_id === user?.id
      ).length,
      othersOpenChallenges: challenges.filter(
        c =>
          !c.opponent_id &&
          c.status === 'pending' &&
          c.challenger_id !== user?.id
      ).length,
      challenges: openChallenges.map(c => ({
        id: c.id?.slice(-8),
        challenger:
          c.challenger_profile?.display_name || c.challenger_profile?.full_name,
        betPoints: c.bet_points,
        raceTo: c.race_to,
        status: c.status,
        hasProfile: !!c.challenger_profile,
        profileComplete: c.challenger_profile
          ? {
              hasName: !!(
                c.challenger_profile.full_name ||
                c.challenger_profile.display_name
              ),
              hasAvatar: !!c.challenger_profile.avatar_url,
              hasRank: !!(
                c.challenger_profile.verified_rank ||
                c.challenger_profile.current_rank
              ),
            }
          : false,
      })),
    }
  );

  // Get user's own open challenges
  const myOpenChallenges = challenges
    .filter(
      c =>
        !c.opponent_id && c.status === 'pending' && c.challenger_id === user?.id
    )
    .map(convertToLocalChallenge);

  // Get ongoing challenges (accepted status)
  const ongoingChallenges = challenges
    .filter(
      c =>
        c.status === 'accepted' &&
        (c.challenger_id === user?.id || c.opponent_id === user?.id)
    )
    .map(convertToLocalChallenge);

  // Get upcoming challenges (pending with specific opponent)
  const upcomingChallenges = challenges
    .filter(
      c =>
        c.status === 'pending' &&
        c.opponent_id &&
        (c.challenger_id === user?.id || c.opponent_id === user?.id)
    )
    .map(convertToLocalChallenge);

  // Get completed challenges (recent)
  const completedChallenges = challenges
    .filter(
      c =>
        c.status === 'completed' &&
        (c.challenger_id === user?.id || c.opponent_id === user?.id)
    )
    .map(convertToLocalChallenge);

  // Get community stats (ALL challenges, not just user's)
  const communityStats = {
    allOpenChallenges: challenges.filter(c => !c.opponent_id && c.status === 'pending').length,
    allLiveChallenges: challenges.filter(c => c.status === 'accepted').length,
    allUpcomingChallenges: challenges.filter(c => c.status === 'pending' && c.opponent_id).length,
    allCompletedToday: challenges.filter(c => 
      c.status === 'completed' && 
      new Date(c.updated_at || c.created_at).toDateString() === new Date().toDateString()
    ).length,
    totalActivePlayers: new Set([
      ...challenges.map(c => c.challenger_id),
      ...challenges.filter(c => c.opponent_id).map(c => c.opponent_id)
    ].filter(Boolean)).size,
    totalSpaInPlay: challenges
      .filter(c => c.status === 'pending' || c.status === 'accepted')
      .reduce((sum, c) => sum + (c.bet_points || 0), 0)
  };

  // Community Overview Component - Enhanced with actual challenges display
  const CommunityOverview = () => {
    // Get actual challenges for each category
    const allOpenChallengesData = challenges.filter(c => !c.opponent_id && c.status === 'pending').slice(0, 3);
    const allLiveChallengesData = challenges.filter(c => c.status === 'accepted').slice(0, 3);
    const allUpcomingChallengesData = challenges.filter(c => c.status === 'pending' && c.opponent_id).slice(0, 3);
    const allCompletedTodayData = challenges.filter(c => 
      c.status === 'completed' && 
      new Date(c.updated_at || c.created_at).toDateString() === new Date().toDateString()
    ).slice(0, 3);

    return (
      <div className='mb-6'>
        <div className='bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3'>
          <div className='flex items-center justify-between mb-3'>
            <h2 className='text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1'>
              🏆 <span>Cộng Đồng</span>
            </h2>
            <div className='flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400'>
              <div className='w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse'></div>
              <span>Live</span>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className='grid grid-cols-4 gap-2 mb-4'>
            <button 
              onClick={() => setActiveTab('find')}
              className='bg-slate-100 dark:bg-slate-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-600 border border-transparent rounded-lg p-2 text-center transition-all active:scale-95 hover:shadow-md'
            >
              <div className='text-lg font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors'>
                {communityStats.allOpenChallenges}
              </div>
              <div className='text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center gap-1 transition-colors'>
                <Search className='w-2.5 h-2.5' />
                <span>Kèo</span>
              </div>
            </button>
            
            <button 
              onClick={() => setActiveTab('live')}
              className='bg-slate-100 dark:bg-slate-800/50 hover:bg-red-100 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-600 border border-transparent rounded-lg p-2 text-center transition-all active:scale-95 hover:shadow-md'
            >
              <div className='text-lg font-bold text-slate-700 dark:text-slate-300 hover:text-red-700 dark:hover:text-red-300 transition-colors'>
                {communityStats.allLiveChallenges}
              </div>
              <div className='text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center gap-1 transition-colors'>
                <Zap className='w-2.5 h-2.5' />
                <span>Live</span>
              </div>
            </button>
            
            <button 
              onClick={() => setActiveTab('upcoming')}
              className='bg-slate-100 dark:bg-slate-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600 border border-transparent rounded-lg p-2 text-center transition-all active:scale-95 hover:shadow-md'
            >
              <div className='text-lg font-bold text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 transition-colors'>
                {communityStats.allUpcomingChallenges}
              </div>
              <div className='text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-1 transition-colors'>
                <Calendar className='w-2.5 h-2.5' />
                <span>Sắp</span>
              </div>
            </button>
            
            <button 
              onClick={() => setActiveTab('completed')}
              className='bg-slate-100 dark:bg-slate-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:border-amber-300 dark:hover:border-amber-600 border border-transparent rounded-lg p-2 text-center transition-all active:scale-95 hover:shadow-md'
            >
              <div className='text-lg font-bold text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 transition-colors'>
                {communityStats.allCompletedToday}
              </div>
              <div className='text-xs text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center justify-center gap-1 transition-colors'>
                <Trophy className='w-2.5 h-2.5' />
                <span>Xong</span>
              </div>
            </button>
          </div>

          {/* Compact Challenge Cards */}
          <div className='space-y-2'>
            {/* Open Challenges */}
            {allOpenChallengesData.length > 0 && (
              <div>
                <button 
                  onClick={() => setActiveTab('find')}
                  className='flex items-center gap-1 mb-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors'
                >
                  <Search className='w-3 h-3 text-slate-500 dark:text-slate-400' />
                  <span className='text-xs font-medium text-slate-600 dark:text-slate-400'>Kèo Mở ({communityStats.allOpenChallenges})</span>
                </button>
                <div className='space-y-1'>
                  {allOpenChallengesData.map(challenge => (
                    <button
                      key={challenge.id} 
                      onClick={() => handleChallengeClick(challenge, 'join')}
                      className='w-full bg-slate-100 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-700 border border-transparent rounded-md p-2 flex items-center justify-between transition-all active:scale-[0.98] hover:shadow-md'
                    >
                      <div className='flex items-center gap-2 flex-1 min-w-0'>
                        {challenge.challenger_profile?.avatar_url ? (
                          <img 
                            src={challenge.challenger_profile.avatar_url} 
                            alt={challenge.challenger_profile?.full_name || 'User'}
                            className='w-6 h-6 rounded-full object-cover ring-2 ring-slate-300 dark:ring-slate-600'
                          />
                        ) : (
                          <div className='w-6 h-6 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 ring-2 ring-slate-300 dark:ring-slate-600'>
                            {challenge.challenger_profile?.full_name?.charAt(0) || '?'}
                          </div>
                        )}
                        <div className='flex-1 min-w-0 text-left'>
                          <div className='text-xs font-medium text-slate-700 dark:text-slate-300 truncate'>
                            {challenge.challenger_profile?.full_name || 'Unknown'}
                          </div>
                          <div className='text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1'>
                            <span>{challenge.bet_points}</span>
                            <span>SPA •</span>
                            <span>Race {challenge.race_to}</span>
                          </div>
                        </div>
                      </div>
                      <div className='text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1'>
                        {new Date(challenge.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        <span className='ml-1 text-emerald-500'>→</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Challenges */}
            {allLiveChallengesData.length > 0 && (
              <div>
                <button 
                  onClick={() => setActiveTab('live')}
                  className='flex items-center gap-1 mb-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors'
                >
                  <Zap className='w-3 h-3 text-slate-500 dark:text-slate-400' />
                  <span className='text-xs font-medium text-slate-600 dark:text-slate-400'>Đang Đấu ({communityStats.allLiveChallenges})</span>
                </button>
                <div className='space-y-1'>
                  {allLiveChallengesData.map(challenge => (
                    <button
                      key={challenge.id} 
                      onClick={() => handleChallengeClick(challenge, 'view')}
                      className='w-full bg-slate-100 dark:bg-slate-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-700 border border-transparent rounded-md p-2 flex items-center justify-between transition-all active:scale-[0.98] hover:shadow-md'
                    >
                      <div className='flex items-center gap-2 flex-1'>
                        <div className='flex items-center gap-1'>
                          {challenge.challenger_profile?.avatar_url ? (
                            <img 
                              src={challenge.challenger_profile.avatar_url} 
                              alt={challenge.challenger_profile?.full_name || 'Player 1'}
                              className='w-5 h-5 rounded-full object-cover ring-1 ring-red-300 dark:ring-red-500'
                            />
                          ) : (
                            <div className='w-5 h-5 bg-gradient-to-br from-red-200 to-red-300 dark:from-red-600 dark:to-red-700 rounded-full flex items-center justify-center text-xs font-bold text-red-700 dark:text-red-200 ring-1 ring-red-300 dark:ring-red-500'>
                              {challenge.challenger_profile?.full_name?.charAt(0) || '?'}
                            </div>
                          )}
                          <span className='text-xs text-slate-500 dark:text-slate-400'>vs</span>
                          {challenge.opponent_profile?.avatar_url ? (
                            <img 
                              src={challenge.opponent_profile.avatar_url} 
                              alt={challenge.opponent_profile?.full_name || 'Player 2'}
                              className='w-5 h-5 rounded-full object-cover ring-1 ring-red-300 dark:ring-red-500'
                            />
                          ) : (
                            <div className='w-5 h-5 bg-gradient-to-br from-red-200 to-red-300 dark:from-red-600 dark:to-red-700 rounded-full flex items-center justify-center text-xs font-bold text-red-700 dark:text-red-200 ring-1 ring-red-300 dark:ring-red-500'>
                              {challenge.opponent_profile?.full_name?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div className='flex-1 min-w-0 text-left'>
                          <div className='text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1'>
                            <span>{challenge.bet_points} SPA</span>
                            <span>•</span>
                            <span>Race {challenge.race_to}</span>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-1'>
                        <div className='w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse'></div>
                        <span className='text-xs text-slate-500 dark:text-slate-400'>LIVE</span>
                        <span className='text-red-500'>→</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Today */}
            {allCompletedTodayData.length > 0 && (
              <div>
                <button 
                  onClick={() => setActiveTab('completed')}
                  className='flex items-center gap-1 mb-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors'
                >
                  <Trophy className='w-3 h-3 text-slate-500 dark:text-slate-400' />
                  <span className='text-xs font-medium text-slate-600 dark:text-slate-400'>Hoàn Thành Hôm Nay ({communityStats.allCompletedToday})</span>
                </button>
                <div className='space-y-1'>
                  {allCompletedTodayData.map(challenge => (
                    <button
                      key={challenge.id} 
                      onClick={() => handleChallengeClick(challenge, 'view')}
                      className='w-full bg-slate-100 dark:bg-slate-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-200 dark:hover:border-amber-700 border border-transparent rounded-md p-2 flex items-center justify-between transition-all active:scale-[0.98] hover:shadow-md'
                    >
                      <div className='flex items-center gap-2 flex-1'>
                        <div className='flex items-center gap-1'>
                          {challenge.challenger_profile?.avatar_url ? (
                            <img 
                              src={challenge.challenger_profile.avatar_url} 
                              alt={challenge.challenger_profile?.full_name || 'Player 1'}
                              className='w-5 h-5 rounded-full object-cover ring-1 ring-amber-300 dark:ring-amber-500'
                            />
                          ) : (
                            <div className='w-5 h-5 bg-gradient-to-br from-amber-200 to-amber-300 dark:from-amber-600 dark:to-amber-700 rounded-full flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-200 ring-1 ring-amber-300 dark:ring-amber-500'>
                              {challenge.challenger_profile?.full_name?.charAt(0) || '?'}
                            </div>
                          )}
                          <span className='text-xs text-slate-500 dark:text-slate-400'>vs</span>
                          {challenge.opponent_profile?.avatar_url ? (
                            <img 
                              src={challenge.opponent_profile.avatar_url} 
                              alt={challenge.opponent_profile?.full_name || 'Player 2'}
                              className='w-5 h-5 rounded-full object-cover ring-1 ring-amber-300 dark:ring-amber-500'
                            />
                          ) : (
                            <div className='w-5 h-5 bg-gradient-to-br from-amber-200 to-amber-300 dark:from-amber-600 dark:to-amber-700 rounded-full flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-200 ring-1 ring-amber-300 dark:ring-amber-500'>
                              {challenge.opponent_profile?.full_name?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div className='flex-1 min-w-0 text-left'>
                          <div className='text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1'>
                            <span>{challenge.bet_points} SPA</span>
                            <span>•</span>
                            <span>Hoàn thành</span>
                          </div>
                        </div>
                      </div>
                      <div className='text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1'>
                        {new Date(challenge.updated_at || challenge.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        <span className='text-amber-500'>→</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Stats */}
          <div className='flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 mt-2 border-t border-slate-200 dark:border-slate-700'>
            <div className='flex items-center gap-1'>
              <Users className='w-3 h-3' />
              <span>{communityStats.totalActivePlayers} Cao Thủ</span>
            </div>
            <div className='flex items-center gap-1'>
              <span className='text-slate-600 dark:text-slate-300 font-semibold'>
                {communityStats.totalSpaInPlay.toLocaleString()}
              </span>
              <span>SPA</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const [activeTab, setActiveTab] = useState('find'); // Start with "find" tab to see open challenges
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [isChallengeDetailOpen, setIsChallengeDetailOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchChallenges();
      toast.success('Đã làm mới dữ liệu thách đấu');
    } catch (error) {
      toast.error('Lỗi khi làm mới dữ liệu');
    } finally {
      setIsRefreshing(false);
    }
  };

  const joinOpenChallenge = async (challengeId: string) => {
    try {
      await acceptChallenge(challengeId);
      toast.success('Đã tham gia thách đấu thành công!');
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast.error('Lỗi khi tham gia thách đấu');
    }
  };

  const handleCreateChallenge = () => {
    setIsCreateModalOpen(true);
  };

  const handleChallengeCreated = () => {
    setIsCreateModalOpen(false);
    fetchChallenges(); // Refresh challenges list
    toast.success('Thách đấu đã được tạo thành công!');
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await acceptChallenge(challengeId);
      setIsChallengeDetailOpen(false);
      toast.success('Đã tham gia thách đấu thành công!');
      fetchChallenges(); // Refresh challenges list
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast.error('Lỗi khi tham gia thách đấu');
    }
  };

  const handleChallengeClick = (challenge: any, action: 'view' | 'join' = 'view') => {
    setSelectedChallenge({ ...challenge, action });
    setIsChallengeDetailOpen(true);
  };

  // Challenge Detail Modal Component - Enhanced with flexible positioning and proper action buttons
  const ChallengeDetailModal = () => {
    if (!selectedChallenge) return null;

    const canJoin = selectedChallenge.status === 'pending' && 
                   !selectedChallenge.opponent_id && 
                   selectedChallenge.challenger_id !== user?.id;
    
    const isLiveMatch = selectedChallenge.status === 'accepted';
    const isCompleted = selectedChallenge.status === 'completed';
    const isMyChallenge = selectedChallenge.challenger_id === user?.id || selectedChallenge.opponent_id === user?.id;

    return (
      <div className={`fixed inset-0 z-50 ${isChallengeDetailOpen ? 'block' : 'hidden'}`}>
        {/* Background overlay with scroll lock */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity overflow-hidden" 
          onClick={() => setIsChallengeDetailOpen(false)}
          style={{ touchAction: 'none' }} // Prevent scroll on background
        />
        
        {/* Centered Modal Container - Compact and optimized */}
        <div className="fixed inset-0 flex items-center justify-center p-3 pointer-events-none">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm max-h-[75vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 transform transition-all pointer-events-auto">
            <div className="flex flex-col h-full">
              {/* Compact Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Chi tiết thách đấu</h2>
                <button 
                  onClick={() => setIsChallengeDetailOpen(false)}
                  className="w-7 h-7 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Content with proper scroll containment */}
              <div 
                className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-3"
                style={{ scrollBehavior: 'smooth' }}
              >
                {/* Compact Player Info */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600">
                  {selectedChallenge.challenger_profile?.avatar_url ? (
                    <img 
                      src={selectedChallenge.challenger_profile.avatar_url} 
                      alt={selectedChallenge.challenger_profile?.full_name || 'Player'}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 rounded-full flex items-center justify-center text-lg font-bold text-slate-700 dark:text-slate-200 ring-2 ring-white dark:ring-slate-800 shadow-md">
                      {selectedChallenge.challenger_profile?.full_name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 truncate">
                      {selectedChallenge.challenger_profile?.full_name || 'Unknown Player'}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                        Rank {selectedChallenge.challenger_profile?.verified_rank || selectedChallenge.challenger_profile?.current_rank || 'A'}
                      </span>
                      {isLiveMatch && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700 animate-pulse">
                          🔴 LIVE
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Compact Challenge Details Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-center">
                    <div className="text-lg mb-0.5">🏆</div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-0.5">Điểm cược</p>
                    <p className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                      {selectedChallenge.bet_points?.toLocaleString() || 0} SPA
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center">
                    <div className="text-lg mb-0.5">🎯</div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-0.5">Race to</p>
                    <p className="text-base font-bold text-blue-700 dark:text-blue-300">
                      {selectedChallenge.race_to}
                    </p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center">
                    <div className="text-lg mb-0.5">⚡</div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-0.5">Loại</p>
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
                      {selectedChallenge.challenge_type || 'Standard'}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
                    <div className="text-lg mb-0.5">⏰</div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-0.5">Thời gian</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {new Date(selectedChallenge.created_at).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Compact Player Statistics */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-700/30 border border-slate-200 dark:border-slate-600 rounded-lg p-3">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1 text-sm">
                    📊 Thống kê
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">SPA Points</p>
                      <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                        {(selectedChallenge.challenger_profile as any)?.spa_points?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Rank</p>
                      <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        {selectedChallenge.challenger_profile?.verified_rank || 'A'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Win Rate</p>
                      <p className="text-sm font-bold text-green-600 dark:text-green-400">
                        {Math.floor(Math.random() * 30 + 60)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Compact Message Section */}
                {selectedChallenge.message && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-1 text-sm">
                      💬 Lời nhắn
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 italic leading-relaxed">
                      "{selectedChallenge.message}"
                    </p>
                  </div>
                )}
              </div>

              {/* Compact Action Buttons Footer */}
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsChallengeDetailOpen(false)}
                    className="flex-1 py-2 px-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors border border-slate-300 dark:border-slate-600 text-sm"
                  >
                    Đóng
                  </button>
                  
                  {/* Join Challenge Button */}
                  {canJoin && (
                    <button
                      onClick={() => handleJoinChallenge(selectedChallenge.id)}
                      className="flex-2 py-2 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] border border-emerald-400 text-sm"
                    >
                      🔥 Thách Đấu!
                    </button>
                  )}
                  
                  {/* Watch Live Button */}
                  {isLiveMatch && (
                    <button
                      onClick={() => {
                        setIsChallengeDetailOpen(false);
                        setActiveTab('live');
                        toast.success('Đang chuyển đến phần xem trực tiếp...');
                      }}
                      className="flex-2 py-2 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] border border-red-400 animate-pulse text-sm"
                    >
                      🎯 Xem Live
                    </button>
                  )}
                  
                  {/* View Result Button */}
                  {isCompleted && (
                    <button
                      onClick={() => {
                        setIsChallengeDetailOpen(false);
                        setActiveTab('completed');
                        toast.info('Đang xem kết quả chi tiết...');
                      }}
                      className="flex-2 py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] border border-amber-400"
                    >
                      � Xem Kết Quả
                    </button>
                  )}
                  
                  {/* My Challenge View Button */}
                  {isMyChallenge && selectedChallenge.status === 'pending' && selectedChallenge.opponent_id && (
                    <button
                      onClick={() => {
                        setIsChallengeDetailOpen(false);
                        setActiveTab('upcoming');
                        toast.info('Đang xem thách đấu của bạn...');
                      }}
                      className="flex-2 py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] border border-blue-400"
                    >
                      👁️ Xem Chi Tiết
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'live':
        return (
          <div className='space-y-4'>
            <div className='text-center py-6'>
              <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2'>
                ĐANG DIỄN RA
              </h3>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Các thách đấu đã được chấp nhận và đang diễn ra
              </p>
            </div>
            {ongoingChallenges.length > 0 ? (
              ongoingChallenges.map(challenge => {
                // Convert to LiveMatch format
                const liveMatch = {
                  id: challenge.id,
                  player1: {
                    id: challenge.challenger_id,
                    name: challenge.challenger_profile?.full_name || 'Player 1',
                    avatar: challenge.challenger_profile?.avatar_url,
                    rank: challenge.challenger_profile?.verified_rank || 'A'
                  },
                  player2: {
                    id: challenge.opponent_id || '',
                    name: challenge.opponent_profile?.full_name || 'Player 2',
                    avatar: challenge.opponent_profile?.avatar_url,
                    rank: challenge.opponent_profile?.verified_rank || 'A'
                  },
                  score: {
                    player1: Math.floor(Math.random() * challenge.race_to),
                    player2: Math.floor(Math.random() * challenge.race_to)
                  },
                  raceToTarget: challenge.race_to,
                  betPoints: challenge.bet_points,
                  startTime: challenge.created_at,
                  location: 'Club SaBo'
                };

                return (
                  <LiveMatchCard
                    key={challenge.id}
                    match={liveMatch}
                    onWatch={(matchId) => {
                      toast.success('Đang mở trận đấu trực tiếp...');
                    }}
                  />
                );
              })
            ) : (
              <div className='text-center py-8 text-slate-500 dark:text-slate-400'>
                <Users className='w-12 h-12 mx-auto mb-3 text-slate-400 dark:text-slate-500' />
                <p>Không có thách đấu nào đang diễn ra</p>
              </div>
            )}
          </div>
        );

      case 'upcoming':
        return (
          <div className='space-y-4'>
            <div className='text-center py-6'>
              <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2'>
                SẮP DIỄN RA
              </h3>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Thách đấu đã được lên lịch với đối thủ cụ thể
              </p>
            </div>
            {upcomingChallenges.length > 0 ? (
              upcomingChallenges.map(challenge => (
                <UnifiedChallengeCard
                  key={challenge.id}
                  challenge={{
                    ...challenge,
                    status: 'accepted' as const,
                  }}
                  variant='compact'
                />
              ))
            ) : (
              <div className='text-center py-8 text-slate-500 dark:text-slate-400'>
                <Calendar className='w-12 h-12 mx-auto mb-3 text-slate-400 dark:text-slate-500' />
                <p>Không có thách đấu nào sắp diễn ra</p>
              </div>
            )}
          </div>
        );

      case 'find':
        return (
          <div className='space-y-3'>
            <div className='text-center py-4 mb-2'>
              <h3 className='text-lg font-bold text-slate-700 dark:text-slate-300 mb-1'>
                ĐANG TÌM ĐỐI THỦ
              </h3>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Thách đấu mở của người chơi khác
              </p>
            </div>
            {openChallenges.length > 0 ? (
              openChallenges.map(challenge => {
                console.log('🎯 Rendering open challenge:', {
                  id: challenge.id?.slice(-8),
                  challenger:
                    challenge.challenger_profile?.display_name ||
                    challenge.challenger_profile?.full_name,
                  hasProfile: !!challenge.challenger_profile,
                });
                return (
                  <OpenChallengeCard
                    key={challenge.id}
                    challenge={{
                      ...challenge,
                      status: 'pending' as const,
                    }}
                    onJoin={joinOpenChallenge}
                    currentUser={user}
                    isJoining={false}
                  />
                );
              })
            ) : (
              <div className='text-center py-12 text-slate-500 dark:text-slate-400'>
                <div className='w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Search className='w-8 h-8 text-slate-400 dark:text-slate-500' />
                </div>
                <h4 className='font-semibold text-slate-700 dark:text-slate-300 mb-2'>
                  Chưa có thách đấu mở
                </h4>
                <p className='text-sm'>Hãy thử làm mới hoặc quay lại sau</p>
              </div>
            )}
          </div>
        );

      case 'completed':
        return (
          <div className='space-y-4'>
            <div className='text-center py-6'>
              <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2'>
                MỚI HOÀN THÀNH
              </h3>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Các thách đấu vừa kết thúc gần đây
              </p>
            </div>
            {completedChallenges.length > 0 ? (
              completedChallenges.map(challenge => (
                <CompletedChallengeCard
                  key={challenge.id}
                  challenge={{
                    ...challenge,
                    status: 'completed' as const,
                    challenger_score: Math.floor(Math.random() * challenge.race_to),
                    opponent_score: Math.floor(Math.random() * challenge.race_to),
                    winner_id: Math.random() > 0.5 ? challenge.challenger_id : challenge.opponent_id,
                    completed_at: new Date().toISOString()
                  }}
                  onView={() => {
                    toast.info('Xem chi tiết kết quả...');
                  }}
                />
              ))
            ) : (
              <div className='text-center py-8 text-slate-500 dark:text-slate-400'>
                <Trophy className='w-12 h-12 mx-auto mb-3 text-slate-400 dark:text-slate-500' />
                <p>Chưa có thách đấu nào hoàn thành</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <div className='w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-slate-600 dark:border-t-slate-400 rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-slate-500 dark:text-slate-400'>Đang tải thách đấu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-12 text-red-600'>
        <p>Lỗi: {error}</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className='p-4'>
        {/* Header with refresh button and create challenge button */}
        <div className='flex items-center justify-between mb-4'>
          <h1 className='text-xl font-bold text-foreground'>Thách Đấu</h1>
          <div className='flex items-center gap-2'>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className='flex items-center gap-1.5 px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-xl transition-colors disabled:opacity-50 mobile-touch-button'
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span className='font-medium'>Làm mới</span>
            </button>
            <button
              onClick={handleCreateChallenge}
              className='flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground rounded-xl transition-all mobile-touch-button font-semibold shadow-md'
            >
              <span className='text-lg'>+</span>
              <span className='text-sm'>Tạo thách đấu</span>
            </button>
          </div>
        </div>

        {/* Community Overview Dashboard */}
        <CommunityOverview />

        {/* Priority: Active Challenge Highlight - Only show when there are active challenges */}
        {(ongoingChallenges.length > 0 || upcomingChallenges.length > 0) && (
          <div className='mb-6'>
            <ErrorBoundary
              fallback={
                <div className='p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive'>
                  Lỗi hiển thị thách đấu đang hoạt động
                </div>
              }
            >
              <ActiveChallengeHighlight
                challenges={challenges || []}
                user={user}
                onChallengeClick={challenge => {
                  console.log('Mobile challenge clicked:', challenge);
                  // Could navigate to challenge details page or open modal
                }}
              />
            </ErrorBoundary>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-4 mb-4 h-auto p-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm'>
            <TabsTrigger
              value='live'
              className='flex flex-col gap-0.5 p-2 rounded-lg text-slate-600 dark:text-slate-400 data-[state=active]:bg-red-100 data-[state=active]:dark:bg-red-900/30 data-[state=active]:text-red-700 data-[state=active]:dark:text-red-300 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-red-200 data-[state=active]:dark:border-red-700 transition-all hover:bg-red-50 dark:hover:bg-red-900/20'
            >
              <Zap className='w-3.5 h-3.5' />
              <span className='text-xs font-medium'>Đang diễn ra</span>
              {ongoingChallenges.length > 0 && (
                <div className='w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md'>
                  {ongoingChallenges.length}
                </div>
              )}
            </TabsTrigger>
            <TabsTrigger
              value='upcoming'
              className='flex flex-col gap-0.5 p-2 rounded-lg text-slate-600 dark:text-slate-400 data-[state=active]:bg-blue-100 data-[state=active]:dark:bg-blue-900/30 data-[state=active]:text-blue-700 data-[state=active]:dark:text-blue-300 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-blue-200 data-[state=active]:dark:border-blue-700 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20'
            >
              <Calendar className='w-3.5 h-3.5' />
              <span className='text-xs font-medium'>Sắp diễn ra</span>
              {upcomingChallenges.length > 0 && (
                <div className='w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md'>
                  {upcomingChallenges.length}
                </div>
              )}
            </TabsTrigger>
            <TabsTrigger
              value='find'
              className='flex flex-col gap-0.5 p-2 rounded-lg text-slate-600 dark:text-slate-400 data-[state=active]:bg-emerald-100 data-[state=active]:dark:bg-emerald-900/30 data-[state=active]:text-emerald-700 data-[state=active]:dark:text-emerald-300 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-emerald-200 data-[state=active]:dark:border-emerald-700 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
            >
              <Search className='w-3.5 h-3.5' />
              <span className='text-xs font-medium'>Tìm đối thủ</span>
              {openChallenges.length > 0 && (
                <div className='w-4 h-4 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md'>
                  {openChallenges.length}
                </div>
              )}
            </TabsTrigger>
            <TabsTrigger
              value='completed'
              className='flex flex-col gap-0.5 p-2 rounded-lg text-slate-600 dark:text-slate-400 data-[state=active]:bg-amber-100 data-[state=active]:dark:bg-amber-900/30 data-[state=active]:text-amber-700 data-[state=active]:dark:text-amber-300 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-amber-200 data-[state=active]:dark:border-amber-700 transition-all hover:bg-amber-50 dark:hover:bg-amber-900/20'
            >
              <Trophy className='w-3.5 h-3.5' />
              <span className='text-xs font-medium'>Hoàn thành</span>
              {completedChallenges.length > 0 && (
                <div className='w-4 h-4 bg-amber-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md'>
                  {completedChallenges.length}
                </div>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value='live' className='mt-0'>
            {renderTabContent()}
          </TabsContent>

          <TabsContent value='upcoming' className='mt-0'>
            {renderTabContent()}
          </TabsContent>

          <TabsContent value='find' className='mt-0'>
            {renderTabContent()}
          </TabsContent>

          <TabsContent value='completed' className='mt-0'>
            {renderTabContent()}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Challenge Modal */}
      <UnifiedCreateChallengeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onChallengeCreated={handleChallengeCreated}
        variant='standard'
      />

      {/* Challenge Detail Modal */}
      <ChallengeDetailModal />
    </div>
  );
};

export default MobileChallengeManager;
