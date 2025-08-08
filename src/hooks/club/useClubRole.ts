import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClubRoleData {
  club_id: string;
  user_id: string;
  role: string; // owner | moderator | member | pending
  status: string; // active | pending | removed
}

export const fetchClubRole = async (
  clubId: string,
  userId: string
): Promise<ClubRoleData | null> => {
  const { data, error } = await supabase
    .from('club_members')
    .select('club_id, user_id, role, status')
    .eq('club_id', clubId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as ClubRoleData) || null;
};

export const useClubRole = (
  clubId?: string,
  userId?: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['club-role', clubId, userId],
    queryFn: async () => {
      if (!clubId || !userId) return null;
      return fetchClubRole(clubId, userId);
    },
    enabled: enabled && !!clubId && !!userId,
    staleTime: 60 * 1000,
  });
};

// Hook to check if user is owner of ANY club (for layout purposes)
export const useIsClubOwner = (userId?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['is-club-owner', userId],
    queryFn: async () => {
      if (!userId) return false;
      
      // Check if user has club_owner role in profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .single();
        
      if (profileError || !profileData?.role?.includes('club_owner')) {
        return false;
      }

      // Verify they have an approved club profile
      const { data: clubData, error: clubError } = await supabase
        .from('club_profiles')
        .select('id')
        .eq('user_id', userId)
        .eq('verification_status', 'approved')
        .limit(1);
        
      if (clubError) {
        console.warn('[useIsClubOwner] club_profiles query error', clubError);
        return false;
      }
      
      return Boolean(clubData && clubData.length > 0);
    },
    enabled: enabled && !!userId,
    staleTime: 60 * 1000,
  });
};
