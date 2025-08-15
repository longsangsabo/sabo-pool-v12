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
import { formatVietnamTime } from '@/utils/timezone';
import { getRankOrder, extractRankFromProfile } from '@/lib/rankUtils';
import { formatHandicapForDisplay, calculateSaboHandicapPrecise } from '@/utils/saboHandicapCalculator';
import { SaboRank } from '@/utils/saboHandicap';
import ScoreSubmissionCard from './ScoreSubmissionCard';
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
  // Convert to ExtendedChallenge for enhanced features
  const challenge = toExtendedChallenge(originalChallenge);
  
  // Check if current user is the challenger (creator)
  const isCreator = currentUserId && challenge.challenger_id === currentUserId;
  
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
    
    console.log('🔍 [EnhancedChallengeCard] Rank eligibility check:', {
      challengeId: challenge.id,
      required_rank: challenge.required_rank,
      requiredRankOrder,
      currentUserRank,
      currentRankOrder,
      isEligible: currentRankOrder >= requiredRankOrder
    });
    
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

        console.log('🎯 Live Handicap Calculation:', {
          challengeId: challenge.id,
          challengerRank,
          opponentRank,
          betAmount,
          result
        });

        return result;
      } else {
        console.warn('Missing rank data for handicap calculation:', {
          challengeId: challenge.id,
          challengerRank,
          opponentRank
        });
      }
    } catch (error) {
      console.warn('Error calculating live handicap:', error);
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
      return { expired: true, text: 'Đã hết hạn', color: 'text-red-600 dark:text-red-400' };
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 1) {
      return { 
        expired: false, 
        text: `${minutes}p`, 
        color: 'text-orange-600 dark:text-orange-400' 
      };
    } else if (hours < 24) {
      return { 
        expired: false, 
        text: `${hours}h ${minutes}p`, 
        color: 'text-yellow-600 dark:text-yellow-400' 
      };
    } else {
      const days = Math.floor(hours / 24);
      return { 
        expired: false, 
        text: `${days} ngày`, 
        color: 'text-green-600 dark:text-green-400' 
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'live':
      case 'ongoing': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'live': 
        return 'border-red-200/30 dark:border-red-800/30 bg-red-50/20 dark:bg-red-950/10 shadow-lg shadow-red-500/5 dark:shadow-red-500/15 backdrop-blur-md';
      case 'completed': 
        return 'border-green-200/30 dark:border-green-800/30 bg-green-50/20 dark:bg-green-950/10 shadow-lg shadow-green-500/5 dark:shadow-green-500/15 backdrop-blur-md';
      case 'upcoming': 
        return 'border-blue-200/30 dark:border-blue-800/30 bg-blue-50/20 dark:bg-blue-950/10 shadow-lg shadow-blue-500/5 dark:shadow-blue-500/15 backdrop-blur-md';
      case 'open': 
        return 'border-yellow-200/30 dark:border-yellow-800/30 bg-yellow-50/20 dark:bg-yellow-950/10 shadow-lg shadow-yellow-500/5 dark:shadow-yellow-500/15 backdrop-blur-md';
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
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50/50 dark:bg-blue-900/30 px-2 py-1 rounded">
                  {formatDateTime(challenge.scheduled_time)}
                </div>
              )}
              {(() => {
                const expiryInfo = getExpiryInfo();
                if (expiryInfo) {
                  return (
                    <div className={`text-xs font-medium px-2 py-1 rounded ${expiryInfo.color} ${
                      expiryInfo.expired 
                        ? 'bg-red-50/50 dark:bg-red-900/30' 
                        : 'bg-gray-50/50 dark:bg-gray-900/30'
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
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1 line-clamp-2">
                  {challenge.title || challenge.message || 'Thách đấu'}
                </h3>
                {challenge.description && size !== 'compact' && (
                  <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2">
                    {challenge.description}
                  </p>
                )}
              </div>
              {challenge.bet_amount && (
                <div className="text-xs text-yellow-600 dark:text-yellow-400 font-bold bg-yellow-100/50 dark:bg-yellow-900/30 px-2 py-1 rounded">
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
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                  {challenge.challenger_profile?.full_name || challenge.challenger_profile?.username || 'Player 1'}
                </div>
                {/* Player Info */}
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
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
                <div className="text-gray-600 dark:text-gray-300 text-lg font-bold">
                  vs
                </div>
                {/* Enhanced Handicap Display */}
                {(challenge.handicap_data || liveHandicap) && (
                  <div className="text-xs mt-1">
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
                          ${handicapDisplay.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300' : ''}
                          ${handicapDisplay.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300' : ''}
                          ${handicapDisplay.color === 'gray' ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300' : ''}
                        `}>
                          {handicapDisplay.icon} {handicapDisplay.shortText}
                          {liveHandicap && (
                            <span className="ml-1 text-xs opacity-60" title="Live calculated">⚡</span>
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
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                  {challenge.opponent_profile?.full_name || challenge.opponent_profile?.username || 'Waiting...'}
                </div>
                {/* Player Info */}
                {challenge.opponent_profile && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
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
                  <div className="flex items-start gap-2 p-3 bg-green-50/50 dark:bg-green-900/20 rounded-lg border border-green-200/50 dark:border-green-700/30">
                    <MapPin className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-gray-600 dark:text-gray-400 text-xs font-medium block">CLB thi đấu</span>
                      <span className="text-gray-800 dark:text-gray-100 font-semibold text-sm leading-relaxed">
                        {challenge.location}
                      </span>
                    </div>
                  </div>
                )}

                {/* Required Rank */}
                {challenge.required_rank && challenge.required_rank !== 'all' && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/30">
                    <Star className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-gray-600 dark:text-gray-400 text-xs font-medium block">Yêu cầu hạng</span>
                      <span className="text-gray-800 dark:text-gray-100 font-semibold text-sm">
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
            <div className="grid grid-cols-2 gap-3 text-sm">
              {challenge.race_to && (
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span className="text-gray-800 dark:text-gray-100 font-medium">Race to {challenge.race_to}</span>
                </div>
              )}

              {/* Enhanced Handicap Summary */}
              {(challenge.handicap_data || liveHandicap) && (
                <div className="flex items-start gap-2 col-span-2">
                  <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
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
                          ${handicapDisplay.color === 'blue' ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-700/30' : ''}
                          ${handicapDisplay.color === 'green' ? 'bg-green-50/50 dark:bg-green-900/20 border-green-200/50 dark:border-green-700/30' : ''}
                          ${handicapDisplay.color === 'gray' ? 'bg-gray-50/50 dark:bg-gray-900/20 border-gray-200/50 dark:border-gray-700/30' : ''}
                        `}>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {handicapDisplay.icon} Chấp bàn:
                          </span>
                          <span className={`ml-1 font-semibold
                            ${handicapDisplay.color === 'blue' ? 'text-blue-700 dark:text-blue-300' : ''}
                            ${handicapDisplay.color === 'green' ? 'text-green-700 dark:text-green-300' : ''}
                            ${handicapDisplay.color === 'gray' ? 'text-gray-700 dark:text-gray-300' : ''}
                          `}>
                            {handicapDisplay.displayText}
                            {liveHandicap && (
                              <span className="ml-2 text-xs opacity-60 font-normal" title="Calculated in real-time">
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

            {/* Enhanced Score Section - Show for all challenges with scores */}
            {(() => {
              // Get scores from multiple possible fields
              const challengerScore = challenge.challenger_final_score ?? 
                                     challenge.challenger_score ?? 
                                     (challenge as any).score_challenger ?? 
                                     (challenge as any).final_score_challenger;
              
              const opponentScore = challenge.opponent_final_score ?? 
                                   challenge.opponent_score ?? 
                                   (challenge as any).score_opponent ?? 
                                   (challenge as any).final_score_opponent;

              if (challengerScore !== null && challengerScore !== undefined && 
                  opponentScore !== null && opponentScore !== undefined) {
                return (
                  <div className={`flex items-center justify-center gap-4 p-3 rounded-lg border-2 ${
                    challenge.status === 'completed' 
                      ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200' 
                      : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200'
                  } backdrop-blur-sm`}>
                    <div className="text-center flex-1">
                      <div className="font-bold text-2xl">
                        {challengerScore}
                      </div>
                      <div className="text-xs opacity-75 font-medium truncate">
                        {challenge.challenger_profile?.full_name || 'Player 1'}
                      </div>
                    </div>
                    <div className="text-2xl font-bold opacity-60">-</div>
                    <div className="text-center flex-1">
                      <div className="font-bold text-2xl">
                        {opponentScore}
                      </div>
                      <div className="text-xs opacity-75 font-medium truncate">
                        {challenge.opponent_profile?.full_name || 'Player 2'}
                      </div>
                    </div>
                    {challenge.status === 'completed' && (
                      <div className="absolute top-1 right-2 text-xs opacity-60">
                        ✅ Hoàn thành
                      </div>
                    )}
                    {challenge.status === 'ongoing' && (
                      <div className="absolute top-1 right-2 text-xs opacity-60">
                        🔴 Đang diễn ra
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })()}

            {/* Enhanced Actions */}
            {showQuickActions && (
              <div className="flex gap-2 pt-1">
                {(challenge.status === 'pending' || challenge.status === 'open') && (
                  <>
                    {/* Join button - only show if user is NOT the creator AND has required rank */}
                    {!isCreator && isRankEligible() && (
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-400 dark:to-green-500 dark:hover:from-emerald-500 dark:hover:to-green-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction?.(challenge.id, 'join');
                        }}
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        Tham gia ngay
                      </Button>
                    )}
                    
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
                          onAction?.(challenge.id, 'cancel');
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Hủy thách đấu
                      </Button>
                    )}
                  </>
                )}
                {challenge.status === 'ongoing' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/50 text-red-600 hover:bg-red-50 dark:border-red-400/50 dark:text-red-400 dark:hover:bg-red-950/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.(challenge.id, 'watch');
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
                      onAction?.(challenge.id, 'view');
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

      {/* Score Submission Card - Only show for active/ongoing challenges */}
      {(challenge.status === 'accepted' || challenge.status === 'ongoing') && 
       challenge.challenger_profile && 
       challenge.opponent_profile && (
        <div className="mt-4">
          <ScoreSubmissionCard
            challenge={{
              id: challenge.id,
              challenger_id: challenge.challenger_id,
              opponent_id: challenge.opponent_id || '',
              challenger_score: challenge.challenger_score,
              opponent_score: challenge.opponent_score,
              status: challenge.status,
              response_message: challenge.message, // Using message field
              bet_points: challenge.bet_points,
              race_to: challenge.race_to,
              handicap_data: challenge.handicap_data
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
            onScoreSubmitted={() => {
              // Refresh challenge data if needed
              console.log('Score submitted for challenge:', challenge.id);
            }}
          />
        </div>
      )}

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
              console.log('Club approval completed for challenge:', challenge.id);
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
