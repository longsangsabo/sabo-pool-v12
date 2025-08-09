import React, { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useChallenges } from '@/hooks/useChallenges';
import { toast } from 'sonner';
import {
  Search,
  Trophy,
  Clock,
  HelpCircle,
  Calculator,
  Loader2,
  Globe,
  Target,
  Star,
  CheckCircle,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  calculateSaboHandicap,
  type SaboRank,
  formatHandicapDisplay,
} from '@/utils/saboHandicap';
import SaboInfoDialog from '@/components/sabo/SaboInfoDialog';

interface ImprovedCreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChallengeCreated: () => void;
}

interface Player {
  user_id: string;
  full_name: string;
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

const ImprovedCreateChallengeModal: React.FC<ImprovedCreateChallengeModalProps> = ({ 
  isOpen, 
  onClose, 
  onChallengeCreated 
}) => {
  const { user } = useAuth();
  const { createChallenge } = useChallenges();
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
    is_sabo: true, // 🎯 SABO tự động bật
    handicap_1_rank: 0,
    handicap_05_rank: 0,
  });

  const [players, setPlayers] = useState<Player[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<Player | null>(null);

  // Selected player for direct challenge
  const selectedPlayer = players.find(p => p.user_id === formData.opponent_id);

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
        console.error('Error fetching current user profile:', error);
      }
    };

    fetchCurrentUserProfile();
  }, [user?.id]);

  // Fetch clubs
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const { data, error } = await supabase
          .from('clubs')
          .select('id, name, address')
          .order('name');

        if (error) throw error;
        setClubs(data || []);
      } catch (error) {
        console.error('Error fetching clubs:', error);
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

    setIsSearching(true);
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
      console.error('Error searching players:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input
  const handleSearchChange = (value: string) => {
    setFormData(prev => ({ ...prev, opponent_search: value }));
    searchPlayers(value);
  };

  // Calculate handicap
  const calculateHandicap = () => {
    if (!formData.is_sabo || !currentUserProfile || !selectedPlayer) {
      return null;
    }

    const challengerRank = currentUserProfile.current_rank as SaboRank;
    const opponentRank = selectedPlayer.current_rank as SaboRank;

    try {
      return calculateSaboHandicap(
        challengerRank || 'K',
        opponentRank || 'K',
        formData.race_to
      );
    } catch (error) {
      console.error('Error calculating handicap:', error);
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
      const challengeData = {
        challenger_id: user.id,
        opponent_id: challengeType === 'direct' ? formData.opponent_id : null,
        bet_points: formData.bet_points,
        race_to: formData.race_to,
        message: formData.message,
        club_id: formData.club_id,
        scheduled_time: formData.scheduled_time || null,
        is_sabo: formData.is_sabo,
        handicap_1_rank: handicapInfo?.handicapChallenger || 0,
        handicap_05_rank: handicapInfo?.handicapOpponent || 0,
        status: challengeType === 'open' ? 'open' : 'pending',
      };

      await createChallenge(challengeData);
      toast.success(
        challengeType === 'open' 
          ? '🌟 Thách đấu mở đã được tạo thành công!' 
          : '🎯 Thách đấu trực tiếp đã được gửi!'
      );
      onChallengeCreated();
      onClose();
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.error('Không thể tạo thách đấu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='max-w-lg max-h-[90vh] overflow-y-auto'>
          <DialogHeader className='pb-4'>
            <DialogTitle className='flex items-center gap-2 text-lg'>
              <Trophy className='w-5 h-5' />
              Tạo thách đấu mới
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Challenge Type Selection - Open Challenge First */}
            <div className='space-y-3'>
              <Label className='text-sm font-medium'>Loại thách đấu</Label>
              <div className='grid grid-cols-2 gap-3'>
                <Button
                  type='button'
                  variant={challengeType === 'open' ? 'default' : 'outline'}
                  onClick={() => setChallengeType('open')}
                  className='h-12 text-sm flex flex-col items-center justify-center p-2'
                  size='sm'
                >
                  <Globe className='w-4 h-4 mb-1' />
                  <span>Thách đấu mở</span>
                </Button>
                <Button
                  type='button'
                  variant={challengeType === 'direct' ? 'default' : 'outline'}
                  onClick={() => setChallengeType('direct')}
                  className='h-12 text-sm flex flex-col items-center justify-center p-2'
                  size='sm'
                >
                  <Target className='w-4 h-4 mb-1' />
                  <span>Thách đấu trực tiếp</span>
                </Button>
              </div>
              
              {/* Quick info about challenge type */}
              <div className='text-xs text-muted-foreground p-2 bg-gray-50 rounded'>
                {challengeType === 'open' ? (
                  '🌟 Thách đấu mở: Mọi người có thể nhận và tham gia'
                ) : (
                  '🎯 Thách đấu trực tiếp: Gửi trực tiếp đến người chơi cụ thể'
                )}
              </div>
            </div>

            {/* Opponent Selection for Direct Challenge */}
            {challengeType === 'direct' && (
              <div className='space-y-2'>
                <Label className='text-sm'>Chọn đối thủ</Label>
                <div className='relative'>
                  <Input
                    placeholder='Tìm kiếm người chơi...'
                    value={formData.opponent_search}
                    onChange={e => handleSearchChange(e.target.value)}
                    className='h-10'
                  />
                  <Search className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className='max-h-40 overflow-y-auto border rounded-lg bg-white'>
                    {searchResults.map(player => (
                      <div
                        key={player.user_id}
                        className='p-2 hover:bg-gray-50 cursor-pointer border-b last:border-0'
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            opponent_id: player.user_id,
                            opponent_search: player.full_name,
                          }));
                          setSearchResults([]);
                        }}
                      >
                        <div className='flex items-center gap-2'>
                          <Avatar className='w-8 h-8'>
                            <AvatarImage src={player.avatar_url} />
                            <AvatarFallback>{player.full_name?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className='text-sm font-medium'>{player.full_name}</div>
                            <div className='text-xs text-gray-500'>
                              Rank: {player.current_rank || 'K'} | {player.ranking_points || 0} điểm
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected opponent display */}
                {selectedPlayer && (
                  <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                    <div className='flex items-center gap-3'>
                      <Avatar className='w-10 h-10'>
                        <AvatarImage src={selectedPlayer.avatar_url} />
                        <AvatarFallback>{selectedPlayer.full_name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className='font-medium text-sm'>{selectedPlayer.full_name}</div>
                        <div className='text-xs text-gray-600'>
                          Rank: {selectedPlayer.current_rank || 'K'} | {selectedPlayer.ranking_points || 0} điểm
                        </div>
                      </div>
                      <CheckCircle className='w-5 h-5 text-green-600 ml-auto' />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SABO Mode - Enhanced UI */}
            <div className='p-4 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-2'>
                  <Star className='w-5 h-5 text-blue-600' />
                  <Label htmlFor='sabo-mode' className='text-sm font-medium text-blue-800'>
                    Chế độ SABO (Khuyến nghị)
                  </Label>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => setShowSaboInfo(true)}
                    className='h-6 w-6 p-0'
                  >
                    <HelpCircle className='w-4 h-4' />
                  </Button>
                </div>
                <Switch
                  id='sabo-mode'
                  checked={formData.is_sabo}
                  onCheckedChange={checked =>
                    setFormData(prev => ({ ...prev, is_sabo: checked }))
                  }
                />
              </div>
              
              <p className='text-xs text-blue-600 mb-3'>
                ✨ Tự động tính handicap dựa trên rank để trận đấu công bằng
              </p>

              {/* Auto Handicap Preview */}
              {formData.is_sabo && (
                <div className='p-3 bg-white/70 rounded border border-blue-100'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Calculator className='w-4 h-4 text-blue-600' />
                    <span className='text-sm font-medium text-blue-800'>Tính handicap tự động</span>
                  </div>
                  
                  {handicapInfo && selectedPlayer ? (
                    <div className='space-y-1 text-xs text-blue-700'>
                      <div>
                        Rank: {currentUserProfile?.current_rank || 'K'} vs {selectedPlayer.current_rank || 'K'}
                      </div>
                      <div className='font-medium text-blue-800'>
                        Challenger: {handicapInfo.handicapChallenger} | Opponent: {handicapInfo.handicapOpponent}
                      </div>
                    </div>
                  ) : challengeType === 'open' ? (
                    <div className='text-xs text-blue-700'>
                      Handicap sẽ được tính tự động khi có người nhận thách đấu
                    </div>
                  ) : (
                    <div className='text-xs text-blue-700'>
                      Chọn đối thủ để xem handicap được tính
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bet Configuration - Compact */}
            <div className='space-y-3'>
              <Label className='text-sm font-medium'>Cấu hình thách đấu</Label>
              <div className='grid grid-cols-2 gap-2'>
                {BET_CONFIGURATIONS.slice(0, 4).map(config => (
                  <Button
                    key={config.points}
                    type='button'
                    variant={formData.bet_points === config.points ? 'default' : 'outline'}
                    onClick={() => handleBetPointsChange(config.points)}
                    className='h-12 text-xs flex flex-col items-center justify-center p-2'
                    size='sm'
                  >
                    <span className='font-bold'>{config.points} điểm</span>
                    <span className='text-xs opacity-80'>Race to {config.raceTO}</span>
                  </Button>
                ))}
              </div>
              
              {/* More options button */}
              <div className='grid grid-cols-2 gap-2'>
                {BET_CONFIGURATIONS.slice(4).map(config => (
                  <Button
                    key={config.points}
                    type='button'
                    variant={formData.bet_points === config.points ? 'default' : 'outline'}
                    onClick={() => handleBetPointsChange(config.points)}
                    className='h-12 text-xs flex flex-col items-center justify-center p-2'
                    size='sm'
                  >
                    <span className='font-bold'>{config.points} điểm</span>
                    <span className='text-xs opacity-80'>Race to {config.raceTO}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Club Selection */}
            <div className='space-y-2'>
              <Label htmlFor='club' className='text-sm'>Câu lạc bộ</Label>
              <Select
                value={formData.club_id}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, club_id: value }))
                }
              >
                <SelectTrigger className='h-10'>
                  <SelectValue placeholder='Chọn câu lạc bộ' />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map(club => (
                    <SelectItem key={club.id} value={club.id}>
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Scheduled Time - Optional */}
            <div className='space-y-2'>
              <Label htmlFor='scheduled-time' className='text-sm'>
                Thời gian đá (Tùy chọn)
              </Label>
              <Input
                id='scheduled-time'
                type='datetime-local'
                value={formData.scheduled_time}
                onChange={e =>
                  setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))
                }
                className='h-10'
              />
            </div>

            {/* Submit Button */}
            <div className='flex gap-2 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                className='flex-1 h-12'
              >
                Hủy
              </Button>
              <Button
                type='submit'
                disabled={loading}
                className='flex-1 h-12'
              >
                {loading && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
                {challengeType === 'open' ? 'Tạo thách đấu mở' : 'Gửi thách đấu'}
              </Button>
            </div>
          </form>
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
