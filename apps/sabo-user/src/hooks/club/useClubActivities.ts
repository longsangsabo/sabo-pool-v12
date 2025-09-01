import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
// Removed supabase import - migrated to services

export interface ClubActivityData {
  id: string;
  type: string;
  content: string;
  created_at: string;
}

interface UseClubActivitiesOptions {
  limit?: number;
  cursor?: string; // for future cursor pagination
  offset?: number; // offset based pagination
}

export const fetchClubActivities = async (
  clubId: string,
  opts: UseClubActivitiesOptions = {}
): Promise<ClubActivityData[]> => {
  const { limit = 30, offset = 0 } = opts; // cursor not yet applied (placeholder)
  // TODO: Replace with service call - const { data, error } = await supabase
    .from('club_activities')
    .select('*')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) {
    if ((error as any).code === '42P01') return [];
    throw error;
  }
  if (!data) return [];
  return data.map((r: any) => ({
    id: r.id,
    type: r.type || 'default',
    content: r.content || r.description || 'Hoạt động',
    created_at: r.created_at,
  }));
};

export const useClubActivities = (
  clubId?: string,
  opts: UseClubActivitiesOptions = {},
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['club-activities', clubId, opts],
    queryFn: async () => {
      if (!clubId) return [];
      return fetchClubActivities(clubId, opts);
    },
    enabled: enabled && !!clubId,
    staleTime: 15 * 1000,
  });
};

export const useInfiniteClubActivities = (
  clubId?: string,
  opts: Omit<UseClubActivitiesOptions, 'offset'> = {},
  enabled: boolean = true
) => {
  const { limit = 30 } = opts;
  return useInfiniteQuery<ClubActivityData[]>({
    queryKey: ['club-activities-infinite', clubId, opts],
    queryFn: async ({ pageParam = 0 }) => {
      if (!clubId) return [];
      return fetchClubActivities(clubId, {
        ...opts,
        offset: pageParam * limit,
        limit,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage) return undefined;
      if (lastPage.length < limit) return undefined;
      return allPages.length; // next page index
    },
    enabled: enabled && !!clubId,
    staleTime: 15 * 1000,
  });
};
