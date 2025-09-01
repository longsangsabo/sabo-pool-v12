import { userService } from '../services/userService';
import { profileService } from '../services/profileService';
import { tournamentService } from '../services/tournamentService';
import { clubService } from '../services/clubService';
import { rankingService } from '../services/rankingService';
import { statisticsService } from '../services/statisticsService';
import { dashboardService } from '../services/dashboardService';
import { notificationService } from '../services/notificationService';
import { challengeService } from '../services/challengeService';
import { verificationService } from '../services/verificationService';
import { matchService } from '../services/matchService';
import { walletService } from '../services/walletService';
import { storageService } from '../services/storageService';
import { settingsService } from '../services/settingsService';
import { milestoneService } from '../services/milestoneService';
// Removed supabase import - migrated to services

export const getWalletBalance = async (userId: string) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .getByUserId(userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const updateWalletBalance = async (userId: string, amount: number, type: string) => {
  try {
    const { data, error } = await tournamentService.callRPC('update_wallet_balance', {
      p_user_id: userId,
      p_amount: amount,
      p_transaction_type: type
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getWalletTransactions = async (userId: string, limit: number = 50) => {
  try {
    // TODO: Replace with service call - const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .getByUserId(userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};
