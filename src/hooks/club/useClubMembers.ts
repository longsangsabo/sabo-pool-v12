import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getDisplayName } from '@/types/unified-profile';

export interface ClubMemberData {
  id: string;
  name: string;
  avatar_url?: string;
  rank?: string;
  status?: string; // e.g., 'member', 'pending', 'removed'
  role?: string; // owner | moderator | member
}

interface UseClubMembersOptions {
  status?: string; // filter by status if needed
  search?: string;
  limit?: number;
  role?: string; // optional role filter
  offset?: number; // offset-based pagination
}

export const fetchClubMembers = async (
  clubId: string,
  opts: UseClubMembersOptions = {}
): Promise<ClubMemberData[]> => {
  const { status, search, limit = 50, role, offset = 0 } = opts;
  let query = supabase
    .from('club_members')
    .select(
      'user_id, status, role, profiles(full_name, display_name, avatar_url, verified_rank)',
      { count: 'exact' }
    )
    .eq('club_id', clubId)
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);
  if (role) query = query.eq('role', role);

  const { data, error } = await query;
  if (error) throw error;
  if (!data) return [];

  const mapped = data
    .map((m: any) => {
      const name = m.profiles ? getDisplayName(m.profiles) : 'Người chơi';
      if (search && !name.toLowerCase().includes(search.toLowerCase()))
        return null;
      return {
        id: m.user_id,
        name,
        avatar_url: m.profiles?.avatar_url,
        rank: m.profiles?.verified_rank,
        status: m.status || 'member',
        role: m.role || 'member',
      } as ClubMemberData;
    })
    .filter(Boolean) as ClubMemberData[];

  return mapped;
};

export const useClubMembers = (
  clubId?: string,
  opts: UseClubMembersOptions = {},
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['club-members', clubId, opts],
    queryFn: async () => {
      if (!clubId) return [];
      return fetchClubMembers(clubId, opts);
    },
    enabled: enabled && !!clubId,
    staleTime: 30 * 1000,
  });
};

export const useInfiniteClubMembers = (
  clubId?: string,
  opts: Omit<UseClubMembersOptions, 'offset'> = {},
  enabled: boolean = true
) => {
  const { limit = 50 } = opts;
  return useInfiniteQuery<ClubMemberData[]>({
    queryKey: ['club-members-infinite', clubId, opts],
    queryFn: async ({ pageParam = 0 }) => {
      if (!clubId) return [];
      return fetchClubMembers(clubId, {
        ...opts,
        offset: pageParam * limit,
        limit,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage) return undefined;
      if (lastPage.length < limit) return undefined; // no more
      return allPages.length; // next page index
    },
    enabled: enabled && !!clubId,
    staleTime: 30 * 1000,
  });
};
