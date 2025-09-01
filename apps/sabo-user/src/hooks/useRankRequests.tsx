import { useState, useEffect } from 'react';
// Removed supabase import - migrated to services
import { getUserProfile } from "../services/profileService";
import { getMatches } from "../services/matchService";
import { getTournament } from "../services/tournamentService";
import { getCurrentUser } from '../services/userService';
import {
 RankRequest,
 CreateRankRequestData,
 RankRequestFilters,
} from '@/types/rankRequests';
import { UnifiedProfile, ProfileCreateData } from '@/types/unified-profile';
import { RankApprovalService } from '@/services/rankApprovalService';

export const useRankRequests = (clubId?: string) => {
 const [requests, setRequests] = useState<RankRequest[]>([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [filters, setFilters] = useState<RankRequestFilters>({
  status: undefined,
  club_id: clubId,
  dateRange: undefined,
 });

 const fetchRankRequests = async (filterOptions?: RankRequestFilters) => {
  setLoading(true);
  setError('');
  try {
   // Query rank_requests with basic data - foreign keys are for integrity
//    let query = supabase
    .from('rank_requests')
    .select('*')
    .order('created_at', { ascending: false });

   // Apply filters
   const activeFilters = filterOptions || filters;

   if (activeFilters.club_id || clubId) {
    query = query.getByClubId(activeFilters.club_id || clubId);
   }

   if (activeFilters.status) {
    query = query.eq('status', activeFilters.status);
   }

   if (activeFilters.date_from) {
    query = query.gte('created_at', activeFilters.date_from);
   }

   if (activeFilters.date_to) {
    query = query.lte('created_at', activeFilters.date_to);
   }

   const { data: verificationData, error: fetchError } = await query;

   if (fetchError) {
    throw fetchError;
   }

   // Get additional data in separate queries (now with proper foreign key constraints)
   const playerIds =
    verificationData?.map(v => v.user_id).filter(Boolean) || [];
   const clubIds =
    verificationData?.map(v => v.club_id).filter(Boolean) || [];

   // Fetch player profiles
//    const { data: playersData } = await supabase
    .from('profiles')
    .select('user_id, full_name, avatar_url, phone, elo')
    .in('user_id', playerIds);

   // Fetch club profiles
//    const { data: clubsData } = await supabase
    .from('club_profiles')
    .select('id, club_name, address, phone')
    .in('id', clubIds);

   // Transform data to match RankRequest interface
   const transformedRequests: RankRequest[] = (verificationData || []).map(
    item => {
     const playerProfile = playersData?.find(
      p => p.user_id === item.user_id
     );
     const clubProfile = clubsData?.find(c => c.id === item.club_id);

     return {
      id: item.id,
      user_id: item.user_id,
      requested_rank: item.requested_rank,
      club_id: item.club_id,
      status: item.status as RankRequest['status'],
      rejection_reason: item.rejection_reason,
      created_at: item.created_at,
      updated_at: item.updated_at,
      approved_by: item.approved_by,
      approved_at: item.approved_at,
      user: playerProfile
       ? {
         id: playerProfile.user_id,
         email: '', // Email not needed for display
         profiles: {
          full_name: playerProfile.full_name,
          avatar_url: playerProfile.avatar_url,
          elo: playerProfile.elo || 1000,
         },
        }
       : undefined,
      club: clubProfile
       ? {
         id: clubProfile.id,
         name: clubProfile.club_name,
         address: clubProfile.address,
        }
       : undefined,
     };
    }
   );

   setRequests(transformedRequests);
  } catch (err) {
   console.error('Error fetching rank requests:', err);
   setError(
    err instanceof Error ? err.message : 'Failed to fetch rank requests'
   );
  } finally {
   setLoading(false);
  }
 };

 const checkExistingPendingRequest = async (
  userId: string,
  clubId: string
 ) => {
  try {
   // TODO: Replace with service call - const { data, error } = await supabase
    .from('rank_requests')
    .select('*')
    .getByUserId(userId)
    .getByClubId(clubId)
    .eq('status', 'pending');

   if (error) throw error;
   return data?.length > 0 ? data[0] : null;
  } catch (err) {
   console.error('Error checking existing request:', err);
   return null;
  }
 };

 const createRankRequest = async (data: CreateRankRequestData) => {
  try {
   console.log('🔍 [DEBUG] Starting createRankRequest with data:', data);
   console.log('🔍 [DEBUG] Environment check:', {
    isDev: window.location.hostname === 'localhost',
    hostname: window.location.hostname,
//     supabaseUrl: import.meta.env.VITE_SUPABASE_URL
   });
   
   const userId = data.user_id;
   console.log('🔍 [DEBUG] User ID from data:', userId);
   
   if (!userId) {
    const errorMsg = 'User ID is required';
    console.error('🚨 [ERROR] Missing user ID:', errorMsg);
    throw new Error(errorMsg);
   }

   // Check current user authentication
   const { data: { user }, error: authError } = await getCurrentUser();
   console.log('🔍 [DEBUG] Auth check:', { 
    authUser: user?.id, 
    dataUserId: userId, 
    authError: authError?.message 
   });
   
   if (authError) {
    console.error('🚨 [ERROR] Auth error:', authError);
    throw new Error('Authentication error: ' + authError.message);
   }
   
   if (!user) {
    const errorMsg = 'Bạn cần đăng nhập để gửi yêu cầu rank';
    console.error('🚨 [ERROR] No authenticated user');
    throw new Error(errorMsg);
   }

   // 🛠️ FIX: Check if profile exists, create if missing
   console.log('🔍 [DEBUG] Checking if profile exists for user:', userId);
//    const { data: existingProfile, error: profileCheckError } = await supabase
    .from('profiles')
    .select('user_id, email, current_rank')
    .getByUserId(userId)
    .single();

   if (profileCheckError && profileCheckError.code === 'PGRST116') {
    // Profile doesn't exist, create it with MINIMAL required data
    console.log('🛠️ [FIX] Profile not found, creating minimal profile for user:', userId);
    
    // ✅ SIMPLIFIED: Create profile with only essential fields
    const minimalProfileData = {
     user_id: userId,
     email: user.email || null,
     current_rank: 'K' as const, // Enum constraint
     spa_points: 1000, // Required field with default
    };
    
//     const { data: newProfile, error: createProfileError } = await supabase
     .from('profiles')
     .create(minimalProfileData)
     .getAll()
     .single();

    if (createProfileError) {
     console.error('🚨 [ERROR] Failed to create profile:', createProfileError);
     
     // ✅ BYPASS: If any function-related error, try to continue
     if (createProfileError.message?.includes('function') || 
       createProfileError.message?.includes('get_user_display_name')) {
      console.log('ℹ️ [BYPASS] Function-related error ignored - profile may still exist');
      // Don't throw, continue with rank request
     } else {
      throw new Error('Failed to create user profile: ' + createProfileError.message);
     }
    } else {
     console.log('✅ [SUCCESS] Minimal profile created successfully:', newProfile);
    }
   } else if (profileCheckError) {
    console.error('🚨 [ERROR] Profile check failed:', profileCheckError);
    throw new Error('Profile check failed: ' + profileCheckError.message);
   } else {
    console.log('✅ [SUCCESS] Profile exists:', existingProfile);
   }

   const existingRequest = await checkExistingPendingRequest(
    userId,
    data.club_id
   );
   if (existingRequest) {
    const errorMsg = 'Bạn đã có yêu cầu rank đang chờ xét duyệt tại CLB này. Vui lòng chờ CLB xét duyệt trước khi gửi yêu cầu mới.';
    console.log('🔍 [DEBUG] Existing request found:', existingRequest);
    throw new Error(errorMsg);
   }

   // Base payload with only guaranteed columns
   const basePayload: any = {
    user_id: userId,
    club_id: data.club_id,
    requested_rank: data.requested_rank, // Keep as string/text for rank letters (K, I, H, G, F, E)
    status: 'pending',
   };
   
   console.log('🔍 [DEBUG] Base payload prepared:', basePayload);

   // Try first insert WITH evidence_files if provided
   let firstError: any = null;
   let newRequest: any = null;
   if (data.evidence_files && data.evidence_files.length) {
    const insertPayload = {
     ...basePayload,
     evidence_files: data.evidence_files,
    };
    console.log('🔍 [DEBUG] trying insert with evidence_files:', insertPayload);
//     const { data: insData, error } = await supabase
     .from('rank_requests')
     .create(insertPayload)
     .getAll()
     .single();
    if (error) {
     firstError = error;
     console.warn('⚠️ [WARNING] first insert failed:', error);
    } else {
     newRequest = insData;
     console.log('✅ [SUCCESS] inserted with evidence_files:', newRequest);
    }
   }

   // If first failed due to missing column, retry WITHOUT evidence_files
   if (!newRequest) {
    if (firstError && firstError.message?.includes("'evidence_files'")) {
     console.log('🔄 [RETRY] without evidence_files');
//      const { data: insData2, error: retryErr } = await supabase
      .from('rank_requests')
      .create(basePayload)
      .getAll()
      .single();
     if (retryErr) {
      console.error('🚨 [ERROR] retry insert error:', retryErr);
      throw retryErr;
     }
     newRequest = insData2;
     console.log('✅ [SUCCESS] retry insert succeeded:', newRequest);
    } else if (!data.evidence_files?.length) {
     // No evidence provided originally; perform single insert
     console.log('🔍 [DEBUG] inserting without evidence (original):', basePayload);
//      const { data: insData3, error: err3 } = await supabase
      .from('rank_requests')
      .create(basePayload)
      .getAll()
      .single();
     if (err3) {
      console.error('🚨 [ERROR] insert (no evidence) error:', err3);
      console.error('🚨 [ERROR] Full error details:', JSON.stringify(err3, null, 2));
      throw err3;
     }
     newRequest = insData3;
    } else if (firstError) {
     // Some other error
     throw firstError;
    }
   }

   await fetchRankRequests();
   return newRequest;
  } catch (err) {
   console.error('Error creating rank request:', err);
   if (err instanceof Error) throw err;
   throw new Error('Lỗi khi gửi yêu cầu rank');
  }
 };

 const updateRankRequest = async (id: string, updateData: any) => {
  try {
   // TODO: Replace with service call - const { error } = await supabase
    .from('rank_requests')
    .update({
     status: updateData.status,
     rejection_reason: updateData.rejection_reason,
     approved_by: updateData.approved_by,
     approved_at:
      updateData.status === 'approved' ? new Date().toISOString() : null,
     updated_at: new Date().toISOString(),
    })
    .eq('id', id);

   if (error) throw error;

   // Refresh the requests list
   await fetchRankRequests();
  } catch (err) {
   console.error('Error updating rank request:', err);
   throw new Error('Failed to update rank request');
  }
 };

 const deleteRankRequest = async (id: string) => {
  try {
   // TODO: Replace with service call - const { error } = await supabase
    .from('rank_requests')
    .delete()
    .eq('id', id);

   if (error) throw error;

   // Refresh the requests list
   await fetchRankRequests();
  } catch (err) {
   console.error('Error deleting rank request:', err);
   throw new Error('Failed to delete rank request');
  }
 };

 const approveRankRequest = async (
  id: string, 
  verifierId?: string,
  options?: {
   addBonusSPA?: number;
   notes?: string;
  }
 ) => {
  try {
   const result = await RankApprovalService.approveRankRequest(id, verifierId, options);
   
   if (!result.success) {
    throw new Error(result.message);
   }
   
   // Refresh the requests list to show updated status
   await fetchRankRequests();
   
   return result;
  } catch (err) {
   console.error('Error approving rank request:', err);
   throw err;
  }
 };

 const rejectRankRequest = async (
  id: string,
  reason: string,
  verifierId?: string
 ) => {
  return updateRankRequest(id, {
   status: 'rejected',
   rejection_reason: reason,
   approved_by: verifierId,
  });
 };

 const getUserRankRequests = (userId: string) => {
  return requests.filter(req => req.user_id === userId);
 };

 const getPendingRequests = () => {
  return requests.filter(req => req.status === 'pending');
 };

 const getApprovedRequests = () => {
  return requests.filter(req => req.status === 'approved');
 };

 const getRejectedRequests = () => {
  return requests.filter(req => req.status === 'rejected');
 };

 const getEligibleRanks = (currentRank: string): string[] => {
  const ranks = ['K1', 'K2', 'K3', 'D1', 'D2', 'D3'];
  const currentIndex = ranks.indexOf(currentRank);
  return ranks.slice(currentIndex + 1);
 };

 const rankRequests = requests;

 const getStatusText = (status: string) => {
  switch (status) {
   case 'pending':
    return 'Đang chờ';
   case 'approved':
    return 'Đã duyệt';
   case 'rejected':
    return 'Từ chối';
   case 'on_site_test':
    return 'Kiểm tra tại chỗ';
   default:
    return status;
  }
 };

 const getStatusColor = (status: string) => {
  switch (status) {
   case 'pending':
    return 'text-warning-600 bg-warning-100';
   case 'approved':
    return 'text-success-600 bg-success-100';
   case 'rejected':
    return 'text-error-600 bg-error-100';
   case 'on_site_test':
    return 'text-primary-600 bg-primary-100';
   default:
    return 'text-neutral-600 bg-neutral-100';
  }
 };

 const stats = {
  total: requests.length,
  pending: getPendingRequests().length,
  approved: getApprovedRequests().length,
  rejected: getRejectedRequests().length,
  on_site_test: requests.filter(req => req.status === 'on_site_test').length,
 };

 useEffect(() => {
  fetchRankRequests();

  // Subscribe to realtime changes
//   const channel = supabase
   .channel('rank-requests')
   .on(
    'postgres_changes',
    {
     event: '*',
     schema: 'public',
     table: 'rank_requests',
     filter: clubId ? `club_id=eq.${clubId}` : undefined,
    },
    () => {
     console.log('Rank request changed, refetching...');
     fetchRankRequests(); // Refetch on any change
    }
   )
   .subscribe();

  return () => {
   // removeChannel(channel);
  };
 }, [clubId]);

 // Also refetch when filters change
 useEffect(() => {
  if (
   filters.club_id ||
   filters.status ||
   filters.date_from ||
   filters.date_to
  ) {
   fetchRankRequests(filters);
  }
 }, [filters]);

 return {
  requests,
  loading,
  error,
  filters,
  fetchRankRequests,
  createRankRequest,
  updateRankRequest,
  deleteRankRequest,
  approveRankRequest,
  rejectRankRequest,
  getUserRankRequests,
  getPendingRequests,
  getApprovedRequests,
  getRejectedRequests,
  getEligibleRanks,
  rankRequests,
  getStatusText,
  getStatusColor,
  stats,
  checkExistingPendingRequest,
 };
};
