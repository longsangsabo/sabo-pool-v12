import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Clock,
  Trophy,
  Coins,
  Calendar,
  Users,
  MapPin,
  Zap,
  Play,
  Star,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Challenge } from '@/types/challenge';
import { EnhancedChallengeCardProps, ExtendedChallenge, toExtendedChallenge } from '@/types/enhancedChallenge';
import AvatarWithStatus from './Enhanced/AvatarWithStatus';
import StatusBadge from './Enhanced/StatusBadge';
import CurrentUserInfo from './CurrentUserInfo';
import { formatVietnamTime } from "@sabo/shared-utils"
import { getRankOrder, extractRankFromProfile } from '@/lib/rankUtils';
import { useEnhancedChallengesV3 } from '@/hooks/useEnhancedChallengesV3';
import { toast } from 'sonner';
import { formatHandicapForDisplay, calculateSaboHandicapPrecise } from '@/utils/saboHandicapCalculator';
import { SaboRank } from '@/utils/saboHandicap';
import IntegratedScoreManager from './IntegratedScoreManager';
import ClubApprovalCard from './ClubApprovalCard';
import { useClubAdminCheck } from '@/hooks/useClubAdminCheck';

// Modified props to accept both Challenge and ExtendedChallenge
interface FlexibleEnhancedChallengeCardProps extends Omit<EnhancedChallengeCardProps, 'challenge'> {
  challenge: Challenge | ExtendedChallenge;
  currentUserId?: string;
  currentUserProfile?: {
    verified_rank?: string;
    current_rank?: string;
    rank?: string;
  } | null;
}

const EnhancedChallengeCard: React.FC<FlexibleEnhancedChallengeCardProps> = ({
  challenge: originalChallenge,
  variant = 'default',
  size = 'default',
  showQuickActions = true,
  showStats = true,
  showBadges = true,
  isInteractive = true,
  isSelected = false,
  onAction,
  onCardClick,
  className = '',
  currentUserId,
  currentUserProfile
}) => {
  console.log('🎯 [DEBUG] EnhancedChallengeCard rendered for challenge:', originalChallenge.id);
  
  // Convert to ExtendedChallenge for enhanced features
  const challenge = toExtendedChallenge(originalChallenge);
  
  // 🎯 NEW: Hook for direct challenge actions
  const { acceptChallenge } = useEnhancedChallengesV3();
  
  // Check if current user is the challenger (creator)
  const isCreator = currentUserId && challenge.challenger_id === currentUserId;
  
  // 🚀 NEW: Simple join challenge handler
  const handleJoinChallenge = async () => {
    console.log('🎯 [DEBUG] handleJoinChallenge called for challenge:', challenge.id);
    try {
      console.log('🎯 [DEBUG] Calling acceptChallenge...');
      await acceptChallenge(challenge.id);
      console.log('🎯 [DEBUG] acceptChallenge successful!');
      toast.success('🎯 Tham gia thách đấu thành công!');
    } catch (error) {
      console.error('🎯 [DEBUG] acceptChallenge error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi khi tham gia thách đấu';
      toast.error(errorMessage);
    }
  };

  // 🚀 NEW: Simple cancel challenge handler  
  const handleCancelChallenge = async () => {
    // Fallback to onAction if available
    if (onAction) {
      onAction(challenge.id, 'cancel');
    } else {
      toast.error('Tính năng hủy thách đấu chưa được kết nối');
    }
  };

  // Start match handler - simplified to only update challenge status
  const handleStartMatch = async () => {
    console.log('🎯 [DEBUG] handleStartMatch called for challenge:', challenge.id);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!
      );

      // Simply update challenge status to ongoing - no matches table needed
      const { error } = await supabase
        .from('challenges')
        .update({ status: 'ongoing' })
        .eq('id', challenge.id);

      if (error) {
        console.error('🎯 [ERROR] Challenge status update failed:', error);
        toast.error('Lỗi khi bắt đầu trận đấu');
        return;
      }

      console.log('🎯 [DEBUG] Challenge status updated to ongoing');
      toast.success('🏁 Trận đấu đã được bắt đầu!');
      
      // Refresh challenges
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('🎯 [DEBUG] handleStartMatch error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi khi bắt đầu trận đấu';
      toast.error(errorMessage);
    }
  };

  // 🚀 NEW: Enter score handler
  const handleEnterScore = async () => {
    console.log('🎯 [DEBUG] handleEnterScore called for challenge:', challenge.id);
    toast.info('🎮 Tính năng nhập tỷ số đang được phát triển');
    
    // TODO: Implement score entry modal or flow
    // This should:
    // 1. Show score input modal
    // 2. Submit scores to matches table
    // 3. Determine winner
    // 4. Update challenge status to completed
  };
  
  // Check if current user is a club admin for this challenge's club
  const { isClubAdmin, loading: clubAdminLoading } = useClubAdminCheck({
    challengeClubId: challenge.club_id
  });
  
  // Check rank eligibility for joining
  const isRankEligible = () => {
    if (!challenge.required_rank || challenge.required_rank === 'all' || !currentUserProfile) {
      return true; // No rank requirement or no profile to check
    }
    
    const currentUserRank = extractRankFromProfile(currentUserProfile);
    const requiredRankOrder = getRankOrder(challenge.required_rank);
    const currentRankOrder = getRankOrder(currentUserRank);
    
    // Only log in development mode if needed for debugging
    // console.log('🔍 [EnhancedChallengeCard] Rank eligibility check:', {
    //   challengeId: challenge.id,
    //   required_rank: challenge.required_rank,
    //   requiredRankOrder,
    //   currentUserRank,
    //   currentRankOrder,
    //   isEligible: currentRankOrder >= requiredRankOrder
    // });
    
    return currentRankOrder >= requiredRankOrder;
  };
  
  // Get current user profile information
  const getCurrentUserProfile = () => {
    if (!currentUserId) return null;
    
    if (currentUserId === challenge.challenger_id) {
      return challenge.challenger_profile;
    } else if (currentUserId === challenge.opponent_id) {
      return challenge.opponent_profile;
    }
    return null;
  };

  const currentUserChallengeProfile = getCurrentUserProfile();

  // Debug logging after functions are defined
  console.log('🎯 [DEBUG] Challenge conditions:', {
    challengeId: challenge.id,
    status: challenge.status,
    currentUserId,
    challengerId: challenge.challenger_id,
    isCreator,
    hasRequiredRank: isRankEligible(),
    requiredRank: challenge.required_rank
  });

  // Calculate handicap in real-time if not available or to verify stored data
  const calculateLiveHandicap = () => {
    try {
      const challengerRank = challenge.challenger_profile?.current_rank || challenge.challenger_profile?.verified_rank;
      const opponentRank = challenge.opponent_profile?.current_rank || challenge.opponent_profile?.verified_rank;
      const betAmount = challenge.bet_amount || 100;

      if (challengerRank && opponentRank) {
        const result = calculateSaboHandicapPrecise(
          challengerRank as SaboRank,
          opponentRank as SaboRank, 
          betAmount
        );

        // Only log in development mode if needed for debugging
        // console.log('🎯 Live Handicap Calculation:', {
        //   challengeId: challenge.id,
        //   challengerRank,
        //   opponentRank,
        //   betAmount,
        //   result
        // });

        return result;
      } else {
        // Only warn if both ranks are missing (normal for open challenges)
        if (!challengerRank && !opponentRank) {
          // console.warn('Missing rank data for handicap calculation:', {
          //   challengeId: challenge.id,
          //   challengerRank,
          //   opponentRank
          // });
        }
      }
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error calculating live handicap:', error);
      }
    }
    return null;
  };

  const liveHandicap = calculateLiveHandicap();

  const formatCurrency = (amount?: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateTime?: string) => {
    if (!dateTime) return '';
    return formatVietnamTime(dateTime);
  };

  const getExpiryInfo = () => {
    if (challenge.status !== 'pending' || challenge.opponent_id) {
      return null; // Only show expiry for pending challenges without opponent
    }

    const now = new Date();
    let expiryDate: Date | null = null;

    // Check expires_at first
    if (challenge.expires_at) {
      expiryDate = new Date(challenge.expires_at);
    } else if (challenge.scheduled_time) {
      expiryDate = new Date(challenge.scheduled_time);
    } else if (challenge.created_at) {
      // Default: 48 hours from creation
      const created = new Date(challenge.created_at);
      expiryDate = new Date(created.getTime() + 48 * 60 * 60 * 1000);
    }

    if (!expiryDate) return null;

    const timeLeft = expiryDate.getTime() - now.getTime();
    
    if (timeLeft <= 0) {
      return { expired: true, text: 'Đã hết hạn', color: 'text-error-600 dark:text-red-400' };
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 1) {
      return { 
        expired: false, 
        text: `${minutes}p`, 
        color: 'text-warning-600 dark:text-orange-400' 
      };
    } else if (hours < 24) {
      return { 
        expired: false, 
        text: `${hours}h ${minutes}p`, 
        color: 'text-warning-600 dark:text-yellow-400' 
      };
    } else {
      const days = Math.floor(hours / 24);
      return { 
        expired: false, 
        text: `${days} ngày`, 
        color: 'text-success-600 dark:text-green-400' 
      };
    }
  };

  const handleCardClick = () => {
    if (onCardClick && isInteractive) {
      onCardClick(challenge.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning-100 text-warning-800';
      case 'accepted': return 'bg-primary-100 text-primary-800';
      case 'live':
      case 'ongoing': return 'bg-error-100 text-error-800';
      case 'completed': return 'bg-success-100 text-success-800';
      case 'cancelled': return 'bg-neutral-100 text-neutral-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'live': 
        return 'border-error-200/30 dark:border-red-800/30 bg-error-50/20 dark:bg-red-950/10 shadow-lg shadow-red-500/5 dark:shadow-red-500/15 backdrop-blur-md';
      case 'completed': 
        return 'border-success-200/30 dark:border-green-800/30 bg-success-50/20 dark:bg-green-950/10 shadow-lg shadow-green-500/5 dark:shadow-green-500/15 backdrop-blur-md';
      case 'upcoming': 
        return 'border-primary-200/30 dark:border-blue-800/30 bg-primary-50/20 dark:bg-blue-950/10 shadow-lg shadow-blue-500/5 dark:shadow-blue-500/15 backdrop-blur-md';
      case 'open': 
        return 'border-yellow-200/30 dark:border-yellow-800/30 bg-warning-50/20 dark:bg-yellow-950/10 shadow-lg shadow-yellow-500/5 dark:shadow-yellow-500/15 backdrop-blur-md';
      default: 
        return 'border-border/30 dark:border-border/20 bg-transparent backdrop-blur-md';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={cn('w-full', className)}
    >
      <Card 
        className={cn(
          'transition-all duration-300 hover:shadow-lg dark:hover:shadow-black/25 cursor-pointer',
          'border backdrop-blur-sm',
          getVariantStyles(),
          isSelected && 'ring-2 ring-primary/50 dark:ring-primary/60',
          // Enhanced dark mode support
          'hover:border-primary/30 dark:hover:border-primary/40'
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-3 relative overflow-hidden">
          {/* Subtle background pattern for dark mode */}
          <div className="absolute inset-0 opacity-5 dark:opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"></div>
          </div>

          {/* Header with enhanced status */}
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2">
              {showBadges && (
                <StatusBadge 
                  status={challenge.status}
                  variant={variant as any}
                  size={size === 'compact' ? 'sm' : 'md'}
                  animated={variant === 'live' || challenge.status === 'ongoing'}
                  showCountdown={variant === 'upcoming'}
                  startTime={challenge.scheduled_time}
                />
              )}
              {challenge.type && (
                <Badge 
                  variant="outline" 
                  className="border-border/50 dark:border-border/30 bg-background/50 dark:bg-card/50"
                >
                  {challenge.type}
                </Badge>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              {challenge.scheduled_time && (
                <div className="text-caption text-primary-600 dark:text-blue-400 font-medium bg-primary-50/50 dark:bg-blue-900/30 px-2 py-1 rounded">
                  {formatDateTime(challenge.scheduled_time)}
                </div>
              )}
              {(() => {
                const expiryInfo = getExpiryInfo();
                if (expiryInfo) {
                  return (
                    <div className={`text-caption-medium px-2 py-1 rounded ${expiryInfo.color} ${
                      expiryInfo.expired 
                        ? 'bg-error-50/50 dark:bg-red-900/30' 
                        : 'bg-neutral-50/50 dark:bg-neutral-900/30'
                    }`}>
                      {expiryInfo.expired ? '⏰' : '⌛'} {expiryInfo.text}
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
          {/* Enhanced Challenge Content */}
          <div className="space-y-3 relative z-10">
            {/* Challenge Title and Reward */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-800 dark:text-gray-100 mb-1 line-clamp-2">
                  {challenge.title || challenge.message || 'Thách đấu'}
                </h3>
                {challenge.description && size !== 'compact' && (
                  <p className="text-body-small text-neutral-700 dark:text-gray-200 line-clamp-2">
                    {challenge.description}
                  </p>
                )}
              </div>
              {challenge.bet_amount && (
                <div className="text-caption text-warning-600 dark:text-yellow-400 font-bold bg-warning-100/50 dark:bg-yellow-900/30 px-2 py-1 rounded">
                  {challenge.bet_amount.toLocaleString()} SPA
                </div>
              )}
            </div>

            {/* Enhanced Players Section */}
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <AvatarWithStatus
                  profile={challenge.challenger_profile}
                  size={size === 'compact' ? 'sm' : 'md'}
                  showStatus={variant === 'live'}
                  showRank={true}
                  className="mx-auto mb-1"
                />
                <div className="text-caption-medium text-neutral-700 dark:text-gray-300 truncate">
                  {challenge.challenger_profile?.display_name || challenge.challenger_profile?.full_name || challenge.challenger_profile?.username || 'Player 1'}
                </div>
                {/* Player Info */}
                <div className="text-caption-neutral dark:text-gray-400 mt-1 space-y-0.5">
                  {challenge.challenger_profile?.verified_rank && (
                    <div className="flex items-center justify-center gap-1">
                      <Trophy className="w-3 h-3" />
                      <span>{challenge.challenger_profile.verified_rank}</span>
                    </div>
                  )}
                  {challenge.challenger_profile?.spa_points !== undefined && (
                    <div className="flex items-center justify-center gap-1">
                      <Coins className="w-3 h-3" />
                      <span>{challenge.challenger_profile.spa_points} SPA</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mx-4 text-center">
                <div className="text-neutral-600 dark:text-gray-300 text-body-large font-bold">
                  vs
                </div>
                {/* Enhanced Handicap Display */}
                {(challenge.handicap_data || liveHandicap) && (
                  <div className="text-caption mt-1">
                    {(() => {
                      // Ưu tiên sử dụng live calculation, fallback to stored data
                      let handicapDataToUse = null;
                      
                      if (liveHandicap && liveHandicap.isValid) {
                        handicapDataToUse = {
                          handicap_challenger: liveHandicap.handicapChallenger,
                          handicap_opponent: liveHandicap.handicapOpponent,
                          explanation: liveHandicap.explanation
                        };
                      } else if (challenge.handicap_data) {
                        handicapDataToUse = typeof challenge.handicap_data === 'string' 
                          ? JSON.parse(challenge.handicap_data) 
                          : challenge.handicap_data;
                      }

                      if (!handicapDataToUse) return null;
                      
                      const handicapDisplay = formatHandicapForDisplay(handicapDataToUse);
                      
                      return (
                        <div className={`
                          px-2 py-1 rounded-full border font-medium
                          ${handicapDisplay.color === 'blue' ? 'bg-primary-50 dark:bg-blue-900/20 border-primary-200 dark:border-blue-700 text-primary-700 dark:text-blue-300' : ''}
                          ${handicapDisplay.color === 'green' ? 'bg-success-50 dark:bg-green-900/20 border-success-200 dark:border-green-700 text-success-700 dark:text-green-300' : ''}
                          ${handicapDisplay.color === 'gray' ? 'bg-neutral-50 dark:bg-neutral-900/20 border-neutral-200 dark:border-gray-700 text-neutral-700 dark:text-gray-300' : ''}
                        `}>
                          {handicapDisplay.icon} {handicapDisplay.shortText}
                          {liveHandicap && (
                            <span className="ml-1 text-caption opacity-60" title="Live calculated">⚡</span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="flex-1 text-center">
                <AvatarWithStatus
                  profile={challenge.opponent_profile}
                  size={size === 'compact' ? 'sm' : 'md'}
                  showStatus={variant === 'live'}
                  showRank={true}
                  className="mx-auto mb-1"
                />
                <div className="text-caption-medium text-neutral-700 dark:text-gray-300 truncate">
                  {challenge.opponent_profile?.display_name || challenge.opponent_profile?.full_name || challenge.opponent_profile?.username || 'Waiting...'}
                </div>
                {/* Player Info */}
                {challenge.opponent_profile && (
                  <div className="text-caption-neutral dark:text-gray-400 mt-1 space-y-0.5">
                    {challenge.opponent_profile?.verified_rank && (
                      <div className="flex items-center justify-center gap-1">
                        <Trophy className="w-3 h-3" />
                        <span>{challenge.opponent_profile.verified_rank}</span>
                      </div>
                    )}
                    {challenge.opponent_profile?.spa_points !== undefined && (
                      <div className="flex items-center justify-center gap-1">
                        <Coins className="w-3 h-3" />
                        <span>{challenge.opponent_profile.spa_points} SPA</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Club and Rank Information Section */}
            {(challenge.location || (challenge.required_rank && challenge.required_rank !== 'all')) && (
              <div className="space-y-2">
                {/* Club Location */}
                {challenge.location && (
                  <div className="flex items-start gap-2 p-3 bg-success-50/50 dark:bg-green-900/20 rounded-lg border border-success-200/50 dark:border-green-700/30">
                    <MapPin className="w-4 h-4 text-success-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-neutral-600 dark:text-gray-400 text-caption-medium block">CLB thi đấu</span>
                      <span className="text-neutral-800 dark:text-gray-100 font-semibold text-body-small leading-relaxed">
                        {challenge.location}
                      </span>
                    </div>
                  </div>
                )}

                {/* Required Rank */}
                {challenge.required_rank && challenge.required_rank !== 'all' && (
                  <div className="flex items-start gap-2 p-3 bg-primary-50/50 dark:bg-blue-900/20 rounded-lg border border-primary-200/50 dark:border-blue-700/30">
                    <Star className="w-4 h-4 text-primary-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-neutral-600 dark:text-gray-400 text-caption-medium block">Yêu cầu hạng</span>
                      <span className="text-neutral-800 dark:text-gray-100 font-semibold text-body-small">
                        {challenge.required_rank === 'K' ? '🔰 K hạng trở lên' : 
                         challenge.required_rank === 'I' ? '🟦 I hạng trở lên' : 
                         challenge.required_rank === 'H' ? '🟩 H hạng trở lên' : 
                         challenge.required_rank === 'G' ? '🟨 G hạng trở lên' : 
                         challenge.required_rank === 'F' ? '🟧 F hạng trở lên' : 
                         challenge.required_rank === 'E' ? '🔴 E hạng trở lên' : 
                         `${challenge.required_rank} hạng trở lên`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Challenge Details */}
            <div className="grid grid-cols-2 gap-3 text-body-small">
              {challenge.race_to && (
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span className="text-neutral-800 dark:text-gray-100 font-medium">Race to {challenge.race_to}</span>
                </div>
              )}

              {/* Enhanced Handicap Summary */}
              {(challenge.handicap_data || liveHandicap) && (
                <div className="flex items-start gap-2 col-span-2">
                  <Zap className="w-4 h-4 text-info-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    {(() => {
                      // Ưu tiên sử dụng live calculation
                      let handicapDataToUse = null;
                      
                      if (liveHandicap && liveHandicap.isValid) {
                        handicapDataToUse = {
                          handicap_challenger: liveHandicap.handicapChallenger,
                          handicap_opponent: liveHandicap.handicapOpponent,
                          explanation: liveHandicap.explanation
                        };
                      } else if (challenge.handicap_data) {
                        handicapDataToUse = typeof challenge.handicap_data === 'string' 
                          ? JSON.parse(challenge.handicap_data) 
                          : challenge.handicap_data;
                      }

                      if (!handicapDataToUse) return null;
                      
                      const handicapDisplay = formatHandicapForDisplay(handicapDataToUse);
                      
                      return (
                        <div className={`
                          p-2 rounded-lg border text-sm
                          ${handicapDisplay.color === 'blue' ? 'bg-primary-50/50 dark:bg-blue-900/20 border-primary-200/50 dark:border-blue-700/30' : ''}
                          ${handicapDisplay.color === 'green' ? 'bg-success-50/50 dark:bg-green-900/20 border-success-200/50 dark:border-green-700/30' : ''}
                          ${handicapDisplay.color === 'gray' ? 'bg-neutral-50/50 dark:bg-neutral-900/20 border-neutral-200/50 dark:border-gray-700/30' : ''}
                        `}>
                          <span className="font-medium text-neutral-900 dark:text-gray-100">
                            {handicapDisplay.icon} Chấp bàn:
                          </span>
                          <span className={`ml-1 font-semibold
                            ${handicapDisplay.color === 'blue' ? 'text-primary-700 dark:text-blue-300' : ''}
                            ${handicapDisplay.color === 'green' ? 'text-success-700 dark:text-green-300' : ''}
                            ${handicapDisplay.color === 'gray' ? 'text-neutral-700 dark:text-gray-300' : ''}
                          `}>
                            {handicapDisplay.displayText}
                            {liveHandicap && (
                              <span className="ml-2 text-caption opacity-60 font-normal" title="Calculated in real-time">
                                ⚡ Live
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Current User Info */}
            <CurrentUserInfo
              currentUserId={currentUserId}
              challengerId={challenge.challenger_id}
              opponentId={challenge.opponent_id}
              userProfile={currentUserProfile}
            />

            {/* Integrated Score Manager - Show for ongoing, accepted, or completed challenges */}
            {(challenge.status === 'ongoing' || challenge.status === 'accepted' || challenge.status === 'completed' || 
              (challenge.challenger_final_score !== null && challenge.challenger_final_score !== undefined) ||
              (challenge.opponent_final_score !== null && challenge.opponent_final_score !== undefined)) && 
             challenge.challenger_profile && challenge.opponent_profile && (
              <IntegratedScoreManager
                challengerScore={challenge.challenger_final_score ?? challenge.challenger_score ?? (challenge as any).score_challenger ?? (challenge as any).final_score_challenger}
                opponentScore={challenge.opponent_final_score ?? challenge.opponent_score ?? (challenge as any).score_opponent ?? (challenge as any).final_score_opponent}
                challengerName={challenge.challenger_profile.display_name || challenge.challenger_profile.full_name || 'Player 1'}
                opponentName={challenge.opponent_profile.display_name || challenge.opponent_profile.full_name || 'Player 2'}
                currentUserId={currentUserId || ''}
                challengerId={challenge.challenger_id}
                opponentId={challenge.opponent_id || ''}
                challengeStatus={challenge.status as 'ongoing' | 'accepted' | 'completed' | 'pending'}
                challengeId={challenge.id}
                onScoreUpdate={async (challengerScore: number, opponentScore: number) => {
                  console.log('🎯 [DEBUG] Score update callback:', { challengerScore, opponentScore, challengeId: challenge.id });
                  
                  // TODO: Implement actual score update API call
                  const { createClient } = await import('@supabase/supabase-js');
                  const supabase = createClient(
                    import.meta.env.VITE_SUPABASE_URL!,
                    import.meta.env.VITE_SUPABASE_ANON_KEY!
                  );

                  // Update matches table
                  const { error: matchError } = await supabase
                    .from('matches')
                    .update({
                      score_player1: challengerScore,
                      score_player2: opponentScore,
                      status: challengerScore === 5 || opponentScore === 5 ? 'completed' : 'in_progress'
                    })
                    .eq('challenge_id', challenge.id);

                  if (matchError) {
                    console.error('Match update error:', matchError);
                    throw matchError;
                  }

                  // Update challenges table
                  const { error: challengeError } = await supabase
                    .from('challenges')
                    .update({
                      challenger_final_score: challengerScore,
                      opponent_final_score: opponentScore,
                      status: challengerScore === 5 || opponentScore === 5 ? 'completed' : 'ongoing'
                    })
                    .eq('id', challenge.id);

                  if (challengeError) {
                    console.error('Challenge update error:', challengeError);
                    throw challengeError;
                  }
                }}
              />
            )}

            {/* Enhanced Actions */}
            {showQuickActions && (
              <div className="flex gap-2 pt-1">
                {(challenge.status === 'pending' || challenge.status === 'open') && (
                  <>
                    {/* Join button - only show if user is NOT the creator AND has required rank */}
                    {!isCreator && isRankEligible() && (() => {
                      console.log('🎯 [DEBUG] Rendering JOIN button for challenge:', challenge.id, 'isCreator:', isCreator, 'isRankEligible:', isRankEligible());
                      return (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-400 dark:to-green-500 dark:hover:from-emerald-500 dark:hover:to-green-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                          onClick={(e) => {
                            console.log('🎯 [DEBUG] Join button clicked!');
                            e.stopPropagation();
                            handleJoinChallenge();
                          }}
                        >
                          <Zap className="w-4 h-4 mr-1" />
                          Tham gia ngay
                        </Button>
                      );
                    })()}
                    
                    {/* Rank insufficient button - show if user is NOT the creator but doesn't have required rank */}
                    {!isCreator && !isRankEligible() && challenge.required_rank && challenge.required_rank !== 'all' && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="border-amber-500/50 text-amber-600 dark:border-amber-400/50 dark:text-amber-400 cursor-not-allowed opacity-60"
                        title={`Cần hạng ${challenge.required_rank} trở lên để tham gia`}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Cần hạng {challenge.required_rank}+
                      </Button>
                    )}
                    
                    {/* Cancel button - only show if user IS the creator */}
                    {isCreator && (
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 dark:from-red-400 dark:to-red-500 dark:hover:from-red-500 dark:hover:to-red-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelChallenge();
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Hủy thách đấu
                      </Button>
                    )}
                  </>
                )}

                {/* Start Match / Enter Score for accepted challenges */}
                {(challenge.status === 'pending' && challenge.opponent_id) && (
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-400 dark:to-blue-500 dark:hover:from-blue-500 dark:hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartMatch();
                    }}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Bắt đầu trận đấu
                  </Button>
                )}

                {challenge.status === 'accepted' && (
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-400 dark:to-blue-500 dark:hover:from-blue-500 dark:hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartMatch();
                    }}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Bắt đầu trận đấu
                  </Button>
                )}
                {challenge.status === 'ongoing' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/50 text-error-600 hover:bg-error-50 dark:border-red-400/50 dark:text-red-400 dark:hover:bg-red-950/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Fallback to onAction or show message
                      if (onAction) {
                        onAction(challenge.id, 'watch');
                      } else {
                        toast.info('Tính năng xem trực tiếp đang phát triển');
                      }
                    }}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Xem trực tiếp
                  </Button>
                )}
                {challenge.status === 'completed' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground dark:text-muted-foreground/80 dark:hover:text-foreground/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Fallback to onAction or show message
                      if (onAction) {
                        onAction(challenge.id, 'view');
                      } else {
                        toast.info('Tính năng xem chi tiết đang phát triển');
                      }
                    }}
                  >
                    <Trophy className="w-4 h-4 mr-1" />
                    Xem chi tiết
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Club Approval Card - Only show for club admins when score is confirmed */}
      {challenge.status === 'ongoing' && 
       challenge.challenger_profile && 
       challenge.opponent_profile && 
       challenge.challenger_score !== null &&
       challenge.opponent_score !== null &&
       isClubAdmin && (
        <div className="mt-4">
          <ClubApprovalCard
            challenge={{
              id: challenge.id,
              challenger_id: challenge.challenger_id,
              opponent_id: challenge.opponent_id || '',
              challenger_score: challenge.challenger_score,
              opponent_score: challenge.opponent_score,
              status: challenge.status,
              response_message: challenge.message,
              bet_points: challenge.bet_points,
              race_to: challenge.race_to,
              club_id: challenge.club_id,
              created_at: challenge.created_at,
              scheduled_time: challenge.scheduled_time
            }}
            challengerProfile={{
              id: challenge.challenger_profile.id || challenge.challenger_profile.user_id,
              display_name: challenge.challenger_profile.display_name || challenge.challenger_profile.full_name,
              spa_rank: challenge.challenger_profile.verified_rank || challenge.challenger_profile.current_rank,
              spa_points: challenge.challenger_profile.spa_points
            }}
            opponentProfile={{
              id: challenge.opponent_profile.id || challenge.opponent_profile.user_id,
              display_name: challenge.opponent_profile.display_name || challenge.opponent_profile.full_name,
              spa_rank: challenge.opponent_profile.verified_rank || challenge.opponent_profile.current_rank,
              spa_points: challenge.opponent_profile.spa_points
            }}
            isClubAdmin={isClubAdmin}
            onApprovalComplete={() => {
              // console.log('Club approval completed for challenge:', challenge.id);
              // Refresh challenge data if needed
            }}
          />
        </div>
      )}
    </motion.div>
  );
};

// Grid component for multiple cards
interface EnhancedChallengeCardGridProps {
  challenges: (Challenge | ExtendedChallenge)[];
  variant?: FlexibleEnhancedChallengeCardProps['variant'];
  size?: FlexibleEnhancedChallengeCardProps['size'];
  onAction?: FlexibleEnhancedChallengeCardProps['onAction'];
  onCardClick?: FlexibleEnhancedChallengeCardProps['onCardClick'];
  className?: string;
  currentUserId?: string;
  currentUserProfile?: FlexibleEnhancedChallengeCardProps['currentUserProfile'];
}

const EnhancedChallengeCardGrid: React.FC<EnhancedChallengeCardGridProps> = ({
  challenges,
  variant,
  size,
  onAction,
  onCardClick,
  className,
  currentUserId,
  currentUserProfile
}) => {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      {challenges.map((challenge) => (
        <EnhancedChallengeCard
          key={challenge.id}
          challenge={challenge}
          variant={variant}
          size={size}
          onAction={onAction}
          onCardClick={onCardClick}
          currentUserId={currentUserId}
          currentUserProfile={currentUserProfile}
        />
      ))}
    </div>
  );
};

export { EnhancedChallengeCard, EnhancedChallengeCardGrid };
export default EnhancedChallengeCard;
