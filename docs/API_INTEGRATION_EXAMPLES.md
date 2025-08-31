# 🔌 SABO Pool V12 - API Integration Examples
**Practical Examples for Using Shared Business Logic Services**

---

## 🎮 Gaming Features

### Match Completion Flow
```typescript
import { 
  userProfileService, 
  spaSystemService, 
  spaBalanceService,
  milestoneSystemService,
  achievementProgressService,
  notificationService,
  analyticsService
} from '@/packages/shared-business';

/**
 * Complete match with full reward system
 */
async function completeMatchWithRewards(matchData: {
  userId: string;
  opponentId: string;
  won: boolean;
  isPerfect: boolean;
  isFirstWinToday: boolean;
  currentWinStreak: number;
  tournamentId?: string;
  challengeId?: string;
}) {
  const { userId, won, isPerfect, isFirstWinToday, currentWinStreak } = matchData;
  
  try {
    // 1. Calculate SPA points earned
    const spaActivity = {
      player_id: userId,
      activity_type: 'match_completion',
      result: won ? 'win' : 'loss',
      is_tournament: !!matchData.tournamentId,
      is_challenge: !!matchData.challengeId,
      is_perfect_game: isPerfect,
      is_first_win_of_day: isFirstWinToday,
      current_streak: currentWinStreak
    };
    
    const spaTransaction = spaSystemService.calculateMatchPoints(spaActivity);
    
    // 2. Award SPA points
    const balanceResult = await spaBalanceService.addPoints(
      userId,
      spaTransaction.total_points,
      'match_completion',
      `Match ${won ? 'victory' : 'completion'} reward`
    );
    
    // 3. Update user profile stats
    await userProfileService.updateMatchStats(userId, {
      total_matches: 1,
      wins: won ? 1 : 0,
      losses: won ? 0 : 1,
      perfect_games: isPerfect ? 1 : 0,
      current_win_streak: won ? currentWinStreak + 1 : 0
    });
    
    // 4. Update milestone progress
    await milestoneSystemService.updatePlayerProgress(userId, 'match_count', 1);
    if (won) {
      await milestoneSystemService.updatePlayerProgress(userId, 'match_win', 1);
      await milestoneSystemService.updatePlayerProgress(userId, 'win_streak', 1);
    }
    if (isPerfect) {
      await milestoneSystemService.updatePlayerProgress(userId, 'perfect_match', 1);
    }
    
    // 5. Track achievements
    const achievements = await achievementProgressService.handleMatchCompletion(
      userId,
      won,
      isPerfect,
      matchData.tournamentId,
      matchData.challengeId
    );
    
    // 6. Send notification
    let notificationTitle = won ? '🎉 Victory!' : '👍 Good Game!';
    if (isPerfect) notificationTitle = '⭐ Perfect Game!';
    
    await notificationService.sendNotification({
      user_id: userId,
      type: 'match_completed',
      title: notificationTitle,
      message: `You earned ${spaTransaction.total_points} SPA points${won ? ' for your victory!' : '!'}`,
      category: 'gameplay',
      priority: won ? 'high' : 'medium',
      metadata: {
        spa_earned: spaTransaction.total_points,
        match_result: won ? 'win' : 'loss',
        perfect_game: isPerfect,
        achievements_unlocked: achievements.filter(a => a.milestone_completed).length
      }
    });
    
    // 7. Log analytics
    await analyticsService.trackEvent('match_completed', {
      user_id: userId,
      opponent_id: matchData.opponentId,
      result: won ? 'win' : 'loss',
      spa_earned: spaTransaction.total_points,
      perfect_game: isPerfect,
      tournament_id: matchData.tournamentId,
      challenge_id: matchData.challengeId,
      win_streak: currentWinStreak
    });
    
    return {
      success: true,
      spa_earned: spaTransaction.total_points,
      new_balance: balanceResult.balance,
      achievements_unlocked: achievements.filter(a => a.milestone_completed),
      milestone_progress: achievements
    };
    
  } catch (error) {
    console.error('Match completion failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

### Tournament System Integration
```typescript
/**
 * Tournament completion with prizes and rankings
 */
async function completeTournament(tournamentData: {
  tournamentId: string;
  tournamentType: 'DE16' | 'DE8' | 'SE16' | 'SE8';
  participants: Array<{
    userId: string;
    finalPosition: number;
    matchesWon: number;
    matchesLost: number;
  }>;
  eventMultiplier?: { factor: number; type: string };
}) {
  const results = [];
  
  for (const participant of tournamentData.participants) {
    try {
      // 1. Calculate tournament prize
      const prizeTransaction = spaSystemService.calculateTournamentPrize(
        tournamentData.tournamentType,
        participant.finalPosition,
        tournamentData.participants.length,
        tournamentData.eventMultiplier
      );
      
      if (prizeTransaction) {
        // 2. Award prize SPA
        await spaBalanceService.addPoints(
          participant.userId,
          prizeTransaction.total_points,
          'tournament_prize',
          `Tournament #${tournamentData.tournamentId} - Position ${participant.finalPosition}`
        );
        
        // 3. Update tournament milestone
        await milestoneSystemService.updatePlayerProgress(
          participant.userId,
          'tournament_participation',
          1
        );
        
        if (participant.finalPosition === 1) {
          await milestoneSystemService.updatePlayerProgress(
            participant.userId,
            'tournament_win',
            1
          );
        }
        
        // 4. Track tournament achievement
        await achievementProgressService.handleTournamentWin(
          participant.userId,
          tournamentData.tournamentId
        );
        
        // 5. Send prize notification
        const isWinner = participant.finalPosition === 1;
        await notificationService.sendNotification({
          user_id: participant.userId,
          type: 'tournament_completed',
          title: isWinner ? '🏆 Tournament Champion!' : '🎖️ Tournament Complete!',
          message: `You finished in position ${participant.finalPosition} and earned ${prizeTransaction.total_points} SPA!`,
          category: 'tournament',
          priority: isWinner ? 'high' : 'medium',
          metadata: {
            tournament_id: tournamentData.tournamentId,
            final_position: participant.finalPosition,
            spa_earned: prizeTransaction.total_points,
            is_winner: isWinner
          }
        });
        
        results.push({
          userId: participant.userId,
          position: participant.finalPosition,
          spa_earned: prizeTransaction.total_points,
          success: true
        });
      }
      
    } catch (error) {
      console.error(`Tournament completion failed for user ${participant.userId}:`, error);
      results.push({
        userId: participant.userId,
        position: participant.finalPosition,
        spa_earned: 0,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}
```

---

## 🏛️ Club Management Features

### Club Creation and Management
```typescript
/**
 * Complete club creation flow
 */
async function createClubWithSetup(creatorId: string, clubData: {
  name: string;
  description: string;
  type: 'public' | 'private' | 'invite_only';
  max_members: number;
  entry_requirements?: {
    min_rank?: string;
    min_spa_points?: number;
  };
}) {
  try {
    // 1. Create the club
    const club = await clubManagementService.createClub({
      ...clubData,
      owner_id: creatorId
    });
    
    // 2. Set creator as owner
    await clubManagementService.assignRole(club.id, creatorId, 'owner');
    
    // 3. Initialize club statistics
    await analyticsService.initializeClubAnalytics(club.id);
    
    // 4. Create welcome message template
    await notificationService.createNotificationTemplate({
      type: 'club_welcome',
      club_id: club.id,
      title: `Welcome to ${club.name}!`,
      message: `You've successfully joined ${club.name}. Let's play some pool!`,
      category: 'club'
    });
    
    // 5. Update creator's milestone
    await milestoneSystemService.updatePlayerProgress(creatorId, 'club_created', 1);
    
    // 6. Send creation notification
    await notificationService.sendNotification({
      user_id: creatorId,
      type: 'club_created',
      title: '🏛️ Club Created!',
      message: `Your club "${club.name}" has been created successfully!`,
      category: 'club',
      priority: 'high',
      metadata: { club_id: club.id }
    });
    
    return { success: true, club };
    
  } catch (error) {
    console.error('Club creation failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Club member invitation flow
 */
async function inviteToClub(clubId: string, inviterId: string, inviteeId: string) {
  try {
    // 1. Check if inviter has permission
    const hasPermission = await clubManagementService.hasPermission(
      clubId,
      inviterId,
      'invite_members'
    );
    
    if (!hasPermission) {
      throw new Error('You do not have permission to invite members');
    }
    
    // 2. Check club capacity
    const clubDetails = await clubManagementService.getClubDetails(clubId);
    if (clubDetails.member_count >= clubDetails.max_members) {
      throw new Error('Club is at maximum capacity');
    }
    
    // 3. Send invitation notification
    await notificationService.sendNotification({
      user_id: inviteeId,
      type: 'club_invitation',
      title: `Club Invitation: ${clubDetails.name}`,
      message: `You've been invited to join ${clubDetails.name}!`,
      category: 'club',
      priority: 'medium',
      metadata: {
        club_id: clubId,
        inviter_id: inviterId,
        action_required: true,
        action_url: `/clubs/${clubId}/join`
      }
    });
    
    // 4. Log invitation analytics
    await analyticsService.trackEvent('club_invitation_sent', {
      club_id: clubId,
      inviter_id: inviterId,
      invitee_id: inviteeId
    });
    
    return { success: true, message: 'Invitation sent successfully' };
    
  } catch (error) {
    console.error('Club invitation failed:', error);
    return { success: false, error: error.message };
  }
}
```

---

## 📊 Analytics and Reporting

### User Dashboard Analytics
```typescript
/**
 * Generate comprehensive user dashboard data
 */
async function generateUserDashboard(userId: string, timeframe: 'week' | 'month' | 'year') {
  try {
    // 1. Get user analytics
    const userStats = await analyticsService.getUserAnalytics(userId, {
      timeframe: `last_${timeframe}`,
      include_trends: true,
      metrics: ['matches', 'tournaments', 'spa_earned', 'achievements']
    });
    
    // 2. Get SPA balance and recent activity
    const spaBalance = await spaBalanceService.getCurrentBalance(userId);
    const spaHistory = await spaBalanceService.getTransactionHistory(userId, 10);
    
    // 3. Get milestone progress
    const milestoneStats = await milestoneSystemService.calculateMilestoneStats(userId);
    const recentAchievements = await achievementProgressService.getUserBadges(userId);
    
    // 4. Get club activities
    const userProfile = await userProfileService.loadUserProfile(userId);
    const clubActivities = userProfile.club_memberships.length > 0 
      ? await Promise.all(
          userProfile.club_memberships.map(membership =>
            analyticsService.getClubAnalytics(membership.club_id, {
              timeframe: `last_${timeframe}`,
              user_id: userId
            })
          )
        )
      : [];
    
    // 5. Get notification summary
    const notifications = await notificationService.getUserNotifications(userId, {
      limit: 20,
      timeframe: `last_${timeframe}`
    });
    
    const unreadCount = notifications.filter(n => !n.read_at).length;
    
    return {
      user_stats: userStats,
      spa_data: {
        current_balance: spaBalance.current_balance,
        total_earned: spaBalance.total_earned,
        recent_transactions: spaHistory.slice(0, 5)
      },
      milestone_data: {
        completion_rate: milestoneStats.completion_rate,
        recent_achievements: recentAchievements.slice(0, 3),
        total_spa_from_achievements: milestoneStats.total_spa_earned
      },
      club_activities: clubActivities,
      notifications: {
        unread_count: unreadCount,
        recent_notifications: notifications.slice(0, 5)
      },
      timeframe: timeframe
    };
    
  } catch (error) {
    console.error('Dashboard generation failed:', error);
    return null;
  }
}

/**
 * Generate club performance report
 */
async function generateClubReport(clubId: string, timeframe: 'month' | 'quarter' | 'year') {
  try {
    // 1. Get club analytics
    const clubStats = await analyticsService.getClubAnalytics(clubId, {
      timeframe: `last_${timeframe}`,
      include_trends: true,
      breakdown_by: 'week'
    });
    
    // 2. Get member activity
    const clubDetails = await clubManagementService.getClubDetails(clubId);
    const memberActivities = await Promise.all(
      clubDetails.members.map(member =>
        analyticsService.getUserAnalytics(member.user_id, {
          timeframe: `last_${timeframe}`,
          club_context: clubId
        })
      )
    );
    
    // 3. Calculate club rankings
    const memberSpaEarnings = await Promise.all(
      clubDetails.members.map(async member => {
        const balance = await spaBalanceService.getCurrentBalance(member.user_id);
        return {
          user_id: member.user_id,
          display_name: member.display_name,
          spa_earned: balance.recent_earned
        };
      })
    );
    
    const topPerformers = memberSpaEarnings
      .sort((a, b) => b.spa_earned - a.spa_earned)
      .slice(0, 10);
    
    return {
      club_overview: clubStats,
      member_count: clubDetails.member_count,
      activity_summary: {
        total_matches: memberActivities.reduce((sum, activity) => sum + activity.total_matches, 0),
        total_tournaments: memberActivities.reduce((sum, activity) => sum + activity.tournaments_played, 0),
        total_spa_earned: memberSpaEarnings.reduce((sum, member) => sum + member.spa_earned, 0)
      },
      top_performers: topPerformers,
      growth_metrics: clubStats.growth_metrics,
      timeframe: timeframe
    };
    
  } catch (error) {
    console.error('Club report generation failed:', error);
    return null;
  }
}
```

---

## 🔔 Notification System

### Real-time Notification Setup
```typescript
/**
 * Setup real-time notification system for React app
 */
import { useEffect, useState } from 'react';
import { notificationService } from '@/packages/shared-business/src/notification/notification-system';

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    if (!userId) return;
    
    // 1. Load initial notifications
    const loadNotifications = async () => {
      const initialNotifications = await notificationService.getUserNotifications(userId, {
        limit: 50,
        include_read: true
      });
      
      setNotifications(initialNotifications);
      setUnreadCount(initialNotifications.filter(n => !n.read_at).length);
    };
    
    loadNotifications();
    
    // 2. Setup real-time subscription
    const unsubscribe = notificationService.subscribeToNotifications(
      userId,
      (notification) => {
        setNotifications(prev => [notification, ...prev]);
        if (!notification.read_at) {
          setUnreadCount(prev => prev + 1);
        }
      }
    );
    
    return unsubscribe;
  }, [userId]);
  
  const markAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read_at: new Date() } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  const markAllAsRead = async () => {
    await notificationService.markAllAsRead(userId);
    setNotifications(prev => 
      prev.map(n => ({ ...n, read_at: n.read_at || new Date() }))
    );
    setUnreadCount(0);
  };
  
  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
}

/**
 * Bulk notification system for admin
 */
async function sendBulkAnnouncement(announcement: {
  title: string;
  message: string;
  targetAudience: 'all' | 'club_owners' | 'active_players' | 'premium_users';
  priority: 'low' | 'medium' | 'high';
  scheduledFor?: Date;
}) {
  try {
    // 1. Get target user list based on audience
    let targetUsers: string[] = [];
    
    switch (announcement.targetAudience) {
      case 'all':
        targetUsers = await adminService.getAllActiveUserIds();
        break;
      case 'club_owners':
        targetUsers = await clubManagementService.getClubOwnerIds();
        break;
      case 'active_players':
        targetUsers = await analyticsService.getActivePlayerIds('last_7_days');
        break;
      case 'premium_users':
        targetUsers = await userProfileService.getPremiumUserIds();
        break;
    }
    
    // 2. Create notification template
    const template = await notificationService.createNotificationTemplate({
      type: 'system_announcement',
      title: announcement.title,
      message: announcement.message,
      category: 'system',
      priority: announcement.priority
    });
    
    // 3. Schedule or send immediately
    if (announcement.scheduledFor) {
      await notificationService.scheduleNotifications(
        targetUsers.map(userId => ({
          user_id: userId,
          template_id: template.id,
          scheduled_for: announcement.scheduledFor
        }))
      );
    } else {
      await notificationService.sendBulkNotifications(
        targetUsers.map(userId => ({
          user_id: userId,
          type: 'system_announcement',
          title: announcement.title,
          message: announcement.message,
          category: 'system',
          priority: announcement.priority
        }))
      );
    }
    
    // 4. Log analytics
    await analyticsService.trackEvent('bulk_announcement_sent', {
      target_audience: announcement.targetAudience,
      recipient_count: targetUsers.length,
      scheduled: !!announcement.scheduledFor
    });
    
    return {
      success: true,
      recipients: targetUsers.length,
      scheduled: !!announcement.scheduledFor
    };
    
  } catch (error) {
    console.error('Bulk announcement failed:', error);
    return { success: false, error: error.message };
  }
}
```

---

## 🎯 Performance Optimization Examples

### Efficient Data Loading
```typescript
/**
 * Optimized user profile loading with caching
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useOptimizedUserProfile(userId: string) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      // Try to get basic profile from cache first
      const cachedProfile = queryClient.getQueryData(['user-profile-basic', userId]);
      
      if (cachedProfile) {
        // Load full profile in background
        const fullProfile = await userProfileService.loadUserProfile(userId);
        
        // Update cache with full data
        queryClient.setQueryData(['user-profile', userId], fullProfile);
        
        return fullProfile;
      }
      
      // Load full profile if no cache
      return userProfileService.loadUserProfile(userId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!userId
  });
}

/**
 * Batch operations for better performance
 */
async function batchUserOperations(operations: Array<{
  type: 'update_profile' | 'award_spa' | 'update_milestone';
  userId: string;
  data: any;
}>) {
  // Group operations by type for batch processing
  const profileUpdates = operations.filter(op => op.type === 'update_profile');
  const spaAwards = operations.filter(op => op.type === 'award_spa');
  const milestoneUpdates = operations.filter(op => op.type === 'update_milestone');
  
  const results = await Promise.allSettled([
    // Batch profile updates
    userProfileService.batchUpdateProfiles(
      profileUpdates.map(op => ({ userId: op.userId, updates: op.data }))
    ),
    
    // Batch SPA awards
    spaBalanceService.batchAwardPoints(
      spaAwards.map(op => ({ 
        userId: op.userId, 
        amount: op.data.amount, 
        source: op.data.source 
      }))
    ),
    
    // Batch milestone updates
    milestoneSystemService.batchUpdateProgress(
      milestoneUpdates.map(op => ({
        userId: op.userId,
        milestoneType: op.data.milestoneType,
        increment: op.data.increment
      }))
    )
  ]);
  
  return results;
}
```

---

**📋 These examples show real-world integration patterns for SABO Pool's business logic services. Adapt them to your specific use cases and requirements.**

---
*Last updated: August 30, 2025*
