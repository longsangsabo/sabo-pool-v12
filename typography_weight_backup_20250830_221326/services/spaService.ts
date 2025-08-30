import { supabase } from '@/integrations/supabase/client';

// Minimal SPA points service after milestone purge
class SPAService {
  // Read current SPA balance (alias kept for backward compatibility)
  async getCurrentSPAPoints(userId: string): Promise<number> {
    const { data } = await supabase
      .from('player_rankings')
      .select('spa_points')
      .eq('user_id', userId)
      .single();
    return data?.spa_points || 0;
  }

  async getSPABalance(userId: string): Promise<number> {
    return this.getCurrentSPAPoints(userId);
  }

  // Generic delta apply with ranking check
  private async applyDelta(
    userId: string,
    pointsChange: number,
    transactionType: string,
    description?: string,
    referenceId?: string
  ): Promise<{ success: boolean; balance: number; requiresRanking: boolean }> {
    // Check if user has ranking record first
    const { data: rankingRecord } = await supabase
      .from('player_rankings')
      .select('spa_points')
      .eq('user_id', userId)
      .single();

    if (!rankingRecord) {
      // User doesn't have ranking record - they need to register ranking first
      return { success: false, balance: 0, requiresRanking: true };
    }

    // Direct update since user has ranking record
    const current = rankingRecord.spa_points || 0;
    const newBalance = current + pointsChange;
    
    const { error } = await supabase
      .from('player_rankings')
      .update({ spa_points: newBalance })
      .eq('user_id', userId);
      
    if (error) {
      console.error('SPA update error:', error);
      return { success: false, balance: current, requiresRanking: false };
    }

    // Create transaction record
    await supabase.from('spa_transactions').insert({
      user_id: userId,
      amount: pointsChange,
      source_type: transactionType,
      transaction_type: pointsChange > 0 ? 'credit' : 'debit',
      description: description || `${transactionType} transaction`,
      status: 'completed',
      reference_id: referenceId
    });

    return { success: true, balance: newBalance, requiresRanking: false };
  }

  async addSPAPoints(
    userId: string,
    points: number,
    reason = 'manual_adjust',
    description?: string,
    referenceId?: string
  ): Promise<{ success: boolean; balance: number; requiresRanking: boolean }> {
    if (points <= 0) return { success: true, balance: await this.getCurrentSPAPoints(userId), requiresRanking: false };
    return this.applyDelta(userId, points, reason, description, referenceId);
  }

  async deductSPAPoints(
    userId: string,
    points: number,
    reason = 'manual_deduct',
    description?: string,
    referenceId?: string
  ): Promise<{ success: boolean; balance: number; requiresRanking: boolean }> {
    if (points <= 0) return { success: true, balance: await this.getCurrentSPAPoints(userId), requiresRanking: false };
    return this.applyDelta(userId, -Math.abs(points), reason, description, referenceId);
  }
}

export const spaService = new SPAService();
