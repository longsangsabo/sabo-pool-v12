/**
 * Manual Cleanup Utility for Expired Challenges
 * This can be called from admin panel or debug tools
 */

import { supabase } from '@/integrations/supabase/client';

export interface CleanupResult {
  success: boolean;
  expiredCount: number;
  removedCount?: number;
  error?: string;
  timestamp: string;
}

/**
 * Manually trigger cleanup of expired challenges
 */
export const manualCleanupExpiredChallenges = async (): Promise<CleanupResult> => {
  try {
    console.log('🧹 Starting manual cleanup of expired challenges...');
    
    const { data: result, error } = await supabase.rpc('enhanced_cleanup_expired_challenges');
    
    if (error) {
      console.error('❌ Cleanup error:', error);
      return {
        success: false,
        expiredCount: 0,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
    
    console.log(`✅ Manual cleanup completed: ${result} challenges expired`);
    
    return {
      success: true,
      expiredCount: result || 0,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Manual cleanup failed:', error);
    return {
      success: false,
      expiredCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Manually trigger deep cleanup (remove old expired challenges)
 */
export const manualDeepCleanup = async (): Promise<CleanupResult> => {
  try {
    console.log('🗑️ Starting manual deep cleanup...');
    
    const { data: result, error } = await supabase.rpc('deep_cleanup_challenges');
    
    if (error) {
      console.error('❌ Deep cleanup error:', error);
      return {
        success: false,
        expiredCount: 0,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
    
    console.log(`✅ Deep cleanup completed: ${result} old challenges removed`);
    
    return {
      success: true,
      expiredCount: 0,
      removedCount: result || 0,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Deep cleanup failed:', error);
    return {
      success: false,
      expiredCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Check for expired challenges without cleaning them up
 */
export const checkExpiredChallenges = async () => {
  try {
    const { data: expiredChallenges, error } = await supabase
      .from('challenges')
      .select('id, status, expires_at, created_at, challenger_id, opponent_id')
      .in('status', ['pending', 'open'])
      .or('expires_at.lt.now(),and(expires_at.is.null,created_at.lt.now().sub.interval.48 hours)');
    
    if (error) {
      console.error('Error checking expired challenges:', error);
      return [];
    }
    
    console.log(`🔍 Found ${expiredChallenges?.length || 0} expired challenges:`, expiredChallenges);
    return expiredChallenges || [];
    
  } catch (error) {
    console.error('Error in checkExpiredChallenges:', error);
    return [];
  }
};

/**
 * Get cleanup statistics
 */
export const getCleanupStats = async () => {
  try {
    // Get total challenges by status
    const { data: statusCounts, error: statusError } = await supabase
      .from('challenges')
      .select('status')
      .then(result => {
        if (result.error) throw result.error;
        
        const counts = result.data?.reduce((acc, challenge) => {
          acc[challenge.status] = (acc[challenge.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};
        
        return { data: counts, error: null };
      });
    
    if (statusError) throw statusError;
    
    // Get recent cleanup logs
    const { data: recentLogs, error: logsError } = await supabase
      .from('system_logs')
      .select('*')
      .in('log_type', ['challenge_cleanup', 'deep_challenge_cleanup'])
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (logsError) throw logsError;
    
    return {
      statusCounts: statusCounts || {},
      recentCleanups: recentLogs || [],
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error getting cleanup stats:', error);
    return {
      statusCounts: {},
      recentCleanups: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
};
