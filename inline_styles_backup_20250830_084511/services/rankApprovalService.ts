import { supabase } from '@/integrations/supabase/client';

/**
 * Enhanced Rank Approval Service
 * Handles complete rank approval flow with cross-table synchronization
 */

export interface RankApprovalResult {
  success: boolean;
  message: string;
  data?: {
    requestId: string;
    userId: string;
    newRank: string;
    oldRank?: string;
  };
  error?: string;
}

export class RankApprovalService {
  
  /**
   * Comprehensive rank approval with full synchronization
   */
  static async approveRankRequest(
    requestId: string, 
    verifierId?: string,
    options?: {
      addBonusSPA?: number;
      notes?: string;
    }
  ): Promise<RankApprovalResult> {
    
    const startTime = Date.now();
    console.log(`🎯 [RankApproval] Starting approval for request: ${requestId}`);
    
    try {
      // 1. Get rank request details
      const { data: rankRequest, error: requestError } = await supabase
        .from('rank_requests')
        .select('*')
        .eq('id', requestId)
        .single();
        
      if (requestError || !rankRequest) {
        return {
          success: false,
          message: 'Rank request not found',
          error: requestError?.message || 'Request not found'
        };
      }
      
      if (rankRequest.status !== 'pending') {
        return {
          success: false,
          message: `Request already ${rankRequest.status}`,
          error: `Status is ${rankRequest.status}`
        };
      }
      
      const { user_id, requested_rank } = rankRequest;
      console.log(`📋 [RankApproval] User: ${user_id}, New Rank: ${requested_rank}`);
      
      // 2. Get current rank from player_rankings
      const { data: currentRanking, error: rankingError } = await supabase
        .from('player_rankings')
        .select('current_rank, verified_rank, elo_points, spa_points')
        .eq('user_id', user_id)
        .single();
        
      const oldRank = currentRanking?.verified_rank || currentRanking?.current_rank || 'K';
      console.log(`📊 [RankApproval] Current rank: ${oldRank} → New rank: ${requested_rank}`);
      
      // 3. Start transaction-like updates
      const approvalTimestamp = new Date().toISOString();
      
      // 3a. Update rank_requests table
      const { error: updateRequestError } = await supabase
        .from('rank_requests')
        .update({
          status: 'approved',
          approved_by: verifierId,
          approved_at: approvalTimestamp,
          verification_notes: options?.notes,
          updated_at: approvalTimestamp
        })
        .eq('id', requestId);
        
      if (updateRequestError) {
        throw new Error(`Failed to update request: ${updateRequestError.message}`);
      }
      
      // 3b. Update player_rankings table
      const rankingUpdateData: any = {
        verified_rank: requested_rank,
        current_rank: requested_rank,
        last_promotion_date: approvalTimestamp,
        promotion_eligible: false,
        updated_at: approvalTimestamp
      };
      
      // Add bonus SPA if specified
      if (options?.addBonusSPA && options.addBonusSPA > 0) {
        rankingUpdateData.spa_points = (currentRanking?.spa_points || 0) + options.addBonusSPA;
      }
      
      const { error: updateRankingError } = await supabase
        .from('player_rankings')
        .update(rankingUpdateData)
        .eq('user_id', user_id);
        
      if (updateRankingError) {
        // Rollback rank_requests if this fails
        await supabase
          .from('rank_requests')
          .update({
            status: 'pending',
            approved_by: null,
            approved_at: null,
            updated_at: approvalTimestamp
          })
          .eq('id', requestId);
          
        throw new Error(`Failed to update player ranking: ${updateRankingError.message}`);
      }
      
      // 3c. Update profiles table
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          verified_rank: requested_rank,
          current_rank: requested_rank,
          updated_at: approvalTimestamp
        })
        .eq('user_id', user_id);
        
      if (updateProfileError) {
        console.warn(`⚠️ [RankApproval] Failed to update profile: ${updateProfileError.message}`);
        // Don't rollback for profile errors - it's not critical
      }
      
      // 4. Create notification/audit log
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: user_id,
            title: `Rank Approved: ${requested_rank}`,
            message: `Your rank request for ${requested_rank} has been approved! ${options?.addBonusSPA ? `Bonus: +${options.addBonusSPA} SPA points` : ''}`,
            type: 'rank_approved',
            status: 'unread',
            data: {
              requestId,
              oldRank,
              newRank: requested_rank,
              bonusSPA: options?.addBonusSPA || 0,
              approvedBy: verifierId
            }
          });
      } catch (notificationError) {
        console.warn(`⚠️ [RankApproval] Failed to create notification:`, notificationError);
        // Don't fail the whole process for notification errors
      }
      
      // 5. Trigger real-time updates
      try {
        // Broadcast to leaderboard updates
        await supabase.realtime.channel('leaderboard_updates').send({
          type: 'broadcast',
          event: 'rank_updated',
          payload: {
            userId: user_id,
            oldRank,
            newRank: requested_rank,
            timestamp: approvalTimestamp
          }
        });
      } catch (realtimeError) {
        console.warn(`⚠️ [RankApproval] Failed to broadcast update:`, realtimeError);
      }
      
      const duration = Date.now() - startTime;
      console.log(`✅ [RankApproval] Completed in ${duration}ms`);
      
      return {
        success: true,
        message: `Rank ${requested_rank} approved successfully`,
        data: {
          requestId,
          userId: user_id,
          newRank: requested_rank,
          oldRank
        }
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ [RankApproval] Failed after ${duration}ms:`, error);
      
      return {
        success: false,
        message: 'Failed to approve rank request',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Batch approve multiple rank requests
   */
  static async batchApproveRankRequests(
    requestIds: string[],
    verifierId?: string,
    options?: {
      addBonusSPA?: number;
      notes?: string;
    }
  ): Promise<RankApprovalResult[]> {
    console.log(`🔄 [RankApproval] Batch approving ${requestIds.length} requests`);
    
    const results: RankApprovalResult[] = [];
    
    for (const requestId of requestIds) {
      const result = await this.approveRankRequest(requestId, verifierId, options);
      results.push(result);
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`📊 [RankApproval] Batch complete: ${successCount}/${requestIds.length} successful`);
    
    return results;
  }
  
  /**
   * Get rank approval analytics
   */
  static async getRankApprovalStats(timeframe: 'day' | 'week' | 'month' = 'week') {
    const timeAgo = new Date();
    switch (timeframe) {
      case 'day':
        timeAgo.setDate(timeAgo.getDate() - 1);
        break;
      case 'week':
        timeAgo.setDate(timeAgo.getDate() - 7);
        break;
      case 'month':
        timeAgo.setMonth(timeAgo.getMonth() - 1);
        break;
    }
    
    const { data: stats, error } = await supabase
      .from('rank_requests')
      .select('status, requested_rank, approved_at')
      .gte('created_at', timeAgo.toISOString());
      
    if (error) {
      console.error('Error fetching rank approval stats:', error);
      return null;
    }
    
    return {
      total: stats.length,
      pending: stats.filter(s => s.status === 'pending').length,
      approved: stats.filter(s => s.status === 'approved').length,
      rejected: stats.filter(s => s.status === 'rejected').length,
      byRank: stats.reduce((acc, s) => {
        acc[s.requested_rank] = (acc[s.requested_rank] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}
