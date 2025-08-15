import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface RecentTournament {
  id: string;
  name: string;
  tournament_type: string;
  created_at: string;
  start_date?: string;
  max_participants?: number;
  game_format?: string;
  tier_level?: string | number;
}

export interface RecentTournamentTemplate {
  name: string;
  description: string | null;
  tournament_type: string;
  max_participants: number;
  entry_fee: number | null;
  prize_pool: number | null;
  game_format?: string;
  tier_level?: string | number;
  venue_address?: string | null;
  contact_info?: string | null;
  rules?: string | null;
  requires_approval?: boolean;
  allow_all_ranks?: boolean;
  eligible_ranks?: string[] | null;
  is_public?: boolean;
}

export const useRecentTournaments = () => {
  const [tournaments, setTournaments] = useState<RecentTournament[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load recent tournaments list
  const loadRecentTournaments = useCallback(async (limit: number = 10) => {
    if (!user) {
      setError('User must be authenticated');
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Loading recent tournaments for user:', user.id);

      const { data, error: fetchError } = await supabase
        .from('tournaments')
        .select(`
          id,
          name,
          tournament_type,
          created_at,
          start_date,
          max_participants
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) {
        console.error('Error fetching recent tournaments:', fetchError);
        console.error('Error details:', {
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
          code: fetchError.code
        });
        throw fetchError;
      }

      const tournamentsList = data || [];
      setTournaments(tournamentsList);
      
      console.log(`✅ Loaded ${tournamentsList.length} recent tournaments`);
      return tournamentsList;

    } catch (err) {
      console.error('❌ Error loading recent tournaments:', err);
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(errorMessage);
      toast.error(`Lỗi khi tải danh sách giải đấu: ${errorMessage}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load specific tournament data as template
  const loadTournamentTemplate = useCallback(async (tournamentId: string): Promise<RecentTournamentTemplate | null> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Loading tournament template for ID:', tournamentId);

      const { data, error: fetchError } = await supabase
        .from('tournaments')
        .select(`
          name,
          description,
          tournament_type,
          max_participants,
          entry_fee,
          prize_pool
        `)
        .eq('id', tournamentId)
        .eq('created_by', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching tournament template:', fetchError);
        console.error('Error details:', {
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
          code: fetchError.code
        });
        throw fetchError;
      }

      if (!data) {
        console.log('ℹ️ Tournament not found or no access');
        toast.error('Không tìm thấy giải đấu hoặc không có quyền truy cập');
        return null;
      }

      console.log('✅ Tournament template loaded:', data);

      // Create template data with updated dates
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const nextWeekEnd = new Date(nextWeek.getTime() + 1 * 24 * 60 * 60 * 1000);
      const registrationEnd = new Date(nextWeek.getTime() - 1 * 24 * 60 * 60 * 1000);

      const templateData: RecentTournamentTemplate = {
        ...data,
        name: `${data.name} - Copy`,
        // Set defaults for fields that might not exist
        game_format: '8_ball',
  // IMPORTANT: tier_level must be numeric in DB. Fallback to 1 if missing.
  // We purposely avoid using string labels like 'intermediate' to prevent
  // "invalid input syntax for type integer" errors on insert.
  tier_level: typeof (data as any).tier_level === 'number' ? (data as any).tier_level : 1,
        venue_address: '',
        contact_info: '',
        rules: '',
        requires_approval: false,
        allow_all_ranks: true,
        eligible_ranks: null,
        is_public: true,
      };

      toast.success('Đã tải dữ liệu từ giải đấu đã chọn! Vui lòng kiểm tra và cập nhật thông tin.');
      return templateData;

    } catch (err) {
      console.error('❌ Error loading tournament template:', err);
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(errorMessage);
      toast.error(`Lỗi khi tải dữ liệu: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    tournaments,
    isLoading,
    error,
    loadRecentTournaments,
    loadTournamentTemplate,
  };
};
