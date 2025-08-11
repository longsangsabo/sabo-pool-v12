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

  // Generic delta apply using existing RPC if still present else manual fallback
  private async applyDelta(
    userId: string,
    pointsChange: number,
    transactionType: string,
    description?: string,
    referenceId?: string
  ): Promise<number> {
    // Try RPC first
    const { data, error } = await supabase.rpc('update_spa_points', {
      p_user_id: userId,
      p_points_change: pointsChange,
      p_transaction_type: transactionType,
      p_description: description || null,
      p_reference_id: referenceId || null,
    });
    if (!error) return data || 0;

    // Fallback: direct update (assuming player_rankings.spa_points exists)
    const current = await this.getCurrentSPAPoints(userId);
    const newBalance = current + pointsChange;
    await supabase
      .from('player_rankings')
      .update({ spa_points: newBalance })
      .eq('user_id', userId);
    return newBalance;
  }

  async addSPAPoints(
    userId: string,
    points: number,
    reason = 'manual_adjust',
    description?: string,
    referenceId?: string
  ): Promise<number> {
    if (points <= 0) return this.getCurrentSPAPoints(userId);
    return this.applyDelta(userId, points, reason, description, referenceId);
  }

  async deductSPAPoints(
    userId: string,
    points: number,
    reason = 'manual_deduct',
    description?: string,
    referenceId?: string
  ): Promise<number> {
    if (points <= 0) return this.getCurrentSPAPoints(userId);
    return this.applyDelta(userId, -Math.abs(points), reason, description, referenceId);
  }
}

export const spaService = new SPAService();
