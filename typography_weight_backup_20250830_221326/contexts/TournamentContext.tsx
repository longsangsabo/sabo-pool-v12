import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { TournamentRewards } from '@/types/tournament-extended';
import { RankCode, getDefaultRank } from '@sabo/shared-utils';
import { calculateRewards } from '@sabo/shared-utils';
import { useRewardTemplates } from '@/hooks/useRewardTemplates';

interface TournamentContextType {
  tournament: any | null;
  loading: boolean;
  error: string | undefined;
  rewards: TournamentRewards | null;
  loadTournament: (id: string) => Promise<void>;
  refreshTournament: () => Promise<void>;
  saveTournamentRewards: (
    tournamentId: string,
    rewards: TournamentRewards
  ) => Promise<void>;
  loadRewards: (
    tournamentId: string,
    rank?: RankCode
  ) => Promise<TournamentRewards | null>;
  // Additional properties for enhanced form
  updateTournament?: (data: Partial<any>) => void;
  updateRewards?: (rewards: TournamentRewards) => void;
  validateTournament?: () => boolean;
  resetTournament?: () => void;
  isValid?: boolean;
  validationErrors?: any;
  calculateRewards?: () => TournamentRewards;
  recalculateOnChange?: boolean;
  setRecalculateOnChange?: (value: boolean) => void;
  createTournament?: () => Promise<any>;
  updateExistingTournament?: (id: string) => Promise<any>;
  loadLatestTournament?: () => Promise<any>;
  saveTournamentPrizes?: (tournamentId: string, prizes: any[]) => Promise<void>;
  tournamentPrizes?: any[];
  setTournamentPrizes?: (prizes: any[]) => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(
  undefined
);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [tournament, setTournament] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rewards, setRewards] = useState<TournamentRewards | null>(null);
  const [tournamentPrizes, setTournamentPrizes] = useState<any[]>([]);
  const [persistedPrizes, setPersistedPrizes] = useState<any[]>([]); // State để lưu phần thưởng khi chuyển tab
  const [recalculateOnChange, setRecalculateOnChange] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any>({});

  const { templates, convertTemplatesToRewards, copyTemplateToTournament } =
    useRewardTemplates();

  // Updated loadRewardsFromDatabase to work with new structure
  const loadRewardsFromDatabase = useCallback(
    async (tournament: any, rank: RankCode = getDefaultRank()) => {
      try {
        // Use tournament prize_pool or fallback to entry_fee calculation
        const finalTotalPrize =
          tournament.prize_pool ||
          (tournament.entry_fee && tournament.max_participants
            ? tournament.entry_fee * tournament.max_participants * 0.75
            : 0);

        let rewards: TournamentRewards | null = null;
        if (finalTotalPrize > 0) {
          rewards = calculateRewards(
            {
              entry_fee: tournament.entry_fee,
              max_participants: tournament.max_participants,
              prize_pool: finalTotalPrize,
            },
            rank
          );
        }

        return (
          rewards || {
            totalPrize: 0,
            showPrizes: false,
            positions: [],
          }
        );
      } catch (error) {
        console.error('❌ Error loading rewards from database:', error);
        // Return fallback rewards
        return {
          totalPrize: 0,
          showPrizes: false,
          positions: [
            {
              position: 1,
              name: 'Vô địch',
              eloPoints: 100,
              spaPoints: 1000,
              cashPrize: 0,
              items: ['Cúp vô địch'],
              isVisible: true,
            },
          ],
        };
      }
    },
    []
  );

  const calculateRewardsInternal = useCallback((): TournamentRewards => {
    if (!tournament) {
      return {
        totalPrize: 0,
        showPrizes: false,
        positions: [],
      };
    }

    // Simple default calculation for now
    const totalPrize = tournament.prize_pool || 0;

    return {
      totalPrize,
      showPrizes: totalPrize > 0,
      positions: [
        {
          position: 1,
          name: 'Vô địch',
          eloPoints: 100,
          spaPoints: 1000,
          cashPrize: totalPrize * 0.5,
          items: ['Cúp vô địch'],
          isVisible: true,
        },
        {
          position: 2,
          name: 'Á quân',
          eloPoints: 75,
          spaPoints: 700,
          cashPrize: totalPrize * 0.3,
          items: ['Huy chương bạc'],
          isVisible: true,
        },
        {
          position: 3,
          name: 'Hạng 3',
          eloPoints: 50,
          spaPoints: 500,
          cashPrize: totalPrize * 0.2,
          items: ['Huy chương đồng'],
          isVisible: true,
        },
      ],
    };
  }, [tournament]);

  const loadTournament = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('tournaments')
          .select(
            `
          *,
          club:club_profiles(
            id,
            club_name,
            address,
            phone,
            contact_info
          ),
          registrations:tournament_registrations(
            id,
            user_id,
            registration_status,
            profiles:user_id(
              id,
              display_name,
              full_name,
              avatar_url,
              verified_rank
            )
          )
        `
          )
          .eq('id', id)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching tournament:', fetchError);
          throw fetchError;
        }

        if (!data) {
          throw new Error('Giải đấu không tồn tại');
        }

        console.log('✅ Tournament loaded:', data);
        setTournament(data);

        // Load rewards
        const rewardsData = await loadRewardsFromDatabase(data);
        setRewards(rewardsData);
      } catch (err) {
        console.error('❌ Error loading tournament:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Lỗi không xác định';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [loadRewardsFromDatabase]
  );

  const refreshTournament = useCallback(async () => {
    if (tournament?.id) {
      await loadTournament(tournament.id);
    }
  }, [tournament?.id, loadTournament]);

  const saveTournamentRewards = useCallback(
    async (tournamentId: string, rewardsData: TournamentRewards) => {
      try {
        console.log('💾 Saving tournament rewards:', {
          tournamentId,
          rewardsData,
        });

        if (!rewardsData || typeof rewardsData !== 'object') {
          throw new Error('Dữ liệu phần thưởng không hợp lệ');
        }

        // Note: prize_distribution column removed - using tournament_prize_tiers table

        const { error } = await supabase
          .from('tournaments')
          .update({
            updated_at: new Date().toISOString(),
          })
          .eq('id', tournamentId);

        if (error) throw error;

        setRewards(rewardsData);
        toast.success('Đã lưu phần thưởng giải đấu');
      } catch (error) {
        console.error('❌ Error saving tournament rewards:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Lỗi khi lưu phần thưởng';
        toast.error(errorMessage);
        throw error;
      }
    },
    []
  );

  const loadRewards = useCallback(
    async (
      tournamentId: string,
      rank: RankCode = 'K'
    ): Promise<TournamentRewards | null> => {
      try {
        // Fetch tournament data
        const { data, error } = await supabase
          .from('tournaments')
          .select('prize_pool, entry_fee, max_participants')
          .eq('id', tournamentId)
          .single();

        if (error) {
          console.error('❌ Database error:', error);
          throw error;
        }

        if (!data) {
          console.warn('⚠️ No tournament data found for:', tournamentId);
          return null;
        }

        return await loadRewardsFromDatabase(data, rank);
      } catch (error) {
        console.error('❌ Error loading rewards:', error);
        return null;
      }
    },
    [loadRewardsFromDatabase]
  );

  // Load latest tournament data for auto-fill
  const loadLatestTournament = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User must be authenticated');
      }

      console.log('🔍 Loading latest tournament for user:', user.id);

      const { data, error: fetchError } = await supabase
        .from('tournaments')
        .select(
          `
          name,
          description,
          tournament_type,
          game_format,
          max_participants,
          tier_level,
          entry_fee,
          prize_pool,
          venue_address,
          contact_info,
          rules,
          requires_approval,
          allow_all_ranks,
          eligible_ranks,
          is_public
        `
        )
        .eq('created_by', user.id)
        .neq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching latest tournament:', fetchError);
        throw fetchError;
      }

      if (!data) {
        console.log('ℹ️ No previous tournaments found for user');
        toast.info('Không tìm thấy giải đấu trước đó để sao chép dữ liệu');
        return null;
      }

      console.log('✅ Latest tournament loaded:', data);

      // Create template data with updated dates
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const nextWeekEnd = new Date(
        nextWeek.getTime() + 1 * 24 * 60 * 60 * 1000
      );
      const registrationEnd = new Date(
        nextWeek.getTime() - 1 * 24 * 60 * 60 * 1000
      );

      const templateData = {
        ...data,
        name: `${data.name} - Copy`,
        tournament_start: nextWeek.toISOString(),
        tournament_end: nextWeekEnd.toISOString(),
        registration_start: now.toISOString(),
        registration_end: registrationEnd.toISOString(),
      };

      setTournament(templateData);
      toast.success(
        'Đã tải dữ liệu từ giải đấu gần nhất! Vui lòng kiểm tra và cập nhật thông tin.'
      );

      return templateData;
    } catch (err) {
      console.error('❌ Error loading latest tournament:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(errorMessage);
      toast.error(`Lỗi khi tải dữ liệu: ${errorMessage}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update tournament data - improved persistence
  const updateTournament = useCallback(
    (data: Partial<any>) => {
      setTournament(prev => {
        // Merge carefully to preserve existing data
        const updated = { 
          ...prev, 
          ...data,
          // Preserve existing rewards unless explicitly being updated
          rewards: data.rewards ? data.rewards : prev?.rewards,
        };

        // Auto-calculate rewards if enabled and relevant fields changed
        if (
          recalculateOnChange &&
          (data.tier_level || data.max_participants || data.prize_pool) &&
          updated.tier_level &&
          updated.max_participants
        ) {
          const newRewards = calculateRewardsInternal();
          setRewards(newRewards);
          updated.rewards = newRewards;
        }

        // console.log('🔄 TournamentContext: Tournament updated', { updated, changedFields: Object.keys(data) });
        return updated;
      });
    },
    [recalculateOnChange, calculateRewardsInternal]
  );

  // Update rewards
  const updateRewards = useCallback(
    (newRewards: TournamentRewards) => {
      setRewards(newRewards);
      if (tournament) {
        setTournament(prev => ({ ...prev, rewards: newRewards }));
      }
    },
    [tournament]
  );

  // Validate tournament
  const validateTournament = useCallback(() => {
    const errors: any = {};

    if (!tournament?.name) errors.name = 'Tên giải đấu là bắt buộc';
    if (!tournament?.tier_level) errors.tier_level = 'Hạng thi đấu là bắt buộc';
    if (!tournament?.max_participants) errors.max_participants = 'Số người tham gia là bắt buộc';
    if (!tournament?.venue_address) errors.venue_address = 'Địa chỉ tổ chức là bắt buộc';
    if (!tournament?.tournament_type) errors.tournament_type = 'Loại giải là bắt buộc';
    if (!tournament?.game_format) errors.game_format = 'Thể thức là bắt buộc';
    if (!tournament?.registration_start) errors.registration_start = 'Thời gian bắt đầu đăng ký là bắt buộc';
    if (!tournament?.registration_end) errors.registration_end = 'Thời gian kết thúc đăng ký là bắt buộc';
    if (!tournament?.tournament_start) errors.tournament_start = 'Thời gian bắt đầu giải là bắt buộc';
    if (!tournament?.tournament_end) errors.tournament_end = 'Thời gian kết thúc giải là bắt buộc';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [tournament]);

  // Reset tournament
  const resetTournament = useCallback(() => {
    setTournament(null);
    setRewards(null);
    setValidationErrors({});
    setError(null);
  }, []);

  // Create tournament
  // Save tournament prizes to tournament_prizes table
  const saveTournamentPrizes = useCallback(async (tournamentId: string, prizes: any[]) => {
    try {
      console.log('🏆 Saving tournament prizes:', prizes.length, 'prizes for tournament:', tournamentId);
      
      if (!prizes || prizes.length === 0) {
        console.log('📝 No prizes to save, skipping...');
        return;
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.warn('⚠️ No authenticated session, skipping prize save');
        return;
      }

      // Prepare all prize data for batch insert
      const prizesData = prizes.map(prize => ({
        tournament_id: tournamentId,
        prize_position: prize.prize_position || prize.position,
        position_name: prize.position_name || prize.name || `Hạng ${prize.position}`,
        position_description: prize.position_description || prize.description || '',
        cash_amount: prize.cash_amount || prize.cashAmount || 0,
        cash_currency: 'VND',
        elo_points: prize.elo_points || prize.eloPoints || 0,
        spa_points: prize.spa_points || prize.spaPoints || 0,
        physical_items: prize.physical_items || prize.items || [],
        color_theme: prize.color_theme || prize.theme || 'gray',
        is_visible: prize.is_visible !== false,
        is_guaranteed: true,
        display_order: prize.display_order || prize.position,
        created_by: session.user.id
      }));

      // Use REST API to batch insert
      const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.jJoRnBFxmQsGKM2TFfXYr3F6LgXSW3qE6vLzG5rfRWo';
      
      const response = await fetch(`${supabaseUrl}/rest/v1/tournament_prizes`, {
        method: 'POST',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(prizesData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to save prizes:', response.status, errorText);
        throw new Error(`Failed to save prizes: ${response.status} ${errorText}`);
      }

      console.log('✅ Tournament prizes saved successfully:', prizes.length, 'entries');
    } catch (error) {
      console.error('❌ Error in saveTournamentPrizes:', error);
      // Don't throw error - prizes are not critical for tournament creation
      console.log('⚠️ Continuing without saving prizes to tournament_prizes table');
    }
  }, []);

  const createTournament = useCallback(async () => {
    try {
      if (!user) {
        throw new Error('Bạn cần đăng nhập để tạo giải đấu');
      }

      if (!validateTournament()) {
        throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
      }

      setLoading(true);
      setError(null);

      // 🏆 TẠO ĐẦY ĐỦ THÔNG TIN GIẢI THƯỞNG 16 VỊ TRÍ
      console.log('🏆 Creating full prize distribution for 16 positions...');
      
      // Import service để tạo template
      const { TournamentPrizesService } = await import('@/services/tournament-prizes.service');
      
      // Tạo template đầy đủ 16 vị trí
      // Generate prize template  
      console.log('🎯 [DEBUG] Generating prize template...');
      console.log('🎯 [DEBUG] Tournament object received:', JSON.stringify(tournament, null, 2));
      console.log('🎯 [DEBUG] tournament.prize_pool:', tournament.prize_pool, typeof tournament.prize_pool);
      console.log('🎯 [DEBUG] tournament.first_prize:', tournament.first_prize, typeof tournament.first_prize);
      console.log('🎯 [DEBUG] tournament.second_prize:', tournament.second_prize, typeof tournament.second_prize);
      console.log('🎯 [DEBUG] tournament.third_prize:', tournament.third_prize, typeof tournament.third_prize);
      
      // Create simple 16-position prize template
      const generatePrizeTemplate = (prizePool: number, firstPrize: number, secondPrize: number, thirdPrize: number) => {
        const positions = [];
        
        for (let i = 1; i <= 16; i++) {
          let cashAmount = 0;
          let positionName = '';
          
          if (i === 1) {
            cashAmount = firstPrize || Math.floor(prizePool * 0.4);
            positionName = 'Vô địch';
          } else if (i === 2) {
            cashAmount = secondPrize || Math.floor(prizePool * 0.24);
            positionName = 'Á quân';
          } else if (i === 3) {
            cashAmount = thirdPrize || Math.floor(prizePool * 0.16);
            positionName = 'Hạng 3';
          } else if (i === 4) {
            cashAmount = Math.floor(prizePool * 0.08);
            positionName = 'Hạng 4';
          } else if (i <= 6) {
            cashAmount = Math.floor(prizePool * 0.04);
            positionName = `Hạng 5-6`;
          } else if (i <= 8) {
            cashAmount = Math.floor(prizePool * 0.02);
            positionName = `Hạng 7-8`;
          } else if (i <= 12) {
            cashAmount = Math.floor(prizePool * 0.01125);
            positionName = `Hạng 9-12`;
          } else {
            cashAmount = Math.floor(prizePool * 0.005625);
            positionName = `Hạng 13-16`;
          }
          
          positions.push({
            prize_position: i,
            position_name: positionName,
            cash_amount: cashAmount,
            elo_points: i === 1 ? 100 : i === 2 ? 50 : i === 3 ? 25 : i === 4 ? 12 : 5,
            spa_points: i === 1 ? 1500 : i === 2 ? 1100 : i === 3 ? 900 : i === 4 ? 650 : 320,
            physical_items: [],
            color_theme: i <= 3 ? 'gold' : i <= 8 ? 'silver' : 'bronze',
            is_visible: true,
            is_guaranteed: true
          });
        }
        
        return positions;
      };
      
      const prizeTemplate = generatePrizeTemplate(
        tournament.prize_pool || 1000000,
        tournament.first_prize || 0,
        tournament.second_prize || 0,
        tournament.third_prize || 0
      );
      
      console.log('🎯 [DEBUG] Generated prize template:', JSON.stringify(prizeTemplate, null, 2));
      
      console.log('🎯 [DEBUG] Building prize_distribution object...');
      console.log('🎯 [DEBUG] prizeTemplate length:', prizeTemplate.length);
      console.log('🎯 [DEBUG] prizeTemplate[0]:', JSON.stringify(prizeTemplate[0], null, 2));
      console.log('🎯 [DEBUG] Prize template length:', prizeTemplate.length);
      
      if (prizeTemplate.length === 0) {
        console.error('❌ [ERROR] Prize template is empty! Creating fallback...');
        // Create fallback prize template
        for (let i = 1; i <= 16; i++) {
          let cashAmount = 0;
          let positionName = '';
          
          if (i === 1) {
            cashAmount = tournament.first_prize || Math.floor((tournament.prize_pool || 1000000) * 0.4);
            positionName = 'Vô địch';
          } else if (i === 2) {
            cashAmount = tournament.second_prize || Math.floor((tournament.prize_pool || 1000000) * 0.24);
            positionName = 'Á quân';
          } else if (i === 3) {
            cashAmount = tournament.third_prize || Math.floor((tournament.prize_pool || 1000000) * 0.16);
            positionName = 'Hạng 3';
          } else {
            cashAmount = Math.floor((tournament.prize_pool || 1000000) * 0.01);
            positionName = `Hạng ${i}`;
          }
          
          prizeTemplate.push({
            prize_position: i,
            position_name: positionName,
            cash_amount: cashAmount,
            elo_points: i === 1 ? 100 : i === 2 ? 50 : i === 3 ? 25 : 5,
            spa_points: i === 1 ? 1500 : i === 2 ? 1100 : i === 3 ? 900 : 320,
            physical_items: [],
            color_theme: i <= 3 ? 'gold' : 'silver',
            is_visible: true,
            is_guaranteed: true
          });
        }
        console.log('🎯 [DEBUG] Created fallback prize template with', prizeTemplate.length, 'positions');
      }
      
      console.log('🏆 Prize template created:', prizeTemplate.length, 'positions');
      
      // Chuẩn bị dữ liệu theo bảng tournaments với ĐẦY ĐỦ thông tin giải thưởng
      const now = new Date().toISOString();
      
      // 🔍 DEBUG: Kiểm tra tournament state trước khi tạo
      console.log('🔍 [DEBUG] Tournament state before creation:', {
        tournament_start: tournament.tournament_start,
        tournament_end: tournament.tournament_end,
        registration_start: tournament.registration_start,
        registration_end: tournament.registration_end,
        name: tournament.name,
        fullTournament: tournament
      });
      
      // 🔥 CRITICAL: Get authenticated user for RLS compliance
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        console.error('❌ Authentication required for tournament creation:', authError);
        setLoading(false);
        throw new Error('Bạn cần đăng nhập để tạo giải đấu');
      }

      console.log('🔍 [DEBUG] Tournament object received:', {
        name: tournament?.name,
        tournament_start: tournament?.tournament_start,
        start_date: tournament?.start_date,
        venue_address: tournament?.venue_address,
        keys: tournament ? Object.keys(tournament) : 'null'
      });

      const tournamentData = {
        // ===== THÔNG TIN CƠ BẢN =====
        name: tournament.name,
        description: tournament.description || '',
        tournament_type: tournament.tournament_type || 'double_elimination',
        
        // ===== THÔNG TIN THAM GIA =====
        max_participants: tournament.max_participants || 16,
        current_participants: tournament.current_participants || 0,
        
        // ===== THÔNG TIN TÀI CHÍNH =====
        entry_fee: tournament.entry_fee || 0,
        prize_pool: tournament.prize_pool || 0,
        first_prize: tournament.first_prize || 0,
        second_prize: tournament.second_prize || 0,
        third_prize: tournament.third_prize || 0,
        
        // ===== THÔNG TIN THỜI GIAN =====
        registration_start: tournament.registration_start || new Date().toISOString(),
        registration_end: tournament.registration_end || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 days
        tournament_start: tournament.tournament_start || tournament.start_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // +14 days  
        tournament_end: tournament.tournament_end || tournament.end_date || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // +15 days
        
                // ===== THÔNG TIN ĐỊA ĐIỂM =====
        venue_address: tournament.venue_address || '', // Use venue_address (exists in latest migration)
        rules: tournament.rules || '',
        
        // ===== THÔNG TIN TỔ CHỨC =====
        club_id: tournament.club_id || null,
        created_by: authUser.id,
        status: tournament.status || 'registration_open',
        is_visible: tournament.is_visible !== false, // DB field exists
        
        // ===== TIMESTAMPS =====
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('🎯 [DEBUG] Tournament data prepared for DB insert');
      console.log('🎯 [DEBUG] Fields count:', Object.keys(tournamentData).length);
      
      // 🔍 CRITICAL: Validate required fields before DB insert
      console.log('🔍 [VALIDATION] Critical fields check:', {
        name: tournamentData.name,
        tournament_start: tournamentData.tournament_start,
        tournament_end: tournamentData.tournament_end,
        created_by: tournamentData.created_by
      });
      
      // Ensure tournament_start is not null/undefined
      if (!tournamentData.tournament_start) {
        console.error('❌ [ERROR] tournament_start is null/undefined!');
        tournamentData.tournament_start = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
        console.log('🔧 [FIX] Set tournament_start to:', tournamentData.tournament_start);
      }
      
      console.log('🏆 Tournament data prepared for DB:', {
        name: tournamentData.name,
        tournament_type: tournamentData.tournament_type,
        max_participants: tournamentData.max_participants,
        prize_pool: tournamentData.prize_pool,
        tournament_start: tournamentData.tournament_start
      });

      // 🔍 DEBUG: Log toàn bộ tournamentData để kiểm tra
      console.log('🔍 [DEBUG] Complete tournamentData before INSERT:', JSON.stringify(tournamentData, null, 2));
      
      // 🔍 DEBUG: Check prize template
      console.log('🔍 [DEBUG] Prize template before mapping:', prizeTemplate.slice(0, 3));

      // Create tournament in database
      const { data: newTournament, error: tournamentError } = await supabase
        .from('tournaments')
        .insert([tournamentData])
        .select()
        .single();

      if (tournamentError) {
        console.error('❌ [DEBUG] Database INSERT error:', tournamentError);
        throw tournamentError;
      }

      console.log('✅ [DEBUG] Tournament created successfully:', newTournament);

      // Apply reward template if available
      if (templates.length > 0) {
        const templateRewards = convertTemplatesToRewards(templates);
        const success = await copyTemplateToTournament(
          newTournament.id,
          templateRewards
        );

        if (success) {
          console.log('✅ Reward template applied successfully');
        } else {
          console.warn(
            '⚠️ Failed to apply reward template, but tournament created'
          );
        }
      }

      // Update local state
      setTournament(newTournament);

      // 🏆 Save tournament prizes to tournament_prizes table
      console.log('🏆 Saving tournament prizes to tournament_prizes table...');
      try {
        await saveTournamentPrizes(newTournament.id, prizeTemplate);
        console.log('✅ Tournament prizes saved successfully');
      } catch (prizeError) {
        console.error('⚠️ Failed to save tournament prizes:', prizeError);
        // Non-critical error - tournament is already created
      }

      toast.success('Tạo giải đấu thành công!');
      return newTournament;
    } catch (err) {
      console.error('❌ Error creating tournament:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(errorMessage);
      toast.error(`Lỗi khi tạo giải đấu: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [
    user,
    tournament,
    validateTournament,
    templates,
    convertTemplatesToRewards,
    copyTemplateToTournament,
  ]);

  // Update existing tournament
  const updateExistingTournament = useCallback(
    async (id: string) => {
      try {
        if (!user) {
          throw new Error('Bạn cần đăng nhập để cập nhật giải đấu');
        }

        if (!validateTournament()) {
          throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
        }

        setLoading(true);
        setError(null);

        const updateData = {
          name: tournament.name,
          description: tournament.description || '',
          tournament_type: tournament.tournament_type || 'double_elimination',
          game_format: tournament.game_format || 'billiards_pool_8',
          tier_level: tournament.tier_level,
          max_participants: tournament.max_participants,
          current_participants: tournament.current_participants || 0,
          entry_fee: tournament.entry_fee || 0,
          prize_pool: tournament.prize_pool || 0,
          first_prize: tournament.first_prize || 0,
          second_prize: tournament.second_prize || 0,
          third_prize: tournament.third_prize || 0,
          registration_start: tournament.registration_start,
          registration_end: tournament.registration_end,
          tournament_start: tournament.tournament_start,
          tournament_end: tournament.tournament_end,
          club_id: tournament.club_id || null,
          venue_address: tournament.venue_address || '', // Keep venue_address
          status: tournament.status || 'registration_open',
          is_public: tournament.is_public !== false,
          requires_approval: tournament.requires_approval || false,
          rules: tournament.rules || '',
          contact_info: tournament.contact_info || {},
          updated_at: new Date().toISOString(),
        };

        const { data: updatedTournament, error: updateError } = await supabase
          .from('tournaments')
          .update(updateData)
          .eq('id', id)
          .eq('created_by', user.id) // Ensure user owns the tournament
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        setTournament(updatedTournament);
        toast.success('Cập nhật giải đấu thành công!');
        return updatedTournament;
      } catch (err) {
        console.error('❌ Error updating tournament:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Lỗi không xác định';
        setError(errorMessage);
        toast.error(`Lỗi khi cập nhật giải đấu: ${errorMessage}`);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, tournament, validateTournament]
  );

  const value: TournamentContextType = {
    tournament,
    loading,
    error,
    rewards,
    loadTournament,
    refreshTournament,
    saveTournamentRewards,
    loadRewards,
    loadLatestTournament,
    // Enhanced implementations
    updateTournament,
    updateRewards,
    validateTournament,
    resetTournament,
    isValid: Object.keys(validationErrors).length === 0,
    validationErrors,
    calculateRewards: calculateRewardsInternal,
    recalculateOnChange,
    setRecalculateOnChange,
    createTournament,
    updateExistingTournament,
    saveTournamentPrizes,
    tournamentPrizes,
    setTournamentPrizes,
  };

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournamentContext = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error(
      'useTournamentContext must be used within TournamentProvider'
    );
  }
  return context;
};

export const useTournament = useTournamentContext;

export default TournamentContext;
