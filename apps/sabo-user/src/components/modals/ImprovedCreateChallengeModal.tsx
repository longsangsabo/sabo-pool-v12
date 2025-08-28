import React from "react";
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// Removed Badge (unused)
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useChallenges } from '@/hooks/useChallenges';
import { toast } from 'sonner';
import { useSocialProfile } from '@/hooks/useSocialProfile';
import {
  Search,
  Trophy,
  HelpCircle,
  Calculator,
  Loader2,
  Globe,
  Target,
  Star,
  CheckCircle,
  X,
  MapPin,
} from 'lucide-react';
import { calculateSaboHandicap, type SaboRank } from '@/utils/saboHandicap';
import SaboInfoDialog from '@/components/sabo/SaboInfoDialog';
import { useOptimizedResponsive } from '@/hooks/useOptimizedResponsive';
import { useTheme } from '@/hooks/useTheme';
import { convertVietnamToUTC } from '@/utils/timezone';
// Removed TechCard usage to simplify border style

interface ImprovedCreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChallengeCreated: () => void;
}

interface Player {
  user_id: string;
  full_name: string;
  display_name?: string;
  avatar_url?: string;
  current_rank?: string;
  ranking_points?: number;
}

interface Club {
  id: string;
  name: string;
  address: string;
}

const BET_CONFIGURATIONS = [
  { points: 100, raceTO: 8, description: 'Thách đấu sơ cấp - Race to 8' },
  { points: 200, raceTO: 12, description: 'Thách đấu cơ bản - Race to 12' },
  { points: 300, raceTO: 14, description: 'Thách đấu trung bình - Race to 14' },
  { points: 400, raceTO: 16, description: 'Thách đấu trung cấp - Race to 16' },
  { points: 500, raceTO: 18, description: 'Thách đấu trung cao - Race to 18' },
  { points: 600, raceTO: 22, description: 'Thách đấu cao cấp - Race to 22' },
];

const ImprovedCreateChallengeModal = ({
  isOpen,
  onClose,
  onChallengeCreated,
}: ImprovedCreateChallengeModalProps) => {
  const { user } = useAuth();
  const { isMobile } = useOptimizedResponsive();
  const { isDark } = useTheme();
  const { createChallenge } = useChallenges();
  const { navigateToSocialProfile } = useSocialProfile();
  const [loading, setLoading] = useState(false);

  // 🎯 Default to open challenge và SABO mode
  const [challengeType, setChallengeType] = useState<'direct' | 'open'>('open');
  const [showSaboInfo, setShowSaboInfo] = useState(false);

  const [formData, setFormData] = useState({
    opponent_id: '',
    opponent_search: '',
    bet_points: 100,
    race_to: 8,
    message: '',
    club_id: '',
    scheduled_time: '',
    location: '', // Add location field
    is_sabo: true, // 🎯 SABO luôn luôn bật - không thể tắt
    handicap_1_rank: 0,
    handicap_05_rank: 0,
    required_rank: 'all', // Hạng nhận thách đấu
  });

  // Lưu đối thủ đã chọn thay cho danh sách players tĩnh
  const [clubs, setClubs] = useState<Club[]>([]);
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [searching, setSearching] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<Player | null>(
    null
  );
  const [selectedOpponent, setSelectedOpponent] = useState<Player | null>(null);

  // Fetch current user profile
  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, current_rank')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setCurrentUserProfile(data);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.error('Error fetching current user profile:', error);
        }
      }
    };

    fetchCurrentUserProfile();
  }, [user?.id]);

  // Fetch clubs
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const { data, error } = await supabase
          .from('club_profiles')
          .select('id, club_name, address')
          .order('club_name');

        if (error) throw error;
        setClubs(
          (data || []).map((club: any) => ({
            id: club.id,
            name: club.club_name,
            address: club.address,
            ...club
          }))
        );
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.error('Error fetching clubs:', error);
        }
      }
    };

    if (isOpen) fetchClubs();
  }, [isOpen]);

  // Search players function
  const searchPlayers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, current_rank')
        .ilike('full_name', `%${query}%`)
        .neq('user_id', user?.id)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('Error searching players:', error);
      }
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Handle search input
  const handleSearchChange = (value: string) => {
    setFormData(prev => ({ ...prev, opponent_search: value }));
    searchPlayers(value);
  };

  // Calculate handicap
  const calculateHandicap = () => {
    if (!formData.is_sabo || !currentUserProfile || !selectedOpponent) {
      return null;
    }

    const challengerRank = currentUserProfile.current_rank as SaboRank;
    const opponentRank = selectedOpponent.current_rank as SaboRank;

    try {
      return calculateSaboHandicap(
        challengerRank || 'K',
        opponentRank || 'K',
        formData.race_to
      );
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('Error calculating handicap:', error);
      }
      return null;
    }
  };

  const handicapInfo = calculateHandicap();

  // Handle bet point selection with auto race_to update
  const handleBetPointsChange = (points: number) => {
    const config = BET_CONFIGURATIONS.find(c => c.points === points);
    setFormData(prev => ({
      ...prev,
      bet_points: points,
      race_to: config?.raceTO || 8,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Bạn cần đăng nhập để tạo thách đấu');
      return;
    }

    // Validation
    if (challengeType === 'direct' && !formData.opponent_id) {
      toast.error('Vui lòng chọn đối thủ');
      return;
    }

    if (!formData.club_id) {
      toast.error('Vui lòng chọn câu lạc bộ');
      return;
    }

    setLoading(true);
    try {
      // Fix timezone: Convert datetime-local to UTC properly
      let scheduledTimeUTC = null;
      if (formData.scheduled_time) {
        scheduledTimeUTC = convertVietnamToUTC(formData.scheduled_time);
        
        console.log('🕐 Timezone conversion:', {
          userInput: formData.scheduled_time,
          convertedUTC: scheduledTimeUTC
        });
      }

      const challengeData = {
        challenger_id: user.id,
        challenger_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown Player',
        opponent_id: challengeType === 'direct' ? formData.opponent_id : null,
        bet_points: formData.bet_points,
        race_to: formData.race_to,
        message: formData.message,
        club_id: formData.club_id,
        location: clubs.find(club => club.id === formData.club_id)?.name || '',
        required_rank: challengeType === 'open' ? formData.required_rank : null,
        scheduled_time: scheduledTimeUTC,
        is_sabo: formData.is_sabo,
        handicap_1_rank: handicapInfo?.handicapChallenger || 0,
        handicap_05_rank: handicapInfo?.handicapOpponent || 0,
        status: 'pending', // Always use 'pending' status for consistency
      };

      console.log('🚀 [ImprovedCreateChallengeModal] Sending challenge data:', {
        ...challengeData,
        location_check: challengeData.location ? '✅ Has location' : '❌ Missing location',
        required_rank_check: challengeData.required_rank ? '✅ Has required_rank' : '❌ Missing required_rank',
        form_club_id: formData.club_id,
        form_required_rank: formData.required_rank,
        challenge_type: challengeType
      });

      await createChallenge(challengeData);
      toast.success(
        challengeType === 'open'
          ? '🌟 Thách đấu mở đã được tạo thành công!'
          : '🎯 Thách đấu trực tiếp đã được gửi!'
      );
      onChallengeCreated();
      onClose();
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('Error creating challenge:', error);
      }
      toast.error('Không thể tạo thách đấu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Base card style (subtle, no "tech" border) - Enhanced for better visibility
  const sectionCard = isDark
    ? 'rounded-xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-sm p-4 shadow-lg shadow-slate-900/40'
    : 'rounded-xl bg-white/90 border border-slate-300/80 backdrop-blur-sm p-4 shadow-lg shadow-slate-200/40';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className={
            isMobile
              ? `w-screen h-[100dvh] max-w-none m-0 p-0 rounded-none backdrop-blur-xl border flex flex-col shadow-[0_0_40px_-10px_rgba(0,0,0,0.8)] ${
                  isDark 
                    ? 'bg-gradient-to-br from-slate-950/98 via-slate-900/95 to-slate-950/98 border-slate-700/90' 
                    : 'bg-gradient-to-br from-white/98 via-slate-50/95 to-white/98 border-slate-300/90'
                }`
              : `max-w-xl max-h-[92vh] overflow-hidden p-0 backdrop-blur-xl shadow-2xl ${
                  isDark 
                    ? 'bg-slate-950/95 border-slate-700/90' 
                    : 'bg-white/95 border-slate-300/90'
                }`
          }
        >
          {/* Sticky Header for Mobile */}
          <DialogHeader
            className={
              'relative overflow-hidden ' +
              (isMobile
                ? `px-4 pt-5 pb-4 border-b backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(0,0,0,0.6)] ${
                    isDark 
                      ? 'border-slate-800/70 bg-slate-900/60' 
                      : 'border-slate-200/70 bg-slate-100/60'
                  }`
                : `px-6 pt-6 pb-4 border-b backdrop-blur-md ${
                    isDark 
                      ? 'border-slate-800/60 bg-slate-900/50' 
                      : 'border-slate-200/60 bg-slate-100/50'
                  }`)
            }
          >
            <div className={`absolute inset-0 pointer-events-none ${
              isDark 
                ? 'bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.15),transparent_60%)]' 
                : 'bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.08),transparent_60%)]'
            }`} />
            <DialogTitle
              className={`relative flex items-center gap-2 heading-secondary uppercase tracking-wide ${
                isDark ? 'text-slate-100' : 'text-slate-800'
              }`}
            >
              <span
                className={`w-9 h-9 rounded-lg flex items-center justify-center border shadow-sm ${
                  isDark
                    ? 'bg-slate-800/70 border-slate-700'
                    : 'bg-slate-100 border-slate-200'
                }`}
              >
                <Trophy className='w-5 h-5 text-primary' />
              </span>
              <span className='uppercase'>
                Tạo thách đấu SABO {isDark ? '🌙' : '☀️'}
              </span>
            </DialogTitle>
            <p
              className={`relative mt-2 body-small max-w-sm ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Hệ thống tự động tính handicap cho trận đấu công bằng
            </p>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={onClose}
              className={`absolute top-4 right-4 h-8 w-8 rounded-full transition-colors ${
                isDark
                  ? 'bg-slate-800/60 hover:bg-slate-700/70 text-slate-300'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-600'
              }`}
            >
              <X className='w-4 h-4' />
            </Button>
          </DialogHeader>

          <form
            id='create-challenge-form'
            onSubmit={handleSubmit}
            className={
              'relative flex-1 overflow-y-auto custom-scrollbar ' +
              (isMobile
                ? 'px-3 pb-32 pt-3 space-y-2'
                : 'px-5 pb-5 pt-4 space-y-2')
            }
          >
            {/* Challenge Type Selection - Open Challenge First */}
            <div
              className={`${sectionCard} shadow-inner space-y-1 p-2 ${
                isDark ? 'shadow-slate-900/20' : 'shadow-slate-200/20'
              }`}
            >
              <Label
                className={`label-text font-medium ${
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                Loại thách đấu
              </Label>
              <div className='grid grid-cols-2 gap-3'>
                <Button
                  type='button'
                  variant={challengeType === 'open' ? 'default' : 'outline'}
                  onClick={() => setChallengeType('open')}
                  className={`h-14 text-[11px] font-semibold flex flex-col items-center justify-center gap-1 border transition ${
                    challengeType === 'open'
                      ? isDark
                        ? 'bg-slate-700/90 border-slate-500/80 shadow-md shadow-slate-900/60 text-slate-100 ring-2 ring-blue-500/50'
                        : 'bg-blue-100/80 border-blue-300/80 shadow-md shadow-blue-200/50 text-blue-800 ring-2 ring-blue-400/40'
                      : isDark
                        ? 'bg-slate-800/60 border-slate-600/70 hover:bg-slate-700/80 text-slate-400'
                        : 'bg-white/80 border-slate-300/70 hover:bg-slate-100/80 text-slate-600'
                  }`}
                  size='sm'
                >
                  <Globe className='w-4 h-4 mb-0 text-primary' />
                  <span className='label-text text-[11px]'>Thách đấu mở</span>
                </Button>
                <Button
                  type='button'
                  variant={challengeType === 'direct' ? 'default' : 'outline'}
                  onClick={() => setChallengeType('direct')}
                  className={`h-14 text-[11px] font-semibold flex flex-col items-center justify-center gap-1 border transition ${
                    challengeType === 'direct'
                      ? isDark
                        ? 'bg-slate-700/90 border-slate-500/80 shadow-md shadow-slate-900/60 text-slate-100 ring-2 ring-blue-500/50'
                        : 'bg-blue-100/80 border-blue-300/80 shadow-md shadow-blue-200/50 text-blue-800 ring-2 ring-blue-400/40'
                      : isDark
                        ? 'bg-slate-800/60 border-slate-600/70 hover:bg-slate-700/80 text-slate-400'
                        : 'bg-white/80 border-slate-300/70 hover:bg-slate-100/80 text-slate-600'
                  }`}
                  size='sm'
                >
                  <Target className='w-4 h-4 mb-0 text-primary' />
                  <span className='label-text text-[11px]'>Trực tiếp</span>
                </Button>
              </div>
              {/* Quick info about challenge type */}
              <div
                className={`body-small p-2 rounded-md border shadow-sm ${
                  isDark
                    ? 'text-slate-400/90 bg-slate-800/60 border-slate-700'
                    : 'text-slate-500 bg-slate-100/60 border-slate-200'
                }`}
              >
                {challengeType === 'open'
                  ? '🌟 Thách đấu mở: Mọi người có thể nhận (SABO tự động)'
                  : '🎯 Thách đấu trực tiếp: Gửi đến 1 người cụ thể (SABO tự động)'}
              </div>
            </div>

            {/* Opponent Selection for Direct Challenge */}
            {challengeType === 'direct' && (
              <div className={`${sectionCard} space-y-1 p-2`}>
                <Label
                  className={`label-text ${
                    isDark ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  Chọn đối thủ
                </Label>
                <div className='relative'>
                  <Input
                    placeholder='Tìm kiếm người chơi...'
                    value={formData.opponent_search}
                    onChange={e => handleSearchChange(e.target.value)}
                    className={`h-11 placeholder:text-slate-500 ${
                      isDark
                        ? 'bg-slate-800/60 border-slate-700 text-slate-100'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  />
                  <Search className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                </div>
                {searching && (
                  <div className='timestamp text-slate-500 animate-pulse'>
                    Đang tìm...
                  </div>
                )}
                {searchResults.length > 0 && (
                  <div
                    className={`max-h-48 overflow-y-auto rounded-lg shadow-inner border ${
                      isDark
                        ? 'bg-slate-900/80 border-slate-700'
                        : 'bg-white/80 border-slate-200'
                    }`}
                  >
                    {searchResults.map(player => (
                      <div
                        key={player.user_id}
                        className={`p-2 cursor-pointer border-b last:border-0 flex items-center gap-2 ${
                          isDark
                            ? 'hover:bg-slate-800/70 border-slate-700/40 text-slate-200'
                            : 'hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            opponent_id: player.user_id,
                            opponent_search: player.display_name || player.full_name,
                          }));
                          setSelectedOpponent(player);
                          setSearchResults([]);
                        }}
                      >
                        <Avatar 
                          className='w-8 h-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all'
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToSocialProfile(player.user_id);
                          }}
                        >
                          <AvatarImage src={player.avatar_url} />
                          <AvatarFallback>
                            {(player.display_name || player.full_name)?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex-1'>
                          <div className='body-small font-medium'>
                            {player.display_name || player.full_name}
                          </div>
                          <div className='timestamp'>
                            Rank: {player.current_rank || 'K'} |{' '}
                            {player.ranking_points || 0} điểm
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedOpponent && (
                  <div
                    className={`p-3 rounded-lg border shadow-sm flex items-center gap-3 ${
                      isDark
                        ? 'bg-slate-800/70 border-slate-700'
                        : 'bg-slate-100/70 border-slate-200'
                    }`}
                  >
                    <Avatar 
                      className='w-10 h-10 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all'
                      onClick={() => navigateToSocialProfile(selectedOpponent.user_id)}
                    >
                      <AvatarImage src={selectedOpponent.avatar_url} />
                      <AvatarFallback>
                        {selectedOpponent.full_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <div
                        className={`username ${
                          isDark ? 'text-slate-100' : 'text-slate-800'
                        }`}
                      >
                        {selectedOpponent.full_name}
                      </div>
                      <div className='timestamp'>
                        Rank: {selectedOpponent.current_rank || 'K'} |{' '}
                        {selectedOpponent.ranking_points || 0} điểm
                      </div>
                    </div>
                    <CheckCircle className='w-5 h-5 text-green-500 ml-auto drop-shadow-[0_0_4px_rgba(34,197,94,0.5)]' />
                  </div>
                )}
              </div>
            )}

            {/* SABO Mode - Always Active Info Display */}
            <div className={sectionCard + ' space-y-1 p-2'}>
              <div className={`flex items-center gap-3 p-3 rounded-md border ${
                isDark 
                  ? 'bg-blue-900/30 border-blue-700/60 shadow-lg shadow-blue-900/20' 
                  : 'bg-blue-50/80 border-blue-200/80 shadow-lg shadow-blue-200/20'
              }`}>
                <Star className='w-5 h-5 text-primary drop-shadow-[0_0_6px_rgba(56,189,248,0.6)]' />
                <div className='flex-1'>
                  <span className={`label-text ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    Chế độ SABO: Handicap được tính tự động để đảm bảo trận đấu công bằng
                  </span>
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowSaboInfo(true)}
                  className={`h-8 w-8 p-0 ${
                    isDark 
                      ? 'text-slate-400 hover:text-slate-200' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <HelpCircle className='w-4 h-4' />
                </Button>
              </div>
            </div>

            {/* Bet Configuration - Compact */}
            <div className={`${sectionCard} space-y-1 p-2`}>
              <Label
                className={`label-text ${
                  isDark ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Cấu hình thách đấu
              </Label>
              <div className='grid grid-cols-2 gap-2'>
                {BET_CONFIGURATIONS.map(config => {
                  const active = formData.bet_points === config.points;
                  // Color tiers by points
                  const tierColor = (() => {
                    if (config.points >= 600)
                      return 'from-fuchsia-400/20 to-indigo-500/10';
                    if (config.points >= 500)
                      return 'from-violet-400/20 to-indigo-500/10';
                    if (config.points >= 400)
                      return 'from-indigo-400/20 to-sky-500/10';
                    if (config.points >= 300)
                      return 'from-sky-400/20 to-cyan-500/10';
                    if (config.points >= 200)
                      return 'from-sky-300/20 to-indigo-400/10';
                    return 'from-slate-500/15 to-slate-700/10';
                  })();
                  return (
                    <Button
                      key={config.points}
                      type='button'
                      variant={active ? 'default' : 'outline'}
                      onClick={() => handleBetPointsChange(config.points)}
                      className={`h-16 flex flex-col items-center justify-center p-2 gap-1 border transition relative overflow-hidden rounded-xl ${
                        active
                          ? isDark
                            ? 'bg-gradient-to-br from-indigo-700/25 via-sky-600/10 to-fuchsia-600/20 border-indigo-400/40 ring-1 ring-indigo-400/40 shadow-[0_0_8px_-2px_rgba(99,102,241,0.35)]'
                            : 'bg-gradient-to-br from-indigo-400/15 via-sky-300/10 to-fuchsia-400/15 border-indigo-300/60 ring-1 ring-indigo-300/40 shadow-[0_0_6px_-1px_rgba(99,102,241,0.25)]'
                          : isDark
                            ? 'bg-slate-900/50 border-slate-700 hover:bg-slate-900/70 text-slate-300'
                            : 'bg-white/70 border-slate-300 hover:bg-slate-50 text-slate-600'
                      }`}
                      size='sm'
                    >
                      {/* Gradient overlay when active */}
                      <span
                        className={`absolute inset-0 opacity-0 pointer-events-none transition-opacity duration-300 ${
                          active ? 'opacity-100' : ''
                        } bg-gradient-to-br ${tierColor}`}
                      />
                      <span
                        className={`bet-points relative drop-shadow-sm ${
                          active
                            ? isDark 
                              ? 'text-indigo-200' 
                              : 'text-indigo-700'
                            : isDark
                              ? 'text-slate-100'
                              : 'text-slate-700'
                        }`}
                      >
                        {config.points} điểm
                      </span>
                      <span className={`bet-points-sub relative ${
                        active
                          ? isDark 
                            ? 'text-slate-300' 
                            : 'text-slate-600'
                          : isDark
                            ? 'text-slate-400'
                            : 'text-slate-500'
                      }`}>
                        Race to {config.raceTO}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Required Rank for Open Challenges */}
            {challengeType === 'open' && (
              <div className={`${sectionCard} space-y-1 p-2`}>
                <Label
                  className={`label-text ${
                    isDark ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  Hạng nhận thách đấu
                </Label>
                <Select
                  value={formData.required_rank}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, required_rank: value }))
                  }
                >
                  <SelectTrigger
                    className={`h-11 placeholder:text-slate-500 ${
                      isDark
                        ? 'bg-slate-800/60 border-slate-700 text-slate-100'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    <SelectValue placeholder='Chọn hạng yêu cầu' />
                  </SelectTrigger>
                  <SelectContent
                    className={
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-slate-100'
                        : 'bg-white border-slate-200 text-slate-700'
                    }
                  >
                    <SelectItem value="all">Tất cả hạng</SelectItem>
                    <SelectItem value="K">🔰 K hạng (1000-1199 ELO)</SelectItem>
                    <SelectItem value="I">🟦 I hạng (1200-1399 ELO)</SelectItem>
                    <SelectItem value="H">🟩 H hạng (1400-1599 ELO)</SelectItem>
                    <SelectItem value="G">🟨 G hạng (1600-1799 ELO)</SelectItem>
                    <SelectItem value="F">🟧 F hạng (1800-1999 ELO)</SelectItem>
                    <SelectItem value="E">� E hạng (2000+ ELO)</SelectItem>
                  </SelectContent>
                </Select>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Chỉ người chơi từ hạng này trở lên mới có thể nhận thách đấu
                </p>
              </div>
            )}

            {/* Club Selection */}
            <div className={`${sectionCard} space-y-1 p-2`}>
              <Label
                htmlFor='club'
                className={`label-text ${
                  isDark ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Câu lạc bộ
              </Label>
              <Select
                value={formData.club_id}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, club_id: value }))
                }
              >
                <SelectTrigger
                  className={`h-11 placeholder:text-slate-500 ${
                    isDark
                      ? 'bg-slate-800/60 border-slate-700 text-slate-100'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  <SelectValue placeholder='Chọn câu lạc bộ' />
                </SelectTrigger>
                <SelectContent
                  className={
                    (isDark
                      ? 'bg-slate-900 border-slate-700 text-slate-100'
                      : 'bg-white border-slate-200 text-slate-700') +
                    ' max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500 rounded-lg shadow-xl min-w-[280px] p-1'
                  }
                  position='popper'
                  side='bottom'
                  sideOffset={4}
                >
                  {clubs.map(club => (
                    <SelectItem
                      key={club.id}
                      value={club.id}
                      className='text-sm py-2.5 px-3 hover:bg-slate-800/60 dark:hover:bg-slate-700/60 cursor-pointer rounded-md transition-colors'
                    >
                      <div className='flex flex-col'>
                        <span className='font-medium'>{club.name}</span>
                        {club.address && (
                          <span className='text-xs text-slate-400 mt-0.5'>
                            {club.address}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Scheduled Time - Optional */}
            <div className={`${sectionCard} space-y-2`}>
              <Label
                htmlFor='scheduled-time'
                className={`label-text ${
                  isDark ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Thời gian đá (Tùy chọn)
              </Label>
              <Input
                id='scheduled-time'
                type='datetime-local'
                value={formData.scheduled_time}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    scheduled_time: e.target.value,
                  }))
                }
                className={`h-11 ${
                  isDark
                    ? 'bg-slate-800/60 border-slate-700 text-slate-100'
                    : 'bg-white border-slate-300 text-slate-700'
                }`}
              />
            </div>

            {/* Spacer for fixed action bar */}
            <div className='h-1' />
          </form>
          {/* Fixed Bottom Action Bar */}
          <div className={`absolute inset-x-0 bottom-0 pt-4 pb-5 px-4 border-t backdrop-blur-xl ${
            isDark 
              ? 'border-slate-700/90 bg-gradient-to-t from-slate-950/98 via-slate-950/95 to-slate-950/60' 
              : 'border-slate-300/90 bg-gradient-to-t from-white/98 via-white/95 to-white/60'
          }`}>
            <div className='flex gap-3'>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                className={`flex-1 h-12 button-text uppercase tracking-wide transition-all ${
                  isDark 
                    ? 'border-slate-600/80 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700' 
                    : 'border-slate-400/80 bg-white/80 text-slate-600 hover:text-slate-800 hover:bg-slate-200'
                }`}
              >
                Hủy {isDark ? '🌙' : '☀️'}
              </Button>
              <Button
                type='submit'
                form=''
                disabled={loading}
                className={`flex-1 h-12 button-text uppercase shadow-[0_0_10px_rgba(56,189,248,0.4)] ${
                  isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-600 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                }`}
                onClick={e => {
                  // ensure form submit when button outside form scope
                  e.preventDefault();
                  const form =
                    (e.currentTarget.ownerDocument?.querySelector(
                      'form'
                    ) as HTMLFormElement) || undefined;
                  form?.dispatchEvent(
                    new Event('submit', { cancelable: true, bubbles: true })
                  );
                }}
              >
                {loading && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
                {challengeType === 'open'
                  ? 'Tạo thách đấu SABO'
                  : 'Gửi thách đấu SABO'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SABO Info Dialog */}
      {showSaboInfo && (
        <SaboInfoDialog
          isOpen={showSaboInfo}
          onClose={() => setShowSaboInfo(false)}
        />
      )}
    </>
  );
};

export default ImprovedCreateChallengeModal;
