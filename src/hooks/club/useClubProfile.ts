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

export const fetchClubProfile = async (clubId: string): Promise<ClubProfileData | null> => {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', clubId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    logo_url: data.logo_url,
    address: data.address,
    member_count: data.member_count,
    trust_score: data.trust_score,
    verified: data.status === 'active',
    description: data.description,
    phone: data.contact_info,
    created_at: data.created_at,
    total_matches: data.total_matches,
    total_tournaments: data.total_tournaments,
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
