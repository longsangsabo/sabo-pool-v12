import { useQuery } from '@tanstack/react-query';
// Removed supabase import - migrated to services
import { getDisplayName } from '@/types/unified-profile';

export const useDisplayName = (userId: string) => {
  return useQuery({
    queryKey: ['display-name', userId],
    queryFn: async () => {
      // TODO: Replace with service call - const { data } = await supabase
        .from('profiles')
        .select('display_name, full_name, nickname, email, user_id')
        .eq('user_id', userId)
        .single();
      
      if (!data) return `User ${userId.substring(0, 8)}`;
      return getDisplayName(data);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
  });
};
