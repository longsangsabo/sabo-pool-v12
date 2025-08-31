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

export const uploadFile = async (bucket: string, path: string, file: File) => {
  try {
// // //     // TODO: Replace with service call - const { data, error } = // TODO: Replace with service call - await // TODO: Replace with service call - supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getPublicUrl = async (bucket: string, path: string) => {
  try {
// // //     const { data } = // TODO: Replace with service call - supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return { data: data.publicUrl, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const deleteFile = async (bucket: string, path: string) => {
  try {
// // //     // TODO: Replace with service call - const { error } = // TODO: Replace with service call - await // TODO: Replace with service call - supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};
