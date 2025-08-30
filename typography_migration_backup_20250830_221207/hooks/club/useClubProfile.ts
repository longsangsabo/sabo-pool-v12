import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClubProfileData {
  id: string;
  name: string;
  logo_url?: string;
  address?: string;
  member_count?: number;
  trust_score?: number;
  verified?: boolean;
  description?: string;
  phone?: string;
  created_at?: string;
  total_matches?: number;
  total_tournaments?: number;
}

export const fetchClubProfile = async (
  clubId: string
): Promise<ClubProfileData | null> => {
  const { data, error } = await supabase
    .from('club_profiles')
    .select('*')
    .eq('id', clubId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    name: data.club_name,
    logo_url: undefined, // Not available in club_profiles
    address: data.address,
    member_count: undefined, // Not available in club_profiles
    trust_score: data.priority_score, // Use priority_score as trust_score
    verified: data.verification_status === 'approved',
    description: data.description,
    phone: data.phone,
    created_at: data.created_at,
    total_matches: undefined, // Not available in club_profiles
    total_tournaments: undefined, // Not available in club_profiles
  };
};

export const useClubProfile = (clubId?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['club-profile', clubId],
    queryFn: async () => {
      if (!clubId) return null;
      return fetchClubProfile(clubId);
    },
    enabled: enabled && !!clubId,
    staleTime: 60 * 1000,
  });
};
