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
      // Check membership table first
      const sb: any = supabase;
      const { data: memberData, error: memberError } = await sb
        .from('club_members')
        .select('role, status')
        .eq('user_id', userId)
        .eq('role', 'owner')
        .eq('status', 'active')
        .limit(1);
      if (memberError) {
        console.warn('[useIsClubOwner] club_members query error', memberError);
      }
      if (memberData && memberData.length > 0) return true;

      // Fallback: some schemas may store ownership via club_profiles.user_id
      const { data: profileData, error: profileError } = await sb
        .from('club_profiles')
        .select('id')
        .eq('user_id', userId)
        .limit(1);
      if (profileError) {
        console.warn(
          '[useIsClubOwner] club_profiles query error',
          profileError
        );
      }
      return Boolean(profileData && profileData.length > 0);
    },
    enabled: enabled && !!userId,
    staleTime: 60 * 1000,
  });
};
